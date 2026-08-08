import { Component, ChangeDetectionStrategy } from '@angular/core';
import { QueryService } from '@services/query';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { AnnouncementsCardComponent } from '@components/cards/announcements-card/announcements-card.component';

import { PaginationComponent } from '@components/pagination/pagination.component';
import { SkeletonModule } from 'primeng/skeleton';
import { RequestService } from '@services/request';
import { environment } from '@environments';
import { IAnnouncementList, IAnnouncementListItem } from '@services/interfaces';
import { RouterLink } from '@angular/router';
import { AuthService } from '@services/auth';
import { LikesService } from '@services/likes';

@Component({
  selector: 'app-likes',
  standalone: true,
  imports: [AnnouncementsCardComponent, PaginationComponent, SkeletonModule, RouterLink],
  templateUrl: './likes.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './likes.component.css',
})
export class LikesComponent {
  public loading: boolean = true;
  public skeletonList = [1, 2, 3, 4, 5, 6];
  public announcements?: any;
  public totalPage: number = 0;

  constructor(
    private queryConfig: QueryService,
    private requestService: RequestService,
    private authService: AuthService,
    private likesService: LikesService,
  ) {}
  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.__GET_ANNOUNCEMENTS();
    }
  }

  __GET_ANNOUNCEMENTS = () => {
    if (!this.authService.auth) {
      this.loadLocalLikes();
      return;
    }
    this.loading = true;
    this.requestService
      .getData<IAnnouncementList>(environment.authUrls.GET_LIKES, this.queryConfig.generatorHttpParamsWithDefault())
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((response: any) => {
        this.announcements = response.map((elem: any) => {
          return {
            ...elem.announcement,
          };
        });
        this.totalPage = this.announcements.length;
        this.likesService.handleUserLikes(this.announcements.map((item: IAnnouncementListItem) => item.id));
      });
  };

  onLikeChanged(event: { id: number; liked: boolean }): void {
    if (!event.liked) {
      this.announcements = (this.announcements || []).filter((item: IAnnouncementListItem) => item.id !== event.id);
      this.totalPage = this.announcements.length;
    }
  }

  private loadLocalLikes(): void {
    this.loading = true;
    this.likesService.reloadLikes();
    const ids: number[] = (this.likesService.likes as unknown[])
      .filter((id: unknown): id is number => Number.isInteger(id) && Number(id) > 0);
    if (!ids.length) {
      this.announcements = [];
      this.totalPage = 0;
      this.loading = false;
      return;
    }
    const requests = ids.map((id: number) => this.requestService
      .getData<IAnnouncementListItem>(`${environment.urls.GET_ANNONCEMENTS}${id}/`)
      .pipe(catchError(() => of(null))));
    forkJoin(requests)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((items: Array<IAnnouncementListItem | null>) => {
        this.announcements = items.filter((item: IAnnouncementListItem | null): item is IAnnouncementListItem => !!item);
        this.totalPage = this.announcements.length;
      });
  }
}
