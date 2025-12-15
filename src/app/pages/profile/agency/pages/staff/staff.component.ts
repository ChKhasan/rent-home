import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { environment } from '@environments';
import { RequestService } from '@services/request';
import { ToastService } from '@services/toast';
import { IAgencyMembership } from '@services/interfaces';

interface AgencyMember {
  id: number;
  user: { id: number; name?: string | null; first_name?: string | null; phone_number?: string | null };
  role: 'owner' | 'staff';
  is_active: boolean;
}

@Component({
  selector: 'app-agency-staff',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgForOf, InputTextModule, ButtonModule, TagModule, DropdownModule],
  templateUrl: './staff.component.html',
  styleUrl: './staff.component.css',
})
export class AgencyStaffComponent implements OnInit {
  membership?: IAgencyMembership;
  loadingMembership = false;
  loadingMembers = false;
  members: AgencyMember[] = [];
  showPasswordModal = false;
  activeMember?: AgencyMember;

  addForm = new FormGroup({
    phone_number: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    role: new FormControl<'owner' | 'staff'>('staff', { nonNullable: true }),
  });

  passwordForm = new FormGroup({
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
  });

  constructor(
    private requestService: RequestService,
    private toastService: ToastService,
  ) {}

  roleOptions = [
    { label: 'Staff', value: 'staff' },
    { label: 'Owner', value: 'owner' },
  ];

  ngOnInit(): void {
    this.fetchMembership();
  }

  get isOwner() {
    return this.membership?.role === 'owner';
  }

  get agencyId() {
    return this.membership?.agency?.id;
  }

  fetchMembership() {
    this.loadingMembership = true;
    this.requestService.getData<IAgencyMembership[]>(environment.authUrls.GET_MY_AGENCIES).subscribe({
      next: (memberships) => {
        this.loadingMembership = false;
        if (!memberships || memberships.length === 0) {
          this.membership = undefined;
          return;
        }
        this.membership = memberships[0];
        if (this.isOwner) {
          this.fetchMembers();
        }
      },
      error: () => {
        this.loadingMembership = false;
        this.toastService.showMessage('error', 'Xatolik', 'Agentlik aʼzolik maʼlumotlarini olishda xato');
      },
    });
  }

  fetchMembers() {
    if (!this.agencyId) return;
    this.loadingMembers = true;
    this.requestService
      .getData<any>(environment.authUrls.GET_AGENCY_MEMBERS, { agency: this.agencyId })
      .subscribe({
        next: (response) => {
          this.loadingMembers = false;
          this.members = response?.results ?? response ?? [];
        },
        error: () => {
          this.loadingMembers = false;
          this.toastService.showMessage('error', 'Xatolik', 'Xodimlar roʻyxatini olishda xato');
        },
      });
  }

  addMember() {
    if (!this.agencyId) return;
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    const payload = {
      agency: this.agencyId,
      phone_number: this.addForm.value.phone_number,
      user: null,
      role: this.addForm.value.role ?? 'staff',
      is_active: true,
    };
    this.requestService
      .requestData(environment.authUrls.POST_AGENCY_MEMBERS, 'POST', payload)
      .subscribe({
        next: () => {
          this.toastService.showMessage('success', 'Saqlandi', 'Xodim qoʻshildi');
          this.addForm.reset({ role: 'staff', phone_number: '' });
          this.fetchMembers();
        },
        error: () => {
          this.toastService.showMessage('error', 'Xatolik', 'Xodim qoʻshishda xato');
        },
      });
  }

  toggleMember(member: AgencyMember) {
    const payload = { is_active: !member.is_active };
    this.requestService
      .requestData(environment.authUrls.PATCH_AGENCY_MEMBERS + member.id + '/', 'PATCH', payload)
      .subscribe({
        next: () => {
          member.is_active = !member.is_active;
        },
        error: () => {
          this.toastService.showMessage('error', 'Xatolik', 'Holatni yangilashda xato');
        },
      });
  }

  openPasswordModal(member: AgencyMember) {
    this.activeMember = member;
    this.passwordForm.reset();
    this.showPasswordModal = true;
  }

  changePassword() {
    if (!this.activeMember) return;
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const payload = { password: this.passwordForm.value.password };
    this.requestService
      .requestData(
        environment.authUrls.POST_AGENCY_MEMBERS_CHANGE_PASSWORD + this.activeMember.id + '/change-password/',
        'POST',
        payload,
      )
      .subscribe({
        next: () => {
          this.toastService.showMessage('success', 'Yangilandi', 'Parol yangilandi');
          this.showPasswordModal = false;
          this.passwordForm.reset();
        },
        error: () => {
          this.toastService.showMessage('error', 'Xatolik', 'Parolni yangilab bo‘lmadi');
        },
      });
  }
}
