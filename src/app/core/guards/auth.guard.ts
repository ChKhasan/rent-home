import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { inject } from '@angular/core';
import { AuthService } from '@services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (typeof window === 'undefined') return false;

  const authToken = localStorage.getItem(environment.accessToken);
  const refreshToken = localStorage.getItem(environment.refreshToken);
  if (authToken || refreshToken) {
    return authService.authHandler().then(() => {
      if (authService.auth) return true;
      router.navigateByUrl('/').then((r) => {});
      return false;
    });
  }

  router.navigateByUrl('/').then((r) => {});
  return false;
};
