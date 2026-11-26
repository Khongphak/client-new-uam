// RBAC-006 s1-5, SYS-009 s2, UAM-SHL-02 regression: roleGuard on /setting/* — demo build (:4300) + production+mock (:4301)
import { launch, newPage, login, goto, rel, DEMO, PROD, shot, body, spa } from './lib.mjs';
import { mock } from './mock2.mjs';
const b = await launch(); const log = (...a) => console.log(...a);
const ROUTES = ['/home', '/setting/system-setting', '/setting/users-setting', '/report', '/setting', '/setting/nope'];
const short = async (p) => { const t = await body(p); return /You don’t have access/.test(t) ? '403' : /doesn’t exist/.test(t) ? '404' : /System Setting \| Add/.test(t) ? 'SystemSetting' : /User & Permission \| (Roles|Users)/.test(t) || /User & Permission \| Roles/.test(t) ? 'UserPermission' : /Welcome/.test(t) ? 'Home' : /Authorization Matrix/.test(t) ? 'Report' : '?'; };
for (const vp of ['desktop', 'phone']) {
  log('\n#### DEMO', vp);
  for (const u of ['admin.user', 'dev.user', 'audit.user', 'plain.user', 'super.user']) {
    const p = await newPage(b, vp, DEMO); await login(p, u);
    const nav = vp === 'desktop' ? (await p.locator('aside a, nav a').allInnerTexts()).map((s) => s.trim()).filter(Boolean) : '(phone: drawer closed)';
    const row = {};
    for (const r of ROUTES) { await goto(p, r, 700); row[r] = `${rel(p)} => ${await short(p)}`; if (['/setting/users-setting', '/setting/system-setting', '/report'].includes(r) && /403/.test(row[r])) await shot(p, `RBAC-006-${vp}-${u.split('.')[0]}-${r.replace(/\//g, '_')}`); }
    // in-app (SPA) navigation
    const spaRes = {}; await goto(p, '/home'); for (const r of ['/setting/users-setting', '/setting/system-setting', '/report']) { await spa(p, r); await p.waitForTimeout(600); spaRes[r] = await short(p); await spa(p, '/home'); await p.waitForTimeout(300); }
    log(u, 'sidebar:', JSON.stringify(nav)); log('  direct:', JSON.stringify(row)); log('  spa:', JSON.stringify(spaRes)); await p.context().close();
  }
}
log('\n#### PROD+mock, direct URL with reload (restored session), desktop');
for (const [role, admin] of [['ADMIN', false], ['DEVELOPER', false], ['AUDIT', false], ['USER', false], ['USER', true]]) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await newPage(ctx, 'desktop', PROD); await mock(p, { role, admin });
  await goto(p, '/login'); await p.fill('#login-username', 'testuser'); await p.fill('#login-password', 'x'); await p.click('[data-testid=login-submit]'); await p.waitForTimeout(1000);
  const row = {}; for (const r of ['/setting/system-setting', '/setting/users-setting', '/report']) { await goto(p, r, 900); row[r] = `${rel(p)} => ${await short(p)}`; }
  log(role, admin ? '(systemAdmin)' : '', JSON.stringify(row)); await ctx.close();
}
await b.close();
