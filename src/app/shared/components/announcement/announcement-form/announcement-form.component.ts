import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InvaidTextComponent } from '../../form/invaid-text/invaid-text.component';
import { DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { FormService } from '@/core/services/announcements/form.service';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { ImageModule } from 'primeng/image';
import { RippleModule } from 'primeng/ripple';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '@environments';
import { ActivatedRoute, Router } from '@angular/router';
import { MapDialogComponent } from '../../modals/map-dialog/map-dialog.component';
import { RequestService } from '@services/request';
import { CommissionType, IGendersList, PublisherType, VerificationStatus } from '@services/interfaces';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DictionaryService } from '@/core/services/dictionary/dictionary.service';
import { ValidationErrorAnimation } from '@/core/common/animations';
import { currenyTypes } from '@/core/constants/currency';
import { DEFAULT_DEAL_TYPE, DEAL_TYPE_OPTIONS, DealType } from '@/core/constants/deal-type';
import { finalize } from 'rxjs';
import { resolveAnnouncementCoordinates } from '@/core/geo';

@Component({
  selector: 'app-announcement-form',
  standalone: true,
  animations: [ValidationErrorAnimation],
  imports: [FormsModule, InputTextModule, ToggleSwitchModule, MultiSelectModule, SelectModule, InvaidTextComponent, NgIf, ReactiveFormsModule, TooltipModule, DecimalPipe, ButtonModule, ToastModule, FileUploadModule, TextareaModule, CheckboxModule, InputMaskModule, InputNumberModule, NgForOf, ImageModule, RippleModule, MapDialogComponent],
  providers: [FormService],
  templateUrl: './announcement-form.component.html',
  styleUrl: './announcement-form.component.css',
})
export class AnnouncementFormComponent implements OnInit {
  readonly steps = ['Asosiy ma’lumotlar', 'Manzil va uy', 'Suratlar va narx', 'Tekshirish'];
  readonly commissionOptions: Array<{ value: CommissionType; label: string }> = [
    { value: 'PERCENTAGE', label: 'Foizda' },
    { value: 'FIXED', label: 'Summa' },
    { value: 'NONE', label: 'Komissiyasiz' },
  ];
  public currentStep = 1;
  public capabilitiesLoading = true;
  public capabilities: PublisherCapabilities | null = null;
  public agencyMembersLoading = false;
  public agencyMembers: AgencyMemberOption[] = [];
  public ruleForm;
  private token: any;
  public headers: any;
  public genders: IGendersList[] = [];
  public status: boolean = true;
  uploadedFiles: any[] = [];
  imageValidationAttempted = false;
  value1: any;
  public currenyTypes = currenyTypes;
  public dealTypeOptions = DEAL_TYPE_OPTIONS;
  public selectedDealType: DealType = DEFAULT_DEAL_TYPE;
  private readonly id: number | string | null;
  public agencyId: number | null = null;
  public isAgencyMode = false;
  @ViewChild(MapDialogComponent) mapDialogComponent!: MapDialogComponent;
  @Input() isEdit: boolean = false;
  public announcement!: any;
  imageUploadUrl = `${environment.baseUrl}/api/images/`;
  constructor(public _formControl: FormService, private messageService: MessageService, private route: ActivatedRoute, private requestService: RequestService, private router: Router, public dictionaryService: DictionaryService) {
    this.ruleForm = _formControl.ruleForm;
    this.id = this.route.snapshot.paramMap.get('id');
  }

