import {Component, HostListener, Input, OnInit, ViewChild} from '@angular/core';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterLink,Event} from "@angular/router";
import {NgIf} from "@angular/common";
import {CustomDropDownAnimation} from "../../../../core/common/animations";
import {ToastModule} from "primeng/toast";
import {RegisterDialogComponent} from "../../modals/register-dialog/register-dialog.component";
import {AuthDialogComponent} from "../../modals/auth-dialog/auth-dialog.component";
import {AuthService} from "../../../../core/services/auth/auth.service";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    NgIf,
    ToastModule,
    RegisterDialogComponent,
    AuthDialogComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  animations: [CustomDropDownAnimation]
})
export class HeaderComponent implements OnInit{
  @ViewChild(RegisterDialogComponent) registerDialogComponent!: RegisterDialogComponent;
  @ViewChild(AuthDialogComponent) authDialogComponent!: AuthDialogComponent;
  public profileDrop: Boolean = false

constructor(
  public router: Router,
  public authService: AuthService
  ) {
}
  openRegisterDialog() {
    this.registerDialogComponent.showDialog();
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.dropdown')) {
      this.profileDrop = false;
    }
  }
  ngOnInit() {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.profileDrop = false
      }
      // if (event instanceof NavigationEnd) {
      //   console.log('Navigation ended');
      // }
    });}
  openAuthDialog() {
    this.authDialogComponent.showDialog();
  }
}
