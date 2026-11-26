import { TestBed } from '@angular/core/testing';

import { UserProfile } from '../shared/interfaces';
import { Session, SESSION_STORAGE_KEY } from './session';

const profile: UserProfile = {
  userId: 1,
  userName: 'somchai.k',
  firstName: 'S',
  lastName: 'K',
  position: 'p',
  uamRole: 'ADMIN',
  systemAdmin: false,
  userType: 'AD',
};

/** A reload = a fresh injector reading the same sessionStorage. */
function reload(): Session {
  TestBed.resetTestingModule();
  return TestBed.inject(Session);
}

describe('Session persistence (UAM-AUT-03)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.resetTestingModule();
  });

  it('keeps the profile and consent across a reload', () => {
    TestBed.inject(Session).signIn('AD', 'sso-secret', profile, true);
    const after = reload();
    expect(after.profile()).toEqual(profile);
    expect(after.userType()).toBe('AD');
    expect(after.consented()).toBe(true);
  });

  it('never stores the SSO session id', () => {
    TestBed.inject(Session).signIn('AD', 'sso-secret', profile, true);
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).not.toContain('sso-secret');
    expect(reload().ssoSession()).toBeNull();
  });

  it('remembers that consent is still pending, and that it was accepted later', () => {
    const s = TestBed.inject(Session);
    s.signIn('AD', 'x', profile, false);
    expect(reload().consented()).toBe(false);
    TestBed.inject(Session).markConsented();
    expect(reload().consented()).toBe(true);
  });

  it('forgets everything on clear()', () => {
    TestBed.inject(Session).signIn('AD', 'x', profile, true);
    TestBed.inject(Session).clear();
    const after = reload();
    expect(after.profile()).toBeNull();
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it.each(['not json', '{}', '{"profile":{"userName":""},"consented":true}', 'null'])(
    'ignores a corrupt stored value (%s)',
    (raw) => {
      sessionStorage.setItem(SESSION_STORAGE_KEY, raw);
      expect(reload().profile()).toBeNull();
    },
  );

  it('still works when storage is blocked', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => TestBed.inject(Session).signIn('AD', 'x', profile, true)).not.toThrow();
    spy.mockRestore();
  });
});
