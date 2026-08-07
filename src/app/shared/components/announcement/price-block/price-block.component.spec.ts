import { PriceBlockComponent } from './price-block.component';
import { of } from 'rxjs';
import { findNearestRoutePoint, formatRouteDistance, parseRoutePath } from './transport-route.utils';

describe('PriceBlockComponent', () => {
  let component: PriceBlockComponent;
  let requestService: jasmine.SpyObj<any>;

  beforeEach(() => {
    requestService = jasmine.createSpyObj('RequestService', ['requestData', 'getData']);
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

  it('loads a selected bus route and exposes its proximity to the listing', () => {
    requestService.requestData.and.returnValue(of({
      scheme: {
        forward: '41.0000,69.0010 41.0100,69.0010',
        backward: '41.0100,69.0012 41.0000,69.0012',
      },
    }));
    const bus = { id: 5, name: '67', type: 'BUS', ri: '101' } as const;
    component.announcement = {
      id: 1,
      location: { type: 'Point', coordinates: [69, 41.005] },
      transports: [bus],
    };

    component.selectTransportRoute(bus);

    expect(requestService.requestData).toHaveBeenCalledWith('/api/bus/', 'POST', { id: '101' });
    expect(component.activeRoute?.transport).toBe(bus);
    expect(component.activeRoute?.style.color).toBe('#168a4f');
    expect(component.activeRoute?.style.marker['preset']).toBe('islands#blueMassTransitIcon');
    expect(component.activeRoute?.distanceMeters).toBeGreaterThan(80);
  });

  it('replaces the direct distance with the pedestrian route distance', () => {
    requestService.requestData.and.returnValue(of({
      scheme: {
        forward: '41.0000,69.0010 41.0100,69.0010',
        backward: '',
      },
    }));
    const bus = { id: 5, name: '67', type: 'BUS', ri: '101' } as const;
    component.announcement = {
      id: 1,
      location: { type: 'Point', coordinates: [69, 41.005] },
      transports: [bus],
    };
    component.selectTransportRoute(bus);
    const callbacks = new Map<string, () => void>();
    const walkingRoute = {
      model: {
        events: {
          add: (name: string, callback: () => void) => callbacks.set(name, callback),
          remove: jasmine.createSpy('remove'),
        },
      },
      getActiveRoute: () => ({
        properties: { get: () => ({ value: 365, text: '365 m' }) },
      }),
    };

    component.onWalkingRouteReady({ target: walkingRoute });
    callbacks.get('requestsuccess')!();

    expect(component.walkingRouteStatus).toBe('ready');
    expect(component.activeRoute?.walkingDistanceMeters).toBe(365);
    expect(component.routeDistance(component.activeRoute!)).toBe('365 m');
  });

  it('draws an OSM pedestrian path when the Yandex route is unavailable', () => {
    requestService.requestData.and.returnValue(of({
      scheme: {
        forward: '41.0000,69.0010 41.0100,69.0010',
        backward: '',
      },
    }));
    requestService.getData.and.returnValue(of({
      code: 'Ok',
      routes: [{
        distance: 412,
        geometry: {
          coordinates: [[69, 41.005], [69.0005, 41.0055], [69.001, 41.005]],
        },
      }],
    }));
    const bus = { id: 5, name: '67', type: 'BUS', ri: '101' } as const;
    component.announcement = {
      id: 1,
      location: { type: 'Point', coordinates: [69, 41.005] },
      transports: [bus],
    };
    component.selectTransportRoute(bus);
    const callbacks = new Map<string, () => void>();
    component.onWalkingRouteReady({
      target: {
        model: {
          events: {
            add: (name: string, callback: () => void) => callbacks.set(name, callback),
            remove: jasmine.createSpy('remove'),
          },
        },
        getActiveRoute: () => null,
      },
    });

    callbacks.get('requestfail')!();

    expect(requestService.getData).toHaveBeenCalledWith(
      jasmine.stringMatching(/^https:\/\/routing\.openstreetmap\.de\/routed-foot\/route\/v1\/driving\//),
      { overview: 'full', geometries: 'geojson', steps: false },
    );
    expect(component.walkingRouteStatus).toBe('ready');
    expect(component.activeRoute?.walkingDistanceMeters).toBe(412);
    expect(component.activeRoute?.walkingPath).toEqual([
      [41.005, 69],
      [41.0055, 69.0005],
      [41.005, 69.001],
    ]);
  });

  it('loads metro and marshrutka routes through the local transport endpoint', () => {
    requestService.requestData.and.returnValue(of({
      scheme: {
        forward: '41.0000,69.0010 41.0100,69.0010',
        backward: '41.0100,69.0012 41.0000,69.0012',
      },
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
      ['/api/bus/', 'POST', { id: '170' }],
    ]);
  });
});
