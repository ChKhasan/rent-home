import { Injectable } from '@angular/core';
import { RequestService } from '../request/request.service';
import { environment } from '@environments';

@Injectable({
  providedIn: 'root'
})
export class DictionaryService {
  public regions: Array<any> = []
  constructor(
    private requestService: RequestService,
  ) { }

  __GET_REGIONS() {
    return this.requestService.getData(environment.urls.GET_REGIONS).subscribe((res: any) => {
      this.regions = res.results
    })
  }
}
