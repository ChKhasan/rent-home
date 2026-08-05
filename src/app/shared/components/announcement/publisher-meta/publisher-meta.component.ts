import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LucideBadgeCheck, LucideBuilding2, LucideHouse, LucideUserRound } from '@lucide/angular';
import { IPublisherAnnouncementFields, VerificationStatus } from '@/core/interfaces/common.interface';

@Component({
  selector: 'app-publisher-meta',
  standalone: true,
  imports: [
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    LucideBadgeCheck,
    LucideBuilding2,
    LucideHouse,
    LucideUserRound,
  ],
  templateUrl: './publisher-meta.component.html',
  styleUrl: './publisher-meta.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublisherMetaComponent {
  @Input({ required: true }) announcement!: IPublisherAnnouncementFields;
  @Input() compact = true;
  @Input() showDate = true;
  @Input() showCommission = true;

  get hasPublisher(): boolean {
    return !!this.announcement?.publisher_type && !!this.announcement?.publisher;
  }

  get publisherLabel(): string {
    const publisher = this.announcement?.publisher;
    if (!publisher) return '';
    if (publisher.type === 'AGENCY_AGENT') return publisher.agency?.name || publisher.display_name || 'Agentlik vakili';
    return publisher.display_name || publisher.label;
  }

  get publisherRoleLabel(): string {
    const publisher = this.announcement?.publisher;
    if (!publisher) return '';
    if (publisher.type === 'OWNER') return 'Uy egasi';
    if (publisher.type === 'INDEPENDENT_AGENT') return 'Mustaqil makler';
    if (publisher.type === 'AGENCY_AGENT') return 'Agentlik';
    return publisher.label;
  }

  get verificationStatus(): VerificationStatus | null {
    return this.announcement?.publisher?.verification_status || null;
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

  get confirmedDateLabel(): string {
    const raw = this.announcement?.last_confirmed_at;
    if (!raw) return '';
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return '';
    const monthNames = [
      'yanvar',
      'fevral',
      'mart',
      'aprel',
      'may',
      'iyun',
      'iyul',
      'avgust',
      'sentabr',
      'oktabr',
      'noyabr',
      'dekabr',
    ];
    return `${date.getDate()} ${monthNames[date.getMonth()]}da tasdiqlangan`;
  }
}
