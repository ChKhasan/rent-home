import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export const loggerInterceptor: HttpInterceptorFn = (req, next) => {
  let accessToken = typeof window !== 'undefined' ? localStorage.getItem(environment.accessToken) : '';

  const isApiRequest = req.url.startsWith('/api/') || req.url.startsWith(environment.baseUrl + '/api/');
  const isTokenRequest = req.url.includes('/api/token/');

  if (accessToken && isApiRequest && !isTokenRequest) {
    const modifiedReq = req.clone({
      headers: req.headers.set('Authorization', 'Bearer' + ' ' + accessToken),
    });
    return next(modifiedReq);
  }
  return next(req);
};
