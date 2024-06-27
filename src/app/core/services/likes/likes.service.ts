import {Injectable} from '@angular/core';
import {
  HttpClient,
  HttpResponse,
} from "@angular/common/http";
import {debounceTime, distinctUntilChanged, map, Observable} from "rxjs";
import {environment} from "@environments";
import {Announcement, Likes} from "@services/interfaces";

@Injectable({
  providedIn: 'root'
})
export class LikesService {

  public likes: any = []
  constructor(
    private _httpsClient: HttpClient,
  ) { };
  likeHandle(payload: number) {
    let oldLikes = JSON.parse(localStorage.getItem(environment.storeLikes) as string) || [];
    if (!oldLikes.includes(payload)) {
      oldLikes.push(payload);
      localStorage.setItem(environment.storeLikes, JSON.stringify(oldLikes));
    } else {
      oldLikes = oldLikes.filter((item: any) => item != payload);
      localStorage.setItem(environment.storeLikes, JSON.stringify(oldLikes));
    }
    this.likes = oldLikes;
  }
  reloadLikes() {
    this.likes = JSON.parse(localStorage.getItem(environment.storeLikes) as string) || [];
  }
  handleUserLikes(payload: Likes) {
    this.likes = payload;
  }
  get(): Observable<any> {
    return this._httpsClient
      .get<any>(environment.authUrls.GET_LIKES)
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
      );
  }
  post(payload: { announcement: number }): Observable<Announcement[] | null> {
    return this._httpsClient
      .post<Announcement[]>(environment.authUrls.POST_LIKES,payload,{ observe: 'response' })
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        map((response: HttpResponse<Announcement[]>) => response.body)
      );
  }
  delete(payload: { id: number }): Observable<Announcement[]> {
    return this._httpsClient
      .delete<Announcement[]>(environment.authUrls.DELETE_LIKES + '/' + payload.id)
      .pipe(
        debounceTime(300),
      );
  }
}
