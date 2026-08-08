import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapDialogComponent } from './map-dialog.component';

describe('MapDialogComponent', () => {
    let component: MapDialogComponent;
    let fixture: ComponentFixture<MapDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MapDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(MapDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('passes only selected coordinates to the announcement form', () => {
        component.formHandle = vi.fn().mockName('formHandle');

        component.handleMapClick({
            event: { get: () => [41.3134, 69.28704] },
        });

        expect(component.formHandle).toHaveBeenCalledTimes(1);

        expect(component.formHandle).toHaveBeenCalledWith({
            coords: [41.3134, 69.28704],
        });
    });
});
