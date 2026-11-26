import {launch,ctx,login,txt,shot,spa,BASE} from './lib.mjs';
const b=await launch();const log=(...a)=>console.log(...a);
// RSP-001 + HOM-001 + SHL-02 phone
for(const [vp,w,h] of [['phone',390,844],['tablet',768,900],['desktop',1440,900]]){
 const p=await ctx(b,w,h);await login(p,'admin.user');
 const sb=p.locator('#shell-sidebar');const bb=await sb.boundingBox();const hd=await p.locator('header').first().boundingBox();
 log('RSP-001',vp,'sidebar box',bb&&{x:bb.x,w:bb.width},'visible',await sb.isVisible(),'header h',hd&&hd.height,'hscroll',await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
 const tog=p.locator('header button').first();log(' toggle:',await tog.evaluate(e=>[e.getAttribute('aria-label'),e.getAttribute('aria-expanded'),e.getAttribute('aria-controls'),e.offsetParent!==null]));
 await shot(p,`RSP-001-${vp}-1-initial`);
 if(vp==='phone'){await tog.click();await p.waitForTimeout(500);const bb2=await sb.boundingBox();log(' after toggle sidebar',bb2&&{x:bb2.x,w:bb2.width},await sb.isVisible(),'nav:',(await p.locator('nav a').allInnerTexts()).map(s=>s.trim()));await shot(p,'RSP-001-phone-2-drawer-open');
  await p.keyboard.press('Escape');await p.waitForTimeout(400);log(' after Esc sidebar x',(await sb.boundingBox())?.x);
  await tog.click();await p.waitForTimeout(400);await p.locator('nav a',{hasText:'Report'}).click();await p.waitForTimeout(600);log(' after pick Report: url',p.url().replace(BASE,''),'sidebar x',(await sb.boundingBox())?.x);await shot(p,'RSP-001-phone-3-report-after-nav');
 }
 await p.close();
}
// HOM-001
for(const [vp,w,h] of [['desktop',1440,900],['phone',390,844]]){
 const p=await ctx(b,w,h);await login(p,'admin.user');
 const card=p.locator('a[href]').filter({hasText:'Example System A'}).first();
 log('HOM-001',vp,'card text:',(await card.innerText()).replace(/\n+/g,' | '),'attrs',await card.evaluate(e=>[e.getAttribute('href'),e.getAttribute('target'),e.getAttribute('rel')]),'img/icon:',await card.locator('img,i').count(),'hscroll',await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
 const all=await txt(p);log(' role?',/role/i.test(all.replace(/ADMIN/,'')),'maintenance?',/maintenance/i.test(all));
 await shot(p,`HOM-001-${vp}`);
 const [pg]=await Promise.all([p.context().waitForEvent('page',{timeout:3000}).catch(()=>null),card.click()]);
 log(' click ->',pg?pg.url():'no new page','calls to external?',p.reqs);
 await p.close();
}
// logout menu + topbar
{const p=await ctx(b,1440,900);await login(p,'admin.user');
 const trig=p.locator('[data-user-menu] button, header button').last();
 await trig.click();await p.waitForTimeout(300);log('user menu items:',await p.locator('[role=menu] *, [data-user-menu] *').allInnerTexts().then(a=>a.filter(Boolean)));await shot(p,'RBAC-001-desktop-user-menu');
 const lo=p.getByText(/log ?out|sign ?out/i).first();log('logout visible',await lo.isVisible().catch(()=>false));
 await lo.click();await p.waitForTimeout(1000);log('after logout url',p.url().replace(BASE,''));}
await b.close();
