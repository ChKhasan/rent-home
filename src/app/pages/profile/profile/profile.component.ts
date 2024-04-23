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
import {FileUploadModule} from "primeng/fileupload";
import {environment} from "../../../../environments/environment";
import {HttpHeaders} from "@angular/common/http";

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
    ButtonModule,
    FileUploadModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit{
  loading: boolean = false;
  private token: any;
  public headers: any;
  uploadedFiles: any[] = [];
  public ruleForm = new FormGroup({
    name: nameControl,
    first_name: firstControl,
    last_name: lastControl,
    email: emailControl,
    images: new FormControl<any>([])
  })
  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private route: ActivatedRoute
  ) {
  }
  ngOnInit() {
    if(typeof window !== "undefined") {
      this.fileUploaderHeaders()
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
  imagesPatcher() {
    this.uploadedFiles.forEach((elem => {
      const imagesControl = this.ruleForm.get('images');
      if (imagesControl && imagesControl.value)
        this.ruleForm.patchValue({images: [...imagesControl.value,elem?.uuid]})
    }))
    this.ruleForm.markAllAsTouched()
    if (this.ruleForm.invalid)  return;
    this.putUser()
  }
  public onSubmit(): void {
    this.imagesPatcher()

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
  fileUploaderHeaders() {
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem(environment.accessToken);
      this.headers = new HttpHeaders({
        'Authorization': `Bearer ${this.token}`
      });
    }
  }
  onUpload(event: any) {
    if (event.originalEvent['body']) this.uploadedFiles.push(event.originalEvent['body'])

    // this.messageService.add({severity: 'info', summary: 'File Uploaded', detail: ''});
  }
  dataTransform() {
    return {
      ...this.ruleForm.value,
    }
  }

}
