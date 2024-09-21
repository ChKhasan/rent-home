import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MyAnnouncementsCardComponent } from '@components/cards/my-announcements-card/my-announcements-card.component';
import { NgForOf, NgIf } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { PaginationComponent } from '@components/pagination/pagination.component';
import { finalize } from 'rxjs';
import { IAnnouncementList } from '@services/interfaces';
import { QueryService } from '@services/query';
import { TabComponent } from '@components/profile/tab/tab.component';
import { RequestService } from '@services/request';
import { environment } from '@environments';
import { AnnouncementsCardComponent } from "@components/cards/announcements-card/announcements-card.component";

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [RouterLink, MyAnnouncementsCardComponent, NgForOf, SkeletonModule, NgIf, PaginationComponent, TabComponent, AnnouncementsCardComponent],
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.css',
})
export class AnnouncementsComponent implements OnInit {
  public announcements: any;
  public skeletonList = [1, 2, 3, 4, 5];
  public loading: boolean = true;
  public totalPage: number = 0;
  constructor(
    private queryService: QueryService,
    private requestService: RequestService,
  ) {}
  __GET_ANNOUNMENTS = () => {
    this.loading = true;
    this.requestService
      .getData<IAnnouncementList>(environment.authUrls.GET_MY_ANNONCEMENTS, this.queryService.generatorHttpParamsWithDefault())
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((response: IAnnouncementList) => {
        this.announcements = response.results;
        this.totalPage = response.count;
      });
  };
  ngOnInit() {
    if (typeof window !== 'undefined') this.__GET_ANNOUNMENTS();
  }
}
