import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {catchError} from "rxjs/operators";
import {throwError} from "rxjs";
import {ToastService} from "../../services/toast/toast.service";
import {inject} from "@angular/core";
import {environment} from "../../../../environments/environment";
import {Router} from "@angular/router";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {

  let toast: ToastService = inject(ToastService);
  let baseUrl: string = environment.baseUrl
  let router: Router = inject(Router);
  const modifiedRequest = req.clone({
    url: baseUrl + req.url
  });
  return next(modifiedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status == 401) router.navigate(['/']).then(r => {})
      console.log(error)
      toast.showMessage('error', 'Error', error.statusText);
      return throwError(() => error);
    })
  );
};
