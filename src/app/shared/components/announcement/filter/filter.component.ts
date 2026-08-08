import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CheckboxModule } from 'primeng/checkbox';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';
import { FilterForm, PublisherType } from '@services/interfaces';
import { QueryService } from '@services/query';
import { SelectModule } from 'primeng/select';
import { RequestService } from '@/core/services/request/request.service';
import { environment } from '@environments';
import { MultiSelectModule } from 'primeng/multiselect';
import { DictionaryService } from '@/core/services/dictionary/dictionary.service';
import { currenyTypes } from '@/core/constants/currency';
import { LucideMap, LucideSearch } from '@lucide/angular';
@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [ToggleSwitchModule, FormsModule, CheckboxModule, InputNumberModule, ButtonModule, SliderModule, SelectModule, MultiSelectModule, RouterLink, LucideMap, LucideSearch],
  templateUrl: './filter.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './filter.component.css',
})
export class FilterComponent implements OnInit {
  readonly publisherTypes: Array<{ value: PublisherType; label: string }> = [
    { value: 'OWNER', label: 'Uy egasi' },
    { value: 'INDEPENDENT_AGENT', label: 'Mustaqil makler' },
    { value: 'AGENCY_AGENT', label: 'Agentlik' },
  ];
  publisherTypeError = false;
  checked: boolean = false;
  public sliderValue: number[] = [0, 0];
  public tab: number = 1;
  public transports: any[] | undefined = [];
  public selectedCities: any = [];
  public step: number = 10;
  public sliderMax: number = 0;
  public sliderMin: number = 0;
  public priceFilterDirty = false;
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
    publisher_type: ['OWNER', 'INDEPENDENT_AGENT', 'AGENCY_AGENT'],
    verified_only: false,
    commission_free: false,
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

  constructor(private requestService: RequestService, public queryService: QueryService, public dictionaryService: DictionaryService) {}

  selectedCity: any | undefined;

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.requestService.getData(environment.urls.GET_TRANSPORTS).subscribe((response: any) => {
        this.transports = response;
        let query: any = { ...this.queryService.activeQueryList() };
        if (query?.transports) {
          const transports = Array.isArray(query.transports) ? query.transports : [query.transports];
          transports.forEach((elem: string) => {
            this.selectedCities.push(this.transports?.find((item: any) => item.ri === elem));
          });
          this.selectedCities = this.selectedCities.filter(Boolean);
        }
      });
      let query = this.queryService.activeQueryList();
      let normalizedQuery = this.normalizeQueryParams(query);
      normalizedQuery['publisher_type'] = this.parsePublisherTypes(query['publisher_type']);
      for (let item in this.filterForm) {
        this.filterForm[item as keyof FilterForm] = normalizedQuery[item] || this.filterForm[item as keyof FilterForm];
      }
      this.sliderValue[0] = Number(this.filterForm.total_price__gte);
      this.sliderValue[1] = Number(this.filterForm.total_price__lte);
      this.priceFilterDirty = query['total_price__gte'] != null || query['total_price__lte'] != null;
      this.__GET_MIN_MAX_PRICE();
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

  private parsePublisherTypes(value: unknown): PublisherType[] {
    const allowed = new Set<PublisherType>(['OWNER', 'INDEPENDENT_AGENT', 'AGENCY_AGENT']);
    const values = (Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [])
      .filter((item): item is PublisherType => allowed.has(item as PublisherType));
    return values.length ? [...new Set(values)] : ['OWNER', 'INDEPENDENT_AGENT', 'AGENCY_AGENT'];
  }

  isPublisherSelected(type: PublisherType): boolean {
    return this.filterForm.publisher_type.includes(type);
  }

  togglePublisher(type: PublisherType): void {
    const selected = this.filterForm.publisher_type;
    if (selected.includes(type)) {
      if (selected.length === 1) {
        this.publisherTypeError = true;
        return;
      }
      this.filterForm.publisher_type = selected.filter((item) => item !== type);
    } else {
      this.filterForm.publisher_type = [...selected, type];
    }
    this.publisherTypeError = false;
    if (this.filterForm.verified_only) {
      this.filterForm.publisher_type = this.filterForm.publisher_type.filter((item) => item !== 'OWNER');
    }
  }

  onVerifiedOnlyChange(): void {
    if (this.filterForm.verified_only) {
      const agentTypes = this.filterForm.publisher_type.filter((item) => item !== 'OWNER');
      this.filterForm.publisher_type = agentTypes.length ? agentTypes : ['INDEPENDENT_AGENT', 'AGENCY_AGENT'];
    }
  }

  ownersOnly(): void {
    this.filterForm.publisher_type = ['OWNER'];
    this.filterForm.verified_only = false;
    this.filterForm.commission_free = false;
    this.publisherTypeError = false;
  }
  closeBottomSheet() {
    if (this.close !== undefined) this.close();
  }

  filterSend() {
    const transports = this.selectedCities.map((elem: any) => elem.ri).filter(Boolean);
    const allTypesSelected = this.filterForm.publisher_type.length === this.publisherTypes.length;
    this.filterAction({
      ...this.filterForm,
      floor: this.filterForm.floor || null,
      conditioner: this.filterForm.conditioner || null,
      partnership: this.filterForm.partnership || null,
      washing_machine: this.filterForm.washing_machine || null,
      need_people_count: this.filterForm.partnership ? this.filterForm.need_people_count || null : null,
      total_price__gte: this.priceFilterDirty ? this.sliderValue[0] : null,
      total_price__lte: this.priceFilterDirty ? this.sliderValue[1] : null,
      room_count: this.filterForm.room_count || null,
      fridge: this.filterForm.fridge || null,
      transports: transports.length ? transports : null,
      region: this.filterForm.region || null,
      district: this.filterForm.district || null,
      currency: this.priceFilterDirty ? this.filterForm.currency : null,
      publisher_type: allTypesSelected ? null : this.filterForm.publisher_type.join(','),
      verified_only: this.filterForm.verified_only || null,
      commission_free: this.filterForm.commission_free || null,
    });
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
      publisher_type: ['OWNER', 'INDEPENDENT_AGENT', 'AGENCY_AGENT'],
      verified_only: false,
      commission_free: false,
    };
    this.priceFilterDirty = false;
    this.publisherTypeError = false;
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
      this.onCurrencyChange(!this.priceFilterDirty);
    });
  }
  onCurrencySelectionChange(): void {
    this.priceFilterDirty = false;
    this.onCurrencyChange(true);
  }
  onCurrencyChange(resetRange = true) {
    const keyName = this.filterForm.partnership ? 'price_for_one' : 'total_price';
    this.sliderMax = this.prices[keyName]?.[`MAX_${this.filterForm.currency}`] || 0;
    this.sliderMin = this.prices[keyName]?.[`MIN_${this.filterForm.currency}`] || 0;
    this.sliderValue = resetRange
      ? [this.sliderMin, this.sliderMax]
      : [Number(this.filterForm.total_price__gte) || this.sliderMin, Number(this.filterForm.total_price__lte) || this.sliderMax];
    this.step = Math.pow(10,String(Math.floor(this.sliderMin / 100)).length)
  }
  markPriceChanged(): void {
    this.priceFilterDirty = true;
  }
  onPartnershipChange() {
    this.priceFilterDirty = false;
    this.onCurrencyChange(true);
    this.filterForm.need_people_count = null;
  }
  onRegionChange(region: any): void {
    this.dictionaryService.__GET_DISTRICTS({ parent: region });
  }
}
