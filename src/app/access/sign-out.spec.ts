import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { CLIENT_ID } from '../core/api/api-config';
import { SESSION_STORAGE_KEY, Session } from '../core/session';
import { LogoutRequest } from '../shared/interfaces';
import { AuthApi } from './api/auth-api';
import { SignOut } from './sign-out';

describe('SignOut (UAM-AUT-04)', () => {
  let logout: ReturnType<typeof vi.fn<(r: LogoutRequest) => Observable<void>>>;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    sessionStorage.clear();
    logout = vi.fn(() => of(undefined));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthApi, useValue: { logout } },
        { provide: CLIENT_ID, useValue: 'client-1' },
      ],
    });
    TestBed.inject(Session).signIn('AD', 'sess-1', {
      userId: 1,
      userName: 'somchai.k',
      firstName: 'Somchai',
      lastName: 'K',
      position: 'Tester',
      uamRole: 'ADMIN',
      systemAdmin: false,
      userType: 'AD',
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  it('calls logout with the unchanged payload, clears session + storage and goes to /login', () => {
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).not.toBeNull();
    TestBed.inject(SignOut).run().subscribe();
    expect(logout).toHaveBeenCalledExactlyOnceWith({ Username: 'somchai.k', ClientId: 'client-1' });
    expect(TestBed.inject(Session).profile()).toBeNull();
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
    expect(navigate).toHaveBeenCalledWith('/login');
  });

  it('still clears the session and goes to /login when the logout call fails', () => {
    logout.mockReturnValue(throwError(() => new Error('net')));
    let completed = false;
    TestBed.inject(SignOut)
      .run()
      .subscribe({ complete: () => (completed = true) });
    expect(completed).toBe(true);
    expect(TestBed.inject(Session).profile()).toBeNull();
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
    expect(navigate).toHaveBeenCalledWith('/login');
  });

  it('without a profile there is nobody to tell the server about: clears and goes to /login', () => {
    TestBed.inject(Session).clear();
    TestBed.inject(SignOut).run().subscribe();
    expect(logout).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/login');
  });
});
