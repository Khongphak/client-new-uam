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

// ===== TC-USR-004 role view
for (const vp of ['desktop', 'phone']) {
  log(`\n######## ${vp} — TC-USR-004 Role details`);
  const p = await mk(vp, { roleMenu: 'rich' }); await goto(p, U);
  const link = p.locator(vp === 'desktop' ? 'tbody a' : 'a[href*="/roles/1"]:visible').first();
  log('s1 click role name; href', await link.getAttribute('href')); await link.click(); await p.waitForTimeout(1200); log('url', rel(p));
  log('s1 page text', (await txt(p)).slice(0, 1200)); await shot(p, `USR-004-${vp}-role-view`);
  const stat = await p.evaluate(() => [...document.querySelectorAll('[class*=stat]')].map((e) => e.innerText.replace(/\n+/g, ' ')).slice(0, 6)); log('stat elements', JSON.stringify(stat));
  const t = await txt(p); log('s2 stats expected Menus 5 / Groups 2 / Top level 2; page says:', (t.match(/(\d+) \| Menus \| (\d+) \| Groups \| (\d+) \| Top level/) || t.match(/.{0,60}Top level.{0,10}/) || [])[0]);
  log('s2 summary sentence', (t.match(/\d+ top-level menus[^|]*/) || [])[0]);
  log('read-only: inputs/checkboxes/switches in tree', await p.locator('main input, main select, main textarea, main [role=switch]').count(), '| icons in info list', await p.locator('u-facts i.pi, u-facts svg, u-facts img').count(), '| hscroll', await hscroll(p));
  const crossed = await p.evaluate(() => [...document.querySelectorAll('*')].filter((e) => getComputedStyle(e).textDecorationLine.includes('line-through') && e.children.length === 0).map((e) => e.innerText.trim())); log('crossed-out functions', JSON.stringify(crossed));
  log('buttons/links on page', JSON.stringify(await p.locator('main a, main button').allInnerTexts()), '| Edit role present?', (await p.getByText(/Edit role/i).count()) > 0);
  // collapsible groups?
  const toggles = await p.locator('main [aria-expanded]').count(); log('expand toggles', toggles);
  if (vp === 'desktop') {
    await p.goBack(); await p.waitForTimeout(500); log('Back ->', rel(p));
    const q = await mk(vp, { roleMenu: 'empty' }); await goto(q, `${U}/roles/100`); log('role with null menus ->', (await txt(q)).slice(0, 400)); await shot(q, 'USR-004-desktop-role-nomenus');
    const q2 = await mk(vp, {}); await goto(q2, `${U}/roles/99999`); log('unknown role ->', (await txt(q2)).slice(-160), q2.url()); await shot(q2, 'USR-004-desktop-role-notfound');
    const q3 = await mk(vp, { roleMenu: '50001' }); await goto(q3, `${U}/roles/100`); log('menus 50001 ->', (await txt(q3)).slice(-300)); await shot(q3, 'USR-004-desktop-role-menus-error');
    const q4 = await mk(vp, { role: 'DEVELOPER' }); await goto(q4, `${U}/roles/100`); log('DEVELOPER role view ->', rel(q4));
  }
  await p.context().close();
}

// ===== TC-USR-005 user view
for (const vp of ['desktop', 'phone']) {
  log(`\n######## ${vp} — TC-USR-005 User details`);
  const p = await mk(vp); await goto(p, U + '#users');
  const link = p.locator(vp === 'desktop' ? 'tbody a' : 'a[href*="/users/"]:visible').first(); log('s1 href', await link.getAttribute('href')); await link.click(); await p.waitForTimeout(1200); log('url', rel(p));
  log('page text', (await txt(p)).slice(0, 1500)); await shot(p, `USR-005-${vp}-user-view`);
  const cards = await p.evaluate(() => [...document.querySelectorAll('section.card')].map((e) => { const r = e.getBoundingClientRect(); return `${e.getAttribute('aria-label')}: x=${Math.round(r.x)} y=${Math.round(r.y)} w=${Math.round(r.width)}`; })); log('cards layout', JSON.stringify(cards));
  const ap = p.locator('section[aria-label=Approvers]'); log('s2 Approvers text', (await ap.innerText()).replace(/\n+/g, ' | '), '| inputs', await ap.locator('input, select, textarea, button').count(), '| hscroll', await hscroll(p));
  log('Edit user link', await p.locator('[data-testid=edit-user]').getAttribute('href'), '| Export?', (await p.getByText(/Export/i).count()), '| systems section', (await txt(p)).match(/Systems and roles \(\d+\)[^|]*\|[^|]*\|[^|]*/)?.[0]);
  await p.locator('[data-testid=edit-user]').click(); await p.waitForTimeout(900); log('Edit user ->', rel(p));
  if (vp === 'desktop') {
    const q = await mk(vp, { manager: '[]', noSystems: true }); await goto(q, `${U}/users/2`); log('no managers, no systems ->', (await txt(q)).slice(-420)); await shot(q, 'USR-005-desktop-user-nomgr');
    const q2 = await mk(vp); await goto(q2, `${U}/users/99999`); log('unknown user ->', (await txt(q2)).slice(-140)); await shot(q2, 'USR-005-desktop-user-notfound');
    const q3 = await mk(vp, { role: 'DEVELOPER' }); await goto(q3, `${U}/users/1`); log('DEVELOPER user view ->', rel(q3));
  }
  await p.context().close();
}

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
  const p3 = await mk(vp); await goto(p3, `${U}/users/1/edit`, 1000); await p3.locator('[data-testid=tab-systems]').click(); await p3.locator('[data-testid=remove-system]').first().click(); p3.reqs.length = 0; await p3.locator('[data-testid=save]').click(); await p3.waitForTimeout(1000); log('012c remove row PUT systemRoles', JSON.stringify(p3.reqs.find((r) => r.method === 'PUT')?.body?.systemRoles), '| Save disabled?', await p3.locator('[data-testid=save]').isDisabled());
  await p.context().close();
}

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
