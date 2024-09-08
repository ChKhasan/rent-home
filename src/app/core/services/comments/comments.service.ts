import { Injectable } from '@angular/core';
import { debounceTime, distinctUntilChanged, map, Observable } from 'rxjs';
import { environment } from '@environments';
import { IcommentList, ICommentResquestBody } from '@services/interfaces';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  constructor(private _httpsClient: HttpClient) {}

  get(params: HttpParams): Observable<IcommentList> {
    return this._httpsClient.get<IcommentList>(environment.urls.GET_COMMENTS, { params: params }).pipe(debounceTime(300), distinctUntilChanged());
  }

  post(payload: ICommentResquestBody): Observable<IcommentList | null> {
    return this._httpsClient
      .post<IcommentList>(environment.authUrls.POST_COMMENTS, payload, {
        observe: 'response',
      })
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        map((response: HttpResponse<IcommentList>) => response.body),
      );
  }

  delete(payload: { id: number }): Observable<IcommentList> {
    return this._httpsClient.delete<IcommentList>(environment.authUrls.DELETE_COMMENTS + '/' + payload.id).pipe(debounceTime(300));
  }
}
