import { createDemoApi, DemoApi } from './demo-api';

const call = (api: DemoApi, method: string, url: string, body?: unknown) =>
  api.handle(method, url, body)!;
const data = <T = Record<string, unknown>[]>(api: DemoApi, url: string) =>
  (call(api, 'GET', url).body as { data: T }).data;
const code = (res: { body: unknown }) => (res.body as { statusCode: string }).statusCode;
const SYS = '00000000-0000-4000-8000-000000000001';
const SYS_B = '00000000-0000-4000-8000-000000000002';

describe('demo API — menus', () => {
  let api: DemoApi;
  beforeEach(() => (api = createDemoApi()));

  it('lists menu screens and loads one by screenId as a single object', () => {
    const all = data(api, 'v1/Menus/get-all-menuScreens');
    expect(all.length).toBeGreaterThan(3);
    const one = data<Record<string, unknown>>(
      api,
      `v1/Menus/get-menuScreen-byId?screenId=${all[0]['id']}`,
    );
    expect(one['screenName']).toBe(all[0]['screenName']);
    expect(typeof one['functional']).toBe('string');
    expect(code(call(api, 'GET', 'v1/Menus/get-menuScreen-byId?screenId=99999'))).toBe('40401');
  });

  it('add-menuScreen appears in the list with the system name; duplicate name in the same system is 40301, another system is fine', () => {
    const body = {
      systemId: SYS,
      functional: '[add,view]',
      screenName: 'Brand New Screen',
      description: 'd',
      url: '/x',
      imageId: 2,
      status: 'Active',
    };
    expect(code(call(api, 'POST', 'v1/Menus/add-menuScreen', body))).toBe('20100');
    const row = data(api, 'v1/Menus/get-all-menuScreens').find(
      (m) => m['screenName'] === 'Brand New Screen',
    )!;
    expect(row['systemName']).toBe('Example System A');
    expect(code(call(api, 'POST', 'v1/Menus/add-menuScreen', body))).toBe('40301');
    expect(code(call(api, 'POST', 'v1/Menus/add-menuScreen', { ...body, systemId: SYS_B }))).toBe(
      '20100',
    );
  });

  it('update-menuScreen changes the row', () => {
    const row = data(api, 'v1/Menus/get-all-menuScreens')[0];
    call(api, 'PUT', 'v1/Menus/update-menuScreen', { ...row, status: 'Inactive' });
    expect(
      data(api, 'v1/Menus/get-all-menuScreens').find((m) => m['id'] === row['id']),
    ).toMatchObject({ status: 'Inactive' });
  });

  it('menus of a system are filtered by systemId', () => {
    const rows = data(api, `v2/Menus/get-menuScreens-bySystemId?systemId=${SYS}`);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r['systemId'] === SYS)).toBe(true);
  });
});

describe('demo API — system to system', () => {
  it('lists, loads by id, adds, rejects a duplicate pair (40301) and updates', () => {
    const api = createDemoApi();
    const list = data(api, 'v1/SystemToSystem/get-all-system-to-system');
    expect(list.length).toBeGreaterThan(0);
    expect(
      data<Record<string, unknown>>(
        api,
        `v1/SystemToSystem/get-system-to-system-by-id?id=${list[0]['id']}`,
      ),
    ).toMatchObject({
      sourceSystemUUId: expect.any(String),
      accessTokenTime: expect.anything(),
    });
    const body = {
      sourceSystemUUId: SYS_B,
      targetSystemUUId: SYS,
      accessTokenTime: 15,
      status: 'Active',
    };
    expect(code(call(api, 'POST', 'v1/SystemToSystem/add-system-to-system', body))).toBe('20100');
    expect(code(call(api, 'POST', 'v1/SystemToSystem/add-system-to-system', body))).toBe('40301');
    const added = data(api, 'v1/SystemToSystem/get-all-system-to-system').find(
      (s) =>
        s['sourceSystemName'] === 'Example System B' &&
        s['targetSystemName'] === 'Example System A',
    )!;
    call(api, 'PUT', 'v1/SystemToSystem/update-system-to-system', {
      ...body,
      id: added['id'],
      status: 'Inactive',
    });
    expect(
      data(api, 'v1/SystemToSystem/get-all-system-to-system').find((s) => s['id'] === added['id']),
    ).toMatchObject({ status: 'Inactive' });
  });
});

