import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DealType, DEFAULT_DEAL_TYPE } from '@/core/constants/deal-type';

@Injectable({
  providedIn: 'root',
})
export class DealTypeService {
  private readonly storageKey = 'ijara_deal_type';
  private readonly type$ = new BehaviorSubject<DealType>(this.readInitialType());

  public dealType$ = this.type$.asObservable();

  get current(): DealType {
    return this.type$.value;
  }

  setDealType(type: DealType) {
    if (type === this.type$.value) return;
    this.type$.next(type);
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, type);
    }
  }

  private readInitialType(): DealType {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.storageKey) as DealType | null;
      if (stored === 'SALE' || stored === 'RENT') {
        return stored;
      }
    }
    return DEFAULT_DEAL_TYPE;
  }
}
