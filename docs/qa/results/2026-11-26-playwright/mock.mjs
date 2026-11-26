import {BASE} from './lib.mjs';
const env=(code,data,message='Success')=>({status:code.startsWith('2')?'IP-S-0001':'IP-E-0001',statusCode:code,messageType:code.startsWith('2')?'Success':'Error',message,data});
export const loginOk=(consent,role='ADMIN',admin=false)=>env('20000',{result:{sessionId:'s1',isConsent:consent,userProfile:{userId:1,userName:'testuser',firstName:'Test',lastName:'User',position:'Tester',uamRole:role,systemAdmin:admin,userType:'AD'}}});
export const systems=env('20000',[{systemId:1,systemName:'Example System A',systemDescription:'Example',systemType:'Web Application',ownerName:'Test Owner',systemUrl:'https://a.example.test',iconUrl:null,urlWebApp:'https://a.example.test'}]);
export async function mock(p,o={}){ // o: login(consent), home: 'ok'|'40102'|'abort'|'50000'..., hits
 p.calls=[];
 await p.route('**/v1/**',async r=>{const u=new URL(r.request().url());const path=u.pathname;p.calls.push(r.request().method()+' '+path);
  const j=o=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(o)});
  if(path.endsWith('/auth/login')){const b=r.request().postDataJSON?.();
    if(o.loginFail==='abort') return r.abort('connectionrefused');
    if(/^5\d+$/.test(o.loginFail||'')) return j(env(o.loginFail,null,'Server message '+o.loginFail));
    if(o.loginFail==='envelope') return j(env('40101',null,'bad'));
    if(o.loginFail==='http401') return r.fulfill({status:401,contentType:'application/json',body:JSON.stringify({message:'bad'})});
    return j(loginOk(o.consent??true,o.role,o.admin));}
  if(path.endsWith('/auth/logout')) return j(env('20000',true));
  if(path.includes('get-consent-last-version')) return j(env('20000',{id:1,name:'PDPA',title:'<p>Consent title</p>',description:'<p>Consent body</p>',version:'1.0',effectiveDate:'2025-01-01T00:00:00',status:'Active',createdDate:'2025-01-01T00:00:00',createdBy:'System',updatedDate:'2025-01-01T00:00:00',updatedBy:'System'}));
  if(path.includes('add-user-consent-accept')) return j(env('20000',true));
  if(path.includes('get-userSystems')){
    const h=o.home??'ok';
    if(h==='ok') return j(systems);
    if(h==='abort') return r.abort('connectionrefused');
    if(h==='40102') return j(env('40102',null,'Session expired'));
    return j(env(h,null,'Server said: '+h+' message'));
  }
  if(o.other==='abort'&&o.armed!==false) return r.abort('connectionrefused');
  if(o.other==='50001') return j(env('50001',null,'DB down message'));
  if(o.other==='40102') return j(env('40102',null,'Session expired'));
  return j(env('20000',[]));
 });
}
