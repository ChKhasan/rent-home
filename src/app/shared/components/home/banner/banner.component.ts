import { Component } from '@angular/core';
import { BannerFilterComponent } from '../banner-filter/banner-filter.component';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [BannerFilterComponent],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css',
})
export class BannerComponent {}
