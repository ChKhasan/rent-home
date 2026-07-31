import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeaderComponent } from '@components/layouts/header/header.component';
import { ButtonModule } from 'primeng/button';
import { AsyncPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';
import { ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ValidationErrorAnimation } from '@animations';
import { ToastModule } from 'primeng/toast';
import { BannerComponent } from '@components/home/banner/banner.component';
import { AnnouncementsCardComponent } from '@components/cards/announcements-card/announcements-card.component';
import { SkeletonModule } from 'primeng/skeleton';
import { PaginationComponent } from '@components/pagination/pagination.component';
import { QueryService } from '@services/query';
import { TagModule } from 'primeng/tag';
import { BannerTemplateComponent } from '@components/home/banner-template/banner-template.component';
import { environment } from '@environments';
import { RequestService } from '@services/request';
import { ListCarouselComponent } from '@components/announcement/list-carousel/list-carousel.component';
import { RouterLink } from '@angular/router';
import { AuthService } from '@/core/services/auth/auth.service';
import { DealTypeService } from '@/core/services/deal-type/deal-type.service';
import { DealType, DEFAULT_DEAL_TYPE, isDealType } from '@/core/constants/deal-type';
import { Subscription } from 'rxjs';
import { DealTypeSwitcherComponent } from '@components/deal-type-switcher/deal-type-switcher.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ButtonModule, NgIf, PaginatorModule, ReactiveFormsModule, NgClass, NgForOf, AsyncPipe, ToastModule, BannerComponent, AnnouncementsCardComponent, SkeletonModule, PaginationComponent, TagModule, BannerTemplateComponent, ListCarouselComponent, DealTypeSwitcherComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  animations: [ValidationErrorAnimation],
  providers: [MessageService],
})
export class HomeComponent implements OnInit, OnDestroy {
  public loading: boolean = true;
  public rec_loading: boolean = false;
  public skeletonList = [1, 2, 3, 4, 5, 6];
  public announcements?: any;
  public rec_announcements?: any;
  public totalPage: number = 0;
  public currentDealType: DealType = DEFAULT_DEAL_TYPE;
  private headers: Record<string, string> = {};
  private dealTypeSubscription?: Subscription;

  constructor(private queryConfig: QueryService, private requestService: RequestService, private authService: AuthService, private dealTypeService: DealTypeService) {}

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
    this.loading = true;
    this.requestService
      .getData(environment.urls.GET_HOME_RECOMMENDATIONS, this.buildParams(), { ...this.headers })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((response: any) => {
        this.rec_announcements = response;
        this.totalPage = response.count;
      });
  };
  __GET_ANNOUNCEMENTS = () => {
    this.rec_loading = true;
    this.requestService
      .getData(environment.urls.GET_ANNONCEMENTS, this.buildParams(), { ...this.headers })
      .pipe(finalize(() => (this.rec_loading = false)))
      .subscribe((response: any) => {
        this.announcements = response.results;
        this.totalPage = response.count;
      });
  };
}
