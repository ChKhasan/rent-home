import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GalleriaModule } from 'primeng/galleria';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { animate, style, transition, trigger } from '@angular/animations';
import { PriceBlockComponent } from '@components/announcement/price-block/price-block.component';
import { IAnnouncementInfo } from '@services/interfaces';
import { SkeletonModule } from 'primeng/skeleton';
import { StyleClassModule } from 'primeng/styleclass';
import { environment } from '@environments';
import { RequestService } from '@services/request';
import { ThumbCarouselComponent } from '@components/announcement/thumb-carousel/thumb-carousel.component';
import { AboutComponent } from '@components/announcement/about/about.component';
import { UserCardComponent } from '@/shared/components/announcement/user-card/user-card.component';
import { catchError, finalize, throwError } from 'rxjs';
import { ListCarouselComponent } from '../list-carousel/list-carousel.component';
import { AuthService } from '@/core/services/auth/auth.service';
import { AnnouncementsCardComponent } from "../../cards/announcements-card/announcements-card.component";

@Component({
  selector: 'app-view-page',
  standalone: true,
  imports: [GalleriaModule, TagModule, ButtonModule, PriceBlockComponent, SkeletonModule, StyleClassModule, ThumbCarouselComponent, AboutComponent, UserCardComponent, ListCarouselComponent, AnnouncementsCardComponent],
  templateUrl: './view-page.component.html',
  styleUrl: './view-page.component.css',
  animations: [trigger('fadeAnimation', [transition('void => *', [style({ opacity: 0 }), animate('300ms', style({ opacity: 1 }))]), transition('* => void', [animate('300ms', style({ opacity: 0 }))])])],
})
export class ViewPageComponent implements OnInit {
  loading: boolean = true;
  displayBasic: boolean = false;
  activeIndex = 0;
  rec_announcements: any[] = [];
  @Input() profile: boolean = false;
  public announcement: IAnnouncementInfo = {
    id: 0,
    transports: [],
    images: [],
    lessee_types: [],
    title: '',
    partnership: false,
    need_people_count: 0,
    room_count: 0,
    address: '',
    location_x: '0',
    location_y: '0',
    currency: 'USD',
    total_price: 0,
    price_for_one: 0,
    appartment_status: 0,
    description: '',
    conditioner: false,
    washing_machine: false,
    fridge: false,
    floor: null,
    area: null,
    user: 0,
    region: null,
  };
  private id: string | null = '';
  images!: any[];

  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5,
    },
    {
      breakpoint: '768px',
      numVisible: 3,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
    },
  ];
  constructor(private route: ActivatedRoute, private requestService: RequestService, private authService: AuthService) {
    this.id = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const headers: any = {};
      let accessToken = localStorage.getItem(environment.accessToken);
      if (accessToken || this.authService.auth || this.authService.user?.id) headers.Authorization = 'Bearer' + ' ' + accessToken;
      this.__GET_ANNOUNCEMENTS(headers);
      if(!this.profile)
      this.__GET__REC_ANNOUNCEMENTS(headers);
    }
  }
  goBack(): void {
    window.history.back();
  }
  afterSendFilter = () => {};

  public skeletonList = [1, 2, 3, 4, 5, 6];

  __GET_ANNOUNCEMENTS = (headers: any = {}) => {
    this.requestService.getData<IAnnouncementInfo>((this.profile ? environment.authUrls.GET_MY_ANNONCEMENTS : environment.urls.GET_ANNONCEMENTS) + this.id + '/', {}, { ...headers }).subscribe((response: IAnnouncementInfo) => {
      this.announcement = response;
      this.images = response.images;
      this.loading = false;
    });
  };
  __GET__REC_ANNOUNCEMENTS = (headers: any = {}) => {
    this.loading = true;
    this.requestService
      .getData(environment.urls.GET_RECOMMENDATION_VIEW + this.id + '/', {}, { ...headers })
      .pipe(
        finalize(() => (this.loading = false)),
        catchError((error) => {
          console.log('Error while fetching recommendations:', error);
          return throwError(() => error);
        })
      )
      .subscribe((response: any) => (this.rec_announcements = response.slice(0,2)));
  };
}
