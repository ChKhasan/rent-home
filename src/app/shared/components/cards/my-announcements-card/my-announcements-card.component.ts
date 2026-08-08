import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage, NgClass } from '@angular/common';
import { PricePipe } from '@/shared/pipes/price/price.pipe';
import { PublisherMetaComponent } from '../../announcement/publisher-meta/publisher-meta.component';

@Component({
  selector: 'app-my-announcements-card',
  standalone: true,
  imports: [RouterLink, PricePipe, NgOptimizedImage, NgClass, PublisherMetaComponent],
  templateUrl: './my-announcements-card.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './my-announcements-card.component.css',
})
export class MyAnnouncementsCardComponent {
  @Input() announcement: any;
  @Input() profile!: boolean;
  @Input() agencyMode = false;

  get editQueryParams() {
    return this.agencyMode && this.announcement?.agency?.id ? { agency: this.announcement.agency.id } : null;
  }

  moderationLabel(): string {
    const status = this.announcement?.moderation_status;
    if (status === 'approved') return 'Tasdiqlangan';
    if (status === 'rejected') return 'Bekor qilingan';
    if (status === 'pending') return 'Moderator tasdig‘ida';
    // Fallback for old boolean field
    return this.announcement?.is_approved ? 'Tasdiqlangan' : 'Moderator tasdig‘ida';
  }

  moderationClass(): string {
    const status = this.announcement?.moderation_status;
    if (status === 'approved') return 'badge-approved';
    if (status === 'rejected') return 'badge-rejected';
    if (status === 'pending') return 'badge-pending';
    return this.announcement?.is_approved ? 'badge-approved' : 'badge-pending';
  }
}
