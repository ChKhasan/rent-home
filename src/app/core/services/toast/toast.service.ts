import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private messageService: MessageService) {}
  showMessage(type: string, message: string, title: string): void {
    this.messageService.add({
      severity: type,
      summary: message,
      detail: title,
    });
  }
}
