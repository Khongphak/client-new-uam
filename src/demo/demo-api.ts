// DEMO MODE ONLY — compiled only by the `demo` build configuration (see tsconfig.demo.json).
// In-memory mock of the UAM API contract (docs/api-contract/uam-api-contract.md). All data is synthetic.
import { fixtures } from '../testing/fixtures';

/** Marker checked by `npm run check:no-demo` — must never appear in a production bundle. */
export const DEMO_MARKER = '__UAM_DEMO_MODE__';

export type DemoFlag = '' | '40301' | '50001' | 'session';
export interface DemoResponse {
  readonly status: number;
  readonly body: unknown;
}
type Row = Record<string, unknown> & { id: number };
type Body = Record<string, unknown>;
interface Ctx {
  readonly store: Store;
  readonly body: Body;
  readonly query: URLSearchParams;
  readonly match: RegExpMatchArray;
}
interface Route {
  readonly method: string;
  readonly pattern: RegExp;
  readonly save?: boolean;
  readonly open?: boolean; // reachable without a session (login)
  readonly run: (ctx: Ctx) => DemoResponse;
}
interface Store {
  systems: Row[];
  roles: Row[];
  users: Row[];
  roleMenus: Row[];
  seq: number;
}

const NOW = '2025-01-01T00:00:00';
const SYSTEM_A = '00000000-0000-4000-8000-000000000001';
const UAM_ROLES = ['ADMIN', 'DEVELOPER', 'AUDIT', 'USER'].map((name, i) => ({
  id: i + 1, name, status: 'Active', description: `${name} (demo)`,
  createdDate: NOW, createdBy: 'System', updatedDate: NOW, updatedBy: 'System',
}));
// Demo login accounts → UAM role id. Usernames are fictional.
const DEMO_ACCOUNTS: Record<string, number> = { 'admin.user': 1, 'dev.user': 2, 'audit.user': 3, 'plain.user': 4, 'super.user': 1 };

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const envelope = (statusCode: string, data: unknown, message = 'Success') => ({
  status: statusCode.startsWith('2') ? 'IP-S-0001' : 'IP-E-0001', statusCode, message, data,
});
const ok = (data: unknown, code = '20000'): DemoResponse => ({ status: 200, body: envelope(code, data) });
const fail = (code: string, message: string): DemoResponse => ({ status: 200, body: envelope(code, null, message) });

function seed(): Store {
  const systems = [
    ...clone(fixtures['get-all-systems.response'].data),
    ...['B', 'C', 'D'].map((s, i) => ({
      ...clone(fixtures['get-all-systems.response'].data[0]),
      id: i + 2, systemId: `00000000-0000-4000-8000-00000000000${i + 2}`, systemName: `Example System ${s}`,
      url: `https://system-${s.toLowerCase()}.example.test/`, imageId: i + 2,
    })),
  ] as unknown as Row[];
  const roles = [
    ...clone(fixtures['get-all-roles.response'].data),
    ...systems.slice(1).map((s, i) => ({
      ...clone(fixtures['get-all-roles.response'].data[0]),
      id: 109 + i, systemId: s['systemId'], systemName: s['systemName'], roleName: `Example Role ${i + 2}`,
    })),
  ] as unknown as Row[];
  const base = clone(fixtures['get-all-users.response'].data[0]) as unknown as Row;
  const users = Object.entries(DEMO_ACCOUNTS).map(([username, uamRoleId], i) => ({
    ...base, id: i + 1, username, fullname: `Demo ${username}`, firstname: 'Demo', lastname: `User${i + 1}`,
    email: `${username}@example.test`, uamRoleId, uamRole: '', roleName: null, isSuperAdmin: username === 'super.user',
    status: 'Active',
  })) as Row[];
  return { systems, roles, users, roleMenus: clone(fixtures['get-role-menu-by-role-id.response'].data) as unknown as Row[], seq: 1000 };
}

