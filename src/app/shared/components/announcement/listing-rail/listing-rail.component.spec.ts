import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingRailComponent } from './listing-rail.component';

describe('ListingRailComponent', () => {
  let component: ListingRailComponent;
  let fixture: ComponentFixture<ListingRailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ListingRailComponent] }).compileComponents();
    fixture = TestBed.createComponent(ListingRailComponent);
    component = fixture.componentInstance;
  });

  it('uses a grid when all listings fit the current viewport', () => {
    component.announcements = [{ id: 1 }, { id: 2 }] as any;
    fixture.detectChanges();

    expect(component.useCarousel).toBeFalse();
    expect(fixture.nativeElement.querySelector('.listing-rail__grid')).not.toBeNull();
  });

  it('uses Swiper when listings exceed the current viewport capacity', () => {
    component.announcements = Array.from({ length: 5 }, (_, index) => ({ id: index + 1 })) as any;
    fixture.detectChanges();

    expect(component.useCarousel).toBeTrue();
    expect(fixture.nativeElement.querySelector('swiper-container')).not.toBeNull();
  });
});
