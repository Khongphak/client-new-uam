// UAM-SYS-02 (#112): TC-SYS-003/004/005 + TC-SYS-009 s1 — production build (:4301) + stateful page.route mock; demo build (:4300) for UI-only flows.
import fs from 'node:fs';
import { launch, newPage, login, goto, rel, DEMO, PROD, shot, body, hscroll } from './lib.mjs';
import { mock, loginProd } from './mock3.mjs';
const FX = '/home/user/client-new-uam/src/testing/fixtures/';
const fx = (n) => JSON.parse(fs.readFileSync(FX + n + '.json', 'utf8'));
const b = await launch(); const log = (...a) => console.log(...a);
const SYS = '/setting/system-setting';
const drawer = (p) => p.locator('[data-testid=system-drawer]');
const toastText = (p) => p.locator('u-toast').innerText().catch(() => '');
const open = async (p) => (await drawer(p).count()) > 0 && (await drawer(p).isVisible());
const firstId = async (p) => (await p.locator('tbody tr:visible').count()) ? firstIdDesk(p) : '00000000-0000-4000-8000-000000000900';
const mk = async (vp, o = {}, base = PROD, user = 'testuser') => { const p = await newPage(b, vp, base); if (base === PROD) { await mock(p, o); await loginProd(p, user); } else await login(p, user); return p; };
const openFirst = (p) => p.locator('tbody tr button.link:visible, .m-row:visible').first();
const firstIdDesk = (p) => p.locator('tbody tr').first().getAttribute('data-testid').then((x) => '00000000-0000-4000-8000-' + x.replace('row-', '').padStart(12, '0'));

for (const vp of (process.env.VPS || 'desktop,phone').split(',')) {
  log(`\n######## ${vp} — TC-SYS-003`);
  const p = await mk(vp); await goto(p, SYS);
  const id0 = '00000000-0000-4000-8000-000000000001'; const id0g = '00000000-0000-4000-8000-000000000001'; log('first row id', id0, 'url', rel(p));
  await openFirst(p).click(); await p.waitForTimeout(800);
  log('s1 url', rel(p), '| drawer open', await open(p), '| side/right?', await p.evaluate(() => { const d = document.querySelector('u-drawer [role=dialog], u-drawer aside, u-drawer .drawer, u-drawer > *'); const r = d?.getBoundingClientRect(); return r ? `x=${Math.round(r.x)} w=${Math.round(r.width)} vw=${innerWidth}` : 'no-rect'; }));
  log('s1 drawer text', (await drawer(p).innerText()).replace(/\n+/g, ' | ').slice(0, 300));
  await shot(p, `SYS-003-${vp}-drawer-view`);
  await p.reload(); await p.waitForTimeout(1200); log('s2 after reload url', rel(p), '| drawer open', await open(p), '| same record', (await drawer(p).innerText().catch(() => '')).includes(id0));
  await shot(p, `SYS-003-${vp}-after-reload`);
  await p.goBack(); await p.waitForTimeout(800); log('s3 after Back url', rel(p), '| drawer open', await open(p), '| table rows', await p.locator('tbody tr, .m-row').count());
  await shot(p, `SYS-003-${vp}-after-back`);
  await p.goForward(); await p.waitForTimeout(800); log('Forward -> drawer open', await open(p), rel(p));
  // close via Close button
  await p.locator('[data-testid=drawer-close]').click(); await p.waitForTimeout(600); log('Close btn -> url', rel(p), 'open', await open(p));
  // Esc + scrim
  await openFirst(p).click().catch(() => {}); await p.waitForTimeout(500);
  await p.keyboard.press('Escape'); await p.waitForTimeout(500); log('Esc -> open', await open(p), rel(p));
  // s4 deep link in new tab/context (needs sign-in first -> returnUrl)
  const link = `${SYS}?drawer=system&mode=view&id=${id0}`;
  const ctx = await b.newContext({ viewport: p.viewportSize() }); const q = await newPage(ctx, vp, PROD); await mock(q);
  await goto(q, link, 900); log('s4 new tab deep link unauth ->', rel(q));
  await q.fill('#login-username', 'testuser'); await q.fill('#login-password', 'x'); await q.click('[data-testid=login-submit]'); await q.waitForTimeout(1500);
  log('s4 after login url', rel(q), '| drawer open', await open(q), '| record', (await drawer(q).innerText().catch(() => '')).includes(id0)); await shot(q, `SYS-003-${vp}-deeplink-newtab`);
  // direct deep link with session (same tab full load) + fragment tab
  await goto(q, `${SYS}?drawer=system&mode=edit&id=${id0}#system-setup`, 1200); log('deep link edit mode (same tab, full load) ->', rel(q), 'open', await open(q), 'form fields', await q.locator('[data-field]').count());
  await goto(q, `${SYS}?drawer=system&mode=add#system-setup`, 1200); log('deep link add mode ->', rel(q), 'open', await open(q), 'form fields', await q.locator('[data-field]').count());
  // bad links
  for (const bad of [`?drawer=system&mode=view&id=00000000-0000-4000-8000-0000000000ff`, `?drawer=system&mode=view`, `?drawer=system&mode=bogus&id=${id0}`, `?drawer=menu&mode=view&id=1`]) {
    await goto(q, SYS + bad, 1000); log('bad link', bad, '->', rel(q), '| drawer open', await open(q), '|', (await drawer(q).innerText().catch(() => '(no drawer)')).replace(/\n+/g, ' | ').slice(0, 120), '| table', await q.locator('tbody tr, .m-row').count());
    if (bad.includes('0000000000ff')) await shot(q, `SYS-003-${vp}-deeplink-notfound`);
  }
  await ctx.close();
}