function nextId(store: Store, rows: readonly Row[]): number {
  return Math.max(store.seq, ...rows.map((r) => r.id)) + 1;
}
function stamp(row: Row, isNew: boolean): Row {
  const now = new Date().toISOString().slice(0, 19);
  return isNew ? { ...row, createdDate: now, createdBy: 'demo', updatedDate: now, updatedBy: 'demo' } : { ...row, updatedDate: now, updatedBy: 'demo' };
}
function duplicate(rows: readonly Row[], key: string, value: unknown, exceptId?: unknown): boolean {
  return rows.some((r) => r.id !== exceptId && String(r[key]).toLowerCase() === String(value).toLowerCase());
}
const uamRoleName = (id: unknown) => UAM_ROLES.find((r) => r.id === Number(id))?.name ?? '';

function addRow(rows: Row[], store: Store, body: Body, key: string): DemoResponse {
  if (duplicate(rows, key, body[key])) return fail('40301', 'Already existed');
  const id = nextId(store, rows);
  rows.push(stamp({ ...body, id } as Row, true));
  store.seq = id;
  return ok(true, '20100');
}
function updateRow(rows: Row[], id: unknown, body: Body, key: string): DemoResponse {
  const i = rows.findIndex((r) => r.id === Number(id));
  if (i < 0) return fail('40401', 'Not found');
  if (duplicate(rows, key, body[key], rows[i].id)) return fail('40301', 'Already existed');
  rows[i] = stamp({ ...rows[i], ...body, id: rows[i].id } as Row, false);
  return ok(true);
}

