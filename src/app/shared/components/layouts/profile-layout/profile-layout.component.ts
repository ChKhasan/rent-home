import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router, RouterOutlet} from "@angular/router";
import {FooterComponent} from "../footer/footer.component";
import {HeaderComponent} from "../header/header.component";
import {ProfileComponent} from "../../../../pages/profile/profile/profile.component";
import {ChatService} from "../../../../core/services/chat/chat.service";
import {ChatComponent} from "../../../../pages/chat/chat.component";
import {WebSocketService} from "../../../../core/services/webSocket/web-socket.service";
import { Location } from '@angular/common';
import {IMessage} from "../../../../core/interfaces/common.interface";
import {AuthService} from "../../../../core/services/auth/auth.service";
import {MessageService} from "primeng/api";
@Component({
  selector: 'app-profile-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    FooterComponent,
    HeaderComponent
  ],
  templateUrl: './profile-layout.component.html',
  styleUrl: './profile-layout.component.css'
})
export class ProfileLayoutComponent implements OnInit, AfterViewInit,OnDestroy {
  @ViewChild(ProfileComponent) profileComponent!: ProfileComponent
  @ViewChild(ChatComponent) chatComponent!: ChatComponent;

  ngAfterViewInit() {
    // You can call the child function here or at any appropriate lifecycle hook
    // Here, for demonstration, I'm calling it after the view has been initialized
    this.callChildFunction();
  }

  callChildFunction() {
    // Check if the child component is loaded before calling its function
    if (this.chatComponent) {
      console.log(this.chatComponent)
    }
  }

  constructor(private router: Router,
              private chatService: ChatService,
              private webSocketService: WebSocketService,
              private location: Location,
              private authService: AuthService,
              private messageService: MessageService
  ) {
  }


  ngOnInit() {
    if (typeof localStorage !== 'undefined') {
      // this.chatService.webSocketConnection();
      // let currentPath = this.location.path();
      // if (!currentPath.includes('/profile/chat')) {
      //   this.sokectEventHandler()
      //   this.chatService.__GET_USER_ROOMS()
      // }
    }
  }
  ngOnDestroy(): void {
    this.webSocketService.disconnect(); // Disconnect WebSocket when component is destroyed
  }
  sokectEventHandler() {
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
