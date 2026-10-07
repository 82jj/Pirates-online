/* ================= raids on other captains' islands: defences, traps, defenders, destruction, flag; NPC colonies; sea PvP hooks ================= */
let RAID={on:false};
function raidRequest(id,betray){if(RAID.on)return;const pp=ON.pl.get(id);if(!pp)return;if(mode==='foot'){banner('ارجع لسفينتك أول',1500);return;}
  act({t:'raidStart',target:id,betray:!!betray},false).catch(()=>{});banner('⚔️ نجهّز للغزو…',1200);}
const DEF_W={castle:4};
function raidBegin(m){const il=islandOfPlayer(m.L.id);if(!il){netSend({t:'raidEnd',raid:m.rid,pct:0});return;}
  buildNow(il);if(!il.baseG){il.baseG=new THREE.Group();scene.add(il.baseG);}RAID={on:false};applyLayout(Object.assign({id:m.L.id},m.L));
  const crewT=m.crew||{},reveal=!!(crewT.spy||crewT.tamer||crewT.lookout);
  RAID={on:true,rid:m.rid,il,L:m.L,name:m.name,t:0,dur:SH.RAID.maxSec,pct:0,lost:{},vault:false,flag:false,flagT:0,reveal,ended:false,idleT:0,landed:false,dirty:false,dirtyT:0,proj:[],mines:[],fx:[],start:performance.now()};
  let tot=0;for(const k in il.ents){const e=il.ents[k];e.w=e.kind==='bld'?(DEF_W[e.t]||1):e.hidden?0:1;tot+=e.w;e.cd=1+Math.random()*2;if(e.hidden&&reveal){e.show=true;}
    if(e.t==='mines'&&e.alive){for(let j=0;j<3;j++){const a=j*2.1,c=Math.cos(e.ry),s=Math.sin(e.ry),lx=Math.cos(a)*3,lz=Math.sin(a)*3;RAID.mines.push({x:e.x+lx*c+lz*s,z:e.z-lx*s+lz*c,dmg:e.st.dmg,alive:true,e});}}}
  RAID.tot=Math.max(1,tot);il.alert=false;rebuildBase(il);spawnDefenders(il,m.L);
  banner('⚔️ غزو جزيرة '+esc(m.name)+'! دمّر دفاعاتها أو ارفع علمك فوق قلعتها',3200);if(reveal)setTimeout(()=>banner('🔭 جاسوسك كشف الفخاخ المخفية',2000),1500);}
