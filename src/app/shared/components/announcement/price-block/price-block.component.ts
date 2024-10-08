import { Component, Input, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IAnnouncementInfo } from '@services/interfaces';
import { CurrencyPipe, NgIf } from '@angular/common';
import { PricePipe } from '../../../pipes/price/price.pipe';
import { SkeletonModule } from 'primeng/skeleton';
import { Router, RouterLink } from '@angular/router';
import { AuthDialogComponent } from '../../modals/auth-dialog/auth-dialog.component';
import { AuthService } from '@services/auth';
import { AngularYandexMapsModule } from 'angular8-yandex-maps';

@Component({
  selector: 'app-price-block',
  standalone: true,
  imports: [ButtonModule, AngularYandexMapsModule, RouterLink, CurrencyPipe, PricePipe, NgIf, SkeletonModule, AuthDialogComponent],
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
  ) {}
  openAuthDialog() {
    this.authDialogComponent.showDialog();
  }
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
}
