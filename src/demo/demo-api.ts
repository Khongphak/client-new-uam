// DEMO MODE ONLY — compiled only by the `demo` build configuration (see tsconfig.demo.json).
// In-memory mock of the UAM API contract (docs/api-contract/uam-api-contract.md). All data is synthetic.
import { fixtures } from '../testing/fixtures';

/** Marker checked by `npm run check:no-demo` — must never appear in a production bundle. */
export const DEMO_MARKER = '__UAM_DEMO_MODE__';

export type DemoFlag = '' | '40301' | '50001' | 'session';
export interface DemoResponse {
  readonly status: number;
  readonly body: unknown;
  /** Set for file downloads (reports); `body` is then ignored. */
  readonly file?: { readonly text: string; readonly type: string };
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
  menus: Row[];
  systemToSystem: Row[];
  /** Menu tree per role id. */
  roleMenus: Map<number, Row[]>;
  seq: number;
}

const NOW = '2025-01-01T00:00:00';
const SYSTEM_A = '00000000-0000-4000-8000-000000000001';
const UAM_ROLES = ['ADMIN', 'DEVELOPER', 'AUDIT', 'USER'].map((name, i) => ({
  id: i + 1,
  name,
  status: 'Active',
  description: `${name} (demo)`,
  createdDate: NOW,
  createdBy: 'System',
  updatedDate: NOW,
  updatedBy: 'System',
}));
// Demo login accounts → UAM role id. Usernames are fictional.
const DEMO_ACCOUNTS: Record<string, number> = {
  'admin.user': 1,
  'dev.user': 2,
  'audit.user': 3,
  'plain.user': 4,
  'super.user': 1,
};

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const envelope = (statusCode: string, data: unknown, message = 'Success') => ({
  status: statusCode.startsWith('2') ? 'IP-S-0001' : 'IP-E-0001',
  statusCode,
  message,
  data,
});
const ok = (data: unknown, code = '20000'): DemoResponse => ({
  status: 200,
  body: envelope(code, data),
});
const fail = (code: string, message: string): DemoResponse => ({
  status: 200,
  body: envelope(code, null, message),
});

function seed(): Store {
  const systems = [
    ...clone(fixtures['get-all-systems.response'].data),
    ...['B', 'C', 'D'].map((s, i) => ({
      ...clone(fixtures['get-all-systems.response'].data[0]),
      id: i + 2,
      systemId: `00000000-0000-4000-8000-00000000000${i + 2}`,
      systemName: `Example System ${s}`,
      url: `https://system-${s.toLowerCase()}.example.test/`,
      imageId: i + 2,
    })),
  ] as unknown as Row[];
  const roles = [
    ...clone(fixtures['get-all-roles.response'].data),
    ...systems.slice(1).map((s, i) => ({
      ...clone(fixtures['get-all-roles.response'].data[0]),
      id: 109 + i,
      systemId: s['systemId'],
      systemName: s['systemName'],
      roleName: `Example Role ${i + 2}`,
    })),
  ] as unknown as Row[];
  const base = clone(fixtures['get-all-users.response'].data[0]) as unknown as Row;
  const users = Object.entries(DEMO_ACCOUNTS).map(([username, uamRoleId], i) => ({
    ...base,
    id: i + 1,
    username,
    fullname: `Demo ${username}`,
    firstname: 'Demo',
    lastname: `User${i + 1}`,
    email: `${username}@example.test`,
    uamRoleId,
    uamRole: '',
    roleName: null,
    isSuperAdmin: username === 'super.user',
    status: 'Active',
  })) as Row[];
  const departments = ['IT Center', 'Claims', 'Underwriting'];
  users.forEach((u, i) => {
    u['department'] = departments[i % departments.length];
    u['manager'] = '[Manager One,Manager Two]';
    u['systemRoles'] = [
      {
        userSystemId: 12 + i,
        systemId: SYSTEM_A,
        systemName: 'Example System A',
        roleId: 108,
        roleName: 'Example Role',
      },
    ];
  });
  const menus = systems.flatMap((s, i) =>
    ['Example Screen', 'Report Screen'].map((screenName, j) => ({
      ...clone(fixtures['menu-screens-by-system-id.response'].data[0]),
      id: i * 2 + j + 1,
      systemId: s['systemId'],
      systemName: s['systemName'],
      screenName,
      url: `/screen-${i * 2 + j + 1}`,
      imageId: 2 + j,
      functional: j === 0 ? '[add,view,edit]' : '[view]',
    })),
  ) as unknown as Row[];
  const audit = {
    createdDate: NOW,
    createdBy: 'System',
    updatedDate: NOW,
    updatedBy: 'System',
    status: 'Active',
    mode: 'JWT',
  };
  const systemToSystem = [
    [0, 1],
    [1, 2],
  ].map(([a, b], i) => ({
    ...audit,
    id: i + 1,
    accessTokenTime: 30,
    sourceSystemUUId: systems[a]['systemId'],
    targetSystemUUId: systems[b]['systemId'],
    sourceSystemName: systems[a]['systemName'],
    targetSystemName: systems[b]['systemName'],
  })) as unknown as Row[];
  const roleMenus = new Map<number, Row[]>([
    [108, clone(fixtures['get-role-menu-by-role-id.response'].data) as unknown as Row[]],
  ]);
  return { systems, roles, users, menus, systemToSystem, roleMenus, seq: 1000 };
}

