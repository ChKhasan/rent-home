import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-banner-template',
  standalone: true,
  imports: [],
  templateUrl: './banner-template.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './banner-template.component.css',
})
export class BannerTemplateComponent {}
