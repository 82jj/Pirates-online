'use strict';
/* قراصنة البحر أونلاين — game server: accounts, persistent islands, economy, clans, alliances, raids, live sea presence */
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto'),zlib=require('zlib');
const {WebSocketServer}=require('./vendor/ws');
const SH=require('./shared.js');
const PORT=+process.env.PORT||8080;
const DATA_DIR=(()=>{for(const d of[process.env.DATA_DIR,'/data',path.join(__dirname,'data')]){if(!d)continue;try{fs.mkdirSync(d,{recursive:true});fs.accessSync(d,fs.constants.W_OK);return d;}catch(e){}}return __dirname;})();
const DB_FILE=path.join(DATA_DIR,'world.json');
const PUBLIC=path.join(__dirname,'public');
const now=()=>Date.now();
const H=3600e3,MIN=60e3;
const TEST_ANYWHERE=!!process.env.TEST_ANYWHERE;
const clampN=(v,a,b)=>Math.max(a,Math.min(b,v));
const isInt=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
const num=(v,a,b,d)=>{v=+v;return Number.isFinite(v)?clampN(v,a,b):d;};
const str=(v,max)=>typeof v==='string'?v.slice(0,max):'';
/* ================= persistence ================= */
let DB=null;
function freshDB(){return{v:1,seq:1,players:{},names:{},clans:{},tags:{},slots:{},created:now(),season:{n:1,start:now(),end:now()+7*24*H},feed:[]};}
function load(){for(const f of[DB_FILE,DB_FILE+'.bak']){try{const d=JSON.parse(fs.readFileSync(f,'utf8'));if(d&&d.players){DB=d;console.log('loaded',f,Object.keys(d.players).length,'players');return;}}catch(e){}}DB=freshDB();console.log('new world in',DATA_DIR);}
let dirty=false;const touch=()=>{dirty=true;};
function save(force){if(!dirty&&!force)return;dirty=false;try{const s=JSON.stringify(DB);fs.writeFileSync(DB_FILE+'.tmp',s);try{if(fs.existsSync(DB_FILE))fs.copyFileSync(DB_FILE,DB_FILE+'.bak');}catch(e){}fs.renameSync(DB_FILE+'.tmp',DB_FILE);}catch(e){console.error('save failed',e.message);dirty=true;}}
load();
setInterval(save,8000);
for(const sig of['SIGTERM','SIGINT'])process.on(sig,()=>{save(true);process.exit(0);});
/* ================= accounts ================= */
const hashPass=(pass,salt)=>crypto.scryptSync(pass,salt,32).toString('hex');
const nameKey=n=>n.toLowerCase();
function freeSlot(){for(let i=0;i<SH.SLOTS;i++)if(!DB.slots[i])return i;
  /* world full: hand over the slot of the longest-absent player who has been away for 30 days */
  let best=null;for(const id in DB.players){const p=DB.players[id];if(p.slot!=null&&now()-p.seen>30*24*H&&(!best||p.seen<best.seen))best=p;}
  if(best){const s=best.slot;best.slot=null;return s;}return null;}
function newPlayer(name,pass){const t=now(),id='p'+(DB.seq++).toString(36)+crypto.randomBytes(2).toString('hex'),salt=crypto.randomBytes(12).toString('hex'),slot=freeSlot();
  const p={id,name,salt,hash:hashPass(pass,salt),tokens:[],created:t,seen:t,slot,
    res:{gold:2500,wood:1800,iron:500,food:500,powder:200},resT:t,pop:14,
    bld:{0:{t:'castle',l:1},1:{t:'shipyard',l:1},2:{t:'house',l:1},3:{t:'house',l:1},4:{t:'farm',l:1},5:{t:'sawmill',l:1},6:{t:'tavern',l:1},7:{t:'barracks',l:1},8:{t:'store',l:1},9:{t:'bell',l:1}},
    def:{sea0:{t:'cannon',l:1},land0:{t:'tower',l:1},trap0:{t:'pit',l:1}},wall:0,wallDone:0,
    garrison:{guard:2,crew:1,sword:2},
    ships:[{id:'s1',t:'sloop',up:{hull:0,guns:0,sails:0,crew:0},sail:0,fig:0,crew:{sailor:6,sword:2,rifle:1,repair:1},done:0}],
    shipSeq:2,flagship:'s1',flag:SH.defaultFlag(),clan:null,allies:[],allyIn:[],exAlly:{},
    shield:process.env.TEST_NOSHIELD?0:t+SH.RAID.newShieldH*H,traitor:0,bounty:0,honor:0,logs:[],npcCd:{},stats:{raids:0,wins:0,defs:0,defWins:0,sunk:0,lost:0},rev:1,gainLog:[]};
  DB.players[id]=p;DB.names[nameKey(name)]=id;if(slot!=null)DB.slots[slot]=id;touch();return p;}
function newToken(p){const tk=crypto.randomBytes(24).toString('hex');p.tokens.push(tk);if(p.tokens.length>6)p.tokens.shift();touch();return tk;}
/* ================= economy ================= */
function clanOf(p){return p.clan?DB.clans[p.clan]||null:null;}
function accrue(p,t){t=t||now();const dt=(t-p.resT)/MIN;if(dt<.002)return;const c=clanOf(p),rates=SH.prodRates(p,t,c?SH.clanLvl(c.xp):1),cap=SH.storeCap(p,t);
  for(const r of SH.RES){const v=p.res[r]||0,nv=v+rates[r]*dt;p.res[r]=rates[r]>=0?(v>=cap?v:Math.min(cap,nv)):Math.max(0,nv);}
  const pc=SH.popCap(p,t);if((p.pop||0)<pc&&p.res.food>1)p.pop=Math.min(pc,(p.pop||0)+3*dt);else if(p.pop>pc)p.pop=pc;
  p.resT=t;}
function priv(p){const t=now();accrue(p,t);const o={};for(const k in p)if(k!=='salt'&&k!=='hash'&&k!=='tokens'&&k!=='gainLog')o[k]=p[k];
  const c=clanOf(p);o.rates=SH.prodRates(p,t,c?SH.clanLvl(c.xp):1);o.cap=SH.storeCap(p,t);o.popCap=SH.popCap(p,t);o.online=true;return o;}
function pub(p){const fs=(p.ships||[]).find(s=>s.id===p.flagship)||p.ships[0],c=clanOf(p),t=now();
  return{id:p.id,name:p.name,slot:p.slot,flag:p.flag,clan:c?c.id:null,tag:c?c.tag:null,lead:c?c.leader:null,castle:SH.castleL(p),honor:p.honor|0,
    shield:p.shield>t?p.shield:0,traitor:p.traitor>t?p.traitor:0,bounty:p.traitor>t?p.bounty:0,online:!!CONN.get(p.id),rev:p.rev||1,
    ship:fs?{t:fs.t,sail:fs.sail,fig:fs.fig}:null};}
function layout(p,forRaid){const L={id:p.id,bld:p.bld,wall:p.wall,flag:p.flag,rev:p.rev||1,def:{}};
  for(const k in p.def){const d=p.def[k],dd=SH.DEF[d.t];if(forRaid||!(dd.st(1).hidden))L.def[k]=d;}
  if(forRaid){const t=now();accrue(p,t);L.garrison=p.garrison;L.militia=SH.militiaN(p,t);L.vault=SH.vaultL(p,t);L.res=SH.lootFor(p,100,t,0);L.castle=SH.castleL(p);L.pop=Math.floor(p.pop||0);}
  return L;}
