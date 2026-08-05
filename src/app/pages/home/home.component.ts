import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import { BannerComponent } from '@components/home/banner/banner.component';
import { QueryService } from '@services/query';
import { environment } from '@environments';
import { RequestService } from '@services/request';
import { ListingRailComponent } from '@components/announcement/listing-rail/listing-rail.component';
import { ListingCardSkeletonComponent } from '@components/cards/listing-card-skeleton/listing-card-skeleton.component';
import { AuthService } from '@/core/services/auth/auth.service';
import { DealTypeService } from '@/core/services/deal-type/deal-type.service';
import { DealType, DEFAULT_DEAL_TYPE, isDealType } from '@/core/constants/deal-type';
import { IAnnouncementListItem } from '@services/interfaces';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    RouterLink,
    BannerComponent,
    ListingRailComponent,
    ListingCardSkeletonComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, OnDestroy {
  public loading = true;
  public rec_loading = true;
  public announcementsError = false;
  public recommendationsError = false;
  public skeletonList = [1, 2, 3, 4];
  public announcements: IAnnouncementListItem[] = [];
  public rec_announcements: IAnnouncementListItem[] = [];
  public totalPage = 0;
  public currentDealType: DealType = DEFAULT_DEAL_TYPE;
  private headers: Record<string, string> = {};
  private dealTypeSubscription?: Subscription;

  constructor(
    private readonly queryConfig: QueryService,
    private readonly requestService: RequestService,
    private readonly authService: AuthService,
    private readonly dealTypeService: DealTypeService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.prepareHeaders();
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

  private prepareHeaders() {
    const headers: Record<string, string> = {};
    const accessToken = localStorage.getItem(environment.accessToken);
    if (accessToken || this.authService.auth || this.authService.user?.id) headers['Authorization'] = 'Bearer' + ' ' + accessToken;
    this.headers = headers;
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
      this.__GET__REC_ANNOUNCEMENTS();
      return;
    }
    const payload = type === DEFAULT_DEAL_TYPE ? { deal_type: null } : { deal_type: type };
    this.queryConfig.updateCustomQuery(payload, () => {
      this.__GET_ANNOUNCEMENTS();
      this.__GET__REC_ANNOUNCEMENTS();
    });
  }

  private buildParams() {
    const query = { ...this.queryConfig.activeQueryWithDefaut(), deal_type: this.currentDealType };
    return this.queryConfig.generatorHttpParams(query);
  }

  __GET__REC_ANNOUNCEMENTS = () => {
    this.rec_loading = true;
    this.recommendationsError = false;
    this.requestService
      .getData<IAnnouncementListItem[]>(environment.urls.GET_HOME_RECOMMENDATIONS, this.buildParams(), { ...this.headers })
      .pipe(finalize(() => {
        this.rec_loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (response: IAnnouncementListItem[]) => {
          this.rec_announcements = response || [];
        },
        error: () => {
          this.recommendationsError = true;
          this.cdr.markForCheck();
        },
      });
  };
  __GET_ANNOUNCEMENTS = () => {
    this.loading = true;
    this.announcementsError = false;
    this.requestService
      .getData(environment.urls.GET_ANNONCEMENTS, this.buildParams(), { ...this.headers })
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (response: any) => {
          this.announcements = response?.results || [];
          this.totalPage = response?.count || 0;
        },
        error: () => {
          this.announcementsError = true;
          this.cdr.markForCheck();
        },
      });
  };
}
