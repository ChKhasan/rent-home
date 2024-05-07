import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {debounceTime, distinctUntilChanged, finalize, Observable} from "rxjs";
import {IMessageObj, IUserRooms, UserImages} from "../../interfaces/common.interface";
import {environment} from "../../../../environments/environment";
import {WebSocketService} from "../webSocket/web-socket.service";
import {WebSocketSubject} from "rxjs/internal/observable/dom/WebSocketSubject";
import {webSocket} from "rxjs/webSocket";

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  public userRooms: any = [];
  public loading: boolean = true
  constructor(
    private _httpsClient: HttpClient,
    private webSocketService: WebSocketService
  ) { }
  private socket$!: WebSocketSubject<any>;
  public connect(url: string): void {
    const token = localStorage.getItem(environment.accessToken);
    if(token)
      this.socket$ = webSocket(`${url}?token=${token}`);
  }

  public send(data: any): void {
    this.socket$.next(data);
  }

  public onMessage(): Observable<any> {
    return this.socket$.asObservable();
  }

  public disconnect(): void {
    if(this.socket$)
      this.socket$.complete(); // Close the connection
  }
  webSocketConnection = () => {
    this.connect(`wss://api.rent-home.uz/ws/chat/`);
  }

  __GET_USER_ROOMS() {
    this.getUserRooms().pipe(finalize(() => this.loading = false)).subscribe((response) => {
      this.userRooms = response.map((elem: any) => {
        return {
          ...elem,
          message: elem.messages.length > 0 ? elem.messages[elem.messages.length - 1].message:'',
          user: elem.users[0]
        }
      })
    })
  }

  getUserRooms(): Observable<IUserRooms[]> {
    return this._httpsClient
      .get<IUserRooms[]>(environment.authUrls.GET_USERROOMS)
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
      );
  }
  getMessages(id: number | string | null): Observable<IMessageObj> {
    return this._httpsClient
      .get<IMessageObj>(environment.authUrls.GET_USERMESSAGES + id)
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
      );
  }
}
