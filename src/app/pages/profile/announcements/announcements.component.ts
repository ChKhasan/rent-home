import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink} from "@angular/router";
import {
  MyAnnouncementsCardComponent
} from "../../../shared/components/cards/my-announcements-card/my-announcements-card.component";
import {AnnouncementsService} from "../../../core/services/announcements/announcements.service";
import {response} from "express";
import {NgForOf, NgIf} from "@angular/common";
import {SkeletonModule} from "primeng/skeleton";
import {PaginationComponent} from "../../../shared/components/pagination/pagination.component";
import {finalize} from "rxjs";
import {QueryList} from "../../../core/interfaces/common.interface";
import {QueryService} from "../../../core/services/query/query.service";
import {TabComponent} from "../../../shared/components/profile/tab/tab.component";

@Component({
  selector: 'app-announcements',
  standalone: true,
    imports: [
        RouterLink,
        MyAnnouncementsCardComponent,
        NgForOf,
        SkeletonModule,
        NgIf,
        PaginationComponent,
        TabComponent
    ],
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.css'
})
export class AnnouncementsComponent implements OnInit {
  public announcements: any;
  public skeletonList =  [1,2,3,4,5];
  public loading: boolean = true;
  public totalPage: number = 0
  constructor(
    private announcementService: AnnouncementsService,
    private queryService: QueryService
  ) {

  }
  __GET_ANNOUNMENTS = () => {
    this.loading = true;
    this.announcementService.getMy({params: this.queryService.generatorHttpParamsWithDefault()})
      .pipe(finalize(() => this.loading = false))
      .subscribe((response) => {
        this.announcements = response?.results;
        this.totalPage = response.count
      })
  }
  ngOnInit() {
    if(typeof window !== 'undefined') this.__GET_ANNOUNMENTS()

  }

}
