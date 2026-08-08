import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputMaskModule } from 'primeng/inputmask';
import { NgClass } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InvaidTextComponent } from '../../form/invaid-text/invaid-text.component';
import { environment } from '@environments';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { PasswordModule } from 'primeng/password';
import { RequestService } from '@services/request';
import { ToastService } from '@services/toast';
import { AuthService } from '@services/auth';

@Component({
  selector: 'app-auth-dialog',
  standalone: true,
  imports: [ButtonModule, DialogModule, InputMaskModule, ReactiveFormsModule, NgClass, InvaidTextComponent, PasswordModule],
  templateUrl: './auth-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './auth-dialog.component.css',
})
export class AuthDialogComponent {
  visible: boolean = false;
  loading: boolean = false;
  infoError: boolean = false;
  submitted: boolean = false;
  @Input() url: string | undefined;
  @Input() afterComplite: Function | undefined;
  @Input() openRegister: Function | undefined;
  public ruleForm = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*\d).*$/)]),
    phone_number: new FormControl('', [Validators.required, Validators.pattern(/^\d{2} \d{3} \d{2} \d{2}$/)]),
  });

  constructor(private authService: AuthService, private toastService: ToastService, private router: Router, private requestService: RequestService) {}

  eventPipe(data: any) {
    this.tokenHandle(data.response);
    this.closeDialog();
    this.ruleForm.reset();
    this.toastService.showMessage('success', 'Muvaffaqiyat', data.message);
    this.authService.authHandler();
    if (this.afterComplite) this.afterComplite();
  }

  tokenHandle(data: any) {
    localStorage.setItem(environment.accessToken, data.access);
    localStorage.setItem(environment.refreshToken, data.refresh);
    if (this.url) this.router.navigateByUrl(this.url).then(() => {});
  }

  public onSubmit(): void {
    this.submitted = true;
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
        })
      )
      .subscribe(
        (response: any) => {
          this.eventPipe({ message: 'Xush kelibsiz', response: response });
        },
        (error) => {
          if (error.status === 401) this.infoError = true;
        }
      );
  }

  openRegisterDialog() {
    if (this.openRegister) this.openRegister();
  }

  showDialog() {
    this.infoError = false;
    this.submitted = false;
    this.ruleForm.markAsPristine();
    this.ruleForm.markAsUntouched();
    const phone_number = localStorage.getItem('phone_number') && JSON.parse(localStorage.getItem('phone_number') || '');
    if (phone_number) {
      this.ruleForm.setValue({
        password: '',
        phone_number: phone_number,
      });
      localStorage.removeItem('phone_number');
    }
    this.visible = true;
  }

  closeDialog() {
    this.visible = false;
    this.infoError = false;
    this.submitted = false;
  }
}
