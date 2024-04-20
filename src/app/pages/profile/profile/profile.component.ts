import {Component, OnInit} from '@angular/core';
import {TabComponent} from "../../../shared/components/profile/tab/tab.component";
import {InputMaskModule} from "primeng/inputmask";
import {InputNumberModule} from "primeng/inputnumber";
import {InputTextModule} from "primeng/inputtext";
import {InvaidTextComponent} from "../../../shared/components/form/invaid-text/invaid-text.component";
import {NgClass, NgIf} from "@angular/common";
import {PaginatorModule} from "primeng/paginator";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {
  emailControl,
  firstControl, lastControl,
  nameControl,
  numberControl,
  passwordControl
} from "../../../core/common/form-control";
import {AuthService} from "../../../core/services/auth/auth.service";
import {ToastService} from "../../../core/services/toast/toast.service";
import {ActivatedRoute} from "@angular/router";
import {UserInfo} from "../../../core/interfaces/common.interface";
import {ButtonModule} from "primeng/button";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    TabComponent,
    InputMaskModule,
    InputNumberModule,
    InputTextModule,
    InvaidTextComponent,
    NgIf,
    PaginatorModule,
    ReactiveFormsModule,
    NgClass,
    ButtonModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit{
  loading: boolean = false;
  public ruleForm = new FormGroup({
    name: nameControl,
    first_name: firstControl,
    last_name: lastControl,
    email: emailControl,
  })
  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private route: ActivatedRoute
  ) {
  }
  ngOnInit() {
    if(typeof window !== "undefined") {
      this.authService.getUser().subscribe((data: UserInfo) => {
        this.ruleForm.patchValue({
          name: data.name || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
        })
      })

    }
  }

  public onSubmit(): void {
    this.ruleForm.markAllAsTouched()
    if (this.ruleForm.invalid)  return;
    this.putUser()
  }
  eventPipe(data: any) {
    this.ruleForm.reset();
    this.toastService.showMessage('success','Success',data.message);

  }
  putUser() {
    this.loading = true
    const data = this.dataTransform()
    this.authService.put(data,this.authService.user.id).subscribe((response) => {
      this.eventPipe({message: "Успешно изменено",response:response});
    },)

  }
  dataTransform() {
    return {
      ...this.ruleForm.value,
    }
  }

}
