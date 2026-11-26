// Shared helpers for QA round 3 (2026-11-26). Run with CHROME_BIN set; servers: demo :4300, production :4301.
import { createRequire } from 'node:module';
// playwright-core is not a repo dependency; point PW_CORE at an installed copy (QA used 1.50.0).
const { chromium } = createRequire(import.meta.url)(process.env.PW_CORE || 'playwright-core');
import fs from 'node:fs';
export const OUT = '/home/user/client-new-uam/docs/qa/results/2026-11-26-round3-screenshots';
fs.mkdirSync(OUT, { recursive: true });
export const DEMO = 'http://localhost:4300';
export const PROD = 'http://localhost:4301';
export const launch = () => chromium.launch({ executablePath: process.env.CHROME_BIN, args: ['--no-sandbox'] });
export const VPS = { desktop: [1440, 900], phone: [390, 844] };
export async function newPage(browserOrCtx, vp, base) {
  const [w, h] = VPS[vp];
  const c = browserOrCtx.newContext ? await browserOrCtx.newContext({ viewport: { width: w, height: h } }) : browserOrCtx;
  const p = await c.newPage();
  p.base = base; p.ext = []; p.api = [];
  p.on('request', (r) => { const u = r.url(); if (!u.startsWith(base) && !u.startsWith('data:')) p.ext.push(u); });
  return p;
}
export async function login(p, user, { path = '/login', wait = 1200 } = {}) {
  await p.goto(p.base + path);
  await p.waitForSelector('#login-username');
  await p.fill('#login-username', user);
  await p.fill('#login-password', 'x');
  await p.click('[data-testid=login-submit]');
  await p.waitForTimeout(wait);
}
export const shot = (p, n) => p.screenshot({ path: `${OUT}/${n}.png` });
export const spa = (p, path) => p.evaluate((x) => { history.pushState({}, '', x); dispatchEvent(new PopStateEvent('popstate')); }, path);
export const body = async (p) => (await p.locator('body').innerText()).replace(/\n+/g, ' | ');
export const rel = (p) => p.url().replace(p.base, '');
export const hscroll = (p) => p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
export const goto = async (p, path, wait = 800) => { await p.goto(p.base + path); await p.waitForTimeout(wait); };
