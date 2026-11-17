import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { expectContractRequest, flushFixture } from '../../../testing/contract/http-contract';
import { fixtures } from '../../../testing/fixtures';
import { padded } from '../../../testing/fixtures/deviations';
import { setupApiTest } from '../../core/api/api-test-setup';
import { RoleRecord } from '../../shared/interfaces';
import { MenuTreeNode } from './role-menu-tree';
import { toAddRoleRequest, toUpdateRoleRequest } from './role-mapper';
import { RoleApi } from './role-api';
import {
  resolveSystemRoles,
  toAddUserRequest,
  toUpdateUserRequest,
  UserFormValue,
} from './user-mapper';
import { UserApi } from './user-api';

const SYS = '00000000-0000-4000-8000-000000000001';
const roles = fixtures['get-all-roles.response'].data as unknown as RoleRecord[];

const addTree: MenuTreeNode[] = [
  {
    kind: 'menu',
    menuId: 122,
    screenName: 'A',
    imageGroupId: 161,
    permission: ['view'],
    functional: ['view'],
  },
  {
    kind: 'group',
    groupName: 'Group A',
    imageGroupId: 69,
    children: [
      {
        kind: 'menu',
        menuId: 1,
        screenName: 'B',
        imageGroupId: 2,
        permission: ['add', 'view'],
        functional: ['add', 'view'],
      },
    ],
  },
];

