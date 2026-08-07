import { PriceBlockComponent } from './price-block.component';
import { of, throwError } from 'rxjs';
import {
  findNearestRoutePoint,
  findNearestRouteStop,
  formatRouteDistance,
  parseRoutePath,
  parseRouteStops,
} from './transport-route.utils';

describe('PriceBlockComponent', () => {
  let component: PriceBlockComponent;
  let requestService: jasmine.SpyObj<any>;

  beforeEach(() => {
    requestService = jasmine.createSpyObj('RequestService', ['requestData']);
    component = new PriceBlockComponent(
      jasmine.createSpyObj('Router', ['navigate']),
      { auth: false, user: {} } as any,
      jasmine.createSpyObj('ChatUrlService', ['save']),
      requestService,
      { run: (callback: () => void) => callback() } as any,
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('parses route coordinates and calculates the nearest distance', () => {
    const route = parseRoutePath('41.0000,69.0010 41.0100,69.0010 invalid');
    const proximity = findNearestRoutePoint([41.005, 69], [route]);

    expect(route.length).toBe(2);
    expect(proximity).not.toBeNull();
    expect(proximity!.distanceMeters).toBeGreaterThan(80);
    expect(proximity!.distanceMeters).toBeLessThan(90);
    expect(formatRouteDistance(proximity!.distanceMeters)).toMatch(/m$/);
  });

  it('parses Easyway stops and finds the nearest stop', () => {
    const stops = parseRouteStops({
      forward: [
        { i: 10, n: 'Uzoq bekat', x: 41.01, y: 69.01 },
        { i: 11, n: 'Yaqin bekat', x: 41.001, y: 69.001 },
      ],
      backward: [{ i: 12, n: 'Qaytish bekati', x: 41.02, y: 69.02 }],
    });
    const proximity = findNearestRouteStop([41, 69], stops);

    expect(stops.length).toBe(3);
    expect(stops[0].direction).toBe('forward');
    expect(stops[2].direction).toBe('backward');
    expect(proximity?.stop.name).toBe('Yaqin bekat');
    expect(proximity?.distanceMeters).toBeGreaterThan(130);
    expect(proximity?.distanceMeters).toBeLessThan(150);
  });

  it('loads a selected bus route and exposes its proximity to the listing', () => {
    requestService.requestData.and.callFake((url: string) => of(url === '/api/bus/' ? {
      stops: {
        forward: [
          { i: 20, n: 'Uzoq bekat', x: 41.01, y: 69.01 },
          { i: 21, n: 'Eng yaqin bekat', x: 41.005, y: 69.002 },
        ],
        backward: [],
      },
      scheme: {
        forward: '41.0000,69.0010 41.0100,69.0010',
        backward: '41.0100,69.0012 41.0000,69.0012',
      },
    } : {
      distance_meters: 115,
      duration_seconds: 92,
      geometry: { type: 'LineString', coordinates: [[69, 41.005], [69.001, 41.005]] },
    }));
    const bus = { id: 5, name: '67', type: 'BUS', ri: '101' } as const;
    component.announcement = {
      id: 1,
      location: { type: 'Point', coordinates: [69, 41.005] },
      transports: [bus],
    };

    component.selectTransportRoute(bus);

    expect(requestService.requestData.calls.first().args).toEqual(['/api/bus/', 'POST', { id: '101' }]);
    expect(component.activeRoute?.transport).toBe(bus);
    expect(component.activeRoute?.style.color).toBe('#168a4f');
    expect(component.activeRoute?.style.marker['preset']).toBe('islands#blueMassTransitIcon');
    expect(component.activeRoute?.style.stop['iconLayout']).toBe('default#image');
    expect(component.activeRoute?.style.stop['iconImageSize']).toEqual([20, 20]);
    expect(component.activeRoute?.style.stop['iconImageHref']).toContain('data:image/svg+xml');
    expect(component.activeRoute?.stops.length).toBe(2);
    expect(component.activeRoute?.nearestStop?.name).toBe('Eng yaqin bekat');
    expect(component.activeRoute?.nearestPoint).toEqual([41.005, 69.002]);
    expect(component.activeRoute?.distanceMeters).toBeGreaterThan(160);
    expect(requestService.requestData.calls.mostRecent().args).toEqual([
      '/api/walking-route/',
      'POST',
      {
        start: { latitude: 41.005, longitude: 69 },
        end: { latitude: 41.005, longitude: 69.002 },
      },
    ]);
  });

  it('shows stop markers only at a readable zoom level', () => {
    expect(component.showRouteStops).toBeFalse();

    component.onMapBoundsChange({ event: { get: () => 14 } });
    expect(component.showRouteStops).toBeTrue();

    component.onMapBoundsChange({ event: { get: () => 13 } });
    expect(component.showRouteStops).toBeFalse();
  });

  it('replaces the direct distance with the pedestrian route distance', () => {
    requestService.requestData.and.callFake((url: string) => of(url === '/api/bus/' ? {
      scheme: {
        forward: '41.0000,69.0010 41.0100,69.0010',
        backward: '',
      },
    } : {
      distance_meters: 365,
      duration_seconds: 280,
      geometry: {
        type: 'LineString',
        coordinates: [[69, 41.005], [69.0005, 41.0055], [69.001, 41.005]],
      },
    }));
    const bus = { id: 5, name: '67', type: 'BUS', ri: '101' } as const;
    component.announcement = {
      id: 1,
      location: { type: 'Point', coordinates: [69, 41.005] },
      transports: [bus],
    };
    component.selectTransportRoute(bus);

    expect(component.walkingRouteStatus).toBe('ready');
    expect(component.activeRoute?.walkingDistanceMeters).toBe(365);
    expect(component.activeRoute?.walkingPath).toEqual([
      [41.005, 69],
      [41.0055, 69.0005],
      [41.005, 69.001],
    ]);
    expect(component.routeDistance(component.activeRoute!)).toBe('365 m');
    expect(requestService.requestData.calls.mostRecent().args).toEqual([
      '/api/walking-route/',
      'POST',
      {
        start: { latitude: 41.005, longitude: 69 },
        end: { latitude: 41.005, longitude: 69.001 },
      },
    ]);
  });

  it('does not draw a straight fallback when pedestrian routing fails', () => {
    requestService.requestData.and.callFake((url: string) => url === '/api/bus/' ? of({
      scheme: {
        forward: '41.0000,69.0010 41.0100,69.0010',
        backward: '',
      },
    }) : throwError(() => new Error('Valhalla unavailable')));
    const bus = { id: 5, name: '67', type: 'BUS', ri: '101' } as const;
    component.announcement = {
      id: 1,
      location: { type: 'Point', coordinates: [69, 41.005] },
      transports: [bus],
    };

    component.selectTransportRoute(bus);

    expect(component.walkingRouteStatus).toBe('error');
    expect(component.activeRoute?.walkingPath).toBeUndefined();
    expect(component.routeDistanceText(component.activeRoute!)).toBe('Piyoda yo‘lini hisoblab bo‘lmadi');
  });

  it('loads metro and marshrutka routes through the local transport endpoint', () => {
    requestService.requestData.and.callFake((url: string) => of(url === '/api/bus/' ? {
      scheme: {
        forward: '41.0000,69.0010 41.0100,69.0010',
        backward: '41.0100,69.0012 41.0000,69.0012',
      },
    } : {
      distance_meters: 120,
      duration_seconds: 100,
      geometry: { type: 'LineString', coordinates: [[69, 41.005], [69.001, 41.005]] },
    }));
    const metro = { id: 1, name: "O'zbekiston", type: 'METRO', ri: '3' } as const;
    const marshrutka = { id: 160, name: '1m', type: 'MARSHUTKA', ri: '170' } as const;
    component.announcement = {
      id: 1,
      location: { type: 'Point', coordinates: [69, 41.005] },
      transports: [metro, marshrutka],
    };

    component.selectTransportRoute(metro);
    expect(component.activeRoute?.transport).toBe(metro);
    expect(component.activeRoute?.style.color).toBe('#dc2626');
    expect(component.activeRoute?.style.marker['preset']).toBe('islands#blueRapidTransitIcon');
    expect(component.transportRouteTitle(metro)).toBe("Metro: O'zbekiston");

    component.selectTransportRoute(marshrutka);
    expect(component.activeRoute?.transport).toBe(marshrutka);
    expect(component.activeRoute?.style.color).toBe('#2563eb');
    expect(component.activeRoute?.style.marker['preset']).toBe('islands#blueAutoIcon');
    expect(component.transportRouteTitle(marshrutka)).toBe('Marshrutka 1m');
    expect(requestService.requestData.calls.allArgs()).toEqual([
      ['/api/bus/', 'POST', { id: '3' }],
      ['/api/walking-route/', 'POST', jasmine.any(Object)],
      ['/api/bus/', 'POST', { id: '170' }],
      ['/api/walking-route/', 'POST', jasmine.any(Object)],
    ]);
  });
});
