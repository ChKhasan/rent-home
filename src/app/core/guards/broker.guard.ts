import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { environment } from '@environments';
import { RequestService } from '@services/request';

export const brokerGuard: CanActivateFn = () => {
  const router = inject(Router);
  const requestService = inject(RequestService);

  return requestService.getData<any>(environment.authUrls.GET_PUBLISHER_CAPABILITIES).pipe(
    map((response) => response?.publisher_capabilities?.independent_agent_available
      ? true
      : router.createUrlTree(['/profile'])),
    catchError(() => of(router.createUrlTree(['/profile']))),
  );
};