/* ---- defenders ---- */
function spawnDefenders(il,L){const g=Object.assign({},L.garrison||{}),out=[],ents=il.ents,B=il.base,sp=il.space;
  for(const u of il.units.slice())if(u.team===1){scene.remove(u.g);il.units.splice(il.units.indexOf(u),1);}
  const crewed=Object.values(ents).filter(e=>e.kind==='def'&&SH.DEF[e.t].crew&&e.alive).sort((a,b)=>(a.spot==='sea')-(b.spot==='sea'));
  let crewN=g.crew||0;delete g.crew;for(const e of crewed){if(crewN>0){crewN--;out.push({t:'crew',x:e.x-Math.sin(e.ry)*2.2,z:e.z-Math.cos(e.ry)*2.2,post:e,leash:6});e.crewed=true;}else e.crewed=false;}
  const towers=Object.values(ents).filter(e=>e.t==='tower'&&e.alive);let ti=0;
  const W=(r,a)=>({x:B.x+Math.cos(B.ang+a)*r,z:B.z+Math.sin(B.ang+a)*r});
  const place=(t,i)=>{if(t==='wallgun'){const tw=towers[ti++%Math.max(1,towers.length)];if(tw)return Object.assign({},W(44,Math.atan2(tw.z-B.z,tw.x-B.x)-B.ang+(Math.random()-.5)*.1),{leash:8});return Object.assign(W(45,(i/5)*Math.PI*2),{leash:10});}
    if(t==='guard')return Object.assign(W(i%2?44:40,(i%4<2?0:Math.PI)+(Math.random()-.5)*.25),{leash:14});
    if(t==='cavalry'||t==='dog')return Object.assign(W(22+Math.random()*10,Math.random()*6.28),{leash:t==='dog'?40:60});
    if(t==='gdiver'){const d=B.dock;return{x:d.x+(Math.random()-.5)*16,z:d.z+(Math.random()-.5)*16,leash:24};}
    return Object.assign(W(16+Math.random()*22,Math.random()*6.28),{leash:22});};
  const order=['guard','wallgun','cavalry','dog','firemen','gdiver'].concat(Object.keys(g).filter(t=>!['guard','wallgun','cavalry','dog','firemen','gdiver'].includes(t)));
  for(const t of order){const n=g[t]||0;for(let i=0;i<n;i++)out.push(Object.assign({t},place(t,i)));}
  for(let i=0;i<(L.militia||0);i++)out.push(Object.assign({t:'fighters'},W(14+Math.random()*26,Math.random()*6.28),{leash:26}));
  const vault=Object.values(ents).find(e=>e.t==='vault');if(vault)for(let i=0;i<(L.vault||0)*2;i++)out.push({t:'tguard',x:vault.x+Math.cos(i)*5,z:vault.z+Math.sin(i)*5,leash:14,dormant:true,post:vault});
  const CAP=26;let list=out;RAID.hpK=1;if(out.length>CAP){/* keep the crews, scale the rest */const crew=out.filter(o=>o.t==='crew'),rest=out.filter(o=>o.t!=='crew');const k=(CAP-crew.length)/rest.length;list=crew.concat(rest.filter((o,i)=>Math.floor((i+1)*k)>Math.floor(i*k)));
    RAID.hpK=Math.min(2.2,out.length/CAP);}
  const wsegs=il.walls.filter(w=>w.gate<0);let wi=0;
  for(const o of list){let u;
    if(o.t==='dog')u=makeDogUnit(il,o.x,o.z,1);
    else if(o.t==='cavalry')u=makeCavalryUnit(il,o.x,o.z,1);
    else{const p=makePerson(o.t==='fighters'?'villager':o.t==='tguard'?'skeleton':SH.PUNITS[o.t]?'pirate':'defender',o.t);p.utype=o.t;u=mkUnit(p,1,o.x,o.z,sp,'soldier');scene.add(p.g);
      if(o.t==='wallgun'){u.custom=wallgunAI;if(wsegs.length){const w=wsegs[Math.floor((wi++*7.3)%wsegs.length)];if(w.q>0){u.x=w.x;u.z=w.z;u.yOff=w.q===1?4.6:5.4;u.wallSeg=w;}else{const B=il.base,a=Math.atan2(w.z-B.z,w.x-B.x);u.x=B.x+Math.cos(a)*(il.lay.wallR-2.6);u.z=B.z+Math.sin(a)*(il.lay.wallR-2.6);}u.g.rotation.y=Math.atan2(u.x-il.base.x,u.z-il.base.z);}}}
    u.max=u.hp=Math.round(u.max*(RAID.hpK||1));u.post={x:u.x,z:u.z};u.leash=o.leash||20;u.aggro=o.t==='cavalry'?70:o.t==='dog'?50:o.t==='wallgun'?36:o.t==='crew'?10:28;u.raidDef=true;u.dormant=!!o.dormant;u.postEnt=o.post||null;
    if(!u.custom)placeUnit(u);il.units.push(u);if(u.dormant){u.state='hidden';u.g.visible=false;}}}
