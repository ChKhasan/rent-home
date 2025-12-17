import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { RequestService } from '@services/request';
import { environment } from '@environments';
import { IAgencyMembership } from '@services/interfaces';

@Injectable({
  providedIn: 'root',
})
export class AgencyAccessService {
  private membership$?: Observable<boolean>;

  constructor(private requestService: RequestService) {}

  hasMembership(): Observable<boolean> {
    if (!this.membership$) {
      this.membership$ = this.requestService.getData<IAgencyMembership[]>(environment.authUrls.GET_MY_AGENCIES).pipe(
        map((memberships) => !!memberships && memberships.length > 0),
        catchError(() => of(false)),
        shareReplay(1),
      );
    }
    return this.membership$;
  }

  invalidate(): void {
    this.membership$ = undefined;
  }
}
