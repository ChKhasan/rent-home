import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {debounceTime, distinctUntilChanged, finalize, Observable} from "rxjs";
import {IMessageObj, IUserRooms, UserImages} from "../../interfaces/common.interface";
import {environment} from "../../../../environments/environment";
import {WebSocketService} from "../webSocket/web-socket.service";

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
  webSocketConnection = () => {
    this.webSocketService.connect(`wss://api.rent-home.uz/ws/chat/`);

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
