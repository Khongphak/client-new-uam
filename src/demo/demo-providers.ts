// DEMO MODE ONLY — replaces src/app/core/demo/demo-providers.ts in the `demo` build.
import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { EnvironmentProviders, provideEnvironmentInitializer } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';

import { createDemoApi } from './demo-api';

const api = createDemoApi();

let latencyMs = 150;
/** Simulated network delay; tests set 0. */
export const setDemoLatency = (ms: number): void => {
  latencyMs = ms;
};

const asBlobError = (body: unknown): HttpErrorResponse | null => {
  const code = (body as { statusCode?: string } | null)?.statusCode;
  return code && !code.startsWith('2') ? new HttpErrorResponse({ status: 500, error: body }) : null;
};

/** Answers every request from the in-memory mock; nothing leaves the app's own origin. */
export const demoInterceptor: HttpInterceptorFn = (req) => {
  api.setFlag(new URLSearchParams(globalThis.location?.search ?? '').get('demo') ?? '');
  const res = api.handle(req.method, req.urlWithParams, req.body) ?? {
    status: 200,
    body: { status: 'IP-E-0001', statusCode: '40400', message: 'Unknown URL (demo)', data: null },
  };
  let out: Observable<HttpResponse<unknown>>;
  if (req.responseType === 'blob') {
    // Report downloads: a file on success, an HTTP error (not a blob) when the demo simulates a failure.
    const failure = res.file ? null : asBlobError(res.body);
    out = failure
      ? throwError(() => failure)
      : of(
          new HttpResponse({
            status: 200,
            url: req.url,
            body: new Blob([res.file?.text ?? ''], { type: res.file?.type ?? 'text/plain' }),
          }),
        );
  } else {
    out = of(new HttpResponse({ status: res.status, body: res.body, url: req.url }));
  }
  return latencyMs > 0 ? out.pipe(delay(latencyMs)) : out;
};

function showBanner(): void {
  const bar = document.createElement('div');
  bar.setAttribute('data-testid', 'demo-banner');
  bar.textContent = 'DEMO — ข้อมูลสมมติ ไม่เชื่อมต่อ backend';
  bar.style.cssText =
    'position:fixed;left:0;right:0;bottom:0;z-index:2147483647;padding:4px 8px;text-align:center;' +
    'font:600 12px/1.4 sans-serif;background:#b45309;color:#fff;pointer-events:none';
  document.body.appendChild(bar);
}

export const demoHttpInterceptors: HttpInterceptorFn[] = [demoInterceptor];
export const demoProviders: EnvironmentProviders[] = [provideEnvironmentInitializer(showBanner)];
