import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, NgOptimizedImage } from '@angular/common';
import { PricePipe } from '@/shared/pipes/price/price.pipe';

@Component({
  selector: 'app-my-announcements-card',
  standalone: true,
  imports: [RouterLink,PricePipe, NgOptimizedImage, NgIf],
  templateUrl: './my-announcements-card.component.html',
  styleUrl: './my-announcements-card.component.css',
})
export class MyAnnouncementsCardComponent {
  @Input() announcement: any;
  @Input() profile!: boolean;
}
