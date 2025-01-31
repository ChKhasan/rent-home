import { Component } from '@angular/core';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { Router, RouterLink } from '@angular/router';
import { SearchComponent } from '../../announcement/search/search.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { QueryService } from '@services/query';
import { BannerHomeComponent } from '../../../icons/banner-home/banner-home.component';
import { BannerCloudComponent } from '../../../icons/banner-cloud/banner-cloud.component';
import { BannerCloud2Component } from '../../../icons/banner-cloud-2/banner-cloud-2.component';
import { BannerFilterComponent } from '../banner-filter/banner-filter.component';
import { SvgEffectDirective } from '@/core/directive/svg-effect.directive';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [SvgEffectDirective,CascadeSelectModule, FormsModule, CheckboxModule, RouterLink, SearchComponent, InputNumberModule, ButtonModule, BannerHomeComponent, BannerCloudComponent, BannerCloud2Component, BannerFilterComponent],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css',
})
export class BannerComponent {
  countries: any[] | undefined;
  checked: boolean = false;
  selectedCity: any;
  value1: number = 1;
  constructor(
    private router: Router,
    private queryService: QueryService,
  ) {}
  ngOnInit() {
    this.countries = [
      {
        name: 'Australia',
        code: 'AU',
        states: [
          {
            name: 'New South Wales',
            cities: [
              { cname: 'Sydney', code: 'A-SY' },
              { cname: 'Newcastle', code: 'A-NE' },
              { cname: 'Wollongong', code: 'A-WO' },
            ],
          },
          {
            name: 'Queensland',
            cities: [
              { cname: 'Brisbane', code: 'A-BR' },
              { cname: 'Townsville', code: 'A-TO' },
            ],
          },
        ],
      },
      {
        name: 'Canada',
        code: 'CA',
        states: [
          {
            name: 'Quebec',
            cities: [
              { cname: 'Montreal', code: 'C-MO' },
              { cname: 'Quebec City', code: 'C-QU' },
            ],
          },
          {
            name: 'Ontario',
            cities: [
              { cname: 'Ottawa', code: 'C-OT' },
              { cname: 'Toronto', code: 'C-TO' },
            ],
          },
        ],
      },
      {
        name: 'United States',
        code: 'US',
        states: [
          {
            name: 'California',
            cities: [
              { cname: 'Los Angeles', code: 'US-LA' },
              { cname: 'San Diego', code: 'US-SD' },
              { cname: 'San Francisco', code: 'US-SF' },
            ],
          },
          {
            name: 'Florida',
            cities: [
              { cname: 'Jacksonville', code: 'US-JA' },
              { cname: 'Miami', code: 'US-MI' },
              { cname: 'Tampa', code: 'US-TA' },
              { cname: 'Orlando', code: 'US-OR' },
            ],
          },
          {
            name: 'Texas',
            cities: [
              { cname: 'Austin', code: 'US-AU' },
              { cname: 'Dallas', code: 'US-DA' },
              { cname: 'Houston', code: 'US-HO' },
            ],
          },
        ],
      },
    ];
  }
  afterSendFilter = () => {};
  toFilter() {
    let query = { ...this.queryService.activeQueryList() };
    query['need_people_count'] = this.value1;
    this.router.navigate(['/announcements'], {
      queryParams: query,
    });
  }
}
