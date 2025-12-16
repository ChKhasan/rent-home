import { Component, OnInit } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { RequestService } from '@services/request';
import { environment } from '@environments';

interface RangeOption {
  key: 'today' | 'week' | 'month';
  label: string;
}

interface AnnouncementStat {
  id: number;
  title: string;
  views: number;
  last_view: string | null;
  filter_exposures: number;
  recommendation_exposures: number;
  exposure_total: number;
}

interface ExposureBreakdown {
  filter?: number;
  recommendation?: number;
  total?: number;
  [key: string]: number | undefined;
}

interface AgencyStatsResponse {
  range: string;
  range_label: string;
  range_views: number;
  range_exposures?: ExposureBreakdown | null;
  summary: Record<string, number>;
  exposure_summary?: Record<string, ExposureBreakdown> | null;
  announcements: AnnouncementStat[];
}

@Component({
  selector: 'app-agency-analytics',
  standalone: true,
  imports: [NgIf, NgForOf, ButtonModule, SkeletonModule],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css',
})
export class AgencyAnalyticsComponent implements OnInit {
  loading = false;
  stats: AgencyStatsResponse | null = null;
  activeRange: RangeOption['key'] = 'today';
  errorMessage = '';

  ranges: RangeOption[] = [
    { key: 'today', label: 'Bugungi' },
    { key: 'week', label: 'Oxirgi 7 kun' },
    { key: 'month', label: 'Oxirgi 30 kun' },
  ];

  summaryOrder: RangeOption['key'][] = ['today', 'week', 'month'];

  constructor(private requestService: RequestService) {}

  ngOnInit(): void {
    this.fetchStats();
  }

  fetchStats(range: RangeOption['key'] = 'today') {
    this.activeRange = range;
    this.loading = true;
    this.errorMessage = '';
    this.requestService
      .getData<AgencyStatsResponse>(environment.authUrls.GET_AGENCY_STATS, { range })
      .subscribe({
        next: (response) => {
          this.stats = response;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.stats = null;
          this.errorMessage = 'Statistikani olishda xatolik. Iltimos, keyinroq qayta urinib ko‘ring yoki agentlik a’zoligingizni tekshiring.';
        },
      });
  }

  selectRange(range: RangeOption['key']) {
    if (range === this.activeRange || this.loading) {
      return;
    }
    this.fetchStats(range);
  }

  formatDate(value: string) {
    if (!value) {
      return '-';
    }
    return new Date(value).toLocaleString();
  }

  getExposureSummary(key: RangeOption['key'], field: keyof ExposureBreakdown) {
    if (!this.stats?.exposure_summary) {
      return 0;
    }
    const record = this.stats.exposure_summary[key];
    if (!record) {
      return 0;
    }
    return record[field] || 0;
  }

  getRangeExposure(field: keyof ExposureBreakdown) {
    if (!this.stats?.range_exposures) {
      return 0;
    }
    return this.stats.range_exposures[field] || 0;
  }
}
