import { ApplicationConfig, importProvidersFrom, inject, provideAppInitializer } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withRouterConfig } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { loggerInterceptor } from './core/interceptors/logger/logger.interceptor';
import { errorInterceptor } from './core/interceptors/error/error.interceptor';
import { AngularYandexMapsModule, YaConfig } from 'angular8-yandex-maps';
import { providePrimeNG } from 'primeng/config';
import { ThemeService } from './core/services/theme/theme.service';
import { NexthomePreset } from './core/theme/nexthome.preset';
import { getRuntimeConfig } from './core/config/runtime-config';

const yandexMapsConfig: YaConfig = {
  apikey: getRuntimeConfig().yandexMapsApiKey || undefined,
  coordorder: 'latlong',
  lang: 'en_US',
};

export let appConfig: ApplicationConfig;
appConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      })
    ),
    provideClientHydration(),
    provideHttpClient(withInterceptors([loggerInterceptor, errorInterceptor]), withFetch()),
    provideAnimations(),
    providePrimeNG({
      theme: {
        preset: NexthomePreset,
        options: {
          darkModeSelector: '[data-theme="dark"]',
        },
      },
    }),
    provideAppInitializer(() => inject(ThemeService).initialize()),
    MessageService,
    importProvidersFrom(AngularYandexMapsModule.forRoot(yandexMapsConfig)),
  ],
};
