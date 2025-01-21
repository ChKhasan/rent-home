import { AfterViewInit, Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MyAnnouncementsCardComponent } from '@components/cards/my-announcements-card/my-announcements-card.component';
import { DatePipe, NgClass, NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import { PaginationComponent } from '@components/pagination/pagination.component';
import { SkeletonModule } from 'primeng/skeleton';
import { NavigationExtras, Router, RouterLink } from '@angular/router';
import { ChatUserListComponent } from '@components/profile/chat-user-list/chat-user-list.component';
import { AuthDialogComponent } from '@components/modals/auth-dialog/auth-dialog.component';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { RegisterDialogComponent } from '@components/modals/register-dialog/register-dialog.component';
import { IMessage, IMessageObj, IUserRooms } from '@services/interfaces';
import { QueryService } from '@services/query';
import { AuthService } from '@services/auth';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { ChatService } from '@services/chat';
import { debounceTime, finalize, fromEvent } from 'rxjs';
import { TabComponent } from '@components/profile/tab/tab.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [DialogModule, NgForOf, NgIf, SkeletonModule, ChatUserListComponent, ButtonModule, DatePipe, FormsModule, BadgeModule, ToastModule, RippleModule, AvatarModule, NgClass, NgTemplateOutlet],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
  animations: [trigger('slideInOut', [transition(':enter', [style({ transform: 'translateX(100%)' }), animate('200ms ease-in', style({ transform: 'translateX(0%)' }))]), transition(':leave', [animate('200ms ease-in', style({ transform: 'translateX(100%)' }))])])],
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
  public topDateFormat: string = 'dd MMMM';
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
  constructor(public authService: AuthService, private chatService: ChatService, private queryService: QueryService, private router: Router) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      if (!('userId' in this.queryService.activeQueryList())) this.updateShowList();
      this.authService.getBooleanValue().subscribe((value) => {
        if (value) this.firstConnection();
      });
    }
  }

  userSearch = (name: string) => {
    this.userRooms = this.allUserRooms.filter((elem: any) => elem.user && elem.user.name.toLocaleUpperCase().includes(name.toLocaleUpperCase()));
  };

  firstConnection() {
    setTimeout(() => {
      this.chatService.onMessage().subscribe((message) => {
        this.loading = false;
        this.commandController(message);
      });
    }, 100);
    this.__GET_USER_ROOMS();
  }

  __GET_USER_ROOMS() {
    this.loadingRooms = true;
    this.chatService
      .getUserRooms()
      .pipe(finalize(() => (this.loadingRooms = false)))
      .subscribe((response: IUserRooms[]) => {
        if (response.length > 0) {
          this.userRooms = response
            .filter((item: any) => item.users.find((elem: any) => elem.id !== this.authService.user?.id)?.id && item.users.find((elem: any) => elem.id !== this.authService.user?.id)?.id !== this.authService.user.id)
            .map((elem: IUserRooms) => {
              return {
                ...elem,
                message: elem.messages.length > 0 ? elem.messages[elem.messages.length - 1].message : '',
                user: elem.users.find((elem: any) => elem.id !== this.authService.user.id),
              };
            });
          this.allUserRooms = [...this.userRooms];
        }
        if (this.userRooms.length) this.findCurrentRoom();
      });
  }

  findCurrentRoom() {
    let room = this.userRooms.find((elem: any) => elem.users.find((elem: any) => elem.id !== this.authService.user?.id)?.id === Number(this.queryService.activeQueryList()['userId']));
    if (this.queryService.activeQueryList()['userId'] && !room) {
      this.loadingMessages = false;
      return;
    }
    if (!this.queryService.activeQueryList()['roomId']) {
      this.isRoom = room || this.userRooms[0];
      this.roomIdMergeQuery(this.isRoom);
    } else {
      this.isRoom = this.userRooms.find((elem: any) => elem.id === Number(this.queryService.activeQueryList()['roomId']));
      Promise.resolve().then(() => this.__GET_MESSAGES());
    }
  }

  roomIdMergeQuery(room: any) {
    let navigationExtras: NavigationExtras = {
      queryParams: { roomId: room.id },
    };
    this.router.navigate([], navigationExtras).then(() => {
      Promise.resolve().then(() => this.__GET_MESSAGES());
    });
  }

  sendMessage(): void {
    let receiver = Number(this.queryService.activeQueryList()['userId']) || this.isRoom.user.id;
    if (this.authService.auth && this.authService.user.id && this.message.length > 0 && (this.userRooms.length || receiver)) {
      this.loading = true;
      this.pendingMessages.push({
        created_at: `${new Date()}`,
        id: 1,
        is_read: false,
        message: this.message,
        receiver: this.isRoom.id,
        room: this.isRoom.receiver,
        sender: this.authService.user.id,
        pending: true,
      });
      const data = { message: this.message, receiver: receiver };
      this.socketSender(data);
      this.message = '';
    } else {
    }
  }

  socketSender(data: any) {
    this.chatService.send(data);
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
    }
  }

  userOnlineOffline(message: any) {
    let currentRoom = this.userRooms.find((elem: any) => {
      return elem.users.find((item: any) => item.id === message.message.user_id);
    });
    let currentUser = currentRoom.users.find((item: any) => item.id === message.message.user_id);
    currentUser.is_online = message.type === 'online';
  }

  createGroup(message: any) {
    let newGroup = {
      ...message,
      message: '',
      user: message.users.find((elem: any) => elem.id !== this.authService.user.id),
    };
    this.isRoom = newGroup;
    this.newGroup = true;
    if (this.queryService.activeQueryList()['userId']) this.removeNewUserInUrl(this.isRoom);
    this.userRooms.unshift(newGroup);
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
    this.userRooms = this.userRooms.map((elem: any) => {
      if (elem.id === message.room) {
        return {
          ...elem,
          message: message.message || 'message',
        };
      } else {
        return elem;
      }
    });
    this.pendingMessages = [];
    if (Number(this.queryService.activeQueryList()['roomId']) === message.room) {
      this.messages.unshift(message);
      this.scrollToTop();
      this.readNewMessage(message);
    } else {
      let curentRoom = this.userRooms.find((elem: any) => elem.id === message.room);
      curentRoom.message = message.message;
      curentRoom.messages.unshift(message);
    }
  }

  handlerRoom = (room: IUserRooms) => {
    let navigationExtras: NavigationExtras = {
      queryParams: { roomId: room.id },
    };
    this.router.navigate([], navigationExtras).then(() => {
      this.__GET_MESSAGES();
    });
    this.isRoom = room;
    this.toggleUsersList(false);
  };
  __GET_MESSAGES = () => {
    let id = Number(this.queryService.activeQueryList()['roomId']);
    if (id) {
      this.loadingMessages = true;
      this.chatService
        .getMessages(id)
        .pipe(finalize(() => (this.loadingMessages = false)))
        .subscribe((response: IMessageObj) => {
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
        });
    }
  };

  ngAfterViewInit() {
    if (this.parentDiv) {
      const scroll$ = fromEvent(this.parentDiv.nativeElement, 'scroll');
      scroll$.pipe(debounceTime(1000)).subscribe(() => {
        this.onParentDivScrolled();
      });
    }
  }
  private lastScrollTop = 0;
  @HostListener('scroll', ['$event'])
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

      // Проверяем, находится ли элемент в видимой области
      if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
        visibleDataInfo.push(item.getAttribute('data-info') as string);
      }
    });
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
    this.unreadToRead(message, room.messages, false);
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
    this.scrollableDiv.nativeElement.scrollTop = 0;
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
    this.showList = window.innerWidth < 576;
  }
}
