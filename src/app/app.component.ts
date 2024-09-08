import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Location, NgIf } from '@angular/common';
import { HeaderComponent } from './shared/components/layouts/header/header.component';
import { FooterComponent } from './shared/components/layouts/footer/footer.component';
import { LikesService } from './core/services/likes/likes.service';
import { AuthService } from './core/services/auth/auth.service';
import { environment } from '../environments/environment';
import { IMessage } from './core/interfaces/common.interface';
import { ChatService } from './core/services/chat/chat.service';
import { MessageService, SharedModule } from 'primeng/api';
import { ChatComponent } from './pages/chat/chat.component';
import { AvatarModule } from 'primeng/avatar';
import { ToastModule } from 'primeng/toast';
import { CryptoService } from './core/services/crypto/crypto.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, AvatarModule, NgIf, SharedModule, ToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild(ChatComponent) chatComponent!: ChatComponent;
  private newGroup: any = {};

  constructor(
    private likesService: LikesService,
    private authService: AuthService,
    private location: Location,
    private chatService: ChatService,
    private messageService: MessageService,
    private router: Router,
  ) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.authService.authHandler().then(() => {});

      this.authService.getBooleanValue().subscribe((value) => {
        if (value) {
          this.firstSocketConnection();
          this.likesFirstGetter();
        }
      });
    }
  }

  firstSocketConnection() {
    let currentPath = this.location.path();
    this.chatService.webSocketConnection();
    if (!currentPath.includes('/profile/chat')) {
      this.sokectEventHandler();
      this.chatService.__GET_USER_ROOMS();
    }
  }

  likesFirstGetter() {
    const AUTH_TOKEN = localStorage.getItem(environment.accessToken);
    Boolean(AUTH_TOKEN) ? this.POST_GET_LIKES() : this.likesService.reloadLikes();
  }

  POST_GET_LIKES() {
    let localLikes = JSON.parse(localStorage.getItem(environment.storeLikes) as string);
    if (localLikes && localLikes.length > 0) Promise.all(localLikes.map((item: any) => this.__POST_LIKE({ announcement: item }))).then((r) => {});
    this.__GET_LIKE();
  }

  __POST_LIKE(data: any) {
    this.likesService.post(data);
  }

  __GET_LIKE() {
    this.likesService.get().subscribe((response) => {
      const userLikes = response?.map((item: any) => item.announcement?.id);
      this.likesService.handleUserLikes(userLikes);
      localStorage.removeItem(environment.storeLikes);
    });
  }

  ngOnDestroy(): void {
    this.chatService.disconnect(); // Disconnect WebSocket when component is destroyed
  }

  sokectEventHandler() {
    this.chatService.onMessage().subscribe((message) => {
      this.commandController(message);
    });
  }

  commandController(message: any) {
    switch (message.type) {
      case 'group_created':
        this.createGroup(message.message);
        break;
      case 'chat_message':
        this.addMessage(message.message);
        break;
    }
  }

  createGroup(message: any) {
    this.newGroup = {
      ...message,
      message: '',
      user: message.users.find((elem: any) => elem.id !== this.authService.user.id),
    };
  }

  addMessage(message: any) {
    let currentPath = this.location.path();
    if (message.sender !== this.authService.user.id && !currentPath.includes('/profile/chat')) this.showTopCenter(message);
  }

  showTopCenter(message: IMessage) {
    let user = this.chatService.userRooms.find((elem: any) => elem.id === message.room);
    if (!user) {
      user = {
        user: this.newGroup.user,
      };
    }
    this.messageService.clear();
    if (user?.user)
      this.messageService.add({
        key: 'confirm',
        severity: 'success',
        summary: message.message,
        data: user,
      });
  }

  toChat(data: any) {
    this.router
      .navigate(['profile/chat'], {
        queryParams: {
          roomId: data.id,
        },
      })
      .then(() => {
        this.messageService.clear();
      });
  }
}