const routes: readonly Route[] = [
  {
    method: 'POST', pattern: /v1\/auth\/login$/, open: true,
    run: ({ store, body }) => {
      const user = store.users.find((u) => String(u['username']).toLowerCase() === String(body['Username'] ?? '').toLowerCase());
      if (!user) return fail('40101', 'Unknown demo user');
      const result = clone(fixtures['login.response'].data.result);
      result.sessionId = `demo-session-${user.id}`;
      result.isConsent = true;
      result.userProfile = {
        ...result.userProfile, userId: user.id, userName: String(user['username']), firstName: String(user['firstname']),
        lastName: String(user['lastname']), uamRole: uamRoleName(user['uamRoleId']), systemAdmin: Boolean(user['isSuperAdmin']),
      };
      return ok({ result });
    },
  },
  { method: 'POST', pattern: /v1\/auth\/logout$/, open: true, run: () => ok(true) },
  { method: 'POST', pattern: /v1\/auth\/refresh-token$/, run: () => ok({ isValid: true, userName: 'demo', userType: 'AD' }) },
  { method: 'GET', pattern: /v1\/Consent\/get-consent-last-version$/, run: () => ok(clone(fixtures['consent-last-version.response'].data)) },
  { method: 'POST', pattern: /v1\/Consent\/add-user-consent-accept$/, save: true, run: () => ok(true, '20100') },

  { method: 'GET', pattern: /v1\/Systems\/get-all-systems$/, run: ({ store }) => ok(clone(store.systems)) },
  {
    method: 'GET', pattern: /v1\/Systems\/get-systems$/,
    run: ({ store, query }) => {
      const q = (query.get('systemName') ?? '').toLowerCase();
      return ok(clone(store.systems.filter((s) => String(s['systemName']).toLowerCase().includes(q))));
    },
  },
  {
    method: 'POST', pattern: /v1\/Systems\/add-system$/, save: true,
    run: ({ store, body }) => {
      const res = addRow(store.systems, store, { ...body, systemId: crypto.randomUUID() }, 'systemName');
      return res;
    },
  },
  { method: 'PUT', pattern: /v1\/Systems\/update-system$/, save: true, run: ({ store, body }) => updateRow(store.systems, body['id'], body, 'systemName') },

  { method: 'GET', pattern: /v1\/Roles\/get-all-roles$/, run: ({ store }) => ok(clone(store.roles)) },
  { method: 'GET', pattern: /v1\/Roles\/get-roleMenu-byRoleId$/, run: ({ store }) => ok(clone(store.roleMenus)) },
  {
    method: 'POST', pattern: /v1\/Roles\/add-role$/, save: true,
    run: ({ store, body }) => {
      const { menus, ...role } = body;
      void menus;
      const systemName = store.systems.find((s) => s['systemId'] === role['systemId'])?.['systemName'] ?? null;
      return addRow(store.roles, store, { ...role, systemName }, 'roleName');
    },
  },
  {
    method: 'PUT', pattern: /v1\/Roles\/update-role$/, save: true,
    run: ({ store, body }) => {
      const { menus, ...role } = body;
      void menus;
      return updateRow(store.roles, role['id'] ?? role['roleId'], role, 'roleName');
    },
  },

  { method: 'GET', pattern: /v1\/Users\/get-all-users$/, run: ({ store }) => ok(clone(store.users)) },
  {
    method: 'GET', pattern: /v1\/Users\/get-user-byId$/,
    run: ({ store, query }) => {
      const user = store.users.find((u) => u.id === Number(query.get('userId')));
      if (!user) return fail('40401', 'Not found');
      return ok({
        ...clone(fixtures['get-user-by-id.response'].data), ...clone(user), uamRoleName: uamRoleName(user['uamRoleId']),
      });
    },
  },
  {
    method: 'POST', pattern: /v1\/Users\/search-users-activeDirectory$/,
    run: ({ body }) => {
      const q = String(body['userName'] ?? '').toLowerCase();
      const hits = fixtures['ad-search.response'].data.filter((u) => u.username.toLowerCase().includes(q));
      return ok(clone(hits.length ? hits : fixtures['ad-search.response'].data));
    },
  },
  {
    method: 'POST', pattern: /v1\/Users\/add-user$/, save: true,
    run: ({ store, body }) => addRow(store.users, store, { ...body, fullname: body['fullName'] }, 'username'),
  },
  {
    method: 'PUT', pattern: /v1\/Users\/update-user\/(\d+)$/, save: true,
    run: ({ store, body, match }) => updateRow(store.users, match[1], { ...body, fullname: body['fullName'] ?? body['fullname'] }, 'username'),
  },

  { method: 'GET', pattern: /v1\/UAM\/get-all-uam-roles$/, run: () => ok(clone(UAM_ROLES)) },
  {
    method: 'GET', pattern: /v1\/Home\/get-userSystems$/,
    run: ({ store, query }) =>
      ok(store.systems.filter((s) => s['status'] === 'Active').map((s) => ({
        id: s.id, username: query.get('userName'), systemId: s['systemId'], systemName: s['systemName'], systemUrl: s['url'],
        systemType: s['type'], description: s['description'], ownerName: s['ownerName'], imageId: s['imageId'],
        data: null, image: s['icon'] ?? null, status: s['status'],
      }))),
  },
  {
    method: 'GET', pattern: /v1\/Master\/get-generalData$/,
    run: ({ query }) => {
      const type = query.get('type');
      return ok(clone(fixtures['general-data-function.response'].data.filter((g) => !type || g.type.toLowerCase() === type.toLowerCase())));
    },
  },
  {
    method: 'GET', pattern: /v1\/Master\/get-icons$/,
    run: () => ok(Array.from({ length: 6 }, (_, i) => ({
      id: i + 1, category: 'demo', name: `icon-${i + 1}`,
      data: btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="${6 + i}" fill="currentColor"/></svg>`),
    }))),
  },
];

export interface DemoApi {
  /** Returns null when the request is not a demo endpoint (caller passes it through / fails). */
  handle(method: string, url: string, body?: unknown): DemoResponse | null;
  setFlag(flag: DemoFlag | string): void;
}

export function createDemoApi(): DemoApi {
  const store = seed();
  let flag: DemoFlag = '';
  return {
    setFlag(value) {
      flag = value === '40301' || value === '50001' || value === 'session' ? value : '';
    },
    handle(method, url, body) {
      const [rawPath, rawQuery = ''] = url.split('#')[0].split('?');
      const path = rawPath.replace(/^https?:\/\/[^/]+/, '');
      const route = routes.find((r) => r.method === method.toUpperCase() && r.pattern.test(path));
      if (!route) return null;
      if (!route.open && flag === '50001') return fail('50001', 'Simulated DB error (demo)');
      if (!route.open && flag === 'session') return fail('40102', 'Simulated session expiry (demo)');
      if (route.save && flag === '40301') return fail('40301', 'Already existed');
      return route.run({
        store, body: (body ?? {}) as Body, query: new URLSearchParams(rawQuery), match: path.match(route.pattern)!,
      });
    },
  };
}
