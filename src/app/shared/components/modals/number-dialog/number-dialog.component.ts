import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { InvaidTextComponent } from '../../form/invaid-text/invaid-text.component';
import { NgClass } from '@angular/common';
import { PasswordModule } from 'primeng/password';
import { numberControl } from '@/core/common/form-control';
import { finalize } from 'rxjs';
import { RequestService } from '@services/request';
import { environment } from '@environments';

interface PhoneVerificationResponse {
  phone_number?: string;
  otp_code?: string | number;
  local_otp?: boolean;
}

@Component({
  selector: 'app-number-dialog',
  standalone: true,
  imports: [ButtonModule, DialogModule, FormsModule, InputMaskModule, InputTextModule, InvaidTextComponent, PasswordModule, ReactiveFormsModule, NgClass],
  templateUrl: './number-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './number-dialog.component.css',
})
export class NumberDialogComponent {
  private readonly localOtpCodeStorageKey = 'local_otp_code';
  visible: boolean = false;
  loading: boolean = false;
  @Input() url: string | undefined;
  @Input() completeCallback: Function | undefined;
  public ruleForm = new FormGroup({
    phone_number: new FormControl('', [Validators.required, Validators.pattern(/^\d{2} \d{3} \d{2} \d{2}$/)]),
  });
  constructor(private requestService: RequestService) {}
  eventPipe() {
    this.closeDialog();
    localStorage.setItem('phone_number', JSON.stringify(this.ruleForm.value.phone_number));
    if (this.completeCallback) this.completeCallback();
    this.ruleForm.reset();
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
    localStorage.removeItem(this.localOtpCodeStorageKey);

    this.requestService
      .requestData<PhoneVerificationResponse>(environment.urls.POST_NUMBER, 'POST', data)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          const otpCode = response?.otp_code;
          const shouldStoreLocalOtp =
            !environment.production &&
            response?.local_otp === true &&
            otpCode !== undefined &&
            otpCode !== null &&
            String(otpCode).trim() !== '';

          if (shouldStoreLocalOtp) {
            localStorage.setItem(
              this.localOtpCodeStorageKey,
              JSON.stringify({ code: String(otpCode), local_otp: true })
            );
          }
          this.eventPipe();
        },
        error: (error) => {
          if (!environment.production) {
            console.error('Phone verification failed', error);
          }
        },
      });
  }
  showDialog() {
    this.visible = true;
  }
  closeDialog() {
    this.visible = false;
  }
}
