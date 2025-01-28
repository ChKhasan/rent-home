import { Component, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { RegisterDialogComponent } from '../../modals/register-dialog/register-dialog.component';
import { AuthDialogComponent } from '../../modals/auth-dialog/auth-dialog.component';
import { NumberDialogComponent } from '../../modals/number-dialog/number-dialog.component';
import { SmsDialogComponent } from '../../modals/sms-dialog/sms-dialog.component';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { DropdownComponent } from '../../dropdown/dropdown.component';
import { AuthService } from '@services/auth';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, NgIf, ToastModule, RegisterDialogComponent, AuthDialogComponent, NumberDialogComponent, SmsDialogComponent, DropdownModule, FormsModule, ButtonModule, DropdownComponent],
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
  public profileDrop: Boolean = false;
  constructor(public router: Router, public authService: AuthService) {}
  openRegisterDialog() {
    this.registerDialogComponent.showDialog();
  }
  openAuthDialog() {
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
    this.profileDrop = false;
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
