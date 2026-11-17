import { HttpErrorResponse } from '@angular/common/http';

import { ApiHttpErrorBody, AUTH_ERROR_CODE, RESULT_CODE } from '../../shared/interfaces';

/** Central error model: every failure of an API call is converted to exactly one of these (ADR-0001). */
export type ApiError =
  /** 40102, or an auth error code that forces a new login. */
  | { readonly kind: 'session-expired'; readonly message: string | null }
  /** `TOKEN_EXPIRED` / `SSO_TOKEN_EXPIRED`: refresh the token once, then replay the request. */
  | { readonly kind: 'token-expired'; readonly message: string | null }
  | { readonly kind: 'access-denied'; readonly message: string | null }
  /** 40301 — a duplicate name/key. The backend does not say which field. */
  | { readonly kind: 'already-existed'; readonly message: string | null }
  | { readonly kind: 'invalid-parameter'; readonly message: string | null }
  | { readonly kind: 'not-found'; readonly message: string | null }
  /** 50000 / 50001 / 50002. */
  | { readonly kind: 'server'; readonly code: string; readonly message: string | null }
  | { readonly kind: 'network' }
  /** HTTP 422 `ModelState`. */
  | { readonly kind: 'validation'; readonly fields: Readonly<Record<string, string>> }
  | { readonly kind: 'unknown'; readonly code: string; readonly message: string | null };

export class ApiException extends Error {
  constructor(readonly error: ApiError) {
    super('message' in error && error.message ? error.message : `API error: ${error.kind}`);
    this.name = 'ApiException';
  }
}

const SUCCESS_CODES: readonly string[] = [RESULT_CODE.SUCCESS, RESULT_CODE.CREATED];
const RE_LOGIN_CODES: readonly string[] = [
  AUTH_ERROR_CODE.INTERNAL_ERROR,
  AUTH_ERROR_CODE.TOKEN_INVALID,
  AUTH_ERROR_CODE.AUDIENCE_MISSING,
  AUTH_ERROR_CODE.SSO_SESSION_INVALID,
  AUTH_ERROR_CODE.SSO_SESSION_EXPIRED,
  AUTH_ERROR_CODE.REFRESH_TOKEN_INVALID,
  AUTH_ERROR_CODE.REFRESH_TOKEN_EXPIRED,
];

export const isSuccessCode = (statusCode: string): boolean => SUCCESS_CODES.includes(statusCode);

/** Maps the `statusCode` of an HTTP 200 envelope to an error. */
export function errorFromResultCode(code: string, message: string | null): ApiError {
  switch (code) {
    case RESULT_CODE.SESSION_EXPIRED:
      return { kind: 'session-expired', message };
    case RESULT_CODE.ACCESS_DENIED:
      return { kind: 'access-denied', message };
    case RESULT_CODE.ALREADY_EXISTED:
      return { kind: 'already-existed', message };
    case RESULT_CODE.INVALID_PARAMETER:
      return { kind: 'invalid-parameter', message };
    case RESULT_CODE.NOT_FOUND:
    case RESULT_CODE.UNKNOWN_URL:
      return { kind: 'not-found', message };
    case RESULT_CODE.SYSTEM_ERROR:
    case RESULT_CODE.DB_ERROR:
    case RESULT_CODE.TIME_OUT:
      return { kind: 'server', code, message };
    default:
      return { kind: 'unknown', code, message };
  }
}

/** Maps a non-2xx HTTP answer. The message is read from `message`, `Message`, `error_description` in that order. */
export function errorFromHttp(err: HttpErrorResponse): ApiError {
  if (err.status === 0) return { kind: 'network' };
  const body = (
    typeof err.error === 'object' && err.error !== null ? err.error : {}
  ) as ApiHttpErrorBody;
  const message = body.message ?? body.Message ?? body.error_description ?? null;
  if (err.status === 422 && body.ModelState) return { kind: 'validation', fields: body.ModelState };
  const code = body.errorCode ?? '';
  if (code === AUTH_ERROR_CODE.TOKEN_EXPIRED || code === AUTH_ERROR_CODE.SSO_TOKEN_EXPIRED) {
    return { kind: 'token-expired', message };
  }
  if (RE_LOGIN_CODES.includes(code)) return { kind: 'session-expired', message };
  if (err.status === 401) return { kind: 'session-expired', message };
  if (err.status === 403) return { kind: 'access-denied', message };
  if (err.status === 404) return { kind: 'not-found', message };
  if (err.status >= 500) return { kind: 'server', code: code || String(err.status), message };
  return { kind: 'unknown', code: code || String(err.status), message };
}
