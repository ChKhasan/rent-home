import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { InvaidTextComponent } from '../../form/invaid-text/invaid-text.component';
import { InputMaskModule } from 'primeng/inputmask';
import { DialogModule } from 'primeng/dialog';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputOtpModule } from 'primeng/inputotp';
import { environment } from '@environments';
import { RequestService } from '@services/request';

@Component({
  selector: 'app-sms-dialog',
  standalone: true,
  imports: [InputMaskModule, ReactiveFormsModule, DialogModule, InputTextModule, ButtonModule, InputOtpModule, FormsModule],
  templateUrl: './sms-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sms-dialog.component.css',
})
export class SmsDialogComponent {
  private readonly localOtpCodeStorageKey = 'local_otp_code';
  visible: boolean = false;
  loading: boolean = false;
  code: any;
  localOtpCode: string | null = null;
  @Input() url: string | undefined;
  @Input() completeCallback: Function | undefined;
  @Input() anotherPhoneNumber: Function | undefined;
  // public ruleForm = new FormGroup({
  //   phone_number: numberControl,
  // })
  constructor(private requestService: RequestService) {}
  eventPipe() {
    this.closeDialog();
    if (this.completeCallback) this.completeCallback();
    this.code = '';
    this.localOtpCode = null;
    localStorage.removeItem(this.localOtpCodeStorageKey);
  }

  public onSubmit(): void {
    // this.ruleForm.markAllAsTouched()
    // if (this.ruleForm.invalid)  return;
    this.postLogin();
  }
  dataTransform() {
    const phone_number = JSON.parse(localStorage.getItem('phone_number') || '');
    return {
      code: this.code + '',
      phone_number: '+998' + phone_number?.replaceAll(' ', ''),
    };
  }
  postLogin() {
    this.loading = true;
    const data = this.dataTransform();
    this.requestService
      .requestData(environment.urls.POST_CODE, 'POST', data)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((response) => {
        this.eventPipe();
      });
  }
  showDialog() {
    this.localOtpCode = this.getStoredLocalOtpCode();
    if (this.localOtpCode) {
      this.code = this.localOtpCode;
    }
    this.visible = true;
  }
  closeDialog() {
    this.visible = false;
  }

  anotherPhoneNumberCall() {
    localStorage.removeItem(this.localOtpCodeStorageKey);
    this.localOtpCode = null;
    if (this.anotherPhoneNumber) this.anotherPhoneNumber();
  }

  private getStoredLocalOtpCode(): string | null {
    if (environment.production) return null;

    const storedValue = localStorage.getItem(this.localOtpCodeStorageKey);
    if (!storedValue) return null;

    try {
      const parsedValue = JSON.parse(storedValue) as { code?: unknown; local_otp?: unknown };
      if (parsedValue.local_otp === true && parsedValue.code !== undefined && parsedValue.code !== null) {
        const code = String(parsedValue.code).trim();
        return code || null;
      }
    } catch {
      localStorage.removeItem(this.localOtpCodeStorageKey);
    }

    return null;
  }
}
