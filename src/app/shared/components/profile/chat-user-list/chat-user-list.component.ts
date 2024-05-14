import {Component, Input} from '@angular/core';
import {BadgeModule} from "primeng/badge";
import {ChatService} from "../../../../core/services/chat/chat.service";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {SkeletonModule} from "primeng/skeleton";
import {IUserRooms} from "../../../../core/interfaces/common.interface";
import {AvatarModule} from "primeng/avatar";
import {AuthService} from "../../../../core/services/auth/auth.service";

@Component({
  selector: 'app-chat-user-list',
  standalone: true,
  imports: [
    BadgeModule,
    NgForOf,
    NgIf,
    SkeletonModule,
    NgClass,
    AvatarModule
  ],
  templateUrl: './chat-user-list.component.html',
  styleUrl: './chat-user-list.component.css'
})
export class ChatUserListComponent {
  public skeletonList = [1, 2, 3, 4, 5, 6];
  @Input() handlerRoom!: Function;
  @Input() isRoom!: any
  @Input() userRooms!: IUserRooms[]
  @Input() loading!: boolean
  constructor(public chatService: ChatService,
              private authService: AuthService) {
  }
  getUnreadMessageCount(messages: any): string {
    if(messages && messages.length > 0) {
      console.log(messages)
      return String(messages.filter((elem: any) => !elem.is_read && elem.sender !== this.authService.user.id).length);
    } else {
      return '0'
    }
  }
    protected readonly length = length;
}
