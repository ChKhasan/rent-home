import { Component, Input, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IAnnouncementInfo } from '@services/interfaces';
import { NgIf } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { Router, RouterLink } from '@angular/router';
import { AuthDialogComponent } from '../../modals/auth-dialog/auth-dialog.component';
import { AuthService } from '@services/auth';
import { AngularYandexMapsModule } from 'angular8-yandex-maps';
import { ChatUrlService } from '@/core/services/chatUrl/chatUrl.service';

@Component({
  selector: 'app-price-block',
  standalone: true,
  imports: [ButtonModule, AngularYandexMapsModule, RouterLink, NgIf, SkeletonModule, AuthDialogComponent],
  templateUrl: './price-block.component.html',
  styleUrl: './price-block.component.css',
})
export class PriceBlockComponent {
  @Input() announcement!: any;
  @Input() loading!: boolean;
  @ViewChild(AuthDialogComponent) authDialogComponent!: AuthDialogComponent;
  public zoom = 10;
  constructor(
    private router: Router,
    public authService: AuthService,
    private chatUrlService: ChatUrlService,
  ) {}
  openAuthDialog() {
    this.authDialogComponent.showDialog();
  }
  toChat() {
    if (this.authService.auth && this.authService.user.id) {
      const user = this.announcement?.user;
      const userId = typeof user === 'number' ? user : user?.id;
      if (!userId || userId === this.authService.user.id) return;
      this.chatUrlService.save(this.announcement?.id, {
        id: userId,
        name: user?.name || "E'lon beruvchi",
        phone_number: user?.phone_number,
        images: user?.images || [],
        is_online: user?.is_online,
        last_online: user?.last_online,
      });
      const query = {
        userId,
      };
      this.router
        .navigate(['/profile/chat'], {
          queryParams: query,
        })
        .then(() => {});
    } else {
      this.openAuthDialog();
    }
  }
}
