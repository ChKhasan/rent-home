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
        toast.showMessage('error', 'Error', error.statusText);
      }
      if (error.status === 401 && typeof window !== 'undefined') {
        return from(authService.refreshToken()).pipe(
          switchMap((response) => {
            console.log('response token', response);
            const clonedRequest = addAuthorizationHeader(modifiedRequest, response?.access);
            // Retry the request with the new token
            return next(clonedRequest);
          }),
          catchError((refreshError) => {
            // Handle errors during token refresh
            console.error('Token refresh failed:', refreshError);
            authService.logout(); // Optionally log out the user
            return throwError(() => error);
          })
        );
      }
      if (error.status != 401) {
        toast.showMessage('error', 'Error', error?.error?.message || error.statusText);
      }
      return throwError(() => error);
    })
  );
};
function addAuthorizationHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
  console.log("token",token)
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}
