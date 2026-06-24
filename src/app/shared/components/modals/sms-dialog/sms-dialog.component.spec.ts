import { SmsDialogComponent } from './sms-dialog.component';
import { environment } from '@environments';

describe('SmsDialogComponent', () => {
  let component: SmsDialogComponent;
  const originalProduction = environment.production;

  beforeEach(() => {
    localStorage.clear();
    component = new SmsDialogComponent({ requestData: jasmine.createSpy() } as any);
  });

  afterEach(() => {
    environment.production = originalProduction;
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows stored local OTP in development when it has local marker', () => {
    environment.production = false;
    localStorage.setItem('local_otp_code', JSON.stringify({ code: '12345', local_otp: true }));

    component.showDialog();

    expect(component.localOtpCode).toBe('12345');
    expect(component.code).toBe('12345');
  });

  it('does not show local OTP in production', () => {
    environment.production = true;
    localStorage.setItem('local_otp_code', JSON.stringify({ code: '12345', local_otp: true }));

    component.showDialog();

    expect(component.localOtpCode).toBeNull();
    expect(component.code).toBeUndefined();
  });

  it('does not show OTP when local marker is missing', () => {
    environment.production = false;
    localStorage.setItem('local_otp_code', JSON.stringify({ code: '12345' }));

    component.showDialog();

    expect(component.localOtpCode).toBeNull();
    expect(component.code).toBeUndefined();
  });
});
