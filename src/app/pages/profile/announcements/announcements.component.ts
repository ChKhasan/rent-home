import { Component, Input, OnInit } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { PaginationComponent } from '@components/pagination/pagination.component';
import { finalize } from 'rxjs';
import { IAnnouncementList } from '@services/interfaces';
import { QueryService } from '@services/query';
import { RequestService } from '@services/request';
import { environment } from '@environments';
import { AnnouncementsCardComponent } from "@components/cards/announcements-card/announcements-card.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [NgForOf, SkeletonModule, NgIf, PaginationComponent, AnnouncementsCardComponent, RouterLink],
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.css',
})
export class AnnouncementsComponent implements OnInit {
  @Input() embedded = false;
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