function nextId(store: Store, rows: readonly Row[]): number {
  return Math.max(store.seq, ...rows.map((r) => r.id)) + 1;
}
function stamp(row: Row, isNew: boolean): Row {
  const now = new Date().toISOString().slice(0, 19);
  return isNew
    ? { ...row, createdDate: now, createdBy: 'demo', updatedDate: now, updatedBy: 'demo' }
    : { ...row, updatedDate: now, updatedBy: 'demo' };
}
type DupCheck = (existing: Row, incoming: Body) => boolean;
const sameText = (a: unknown, b: unknown) => String(a).toLowerCase() === String(b).toLowerCase();
const byKey =
  (key: string): DupCheck =>
  (existing, incoming) =>
    sameText(existing[key], incoming[key]);
const duplicate = (rows: readonly Row[], isDup: DupCheck, body: Body, exceptId?: unknown) =>
  rows.some((r) => r.id !== exceptId && isDup(r, body));
const uamRoleName = (id: unknown) => UAM_ROLES.find((r) => r.id === Number(id))?.name ?? '';

function addRow(rows: Row[], store: Store, body: Body, isDup: DupCheck): DemoResponse {
  if (duplicate(rows, isDup, body)) return fail('40301', 'Already existed');
  const id = nextId(store, rows);
  rows.push(stamp({ ...body, id } as Row, true));
  store.seq = id;
  return ok(true, '20100');
}
function updateRow(rows: Row[], id: unknown, body: Body, isDup: DupCheck): DemoResponse {
  const i = rows.findIndex((r) => r.id === Number(id));
  if (i < 0) return fail('40401', 'Not found');
  if (duplicate(rows, isDup, body, rows[i].id)) return fail('40301', 'Already existed');
  rows[i] = stamp({ ...rows[i], ...body, id: rows[i].id } as Row, false);
  return ok(true);
}

const isSuccess = (res: DemoResponse) =>
  (res.body as { statusCode: string }).statusCode.startsWith('2');
const samePair: DupCheck = (a, b) =>
  sameText(a['sourceSystemUUId'], b['sourceSystemUUId']) &&
  sameText(a['targetSystemUUId'], b['targetSystemUUId']);
const sameScreenInSystem: DupCheck = (a, b) =>
  sameText(a['systemId'], b['systemId']) && sameText(a['screenName'], b['screenName']);
const sameRoleInSystem: DupCheck = (a, b) =>
  sameText(a['systemId'], b['systemId']) && sameText(a['roleName'], b['roleName']);
const systemName = (store: Store, systemId: unknown) =>
  store.systems.find((s) => sameText(s['systemId'], systemId))?.['systemName'] ?? null;

function withSystemNames(store: Store, body: Body): Body {
  return {
    ...body,
    sourceSystemName: systemName(store, body['sourceSystemUUId']),
    targetSystemName: systemName(store, body['targetSystemUUId']),
    mode: 'JWT',
  };
}
const withMenuSystemName = (store: Store, body: Body): Body => ({
  ...body,
  systemName: systemName(store, body['systemId']),
});

/** List rows have no `systemRoles` / `manager` (only get-user-byId carries them). */
function listUser(user: Row): Row {
  const { systemRoles, manager, ...row } = clone(user);
  void systemRoles;
  void manager;
  return row as Row;
}

/** Keeps `systemRoles`/`manager` of a saved user; rows without a `userSystemId` get a new one. */
function userBody(store: Store, body: Body): Body {
  let next = store.seq + 100;
  const systemRoles = ((body['systemRoles'] ?? []) as Body[]).map((r) => ({
    ...r,
    userSystemId: r['userSystemId'] ?? ++next,
  }));
  store.seq = next;
  return { ...body, fullname: body['fullName'] ?? body['fullname'], systemRoles };
}

