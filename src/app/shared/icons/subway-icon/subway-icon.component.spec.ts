import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubwayIconComponent } from './subway-icon.component';

describe('SubwayIconComponent', () => {
  let component: SubwayIconComponent;
  let fixture: ComponentFixture<SubwayIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubwayIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubwayIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
