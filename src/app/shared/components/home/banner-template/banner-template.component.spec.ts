import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerTemplateComponent } from './banner-template.component';

describe('BannerTemplateComponent', () => {
  let component: BannerTemplateComponent;
  let fixture: ComponentFixture<BannerTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerTemplateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BannerTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
