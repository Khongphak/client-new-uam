import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { fixtures } from '../fixtures';
import { expectContractRequest, flushFixture } from './http-contract';

/** Tests the helper itself with a throw-away HttpClient call (no real API service exists yet). */
describe('http-contract helper', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
  });
  afterEach(() => ctrl.verify());

  const body = () => structuredClone(fixtures['add-system.request']) as Record<string, unknown>;

  it('accepts a request that matches method, url and body exactly', () => {
    http.post('v1/Systems/add-system', body()).subscribe();
    const req = expectContractRequest(ctrl, {
      method: 'POST',
      url: 'v1/Systems/add-system',
      fixture: 'add-system.request',
    });
    expect(req.request.body).toEqual(fixtures['add-system.request']);
  });

  it('feeds a response fixture to the client and the client parses it', () => {
    let result: (typeof fixtures)['envelope-success'] | undefined;
    http
      .post<(typeof fixtures)['envelope-success']>('v1/Systems/add-system', body())
      .subscribe((r) => (result = r));
    const req = expectContractRequest(ctrl, {
      method: 'POST',
      url: 'v1/Systems/add-system',
      fixture: 'add-system.request',
    });
    flushFixture(req, 'envelope-success');
    expect(result).toEqual({
      status: 'IP-S-0001',
      statusCode: '20000',
      message: 'Success',
      data: true,
    });
    expect(typeof result?.statusCode).toBe('string');
  });

  it('flushes a fixture copy, so a client cannot mutate the golden object', () => {
    let result: { data: unknown[] } | undefined;
    http.get<{ data: unknown[] }>('v1/Systems/get-all-systems').subscribe((r) => (result = r));
    const req = expectContractRequest(ctrl, { method: 'GET', url: 'v1/Systems/get-all-systems' });
    flushFixture(req, 'get-all-systems.response');
    result?.data.push('mutated');
    expect(fixtures['get-all-systems.response'].data).toHaveLength(1);
  });

  it('supports baseUrl and query strings in the url', () => {
    http.get('https://api.example.test/v1/Roles/get-roleMenu-byRoleId?roleId=108').subscribe();
    expectContractRequest(ctrl, {
      method: 'GET',
      baseUrl: 'https://api.example.test/',
      url: 'v1/Roles/get-roleMenu-byRoleId?roleId=108',
    });
  });

  it('FAILS when the HTTP method differs', () => {
    http.put('v1/Systems/add-system', body()).subscribe();
    expect(() =>
      expectContractRequest(ctrl, {
        method: 'POST',
        url: 'v1/Systems/add-system',
        fixture: 'add-system.request',
      }),
    ).toThrow(/POST v1\/Systems\/add-system/);
    ctrl.expectOne('v1/Systems/add-system').flush(null); // clear for verify()
  });

  it('FAILS when the URL path differs', () => {
    http.post('v1/Systems/addSystem', body()).subscribe();
    expect(() =>
      expectContractRequest(ctrl, {
        method: 'POST',
        url: 'v1/Systems/add-system',
        fixture: 'add-system.request',
      }),
    ).toThrow(/No request matched/);
    ctrl.expectOne('v1/Systems/addSystem').flush(null);
  });

  const mutate = (change: (b: Record<string, unknown>) => void) => {
    const b = body();
    change(b);
    http.post('v1/Systems/add-system', b).subscribe();
    return () =>
      expectContractRequest(ctrl, {
        method: 'POST',
        url: 'v1/Systems/add-system',
        fixture: 'add-system.request',
      });
  };

  it('FAILS on a renamed body key', () => {
    const run = mutate((b) => {
      b['systemname'] = b['systemName'];
      delete b['systemName'];
    });
    expect(run).toThrow(/\$\.systemName: missing key[\s\S]*\$\.systemname: unexpected key/);
  });

  it('FAILS on a number sent as a string', () => {
    const run = mutate((b) => (b['accessTokenTime'] = '30'));
    expect(run).toThrow(/\$\.accessTokenTime: type number expected, got string/);
  });

  it('FAILS on an extra body key', () => {
    const run = mutate((b) => (b['authenrizationType'] = 'JWT'));
    expect(run).toThrow(/\$\.authenrizationType: unexpected key/);
  });

  it('FAILS on a missing body key', () => {
    const run = mutate((b) => delete b['refreshTokenTime']);
    expect(run).toThrow(/\$\.refreshTokenTime: missing key/);
  });

  it('FAILS when a pre-serialised JSON string is sent instead of an object', () => {
    http.post('v1/Systems/add-system', JSON.stringify(body())).subscribe();
    expect(() =>
      expectContractRequest(ctrl, {
        method: 'POST',
        url: 'v1/Systems/add-system',
        fixture: 'add-system.request',
      }),
    ).toThrow(/\$: type object expected, got string/);
  });

  it('FAILS when a GET without a fixture carries a body', () => {
    http.request('GET', 'v1/Systems/get-all-systems', { body: { a: 1 } }).subscribe();
    expect(() =>
      expectContractRequest(ctrl, { method: 'GET', url: 'v1/Systems/get-all-systems' }),
    ).toThrow(/no body expected/);
  });
});
