import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvaidTextComponent } from './invaid-text.component';

describe('InvaidTextComponent', () => {
  let component: InvaidTextComponent;
  let fixture: ComponentFixture<InvaidTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvaidTextComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InvaidTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
