import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThumbCarouselComponent } from './thumb-carousel.component';

describe('ThumbCarouselComponent', () => {
  let component: ThumbCarouselComponent;
  let fixture: ComponentFixture<ThumbCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThumbCarouselComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThumbCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