function bumpRev(p){p.rev=(p.rev||1)+1;}
function log(p,e){e.t=now();p.logs.unshift(e);if(p.logs.length>40)p.logs.length=40;touch();}
/* ================= connections ================= */
const CONN=new Map();/* pid -> conn */
function send(c,m){if(c&&c.ws.readyState===1)c.ws.send(JSON.stringify(m));}
function sendP(pid,m){send(CONN.get(pid),m);}
function broadcast(m,except){const s=JSON.stringify(m);for(const c of CONN.values())if(c.pid!==except&&c.ws.readyState===1)c.ws.send(s);}
function feed(text){DB.feed.unshift({t:now(),text});if(DB.feed.length>30)DB.feed.length=30;broadcast({t:'feed',text});}
function pushMe(p){const c=CONN.get(p.id);if(c)send(c,{t:'me',me:priv(p),now:now()});}
function pushWorld(p){bumpRev(p);broadcast({t:'wp',p:pub(p)});}
function err(c,msg,rid){send(c,{t:'err',msg,rid});}
function ok(c,rid,extra){send(c,Object.assign({t:'ok',rid},extra||{}));}
/* ================= handlers ================= */
const HANDLERS={};
const on=(t,fn)=>{HANDLERS[t]=fn;};
function needP(c){const p=c.pid&&DB.players[c.pid];if(!p)throw new UErr('سجّل دخولك أولاً');return p;}
class UErr extends Error{}
const fail=m=>{throw new UErr(m);};
/* ---- auth ---- */
function login(c,p){const old=CONN.get(p.id);if(old&&old!==c){send(old,{t:'kicked',msg:'دخلت من جهاز ثاني'});try{old.ws.close();}catch(e){}}
  c.pid=p.id;CONN.set(p.id,c);p.seen=now();if(p.slot==null){const s=freeSlot();if(s!=null){p.slot=s;DB.slots[s]=p.id;}}touch();
  const world=Object.values(DB.players).filter(q=>q.slot!=null).map(pub),c2=clanOf(p);
  send(c,{t:'welcome',me:priv(p),world,clan:c2?clanView(c2):null,now:now(),feed:DB.feed.slice(0,10),season:DB.season,v:SH.VERSION,ev:[...EV.list.values()].map(evPub)});
  broadcast({t:'wp',p:pub(p)},p.id);}
on('register',(c,m)=>{const name=str(m.name,16).trim(),pass=str(m.pass,64);
  if(!SH.validName(name))fail('الاسم من 3 إلى 16 حرف (عربي أو إنجليزي أو أرقام)');if(pass.length<4)fail('كلمة المرور 4 أحرف على الأقل');
  if(DB.names[nameKey(name)])fail('الاسم مأخوذ، اختر اسماً ثانياً');const p=newPlayer(name,pass);const tk=newToken(p);send(c,{t:'token',token:tk,name:p.name});login(c,p);});
on('login',(c,m)=>{const name=str(m.name,16).trim(),pass=str(m.pass,64),id=DB.names[nameKey(name)],p=id&&DB.players[id];
  if(!p||hashPass(pass,p.salt)!==p.hash)fail('الاسم أو كلمة المرور غلط');const tk=newToken(p);send(c,{t:'token',token:tk,name:p.name});login(c,p);});
on('resume',(c,m)=>{const tk=str(m.token,64);for(const id in DB.players){const p=DB.players[id];if(p.tokens.includes(tk)){login(c,p);return;}}send(c,{t:'needLogin'});});
on('logout',(c,m)=>{const p=needP(c);p.tokens=p.tokens.filter(t=>t!==str(m.token,64));touch();CONN.delete(p.id);c.pid=null;broadcast({t:'wp',p:pub(p)});});
on('me',(c)=>{pushMe(needP(c));});
/* ---- building ---- */
function plotOk(k){return isInt(k,0,SH.LAYOUT.plots-1);}
function spotOk(s){const m=/^([a-z]+)(\d+)$/.exec(s||'');return!!m&&SH.LAYOUT[m[1]]!=null&&+m[2]<SH.LAYOUT[m[1]]?m[1]:null;}
/* island development happens only at the captain's own island: his ship near it, or him walking on it */
function atHome(c,p){const a=c.pos;if(!a||now()-c.posT>120000||a[12]===1||p.slot==null)return false;const R=SH.slotPos(p.slot).r+320;
  return homeDist(p,a[0],a[1])<R||(a[4]===1&&homeDist(p,a[7],a[9])<R);}
function needHome(c,p){if(!TEST_ANYWHERE&&!atHome(c,p))fail('ارجع لجزيرتك عشان تبني وتطوّر');}
function needBuilder(p,t){if(SH.busyBuilders(p,t)>=SH.builders(p))fail('كل البنّائين مشغولين؛ انتظر أو سرّع بناءً');}
on('build',(c,m)=>{const p=needP(c),t=now();needHome(c,p);accrue(p,t);const k=m.plot,type=m.type,d=SH.BLD[type];
  if(!plotOk(k)||k<2||!d||d.fixed!=null)fail('مكان غير صالح');if(p.bld[k])fail('المكان مشغول');const cl=SH.castleL(p);
  if(d.req&&cl<d.req)fail('يحتاج قلعة مستوى '+d.req);if(SH.countOf(p,type)>=d.count(cl))fail('وصلت الحد الأعلى لهذا المبنى؛ طوّر القلعة');
  needBuilder(p,t);const cost=d.cost(1);if(!SH.canAfford(p,cost))fail('الموارد ما تكفي');SH.pay(p,cost);p.bld[k]={t:type,l:1,done:t+d.time(1)*1000};touch();pushMe(p);pushWorld(p);});
on('upgrade',(c,m)=>{const p=needP(c),t=now();needHome(c,p);accrue(p,t);const b=plotOk(m.plot)&&p.bld[m.plot];if(!b)fail('ما فيه مبنى');const d=SH.BLD[b.t];
  if(b.done>t)fail('المبنى قيد البناء');if(b.l>=d.max)fail('أعلى مستوى');if(b.t!=='castle'&&b.l+1>SH.castleL(p))fail('طوّر القلعة أولاً');
  needBuilder(p,t);const cost=d.cost(b.l+1);if(!SH.canAfford(p,cost))fail('الموارد ما تكفي');SH.pay(p,cost);b.l++;b.done=t+d.time(b.l)*1000;touch();pushMe(p);pushWorld(p);});
on('defBuild',(c,m)=>{const p=needP(c),t=now();needHome(c,p);accrue(p,t);const kind=spotOk(m.spot),d=SH.DEF[m.type];if(!kind||!d||d.spot!==kind)fail('مكان غير صالح');
  if(p.def[m.spot])fail('المكان مشغول');const cl=SH.castleL(p);if(d.req&&cl<d.req)fail('يحتاج قلعة مستوى '+d.req);
  if(SH.countOf(p,m.type,'def')>=d.count(cl))fail('وصلت الحد الأعلى؛ طوّر القلعة');needBuilder(p,t);const cost=d.cost(1);if(!SH.canAfford(p,cost))fail('الموارد ما تكفي');
  SH.pay(p,cost);p.def[m.spot]={t:m.type,l:1,done:t+d.time(1)*1000};touch();pushMe(p);pushWorld(p);});
