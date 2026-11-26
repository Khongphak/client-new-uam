// UAM-AUT-04 (#115): Logout clears session + sessionStorage, calls POST v1/auth/logout, still clears when the request fails.
import { launch, newPage, login, goto, rel, DEMO, PROD, shot, spa } from './lib.mjs';
import { mock, loginProd } from './mock3.mjs';
const b = await launch();
const ss = (p) => p.evaluate(() => ({ session: Object.keys(sessionStorage), local: Object.keys(localStorage), cookie: document.cookie }));
async function doLogout(p, vp) {
  if (vp === 'phone') { /* user menu is in the topbar on phone too */ }
  await p.locator('[data-testid=shell-user-toggle]').click(); await p.waitForTimeout(300);
}
for (const vp of ['desktop', 'phone']) for (const [name, base] of [['prod', PROD], ['demo', DEMO]]) for (const failMode of (name === 'prod' ? ['ok', 'abort', '50001'] : ['ok'])) {
  const tag = `${name}/${vp}/logout-${failMode}`;
  const p = await newPage(b, vp, base);
  if (name === 'prod') { await mock(p, { logout: failMode }); await loginProd(p); } else await login(p, 'admin.user');
  console.log(`\n== ${tag}`); console.log('after login', rel(p), JSON.stringify(await ss(p)));
  const sidBefore = await p.evaluate(() => sessionStorage.getItem('uam.session'));
  console.log('session has secrets?', /sessionId|token|password/i.test(sidBefore || ''));
  await doLogout(p, vp); await shot(p, `AUT-010-${name}-${vp}-user-menu-${failMode}`);
  if (p.calls) p.calls.length = 0; if (p.reqs) p.reqs.length = 0;
  await p.locator('[data-testid=shell-logout]').click(); await p.waitForTimeout(1500);
  console.log('after Logout url', rel(p), JSON.stringify(await ss(p)));
  if (name === 'prod') console.log('logout requests', JSON.stringify(p.reqs.filter((r) => /auth\//.test(r.path))));
  await shot(p, `AUT-010-${name}-${vp}-after-logout-${failMode}`);
  p.reqs && (p.reqs.length = 0);
  for (const path of ['/home', '/setting/system-setting', '/setting/users-setting', '/report', '/setting/users-setting/roles/new']) {
    await goto(p, path, 900); console.log('direct', path, '->', rel(p), 'storage', JSON.stringify((await ss(p)).session), 'dataCalls', p.reqs ? p.reqs.filter((r) => !/auth\//.test(r.path)).length : 'n/a');
    if (path === '/home') await shot(p, `AUT-010-${name}-${vp}-home-after-logout-${failMode}`);
    if (path === '/setting/system-setting') await shot(p, `AUT-010-${name}-${vp}-setting-after-logout-${failMode}`);
  }
  // in-app navigation + back/forward + reload
  await spa(p, '/home'); await p.waitForTimeout(600); console.log('in-app pushState /home ->', rel(p));
  await p.goBack().catch(() => {}); await p.waitForTimeout(600); console.log('after Back ->', rel(p), JSON.stringify((await ss(p)).session));
  await p.reload(); await p.waitForTimeout(900); console.log('after reload ->', rel(p));
  // new login after logout still works and shows the right user
  if (name === 'prod') { await loginProd(p, 'second.user'); } else await login(p, 'dev.user');
  console.log('re-login ->', rel(p), 'user', (await p.locator('[data-testid=shell-user-name]').innerText().catch(() => '?')).trim(), JSON.stringify((await ss(p)).session));
  await p.context().close();
}
// Logout from a deep page (setting) then Back button must not re-enter
{
  const p = await newPage(b, 'desktop', PROD); await mock(p); await loginProd(p);
  await goto(p, '/setting/system-setting'); await p.locator('[data-testid=shell-user-toggle]').click(); await p.locator('[data-testid=shell-logout]').click(); await p.waitForTimeout(1200);
  console.log('\n== logout from /setting/system-setting ->', rel(p)); await p.goBack(); await p.waitForTimeout(900); console.log('Back ->', rel(p)); await p.goBack().catch(() => {}); await p.waitForTimeout(700); console.log('Back2 ->', rel(p));
}
await b.close();
