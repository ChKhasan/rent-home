import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceBlockComponent } from './price-block.component';

describe('PriceBlockComponent', () => {
  let component: PriceBlockComponent;
  let fixture: ComponentFixture<PriceBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PriceBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
