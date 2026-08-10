import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of } from 'rxjs';

import { TOP_COLORS } from '@/core/constants/map';
import { MapComponent } from './map.component';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows loading only for the route being fetched', () => {
    component.loadingRouteIds = new Set(['5']);

    expect(component.transportLoading).toBeTrue();
    expect(component.isTransportLoading({ ri: 5 })).toBeTrue();
    expect(component.isTransportLoading({ ri: 6 })).toBeFalse();
  });

  it('matches selected routes regardless of id type', () => {
    component.routeTransports = ['5'];

    expect(component.isTransportSelected({ ri: 5 })).toBeTrue();
    expect(component.isTransportSelected({ ri: 6 })).toBeFalse();
  });

  it('uses a selected map point to request nearby routes', () => {
    const requestService = (component as any).requestService;
    const queryService = (component as any).queryService;
    spyOn(requestService, 'requestData').and.returnValue(of({ routes: [] }));
    spyOn(queryService, 'updateCustomQuery').and.returnValue(Promise.resolve(true));
    component.selectingDestination = true;

    component.handleDestinationMapClick({
      event: { get: () => [41.3412, 69.2867] },
    });

    expect(requestService.requestData).toHaveBeenCalledWith('/api/buses/', 'POST', {
      city: 'tashkent',
      location: { type: 'Point', coordinates: [69.2867, 41.3412] },
      nearby: 200,
    });
    expect(component.commuteDestination?.coordinates).toEqual([41.3412, 69.2867]);
    expect(component.selectingDestination).toBeFalse();
  });

  it('lets the user choose a backend geocoder result before loading routes', () => {
    const requestService = (component as any).requestService;
    const queryService = (component as any).queryService;
    spyOn(requestService, 'getData').and.returnValue(of({
      results: [{
        label: 'TATU, Toshkent',
        latitude: 41.3426203,
        longitude: 69.2860672,
      }],
    }));
    spyOn(requestService, 'requestData').and.returnValue(of({ routes: [] }));
    spyOn(queryService, 'updateCustomQuery').and.returnValue(Promise.resolve(true));
    component.destinationQuery = 'TATU';

    component.searchCommuteDestination();

    expect(requestService.getData).toHaveBeenCalledWith('/api/geocode/', { q: 'TATU' });
    expect(component.destinationSuggestions).toEqual([{
      label: 'TATU, Toshkent',
      coordinates: [41.3426203, 69.2860672],
    }]);
    expect(requestService.requestData).not.toHaveBeenCalled();

    component.selectCommuteDestination(component.destinationSuggestions[0]);

    expect(requestService.requestData).toHaveBeenCalledWith('/api/buses/', 'POST', {
      city: 'tashkent',
      location: { type: 'Point', coordinates: [69.2860672, 41.3426203] },
      nearby: 200,
    });
    expect(component.commuteDestination).toEqual({
      label: 'TATU, Toshkent',
      coordinates: [41.3426203, 69.2860672],
    });
    expect(component.destinationSuggestions).toEqual([]);
  });

  it('applies nearby routes to the announcement filter', fakeAsync(() => {
    const queryService = (component as any).queryService;
    spyOn(queryService, 'updateCustomQuery').and.returnValue(Promise.resolve(true));
    spyOn(component, 'handleBusRoute');
    component.transports = [{ ri: '101', name: '67', type: 'BUS' }];

    (component as any).applyCommuteRoutes(
      { label: 'TATU', coordinates: [41.3412, 69.2867] },
      { routes: [101], route_distances: [{ ri: 101, distance_m: 84.4 }] },
    );
    tick();

    expect(component.routeTransports).toEqual(['101']);
    expect(component.commuteRoutes).toEqual([{
      ri: '101',
      name: '67',
      type: 'BUS',
      color: TOP_COLORS[0],
      distanceMeters: 84,
    }]);
    expect(component.transports[0].color).toBe(TOP_COLORS[0]);
    expect(queryService.updateCustomQuery).toHaveBeenCalledWith(
      { transports: ['101'] },
      component.__GET_ANNOUNCEMENTS,
    );
    expect(component.handleBusRoute).toHaveBeenCalledWith('101');
  }));

  it('keeps only routes passing near both the destination and selected home', () => {
    const requestService = (component as any).requestService;
    const destinationRoutes = [
      { ri: '101', name: '67', type: 'BUS', color: TOP_COLORS[0], distanceMeters: 84 },
      { ri: '202', name: '72', type: 'BUS', color: TOP_COLORS[1], distanceMeters: 126 },
    ];
    component.commuteDestination = { label: 'TATU', coordinates: [41.3426203, 69.2860672] };
    component.announcements = [{
      id: 7,
      geometry: [41.3301, 69.2752],
      location_x: 41.3301,
      location_y: 69.2752,
    }];
    (component as any).destinationRoutes = destinationRoutes;
    spyOn(component, 'handleBusRoute');
    spyOn(requestService, 'requestData').and.returnValue(of({
      routes: [202, 303],
      route_distances: [
        { ri: 202, distance_m: 318.6 },
        { ri: 303, distance_m: 90 },
      ],
    }));

    component.handleAnnounce(7);

    expect(requestService.requestData).toHaveBeenCalledWith('/api/buses/', 'POST', {
      city: 'tashkent',
      location: { type: 'Point', coordinates: [69.2752, 41.3301] },
      nearby: 500,
    });
    expect(component.routeTransports).toEqual(['202']);
    expect(component.commuteRoutes).toEqual([{
      ...destinationRoutes[1],
      homeDistanceMeters: 319,
    }]);
    expect(component.handleBusRoute).toHaveBeenCalledWith('202');
    expect(component.homeConnectionActive).toBeTrue();
  });

  it('hides the regular marker for the selected announcement', () => {
    component.currentAnnouce = { id: 7 };
    component.showInfo = true;

    expect(component.isAnnouncementMarkerVisible({ id: '7' })).toBeFalse();
    expect(component.isAnnouncementMarkerVisible({ id: 8 })).toBeTrue();

    component.showInfo = false;
    expect(component.isAnnouncementMarkerVisible({ id: 7 })).toBeTrue();
  });

  it('restores destination routes when the selected home card closes', () => {
    const destinationRoutes = [
      { ri: '101', name: '67', type: 'BUS', color: TOP_COLORS[0], distanceMeters: 84 },
      { ri: '202', name: '72', type: 'BUS', color: TOP_COLORS[1], distanceMeters: 126 },
    ];
    component.commuteDestination = { label: 'TATU', coordinates: [41.3426203, 69.2860672] };
    (component as any).destinationRoutes = destinationRoutes;
    (component as any).routeDisplayOverride = ['202'];
    component.commuteRoutes = [{ ...destinationRoutes[1], homeDistanceMeters: 319 }];
    component.showInfo = true;
    spyOn(component, 'handleBusRoute');

    component.closeAnnouncementInfo();

    expect(component.showInfo).toBeFalse();
    expect(component.routeTransports).toEqual(['101', '202']);
    expect(component.commuteRoutes.map((route) => route.ri)).toEqual(['101', '202']);
    expect(component.homeConnectionActive).toBeFalse();
    expect(component.handleBusRoute).toHaveBeenCalledWith('101');
    expect(component.handleBusRoute).toHaveBeenCalledWith('202');
  });

  it('adds transport details to a drawn route balloon', () => {
    const requestService = (component as any).requestService;
    const queryService = (component as any).queryService;
    spyOn(requestService, 'requestData').and.returnValue(of({
      scheme: {
        forward: '41.34,69.28 41.35,69.29',
        backward: '41.35,69.29 41.34,69.28',
      },
    }));
    spyOn(queryService, 'activeQueryList').and.returnValue({ transports: ['101'] });
    component.transports = [{ ri: '101', name: '67', type: 'BUS', color: TOP_COLORS[0] }];
    component.commuteRoutes = [{
      ri: '101',
      name: '67',
      type: 'BUS',
      color: TOP_COLORS[0],
      distanceMeters: 84,
    }];
    component.routeTransports = ['101'];

    component.__GET_BUS_ROUTE({ id: '101' }, '101');

    expect(component.selectRoutes[0].title).toBe('Avtobus 67');
    expect(component.selectRoutes[0].description).toBe('Muhim manzilgacha: 84 m');
  });

  it('adds both home and destination distances to a matched route balloon', () => {
    const requestService = (component as any).requestService;
    const queryService = (component as any).queryService;
    spyOn(requestService, 'requestData').and.returnValue(of({
      scheme: {
        forward: '41.34,69.28 41.35,69.29',
        backward: '41.35,69.29 41.34,69.28',
      },
    }));
    spyOn(queryService, 'activeQueryList').and.returnValue({ transports: ['101'] });
    component.transports = [{ ri: '101', name: '67', type: 'BUS', color: TOP_COLORS[0] }];
    component.commuteRoutes = [{
      ri: '101',
      name: '67',
      type: 'BUS',
      color: TOP_COLORS[0],
      distanceMeters: 84,
      homeDistanceMeters: 319,
    }];
    component.routeTransports = ['101'];
    (component as any).routeDisplayOverride = ['101'];

    component.__GET_BUS_ROUTE({ id: '101' }, '101');

    expect(component.selectRoutes[0].description).toBe('Uygacha: 319 m · Muhim manzilgacha: 84 m');
  });

  it('scales route width with zoom and emphasizes the focused route', () => {
    component.handleMapBoundsChange({ event: { get: () => 9 } });
    expect(component.routeStrokeWidth('101')).toBe(1.5);
    expect(component.routeStrokeOpacity('101')).toBe(0.72);

    component.handleMapBoundsChange({ event: { get: () => 12 } });
    expect(component.routeStrokeWidth('101')).toBe(3);

    component.handleMapBoundsChange({ event: { get: () => 15 } });
    expect(component.routeStrokeWidth('101')).toBe(5);

    component.activateMapRoute('101');
    expect(component.routeStrokeWidth('101')).toBe(7);
    expect(component.routeStrokeOpacity('101')).toBe(1);
    expect(component.routeStrokeOpacity('102')).toBe(0.32);
    expect(component.routeZIndex('101')).toBe(1000);
  });

  it('opens route balloon and hint explicitly at the pointer coordinates', () => {
    const balloonOpen = jasmine.createSpy('balloonOpen');
    const hintOpen = jasmine.createSpy('hintOpen');
    const hintClose = jasmine.createSpy('hintClose');
    const stopPropagation = jasmine.createSpy('stopPropagation');
    const event = {
      target: {
        balloon: { open: balloonOpen },
        hint: { open: hintOpen, close: hintClose },
      },
      event: {
        get: () => [41.34, 69.28],
        stopPropagation,
      },
    };

    component.showMapRoute('101', event);
    expect(component.activeMapRouteId).toBe('101');
    expect(stopPropagation).toHaveBeenCalled();
    expect(balloonOpen).toHaveBeenCalledWith([41.34, 69.28]);

    component.showMapRouteHint('101', event);
    expect(component.hoveredMapRouteId).toBe('101');
    expect(hintOpen).toHaveBeenCalledWith([41.34, 69.28]);

    component.hideMapRouteHint('101', event);
    expect(component.hoveredMapRouteId).toBeNull();
    expect(hintClose).toHaveBeenCalled();
    expect(component.routeHitStrokeWidth()).toBe(12);
  });

  it('keeps the map centered on the commute destination after homes load', () => {
    const requestService = (component as any).requestService;
    spyOn(requestService, 'getData').and.returnValue(of({
      count: 1,
      results: [{ id: 1, location_x: 41.3, location_y: 69.2 }],
    }));
    component.commuteDestination = { label: 'TATU', coordinates: [41.3412, 69.2867] };
    component.mapCenter = [...component.commuteDestination.coordinates];

    component.__GET_ANNOUNCEMENTS();

    expect(component.mapCenter).toEqual([41.3412, 69.2867]);
  });
});
