import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AgencyAccessService } from '@services/agency-access';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

export const agencyGuard: CanActivateFn = () => {
  const router = inject(Router);
  const accessService = inject(AgencyAccessService);

  return accessService.hasMembership().pipe(
    map((hasMembership) => {
      if (!hasMembership) {
        router.navigateByUrl('/profile');
      }
      return hasMembership;
    }),
    catchError(() => {
      router.navigateByUrl('/profile');
      return of(false);
    }),
  );
};
