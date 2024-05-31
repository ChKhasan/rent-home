import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {UserInfo} from "../../interfaces/common.interface";
import {environment} from "../../../../environments/environment";
import {Location} from "@angular/common";
import {Router} from "@angular/router";
import {RequestService} from "../request/request.service";

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
    private location: Location,
    private router: Router,
    private requestService: RequestService
  ) {
  }

  authHandler() {
    return new Promise<void>((resolve, reject) => {
      const AUTH_TOKEN = localStorage.getItem(environment.accessToken);
      Boolean(AUTH_TOKEN) ?
        this.requestService.getData<UserInfo>(environment.authUrls.GET_ME)
          .subscribe((response: UserInfo) => {
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
    if (currentPath.includes('/profile')) {
      this.router.navigate(['/']).then(() => {})
    }
    this.authHandler().then(() => {})
  }
}
