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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, RouterLink, ButtonModule, NgIf, PaginatorModule, ReactiveFormsModule, NgClass, NgForOf, AsyncPipe, ToastModule, BannerComponent, AnnouncementsCardComponent, SkeletonModule, PaginationComponent, TagModule, BannerTemplateComponent, ListCarouselComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  animations: [ValidationErrorAnimation],
  providers: [MessageService],
})
export class HomeComponent implements OnInit {
  public loading: boolean = true;
  public skeletonList = [1, 2, 3, 4, 5, 6];
  public announcements?: any;
  public totalPage: number = 0;

  constructor(
    private queryConfig: QueryService,
    private requestService: RequestService,
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.__GET_ANNOUNCEMENTS();
    }
  }
  __GET_ANNOUNCEMENTS = () => {
    this.loading = true;
    console.log("turmoq")
    this.requestService
      .getData(environment.urls.GET_ANNONCEMENTS, this.queryConfig.generatorHttpParamsWithDefault())
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((response: any) => {
        this.announcements = response?.results;
        this.totalPage = response.count;
      });
  };
}
