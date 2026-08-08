import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BannerFilterComponent } from '../banner-filter/banner-filter.component';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [BannerFilterComponent],
  templateUrl: './banner.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './banner.component.css',
})
export class BannerComponent {}
