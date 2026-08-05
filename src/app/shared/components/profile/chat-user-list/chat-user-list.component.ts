import { Component, Input } from '@angular/core';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { IUserRooms } from '@services/interfaces';
import { AuthService } from '@services/auth';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ChatUrlService } from '@/core/services/chatUrl/chatUrl.service';
import { LucideArrowLeft, LucideMessageCircle, LucideSearch, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-chat-user-list',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    SkeletonModule,
    NgClass,
    FormsModule,
    RouterLink,
    LucideArrowLeft,
    LucideMessageCircle,
    LucideSearch,
    LucideX,
  ],
  templateUrl: './chat-user-list.component.html',
  styleUrl: './chat-user-list.component.css',
})
export class ChatUserListComponent {
  public skeletonList = [1, 2, 3, 4, 5, 6];
  @Input() handlerRoom!: Function;
  @Input() isRoom!: any;
  @Input() userRooms: IUserRooms[] = [];
  @Input() loading = false;
  @Input() userSearch!: Function;
  @Input() toggleUsersList: Function | undefined;
  @Input() showList = false;
  public searchValue: string = '';

  constructor(private authService: AuthService, private router: Router, private chatUrlService: ChatUrlService) {}

  getUnreadMessageCount(room: any): string {
    if (room?.unread_count != null) return String(room.unread_count);
    const messages = room?.messages || [];
    return String(messages.filter((message: any) => !message.is_read && message.receiver === this.authService.user.id).length);
  }

  onChangeSearch() {
    if (this.userSearch) this.userSearch(this.searchValue);
  }

  clearSearch(): void {
    this.searchValue = '';
    this.onChangeSearch();
  }

  formatRoomTime(value?: string): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const now = new Date();
    const isSameDay = date.toDateString() === now.toDateString();
    if (isSameDay) return new Intl.DateTimeFormat('uz-UZ', { hour: '2-digit', minute: '2-digit' }).format(date);

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Kecha';

    return new Intl.DateTimeFormat('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: date.getFullYear() === now.getFullYear() ? undefined : '2-digit',
    }).format(date);
  }

  goBack() {
    const id = this.chatUrlService.get();
    void this.router.navigate([id ? `/announcements/${id}` : '/profile']).then(() => {
      this.chatUrlService.remove();
    });
  }
}
