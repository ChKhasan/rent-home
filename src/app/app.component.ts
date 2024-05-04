import {Component, OnInit} from "@angular/core";
import {Router, RouterOutlet} from "@angular/router";
import { Location } from '@angular/common';
import {HeaderComponent} from "./shared/components/layouts/header/header.component";
import {FooterComponent} from "./shared/components/layouts/footer/footer.component";
import {LikesService} from "./core/services/likes/likes.service";
import {AuthService} from "./core/services/auth/auth.service";
import {environment} from "../environments/environment";
import {IMessage} from "./core/interfaces/common.interface";
import {ChatService} from "./core/services/chat/chat.service";
import {WebSocketService} from "./core/services/webSocket/web-socket.service";
import {MessageService} from "primeng/api";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit {
  constructor(
    private likesService: LikesService,
    private authService: AuthService,
    private router: Router,
    private location: Location,
    private chatService: ChatService,
    private webSocketService: WebSocketService,
    private messageService: MessageService
  ) {
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      let currentPath = this.location.path();
      if (!currentPath.includes('/profile/chat')) {
        this.chatService.__GET_USER_ROOMS();
        this.authService.authHandler().then(() => {
          this.sokectEventHandler();
          const AUTH_TOKEN = localStorage.getItem(environment.accessToken);
          Boolean(AUTH_TOKEN) ? this.POST_GET_LIKES() : this.likesService.reloadLikes();
        });
      }
    }
  }

  POST_GET_LIKES() {
    let localLikes = JSON.parse(localStorage.getItem(environment.storeLikes) as string);
    if (localLikes && localLikes.length > 0)
      Promise.all(localLikes.map((item: any) => this.__POST_LIKE({announcement: item}))).then(r => {});
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
    this.webSocketService.disconnect(); // Disconnect WebSocket when component is destroyed
  }

  sokectEventHandler() {
    this.chatService.webSocketConnection();
    this.webSocketService.onMessage().subscribe((message) => {
      this.commandController(message);
    });
  }

  commandController(message: any) {
    if (message.type === 'chat_message')
      this.addMessage(message.message);
  }

  addMessage(message: any) {
    if (message.sender !== this.authService.user.id) {
      this.showTopCenter(message)
    }
  }

  showTopCenter(message: IMessage) {
    let user = this.chatService.userRooms.find((elem: any) => elem.id === message.room);
    this.messageService.add({key: 'confirm', severity: 'success', summary: message.message, data: user});
  }
}
