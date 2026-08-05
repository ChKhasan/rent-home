import { register } from 'swiper/element/bundle';

let registered = false;

export function registerSwiperElements(): void {
  if (registered || typeof window === 'undefined') return;
  register();
  registered = true;
}
