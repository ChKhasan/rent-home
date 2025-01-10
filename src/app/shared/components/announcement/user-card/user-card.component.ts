import { Component, Input, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CurrencyPipe, NgIf } from '@angular/common';
import { PricePipe } from '../../../pipes/price/price.pipe';
import { SkeletonModule } from 'primeng/skeleton';
import { AuthDialogComponent } from '../../modals/auth-dialog/auth-dialog.component';
import { AngularYandexMapsModule } from 'angular8-yandex-maps';
import { AuthService } from '@/core/services/auth/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [ButtonModule, AngularYandexMapsModule, CurrencyPipe, PricePipe, NgIf, SkeletonModule, AuthDialogComponent],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css',
})
export class UserCardComponent {
  @Input() announcement!: any;
  public showNumber: boolean = false
  public loading: boolean = false;
  @ViewChild(AuthDialogComponent) authDialogComponent!: AuthDialogComponent;
  constructor(public authService: AuthService, private router: Router) {}
  toChat() {
    if (this.authService.auth && this.authService.user.id) {
      const query = {
        userId: this.announcement.user,
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
