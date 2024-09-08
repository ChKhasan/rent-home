import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  if (typeof window === 'undefined') return false;

  const authToken = localStorage.getItem(environment.accessToken);
  if (authToken) return true;

  router.navigateByUrl('/').then((r) => {});
  return false;
};