/* ---- per-frame raid update ---- */
function raidUpdate(dt){if(!RAID.on)return;const R=RAID,il=R.il;R.t+=dt;
  const att=raidAttackers();
  if(R.dirty){R.dirtyT-=dt;if(R.dirtyT<=0){R.dirty=false;rebuildBase(il);}}
  for(const k in il.ents){const e=il.ents[k];if(!e.alive)continue;if(e.burnT>0){e.burnT-=dt;damageEnt(e,(e.burnDps||5)*dt);if(Math.random()<dt*10)puff(new THREE.Vector3(e.x+(Math.random()-.5)*(e.r||3),e.y+2+Math.random()*3,e.z+(Math.random()-.5)*(e.r||3)),Math.random()<.5?0xFF8A2A:0x5A5550,1,.9,1,2.5,.9);if(!e.alive)continue;}if(!e.building)defenceTick(e,dt,att);}
  /* mines */if(P.alive)for(const mn of R.mines){if(!mn.alive)continue;if(Math.hypot(P.x-mn.x,P.z-mn.z)<11*P.S){mn.alive=false;const p=new THREE.Vector3(mn.x,1,mn.z);boom(p);boom(p.clone().add(new THREE.Vector3(2,1,0)));damageShip(P,p,mn.dmg,.4);banner('💥 لغم!',1000);
      if(R.mines.filter(q=>q.e===mn.e&&q.alive).length===0)destroyEnt(mn.e,true);}}
  /* harbour chain blocks the bay */const hc=Object.values(il.ents).find(e=>e.t==='harbor'&&e.alive);if(hc&&P.alive){const a=hc.S.a,ux=Math.cos(a),uz=Math.sin(a),dx=P.x-hc.x,dz=P.z-hc.z,along=dx*ux+dz*uz,lat=Math.abs(-dx*uz+dz*ux);
    if(lat<32&&along<8&&along>-12){P.x+=ux*(8-along)*.5;P.z+=uz*(8-along)*.5;P.speed*=.6;if(!R.chainMsg){R.chainMsg=1;banner('⛓ سلسلة الميناء تسد المدخل؛ اكسرها بالمدافع',2200);}}}
  /* traps and the crocodile moat */
  for(const k in il.ents){const e=il.ents[k];if(!e.alive||e.kind!=='def'||e.building)continue;const s=e.st;
    if(e.spot==='trap'){for(const u of att){if(u.jump||u.state!=='alive')continue;const d=Math.hypot(u.x-e.x,u.z-e.z);
        if(e.t==='spikes'){if(d<(s.aoe||4)){hurtU(u,s.dps*dt);u.slowT=.4;if(!e.show){e.show=true;R.dirty=true;R.dirtyT=.1;}}continue;}
        if(d<2.2){trapFire(e,u,att);break;}}}
    else if(e.t==='crocs'){for(const u of att){if(u.state!=='alive')continue;const d=Math.hypot(u.x-e.x,u.z-e.z);if(d>10.3&&d<13.2){hurtU(u,s.dps*dt);u.slowT=.4;if(Math.random()<dt*2)puff(new THREE.Vector3(u.x,e.y+.3,u.z),0xCFE8F0,2,.2,1,1.4,.4);}}}}
  /* dormant treasure guards rise when attackers come near the vault */
  for(const u of il.units)if(u.dormant&&u.state==='hidden'&&att.some(a=>Math.hypot(a.x-u.x,a.z-u.z)<16)){u.dormant=false;u.state='alive';u.g.visible=true;puff(new THREE.Vector3(u.x,islandH(il,u.x,u.z)+.5,u.z),0x6A5A48,6,.4,2,2,.8);if(!R.skMsg){R.skMsg=1;banner('☠ حراس الكنز قاموا من قبورهم!',1800);}}
  updateRaidProj(dt);
  /* the flag on the castle */
  const fo=raidFlagOption();$('aFlag').classList.toggle('hide',!fo);if(fo&&flagHeld){R.flagT+=dt*(bearerNear()?1.6:1);$('flagProg').style.width=Math.min(100,R.flagT/3*100)+'%';const c=land.cap;c.arms[0].rotation.x=-2.4+Math.sin(T*8)*.3;c.arms[1].rotation.x=-2.2-Math.sin(T*8)*.3;
    if(R.flagT>=3){R.flag=true;raidFinish(true);return;}}else if(!fo){R.flagT=Math.max(0,R.flagT-dt);$('flagProg').style.width='0%';}
  R.pct=raidPct();
  if(R.t>=R.dur){raidFinish(false);return;}
  const landed=att.length>0;if(landed)R.landed=true;if(R.landed&&!landed&&mode!=='foot'){R.idleT+=dt;if(R.idleT>25){raidFinish(false);return;}}else R.idleT=0;}
