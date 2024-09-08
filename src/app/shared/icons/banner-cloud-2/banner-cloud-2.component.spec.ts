import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerCloud2Component } from './banner-cloud-2.component';

describe('BannerCloud2Component', () => {
  let component: BannerCloud2Component;
  let fixture: ComponentFixture<BannerCloud2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerCloud2Component],
    }).compileComponents();

    fixture = TestBed.createComponent(BannerCloud2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
