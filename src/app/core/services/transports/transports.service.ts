import { Injectable } from '@angular/core';
import {debounceTime, distinctUntilChanged, map, Observable} from "rxjs";
import {environment} from "../../../../environments/environment";
import {HttpClient, HttpResponse} from "@angular/common/http";
import {Announcement} from "../../interfaces/common.interface";

@Injectable({
  providedIn: 'root'
})
export class TransportsService {

  constructor(private _httpsClient: HttpClient) { }
  get(): Observable<any> {
    return this._httpsClient
      .get<any>(environment.urls.GET_TRANSPORTS)
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
      );
  }
  getAll(paramsData: any): Observable<any> {
    return this._httpsClient
      .get<any>(environment.urls.GET_ALLTRANSPORTS,paramsData)
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
      );
  }
  postAll(payload: any): Observable<Announcement[] | null> {
    return this._httpsClient
      .post<Announcement[]>(environment.authUrls.POST_ALLTRANSPORTS,payload,{ observe: 'response' })
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        map((response: HttpResponse<Announcement[]>) => response.body)
      );
  }
  post(payload: any): Observable<Announcement[] | null> {
    return this._httpsClient
      .post<Announcement[]>(environment.authUrls.POST_TRANSPORTS,payload,{ observe: 'response' })
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        map((response: HttpResponse<Announcement[]>) => response.body)
      );
  }
}
