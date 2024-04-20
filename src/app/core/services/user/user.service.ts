import {Injectable} from '@angular/core';
// import {HttpClient} from "@angular/common/http";
// import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private authTokenKey = 'authToken';
  public data: any

  private getAuthToken(): string | null {
    return localStorage.getItem(this.authTokenKey);
  }

  // constructor(private _httpsClient: HttpClient) {
  // }

  get(): void{
    console.log("123435",this.getAuthToken())
    // return this._httpsClient.get<T>(`https://api.rent-home.uz/api/users/me`,{
    //   headers: { Authorization: `Bearer ${this.getAuthToken}` }
    // });

  }


}
