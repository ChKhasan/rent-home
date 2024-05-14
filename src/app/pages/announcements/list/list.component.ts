import {Component, OnInit, QueryList, ViewChild} from '@angular/core';
import {finalize} from "rxjs";
import {AnnouncementsService} from "../../../core/services/announcements/announcements.service";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {PaginationComponent} from "../../../shared/components/pagination/pagination.component";
import {NgForOf, NgIf} from "@angular/common";
import {SkeletonModule} from "primeng/skeleton";
import {QueryService} from "../../../core/services/query/query.service";
import {
  MyAnnouncementsCardComponent
} from "../../../shared/components/cards/my-announcements-card/my-announcements-card.component";
import {FilterComponent} from "../../../shared/components/announcement/filter/filter.component";
import {SearchComponent} from "../../../shared/components/announcement/search/search.component";
import {HttpParams} from "@angular/common/http";
import {BottomSheetComponent} from "../../../shared/components/modals/bottom-sheet/bottom-sheet.component";
import {EmptyFoundComponent} from "../../../shared/components/empty-found/empty-found.component";

const sortOptions = [
  {
    name: "Eng yangilari",
    id: 1,
    options: ["appartment_status", "appartment_status_reverse"],
  },
  {
    name: "Tavsiya etilganlar",
    id: 2,
    options: ["price_for_one", "price_for_one_reverse"],
  },
  {
    name: "Narx bo’yicha",
    id: 3,
    options: ["total_price", "total_price_reverse"],
  },
];

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    PaginationComponent,
    NgForOf,
    SkeletonModule,
    NgIf,
    MyAnnouncementsCardComponent,
    FilterComponent,
    SearchComponent,
    RouterLink,
    BottomSheetComponent,
    EmptyFoundComponent
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent implements OnInit {
  public loading: boolean = true;
  public skeletonList = [1, 2, 3, 4, 5, 6];
  public announcements: any = [];
  public totalPage: number = 0;
  public sortOptions = sortOptions;
  public currentSort: string = 'appartment_status'
 @ViewChild(BottomSheetComponent) bottomSheetComponent!: BottomSheetComponent
  constructor(
    private _announcementsService: AnnouncementsService,
    private queryConfig: QueryService
  ) {
  }
  ngOnInit(): void {
    if (typeof window !== 'undefined') this.__GET_ANNOUNCEMENTS()
  }
  __GET_ANNOUNCEMENTS = () => {
    this.loading = true;
    this._announcementsService.get(this.queryConfig.generatorHttpParams(this.queryConfig.activeQueryWithDefaut()))
      .pipe(finalize(() => this.loading = false))
      .subscribe((response) => {
        this.announcements = response?.results;
        this.totalPage = response.count
      });
  }
  filterSend = (e: any) => {
    this.queryConfig.updateCustomQuery(e,this.__GET_ANNOUNCEMENTS);
    this.closeBottomSheet()
  }
  clearFilter = () => {
    this.queryConfig.clearFilter(this.__GET_ANNOUNCEMENTS).then(() => {
      this.currentSort = "appartment_status";
    })
    this.closeBottomSheet()
  }
  sortHandle(option: any) {
    this.currentSort == option[0]
      ? (this.currentSort = option[1])
      : (this.currentSort = option[0]);
    this.filterSend({ordering: this.currentSort});
  }
  openBottomSheet() {
    this.bottomSheetComponent.open()

  }
  closeBottomSheet = () => {
    this.bottomSheetComponent.close();

  }
}
