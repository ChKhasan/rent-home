import {Component} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {InputMaskModule} from "primeng/inputmask";
import {InputNumberModule} from "primeng/inputnumber";
import {InputTextModule} from "primeng/inputtext";
import {NgClass, NgIf} from "@angular/common";
import {PaginatorModule} from "primeng/paginator";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ValidationErrorAnimation} from "@animations";
import {InvaidTextComponent} from "../../form/invaid-text/invaid-text.component";
import {PasswordModule} from "primeng/password";
import {finalize} from "rxjs";
import {environment} from "@environments";
import {ToastService} from "@services/toast";
import {RequestService} from "@services/request";
@Component({
  selector: 'app-register-dialog',
  standalone: true,
  imports: [
    ButtonModule,
    DialogModule,
    InputMaskModule,
    InputNumberModule,
    InputTextModule,
    NgIf,
    PaginatorModule,
    ReactiveFormsModule,
    NgClass,
    InvaidTextComponent,
    PasswordModule
  ],
  animations: [ValidationErrorAnimation],
  templateUrl: './register-dialog.component.html',
  styleUrl: './register-dialog.component.css'
})

export class RegisterDialogComponent {
  visible: boolean = false;
  loading: boolean = false;
  infoError: boolean = false;
  public ruleForm = new FormGroup({
    password: new FormControl(undefined, [Validators.required,Validators.minLength(8),Validators.pattern(/^(?=.*[a-z])(?=.*\d).*$/)]),
    name: new FormControl("", [Validators.required,Validators.minLength(4)]),
    phone_number: new FormControl('', [Validators.required,Validators.pattern(/^\d{2} \d{3} \d{2} \d{2}$/)]),
  })
  constructor(
    private toastService: ToastService,
    private requestService: RequestService
  ) {
  }

  public onSubmit(): void {
    console.log(this.ruleForm)
    this.ruleForm.markAllAsTouched()
    if (this.ruleForm.invalid)  return;
    this.postRegister()
  }
  eventPipe(data: any) {
    this.closeDialog();
    this.ruleForm.reset();
    this.toastService.showMessage('success','Success',data.message)
  }
  dataTransform() {
    return {
      ...this.ruleForm.value,
      phone_number: '+998'+this.ruleForm.value.phone_number?.replaceAll(' ','')
    }
  }
  postRegister() {
    this.loading = true
    const data = this.dataTransform()
    this.requestService.requestData(environment.urls.POST_REGISTER,'POST',data)
      .pipe(finalize(() => {
        this.loading = false
      }))
      .subscribe((response) => {
      this.eventPipe({message: "Вы успешно зарегистрировались",response:response});
    }, (error) => {
      if (error.status === 400) this.infoError = true
    })

  }
  showDialog() {
    this.visible = true;
  }
  closeDialog() {
    this.visible = false;
  }

}
