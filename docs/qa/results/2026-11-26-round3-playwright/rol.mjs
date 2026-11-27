// UAM-USR-02 (TC-USR-004), USR-03 (TC-USR-005), USR-04 (TC-USR-007/008/012), ROL-01 (TC-ROL-001) — production build (:4301) + page.route mock; demo (:4300) smoke.
import fs from 'node:fs';
import { launch, newPage, login, goto, rel, DEMO, PROD, shot, body, hscroll } from './lib.mjs';
import { mock, loginProd } from './mock3.mjs';
const FX = '/home/user/client-new-uam/src/testing/fixtures/';
const fx = (n) => JSON.parse(fs.readFileSync(FX + n + '.json', 'utf8'));
const b = await launch(); const log = (...a) => console.log(...a);
const U = '/setting/users-setting';
const mk = async (vp, o = {}, base = PROD, user = 'testuser') => { const p = await newPage(b, vp, base); if (base === PROD) { await mock(p, o); await loginProd(p, user); } else await login(p, user); return p; };
const txt = async (p, sel = 'main, body') => (await p.locator(sel).first().innerText()).replace(/\n+/g, ' | ');
const box = (p, sel) => p.locator(sel).first().boundingBox();

// ===== TC-ROL-001 role editor
for (const vp of ['desktop', 'phone']) {
  log(`\n######## ${vp} — TC-ROL-001 Role editor`);
  const p = await mk(vp); await goto(p, U); const add = p.locator('[data-testid=add-role]'); log('Add role button present', await add.count(), 'text', await add.first().innerText().catch(() => '')); await add.first().click(); await p.waitForTimeout(900); log('s1 url', rel(p));
  log('desktop steps visible', await p.locator('p-steps').isVisible(), '| step labels', JSON.stringify(await p.locator('p-steps li, p-steps [role=tab], p-steps a').allInnerTexts()), '| progress bar visible', await p.locator('[data-testid=progress]').isVisible(), '|', (await p.locator('[data-testid=progress]').innerText()).replace(/\n+/g, ' / ')); await shot(p, `ROL-001-${vp}-step1`);
  await p.locator('[data-testid=next]').click(); await p.waitForTimeout(400); log('s3 Next with empty -> step shown', await p.locator('[data-testid=step-info]').count() ? 'still step1' : 'MOVED', '| errors', JSON.stringify(await p.locator('[role=alert]').allInnerTexts()), '| aria-invalid', await p.locator('[aria-invalid=true]').count()); await shot(p, `ROL-001-${vp}-step1-errors`);
  await p.selectOption('[data-testid=role-system]', { index: 2 }); await p.fill('[data-testid=role-name]', 'QA Role'); await p.fill('[data-testid=role-description]', 'desc 123'); await p.locator('[data-testid=next]').click(); await p.waitForTimeout(500);
  log('s2 Next -> step2', await p.locator('[data-testid=step-menus]').count() > 0, '| progress', (await p.locator('[data-testid=progress]').innerText()).replace(/\n+/g, ' / '), '| title', await p.locator('h1').innerText(), '| sub', await p.locator('.sub').first().innerText().catch(() => '')); await shot(p, `ROL-001-${vp}-step2`);
  await p.locator('[data-testid=next]').click(); await p.waitForTimeout(400); log('step3 reached', await p.locator('[data-testid=step-permissions]').count() > 0, '| Next button on last step', await p.locator('[data-testid=next]').count(), '|', (await p.locator('[data-testid=progress]').innerText()).replace(/\n+/g, ' / ')); await shot(p, `ROL-001-${vp}-step3`);
  await p.locator('[data-testid=back]').click(); await p.locator('[data-testid=back]').click(); await p.waitForTimeout(400);
  log('s2 Back to step1: system', await p.inputValue('[data-testid=role-system]'), 'name', await p.inputValue('[data-testid=role-name]'), 'desc', await p.inputValue('[data-testid=role-description]'));
  // clear name, try clicking step 3 in header (desktop)
  await p.fill('[data-testid=role-name]', ''); await p.locator('[data-testid=next]').click(); await p.waitForTimeout(300); log('clear name + Next -> blocked', await p.locator('[data-testid=step-info]').count() > 0, JSON.stringify(await p.locator('[role=alert]').allInnerTexts()));
  if (vp === 'desktop') { await p.locator('p-steps li, p-steps [role=tab]').nth(2).click({ force: true }).catch(() => {}); await p.waitForTimeout(400); log('click step 3 header while step1 invalid -> on', await p.locator('[data-testid=step-permissions]').count() ? 'step3 (ALLOWED)' : (await p.locator('[data-testid=step-menus]').count() ? 'step2' : 'step1 (blocked)')); }
  await p.fill('[data-testid=role-name]', 'x'.repeat(300)); log('role-name maxlength attr', await p.getAttribute('[data-testid=role-name]', 'maxlength'), 'len', (await p.inputValue('[data-testid=role-name]')).length);
  log('hscroll', await hscroll(p));
  p.reqs.length = 0; await p.locator('[data-testid=cancel]').click(); await p.waitForTimeout(500); log('Cancel ->', rel(p), '| writes', p.reqs.filter((r) => r.method !== 'GET').length);
  await p.context().close();
}
// DEVELOPER/AUDIT cannot open role editor
for (const role of ['DEVELOPER', 'AUDIT']) { const p = await mk('desktop', { role }); await goto(p, `${U}/roles/new`); log(role, '/roles/new ->', rel(p)); }
// demo smoke
for (const vp of ['desktop', 'phone']) {
  const p = await mk(vp, {}, DEMO, 'admin.user'); await goto(p, U); const l = p.locator(vp === 'desktop' ? 'tbody a' : 'a[href*="/roles/1"]:visible').first(); await l.click(); await p.waitForTimeout(900); log(`DEMO ${vp} role view`, rel(p), (await txt(p)).slice(100, 420)); await shot(p, `USR-004-demo-${vp}`);
  await goto(p, U + '#users'); await p.locator(vp === 'desktop' ? 'tbody a' : 'a[href*="/users/"]:visible').first().click(); await p.waitForTimeout(900); log(`DEMO ${vp} user view`, rel(p), (await txt(p)).slice(100, 420)); await shot(p, `USR-005-demo-${vp}`);
  await p.locator('[data-testid=edit-user]').click(); await p.waitForTimeout(900); log(`DEMO ${vp} user edit`, rel(p), await p.locator('[data-testid=changes-text]').innerText()); await shot(p, `USR-007-demo-${vp}`);
  await p.context().close();
}
await b.close();
