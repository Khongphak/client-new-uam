import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { UserProfile } from '../../shared/interfaces';
import { Session } from '../session';
import { authChildGuard, authGuard, consentGuard, safeReturnUrl } from './auth-guard';

const profile: UserProfile = {
  userId: 1,
  userName: 'u',
  firstName: 'U',
  lastName: 'L',
  position: 'p',
  uamRole: 'ADMIN',
  systemAdmin: false,
  userType: 'AD',
};

function run(
  guard: typeof authGuard,
  url: string,
  setup: (s: Session) => void = () => undefined,
  returnUrl: string | null = null,
): string | true {
  TestBed.resetTestingModule();
  sessionStorage.clear();
  setup(TestBed.inject(Session));
  const route = {
    queryParamMap: { get: () => returnUrl },
  } as unknown as ActivatedRouteSnapshot;
  const result = TestBed.runInInjectionContext(() =>
    guard(route, { url } as RouterStateSnapshot),
  ) as boolean | UrlTree;
  return result === true ? true : TestBed.inject(Router).serializeUrl(result as UrlTree);
}

describe('authGuard', () => {
  it('sends a visitor who is not signed in to /login with returnUrl (TC-AUT-007)', () => {
    expect(run(authGuard, '/home')).toBe('/login?returnUrl=%2Fhome');
    expect(run(authGuard, '/report?x=1')).toBe('/login?returnUrl=%2Freport%3Fx%3D1');
  });

  it('drops returnUrl for the root', () => {
    expect(run(authGuard, '/')).toBe('/login');
  });

  it('sends a signed-in user who has not accepted consent to /pdpaconsent (TC-AUT-006)', () => {
    expect(run(authGuard, '/home', (s) => s.signIn('AD', 'x', profile, false))).toBe(
      '/pdpaconsent?returnUrl=%2Fhome',
    );
  });

  it('lets a consented, signed-in user through', () => {
    expect(run(authGuard, '/home', (s) => s.signIn('AD', 'x', profile, true))).toBe(true);
  });

  it('covers child routes with the same rule', () => {
    expect(run(authChildGuard as typeof authGuard, '/users')).toBe('/login?returnUrl=%2Fusers');
  });
});

describe('consentGuard', () => {
  it('sends a visitor who is not signed in to /login (moved from ConsentPage effect)', () => {
    expect(run(consentGuard, '/pdpaconsent')).toBe('/login?returnUrl=%2Fpdpaconsent');
  });

  it('lets a signed-in user who has not accepted yet see the consent page', () => {
    expect(run(consentGuard, '/pdpaconsent', (s) => s.signIn('AD', 'x', profile, false))).toBe(true);
  });

  it('sends a user who already accepted to /home, or to a safe returnUrl', () => {
    const signed = (s: Session) => s.signIn('AD', 'x', profile, true);
    expect(run(consentGuard, '/pdpaconsent', signed)).toBe('/home');
    expect(run(consentGuard, '/pdpaconsent', signed, '/report')).toBe('/report');
    expect(run(consentGuard, '/pdpaconsent', signed, '//evil.example')).toBe('/home');
  });
});

describe('safeReturnUrl', () => {
  it.each([
    ['/home', '/home'],
    ['/a?b=1', '/a?b=1'],
    ['//evil.example', null],
    ['/\\evil.example', null],
    ['https://evil.example', null],
    ['home', null],
    ['', null],
    [null, null],
  ])('%s → %s', (input, expected) => {
    expect(safeReturnUrl(input)).toBe(expected);
  });
});