/** Turns the `menus` of add/update-role into the server tree (fresh ids, `parentId` = roleMenuId of the group). */
function buildRoleMenus(store: Store, roleId: number, menus: unknown): Row[] {
  let roleMenuId = 0;
  const walk = (nodes: Body[], parentId: number): Row[] =>
    nodes.map((n) => {
      const id = ++roleMenuId;
      const menu = store.menus.find((m) => m.id === n['menuId']);
      return {
        id,
        roleId,
        roleMenuId: id,
        menuId: (n['menuId'] as number | undefined) ?? 0,
        parentId,
        groupName: (n['groupName'] as string | undefined) ?? null,
        screenName: (menu?.['screenName'] as string | undefined) ?? null,
        sortOrder: n['sortOrder'],
        permission: (n['permission'] as string | undefined) ?? null,
        functional: (menu?.['functional'] as string | undefined) ?? null,
        imageGroupId: n['imageGroupId'],
        createdDate: NOW,
        createdBy: 'demo',
        updatedDate: NOW,
        updatedBy: 'demo',
        groupMenus: walk((n['groupMenus'] as Body[] | undefined) ?? [], id),
      } as Row;
    });
  return walk((menus ?? []) as Body[], 0);
}

function reportFile(title: string, rows: string[][]): DemoResponse {
  const text = [
    `DEMO — synthetic data (${title}). Not an Excel file.`,
    ...rows.map((r) => r.join('\t')),
  ].join('\n');
  return { status: 200, body: null, file: { text, type: 'text/plain' } };
}

