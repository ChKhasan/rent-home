import { Component, Input, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { NgIf } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { AuthDialogComponent } from '../../modals/auth-dialog/auth-dialog.component';
import { AngularYandexMapsModule } from 'angular8-yandex-maps';
import { AuthService } from '@/core/services/auth/auth.service';
import { Router } from '@angular/router';
import { ChatUrlService } from '@/core/services/chatUrl/chatUrl.service';
@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [ButtonModule, AngularYandexMapsModule, NgIf, SkeletonModule, AuthDialogComponent],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css',
})
export class UserCardComponent {
  @Input() announcement!: any;
  public showNumber: boolean = false;
  public loading: boolean = false;
  @ViewChild(AuthDialogComponent) authDialogComponent!: AuthDialogComponent;
  constructor(public authService: AuthService, private router: Router, private chatUrlService: ChatUrlService) {}
  toChat() {
    if (this.authService.auth && this.authService.user.id) {
      this.chatUrlService.save(this.announcement?.id);
      const query = {
        userId: this.announcement.user?.id,
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
  openAuthDialog() {
    this.authDialogComponent.showDialog();
  }
}
