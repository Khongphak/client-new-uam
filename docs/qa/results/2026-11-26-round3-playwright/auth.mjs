// TC-AUT-006/007/008/009 + regression AUT-001/002/003/004/005, BUG-1 — production build (:4301) + mocked API.
import { launch, newPage, PROD, DEMO, goto, body, shot, rel, spa, hscroll } from './lib.mjs';
import { mock } from './mock2.mjs';
const b = await launch();
const log = (...a) => console.log(...a);
const doLogin = async (p, user = 'testuser') => { await p.fill('#login-username', user); await p.fill('#login-password', 'x'); await p.click('[data-testid=login-submit]'); await p.waitForTimeout(1200); };
const fresh = async (vp, o = {}, base = PROD) => { const ctx = await b.newContext({ viewport: { width: vp === 'desktop' ? 1440 : 390, height: vp === 'desktop' ? 900 : 844 } }); const p = await newPage(ctx, vp, base); await mock(p, o); p.ctx = ctx; return p; };

for (const vp of ['desktop', 'phone']) {
  log('\n######', vp);
  // --- AUT-007 s1/s2 (no session)
  { const p = await fresh(vp);
    for (const path of ['/home', '/setting/system-setting', '/setting/users-setting', '/report', '/pdpaconsent', '/home?x=1', '/']) { await goto(p, path); log('AUT-007 s1', path, '->', rel(p)); }
    await shot(p, `AUT-007-${vp}-home-to-login`);
    for (const path of ['/login', '/notfound', '/forbidden', '/zzz']) { await goto(p, path); log('AUT-007 s2', path, '->', rel(p), (await body(p)).slice(0, 80)); }
    // SPA (in-app) navigation without session
    await goto(p, '/login'); for (const path of ['/home', '/report', '/pdpaconsent']) { await spa(p, path); await p.waitForTimeout(500); log('AUT-007 spa', path, '->', rel(p)); await spa(p, '/login'); await p.waitForTimeout(300); }
    log('API calls while unauthenticated (should be none to data endpoints):', JSON.stringify(p.calls)); await p.ctx.close(); }

  // --- AUT-009 + AUT-006: isConsent=false
  { const p = await fresh(vp, { consent: false });
    await goto(p, '/login'); await doLogin(p);
    log('AUT-009 s1 login isConsent=false ->', rel(p)); await shot(p, `AUT-009-${vp}-consent-after-login`);
    for (const path of ['/home', '/report', '/setting/system-setting', '/setting/users-setting']) { await goto(p, path); log('AUT-006 s1 direct', path, '->', rel(p), '| has Welcome:', /Welcome/.test(await body(p))); }
    await shot(p, `AUT-006-${vp}-home-to-consent`);
    for (const path of ['/home', '/report']) { await spa(p, path); await p.waitForTimeout(600); log('AUT-006 spa', path, '->', rel(p)); }
    await goto(p, '/pdpaconsent'); log('consent page still shown:', rel(p), (await body(p)).slice(0, 120));
    await goto(p, '/pdpaconsent?returnUrl=//evil.test'); log('consent returnUrl=//evil.test ->', rel(p));
    // AUT-004 regression: tick + agree -> /home (consent state updated in session so guard lets through)
    await goto(p, '/pdpaconsent'); await p.locator('input[type=checkbox], .p-checkbox').first().click().catch(() => {}); const agree = p.getByRole('button', { name: /agree and continue/i }); log('agree enabled after tick:', await agree.isEnabled());
    await agree.click(); await p.waitForTimeout(1200); log('AUT-004 s4 agree ->', rel(p), '| Welcome:', /Welcome/.test(await body(p)));
    await shot(p, `AUT-004-${vp}-after-agree`);
    await goto(p, '/home'); log('after consent reload /home ->', rel(p)); await p.ctx.close(); }
  { const p = await fresh(vp, { consent: false });
    await goto(p, '/login'); await doLogin(p); // returnUrl + consent
    await goto(p, '/report'); log('AUT-006 returnUrl carried:', rel(p));
    // AUT-005 regression: decline
    await goto(p, '/pdpaconsent'); await p.getByRole('button', { name: /decline/i }).click(); await p.waitForTimeout(500);
    log('AUT-005 s1 dialog:', (await p.locator('.p-dialog').allInnerTexts()).map((s) => s.replace(/\n+/g, ' | ')));
    await shot(p, `AUT-005-${vp}-decline-dialog`);
    await p.getByRole('button', { name: /go back/i }).click(); await p.waitForTimeout(400); log('AUT-005 s2 go back ->', rel(p));
    await p.getByRole('button', { name: /decline/i }).click(); await p.waitForTimeout(400); await p.getByRole('button', { name: /decline and sign out/i }).click(); await p.waitForTimeout(1000);
    log('AUT-005 s3 sign out ->', rel(p), 'calls logout:', p.calls.some((c) => c.includes('logout')));
    log('after sign out, sessionStorage keys:', JSON.stringify(await p.evaluate(() => Object.keys(sessionStorage))));
    await goto(p, '/home'); log('after sign-out /home ->', rel(p)); await p.ctx.close(); }

  // --- AUT-009 s2 consent=true
  { const p = await fresh(vp, { consent: true });
    await goto(p, '/login'); await doLogin(p); log('AUT-009 s2 login isConsent=true ->', rel(p), '| cards:', await p.locator('a[target=_blank]').count());
    await shot(p, `AUT-009-${vp}-home-after-login`);
    // AUT-009 s3 consent guard (no session) done above; consent page with consented user:
    await goto(p, '/pdpaconsent'); log('consented user opens /pdpaconsent ->', rel(p));
    // --- AUT-008 s1 reload
    await goto(p, '/home'); log('AUT-008 s1 before reload', rel(p)); await p.reload(); await p.waitForTimeout(1500);
    log('AUT-008 s1 after reload ->', rel(p), '| Welcome:', /Welcome/.test(await body(p)), '| cards:', await p.locator('a[target=_blank]').count(), '| topbar:', (await p.locator('header').first().innerText()).replace(/\n+/g, ' | '));
    await shot(p, `AUT-008-${vp}-after-reload-home`);
    for (const path of ['/report', '/setting/system-setting']) { await goto(p, path, 1200); log('AUT-008 reload/deep-link', path, '->', rel(p)); }
    const keys = await p.evaluate(() => ({ s: Object.fromEntries(Object.entries(sessionStorage).map(([k, v]) => [k, v.slice(0, 300)])), l: Object.keys(localStorage), c: document.cookie }));
    log('storage after login:', JSON.stringify(keys));
    log('API requests across reload:', JSON.stringify(p.calls));
    // login page when already logged in
    await goto(p, '/login'); log('signed-in user opens /login ->', rel(p));
    // logout then reload
    await goto(p, '/home'); await p.locator('header button, header [role=button]').last().click().catch(() => {}); await p.waitForTimeout(300);
    const lo = p.getByText('Logout', { exact: true }); if (await lo.count()) { await lo.first().click(); await p.waitForTimeout(1000); }
    log('after logout ->', rel(p)); await goto(p, '/home'); log('AUT-008 after logout reload /home ->', rel(p));
    await p.ctx.close(); }
  // --- AUT-008 s2 new tab, no session (new context)
  { const p = await fresh(vp, { consent: true }); await goto(p, '/home'); log('AUT-008 s2 new tab /home ->', rel(p)); await shot(p, `AUT-008-${vp}-newtab-login`); await p.ctx.close(); }
  // new tab in SAME context (sessionStorage is per tab)
  { const p = await fresh(vp, { consent: true }); await goto(p, '/login'); await doLogin(p); const p2 = await p.ctx.newPage(); await p2.goto(PROD + '/home'); await p2.waitForTimeout(1200); log('AUT-008 s2b second tab same browser /home ->', p2.url().replace(PROD, '')); await p.ctx.close(); }

  // --- AUT-001/002/003 regression + returnUrl
  { const p = await fresh(vp, { loginFail: 'envelope' });
    await goto(p, '/login'); await doLogin(p); log('AUT-002 envelope 40101 ->', rel(p), '|', (await p.locator('[role=alert]').allInnerTexts()).join('/'), '| invalid:', await p.locator('.p-invalid').count()); await shot(p, `AUT-002-${vp}-error`); await p.ctx.close(); }
  { const p = await fresh(vp, { consent: true });
    await goto(p, '/report'); log('returnUrl: unauth /report ->', rel(p)); await doLogin(p); log('returnUrl: after login ->', rel(p)); await p.ctx.close(); }
  { const p = await fresh(vp, { consent: true });
    await goto(p, '/login?returnUrl=//evil.test'); await doLogin(p); log('open-redirect //evil.test after login ->', rel(p)); await p.ctx.close(); }
  { const p = await fresh(vp, { consent: true });
    await goto(p, '/login?returnUrl=https://evil.test/x'); await doLogin(p); log('open-redirect https://evil.test after login ->', rel(p)); await p.ctx.close(); }
  { const p = await fresh(vp, { consent: true });
    await goto(p, '/login'); await p.fill('#login-password', 'secret'); const t0 = await p.getAttribute('#login-password', 'type'); await p.locator('button[aria-pressed]').click(); const t1 = await p.getAttribute('#login-password', 'type'); log('AUT-003 type', t0, '->', t1, 'hscroll', await hscroll(p)); await p.ctx.close(); }
}

