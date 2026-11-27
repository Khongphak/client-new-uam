// Extra probes (round 3): drawer history behaviour, role-name length, phone drawer layout.
import { launch, newPage, goto, rel, PROD, shot, hscroll } from './lib.mjs';
import { mock, loginProd } from './mock3.mjs';
const b = await launch(); const log = (...a) => console.log(...a);
const SYS = '/setting/system-setting';
const open = async (p) => (await p.locator('[data-testid=system-drawer]').count()) > 0 && (await p.locator('[data-testid=system-drawer]').isVisible());
for (const vp of ['desktop', 'phone']) {
  const p = await newPage(b, vp, PROD); await mock(p); await loginProd(p); await goto(p, SYS);
  await p.locator('tbody tr button.link:visible, .m-row:visible').first().click(); await p.waitForTimeout(600); const v = rel(p);
  await p.locator('[data-testid=drawer-edit]').click(); await p.waitForTimeout(600); log(vp, 'view -> Edit url', rel(p).replace(/id=.*/, 'id=…'), 'form fields', await p.locator('[data-field]').count());
  await p.goBack(); await p.waitForTimeout(600); log(vp, 'Back from edit ->', rel(p).replace(/id=.*/, 'id=…'), '| open', await open(p), '| form fields', await p.locator('[data-field]').count());
  await p.locator('[data-testid=add-btn]').click(); await p.waitForTimeout(500); await p.goBack(); await p.waitForTimeout(500); log(vp, 'Add then Back -> open', await open(p), rel(p));
  await p.locator('[data-testid=add-btn]').click(); await p.waitForTimeout(500); await shot(p, `SYS-004-${vp}-add-form-top`); await p.locator('[data-testid=drawer-body], u-drawer').first().evaluate((e) => e.scrollTo?.(0, 9999)).catch(() => {});
  log(vp, 'hscroll with drawer', await hscroll(p));
  // tab change while drawer open? fragment keeps
  await p.goto(p.base + SYS + '?drawer=system&mode=view&id=00000000-0000-4000-8000-000000000002#system-to-system'); await p.waitForTimeout(1200); log(vp, 'drawer on S2S tab fragment ->', rel(p).replace(/id=.*?#/, 'id=…#'), '| open', await open(p), '| active tab', await p.locator('[role=tab][aria-selected=true]').allInnerTexts().catch(() => '?'));
  await p.context().close();
}
{ // role name length
  const p = await newPage(b, 'desktop', PROD); await mock(p); await loginProd(p); await goto(p, '/setting/users-setting/roles/new');
  await p.selectOption('[data-testid=role-system]', { index: 1 }); await p.fill('[data-testid=role-name]', 'x'.repeat(300)); await p.locator('[data-testid=next]').click(); await p.waitForTimeout(400);
  log('role-name 300 chars + Next -> step2?', (await p.locator('[data-testid=step-menus]').count()) > 0, JSON.stringify(await p.locator('[role=alert]').allInnerTexts()));
  await p.goBack().catch(() => {});
  await goto(p, '/setting/users-setting/roles/new'); await p.selectOption('[data-testid=role-system]', { index: 1 }); await p.fill('[data-testid=role-name]', '   '); await p.locator('[data-testid=next]').click(); await p.waitForTimeout(300); log('whitespace-only name + Next ->', (await p.locator('[data-testid=step-menus]').count()) > 0 ? 'MOVED' : 'blocked', JSON.stringify(await p.locator('[role=alert]').allInnerTexts()));
}
await b.close();
