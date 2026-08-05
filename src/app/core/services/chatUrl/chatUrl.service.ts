import { Injectable } from '@angular/core';
export interface ChatRecipientSummary {
  id: number;
  name: string;
  phone_number?: string | null;
  images: Array<{ image: string }>;
  is_online?: boolean;
  last_online?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ChatUrlService {
  private readonly recipientKey = 'chat_recipient';

  save(id: number, recipient?: ChatRecipientSummary) {
    localStorage.setItem('chat_announcement', JSON.stringify(id));
    if (recipient) localStorage.setItem(this.recipientKey, JSON.stringify(recipient));
  }
  remove() {
    localStorage.removeItem('chat_announcement');
    localStorage.removeItem(this.recipientKey);
  }
  get() {
    return localStorage.getItem('chat_announcement');
  }

  getRecipient(userId: number): ChatRecipientSummary | null {
    try {
      const recipient = JSON.parse(localStorage.getItem(this.recipientKey) || 'null');
      return recipient?.id === userId ? recipient : null;
    } catch {
      return null;
    }
  }

  clearRecipient(): void {
    localStorage.removeItem(this.recipientKey);
  }
}
