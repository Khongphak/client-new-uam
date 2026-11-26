import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { App } from './app';
import { Session } from './core/session';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    });
  });

  it('creates the root component', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the router-outlet and the HTTP error dialog host', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('router-outlet')).not.toBeNull();
    expect(host.children.length).toBe(2);
    expect(host.querySelector('u-http-error-dialogs')).not.toBeNull();
  });
});

describe('routes', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('lazy-loads the placeholder page on the root path', async () => {
    const root = routes.find((r) => r.path === '');
    expect(root?.loadComponent).toBeTypeOf('function');
    expect(root?.component).toBeUndefined();

    // The shell is behind authGuard (UAM-AUT-03), so sign in first.
    TestBed.inject(Session).signIn('AD', 's', {
      userId: 1,
      userName: 'u',
      firstName: 'U',
      lastName: 'L',
      position: 'p',
      uamRole: 'ADMIN',
      systemAdmin: false,
      userType: 'AD',
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');
    expect(
      harness.routeNativeElement?.querySelector('[data-testid="placeholder-page"]'),
    ).not.toBeNull();
  });
});
