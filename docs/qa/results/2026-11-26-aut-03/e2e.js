const { chromium } = require('playwright');
const OUT = process.argv[2];
const env = (data) => ({ status: 'IP-S-0001', statusCode: '20000', message: 'Success', data });
const profile = { userId: 1, userName: 'prod.user', firstName: 'Prod', lastName: 'User', position: 'QA', uamRole: 'ADMIN', systemAdmin: false, userType: 'AD' };
const results = [];
const rec = (build, vp, tc, step, expected, actual, pass) => { results.push({ build, vp, tc, step, expected, actual, pass }); console.log(pass ? 'PASS' : 'FAIL', build, vp, tc, step, '→', actual); };
const path = (p) => new URL(p.url()).pathname + new URL(p.url()).search;

(async () => {
  const browser = await chromium.launch();
  for (const [build, port] of [['demo', 4301], ['prod', 4302]]) {
    for (const [vp, size] of [['desktop1440', { width: 1440, height: 900 }], ['phone390', { width: 390, height: 844 }]]) {
      const base = `http://localhost:${port}`;
      const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: 1 });
      const mock = async (page, isConsent) => {
        if (build !== 'prod') return;
        await page.route('**/v1/**', (r) => {
          const u = r.request().url();
          if (u.includes('auth/login')) return r.fulfill({ json: env({ result: { sessionId: 'sid-1', isConsent, userProfile: profile } }) });
          if (u.includes('get-consent-last-version')) return r.fulfill({ json: env({ id: 1, title: '<p>PDPA</p>', description: '<p>Text</p>', effectiveDate: '2025-01-01T00:00:00' }) });
          if (u.includes('add-user-consent-accept') || u.includes('auth/logout')) return r.fulfill({ json: env(true) });
          if (u.includes('get-userSystems')) return r.fulfill({ json: env([]) });
          return r.fulfill({ json: env([]) });
        });
      };
      const tag = `${build}-${vp}`;
      // TC-AUT-007 / 008-2 : not signed in
      let page = await ctx.newPage(); await mock(page, true);
      for (const u of ['/home', '/report', '/pdpaconsent']) {
        await page.goto(base + u); await page.waitForTimeout(500);
        const p = path(page);
        rec(build, vp, 'TC-AUT-007', `open ${u} signed-out`, '/login', p, p.startsWith('/login'));
      }
      await page.screenshot({ path: `${OUT}/${tag}-signedout-login.png` });
      for (const u of ['/login', '/notfound']) {
        await page.goto(base + u); await page.waitForTimeout(400);
        rec(build, vp, 'TC-AUT-007', `open ${u} public`, u, path(page), path(page) === u);
      }
      // TC-AUT-009 (consent true) + TC-AUT-008 reload
      await page.goto(base + '/home'); await page.waitForTimeout(400);
      await page.fill('[data-testid=login-username]', build === 'demo' ? 'admin.user' : 'prod.user');
      await page.fill('[data-testid=login-password]', 'x');
      await page.click('[data-testid=login-submit]'); await page.waitForTimeout(1200);
      rec(build, vp, 'TC-AUT-009', 'login isConsent=true (returnUrl=/home)', '/home', path(page), path(page) === '/home');
      await page.screenshot({ path: `${OUT}/${tag}-home-after-login.png` });
      await page.reload(); await page.waitForTimeout(1200);
      const shown = await page.locator('[data-testid=shell-topbar]').count();
      rec(build, vp, 'TC-AUT-008', 'reload on /home keeps session', '/home + shell visible', `${path(page)} shell=${shown}`, path(page) === '/home' && shown > 0);
      await page.screenshot({ path: `${OUT}/${tag}-home-after-reload.png` });
      const stored = await page.evaluate(() => JSON.stringify([sessionStorage.getItem('uam.session'), Object.keys(localStorage)]));
      rec(build, vp, 'TC-AUT-008', 'storage holds no sso session id / token', 'no "sid-1"/"demo-session"/token', stored.slice(0, 160), !/sid-1|demo-session|token/i.test(stored));
      // new tab (new context) not signed in
      const ctx2 = await browser.newContext({ viewport: size }); const p2 = await ctx2.newPage();
      await p2.goto(base + '/home'); await p2.waitForTimeout(600);
      rec(build, vp, 'TC-AUT-008', 'new browser context /home', '/login', path(p2), path(p2).startsWith('/login'));
      await ctx2.close();
      await ctx.close();

      // TC-AUT-006 / 009 : consent pending (prod only: demo users are always consented)
      if (build === 'prod') {
        const c = await browser.newContext({ viewport: size }); const pg = await c.newPage(); await mock(pg, false);
        await pg.goto(base + '/report'); await pg.waitForTimeout(400);
        await pg.fill('[data-testid=login-username]', 'prod.user'); await pg.fill('[data-testid=login-password]', 'x');
        await pg.click('[data-testid=login-submit]'); await pg.waitForTimeout(1200);
        rec(build, vp, 'TC-AUT-009', 'login isConsent=false', '/pdpaconsent', path(pg), path(pg).startsWith('/pdpaconsent'));
        await pg.screenshot({ path: `${OUT}/${tag}-consent-pending.png` });
        await pg.goto(base + '/home'); await pg.waitForTimeout(800);
        rec(build, vp, 'TC-AUT-006', 'open /home before consent', '/pdpaconsent', path(pg), path(pg).startsWith('/pdpaconsent'));
        await pg.reload(); await pg.waitForTimeout(800);
        rec(build, vp, 'TC-AUT-006', 'reload on consent page keeps consent page', '/pdpaconsent', path(pg), path(pg).startsWith('/pdpaconsent'));
        await pg.locator('[data-testid=consent-check] input').check(); await pg.click('[data-testid=consent-agree]'); await pg.waitForTimeout(1000);
        rec(build, vp, 'TC-AUT-006', 'accept → returnUrl', '/home', path(pg), path(pg) === '/home');
        await pg.goto(base + '/pdpaconsent'); await pg.waitForTimeout(600);
        rec(build, vp, 'TC-AUT-006', '/pdpaconsent after accepting', '/home', path(pg), path(pg) === '/home');
        await c.close();
      }
    }
  }
  await browser.close();
  require('fs').writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 1));
  const bad = results.filter((r) => !r.pass); console.log(`\n${results.length - bad.length}/${results.length} pass`); process.exit(bad.length ? 1 : 0);
})();
