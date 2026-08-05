import { Component, DestroyRef, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { RegisterDialogComponent } from '../../modals/register-dialog/register-dialog.component';
import { AuthDialogComponent } from '../../modals/auth-dialog/auth-dialog.component';
import { NumberDialogComponent } from '../../modals/number-dialog/number-dialog.component';
import { SmsDialogComponent } from '../../modals/sms-dialog/sms-dialog.component';
import { AuthService } from '@services/auth';
import { ThemePreference, ThemeService } from '../../../../core/services/theme/theme.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthPromptService } from '@/core/services/auth-prompt/auth-prompt.service';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf, ToastModule, RegisterDialogComponent, AuthDialogComponent, NumberDialogComponent, SmsDialogComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  @ViewChild(RegisterDialogComponent)
  registerDialogComponent!: RegisterDialogComponent;
  @ViewChild(AuthDialogComponent) authDialogComponent!: AuthDialogComponent;
  @ViewChild(NumberDialogComponent)
  numberDialogComponent!: NumberDialogComponent;
  @ViewChild(SmsDialogComponent) smsDialogComponent!: SmsDialogComponent;
  public themeMenuOpen = false;
  public mobileMenuOpen = false;
  public authRedirect = '/profile';

  constructor(
    public router: Router,
    public authService: AuthService,
    public theme: ThemeService,
    authPrompt: AuthPromptService,
    destroyRef: DestroyRef,
  ) {
    authPrompt.requests$.pipe(takeUntilDestroyed(destroyRef)).subscribe((redirectUrl) => {
      this.authRedirect = redirectUrl;
      this.openAuthDialog();
    });
  }
  openRegisterDialog() {
    this.registerDialogComponent.showDialog();
  }
  openAuthDialog() {
    if (!this.authRedirect) this.authRedirect = '/profile';
    this.authDialogComponent.showDialog();
  }
  closeAuthDialog() {
    this.authDialogComponent.closeDialog();
  }
  openNumberDialog() {
    this.numberDialogComponent.showDialog();
  }
  openSmsDialog() {
    this.smsDialogComponent.showDialog();
  }
  closeSmsDialog() {
    this.smsDialogComponent.closeDialog();
  }
  completeCallback = () => {
    this.numberDialogComponent.closeDialog();
    this.openSmsDialog();
  };
  completeSmsCallback = () => {
    this.closeSmsDialog();
    this.openRegisterDialog();
  };
  logout() {
    this.authService.logout();
  }

  setTheme(preference: ThemePreference) {
    this.theme.setPreference(preference);
    this.themeMenuOpen = false;
  }

  createAnnouncement() {
    this.authRedirect = '/profile/create';
    this.authService.auth ? this.router.navigate(['profile/create']) : this.openAuthDialog();
  }

  openProfile() {
    this.authRedirect = '/profile';
    this.authService.auth ? this.router.navigate(['profile']) : this.openAuthDialog();
  }

  anotherPhoneNumber = () => {
    this.closeSmsDialog();
    this.openNumberDialog();
  };

  openRegister = () => {
    this.closeAuthDialog();
    this.openNumberDialog();
  };

  completeRegisterCallback = () => {
    this.openAuthDialog();
  };
}
