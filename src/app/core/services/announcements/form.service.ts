import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { addressControl, descControl, titleControl } from '../../common/form-control';
import { ToastService } from '@services/toast';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { RequestService } from '@services/request';
import { environment } from '@environments';
import { Transport } from '@/core/interfaces/common.interface';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  public ruleForm = new FormGroup({
    transports: new FormControl<Transport[]>([]),
    images: new FormControl<string[]>([]),
    title: titleControl,
    partnership: new FormControl(false),
    need_people_count: new FormControl(0),
    room_count: new FormControl(0),
    address: addressControl,
    location_x: new FormControl(0),
    location_y: new FormControl(0),
    currency: new FormControl('UZS'),
    total_price: new FormControl(0),
    price_for_one: new FormControl(0),
    appartment_status: new FormControl(10),
    description: descControl,
    conditioner: new FormControl(false),
    fridge: new FormControl(false),
    washing_machine: new FormControl(false),
    user: new FormControl({}),
    region: new FormControl(null),
    district: new FormControl(null),
    area: new FormControl(null),
    floor: new FormControl(null),
    lessee_types: new FormControl([],[Validators.required, Validators.minLength(1)]),
  });
  public loading: boolean = false;
  constructor(private toastService: ToastService, private router: Router, private requestService: RequestService) {}

  public onSubmit(isEdit: Boolean, id: any) {
    this.ruleForm.markAllAsTouched();
    if (this.ruleForm.valid) {
      isEdit ? this.putForm(id) : this.postForm();
    } else {
    }
  }

  postForm(): void {
    this.loading = true;
    this.requestService
      .requestData(environment.authUrls.POST_ANNONCEMENTS, 'POST', this.ruleForm.value)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((response) => {
        this.toastService.showMessage('success', 'Success', 'Объявление успешно создано');
        this.router.navigate(['/profile']).then((r) => {});
      });
  }

  putForm(id: any): void {
    this.loading = true;
    this.requestService
      .requestData(environment.authUrls.PUT_ANNONCEMENTS + id + '/', 'PUT', this.ruleForm.value)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((response) => {
        this.toastService.showMessage('success', 'Success', 'Объявление успешно изменено');
        this.router.navigate(['/profile']);
      });
  }
}
