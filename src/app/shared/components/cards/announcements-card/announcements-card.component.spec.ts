import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnouncementsCardComponent } from './announcements-card.component';

describe('AnnouncementsCardComponent', () => {
  let component: AnnouncementsCardComponent;
  let fixture: ComponentFixture<AnnouncementsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnouncementsCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnnouncementsCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('announcement', {
      id: 42,
      title: 'Chilonzordagi ikki xonali uy',
      images: [
        { id: 1, image: 'https://example.test/one.jpg' },
        { id: 2, image: 'https://example.test/two.jpg' },
      ],
      room_count: 2,
      area: 64,
      floor: 4,
      address: 'Chilonzor tumani',
      total_price: 500,
      currency: 'USD',
      appartment_status: 5,
      user: 1,
      publisher_type: 'OWNER',
      publisher: {
        type: 'OWNER',
        label: 'Uy egasi',
        display_name: 'Aziz Karimov',
        verification_status: 'VERIFIED',
      },
      commission: { type: 'NONE', value: null, currency: null, label: 'Komissiyasiz' },
    } as any);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders only the first image without an inner media slider', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('swiper-container')).toBeNull();
    expect(element.querySelectorAll('.listing-card__image').length).toBe(1);
    expect(element.querySelector('.listing-card__image-count')?.textContent).toContain('2 ta');
  });

  it('keeps the detail link separate from the favorite action', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.listing-card__title')?.getAttribute('href')).toBe('/announcements/42');
    expect(element.querySelector('.listing-card__favorite')?.tagName).toBe('BUTTON');
  });

  it('uses per-person price as the primary value for partnership listings', () => {
    fixture.componentRef.setInput('announcement', {
      ...component.announcement,
      partnership: true,
      price_for_one: 150,
      total_price: 600,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.listing-card__price').textContent).toContain('150 USD');
    expect(fixture.nativeElement.querySelector('.listing-card__price').textContent).toContain('/ kishi');
    expect(fixture.nativeElement.querySelector('.listing-card__total-price').textContent).toContain('600 USD');
  });
});
