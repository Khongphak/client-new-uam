import { createDemoApi, DemoApi } from './demo-api';

const ok = { statusCode: '20000', status: 'IP-S-0001', message: 'Success' };

const call = (api: DemoApi, method: string, url: string, body?: unknown) =>
  api.handle(method, url, body)!;

describe('demo API', () => {
  let api: DemoApi;
  beforeEach(() => (api = createDemoApi()));

  it('wraps responses in the contract envelope with a string statusCode', () => {
    const res = call(api, 'GET', 'v1/Systems/get-all-systems');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(ok);
    expect(Array.isArray((res.body as { data: unknown }).data)).toBe(true);
  });

  it('matches method + path regardless of origin and returns null for unknown endpoints', () => {
    expect(api.handle('GET', 'https://any.example.test/api/v1/Roles/get-all-roles')).not.toBeNull();
    expect(api.handle('GET', 'v1/Nope/nothing')).toBeNull();
    expect(api.handle('DELETE', 'v1/Systems/get-all-systems')).toBeNull();
  });

  it('logs in a known demo user (case-insensitive) with role-specific profile and consent', () => {
    const res = call(api, 'POST', 'v1/auth/login', {
      Username: 'DEV.user',
      Password: 'x',
      SystemId: 'x',
    });
    const data = (
      res.body as { data: { result: { isConsent: boolean; userProfile: { uamRole: string } } } }
    ).data.result;
    expect(data.userProfile.uamRole).toBe('DEVELOPER');
    expect(data.isConsent).toBe(true);
  });

  it('rejects an unknown username with ACCESS_DENIED (40101)', () => {
    const res = call(api, 'POST', 'v1/auth/login', {
      Username: 'nobody',
      Password: 'x',
      SystemId: 'x',
    });
    expect(res.body).toMatchObject({ statusCode: '40101' });
  });

  it('add-system changes the list; update-system changes the row; status Inactive is kept', () => {
    const before = list(api, 'v1/Systems/get-all-systems').length;
    const add = call(api, 'POST', 'v1/Systems/add-system', {
      type: 'Web Application',
      systemName: 'New Demo System',
      description: 'd',
      url: 'https://n.example.test/',
      ownerName: 'o',
      imageId: 1,
      status: 'Active',
      accessTokenTime: 30,
      refreshTokenTime: 60,
    });
    expect(add.body).toMatchObject({ statusCode: '20100', data: true });
    const rows = list(api, 'v1/Systems/get-all-systems');
    expect(rows.length).toBe(before + 1);
    const added = rows.find((r) => r['systemName'] === 'New Demo System')!;
    call(api, 'PUT', 'v1/Systems/update-system', { ...added, status: 'Inactive' });
    expect(
      list(api, 'v1/Systems/get-all-systems').find((r) => r['id'] === added['id']),
    ).toMatchObject({ status: 'Inactive' });
  });

  it('rejects a duplicate system/role/user name with 40301', () => {
    const name = String(list(api, 'v1/Systems/get-all-systems')[0]['systemName']);
    const res = call(api, 'POST', 'v1/Systems/add-system', { systemName: name, status: 'Active' });
    expect(res.body).toMatchObject({ statusCode: '40301', data: null });
  });

  it('serves users, user-by-id, AD search and UAM roles', () => {
    const users = list(api, 'v1/Users/get-all-users');
    expect(users.length).toBeGreaterThan(3);
    const byId = call(api, 'GET', `v1/Users/get-user-byId?userId=${users[0]['id']}`).body as {
      data: { systemRoles: unknown[] };
    };
    expect(Array.isArray(byId.data.systemRoles)).toBe(true);
    expect(list(api, 'v1/UAM/get-all-uam-roles').map((r) => r['name'])).toEqual([
      'ADMIN',
      'DEVELOPER',
      'AUDIT',
      'USER',
    ]);
    const ad = call(api, 'POST', 'v1/Users/search-users-activeDirectory', { userName: 'test' })
      .body as { data: unknown[] };
    expect(ad.data.length).toBeGreaterThan(0);
  });

  it('add-user then update-user/{id} persists in memory', () => {
    call(api, 'POST', 'v1/Users/add-user', {
      username: 'new.user',
      firstname: 'New',
      lastname: 'User',
      fullName: 'New User',
      email: 'n@example.test',
      department: 'D',
      position: 'P',
      phoneNo: null,
      uamRoleId: 4,
      isSuperAdmin: false,
      status: 'Active',
      manager: '[M]',
      systemRoles: [],
    });
    const row = list(api, 'v1/Users/get-all-users').find((u) => u['username'] === 'new.user')!;
    call(api, 'PUT', `v1/Users/update-user/${row['id']}`, {
      ...row,
      status: 'Inactive',
      fullName: 'Renamed',
    });
    expect(
      list(api, 'v1/Users/get-all-users').find((u) => u['username'] === 'new.user'),
    ).toMatchObject({ status: 'Inactive' });
  });

  it('home systems, master data, icons and consent respond', () => {
    expect(list(api, 'v1/Home/get-userSystems?userName=dev.user').length).toBeGreaterThan(0);
    expect(list(api, 'v1/Master/get-generalData?type=Function').length).toBe(3);
    expect(list(api, 'v1/Master/get-icons').length).toBeGreaterThan(0);
    expect(call(api, 'GET', 'v1/Consent/get-consent-last-version').body).toMatchObject(ok);
    expect(call(api, 'POST', 'v1/Consent/add-user-consent-accept', {}).body).toMatchObject({
      statusCode: '20100',
    });
  });

  describe('failure simulation (?demo=)', () => {
    it('40301 turns saves into ALREADY_EXISTED but leaves reads alone', () => {
      api.setFlag('40301');
      expect(call(api, 'POST', 'v1/Roles/add-role', { roleName: 'X' }).body).toMatchObject({
        statusCode: '40301',
      });
      expect(call(api, 'GET', 'v1/Roles/get-all-roles').body).toMatchObject(ok);
    });
    it('50001 fails every call except login', () => {
      api.setFlag('50001');
      expect(call(api, 'GET', 'v1/Roles/get-all-roles').body).toMatchObject({
        statusCode: '50001',
      });
      expect(call(api, 'POST', 'v1/auth/login', { Username: 'dev.user' }).body).toMatchObject(ok);
    });
    it('session turns every call except login into SESSION_EXPIRED (40102)', () => {
      api.setFlag('session');
      expect(call(api, 'GET', 'v1/Users/get-all-users').body).toMatchObject({
        statusCode: '40102',
      });
    });
  });
});

function list(api: DemoApi, path: string): Record<string, unknown>[] {
  return (api.handle('GET', path)!.body as { data: Record<string, unknown>[] }).data;
}
