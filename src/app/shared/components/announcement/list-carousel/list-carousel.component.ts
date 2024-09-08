import { Component, Input } from '@angular/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { AnnouncementsCardComponent } from '@components/cards/announcements-card/announcements-card.component';
import { IAnnouncementList } from '@services/interfaces';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-list-carousel',
  standalone: true,
  imports: [NgForOf, CarouselModule, AnnouncementsCardComponent],
  templateUrl: './list-carousel.component.html',
  styleUrl: './list-carousel.component.css',
})
export class ListCarouselComponent {
  @Input() announcements!: IAnnouncementList[];
  public customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    navText: ['<img src="../../../assets/images/arrow.svg"/>', '<img src="../../../assets/images/arrow.svg"/>'],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 2,
      },
      740: {
        items: 3,
      },
      940: {
        items: 3,
      },
    },
    nav: true,
  };
}
