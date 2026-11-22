import { Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { finalize, Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
import { PaginationComponent } from '@components/pagination/pagination.component';
import { NgForOf, NgIf } from '@angular/common';
import { QueryService } from '@services/query';
import { FilterComponent } from '@components/announcement/filter/filter.component';
import { BottomSheetComponent } from '@components/modals/bottom-sheet/bottom-sheet.component';
import { RequestService } from '@services/request';
import { environment } from '@environments';
import { IAnnouncementList, IAnnouncementListItem, PublisherType } from '@services/interfaces';
import { AnnouncementsCardComponent } from '@components/cards/announcements-card/announcements-card.component';
import { ListingCardSkeletonComponent } from '@components/cards/listing-card-skeleton/listing-card-skeleton.component';
import { DealTypeService } from '@/core/services/deal-type/deal-type.service';
import { DealType, DEFAULT_DEAL_TYPE, isDealType } from '@/core/constants/deal-type';
import { MAP_CITY } from '@/core/constants/map';
import { DealTypeSwitcherComponent } from '@components/deal-type-switcher/deal-type-switcher.component';
import { LucideArrowUpDown, LucideMap, LucideSearchX, LucideSlidersHorizontal, LucideX } from '@lucide/angular';
@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    PaginationComponent,
    NgForOf,
    NgIf,
    RouterLink,
    FilterComponent,
    BottomSheetComponent,
    AnnouncementsCardComponent,
    ListingCardSkeletonComponent,
    DealTypeSwitcherComponent,
    LucideArrowUpDown,
    LucideMap,
    LucideSearchX,
    LucideSlidersHorizontal,
    LucideX,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent implements OnInit, OnDestroy {
  private readonly publisherLabels: Record<PublisherType, string> = {
    OWNER: 'Uy egasidan',
    INDEPENDENT_AGENT: 'Mustaqil makler',
    AGENCY_AGENT: 'Agentlik',
  };
  public loading: boolean = true;
  public loadError = false;
  public skeletonList = [1, 2, 3, 4, 5, 6];
  public announcements: IAnnouncementListItem[] = [];
  public totalPage: number = 0;
  public readonly sortOptions = [
    { label: 'Eng yangilari', value: 'created' },
    { label: 'Eng eskilari', value: 'created_reverse' },
    { label: 'Avval arzonlari', value: 'total_price' },
    { label: 'Avval qimmatlari', value: 'total_price_reverse' },
  ];
  public currentSort: string = '';
  public currentDealType: DealType = DEFAULT_DEAL_TYPE;
  private dealTypeSubscription?: Subscription;
  private listingRequest?: Subscription;
  @ViewChild(BottomSheetComponent) bottomSheetComponent!: BottomSheetComponent;
  @ViewChildren(FilterComponent) private filters?: QueryList<FilterComponent>;
  constructor(private queryConfig: QueryService, private requestService: RequestService, private dealTypeService: DealTypeService) {}
  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      if(this.queryConfig.activeQueryList()['ordering']) this.currentSort = this.queryConfig.activeQueryList()['ordering'];
      this.applyDealTypeFromQuery();
      this.dealTypeSubscription = this.dealTypeService.dealType$.subscribe((type) => {
        this.currentDealType = type;
        this.syncDealTypeQuery(type);
      });
    }
  }
  ngOnDestroy(): void {
    this.dealTypeSubscription?.unsubscribe();
    this.listingRequest?.unsubscribe();
  }
  private buildParams() {
    const region = this.queryConfig.activeQueryList()['region'];
    return this.queryConfig.generatorHttpParams({
      ...this.queryConfig.activeQueryWithDefaut(),
      city: region ? null : MAP_CITY,
      deal_type: this.currentDealType,
    });
  }
  private applyDealTypeFromQuery() {
    const urlDealType = this.readDealTypeFromQuery();
    if (urlDealType) {
      this.currentDealType = urlDealType;
      this.dealTypeService.setDealType(urlDealType);
    }
  }

  private readDealTypeFromQuery(): DealType | null {
    const value = this.queryConfig.activeQueryList()['deal_type'];
    const normalized = Array.isArray(value) ? value[0] : value;
    return isDealType(normalized) ? normalized : null;
  }

  private syncDealTypeQuery(type: DealType) {
    const currentQueryType = this.readDealTypeFromQuery() ?? DEFAULT_DEAL_TYPE;
    if (currentQueryType === type) {
      this.__GET_ANNOUNCEMENTS();
      return;
    }
    const payload = type === DEFAULT_DEAL_TYPE ? { deal_type: null } : { deal_type: type };
    this.queryConfig.updateCustomQuery(payload, this.__GET_ANNOUNCEMENTS);
  }
  __GET_ANNOUNCEMENTS = () => {
    this.listingRequest?.unsubscribe();
    this.loading = true;
    this.loadError = false;
    this.listingRequest = this.requestService
      .getData<IAnnouncementList>(environment.urls.GET_ANNONCEMENTS, this.buildParams())
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          this.announcements = response?.results ?? [];
          this.totalPage = response?.count ?? this.announcements.length;
        },
        error: () => { this.loadError = true; },
      });
  };
  filterSend = async (e: any) => {
    await this.queryConfig.updateCustomQuery({ ...e, page: 1 }, this.__GET_ANNOUNCEMENTS);
    this.closeBottomSheet();
  };
  clearFilter = async () => {
    this.currentSort = '';
    this.filters?.forEach((filter) => filter.resetForm());
    const cleared = Object.fromEntries(Object.keys(this.queryConfig.activeQueryList()).map((key) => [key, null]));
    await this.queryConfig.updateCustomQuery({
      ...cleared,
      deal_type: this.currentDealType === DEFAULT_DEAL_TYPE ? null : this.currentDealType,
    }, this.__GET_ANNOUNCEMENTS);
    this.closeBottomSheet();
  };
  openBottomSheet() {
    this.bottomSheetComponent.open();
  }
  closeBottomSheet = () => {
    this.bottomSheetComponent.close();
  };

  selectSort(event: Event): void {
    const ordering = (event.target as HTMLSelectElement).value;
    this.currentSort = ordering;
    void this.filterSend({ ordering: ordering || null });
  }

  get mapQueryParams(): Record<string, unknown> {
    return this.queryConfig.activeQueryListWithoutDefault();
  }

  get hasMorePages(): boolean {
    const size = Number(this.queryConfig.activeQueryList()['page_size']) || this.queryConfig.defaultQuery.page_size;
    return this.totalPage > size;
  }

  get activePublisherChips(): Array<{ type: PublisherType; label: string }> {
    const raw = this.queryConfig.activeQueryList()['publisher_type'];
    if (!raw) return [];
    const allowed = Object.keys(this.publisherLabels) as PublisherType[];
    return String(raw)
      .split(',')
      .filter((type): type is PublisherType => allowed.includes(type as PublisherType))
      .map((type) => ({ type, label: this.publisherLabels[type] }));
  }

  get verifiedOnlyActive(): boolean {
    return String(this.queryConfig.activeQueryList()['verified_only']) === 'true';
  }

  get commissionFreeActive(): boolean {
    return String(this.queryConfig.activeQueryList()['commission_free']) === 'true';
  }

  get activeFilterCount(): number {
    const ignored = new Set(['page', 'page_size', 'ordering', 'deal_type']);
    return Object.entries(this.queryConfig.activeQueryList()).filter(([key, value]) => {
      return !ignored.has(key) && value !== null && value !== undefined && value !== '' && value !== false;
    }).length;
  }

  removePublisherType(type: PublisherType): void {
    const remaining = this.activePublisherChips.filter((item) => item.type !== type).map((item) => item.type);
    this.filterSend({ publisher_type: remaining.length ? remaining.join(',') : null });
  }

  removePublisherFlag(key: 'verified_only' | 'commission_free'): void {
    this.filterSend({ [key]: null });
  }

  trackByAnnouncementId(_: number, announcement: IAnnouncementListItem): number {
    return announcement.id;
  }
}
