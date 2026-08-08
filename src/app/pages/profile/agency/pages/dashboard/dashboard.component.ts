import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { environment } from '@environments';
import { RequestService } from '@services/request';
import { finalize } from 'rxjs';
import { IAgencyMembership } from '@services/interfaces';
import { RouterLink } from '@angular/router';

type RangeKey = 'today' | 'week' | 'month';

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

interface TopAnnouncementView extends AnnouncementStat {
  activityTotal: number;
  exposureTotalValue: number;
  scorePercent: number;
  filterPercent: number;
  recommendationPercent: number;
}

interface PeriodSummaryView {
  key: RangeKey;
  label: string;
  value: number;
  percent: number;
  averageLabel: string;
}

interface SourceSummaryView {
  label: string;
  value: number;
  percent: number;
  className: string;
}

@Component({
  selector: 'app-agency-dashboard',
  standalone: true,
  imports: [
    NgClass,
    ButtonModule,
    SkeletonModule,
    RouterLink
],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './dashboard.component.css',
})
export class AgencyDashboardComponent implements OnInit {
  memberships: IAgencyMembership[] = [];
  membershipsLoading = false;
  selectedAgencyId: number | null = null;
  statsLoading = false;
  statsError = '';
  stats: AgencyStatsResponse | null = null;
  activeRange: RangeKey = 'today';

  periodSummaries: PeriodSummaryView[] = [];
  sourceSummaries: SourceSummaryView[] = [];
  topAnnouncementsList: TopAnnouncementView[] = [];

  readonly summaryOrder: RangeKey[] = ['today', 'week', 'month'];
  readonly rangeLabels: Record<RangeKey, string> = {
    today: 'Bugungi',
    week: 'Oxirgi 7 kun',
    month: 'Oxirgi 30 kun',
  };

  constructor(
    private requestService: RequestService,
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.fetchMemberships();
      this.fetchStats();
    }
  }

  get activeMembership(): IAgencyMembership | undefined {
    return this.memberships.find((membership) => membership.agency.id === this.selectedAgencyId);
  }

  fetchMemberships() {
    this.membershipsLoading = true;
    this.requestService
      .getData<IAgencyMembership[]>(environment.authUrls.GET_MY_AGENCIES)
      .pipe(finalize(() => (this.membershipsLoading = false)))
      .subscribe({
        next: (response) => {
          this.memberships = response || [];
          if (this.memberships.length === 0) {
            this.selectedAgencyId = null;
            return;
          }
          this.selectedAgencyId = this.memberships[0].agency.id;
        },
        error: () => {
          this.memberships = [];
          this.selectedAgencyId = null;
        },
      });
  }

  fetchStats(range: RangeKey = 'today') {
    this.activeRange = range;
    this.statsLoading = true;
    this.statsError = '';
    this.requestService
      .getData<AgencyStatsResponse>(environment.authUrls.GET_AGENCY_STATS, { range })
      .pipe(finalize(() => (this.statsLoading = false)))
      .subscribe({
        next: (response) => {
          this.stats = response;
          this.buildCharts();
        },
        error: () => {
          this.stats = null;
          this.statsError = 'Statistikani olishda muammo yuz berdi.';
          this.resetCharts();
        },
      });
  }

  selectRange(range: RangeKey) {
    if (range === this.activeRange || this.statsLoading) {
      return;
    }
    this.fetchStats(range);
  }

  buildCharts() {
    if (!this.stats) {
      this.resetCharts();
      return;
    }
    this.buildViewsChart();
    this.buildExposureChart();
    this.buildTopAnnouncements();
  }

  resetCharts() {
    this.periodSummaries = [];
    this.sourceSummaries = [];
    this.topAnnouncementsList = [];
  }

  buildViewsChart() {
    const values = this.summaryOrder.map((key) => this.stats?.summary?.[key] || 0);
    const maxValue = Math.max(...values, 1);
    this.periodSummaries = this.summaryOrder.map((key, index) => {
      const value = values[index];
      return {
        key,
        label: this.rangeLabels[key],
        value,
        percent: Math.max(Math.round((value / maxValue) * 100), value > 0 ? 4 : 0),
        averageLabel: this.getAverageLabel(key, value),
      };
    });
  }

  buildExposureChart() {
    const filter = this.stats?.range_exposures?.filter || 0;
    const recommendation = this.stats?.range_exposures?.recommendation || 0;
    const total = this.stats?.range_exposures?.total || filter + recommendation;
    this.sourceSummaries = [
      {
        label: "Filtr natijalari",
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

  buildTopAnnouncements() {
    const items = (this.stats?.announcements || []).slice(0, 5);
    const maxActivity = Math.max(...items.map((item) => this.getActivityTotal(item)), 1);
    this.topAnnouncementsList = items.map((item) => this.toTopAnnouncementView(item, maxActivity));
  }

  getRangeLabel(key: RangeKey) {
    return this.rangeLabels[key];
  }

  get selectedPeriodSummary(): PeriodSummaryView | undefined {
    return this.periodSummaries.find((item) => item.key === this.activeRange);
  }

  get sourceTotal(): number {
    return this.sourceSummaries.reduce((sum, item) => sum + item.value, 0);
  }

  private toTopAnnouncementView(item: AnnouncementStat, maxActivity: number): TopAnnouncementView {
    const filter = item.filter_exposures || 0;
    const recommendation = item.recommendation_exposures || 0;
    const exposureTotal = item.exposure_total || filter + recommendation;
    const activityTotal = this.getActivityTotal(item);

    return {
      ...item,
      activityTotal,
      exposureTotalValue: exposureTotal,
      scorePercent: Math.max(Math.round((activityTotal / maxActivity) * 100), activityTotal > 0 ? 4 : 0),
      filterPercent: this.toPercent(filter, exposureTotal),
      recommendationPercent: this.toPercent(recommendation, exposureTotal),
    };
  }

  private getActivityTotal(item: AnnouncementStat): number {
    return (item.views || 0) + (item.filter_exposures || 0) + (item.recommendation_exposures || 0);
  }

  private toPercent(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }

  private getAverageLabel(key: RangeKey, value: number): string {
    if (key === 'today') {
      return 'Bugungi jami';
    }
    const days = key === 'week' ? 7 : 30;
    const average = Math.round(value / days);
    return `Kuniga o'rtacha ${average}`;
  }
}
