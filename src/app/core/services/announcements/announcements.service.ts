import {Injectable} from "@angular/core";
import {debounceTime, distinctUntilChanged, filter, map, Observable, throwError} from "rxjs";
import {HttpClient, HttpErrorResponse, HttpParams, HttpResponse} from "@angular/common/http";
import {Announcement} from "../../interfaces/common.interface";
import {environment} from "../../../../environments/environment";
import {ToastService} from "../toast/toast.service";

@Injectable({
  providedIn: "root",

})
export class AnnouncementsService {
  constructor(
    private _httpsClient: HttpClient,
    public toastService: ToastService
  ) {
  }

  get(params: HttpParams | {page: number, page_size: number}): Observable<any> {
    return this._httpsClient
      .get<any>(environment.urls.GET_ANNONCEMENTS, {params:params})
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
      );
  }
  getById(id: number | string | null): Observable<any> {
    return this._httpsClient
      .get<any>(environment.urls.GET_ANNONCEMENTS + id)
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
      );
  }
  getMy(payload: any): Observable<any> {
    return this._httpsClient
      .get<any>(environment.authUrls.GET_MY_ANNONCEMENTS,payload)
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
      );
  }

  post(payload: any): Observable<Announcement[] | null> {
    return this._httpsClient
      .post<Announcement[]>(environment.authUrls.POST_ANNONCEMENTS,payload,{ observe: 'response' })
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        map((response: HttpResponse<Announcement[]>) => response.body)
      );
  }

  put(payload: any,id: any): Observable<Announcement[] | null> {
    return this._httpsClient
      .put<Announcement[]>(environment.authUrls.PUT_ANNONCEMENTS + id + '/',payload,{ observe: 'response' })
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        map((response: HttpResponse<Announcement[]>) => response.body)
      );
  }
  delete(): Observable<Announcement[]> {
    return this._httpsClient
      .get<Announcement[]>(`${environment.baseUrl}/posts`)
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      );
  }
}
