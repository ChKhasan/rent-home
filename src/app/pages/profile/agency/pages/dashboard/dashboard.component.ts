import { Component, OnInit } from '@angular/core';
import { NgForOf, NgIf, NgClass } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ChartModule } from 'primeng/chart';
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

@Component({
  selector: 'app-agency-dashboard',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    NgClass,
    ButtonModule,
    SkeletonModule,
    ChartModule,
    RouterLink,
  ],
  templateUrl: './dashboard.component.html',
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

  viewsChartData: any;
  viewsChartOptions: any;
  exposureChartData: any;
  exposureChartOptions: any;
  topAnnouncementsChartData: any;
  topAnnouncementsChartOptions: any;
  topAnnouncementsList: AnnouncementStat[] = [];

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
    this.viewsChartData = null;
    this.exposureChartData = null;
    this.topAnnouncementsChartData = null;
    this.topAnnouncementsList = [];
  }

  buildViewsChart() {
    const labels = this.summaryOrder.map((key) => this.rangeLabels[key]);
    const data = this.summaryOrder.map((key) => this.stats?.summary?.[key] || 0);
    this.viewsChartData = {
      labels,
      datasets: [
        {
          label: 'Ko‘rishlar',
          backgroundColor: '#22c55e',
          borderRadius: 8,
          data,
        },
      ],
    };
    this.viewsChartOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    };
  }

  buildExposureChart() {
    const filter = this.stats?.range_exposures?.filter || 0;
    const recommendation = this.stats?.range_exposures?.recommendation || 0;
    this.exposureChartData = {
      labels: ['Filtr', 'Tavsiyalar'],
      datasets: [
        {
          data: [filter, recommendation],
          backgroundColor: ['#0ea5e9', '#f97316'],
          hoverOffset: 8,
        },
      ],
    };
    this.exposureChartOptions = {
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    };
  }

  buildTopAnnouncements() {
    const items = (this.stats?.announcements || []).slice(0, 5);
    this.topAnnouncementsList = items;
    if (!items.length) {
      this.topAnnouncementsChartData = null;
      return;
    }
    this.topAnnouncementsChartData = {
      labels: items.map((item) => item.title),
      datasets: [
        {
          label: 'Ko‘rishlar',
          backgroundColor: '#22c55e',
          data: items.map((item) => item.views),
          borderRadius: 6,
        },
        {
          label: 'Filtr ko‘rsatishlar',
          backgroundColor: '#0ea5e9',
          data: items.map((item) => item.filter_exposures || 0),
          borderRadius: 6,
        },
        {
          label: 'Tavsiyalar',
          backgroundColor: '#f97316',
          data: items.map((item) => item.recommendation_exposures || 0),
          borderRadius: 6,
        },
      ],
    };
    this.topAnnouncementsChartOptions = {
      indexAxis: 'y',
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
        y: {
          grid: {
            display: false,
          },
        },
      },
    };
  }

  getRangeLabel(key: RangeKey) {
    return this.rangeLabels[key];
  }
}
