import { launch, newPage, login, goto, rel, DEMO, shot, body } from './lib.mjs';
const b = await launch(); const log = (...a) => console.log(...a);
for (const vp of ['desktop', 'phone']) {
  const p = await newPage(b, vp, DEMO); await goto(p, '/home'); log(vp, 'demo unauth /home ->', rel(p));
  await login(p, 'admin.user'); log(vp, 'demo login ->', rel(p), 'cards', await p.locator('a[target=_blank]').count());
  await p.reload(); await p.waitForTimeout(1200); log(vp, 'demo reload ->', rel(p), 'cards', await p.locator('a[target=_blank]').count(), 'topbar', (await p.locator('header').first().innerText()).replace(/\n+/g, ' | '));
  // Logout via user menu -> then open /home again in same tab
  await p.getByLabel('Account menu').click(); await p.waitForTimeout(300); await p.getByText('Logout', { exact: true }).click(); await p.waitForTimeout(1200);
  log(vp, 'after Logout ->', rel(p), 'session key still present:', await p.evaluate(() => sessionStorage.getItem('uam.session') !== null));
  await goto(p, '/home', 1200); log(vp, 'then open /home ->', rel(p), 'cards', await p.locator('a[target=_blank]').count()); await shot(p, `BUG-2-${vp}-home-after-logout`);
  await goto(p, '/setting/users-setting', 1200); log(vp, 'then open /setting/users-setting ->', rel(p));
  await p.context().close();
}
await b.close();