on('defUpgrade',(c,m)=>{const p=needP(c),t=now();needHome(c,p);accrue(p,t);const b=spotOk(m.spot)&&p.def[m.spot];if(!b)fail('ما فيه دفاع هنا');const d=SH.DEF[b.t];
  if(b.done>t)fail('قيد البناء');if(b.l>=d.max)fail('أعلى مستوى');if(b.l+1>SH.castleL(p))fail('طوّر القلعة أولاً');needBuilder(p,t);
  const cost=d.cost(b.l+1);if(!SH.canAfford(p,cost))fail('الموارد ما تكفي');SH.pay(p,cost);b.l++;b.done=t+d.time(b.l)*1000;touch();pushMe(p);pushWorld(p);});
on('defRemove',(c,m)=>{const p=needP(c);needHome(c,p);const b=spotOk(m.spot)&&p.def[m.spot];if(!b)fail('ما فيه دفاع هنا');delete p.def[m.spot];touch();pushMe(p);pushWorld(p);});
on('bldRemove',(c,m)=>{const p=needP(c);needHome(c,p);const b=plotOk(m.plot)&&m.plot>1&&p.bld[m.plot];if(!b)fail('ما تقدر تشيله');delete p.bld[m.plot];touch();pushMe(p);pushWorld(p);});
on('wallUp',(c)=>{const p=needP(c),t=now();needHome(c,p);accrue(p,t);if(p.wallDone>t)fail('السور قيد البناء');if(p.wall>=SH.WALL.max)fail('أعلى مستوى');if(p.wall+1>SH.castleL(p))fail('طوّر القلعة أولاً');
  needBuilder(p,t);const cost=SH.WALL.cost(p.wall+1);if(!SH.canAfford(p,cost))fail('الموارد ما تكفي');SH.pay(p,cost);p.wall++;p.wallDone=t+SH.WALL.time(p.wall)*1000;touch();pushMe(p);pushWorld(p);});
on('speed',(c,m)=>{const p=needP(c),t=now();accrue(p,t);let b=null,set=null;
  if(m.col==='bld'&&plotOk(m.key))b=p.bld[m.key];else if(m.col==='def'&&spotOk(m.key))b=p.def[m.key];else if(m.col==='wall'){if(p.wallDone>t){const cost=SH.speedCost((p.wallDone-t)/1000);if(p.res.gold<cost)fail('الذهب ما يكفي');p.res.gold-=cost;p.wallDone=t;touch();pushMe(p);pushWorld(p);return;}}
  else if(m.col==='ship'){b=p.ships.find(s=>s.id===m.key);}
  if(!b||!(b.done>t))fail('ما فيه شي يتسرّع');const cost=SH.speedCost((b.done-t)/1000);if(p.res.gold<cost)fail('الذهب ما يكفي');p.res.gold-=cost;b.done=t;touch();pushMe(p);pushWorld(p);});
/* ---- units ---- */
function shipById(p,id){return p.ships.find(s=>s.id===id);}
function garrisonSpace(p,t){return SH.armyCap(p,t)-SH.spaceOf(p.garrison);}
function shipSpace(s){return SH.crewCap(s)-SH.spaceOf(s.crew);}
on('recruit',(c,m)=>{const p=needP(c),t=now();needHome(c,p);accrue(p,t);const d=SH.PUNITS[m.type],n=m.n|0;if(!d||n<1||n>30)fail('غير صالح');
  if(d.tier>SH.tavernL(p,t))fail('تحتاج حانة مستوى '+d.tier);const cost={};for(const r in d.cost)cost[r]=d.cost[r]*n;if(!SH.canAfford(p,cost))fail('الموارد ما تكفي');
  let dest;if(m.to==='g'){if(garrisonSpace(p,t)<d.sp*n)fail('الثكنة ممتلئة');dest=p.garrison;}else{const s=shipById(p,m.to||p.flagship);if(!s||s.done>t)fail('السفينة غير جاهزة');if(shipSpace(s)<d.sp*n)fail('السفينة ممتلئة');dest=s.crew;}
  SH.pay(p,cost);dest[m.type]=(dest[m.type]||0)+n;touch();pushMe(p);});
on('train',(c,m)=>{const p=needP(c),t=now();needHome(c,p);accrue(p,t);const d=SH.DUNITS[m.type],n=m.n|0;if(!d||n<1||n>30)fail('غير صالح');
  if(d.tier>SH.barracksL(p,t))fail('تحتاج ثكنة مستوى '+d.tier);if(garrisonSpace(p,t)<d.sp*n)fail('الثكنة ممتلئة');const cost={};for(const r in d.cost)cost[r]=d.cost[r]*n;if(!SH.canAfford(p,cost))fail('الموارد ما تكفي');
  SH.pay(p,cost);p.garrison[m.type]=(p.garrison[m.type]||0)+n;touch();pushMe(p);});
on('move',(c,m)=>{const p=needP(c),t=now();needHome(c,p);const d=SH.unitDef(m.type),n=m.n|0;if(!d||n<1||n>60)fail('غير صالح');
  const from=m.from==='g'?p.garrison:(shipById(p,m.from)||{}).crew,toShip=m.to!=='g'&&shipById(p,m.to),to=m.to==='g'?p.garrison:toShip&&toShip.crew;
  if(!from||!to||from===to)fail('غير صالح');if((from[m.type]||0)<n)fail('العدد ما يكفي');if(toShip&&SH.DUNITS[m.type])fail('حرّاس الجزيرة ما يركبون السفن');if(toShip&&toShip.done>t)fail('السفينة غير جاهزة');
  if(m.to==='g'?garrisonSpace(p,t)<d.sp*n:shipSpace(toShip)<d.sp*n)fail('ما فيه مكان');
  from[m.type]-=n;if(!from[m.type])delete from[m.type];to[m.type]=(to[m.type]||0)+n;touch();pushMe(p);});
on('dismiss',(c,m)=>{const p=needP(c);needHome(c,p);const n=m.n|0,from=m.from==='g'?p.garrison:(shipById(p,m.from)||{}).crew;if(!from||n<1||(from[m.type]||0)<n)fail('غير صالح');
  from[m.type]-=n;if(!from[m.type])delete from[m.type];touch();pushMe(p);});
/* ---- ships ---- */
on('shipBuild',(c,m)=>{const p=needP(c),t=now();needHome(c,p);accrue(p,t);const d=SH.SHIPS[m.type];if(!d)fail('غير صالح');if(SH.yardL(p,t)<d.yard)fail('يحتاج حوض سفن مستوى '+d.yard);
  if(p.ships.length>=SH.fleetCap(p,t))fail('الأسطول ممتلئ؛ طوّر حوض السفن');if(p.ships.some(s=>s.done>t))fail('الحوض يبني سفينة الحين');if(!SH.canAfford(p,d.cost))fail('الموارد ما تكفي');
  SH.pay(p,d.cost);const s={id:'s'+(p.shipSeq++),t:m.type,up:{hull:0,guns:0,sails:0,crew:0},sail:p.ships[0]?p.ships[0].sail:0,fig:0,crew:{},done:t+d.time*1000};p.ships.push(s);touch();pushMe(p);});
on('shipUp',(c,m)=>{const p=needP(c),t=now();needHome(c,p);accrue(p,t);const s=shipById(p,m.id);if(!s||!SH.SHIP_UP[m.part])fail('غير صالح');const l=(s.up[m.part]||0)+1;if(l>SH.SHIP_UP_MAX)fail('أعلى مستوى');
  if(l>SH.yardL(p,t))fail('طوّر حوض السفن أولاً');const cost=SH.shipUpCost(s.t,m.part,l);if(!SH.canAfford(p,cost))fail('الموارد ما تكفي');SH.pay(p,cost);s.up[m.part]=l;touch();pushMe(p);if(s.id===p.flagship)pushWorld(p);});
