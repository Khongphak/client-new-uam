import {launch,ctx,shot,txt,BASE} from './lib.mjs';
const b=await launch();const log=(...a)=>console.log(...a);
for(const [vp,w,h] of [['desktop',1440,900],['phone',390,844]]){
 const p=await ctx(b,w,h);await p.goto(BASE+'/login');await p.waitForSelector('#login-username');
 const hero=await p.locator('text=One sign-in for every system').boundingBox();const form=await p.locator('#login-username').boundingBox();
 log('AUT-001',vp,'hero',hero&&[Math.round(hero.x),Math.round(hero.y)],'form',[Math.round(form.x),Math.round(form.y)],'hscroll',await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'mailto',await p.locator('a[href*="ITSupport@philliplife.com"]').count(),'ADtext',/Use your company \(AD\) account\./.test(await txt(p)));
 await shot(p,`AUT-001-${vp}-1-login`);
 log(' submit disabled when empty',await p.locator('[data-testid=login-submit]').isDisabled());
 await p.fill('#login-username','admin.user');await p.fill('#login-password','secret');
 log(' submit enabled',!(await p.locator('[data-testid=login-submit]').isDisabled()),'pw type',await p.getAttribute('#login-password','type'));
 const t=p.locator('[data-testid=login-password-toggle]');
 await t.click();log('AUT-003 shown type',await p.getAttribute('#login-password','type'),'label',await t.getAttribute('aria-label'),'pressed',await t.getAttribute('aria-pressed'));await shot(p,`AUT-003-${vp}-shown`);
 await t.click();log(' hidden type',await p.getAttribute('#login-password','type'),'label',await t.getAttribute('aria-label'),'pressed',await t.getAttribute('aria-pressed'));
 // loading state
 await p.evaluate(()=>{const b=document.querySelector('[data-testid=login-submit]');window.__s=[];new MutationObserver(()=>window.__s.push([b.disabled,b.className.includes('loading'),b.getAttribute('aria-busy'),b.querySelector('.pi-spinner,.p-button-loading-icon')!==null])).observe(b,{attributes:true,subtree:true,childList:true})});
 await p.click('[data-testid=login-submit]');await p.waitForTimeout(1200);
 log('AUT-001 loading mutations',JSON.stringify(await p.evaluate(()=>window.__s||'lost')),'url',p.url().replace(BASE,''));
 await p.close();
}
await b.close();
