import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerCloudComponent } from './banner-cloud.component';

describe('BannerCloudComponent', () => {
  let component: BannerCloudComponent;
  let fixture: ComponentFixture<BannerCloudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerCloudComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BannerCloudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