on('shipStyle',(c,m)=>{const p=needP(c);needHome(c,p);const s=shipById(p,m.id);if(!s)fail('غير صالح');if(m.sail!=null){if(!isInt(m.sail,0,SH.SAILS.length-1))fail('غير صالح');s.sail=m.sail;}
  if(m.fig!=null){if(!isInt(m.fig,0,SH.FIGS.length-1))fail('غير صالح');s.fig=m.fig;}touch();pushMe(p);if(s.id===p.flagship)pushWorld(p);});
on('flagship',(c,m)=>{const p=needP(c),t=now();needHome(c,p);const s=shipById(p,m.id);if(!s||s.done>t)fail('السفينة غير جاهزة');p.flagship=s.id;touch();pushMe(p);pushWorld(p);});
on('shipScrap',(c,m)=>{const p=needP(c),t=now();needHome(c,p);const s=shipById(p,m.id);if(!s||p.ships.length<2||s.id===p.flagship)fail('ما تقدر تفكك هذي السفينة');
  for(const u in s.crew){const d=SH.unitDef(u),k=Math.min(s.crew[u],Math.floor(garrisonSpace(p,t)/(d?d.sp:1)));if(k>0)p.garrison[u]=(p.garrison[u]||0)+k;}
  const d=SH.SHIPS[s.t];for(const r in d.cost)p.res[r]=(p.res[r]||0)+Math.floor(d.cost[r]*.3);p.ships=p.ships.filter(q=>q!==s);touch();pushMe(p);});
/* ---- flag ---- */
on('flag',(c,m)=>{const p=needP(c);if(!SH.validFlag(m.flag))fail('علم غير صالح');p.flag=m.flag;touch();pushMe(p);pushWorld(p);
  const cl=clanOf(p);if(cl&&cl.leader===p.id)for(const id in cl.members)if(id!==p.id){const q=DB.players[id];if(q)broadcast({t:'wp',p:pub(q)});}});
/* ---- resource gains from the open world (trees, rocks, hunting, chests, wrecks, sunk AI ships) ---- */
const GAIN_CAP={tree:{wood:30},ore:{iron:20},hunt:{food:40},fish:{food:12},chest:{gold:700,wood:40,iron:12,food:30},cave:{gold:1500,iron:9},deck:{gold:800,iron:4,wood:8},dig:{gold:600,iron:6},wreck:{gold:1050,wood:40,iron:10},ship:{gold:450,wood:60,iron:20},board:{gold:1000,wood:40,iron:10},fort:{gold:300},bird:{food:4},coin:{gold:15}};
const GAIN_CD={chest:8e3,cave:8e3,deck:8e3,dig:8e3,wreck:10e3,board:20e3,ship:5e3,fort:4e3};
/* treasure is generated on each player's screen, so the server limits how much of it counts per hour */
const GAIN_HOUR={chest:10,cave:4,deck:6,dig:8,wreck:8,ship:40,board:15,fort:20,coin:60};
on('gain',(c,m)=>{const p=needP(c),t=now();const cap=GAIN_CAP[m.src];if(!cap)fail('غير صالح');p.gainCd=p.gainCd||{};if(GAIN_CD[m.src]){if(p.gainCd[m.src]&&t-p.gainCd[m.src]<GAIN_CD[m.src])return;p.gainCd[m.src]=t;}
  if(GAIN_HOUR[m.src]){p.gainH=p.gainH||{};const L=(p.gainH[m.src]||[]).filter(x=>t-x<H);if(L.length>=GAIN_HOUR[m.src]){p.gainH[m.src]=L;send(c,{t:'toast',msg:'هذا النوع من الغنائم خلص لهالساعة؛ جرّب بعدين'});return;}L.push(t);p.gainH[m.src]=L;}p.gainLog=(p.gainLog||[]).filter(x=>t-x[0]<MIN);
  const used=p.gainLog.reduce((a,x)=>a+x[1],0);if(used>5000)fail('هدّي اللعب شوي');let tot=0;accrue(p,t);
  for(const r in cap){const v=Math.max(0,Math.min(cap[r],num(m[r],0,cap[r],0)))|0;if(v){p.res[r]=(p.res[r]||0)+v;tot+=v;}}p.gainLog.push([t,tot]);touch();pushMe(p);});
on('pay',(c,m)=>{/* small client-side spends (repairs with wood/gold, reloading) */const p=needP(c);accrue(p);const cost={};for(const r of SH.RES){const v=num(m[r],0,5000,0)|0;if(v)cost[r]=v;}
  if(!SH.canAfford(p,cost))fail('الموارد ما تكفي');SH.pay(p,cost);touch();pushMe(p);ok(c,m.rid);});
on('crewLoss',(c,m)=>{/* crew killed in sea battles / boarding: m.ship, m.units {type:n} */const p=needP(c);const s=shipById(p,m.ship||p.flagship);if(!s)return;
  for(const u in(m.units||{})){const n=Math.max(0,m.units[u]|0);if(s.crew[u]){s.crew[u]=Math.max(0,s.crew[u]-n);if(!s.crew[u])delete s.crew[u];}}touch();pushMe(p);});
/* ---- presence at sea ---- */
on('p',(c,m)=>{const p=needP(c);const a=m.a;if(!Array.isArray(a)||a.length<7)return;c.pos=a.map(v=>+v||0);c.posT=now();});
on('fire',(c,m)=>{const p=needP(c);if(!c.pos)return;const t=now();if(c.fireT&&t-c.fireT<700)return;c.fireT=t;
  const out={t:'fire',id:p.id,side:m.side===1?1:-1,n:clampN(m.n|0,1,8),tgt:str(m.tgt||'',24)};for(const o of CONN.values())if(o!==c&&o.pos&&Math.hypot(o.pos[0]-c.pos[0],o.pos[1]-c.pos[1])<1500)send(o,out);});
function relation(a,b){if(a.clan&&a.clan===b.clan)return'clan';if(a.allies.includes(b.id))return'ally';return'enemy';}
function homeDist(p,x,z){if(p.slot==null)return 1e9;const s=SH.slotPos(p.slot);return Math.hypot(s.x-x,s.z-z);}
on('hit',(c,m)=>{const p=needP(c),q=DB.players[m.to],oc=q&&CONN.get(q.id),t=now();if(!q||!oc||!oc.pos||!c.pos)return;
  if(Math.hypot(oc.pos[0]-c.pos[0],oc.pos[1]-c.pos[1])>260)return;const rel=relation(p,q);if(rel!=='enemy')return;
  if(homeDist(q,oc.pos[0],oc.pos[1])<520)return;/* safe harbour around the victim's own island */
  c.hitB=(c.hitB||[]).filter(x=>t-x[0]<2000);const dmg=num(m.dmg,0,40,0);if(c.hitB.reduce((a,x)=>a+x[1],0)+dmg>140)return;c.hitB.push([t,dmg]);
  if(p.shield>t){p.shield=0;pushWorld(p);}oc.lastHitBy=p.id;oc.lastHitT=t;send(oc,{t:'hit',by:p.id,dmg});});
