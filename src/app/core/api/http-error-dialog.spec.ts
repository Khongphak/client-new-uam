import {
  HttpClient,
  HttpContext,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL, CLIENT_ID } from './api-config';
import { apiInterceptors } from './api-interceptors';
import { HttpErrorDialogState, SKIP_ERROR_DIALOG } from './http-error-dialog';

describe('error dialog interceptor', () => {
  let ctrl: HttpTestingController;
  let http: HttpClient;
  let state: HttpErrorDialogState;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors(apiInterceptors)),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api/' },
        { provide: CLIENT_ID, useValue: 'c' },
      ],
    });
    ctrl = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    state = TestBed.inject(HttpErrorDialogState);
  });
  afterEach(() => ctrl.verify());

  const fail = (url: string, context?: HttpContext) =>
    http.get(url, { context }).subscribe({ error: () => undefined });

  it('opens the network dialog on status 0', () => {
    fail('/api/x');
    ctrl.expectOne('/api/x').error(new ProgressEvent('error'), { status: 0 });
    expect(state.current()).toEqual({ kind: 'network' });
  });

  it.each(['50000', '50001', '50002'])('opens the server dialog for envelope %s', (code) => {
    fail('/api/x');
    ctrl.expectOne('/api/x').flush({ statusCode: code, message: 'Database error', data: null });
    expect(state.current()).toEqual({ kind: 'server', code, message: 'Database error' });
  });

  it('opens the server dialog for an HTTP 5xx', () => {
    fail('/api/x');
    ctrl.expectOne('/api/x').flush({ message: 'boom' }, { status: 503, statusText: 'x' });
    expect(state.current()).toEqual({ kind: 'server', code: '503', message: 'boom' });
  });

  it('stays quiet for success and for other errors', () => {
    fail('/api/a');
    ctrl.expectOne('/api/a').flush({ statusCode: '20000', message: null, data: 1 });
    fail('/api/b');
    ctrl.expectOne('/api/b').flush({ message: 'm' }, { status: 404, statusText: 'x' });
    expect(state.current()).toBeNull();
  });

  it('does not stack: the first failure keeps the dialog until it is dismissed', () => {
    fail('/api/a');
    fail('/api/b');
    ctrl.expectOne('/api/a').error(new ProgressEvent('error'), { status: 0 });
    ctrl.expectOne('/api/b').flush({ statusCode: '50001', message: null, data: null });
    expect(state.current()).toEqual({ kind: 'network' });
    state.dismiss();
    expect(state.current()).toBeNull();
  });

  it('honours SKIP_ERROR_DIALOG', () => {
    fail('/api/x', new HttpContext().set(SKIP_ERROR_DIALOG, true));
    ctrl.expectOne('/api/x').error(new ProgressEvent('error'), { status: 0 });
    expect(state.current()).toBeNull();
  });
});
