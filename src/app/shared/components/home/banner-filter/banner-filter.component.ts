import { Component, OnInit } from '@angular/core';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { DictionaryService } from './../../../../core/services/dictionary/dictionary.service';
@Component({
  selector: 'app-banner-filter',
  standalone: true,
  templateUrl: './banner-filter.component.html',
  styleUrl: './banner-filter.component.css',
  imports: [ReactiveFormsModule, SelectButtonModule, DropdownModule, FormsModule, ButtonModule],
})

export class BannerFilterComponent implements OnInit {
  public regions: Array<any> = []
  filter: any = {
    room_count: null,
    partnership: false,
    region: null
  }
  cities: any[] | undefined;

  selectedCity: any | undefined;

  formGroup!: FormGroup;

  stateOptions: any[] = [
    { label: 'Yakka', value: false, icon: 'pi pi-user' },
    { label: 'Sheriklik', value: true, icon: 'pi pi-users' },
  ];
  constructor(
    private router: Router,
    public dictionaryService: DictionaryService
  ) {
    this.regions = this.dictionaryService.regions
  }
  ngOnInit() {
    this.formGroup = new FormGroup({
      value: new FormControl('on'),
    });
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
}
