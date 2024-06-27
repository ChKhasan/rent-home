import { Injectable } from '@angular/core';
import {WebSocketSubject} from "rxjs/internal/observable/dom/WebSocketSubject";
import {webSocket} from "rxjs/webSocket";
import {Observable} from "rxjs";
import {environment} from "@environments";

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
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
}