on('sunk',(c,m)=>{const p=needP(c),t=now();const k=c.lastHitBy&&t-c.lastHitT<20000?DB.players[c.lastHitBy]:null;c.lastHitBy=null;p.stats.lost++;
  if(!k){touch();return;}accrue(p,t);const g=Math.min(500,Math.floor((p.res.gold||0)*.05));p.res.gold-=g;k.res.gold=(k.res.gold||0)+g;k.honor+=6;p.honor=Math.max(0,p.honor-4);k.stats.sunk++;
  let bty=0;if(p.traitor>t&&p.bounty>0){bty=p.bounty;k.res.gold+=bty;p.bounty=0;p.traitor=0;feed('💰 '+k.name+' أغرق الغدّار '+p.name+' وأخذ المكافأة');}
  log(p,{k:'sunk',by:k.name,byId:k.id,gold:g});log(k,{k:'sink',who:p.name,whoId:p.id,gold:g+bty});touch();pushMe(p);pushMe(k);pushWorld(p);pushWorld(k);
  sendP(k.id,{t:'toast',msg:'⚓ أغرقت سفينة '+p.name+' وأخذت '+(g+bty)+' ذهب'});});
/* ---- island layouts & profiles ---- */
on('layout',(c,m)=>{needP(c);const q=DB.players[m.id];if(!q)fail('غير موجود');send(c,{t:'layout',L:layout(q,false)});});
on('prof',(c,m)=>{const p=needP(c),q=DB.players[m.id];if(!q)fail('غير موجود');const o=pub(q);o.stats=q.stats;o.allies=q.allies.length;o.rel=relation(p,q);o.req=q.allyIn.includes(p.id);send(c,{t:'prof',p:o});});
on('top',(c)=>{needP(c);const l=Object.values(DB.players).filter(q=>q.slot!=null).sort((a,b)=>b.honor-a.honor).slice(0,50).map(pub);send(c,{t:'top',l});});
on('logsSeen',(c)=>{const p=needP(c);p.logSeen=now();touch();});
/* ---- alliances & betrayal ---- */
on('allyReq',(c,m)=>{const p=needP(c),q=DB.players[m.to];if(!q||q===p)fail('غير صالح');if(p.allies.includes(q.id))fail('أنتم حلفاء أصلاً');
  if(p.allies.length>=SH.ALLY.max||q.allies.length>=SH.ALLY.max)fail('وصلتوا الحد الأعلى للحلفاء');if(q.allyIn.includes(p.id))fail('أرسلت الطلب قبل');
  if(p.allyIn.includes(q.id)){acceptAlly(p,q);return;}q.allyIn.push(p.id);touch();pushMe(q);sendP(q.id,{t:'note',k:'allyReq',from:p.id,name:p.name});ok(c,m.rid,{msg:'انرسل طلب التحالف'});});
function acceptAlly(p,q){p.allyIn=p.allyIn.filter(i=>i!==q.id);q.allyIn=q.allyIn.filter(i=>i!==p.id);if(!p.allies.includes(q.id))p.allies.push(q.id);if(!q.allies.includes(p.id))q.allies.push(p.id);
  log(p,{k:'ally',who:q.name});log(q,{k:'ally',who:p.name});touch();pushMe(p);pushMe(q);sendP(q.id,{t:'toast',msg:'🤝 '+p.name+' قبل تحالفك'});}
on('allyAccept',(c,m)=>{const p=needP(c),q=DB.players[m.from];if(!q||!p.allyIn.includes(q.id))fail('ما فيه طلب');if(p.allies.length>=SH.ALLY.max||q.allies.length>=SH.ALLY.max)fail('وصلتوا الحد الأعلى للحلفاء');acceptAlly(p,q);});
on('allyDecline',(c,m)=>{const p=needP(c);p.allyIn=p.allyIn.filter(i=>i!==m.from);touch();pushMe(p);});
function breakAlly(p,q){p.allies=p.allies.filter(i=>i!==q.id);q.allies=q.allies.filter(i=>i!==p.id);p.exAlly[q.id]=now();q.exAlly[p.id]=now();touch();}
on('allyBreak',(c,m)=>{const p=needP(c),q=DB.players[m.id];if(!q||!p.allies.includes(q.id))fail('مو حليفك');breakAlly(p,q);log(q,{k:'allyEnd',who:p.name});pushMe(p);pushMe(q);
  sendP(q.id,{t:'toast',msg:p.name+' فك التحالف معك'});});
function betray(p,q){breakAlly(p,q);const t=now();accrue(p,t);p.traitor=t+SH.ALLY.traitorH*H;p.bounty=(p.bounty||0)+300+Math.floor((p.res.gold||0)*.05);
  log(q,{k:'betrayed',by:p.name,byId:p.id});log(p,{k:'betray',who:q.name});feed('🗡 '+p.name+' غدر بحليفه '+q.name+'! على راسه مكافأة '+p.bounty+' ذهب');pushMe(p);pushMe(q);pushWorld(p);}
on('betray',(c,m)=>{const p=needP(c),q=DB.players[m.id];if(!q)fail('غير صالح');const recent=p.exAlly[q.id]&&now()-p.exAlly[q.id]<H;if(!p.allies.includes(q.id)&&!recent)fail('مو حليفك');betray(p,q);ok(c,m.rid);});
/* ---- raids ---- */
const RAIDS=new Map();/* targetId -> {by, rid, start} */
on('raidStart',(c,m)=>{const p=needP(c),q=DB.players[m.target],t=now();if(!q||q===p||q.slot==null)fail('غير صالح');if(c.raid)fail('أنت في غزوة الحين');
  const rel=relation(p,q);if(rel==='clan')fail('هذي جزيرة من كلانك؛ تقدر تزورها بس');
  const rv=p.logs.find(e=>e.k==='def'&&e.byId===q.id&&!e.rev&&t-e.t<24*H);
  if(q.shield>t&&!rv)fail('الجزيرة محمية بدرع لين '+new Date(q.shield).toISOString().slice(11,16)+' UTC');
  const lk=RAIDS.get(q.id);if(lk&&t-lk.start<SH.RAID.maxSec*1000+30000)fail('جزيرته تحت هجوم أحد ثاني الحين');
  if(!c.pos||homeDist(q,c.pos[0],c.pos[1])>1100)fail('قرّب من جزيرته أول');
  const exA=p.exAlly[q.id]&&t-p.exAlly[q.id]<H;if(rel==='ally'||exA){if(!m.betray){send(c,{t:'confirmBetray',id:q.id,name:q.name,rid:m.rid});return;}betray(p,q);}
  if(rv)rv.rev=true;const rid=crypto.randomBytes(6).toString('hex');RAIDS.set(q.id,{by:p.id,rid,start:t});c.raid={target:q.id,rid,start:t};
  if(p.shield>t){p.shield=0;pushWorld(p);}touch();
  const fs=shipById(p,p.flagship);send(c,{t:'raidOk',rid,L:layout(q,true),name:q.name,crew:fs?fs.crew:{}});
  sendP(q.id,{t:'underAttack',by:p.name,byId:p.id});});
