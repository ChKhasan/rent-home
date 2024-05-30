import { Injectable } from '@angular/core';
import {debounceTime, distinctUntilChanged, map, Observable} from "rxjs";
import {environment} from "../../../../environments/environment";
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from "@angular/common/http";
import {Announcement} from "../../interfaces/common.interface";

@Injectable({
  providedIn: 'root'
})
export class TransportsService {

  constructor(private _httpsClient: HttpClient) { }
  getData<T>(url: string, params?: any): Observable<T> {
    const options = {
      params: new HttpParams({ fromObject: params }),
    };
    return this._httpsClient.get<T>(url, options).pipe(
      debounceTime(300),
      distinctUntilChanged(),
    );
  }

  requestData<T>(
    url: string,
    method: 'POST' | 'PATCH' | 'DELETE' | 'PUT',
    body?: any,
    params?: any,
    headers?: HttpHeaders
  ): Observable<T> {
    const options = {
      headers: headers || new HttpHeaders(),
      params: new HttpParams({ fromObject: params }),
      body: body || {},
    };
    return this._httpsClient.request<T>(method, url, options);
  }
  get(): Observable<any> {
    return this._httpsClient
      .get<any>(environment.urls.GET_TRANSPORTS)
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
      );
  }
  postByLocation(payloadData: any): Observable<any> {
    return this._httpsClient
      .post<any>(environment.urls.POST_LOCATIONBUSES,payloadData)
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
      );
  }
  postBusRoutes(paramsData: any): Observable<any> {
    return this._httpsClient
      .post<any>(environment.urls.POST_BUSROUTES,paramsData)
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
