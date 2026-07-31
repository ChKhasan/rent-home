import { Component } from '@angular/core';
import { NgClass, NgForOf, AsyncPipe } from '@angular/common';
import { DealTypeService } from '@/core/services/deal-type/deal-type.service';
import { DEAL_TYPE_OPTIONS, DealType } from '@/core/constants/deal-type';

@Component({
  selector: 'app-deal-type-switcher',
  standalone: true,
  imports: [NgForOf, NgClass, AsyncPipe],
  templateUrl: './deal-type-switcher.component.html',
  styleUrl: './deal-type-switcher.component.css',
})
export class DealTypeSwitcherComponent {
  public readonly options = DEAL_TYPE_OPTIONS;
  public readonly dealType$ = this.dealTypeService.dealType$;

  constructor(private dealTypeService: DealTypeService) {}

  select(type: DealType) {
    this.dealTypeService.setDealType(type);
  }
}
