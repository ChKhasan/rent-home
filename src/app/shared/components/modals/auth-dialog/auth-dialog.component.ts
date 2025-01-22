import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { NgClass, NgIf } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationErrorAnimation } from '@animations';
import { InvaidTextComponent } from '../../form/invaid-text/invaid-text.component';
import { environment } from '@environments';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { PasswordModule } from 'primeng/password';
import { RequestService } from '@services/request';
import { ToastService } from '@services/toast';
import { AuthService } from '@services/auth';
import { log } from 'node:console';

@Component({
  selector: 'app-auth-dialog',
  standalone: true,
  imports: [ButtonModule, DialogModule, InputMaskModule, InputNumberModule, InputTextModule, NgIf, PaginatorModule, ReactiveFormsModule, NgClass, InvaidTextComponent, PasswordModule],
  animations: [ValidationErrorAnimation],
  templateUrl: './auth-dialog.component.html',
  styleUrl: './auth-dialog.component.css',
})
export class AuthDialogComponent {
  visible: boolean = false;
  loading: boolean = false;
  infoError: boolean = false;
  @Input() url: string | undefined;
  @Input() afterComplite: Function | undefined;
  @Input() openRegister: Function | undefined;
  public ruleForm = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*\d).*$/)]),
    phone_number: new FormControl('', [Validators.required, Validators.pattern(/^\d{2} \d{3} \d{2} \d{2}$/)]),
  });

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private requestService: RequestService,
  ) {}

  eventPipe(data: any) {
    this.tokenHandle(data.response);
    this.closeDialog();
    this.ruleForm.reset();
    this.toastService.showMessage('success', 'Success', data.message);
    this.authService.authHandler();
    if (this.afterComplite) this.afterComplite();
  }

  tokenHandle(data: any) {
    localStorage.setItem(environment.accessToken, data.access);
    localStorage.setItem(environment.refreshToken, data.refresh);
    if (this.url) this.router.navigate([this.url]).then((r) => {});
  }

  public onSubmit(): void {
    this.ruleForm.markAllAsTouched();
    if (this.ruleForm.invalid) return;
    this.postLogin();
  }

  dataTransform() {
    return {
      ...this.ruleForm.value,
      phone_number: '+998' + this.ruleForm.value.phone_number?.replaceAll(' ', ''),
    };
  }

  postLogin() {
    this.loading = true;
    const data = this.dataTransform();
    this.requestService
      .requestData<any>(environment.urls.POST_LOGIN, 'POST', data)
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe(
        (response: any) => {
          this.eventPipe({ message: 'Добро пожаловать', response: response });
        },
        (error) => {
          if (error.status === 401) this.infoError = true;
        },
      );
  }

  openRegisterDialog() {
    if (this.openRegister) this.openRegister();
  }

  showDialog() {
    this.visible = true;
  }

  closeDialog() {
    this.visible = false;
  }
}
