import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerFilterComponent } from './banner-filter.component';

describe('BannerFilterComponent', () => {
  let component: BannerFilterComponent;
  let fixture: ComponentFixture<BannerFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BannerFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
