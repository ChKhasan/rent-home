import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { addressControl, descControl, titleControl } from '../../common/form-control';
import { ToastService } from '@services/toast';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { RequestService } from '@services/request';
import { environment } from '@environments';
import { DEFAULT_DEAL_TYPE } from '@/core/constants/deal-type';
import { CommissionType, PublisherType } from '@/core/interfaces/common.interface';
import { toGeoJSONPoint } from '@/core/geo';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  public ruleForm = new FormGroup({
    images: new FormControl<string[]>([]),
    title: titleControl,
    partnership: new FormControl(false),
    need_people_count: new FormControl(0),
    room_count: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    address: addressControl,
    location_x: new FormControl<number | null>(null),
    location_y: new FormControl<number | null>(null),
    currency: new FormControl('UZS'),
    total_price: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    price_for_one: new FormControl<number | null>(null),
    appartment_status: new FormControl(10),
    description: descControl,
    conditioner: new FormControl(false),
    fridge: new FormControl(false),
    washing_machine: new FormControl(false),
    user: new FormControl({}),
    region: new FormControl<number | null>(null, [Validators.required]),
    district: new FormControl<number | null>(null, [Validators.required]),
    area: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    floor: new FormControl(null),
    lessee_types: new FormControl([],[Validators.required, Validators.minLength(1)]),
    deal_type: new FormControl(DEFAULT_DEAL_TYPE, [Validators.required]),
    agency: new FormControl<number | null>(null),
    publisher_type: new FormControl<PublisherType>('OWNER', [Validators.required]),
    responsible_member_id: new FormControl<number | null>(null),
    commission_type: new FormControl<CommissionType | null>(null),
    commission_value: new FormControl<number | null>(null),
    commission_currency: new FormControl<'UZS' | 'USD' | null>(null),
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
    const value = {
      ...this.ruleForm.value,
      agency: this.agencyId,
      location: toGeoJSONPoint(
        this.ruleForm.controls.location_x.value,
        this.ruleForm.controls.location_y.value,
      ),
    };
    if (value.publisher_type === 'OWNER') {
      value.agency = null;
      value.responsible_member_id = null;
      value.commission_type = null;
      value.commission_value = null;
      value.commission_currency = null;
    } else if (value.publisher_type === 'INDEPENDENT_AGENT') {
      value.agency = null;
      value.responsible_member_id = null;
    }
    if (value.commission_type === 'NONE') {
      value.commission_value = null;
      value.commission_currency = null;
    } else if (value.commission_type === 'PERCENTAGE') {
      value.commission_currency = null;
    }
    return value;
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
        this.toastService.showMessage('success', 'Muvaffaqiyat', "E'lon moderatsiyaga yuborildi.");
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
        this.toastService.showMessage('success', 'Muvaffaqiyat', "O'zgarishlar saqlandi va e'lon qayta moderatsiyaga yuborildi.");
        this.navigateAfterSave();
      });
  }
}
