import { launch, newPage, login, goto, rel, DEMO, PROD, shot, body } from './lib.mjs';
import { mock } from './mock2.mjs';
const b = await launch();
for (const [name, base] of [['prod+mock', PROD], ['demo', DEMO]]) {
  const p = await newPage(b, 'desktop', base); if (base === PROD) await mock(p, {});
  if (base === PROD) { await goto(p, '/login'); await p.fill('#login-username', 'testuser'); await p.fill('#login-password', 'x'); await p.click('[data-testid=login-submit]'); await p.waitForTimeout(1200); } else await login(p, 'admin.user');
  const ss = () => p.evaluate(() => Object.keys(sessionStorage));
  console.log(name, 'logged in', rel(p), await ss());
  // open user menu
  const cand = await p.locator('header button').evaluateAll((e) => e.map((x) => (x.getAttribute('aria-label') || x.innerText).trim()));
  console.log('header buttons', cand);
  await p.locator('header button', { hasText: /ADMIN|Test|Demo/ }).first().click().catch((e) => console.log('click user menu failed', e.message.slice(0, 80)));
  await p.waitForTimeout(300); await shot(p, `AUT-008-${name.split('+')[0]}-user-menu`);
  const lo = p.getByText('Logout', { exact: true }); console.log('logout items', await lo.count());
  await lo.first().click(); await p.waitForTimeout(2000);
  console.log('after Logout click url', rel(p), 'storage', await ss());
  await p.reload(); await p.waitForTimeout(1200); console.log('reload after logout ->', rel(p));
  await goto(p, '/home'); console.log('direct /home after logout ->', rel(p), await ss());
  console.log('calls', JSON.stringify(p.calls ?? 'n/a'));
}
await b.close();