// --- BUG-1 recheck (production + mock): Home resource fails; dialog without interaction?
for (const home of ['abort', '40102', '50000']) {
  const p = await fresh('desktop', { home }); await goto(p, '/login'); await doLogin(p); await p.waitForTimeout(1500);
  const before = await p.locator('.p-dialog').count(); await p.mouse.click(700, 500); await p.waitForTimeout(600);
  log('BUG-1 home', home, 'dialogs before interaction:', before, 'after click:', await p.locator('.p-dialog').count(), '| url', rel(p), '| body:', (await body(p)).slice(0, 160));
  if (home === 'abort') await shot(p, 'BUG-1-desktop-home-abort'); await p.ctx.close();
}
{ const p = await fresh('desktop', { home: 'abort' }); await goto(p, '/login'); await doLogin(p); await shot(p, 'BUG-1-desktop-before-interaction');
  await p.reload(); await p.waitForTimeout(2000); log('BUG-1 after reload with failing API: dialogs', await p.locator('.p-dialog').count(), rel(p)); await p.ctx.close(); }
// session expired (40102) on page load after reload
{ const p = await fresh('desktop', { home: '40102' }); await goto(p, '/login'); await doLogin(p); await p.mouse.click(700, 500); await p.waitForTimeout(800); log('40102 dialog:', await p.locator('.p-dialog').allInnerTexts()); await p.getByRole('button', { name: /log in again/i }).click(); await p.waitForTimeout(800); log('after Log in again ->', rel(p), JSON.stringify(await p.evaluate(() => Object.keys(sessionStorage)))); await goto(p, '/home'); log('then /home ->', rel(p)); await p.ctx.close(); }
await b.close();
