import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { DictionaryService } from './dictionary.service';

describe('DictionaryService', () => {
  let service: DictionaryService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DictionaryService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('loads and caches the complete region list', () => {
    const regions = [{ id: 1, name: 'Toshkent', level: 1, parent: null }];

    service.loadRegions().subscribe((result) => expect(result).toEqual(regions));
    const request = http.expectOne((item) => item.url === '/api/regions/');
    expect(request.request.params.get('level')).toBe('1');
    expect(request.request.params.get('page_size')).toBe('100');
    request.flush({ results: regions });

    service.loadRegions().subscribe((result) => expect(result).toEqual(regions));
    http.expectNone('/api/regions/');
  });

  it('loads all districts for the selected region', () => {
    const districts = [{ id: 11, name: 'Yunusobod', level: 2, parent: 1 }];

    service.loadDistricts(1).subscribe((result) => expect(result).toEqual(districts));
    const request = http.expectOne((item) => item.url === '/api/regions/');
    expect(request.request.params.get('level')).toBe('2');
    expect(request.request.params.get('parent')).toBe('1');
    expect(request.request.params.get('page_size')).toBe('100');
    request.flush({ results: districts });
  });
});
