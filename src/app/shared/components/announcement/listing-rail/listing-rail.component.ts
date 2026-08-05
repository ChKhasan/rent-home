import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import type { Swiper } from 'swiper/types';

import { IAnnouncementListItem } from '@services/interfaces';
import { AnnouncementsCardComponent } from '@components/cards/announcements-card/announcements-card.component';

type SwiperContainerElement = HTMLElement & {
  swiper?: Swiper;
  initialize?: () => void;
};

@Component({
  selector: 'app-listing-rail',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    RouterLink,
    AnnouncementsCardComponent,
    LucideChevronLeft,
    LucideChevronRight,
  ],
  templateUrl: './listing-rail.component.html',
  styleUrl: './listing-rail.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListingRailComponent implements OnChanges {
  @Input() announcements: IAnnouncementListItem[] = [];
  @Input() title = '';
  @Input() subtitle = '';
  @Input() viewAllLink: string | null = '/announcements';
  @Input() variant: 'default' | 'compact' = 'default';

  private swiperRef?: ElementRef<SwiperContainerElement>;

  @ViewChild('swiper')
  set swiperElement(ref: ElementRef<SwiperContainerElement> | undefined) {
    this.swiperRef = ref;
    if (ref) queueMicrotask(() => this.initializeSwiper(ref.nativeElement));
  }

  readonly breakpoints = {
    640: { slidesPerView: 2, spaceBetween: 16 },
    992: { slidesPerView: 3, spaceBetween: 16 },
    1200: { slidesPerView: 4, spaceBetween: 16 },
  };
  readonly pagination = { clickable: false, dynamicBullets: true };
  readonly keyboard = { enabled: true, onlyInViewport: true };
  readonly a11y = {
    enabled: true,
    prevSlideMessage: "Oldingi e'lon",
    nextSlideMessage: "Keyingi e'lon",
    firstSlideMessage: "Bu birinchi e'lon",
    lastSlideMessage: "Bu oxirgi e'lon",
    paginationBulletMessage: "{{index}}-e'longa o'tish",
  };

  atBeginning = true;
  atEnd = false;
  private viewportWidth = 1280;

  constructor() {
    this.updateViewportWidth();
  }

  get useCarousel(): boolean {
    return this.announcements.length > this.visibleCapacity;
  }

  get reducedMotion(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  get visibleCapacity(): number {
    if (this.viewportWidth >= 1200) return 4;
    if (this.viewportWidth >= 992) return 3;
    if (this.viewportWidth >= 640) return 2;
    return 1;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateViewportWidth();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['announcements'] || typeof window === 'undefined') return;
    queueMicrotask(() => {
      this.swiperRef?.nativeElement.swiper?.update();
      this.updateNavigation();
    });
  }

  slidePrevious(): void {
    this.swiperRef?.nativeElement.swiper?.slidePrev();
  }

  slideNext(): void {
    this.swiperRef?.nativeElement.swiper?.slideNext();
  }

  updateNavigation(event?: Event): void {
    const customEvent = event as CustomEvent<[Swiper]> | undefined;
    const swiper = customEvent?.detail?.[0] || this.swiperRef?.nativeElement.swiper;
    if (!swiper) return;
    this.atBeginning = swiper.isBeginning;
    this.atEnd = swiper.isEnd;
  }

  trackByAnnouncementId(_: number, announcement: IAnnouncementListItem): number {
    return announcement.id;
  }

  private updateViewportWidth(): void {
    if (typeof window !== 'undefined') this.viewportWidth = window.innerWidth;
  }

  private initializeSwiper(element: SwiperContainerElement): void {
    if (typeof window === 'undefined' || element.swiper || !element.initialize) return;
    Object.assign(element, {
      slidesPerView: 1.1,
      spaceBetween: 12,
      breakpoints: this.breakpoints,
      pagination: this.pagination,
      keyboard: this.keyboard,
      a11y: this.a11y,
      speed: this.reducedMotion ? 0 : 320,
      loop: false,
      watchOverflow: true,
      slidesPerGroup: 1,
    });
    element.initialize();
  }
}
