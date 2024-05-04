import {Component, Input} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {InputMaskModule} from "primeng/inputmask";
import {InputNumberModule} from "primeng/inputnumber";
import {InputTextModule} from "primeng/inputtext";
import {NgClass, NgIf} from "@angular/common";
import {PaginatorModule} from "primeng/paginator";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {numberControl, passwordControl} from "../../../../core/common/form-control";
import {ValidationErrorAnimation} from "../../../../core/common/animations";
import {InvaidTextComponent} from "../../form/invaid-text/invaid-text.component";
import {AuthService} from "../../../../core/services/auth/auth.service";
import {ToastService} from "../../../../core/services/toast/toast.service";
import {environment} from "../../../../../environments/environment";
import {Router} from "@angular/router";
import {finalize} from "rxjs";
import {PasswordModule} from "primeng/password";
import {WebSocketService} from "../../../../core/services/webSocket/web-socket.service";
@Component({
  selector: 'app-auth-dialog',
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
  templateUrl: './auth-dialog.component.html',
  styleUrl: './auth-dialog.component.css'
})
export class AuthDialogComponent {
  visible: boolean = false;
  loading: boolean = false;
  @Input() url: string | undefined
  @Input() afterComplite: Function | undefined
  public ruleForm = new FormGroup({
    password: passwordControl,
    phone_number: numberControl,
  })
  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private webSocketService: WebSocketService,
  ) {
  }
  eventPipe(data: any) {
    this.tokenHandle(data.response)
    this.closeDialog();
    this.ruleForm.reset();
    this.toastService.showMessage('success','Success',data.message)
    this.authService.authHandler();
    if(this.afterComplite) this.afterComplite()

  }
  tokenHandle(data: any) {
    localStorage.setItem(environment.accessToken,data.access)
    localStorage.setItem(environment.refreshToken,data.refresh);
    if(this.url)
    this.router.navigate([this.url]).then(r => {})

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
      this.eventPipe({message: "Добро пожаловать",response:response});
    })

  }
  showDialog() {
    this.visible = true;
  }
  closeDialog() {
    this.visible = false;
  }

}