// ---- TC-SYS-004 add / TC-SYS-005 edit (desktop = TC viewport; phone: UI only)
for (const vp of ['desktop', 'phone']) {
  log(`\n######## ${vp} — TC-SYS-004 (add) / TC-SYS-005 (edit)`);
  const p = await mk(vp); await goto(p, SYS);
  const before = (await p.locator('[data-testid=count-system]').innerText().catch(() => '?')); log('counter before', before);
  await p.locator('[data-testid=add-btn]').click(); await p.waitForTimeout(700); log('s1 Add -> url', rel(p), 'open', await open(p), 'fields', await p.locator('[data-field]').count()); await shot(p, `SYS-004-${vp}-add-empty`);
  p.reqs.length = 0; await p.locator('[data-testid=drawer-save]').click(); await p.waitForTimeout(500);
  log('empty Save -> errors', await p.locator('[role=alert]').allInnerTexts(), '| requests', JSON.stringify(p.reqs.filter((r) => r.method !== 'GET').map((r) => r.path))); await shot(p, `SYS-004-${vp}-add-validation`);
  const fill = async (name, type, owner, url, at, rt) => {
    await p.fill('[data-field=systemName]', name); await p.selectOption('[data-field=type]', type); await p.fill('[data-field=ownerName]', owner);
    await p.fill('[data-field=description]', 'Created by QA'); await p.fill('[data-field=url]', url); await p.fill('[data-field=accessTokenTime]', at); await p.fill('[data-field=refreshTokenTime]', rt);
    await p.locator('.ic-opt').nth(1).click();
  };
  await fill('  QA System Z  ', 'Web Application', 'QA Owner', 'https://qa.example.test/', '15', '45'); await shot(p, `SYS-004-${vp}-add-filled`);
  p.reqs.length = 0; await p.locator('[data-testid=drawer-save]').click(); await p.waitForTimeout(1200);
  const post = p.reqs.filter((r) => r.method === 'POST' && /add-system$/.test(r.path)); log('s2 add requests', post.length, JSON.stringify(post[0]?.body));
  const fxAdd = fx('add-system.request'); log('s3 payload keys == fixture keys?', JSON.stringify(Object.keys(post[0]?.body ?? {}).sort()) === JSON.stringify(Object.keys(fxAdd).sort()), 'fixture keys', Object.keys(fxAdd).join(','));
  log('typeof checks', Object.entries(post[0]?.body ?? {}).map(([k, v]) => `${k}:${typeof v}`).join(' '), '| name trimmed(DEV-2)?', post[0]?.body?.systemName === 'QA System Z');
  log('after save: url', rel(p), 'drawer open', await open(p), '| toast', JSON.stringify((await toastText(p)).replace(/\n+/g, ' | ')), '| counter', await p.locator('[data-testid=count-system]').innerText().catch(() => '?'), '| first row', (await p.locator('tbody tr, .m-row').first().innerText()).replace(/\n+/g, ' | ').slice(0, 100));
  await shot(p, `SYS-004-${vp}-after-add`);
  log('GET list refetched after save?', p.reqs.some((r) => r.method === 'GET' && /get-all-systems$/.test(r.path)));
  // edit
  const id1 = await firstId(p); await goto(p, `${SYS}?drawer=system&mode=edit&id=${id1}`, 1000);
  await p.fill('[data-field=systemName]', 'QA System Z renamed'); await p.fill('[data-field=accessTokenTime]', '20');
  p.reqs.length = 0; await p.locator('[data-testid=drawer-save]').click(); await p.waitForTimeout(1200);
  const put = p.reqs.filter((r) => r.method === 'PUT' && /update-system$/.test(r.path)); log('edit PUT', put.length, JSON.stringify(put[0]?.body));
  const fxUp = fx('update-system.request'); log('PUT payload keys == fixture keys?', JSON.stringify(Object.keys(put[0]?.body ?? {}).sort()) === JSON.stringify(Object.keys(fxUp).sort()), 'missing', Object.keys(fxUp).filter((k) => !(k in (put[0]?.body ?? {}))).join(','), 'extra', Object.keys(put[0]?.body ?? {}).filter((k) => !(k in fxUp)).join(','));
  log('after edit save: url', rel(p), 'open', await open(p), '| toast', JSON.stringify((await toastText(p)).replace(/\n+/g, ' | ')), '| first row', (await p.locator('tbody tr, .m-row').first().innerText()).replace(/\n+/g, ' | ').slice(0, 140));
  await shot(p, `SYS-005-${vp}-after-edit`);
  // s2: unsaved close
  await goto(p, `${SYS}?drawer=system&mode=edit&id=${id1}`, 900); await p.fill('[data-field=systemName]', 'DIRTY CHANGE'); p.reqs.length = 0;
  await p.locator('[data-testid=drawer-cancel]').click(); await p.waitForTimeout(600); log('s2 Cancel with unsaved change -> open', await open(p), 'dialog?', await p.locator('[role=alertdialog], [role=dialog]:not([data-testid=system-drawer])').count(), 'url', rel(p), 'writes', p.reqs.filter((r) => r.method !== 'GET').length);
  await shot(p, `SYS-005-${vp}-cancel-dirty`);
  // Active toggle edit
  await goto(p, `${SYS}?drawer=system&mode=edit&id=${id1}`, 900); await p.locator('u-switch-row button, u-switch-row [role=switch], u-switch-row input').first().click().catch((e) => log('switch click err', e.message.slice(0, 60)));
  p.reqs.length = 0; await p.locator('[data-testid=drawer-save]').click(); await p.waitForTimeout(1000); log('toggle Active -> PUT status', JSON.stringify(p.reqs.filter((r) => r.method === 'PUT').map((r) => r.body?.status)));
  // errors
  for (const [label, o, id] of [['40301 duplicate', { saveFail: '40301' }], ['50001', { saveFail: '50001' }]]) {
    const q = await mk(vp, o); await goto(q, SYS); await q.locator('[data-testid=add-btn]').click(); await q.waitForTimeout(500);
    await q.fill('[data-field=systemName]', 'Dup'); await q.selectOption('[data-field=type]', 'API'); await q.fill('[data-field=ownerName]', 'O'); await q.fill('[data-field=url]', 'https://x.test'); await q.fill('[data-field=accessTokenTime]', '10'); await q.fill('[data-field=refreshTokenTime]', '20'); await q.locator('.ic-opt').first().click();
    await q.locator('[data-testid=drawer-save]').click(); await q.waitForTimeout(1000);
    log(label, '-> drawer open', await open(q), '| banner', JSON.stringify(await q.locator('[data-testid=drawer-banner]').innerText().catch(() => '(none)')), '| dialog', JSON.stringify((await q.locator('[role=alertdialog], p-dialog, [role=dialog]').allInnerTexts()).map((t) => t.replace(/\n+/g, ' | ').slice(0, 90))), '| toast', JSON.stringify((await toastText(q)).slice(0, 60)));
    await shot(q, `SYS-004-${vp}-error-${label.split(' ')[0]}`); await q.context().close();
  }
  log('hscroll', await hscroll(p));
  await p.context().close();
}

