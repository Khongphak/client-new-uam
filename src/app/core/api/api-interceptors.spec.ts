import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { Session } from '../session';
import { API_BASE_URL, CLIENT_ID } from './api-config';
import { ApiError, ApiException } from './api-error';
import { ApiHttp } from './api-http';
import { apiInterceptors } from './api-interceptors';

const REFRESH = '/api/v1/auth/refresh-token';
const unauthorized = { status: 401, statusText: 'Unauthorized' };
const body = (errorCode: string) => ({ errorCode, message: 'm' });
const ok = <T>(data: T) => ({ statusCode: '20000', status: 's', message: null, data });

describe('api interceptors', () => {
  let ctrl: HttpTestingController;
  let http: HttpClient;
  let api: ApiHttp;
  let session: Session;

  beforeEach(() => {

    sessionStorage.clear(); // Session persists across reloads (UAM-AUT-03); keep tests independent
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors(apiInterceptors)),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api/' },
        { provide: CLIENT_ID, useValue: 'test-client' },
      ],
    });
    ctrl = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    api = TestBed.inject(ApiHttp);
    session = TestBed.inject(Session);
  });
  afterEach(() => ctrl.verify());

  const errorOf = async (p: Promise<unknown>): Promise<ApiError> => {
    try {
      await p;
    } catch (e) {
      return (e as ApiException).error;
    }
    throw new Error('expected a failure');
  };

  describe('headers', () => {
    it('adds the fixed headers and credentials to every request', () => {
      http.get('/api/v1/x').subscribe();
      const req = ctrl.expectOne('/api/v1/x');
      expect(req.request.headers.get('Authorization-Type')).toBe('JWT');
      expect(req.request.headers.get('X-ClientId')).toBe('test-client');
      expect(req.request.withCredentials).toBe(true);
      expect(req.request.headers.has('X-UserType')).toBe(false);
      expect(req.request.headers.has('X-Sso-Session')).toBe(false);
      req.flush({});
    });

    it('adds X-UserType and X-Sso-Session once the session has them', () => {
      session.signIn('AD', 'sess-1');
      http.get('/api/v1/x').subscribe();
      const req = ctrl.expectOne('/api/v1/x');
      expect(req.request.headers.get('X-UserType')).toBe('AD');
      expect(req.request.headers.get('X-Sso-Session')).toBe('sess-1');
      req.flush({});
    });
  });

  describe('token refresh', () => {
    it('refreshes once and replays the request', async () => {
      const result = firstValueFrom(api.get<string>('v1/x'));
      ctrl.expectOne('/api/v1/x').flush(body('TOKEN_EXPIRED'), unauthorized);

      const refresh = ctrl.expectOne(REFRESH);
      expect(refresh.request.method).toBe('POST');
      expect(refresh.request.body).toEqual({ SystemId: 'test-client' });
      expect(refresh.request.withCredentials).toBe(true);
      refresh.flush({ isValid: true, userName: 'u', userType: 'AD' });

      ctrl.expectOne('/api/v1/x').flush(ok('ok'));
      expect(await result).toBe('ok');
      expect(session.expired()).toBe(false);
    });

    it('also refreshes on SSO_TOKEN_EXPIRED', async () => {
      const result = firstValueFrom(api.get<number>('v1/x'));
      ctrl.expectOne('/api/v1/x').flush(body('SSO_TOKEN_EXPIRED'), unauthorized);
      ctrl.expectOne(REFRESH).flush({});
      ctrl.expectOne('/api/v1/x').flush(ok(1));
      expect(await result).toBe(1);
    });

    it('sends one refresh for three simultaneous expired requests and replays all three', async () => {
      const paths = ['a', 'b', 'c'];
      const results = paths.map((p) => firstValueFrom(api.get<string>(`v1/${p}`)));
      for (const p of paths)
        ctrl.expectOne(`/api/v1/${p}`).flush(body('TOKEN_EXPIRED'), unauthorized);
      ctrl.expectOne(REFRESH).flush({});
      for (const p of paths) ctrl.expectOne(`/api/v1/${p}`).flush(ok(p));
      expect(await Promise.all(results)).toEqual(paths);
    });

    it('expires the session when the refresh fails, and does not replay', async () => {
      const result = errorOf(firstValueFrom(api.get('v1/x')));
      ctrl.expectOne('/api/v1/x').flush(body('TOKEN_EXPIRED'), unauthorized);
      ctrl.expectOne(REFRESH).flush(body('REFRESH_TOKEN_EXPIRED'), unauthorized);

      expect((await result).kind).toBe('session-expired');
      expect(session.expired()).toBe(true);
      ctrl.expectNone('/api/v1/x');
    });

    it('does not refresh again when the replay is still expired', async () => {
      const result = errorOf(firstValueFrom(api.get('v1/x')));
      ctrl.expectOne('/api/v1/x').flush(body('TOKEN_EXPIRED'), unauthorized);
      ctrl.expectOne(REFRESH).flush({});
      ctrl.expectOne('/api/v1/x').flush(body('TOKEN_EXPIRED'), unauthorized);

      expect((await result).kind).toBe('session-expired');
      expect(session.expired()).toBe(true);
      ctrl.expectNone(REFRESH);
    });

    it('can refresh again later (the single-flight slot is released)', async () => {
      for (let i = 0; i < 2; i++) {
        const result = firstValueFrom(api.get<number>('v1/x'));
        ctrl.expectOne('/api/v1/x').flush(body('TOKEN_EXPIRED'), unauthorized);
        ctrl.expectOne(REFRESH).flush({});
        ctrl.expectOne('/api/v1/x').flush(ok(i));
        expect(await result).toBe(i);
      }
    });
  });

  describe('session expired', () => {
    it.each(['SSO_SESSION_EXPIRED', 'REFRESH_TOKEN_INVALID'])(
      'flags the session on %s and cuts later requests on the client',
      async (code) => {
        const first = errorOf(firstValueFrom(api.get('v1/x')));
        ctrl.expectOne('/api/v1/x').flush(body(code), unauthorized);
        expect((await first).kind).toBe('session-expired');
        expect(session.expired()).toBe(true);

        const second = errorOf(firstValueFrom(api.get('v1/y')));
        ctrl.expectNone('/api/v1/y');
        expect((await second).kind).toBe('session-expired');
      },
    );

    it('flags the session on result code 40102 in a 200 envelope', async () => {
      const result = errorOf(firstValueFrom(api.get('v1/x')));
      ctrl
        .expectOne('/api/v1/x')
        .flush({ statusCode: '40102', status: 's', message: 'm', data: null });
      expect((await result).kind).toBe('session-expired');
      expect(session.expired()).toBe(true);
    });

    it('lets logout and login through while expired, and signing in clears the flag', () => {
      session.markExpired();

      http.post('/api/v1/auth/logout', {}).subscribe();
      ctrl.expectOne('/api/v1/auth/logout').flush({});

      http.post('/api/v1/auth/login', {}).subscribe();
      ctrl.expectOne('/api/v1/auth/login').flush({});

      session.signIn('AD', 'new');
      http.get('/api/v1/x').subscribe();
      ctrl.expectOne('/api/v1/x').flush({});
    });

    it('does not flag the session when login itself is rejected', async () => {
      const result = errorOf(firstValueFrom(api.send('POST', 'v1/auth/login', {})));
      ctrl.expectOne('/api/v1/auth/login').flush(body('TOKEN_INVALID'), unauthorized);
      await result;
      expect(session.expired()).toBe(false);
    });

    it('clear() resets the flag (logout)', () => {
      session.signIn('AD', 's');
      session.markExpired();
      session.clear();
      expect(session.expired()).toBe(false);
      expect(session.userType()).toBeNull();
    });
  });

  describe('retry of HTTP 401', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('retries twice, one second apart, then gives up (session expired)', async () => {
      const result = errorOf(firstValueFrom(api.get('v1/x')));
      ctrl.expectOne('/api/v1/x').flush({}, unauthorized);

      await vi.advanceTimersByTimeAsync(999);
      ctrl.expectNone('/api/v1/x');
      await vi.advanceTimersByTimeAsync(1);
      ctrl.expectOne('/api/v1/x').flush({}, unauthorized);

      await vi.advanceTimersByTimeAsync(1000);
      ctrl.expectOne('/api/v1/x').flush({}, unauthorized);

      expect((await result).kind).toBe('session-expired');
      await vi.advanceTimersByTimeAsync(5000);
      ctrl.expectNone('/api/v1/x');
    });

    it('succeeds when a retry succeeds', async () => {
      const result = firstValueFrom(api.get<string>('v1/x'));
      ctrl.expectOne('/api/v1/x').flush({}, unauthorized);
      await vi.advanceTimersByTimeAsync(1000);
      ctrl.expectOne('/api/v1/x').flush(ok('ok'));
      expect(await result).toBe('ok');
      expect(session.expired()).toBe(false);
    });

    it('does not retry a 401 that names its reason (refresh / new login handle those)', async () => {
      const result = errorOf(firstValueFrom(api.get('v1/x')));
      ctrl.expectOne('/api/v1/x').flush(body('SSO_SESSION_EXPIRED'), unauthorized);
      expect((await result).kind).toBe('session-expired');
      await vi.advanceTimersByTimeAsync(5000);
      ctrl.expectNone('/api/v1/x');
    });

    it('does not retry a rejected login', async () => {
      const result = errorOf(firstValueFrom(api.send('POST', 'v1/auth/login', {})));
      ctrl.expectOne('/api/v1/auth/login').flush({}, unauthorized);
      await result;
      await vi.advanceTimersByTimeAsync(5000);
      ctrl.expectNone('/api/v1/auth/login');
    });

    it('does not retry other statuses', async () => {
      const result = errorOf(firstValueFrom(api.get('v1/x')));
      ctrl.expectOne('/api/v1/x').flush({}, { status: 500, statusText: 'x' });
      await result;
      await vi.advanceTimersByTimeAsync(5000);
      ctrl.expectNone('/api/v1/x');
    });
  });

  describe('other failures', () => {
    it.each([
      [500, 'server'],
      [403, 'access-denied'],
      [404, 'not-found'],
    ])('passes HTTP %i through once: no refresh, no retry, no flag', async (status, kind) => {
      const result = errorOf(firstValueFrom(api.get('v1/x')));
      ctrl.expectOne('/api/v1/x').flush({}, { status, statusText: 'x' });
      expect((await result).kind).toBe(kind);
      ctrl.expectNone('/api/v1/x');
      ctrl.expectNone(REFRESH);
      expect(session.expired()).toBe(false);
    });
  });
});
