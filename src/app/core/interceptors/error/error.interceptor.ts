import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { catchError, switchMap } from 'rxjs/operators';
import { from, throwError } from 'rxjs';
import { ToastService } from '../../services/toast/toast.service';
import { inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { AuthService } from '@/core/services/auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  let toast: ToastService = inject(ToastService);
  let baseUrl: string = environment.baseUrl;
  let router: Router = inject(Router);
  let authService: AuthService = inject(AuthService);
  const modifiedRequest = req.clone({
    url: req.url.includes('http') ? req.url : baseUrl + req.url,
  });
  return next(modifiedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status == 401 && router.url.includes('profile')) {
        router.navigate(['/']).then((r) => {});
        toast.showMessage('error', 'Xatolik', 'Sessiya muddati tugadi.');
      }
      if (error.status === 401 && typeof window !== 'undefined' && !modifiedRequest.url.includes('/api/token/')) {
        return from(authService.refreshToken()).pipe(
          switchMap((response) => {
            const clonedRequest = addAuthorizationHeader(modifiedRequest, response?.access);
            return next(clonedRequest);
          }),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => error);
          })
        );
      }
      if (error.status != 401) {
        const detail =
          error.status === 0
            ? "Server bilan aloqa o'rnatilmadi."
            : error?.error?.message || error.statusText;
        toast.showMessage('error', 'Xatolik', detail);
      }
      return throwError(() => error);
    })
  );
};
function addAuthorizationHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}
