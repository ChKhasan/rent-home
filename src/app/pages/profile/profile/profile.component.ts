import {Component, OnInit} from '@angular/core';
import {TabComponent} from "@components/profile/tab/tab.component";
import {InputMaskModule} from "primeng/inputmask";
import {InputNumberModule} from "primeng/inputnumber";
import {InputTextModule} from "primeng/inputtext";
import {InvaidTextComponent} from "@components/form/invaid-text/invaid-text.component";
import {NgClass, NgIf} from "@angular/common";
import {PaginatorModule} from "primeng/paginator";
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {
  emailControl,
  firstControl, lastControl,
  nameControl,
} from "@/core/common/form-control";
import {AuthService} from "@services/auth";
import {ToastService} from "@services/toast";
import {UserImages, UserInfo} from "@services/interfaces";
import {ButtonModule} from "primeng/button";
import {FileUploadModule} from "primeng/fileupload";
import {environment} from "@environments";
import {HttpHeaders} from "@angular/common/http";
import {RequestService} from "@services/request";
import {finalize} from "rxjs";

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
export class ProfileComponent implements OnInit {
  loading: boolean = false;
  private token: any;
  public headers: any;
  uploadedFiles: any[] = [];
  public avatar: string = ''
  public ruleForm = new FormGroup({
    name: nameControl,
    first_name: firstControl,
    last_name: lastControl,
    email: emailControl,
    images: new FormControl<any>([])
  })

  constructor(
    public authService: AuthService,
    private toastService: ToastService,
    private requestService: RequestService
  ) {
  }

  ngOnInit() {
    if (typeof window !== "undefined") {
      console.log(this.authService.user)
      this.fileUploaderHeaders()
      this.__GET_USER()
    }
  }

  __GET_USER() {
    this.requestService.getData<UserInfo>(environment.authUrls.GET_ME)
      .subscribe((data: UserInfo) => {
      this.avatar = data.images.length > 0 ? data.images[0].image:''
      this.ruleForm.patchValue({
        name: data.name || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        images: data.images ? data.images.map((elem: UserImages) => elem.uuid) : []
      })
    })
  }

  imagesPatcher() {
    this.uploadedFiles.forEach((elem => {
      const imagesControl = this.ruleForm.get('images');
      // if (imagesControl && imagesControl.value)

      this.ruleForm.patchValue({images: [elem?.uuid]})
      console.log(this.avatar)
    }))
    this.ruleForm.markAllAsTouched()
    if (this.ruleForm.invalid) return;
    this.putUser()
  }

  public onSubmit(): void {
    this.imagesPatcher()

  }

  eventPipe(data: any) {
    this.ruleForm.reset();
    this.toastService.showMessage('success', 'Success', data.message);

  }

  putUser() {
    this.loading = true
    const data = this.dataTransform()
    this.requestService.requestData(environment.authUrls.PUT_USER + this.authService.user.id + '/','PUT',data)
      .pipe(finalize(() => this.loading = false))
      .subscribe((response) => {
      this.__GET_USER()
      this.authService.authHandler()
      this.eventPipe({message: "Успешно изменено", response: response});
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
    if (event.originalEvent['body']) {
      this.uploadedFiles = [event.originalEvent['body']]
      this.avatar = this.uploadedFiles[0].image
    }
  }

  dataTransform() {
    return {
      ...this.ruleForm.value,
    }
  }

}
