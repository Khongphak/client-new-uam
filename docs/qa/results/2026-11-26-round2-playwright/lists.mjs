// TC-SYS-001/002/009, TC-USR-001/002/003 — production build + mock with varied data (:4301) and demo build (:4300)
import { launch, newPage, login, goto, rel, DEMO, PROD, shot, body, hscroll } from './lib.mjs';
import { mock } from './mock2.mjs';
const b = await launch(); const log = (...a) => console.log(...a);
const sess = async (vp, base, o = {}) => { const ctx = await b.newContext({ viewport: { width: vp === 'desktop' ? 1440 : 390, height: vp === 'desktop' ? 900 : 844 } }); const p = await newPage(ctx, vp, base); p.ctx = ctx;
  if (base === PROD) { await mock(p, o); await goto(p, '/login'); await p.fill('#login-username', 'testuser'); await p.fill('#login-password', 'x'); await p.click('[data-testid=login-submit]'); await p.waitForTimeout(1000); } else await login(p, o.user ?? 'admin.user'); return p; };
const counts = (p, ids) => Promise.all(ids.map((i) => p.locator(`[data-testid=count-${i}]`).innerText()));
const heads = (p) => p.locator('table:visible thead th').allInnerTexts().then((a) => a.map((s) => s.trim()));
const footer = (p) => p.locator('.p-paginator-current:visible').first().innerText().catch(() => 'n/a');
const rowsN = (p) => p.locator('table:visible tbody tr').count();

