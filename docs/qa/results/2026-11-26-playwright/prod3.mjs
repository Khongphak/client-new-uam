import {launch,ctx,txt,shot,spa,setBase} from './lib.mjs';import {mock} from './mock.mjs';
setBase('http://localhost:4301');
const U='http://localhost:4301';const b=await launch();const log=(...a)=>console.log(...a);
async function fresh(w,h,o){const p=await ctx(b,w,h);await mock(p,o);return p}
async function go(p,u='testuser',path='/login'){await p.goto(U+path);await p.waitForSelector('#login-username');await p.fill('#login-username',u);await p.fill('#login-password','x');await p.click('[data-testid=login-submit]');await p.waitForTimeout(1200)}
const path=p=>p.url().replace(U,'');
const dlg=p=>p.locator('[role=dialog],[role=alertdialog]');
// dialog visibility after Go back + Esc
let p=await fresh(1440,900,{consent:false});await go(p);
await p.click('[data-testid=consent-decline]');await p.waitForTimeout(400);
log('dlg elements', await dlg(p).evaluateAll(e=>e.map(x=>[x.tagName,x.getAttribute('role'),x.offsetParent!==null,x.className.slice(0,60)])));
await p.keyboard.press('Escape');await p.waitForTimeout(300);log('after Esc visible dlg:',await dlg(p).evaluateAll(e=>e.filter(x=>x.offsetParent!==null).length));
await p.locator('button',{hasText:'Go back'}).click();await p.waitForTimeout(500);
log('after Go back dlg elements:',await dlg(p).evaluateAll(e=>e.map(x=>[x.tagName,x.getAttribute('role'),x.offsetParent!==null,getComputedStyle(x).display])),'bodyText has Decline and sign out:',/Decline and sign out\?/.test(await txt(p)));
await shot(p,'AUT-005-desktop-2-after-go-back');
// AUT-007 unauth
p=await fresh(1440,900,{});
for(const r of ['/home','/setting/system-setting','/report','/pdpaconsent','/forbidden','/login','/notfound']){await p.goto(U+r);await p.waitForTimeout(800);log('AUT-007',r,'->',path(p));}
await shot(p,'AUT-007-desktop-notfound-public');
// home unauth screenshot
await p.goto(U+'/home');await p.waitForTimeout(800);log('unauth /home body:',(await txt(p)).slice(0,200));await shot(p,'AUT-007-desktop-home-unauth');
// ERR-001
for(const [vp,w,h] of [['desktop',1440,900],['phone',390,844]]){
 p=await fresh(w,h,{});for(const r of ['/no-such-page','/notfound']){await p.goto(U+r);await p.waitForTimeout(800);log('ERR-001',vp,r,'->',path(p),'|',(await txt(p)).slice(0,200),'| h1/h2:',await p.locator('h1,h2').allInnerTexts(),'| u-errpage:',await p.locator('.u-errpage,[class*=errpage]').count());await shot(p,`ERR-001-${vp}${r.replace('/','-')}`);}
 log(' links:',await p.locator('a,button').evaluateAll(e=>e.map(x=>[x.innerText.trim(),x.getAttribute('href')])));
}
// ERR-002 session expired
for(const [vp,w,h] of [['desktop',1440,900]]){
 p=await fresh(w,h,{home:'40102'});await go(p);await p.waitForTimeout(600);
 log('ERR-002 s1 url',path(p),'dialogs:',await dlg(p).evaluateAll(e=>e.map(x=>x.innerText.replace(/\n+/g,' | '))));await shot(p,'ERR-002-desktop-session-dialog');
 log(' buttons:',await p.locator('[role=dialog] button,[role=alertdialog] button').allInnerTexts());
 await p.keyboard.press('Escape');await p.waitForTimeout(300);log(' after Esc dialogs:',await dlg(p).count());
 await p.locator('[role=dialog] button,[role=alertdialog] button').last().click();await p.waitForTimeout(1000);
 log('ERR-002 s2 after confirm url',path(p),'calls',p.calls.filter(c=>/logout/.test(c)));await shot(p,'ERR-002-desktop-after-confirm');
 // s3 multi parallel: all APIs 40102 on report page
 p=await fresh(w,h,{home:'ok',other:'40102'});await go(p,'testuser');
 await spa(p,'/report');await p.waitForTimeout(800);
 // choose things to fire multiple requests
 log('ERR-002 s3 report url',path(p),'dialogs now:',await dlg(p).count(),'calls',p.calls.slice(-6));
}
// ERR-003 network
for(const [vp,w,h] of [['desktop',1440,900],['phone',390,844]]){
 p=await fresh(w,h,{home:'abort'});await go(p);await p.waitForTimeout(600);
 log('ERR-003',vp,'dialog:',await dlg(p).evaluateAll(e=>e.map(x=>x.innerText.replace(/\n+/g,' | '))),'buttons',await p.locator('[role=dialog] button,[role=alertdialog] button').allInnerTexts());await shot(p,`ERR-003-${vp}-network`);
}
// ERR-004 server codes
for(const code of ['50000','50001','50002']){
 p=await fresh(1440,900,{home:code});await go(p);await p.waitForTimeout(600);
 log('ERR-004',code,'dialog:',await dlg(p).evaluateAll(e=>e.map(x=>x.innerText.replace(/\n+/g,' | '))));await shot(p,`ERR-004-desktop-${code}`);
}
await b.close();
