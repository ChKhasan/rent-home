import {Component, Input} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {finalize} from "rxjs";
import {InvaidTextComponent} from "../../form/invaid-text/invaid-text.component";
import {InputMaskModule} from "primeng/inputmask";
import {DialogModule} from "primeng/dialog";
import {NgClass} from "@angular/common";
import {InputTextModule} from "primeng/inputtext";
import {ButtonModule} from "primeng/button";
import {InputOtpModule} from "primeng/inputotp";
import {environment} from "@environments";
import {RequestService} from "@services/request";

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
  code: any
  @Input() url: string | undefined;
  @Input() completeCallback: Function | undefined
  @Input() anotherPhoneNumber: Function | undefined
  // public ruleForm = new FormGroup({
  //   phone_number: numberControl,
  // })
  constructor(
    private requestService: RequestService
  ) {
  }
  eventPipe() {
    this.closeDialog();
    if(this.completeCallback) this.completeCallback()
    this.code = ''
  }

  public onSubmit(): void {
    // this.ruleForm.markAllAsTouched()
    // if (this.ruleForm.invalid)  return;
    this.postLogin()
  }
  dataTransform() {
    const phone_number = JSON.parse(localStorage.getItem('phone_number') || '');
    return {
      code: this.code + '',
      phone_number: '+998'+phone_number?.replaceAll(' ','')
    }
  }
  postLogin() {
    this.loading = true
    const data = this.dataTransform()
    this.requestService.requestData(environment.urls.POST_CODE,'POST',data)
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

  anotherPhoneNumberCall() {
    console.log('asdasdasdas');
    if(this.anotherPhoneNumber) this.anotherPhoneNumber()
  }
}