describe('identity & roles API contract', () => {
  let ctrl: HttpTestingController;
  beforeEach(() => (ctrl = setupApiTest()));
  afterEach(() => ctrl.verify());

  it('add-role: trimmed name + nested menus with one running sortOrder', async () => {
    const body = toAddRoleRequest({
      systemId: SYS,
      roleName: padded('Example Role'),
      description: 'Example',
      menus: addTree,
    });
    const done = firstValueFrom(TestBed.inject(RoleApi).add(body));
    flushFixture(
      expectContractRequest(ctrl, {
        method: 'POST',
        url: 'v1/Roles/add-role',
        fixture: 'add-role.request',
      }),
      'envelope-success',
    );
    await done;
  });

  it('update-role echoes ids of loaded nodes and sends status from the switch', async () => {
    const menus: MenuTreeNode[] = [
      {
        kind: 'menu',
        menuId: 122,
        screenName: 'A',
        imageGroupId: 161,
        permission: ['view'],
        functional: ['view'],
        roleId: 108,
        roleMenuId: 1,
        parentId: 0,
      },
    ];
    const body = toUpdateRoleRequest(
      108,
      { systemId: SYS, roleName: 'Example Role', description: 'Example', menus },
      false,
    );
    const done = firstValueFrom(TestBed.inject(RoleApi).update(body));
    flushFixture(
      expectContractRequest(ctrl, {
        method: 'PUT',
        url: 'v1/Roles/update-role',
        fixture: 'update-role.request',
      }),
      'envelope-success',
    );
    await done;
  });

  it('reads roles, one role by roleId and the role menu tree (null → empty)', async () => {
    const api = TestBed.inject(RoleApi);
    const all = firstValueFrom(api.getAll());
    flushFixture(
      expectContractRequest(ctrl, { method: 'GET', url: 'v1/Roles/get-all-roles' }),
      'get-all-roles.response',
    );
    expect((await all)[0].id).toBe(108);

    api.getById(108).subscribe();
    ctrl.expectOne('v1/Roles/get-role?roleId=108').flush(fixtures['get-all-roles.response']);

    const tree = firstValueFrom(api.getRoleMenus(108));
    flushFixture(
      expectContractRequest(ctrl, {
        method: 'GET',
        url: 'v1/Roles/get-roleMenu-byRoleId?roleId=108',
      }),
      'get-role-menu-by-role-id.response',
    );
    expect((await tree)[0].groupMenus).toHaveLength(1);

    const empty = firstValueFrom(api.getRoleMenus(1));
    ctrl
      .expectOne('v1/Roles/get-roleMenu-byRoleId?roleId=1')
      .flush({ status: 's', statusCode: '20000', message: null, data: null });
    await expect(empty).resolves.toEqual([]);
  });

  const userForm = (over: Partial<UserFormValue> = {}): UserFormValue => ({
    username: 'Testuser',
    firstname: 'Test',
    lastname: 'User',
    fullName: 'Test User',
    email: 'test.user@example.test',
    department: 'Example Dept',
    position: 'Tester',
    phoneNo: '5743',
    uamRoleId: 1,
    isSuperAdmin: false,
    managers: ['Manager One', 'Manager Two'],
    systemRoles: [
      {
        userSystemId: null,
        systemId: SYS,
        systemName: 'Example System A',
        roleId: 108,
        roleName: 'Example Role',
      },
    ],
    ...over,
  });

  it('add-user: fullName/firstname casing, manager list string, systemRoles with all five keys', async () => {
    const done = firstValueFrom(TestBed.inject(UserApi).add(toAddUserRequest(userForm())));
    flushFixture(
      expectContractRequest(ctrl, {
        method: 'POST',
        url: 'v1/Users/add-user',
        fixture: 'add-user.request',
      }),
      'envelope-success',
    );
    await done;
  });

  it('update-user/{id}: same body with status from the switch; empty managers → []', async () => {
    const form = userForm({
      managers: ['', '  '],
      systemRoles: [
        {
          userSystemId: 12,
          systemId: SYS,
          systemName: 'Example System A',
          roleId: 108,
          roleName: 'Example Role',
        },
      ],
    });
    const done = firstValueFrom(
      TestBed.inject(UserApi).update(1, toUpdateUserRequest(form, false)),
    );
    flushFixture(
      expectContractRequest(ctrl, {
        method: 'PUT',
        url: 'v1/Users/update-user/1',
        fixture: 'update-user.request',
      }),
      'envelope-success',
    );
    await done;
  });

  it('AD search sends the four keys and returns the hits (managers[].name)', async () => {
    const done = firstValueFrom(TestBed.inject(UserApi).searchActiveDirectory('testuser'));
    flushFixture(
      expectContractRequest(ctrl, {
        method: 'POST',
        url: 'v1/Users/search-users-activeDirectory',
        fixture: 'ad-search.request',
      }),
      'ad-search.response',
    );
    const hits = await done;
    expect(hits[0].managers?.map((m) => m.name)).toEqual(['Manager One', 'Manager Two']);
  });

  it('reads users, one user (single object) and the role detail', async () => {
    const api = TestBed.inject(UserApi);
    const list = firstValueFrom(api.getAll());
    flushFixture(
      expectContractRequest(ctrl, { method: 'GET', url: 'v1/Users/get-all-users' }),
      'get-all-users.response',
    );
    expect((await list)[0].fullname).toBe('Test User');

    const one = firstValueFrom(api.getById(1));
    flushFixture(
      expectContractRequest(ctrl, { method: 'GET', url: 'v1/Users/get-user-byId?userId=1' }),
      'get-user-by-id.response',
    );
    const user = await one;
    expect(user.systemRoles[0].userSystemId).toBe(12);
    expect(user.manager).toBe('[Manager One,Manager Two]');

    api.getRoleDetail(1).subscribe();
    ctrl.expectOne('v1/Users/get-userRole-byId?userId=1').flush(fixtures['envelope-success']);
    api.getUamRoles().subscribe();
    ctrl.expectOne('v1/UAM/get-all-uam-roles').flush(fixtures['envelope-success']);
  });
});

describe('resolveSystemRoles', () => {
  it('matches by role id + system, taking names from get-all-roles', () => {
    const { resolved, unresolved } = resolveSystemRoles(
      [{ systemId: SYS, roleId: 108, userSystemId: 12 }],
      roles,
    );
    expect(resolved).toEqual([
      {
        userSystemId: 12,
        systemId: SYS,
        systemName: 'Example System A',
        roleId: 108,
        roleName: 'Example Role',
      },
    ]);
    expect(unresolved).toEqual([]);
  });

  it('drops incomplete rows but reports rows whose role is unknown (no silent loss)', () => {
    const { resolved, unresolved } = resolveSystemRoles(
      [
        { systemId: null, roleId: null, userSystemId: null },
        { systemId: SYS, roleId: null, userSystemId: null },
        { systemId: SYS, roleId: 999, userSystemId: 5 },
      ],
      roles,
    );
    expect(resolved).toEqual([]);
    expect(unresolved).toEqual([{ systemId: SYS, roleId: 999, userSystemId: 5 }]);
  });
});
