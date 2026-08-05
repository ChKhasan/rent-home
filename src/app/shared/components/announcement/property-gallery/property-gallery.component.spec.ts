import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyGalleryComponent } from './property-gallery.component';

describe('PropertyGalleryComponent', () => {
  let component: PropertyGalleryComponent;
  let fixture: ComponentFixture<PropertyGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PropertyGalleryComponent] }).compileComponents();
    fixture = TestBed.createComponent(PropertyGalleryComponent);
    component = fixture.componentInstance;
  });

  it('renders a neutral placeholder without images', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.property-gallery__empty')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.property-gallery__main')).toBeNull();
  });

  it('hides navigation and thumbnails for a single image', () => {
    fixture.componentRef.setInput('images', [{ id: 1, image: 'https://example.test/home.jpg' }]);
    fixture.componentRef.setInput('title', 'Ikki xonali uy');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.property-gallery__main')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.property-gallery__navigation')).toBeNull();
    expect(fixture.nativeElement.querySelector('.property-gallery__thumbs')).toBeNull();
  });

  it('renders accessible controls for multiple images', () => {
    fixture.componentRef.setInput('images', [
      { id: 1, image: 'https://example.test/one.jpg' },
      { id: 2, image: 'https://example.test/two.jpg' },
    ]);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('.property-gallery__navigation button').length).toBe(2);
    expect(element.querySelectorAll('.property-gallery__thumbnail').length).toBe(2);
    expect(element.querySelector('.property-gallery__thumbnail')?.getAttribute('aria-current')).toBe('true');
  });
});