function raidAttackers(){const il=RAID.il,out=[];for(const u of il.units)if(u.team===0&&u.state==='alive'&&!u.jump)out.push(u);return out;}
function raidPct(){const il=RAID.il;let d=0;for(const k in il.ents){const e=il.ents[k];if(!e.alive)d+=e.w||0;}return Math.min(100,d/RAID.tot*100);}
function bearerNear(){const c=land&&land.cap;if(!c)return false;return RAID.il.units.some(u=>u.team===0&&u.utype==='bearer'&&u.state==='alive'&&Math.hypot(u.x-c.x,u.z-c.z)<10);}
function raidFlagOption(){const il=RAID.il,c=land&&land.cap;if(mode!=='foot'||!c||c.state!=='alive'||c.jump||!il.pole||land.il!==il)return false;if(!il.ents.b0)return false;
  if(Math.hypot(c.x-il.pole.x,c.z-il.pole.z)>7)return false;return!il.units.some(u=>u.team===1&&u.state==='alive'&&!u.dormant&&Math.hypot(u.x-c.x,u.z-c.z)<14);}
/* ---- defence behaviour ---- */
function defenceTick(e,dt,att){if(e.kind!=='def')return;const s=e.st,d=SH.DEF[e.t];if(!s||!s.rng)return;if(d.crew&&!e.crewed)return;
  if(d.crew&&e.crewUnit===undefined){e.crewUnit=RAID.il.units.find(u=>u.utype==='crew'&&u.postEnt===e)||null;}if(d.crew&&e.crewUnit&&e.crewUnit.state!=='alive')return;
  e.cd-=dt;if(e.cd>0)return;const night=dayK<.35&&Object.values(RAID.il.ents).some(q=>q.t==='lighthouse'&&q.alive)?1.15:1,rng=s.rng*night,top=e.y+(e.top||partsFor('def',e.t,e.l,false,null,e.S).top||2.4);
  if((s.vs==='ship'||s.vs==='both')&&P.alive&&mode!=='foot'){const dd=Math.hypot(P.x-e.x,P.z-e.z);if(dd<rng&&(!s.min||dd>s.min)){const tf=dd/(VB*.92),tip=new THREE.Vector3(e.x,top,e.z);smoke(tip);
      const tg=new THREE.Vector3(P.x+Math.sin(P.rot)*P.speed*tf+(Math.random()-.5)*8,1,P.z+Math.cos(P.rot)*P.speed*tf+(Math.random()-.5)*8);shoot(tip,tg,'e',s.dmg);
      if(e.t==='chain'){RAID.slowPending={t:performance.now()+dd/VB*1000,k:s.slow};}if(e.t==='firecat')RAID.burnPending={t:performance.now()+dd/VB*1000,dps:s.burn};
      e.cd=s.rate*(.85+Math.random()*.3);return;}}
  if(s.vs==='unit'||s.vs==='both'){let tg=null,bd=rng;for(const u of att){if(u.stealth&&!u.revealed)continue;const dd=Math.hypot(u.x-e.x,u.z-e.z);if(dd<bd&&(!s.min||dd>s.min)){bd=dd;tg=u;}}
    if(!tg){e.cd=.4;return;}const tip=new THREE.Vector3(e.x,top,e.z);
    if(e.t==='tower'){puff(tip,0xFFC060,1,.25,1,1,.12);puff(tip,0xDDD8CC,2,.35,1,1,.8);if(Math.random()<.72-bd*.006)hurtU(tg,s.dmg);e.cd=s.rate;}
    else if(e.t==='gatling'){for(let k=0;k<s.burst;k++)setTimeout(()=>{if(tg.state!=='alive')return;puff(tip,0xFFC060,1,.18,1,1,.08);if(Math.random()<.55)hurtU(tg,s.dmg);},k*90);puff(tip,0xDDD8CC,3,.35,1,1,1);e.cd=s.rate;}
    else if(e.t==='mortar'){raidLob(tip,new THREE.Vector3(tg.x,islandH(RAID.il,tg.x,tg.z),tg.z),{aoe:s.aoe,dmg:s.dmg,kind:'shell'});smoke(tip);e.cd=s.rate;}
    else if(e.t==='firecat'){raidLob(tip,new THREE.Vector3(tg.x,islandH(RAID.il,tg.x,tg.z),tg.z),{aoe:4,dmg:s.dmg,burn:s.burn,kind:'fire'});e.cd=s.rate;}
    else if(e.t==='oil'){if(bd<s.rng){const p=new THREE.Vector3(e.x,e.y+1,e.z);puff(p,0x6A4A1A,8,.6,4,1,1);for(const u of att)if(Math.hypot(u.x-e.x,u.z-e.z)<s.aoe)hurtU(u,s.dmg);}e.cd=s.rate;}
    else if(e.t==='totem'){for(const u of att)if(Math.hypot(u.x-e.x,u.z-e.z)<s.rng)u.slowT=Math.max(u.slowT||0,.6);e.cd=.5;e.raiseT=(e.raiseT||s.raise)-.5;
      if(e.raiseT<=0){e.raiseT=s.raise;const dead=RAID.il.units.find(u=>u.team===1&&u.state==='dead'&&!u.raised&&Math.hypot(u.x-e.x,u.z-e.z)<30);if(dead){dead.raised=true;raiseSkeleton(dead.x,dead.z,1);}}}}}
