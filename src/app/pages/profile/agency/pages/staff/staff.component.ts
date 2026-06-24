import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { InputMaskModule } from 'primeng/inputmask';
import { PasswordModule } from 'primeng/password';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { finalize } from 'rxjs';
import { environment } from '@environments';
import { RequestService } from '@services/request';
import { ToastService } from '@services/toast';
import { IAgencyMembership } from '@services/interfaces';

interface AgencyMember {
  id: number;
  user?: {
    id?: number;
    name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    phone_number?: string | null;
  };
  role: 'owner' | 'staff';
  is_active: boolean;
}

@Component({
  selector: 'app-agency-staff',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    NgClass,
    InputTextModule,
    ButtonModule,
    TagModule,
    DropdownModule,
    DialogModule,
    InputMaskModule,
    PasswordModule,
    SkeletonModule,
    TooltipModule,
  ],
  templateUrl: './staff.component.html',
  styleUrl: './staff.component.css',
})
export class AgencyStaffComponent implements OnInit {
  membership?: IAgencyMembership;
  loadingMembership = false;
  loadingMembers = false;
  members: AgencyMember[] = [];

  showAddModal = false;
  showRoleModal = false;
  showPasswordModal = false;
  showStatusModal = false;
  activeMember?: AgencyMember;
  savingMember = false;
  savingRole = false;
  savingPassword = false;
  savingStatus = false;

