import { ACCESS_POLICY, canAccess, UamRole } from './role-access';

describe('canAccess', () => {
  it('allows a listed role', () => {
    expect(canAccess(['ADMIN', 'DEVELOPER'], 'DEVELOPER', false)).toBe(true);
  });

  it('denies an unlisted role', () => {
    expect(canAccess(['ADMIN'], 'DEVELOPER', false)).toBe(false);
    expect(canAccess(['ADMIN'], 'UNKNOWN', false)).toBe(false);
  });

  it('lets a super admin through whatever the role', () => {
    expect(canAccess(['ADMIN'], 'USER', true)).toBe(true);
    expect(canAccess([], '', true)).toBe(true);
  });
});

describe('ACCESS_POLICY', () => {
  const visible = (role: UamRole | string, systemAdmin: boolean) =>
    Object.entries(ACCESS_POLICY)
      .filter(([, allowed]) => canAccess(allowed, role, systemAdmin))
      .map(([key]) => key);

  it.each([
    ['ADMIN', false, ['home', 'system-setting', 'user-permission', 'report']],
    ['DEVELOPER', false, ['home', 'system-setting']],
    ['AUDIT', false, ['home', 'report']],
    ['USER', false, ['home']],
    ['USER', true, ['home', 'system-setting', 'user-permission', 'report']],
  ])('role %s (super admin: %s) reaches %j', (role, systemAdmin, expected) => {
    expect(visible(role, systemAdmin)).toEqual(expected);
  });
});