function endRaid(c,p,q,pct,flag,lost,vaultBroken){const t=now();RAIDS.delete(q.id);const r=c.raid;c.raid=null;const dur=(t-r.start)/1000;
  if(dur<15)pct=Math.min(pct,10);pct=clampN(Math.round(pct),0,100);if(flag)pct=100;accrue(q,t);accrue(p,t);
  const fs=shipById(p,p.flagship),looters=fs?(fs.crew.looter||0):0,tamers=fs?(fs.crew.tamer||0):0;
  const loot=SH.lootFor(q,pct,t,Math.min(.35,looters*.06+tamers*.04));
  if(vaultBroken&&pct>=30){const v=SH.vaultL(q,t);loot.gold+=Math.min(Math.floor((q.res.gold||0)*.08),220*v);}
  for(const k in loot){loot[k]=Math.min(loot[k],Math.floor(q.res[k]||0));q.res[k]-=loot[k];p.res[k]=(p.res[k]||0)+loot[k];}
  if(fs)for(const u in(lost||{})){const n=Math.max(0,lost[u]|0);if(fs.crew[u]){fs.crew[u]=Math.max(0,fs.crew[u]-n);if(!fs.crew[u])delete fs.crew[u];}}
  const win=pct>=50,dl=SH.castleL(q)-SH.castleL(p);let hon=0;
  if(win){hon=Math.max(5,15+2*dl);p.honor+=hon;q.honor=Math.max(0,q.honor-Math.round(hon*.6));p.stats.wins++;}else{p.honor=Math.max(0,p.honor-6);q.honor+=4;q.stats.defWins++;}
  p.stats.raids++;q.stats.defs++;if(pct>=30)q.shield=t+(pct>=70?SH.RAID.shieldHi:SH.RAID.shieldLo)*H;
  let bty=0;if(win&&q.traitor>t&&q.bounty>0){bty=q.bounty;p.res.gold+=bty;q.bounty=0;q.traitor=0;feed('💰 '+p.name+' هزم الغدّار '+q.name+' وأخذ المكافأة');}
  log(q,{k:'def',by:p.name,byId:p.id,pct,loot,win:!win});log(p,{k:'raid',who:q.name,whoId:q.id,pct,loot,bounty:bty});touch();
  send(c,{t:'raidResult',pct,loot,honor:win?hon:-6,bounty:bty,win});pushMe(p);pushMe(q);pushWorld(p);pushWorld(q);
  sendP(q.id,{t:'raidOver',by:p.name,pct,loot,win});
  if(flag)feed('🏴 '+p.name+' رفع علمه فوق قلعة '+q.name+'!');}
on('raidEnd',(c,m)=>{const p=needP(c);if(!c.raid||c.raid.rid!==m.raid)fail('ما فيه غزوة');const q=DB.players[c.raid.target];if(!q){c.raid=null;return;}
  endRaid(c,p,q,num(m.pct,0,100,0),!!m.flag,m.lost||{},!!m.vault);});
const NPC_REWARD={small:{gold:250,wood:150,iron:30},col:{gold:520,wood:300,iron:80,powder:25},big:{gold:900,wood:500,iron:150,powder:45},huge:{gold:1500,wood:800,iron:250,powder:80}};
on('npcRaid',(c,m)=>{const p=needP(c),t=now();const idx=m.idx|0,sz=NPC_REWARD[m.size]?m.size:'small';if(idx<0||idx>200)fail('غير صالح');
  if((p.npcCd[idx]||0)>t)fail('هذي المستعمرة نهبتها قبل شوي؛ ارجع بعد '+Math.ceil((p.npcCd[idx]-t)/MIN)+' دقيقة');
  accrue(p,t);const k=1+.1*SH.castleL(p),rw={};for(const r in NPC_REWARD[sz]){rw[r]=Math.floor(NPC_REWARD[sz][r]*k);p.res[r]=(p.res[r]||0)+rw[r];}
  p.npcCd[idx]=t+SH.RAID.npcCd*1000;p.honor+=3;for(const u in(m.lost||{})){const fs=shipById(p,p.flagship);if(fs&&fs.crew[u]){fs.crew[u]=Math.max(0,fs.crew[u]-Math.max(0,m.lost[u]|0));if(!fs.crew[u])delete fs.crew[u];}}
  log(p,{k:'npc',name:str(m.name,30),loot:rw});touch();send(c,{t:'npcResult',loot:rw,cd:p.npcCd[idx]});pushMe(p);});
/* ---- clans ---- */
function clanView(cl){const members=Object.keys(cl.members).map(id=>{const q=DB.players[id];return q?{id,name:q.name,role:cl.members[id],online:!!CONN.get(id),castle:SH.castleL(q),honor:q.honor|0,slot:q.slot}:null;}).filter(Boolean);
  return{id:cl.id,name:cl.name,tag:cl.tag,leader:cl.leader,open:cl.open,desc:cl.desc,xp:cl.xp,lvl:SH.clanLvl(cl.xp),members,req:cl.req.map(id=>({id,name:(DB.players[id]||{}).name})).filter(x=>x.name),chat:cl.chat.slice(-60)};}
function pushClan(cl){const v=clanView(cl);for(const id in cl.members)sendP(id,{t:'clan',c:v});}
function roleRank(r){return SH.CLAN.roles.indexOf(r);}/* 0 leader .. 3 member */
function myClan(p){const cl=clanOf(p);if(!cl)fail('أنت مو في كلان');return cl;}
function clanBroadcastMembers(cl){for(const id in cl.members){const q=DB.players[id];if(q)broadcast({t:'wp',p:pub(q)});}}
on('clanCreate',(c,m)=>{const p=needP(c);accrue(p);if(p.clan)fail('اطلع من كلانك أول');const name=str(m.name,22).trim(),tag=str(m.tag,10).trim();
  if(!SH.validClanName(name))fail('اسم الكلان من 3 إلى 22 حرف');if(!SH.validTag(tag))fail('الهاشتاق من 2 إلى 10 حروف بدون مسافات');if(DB.tags[nameKey(tag)])fail('الهاشتاق مأخوذ');
  if(p.res.gold<SH.CLAN.cost)fail('تحتاج '+SH.CLAN.cost+' ذهب');p.res.gold-=SH.CLAN.cost;const id='c'+(DB.seq++).toString(36);
  const cl={id,name,tag,leader:p.id,members:{[p.id]:'leader'},open:m.open!==false,desc:str(m.desc,140),chat:[],xp:0,req:[],created:now()};DB.clans[id]=cl;DB.tags[nameKey(tag)]=id;p.clan=id;
  for(const k in DB.clans){const o=DB.clans[k];o.req=o.req.filter(x=>x!==p.id);}touch();pushMe(p);pushClan(cl);broadcast({t:'wp',p:pub(p)});feed('🏴 تأسس كلان جديد: '+name+' #'+tag);});
on('clanList',(c,m)=>{needP(c);const q=str(m.q||'',30).toLowerCase();const l=Object.values(DB.clans).filter(cl=>!q||cl.name.toLowerCase().includes(q)||cl.tag.toLowerCase().includes(q))
  .map(cl=>({id:cl.id,name:cl.name,tag:cl.tag,open:cl.open,n:Object.keys(cl.members).length,lvl:SH.clanLvl(cl.xp),desc:cl.desc,lead:(DB.players[cl.leader]||{}).name,flag:(DB.players[cl.leader]||{}).flag,
    honor:Object.keys(cl.members).reduce((a,id)=>a+((DB.players[id]||{}).honor|0),0)})).sort((a,b)=>b.honor-a.honor).slice(0,40);send(c,{t:'clanList',l});});
function joinClan(p,cl){cl.members[p.id]='member';p.clan=cl.id;cl.req=cl.req.filter(x=>x!==p.id);for(const k in DB.clans){const o=DB.clans[k];o.req=o.req.filter(x=>x!==p.id);}
  cl.chat.push({t:now(),sys:1,msg:p.name+' انضم للكلان'});if(cl.chat.length>80)cl.chat.shift();touch();pushMe(p);pushClan(cl);broadcast({t:'wp',p:pub(p)});}
on('clanJoin',(c,m)=>{const p=needP(c),cl=DB.clans[m.id];if(!cl)fail('الكلان غير موجود');if(p.clan)fail('اطلع من كلانك أول');if(Object.keys(cl.members).length>=SH.CLAN.max)fail('الكلان ممتلئ');
  if(cl.open){joinClan(p,cl);return;}if(!cl.req.includes(p.id))cl.req.push(p.id);if(cl.req.length>30)cl.req.shift();touch();pushClan(cl);ok(c,m.rid,{msg:'انرسل طلب الانضمام'});});
