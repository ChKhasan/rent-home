import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InvaidTextComponent } from '../../form/invaid-text/invaid-text.component';
import { NgClass, NgForOf, NgIf, NgOptimizedImage, Location } from '@angular/common';
import { FormService } from '@/core/services/announcements/form.service';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { ImageModule } from 'primeng/image';
import { RippleModule } from 'primeng/ripple';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '@environments';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MapDialogComponent } from '../../modals/map-dialog/map-dialog.component';
import { RequestService } from '@services/request';
import { IAnnouncementInfo, IGendersList, Transport } from '@services/interfaces';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { DictionaryService } from '@/core/services/dictionary/dictionary.service';
interface UploadEvent {
  originalEvent: Event;
  files: File[];
}

@Component({
  selector: 'app-announcement-form',
  standalone: true,
  imports: [FormsModule, InputTextModule,InputSwitchModule, MultiSelectModule, DropdownModule, InvaidTextComponent, NgIf, ReactiveFormsModule, NgClass, TooltipModule, NgOptimizedImage, ButtonModule, ToastModule, FileUploadModule, InputTextareaModule, CheckboxModule, InputMaskModule, InputNumberModule, NgForOf, ImageModule, RippleModule, RouterLink, MapDialogComponent],
  templateUrl: './announcement-form.component.html',
  styleUrl: './announcement-form.component.css',
})
export class AnnouncementFormComponent implements OnInit {
  public ruleForm;
  private token: any;
  public headers: any;
  public genders: IGendersList[] = []
  uploadedFiles: any[] = [];
  private readonly id: number | string | null;
  formState = {
    transports: [],
    location_y: 0,
    location_x: 0,
  };
  @ViewChild(MapDialogComponent) mapDialogComponent!: MapDialogComponent;
  @Input() isEdit: boolean = false;
  public announcement!: any;
  constructor(
    public _formControl: FormService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private location: Location,
    private requestService: RequestService,
    private router: Router,
    public dictionaryService: DictionaryService
  ) {
    this.ruleForm = _formControl.ruleForm;
    this.id = this.route.snapshot.paramMap.get('id');
  }

  goBack() {
    this.router.navigate(['/profile']).then((r) => {});
  }

  fileUploaderHeaders() {
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem(environment.accessToken);
      this.headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
      });
    }
  }

  ngOnInit() {
    this.__GET_GENDERS()
    this.fileUploaderHeaders();
    if (this.isEdit) {
      this.requestService.getData<any>(environment.urls.GET_ANNONCEMENTS + this.id).subscribe((response: any): void => {
        this.announcement = response;

        this.uploadedFiles = response.images;
        this.ruleForm.patchValue({
          lessee_types: response.lessee_types.map((elem: any) => elem.id),
          transports: response.transports as Transport[],
          images: [],
          title: response.title,
          partnership: response.partnership,
          need_people_count: response.need_people_count,
          room_count: response.room_count,
          address: response.address,
          location_x: typeof response.location_x === 'string' ? parseFloat(response.location_x) : response.location_x || 0,
          location_y: typeof response.location_y === 'string' ? parseFloat(response.location_y) : response.location_y || 0,
          currency: response.currency,
          total_price: response.total_price,
          price_for_one: response.price_for_one,
          appartment_status: response.appartment_status,
          description: response.description,
          conditioner: response.conditioner,
          fridge: response.fridge,
          washing_machine: response.washing_machine,
          user: response.user,
          region: response.region
        });
      });
    }
  }

  onSubmit(): void {
    this.imagesPatcher();
  }
  __GET_GENDERS() {
    this.requestService.getData(environment.urls.GET_GENDERS).subscribe((response: any) => {
      this.genders = response.results
    })
  }
  imagesPatcher() {
    this.uploadedFiles.forEach((elem) => {
      const imagesControl = this.ruleForm.get('images');
      if (imagesControl && imagesControl.value)
        this.ruleForm.patchValue({
          images: [...imagesControl.value, elem?.uuid],
        });
    });
    this._formControl.onSubmit(this.isEdit, this.id);
  }

  onUpload(event: any) {
    if (event.originalEvent['body']) this.uploadedFiles.push(event.originalEvent['body']);

    this.messageService.add({
      severity: 'info',
      summary: 'File Uploaded',
      detail: '',
    });
  }

  openMapDialog() {
    this.isEdit &&
      this.mapDialogComponent?.handleLocation({
        lat: this.announcement.location_x || 0,
        lon: this.announcement.location_y || 0,
        display_name: '',
      });
    this.mapDialogComponent.showDialog();
  }

  formHandle = (obj: any) => {
    this.ruleForm.patchValue({
      transports: obj.transports,
      location_x: obj.coords[0],
      location_y: obj.coords[1],
    });
  };
}
