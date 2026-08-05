import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { LucideSearch, LucideSlidersHorizontal } from '@lucide/angular';

import { DEAL_TYPE_OPTIONS, DealType, isDealType } from '@/core/constants/deal-type';
import { currenyTypes } from '@/core/constants/currency';
import { DealTypeService } from '@/core/services/deal-type/deal-type.service';
import { DictionaryService } from '@/core/services/dictionary/dictionary.service';
import { BottomSheetComponent } from '@components/modals/bottom-sheet/bottom-sheet.component';

interface QuickSearchFilter {
  deal_type: DealType;
  partnership: boolean;
  region: number | null;
  district: number | null;
  room_count: number | null;
  total_price__lte: number | null;
  currency: 'UZS' | 'USD';
}

@Component({
  selector: 'app-banner-filter',
  standalone: true,
  templateUrl: './banner-filter.component.html',
  styleUrl: './banner-filter.component.css',
  imports: [
    FormsModule,
    NgFor,
    NgIf,
    SelectModule,
    BottomSheetComponent,
    LucideSearch,
    LucideSlidersHorizontal,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BannerFilterComponent implements OnInit {
  @ViewChild('advancedSheet') private advancedSheet?: BottomSheetComponent;

  readonly dealTypeOptions = DEAL_TYPE_OPTIONS;
  readonly occupancyOptions: Array<{ label: string; value: boolean }> = [
    { label: 'Butun uy', value: false },
    { label: 'Sheriklik', value: true },
  ];
  readonly currencyOptions = currenyTypes;

  filter: QuickSearchFilter = {
    deal_type: this.dealTypeService.current,
    partnership: false,
    region: null,
    district: null,
    room_count: null,
    total_price__lte: null,
    currency: 'USD',
  };

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    public readonly dictionaryService: DictionaryService,
    private readonly dealTypeService: DealTypeService,
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const queryDealType = params.get('deal_type');
    const region = this.parsePositiveNumber(params.get('region'));

    this.filter = {
      deal_type: isDealType(queryDealType) ? queryDealType : this.dealTypeService.current,
      partnership: params.get('partnership') === 'true',
      region,
      district: this.parsePositiveNumber(params.get('district')),
      room_count: this.parsePositiveNumber(params.get('room_count')),
      total_price__lte: this.parsePositiveNumber(params.get('total_price__lte')),
      currency: params.get('currency') === 'UZS' ? 'UZS' : 'USD',
    };

    this.dealTypeService.setDealType(this.filter.deal_type);
    if (region) this.dictionaryService.__GET_DISTRICTS({ parent: region });
  }

  selectDealType(type: DealType): void {
    this.filter.deal_type = type;
    this.dealTypeService.setDealType(type);
  }

  selectOccupancy(partnership: boolean): void {
    this.filter.partnership = partnership;
  }

  onRegionChange(region: number | null): void {
    this.filter.district = null;
    this.dictionaryService.districts = [];
    if (region) this.dictionaryService.__GET_DISTRICTS({ parent: region });
  }

  openAdvancedFilters(): void {
    this.advancedSheet?.open();
  }

  applyAdvancedFilters(): void {
    this.advancedSheet?.close();
  }

  clearAdvancedFilters(): void {
    this.filter.partnership = false;
    this.filter.district = null;
    this.filter.room_count = null;
    this.filter.total_price__lte = null;
    this.filter.currency = 'USD';
  }

  search(): void {
    const queryParams = this.queryParams();
    void this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams,
        replaceUrl: true,
      })
      .then((updated) => {
        if (updated) return this.router.navigate(['/announcements'], { queryParams });
        return false;
      });
  }

  get advancedFilterCount(): number {
    return [
      this.filter.partnership,
      this.filter.district,
      this.filter.room_count,
      this.filter.total_price__lte,
    ].filter(Boolean).length;
  }

  private queryParams(): Record<string, string | number | boolean> {
    const query: Record<string, string | number | boolean> = {
      deal_type: this.filter.deal_type,
      partnership: this.filter.partnership,
    };

    if (this.filter.region) query['region'] = this.filter.region;
    if (this.filter.district) query['district'] = this.filter.district;
    if (this.filter.room_count) query['room_count'] = this.filter.room_count;
    if (this.filter.total_price__lte) {
      query['total_price__lte'] = this.filter.total_price__lte;
      query['currency'] = this.filter.currency;
    }
    return query;
  }

  private parsePositiveNumber(value: string | null): number | null {
    if (!value) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
}