describe('demo API — role menus per role', () => {
  it('add-role stores its menus and get-roleMenu-byRoleId returns them as a tree for that role only', () => {
    const api = createDemoApi();
    const menus = [
      { sortOrder: 1, imageGroupId: 161, menuId: 1, permission: '[view]' },
      {
        sortOrder: 2,
        imageGroupId: 69,
        groupName: 'Group Z',
        groupMenus: [{ sortOrder: 3, imageGroupId: 2, menuId: 2, permission: '[add,view]' }],
      },
    ];
    expect(
      code(
        call(api, 'POST', 'v1/Roles/add-role', {
          systemId: SYS,
          roleName: 'Menu Role',
          description: '',
          status: 'Active',
          menus,
        }),
      ),
    ).toBe('20100');
    const role = data(api, 'v1/Roles/get-all-roles').find((r) => r['roleName'] === 'Menu Role')!;
    const tree = data<Record<string, unknown>[]>(
      api,
      `v1/Roles/get-roleMenu-byRoleId?roleId=${role['id']}`,
    );
    expect(tree).toHaveLength(2);
    expect(tree[0]).toMatchObject({
      roleId: role['id'],
      menuId: 1,
      permission: '[view]',
      parentId: 0,
    });
    const group = tree[1] as {
      menuId: number;
      groupName: string;
      roleMenuId: number;
      groupMenus: Record<string, unknown>[];
    };
    expect(group).toMatchObject({ menuId: 0, groupName: 'Group Z' });
    expect(group.groupMenus[0]).toMatchObject({
      menuId: 2,
      parentId: group.roleMenuId,
      permission: '[add,view]',
      roleId: role['id'],
    });
    expect(data(api, 'v1/Roles/get-roleMenu-byRoleId?roleId=108')).not.toEqual(tree);
  });

  it('update-role replaces the stored menus; a role with none yields an empty list', () => {
    const api = createDemoApi();
    call(api, 'PUT', 'v1/Roles/update-role', {
      id: 108,
      systemId: SYS,
      roleName: 'Example Role',
      description: '',
      status: 'Active',
      menus: [{ sortOrder: 1, imageGroupId: 1, menuId: 2, permission: '[]' }],
    });
    const tree = data<Record<string, unknown>[]>(api, 'v1/Roles/get-roleMenu-byRoleId?roleId=108');
    expect(tree).toHaveLength(1);
    expect(tree[0]).toMatchObject({ menuId: 2, permission: '[]' });
    expect(data(api, 'v1/Roles/get-roleMenu-byRoleId?roleId=110')).toEqual([]);
  });

  it('menuRoleScreens of a role in a system returns that role tree', () => {
    const api = createDemoApi();
    expect(
      data<unknown[]>(api, `v1/Menus/get-menuRoleScreens-bySystemId?systemId=${SYS}&roleId=108`)
        .length,
    ).toBeGreaterThan(0);
    expect(
      data<unknown[]>(api, `v1/Menus/get-menuRoleScreens-bySystemId?systemId=${SYS_B}&roleId=108`),
    ).toEqual([]);
  });
});

describe('demo API — user role detail, access history, reports', () => {
  it('get-userRole-byId lists the user systems with the role menu tree', () => {
    const api = createDemoApi();
    const users = data(api, 'v1/Users/get-all-users');
    const detail = data<{
      userSystems: { id: number; roleId: number; menuRoleScreens: unknown[] }[];
    }>(api, `v1/Users/get-userRole-byId?userId=${users[0]['id']}`);
    expect(detail.userSystems.length).toBeGreaterThan(0);
    expect(detail.userSystems[0].menuRoleScreens.length).toBeGreaterThan(0);
  });

  it('user list rows do not carry systemRoles/manager (only get-user-byId does); added user keeps its rows and gets userSystemIds', () => {
    const api = createDemoApi();
    expect(data(api, 'v1/Users/get-all-users')[0]).not.toHaveProperty('systemRoles');
    call(api, 'POST', 'v1/Users/add-user', {
      username: 'role.user',
      firstname: 'R',
      lastname: 'U',
      fullName: 'R U',
      email: 'r@example.test',
      department: 'D',
      position: 'P',
      phoneNo: null,
      uamRoleId: 4,
      isSuperAdmin: false,
      status: 'Active',
      manager: '[A,B]',
      systemRoles: [
        {
          userSystemId: null,
          systemId: SYS,
          systemName: 'Example System A',
          roleId: 108,
          roleName: 'Example Role',
        },
      ],
    });
    const id = data(api, 'v1/Users/get-all-users').find((u) => u['username'] === 'role.user')![
      'id'
    ];
    const one = data<{ systemRoles: { userSystemId: number | null }[]; manager: string }>(
      api,
      `v1/Users/get-user-byId?userId=${id}`,
    );
    expect(one.manager).toBe('[A,B]');
    expect(one.systemRoles[0].userSystemId).toEqual(expect.any(Number));
  });

  it('records access history', () => {
    const api = createDemoApi();
    expect(
      code(
        call(api, 'POST', 'v1/UserAccesses/add-useraccess-history', {
          id: 1,
          username: 'x',
          systemId: SYS,
          accessTime: 't',
          status: 'Success',
        }),
      ),
    ).toBe('20000');
  });

  it('departments come from the users; reports answer a clearly-demo file', () => {
    const api = createDemoApi();
    const deps = (
      call(api, 'POST', 'v1/Reports/get-departments', { systemId: SYS, dateFrom: 'a', dateTo: 'b' })
        .body as { data: { department: string }[] }
    ).data;
    expect(deps.length).toBeGreaterThan(1);
    const res = call(api, 'POST', 'v1/Reports/generate-audit-trails-report', {
      systemId: SYS,
      department: null,
      dateFrom: 'a',
      dateTo: 'b',
    });
    expect(res.file?.text).toContain('DEMO');
    expect(res.file?.type).toBeTruthy();
    const m = call(api, 'POST', 'v1/Reports/generate-authorization-matrix-report', {
      systemId: SYS,
      department: '',
      dateFrom: null,
      dateTo: null,
    });
    expect(m.file?.text).toContain('DEMO');
  });

  it('50001 also fails report downloads', () => {
    const api = createDemoApi();
    api.setFlag('50001');
    expect(call(api, 'POST', 'v1/Reports/generate-audit-trails-report', {}).file).toBeUndefined();
    expect(code(call(api, 'POST', 'v1/Reports/generate-audit-trails-report', {}))).toBe('50001');
  });
});
