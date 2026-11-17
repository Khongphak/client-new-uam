import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { expectContractRequest, flushFixture } from '../../../testing/contract/http-contract';
import { fixtures } from '../../../testing/fixtures';
import { padded } from '../../../testing/fixtures/deviations';
import { setupApiTest } from '../../core/api/api-test-setup';
import { SystemRecord } from '../../shared/interfaces';
import { MasterDataApi } from './master-data-api';
import { MenuScreenApi } from './menu-screen-api';
import { toAddMenuScreenRequest, toUpdateMenuScreenRequest } from './menu-screen-mapper';
import { SystemApi } from './system-api';
import { toAddSystemRequest, toUpdateSystemRequest } from './system-mapper';

const form = {
  type: 'Web Application',
  systemName: 'Example System A',
  description: 'Example',
  url: 'https://system-a.example.test/',
  ownerName: 'Test Owner',
  imageId: 1,
  accessTokenTime: 30,
  refreshTokenTime: 60,
};

describe('system catalog API contract', () => {
  let ctrl: HttpTestingController;
  beforeEach(() => (ctrl = setupApiTest()));
  afterEach(() => ctrl.verify());

  it('add-system trims the name (DEV-2) and sends the token times (DEV-1)', async () => {
    const body = toAddSystemRequest({ ...form, systemName: padded('Example System A') });
    const done = firstValueFrom(TestBed.inject(SystemApi).add(body));
    flushFixture(
      expectContractRequest(ctrl, {
        method: 'POST',
        url: 'v1/Systems/add-system',
        fixture: 'add-system.request',
      }),
      'envelope-success',
    );
    await expect(done).resolves.toBeUndefined();
  });

  it('update-system echoes id, systemId and audit fields from the loaded record', async () => {
    const loaded = fixtures['get-all-systems.response'].data[0] as unknown as SystemRecord;
    const body = toUpdateSystemRequest(loaded, form, false);
    const done = firstValueFrom(TestBed.inject(SystemApi).update(body));
    flushFixture(
      expectContractRequest(ctrl, {
        method: 'PUT',
        url: 'v1/Systems/update-system',
        fixture: 'update-system.request',
      }),
      'envelope-success',
    );
    await done;
  });

  it('a 40301 answer to add-system becomes already-existed', async () => {
    const done = firstValueFrom(TestBed.inject(SystemApi).add(toAddSystemRequest(form)));
    flushFixture(
      expectContractRequest(ctrl, {
        method: 'POST',
        url: 'v1/Systems/add-system',
        fixture: 'add-system.request',
      }),
      'envelope-already-existed',
    );
    await expect(done).rejects.toMatchObject({ error: { kind: 'already-existed' } });
  });

  it('lists systems and loads one by systemId (query parameter)', async () => {
    const api = TestBed.inject(SystemApi);
    const all = firstValueFrom(api.getAll());
    flushFixture(
      expectContractRequest(ctrl, { method: 'GET', url: 'v1/Systems/get-all-systems' }),
      'get-all-systems.response',
    );
    expect((await all)[0].systemName).toBe('Example System A');
    const one = firstValueFrom(api.getById('00000000-0000-4000-8000-000000000001'));
    ctrl
      .expectOne('v1/Systems/get-systems?systemId=00000000-0000-4000-8000-000000000001')
      .flush(fixtures['get-all-systems.response']);
    expect(await one).toHaveLength(1);
  });

  it('system-to-system add/update use the fixtures', async () => {
    const api = TestBed.inject(SystemApi);
    const add = firstValueFrom(
      api.addSystemToSystem(fixtures['add-system-to-system.request'] as never),
    );
    flushFixture(
      expectContractRequest(ctrl, {
        method: 'POST',
        url: 'v1/SystemToSystem/add-system-to-system',
        fixture: 'add-system-to-system.request',
      }),
      'envelope-success',
    );
    await add;
    const upd = firstValueFrom(
      api.updateSystemToSystem(fixtures['update-system-to-system.request'] as never),
    );
    flushFixture(
      expectContractRequest(ctrl, {
        method: 'PUT',
        url: 'v1/SystemToSystem/update-system-to-system',
        fixture: 'update-system-to-system.request',
      }),
      'envelope-success',
    );
    await upd;
    firstValueFrom(api.getSystemToSystemById(5)).catch(() => undefined);
    ctrl
      .expectOne('v1/SystemToSystem/get-system-to-system-by-id?id=5')
      .flush({ status: 's', statusCode: '20000', message: null, data: {} });
  });

  it('menu screens: trimmed name + list-string functional, update adds id/status', async () => {
    const menuForm = {
      systemId: '00000000-0000-4000-8000-000000000001',
      functional: ['add', 'view', 'edit'],
      screenName: padded('Example Screen'),
      description: 'Example',
      url: '/screen-1',
      imageId: 2,
    };
    const api = TestBed.inject(MenuScreenApi);
    const add = firstValueFrom(api.add(toAddMenuScreenRequest(menuForm)));
    flushFixture(
      expectContractRequest(ctrl, {
        method: 'POST',
        url: 'v1/Menus/add-menuScreen',
        fixture: 'add-menu-screen.request',
      }),
      'envelope-success',
    );
    await add;
    const upd = firstValueFrom(
      api.update(toUpdateMenuScreenRequest(1, { ...menuForm, functional: ['add', 'view'] }, false)),
    );
    flushFixture(
      expectContractRequest(ctrl, {
        method: 'PUT',
        url: 'v1/Menus/update-menuScreen',
        fixture: 'update-menu-screen.request',
      }),
      'envelope-success',
    );
    await upd;
  });

  it('menu endpoints use the query names the backend expects', () => {
    const api = TestBed.inject(MenuScreenApi);
    const sys = '00000000-0000-4000-8000-000000000001';
    api.getById(7).subscribe({ error: () => undefined });
    ctrl
      .expectOne('v1/Menus/get-menuScreen-byId?screenId=7')
      .flush(null, { status: 500, statusText: 'x' });
    api.getBySystemId(sys).subscribe();
    ctrl
      .expectOne(`v2/Menus/get-menuScreens-bySystemId?systemId=${sys}`)
      .flush(fixtures['menu-screens-by-system-id.response']);
    api.getBySystemId(sys, 108).subscribe();
    ctrl
      .expectOne(`v2/Menus/get-menuScreens-bySystemId?systemId=${sys}&roleId=108`)
      .flush(fixtures['menu-screens-by-system-id.response']);
    api.getRoleScreensBySystemId(sys, 108).subscribe();
    ctrl
      .expectOne(`v1/Menus/get-menuRoleScreens-bySystemId?systemId=${sys}&roleId=108`)
      .flush(fixtures['envelope-success']);
  });

  it('master data: general data by type (lower-case function) and icons', async () => {
    const api = TestBed.inject(MasterDataApi);
    const fn = firstValueFrom(api.getGeneralData('function'));
    flushFixture(
      expectContractRequest(ctrl, {
        method: 'GET',
        url: 'v1/Master/get-generalData?type=function',
      }),
      'general-data-function.response',
    );
    expect((await fn).map((g) => g.value)).toEqual(['add', 'view', 'edit']);
    api.getIcons().subscribe();
    ctrl.expectOne('v1/Master/get-icons').flush(fixtures['envelope-success']);
  });
});
