import { Component } from '@angular/core';
import {AnnouncementsService} from "../../core/services/announcements/announcements.service";
import {QueryService} from "../../core/services/query/query.service";
import {finalize} from "rxjs";
import {
  AnnouncementsCardComponent
} from "../../shared/components/cards/announcements-card/announcements-card.component";
import {NgForOf, NgIf} from "@angular/common";
import {PaginationComponent} from "../../shared/components/pagination/pagination.component";
import {SkeletonModule} from "primeng/skeleton";

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
    private _announcementsService: AnnouncementsService,
    private queryConfig: QueryService
  ) {
  }
  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.__GET_ANNOUNCEMENTS()
    }
  }

  __GET_ANNOUNCEMENTS = () => {
    this.loading = true;
    this._announcementsService.get(this.queryConfig.generatorHttpParamsWithDefault())
      .pipe(finalize(() => this.loading = false))
      .subscribe((response) => {
        this.announcements = response?.results;
        this.totalPage = response.count
      });
  }
}
