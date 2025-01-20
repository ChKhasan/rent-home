import { Injectable } from '@angular/core';
import { RequestService } from '../request/request.service';
import { environment } from '@environments';

@Injectable({
  providedIn: 'root',
})
export class DictionaryService {
  public regions: Array<any> = [];
  public districts: Array<any> = [];
  constructor(private requestService: RequestService) {}

  __GET_REGIONS() {
    return this.requestService.getData(environment.urls.GET_REGIONS, { level: 1 }).subscribe((res: any) => {
      this.regions = res.results;
    });
  }
  __GET_DISTRICTS(params?: {}) {
    return this.requestService.getData(environment.urls.GET_REGIONS, { level: 2, ...params }).subscribe((res: any) => {
      this.districts = res.results;
    });
  }
}
