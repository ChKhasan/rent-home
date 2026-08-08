import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { SkeletonModule } from 'primeng/skeleton';
import { RequestService } from '@services/request';
import { ToastService } from '@services/toast';
import { AnnouncementsCardComponent } from '@/shared/components/cards/announcements-card/announcements-card.component';
import { VerificationStatus } from '@/core/interfaces/common.interface';
import { AuthService } from '@/core/services/auth/auth.service';
import { AuthPromptService } from '@/core/services/auth-prompt/auth-prompt.service';

type ProfileKind = 'broker' | 'agency';

@Component({
  selector: 'app-public-publisher-profile',
  standalone: true,
  imports: [FormsModule, ButtonModule, DialogModule, TextareaModule, SkeletonModule, AnnouncementsCardComponent],
  templateUrl: './public-profile.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './public-profile.component.css',
})
export class PublicPublisherProfileComponent implements OnInit {
  kind: ProfileKind = 'broker';
  loading = true;
  reporting = false;
  reportDialog = false;
  reportSuccess = false;
  reportDetails = '';
  data: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestService: RequestService,
    private authService: AuthService,
    private authPromptService: AuthPromptService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.kind = this.route.snapshot.data['kind'] as ProfileKind;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const url = this.kind === 'broker' ? `/api/brokers/${id}/` : `/api/agencies/${id}/public/`;
    this.requestService.getData<any>(url).pipe(finalize(() => (this.loading = false))).subscribe({
      next: (data) => (this.data = data),
      error: () => this.toastService.showMessage('error', 'Xatolik', 'Public profilni yuklab bo‘lmadi'),
    });
  }

  get entity(): any {
    return this.kind === 'broker' ? this.data?.profile : this.data?.agency;
  }

  get title(): string {
    if (this.kind === 'agency') return this.entity?.name || 'Agentlik';
    const user = this.entity?.user;
    const uniqueParts = [...new Set(
      [user?.name, user?.first_name, user?.last_name]
        .map((part) => part?.trim())
        .filter(Boolean)
    )];
    return uniqueParts.join(' ') || 'Mustaqil makler';
  }

  get subtitle(): string {
    return this.kind === 'broker' ? 'Mustaqil makler' : 'Agentlik';
  }

  get verificationStatus(): VerificationStatus | undefined {
    return this.entity?.verification_status;
  }

  get verificationLabel(): string {
    const labels: Record<VerificationStatus, string> = {
      UNVERIFIED: 'Tekshirilmagan',
      PENDING: 'Tekshiruvda',
      VERIFIED: 'Tekshirilgan',
      REJECTED: 'Tekshiruv rad etilgan',
      EXPIRED: 'Tekshiruv muddati tugagan',
    };
    return this.verificationStatus ? labels[this.verificationStatus] : '';
  }

  get avatar(): string | undefined {
    return this.kind === 'agency' ? this.entity?.logo : this.entity?.user?.images?.[0]?.image;
  }

  get phone(): string | undefined {
    return this.kind === 'agency' ? this.entity?.contact_phone : this.entity?.user?.phone_number;
  }

  get serviceRegionsLabel(): string {
    return (this.entity?.service_regions || []).map((region: any) => region.name).filter(Boolean).join(', ');
  }

  openReport(): void {
    if (!this.authService.auth) {
      this.authPromptService.open(this.router.url);
      return;
    }
    this.reportDetails = '';
    this.reportSuccess = false;
    this.reportDialog = true;
  }

  submitReport(): void {
    if (this.reportDetails.trim().length < 10 || this.reporting) return;
    const payload = this.kind === 'agency'
      ? { target_type: 'agency', category: 'hidden_broker', details: this.reportDetails, reported_agency: this.entity.id }
      : { target_type: 'user', category: 'hidden_broker', details: this.reportDetails, reported_user: this.entity.user.id };
    this.reporting = true;
    this.requestService.requestData('/api/content-reports/', 'POST', payload)
      .pipe(finalize(() => (this.reporting = false)))
      .subscribe({
        next: () => (this.reportSuccess = true),
        error: () => this.toastService.showMessage('error', 'Xatolik', 'Shikoyatni yuborib bo‘lmadi'),
      });
  }
}
