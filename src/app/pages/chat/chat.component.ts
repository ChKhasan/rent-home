import { AfterViewInit, Component, DestroyRef, ElementRef, OnInit, QueryList, ViewChild, ViewChildren, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { NavigationExtras, Router, RouterLink } from '@angular/router';
import { ChatUserListComponent } from '@components/profile/chat-user-list/chat-user-list.component';
import { FormsModule } from '@angular/forms';
import { IMessage, IMessageObj, IUserRooms } from '@services/interfaces';
import { QueryService } from '@services/query';
import { AuthService } from '@services/auth';
import { ChatService } from '@services/chat';
import { debounceTime, finalize, fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChatUrlService } from '@/core/services/chatUrl/chatUrl.service';
import { LucideArrowLeft, LucideMessageCircle, LucideSendHorizontal } from '@lucide/angular';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    RouterLink,
    SkeletonModule,
    ChatUserListComponent,
    DatePipe,
    FormsModule,
    NgClass,
    NgTemplateOutlet,
    LucideArrowLeft,
    LucideMessageCircle,
    LucideSendHorizontal
],
  templateUrl: './chat.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit, AfterViewInit {
  @ViewChildren('childRef') childRefs!: QueryList<ElementRef>;
  @ViewChild('parentDiv') parentDiv!: ElementRef;
  public messages: IMessage[] = [];
  public pendingMessages: any = [];
  public loading: boolean = false;
  public loadingRooms: boolean = false;
  public message: string = '';
  public dateFormat: string = 'dd.MM.YYYY HH:mm';
  public topDateFormat: string = 'dd.MM.yyyy';
  public url: string = '';
  public loadingMessages: boolean = false;
  public skeletonList = [1, 2, 3, 4, 1, 2, 3];
  public isRoom: any = {};
  public userRooms: any = [];
  public allUserRooms: any = [];
  public newGroup: boolean = false;
  public showBoard: boolean = false;
  public showDate: boolean = false;
  public scrollingCurrentDate: string = '';
  public showList = false;
  public emptyQuery = true;
  public invalidRoom = false;
  public remoteTyping = false;
  private socketEventsBound = false;
  private typingActive = false;
  private typingStopTimer?: ReturnType<typeof setTimeout>;
  private remoteTypingTimer?: ReturnType<typeof setTimeout>;

  constructor(
    public authService: AuthService,
    private chatService: ChatService,
    private queryService: QueryService,
    private router: Router,
    private destroyRef: DestroyRef,
    private chatUrlService: ChatUrlService,
  ) {
    this.destroyRef.onDestroy(() => {
      this.stopLocalTyping();
      if (this.remoteTypingTimer) clearTimeout(this.remoteTypingTimer);
    });
  }

  get canSend(): boolean {
    return this.message.trim().length > 0 && !this.invalidRoom && !!this.getReceiverId();
  }

  private isMobileViewport(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= 768;
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.emptyQuery = !Object.keys(this.queryService.activeQueryList()).length;
      const query = this.queryService.activeQueryList();
      if (!('userId' in query) && !('roomId' in query)) this.updateShowList();
      this.authService.getBooleanValue().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
        if (value) this.firstConnection();
      });
    }
  }

  userSearch = (name: string) => {
    this.userRooms = this.allUserRooms.filter((elem: any) => elem.user && elem.user.name.toLocaleUpperCase().includes(name.toLocaleUpperCase()));
  };

  firstConnection() {
    if (!this.socketEventsBound) {
      this.socketEventsBound = true;
      this.chatService
        .onMessage()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((message) => this.commandController(message));
    }
    this.__GET_USER_ROOMS();
  }

  __GET_USER_ROOMS() {
    this.loadingRooms = true;
    this.chatService
      .getUserRooms()
      .pipe(
        finalize(() => (this.loadingRooms = false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IUserRooms[]) => {
        if (response.length > 0) {
          this.userRooms = this.chatService.prepareRooms(
            response.filter((item: any) => item.users.some((user: any) => user.id !== this.authService.user?.id)),
            this.authService.user.id,
          );
          this.allUserRooms = [...this.userRooms];
          this.chatService.userRooms = [...this.userRooms];
        } else {
          this.showList = this.isMobileViewport();
          this.userRooms = [];
          this.allUserRooms = [];
          this.chatService.userRooms = [];
        }
        this.findCurrentRoom();
        },
        error: () => {
          this.userRooms = [];
          this.allUserRooms = [];
          this.findCurrentRoom();
        },
      });
  }

  findCurrentRoom() {
    const query = this.queryService.activeQueryList();
    const userId = Number(query['userId']);
    const roomId = Number(query['roomId']);
    const room = this.userRooms.find((item: any) => item.user?.id === userId);

    this.invalidRoom = false;
    if (userId) {
      if (userId === this.authService.user.id) {
        this.setInvalidRoom();
      } else if (room) {
        this.isRoom = room;
        this.roomIdMergeQuery(room);
      } else {
        const recipient = this.chatUrlService.getRecipient(userId);
        if (!recipient) {
          this.setInvalidRoom();
          return;
        }
        this.isRoom = { id: null, user: recipient, users: [recipient], messages: [] };
        this.messages = [];
        this.loadingMessages = false;
      }
      return;
    }

    if (roomId) {
      const selectedRoom = this.userRooms.find((item: any) => item.id === roomId);
      if (!selectedRoom) {
        this.setInvalidRoom();
        return;
      }
      this.isRoom = selectedRoom;
      Promise.resolve().then(() => this.__GET_MESSAGES());
      return;
    }

    this.isRoom = this.userRooms[0] || {};
    if (this.isRoom?.id) this.roomIdMergeQuery(this.isRoom);
  }

  private setInvalidRoom(): void {
    this.invalidRoom = true;
    this.isRoom = {};
    this.messages = [];
    this.loadingMessages = false;
    if (this.isMobileViewport() && this.userRooms.length) this.showList = true;
  }

  roomIdMergeQuery(room: any) {
    if (!room?.id) return;
    let navigationExtras: NavigationExtras = {
      queryParams: { roomId: room.id },
    };
    this.router.navigate([], navigationExtras).then(() => {
      Promise.resolve().then(() => this.__GET_MESSAGES());
    });
  }

  sendMessage(): void {
    const receiver = this.getReceiverId();
    const text = this.message.trim();
    if (!this.authService.auth || !this.authService.user.id || !receiver || !text || this.invalidRoom) return;

    const clientId = `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const pendingMessage = {
      created_at: new Date().toISOString(),
      client_id: clientId,
      is_read: false,
      message: text,
      receiver,
      room: this.isRoom?.id || null,
      sender: this.authService.user.id,
      pending: true,
      error: '',
    };
    this.pendingMessages.push(pendingMessage);
    this.loading = true;
    this.message = '';
    this.stopLocalTyping();
    if (!this.socketSender({ message: text, receiver, client_id: clientId })) {
      this.handleSocketError({ client_id: clientId, message: 'Ulanish uzildi. Qayta urinib ko‘ring.' });
    }
  }

  private getReceiverId(): number | null {
    const receiver = Number(this.queryService.activeQueryList()['userId']) || Number(this.isRoom?.user?.id);
    return receiver && receiver !== this.authService.user?.id ? receiver : null;
  }

  socketSender(data: any): boolean {
    return this.chatService.send(data);
  }

  commandController(message: any) {
    switch (message.type) {
      case 'chat_message':
        this.addMessage(message.message);
        break;
      case 'group_created':
        this.createGroup(message.message);
        break;
      case 'online':
        this.userOnlineOffline(message);
        break;
      case 'offline':
        this.userOnlineOffline(message);
        break;
      case 'read':
        this.handleReadMessages(message);
        break;
      case 'typing':
        this.handleTyping(message.message);
        break;
      case 'error':
        this.handleSocketError(message);
        break;
    }
  }

  userOnlineOffline(message: any) {
    let currentRoom = this.userRooms.find((elem: any) => {
      return elem.users.find((item: any) => item.id === message.message.user_id);
    });
    if (!currentRoom) return;
    let currentUser = currentRoom.users.find((item: any) => item.id === message.message.user_id);
    if (!currentUser) return;
    currentUser.is_online = message.type === 'online';
  }

  createGroup(message: any) {
    const newGroup = this.chatService.upsertRoom(message, this.authService.user.id);
    this.isRoom = newGroup;
    this.newGroup = true;
    if (this.queryService.activeQueryList()['userId']) this.removeNewUserInUrl(this.isRoom);
    this.chatUrlService.clearRecipient();
    this.userRooms = [...this.chatService.userRooms];
    this.allUserRooms = [...this.userRooms];
  }

  removeNewUserInUrl(isRoom: IUserRooms) {
    let urlTree = this.router.parseUrl(this.router.url);
    delete urlTree.queryParams['userId'];
    urlTree.queryParams['roomId'] = isRoom.id;
    let navigationExtras: NavigationExtras = {
      queryParams: urlTree.queryParams,
    };
    this.router.navigate([], navigationExtras);
  }

  addMessage(message: any) {
    this.chatService.touchRoom(message, this.authService.user.id);
    this.userRooms = [...this.chatService.userRooms];
    this.allUserRooms = [...this.userRooms];
    if (message.client_id) {
      this.pendingMessages = this.pendingMessages.filter((item: any) => item.client_id !== message.client_id);
    }
    this.loading = this.pendingMessages.some((item: any) => item.pending);
    const activeRoomId = Number(this.queryService.activeQueryList()['roomId']) || Number(this.isRoom?.id);
    if (activeRoomId === message.room) {
      if (!this.messages.some((item) => item.id === message.id)) this.messages.unshift(message);
      this.scrollToTop();
      this.readNewMessage(message);
      const activeRoom = this.userRooms.find((room: any) => room.id === message.room);
      if (activeRoom && message.receiver === this.authService.user.id) activeRoom.unread_count = 0;
    } else {
      let curentRoom = this.userRooms.find((elem: any) => elem.id === message.room);
      if (!curentRoom) return;
      curentRoom.message = message.message;
      curentRoom.messages = [message, ...(curentRoom.messages || [])];
    }
  }

  private handleSocketError(message: any): void {
    const pending = this.pendingMessages.find((item: any) => item.client_id === message.client_id);
    if (!pending) return;
    pending.pending = false;
    pending.error = message.message || 'Xabar yuborilmadi.';
    this.loading = this.pendingMessages.some((item: any) => item.pending);
  }

  retryPending(pending: any): void {
    this.pendingMessages = this.pendingMessages.filter((item: any) => item.client_id !== pending.client_id);
    this.message = pending.message;
    this.sendMessage();
  }

  onMessageInput(value: string = this.message): void {
    if (!this.isRoom?.id || !this.getReceiverId()) return;
    if (!value.trim()) {
      this.stopLocalTyping();
      return;
    }
    if (!this.typingActive) {
      this.typingActive = true;
      this.sendTyping(true);
    }
    if (this.typingStopTimer) clearTimeout(this.typingStopTimer);
    this.typingStopTimer = setTimeout(() => this.stopLocalTyping(), 3000);
  }

  onComposerKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;
    event.preventDefault();
    this.sendMessage();
  }

  private sendTyping(isTyping: boolean): void {
    const receiver = this.getReceiverId();
    if (!receiver || !this.isRoom?.id) return;
    this.socketSender({ type: 'typing', receiver, is_typing: isTyping });
  }

  private stopLocalTyping(): void {
    if (this.typingStopTimer) clearTimeout(this.typingStopTimer);
    this.typingStopTimer = undefined;
    if (!this.typingActive) return;
    this.typingActive = false;
    this.sendTyping(false);
  }

  private handleTyping(message: any): void {
    if (message?.room_id !== this.isRoom?.id || message.sender !== this.isRoom?.user?.id) return;
    this.remoteTyping = !!message.is_typing;
    if (this.remoteTypingTimer) clearTimeout(this.remoteTypingTimer);
    if (this.remoteTyping) {
      this.remoteTypingTimer = setTimeout(() => (this.remoteTyping = false), 4000);
    }
  }

  handlerRoom = (room: IUserRooms) => {
    if (!room?.id) return;
    let navigationExtras: NavigationExtras = {
      queryParams: { roomId: room.id },
    };
    this.router.navigate([], navigationExtras).then(() => {
      this.__GET_MESSAGES();
    });
    this.isRoom = room;
    this.invalidRoom = false;
    this.remoteTyping = false;
    this.toggleUsersList(false);
  };
  __GET_MESSAGES = () => {
    let id = Number(this.queryService.activeQueryList()['roomId']);
    if (id) {
      this.loadingMessages = true;
      this.chatService
        .getMessages(id)
        .pipe(
          finalize(() => (this.loadingMessages = false)),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: (response: IMessageObj) => {
          this.invalidRoom = false;
          let isFirstUnread = false;
          this.messages = response.messages
            .map((elem: any) => {
              if (!elem.is_read && !isFirstUnread && elem.sender !== this.authService.user.id) {
                isFirstUnread = true;
                return {
                  ...elem,
                  is_first: true,
                };
              } else {
                return {
                  ...elem,
                  is_first: false,
                };
              }
            })
            .reverse();
          if (this.messages.length > 0)
            setTimeout(() => {
              this.scrollCall();
            }, 0);
          },
          error: () => this.setInvalidRoom(),
        });
    }
  };

  ngAfterViewInit() {
    if (this.parentDiv) {
      const scroll$ = fromEvent(this.parentDiv.nativeElement, 'scroll');
      scroll$.pipe(debounceTime(1000), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.onParentDivScrolled();
      });
    }
  }
  private lastScrollTop = 0;
  private scrollAccess = true;

  onParentDivScrolled(): void {
    const container = this.parentDiv.nativeElement;
    const currentScrollTop = container.scrollTop;
    if (currentScrollTop < this.lastScrollTop) {
      this.showDate = true;
      this.checkVisibleItems();
    } else {
      this.showDate = false;
    }

    this.lastScrollTop = currentScrollTop;
    if (this.scrollAccess) setTimeout(() => this.scrollCall(), 1000);
    this.scrollAccess = false;
  }

  readNewMessage(message: any) {
    if (!message.is_read && message.sender !== this.authService.user.id) {
      const data = {
        type: 'read',
        receiver: message.receiver,
        sender: message.sender,
        ids: [message.id],
        room_id: this.isRoom.id,
      };
      this.socketSender(data);
    }
  }
  private checkVisibleItems() {
    const container = this.parentDiv.nativeElement;
    const items = container.querySelectorAll('.message-item');
    const visibleDataInfo: string[] = [];
    items.forEach((item: HTMLElement) => {
      const rect = item.getBoundingClientRect();

      if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
        visibleDataInfo.push(item.getAttribute('data-info') as string);
      }
    });
    if (!visibleDataInfo.length) return;
    const dates = visibleDataInfo.map((dateStr) => new Date(dateStr));

    const minDate = new Date(Math.min(...dates.map((date) => date.getTime())));
    this.scrollingCurrentDate = minDate.toISOString();
  }
  scrollCall() {
    const unreadMessage = this.parentDiv.nativeElement.querySelector('.unread');
    const parentDivRect = this.parentDiv.nativeElement.getBoundingClientRect();
    let unreads = this.messages.filter((elem: any) => !elem.is_read && elem.sender !== this.authService.user.id);
    let unreadMessageIds: any[] = [];
    unreads.forEach((item: any) => {
      const unreadMessage = this.parentDiv.nativeElement.querySelector('#child_' + item.id);
      const unreadMessageRect = unreadMessage?.getBoundingClientRect();
      const scrollTopOffset = unreadMessageRect.top - parentDivRect.top;
      if (scrollTopOffset - this.parentDiv.nativeElement.offsetHeight < 0) {
        if (!unreadMessageIds.find((elem: any) => elem.id === item.id)) unreadMessageIds.push(item);
      }
    });
    if (unreadMessageIds.length > 0) {
      const data = {
        type: 'read',
        receiver: unreadMessageIds[0].receiver,
        sender: unreadMessageIds[0].sender,
        ids: unreadMessageIds.map((elem: any) => elem.id),
        room_id: this.isRoom.id,
      };
      this.socketSender(data);
    }
    this.scrollAccess = true;
  }

  handleReadMessages(message: any) {
    let room = this.userRooms.find((elem: any) => elem.id === message.message.room_id);
    this.unreadToRead(message, this.messages, true);
    if (room) {
      this.unreadToRead(message, room.messages || [], false);
      room.unread_count = 0;
    }
  }

  unreadToRead(message: any, rooms: any, userAccess: boolean) {
    rooms.forEach((elem: any) => {
      let access = userAccess ? elem.sender === this.authService.user.id : elem.sender !== this.authService.user.id;
      if (!elem.is_read && access) {
        if (message.message.room_id === this.isRoom.id) {
          if (message.message.ids.includes(elem.id)) {
            elem.is_read = true;
          }
        }
      }
    });
  }

  toggleUsersList = (value: boolean) => {
    this.showList = value;
  };

  @ViewChild('scrollableDiv') scrollableDiv!: ElementRef;

  scrollToTop() {
    if (this.scrollableDiv?.nativeElement) this.scrollableDiv.nativeElement.scrollTop = 0;
  }
  compareDate(arg1?: string, arg2?: string) {
    const date = new Date();
    let date1 = new Date(arg1 || date).getTime();
    let date2 = new Date(arg2 || date).getTime();
    let day1 = Math.floor(date1 / 86400000);
    let day2 = Math.floor(date2 / 86400000);

    return day1 > day2;
  }

  private updateShowList(): void {
    this.showList = this.isMobileViewport();
  }
  toBack() {
    if (this.userRooms.length && this.isMobileViewport()) {
      this.showList = true;
      return;
    }
    void this.router.navigate(['/profile']);
  }
  getUnreadMessageCount(messages: any): string {
    return messages && messages.length > 0 ? String(messages.filter((elem: any) => !elem.is_read && elem.sender !== this.authService.user.id).length) : '0';
  }
}
