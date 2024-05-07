import {Component, OnInit} from '@angular/core';
import {
  MyAnnouncementsCardComponent
} from "../../shared/components/cards/my-announcements-card/my-announcements-card.component";
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
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
import {finalize} from "rxjs";

// import EventEmitter from "events";

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
    NgClass
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {
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
    // this.messageObservable = new Observable((observer) => {
    //   this.intervalId = setInterval(() => {
    //     observer.next(this.authService.auth);
    //     console.log("set")
    //   }, 1000);
    // });
    // let oldValue: boolean;
    // this.messageObservable.subscribe((newValue) => {
    //   if (newValue !== oldValue) {
    //     if (newValue) {
    //       this.firstConnection()
    //       clearInterval(this.intervalId)
    //     }
    //     oldValue = newValue;
    //   }
    // });
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
    if (this.authService.auth && this.authService.user.id) {
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
      this.chatService.send({message: this.message, receiver: receiver});
      this.message = ''
    } else {
    }
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
    }
  }

  userOnlineOffline(message: any) {

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
      this.comments.unshift(message)
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
      this.comments = response.messages.reverse();
    })
  }

  // @ViewChild('parentDiv') parentDiv!: ElementRef;
  // @ViewChild('child2') child2!: ElementRef;
  //
  // scrollToSecondChild() {
  //   const parentDiv = this.parentDiv.nativeElement;
  //   const child2 = this.child2.nativeElement;
  //   parentDiv.scrollTop = child2.offsetTop;
  // }

}
