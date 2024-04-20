import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnouncementsCardComponent } from './announcements-card.component';

describe('AnnouncementsCardComponent', () => {
  let component: AnnouncementsCardComponent;
  let fixture: ComponentFixture<AnnouncementsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnouncementsCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnnouncementsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
