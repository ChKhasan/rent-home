import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import {
  LucideBuilding2,
  LucideChevronLeft,
  LucideChevronRight,
  LucideExpand,
  LucideX,
} from '@lucide/angular';
import type { Swiper } from 'swiper/types';

interface PropertyImage {
  id?: number | string;
  image: string;
}

type SwiperContainerElement = HTMLElement & {
  swiper?: Swiper;
  initialize?: () => void;
};

@Component({
  selector: 'app-property-gallery',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    LucideBuilding2,
    LucideChevronLeft,
    LucideChevronRight,
    LucideExpand,
    LucideX,
  ],
  templateUrl: './property-gallery.component.html',
  styleUrl: './property-gallery.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyGalleryComponent implements OnChanges, OnDestroy {
  @Input() images: readonly PropertyImage[] | null | undefined = [];
  @Input() title = "E'lon";

  private mainSwiper?: ElementRef<SwiperContainerElement>;
  private thumbSwiper?: ElementRef<SwiperContainerElement>;
  private fullscreenSwiper?: ElementRef<SwiperContainerElement>;
  @ViewChild('fullscreenDialog') private fullscreenDialog?: ElementRef<HTMLDialogElement>;
  @ViewChild('closeButton') private closeButton?: ElementRef<HTMLButtonElement>;
  private swiperInitializationQueued = false;

  @ViewChild('mainSwiper')
  set mainSwiperElement(ref: ElementRef<SwiperContainerElement> | undefined) {
    this.mainSwiper = ref;
    this.scheduleSwiperInitialization();
  }

  @ViewChild('thumbSwiper')
  set thumbSwiperElement(ref: ElementRef<SwiperContainerElement> | undefined) {
    this.thumbSwiper = ref;
    this.scheduleSwiperInitialization();
  }

  @ViewChild('fullscreenSwiper')
  set fullscreenSwiperElement(ref: ElementRef<SwiperContainerElement> | undefined) {
    this.fullscreenSwiper = ref;
    this.scheduleSwiperInitialization();
  }

  readonly keyboard = { enabled: true, onlyInViewport: true };
  readonly a11y = {
    enabled: true,
    prevSlideMessage: 'Oldingi rasm',
    nextSlideMessage: 'Keyingi rasm',
    firstSlideMessage: 'Bu birinchi rasm',
    lastSlideMessage: 'Bu oxirgi rasm',
    slideLabelMessage: '{{index}} / {{slidesLength}}',
  };

  currentIndex = 0;
  fullscreenOpen = false;
  private readonly failedImages = new Set<string>();
  private previouslyFocused: HTMLElement | null = null;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  get galleryImages(): readonly PropertyImage[] {
    return (this.images || []).filter((image) => Boolean(image?.image));
  }

  get hasMultipleImages(): boolean {
    return this.galleryImages.length > 1;
  }

  get reducedMotion(): boolean {
    return typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  get atBeginning(): boolean {
    return this.currentIndex === 0;
  }

  get atEnd(): boolean {
    return this.currentIndex >= this.galleryImages.length - 1;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['images']) return;
    this.failedImages.clear();
    this.currentIndex = Math.min(this.currentIndex, Math.max(0, this.galleryImages.length - 1));
    if (typeof window !== 'undefined') {
      queueMicrotask(() => {
        this.mainSwiper?.nativeElement.swiper?.update();
        this.thumbSwiper?.nativeElement.swiper?.update();
        this.fullscreenSwiper?.nativeElement.swiper?.update();
      });
    }
  }

  imageAlt(index: number): string {
    return `${this.title} - ${index + 1}-rasm`;
  }

  imageFailed(image: PropertyImage): boolean {
    return this.failedImages.has(image.image);
  }

  markImageFailed(image: PropertyImage): void {
    this.failedImages.add(image.image);
    this.cdr.markForCheck();
  }

  goTo(index: number): void {
    this.currentIndex = index;
    this.mainSwiper?.nativeElement.swiper?.slideTo(index);
    this.fullscreenSwiper?.nativeElement.swiper?.slideTo(index);
    this.thumbSwiper?.nativeElement.swiper?.slideTo(Math.max(0, index - 1));
    this.cdr.markForCheck();
  }

  previous(): void {
    this.goTo(Math.max(0, this.currentIndex - 1));
  }

  next(): void {
    this.goTo(Math.min(this.galleryImages.length - 1, this.currentIndex + 1));
  }

  updateFromSwiper(event: Event, source: 'main' | 'fullscreen'): void {
    const customEvent = event as CustomEvent<[Swiper]>;
    const swiper = customEvent.detail?.[0];
    if (!swiper) return;

    this.currentIndex = swiper.realIndex;
    this.thumbSwiper?.nativeElement.swiper?.slideTo(Math.max(0, this.currentIndex - 1));
    if (source === 'main' && this.fullscreenOpen) {
      this.fullscreenSwiper?.nativeElement.swiper?.slideTo(this.currentIndex);
    }
    if (source === 'fullscreen') {
      this.mainSwiper?.nativeElement.swiper?.slideTo(this.currentIndex);
    }
    this.cdr.markForCheck();
  }

  openFullscreen(index: number, trigger?: EventTarget | null): void {
    const dialog = this.fullscreenDialog?.nativeElement;
    if (!dialog || !this.galleryImages.length) return;

    this.previouslyFocused = trigger instanceof HTMLElement
      ? trigger
      : document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.currentIndex = index;
    this.fullscreenOpen = true;
    dialog.showModal();
    document.body.classList.add('no-scroll');
    requestAnimationFrame(() => {
      this.fullscreenSwiper?.nativeElement.swiper?.update();
      this.fullscreenSwiper?.nativeElement.swiper?.slideTo(index, 0);
      this.closeButton?.nativeElement.focus();
    });
  }

  closeFullscreen(): void {
    const dialog = this.fullscreenDialog?.nativeElement;
    if (!dialog?.open) return;
    dialog.close();
  }

  onDialogCancel(event: Event): void {
    event.preventDefault();
    this.closeFullscreen();
  }

  onDialogClosed(): void {
    this.fullscreenOpen = false;
    document.body.classList.remove('no-scroll');
    this.previouslyFocused?.focus();
    this.cdr.markForCheck();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.fullscreenOpen) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.previous();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
    }
  }

  trackByImage(index: number, image: PropertyImage): number | string {
    return image.id ?? `${image.image}-${index}`;
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') document.body.classList.remove('no-scroll');
  }

  private scheduleSwiperInitialization(): void {
    if (typeof window === 'undefined' || this.swiperInitializationQueued) return;
    this.swiperInitializationQueued = true;
    queueMicrotask(() => {
      this.swiperInitializationQueued = false;

      const thumbs = this.thumbSwiper?.nativeElement;
      this.initializeSwiper(thumbs, {
        slidesPerView: 'auto',
        spaceBetween: 8,
        freeMode: true,
        watchSlidesProgress: true,
        watchOverflow: true,
      });

      const main = this.mainSwiper?.nativeElement;
      this.initializeSwiper(main, {
        slidesPerView: 1,
        spaceBetween: 8,
        keyboard: this.keyboard,
        a11y: this.a11y,
        speed: this.reducedMotion ? 0 : 280,
        loop: false,
        watchOverflow: true,
        thumbs: thumbs?.swiper ? { swiper: thumbs.swiper } : undefined,
      });

      this.initializeSwiper(this.fullscreenSwiper?.nativeElement, {
        slidesPerView: 1,
        spaceBetween: 16,
        keyboard: this.keyboard,
        a11y: this.a11y,
        speed: this.reducedMotion ? 0 : 280,
        loop: false,
        watchOverflow: true,
      });
    });
  }

  private initializeSwiper(element: SwiperContainerElement | undefined, config: Record<string, unknown>): void {
    if (!element || element.swiper || !element.initialize) return;
    Object.assign(element, config);
    element.initialize();
  }
}
