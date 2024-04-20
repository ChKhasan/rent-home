import {Component, OnDestroy, OnInit} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {InputMaskModule} from "primeng/inputmask";
import {InputNumberModule} from "primeng/inputnumber";
import {InputTextModule} from "primeng/inputtext";
import {NgClass, NgIf} from "@angular/common";
import {PaginatorModule} from "primeng/paginator";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {nameControl, numberControl, passwordControl} from "../../../../core/common/form-control";
import {ValidationErrorAnimation} from "../../../../core/common/animations";
import {InvaidTextComponent} from "../../form/invaid-text/invaid-text.component";
import {AuthService} from "../../../../core/services/auth/auth.service";
import {ToastService} from "../../../../core/services/toast/toast.service";
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
    InvaidTextComponent
  ],
  animations: [ValidationErrorAnimation],
  templateUrl: './register-dialog.component.html',
  styleUrl: './register-dialog.component.css'
})

export class RegisterDialogComponent {
  visible: boolean = false;
  loading: boolean = false;
  public ruleForm = new FormGroup({
    password: passwordControl,
    name: nameControl,
    phone_number: numberControl,
  })
  constructor(private authService: AuthService,private toastService: ToastService) {
  }

  public onSubmit(): void {
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
    this.authService.postRegister(data).subscribe((response) => {
      this.eventPipe({message: "Вы успешно зарегистрировались",response:response});
    },)

  }
  showDialog() {
    this.visible = true;
  }
  closeDialog() {
    this.visible = false;
  }

}
