import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { registerSwiperElements } from './app/core/swiper/register-swiper';

registerSwiperElements();

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
