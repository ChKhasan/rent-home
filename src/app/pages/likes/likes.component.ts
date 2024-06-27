import { Component } from '@angular/core';
import {QueryService} from "@services/query";
import {finalize} from "rxjs";
import {
  AnnouncementsCardComponent
} from "@components/cards/announcements-card/announcements-card.component";
import {NgForOf, NgIf} from "@angular/common";
import {PaginationComponent} from "@components/pagination/pagination.component";
import {SkeletonModule} from "primeng/skeleton";
import {RequestService} from "@services/request";
import {environment} from "@environments";
import {IAnnouncement} from "@services/interfaces";

@Component({
  selector: 'app-likes',
  standalone: true,
  imports: [
    AnnouncementsCardComponent,
    NgForOf,
    NgIf,
    PaginationComponent,
    SkeletonModule
  ],
  templateUrl: './likes.component.html',
  styleUrl: './likes.component.css'
})
export class LikesComponent {
  public loading: boolean = true;
  public skeletonList = [1, 2, 3, 4, 5, 6];
  public announcements?: any;
  public totalPage: number = 0

  constructor(
    private queryConfig: QueryService,
    private requestService: RequestService
  ) {
  }
  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.__GET_ANNOUNCEMENTS()
    }
  }

  __GET_ANNOUNCEMENTS = () => {
    this.loading = true;
    this.requestService.getData<IAnnouncement>(environment.urls.GET_ANNONCEMENTS,this.queryConfig.generatorHttpParamsWithDefault())
      .pipe(finalize(() => this.loading = false))
      .subscribe((response:IAnnouncement) => {
        this.announcements = response?.results;
        this.totalPage = response.count
      });
  }
}
