import {launch,ctx,login,txt,shot,spa,BASE} from './lib.mjs';
const b=await launch();
for(const u of ['admin.user','dev.user','audit.user','plain.user','super.user']){
 const p=await ctx(b,1440,900);await login(p,u);
 if(await p.getByRole('button',{name:'Setting'}).count()){await p.getByRole('button',{name:'Setting'}).click();await p.waitForTimeout(300);}
 console.log(u,'submenu:',JSON.stringify((await p.locator('nav a').allInnerTexts()).map(s=>s.trim())), await p.locator('nav a').evaluateAll(a=>a.map(x=>x.getAttribute('href'))));
 for(const r of ['/setting/system-setting','/setting/users-setting','/report','/forbidden','/setting','/nope']){
  await spa(p,r);await p.waitForTimeout(500);console.log('  ',r,'->',p.url().replace(BASE,''),'|',(await txt(p)).slice(0,160));
 }
 await p.close();
}
await b.close();
