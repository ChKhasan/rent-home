import {Component, Input, ViewChild} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {Announcement} from "../../../../core/interfaces/common.interface";
import {CurrencyPipe, NgIf} from "@angular/common";
import {PricePipe} from "../../../pipes/price/price.pipe";
import {SkeletonModule} from "primeng/skeleton";
import {QueryService} from "../../../../core/services/query/query.service";
import {Router} from "@angular/router";
import {AuthDialogComponent} from "../../modals/auth-dialog/auth-dialog.component";
import {AuthService} from "../../../../core/services/auth/auth.service";

@Component({
  selector: 'app-price-block',
  standalone: true,
  imports: [
    ButtonModule,
    CurrencyPipe,
    PricePipe,
    NgIf,
    SkeletonModule,
    AuthDialogComponent,
  ],
  templateUrl: './price-block.component.html',
  styleUrl: './price-block.component.css'
})
export class PriceBlockComponent {
  @Input() announcement!: Announcement
  @Input() loading!: boolean;
  @ViewChild(AuthDialogComponent) authDialogComponent!: AuthDialogComponent;
  constructor(private router: Router,
              public authService: AuthService) {
  }
  openAuthDialog() {
    this.authDialogComponent.showDialog();
  }
  toChat() {
    if(this.authService.auth && this.authService.user.id) {
      const query = {
        userId: this.announcement.user
      }
      this.router.navigate(['/profile/chat'], {
        queryParams: query,
      }).then(() => {
      })
    } else {
      this.openAuthDialog()
    }
  }
}
