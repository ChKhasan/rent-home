import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAnnouncementsCardComponent } from './my-announcements-card.component';

describe('MyAnnouncementsCardComponent', () => {
  let component: MyAnnouncementsCardComponent;
  let fixture: ComponentFixture<MyAnnouncementsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyAnnouncementsCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MyAnnouncementsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
