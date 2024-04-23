import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusIconComponent } from './bus-icon.component';

describe('BusIconComponent', () => {
  let component: BusIconComponent;
  let fixture: ComponentFixture<BusIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BusIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
