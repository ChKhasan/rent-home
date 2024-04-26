import {Component, Input} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {InputMaskModule} from "primeng/inputmask";
import {InputTextModule} from "primeng/inputtext";
import {InvaidTextComponent} from "../../form/invaid-text/invaid-text.component";
import {NgClass, NgIf} from "@angular/common";
import {PasswordModule} from "primeng/password";
import {numberControl} from "../../../../core/common/form-control";
import {AuthService} from "../../../../core/services/auth/auth.service";
import {finalize} from "rxjs";

@Component({
  selector: 'app-number-dialog',
  standalone: true,
  imports: [
    ButtonModule,
    DialogModule,
    FormsModule,
    InputMaskModule,
    InputTextModule,
    InvaidTextComponent,
    NgIf,
    PasswordModule,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './number-dialog.component.html',
  styleUrl: './number-dialog.component.css'
})
export class NumberDialogComponent {
  visible: boolean = false;
  loading: boolean = false;
  @Input() url: string | undefined;
  @Input() completeCallback: Function | undefined
  public ruleForm = new FormGroup({
    phone_number: numberControl,
  })
  constructor(
    private authService: AuthService,
  ) {
  }
  eventPipe() {
    this.closeDialog();
    if(this.completeCallback) this.completeCallback()
    this.ruleForm.reset();
  }

  public onSubmit(): void {
    this.ruleForm.markAllAsTouched()
    if (this.ruleForm.invalid)  return;
    this.postLogin()
  }
  dataTransform() {
    return {
      ...this.ruleForm.value,
      phone_number: '+998'+this.ruleForm.value.phone_number?.replaceAll(' ','')
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
