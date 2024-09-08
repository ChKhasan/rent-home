import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyFoundComponent } from './empty-found.component';

describe('EmptyFoundComponent', () => {
  let component: EmptyFoundComponent;
  let fixture: ComponentFixture<EmptyFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyFoundComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