function trapFire(e,u,att){const s=e.st,il=RAID.il;e.show=true;const p=new THREE.Vector3(e.x,e.y+.4,e.z);
  if(e.t==='pit'){u.stunT=Math.max(u.stunT||0,s.stun);hurtU(u,s.dmg);puff(p,0x8A7A50,6,.5,2,2,.6);destroyEnt(e,false);if(u.ai==='captain')banner('🕳 طحت في حفرة!',1000);}
  else if(e.t==='net'){for(const v of att)if(Math.hypot(v.x-e.x,v.z-e.z)<s.aoe)v.stunT=Math.max(v.stunT||0,s.root);puff(p,0xB8A880,5,.4,2,1,.6);destroyEnt(e,false);if(u.ai==='captain')banner('🕸 علقت في شبكة!',1000);}
  else if(e.t==='keg'){boom(p);for(const v of att)if(Math.hypot(v.x-e.x,v.z-e.z)<s.aoe)hurtU(v,s.dmg);destroyEnt(e,false);}}
function hurtU(u,d){if(u.state!=='alive')return;hurt(u,d);u.flash=.1;}
/* ---- projectiles lobbed by mortars, catapults and thrower units ---- */
const projGeo=new THREE.SphereGeometry(.35,8,6),projMat=new THREE.MeshStandardMaterial({color:0x1A1A1E,roughness:.6}),fireProjMat=new THREE.MeshBasicMaterial({color:0xFF8A2A});
function raidLob(from,to,o){const d=Math.max(1,Math.hypot(to.x-from.x,to.z-from.z)),tt=clamp(d/24,.5,2.4),m=new THREE.Mesh(projGeo,o.kind==='fire'?fireProjMat:projMat);m.position.copy(from);scene.add(m);
  (RAID.on?RAID.proj:FREE_PROJ).push({m,from:from.clone(),to:to.clone(),t:0,T:tt,o});}
const FREE_PROJ=[];
function updateRaidProj(dt){for(const L of[RAID.on?RAID.proj:null,FREE_PROJ]){if(!L)continue;for(let i=L.length-1;i>=0;i--){const q=L[i];q.t+=dt;const k=Math.min(1,q.t/q.T);
  q.m.position.lerpVectors(q.from,q.to,k);q.m.position.y+=Math.sin(k*Math.PI)*Math.max(4,q.from.distanceTo(q.to)*.28);if(q.o.kind==='fire'&&Math.random()<.5)puff(q.m.position.clone(),0xFFB040,1,.25,.3,.3,.25);
  if(k>=1){scene.remove(q.m);L.splice(i,1);projHit(q);}}}}
function projHit(q){const o=q.o,p=q.to;if(o.kind==='fire'){puff(p,0xFF8A2A,6,.6,3,3,.6);puff(p,0x5A5550,4,1,2,2,1.2);}else boom(p);
  const list=o.list||(RAID.on?RAID.il.units:[]),team=o.team==null?0:o.team;
  for(const u of list){if(u.team!==team||u.state!=='alive')continue;const d=Math.hypot(u.x-p.x,u.z-p.z);if(d<o.aoe){hurtU(u,o.dmg*(1-d/o.aoe*.5));if(o.burn)u.burnT=4,u.burnDps=o.burn;}}
  if(o.bld&&RAID.on)for(const k in RAID.il.ents){const e=RAID.il.ents[k];if(!e.alive||!e.show&&e.hidden)continue;if(Math.hypot(e.x-p.x,e.z-p.z)<(e.r||2)+o.aoe){damageEnt(e,o.dmg*o.bld);if(o.burn&&e.kind==='bld'){e.burnT=7;e.burnDps=o.burn;}}}
  if(o.bld&&RAID.on)for(const w of RAID.il.walls)if(w.alive&&Math.hypot(w.x-p.x,w.z-p.z)<3+o.aoe)damageWall(w,o.dmg*o.bld);}
