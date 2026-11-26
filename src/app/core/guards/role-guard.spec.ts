import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { SHELL_PROFILE } from '../../layout/shell/shell-profile';
import { UserProfile } from '../../shared/interfaces';
import { FORBIDDEN_URL, roleGuard } from './role-guard';

const profile = (uamRole: string, systemAdmin = false): UserProfile => ({
  userId: 1,
  userName: 'u',
  firstName: 'U',
  lastName: 'L',
  position: 'p',
  uamRole,
  systemAdmin,
  userType: 'x',
});

function run(allowed: readonly string[], p: UserProfile | null): boolean | UrlTree {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [{ provide: SHELL_PROFILE, useValue: () => p }] });
  return TestBed.runInInjectionContext(() =>
    roleGuard(allowed)({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
  ) as boolean | UrlTree;
}

describe('roleGuard', () => {
  it.each(['ADMIN', 'DEVELOPER', 'AUDIT', 'USER'])('lets %s through when allowed', (role) => {
    expect(run([role], profile(role))).toBe(true);
  });

  it.each([
    ['DEVELOPER', ['ADMIN']],
    ['AUDIT', ['ADMIN', 'DEVELOPER']],
    ['USER', ['ADMIN', 'AUDIT']],
  ])('sends %s to /forbidden (not /notfound) when not allowed', (role, allowed) => {
    const result = run(allowed, profile(role));
    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe(FORBIDDEN_URL);
  });

  it('lets a super admin through every guard, whatever the role', () => {
    expect(run(['ADMIN'], profile('USER', true))).toBe(true);
    expect(run([], profile('AUDIT', true))).toBe(true);
  });

  it('treats a missing profile as no access', () => {
    expect(run(['ADMIN'], null)).toBeInstanceOf(UrlTree);
  });
});
