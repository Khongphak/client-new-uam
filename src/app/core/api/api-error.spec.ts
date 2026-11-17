import { HttpErrorResponse } from '@angular/common/http';

import { errorFromHttp, errorFromResultCode, isSuccessCode } from './api-error';

const http = (status: number, error: unknown) => new HttpErrorResponse({ status, error });

describe('api error model', () => {
  it('treats only 20000 and 20100 as success', () => {
    expect(['20000', '20100'].every(isSuccessCode)).toBe(true);
    expect(['40301', '50001', '', '200'].some(isSuccessCode)).toBe(false);
  });

  it.each([
    ['40102', 'session-expired'],
    ['40101', 'access-denied'],
    ['40301', 'already-existed'],
    ['40300', 'invalid-parameter'],
    ['40401', 'not-found'],
    ['40400', 'not-found'],
    ['50000', 'server'],
    ['50001', 'server'],
    ['50002', 'server'],
    ['99999', 'unknown'],
  ])('maps result code %s to %s', (code, kind) => {
    expect(errorFromResultCode(code, 'm').kind).toBe(kind);
  });

  it('maps HTTP status 0 to network', () => {
    expect(errorFromHttp(http(0, null))).toEqual({ kind: 'network' });
  });

  it('asks for a refresh on TOKEN_EXPIRED / SSO_TOKEN_EXPIRED but a new login for the other auth codes', () => {
    expect(errorFromHttp(http(401, { errorCode: 'TOKEN_EXPIRED' })).kind).toBe('token-expired');
    expect(errorFromHttp(http(401, { errorCode: 'SSO_TOKEN_EXPIRED' })).kind).toBe('token-expired');
    for (const code of [
      'INTERNAL_ERROR',
      'TOKEN_INVALID',
      'AUDIENCE_MISSING',
      'SSO_SESSION_INVALID',
      'SSO_SESSION_EXPIRED',
      'REFRESH_TOKEN_INVALID',
      'REFRESH_TOKEN_EXPIRED',
    ]) {
      expect(errorFromHttp(http(401, { errorCode: code })).kind).toBe('session-expired');
    }
  });

  it('reads the message from message, Message, then error_description', () => {
    expect(errorFromHttp(http(400, { message: 'a', Message: 'b' }))).toMatchObject({
      message: 'a',
    });
    expect(errorFromHttp(http(400, { Message: 'b', error_description: 'c' }))).toMatchObject({
      message: 'b',
    });
    expect(errorFromHttp(http(400, { error_description: 'c' }))).toMatchObject({ message: 'c' });
  });

  it('maps 422 ModelState to field errors', () => {
    expect(errorFromHttp(http(422, { ModelState: { roleName: 'required' } }))).toEqual({
      kind: 'validation',
      fields: { roleName: 'required' },
    });
  });

  it('maps 5xx to server and tolerates a non-object body', () => {
    expect(errorFromHttp(http(500, 'Internal Server Error')).kind).toBe('server');
  });
});
