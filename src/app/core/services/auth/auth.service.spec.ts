import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { environment } from '@environments';

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AuthService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('clears tokens and emits unauthenticated state synchronously on logout', () => {
        localStorage.setItem(environment.accessToken, 'access');
        localStorage.setItem(environment.refreshToken, 'refresh');
        service.auth = true;
        service.user = { id: 1 };
        let authState = true;
        service.getBooleanValue().subscribe((value) => (authState = value));

        service.logout();

        expect(localStorage.getItem(environment.accessToken)).toBeNull();
        expect(localStorage.getItem(environment.refreshToken)).toBeNull();
        expect(service.auth).toBe(false);
        expect(authState).toBe(false);
    });
});
