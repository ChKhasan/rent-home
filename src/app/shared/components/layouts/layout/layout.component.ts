import {Component, OnDestroy, OnInit} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {FooterComponent} from "../footer/footer.component";
import {HeaderComponent} from "../header/header.component";
import {ChatService} from "../../../../core/services/chat/chat.service";
import {WebSocketService} from "../../../../core/services/webSocket/web-socket.service";
import {AuthService} from "../../../../core/services/auth/auth.service";
import {IMessage} from "../../../../core/interfaces/common.interface";
import {MessageService, SharedModule} from "primeng/api";
import {AvatarModule} from "primeng/avatar";
import {ToastModule} from "primeng/toast";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    FooterComponent,
    HeaderComponent,
    AvatarModule,
    SharedModule,
    ToastModule,
    NgIf
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit, OnDestroy {
  constructor(
    private chatService: ChatService,
    private webSocketService: WebSocketService,
    private authService: AuthService,
    private messageService: MessageService
  ) {
  }

  ngOnInit() {
    if (typeof window !== "undefined") {
      // this.sokectEventHandler();
      // this.chatService.__GET_USER_ROOMS();
    }
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
