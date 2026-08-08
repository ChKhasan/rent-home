import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withNoIncrementalHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { loggerInterceptor } from './core/interceptors/logger/logger.interceptor';
import { errorInterceptor } from './core/interceptors/error/error.interceptor';
import { provideYaConfig, YaConfig } from 'angular8-yandex-maps';
import { providePrimeNG } from 'primeng/config';
import { ThemeService } from './core/services/theme/theme.service';
import { NexthomePreset } from './core/theme/nexthome.preset';
import { getRuntimeConfig } from './core/config/runtime-config';

const runtimeConfig = getRuntimeConfig();

const yandexMapsConfig: YaConfig = {
  apikey: runtimeConfig.yandexMapsApiKey || undefined,
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
    provideClientHydration(withNoIncrementalHydration()),
    provideHttpClient(withInterceptors([loggerInterceptor, errorInterceptor]), withFetch()),
    providePrimeNG({
      license: runtimeConfig.primeUiLicenseKey || undefined,
      theme: {
        preset: NexthomePreset,
        options: {
          darkModeSelector: '[data-theme="dark"]',
        },
      },
    }),
    provideAppInitializer(() => inject(ThemeService).initialize()),
    MessageService,
    provideYaConfig(yandexMapsConfig),
  ],
};
