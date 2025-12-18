import { Component, OnInit } from '@angular/core';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { DictionaryService } from './../../../../core/services/dictionary/dictionary.service';
@Component({
  selector: 'app-banner-filter',
  standalone: true,
  templateUrl: './banner-filter.component.html',
  styleUrl: './banner-filter.component.css',
  imports: [SelectButtonModule, DropdownModule, FormsModule, ButtonModule],
})
export class BannerFilterComponent implements OnInit {
  public regions: Array<any> = [];
  stateOptions2 = [
    { label: 'One-Way', value: 'one-way' },
    { label: 'Return', value: 'return' }
  ];

  value: string = 'one-way';
  filter: any = {
    room_count: null,
    partnership: false,
    region: null,
    distirct: null
  };
  cities: any[] | undefined;

  selectedCity: any | undefined;

  stateOptions: any[] = [
    { label: 'Yakka', value: false, icon: 'pi pi-user' },
    { label: 'Sheriklik', value: true, icon: 'pi pi-users' },
  ];
  constructor(private router: Router, public dictionaryService: DictionaryService) {
    this.regions = this.dictionaryService.regions;
  }
  ngOnInit() {
    this.cities = [
      { name: 'New York', code: 'NY' },
      { name: 'Rome', code: 'RM' },
      { name: 'London', code: 'LDN' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Paris', code: 'PRS' },
    ];
  }
  toFilter() {
    let query = { ...this.filter };
    this.router.navigate(['/announcements'], {
      queryParams: query,
    });
  }
  onRegionChange(region: any): void {
    this.dictionaryService.__GET_DISTRICTS({ parent: region });
  }
}
