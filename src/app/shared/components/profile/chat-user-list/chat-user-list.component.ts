import { Component, Input } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { IUserRooms } from '@services/interfaces';
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '@services/auth';
import { FormsModule } from '@angular/forms';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { Router, RouterLink } from '@angular/router';
import { ChatUrlService } from '@/core/services/chatUrl/chatUrl.service';

@Component({
  selector: 'app-chat-user-list',
  standalone: true,
  imports: [BadgeModule, NgForOf, NgIf, SkeletonModule, NgClass, AvatarModule, FormsModule],
  templateUrl: './chat-user-list.component.html',
  styleUrl: './chat-user-list.component.css',
  animations: [trigger('listAnimation', [transition('* <=> *', [query(':enter', [style({ opacity: 0, transform: 'translateY(-20px)' }), stagger(50, [animate('300ms', style({ opacity: 1, transform: 'none' }))])], { optional: true }), query(':leave', [stagger(50, [animate('300ms', style({ opacity: 0, transform: 'translateY(-20px)' }))])], { optional: true })])])],
})
export class ChatUserListComponent {
  public skeletonList = [1, 2, 3, 4, 5, 6];
  protected readonly length = length;
  @Input() handlerRoom!: Function;
  @Input() isRoom!: any;
  @Input() userRooms!: IUserRooms[];
  @Input() loading!: boolean;
  @Input() userSearch!: Function;
  @Input() toggleUsersList: Function | undefined;
  @Input() showList!: boolean;
  public searchValue: string = '';
  constructor(private authService: AuthService, private router: Router, private chatUrlService: ChatUrlService) {}
  getUnreadMessageCount(messages: any): string {
    return messages && messages.length > 0 ? String(messages.filter((elem: any) => !elem.is_read && elem.sender !== this.authService.user.id).length) : '0';
  }
  onChangeSearch(e: any) {
    if (this.userSearch) this.userSearch(this.searchValue);
  }

  toggleUsers(value: boolean) {
    if (this.toggleUsersList) this.toggleUsersList(value);
  }
  goBack() {
    const id = this.chatUrlService.get();
    this.router.navigate([!!id ? `/announcements/${id}` : '/profile']).then(() => {
      this.chatUrlService.remove();
    });
  }
}
