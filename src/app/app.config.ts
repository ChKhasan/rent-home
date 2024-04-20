import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import { provideAnimations} from '@angular/platform-browser/animations';
import {MessageService} from "primeng/api";
import {loggerInterceptor} from "./core/interceptors/logger/logger.interceptor";
import {errorInterceptor} from "./core/interceptors/error/error.interceptor";
import {AngularYandexMapsModule} from "angular8-yandex-maps";

export let appConfig: ApplicationConfig;
appConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withInterceptors([loggerInterceptor,errorInterceptor]), withFetch()),
    provideAnimations(),
    MessageService,
    AngularYandexMapsModule]
};
