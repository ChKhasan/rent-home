import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IUserInfo } from '@services/interfaces';
import { environment } from '@environments';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { RequestService } from '@services/request';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public auth: boolean = false;
  public user: any = {};
  private booleanSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  setBooleanValue(value: boolean): void {
    this.booleanSubject.next(value);
  }

  getBooleanValue(): Observable<boolean> {
    return this.booleanSubject.asObservable();
  }
  constructor(private location: Location, private router: Router, private requestService: RequestService) {}

  authHandler(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const AUTH_TOKEN = localStorage.getItem(environment.accessToken);
      const REFRESH_TOKEN = localStorage.getItem(environment.refreshToken);
      if (Boolean(AUTH_TOKEN) || Boolean(REFRESH_TOKEN)) {
        this.requestService.getData<IUserInfo>(environment.authUrls.GET_ME).subscribe({
          next: (response: IUserInfo) => {
            if (response) {
              this.user = response;
              this.auth = true;
              this.setBooleanValue(this.auth);
            }
            resolve();
          },
          error: () => {
            this.auth = false;
            this.user = {};
            this.setBooleanValue(false);
            resolve();
          },
        });
      } else {
        this.auth = false;
        this.user = {};
        this.setBooleanValue(false);
        resolve();
      }
    });
  }
  refreshToken(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const REFRESH_TOKEN = localStorage.getItem(environment.refreshToken);

      if (!REFRESH_TOKEN) {
        this.tokenClear();
        reject(new Error('No refresh token found.'));
        return;
      }

      this.requestService.requestData<any>(`/api/token/refresh/`, 'POST', { refresh: REFRESH_TOKEN }).subscribe({
        next: (response: any) => {
          this.tokenHandle(response);
          resolve(response);
        },
        error: (err) => {
          this.tokenClear();
          reject(err);
        },
      });
    });
  }
  tokenHandle(data: any) {
    localStorage.setItem(environment.accessToken, data.access);
    if (data.refresh) localStorage.setItem(environment.refreshToken, data.refresh);
  }
  tokenClear() {
    localStorage.removeItem(environment.refreshToken);
    localStorage.removeItem(environment.accessToken);
    this.auth = false;
    this.user = {};
    this.setBooleanValue(false);
  }
  logout() {
    localStorage.removeItem(environment.accessToken);
    localStorage.removeItem(environment.refreshToken);
    let currentPath = this.location.path();
    if (currentPath.includes('/profile')) {
      this.router.navigate(['/']).then(() => {});
    }
    this.authHandler().then(() => {});
  }
}