// ---- TC-SYS-009 s1 DEVELOPER add/edit; s2 403
for (const vp of ['desktop']) {
  log(`\n######## ${vp} — TC-SYS-009`);
  const p = await mk(vp, { role: 'DEVELOPER' }); await goto(p, SYS);
  log('Add button enabled?', await p.locator('[data-testid=add-btn]').isEnabled(), '| nav', (await p.locator('[data-testid=shell-nav]').innerText()).replace(/\n+/g, ' | '));
  await p.locator('[data-testid=add-btn]').click(); await p.waitForTimeout(500);
  await p.fill('[data-field=systemName]', 'Dev System'); await p.selectOption('[data-field=type]', 'API'); await p.fill('[data-field=ownerName]', 'Dev'); await p.fill('[data-field=url]', 'https://dev.test'); await p.fill('[data-field=accessTokenTime]', '10'); await p.fill('[data-field=refreshTokenTime]', '20'); await p.locator('.ic-opt').first().click();
  p.reqs.length = 0; await p.locator('[data-testid=drawer-save]').click(); await p.waitForTimeout(1000);
  log('s1 DEVELOPER add ->', 'POST', p.reqs.filter((r) => r.method === 'POST').length, 'toast', JSON.stringify((await toastText(p)).slice(0, 60)), 'open', await open(p)); await shot(p, 'SYS-009-desktop-developer-add');
  const id1 = await firstId(p); await goto(p, `${SYS}?drawer=system&mode=edit&id=${id1}`); await p.fill('[data-field=systemName]', 'Dev renamed'); p.reqs.length = 0; await p.locator('[data-testid=drawer-save]').click(); await p.waitForTimeout(1000);
  log('s1 DEVELOPER edit -> PUT', p.reqs.filter((r) => r.method === 'PUT').length, 'toast', JSON.stringify((await toastText(p)).slice(0, 60)));
  await goto(p, '/setting/users-setting'); log('s2 DEVELOPER /setting/users-setting ->', rel(p), (await body(p)).slice(-80)); await shot(p, 'SYS-009-desktop-developer-users-403');
}
// AUDIT/USER deep link to drawer
for (const role of ['AUDIT', 'USER']) { const p = await mk('desktop', { role }); await goto(p, `${SYS}?drawer=system&mode=add`); log(role, 'deep link add ->', rel(p)); }
await b.close();