for (const vp of ['desktop', 'phone']) {
  log('\n########## SYSTEM SETTING', vp, '(prod+mock: 23 systems, 12 menus, 3 s2s)');
  const p = await sess(vp, PROD, { role: 'ADMIN' });
  // sidebar navigation to the page (desktop)
  if (vp === 'desktop') { await p.getByText('Setting', { exact: true }).first().click().catch(() => {}); await p.waitForTimeout(300); const l = p.getByText('System Setting', { exact: true }).first(); if (await l.count()) { await l.click(); await p.waitForTimeout(800); } log('SYS nav via sidebar ->', rel(p)); }
  else { await p.getByLabel('Show or hide the menu').click(); await p.waitForTimeout(400); await p.getByText('Setting', { exact: true }).first().click().catch(() => {}); await p.waitForTimeout(300); await p.getByText('System Setting', { exact: true }).first().click().catch(() => {}); await p.waitForTimeout(900); log('SYS nav via drawer ->', rel(p)); }
  if (!rel(p).startsWith('/setting/system-setting')) await goto(p, '/setting/system-setting', 1000);
  const apiBefore = p.calls.length;
  log('SYS-001 s1 tabs/counts:', JSON.stringify(await p.locator('[role=tab]').allInnerTexts()), 'fragment:', rel(p), 'hscroll', await hscroll(p));
  await shot(p, `SYS-001-${vp}-system-tab`);
  for (const t of ['system', 'menu', 'system-to-system']) {
    await p.click(`[data-testid=tab-${t}]`); await p.waitForTimeout(400);
    log(`SYS-001 s2/s3 tab=${t} url=${rel(p)} heads=${JSON.stringify(vp === 'desktop' ? await heads(p) : 'phone-list')} rows=${vp === 'desktop' ? await rowsN(p) : await p.locator('.mob a, .mob li, .mob > *').count()} footer="${await footer(p)}" paginator-pages=${await p.locator('.p-paginator-page:visible').count()}`);
    await shot(p, `SYS-001-${vp}-${t}`);
  }
  log('SYS-001 accessTokenTime column anywhere?', /accessTokenTime|access token/i.test(await body(p)), '(known deviation: not in S2S list answer)');
  // fragment deep link / reload
  await goto(p, '/setting/system-setting#menu', 800); log('SYS fragment #menu active tab:', await p.locator('[role=tab][aria-selected=true]').innerText().then((s) => s.replace(/\n/g, ' ')));
  await p.reload(); await p.waitForTimeout(900); log('SYS reload keeps tab:', await p.locator('[role=tab][aria-selected=true]').innerText().then((s) => s.replace(/\n/g, ' ')), rel(p));
  // SYS-002 on System tab
  await p.click('[data-testid=tab-system]'); await p.waitForTimeout(300);
  const c0 = p.calls.length; const total = await counts(p, ['system', 'menu', 'system-to-system']);
  const search = p.locator('input[type=search]:visible').first();
  await search.fill('System A'); await p.waitForTimeout(400); log('SYS-002 s1 search "System A": footer', await footer(p), 'rows', vp === 'desktop' ? await rowsN(p) : 'n/a', 'counts', await counts(p, ['system', 'menu', 'system-to-system']), '(total was', total, ')');
  await shot(p, `SYS-002-${vp}-search`);
  await search.fill(''); await p.waitForTimeout(300);
  await p.click('[data-testid=filters-btn]'); await p.waitForTimeout(300);
  const labels = await p.locator('.u-filters label').allInnerTexts(); log('SYS-002 s2 filter labels:', JSON.stringify(labels), 'button:', (await p.locator('[data-testid=filters-btn]').innerText()).replace(/\n/g, ' '));
  await shot(p, `SYS-002-${vp}-filters-open`);
  const opts = {}; for (const l of await p.locator('.u-filters select').all()) opts[await l.getAttribute('id')] = await l.locator('option').allInnerTexts(); log('SYS-002 filter options:', JSON.stringify(opts));
  const ids = Object.keys(opts);
  const owner = ids.find((i) => /owner/i.test(i)), type = ids.find((i) => /type/i.test(i)), status = ids.find((i) => /status/i.test(i));
  if (owner) { await p.selectOption('#' + owner, { label: 'Owner Two' }).catch(async () => p.selectOption('#' + owner, opts[owner][1])); await p.waitForTimeout(300); log('SYS-002 s3 one filter: footer', await footer(p)); }
  if (status) { await p.selectOption('#' + status, { label: 'Active' }); await p.waitForTimeout(300); log('SYS-002 s3 owner+status: footer', await footer(p), 'filter btn:', (await p.locator('[data-testid=filters-btn]').innerText()).replace(/\n/g, ' ')); }
  await shot(p, `SYS-002-${vp}-two-filters`);
  await p.click('[data-testid=reset-btn]'); await p.waitForTimeout(300); log('SYS-002 s4 after Reset: footer', await footer(p), 'search value', JSON.stringify(await search.inputValue()), 'filter btn:', (await p.locator('[data-testid=filters-btn]').innerText()).replace(/\n/g, ' '), 'reset visible', await p.locator('[data-testid=reset-btn]').count());
  log('SYS-002 s5 backend requests during search/filter/reset:', p.calls.length - c0, JSON.stringify(p.calls.slice(c0)));
  // no match + paging
  await search.fill('zzzzzz'); await p.waitForTimeout(300); log('SYS no-match:', (await p.locator('[data-testid=empty-result]').innerText().catch(() => 'none'))); await shot(p, `SYS-002-${vp}-no-match`); await search.fill('');
  await p.waitForTimeout(200); const next = p.locator('.p-paginator-next:visible'); if (await next.count()) { await next.click(); await p.waitForTimeout(300); log('SYS paging page2 footer:', await footer(p)); }
  // other tabs filters
  for (const t of ['menu', 'system-to-system']) { await p.click(`[data-testid=tab-${t}]`); await p.waitForTimeout(300); const f = await p.locator('[data-testid=filters-btn]').count(); if (f) { await p.click('[data-testid=filters-btn]'); await p.waitForTimeout(200); } log('SYS filters on tab', t, JSON.stringify(await p.locator('.u-filters label').allInnerTexts())); }
  // list error / empty
  await p.ctx.close();
  { const q = await sess(vp, PROD, { lists: 'empty' }); await goto(q, '/setting/system-setting', 900); log('SYS empty list:', (await q.locator('[data-testid=empty-result]').innerText().catch(() => (body(q))))); await q.ctx.close(); }
  { const q = await sess(vp, PROD, { lists: '50001' }); await goto(q, '/setting/system-setting', 1500); log('SYS 50001 inline error:', (await q.locator('u-state').allInnerTexts()).map((s) => s.replace(/\n+/g, ' | ')), 'dialogs', await q.locator('.p-dialog').count()); await shot(q, `SYS-error-${vp}`); await q.ctx.close(); }

  // SYS-009 DEVELOPER (prod+mock) + demo dev.user
  { const q = await sess(vp, PROD, { role: 'DEVELOPER' }); await goto(q, '/setting/system-setting', 1000); log('SYS-009 s1 DEVELOPER system-setting ->', rel(q), 'add btn enabled?', await q.locator('[data-testid=add-btn]').isEnabled(), '(disabled until SYS-02..04)', 'tabs', JSON.stringify(await q.locator('[role=tab]').allInnerTexts()));
    await shot(q, `SYS-009-${vp}-developer`); await goto(q, '/setting/users-setting', 800); log('SYS-009 s2 DEVELOPER users-setting ->', rel(q)); await shot(q, `SYS-009-${vp}-developer-users-403`); await q.ctx.close(); }
  { const q = await sess(vp, DEMO, { user: 'dev.user' }); await goto(q, '/setting/system-setting', 900); log('SYS-009 demo dev.user:', rel(q), (await q.locator('[role=tab]').allInnerTexts()).map((s) => s.replace(/\n/g, ' ')), '| sidebar items:', vp === 'desktop' ? JSON.stringify((await q.locator('aside a').allInnerTexts()).map((s) => s.trim())) : ''); await q.ctx.close(); }

  log('\n########## USER & PERMISSION', vp);
  const u = await sess(vp, PROD, { role: 'ADMIN' });
  await goto(u, '/setting/users-setting', 1000);
  log('USR-001 s1 tabs:', JSON.stringify(await u.locator('[role=tab]').allInnerTexts()), 'url', rel(u), 'active', await u.locator('[role=tab][aria-selected=true]').innerText().then((s) => s.replace(/\n/g, ' ')), 'hscroll', await hscroll(u));
  await shot(u, `USR-001-${vp}-roles`);
  log('USR-001 s2 Roles heads:', JSON.stringify(vp === 'desktop' ? await heads(u) : '(phone list)'), 'footer', await footer(u), 'sample row:', vp === 'desktop' ? (await u.locator('table:visible tbody tr').first().innerText()).replace(/\s+/g, ' ') : (await u.locator('[data-testid=roles-list]').innerText()).replace(/\n+/g, ' | ').slice(0, 300));
  await u.click('[data-testid=tab-users]'); await u.waitForTimeout(500);
  log('USR-001 s3 url', rel(u), 'Users heads:', JSON.stringify(vp === 'desktop' ? await heads(u) : '(phone list)'), 'footer', await footer(u), 'sample:', vp === 'desktop' ? (await u.locator('table:visible tbody tr').first().innerText()).replace(/\s+/g, ' ') : (await u.locator('[data-testid=users-list]').innerText()).replace(/\n+/g, ' | ').slice(0, 300));
  await shot(u, `USR-001-${vp}-users`);
  log('USR-001 s3 forbidden words in table text (systems count / Last login / menus count):', /last login|menus?\b.*\d+ menu|\d+ systems|\bsystems\b/i.test(await u.locator('[role=tabpanel]').innerText()) ? await u.locator('[role=tabpanel]').innerText().then((t) => (t.match(/last login|systems/i) || []).join(',')) : 'none');
  // status dot
  const st = await u.locator('u-status').first().evaluate((e) => ({ html: e.innerHTML.slice(0, 300), text: e.innerText, bg: getComputedStyle(e.querySelector('.dot, i, span') ?? e).backgroundColor }));
  log('USR-001 s4 status element:', JSON.stringify(st));
  // USR-003 fragment
  const rt = await u.locator('[data-testid=tab-roles]').getAttribute('href'); log('tab hrefs', rt, await u.locator('[data-testid=tab-users]').getAttribute('href'));
  log('USR-003 s1 users tab url:', rel(u)); await u.reload(); await u.waitForTimeout(1000); log('USR-003 s2 after reload tab:', await u.locator('[role=tab][aria-selected=true]').innerText().then((s) => s.replace(/\n/g, ' ')), rel(u));
  await goto(u, '/setting/users-setting#roles', 900); log('USR-003 s3 #roles active:', await u.locator('[role=tab][aria-selected=true]').innerText().then((s) => s.replace(/\n/g, ' ')));
  await goto(u, '/setting/users-setting#users', 900); log('#users active:', await u.locator('[role=tab][aria-selected=true]').innerText().then((s) => s.replace(/\n/g, ' ')));
  await goto(u, '/setting/users-setting#bogus', 900); log('#bogus active:', await u.locator('[role=tab][aria-selected=true]').innerText().then((s) => s.replace(/\n/g, ' ')), rel(u));
  await u.goBack(); await u.waitForTimeout(500); log('history back ->', rel(u), await u.locator('[role=tab][aria-selected=true]').innerText().then((s) => s.replace(/\n/g, ' ')));
  // USR-002 filters on Users tab
  await goto(u, '/setting/users-setting#users', 900); const c1 = u.calls.length;
  await u.click('[data-testid=filters-btn]'); await u.waitForTimeout(300);
  const uo = {}; for (const l of await u.locator('.u-filters select').all()) uo[await l.getAttribute('id')] = await l.locator('option').allInnerTexts(); log('USR-002 filters:', JSON.stringify(uo), 'tab counts', JSON.stringify(await u.locator('[role=tab]').allInnerTexts()));
  await shot(u, `USR-002-${vp}-filters-open`);
  const fi = Object.keys(uo); const dep = fi.find((i) => /depart/i.test(i)), role = fi.find((i) => /role/i.test(i)), stat = fi.find((i) => /status/i.test(i));
  await u.selectOption('#' + dep, { label: 'Claims' }); await u.waitForTimeout(300); log('USR-002 dept=Claims footer', await footer(u));
  await u.selectOption('#' + role, { label: 'ADMIN' }); await u.waitForTimeout(300); log('USR-002 +UAM role=ADMIN footer', await footer(u), 'empty?', await u.locator('[data-testid=no-match]').count());
  await u.selectOption('#' + stat, { label: 'Active' }); await u.waitForTimeout(300); log('USR-002 +status=Active footer', await footer(u), 'filter btn', (await u.locator('[data-testid=filters-btn]').innerText()).replace(/\n/g, ' '), 'tab counts', JSON.stringify(await u.locator('[role=tab]').allInnerTexts()));
  await shot(u, `USR-002-${vp}-three-filters`);
  await u.click('[data-testid=reset-btn]'); await u.waitForTimeout(300); log('USR-002 reset footer', await footer(u), 'btn', (await u.locator('[data-testid=filters-btn]').innerText()).replace(/\n/g, ' '));
  log('USR-002 backend requests during filter/reset:', u.calls.length - c1);
  await u.locator('input[type=search]:visible').first().fill('zzzz'); await u.waitForTimeout(300); log('USR no-match text:', await u.locator('[data-testid=no-match]').innerText().catch(() => 'none')); await shot(u, `USR-no-match-${vp}`);
  // role tab filters + search
  await u.ctx.close();
  { const q = await sess(vp, PROD, { lists: '50001' }); await goto(q, '/setting/users-setting', 1500); log('USR 50001:', (await q.locator('[data-testid=load-error]').allInnerTexts()).map((s) => s.replace(/\n+/g, ' | ')), 'dialogs', await q.locator('.p-dialog').count()); await shot(q, `USR-error-${vp}`); await q.ctx.close(); }
  { const q = await sess(vp, PROD, { lists: 'empty' }); await goto(q, '/setting/users-setting', 1000); log('USR empty:', (await q.locator('[data-testid=none-yet]').innerText().catch(() => 'none'))); await q.ctx.close(); }
  // demo build: pages work with demo data
  { const q = await sess(vp, DEMO, { user: 'admin.user' }); await goto(q, '/setting/users-setting#users', 900); log('DEMO users tab footer', await footer(q), 'tabs', JSON.stringify(await q.locator('[role=tab]').allInnerTexts()), 'ext requests', JSON.stringify(q.ext)); await shot(q, `USR-001-${vp}-demo-users`); await q.ctx.close(); }
}
await b.close();
