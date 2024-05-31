import {Component, OnInit} from '@angular/core';
import {RouterLink} from "@angular/router";
import {
  MyAnnouncementsCardComponent
} from "../../../shared/components/cards/my-announcements-card/my-announcements-card.component";
import {NgForOf, NgIf} from "@angular/common";
import {SkeletonModule} from "primeng/skeleton";
import {PaginationComponent} from "../../../shared/components/pagination/pagination.component";
import {finalize} from "rxjs";
import {IAnnouncement} from "../../../core/interfaces/common.interface";
import {QueryService} from "../../../core/services/query/query.service";
import {TabComponent} from "../../../shared/components/profile/tab/tab.component";
import {RequestService} from "../../../core/services/request/request.service";
import {environment} from "../../../../environments/environment";

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
    private queryService: QueryService,
    private requestService: RequestService
  ) {

  }
  __GET_ANNOUNMENTS = () => {
    this.loading = true;
    this.requestService.getData<IAnnouncement>(environment.authUrls.GET_MY_ANNONCEMENTS,this.queryService.generatorHttpParamsWithDefault())
      .pipe(finalize(() => this.loading = false))
      .subscribe((response:IAnnouncement) => {
        this.announcements = response.results;
        this.totalPage = response.count
      })
  }
  ngOnInit() {
    if(typeof window !== 'undefined') this.__GET_ANNOUNMENTS()
  }

}
