import { Injectable } from '@angular/core';
import { debounceTime, distinctUntilChanged, Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  constructor(private _httpsClient: HttpClient) {}
  getData<T>(url: string, params?: any,headers?: any): Observable<T> {
    const options = {
      params: params,
      headers: headers
    };
    return this._httpsClient.get<T>(url, options).pipe(debounceTime(300), distinctUntilChanged());
  }
  requestData<T>(url: string, method: 'POST' | 'PATCH' | 'DELETE' | 'PUT', body?: any, params?: any, headers?: HttpHeaders): Observable<T> {
    const options = {
      headers: headers || new HttpHeaders(),
      params: new HttpParams({ fromObject: params }),
      body: body || {},
    };
    return this._httpsClient.request<T>(method, url, options);
  }
}