  addForm = new FormGroup({
    phone_number: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\+998 \d{2} \d{3} \d{2} \d{2}$/)],
    }),
    role: new FormControl<'owner' | 'staff'>('staff', { nonNullable: true }),
  });

  passwordForm = new FormGroup({
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
  });

  roleForm = new FormGroup({
    role: new FormControl<'owner' | 'staff'>('staff', { nonNullable: true }),
  });

  constructor(
    private requestService: RequestService,
    private toastService: ToastService,
  ) {}

  roleOptions = [
    { label: 'Xodim', value: 'staff' },
    { label: 'Egasi', value: 'owner' },
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

  get agencyName() {
    return this.membership?.agency?.name || 'Agentlik';
  }

  get activeMembersCount() {
    return this.members.filter((member) => member.is_active).length;
  }

  get inactiveMembersCount() {
    return this.members.filter((member) => !member.is_active).length;
  }

  get ownerMembersCount() {
    return this.members.filter((member) => member.role === 'owner').length;
  }

  fetchMembership() {
    this.loadingMembership = true;
    this.requestService
      .getData<IAgencyMembership[]>(environment.authUrls.GET_MY_AGENCIES)
      .pipe(finalize(() => (this.loadingMembership = false)))
      .subscribe({
        next: (memberships) => {
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
          this.toastService.showMessage('error', 'Xatolik', 'Agentlik aʼzolik maʼlumotlarini olishda xato');
        }
      });
  }

  fetchMembers() {
    if (!this.agencyId) return;
    this.loadingMembers = true;
    this.requestService
      .getData<any>(environment.authUrls.GET_AGENCY_MEMBERS, { agency: this.agencyId })
      .pipe(finalize(() => (this.loadingMembers = false)))
      .subscribe({
        next: (response) => {
          this.members = response?.results ?? response ?? [];
        },
        error: () => {
          this.toastService.showMessage('error', 'Xatolik', 'Xodimlar roʻyxatini olishda xato');
        },
      });
  }

  openAddModal() {
    this.addForm.reset({ role: 'staff', phone_number: '' });
    this.showAddModal = true;
  }

  closeAddModal() {
    if (this.savingMember) return;
    this.showAddModal = false;
  }

  addMember() {
    if (!this.agencyId) return;
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    const payload = {
      agency: this.agencyId,
      phone_number: this.normalizePhone(this.addForm.controls.phone_number.value),
      user: null,
      role: this.addForm.value.role ?? 'staff',
      is_active: true,
    };
    this.savingMember = true;
    this.requestService
      .requestData(environment.authUrls.POST_AGENCY_MEMBERS, 'POST', payload)
      .pipe(finalize(() => (this.savingMember = false)))
      .subscribe({
        next: () => {
          this.toastService.showMessage('success', 'Saqlandi', 'Xodim qoʻshildi');
          this.addForm.reset({ role: 'staff', phone_number: '' });
          this.showAddModal = false;
          this.fetchMembers();
        },
        error: () => {
          this.toastService.showMessage('error', 'Xatolik', 'Xodim qoʻshishda xato');
        },
      });
  }

  openStatusModal(member: AgencyMember) {
    this.activeMember = member;
    this.showStatusModal = true;
  }

  closeStatusModal() {
    if (this.savingStatus) return;
    this.showStatusModal = false;
    this.activeMember = undefined;
  }

  toggleMember() {
    if (!this.activeMember) return;
    const nextStatus = !this.activeMember.is_active;
    const payload = { is_active: nextStatus };
    this.savingStatus = true;
    this.requestService
      .requestData(environment.authUrls.PATCH_AGENCY_MEMBERS + this.activeMember.id + '/', 'PATCH', payload)
      .pipe(finalize(() => (this.savingStatus = false)))
      .subscribe({
        next: () => {
          if (this.activeMember) {
            this.activeMember.is_active = nextStatus;
          }
          this.toastService.showMessage('success', 'Yangilandi', 'Xodim holati yangilandi');
          this.showStatusModal = false;
          this.activeMember = undefined;
        },
        error: () => {
          this.toastService.showMessage('error', 'Xatolik', 'Holatni yangilashda xato');
        },
      });
  }

  openRoleModal(member: AgencyMember) {
    this.activeMember = member;
    this.roleForm.reset({ role: member.role });
    this.showRoleModal = true;
  }

  closeRoleModal() {
    if (this.savingRole) return;
    this.showRoleModal = false;
    this.activeMember = undefined;
    this.roleForm.reset({ role: 'staff' });
  }

  updateRole() {
    if (!this.activeMember) return;
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }
    const role = this.roleForm.controls.role.value;
    this.savingRole = true;
    this.requestService
      .requestData(environment.authUrls.PATCH_AGENCY_MEMBERS + this.activeMember.id + '/', 'PATCH', { role })
      .pipe(finalize(() => (this.savingRole = false)))
      .subscribe({
        next: () => {
          if (this.activeMember) {
            this.activeMember.role = role;
          }
          this.toastService.showMessage('success', 'Yangilandi', 'Xodim roli yangilandi');
          this.showRoleModal = false;
          this.activeMember = undefined;
          this.roleForm.reset({ role: 'staff' });
        },
        error: () => {
          this.toastService.showMessage('error', 'Xatolik', 'Rolni yangilab bo‘lmadi');
        },
      });
  }

  openPasswordModal(member: AgencyMember) {
    this.activeMember = member;
    this.passwordForm.reset();
    this.showPasswordModal = true;
  }

  closePasswordModal() {
    if (this.savingPassword) return;
    this.showPasswordModal = false;
    this.activeMember = undefined;
    this.passwordForm.reset();
  }

  changePassword() {
    if (!this.activeMember) return;
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const payload = { password: this.passwordForm.value.password };
    this.savingPassword = true;
    this.requestService
      .requestData(
        environment.authUrls.POST_AGENCY_MEMBERS_CHANGE_PASSWORD + this.activeMember.id + '/change-password/',
        'POST',
        payload,
      )
      .pipe(finalize(() => (this.savingPassword = false)))
      .subscribe({
        next: () => {
          this.toastService.showMessage('success', 'Yangilandi', 'Parol yangilandi');
          this.showPasswordModal = false;
          this.activeMember = undefined;
          this.passwordForm.reset();
        },
        error: () => {
          this.toastService.showMessage('error', 'Xatolik', 'Parolni yangilab bo‘lmadi');
        },
      });
  }

  getMemberName(member?: AgencyMember): string {
    if (!member?.user) return 'Nomsiz foydalanuvchi';
    const fullName = [member.user.first_name, member.user.last_name].filter(Boolean).join(' ').trim();
    return member.user.name || fullName || 'Nomsiz foydalanuvchi';
  }

  getMemberInitial(member: AgencyMember): string {
    return this.getMemberName(member).charAt(0).toUpperCase() || 'X';
  }

  getRoleLabel(role?: AgencyMember['role']): string {
    return role === 'owner' ? 'Egasi' : 'Xodim';
  }

  getRoleSeverity(role?: AgencyMember['role']): 'warning' | 'info' {
    return role === 'owner' ? 'warning' : 'info';
  }

  getStatusLabel(member?: AgencyMember): string {
    return member?.is_active ? 'Aktiv' : "O'chirilgan";
  }

  getStatusActionLabel(member?: AgencyMember): string {
    return member?.is_active ? "O'chirish" : 'Aktivlash';
  }

  getStatusTooltip(member?: AgencyMember): string {
    return member?.is_active ? "Xodimni o'chirish" : 'Xodimni aktivlash';
  }

  getStatusIcon(member?: AgencyMember): string {
    return member?.is_active ? 'pi pi-ban' : 'pi pi-check';
  }

  getStatusDialogDescription(member?: AgencyMember): string {
    if (!member) return '';
    return member.is_active
      ? 'Bu xodim vaqtincha agentlik kabinetidan foydalana olmaydi.'
      : "Bu xodim agentlik kabinetidan yana foydalanishi mumkin bo'ladi.";
  }

  trackByMemberId(_: number, member: AgencyMember): number {
    return member.id;
  }

  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    return digits.startsWith('998') ? `+${digits}` : `+998${digits}`;
  }
}
