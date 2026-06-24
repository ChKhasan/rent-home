import { Component, OnInit } from '@angular/core';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { RequestService } from '@services/request';
import { environment } from '@environments';
import { finalize } from 'rxjs';

type RangeKey = 'today' | 'week' | 'month';
interface RangeOption {
  key: RangeKey;
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
  range: RangeKey;
  range_label: string;
  range_views: number;
  range_exposures?: ExposureBreakdown | null;
  summary: Record<string, number>;
  exposure_summary?: Record<string, ExposureBreakdown> | null;
  announcements: AnnouncementStat[];
}

interface PeriodSummaryView {
  key: RangeKey;
  label: string;
  views: number;
  exposures: number;
  viewPercent: number;
  exposurePercent: number;
  averageViewsLabel: string;
}

interface SourceSummaryView {
  label: string;
  value: number;
  percent: number;
  className: string;
}

interface AnnouncementAnalyticsView extends AnnouncementStat {
  activityTotal: number;
  exposureTotalValue: number;
  activityPercent: number;
  filterPercent: number;
  recommendationPercent: number;
}

@Component({
  selector: 'app-agency-analytics',
  standalone: true,
  imports: [NgIf, NgForOf, NgClass, ButtonModule, SkeletonModule],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css',
})
export class AgencyAnalyticsComponent implements OnInit {
  loading = false;
  stats: AgencyStatsResponse | null = null;
  activeRange: RangeKey = 'today';
  errorMessage = '';
  periodSummaries: PeriodSummaryView[] = [];
  sourceSummaries: SourceSummaryView[] = [];
  announcementRows: AnnouncementAnalyticsView[] = [];

  ranges: RangeOption[] = [
    { key: 'today', label: 'Bugungi' },
    { key: 'week', label: 'Oxirgi 7 kun' },
    { key: 'month', label: 'Oxirgi 30 kun' },
  ];

  summaryOrder: RangeKey[] = ['today', 'week', 'month'];

  constructor(private requestService: RequestService) {}

  ngOnInit(): void {
    this.fetchStats();
  }

  fetchStats(range: RangeKey = 'today') {
    this.activeRange = range;
    this.loading = true;
    this.errorMessage = '';
    this.requestService
      .getData<AgencyStatsResponse>(environment.authUrls.GET_AGENCY_STATS, { range })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          this.stats = response;
          this.buildViewModels();
        },
        error: () => {
          this.stats = null;
          this.resetViewModels();
          this.errorMessage = 'Statistikani olishda xatolik. Iltimos, keyinroq qayta urinib ko‘ring yoki agentlik a’zoligingizni tekshiring.';
        },
      });
  }

  selectRange(range: RangeKey) {
    if (range === this.activeRange || this.loading) {
      return;
    }
    this.fetchStats(range);
  }

  get selectedPeriodSummary(): PeriodSummaryView | undefined {
    return this.periodSummaries.find((item) => item.key === this.activeRange);
  }

  get selectedSourceTotal(): number {
    return this.sourceSummaries.reduce((sum, item) => sum + item.value, 0);
  }

  get filterSource(): SourceSummaryView | undefined {
    return this.sourceSummaries.find((item) => item.className === 'source-filter');
  }

  get recommendationSource(): SourceSummaryView | undefined {
    return this.sourceSummaries.find((item) => item.className === 'source-recommendation');
  }

  formatDate(value: string | null) {
    if (!value) {
      return '-';
    }
    return new Date(value).toLocaleString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getExposureSummary(key: RangeKey, field: keyof ExposureBreakdown) {
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

  trackByAnnouncementId(_: number, item: AnnouncementAnalyticsView): number {
    return item.id;
  }

  private buildViewModels() {
    if (!this.stats) {
      this.resetViewModels();
      return;
    }
    this.buildPeriodSummaries();
    this.buildSourceSummaries();
    this.buildAnnouncementRows();
  }

  private resetViewModels() {
    this.periodSummaries = [];
    this.sourceSummaries = [];
    this.announcementRows = [];
  }

  private buildPeriodSummaries() {
    const viewValues = this.summaryOrder.map((key) => this.stats?.summary?.[key] || 0);
    const exposureValues = this.summaryOrder.map((key) => this.getExposureSummary(key, 'total'));
    const maxViews = Math.max(...viewValues, 1);
    const maxExposures = Math.max(...exposureValues, 1);

    this.periodSummaries = this.summaryOrder.map((key, index) => {
      const views = viewValues[index];
      const exposures = exposureValues[index];
      return {
        key,
        label: this.getRangeLabel(key),
        views,
        exposures,
        viewPercent: this.toBarPercent(views, maxViews),
        exposurePercent: this.toBarPercent(exposures, maxExposures),
        averageViewsLabel: this.getAverageViewsLabel(key, views),
      };
    });
  }

  private buildSourceSummaries() {
    const filter = this.getRangeExposure('filter');
    const recommendation = this.getRangeExposure('recommendation');
    const total = this.getRangeExposure('total') || filter + recommendation;
    this.sourceSummaries = [
      {
        label: 'Filtr natijalari',
        value: filter,
        percent: this.toPercent(filter, total),
        className: 'source-filter',
      },
      {
        label: 'Tavsiyalar',
        value: recommendation,
        percent: this.toPercent(recommendation, total),
        className: 'source-recommendation',
      },
    ];
  }

  private buildAnnouncementRows() {
    const items = this.stats?.announcements || [];
    const maxActivity = Math.max(...items.map((item) => this.getActivityTotal(item)), 1);
    this.announcementRows = items.map((item) => this.toAnnouncementView(item, maxActivity));
  }

  private toAnnouncementView(item: AnnouncementStat, maxActivity: number): AnnouncementAnalyticsView {
    const filter = item.filter_exposures || 0;
    const recommendation = item.recommendation_exposures || 0;
    const exposureTotal = item.exposure_total || filter + recommendation;
    const activityTotal = this.getActivityTotal(item);
    return {
      ...item,
      activityTotal,
      exposureTotalValue: exposureTotal,
      activityPercent: this.toBarPercent(activityTotal, maxActivity),
      filterPercent: this.toPercent(filter, exposureTotal),
      recommendationPercent: this.toPercent(recommendation, exposureTotal),
    };
  }

  private getRangeLabel(key: RangeKey): string {
    return this.ranges.find((range) => range.key === key)?.label || key;
  }

  private getAverageViewsLabel(key: RangeKey, views: number): string {
    if (key === 'today') {
      return 'Bugungi jami';
    }
    const days = key === 'week' ? 7 : 30;
    return `Kuniga o'rtacha ${Math.round(views / days)}`;
  }

  private getActivityTotal(item: AnnouncementStat): number {
    return (item.views || 0) + (item.filter_exposures || 0) + (item.recommendation_exposures || 0);
  }

  private toBarPercent(value: number, maxValue: number): number {
    return Math.max(Math.round((value / maxValue) * 100), value > 0 ? 4 : 0);
  }

  private toPercent(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }
}
