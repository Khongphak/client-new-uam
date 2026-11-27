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


await b.close();
