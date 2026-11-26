import {launch,ctx,setBase,shot} from './lib.mjs';import {mock} from './mock.mjs';
setBase('http://localhost:4301');
const U='http://localhost:4301';const b=await launch();const log=(...a)=>console.log(...a);
const dl=p=>p.locator('.p-dialog');const info=p=>dl(p).evaluateAll(e=>e.map(x=>x.innerText.replace(/\n+/g,' | ')));
for(const [vp,w,h] of [['desktop',1440,900],['phone',390,844]])
for(const loginFail of ['abort','50001']){
const p=await ctx(b,w,h);await mock(p,{loginFail});
await p.goto(U+'/login');await p.fill('#login-username','testuser');await p.fill('#login-password','x');await p.click('[data-testid=login-submit]');
await p.waitForTimeout(2000);
log(vp,loginFail,'url',p.url().replace(U,''),'dialogs w/o interaction:',await dl(p).count(),await info(p),'buttons',await dl(p).locator('button').allInnerTexts());
await shot(p,`ERR-${loginFail==='abort'?'003-network':'004-server50001'}-${vp}-via-login`);
await p.close();}
await b.close();
