import { Injectable } from '@angular/core';
import { RequestService } from '../request/request.service';

@Injectable({
  providedIn: 'root',
})
export class ChatUrlService {
  save(id: number) {
    localStorage.setItem('chat_announcement', JSON.stringify(id));
  }
  remove() {
    localStorage.removeItem('chat_announcement');
  }
  get() {
    return localStorage.getItem('chat_announcement');
  }
}
