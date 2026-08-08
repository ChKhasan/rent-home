import { ComponentFixture, TestBed } from '@angular/core/testing';

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

        expect(component.transportLoading).toBe(true);
        expect(component.isTransportLoading({ ri: 5 })).toBe(true);
        expect(component.isTransportLoading({ ri: 6 })).toBe(false);
    });

    it('matches selected routes regardless of id type', () => {
        component.routeTransports = ['5'];

        expect(component.isTransportSelected({ ri: 5 })).toBe(true);
        expect(component.isTransportSelected({ ri: 6 })).toBe(false);
    });
});
