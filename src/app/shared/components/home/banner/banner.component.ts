import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideMap } from '@lucide/angular';
import { BannerFilterComponent } from '../banner-filter/banner-filter.component';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [BannerFilterComponent, RouterLink, LucideMap],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css',
})
export class BannerComponent {}
