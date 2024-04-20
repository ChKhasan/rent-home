import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnouncementMapCardComponent } from './anouncement-map-card.component';

describe('AnouncementMapCardComponent', () => {
  let component: AnouncementMapCardComponent;
  let fixture: ComponentFixture<AnouncementMapCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnouncementMapCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnouncementMapCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
