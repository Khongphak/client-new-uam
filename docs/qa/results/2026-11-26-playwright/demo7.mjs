import {launch,ctx,shot,BASE} from './lib.mjs';
const b=await launch();
for(const [vp,w,h] of [['desktop',1440,900],['phone',390,844]]){
 const p=await ctx(b,w,h);await p.goto(BASE+'/login');await p.fill('#login-username','admin.user');await p.fill('#login-password','secret');
 const t=p.locator('[data-testid=login-password-toggle]');const st=async n=>console.log(vp,n,await p.getAttribute('#login-password','type'),await t.getAttribute('aria-label'),await t.getAttribute('aria-pressed'));
 await st('initial');await t.click();await p.waitForTimeout(300);await st('after click1');await shot(p,`AUT-003-${vp}-shown`);await t.click();await p.waitForTimeout(300);await st('after click2');await p.close();}
await b.close();