function raiseSkeleton(x,z,team){const il=RAID.on?RAID.il:land&&land.il;if(!il)return null;const p=makePerson('skeleton','skeleton');p.utype='skeleton';const u=mkUnit(p,team,x,z,il.space,team===0?'crew':'soldier');
  scene.add(p.g);placeUnit(u);il.units.push(u);puff(new THREE.Vector3(x,islandH(il,x,z)+.5,z),0x6AFF8A,6,.35,2,2,.8);if(team===1){u.post={x,z};u.leash=30;u.aggro=40;u.raidDef=true;}return u;}
/* ---- damage to structures ---- */
function damageEnt(e,d){if(!e.alive)return;e.hp-=d;if(e.hp<=0)destroyEnt(e,true);else if(Math.random()<.3)puff(new THREE.Vector3(e.x,e.y+2,e.z),0x8A7A6A,2,.4,2,2,.5);}
function destroyEnt(e,visual){if(!e.alive)return;e.alive=false;for(const o of e.objs)disposeObj(o);e.objs=[];e.ring=null;const il=RAID.il,p=new THREE.Vector3(e.x,e.y+2,e.z);
  if(visual){boom(p);puff(p,0x5A5550,8,2,4,4,1.6);}if(e.t==='vault')RAID.vault=true;if(e.t==='castle'&&il.flagG){disposeObj(il.flagG);il.flagG=null;}
  if(e.t==='powder'){for(const u of il.units)if(u.state==='alive'&&Math.hypot(u.x-e.x,u.z-e.z)<9)hurtU(u,90);boom(p.clone().add(new THREE.Vector3(1,2,1)));}
  if(e.kind==='def'&&e.hidden&&!visual){}RAID.dirty=true;RAID.dirtyT=.25;}
function damageWall(w,d){if(!w.alive)return;w.hp-=d;if(w.hp<=0){w.alive=false;const p=new THREE.Vector3(w.x,w.y+2,w.z);boom(p);puff(p,0x8A7A6A,8,1.4,4,3,1.2);RAID.dirty=true;RAID.dirtyT=.1;}}
/* structures a unit can hit in front of it */
function structNear(x,z,r,prefer){const il=RAID.il;let best=null,bd=1e9;for(const k in il.ents){const e=il.ents[k];if(!e.alive||(e.hidden&&!e.show)||e.spot==='water'||e.spot==='harbor')continue;
    const d=Math.hypot(e.x-x,e.z-z)-(e.r||2)-(prefer&&prefer(e)?12:0);if(d<r&&d<bd){bd=d;best=e;}}
  for(const w of il.walls){if(!w.alive)continue;const d=Math.hypot(w.x-x,w.z-z)-2;if(d<r&&d<bd){bd=d;best={wall:w,x:w.x,z:w.z,r:2};}}return best;}
