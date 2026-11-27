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

// ===== TC-USR-007 / 008 / 012 user edit
for (const vp of ['desktop', 'phone']) {
  log(`\n######## ${vp} — TC-USR-007/008/012 Edit user`);
  const p = await mk(vp); await goto(p, `${U}/users/1/edit`, 1200);
  const tabs = await p.locator('[role=tab], [data-testid^=tab-]').allInnerTexts(); log('s1 tabs', JSON.stringify(tabs.map((t) => t.replace(/\n+/g, ' '))), '| Save disabled', await p.locator('[data-testid=save]').isDisabled(), '| bar', await p.locator('[data-testid=changes-text]').innerText()); await shot(p, `USR-007-${vp}-edit-initial`);
  const sw = p.locator('[data-testid=switch-active]'); log('switch element html', (await sw.evaluate((e) => e.outerHTML)).slice(0, 220));
  const flip = async (id) => { const e = p.locator(`[data-testid=${id}]`); const tag = await e.evaluate((x) => x.tagName); if (tag === 'U-SWITCH-ROW') await e.locator('button, [role=switch], input').first().click(); else await e.click(); };
  await flip('switch-active'); await p.waitForTimeout(300); log('s2 after toggle Active: Save disabled', await p.locator('[data-testid=save]').isDisabled(), '| bar', await p.locator('[data-testid=changes-text]').innerText()); await shot(p, `USR-007-${vp}-edit-dirty`);
  await flip('switch-active'); await p.waitForTimeout(300); log('s3 toggled back: Save disabled', await p.locator('[data-testid=save]').isDisabled(), '| bar', await p.locator('[data-testid=changes-text]').innerText());
  await flip('switch-admin'); await p.waitForTimeout(200); const c1 = await p.locator('[data-testid=changes-text]').innerText();
  await p.locator('[data-testid=uam-DEVELOPER]').click({ force: true }); await p.waitForTimeout(200); const c2 = await p.locator('[data-testid=changes-text]').innerText(); log('admin switch + role card => bars:', c1, '/', c2);
  await flip('switch-admin'); await p.locator('[data-testid=uam-ADMIN]').click({ force: true }); await p.waitForTimeout(200); log('reverted both => bar', await p.locator('[data-testid=changes-text]').innerText(), '| Save disabled', await p.locator('[data-testid=save]').isDisabled());
  // systems & roles tab
  await p.locator('[data-testid=tab-systems]').click(); await p.waitForTimeout(400); log('systems tab rows', await p.locator('[data-testid=system-row]').count(), '|', (await txt(p, '[role=tabpanel]')).slice(0, 200)); await shot(p, `USR-007-${vp}-edit-systems`);
  await p.locator('[data-testid=add-system]').click(); await p.waitForTimeout(200); log('add row -> rows', await p.locator('[data-testid=system-row]').count(), 'bar', await p.locator('[data-testid=changes-text]').innerText(), '| Save disabled (incomplete row)', await p.locator('[data-testid=save]').isDisabled());
  await p.locator('[data-testid=remove-system]').last().click(); await p.waitForTimeout(200); log('remove the new row -> bar', await p.locator('[data-testid=changes-text]').innerText(), '| Save disabled', await p.locator('[data-testid=save]').isDisabled());
  // s4 preview
  await p.locator('[data-testid=tab-preview]').click(); await p.waitForTimeout(800); log('s4 preview rows', await p.locator('[data-testid=preview-row]').count(), '|', (await txt(p, '[role=tabpanel]')).slice(0, 300)); await shot(p, `USR-007-${vp}-edit-preview`);
  log('hscroll', await hscroll(p));
  if (vp === 'phone') { await p.context().close(); continue; }

  // ---- TC-USR-008 AD lookup (desktop)
  await p.locator('[data-testid=tab-profile]').click(); await p.waitForTimeout(300);
  await p.fill('[data-testid=username]', 'Testuser'); log('lookup enabled', await p.locator('[data-testid=ad-lookup]').isEnabled());
  p.reqs.length = 0; await p.locator('[data-testid=ad-lookup]').click(); await p.waitForTimeout(800);
  log('s1 AD request', JSON.stringify(p.reqs.filter((r) => /search-users/.test(r.path)).map((r) => r.body)), '| status', await p.locator('[data-testid=ad-found]').innerText().catch(() => '(none)'));
  const ro = await p.evaluate(() => ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'].map((id) => { const e = document.getElementById(id); return `${id}=${e.value}${e.readOnly ? '(ro)' : '(EDITABLE)'}`; })); log('s1 AD fields', JSON.stringify(ro), '| approvers', (await p.locator('.approvers').innerText()).replace(/\n+/g, ' | '));
  await p.click('#p1'); await p.keyboard.type('ZZZ'); log('typing into readonly Name -> value', await p.inputValue('#p1')); await shot(p, 'USR-008-desktop-ad-found');
  for (const [label, name, o] of [['not found', 'none-user', {}], ['AD error', 'x', { ad: 'abort' }]]) { const q = await mk(vp, o); await goto(q, `${U}/users/1/edit`, 900); await q.fill('[data-testid=username]', name); await q.locator('[data-testid=ad-lookup]').click(); await q.waitForTimeout(900); log('AD', label, '->', await q.locator('[data-testid=ad-not-found],[data-testid=ad-failed]').first().innerText().catch(() => '(none)'), '| fields', JSON.stringify(await q.evaluate(() => ['p1', 'p5'].map((i) => document.getElementById(i).value)))); await shot(q, `USR-009-desktop-ad-${label.replace(' ', '-')}`); await q.context().close(); }
  // s2 role card + admin switch -> payload
  await p.locator('[data-testid=uam-DEVELOPER]').click({ force: true }); await flip('switch-admin'); await flip('switch-active'); await p.waitForTimeout(300);
  log('s2 selected role', await p.evaluate(() => [...document.querySelectorAll('input[type=radio]')].filter((r) => r.checked).map((r) => r.getAttribute('data-testid') || r.value)), '| bar', await p.locator('[data-testid=changes-text]').innerText()); await shot(p, 'USR-008-desktop-role-admin-selected');
  p.reqs.length = 0; await p.locator('[data-testid=save]').click(); await p.waitForTimeout(1500);
  const put = p.reqs.filter((r) => r.method === 'PUT' && /update-user\/\d+$/.test(r.path)); log('TC-USR-012 PUT', put.length, put[0]?.path); const body_ = put[0]?.body; log('PUT body', JSON.stringify(body_));
  const fxU = fx('add-user.request'); const keys = (o) => Object.keys(o).sort().join(',');
  log('012 top-level keys == fixture?', keys(body_ ?? {}) === keys(fxU), '| missing', Object.keys(fxU).filter((k) => !(k in (body_ ?? {}))).join(','), '| extra', Object.keys(body_ ?? {}).filter((k) => !(k in fxU)).join(','));
  log('012 systemRoles keys', keys(body_?.systemRoles?.[0] ?? {}), 'fixture', keys(fxU.systemRoles[0]), '| types', Object.entries(body_ ?? {}).map(([k, v]) => `${k}:${v === null ? 'null' : typeof v}`).join(' '));
  log('012 values vs loaded record: username', body_?.username, 'fullName', body_?.fullName, 'uamRoleId (DEVELOPER=2)', body_?.uamRoleId, 'isSuperAdmin(was true->flip)', body_?.isSuperAdmin, 'status', body_?.status, 'manager', body_?.manager, 'systemRoles[0].userSystemId (12 echoed)', body_?.systemRoles?.[0]?.userSystemId);
  log('after save url', rel(p), '| toast', JSON.stringify((await p.locator('u-toast').innerText().catch(() => '')).replace(/\n+/g, ' | ')), '| GET list refetched', p.reqs.some((r) => /get-all-users/.test(r.path))); await shot(p, 'USR-012-desktop-after-save');
  // add system row payload (userSystemId null)
  const p2 = await mk(vp); await goto(p2, `${U}/users/1/edit`, 1000); await p2.locator('[data-testid=tab-systems]').click(); await p2.locator('[data-testid=add-system]').click();
  const row = p2.locator('[data-testid=system-row]').last(); const sysSel = row.locator('select').first(); const opts = await sysSel.locator('option').allInnerTexts(); await sysSel.selectOption({ index: 2 }); await p2.waitForTimeout(300);
  const roleSel = row.locator('select').nth(1); const rOpts = await roleSel.locator('option').allInnerTexts(); await roleSel.selectOption({ index: 1 }); await p2.waitForTimeout(300);
  log('add row: system options', opts.length, 'role options', JSON.stringify(rOpts), '| bar', await p2.locator('[data-testid=changes-text]').innerText());
  p2.reqs.length = 0; await p2.locator('[data-testid=save]').click(); await p2.waitForTimeout(1200); const put2 = p2.reqs.find((r) => r.method === 'PUT'); log('012b PUT systemRoles', JSON.stringify(put2?.body?.systemRoles)); await shot(p2, 'USR-012-desktop-add-system-row');
  // remove existing row -> missing from array
  const p3 = await mk(vp); await goto(p3, `${U}/users/1/edit`, 1000); await p3.locator('[data-testid=tab-systems]').click(); await p3.locator('[data-testid=remove-system]').first().click(); const dis = await p3.locator('[data-testid=save]').isDisabled(); log('012c after removing the only existing row: bar', await p3.locator('[data-testid=changes-text]').innerText(), '| Save disabled', dis); p3.reqs.length = 0; await p3.locator('[data-testid=save]').click(); await p3.waitForTimeout(1000); log('012c remove row PUT systemRoles', JSON.stringify(p3.reqs.find((r) => r.method === 'PUT')?.body?.systemRoles), '| url', rel(p3));
  await p.context().close();
}


await b.close();
