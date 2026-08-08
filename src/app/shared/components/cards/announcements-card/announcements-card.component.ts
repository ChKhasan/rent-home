import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';

import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import {
  LucideBedDouble,
  LucideBuilding2,
  LucideChevronRight,
  LucideHeart,
  LucideImages,
  LucideMapPin,
  LucideMaximize2,
  LucidePencil,
  LucideRefrigerator,
  LucideSnowflake,
  LucideWashingMachine,
} from '@lucide/angular';

import { IAnnouncementListItem } from '@services/interfaces';
import { LikesService } from '@services/likes';
import { AuthService } from '@services/auth';
import { PricePipe } from '@/shared/pipes/price/price.pipe';
import { PublisherMetaComponent } from '../../announcement/publisher-meta/publisher-meta.component';

type ListingCardVariant = 'default' | 'compact' | 'map-preview';
type ListingCardAnnouncement = IAnnouncementListItem & {
  created?: string | null;
  deal_type?: 'RENT' | 'SALE';
  moderation_status?: 'pending' | 'approved' | 'rejected';
  moderation_comment?: string | null;
  status?: boolean;
};

interface AmenityItem {
  key: 'conditioner' | 'washing_machine' | 'fridge';
  label: string;
}

@Component({
  selector: 'app-announcements-card',
  standalone: true,
  imports: [
    RouterLink,
    PricePipe,
    PublisherMetaComponent,
    LucideBedDouble,
    LucideBuilding2,
    LucideChevronRight,
    LucideHeart,
    LucideImages,
    LucideMapPin,
    LucideMaximize2,
    LucidePencil,
    LucideRefrigerator,
    LucideSnowflake,
    LucideWashingMachine
],
  templateUrl: './announcements-card.component.html',
  styleUrl: './announcements-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnouncementsCardComponent {
  @Input() close: (() => void) | undefined;
  @Input() announcement = { images: [] } as unknown as ListingCardAnnouncement;
  @Input() more = false;
  @Input() edit = false;
  @Input() variant: ListingCardVariant = 'default';
  @Output() likeChanged = new EventEmitter<{ id: number; liked: boolean }>();

  loading = false;
  imageFailed = false;

  constructor(
    public readonly likesService: LikesService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  get effectiveVariant(): ListingCardVariant {
    return this.more ? 'map-preview' : this.variant;
  }

  get detailLink(): (string | number)[] {
    const base = this.edit ? '/profile/announcements-view' : '/announcements';
    return [base, this.announcement.id];
  }

  get imageUrl(): string | null {
    if (this.imageFailed) return null;
    return this.announcement.images?.[0]?.image || null;
  }

  get imageCount(): number {
    return this.announcement.images?.length || 0;
  }

  get isLiked(): boolean {
    return this.likesService.likes.includes(this.announcement.id);
  }

  get primaryPrice(): number | null | undefined {
    if (this.announcement.partnership && this.announcement.price_for_one) {
      return this.announcement.price_for_one;
    }
    return this.announcement.total_price;
  }

  get totalPriceSupportingLabel(): string | null {
    if (!this.announcement.partnership || !this.announcement.price_for_one || !this.announcement.total_price) {
      return null;
    }
    return `Jami ${this.formatNumber(this.announcement.total_price)} ${this.announcement.currency}`;
  }

  get amenities(): AmenityItem[] {
    const items: AmenityItem[] = [];
    if (this.announcement.conditioner) items.push({ key: 'conditioner', label: 'Konditsioner' });
    if (this.announcement.washing_machine) items.push({ key: 'washing_machine', label: 'Kir yuvish mashinasi' });
    if (this.announcement.fridge) items.push({ key: 'fridge', label: 'Muzlatgich' });
    return items;
  }

  get visibleAmenities(): AmenityItem[] {
    return this.amenities.slice(0, 2);
  }

  get hiddenAmenityCount(): number {
    return Math.max(0, this.amenities.length - this.visibleAmenities.length);
  }

  get createdDateLabel(): string {
    if (!this.announcement.created) return '';
    const date = new Date(this.announcement.created);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('uz-UZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  check_auth(id: number): void {
    if (this.loading) return;
    if (this.authService.auth) {
      this.check_likes(id);
      return;
    }
    this.likesService.likeHandle(id);
    this.likeChanged.emit({ id, liked: this.isLiked });
    this.cdr.markForCheck();
  }

  check_likes(id: number): void {
    const data = { announcement: id };
    this.isLiked ? this.__DELETE_LIKE({ id }) : this.__POST_LIKE(data);
  }

  __DELETE_LIKE(payload: { id: number }): void {
    this.loading = true;
    this.likesService
      .delete(payload)
      .pipe(finalize(() => this.__GET_LIKES()))
      .subscribe(() => this.likeChanged.emit({ id: payload.id, liked: false }));
  }

  __POST_LIKE(payload: { announcement: number }): void {
    this.loading = true;
    this.likesService
      .post(payload)
      .pipe(finalize(() => this.__GET_LIKES()))
      .subscribe(() => this.likeChanged.emit({ id: payload.announcement, liked: true }));
  }

  __GET_LIKES(): void {
    this.likesService
      .get()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe((response) => {
        const userLikes = response.map((item: any) => item.announcement?.id);
        this.likesService.handleUserLikes(userLikes);
      });
  }

  closeBottomSheet(): void {
    this.close?.();
  }

  markImageFailed(): void {
    this.imageFailed = true;
  }

  moderationLabel(): string {
    const status = this.announcement.moderation_status;
    if (status === 'approved') return 'Tasdiqlangan';
    if (status === 'rejected') return 'Bekor qilingan';
    return "Moderator tasdig'ida";
  }

  dealTypeLabel(): string {
    return this.announcement.deal_type === 'SALE' ? 'Sotuv' : 'Ijara';
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(value);
  }
}
