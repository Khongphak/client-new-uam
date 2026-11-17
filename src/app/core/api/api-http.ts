import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

import { ApiEnvelope } from '../../shared/interfaces';
import { API_BASE_URL } from './api-config';
import { ApiException, errorFromHttp, errorFromResultCode, isSuccessCode } from './api-error';

export type QueryParams = Readonly<Record<string, string | number | undefined>>;

/**
 * The only place that talks HTTP to the UAM backend: adds the base URL, unwraps the envelope and turns every
 * failure (HTTP error or non-success `statusCode`) into an {@link ApiException}. Typed clients build on it.
 * Auth headers / cookies / token refresh belong to interceptors, not here.
 */
@Injectable({ providedIn: 'root' })
export class ApiHttp {
  readonly #http = inject(HttpClient);
  readonly #base = inject(API_BASE_URL);

  /** GET → `data` of the envelope. */
  get<T>(path: string, query?: QueryParams): Observable<T> {
    return this.#http
      .get<ApiEnvelope<T>>(this.#url(path), { params: this.#params(query) })
      .pipe(map(unwrap), catchError(toException));
  }

  /** POST/PUT whose answer carries data (e.g. login, AD search). */
  send<T>(method: 'POST' | 'PUT', path: string, body: unknown): Observable<T> {
    return this.#http
      .request<ApiEnvelope<T>>(method, this.#url(path), { body })
      .pipe(map(unwrap), catchError(toException));
  }

  /** POST/PUT of a save: only success matters (the screens check just `statusCode`). */
  save(method: 'POST' | 'PUT', path: string, body: unknown): Observable<void> {
    return this.send<unknown>(method, path, body).pipe(map(() => undefined));
  }

  /** POST that answers a file (reports). */
  postBlob(path: string, body: unknown): Observable<Blob> {
    return this.#http
      .post(this.#url(path), body, { responseType: 'blob' })
      .pipe(catchError(toException));
  }

  #url(path: string): string {
    return `${this.#base}${path}`;
  }

  #params(query?: QueryParams): HttpParams | undefined {
    if (!query) return undefined;
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) params = params.set(key, String(value));
    }
    return params;
  }
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!isSuccessCode(envelope.statusCode)) {
    throw new ApiException(errorFromResultCode(envelope.statusCode, envelope.message));
  }
  return envelope.data;
}

function toException(err: unknown): Observable<never> {
  if (err instanceof ApiException) return throwError(() => err);
  if (err instanceof HttpErrorResponse)
    return throwError(() => new ApiException(errorFromHttp(err)));
  return throwError(() => err);
}
