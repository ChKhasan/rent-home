import { Injectable } from '@angular/core';
import { RequestService } from '../request/request.service';
import { environment } from '@environments';
import { finalize, map, Observable, of, shareReplay, tap } from 'rxjs';

export interface RegionOption {
  id: number;
  name: string;
  level: number;
  parent: number | null;
}

type DictionaryResponse<T> = T[] | { results?: T[] };

@Injectable({
  providedIn: 'root',
})
export class DictionaryService {
  public regions: RegionOption[] = [];
  public districts: RegionOption[] = [];
  private regionsRequest?: Observable<RegionOption[]>;

  constructor(private requestService: RequestService) {}

  loadRegions(force = false): Observable<RegionOption[]> {
    if (!force && this.regions.length) return of(this.regions);
    if (!force && this.regionsRequest) return this.regionsRequest;

    const request = this.requestService
      .getData<DictionaryResponse<RegionOption>>(environment.urls.GET_REGIONS, {
        level: 1,
        page_size: 100,
      })
      .pipe(
        map((response) => this.rowsOf(response)),
        tap((regions) => (this.regions = regions)),
        finalize(() => {
          if (this.regionsRequest === request) this.regionsRequest = undefined;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

    this.regionsRequest = request;
    return request;
  }

  loadDistricts(parent: number): Observable<RegionOption[]> {
    return this.requestService
      .getData<DictionaryResponse<RegionOption>>(environment.urls.GET_REGIONS, {
        level: 2,
        parent,
        page_size: 100,
      })
      .pipe(map((response) => this.rowsOf(response)));
  }

  __GET_REGIONS() {
    return this.loadRegions().subscribe({
      error: () => (this.regions = []),
    });
  }

  __GET_DISTRICTS(params?: { parent?: number }) {
    const parent = Number(params?.parent);
    if (!Number.isFinite(parent) || parent <= 0) {
      this.districts = [];
      return of([]).subscribe();
    }
    return this.loadDistricts(parent).subscribe({
      next: (districts) => (this.districts = districts),
      error: () => (this.districts = []),
    });
  }

  private rowsOf<T>(response: DictionaryResponse<T>): T[] {
    if (Array.isArray(response)) return response;
    return Array.isArray(response?.results) ? response.results : [];
  }
}
