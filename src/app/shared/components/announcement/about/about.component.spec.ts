import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders every tenant condition and amenity in the structured lists', () => {
    component.announcement = {
      lessee_types: [
        { name: 'Oila' },
        { name: 'Qizlar' },
        { name: 'Talabalar' },
        { name: 'Ishlaydiganlar' },
      ],
      need_people_count: 4,
      conditioner: true,
      fridge: true,
      washing_machine: true,
    };

    fixture.detectChanges();

    const values = fixture.nativeElement.querySelectorAll('.property-value');
    expect(values.length).toBe(8);
    expect(fixture.nativeElement.textContent).toContain('Ishlaydiganlar');
    expect(fixture.nativeElement.textContent).toContain('Kir yuvish mashinasi');
  });
});
