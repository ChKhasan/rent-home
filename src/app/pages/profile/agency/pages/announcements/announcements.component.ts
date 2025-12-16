import { Component, OnInit } from '@angular/core';
import { NgIf, NgForOf, NgClass } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { RouterLink } from '@angular/router';
import { MyAnnouncementsCardComponent } from '@components/cards/my-announcements-card/my-announcements-card.component';
import { PaginationComponent } from '@components/pagination/pagination.component';
import { RequestService } from '@services/request';
import { QueryService } from '@services/query';
import { environment } from '@environments';
import { finalize } from 'rxjs';
import { IAgencyMembership, IAnnouncementList, IAnnouncementListItem } from '@services/interfaces';

@Component({
  selector: 'app-agency-announcements',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    NgClass,
    ButtonModule,
    SkeletonModule,
    RouterLink,
    MyAnnouncementsCardComponent,
    PaginationComponent,
  ],
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.css',
})
export class AgencyAnnouncementsComponent implements OnInit {
  memberships: IAgencyMembership[] = [];
  membershipsLoading = false;
  announcementsLoading = false;
  announcements: IAnnouncementListItem[] = [];
  totalPage = 0;
  selectedAgencyId: number | null = null;

  skeletonList = [1, 2, 3, 4];

  constructor(
    private requestService: RequestService,
    public queryService: QueryService,
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.fetchMemberships();
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
            this.announcements = [];
            this.totalPage = 0;
            return;
          }
          const firstAgency = this.memberships[0].agency.id;
          this.selectAgency(firstAgency, false);
        },
        error: () => {
          this.memberships = [];
          this.selectedAgencyId = null;
        },
      });
  }

  selectAgency(agencyId: number, updateQuery: boolean = true) {
    this.selectedAgencyId = agencyId;
    if (updateQuery) {
      this.queryService.updateCustomQuery({ agency: agencyId, page: 1 }).then(() => {
        this.fetchAnnouncements();
      });
    } else {
      this.fetchAnnouncements();
    }
  }

  fetchAnnouncements = () => {
    if (!this.selectedAgencyId) {
      this.announcements = [];
      this.totalPage = 0;
      return;
    }
    this.announcementsLoading = true;
    let params = this.queryService.generatorHttpParamsWithDefault();
    params = params.set('agency', this.selectedAgencyId);
    this.requestService
      .getData<IAnnouncementList>(environment.authUrls.GET_AGENCY_ANNOUNCEMENTS, params)
      .pipe(finalize(() => (this.announcementsLoading = false)))
      .subscribe({
        next: (response) => {
          this.announcements = response.results;
          this.totalPage = response.count;
        },
        error: () => {
          this.announcements = [];
          this.totalPage = 0;
        },
      });
  };
}
