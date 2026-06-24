import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { addressControl, descControl, titleControl } from '../../common/form-control';
import { ToastService } from '@services/toast';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { RequestService } from '@services/request';
import { environment } from '@environments';
import { Transport } from '@/core/interfaces/common.interface';
import { DEFAULT_DEAL_TYPE } from '@/core/constants/deal-type';

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
    deal_type: new FormControl(DEFAULT_DEAL_TYPE, [Validators.required]),
    agency: new FormControl<number | null>(null),
  });
  public loading: boolean = false;
  private agencyId: number | null = null;
  constructor(private toastService: ToastService, private router: Router, private requestService: RequestService) {}

  public setAgencyContext(agencyId: number | null): void {
    this.agencyId = agencyId;
    this.ruleForm.patchValue({ agency: agencyId });
  }

  public onSubmit(isEdit: boolean, id: number | string | null) {
    this.ruleForm.markAllAsTouched();
    if (this.ruleForm.valid) {
      isEdit ? this.putForm(id) : this.postForm();
    }
  }

  private payload() {
    return {
      ...this.ruleForm.value,
      agency: this.agencyId,
    };
  }

  private navigateAfterSave() {
    if (this.agencyId) {
      this.router.navigate(['/profile/agency'], { queryParams: { agency: this.agencyId } });
      return;
    }
    this.router.navigate(['/profile']);
  }

  postForm(): void {
    this.loading = true;
    this.requestService
      .requestData(environment.authUrls.POST_ANNONCEMENTS, 'POST', this.payload())
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((response) => {
        this.toastService.showMessage('success', 'Success', "E'lon muvaffaqiyatli yaratildi");
        this.navigateAfterSave();
      });
  }

  putForm(id: number | string | null): void {
    if (!id) return;
    this.loading = true;
    this.requestService
      .requestData(environment.authUrls.PUT_ANNONCEMENTS + id + '/', 'PUT', this.payload())
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((response) => {
        this.toastService.showMessage('success', 'Success', "E'lon muvaffaqiyatli yangilandi");
        this.navigateAfterSave();
      });
  }
}