function hitStructAt(x,z,r,dmg){if(!RAID.on||land.il!==RAID.il)return false;const s=structNear(x,z,r);if(!s)return false;if(s.wall)damageWall(s.wall,dmg);else damageEnt(s,dmg);sparks(new THREE.Vector3(x,islandH(RAID.il,x,z)+1.4,z),.6);return true;}
/* attackers with nobody to fight go for buildings, defences and walls */
function raidStructAI(u,dt){const il=RAID.il;const pref=u.utype==='bomber'||u.utype==='giant'?e=>e.kind==='def':u.utype==='looter'||u.utype==='tamer'?e=>e.t==='store'||e.t==='vault':u.utype==='diver'?e=>e.spot==='sea':null;
  if(!u.sTgt||!(u.sTgt.wall?u.sTgt.wall.alive:u.sTgt.alive)){u.sTgt=structNear(u.x,u.z,140,pref);}const t=u.sTgt;if(!t)return null;
  const dx=t.x-u.x,dz=t.z-u.z,d=Math.hypot(dx,dz),reach=(t.r||2)+1.5;
  if(d>reach){/* blocked by a wall? hit the wall in the way */if(u.lastX!=null&&Math.hypot(u.x-u.lastX,u.z-u.lastZ)<dt*.4){u.stuck=(u.stuck||0)+dt;if(u.stuck>.8){const w=il.walls.find(w=>w.alive&&Math.hypot(w.x-u.x,w.z-u.z)<4.2);if(w){u.sTgt={wall:w,x:w.x,z:w.z,r:2};u.stuck=0;}}}else u.stuck=0;
    u.lastX=u.x;u.lastZ=u.z;return{mx:dx/d,mz:dz/d,sp:3.6};}
  u.g.rotation.y=Math.atan2(dx,dz);if(u.cd<=0&&!u.act){startAct(u,pick(['eSlashA','eChop','eSlashB']),{});u.cd=1+Math.random()*.6;
    const bm=(SH.unitDef(u.utype)||{}).bld||1;setTimeout(()=>{if(u.state!=='alive')return;const dm=14*(u.dmg||1)*bm;if(t.wall)damageWall(t.wall,dm);else damageEnt(t,dm);},420);}
  return{mx:0,mz:0,sp:0};}
/* ---- ending the raid ---- */
function raidFinish(flag){if(!RAID.on||RAID.ended)return;RAID.ended=true;const R=RAID,il=R.il;R.flag=!!flag;
  for(const u of il.units)if(u.team===0&&u.state==='alive'&&u.ai==='crew'){}/* survivors go back with the captain */
  act({t:'raidEnd',raid:R.rid,pct:flag?100:Math.round(R.pct),flag:!!flag,lost:R.lost,vault:R.vault},true).catch(()=>{});
  if(flag&&il.flagM){il.flagM.material.map=flagTexFor(myPub());il.flagM.material.needsUpdate=true;}
  setTimeout(()=>raidCleanup(il),flag?2500:300);}
function raidCleanup(il){for(const u of il.units.slice())if(u.team===1){scene.remove(u.g);il.units.splice(il.units.indexOf(u),1);const j=PEOPLE.indexOf(u);if(j>=0)PEOPLE.splice(j,1);}
  for(const q of RAID.proj||[])scene.remove(q.m);RAID={on:false};$('aFlag').classList.add('hide');if(mode==='foot'&&land&&land.il===il)endFoot();requestLayout(il);}
function raidResultShow(m){const L=resTxt(m.loot);banner((m.win?'🏴 انتصار! ':'⚔️ انتهت الغزوة · ')+m.pct+'% '+L+(m.bounty?' + مكافأة '+m.bounty:'')+' · '+(m.honor>0?'+':'')+m.honor+' شرف',4200);}
/* crew deaths while raiding count as raid losses */
function noteDeath(u){if(!u||u.team!==0||!u.utype||u.ai==='captain')return;if(RAID.on&&RAID.il&&RAID.il.units.includes(u)){if(!u._lossNoted){u._lossNoted=true;RAID.lost[u.utype]=(RAID.lost[u.utype]||0)+1;}}else noteCrewDeath(u);}
/* ================= NPC colonies: capture gives loot (server cooldown), the crown takes it back later ================= */
function npcCaptured(il){const idx=islands.indexOf(il),size=il.huge?'huge':il.big?'big':il.col?'col':'small';const lost={};for(const k in LOSS.units){lost[k]=LOSS.units[k];}LOSS.units={};
  act({t:'npcRaid',idx,size,name:il.name,lost},true).catch(e=>banner(esc(e.message),2400));il.capT=performance.now();}
