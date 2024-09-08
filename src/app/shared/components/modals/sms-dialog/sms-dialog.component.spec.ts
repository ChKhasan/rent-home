import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsDialogComponent } from './sms-dialog.component';

describe('SmsDialogComponent', () => {
  let component: SmsDialogComponent;
  let fixture: ComponentFixture<SmsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmsDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SmsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
