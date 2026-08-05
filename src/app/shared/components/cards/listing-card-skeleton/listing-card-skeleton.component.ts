import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-listing-card-skeleton',
  standalone: true,
  templateUrl: './listing-card-skeleton.component.html',
  styleUrl: './listing-card-skeleton.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListingCardSkeletonComponent {}
