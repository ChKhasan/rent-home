import {Component, Input} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AuthService} from "../../../../core/services/auth/auth.service";
import {finalize} from "rxjs";
import {InvaidTextComponent} from "../../form/invaid-text/invaid-text.component";
import {InputMaskModule} from "primeng/inputmask";
import {DialogModule} from "primeng/dialog";
import {NgClass} from "@angular/common";
import {InputTextModule} from "primeng/inputtext";
import {ButtonModule} from "primeng/button";
import {InputOtpModule} from "primeng/inputotp";

@Component({
  selector: 'app-sms-dialog',
  standalone: true,
  imports: [
    InvaidTextComponent,
    InputMaskModule,
    ReactiveFormsModule,
    DialogModule,
    NgClass,
    InputTextModule,
    ButtonModule,
    InputOtpModule,
    FormsModule
  ],
  templateUrl: './sms-dialog.component.html',
  styleUrl: './sms-dialog.component.css'
})
export class SmsDialogComponent {
  visible: boolean = false;
  loading: boolean = false;
  value: any
  @Input() url: string | undefined;
  @Input() completeCallback: Function | undefined
  // public ruleForm = new FormGroup({
  //   phone_number: numberControl,
  // })
  constructor(
    private authService: AuthService,
  ) {
  }
  eventPipe() {
    this.closeDialog();
    if(this.completeCallback) this.completeCallback()
    // this.ruleForm.reset();
  }

  public onSubmit(): void {
    // this.ruleForm.markAllAsTouched()
    // if (this.ruleForm.invalid)  return;
    this.postLogin()
  }
  dataTransform() {
    return {
      // ...this.ruleForm.value,
      // phone_number: '+998'+this.ruleForm.value.phone_number?.replaceAll(' ','')
    }
  }
  postLogin() {
    this.loading = true
    const data = this.dataTransform()
    this.authService.postLogin(data)
      .pipe(finalize(() => this.loading = false))
      .subscribe((response) => {
        this.eventPipe();
      })
  }
  showDialog() {
    this.visible = true;
  }
  closeDialog() {
    this.visible = false;
  }
}