function npcColonyTick(){for(const il of islands){if(!il.capT||il.owner!=='player')continue;if(performance.now()-il.capT<SH.RAID.npcCd*1000)continue;il.capT=0;il.owner='crown';
    if(il.town&&il.town.flag){il.town.flag.m.material.map=TEX_CROWN;il.town.flag.m.material.needsUpdate=true;}for(const f of il.forts){f.alive=true;f.hp=f.max;f.mesh.visible=true;}
    for(const u of il.units.slice())if(u.ai==='soldier'&&u.state==='dead'){scene.remove(u.g);il.units.splice(il.units.indexOf(u),1);}
    const t=il.town;if(t)for(let i=0;i<(il.huge?10:7);i++){const a=Math.random()*6.28,r=4+Math.random()*12,p=makePerson('soldier',i%3===2?'musket':'sword'),u=mkUnit(p,1,t.x+Math.cos(a)*r,t.z+Math.sin(a)*r,il.space,'soldier');u.tx=u.x;u.tz=u.z;scene.add(p.g);placeUnit(u);il.units.push(u);}}}
/* ================= sea PvP: aiming and firing at other captains ================= */
function pvpAimCandidates(consider){for(const R of REMOTE.values()){if(!pvpTargetable(R)||!R.mesh.visible)continue;const c=new THREE.Vector3(R.x,R.mesh.position.y+3*R.S,R.z);
  consider(c,()=>{const tf=Math.hypot(R.x-P.x,R.z-P.z)/(VB*.92),sp=R.speed||0;return new THREE.Vector3(R.x+Math.sin(R.rot)*sp*tf,1.5,R.z+Math.cos(R.rot)*sp*tf);});}}
function pvpAutoTarget(best,bd){for(const R of REMOTE.values()){if(!pvpTargetable(R)||!R.mesh.visible)continue;const d=Math.hypot(R.x-P.x,R.z-P.z);if(d<175&&d<bd){const [lx,lz]=toLocal(P,R.x,R.z);if(Math.abs(lx)/Math.hypot(lx,lz)>.6){bd=d;const tf=d/(VB*.92);best=new THREE.Vector3(R.x+Math.sin(R.rot)*(R.speed||0)*tf,1.5,R.z+Math.cos(R.rot)*(R.speed||0)*tf);}}}return[best,bd];}
function pvpFired(target){const [lx]=toLocal(P,target.x,target.z),side=lx>=0?1:-1;let tgt='';for(const R of REMOTE.values()){if(Math.hypot(R.x-target.x,R.z-target.z)<40){tgt=R.id;break;}}
  netSend({t:'fire',side,n:P.mesh.userData.guns.length/2,tgt});}
/* raid structures hit by my cannonballs */
function raidBallHit(p,dmg){if(!RAID.on)return false;const il=RAID.il;for(const k in il.ents){const e=il.ents[k];if(!e.alive||(e.hidden&&!e.show))continue;
    if(e.t==='harbor'){const a=e.S.a,dx=p.x-e.x,dz=p.z-e.z,lat=Math.abs(-dx*Math.sin(a)+dz*Math.cos(a)),along=Math.abs(dx*Math.cos(a)+dz*Math.sin(a));if(lat<30&&along<4&&p.y<4){damageEnt(e,dmg*2);return true;}continue;}
    if(e.spot==='water'||e.spot==='trap')continue;if(Math.hypot(p.x-e.x,p.z-e.z)<(e.r||2.5)+2.2&&p.y<e.y+(e.kind==='bld'?10:7)){damageEnt(e,dmg*1.6);return true;}}
  for(const w of il.walls)if(w.alive&&Math.hypot(p.x-w.x,p.z-w.z)<3.4&&p.y<w.y+6){damageWall(w,dmg*1.4);return true;}return false;}
/* ship status effects from chain shot and fire */
function shipEffects(dt){if(!RAID.on)return;const now=performance.now();if(RAID.slowPending&&now>RAID.slowPending.t){P.slowT=5;P.slowK=RAID.slowPending.k;RAID.slowPending=null;banner('⛓ السلاسل قطّعت أشرعتك',1200);}
  if(RAID.burnPending&&now>RAID.burnPending.t){P.burnT=6;P.burnDps=RAID.burnPending.dps;RAID.burnPending=null;}
  if(P.burnT>0){P.burnT-=dt;P.hull-=P.burnDps*dt;if(Math.random()<dt*6)puff(new THREE.Vector3(P.x+(Math.random()-.5)*6,P.mesh.position.y+3,P.z+(Math.random()-.5)*10),0xFF8A2A,1,.6,1,2,.5);if(P.hull<=0)sinkShip(P);}
  if(P.slowT>0)P.slowT-=dt;}
