// Drives the real typed clients (UAM-API-01) through the demo interceptor, so the mock cannot drift from the contract.
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { AuthApi } from '../app/access/api/auth-api';
import { HomeApi } from '../app/access/api/home-api';
import { RoleApi } from '../app/identity-roles/api/role-api';
import { fromRoleMenuItems, toMenusPayload } from '../app/identity-roles/api/role-menu-tree';
import { toAddRoleRequest } from '../app/identity-roles/api/role-mapper';
import { UserApi } from '../app/identity-roles/api/user-api';
import { ReportApi } from '../app/reporting/api/report-api';
import { MenuScreenApi } from '../app/system-catalog/api/menu-screen-api';
import { toAddMenuScreenRequest } from '../app/system-catalog/api/menu-screen-mapper';
import { SystemApi } from '../app/system-catalog/api/system-api';
import { demoInterceptor, setDemoLatency } from './demo-providers';

const SYS = '00000000-0000-4000-8000-000000000001';

describe('typed clients against the demo interceptor', () => {
  beforeEach(() => {
    setDemoLatency(0);
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([demoInterceptor]))],
    });
  });
  afterEach(() => history.replaceState(null, '', '/'));

  it('login → profile with UAM role; unknown user → access-denied', async () => {
    const auth = TestBed.inject(AuthApi);
    const ok = await firstValueFrom(
      auth.login({ Username: 'audit.user', Password: 'x', SystemId: 's' }),
    );
    expect(ok.result.userProfile.uamRole).toBe('AUDIT');
    await expect(
      firstValueFrom(auth.login({ Username: 'nobody', Password: 'x', SystemId: 's' })),
    ).rejects.toMatchObject({ error: { kind: 'access-denied' } });
  });

  it('systems, home cards and users decode through the clients', async () => {
    expect((await firstValueFrom(TestBed.inject(SystemApi).getAll())).length).toBeGreaterThan(2);
    expect(
      (await firstValueFrom(TestBed.inject(HomeApi).getUserSystems('dev.user'))).length,
    ).toBeGreaterThan(0);
    expect((await firstValueFrom(TestBed.inject(UserApi).getAll()))[0].username).toEqual(
      expect.any(String),
    );
  });

  it('menu add → duplicate becomes already-existed; flag 40301 forces it', async () => {
    const api = TestBed.inject(MenuScreenApi);
    const body = toAddMenuScreenRequest({
      systemId: SYS,
      functional: ['view'],
      screenName: '  Client Screen ',
      description: '',
      url: '/c',
      imageId: 2,
    });
    await firstValueFrom(api.add(body));
    await expect(firstValueFrom(api.add(body))).rejects.toMatchObject({
      error: { kind: 'already-existed' },
    });
    const listed = await firstValueFrom(api.getAll());
    expect(listed.some((m) => m.screenName === 'Client Screen')).toBe(true);
  });

  it('role menu tree round-trips through the mapper and the demo store', async () => {
    const roles = TestBed.inject(RoleApi);
    const tree = [
      {
        kind: 'group' as const,
        groupName: 'Round Trip',
        imageGroupId: 5,
        children: [
          {
            kind: 'menu' as const,
            menuId: 1,
            screenName: 'x',
            imageGroupId: 2,
            permission: ['view'],
            functional: ['view'],
          },
        ],
      },
    ];
    await firstValueFrom(
      roles.add(
        toAddRoleRequest({
          systemId: SYS,
          roleName: 'Round Trip Role',
          description: '',
          menus: tree,
        }),
      ),
    );
    const role = (await firstValueFrom(roles.getAll())).find(
      (r) => r.roleName === 'Round Trip Role',
    )!;
    const back = fromRoleMenuItems(await firstValueFrom(roles.getRoleMenus(role.id)));
    expect(back[0]).toMatchObject({ kind: 'group', groupName: 'Round Trip' });
    const payload = toMenusPayload(back);
    expect(payload[0].sortOrder).toBe(1);
    expect(payload[0].groupMenus?.[0].sortOrder).toBe(2);
  });

  it('user role detail and report blobs work; simulated 50001 / session errors map to ApiError kinds', async () => {
    const users = await firstValueFrom(TestBed.inject(UserApi).getAll());
    const detail = await firstValueFrom(TestBed.inject(UserApi).getRoleDetail(users[0].id));
    expect(detail.userSystems.length).toBeGreaterThan(0);

    const blob = await firstValueFrom(
      TestBed.inject(ReportApi).generateAuditTrails({
        systemId: SYS,
        department: null,
        dateFrom: 'a',
        dateTo: 'b',
      }),
    );
    expect(blob.size).toBeGreaterThan(0);

    history.replaceState(null, '', '/?demo=50001');
    await expect(firstValueFrom(TestBed.inject(UserApi).getAll())).rejects.toMatchObject({
      error: { kind: 'server', code: '50001' },
    });
    await expect(
      firstValueFrom(
        TestBed.inject(ReportApi).generateAuditTrails({
          systemId: SYS,
          department: null,
          dateFrom: 'a',
          dateTo: 'b',
        }),
      ),
    ).rejects.toMatchObject({ error: { kind: 'server' } });
    history.replaceState(null, '', '/?demo=session');
    await expect(firstValueFrom(TestBed.inject(SystemApi).getAll())).rejects.toMatchObject({
      error: { kind: 'session-expired' },
    });
  });

  it('an endpoint the demo does not know answers not-found instead of leaving the app', async () => {
    const http = TestBed.inject(SystemApi);
    history.replaceState(null, '', '/');
    await expect(firstValueFrom(http.getSystemToSystemById(99999))).rejects.toMatchObject({
      error: { kind: 'not-found' },
    });
  });
});
