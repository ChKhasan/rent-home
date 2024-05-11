import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {
  MyAnnouncementsCardComponent
} from "../../shared/components/cards/my-announcements-card/my-announcements-card.component";
import {DatePipe, NgClass, NgForOf, NgIf, NgTemplateOutlet} from "@angular/common";
import {PaginationComponent} from "../../shared/components/pagination/pagination.component";
import {SkeletonModule} from "primeng/skeleton";
import {NavigationExtras, Router, RouterLink} from "@angular/router";
import {ChatUserListComponent} from "../../shared/components/profile/chat-user-list/chat-user-list.component";
import {AuthDialogComponent} from "../../shared/components/modals/auth-dialog/auth-dialog.component";
import {ButtonModule} from "primeng/button";
import {FormsModule} from "@angular/forms";
import {RegisterDialogComponent} from "../../shared/components/modals/register-dialog/register-dialog.component";
import {IMessage, IMessageObj, IUserRooms} from "../../core/interfaces/common.interface";
import {QueryService} from "../../core/services/query/query.service";
import {AuthService} from "../../core/services/auth/auth.service";
import {BadgeModule} from "primeng/badge";
import {ToastModule} from "primeng/toast";
import {RippleModule} from "primeng/ripple";
import {AvatarModule} from "primeng/avatar";
import {ChatService} from "../../core/services/chat/chat.service";
import {debounceTime, finalize, fromEvent} from "rxjs";

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    MyAnnouncementsCardComponent,
    NgForOf,
    NgIf,
    PaginationComponent,
    SkeletonModule,
    RouterLink,
    ChatUserListComponent,
    AuthDialogComponent,
    ButtonModule,
    DatePipe,
    FormsModule,
    RegisterDialogComponent,
    BadgeModule,
    ToastModule,
    RippleModule,
    AvatarModule,
    NgClass,
    NgTemplateOutlet
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, AfterViewInit {
  @ViewChildren('childRef') childRefs!: QueryList<ElementRef>;
  @ViewChild('parentDiv') parentDiv!: ElementRef;
  public comments: IMessage[] = [];
  public pendingComments: any = []
  public loading: boolean = false;
  public loadingRooms: boolean = false;
  public message: string = '';
  public dateFormat: string = 'dd.MM.YYYY'
  public url: string = '';
  public loadingMessages: boolean = true
  public skeletonList = [1, 2, 3, 4, 1, 2, 3];
  public isRoom: any = {}
  public userRooms: any = [];
  public newGroup: boolean = false

  constructor(public authService: AuthService,
              private chatService: ChatService,
              private queryService: QueryService,
              private router: Router
  ) {
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.authService.getBooleanValue().subscribe((value) => {
        if (value) this.firstConnection()
      })
    }
  }

  firstConnection() {
    setTimeout(() => {
      this.chatService.onMessage().subscribe((message) => {
        this.loading = false;
        this.commandController(message);
      });
    }, 100)
    this.__GET_USER_ROOMS()
  }

  __GET_USER_ROOMS() {
    this.loadingRooms = true
    this.chatService.getUserRooms().pipe(finalize(() => this.loadingRooms = false)).subscribe((response: IUserRooms[]) => {
      if (response.length > 0)
        this.userRooms = response.filter((item: any) => item.users.find((elem: any) => elem.id !== this.authService.user?.id)?.id !== this.authService.user.id).map((elem: IUserRooms) => {
          return {
            ...elem,
            message: elem.messages.length > 0 ? elem.messages[elem.messages.length - 1].message : '',
            user: elem.users.find((elem: any) => elem.id !== this.authService.user.id)
          }
        })
      this.findCurrentRoom()
    })
  }

  findCurrentRoom() {
    let room = this.userRooms.find((elem: any) => elem.users.find((elem: any) => elem.id !== this.authService.user?.id)?.id === Number(this.queryService.activeQueryList()['userId']));
    if (this.queryService.activeQueryList()['userId'] && !room) {
      this.loadingMessages = false
      return
    }
    if (!this.queryService.activeQueryList()['roomId']) {
      this.isRoom = room || this.userRooms[0]
      this.roomIdMergeQuery(this.isRoom)
    } else {
      this.isRoom = this.userRooms.find((elem: any) => elem.id === Number(this.queryService.activeQueryList()['roomId']))
      Promise.resolve().then(() => this.__GET_MESSAGES())
    }
  }

  roomIdMergeQuery(room: any) {
    let navigationExtras: NavigationExtras = {
      queryParams: {roomId: room.id},
    };
    this.router.navigate([], navigationExtras).then(() => {
      Promise.resolve().then(() => this.__GET_MESSAGES())
    })
  }

  sendMessage(): void {
    if (this.authService.auth && this.authService.user.id && this.message.length > 0) {
      this.loading = true;
      this.pendingComments.push({
        created_at: `${new Date()}`,
        id: 1,
        is_read: false,
        message: this.message,
        receiver: this.isRoom.id,
        room: this.isRoom.receiver,
        sender: this.authService.user.id,
        pending: true
      })
      let receiver = Number(this.queryService.activeQueryList()['userId']) || this.isRoom.user.id;
      const data = {message: this.message, receiver: receiver}
      this.socketSender(data)
      this.message = ''
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
      return elem.users.find((item: any) => item.id === message.message.user_id)
    })
    let currentUser = currentRoom.users.find((item: any) => item.id === message.message.user_id)
    currentUser.is_online = message.type === 'online'
  }

  createGroup(message: any) {
    let newGroup = {
      ...message,
      message: '',
      user: message.users.find((elem: any) => elem.id !== this.authService.user.id)
    }
    this.isRoom = newGroup;
    this.newGroup = true
    if (this.queryService.activeQueryList()['userId'])
      this.removeNewUserInUrl(this.isRoom)
    this.userRooms.unshift(newGroup)
  }

  removeNewUserInUrl(isRoom: IUserRooms) {
    let urlTree = this.router.parseUrl(this.router.url);
    delete urlTree.queryParams['userId'];
    urlTree.queryParams['roomId'] = isRoom.id
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
          message: message.message || "message",
        }
      } else {
        return elem
      }
    });
    this.pendingComments = []
    if (Number(this.queryService.activeQueryList()['roomId']) === message.room) {
      this.comments.unshift(message);
      this.readNewMessage(message);
    } else {
      let curentRoom = this.userRooms.find((elem: any) => elem.id === message.room);
      curentRoom.message = message.message;
      curentRoom.messages.unshift(message)
    }
  }

  handlerRoom = (room: IUserRooms) => {
    let navigationExtras: NavigationExtras = {
      queryParams: {roomId: room.id},
    };
    this.router.navigate([], navigationExtras).then(() => {
      this.__GET_MESSAGES();
    });
    this.isRoom = room;
  }
  __GET_MESSAGES = () => {
    let id = Number(this.queryService.activeQueryList()['roomId'])
    this.loadingMessages = true
    if (id) this.chatService.getMessages(id).pipe(finalize(() => this.loadingMessages = false)).subscribe((response: IMessageObj) => {
      let isFirstUnread = false
      this.comments = response.messages.map((elem: any) => {
        if (!elem.is_read && !isFirstUnread && elem.sender !== this.authService.user.id) {
          isFirstUnread = true
          return {
            ...elem,
            is_first: true
          }
        } else {
          return {
            ...elem,
            is_first: false
          }
        }
      }).reverse();

      if (this.comments.length > 0)
        setTimeout(() => {
          this.scrollCall();
        }, 0)
    })

  }

  ngAfterViewInit() {
    if (this.parentDiv) {
      const scroll$ = fromEvent(this.parentDiv.nativeElement, 'scroll');
      scroll$.pipe(
        debounceTime(1000) // Adjust the debounce time as needed (in milliseconds)
      ).subscribe(() => {
        this.onParentDivScrolled();
      });
    }
  }

  scrollToUnreadMessages(): void {
    if (!this.parentDiv) {
      console.error("Parent container not found.");
      return;
    }
    const unreadMessage = this.parentDiv.nativeElement.querySelector('.unread');
    if (!unreadMessage) {
      console.error("Unread message element not found.");
      return;
    }
    this.parentDiv.nativeElement.scrollTop = unreadMessage.offsetTop - this.parentDiv.nativeElement.offsetTop;
  }

  @HostListener('scroll', ['$event'])
  private scrollAccess = true;

  onParentDivScrolled(): void {
    if (this.scrollAccess)
      setTimeout(() => {
        this.scrollCall()
      }, 1000)
    this.scrollAccess = false
  }
 readNewMessage(message: any) {
   if(!message.is_read && message.sender !== this.authService.user.id) {
     const data = {
       type: 'read',
       receiver: message.receiver,
       sender: message.sender,
       ids: [message.id],
       room_id: this.isRoom.id
     }
     this.socketSender(data)
   }

 }
  scrollCall() {
    const unreadMessage = this.parentDiv.nativeElement.querySelector('.unread');
    const parentDivRect = this.parentDiv.nativeElement.getBoundingClientRect();
      let unreads = this.comments.filter((elem: any) => !elem.is_read && elem.sender !== this.authService.user.id);
      let unreadMessageIds: any[] = []
      unreads.forEach((item: any) => {
        const unreadMessage = this.parentDiv.nativeElement.querySelector('#child_' + item.id);
        const unreadMessageRect = unreadMessage?.getBoundingClientRect();
        const scrollTopOffset = unreadMessageRect.top - parentDivRect.top;
        if (scrollTopOffset - this.parentDiv.nativeElement.offsetHeight < 0) {
          if (!unreadMessageIds.find((elem: any) => elem.id === item.id)) unreadMessageIds.push(item)
        }
      })
      if (unreadMessageIds.length > 0) {
        const data = {
          type: 'read',
          receiver: unreadMessageIds[0].receiver,
          sender: unreadMessageIds[0].sender,
          ids: unreadMessageIds.map((elem: any) => elem.id),
          room_id: this.isRoom.id
        }
        this.socketSender(data)
      }
      this.scrollAccess = true
  }

  handleReadMessages(message: any) {
    console.log("read",message)
    let room = this.userRooms.find((elem: any) => elem.id === message.message.room_id);
    console.log("room",room)
    this.unreadToRead(message,this.comments)
    this.unreadToRead(message,room.messages)
  }

  unreadToRead(message: any,rooms: any) {
    rooms.forEach((elem: any) => {
      if (!elem.is_read && elem.sender === this.authService.user.id) {
        if (message.message.room_id === this.isRoom.id) {
          if (message.message.ids.includes(elem.id)) {
            elem.is_read = true
          }
        }
      }
    })
  }

}
