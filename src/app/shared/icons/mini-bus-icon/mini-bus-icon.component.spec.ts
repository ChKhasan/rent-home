import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniBusIconComponent } from './mini-bus-icon.component';

describe('MiniBusIconComponent', () => {
  let component: MiniBusIconComponent;
  let fixture: ComponentFixture<MiniBusIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiniBusIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MiniBusIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
