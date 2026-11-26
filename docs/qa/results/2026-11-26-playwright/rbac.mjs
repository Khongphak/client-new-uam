import {launch,ctx,login,txt,shot,spa,BASE} from './lib.mjs';
const b=await launch();
for(const [u,role] of [['admin.user','ADMIN'],['dev.user','DEVELOPER'],['audit.user','AUDIT'],['plain.user','USER'],['super.user','SUPERADMIN']]){
 const p=await ctx(b,1440,900);await login(p,u);
 const nav=await p.locator('nav a, nav button, aside a, aside button').allInnerTexts();
 console.log('==',u,p.url());console.log('nav:',JSON.stringify(nav.map(s=>s.trim()).filter(Boolean)));
 const top=await p.locator('header').first().innerText().catch(()=>'?');console.log('top:',top.replace(/\n+/g,' | '));
 console.log('banner/sidebar html sample:',(await p.locator('aside, nav').first().evaluate(e=>e.outerHTML.slice(0,600)).catch(()=>'none')));
 await shot(p,`rbac-${role}-desktop-1440`);
 await p.close();
}
await b.close();
