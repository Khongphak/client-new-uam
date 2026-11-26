import { chromium } from 'playwright-core';
export let BASE='http://localhost:4300'; export const setBase=u=>{BASE=u};
export const OUT='/home/user/client-new-uam/docs/qa/results/screenshots-2026-11-26';
import fs from 'node:fs'; fs.mkdirSync(OUT,{recursive:true});
export async function launch(){return chromium.launch({executablePath:process.env.CHROME_BIN,args:['--no-sandbox']});}
export async function ctx(b,w,h){const c=await b.newContext({viewport:{width:w,height:h}});const p=await c.newPage();p.reqs=[];p.on('request',r=>{const u=r.url();if(!u.startsWith(BASE)&&!u.startsWith('data:'))p.reqs.push(u)});p.errs=[];p.on('console',m=>{if(m.type()==='error')p.errs.push(m.text())});return p;}
export async function login(p,u,path='/login'){await p.goto(BASE+path);await p.waitForSelector('input');
 await p.locator('input').first().fill(u);await p.locator('input[type=password]').fill('x');await p.getByRole('button',{name:/sign in/i}).click();await p.waitForTimeout(1200);}
export const shot=(p,n)=>p.screenshot({path:`${OUT}/${n}.png`});
export const spa=(p,path)=>p.evaluate(x=>{history.pushState({},'',x);dispatchEvent(new PopStateEvent('popstate'))},path);
export const txt=async p=>(await p.locator('body').innerText()).replace(/\n+/g,' | ');
