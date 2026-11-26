import {launch,ctx,setBase} from './lib.mjs';import {mock} from './mock.mjs';
setBase('http://localhost:4301');
const U='http://localhost:4301';const b=await launch();const log=(...a)=>console.log(...a);
const acts={click:p=>p.mouse.click(700,500),tab:p=>p.keyboard.press('Tab'),a:p=>p.keyboard.press('a'),esc:p=>p.keyboard.press('Escape'),resize:p=>p.setViewportSize({width:1300,height:800}),scroll:p=>p.mouse.wheel(0,100),none:async()=>{}};
for(const [n,f] of Object.entries(acts)){
const p=await ctx(b,1440,900);await mock(p,{home:'abort'});
await p.goto(U+'/login');await p.fill('#login-username','testuser');await p.fill('#login-password','x');await p.click('[data-testid=login-submit]');
await p.waitForTimeout(2500);const before=await p.locator('.p-dialog').count();await f(p);await p.waitForTimeout(600);
log(n,'before',before,'after',await p.locator('.p-dialog').count());await p.close();}
await b.close();
