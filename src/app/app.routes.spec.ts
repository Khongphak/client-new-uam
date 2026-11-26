import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { UserProfile } from './shared/interfaces';
import { Session } from './core/session';
import { routes } from './app.routes';

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

/** Real route table + real guards; components are lazy so only URL decisions are checked. */
describe('route protection (UAM-AUT-03)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  async function visit(url: string): Promise<string> {
    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);
    return router.url;
  }

  it.each(['/home', '/report'])(
    'not signed in: %s → /login with returnUrl (TC-AUT-007)',
    async (url) => {
      expect(await visit(url)).toBe(`/login?returnUrl=${encodeURIComponent(url)}`);
    },
  );

  it('not signed in: /pdpaconsent → /login', async () => {
    expect(await visit('/pdpaconsent')).toContain('/login');
  });

  it('signed in but consent pending: /home → /pdpaconsent (TC-AUT-006)', async () => {
    TestBed.inject(Session).signIn('AD', 's', profile, false);
    expect(await visit('/home')).toBe('/pdpaconsent?returnUrl=%2Fhome');
  });

  it('signed in and consented: /home opens, /pdpaconsent sends back to /home', async () => {
    TestBed.inject(Session).signIn('AD', 's', profile, true);
    expect(await visit('/home')).toBe('/home');
    expect(await visit('/pdpaconsent')).toBe('/home');
  });

  it('after a reload (new injector, same tab) the user is still signed in', async () => {
    TestBed.inject(Session).signIn('AD', 's', profile, true);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    expect(await visit('/home')).toBe('/home');
  });

  it('keeps public pages open without a session', async () => {
    expect(await visit('/login')).toBe('/login');
    expect(await visit('/forbidden')).toBe('/forbidden');
  });
});
