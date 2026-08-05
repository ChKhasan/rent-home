import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, finalize, Observable, Subject, Subscription } from 'rxjs';
import { IMessage, IMessageObj, IUserRooms } from '@services/interfaces';
import { environment } from '@environments';
import { WebSocketSubject } from 'rxjs/internal/observable/dom/WebSocketSubject';
import { webSocket } from 'rxjs/webSocket';
import { RequestService } from '@services/request';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  public userRooms: any[] = [];
  public loading: boolean = true;
  constructor(
    private _httpsClient: HttpClient,
    private requestService: RequestService,
  ) {}
  private socket$?: WebSocketSubject<any>;
  private socketSubscription?: Subscription;
  private readonly messages$ = new Subject<any>();

  public connect(url: string): void {
    const token = localStorage.getItem(environment.accessToken);
    if (!token || (this.socket$ && !this.socket$.closed)) return;

    this.socket$ = webSocket(`${url}?token=${token}`);
    this.socketSubscription = this.socket$.subscribe({
      next: (message) => this.messages$.next(message),
      error: () => this.resetSocket(),
      complete: () => this.resetSocket(),
    });
  }

  public send(data: any): boolean {
    if (!this.socket$ || this.socket$.closed) return false;
    this.socket$.next(data);
    return true;
  }

  public onMessage(): Observable<any> {
    return this.messages$.asObservable();
  }

  public disconnect(): void {
    const socket = this.socket$;
    this.socket$ = undefined;
    if (socket && !socket.closed) socket.complete();
    this.socketSubscription?.unsubscribe();
    this.socketSubscription = undefined;
  }

  public clearRooms(): void {
    this.userRooms = [];
    this.loading = true;
  }

  private resetSocket(): void {
    this.socketSubscription?.unsubscribe();
    this.socketSubscription = undefined;
    this.socket$ = undefined;
  }
  webSocketConnection = () => {
    this.connect(`${environment.wsBaseUrl}/ws/chat/`);
  };

  __GET_USER_ROOMS(currentUserId?: number) {
    this.requestService
      .getData<IUserRooms[]>(environment.authUrls.GET_USERROOMS)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((response: IUserRooms[]) => {
        this.userRooms = this.prepareRooms(response, currentUserId);
      });
  }

  prepareRooms(rooms: IUserRooms[], currentUserId?: number): any[] {
    return rooms
      .map((room) => ({
        ...room,
        message: room.last_message?.message ?? room.messages.at(-1)?.message ?? '',
        unread_count: room.unread_count ?? this.countUnread(room.messages, currentUserId),
        user: room.users.find((user: any) => user.id !== currentUserId),
      }))
      .sort((left, right) => this.roomActivity(right) - this.roomActivity(left));
  }

  upsertRoom(room: any, currentUserId?: number): any {
    const normalized = this.prepareRooms([room], currentUserId)[0];
    this.userRooms = [normalized, ...this.userRooms.filter((item) => item.id !== normalized.id)];
    return normalized;
  }

  touchRoom(message: IMessage, currentUserId?: number): void {
    const room = this.userRooms.find((item) => item.id === message.room);
    if (!room) return;
    const updated = {
      ...room,
      message: message.message,
      last_message: message,
      unread_count: message.receiver === currentUserId
        ? Number(room.unread_count || 0) + 1
        : Number(room.unread_count || 0),
    };
    this.userRooms = [updated, ...this.userRooms.filter((item) => item.id !== message.room)];
  }

  private countUnread(messages: IMessage[], currentUserId?: number): number {
    return messages.filter((message) => !message.is_read && message.receiver === currentUserId).length;
  }

  private roomActivity(room: IUserRooms): number {
    return new Date(room.last_message?.created_at || room.created_at || 0).getTime();
  }

  getUserRooms(): Observable<IUserRooms[]> {
    return this._httpsClient.get<IUserRooms[]>(environment.authUrls.GET_USERROOMS).pipe(debounceTime(300), distinctUntilChanged());
  }
  getMessages(id: number | string | null): Observable<IMessageObj> {
    return this._httpsClient.get<IMessageObj>(`${environment.authUrls.GET_USERMESSAGES}${id}/`).pipe(debounceTime(300), distinctUntilChanged());
  }
}
