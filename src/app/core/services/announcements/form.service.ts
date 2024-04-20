import {Injectable} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {
  addressControl,
  descControl,
  titleControl
} from "../../common/form-control";
import {AnnouncementsService} from "./announcements.service";
import {ToastService} from "../toast/toast.service";
import {ActivatedRoute, Router} from "@angular/router";
import {finalize} from "rxjs";

@Injectable({
  providedIn: "root",
})
export class FormService {
  submitCallback!: Function;
  public ruleForm = new FormGroup({
    transports: new FormControl([]),
    images: new FormControl<string[]>([]),
    title: titleControl,
    partnership: new FormControl(false),
    need_people_count: new FormControl(0),
    room_count: new FormControl(0),
    address: addressControl,
    location_x: new FormControl(''),
    location_y: new FormControl(''),
    currency: new FormControl('USD'),
    total_price: new FormControl(0),
    price_for_one: new FormControl(0),
    appartment_status: new FormControl(10),
    description: descControl,
    conditioner: new FormControl(false),
    washing_machine: new FormControl(false),
    user: new FormControl(1),
  });
  public loading: boolean = false;
  constructor(
    private announcementsService: AnnouncementsService,
    private toastService: ToastService,
    private router: Router,
    ) {
  }

  public onSubmit(isEdit: Boolean,id: any) {
    this.ruleForm.markAllAsTouched()
    if (this.ruleForm.valid) {
      isEdit ? this.putForm(id):this.postForm()
    } else {
    }
  }

  postForm(): void {
    this.loading = true;
    this.announcementsService.post(this.ruleForm.value)
      .pipe(finalize(() => this.loading = false))
      .subscribe(
      (response) => {
        this.toastService.showMessage('success','Success','Объявление успешно создано');
        this.router.navigate(['/profile/announcements']).then(r => {})
      }
    );
  }

  putForm(id: any): void {
    this.loading = true;
    this.announcementsService.put(this.ruleForm.value,id )
      .pipe(finalize(() => this.loading = false))
      .subscribe(
      (response) => {
        this.toastService.showMessage('success','Success','Объявление успешно изменено');
        this.router.navigate(['/profile/announcements'])
      }
    );
  }
}
