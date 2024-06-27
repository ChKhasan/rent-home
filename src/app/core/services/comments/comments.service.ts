import {Injectable} from '@angular/core';
import {debounceTime, distinctUntilChanged, map, Observable} from "rxjs";
import {environment} from "@environments";
import {CommentPayload,CommentResponse} from "@services/interfaces";
import {HttpClient, HttpParams, HttpResponse} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class CommentsService {

  constructor(private _httpsClient: HttpClient) {
  }

  get(params: HttpParams): Observable<CommentResponse[]> {
    return this._httpsClient
      .get<CommentResponse[]>(environment.urls.GET_COMMENTS, {params: params})
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
      );
  }

  post(payload: CommentPayload): Observable<CommentPayload[] | null> {
    return this._httpsClient
      .post<CommentPayload[]>(environment.authUrls.POST_COMMENTS, payload, {observe: 'response'})
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        map((response: HttpResponse<CommentPayload[]>) => response.body)
      );
  }

  delete(payload: { id: number }): Observable<CommentPayload[]> {
    return this._httpsClient
      .delete<CommentPayload[]>(environment.authUrls.DELETE_COMMENTS + '/' + payload.id)
      .pipe(
        debounceTime(300),
      );
  }
}
