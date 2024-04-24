import {Component, OnInit} from '@angular/core';
import {HeaderComponent} from "../../shared/components/layouts/header/header.component";
import {ButtonModule} from "primeng/button";
import {DropdownModule} from "primeng/dropdown";
import {InputSwitchModule} from "primeng/inputswitch";
import {InputTextModule} from "primeng/inputtext";
import {AsyncPipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {PaginatorModule} from "primeng/paginator";
import {ReactiveFormsModule} from "@angular/forms";
import {finalize} from "rxjs";
import {AnnouncementsService} from "../../core/services/announcements/announcements.service";
import {MessageService} from "primeng/api";
import {ValidationErrorAnimation} from "../../core/common/animations";
import {ToastModule} from "primeng/toast";
import {BannerComponent} from "../../shared/components/home/banner/banner.component";
import {
  AnnouncementsCardComponent
} from "../../shared/components/cards/announcements-card/announcements-card.component";
import {SkeletonModule} from "primeng/skeleton";
import {PaginationComponent} from "../../shared/components/pagination/pagination.component";
import {QueryService} from "../../core/services/query/query.service";
import {SlickCarouselModule} from "ngx-slick-carousel";
import {CarouselModule} from "primeng/carousel";
import {TagModule} from "primeng/tag";


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    ButtonModule,
    DropdownModule,
    InputSwitchModule,
    InputTextModule,
    NgIf,
    PaginatorModule,
    ReactiveFormsModule,
    NgClass,
    NgForOf,
    AsyncPipe,
    ToastModule,
    BannerComponent,
    AnnouncementsCardComponent,
    SkeletonModule,
    PaginationComponent,
    SlickCarouselModule,
    CarouselModule,
    TagModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  animations: [ValidationErrorAnimation],
  providers: [MessageService]
})

export class HomeComponent implements OnInit {

  public loading: boolean = true;
  public skeletonList = [1, 2, 3, 4, 5, 6];
  public announcements?: any;
  public totalPage: number = 0;
  slickModalConfig: any;
  products: any;

  responsiveOptions: any[] | undefined;
  constructor(
    private _announcementsService: AnnouncementsService,
    private queryConfig: QueryService
  ) {
    this.slickModalConfig = {
      autoplay: true,
      autoplaySpeed: 2000,
      dots: true,
      infinite: true,
      speed: 300,
      slidesToShow: 1,
      slidesToScroll: 1
    };
  }
  slides = [
    {img: "http://placehold.it/350x150/000000"},
    {img: "http://placehold.it/350x150/111111"},
    {img: "http://placehold.it/350x150/333333"},
    {img: "http://placehold.it/350x150/666666"}
  ];
  slideConfig = {"slidesToShow": 3, "slidesToScroll": 1,'spaceBetween': 24};

  addSlide() {
    this.slides.push({img: "http://placehold.it/350x150/777777"})
  }

  removeSlide() {
    this.slides.length = this.slides.length - 1;
  }

  slickInit(e: any) {
    console.log('slick initialized');
  }

  breakpoint(e: any) {
    console.log('breakpoint');
  }

  afterChange(e: any) {
    console.log('afterChange');
  }

  beforeChange(e: any) {
    console.log('beforeChange');
  }
  ngOnInit(): void {
    if (typeof window !== 'undefined') {
     this.__GET_ANNOUNCEMENTS()
    }
    this.responsiveOptions = [
      {
        breakpoint: '1199px',
        numVisible: 1,
        numScroll: 1
      },
      {
        breakpoint: '991px',
        numVisible: 2,
        numScroll: 1
      },
      {
        breakpoint: '767px',
        numVisible: 1,
        numScroll: 1
      }
    ];
  }
  // @ts-ignore
  getSeverity(status: string) {
    switch (status) {
      case 'INSTOCK':
        return 'success';
      case 'LOWSTOCK':
        return 'warning';
      case 'OUTOFSTOCK':
        return 'danger';
    }
  }
  __GET_ANNOUNCEMENTS = () => {
    this.loading = true;
    this._announcementsService.get(this.queryConfig.generatorHttpParamsWithDefault())
      .pipe(finalize(() => this.loading = false))
      .subscribe((response) => {
        this.announcements = response?.results;
        this.totalPage = response.count
      });
  }

}
