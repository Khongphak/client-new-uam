import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';

import { ApiError, ApiException } from '../../core/api/api-error';
import { CLIENT_ID } from '../../core/api/api-config';
import { Session } from '../../core/session';
import { routes } from '../../app.routes';
import { LoginData, LoginRequest } from '../../shared/interfaces';
import { AuthApi } from '../api/auth-api';
import { LoginPage, REMEMBERED_USERNAME_KEY } from './login-page';

const data = (isConsent: boolean): LoginData => ({
  result: {
    sessionId: 'sess-1',
    isConsent,
    userProfile: {
      userId: 1,
      userName: 'somchai.k',
      firstName: 'Somchai',
      lastName: 'K',
      position: 'Tester',
      uamRole: 'ADMIN',
      systemAdmin: false,
      userType: 'AD',
    },
  },
});

describe('LoginPage', () => {
  let login: ReturnType<typeof vi.fn<(r: LoginRequest) => Observable<LoginData>>>;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    login = vi.fn(() => of(data(true)));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthApi, useValue: { login } },
        { provide: CLIENT_ID, useValue: 'client-1' },
      ],
    });
  });

  async function render() {
    const fixture = TestBed.createComponent(LoginPage);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const q = <T extends HTMLElement>(id: string) =>
      el.querySelector<T>(`[data-testid="${id}"]`) as T;
    const type = async (id: string, value: string) => {
      const input = q<HTMLInputElement>(id);
      input.value = value;
      input.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    };
    const submit = async () => {
      q<HTMLFormElement>('login-form').dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { fixture, el, q, type, submit };
  }

  it('shows the sign-in copy, autocomplete hints and the IT Support link; no lock-out message', async () => {
    const { el, q } = await render();
    expect(el.textContent).toContain('Use your company (AD) account.');
    expect(q('login-username').getAttribute('autocomplete')).toBe('username');
    expect(q('login-password').getAttribute('autocomplete')).toBe('current-password');
    expect(el.querySelector('a[href="mailto:ITSupport@philliplife.com"]')).not.toBeNull();
    expect(el.textContent).not.toMatch(/account (has been|is) locked|too many attempts/i);
    expect(el.querySelector('[role="alert"]')).toBeNull();
  });

  it('keeps Sign in disabled until both fields are filled', async () => {
    const { q, type } = await render();
    expect(q<HTMLButtonElement>('login-submit').disabled).toBe(true);
    await type('login-username', 'somchai.k');
    expect(q<HTMLButtonElement>('login-submit').disabled).toBe(true);
    await type('login-password', 'pw');
    expect(q<HTMLButtonElement>('login-submit').disabled).toBe(false);
  });

  it('toggles the password between hidden and visible with an accessible label', async () => {
    const { fixture, q } = await render();
    const toggle = q<HTMLButtonElement>('login-password-toggle');
    expect(q<HTMLInputElement>('login-password').type).toBe('password');
    expect(toggle.getAttribute('aria-label')).toBe('Show password');
    toggle.click();
    await fixture.whenStable();
    expect(q<HTMLInputElement>('login-password').type).toBe('text');
    expect(toggle.getAttribute('aria-label')).toBe('Hide password');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    toggle.click();
    await fixture.whenStable();
    expect(q<HTMLInputElement>('login-password').type).toBe('password');
  });

  it('sends the unchanged payload (Username, Password, SystemId) and shows the loading state', async () => {
    const pending = new Subject<LoginData>();
    login.mockReturnValue(pending);
    const { q, type, submit, fixture } = await render();
    await type('login-username', 'somchai.k');
    await type('login-password', 'pw');
    await submit();
    expect(login).toHaveBeenCalledExactlyOnceWith({
      Username: 'somchai.k',
      Password: 'pw',
      SystemId: 'client-1',
    });
    expect(q('login-submit').textContent).toContain('Signing in…');
    expect(q<HTMLButtonElement>('login-submit').disabled).toBe(true);
    await submit(); // a double submit must not send a second request
    expect(login).toHaveBeenCalledTimes(1);
    pending.complete();
    fixture.destroy();
  });

  it('on success stores the session and goes to /pdpaconsent when consent is not accepted yet', async () => {
    login.mockReturnValue(of(data(false)));
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const { type, submit } = await render();
    await type('login-username', 'somchai.k');
    await type('login-password', 'pw');
    await submit();
    const session = TestBed.inject(Session);
    expect(session.userType()).toBe('AD');
    expect(session.ssoSession()).toBe('sess-1');
    expect(session.profile()?.uamRole).toBe('ADMIN');
    expect(navigate).toHaveBeenCalledWith('/pdpaconsent');
  });

  it('goes to /home when consent was already accepted', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const { type, submit } = await render();
    await type('login-username', 'somchai.k');
    await type('login-password', 'pw');
    await submit();
    expect(navigate).toHaveBeenCalledWith('/home');
  });

  describe('returnUrl (set by the auth guard)', () => {
    async function loginWith(returnUrl: string | null, isConsent: boolean) {
      TestBed.resetTestingModule();
      login.mockReturnValue(of(data(isConsent)));
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: AuthApi, useValue: { login } },
          { provide: CLIENT_ID, useValue: 'client-1' },
          {
            provide: ActivatedRoute,
            useValue: { snapshot: { queryParamMap: convertToParamMap(returnUrl ? { returnUrl } : {}) } },
          },
        ],
      });
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
      const { type, submit } = await render();
      await type('login-username', 'somchai.k');
      await type('login-password', 'pw');
      await submit();
      return navigate;
    }

    it('goes back to the page the guard stopped when consent is already accepted', async () => {
      expect(await loginWith('/report', true)).toHaveBeenCalledWith('/report');
    });

    it('goes to consent first (keeping returnUrl) when consent is pending (TC-AUT-009)', async () => {
      expect(await loginWith('/report', false)).toHaveBeenCalledWith(
        '/pdpaconsent?returnUrl=%2Freport',
      );
    });

    it('ignores an external returnUrl', async () => {
      expect(await loginWith('//evil.example', true)).toHaveBeenCalledWith('/home');
      expect(await loginWith('https://evil.example', false)).toHaveBeenCalledWith('/pdpaconsent');
    });
  });

  const failWith = (error: ApiError) =>
    login.mockReturnValue(throwError(() => new ApiException(error)));

  it('shows the incorrect-credentials alert, marks fields invalid and stays on the page', async () => {
    failWith({ kind: 'invalid-parameter', message: null });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const { el, q, type, submit } = await render();
    await type('login-username', 'somchai.k');
    await type('login-password', 'wrong');
    await submit();
    expect(el.querySelector('[role="alert"]')?.textContent).toContain(
      'Username or password is incorrect. Check them and try again.',
    );
    expect(q('login-username').classList).toContain('p-invalid');
    expect(q('login-password').classList).toContain('p-invalid');
    expect(q<HTMLButtonElement>('login-submit').disabled).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
    expect(TestBed.inject(Session).ssoSession()).toBeNull();
  });

  it('tells a network failure apart from wrong credentials', async () => {
    failWith({ kind: 'network' });
    const { el, q, type, submit } = await render();
    await type('login-username', 'a');
    await type('login-password', 'b');
    await submit();
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('Network Error');
    expect(q('login-username').classList).not.toContain('p-invalid');
  });

  it('clears the error once the user edits a field', async () => {
    failWith({ kind: 'invalid-parameter', message: null });
    const { el, type, submit } = await render();
    await type('login-username', 'a');
    await type('login-password', 'b');
    await submit();
    await type('login-password', 'bc');
    expect(el.querySelector('[role="alert"]')).toBeNull();
  });

  it('remembers the username only when the box is ticked, and prefills it next time', async () => {
    const { type, submit } = await render();
    await type('login-username', 'somchai.k');
    await type('login-password', 'pw');
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    await submit();
    expect(localStorage.getItem(REMEMBERED_USERNAME_KEY)).toBe('somchai.k');
    expect(localStorage.getItem(REMEMBERED_USERNAME_KEY)).not.toContain('pw');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthApi, useValue: { login } }],
    });
    const next = await render();
    expect(next.q<HTMLInputElement>('login-username').value).toBe('somchai.k');
  });

  it('forgets the username when the box is unticked', async () => {
    localStorage.setItem(REMEMBERED_USERNAME_KEY, 'old.user');
    const { fixture, q, type, submit } = await render();
    expect(q<HTMLInputElement>('login-username').value).toBe('old.user');
    const box = q<HTMLInputElement>('login-remember').querySelector('input') as HTMLInputElement;
    box.click();
    await fixture.whenStable();
    await type('login-password', 'pw');
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    await submit();
    expect(localStorage.getItem(REMEMBERED_USERNAME_KEY)).toBeNull();
  });

  it('is registered at the public /login route', () => {
    expect(routes.some((r) => r.path === 'login')).toBe(true);
  });
});