  goBack() {
    if (this.isAgencyMode) {
      this.router.navigate(['/profile/agency'], { queryParams: { agency: this.agencyId } });
      return;
    }
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
    this.ruleForm.reset({
      images: [],
      title: '',
      partnership: false,
      need_people_count: 0,
      room_count: null,
      address: '',
      location_x: null,
      location_y: null,
      currency: 'UZS',
      total_price: null,
      price_for_one: null,
      appartment_status: 10,
      description: '',
      conditioner: false,
      fridge: false,
      washing_machine: false,
      user: {},
      region: null,
      district: null,
      area: null,
      floor: null,
      lessee_types: [],
      deal_type: DEFAULT_DEAL_TYPE,
      agency: null,
      publisher_type: 'OWNER',
      responsible_member_id: null,
      commission_type: null,
      commission_value: null,
      commission_currency: null,
    });
    this.agencyId = this.getAgencyIdFromRoute();
    this.isAgencyMode = !!this.agencyId;
    this._formControl.setAgencyContext(this.agencyId);
    if (this.agencyId) this.ruleForm.patchValue({ publisher_type: 'AGENCY_AGENT' });
    this.selectedDealType = DEFAULT_DEAL_TYPE;
    this.__GET_GENDERS();
    this.__GET_PUBLISHER_CAPABILITIES();
    this.fileUploaderHeaders();
    if (this.isEdit) {
      const detailUrl = this.isAgencyMode ? environment.authUrls.GET_AGENCY_ANNOUNCEMENTS : environment.authUrls.GET_MY_ANNONCEMENTS;
      this.requestService.getData<any>(detailUrl + this.id + `/`).subscribe((response: any): void => {
        const coordinates = resolveAnnouncementCoordinates(response);
        this.announcement = response;
        this.status = response?.status;
        this.uploadedFiles = response.images;
        this.agencyId = response?.agency?.id || this.agencyId;
        this.isAgencyMode = !!this.agencyId;
        this._formControl.setAgencyContext(this.agencyId);
        this.ruleForm.patchValue({
          lessee_types: response.lessee_types.map((elem: any) => elem.id),
          images: [],
          title: response.title,
          partnership: response.partnership,
          need_people_count: response.need_people_count,
          room_count: response.room_count,
          address: response.address,
          location_x: coordinates?.[0] ?? null,
          location_y: coordinates?.[1] ?? null,
          currency: response.currency,
          total_price: response.total_price,
          price_for_one: response.price_for_one,
          appartment_status: response.appartment_status,
          description: response.description,
          conditioner: response.conditioner,
          fridge: response.fridge,
          washing_machine: response.washing_machine,
          user: response.user?.id,
          region: response.region,
          area: response.area,
          floor: response.floor,
          district: response.district,
          deal_type: response.deal_type || DEFAULT_DEAL_TYPE,
          agency: this.agencyId,
          publisher_type: response.publisher_type,
          responsible_member_id: response.publisher?.responsible_person?.id || null,
          commission_type: response.commission_type,
          commission_value: response.commission_value ? Number(response.commission_value) : null,
          commission_currency: response.commission_currency,
        });
        this.selectedDealType = this.ruleForm.get('deal_type')?.value || DEFAULT_DEAL_TYPE;
        if (!this.status) this.ruleForm.disable();
      });
    }
  }

  private getAgencyIdFromRoute(): number | null {
    const agency = this.route.snapshot.queryParamMap.get('agency');
    if (!agency) return null;
    const agencyId = Number(agency);
    return Number.isFinite(agencyId) && agencyId > 0 ? agencyId : null;
  }

  onSubmit(): void {
    if (!this.validateStep(4)) return;
    this.imagesPatcher();
  }

