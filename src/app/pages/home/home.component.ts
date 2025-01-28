import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ButtonModule, NgIf, PaginatorModule, ReactiveFormsModule, NgClass, NgForOf, AsyncPipe, ToastModule, BannerComponent, AnnouncementsCardComponent, SkeletonModule, PaginationComponent, TagModule, BannerTemplateComponent, ListCarouselComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  animations: [ValidationErrorAnimation],
  providers: [MessageService],
})
export class HomeComponent implements OnInit {
  public loading: boolean = true;
  public rec_loading: boolean = false;
  public skeletonList = [1, 2, 3, 4, 5, 6];
  public announcements?: any;
  public rec_announcements?: any;
  public totalPage: number = 0;

  constructor(private queryConfig: QueryService, private requestService: RequestService, private authService: AuthService) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const headers: any = {};
      let accessToken = localStorage.getItem(environment.accessToken);
      if (accessToken || this.authService.auth || this.authService.user?.id) headers.Authorization = 'Bearer' + ' ' + accessToken;
      this.__GET_ANNOUNCEMENTS(headers);
      this.__GET__REC_ANNOUNCEMENTS(headers);
    }
  }
  __GET__REC_ANNOUNCEMENTS = (headers: any = {}) => {
    this.loading = true;
    this.requestService
      .getData(environment.urls.GET_HOME_RECOMMENDATIONS, this.queryConfig.generatorHttpParamsWithDefault(), { ...headers })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((response: any) => {
        this.rec_announcements = response;
        this.totalPage = response.count;
      });
  };
  __GET_ANNOUNCEMENTS = (headers: any = {}) => {
    this.rec_loading = true;
    this.requestService
      .getData(environment.urls.GET_ANNONCEMENTS, this.queryConfig.generatorHttpParamsWithDefault(), { ...headers })
      .pipe(finalize(() => (this.rec_loading = false)))
      .subscribe((response: any) => {
        this.announcements = response.results;
        this.totalPage = response.count;
      });
  };
}
