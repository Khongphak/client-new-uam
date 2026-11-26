import {launch,ctx,login,txt,shot,BASE} from './lib.mjs';
const b=await launch();const log=(...a)=>console.log(...a);
const T=id=>`[data-testid=${id}]`;
for(const [vp,w,h] of [['desktop',1440,900],['phone',390,844]]){
 const p=await ctx(b,w,h);await login(p,'admin.user');
 if(vp==='phone'){await p.locator('header button').first().click();await p.waitForTimeout(400);}
 await p.locator('nav a',{hasText:'Report'}).click();await p.waitForTimeout(800);
 const ex=p.locator(T('export-btn'));
 log('RPT-001',vp,'s1 tables',await p.locator('table').count(),'export disabled',await ex.isDisabled(),'hscroll',await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
 await p.selectOption(T('system-select'),{index:1});await p.waitForTimeout(500);
 log(' s2 matrix: system chosen; export disabled?',await ex.isDisabled(),'dept options',await p.locator(T('department-select')+' option').allInnerTexts());
 await p.selectOption(T('department-select'),{index:1}).catch(e=>log('  dept select err',e.message.slice(0,80)));
 await shot(p,`RPT-001-${vp}-2-matrix-ready`);
 if(vp==='desktop'){
  const [dl]=await Promise.all([p.waitForEvent('download',{timeout:5000}).catch(()=>null),ex.click()]);
  log(' s4 matrix export download:',dl&&dl.suggestedFilename());
  if(dl){const path=await dl.path();const fs=await import('node:fs');log('  size',fs.statSync(path).size,'head',fs.readFileSync(path).slice(0,60).toString('utf8').replace(/\n/g,'\\n'));}
 }
 await p.click(T('tab-audit')).catch(async()=>{await p.locator('[role=tab]').nth(1).click()});await p.waitForTimeout(500);
 log(' audit tab: export disabled?',await ex.isDisabled(),'range options',await p.locator(T('range-select')+' option').allInnerTexts(),'from/to',await p.inputValue(T('date-from')),await p.inputValue(T('date-to')),'system sel',await p.inputValue(T('system-select')));
 await p.selectOption(T('system-select'),{index:1});
 log(' audit with system only: export disabled?',await ex.isDisabled());
 for(const r of await p.locator(T('range-select')+' option').allInnerTexts()){await p.selectOption(T('range-select'),{label:r});await p.waitForTimeout(150);log('  range',r,'->',await p.inputValue(T('date-from')),await p.inputValue(T('date-to')),'export disabled',await ex.isDisabled());}
 await shot(p,`RPT-001-${vp}-3-audit-range`);
 await p.selectOption(T('range-select'),{index:1});
 if(vp==='desktop'){
  const [dl]=await Promise.all([p.waitForEvent('download',{timeout:5000}).catch(()=>null),ex.click()]);
  log(' audit export download:',dl&&dl.suggestedFilename(),'toast/text:',(await txt(p)).slice(-200));
 }
 await p.click(T('reset-btn'));await p.waitForTimeout(300);
 log(' s5 after reset: system',await p.inputValue(T('system-select')),'from/to',await p.inputValue(T('date-from')),await p.inputValue(T('date-to')),'range',await p.inputValue(T('range-select')),'export disabled',await ex.isDisabled(),'tab active',await p.locator('[role=tab][aria-selected=true]').innerText());
 await shot(p,`RPT-001-${vp}-4-after-reset`);
 await p.close();
}
await b.close();
