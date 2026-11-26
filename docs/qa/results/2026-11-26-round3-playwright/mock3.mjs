// Production-build API mock for QA round 3: stateful (add/update change the lists), records every request body in p.reqs.
import fs from 'node:fs';
import * as D from './data.mjs';
import { loginOk } from './mock.mjs';
const FX = '/home/user/client-new-uam/src/testing/fixtures/';
const fx = (n) => JSON.parse(fs.readFileSync(FX + n + '.json', 'utf8'));
const env = (code, data, message = 'Success') => ({ status: code.startsWith('2') ? 'IP-S-0001' : 'IP-E-0001', statusCode: code, messageType: code.startsWith('2') ? 'Success' : 'Error', message, data });
const clone = (x) => JSON.parse(JSON.stringify(x));
const homeSystems = env('20000', [{ systemId: 1, systemName: 'Example System A', systemDescription: 'Example', systemType: 'Web Application', ownerName: 'Test Owner', systemUrl: 'https://a.example.test', iconUrl: null, urlWebApp: 'https://a.example.test' }]);
const roleTree = fx('get-role-menu-by-role-id.response').data;
const userDetail = fx('get-user-by-id.response').data;
const ad = fx('ad-search.response').data;
const ICONS = [1, 2, 3, 4].map((i) => ({ id: i, category: 'Systems', name: 'Icon ' + i, data: 'PHN2Zy8+', createdDate: '2025-01-01T00:00:00', createdBy: 'S' }));
/** o: {consent, role, admin, userName, lists:'ok'|'abort'|'50001'|'empty', logout:'ok'|'abort'|'50001', saveFail:'40301'|'50001'} */
export async function mock(p, o = {}) {
  p.calls = []; p.reqs = [];
  const S = { systems: clone(D.systems), roles: clone(D.roles), users: clone(D.users) };
  p.state = S;
  await p.route('**/v1/**', async (r) => {
    const rq = r.request(); const u = new URL(rq.url()); const path = u.pathname; const method = rq.method();
    let body = null; try { body = rq.postDataJSON(); } catch { body = rq.postData(); }
    p.calls.push(method + ' ' + path); p.reqs.push({ method, path, query: u.search, body });
    const j = (x) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(x) });
    if (path.endsWith('/auth/login')) { const x = loginOk(o.consent ?? true, o.role ?? 'ADMIN', o.admin ?? false); if (o.userName) x.data.result.userProfile.userName = o.userName; return j(x); }
    if (path.endsWith('/auth/logout')) { if (o.logout === 'abort') return r.abort('connectionrefused'); if (o.logout === '50001') return j(env('50001', null, 'DB down')); return j(env('20000', true)); }
    if (path.includes('get-userSystems')) return j(homeSystems);
    if (path.includes('get-consent-last-version')) return j(env('20000', { id: 1, name: 'PDPA', title: '<p>t</p>', description: '<p>b</p>', version: '1.0', effectiveDate: '2025-01-01T00:00:00', status: 'Active', createdDate: '2025-01-01T00:00:00', createdBy: 'S', updatedDate: '2025-01-01T00:00:00', updatedBy: 'S' }));
    if (path.includes('add-user-consent-accept')) return j(env('20000', true));
    const listMode = o.lists ?? 'ok';
    const lst = (data) => listMode === 'abort' ? r.abort('connectionrefused') : listMode === '50001' ? j(env('50001', null, 'DB down')) : j(env('20000', listMode === 'empty' ? [] : data));
    if (/get-all-systems$/.test(path)) return lst(S.systems);
    if (/get-systems$/.test(path)) return j(env('20000', S.systems.filter((s) => s.systemId === u.searchParams.get('systemId'))));
    if (/get-all-menuScreens$|v1\/Menus\/get-menuScreens$/.test(path)) return lst(D.menus);
    if (/get-all-system-to-system$/.test(path)) return lst(D.s2s);
    if (/get-all-roles$/.test(path)) return lst(S.roles);
    if (/get-all-users$/.test(path)) return lst(S.users);
    if (/get-all-uam-roles$/.test(path)) return j(env('20000', D.uamRoles));
    if (/get-icons$/.test(path)) return j(env('20000', ICONS));
    if (/get-generalData$/.test(path)) return j(env('20000', [{ id: 1, name: 'add', type: 'function' }, { id: 2, name: 'view', type: 'function' }, { id: 3, name: 'edit', type: 'function' }]));
    if (/get-role$/.test(path)) return j(env('20000', S.roles.filter((x) => String(x.id) === u.searchParams.get('roleId'))));
    if (/get-roleMenu-byRoleId$/.test(path)) return j(env('20000', roleTree));
    if (/get-menuScreens-bySystemId$|get-menuRoleScreens-bySystemId$/.test(path)) return j(env('20000', []));
    if (/get-user-byId$/.test(path)) { const id = +u.searchParams.get('userId'); const x = S.users.find((q) => q.id === id); return j(env('20000', { ...clone(userDetail), ...clone(x), uamRoleName: D.uamRoles.find((q) => q.id === x.uamRoleId)?.name, manager: '[Manager One,Manager Two]', systemRoles: clone(userDetail.systemRoles) })); }
    if (/get-userRole-byId$/.test(path)) return j(env('20000', { userId: +u.searchParams.get('userId'), userSystems: [{ id: 12, systemId: S.systems[0].systemId, systemName: S.systems[0].systemName, roleId: 108, roleName: 'Example Role', menuRoleScreens: roleTree }] }));
    if (/search-users-activeDirectory$/.test(path)) return j(env('20000', (body?.userName ?? '').toLowerCase().includes('none') ? [] : ad));
    if (/add-system$/.test(path) || /update-system$/.test(path)) {
      if (o.saveFail === '40301') return j(env('40301', null, 'Already existed'));
      if (o.saveFail === '50001') return j(env('50001', null, 'DB down'));
      if (/add-system$/.test(path)) { S.systems.unshift({ id: 900, createdDate: '2025-06-01T00:00:00', systemId: '00000000-0000-4000-8000-000000000900', authenrizationType: 'JWT', createdBy: 'me', updatedDate: '2025-06-01T00:00:00', updatedBy: 'me', icon: null, description: body.description, ...body }); }
      else { const i = S.systems.findIndex((s) => s.systemId === body.systemId); if (i >= 0) S.systems[i] = { ...S.systems[i], ...body, updatedBy: 'ADMIN QA', updatedDate: '2025-06-02T00:00:00' }; }
      return j(env('20000', true));
    }
    if (/add-user$|update-user\/\d+$|add-role$|update-role$/.test(path)) return j(env('20000', true));
    return j(env('20000', []));
  });
}
export async function loginProd(p, user = 'testuser', wait = 1200) {
  await p.goto(p.base + '/login'); await p.waitForSelector('#login-username');
  await p.fill('#login-username', user); await p.fill('#login-password', 'x'); await p.click('[data-testid=login-submit]'); await p.waitForTimeout(wait);
}
