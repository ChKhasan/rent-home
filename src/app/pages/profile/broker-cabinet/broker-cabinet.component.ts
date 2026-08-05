import { Component, HostListener, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MultiSelectModule } from 'primeng/multiselect';
import { environment } from '@environments';
import { RequestService } from '@services/request';
import { ToastService } from '@services/toast';
import { DictionaryService } from '@/core/services/dictionary/dictionary.service';
import { VerificationStatus } from '@/core/interfaces/common.interface';

@Component({
  selector: 'app-broker-cabinet',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, TextareaModule, ToggleSwitchModule, MultiSelectModule],
  templateUrl: './broker-cabinet.component.html',
  styleUrl: './broker-cabinet.component.css',
})
export class BrokerCabinetComponent implements OnInit {
  readonly bioMaxLength = 800;
  loading = true;
  saving = false;
  profile: any;
  form = new FormGroup({
    bio: new FormControl('', { nonNullable: true }),
    languagesText: new FormControl('', { nonNullable: true }),
    service_region_ids: new FormControl<number[]>([], { nonNullable: true }),
    is_public: new FormControl(true, { nonNullable: true }),
  });

  constructor(
    private requestService: RequestService,
    private toastService: ToastService,
    public dictionaryService: DictionaryService,
  ) {}

  ngOnInit(): void {
    this.requestService.getData<any>(environment.authUrls.BROKER_PROFILE_ME)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (profile) => {
          this.profile = profile;
          this.form.patchValue({
            bio: profile.bio || '',
            languagesText: (profile.languages || []).join(', '),
            service_region_ids: (profile.service_regions || []).map((region: any) => region.id),
            is_public: profile.is_public,
          });
          this.form.markAsPristine();
        },
        error: () => this.toastService.showMessage('error', 'Xatolik', 'Makler profilini yuklab bo‘lmadi'),
      });
  }

  get verificationLabel(): string {
    const labels: Record<VerificationStatus, string> = {
      UNVERIFIED: 'Tekshirilmagan', PENDING: 'Tekshiruvda', VERIFIED: 'Tekshirilgan',
      REJECTED: 'Tekshiruv rad etilgan', EXPIRED: 'Tekshiruv muddati tugagan',
    };
    return labels[this.profile?.verification_status as VerificationStatus] || '';
  }

  hasUnsavedChanges(): boolean {
    return this.form.dirty && !this.saving;
  }

  @HostListener('window:beforeunload', ['$event'])
  protectUnsavedChanges(event: BeforeUnloadEvent): void {
    if (!this.hasUnsavedChanges()) return;
    event.preventDefault();
  }

  save(): void {
    if (this.saving) return;
    const value = this.form.getRawValue();
    const payload = {
      bio: value.bio.trim(),
      languages: value.languagesText.split(',').map((language) => language.trim()).filter(Boolean),
      service_region_ids: value.service_region_ids,
      is_public: value.is_public,
    };
    this.saving = true;
    this.requestService.requestData<any>(environment.authUrls.BROKER_PROFILE_ME, 'PUT', payload)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (profile) => {
          this.profile = profile;
          this.form.markAsPristine();
          this.toastService.showMessage('success', 'Saqlandi', 'Makler profili yangilandi');
        },
        error: () => this.toastService.showMessage('error', 'Xatolik', 'Profilni saqlab bo‘lmadi'),
      });
  }
}
