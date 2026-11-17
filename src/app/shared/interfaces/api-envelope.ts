// Backend contract: every `v1/*` / `v2/*` UAM endpoint answers with this envelope.
// `statusCode` is a STRING ('20000'), not a number. Source: UAM-API-01 (API spec, section 1.3).

export const RESULT_CODE = {
  SUCCESS: '20000',
  CREATED: '20100',
  ACCESS_DENIED: '40101',
  SESSION_EXPIRED: '40102',
  INVALID_PARAMETER: '40300',
  ALREADY_EXISTED: '40301',
  UNKNOWN_URL: '40400',
  NOT_FOUND: '40401',
  SYSTEM_ERROR: '50000',
  DB_ERROR: '50001',
  TIME_OUT: '50002',
} as const;
export type ResultCode = (typeof RESULT_CODE)[keyof typeof RESULT_CODE];

export interface ApiEnvelope<T> {
  /** Backend message id, e.g. `IP-S-0001`. */
  readonly status: string;
  /** Result code as a string; compare with {@link RESULT_CODE}. */
  readonly statusCode: string;
  readonly message: string | null;
  readonly data: T;
}

/** Error body of non-2xx HTTP answers (spec 1.4). Only `errorCode` and `message` are read by the app. */
export interface ApiHttpErrorBody {
  readonly errorCode?: string;
  readonly message?: string;
  readonly Message?: string;
  readonly error_description?: string;
  /** HTTP 422 only: field name → message. */
  readonly ModelState?: Readonly<Record<string, string>>;
}

export const AUTH_ERROR_CODE = {
  SSO_SESSION_INVALID: 'SSO_SESSION_INVALID',
  SSO_SESSION_EXPIRED: 'SSO_SESSION_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  AUDIENCE_MISSING: 'AUDIENCE_MISSING',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  REFRESH_TOKEN_INVALID: 'REFRESH_TOKEN_INVALID',
  REFRESH_TOKEN_EXPIRED: 'REFRESH_TOKEN_EXPIRED',
  SSO_TOKEN_EXPIRED: 'SSO_TOKEN_EXPIRED',
} as const;

/** Status values the backend accepts in request bodies. Responses may differ in case (spec 12.6). */
export type RecordStatus = 'Active' | 'Inactive';

/** Date-times are ISO strings WITHOUT time zone (e.g. `2025-01-29T10:09:38.393`); never parse them with `Date`. Spec 0.3 / 12.5. */
export type LocalDateTime = string;
