import {HttpInterceptorFn} from '@angular/common/http';
import {environment} from "../../../../environments/environment";

export const loggerInterceptor: HttpInterceptorFn = (req, next) => {
  let urls = Object.entries(environment.authUrls);
  let accessToken = typeof window !== 'undefined'?localStorage.getItem(environment.accessToken):'';
  if (urls.some(url => req.url.includes(url[1]) && req.method === url[0].split('_')[0])) {
    const modifiedReq = req.clone({
      headers: req.headers.set('Authorization', 'Bearer' + " " + accessToken)
    });
    return next(modifiedReq);
  }
  return next(req)


};