  nextStep(): void {
    if (!this.validateStep(this.currentStep)) return;
    this.currentStep = Math.min(4, this.currentStep + 1);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  previousStep(): void {
    this.currentStep = Math.max(1, this.currentStep - 1);
  }

  goToStep(step: number): void {
    if (step < this.currentStep) this.currentStep = step;
  }

  private validateStep(step: number): boolean {
    const fieldsByStep: Record<number, string[]> = {
      1: ['publisher_type', 'title', 'deal_type', 'lessee_types'],
      2: ['region', 'district', 'address', 'room_count', 'area', 'description', 'location_x', 'location_y'],
      3: ['total_price'],
      4: [],
    };
    const publisherType = this.ruleForm.controls.publisher_type.value;
    if (step === 1 && publisherType === 'AGENCY_AGENT') fieldsByStep[1].push('agency', 'responsible_member_id');
    if (step === 1 && publisherType !== 'OWNER') {
      fieldsByStep[1].push('commission_type');
      const commissionType = this.ruleForm.controls.commission_type.value;
      if (commissionType !== 'NONE') fieldsByStep[1].push('commission_value');
      if (commissionType === 'FIXED') fieldsByStep[1].push('commission_currency');
    }
    fieldsByStep[step].forEach((field) => this.ruleForm.get(field)?.markAsTouched());
    if (step === 3) this.imageValidationAttempted = true;

    const controlsValid = fieldsByStep[step].every((field) => {
      const value = this.ruleForm.get(field)?.value;
      return this.ruleForm.get(field)?.valid && value !== null && value !== '' && value !== 0;
    });
    const valid = controlsValid
      && (step !== 1 || this.isCommissionValid)
      && (step !== 2 || this.hasSelectedLocation)
      && (step !== 3 || this.uploadedFiles.length > 0);
    if (!valid) this.focusFirstInvalidField(step, fieldsByStep[step]);
    return valid;
  }

  private focusFirstInvalidField(step: number, fields: string[]): void {
    if (typeof document === 'undefined') return;
    const firstInvalid = fields.find((field) => {
      const control = this.ruleForm.get(field);
      const value = control?.value;
      return !control?.valid || value === null || value === '' || value === 0;
    });
    const idByControl: Record<string, string> = {
      title: 'title',
      lessee_types: 'lessee-types',
      agency: 'agency',
      responsible_member_id: 'responsible-member',
      commission_type: 'commission-none',
      commission_value: 'commission-percentage',
      commission_currency: 'commission-currency',
      region: 'region',
      district: 'district',
      address: 'address',
      location_x: 'location-picker',
      location_y: 'location-picker',
      room_count: 'room-count',
      area: 'area',
      description: 'description',
      total_price: 'total-price',
    };
    setTimeout(() => {
      let target = firstInvalid ? document.getElementById(idByControl[firstInvalid] || firstInvalid) : null;
      if (step === 3 && this.uploadedFiles.length === 0) {
        target = document.querySelector('.p-fileupload-choose') as HTMLElement | null;
      }
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target?.focus({ preventScroll: true });
    });
  }

  get hasSelectedLocation(): boolean {
    return this.ruleForm.controls.location_x.value !== null && this.ruleForm.controls.location_y.value !== null;
  }

  get isCommissionValid(): boolean {
    const publisherType = this.ruleForm.controls.publisher_type.value;
    if (publisherType === 'OWNER') return true;
    const type = this.ruleForm.controls.commission_type.value;
    const value = Number(this.ruleForm.controls.commission_value.value);
    if (!type) return false;
    if (type === 'NONE') return true;
    if (!value || value <= 0) return false;
    if (type === 'PERCENTAGE') return value <= 100;
    return !!this.ruleForm.controls.commission_currency.value;
  }

  get publisherType(): PublisherType {
    return this.ruleForm.controls.publisher_type.value || 'OWNER';
  }

  get publisherContextLabel(): string {
    if (this.publisherType === 'INDEPENDENT_AGENT') return 'Mustaqil makler sifatida';
    if (this.publisherType === 'AGENCY_AGENT') return this.selectedAgency?.name || 'Agentlik nomidan';
    return 'Uy egasi sifatida';
  }

  get selectedAgency(): PublisherAgencyCapability | undefined {
    const id = this.ruleForm.controls.agency.value;
    return this.capabilities?.agencies.find((agency) => agency.id === id);
  }

  get selectedResponsibleMember(): AgencyMemberOption | undefined {
    const id = this.ruleForm.controls.responsible_member_id.value;
    return this.agencyMembers.find((member) => member.id === id);
  }

  get canChangePublisher(): boolean {
    return !!this.capabilities && (this.capabilities.can_publish_as_independent_agent || this.capabilities.agencies.length > 0);
  }

  selectPublisher(type: PublisherType): void {
    if (this.isEdit) return;
    if (type === 'INDEPENDENT_AGENT' && !this.capabilities?.can_publish_as_independent_agent) return;
    if (type === 'AGENCY_AGENT' && !this.capabilities?.agencies.length) return;
    const agency = type === 'AGENCY_AGENT' ? this.selectedAgency || this.capabilities?.agencies[0] : undefined;
    const responsibleMemberId = agency?.role === 'BROKER' ? agency.membership_id : null;
    this.ruleForm.patchValue({
      publisher_type: type,
      agency: agency?.id || null,
      responsible_member_id: responsibleMemberId,
      commission_type: type === 'OWNER' ? null : this.ruleForm.controls.commission_type.value,
      commission_value: type === 'OWNER' ? null : this.ruleForm.controls.commission_value.value,
      commission_currency: type === 'OWNER' ? null : this.ruleForm.controls.commission_currency.value,
    });
    this.agencyId = agency?.id || null;
    this.isAgencyMode = type === 'AGENCY_AGENT';
    this._formControl.setAgencyContext(this.agencyId);
    if (agency) this.loadAgencyMembers(agency);
    else this.agencyMembers = [];
  }

  selectAgency(agencyId: number): void {
    const agency = this.capabilities?.agencies.find((item) => item.id === agencyId);
    if (!agency || this.isEdit) return;
    this.agencyId = agency.id;
    this.isAgencyMode = true;
    this.ruleForm.patchValue({
      agency: agency.id,
      responsible_member_id: agency.role === 'BROKER' ? agency.membership_id : null,
    });
    this._formControl.setAgencyContext(agency.id);
    this.loadAgencyMembers(agency);
  }

  private loadAgencyMembers(agency: PublisherAgencyCapability): void {
    this.agencyMembersLoading = true;
    this.requestService
      .getData<any>(environment.authUrls.GET_AGENCY_MEMBERS, { agency: agency.id })
      .pipe(finalize(() => (this.agencyMembersLoading = false)))
      .subscribe({
        next: (response) => {
          const rows = (Array.isArray(response) ? response : response?.results || []) as AgencyMemberApiRow[];
          const activeRows = rows.filter((member) => member.is_active);
          const visibleRows = agency.role === 'BROKER'
            ? activeRows.filter((member) => member.id === agency.membership_id)
            : activeRows;
          this.agencyMembers = visibleRows.map((member) => ({
            ...member,
            label: this.memberName(member),
            roleLabel: member.role === 'OWNER' ? 'Agentlik egasi' : member.role === 'MANAGER' ? 'Menejer' : 'Makler',
          }));
          const currentId = this.ruleForm.controls.responsible_member_id.value;
          if (agency.role === 'BROKER') {
            this.ruleForm.patchValue({ responsible_member_id: visibleRows[0]?.id || null });
          } else if (currentId && !visibleRows.some((member) => member.id === currentId)) {
            this.ruleForm.patchValue({ responsible_member_id: null });
          }
        },
        error: () => {
          this.agencyMembers = [];
          this.ruleForm.patchValue({ responsible_member_id: null });
        },
      });
  }

  private memberName(member: AgencyMemberApiRow): string {
    const user = member.user;
    const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim();
    return user?.name || fullName || user?.phone_number || 'Nomsiz xodim';
  }

  selectCommission(type: CommissionType): void {
    this.ruleForm.patchValue({
      commission_type: type,
      commission_value: type === 'NONE' ? null : this.ruleForm.controls.commission_value.value,
      commission_currency: type === 'FIXED' ? this.ruleForm.controls.commission_currency.value || 'UZS' : null,
    });
  }
  __GET_GENDERS() {
    this.requestService.getData(environment.urls.GET_GENDERS).subscribe((response: any) => {
      this.genders = response.results;
    });
  }
  __GET_PUBLISHER_CAPABILITIES() {
    this.requestService.getData<{ publisher_capabilities: PublisherCapabilities }>(environment.authUrls.GET_PUBLISHER_CAPABILITIES)
      .pipe(finalize(() => (this.capabilitiesLoading = false)))
      .subscribe(({ publisher_capabilities }) => {
        this.capabilities = publisher_capabilities;
        if (!this.isEdit && this.agencyId) {
          const agency = publisher_capabilities.agencies.find((item) => item.id === this.agencyId);
          if (agency) this.selectAgency(agency.id);
          else this.selectPublisher('OWNER');
        } else if (this.isEdit && this.agencyId) {
          const agency = publisher_capabilities.agencies.find((item) => item.id === this.agencyId);
          if (agency) this.loadAgencyMembers(agency);
        }
      });
  }
  imagesPatcher() {
    this.ruleForm.patchValue({ images: [] });
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
    if (this.uploadedFiles.length) this.imageValidationAttempted = false;

    this.messageService.add({
      severity: 'success',
      summary: 'Surat yuklandi',
      detail: '',
    });
  }
  removeImage(id: number) {
    this.requestService.requestData(`${environment.baseUrl}/api/images/${id}/`, 'DELETE').subscribe(() => {
      this.uploadedFiles = this.uploadedFiles.filter((elem) => elem.id !== id);
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
      location_x: obj.coords[0],
      location_y: obj.coords[1],
    });
  };
  onRegionChange(region: any): void {
    this.dictionaryService.__GET_DISTRICTS({ parent: region });
  }

  onDealTypeChange(type: DealType) {
    this.selectedDealType = type;
    this.ruleForm.patchValue({ deal_type: type });
  }

  statusChange(event: any) {
    const data = {
      announcement_id: this.announcement?.id,
      status: event.checked,
    };
    this.requestService.requestData(environment.authUrls.POST_ANNONCEMENT_STATUS, 'POST', data).subscribe((response: any) => {
      this.genders = response.results;
      event.checked ? this.ruleForm.enable() : this.ruleForm.disable();
    });
  }
}

interface PublisherAgencyCapability {
  id: number;
  membership_id: number;
  name: string;
  logo?: string | null;
  role: 'OWNER' | 'MANAGER' | 'BROKER';
  verification_status: VerificationStatus;
}

interface PublisherCapabilities {
  can_publish_as_owner: boolean;
  can_publish_as_independent_agent: boolean;
  independent_agent_available: boolean;
  independent_agent_block_reason?: string | null;
  agencies: PublisherAgencyCapability[];
}

interface AgencyMemberApiRow {
  id: number;
  user?: {
    name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    phone_number?: string | null;
  };
  role: 'OWNER' | 'MANAGER' | 'BROKER';
  role_label?: string;
  is_active: boolean;
  assigned_count?: number;
}

interface AgencyMemberOption extends AgencyMemberApiRow {
  label: string;
  roleLabel: string;
}
