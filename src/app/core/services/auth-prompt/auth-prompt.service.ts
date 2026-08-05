import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthPromptService {
  private readonly requests = new Subject<string>();
  readonly requests$ = this.requests.asObservable();

  open(redirectUrl = '/profile'): void {
    this.requests.next(redirectUrl);
  }
}
