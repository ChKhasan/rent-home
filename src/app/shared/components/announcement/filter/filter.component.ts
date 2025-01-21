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
@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [InputSwitchModule, FormsModule, CheckboxModule, InputNumberModule, ButtonModule, SliderModule, DropdownModule, MultiSelectModule],
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
  public filterForm: FilterForm = {
    conditioner: false,
    partnership: false,
    washing_machine: false,
    need_people_count: 1,
    total_price__gte: 0,
    total_price__lte: 0,
    room_count: 1,
    fridge: false,
    transports: [],
    region: null,
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
  cities: any[] | undefined;

  selectedCity: any | undefined;

  ngOnInit() {
    this.cities = [{ name: 'New York', code: 'NY' }];
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
      for (let item in this.filterForm) {
        this.filterForm[item as keyof FilterForm] = (typeof query[item] === 'string' && JSON.parse(query[item])) || this.filterForm[item as keyof FilterForm];
      }
      this.sliderValue[0] = Number(this.filterForm.total_price__gte);
      this.sliderValue[1] = Number(this.filterForm.total_price__lte);
    }
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
      need_people_count: 1,
      total_price__gte: 0,
      total_price__lte: 0,
      room_count: 1,
      transports: [],
      region: null,
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
    this.requestService.getData(environment.urls.GET_MIN_MAX_PRICE).subscribe((response: any) => {
      this.sliderMax = response?.max_price || 0;
      this.sliderMin = response?.min_price || 0;
      this.sliderValue = [response?.min_price || 0, response?.max_price || 0];
    });
  }
}
