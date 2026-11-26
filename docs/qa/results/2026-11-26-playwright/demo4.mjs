import {launch,ctx,login,txt,shot,BASE} from './lib.mjs';
const b=await launch();const log=(...a)=>console.log(...a);
for(const [u,role] of [['admin.user','ADMIN'],['dev.user','DEVELOPER'],['audit.user','AUDIT'],['plain.user','USER'],['super.user','SUPERADMIN']]){
 for(const [vp,w,h] of [['desktop',1440,900],['phone',390,844]]){
  const p=await ctx(b,w,h);await login(p,u);
  if(vp==='phone'){await p.locator('header button').first().click();await p.waitForTimeout(500);}
  const st=p.getByRole('button',{name:'Setting'});if(await st.count()){await st.click();await p.waitForTimeout(300);}
  const items=(await p.locator('#shell-sidebar a, #shell-sidebar button').allInnerTexts()).map(s=>s.trim()).filter(Boolean);
  const bg=await p.locator('#shell-sidebar a.is-active').first().evaluate(e=>getComputedStyle(e).backgroundImage.slice(0,70)).catch(()=>'none');
  const topn=await p.locator('header').first().innerText();
  log(role,vp,'sidebar:',JSON.stringify(items),'active bg:',bg,'| topbar:',topn.replace(/\n+/g,' / '));
  await shot(p,`RBAC-${role}-${vp}-sidebar`);await p.close();
 }
}
await b.close();
