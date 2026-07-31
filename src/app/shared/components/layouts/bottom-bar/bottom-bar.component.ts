import { Component, DestroyRef, OnInit, ViewChild } from '@angular/core';
import { Location, NgClass, NgForOf, NgIf } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthDialogComponent } from '../../modals/auth-dialog/auth-dialog.component';
import { AuthService } from '@services/auth';
import { RegisterDialogComponent } from '../../modals/register-dialog/register-dialog.component';
import { filter } from 'rxjs';
import { NumberDialogComponent } from '../../modals/number-dialog/number-dialog.component';
import { SmsDialogComponent } from '../../modals/sms-dialog/sms-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-bottom-bar',
  standalone: true,
  imports: [NgForOf, AuthDialogComponent, NgClass, RouterLinkActive, RouterLink, NgIf, RegisterDialogComponent, NumberDialogComponent, SmsDialogComponent],
  templateUrl: './bottom-bar.component.html',
  styleUrl: './bottom-bar.component.css',
})
export class BottomBarComponent implements OnInit {
  @ViewChild(RegisterDialogComponent)
  registerDialogComponent!: RegisterDialogComponent;
  @ViewChild(AuthDialogComponent) authDialogComponent!: AuthDialogComponent;
  @ViewChild(NumberDialogComponent)
  numberDialogComponent!: NumberDialogComponent;
  @ViewChild(SmsDialogComponent) smsDialogComponent!: SmsDialogComponent;
  public isPath: string = '';
  public menuList = [
    {
      title: 'Asosiy',
      iconClass: 'pi pi-home',
      action: () => {
        this.router.navigate(['/']).then(() => {});
      },
      isPath: '/',
    },
    {
      title: 'Saqlanganlar',
      iconClass: 'pi pi-heart',
      action: () => {
        this.router.navigate(['/likes']);
      },
      isPath: '/likes',
    },
    {
      title: 'Aloqa',
      iconClass: 'pi pi-search',
      action: () => {
        this.router.navigate(['/announcements']);
      },
      isPath: '/announcements',
    },
    {
      title: 'Profil',
      iconClass: 'pi pi-user',
      action: () => {
        this.authService.auth ? this.router.navigate(['/profile']) : this.openAuthDialog();
      },
      isPath: '/profile',
    },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private location: Location,
    private destroyRef: DestroyRef,
  ) {
    this.isPath = this.location.path();
  }
  ngOnInit() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.isPath = this.location.path();
    });
  }
  openAuthDialog() {
    this.authDialogComponent.showDialog();
  }
  openRegisterDialog() {
    this.registerDialogComponent.showDialog();
  }
  closeAuthDialog() {
    this.authDialogComponent.closeDialog();
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
  openNumberDialog() {
    this.numberDialogComponent.showDialog();
  }
  completeSmsCallback = () => {
    this.closeSmsDialog();
    this.openRegisterDialog();
  };
  openRegister = () => {
    this.closeAuthDialog();
    this.openNumberDialog();
  };
  anotherPhoneNumber = () => {
    this.closeSmsDialog();
    this.openNumberDialog();
  };
}
