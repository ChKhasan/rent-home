import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { finalize, Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
import { PaginationComponent } from '@components/pagination/pagination.component';
import { NgForOf, NgIf } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { QueryService } from '@services/query';
import { FilterComponent } from '@components/announcement/filter/filter.component';
import { BottomSheetComponent } from '@components/modals/bottom-sheet/bottom-sheet.component';
import { EmptyFoundComponent } from '@components/empty-found/empty-found.component';
import { SORT_OPTIONS } from '@/core/constants/filter';
import { RequestService } from '@services/request';
import { environment } from '@environments';
import { IAnnouncementList } from '@services/interfaces';
import { AnnouncementsCardComponent } from '@components/cards/announcements-card/announcements-card.component';
import { ButtonModule } from 'primeng/button';
import { DealTypeService } from '@/core/services/deal-type/deal-type.service';
import { DealType, DEFAULT_DEAL_TYPE, isDealType } from '@/core/constants/deal-type';
import { DealTypeSwitcherComponent } from '@components/deal-type-switcher/deal-type-switcher.component';
@Component({
  selector: 'app-list',
  standalone: true,
  imports: [PaginationComponent, NgForOf, ButtonModule, SkeletonModule, NgIf, FilterComponent, BottomSheetComponent, EmptyFoundComponent, AnnouncementsCardComponent, DealTypeSwitcherComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent implements OnInit, OnDestroy {
  public loading: boolean = true;
  public skeletonList = [1, 2, 3, 4, 5, 6];
  public announcements: any = [];
  public totalPage: number = 0;
  public sortOptions = SORT_OPTIONS;
  public currentSort: string = '';
  public currentDealType: DealType = DEFAULT_DEAL_TYPE;
  private dealTypeSubscription?: Subscription;
  @ViewChild(BottomSheetComponent) bottomSheetComponent!: BottomSheetComponent;
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
  }
  private buildParams() {
    const query = { ...this.queryConfig.activeQueryWithDefaut(), deal_type: this.currentDealType };
    return this.queryConfig.generatorHttpParams(query);
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
    this.loading = true;
    this.requestService
      .getData<IAnnouncementList>(environment.urls.GET_ANNONCEMENTS, this.buildParams())
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((response: IAnnouncementList) => {
        this.announcements = response?.results;
        this.totalPage = response.count;
      });
  };
  filterSend = (e: any) => {
    this.queryConfig.updateCustomQuery(e, this.__GET_ANNOUNCEMENTS);
    this.closeBottomSheet();
  };
  clearFilter = () => {
    this.queryConfig.clearFilter(this.__GET_ANNOUNCEMENTS).then(() => {
      this.currentSort = 'appartment_status';
    });
    this.closeBottomSheet();
  };
  sortHandle(option: any) {
    this.currentSort == option[0] ? (this.currentSort = option[1]) : (this.currentSort = option[0]);
    this.filterSend({ ordering: this.currentSort });
  }
  openBottomSheet() {
    this.bottomSheetComponent.open();
  }
  closeBottomSheet = () => {
    this.bottomSheetComponent.close();
  };
}
