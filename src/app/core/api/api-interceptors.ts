import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  catchError,
  finalize,
  map,
  Observable,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';

import { RESULT_CODE } from '../../shared/interfaces';
import { Session } from '../session';
import { API_BASE_URL, CLIENT_ID } from './api-config';
import { ApiException, errorFromHttp } from './api-error';

const REFRESH_PATH = 'v1/auth/refresh-token';
const LOGIN_PATH = 'v1/auth/login';
const LOGOUT_PATH = 'v1/auth/logout';

const isPath = (url: string, path: string): boolean => url.split('?')[0].endsWith(path);

const sessionExpired = (): ApiException =>
  new ApiException({ kind: 'session-expired', message: null });

/** Fixed headers of every UAM request; the auth token itself travels in a cookie. */
export const headersInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(Session);
  const headers: Record<string, string> = {
    'Authorization-Type': 'JWT',
    'X-ClientId': inject(CLIENT_ID),
  };
  const userType = session.userType();
  const ssoSession = session.ssoSession();
  if (userType) headers['X-UserType'] = userType;
  if (ssoSession) headers['X-Sso-Session'] = ssoSession;
  return next(req.clone({ setHeaders: headers, withCredentials: true }));
};

/**
 * Notices that the session is over (result code 40102 or an auth error that forces a new login) and, from then
 * on, refuses requests on the client until the user signs in again. Login and logout must still get through.
 */
export const sessionInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(Session);
  const isLogin = isPath(req.url, LOGIN_PATH);
  if (session.expired() && !isLogin && !isPath(req.url, LOGOUT_PATH)) {
    return throwError(sessionExpired);
  }
  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse && isSessionExpiredEnvelope(event.body)) {
          session.markExpired();
        }
      },
      error: (err: unknown) => {
        // A rejected login is a wrong password, not an expired session.
        if (
          !isLogin &&
          err instanceof HttpErrorResponse &&
          errorFromHttp(err).kind === 'session-expired'
        ) {
          session.markExpired();
        }
      },
    }),
  );
};

const isSessionExpiredEnvelope = (body: unknown): boolean =>
  typeof body === 'object' &&
  body !== null &&
  (body as { statusCode?: unknown }).statusCode === RESULT_CODE.SESSION_EXPIRED;

/** At most one refresh-token call at a time; everybody who needs it waits for the same one. */
@Injectable({ providedIn: 'root' })
export class TokenRefresher {
  readonly #http = inject(HttpClient);
  readonly #base = inject(API_BASE_URL);
  readonly #clientId = inject(CLIENT_ID);
  #inflight: Observable<void> | null = null;

  refresh(): Observable<void> {
    this.#inflight ??= this.#http
      .post(`${this.#base}${REFRESH_PATH}`, { SystemId: this.#clientId })
      .pipe(
        map(() => undefined),
        finalize(() => (this.#inflight = null)),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    return this.#inflight;
  }
}

/** `token-expired` → refresh once (shared), then replay the request; if that fails the session is over. */
export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  if (isPath(req.url, REFRESH_PATH)) return next(req);
  const session = inject(Session);
  const refresher = inject(TokenRefresher);
  const expire = (): Observable<never> => {
    session.markExpired();
    return throwError(sessionExpired);
  };
  return next(req).pipe(
    catchError((err: unknown): Observable<HttpEvent<unknown>> => {
      if (!(err instanceof HttpErrorResponse) || errorFromHttp(err).kind !== 'token-expired') {
        return throwError(() => err);
      }
      return refresher.refresh().pipe(
        catchError(expire),
        switchMap(() =>
          next(req).pipe(
            catchError((replayErr: unknown) =>
              replayErr instanceof HttpErrorResponse &&
              errorFromHttp(replayErr).kind === 'token-expired'
                ? expire()
                : throwError(() => replayErr),
            ),
          ),
        ),
      );
    }),
  );
};

/** Order matters: the session guard sits outside the refresh so it sees the final outcome. */
export const apiInterceptors: HttpInterceptorFn[] = [
  headersInterceptor,
  sessionInterceptor,
  refreshInterceptor,
];
