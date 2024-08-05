import {Component, OnInit, ViewChild} from '@angular/core';
import {Location, NgClass, NgForOf, NgIf} from "@angular/common";
import {DomSanitizer} from "@angular/platform-browser";
import {NavigationEnd, Router, RouterLink, RouterLinkActive} from "@angular/router";
import {AuthDialogComponent} from "../../modals/auth-dialog/auth-dialog.component";
import {AuthService} from "@services/auth";
import {RegisterDialogComponent} from "../../modals/register-dialog/register-dialog.component";
import {filter} from "rxjs";
import { NumberDialogComponent } from "../../modals/number-dialog/number-dialog.component";
import { SmsDialogComponent } from "../../modals/sms-dialog/sms-dialog.component";

@Component({
  selector: 'app-bottom-bar',
  standalone: true,
  imports: [
    NgForOf,
    AuthDialogComponent,
    NgClass,
    RouterLinkActive,
    RouterLink,
    NgIf,
    RegisterDialogComponent,
    NumberDialogComponent,
    SmsDialogComponent
],
  templateUrl: './bottom-bar.component.html',
  styleUrl: './bottom-bar.component.css'
})
export class BottomBarComponent implements OnInit{
  @ViewChild(RegisterDialogComponent) registerDialogComponent!: RegisterDialogComponent;
  @ViewChild(AuthDialogComponent) authDialogComponent!: AuthDialogComponent;
  @ViewChild(NumberDialogComponent) numberDialogComponent!: NumberDialogComponent;
  @ViewChild(SmsDialogComponent) smsDialogComponent!: SmsDialogComponent;
  public isPath: string = ''
  public menuList = [
    {
      title: 'Asosiy',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 16 16"><path fill="#8E8E93" d="M7.313 1.262a1 1 0 0 1 1.374 0l4.844 4.579c.3.283.469.678.469 1.09v5.57a1.5 1.5 0 0 1-1.5 1.5h-2A1.5 1.5 0 0 1 9 12.5V10a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v2.5A1.5 1.5 0 0 1 5.5 14h-2A1.5 1.5 0 0 1 2 12.5V6.93c0-.412.17-.807.47-1.09zM8 1.988l-4.844 4.58A.5.5 0 0 0 3 6.93v5.57a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5V10a1.5 1.5 0 0 1 1.5-1.5h1A1.5 1.5 0 0 1 10 10v2.5a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5V6.93a.5.5 0 0 0-.156-.363z"/></svg>`,
      action: () => {
        console.log(this, 'log')
        this.router.navigate(['/']).then(() => {
        })
      },
      isPath: '/'
    },
    {
      title: 'Saqlanganlar',
      icon: `<svg width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M0 4.7798C0 2.0793 2.36914 0 5.15 0C6.58347 0 7.8448 0.67214 8.75 1.54183C9.6552 0.67214 10.9165 0 12.35 0C15.1309 0 17.5 2.0793 17.5 4.7798C17.5 6.6297 16.7111 8.2564 15.6182 9.6315C14.5271 11.0043 13.1 12.1693 11.7335 13.116C11.2115 13.4776 10.6835 13.8111 10.2003 14.0572C9.7465 14.2883 9.2247 14.5 8.75 14.5C8.2753 14.5 7.7535 14.2883 7.2997 14.0572C6.8165 13.8111 6.28846 13.4776 5.76653 13.116C4.40005 12.1693 2.97287 11.0043 1.88182 9.6315C0.78888 8.2564 0 6.6297 0 4.7798ZM5.15 1.5C3.07075 1.5 1.5 3.0291 1.5 4.7798C1.5 6.1833 2.09579 7.49 3.05609 8.6982C4.01828 9.9088 5.31292 10.9769 6.62074 11.883C7.1156 12.2258 7.5817 12.5175 7.9805 12.7206C8.4086 12.9386 8.6567 13 8.75 13C8.8433 13 9.0914 12.9386 9.5195 12.7206C9.9183 12.5175 10.3844 12.2258 10.8793 11.883C12.1871 10.9769 13.4817 9.9088 14.4439 8.6982C15.4042 7.49 16 6.1833 16 4.7798C16 3.0291 14.4292 1.5 12.35 1.5C11.1558 1.5 10.0408 2.21342 9.3446 3.11892C9.2026 3.30356 8.9829 3.41176 8.75 3.41176C8.5171 3.41176 8.2974 3.30356 8.1554 3.11892C7.4592 2.21342 6.34415 1.5 5.15 1.5Z"
                  fill="#8E8E93"/>
          </svg>`,
      action: () => {
        this.router.navigate(['/likes'])
      },
      isPath: '/likes'
    },
    {
      title: 'Aloqa',
      icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M8 1.21519C5.34041 1.21519 3.27712 2.85976 2.92499 4.86076H4.71795C5.05781 4.86076 5.33333 5.13279 5.33333 5.46835V11.1392C5.33333 11.4748 5.05781 11.7468 4.71795 11.7468H2.25641C1.01023 11.7468 0 10.7494 0 9.51899V7.08861C0 6.05842 0.708193 5.19155 1.67013 4.9367C1.98312 2.0979 4.7785 0 8 0C11.2215 0 14.0169 2.0979 14.3298 4.93671C15.2918 5.19155 16 6.05842 16 7.08861V9.51899C16 10.5521 15.2879 11.4209 14.3218 11.673C14.0586 13.5456 12.4306 14.9873 10.4615 14.9873H9.52172C9.27828 15.5812 8.68866 16 8 16C7.09366 16 6.35897 15.2746 6.35897 14.3797C6.35897 13.4849 7.09366 12.7595 8 12.7595C8.68866 12.7595 9.27828 13.1783 9.52172 13.7722H10.4615C11.7225 13.7722 12.7791 12.9081 13.0569 11.7468H11.2821C10.9422 11.7468 10.6667 11.4748 10.6667 11.1392V5.46835C10.6667 5.13279 10.9422 4.86076 11.2821 4.86076H13.075C12.7229 2.85976 10.6596 1.21519 8 1.21519ZM2.25641 6.07595C1.68996 6.07595 1.23077 6.5293 1.23077 7.08861V9.51899C1.23077 10.0783 1.68996 10.5316 2.25641 10.5316H4.10256V6.07595H2.25641ZM14.7692 7.08861C14.7692 6.5293 14.3101 6.07595 13.7436 6.07595H11.8974V10.5316H13.7436C14.3101 10.5316 14.7692 10.0783 14.7692 9.51899V7.08861Z"
                  fill="#8E8E93"/>
            </svg> `,
      action: () => {
        this.router.navigate(['/announcements'])
      },
      isPath: '/announcements'

    },
    {
      title: 'Profil',
      icon: ` <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M3.3871 4.00494C3.3871 1.79307 5.22851 0 7.5 0C9.77148 0 11.6129 1.79307 11.6129 4.00494C11.6129 6.2168 9.77148 8.00987 7.5 8.00987C5.22851 8.00987 3.3871 6.2168 3.3871 4.00494ZM7.5 1.41351C6.03019 1.41351 4.83871 2.57373 4.83871 4.00494C4.83871 5.43614 6.03019 6.59636 7.5 6.59636C8.96981 6.59636 10.1613 5.43614 10.1613 4.00494C10.1613 2.57373 8.96981 1.41351 7.5 1.41351Z"
                  fill="#8E8E93"/>
            <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M3.62903 10.8369C2.42648 10.8369 1.45161 11.7862 1.45161 12.9571V14.0769C1.45161 14.094 1.4643 14.1085 1.48158 14.1112C5.46747 14.7449 9.53255 14.7449 13.5184 14.1112C13.5357 14.1085 13.5484 14.094 13.5484 14.0769V12.9571C13.5484 11.7862 12.5735 10.8369 11.371 10.8369H11.0411C11.0156 10.8369 10.9903 10.8408 10.966 10.8485L10.1284 11.1149C8.42052 11.6578 6.57948 11.6578 4.87159 11.1149L4.034 10.8485C4.00976 10.8408 3.98441 10.8369 3.95891 10.8369H3.62903ZM0 12.9571C0 11.0055 1.62477 9.42338 3.62903 9.42338H3.95891C4.13744 9.42338 4.31486 9.45089 4.48458 9.5048L5.32218 9.77119C6.73732 10.2211 8.26268 10.2211 9.67781 9.77119L10.5154 9.5048C10.6851 9.45089 10.8625 9.42338 11.0411 9.42338H11.371C13.3753 9.42338 15 11.0055 15 12.9571V14.0769C15 14.7867 14.4717 15.3919 13.7523 15.5063C9.61152 16.1646 5.38848 16.1646 1.24768 15.5063C0.528271 15.3919 0 14.7867 0 14.0769V12.9571Z"
                  fill="#8E8E93"/>
          </svg>`,
      action: () => {
        this.authService.auth ?
          this.router.navigate(['/profile']):
          this.openAuthDialog()
      },
      isPath: '/profile'

    }
  ]

  constructor(private sanitizer: DomSanitizer,
              private router: Router,
              private authService: AuthService,
              private location: Location,
  ) {
    this.isPath = this.location.path()
  }
  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {

      this.isPath = this.location.path()
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
    this.smsDialogComponent.showDialog()
  }
  closeSmsDialog() {
    this.smsDialogComponent.closeDialog()
  }
  sanitize(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
  completeCallback = () => {
    this.numberDialogComponent.closeDialog()
    this.openSmsDialog()
  }
   openNumberDialog() {
    this.numberDialogComponent.showDialog()
  }
  completeSmsCallback = () => {
    this.closeSmsDialog();
    this.openRegisterDialog()
  }
  openRegister = () => {
    this.closeAuthDialog()
    this.openNumberDialog()
  }
  anotherPhoneNumber = () => {
    this.closeSmsDialog();
    this.openNumberDialog()
  }
}
