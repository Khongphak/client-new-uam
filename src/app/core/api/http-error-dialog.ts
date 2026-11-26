import {
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';

import { RESULT_CODE } from '../../shared/interfaces';
import { ApiError, errorFromHttp } from './api-error';

/** The failures that get a dialog besides "session expired" (that one is read from `Session.expired`). */
export type HttpErrorDialog = Extract<ApiError, { kind: 'network' | 'server' }>;

/** Set on a request whose caller shows its own error (e.g. an in-drawer banner) so no dialog opens. */
export const SKIP_ERROR_DIALOG = new HttpContextToken<boolean>(() => false);

const SERVER_CODES: readonly string[] = [
  RESULT_CODE.SYSTEM_ERROR,
  RESULT_CODE.DB_ERROR,
  RESULT_CODE.TIME_OUT,
];

/** The one dialog the UI may show for HTTP failures. While one is open later failures are dropped (no stacking). */
@Injectable({ providedIn: 'root' })
export class HttpErrorDialogState {
  readonly #current = signal<HttpErrorDialog | null>(null);
  readonly current = this.#current.asReadonly();

  show(error: HttpErrorDialog): void {
    if (this.#current() === null) this.#current.set(error);
  }

  dismiss(): void {
    this.#current.set(null);
  }
}

/**
 * Reports network failures (status 0) and server errors (50000–50002 or HTTP 5xx) to {@link HttpErrorDialogState}.
 * Observe only: the error still reaches the caller, and retry/refresh/logout decisions stay in the other interceptors.
 */
export const errorDialogInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_ERROR_DIALOG)) return next(req);
  const state = inject(HttpErrorDialogState);
  return next(req).pipe(
    tap({
      next: (event) => {
        if (!(event instanceof HttpResponse)) return;
        const body = event.body as { statusCode?: unknown; message?: unknown } | null;
        const code = typeof body === 'object' && body !== null ? body.statusCode : undefined;
        if (typeof code === 'string' && SERVER_CODES.includes(code)) {
          const message = typeof body?.message === 'string' ? body.message : null;
          state.show({ kind: 'server', code, message });
        }
      },
      error: (err: unknown) => {
        if (!(err instanceof HttpErrorResponse)) return;
        const error = errorFromHttp(err);
        if (error.kind === 'network' || error.kind === 'server') state.show(error);
      },
    }),
  );
};
