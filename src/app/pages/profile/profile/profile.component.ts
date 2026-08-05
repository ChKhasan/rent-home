import { Component, OnInit } from '@angular/core';
import { TabComponent } from '@components/profile/tab/tab.component';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InvaidTextComponent } from '@components/form/invaid-text/invaid-text.component';
import { NgClass, NgIf } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { emailControl, firstControl, lastControl, nameControl } from '@/core/common/form-control';
import { AuthService } from '@services/auth';
import { ToastService } from '@services/toast';
import { UserImages, IUserInfo } from '@services/interfaces';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { environment } from '@environments';
import { HttpHeaders } from '@angular/common/http';
import { RequestService } from '@services/request';
import { finalize } from 'rxjs';
import { SelectButtonModule } from 'primeng/selectbutton';
import { LikesComponent } from "../../likes/likes.component";
import { AnnouncementsComponent } from "../announcements/announcements.component";
import { RouterLink } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { AgencyAccessService } from '@services/agency-access';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, DialogModule, SelectButtonModule, InputMaskModule, InputNumberModule, InputTextModule, InvaidTextComponent, NgIf, PaginatorModule, FormsModule, ReactiveFormsModule, NgClass, ButtonModule, FileUploadModule, LikesComponent, AnnouncementsComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  loading: boolean = false;
  private token: any;
  private profileSnapshot: any = {};
  private avatarSnapshot: string = '';
  public headers: any;
  uploadedFiles: any[] = [];
  public avatar: string = '';
  public profileUser: Partial<IUserInfo> = {};
  public tab: string = 'announcements';
  public isEdit: boolean = false;
  public logoutDialog: boolean = false
  public hasAgencyAccess = false;
  public hasBrokerProfile = false;
  public ruleForm = new FormGroup({
    name: nameControl,
    first_name: firstControl,
    last_name: lastControl,
    email: emailControl,
    images: new FormControl<any>([]),
  });
  labels: any = {
    announcements: 'Mening E`lonlarim',
    likes: 'Saqlangan E`lonlar',
  }
  mLabels: any = {
    announcements: 'E`lonlarim',
    likes: 'Saqlangan',
  }
  stateOptions: any[] = [
    { label: 'Mening E`lonlarim', value: 'announcements', icon: 'pi pi-home' },
    { label: 'Saqlangan E`lonlar', value: 'likes', icon: 'pi pi-heart' },
  ];
  public imageUploadUrl = `${environment.baseUrl}/api/images/`;
  constructor(
    public authService: AuthService,
    private toastService: ToastService,
    private requestService: RequestService,
    private agencyAccessService: AgencyAccessService,
  ) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.fileUploaderHeaders();
      this.__GET_USER();
      this.checkAgencyAccess();
      this.checkPublisherCapabilities();
    }
  }

  __GET_USER() {
    this.requestService.getData<IUserInfo>(environment.authUrls.GET_ME).subscribe((data: IUserInfo) => {
      this.profileUser = data;
      this.authService.user = { ...this.authService.user, ...data };
      this.avatar = data.images.length > 0 ? data.images[0].image : '';
      this.avatarSnapshot = this.avatar;
      this.profileSnapshot = {
        name: data.name || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        images: data.images ? data.images.map((elem: UserImages) => elem.uuid) : [],
      };
      this.ruleForm.patchValue(this.profileSnapshot);
    });
  }

  imagesPatcher() {
    this.uploadedFiles.forEach((elem) => {
      const imagesControl = this.ruleForm.get('images');
      // if (imagesControl && imagesControl.value)

      this.ruleForm.patchValue({ images: [elem?.uuid] });
    });
    this.ruleForm.markAllAsTouched();
    if (this.ruleForm.invalid) return;
    this.putUser();
  }

  public onSubmit(): void {
    this.imagesPatcher();
  }

  eventPipe(data: any) {
    this.toastService.showMessage('success', 'Muvaffaqiyat', data.message);
  }

  putUser() {
    this.loading = true;
    const data = this.dataTransform();
    this.requestService
      .requestData(environment.authUrls.PUT_USER + this.authService.user.id + '/', 'PUT', data)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((response) => {
        this.__GET_USER();
        this.authService.authHandler();
        this.eventPipe({ message: "Profil ma'lumotlari yangilandi", response: response });
        this.isEdit = false;
      });
  }

  fileUploaderHeaders() {
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem(environment.accessToken);
      this.headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
    }
  }

  onUpload(event: any) {
    if (event.originalEvent['body']) {
      this.uploadedFiles = [event.originalEvent['body']];
      this.avatar = this.uploadedFiles[0].image;
    }
  }

  dataTransform() {
    return {
      ...this.ruleForm.value,
    };
  }

  get displayName(): string {
    const user = Object.keys(this.profileUser).length ? this.profileUser : this.authService.user || {};
    const uniqueParts = [...new Set([user.first_name, user.name, user.last_name].map((part) => part?.trim()).filter(Boolean))];
    return uniqueParts.join(' ') || 'Profil';
  }

  startEdit() {
    this.isEdit = true;
  }

  cancelEdit() {
    this.ruleForm.reset(this.profileSnapshot);
    this.uploadedFiles = [];
    this.avatar = this.avatarSnapshot;
    this.isEdit = false;
  }

  logout() {
    this.authService.logout();
    this.authService.user = {}
  }

  private checkAgencyAccess() {
    this.agencyAccessService.hasMembership().pipe(take(1)).subscribe((flag) => {
      this.hasAgencyAccess = flag;
    });
  }

  private checkPublisherCapabilities() {
    this.requestService.getData<any>(environment.authUrls.GET_PUBLISHER_CAPABILITIES).subscribe({
      next: (response) => (this.hasBrokerProfile = !!response?.publisher_capabilities?.independent_agent_available),
      error: () => (this.hasBrokerProfile = false),
    });
  }
}
