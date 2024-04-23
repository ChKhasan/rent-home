import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {InvaidTextComponent} from "../../form/invaid-text/invaid-text.component";
import {NgClass, NgForOf, NgIf, NgOptimizedImage, Location} from "@angular/common";
import {FormService} from "../../../../core/services/announcements/form.service";
import {TooltipModule} from "primeng/tooltip";
import {ButtonModule} from "primeng/button";
import {ToastModule} from "primeng/toast";
import {FileUploadEvent, FileUploadModule} from "primeng/fileupload";
import {MessageService} from "primeng/api";
import {InputTextareaModule} from "primeng/inputtextarea";
import {CheckboxModule} from "primeng/checkbox";
import {InputMaskModule} from "primeng/inputmask";
import {InputNumberModule} from "primeng/inputnumber";
import {ImageModule} from "primeng/image";
import {RippleModule} from "primeng/ripple";
import {HttpHeaders} from "@angular/common/http";
import {environment} from "../../../../../environments/environment";
import {AnnouncementsService} from "../../../../core/services/announcements/announcements.service";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {MapDialogComponent} from "../../modals/map-dialog/map-dialog.component";

interface UploadEvent {
  originalEvent: Event;
  files: File[];
}

@Component({
  selector: 'app-announcement-form',
  standalone: true,
  imports: [
    FormsModule,
    InputTextModule,
    InvaidTextComponent,
    NgIf,
    ReactiveFormsModule,
    NgClass,
    TooltipModule,
    NgOptimizedImage,
    ButtonModule,
    ToastModule,
    FileUploadModule,
    InputTextareaModule,
    CheckboxModule,
    InputMaskModule,
    InputNumberModule,
    NgForOf,
    ImageModule,
    RippleModule,
    RouterLink,
    MapDialogComponent
  ],
  templateUrl: './announcement-form.component.html',
  styleUrl: './announcement-form.component.css',
})

export class AnnouncementFormComponent implements OnInit {
  public ruleForm;
  private token: any;
  public headers: any;
  uploadedFiles: any[] = [];
  private readonly id: number | string | null;
  formState = {
    transports: [],
    location_y: 0,
    location_x: 0
  }
  @ViewChild(MapDialogComponent) mapDialogComponent!: MapDialogComponent

  public fileList: any = []
  @Input() isEdit: boolean = false;
  public announcement = {
    location_x: undefined,
    location_y: undefined
  }

  constructor(
    public _formControl: FormService,
    private messageService: MessageService,
    private announcementService: AnnouncementsService,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.ruleForm = _formControl.ruleForm;
    this.id = this.route.snapshot.paramMap.get('id');
  }

  goBack() {
    this.location.back()
  }

  fileUploaderHeaders() {
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem(environment.accessToken);
      this.headers = new HttpHeaders({
        'Authorization': `Bearer ${this.token}`
      });
    }
  }

  ngOnInit() {
    this.fileUploaderHeaders()
    if (this.isEdit) {
      this.announcementService.getById(this.id).subscribe((response) => {
        this.announcement = response
        this.uploadedFiles = response.images
        this.ruleForm.patchValue({
          transports: response.transports,
          images: [],
          title: response.title,
          partnership: response.partnership,
          need_people_count: response.need_people_count,
          room_count: response.room_count,
          address: response.address,
          location_x: response.location_x,
          location_y: response.location_y,
          currency: response.currency,
          total_price: response.total_price,
          price_for_one: response.price_for_one,
          appartment_status: response.appartment_status,
          description: response.description,
          conditioner: response.conditioner,
          washing_machine: response.washing_machine,
          user: response.user,
        });

      })
    }

  }

  onSubmit(): void {
    this.imagesPatcher()
  }

  imagesPatcher() {
    this.uploadedFiles.forEach((elem => {
      const imagesControl = this.ruleForm.get('images');
      if (imagesControl && imagesControl.value)
        this.ruleForm.patchValue({images: [...imagesControl.value,elem?.uuid]})
    }))
    this._formControl.onSubmit(this.isEdit, this.id)
  }

  onUpload(event: any) {
    if (event.originalEvent['body']) this.uploadedFiles.push(event.originalEvent['body'])

    this.messageService.add({severity: 'info', summary: 'File Uploaded', detail: ''});
  }

  openMapDialog() {
    this.mapDialogComponent?.handleLocation({
      lat: this.announcement.location_x,
      lon: this.announcement.location_y,
      display_name: ""
    })
    this.mapDialogComponent.showDialog()
  }

  formHandle = (obj: any) => {
    this.ruleForm.patchValue({
      transports: obj.transports,
      location_x: obj.coords[0],
      location_y: obj.coords[1]
    })
  };
}
