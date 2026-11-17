import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { expectContractRequest, flushFixture } from '../../../testing/contract/http-contract';
import { fixtures } from '../../../testing/fixtures';
import { ApiException } from '../../core/api/api-error';
import { setupApiTest } from '../../core/api/api-test-setup';
import { AuthApi } from './auth-api';
import { ConsentApi } from './consent-api';
import { HomeApi } from './home-api';

describe('access API contract', () => {
  let ctrl: HttpTestingController;
  beforeEach(() => (ctrl = setupApiTest()));
  afterEach(() => ctrl.verify());

  it('login sends capitalised keys and returns data.result', async () => {
    const done = firstValueFrom(TestBed.inject(AuthApi).login(fixtures['login.request']));
    flushFixture(
      expectContractRequest(ctrl, {
        method: 'POST',
        url: 'v1/auth/login',
        fixture: 'login.request',
      }),
      'login.response',
    );
    const data = await done;
    expect(data.result.isConsent).toBe(true);
    expect(data.result.userProfile.uamRole).toBe('ADMIN');
  });

  it('a non-success statusCode on login becomes an ApiException', async () => {
    const done = firstValueFrom(TestBed.inject(AuthApi).login(fixtures['login.request']));
    expectContractRequest(ctrl, {
      method: 'POST',
      url: 'v1/auth/login',
      fixture: 'login.request',
    }).flush({
      status: 'IP-E-0001',
      statusCode: '40101',
      message: 'denied',
      data: null,
    });
    await expect(done).rejects.toMatchObject({ error: { kind: 'access-denied' } });
    await expect(done).rejects.toBeInstanceOf(ApiException);
  });

  it('reads the latest consent and posts the acceptance', async () => {
    const consent = firstValueFrom(TestBed.inject(ConsentApi).getLatestVersion());
    flushFixture(
      expectContractRequest(ctrl, { method: 'GET', url: 'v1/Consent/get-consent-last-version' }),
      'consent-last-version.response',
    );
    expect((await consent).id).toBe(1);

    const accepted = firstValueFrom(
      TestBed.inject(ConsentApi).accept({
        ...fixtures['add-consent-accept.request'],
        acceptedFlag: 'Y',
      }),
    );
    flushFixture(
      expectContractRequest(ctrl, {
        method: 'POST',
        url: 'v1/Consent/add-user-consent-accept',
        fixture: 'add-consent-accept.request',
      }),
      'envelope-success',
    );
    await expect(accepted).resolves.toBeUndefined();
  });

  it('logout and refresh-token only need success', async () => {
    const api = TestBed.inject(AuthApi);
    const out = firstValueFrom(api.logout({ Username: 'Testuser', ClientId: 'client' }));
    flushFixture(ctrl.expectOne('v1/auth/logout'), 'envelope-success');
    await expect(out).resolves.toBeUndefined();
    const refreshed = firstValueFrom(api.refreshToken({ SystemId: 'client' }));
    flushFixture(ctrl.expectOne('v1/auth/refresh-token'), 'envelope-success');
    await expect(refreshed).resolves.toBeUndefined();
  });

  it('home systems pass userName as a query parameter', async () => {
    const done = firstValueFrom(TestBed.inject(HomeApi).getUserSystems('Testuser'));
    ctrl
      .expectOne('v1/Home/get-userSystems?userName=Testuser')
      .flush({ status: 's', statusCode: '20000', message: null, data: [] });
    await expect(done).resolves.toEqual([]);
  });
});
