import {launch,ctx,txt,shot,spa,setBase} from './lib.mjs';import {mock} from './mock.mjs';
setBase('http://localhost:4301');
const U='http://localhost:4301';const b=await launch();
const log=(...a)=>console.log(...a);
async function fresh(w,h,o){const p=await ctx(b,w,h);await mock(p,o);return p}
async function go(p,u='testuser',path='/login'){await p.goto(U+path);await p.waitForSelector('#login-username');await p.fill('#login-username',u);await p.fill('#login-password','x');await p.click('[data-testid=login-submit]');await p.waitForTimeout(1200)}
const path=p=>p.url().replace(U,'');
for(const [vp,w,h] of [['desktop',1440,900],['phone',390,844]]){
 log('##### viewport',vp);
 // AUT-004
 let p=await fresh(w,h,{consent:false});await go(p);
 const agree=p.locator('[data-testid=consent-agree]');
 log('AUT-004 s1 url',path(p),'agree disabled:',await agree.isDisabled());
 await shot(p,`AUT-004-${vp}-1-initial`);
 await p.locator('p-checkbox, .p-checkbox').first().click();await p.waitForTimeout(200);
 log('AUT-004 s2 ticked, disabled:',await agree.isDisabled());await shot(p,`AUT-004-${vp}-2-ticked`);
 await p.locator('p-checkbox, .p-checkbox').first().click();await p.waitForTimeout(200);
 log('AUT-004 s3 unticked, disabled:',await agree.isDisabled());
 await p.locator('p-checkbox, .p-checkbox').first().click();await p.waitForTimeout(200);await agree.click();await p.waitForTimeout(1000);
 log('AUT-004 s4 after agree url',path(p),'calls:',p.calls.filter(c=>c.includes('consent')));
 await shot(p,`AUT-004-${vp}-4-after-agree`);
 // AUT-005
 p=await fresh(w,h,{consent:false});await go(p);
 await p.click('[data-testid=consent-decline]');await p.waitForTimeout(500);
 log('AUT-005 s1 dialog:',(await p.locator('[role=dialog],[role=alertdialog]').allInnerTexts()).map(s=>s.replace(/\n+/g,' | ')),'aria-modal:',await p.locator('[role=dialog],[role=alertdialog]').first().getAttribute('aria-modal').catch(()=>null));
 await shot(p,`AUT-005-${vp}-1-decline-dialog`);
 const btns=await p.locator('[role=dialog] button,[role=alertdialog] button').allInnerTexts();log(' dialog btns',btns);
 await p.locator('[role=dialog] button,[role=alertdialog] button').filter({hasText:/cancel|stay|back|no/i}).first().click();await p.waitForTimeout(400);
 log('AUT-005 s2 after cancel url',path(p),'dialogs:',await p.locator('[role=dialog],[role=alertdialog]').count());
 await p.click('[data-testid=consent-decline]');await p.waitForTimeout(400);
 await p.locator('[role=dialog] button,[role=alertdialog] button').filter({hasText:/sign out|confirm|yes|decline/i}).last().click();await p.waitForTimeout(1000);
 log('AUT-005 s3 after confirm url',path(p),'calls:',p.calls.filter(c=>c.includes('logout')));
 await shot(p,`AUT-005-${vp}-3-after-signout`);
 if(vp==='desktop'){
  // AUT-006
  p=await fresh(w,h,{consent:false});await go(p);await spa(p,'/home');await p.waitForTimeout(600);log('AUT-006 spa->/home url:',path(p));
  await shot(p,'AUT-006-desktop-guard');
  // AUT-009 s2 consent true
  p=await fresh(w,h,{consent:true});await go(p);log('AUT-009 s2 consent=true url:',path(p));
  p=await fresh(w,h,{});await p.goto(U+'/pdpaconsent');await p.waitForTimeout(800);log('AUT-009 s3 unauth /pdpaconsent ->',path(p));
 }
 // AUT-002
 for(const m of ['envelope','http401']){
  p=await fresh(w,h,{loginFail:m});await go(p,'wrong');
  const al=p.locator('[role=alert]');
  log('AUT-002',m,'alert:',await al.allInnerTexts(),'url',path(p),'aria-invalid:',await p.locator('#login-username').getAttribute('aria-invalid'),await p.locator('#login-password').getAttribute('aria-invalid'),'invalid class:',await p.locator('#login-username').evaluate(e=>e.className),'lock text:',/lock/i.test(await txt(p).then(t=>t.replace(/Locked out or forgot your password\?[^|]*/,''))));
  if(m==='envelope') await shot(p,`AUT-002-${vp}-error`);
 }
}
await b.close();
