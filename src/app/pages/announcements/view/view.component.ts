import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GalleriaModule } from 'primeng/galleria';
import { TagModule } from 'primeng/tag';
import { InfoTabComponent } from '@components/announcement/info-tab/info-tab.component';
import { SearchComponent } from '@components/announcement/search/search.component';
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
import { UserCardComponent } from '../../../shared/components/announcement/user-card/user-card.component';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [GalleriaModule, TagModule, InfoTabComponent, SearchComponent, ButtonModule, PriceBlockComponent, SkeletonModule, StyleClassModule, ThumbCarouselComponent, AboutComponent, UserCardComponent],
  templateUrl: './view.component.html',
  styleUrl: './view.component.css',
  animations: [trigger('fadeAnimation', [transition('void => *', [style({ opacity: 0 }), animate('300ms', style({ opacity: 1 }))]), transition('* => void', [animate('300ms', style({ opacity: 0 }))])])],
})
export class ViewComponent implements OnInit {
  loading: boolean = true;
  displayBasic: boolean = false;
  activeIndex = 0;
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
  constructor(private route: ActivatedRoute, private requestService: RequestService) {
    this.id = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    this.requestService.getData<IAnnouncementInfo>(environment.urls.GET_ANNONCEMENTS + this.id).subscribe((response: IAnnouncementInfo) => {
      this.announcement = response;
      this.images = response.images;
      this.loading = false;
    });
  }
  goBack(): void {
    window.history.back(); // Navigates back one step in the history
  }
  afterSendFilter = () => {};
}