const routes: readonly Route[] = [
  {
    method: 'POST',
    pattern: /v1\/auth\/login$/,
    open: true,
    run: ({ store, body }) => {
      const user = store.users.find(
        (u) => String(u['username']).toLowerCase() === String(body['Username'] ?? '').toLowerCase(),
      );
      if (!user) return fail('40101', 'Unknown demo user');
      const result = clone(fixtures['login.response'].data.result);
      result.sessionId = `demo-session-${user.id}`;
      result.isConsent = true;
      result.userProfile = {
        ...result.userProfile,
        userId: user.id,
        userName: String(user['username']),
        firstName: String(user['firstname']),
        lastName: String(user['lastname']),
        uamRole: uamRoleName(user['uamRoleId']),
        systemAdmin: Boolean(user['isSuperAdmin']),
      };
      return ok({ result });
    },
  },
  { method: 'POST', pattern: /v1\/auth\/logout$/, open: true, run: () => ok(true) },
  {
    method: 'POST',
    pattern: /v1\/auth\/refresh-token$/,
    run: () => ok({ isValid: true, userName: 'demo', userType: 'AD' }),
  },
  {
    method: 'GET',
    pattern: /v1\/Consent\/get-consent-last-version$/,
    run: () => ok(clone(fixtures['consent-last-version.response'].data)),
  },
  {
    method: 'POST',
    pattern: /v1\/Consent\/add-user-consent-accept$/,
    save: true,
    run: () => ok(true, '20100'),
  },

  {
    method: 'GET',
    pattern: /v1\/Systems\/get-all-systems$/,
    run: ({ store }) => ok(clone(store.systems)),
  },
  {
    method: 'GET',
    pattern: /v1\/Systems\/get-systems$/,
    run: ({ store, query }) => {
      const id = query.get('systemId');
      return ok(clone(store.systems.filter((s) => !id || sameText(s['systemId'], id))));
    },
  },
  {
    method: 'POST',
    pattern: /v1\/Systems\/add-system$/,
    save: true,
    run: ({ store, body }) =>
      addRow(store.systems, store, { ...body, systemId: crypto.randomUUID() }, byKey('systemName')),
  },
  {
    method: 'PUT',
    pattern: /v1\/Systems\/update-system$/,
    save: true,
    run: ({ store, body }) => updateRow(store.systems, body['id'], body, byKey('systemName')),
  },

  {
    method: 'GET',
    pattern: /v1\/SystemToSystem\/get-all-system-to-system$/,
    run: ({ store }) => ok(clone(store.systemToSystem)),
  },
  {
    method: 'GET',
    pattern: /v1\/SystemToSystem\/get-system-to-system-by-id$/,
    run: ({ store, query }) => {
      const row = store.systemToSystem.find((r) => r.id === Number(query.get('id')));
      return row ? ok(clone(row)) : fail('40401', 'Not found');
    },
  },
  {
    method: 'POST',
    pattern: /v1\/SystemToSystem\/add-system-to-system$/,
    save: true,
    run: ({ store, body }) =>
      addRow(store.systemToSystem, store, withSystemNames(store, body), samePair),
  },
  {
    method: 'PUT',
    pattern: /v1\/SystemToSystem\/update-system-to-system$/,
    save: true,
    run: ({ store, body }) =>
      updateRow(store.systemToSystem, body['id'], withSystemNames(store, body), samePair),
  },

  {
    method: 'GET',
    pattern: /v1\/Menus\/get-all-menuScreens$/,
    run: ({ store }) => ok(clone(store.menus)),
  },
  {
    method: 'GET',
    pattern: /v1\/Menus\/get-menuScreens$/,
    run: ({ store }) => ok(clone(store.menus)),
  },
  {
    method: 'GET',
    pattern: /v1\/Menus\/get-menuScreen-byId$/,
    run: ({ store, query }) => {
      const row = store.menus.find((m) => m.id === Number(query.get('screenId')));
      return row ? ok(clone(row)) : fail('40401', 'Not found');
    },
  },
  {
    method: 'POST',
    pattern: /v1\/Menus\/add-menuScreen$/,
    save: true,
    run: ({ store, body }) =>
      addRow(store.menus, store, withMenuSystemName(store, body), sameScreenInSystem),
  },
  {
    method: 'PUT',
    pattern: /v1\/Menus\/update-menuScreen$/,
    save: true,
    run: ({ store, body }) =>
      updateRow(store.menus, body['id'], withMenuSystemName(store, body), sameScreenInSystem),
  },
  {
    method: 'GET',
    pattern: /v2\/Menus\/get-menuScreens-bySystemId$/,
    run: ({ store, query }) =>
      ok(clone(store.menus.filter((m) => sameText(m['systemId'], query.get('systemId'))))),
  },
  {
    method: 'GET',
    pattern: /v1\/Menus\/get-menuRoleScreens-bySystemId$/,
    run: ({ store, query }) => {
      const role = store.roles.find((r) => r.id === Number(query.get('roleId')));
      const inSystem = role !== undefined && sameText(role['systemId'], query.get('systemId'));
      return ok(inSystem ? clone(store.roleMenus.get(role.id) ?? []) : []);
    },
  },

  {
    method: 'GET',
    pattern: /v1\/Roles\/get-all-roles$/,
    run: ({ store }) => ok(clone(store.roles)),
  },
  {
    method: 'GET',
    pattern: /v1\/Roles\/get-role$/,
    run: ({ store, query }) =>
      ok(clone(store.roles.filter((r) => r.id === Number(query.get('roleId'))))),
  },
  {
    method: 'GET',
    pattern: /v1\/Roles\/get-roleMenu-byRoleId$/,
    run: ({ store, query }) => ok(clone(store.roleMenus.get(Number(query.get('roleId'))) ?? [])),
  },
  {
    method: 'POST',
    pattern: /v1\/Roles\/add-role$/,
    save: true,
    run: ({ store, body }) => {
      const { menus, ...role } = body;
      const systemName =
        store.systems.find((s) => s['systemId'] === role['systemId'])?.['systemName'] ?? null;
      const id = nextId(store, store.roles);
      const res = addRow(store.roles, store, { ...role, systemName }, sameRoleInSystem);
      if (isSuccess(res)) store.roleMenus.set(id, buildRoleMenus(store, id, menus));
      return res;
    },
  },
  {
    method: 'PUT',
    pattern: /v1\/Roles\/update-role$/,
    save: true,
    run: ({ store, body }) => {
      const { menus, ...role } = body;
      const id = Number(role['id'] ?? role['roleId']);
      const res = updateRow(store.roles, id, role, sameRoleInSystem);
      if (isSuccess(res)) store.roleMenus.set(id, buildRoleMenus(store, id, menus));
      return res;
    },
  },

  {
    method: 'GET',
    pattern: /v1\/Users\/get-all-users$/,
    run: ({ store }) => ok(store.users.map(listUser)),
  },
  {
    method: 'GET',
    pattern: /v1\/Users\/get-user-byId$/,
    run: ({ store, query }) => {
      const user = store.users.find((u) => u.id === Number(query.get('userId')));
      if (!user) return fail('40401', 'Not found');
      return ok({
        ...clone(fixtures['get-user-by-id.response'].data),
        ...clone(user),
        uamRoleName: uamRoleName(user['uamRoleId']),
      });
    },
  },
  {
    method: 'GET',
    pattern: /v1\/Users\/get-userRole-byId$/,
    run: ({ store, query }) => {
      const user = store.users.find((u) => u.id === Number(query.get('userId')));
      if (!user) return fail('40401', 'Not found');
      const rows = (user['systemRoles'] ?? []) as Row[] & { roleId: number }[];
      return ok({
        userId: user.id,
        userSystems: rows.map((r) => ({
          id: r['userSystemId'],
          systemId: r['systemId'],
          systemName: r['systemName'],
          roleId: r['roleId'],
          roleName: r['roleName'],
          menuRoleScreens: clone(store.roleMenus.get(Number(r['roleId'])) ?? []),
        })),
      });
    },
  },
  {
    method: 'POST',
    pattern: /v1\/Users\/search-users-activeDirectory$/,
    run: ({ body }) => {
      const q = String(body['userName'] ?? '').toLowerCase();
      const hits = fixtures['ad-search.response'].data.filter((u) =>
        u.username.toLowerCase().includes(q),
      );
      return ok(clone(hits.length ? hits : fixtures['ad-search.response'].data));
    },
  },
  {
    method: 'POST',
    pattern: /v1\/Users\/add-user$/,
    save: true,
    run: ({ store, body }) => addRow(store.users, store, userBody(store, body), byKey('username')),
  },
  {
    method: 'PUT',
    pattern: /v1\/Users\/update-user\/(\d+)$/,
    save: true,
    run: ({ store, body, match }) =>
      updateRow(store.users, match[1], userBody(store, body), byKey('username')),
  },

  { method: 'GET', pattern: /v1\/UAM\/get-all-uam-roles$/, run: () => ok(clone(UAM_ROLES)) },
  {
    method: 'GET',
    pattern: /v1\/Home\/get-userSystems$/,
    run: ({ store, query }) =>
      ok(
        store.systems
          .filter((s) => s['status'] === 'Active')
          .map((s) => ({
            id: s.id,
            username: query.get('userName'),
            systemId: s['systemId'],
            systemName: s['systemName'],
            systemUrl: s['url'],
            systemType: s['type'],
            description: s['description'],
            ownerName: s['ownerName'],
            imageId: s['imageId'],
            data: null,
            image: s['icon'] ?? null,
            status: s['status'],
          })),
      ),
  },
  {
    method: 'GET',
    pattern: /v1\/Master\/get-generalData$/,
    run: ({ query }) => {
      const type = query.get('type');
      return ok(
        clone(
          fixtures['general-data-function.response'].data.filter(
            (g) => !type || g.type.toLowerCase() === type.toLowerCase(),
          ),
        ),
      );
    },
  },
  {
    method: 'GET',
    pattern: /v1\/Master\/get-icons$/,
    run: () =>
      ok(
        Array.from({ length: 6 }, (_, i) => ({
          id: i + 1,
          category: 'demo',
          name: `icon-${i + 1}`,
          data: btoa(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="${6 + i}" fill="currentColor"/></svg>`,
          ),
        })),
      ),
  },
  { method: 'POST', pattern: /v1\/UserAccesses\/add-useraccess-history$/, run: () => ok(true) },
  {
    method: 'POST',
    pattern: /v1\/Reports\/get-departments$/,
    run: ({ store, body }) => {
      const name = systemName(store, body['systemId']);
      const departments = [...new Set(store.users.map((u) => String(u['department'])))].sort();
      return ok(
        departments.map((department) => ({
          systemId: body['systemId'] ?? null,
          systemName: name,
          department,
        })),
      );
    },
  },
  {
    method: 'POST',
    pattern: /v1\/Reports\/generate-authorization-matrix-report$/,
    run: ({ store, body }) => {
      const dept = String(body['department'] ?? '');
      return reportFile(
        'authorization matrix',
        store.users
          .filter((u) => !dept || u['department'] === dept)
          .map((u) => [String(u['username']), String(u['department']), 'Example Role']),
      );
    },
  },
  {
    method: 'POST',
    pattern: /v1\/Reports\/generate-audit-trails-report$/,
    run: ({ store }) =>
      reportFile(
        'audit trails',
        store.users.map((u, i) => [`2025-01-0${i + 1}T10:00:00`, String(u['username']), 'Login']),
      ),
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
      if (!route.open && flag === 'session')
        return fail('40102', 'Simulated session expiry (demo)');
      if (route.save && flag === '40301') return fail('40301', 'Already existed');
      return route.run({
        store,
        body: (body ?? {}) as Body,
        query: new URLSearchParams(rawQuery),
        match: path.match(route.pattern)!,
      });
    },
  };
}
