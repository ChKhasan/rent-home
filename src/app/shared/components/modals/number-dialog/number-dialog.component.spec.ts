import { of } from 'rxjs';

import { NumberDialogComponent } from './number-dialog.component';
import { environment } from '@environments';

describe('NumberDialogComponent', () => {
  let component: NumberDialogComponent;
  let requestService: { requestData: jasmine.Spy };
  const originalProduction = environment.production;

  beforeEach(() => {
    localStorage.clear();
    requestService = {
      requestData: jasmine.createSpy().and.returnValue(of({ phone_number: '+998901234567' })),
    };
    component = new NumberDialogComponent(requestService as any);
    component.ruleForm.setValue({ phone_number: '90 123 45 67' });
    spyOn(component, 'eventPipe');
  });

  afterEach(() => {
    environment.production = originalProduction;
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('stores local OTP only in development when backend marks it local', () => {
    environment.production = false;
    requestService.requestData.and.returnValue(
      of({ phone_number: '+998901234567', otp_code: '12345', local_otp: true })
    );

    component.postLogin();

    expect(localStorage.getItem('local_otp_code')).toBe(JSON.stringify({ code: '12345', local_otp: true }));
  });

  it('does not store OTP in production even if backend returns it', () => {
    environment.production = true;
    requestService.requestData.and.returnValue(
      of({ phone_number: '+998901234567', otp_code: '12345', local_otp: true })
    );

    component.postLogin();

    expect(localStorage.getItem('local_otp_code')).toBeNull();
  });

  it('does not store OTP without local_otp marker', () => {
    environment.production = false;
    requestService.requestData.and.returnValue(of({ phone_number: '+998901234567', otp_code: '12345' }));

    component.postLogin();

    expect(localStorage.getItem('local_otp_code')).toBeNull();
  });
});
