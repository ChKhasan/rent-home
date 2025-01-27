import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckboxModule } from 'primeng/checkbox';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';
import { FilterForm } from '@services/interfaces';
import { QueryService } from '@services/query';
import { DropdownModule } from 'primeng/dropdown';
import { RequestService } from '@/core/services/request/request.service';
import { environment } from '@environments';
import { MultiSelectModule } from 'primeng/multiselect';
import { DictionaryService } from '@/core/services/dictionary/dictionary.service';
import { currenyTypes } from '@/core/constants/currency';
import { NgIf } from '@angular/common';
import { ValidationErrorAnimation } from '@/core/common/animations';
@Component({
  selector: 'app-filter',
  standalone: true,
  animations: [ValidationErrorAnimation],
  imports: [InputSwitchModule, FormsModule, CheckboxModule, InputNumberModule, ButtonModule, SliderModule, DropdownModule, MultiSelectModule, NgIf],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css',
})
export class FilterComponent implements OnInit {
  checked: boolean = false;
  public sliderValue: number[] = [0, 0];
  public tab: number = 1;
  public transports: any[] | undefined = [];
  public selectedCities: any = [];
  public sliderMax: number = 0;
  public sliderMin: number = 0;
  public currenyTypes = currenyTypes;
  public prices: any = {};
  public filterForm: FilterForm = {
    floor: null,
    conditioner: false,
    partnership: false,
    washing_machine: false,
    need_people_count: null,
    total_price__gte: 0,
    total_price__lte: 0,
    room_count: null,
    fridge: false,
    transports: [],
    region: null,
    district: null,
    currency: 'UZS',
  };
  public tabOptions = [
    {
      name: 'Ixtiyoriy sozlash',
      id: 1,
    },
    {
      name: 'Oila uchun',
      id: 2,
    },
    {
      name: 'Komandirovka',
      id: 3,
    },
  ];
  @Input() filterAction!: Function;
  @Input() clearFilterAction!: Function;
  @Input() loading!: boolean;
  @Input() close: Function | undefined;

  constructor(private requestService: RequestService, public queryService: QueryService, public dictionaryService: DictionaryService, public router: Router, public route: ActivatedRoute) {}

  selectedCity: any | undefined;

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.__GET_MIN_MAX_PRICE();
      this.requestService.getData(environment.urls.GET_TRANSPORTS).subscribe((response: any) => {
        this.transports = response;
        let query: any = { ...this.queryService.activeQueryList() };
        if (query?.transports) {
          query?.transports.forEach((elem: string) => {
            this.selectedCities.push(this.transports?.find((item: any) => item.ri === elem));
          });
          this.selectedCities = [...this.selectedCities];
        }
      });
      let query = this.queryService.activeQueryList();
      let normalizedQuery = this.normalizeQueryParams(query);
      for (let item in this.filterForm) {
        this.filterForm[item as keyof FilterForm] = normalizedQuery[item] || this.filterForm[item as keyof FilterForm];
      }
      this.sliderValue[0] = Number(this.filterForm.total_price__gte);
      this.sliderValue[1] = Number(this.filterForm.total_price__lte);
    }
  }

  normalizeQueryParams(query: Record<string, any>): Record<string, any> {
    const normalized: Record<string, any> = {};

    for (const key in query) {
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        const value = query[key];

        if (!isNaN(Number(value))) {
          normalized[key] = Number(value);
        } else if (['true', 'false'].includes(value)) {
          normalized[key] = value === 'true';
        } else {
          normalized[key] = value;
        }
      }
    }

    return normalized;
  }
  closeBottomSheet() {
    if (this.close !== undefined) this.close();
  }

  filterSend() {
    this.filterForm.total_price__gte = this.sliderValue[0];
    this.filterForm.total_price__lte = this.sliderValue[1];
    this.filterForm['transports'] = this.selectedCities.map((elem: any) => elem.ri);
    this.filterAction(this.filterForm);
  }

  clearFilter() {
    this.clearFilterAction();
    this.filterForm = {
      conditioner: false,
      partnership: false,
      fridge: false,
      washing_machine: false,
      need_people_count: null,
      total_price__gte: null,
      total_price__lte: null,
      room_count: null,
      transports: [],
      region: null,
      district: null,
      currency: 'UZS',
      floor: null,
    };
    this.__GET_MIN_MAX_PRICE();
  }
  async onClear() {
    let query: any = { ...this.queryService.activeQueryList() };
    if (query['transports']) query.transports = [];
    // this.queryService.updateCustomQuery(query, this.getData).then(() => {});
  }
  onChange(event: any) {
    let query: any = { ...this.queryService.activeQueryList() };
    if (query['transports']) this.filterForm.transports = query.transports.filter((elem: string) => elem !== event.itemValue.ri);
    // this.queryService.updateCustomQuery(query, this.getData).then(() => {});
  }
  __GET_MIN_MAX_PRICE() {
    this.requestService.getData(environment.urls.GET_MIN_MAX_PRICE, { currency: this.filterForm.currency }).subscribe((response: any) => {
      this.prices = response;
      this.onCurrencyChange();
    });
  }
  onCurrencyChange() {
    const keyName = this.filterForm.partnership ? 'price_for_one' : 'total_price';
    this.sliderMax = this.prices[keyName]?.[`MAX_${this.filterForm.currency}`] || 0;
    this.sliderMin = this.prices[keyName]?.[`MIN_UZS`] || 0;
    this.sliderValue = [this.prices[keyName]?.[`MIN_UZS`] || 0, this.prices[keyName]?.[`MAX_${this.filterForm.currency}`] || 0];
  }
  onPartnershipChange() {
    this.onCurrencyChange();
    this.filterForm.need_people_count = null;
  }
  onRegionChange(region: any): void {
    this.dictionaryService.__GET_DISTRICTS({ parent: region });
  }
}
