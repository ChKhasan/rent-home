import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { environment } from '@environments';
import { RequestService } from '@services/request';
import { ToastService } from '@services/toast';
import { IAgencyMembership } from '@services/interfaces';

@Component({
  selector: 'app-agency-info',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, InputTextModule, ButtonModule, SkeletonModule],
  templateUrl: './info.component.html',
  styleUrl: './info.component.css',
})
export class AgencyInfoComponent implements OnInit {
  loading = false;
  saving = false;
  isOwner = false;
  agency?: IAgencyMembership['agency'];

  form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    inn: new FormControl<string | null>(null),
    license_number: new FormControl<string | null>(null),
    address: new FormControl<string | null>(null),
    contact_phone: new FormControl<string | null>(null),
  });

  constructor(
    private requestService: RequestService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadAgency();
  }

  loadAgency() {
    this.loading = true;
    this.requestService
      .getData<IAgencyMembership[]>(environment.authUrls.GET_MY_AGENCIES)
      .subscribe({
        next: (memberships) => {
          this.loading = false;
          if (!memberships || memberships.length === 0) {
            this.agency = undefined;
            this.form.disable();
            return;
          }
          const membership = memberships[0];
          this.agency = membership.agency;
          this.isOwner = membership.role === 'owner';
          this.patchForm();
        },
        error: () => {
          this.loading = false;
          this.form.disable();
          this.toastService.showMessage('error', 'Xatolik', 'Agentlik maʼlumotlarini olishda xato');
        },
      });
  }

  patchForm() {
    if (!this.agency) {
      return;
    }
    this.form.patchValue({
      name: this.agency.name,
      inn: this.agency.inn,
      license_number: this.agency.license_number,
      address: this.agency.address,
      contact_phone: this.agency.contact_phone,
    });
    this.form.disable();
  }

  save() {
    if (!this.agency) {
      return;
    }
    this.toastService.showMessage('warn', 'Tahrirlash imkoni yo‘q', 'Agentlik maʼlumotlarini faqat admin panelda o‘zgartirish mumkin');
  }
}
