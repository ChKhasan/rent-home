import { Component } from '@angular/core';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { Router } from '@angular/router';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { QueryService } from '@services/query';
import { BannerFilterComponent } from '../banner-filter/banner-filter.component';
import { SvgEffectDirective } from '@/core/directive/svg-effect.directive';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [SvgEffectDirective, CascadeSelectModule, FormsModule, CheckboxModule, InputNumberModule, ButtonModule, BannerFilterComponent],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css',
})
export class BannerComponent {
  countries: any[] | undefined;
  checked: boolean = false;
  selectedCity: any;
  value1: number = 1;
  constructor(private router: Router, private queryService: QueryService) {}

  afterSendFilter = () => {};
  toFilter() {
    let query = { ...this.queryService.activeQueryList() };
    query['need_people_count'] = this.value1;
    this.router.navigate(['/announcements'], {
      queryParams: query,
    });
  }
}
