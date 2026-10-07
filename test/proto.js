const WebSocket=require('../server/vendor/ws');const SH=require('../server/shared.js');
const URL=process.argv[2]||'ws://localhost:8091';
function client(){const ws=new WebSocket(URL);const q=[],waiters=[];let me=null;const c={ws,msgs:q,get me(){return me;}};
  ws.on('message',b=>{const m=JSON.parse(b);if(m.t==='me'||m.t==='welcome')me=m.me;for(const w of waiters.slice())if(w.f(m)){waiters.splice(waiters.indexOf(w),1);w.r(m);return;}q.push(m);});
  c.send=m=>ws.send(JSON.stringify(m));c.wait=(f,ms)=>new Promise((r,j)=>{const hit=q.find(f);if(hit){q.splice(q.indexOf(hit),1);return r(hit);}const w={f,r};waiters.push(w);setTimeout(()=>j(new Error('timeout '+f)),ms||3000);});
  c.req=async(m,f)=>{c.send(m);return c.wait(x=>x.t==='err'||(f?f(x):x.t==='me'));};
  c.open=new Promise(r=>ws.on('open',r));return c;}
(async()=>{const A=client(),B=client();await A.open;await B.open;const nA='قرصان'+(Date.now()%10000),nB='Jack'+(Date.now()%10000);
  A.send({t:'register',name:nA,pass:'1234'});const wa=await A.wait(m=>m.t==='welcome'||m.t==='err');console.log('A',wa.t,wa.msg||wa.me.slot);
  B.send({t:'register',name:nB,pass:'abcd'});const wb=await B.wait(m=>m.t==='welcome'||m.t==='err');console.log('B',wb.t,wb.msg||wb.me.slot);
  let r=await A.req({t:'build',plot:10,type:'house'});console.log('build',r.t,r.msg||Object.keys(r.me.bld).length);
  r=await A.req({t:'build',plot:11,type:'farm'});console.log('build2',r.t,r.msg||'');
  r=await A.req({t:'build',plot:12,type:'house'});console.log('build3 (builders busy?)',r.t,r.msg||'');
  r=await A.req({t:'speed',col:'bld',key:10});console.log('speed',r.t,r.msg||r.me.res.gold|0);
  r=await A.req({t:'upgrade',plot:2});console.log('upgrade house',r.t,r.msg||r.me.bld[2].l);
  r=await A.req({t:'upgrade',plot:0});console.log('upgrade castle',r.t,r.msg||r.me.bld[0].l);
  r=await A.req({t:'recruit',type:'dual',n:2});console.log('recruit dual (tier2)',r.t,r.msg||'');
  r=await A.req({t:'recruit',type:'sword',n:2});console.log('recruit sword',r.t,r.msg||JSON.stringify(r.me.ships[0].crew));
  r=await A.req({t:'train',type:'guard',n:1});console.log('train guard',r.t,r.msg||JSON.stringify(r.me.garrison));
  r=await A.req({t:'move',type:'sword',n:1,from:'s1',to:'g'});console.log('move',r.t,r.msg||JSON.stringify(r.me.garrison));
  r=await A.req({t:'defBuild',spot:'sea1',type:'cannon'});console.log('def cannon',r.t,r.msg||'');
  r=await A.req({t:'flag',flag:SH.defaultFlag().replace(/0/g,'2')});console.log('flag',r.t,r.msg||r.me.flag.slice(0,10));
  A.send({t:'npcRaid',idx:1,size:'huge'});await A.wait(m=>m.t==='npcResult');A.send({t:'npcRaid',idx:2,size:'huge'});await A.wait(m=>m.t==='npcResult');
  r=await A.req({t:'clanCreate',name:'إخوة البحر',tag:'إخوة',open:true});console.log('clan',r.t,r.msg||r.me.clan);
  const cl=await A.wait(m=>m.t==='clan');console.log('clan view',cl.c.name,cl.c.members.length);
  B.send({t:'clanJoin',id:cl.c.id});const cb=await B.wait(m=>m.t==='clan'||m.t==='err');console.log('B join',cb.t,cb.msg||cb.c.members.length);
  A.send({t:'clanChat',msg:'هلا والله'});const cm=await B.wait(m=>m.t==='cmsg');console.log('chat',cm.m.name,cm.m.msg);
  B.send({t:'clanLeave'});await B.wait(m=>m.t==='clan'&&m.c===null).catch(e=>console.log('leave wait',e.message));
  B.send({t:'allyReq',to:wa.me.id});const nreq=await A.wait(m=>m.t==='note');console.log('ally note',nreq.k,nreq.name);
  A.send({t:'allyAccept',from:wb.me.id});await new Promise(r=>setTimeout(r,200));
  // B sails to A's island and raids -> needs betrayal confirmation
  const sp=SH.slotPos(wa.me.slot);B.send({t:'p',a:[sp.x+300,sp.z,0,0,0,100,100]});await new Promise(r=>setTimeout(r,100));
  A.send({t:'p',a:[sp.x,sp.z,0,0,1,100,100]});
  B.send({t:'raidStart',target:wa.me.id,rid:7});let rs=await B.wait(m=>m.t==='confirmBetray'||m.t==='err'||m.t==='raidOk');console.log('raidStart',rs.t,rs.msg||'');
  B.send({t:'raidStart',target:wa.me.id,betray:true});rs=await B.wait(m=>m.t==='raidOk'||m.t==='err');console.log('raidStart betray',rs.t,rs.msg||Object.keys(rs.L.def).join(','));
  const fd=await A.wait(m=>m.t==='feed').catch(()=>({text:'(no feed)'}));console.log('feed:',fd.text);
  const ua=await A.wait(m=>m.t==='underAttack').catch(()=>null);console.log('A underAttack',!!ua);
  if(rs.t==='raidOk'){await new Promise(r=>setTimeout(r,300));B.send({t:'raidEnd',raid:rs.rid,pct:80,flag:false,lost:{sword:1}});const res=await B.wait(m=>m.t==='raidResult'||m.t==='err');console.log('raidResult',JSON.stringify(res));
    const ro=await A.wait(m=>m.t==='raidOver').catch(()=>null);console.log('A raidOver',ro&&ro.pct);}
  B.send({t:'top'});const tp=await B.wait(m=>m.t==='top');console.log('top',tp.l.map(x=>x.name+':'+x.honor).join(' '));
  B.send({t:'npcRaid',idx:5,size:'col',name:'x'});const nr=await B.wait(m=>m.t==='npcResult'||m.t==='err');console.log('npc',nr.t,JSON.stringify(nr.loot||nr.msg));
  B.send({t:'npcRaid',idx:5,size:'col'});const nr2=await B.wait(m=>m.t==='npcResult'||m.t==='err');console.log('npc again',nr2.t,nr2.msg);
  // presence relay
  const P=await A.wait(m=>m.t==='P',2000).catch(()=>null);console.log('presence to A',P&&P.l.length);
  // resume with token
  A.ws.close();const C=client();await C.open;const tok=A.msgs.find(m=>m.t==='token');C.send({t:'resume',token:tok?tok.token:'x'});const wc=await C.wait(m=>m.t==='welcome'||m.t==='needLogin');console.log('resume',wc.t,wc.me&&wc.me.name);
  process.exit(0);})().catch(e=>{console.error('FAIL',e);process.exit(1);});
