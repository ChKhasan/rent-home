import { Component, OnInit, ViewChild } from '@angular/core';
import { finalize } from 'rxjs';
import { RouterLink } from '@angular/router';
import { PaginationComponent } from '@components/pagination/pagination.component';
import { NgForOf, NgIf } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { QueryService } from '@services/query';
import { MyAnnouncementsCardComponent } from '@components/cards/my-announcements-card/my-announcements-card.component';
import { FilterComponent } from '@components/announcement/filter/filter.component';
import { SearchComponent } from '@components/announcement/search/search.component';
import { BottomSheetComponent } from '@components/modals/bottom-sheet/bottom-sheet.component';
import { EmptyFoundComponent } from '@components/empty-found/empty-found.component';
import { SORT_OPTIONS } from '@/core/constants/filter';
import { RequestService } from '@services/request';
import { environment } from '@environments';
import { IAnnouncementList } from '@services/interfaces';
@Component({
  selector: 'app-list',
  standalone: true,
  imports: [PaginationComponent, NgForOf, SkeletonModule, NgIf, MyAnnouncementsCardComponent, FilterComponent, SearchComponent, RouterLink, BottomSheetComponent, EmptyFoundComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent implements OnInit {
  public loading: boolean = true;
  public skeletonList = [1, 2, 3, 4, 5, 6];
  public announcements: any = [];
  public totalPage: number = 0;
  public sortOptions = SORT_OPTIONS;
  public currentSort: string = 'appartment_status';
  @ViewChild(BottomSheetComponent) bottomSheetComponent!: BottomSheetComponent;
  constructor(
    private queryConfig: QueryService,
    private requestService: RequestService,
  ) {}
  ngOnInit(): void {
    if (typeof window !== 'undefined') this.__GET_ANNOUNCEMENTS();
  }
  __GET_ANNOUNCEMENTS = () => {
    this.loading = true;
    this.requestService
      .getData<IAnnouncementList>(environment.urls.GET_ANNONCEMENTS, this.queryConfig.generatorHttpParams(this.queryConfig.activeQueryWithDefaut()))
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((response: IAnnouncementList) => {
        this.announcements = response?.results;
        this.totalPage = response.count;
      });
  };
  filterSend = (e: any) => {
    this.queryConfig.updateCustomQuery(e, this.__GET_ANNOUNCEMENTS);
    this.closeBottomSheet();
  };
  clearFilter = () => {
    this.queryConfig.clearFilter(this.__GET_ANNOUNCEMENTS).then(() => {
      this.currentSort = 'appartment_status';
    });
    this.closeBottomSheet();
  };
  sortHandle(option: any) {
    this.currentSort == option[0] ? (this.currentSort = option[1]) : (this.currentSort = option[0]);
    this.filterSend({ ordering: this.currentSort });
  }
  openBottomSheet() {
    this.bottomSheetComponent.open();
  }
  closeBottomSheet = () => {
    this.bottomSheetComponent.close();
  };
}
