import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from "@angular/common/http";
import {ToastService} from "../toast/toast.service";
import {BehaviorSubject, debounceTime, distinctUntilChanged, map, Observable} from "rxjs";
import {Announcement, UserInfo} from "../../interfaces/common.interface";
import {environment} from "../../../../environments/environment";
import {Location} from "@angular/common";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public auth: boolean = false;
  public user: any = {}
  private booleanSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  setBooleanValue(value: boolean): void {
    this.booleanSubject.next(value);
  }

  getBooleanValue(): Observable<boolean> {
    return this.booleanSubject.asObservable();
  }
  constructor(
    private _httpsClient: HttpClient,
    private location: Location,
    private router: Router
  ) {
  }

  authHandler() {
    return new Promise<void>((resolve, reject) => {
      const AUTH_TOKEN = localStorage.getItem(environment.accessToken);
      Boolean(AUTH_TOKEN) ?
        this.getUser().subscribe((response: UserInfo) => {
          if (response) {
            this.user = response;
            this.auth = true;
            this.setBooleanValue(this.auth);
            resolve();
          }
        }):
        this.auth = false;
    })

  }

  logout() {
    localStorage.removeItem(environment.accessToken)
    localStorage.removeItem(environment.refreshToken)
    let currentPath = this.location.path();
    console.log(currentPath)
    if (currentPath.includes('/profile')) {
      this.router.navigate(['/']).then(() => {})
    }
    this.authHandler().then(() => {})
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
