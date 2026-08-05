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
        const detail = error.status === 0
          ? "Server bilan aloqa o'rnatilmadi."
          : getErrorDetail(error);
        toast.showMessage('error', 'Xatolik', detail);
      }
      return throwError(() => error);
    })
  );
};

function getErrorDetail(error: HttpErrorResponse): string {
  const payload = error.error;
  if (typeof payload === 'string' && payload.trim()) return payload;
  if (payload?.detail) return String(payload.detail);
  if (payload?.message) return String(payload.message);
  if (payload && typeof payload === 'object') {
    const firstValue = Object.values(payload)[0];
    if (Array.isArray(firstValue) && firstValue.length) return String(firstValue[0]);
    if (typeof firstValue === 'string') return firstValue;
  }
  return error.statusText || 'So‘rovni bajarib bo‘lmadi.';
}

function addAuthorizationHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}
