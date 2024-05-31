import {Component, OnInit} from '@angular/core';
import {HeaderComponent} from "../../shared/components/layouts/header/header.component";
import {ButtonModule} from "primeng/button";
import {AsyncPipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {PaginatorModule} from "primeng/paginator";
import {ReactiveFormsModule} from "@angular/forms";
import {finalize} from "rxjs";
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
import {BannerTemplateComponent} from "../../shared/components/home/banner-template/banner-template.component";
import {environment} from "../../../environments/environment";
import {RequestService} from "../../core/services/request/request.service";


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    ButtonModule,
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
    TagModule,
    BannerTemplateComponent,
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

  constructor(
    private queryConfig: QueryService,
    private requestService: RequestService
  ) {

  }

  slideConfig = {"slidesToShow": 3, "slidesToScroll": 1, 'spaceBetween': 24, responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2.1,
          slidesToScroll: 1,
          infinite: false
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
    ]};

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.__GET_ANNOUNCEMENTS()
    }
  }
  __GET_ANNOUNCEMENTS = () => {
    this.loading = true;
    this.requestService
      .getData(environment.urls.GET_ANNONCEMENTS,this.queryConfig.generatorHttpParamsWithDefault())
      .pipe(finalize(() => this.loading = false))
      .subscribe((response: any) => {
        this.announcements = response?.results;
        this.totalPage = response.count
      });
  }

}
