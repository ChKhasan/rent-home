import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@services/auth';
import { AuthPromptService } from '@/core/services/auth-prompt/auth-prompt.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();

  constructor(private readonly authService: AuthService, private readonly authPrompt: AuthPromptService) {}

  openProtected(event: MouseEvent, url: string): void {
    if (this.authService.auth) return;
    event.preventDefault();
    this.authPrompt.open(url);
  }
}
