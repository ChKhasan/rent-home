import { Component, Input, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { NgIf } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { AuthDialogComponent } from '../../modals/auth-dialog/auth-dialog.component';
import { AngularYandexMapsModule } from 'angular8-yandex-maps';
import { AuthService } from '@/core/services/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ChatUrlService } from '@/core/services/chatUrl/chatUrl.service';
import { PublisherMetaComponent } from '../publisher-meta/publisher-meta.component';
@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [ButtonModule, AngularYandexMapsModule, NgIf, SkeletonModule, AuthDialogComponent, PublisherMetaComponent, RouterLink],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css',
})
export class UserCardComponent {
  @Input() announcement!: any;
  public showNumber: boolean = false;
  public loading: boolean = false;
  @ViewChild(AuthDialogComponent) authDialogComponent!: AuthDialogComponent;
  constructor(public authService: AuthService, private router: Router, private chatUrlService: ChatUrlService) {}

  get contactUserId(): number | undefined {
    return this.announcement?.publisher?.responsible_person?.user_id || this.announcement?.user?.id;
  }

  get contactPhone(): string | undefined {
    return this.announcement?.publisher?.phone || this.announcement?.user?.phone_number;
  }

  get displayName(): string {
    return this.announcement?.publisher?.display_name
      || [this.announcement?.user?.name, this.announcement?.user?.last_name].filter(Boolean).join(' ')
      || "E'lon beruvchi";
  }

  get avatar(): string | undefined {
    return this.announcement?.publisher?.agency?.logo || this.announcement?.user?.images?.[0]?.image;
  }

  get publicProfileRoute(): string | null {
    const publisher = this.announcement?.publisher;
    if (this.announcement?.publisher_type === 'INDEPENDENT_AGENT' && publisher?.broker_profile?.id) {
      return `/brokers/${publisher.broker_profile.id}`;
    }
    if (this.announcement?.publisher_type === 'AGENCY_AGENT' && publisher?.agency?.id) {
      return `/agencies/${publisher.agency.id}`;
    }
    return null;
  }
  toChat() {
    if (this.authService.auth && this.authService.user.id) {
      this.chatUrlService.save(this.announcement?.id, {
        id: this.contactUserId!,
        name: this.displayName,
        phone_number: this.contactPhone,
        images: this.avatar ? [{ image: this.avatar }] : [],
        is_online: this.announcement?.user?.is_online,
        last_online: this.announcement?.user?.last_online,
      });
      const query = { userId: this.contactUserId };
      this.router
        .navigate(['/profile/chat'], {
          queryParams: query,
        })
        .then(() => {});
    } else {
      this.openAuthDialog();
    }
  }
  openAuthDialog() {
    this.authDialogComponent.showDialog();
  }
}
