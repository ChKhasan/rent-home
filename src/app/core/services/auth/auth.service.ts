import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from "@angular/common/http";
import {ToastService} from "../toast/toast.service";
import {debounceTime, distinctUntilChanged, map, Observable} from "rxjs";
import {Announcement, UserInfo} from "../../interfaces/common.interface";
import {environment} from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public auth: boolean = false;
  public user: any = {}

  constructor(
    private _httpsClient: HttpClient,
  ) {
  }

  authHandler() {
    const AUTH_TOKEN = localStorage.getItem(environment.accessToken);
    Boolean(AUTH_TOKEN) ?
      this.getUser().subscribe((response) => {
        if (response) {
          this.user = response;
          this.auth = true;
        }
      }) :
      this.auth = false;
  }

  logout() {
    localStorage.removeItem(environment.accessToken)
    localStorage.removeItem(environment.refreshToken)
    this.authHandler()
  }

  postRegister(payload: any): Observable<Announcement[] | null> {
    return this._httpsClient
      .post<Announcement[]>(environment.urls.POST_REGISTER, payload, {observe: 'response'})
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        map((response: HttpResponse<Announcement[]>) => response.body)
      );
  }

  getUser(): Observable<UserInfo> {
    return this._httpsClient
      .get<UserInfo>(environment.authUrls.GET_ME)
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
      );
  }

  put(payload: any, id: number): Observable<UserInfo | null> {
    return this._httpsClient
      .put<UserInfo>(environment.authUrls.PUT_USER + id + '/', payload, {observe: 'response'})
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        map((response: HttpResponse<UserInfo>) => response.body)
      );
  }

  postLogin(payload: any): Observable<Announcement[] | null> {
    return this._httpsClient
      .post<Announcement[]>(environment.urls.POST_LOGIN, payload, {observe: 'response'})
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        map((response: HttpResponse<Announcement[]>) => response.body)
      );
  }
}
