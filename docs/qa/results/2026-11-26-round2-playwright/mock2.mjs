// Production-build API mock: extends mock.mjs (login/consent/home) with list endpoints and request counting.
import * as D from './data.mjs';
import { loginOk } from './mock.mjs';
const env = (code, data, message = 'Success') => ({ status: code.startsWith('2') ? 'IP-S-0001' : 'IP-E-0001', statusCode: code, messageType: code.startsWith('2') ? 'Success' : 'Error', message, data });
const homeSystems = env('20000', [{ systemId: 1, systemName: 'Example System A', systemDescription: 'Example', systemType: 'Web Application', ownerName: 'Test Owner', systemUrl: 'https://a.example.test', iconUrl: null, urlWebApp: 'https://a.example.test' }]);
const LISTS = [
  [/get-all-systems$/, D.systems], [/get-all-menuScreens$/, D.menus], [/get-all-system-to-system$/, D.s2s],
  [/get-all-roles$/, D.roles], [/get-all-users$/, D.users], [/get-all-uam-roles$/, D.uamRoles],
];
/** o: {consent, role, admin, loginFail, home, lists:'ok'|'abort'|'40102'|'50001'|'empty', userName} */
export async function mock(p, o = {}) {
  p.calls = [];
  await p.route('**/v1/**', async (r) => {
    const path = new URL(r.request().url()).pathname; p.calls.push(r.request().method() + ' ' + path);
    const j = (x) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(x) });
    if (path.endsWith('/auth/login')) {
      if (o.loginFail === 'envelope') return j(env('40101', null, 'bad'));
      if (o.loginFail === 'http401') return r.fulfill({ status: 401, contentType: 'application/json', body: '{}' });
      const x = loginOk(o.consent ?? true, o.role ?? 'ADMIN', o.admin ?? false);
      if (o.userName) x.data.result.userProfile.userName = o.userName;
      return j(x);
    }
    if (path.endsWith('/auth/logout')) return j(env('20000', true));
    if (path.includes('get-consent-last-version')) return j(env('20000', { id: 1, name: 'PDPA', title: '<p>Consent title</p>', description: '<p>Consent body</p>', version: '1.0', effectiveDate: '2025-01-01T00:00:00', status: 'Active', createdDate: '2025-01-01T00:00:00', createdBy: 'System', updatedDate: '2025-01-01T00:00:00', updatedBy: 'System' }));
    if (path.includes('add-user-consent-accept')) return j(env('20000', true));
    if (path.includes('get-userSystems')) {
      const h = o.home ?? 'ok';
      if (h === 'ok') return j(homeSystems);
      if (h === 'abort') return r.abort('connectionrefused');
      if (h === '40102') return j(env('40102', null, 'Session expired'));
      return j(env(h, null, 'Server said: ' + h));
    }
    for (const [re, data] of LISTS) if (re.test(path)) {
      const m = o.lists ?? 'ok';
      if (m === 'abort') return r.abort('connectionrefused');
      if (m === '40102') return j(env('40102', null, 'Session expired'));
      if (m === '50001') return j(env('50001', null, 'DB down'));
      return j(env('20000', m === 'empty' ? [] : data));
    }
    return j(env('20000', []));
  });
}