on('clanAccept',(c,m)=>{const p=needP(c),cl=myClan(p);if(roleRank(cl.members[p.id])>2)fail('ما عندك صلاحية');const q=DB.players[m.id];if(!q||!cl.req.includes(q.id))fail('ما فيه طلب');
  if(q.clan){cl.req=cl.req.filter(x=>x!==q.id);touch();pushClan(cl);fail('اللاعب دخل كلان ثاني');}if(Object.keys(cl.members).length>=SH.CLAN.max)fail('الكلان ممتلئ');joinClan(q,cl);sendP(q.id,{t:'toast',msg:'انقبلت في كلان '+cl.name});});
on('clanReject',(c,m)=>{const p=needP(c),cl=myClan(p);if(roleRank(cl.members[p.id])>2)fail('ما عندك صلاحية');cl.req=cl.req.filter(x=>x!==m.id);touch();pushClan(cl);});
function leaveClan(p,cl,kicked){delete cl.members[p.id];p.clan=null;const ids=Object.keys(cl.members);
  if(cl.leader===p.id){if(!ids.length){delete DB.tags[nameKey(cl.tag)];delete DB.clans[cl.id];touch();pushMe(p);broadcast({t:'wp',p:pub(p)});return;}
    ids.sort((a,b)=>roleRank(cl.members[a])-roleRank(cl.members[b]));cl.leader=ids[0];cl.members[ids[0]]='leader';}
  cl.chat.push({t:now(),sys:1,msg:p.name+(kicked?' انطرد من الكلان':' طلع من الكلان')});if(cl.chat.length>80)cl.chat.shift();touch();pushMe(p);sendP(p.id,{t:'clan',c:null});pushClan(cl);clanBroadcastMembers(cl);broadcast({t:'wp',p:pub(p)});}
on('clanLeave',(c)=>{const p=needP(c),cl=myClan(p);leaveClan(p,cl,false);});
on('clanKick',(c,m)=>{const p=needP(c),cl=myClan(p),q=DB.players[m.id];if(!q||!cl.members[q.id]||q===p)fail('غير صالح');
  if(roleRank(cl.members[p.id])>=roleRank(cl.members[q.id])||roleRank(cl.members[p.id])>2)fail('ما عندك صلاحية');leaveClan(q,cl,true);sendP(q.id,{t:'toast',msg:'انطردت من كلان '+cl.name});});
on('clanRole',(c,m)=>{const p=needP(c),cl=myClan(p),q=DB.players[m.id],role=m.role;if(!q||!cl.members[q.id]||q===p||!SH.CLAN.roles.includes(role))fail('غير صالح');
  const me=roleRank(cl.members[p.id]);if(role==='leader'){if(me!==0)fail('بس القائد يقدر يسلّم القيادة');cl.members[p.id]='co';cl.members[q.id]='leader';cl.leader=q.id;}
  else{if(me>1||roleRank(cl.members[q.id])<=me||roleRank(role)<=me)fail('ما عندك صلاحية');cl.members[q.id]=role;}
  cl.chat.push({t:now(),sys:1,msg:q.name+' صار '+SH.CLAN.rolesAr[cl.members[q.id]]});touch();pushClan(cl);clanBroadcastMembers(cl);});
on('clanSet',(c,m)=>{const p=needP(c),cl=myClan(p);if(roleRank(cl.members[p.id])>1)fail('ما عندك صلاحية');if(m.open!=null)cl.open=!!m.open;if(m.desc!=null)cl.desc=str(m.desc,140);touch();pushClan(cl);});
on('clanChat',(c,m)=>{const p=needP(c),cl=myClan(p),t=now();const msg=str(m.msg,200).trim();if(!msg)return;if(c.chatT&&t-c.chatT<1200)fail('شوي شوي على الشات');c.chatT=t;
  const e={t,by:p.id,name:p.name,msg};cl.chat.push(e);if(cl.chat.length>80)cl.chat.shift();touch();for(const id in cl.members)sendP(id,{t:'cmsg',m:e});});
on('clanDonate',(c,m)=>{const p=needP(c),cl=myClan(p);accrue(p);const g=Math.floor(num(m.gold,1,1e6,0));if(g<1||p.res.gold<g)fail('الذهب ما يكفي');const before=SH.clanLvl(cl.xp);
  p.res.gold-=g;cl.xp+=g;cl.chat.push({t:now(),sys:1,msg:p.name+' تبرّع بـ '+g+' ذهب'});if(cl.chat.length>80)cl.chat.shift();touch();pushMe(p);pushClan(cl);
  if(SH.clanLvl(cl.xp)>before)for(const id in cl.members)sendP(id,{t:'toast',msg:'🎉 الكلان وصل المستوى '+SH.clanLvl(cl.xp)});});
on('clanReinforce',(c,m)=>{const p=needP(c),cl=myClan(p),q=DB.players[m.to],t=now();if(!q||!cl.members[q.id]||q===p)fail('غير صالح');const d=SH.unitDef(m.type),n=m.n|0;
  if(!d||n<1||(p.garrison[m.type]||0)<n)fail('ما عندك هالعدد في الجزيرة');if(garrisonSpace(q,t)<d.sp*n)fail('ثكنة '+q.name+' ممتلئة');
  p.garrison[m.type]-=n;if(!p.garrison[m.type])delete p.garrison[m.type];q.garrison[m.type]=(q.garrison[m.type]||0)+n;
  cl.chat.push({t:now(),sys:1,msg:p.name+' أرسل '+n+' '+d.ar+' تعزيزات لـ '+q.name});touch();pushMe(p);pushMe(q);pushClan(cl);});
/* ================= world events: ghost ship, giant kraken, royal convoy (shared bosses on the open-sea ring) ================= */
const EVK={ghost:{ar:'سفينة الأشباح',hp:2600,dur:18*MIN,arc:.5,reward:{gold:3200,iron:70,powder:60}},
  kraken:{ar:'الأخطبوط العملاق',hp:4200,dur:18*MIN,arc:0,reward:{gold:4200,iron:90,food:300}},
  convoy:{ar:'قافلة الملك',hp:2400,dur:14*MIN,arc:.7,reward:{gold:5200,iron:120,powder:90}}};
const EV={list:new Map(),next:now()+4*MIN,seq:1};
const EV_R=7300;
function evPub(e){return{id:e.id,k:e.k,a0:e.a0,a1:e.a1,r:e.r,start:e.start,dur:e.dur,hp:Math.max(0,Math.round(e.hp)),max:e.max};}
function evPos(e,t){const k=clampN((t-e.start)/e.dur,0,1),a=e.a0+(e.a1-e.a0)*k;return{x:Math.cos(a)*e.r,z:Math.sin(a)*e.r};}
function evSpawn(kind){const d=EVK[kind],t=now(),a0=Math.random()*Math.PI*2,dir=Math.random()<.5?1:-1,id='e'+(EV.seq++);
  const e={id,k:kind,a0,a1:a0+dir*d.arc,r:EV_R+(Math.random()-.5)*160,start:t,dur:d.dur,hp:d.hp,max:d.hp,dmg:{},hitB:new Map()};EV.list.set(id,e);
  broadcast({t:'ev',e:evPub(e)});feed((kind==='kraken'?'🐙 ':kind==='ghost'?'☠ ':'👑 ')+d.ar+' ظهر في البحر! شوفه في الخريطة');return e;}
