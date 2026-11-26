import {launch,ctx,setBase,shot} from './lib.mjs';import {mock} from './mock.mjs';
setBase('http://localhost:4301');
const U='http://localhost:4301';const b=await launch();const log=(...a)=>console.log(...a);
const dl=p=>p.locator('.p-dialog');const info=p=>dl(p).evaluateAll(e=>e.map(x=>x.innerText.replace(/\n+/g,' | ')));
for(const code of ['50000','50001','50002']){
const p=await ctx(b,1440,900);await mock(p,{loginFail:code});
await p.goto(U+'/login');await p.fill('#login-username','testuser');await p.fill('#login-password','x');await p.click('[data-testid=login-submit]');await p.waitForTimeout(1500);
log('ERR-004',code,await info(p));await shot(p,`ERR-004-desktop-${code}`);await p.close();}
// session
const p=await ctx(b,1440,900);await mock(p,{home:'40102'});
await p.goto(U+'/login');await p.fill('#login-username','testuser');await p.fill('#login-password','x');await p.click('[data-testid=login-submit]');await p.waitForTimeout(2000);
log('ERR-002 before interaction dialogs',await dl(p).count());await p.mouse.click(700,500);await p.waitForTimeout(600);
log('ERR-002 after click',await info(p),'buttons',await dl(p).locator('button').allInnerTexts());await shot(p,'ERR-002-desktop-session-dialog');
await p.keyboard.press('Escape');await p.waitForTimeout(300);log(' after Esc still open',await dl(p).count());
await dl(p).locator('button',{hasText:'Log in again'}).click();await p.waitForTimeout(1000);log('ERR-002 after confirm url',p.url().replace(U,''),'dialogs',await dl(p).count());await shot(p,'ERR-002-desktop-after-confirm');
await b.close();
