import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { YaApiLoaderService } from 'angular8-yandex-maps';
import { NEVER } from 'rxjs';

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: vi.fn(),
  });
}

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withXhr()),
      provideHttpClientTesting(),
      provideRouter([]),
      MessageService,
      {
        provide: YaApiLoaderService,
        useValue: { load: () => NEVER },
      },
    ],
  });
});