function evEnd(e,win){EV.list.delete(e.id);const d=EVK[e.k];
  if(!win){broadcast({t:'evEnd',id:e.id,win:false});feed(d.ar+' اختفى في الضباب…');return;}
  const ids=Object.keys(e.dmg).filter(id=>DB.players[id]),tot=ids.reduce((a,id)=>a+e.dmg[id],0)||1,top=ids.sort((a,b)=>e.dmg[b]-e.dmg[a]),t=now(),out=[];
  top.forEach((id,i)=>{const q=DB.players[id],sh=e.dmg[id]/tot;if(sh<.02)return;accrue(q,t);const rw={};
    for(const r in d.reward){rw[r]=Math.floor(d.reward[r]*(.15+.85*sh)*(i===0?1.25:1));q.res[r]=(q.res[r]||0)+rw[r];}
    q.honor+=Math.round(4+16*sh);log(q,{k:'boss',name:d.ar,loot:rw});pushMe(q);out.push([q.name,Math.round(sh*100)]);});
  touch();broadcast({t:'evEnd',id:e.id,win:true,top:out.slice(0,5)});if(out.length)feed('🏆 '+d.ar+' انهزم! أكبر ضربة: '+out[0][0]);}
on('evHit',(c,m)=>{const p=needP(c),e=EV.list.get(m.id),t=now();if(!e||!c.pos||e.hp<=0)return;const pos=evPos(e,t);if(Math.hypot(pos.x-c.pos[0],pos.z-c.pos[1])>700)return;
  const b=(e.hitB.get(p.id)||[]).filter(x=>t-x[0]<2000),dmg=num(m.dmg,0,60,0);if(b.reduce((a,x)=>a+x[1],0)+dmg>160)return;b.push([t,dmg]);e.hitB.set(p.id,b);
  e.hp-=dmg;e.dmg[p.id]=(e.dmg[p.id]||0)+dmg;e.dirty=true;if(e.hp<=0)evEnd(e,true);});
setInterval(()=>{const t=now();for(const e of EV.list.values()){if(t>e.start+e.dur){evEnd(e,false);continue;}if(e.dirty){e.dirty=false;broadcast({t:'evHp',id:e.id,hp:Math.max(0,Math.round(e.hp))});}}
  if(t>EV.next&&EV.list.size<2&&CONN.size>0){const ks=Object.keys(EVK).filter(k=>![...EV.list.values()].some(e=>e.k===k));if(ks.length)evSpawn(ks[Math.floor(Math.random()*ks.length)]);EV.next=t+(14+Math.random()*12)*MIN;}},500);
if(process.env.TEST_EVENTS)setTimeout(()=>{evSpawn('kraken');evSpawn('ghost');},1500);
/* ================= live loop: presence snapshots ================= */
setInterval(()=>{const t=now(),list=[];for(const c of CONN.values())if(c.pid&&c.pos&&t-c.posT<15000)list.push(c);
  for(const c of list){const out=[];for(const o of list){if(o===c)continue;if(Math.hypot(o.pos[0]-c.pos[0],o.pos[1]-c.pos[1])>4200)continue;out.push([o.pid].concat(o.pos));}
    if(out.length||c.hadOthers)send(c,{t:'P',l:out});c.hadOthers=out.length>0;}},200);
setInterval(()=>{const t=now(),list=[];for(const c of CONN.values())if(c.pid&&c.pos&&t-c.posT<30000)list.push(c);if(list.length<2)return;
  const all=list.map(o=>[o.pid,Math.round(o.pos[0]/5)*5,Math.round(o.pos[1]/5)*5,o.pos[12]?1:0]);for(const c of list)send(c,{t:'FP',l:all.filter(x=>x[0]!==c.pid)});},2000);
setInterval(()=>{const t=now();for(const [id,r] of RAIDS)if(t-r.start>(SH.RAID.maxSec+60)*1000){RAIDS.delete(id);}
  if(t>DB.season.end){/* new season: top 3 by honor get gold, everyone keeps half their honor */const top=Object.values(DB.players).sort((a,b)=>b.honor-a.honor).slice(0,3);
    top.forEach((p,i)=>{p.res.gold=(p.res.gold||0)+[3000,2000,1000][i];log(p,{k:'season',rank:i+1});});for(const id in DB.players)DB.players[id].honor=Math.floor(DB.players[id].honor/2);
    if(top.length)feed('🏆 انتهى الموسم '+DB.season.n+'! البطل: '+top[0].name);DB.season={n:DB.season.n+1,start:t,end:t+7*24*H};touch();}},10000);
/* ================= http + websocket ================= */
let INDEX=null,INDEX_GZ=null,INDEX_ETAG='';
function loadIndex(){try{INDEX=fs.readFileSync(process.env.INDEX_FILE||path.join(PUBLIC,'index.html'));INDEX_GZ=zlib.gzipSync(INDEX,{level:9});INDEX_ETAG='"'+crypto.createHash('md5').update(INDEX).digest('hex').slice(0,16)+'"';}catch(e){INDEX=Buffer.from('<h1>missing client</h1>');INDEX_GZ=zlib.gzipSync(INDEX);}}
loadIndex();
const server=http.createServer((req,res)=>{const u=req.url.split('?')[0];
  if(u==='/health'){res.writeHead(200,{'content-type':'text/plain'});res.end('ok');return;}
  if(u==='/stats'){res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({players:Object.keys(DB.players).length,online:CONN.size,clans:Object.keys(DB.clans).length,season:DB.season.n}));return;}
  if(u==='/'||u==='/index.html'){if(req.headers['if-none-match']===INDEX_ETAG){res.writeHead(304);res.end();return;}
    const gz=/\bgzip\b/.test(req.headers['accept-encoding']||'');res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-cache','etag':INDEX_ETAG,...(gz?{'content-encoding':'gzip'}:{})});res.end(gz?INDEX_GZ:INDEX);return;}
  res.writeHead(404,{'content-type':'text/plain'});res.end('not found');});
const wss=new WebSocketServer({server,maxPayload:64*1024});
wss.on('connection',(ws)=>{const c={ws,pid:null,pos:null,bucket:60,last:now()};
  ws.on('message',(buf)=>{const t=now();c.bucket=Math.min(80,c.bucket+(t-c.last)/1000*40);c.last=t;if(c.bucket<1)return;c.bucket--;
    let m;try{m=JSON.parse(buf.toString());}catch(e){return;}if(!m||typeof m.t!=='string')return;const h=HANDLERS[m.t];if(!h)return;
    try{h(c,m);if(m.rid!=null)send(c,{t:'ack',rid:m.rid});}catch(e){if(e instanceof UErr)err(c,e.message,m.rid);else{console.error('handler',m.t,e);err(c,'صار خطأ في السيرفر',m.rid);}}});
  ws.on('close',()=>{if(c.raid){const p=DB.players[c.pid],q=DB.players[c.raid.target];if(p&&q)try{endRaid(c,p,q,0,false,{},false);}catch(e){}}
    if(c.pid&&CONN.get(c.pid)===c){CONN.delete(c.pid);const p=DB.players[c.pid];if(p){p.seen=now();touch();broadcast({t:'wp',p:pub(p)});}}});
  ws.on('error',()=>{});});
setInterval(()=>{for(const c of CONN.values())if(c.ws.readyState===1)try{c.ws.ping();}catch(e){}},25000);
server.listen(PORT,()=>console.log('pirates server on',PORT,'data',DATA_DIR));
