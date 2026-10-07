/* ================= online core: connection, session, world of players, live ships, sea PvP ================= */
const ON={ws:null,me:null,pl:new Map(),clan:null,skew:0,rid:1,reqs:new Map(),feed:[],season:null,retry:0,started:false,kicked:false,unread:{logs:0,chat:0},sendT:0,lastPos:null,myIsl:null,homeT:0};
const srvNow=()=>Date.now()+ON.skew;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function lsGet(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function lsSet(k,v){try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){}}
function netConnect(){let ws;try{ws=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host+'/');}catch(e){loginMsg('ما قدرت أتصل بالسيرفر');return;}
  ON.ws=ws;
  ws.onopen=()=>{ON.retry=0;netBadge(true);const t=lsGet('pir_tok');if(t)netSend({t:'resume',token:t});else showLogin();};
  ws.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch(x){return;}try{onMsg(m);}catch(x){console.error(x);}};
  ws.onclose=()=>{netBadge(false);for(const [k,r] of ON.reqs){r.rej(new Error('انقطع الاتصال'));}ON.reqs.clear();if(ON.kicked)return;
    setTimeout(netConnect,Math.min(9000,700*(++ON.retry)));if(!ON.started)loginMsg('أحاول أتصل بالسيرفر...');};}
function netSend(m){if(ON.ws&&ON.ws.readyState===1){ON.ws.send(JSON.stringify(m));return true;}return false;}
/* request with a promise: resolves on ok/ack, rejects on err (and shows the server's message) */
function act(m,quiet){return new Promise((res,rej)=>{const rid=ON.rid++;m.rid=rid;if(!netSend(m)){if(!quiet)banner('ما فيه اتصال بالسيرفر',1800);rej(new Error('offline'));return;}
  ON.reqs.set(rid,{res,rej,quiet});setTimeout(()=>{const r=ON.reqs.get(rid);if(r){ON.reqs.delete(rid);r.rej(new Error('timeout'));}},12000);});}
function gainSrv(src,o){const m={t:'gain',src};let any=false;for(const k in o){const v=Math.floor(o[k]||0);if(v>0){m[k]=v;any=true;}}if(any)netSend(m);}
function onMsg(m){const H={
  token:()=>lsSet('pir_tok',m.token),
  needLogin:()=>{lsSet('pir_tok',null);showLogin();},
  kicked:()=>{ON.kicked=true;showLogin(m.msg||'انفصلت');playing=false;},
  welcome:()=>{ON.skew=m.now-Date.now();ON.me=m.me;ON.pl.clear();for(const p of m.world)ON.pl.set(p.id,p);ON.clan=m.clan;ON.feed=(m.feed||[]).map(f=>({t:f.t,text:f.text}));ON.season=m.season;ON.evList=m.ev||[];onWelcome();},
  me:()=>{ON.skew=m.now-Date.now();const old=ON.me;ON.me=m.me;onMe(old);},
  wp:()=>{const old=ON.pl.get(m.p.id);ON.pl.set(m.p.id,m.p);onPlayer(m.p,old);},
  P:()=>presence(m.l),
  fire:()=>remoteFire(m),
  hit:()=>takePvpHit(m),
  layout:()=>applyLayout(m.L),
  clan:()=>{ON.clan=m.c;onClan();},
  cmsg:()=>{if(ON.clan){ON.clan.chat.push(m.m);if(ON.clan.chat.length>80)ON.clan.chat.shift();}if(!(UI.open==='clan'&&UI.tab==='chat'))ON.unread.chat++;uiRefresh('chat');menuBadge();},
  note:()=>{if(m.k==='allyReq'){banner('🤝 '+esc(m.name)+' يطلب التحالف معك (من السجل)',2600);ON.unread.logs++;menuBadge();uiRefresh('logs');}},
  toast:()=>banner(esc(m.msg),2400),
  feed:()=>{ON.feed.unshift({t:srvNow(),text:m.text});if(ON.feed.length>30)ON.feed.pop();banner(esc(m.text),2800);uiRefresh('logs');},
  underAttack:()=>{banner('⚔️ '+esc(m.by)+' يهجم على جزيرتك الحين!',4000);ON.unread.logs++;menuBadge();},
  raidOver:()=>{banner((m.win?'🛡 صدّيت هجوم ':'💥 ')+esc(m.by)+(m.win?'':' نهب جزيرتك ('+m.pct+'%)'),3500);uiRefresh('logs');},
  raidOk:()=>raidBegin(m),
  ev:()=>evAdd(m.e),evHp:()=>evHpC(m),evEnd:()=>evEndC(m),FP:()=>{ON.far=m.l;},
  raidResult:()=>raidResultShow(m),
  confirmBetray:()=>confirmBox('غدر بالحليف؟','<b>'+esc(m.name)+'</b> حليفك. إذا هجمت عليه تصير «غدّار» 24 ساعة، وتنحط على راسك مكافأة يقدر ياخذها أي أحد يهزمك.','اغدر وهاجم',()=>raidRequest(m.id,true)),
  npcResult:()=>{banner('🏴 نهبنا المستعمرة! '+resTxt(m.loot),3000);},
  top:()=>uiTop(m.l),prof:()=>uiProfile(m.p),clanList:()=>uiClanList(m.l),
  err:()=>{const r=ON.reqs.get(m.rid);if(r){ON.reqs.delete(m.rid);r.rej(new Error(m.msg));if(!r.quiet)banner(esc(m.msg),2400);}else{banner(esc(m.msg),2400);if(!ON.started)loginMsg(m.msg);}},
  ok:()=>{const r=ON.reqs.get(m.rid);if(r){ON.reqs.delete(m.rid);r.res(m);}if(m.msg)banner(esc(m.msg),2000);},
  ack:()=>{const r=ON.reqs.get(m.rid);if(r){ON.reqs.delete(m.rid);r.res(m);}},
};const f=H[m.t];if(f)f();}
/* ---- login screen ---- */
function loginMsg(t){const e=$('lgMsg');if(e)e.textContent=t||'';}
function showLogin(msg){$('start').classList.remove('hide');$('lgForm').classList.remove('hide');$('lgWait').classList.add('hide');loginMsg(msg||'');paused=false;}
function loginSubmit(kind){const name=$('lgName').value.trim(),pass=$('lgPass').value;
  if(!SH.validName(name)){loginMsg('الاسم من 3 إلى 16 حرف (عربي أو إنجليزي أو أرقام، بدون مسافات)');return;}if(pass.length<4){loginMsg('كلمة المرور 4 أحرف على الأقل');return;}
  if(!netSend({t:kind,name,pass})){loginMsg('السيرفر مو متصل، لحظة...');return;}loginMsg('لحظة...');lsSet('pir_name',name);}
function netBadge(on){const e=$('netDot');if(e)e.classList.toggle('off',!on);}
/* ---- relations ---- */
function relOf(pp){if(!pp||!ON.me)return'enemy';if(pp.id===ON.me.id)return'me';if(ON.me.clan&&pp.clan===ON.me.clan)return'clan';if(ON.me.allies.includes(pp.id))return'ally';return'enemy';}
const REL_COL={me:'#F2D68E',clan:'#5FD07A',ally:'#5FB4F0',enemy:'#F0645A'};
/* ---- flags: 24x16 pixel art with the clan leader's flag in the canton ---- */
const FLAG_TEX=new Map();
function flagCanvas(code,lead,w,h){w=w||128;h=h||80;const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),a=SH.decFlag(code),cw=w/SH.FLAG_W,ch=h/SH.FLAG_H;
  for(let j=0;j<SH.FLAG_H;j++)for(let i=0;i<SH.FLAG_W;i++){x.fillStyle=SH.FLAG_PAL[a[j*SH.FLAG_W+i]];x.fillRect(Math.floor(i*cw),Math.floor(j*ch),Math.ceil(cw),Math.ceil(ch));}
  if(lead&&lead!==code){const b=SH.decFlag(lead),cx0=w*.6,cy0=0,CW=w*.4,CH=h*.5;x.fillStyle='#E8D9A8';x.fillRect(cx0-2,cy0,CW+2,CH+2);
    for(let j=0;j<SH.FLAG_H;j++)for(let i=0;i<SH.FLAG_W;i++){x.fillStyle=SH.FLAG_PAL[b[j*SH.FLAG_W+i]];x.fillRect(cx0+i*CW/SH.FLAG_W,cy0+j*CH/SH.FLAG_H,CW/SH.FLAG_W+.6,CH/SH.FLAG_H+.6);}}
  return c;}
function leaderFlag(pp){if(!pp||!pp.lead||pp.lead===pp.id)return null;const l=ON.pl.get(pp.lead);return l?l.flag:null;}
function flagTexFor(pp){const lf=leaderFlag(pp),key=(pp.flag||'')+'|'+(lf||'');let t=FLAG_TEX.get(key);
  if(!t){t=new THREE.CanvasTexture(flagCanvas(pp.flag||SH.defaultFlag(),lf));t.magFilter=THREE.NearestFilter;t.anisotropy=2;FLAG_TEX.set(key,t);}return t;}
function flagDataURL(pp,w,h){return flagCanvas(pp.flag||SH.defaultFlag(),leaderFlag(pp),w||48,h||32).toDataURL();}
/* ---- world: my profile and the other captains ---- */
function myPub(){return ON.me&&ON.pl.get(ON.me.id);}
function onWelcome(){$('lgWait').classList.remove('hide');$('lgForm').classList.add('hide');
  for(const pp of ON.pl.values())playerIsland(pp);
  const first=!ON.started;ON.started=true;ON.kicked=false;
  if(first){startOnline();}
  syncFleet(first);onClan();menuBadge();for(const e of ON.evList||[])evAdd(e);
  if(first&&ON.myIsl&&ON.myIsl.base&&P){const B=ON.myIsl.base;camYaw=Math.atan2(B.x-P.x,B.z-P.z);camPitch=.3;}
  $('start').classList.add('hide');dropFocus();playing=true;paused=false;
  const ml=ON.me.logs.filter(e=>e.k==='def'&&e.t>(ON.me.logSeen||0));if(ml.length)setTimeout(()=>banner('📜 انهجمت جزيرتك '+ml.length+' مرة وأنت غايب — شوف السجل',3800),1500);
  ON.unread.logs=ON.me.logs.filter(e=>e.t>(ON.me.logSeen||0)).length;menuBadge();}
function onMe(old){if(!old)return;syncFleet(false);baseRefreshMine();uiRefresh();menuBadge();}
function onPlayer(pp,old){const il=playerIsland(pp);if(il){il.name='جزيرة '+pp.name;if(old&&old.rev!==pp.rev&&il.built)requestLayout(il);}
  const R=REMOTE.get(pp.id);if(R&&old&&(old.ship&&pp.ship&&(old.ship.t!==pp.ship.t||old.ship.sail!==pp.ship.sail||old.ship.fig!==pp.ship.fig)||old.flag!==pp.flag||old.lead!==pp.lead))dropRemote(pp.id);
  if(R)R.labelDirty=true;if(old&&old.clan!==pp.clan||old&&old.flag!==pp.flag)for(const r of REMOTE.values())r.labelDirty=true;
  if(pp.id===ON.me.id)refreshMyFlag();uiRefresh('players');}
function onClan(){/* clan changes alter everyone's colours and my flag canton */for(const r of REMOTE.values())r.labelDirty=true;refreshMyFlag();uiRefresh('clan');}
/* ---- presence: my ship / captain out, other captains in ---- */
function presenceOut(dt){ON.sendT-=dt;if(ON.sendT>0||!ON.me)return;ON.sendT=.2;
  const hv=homeVessel(),c=land&&land.cap;let cw=null;if(mode==='foot'&&c&&c.g.parent){cw=capWorld();}
  const a=[+hv.x.toFixed(1),+hv.z.toFixed(1),+(hv.rot||0).toFixed(3),+((hv.speed||0)).toFixed(1),mode==='foot'?1:mode==='boat'?2:mode==='board'?3:0,Math.round(P.alive?P.hull:0),P.hullMax||100,
    cw?+cw.x.toFixed(2):0,cw?+cw.y.toFixed(2):0,cw?+cw.z.toFixed(2):0,c?+c.g.rotation.y.toFixed(2):0,c&&c.mv>.3?1:0,RAID.on?1:0];
  const k=a.join(',');if(k===ON.lastPos&&ON.homeT>0){ON.homeT-=.2;return;}ON.homeT=2;ON.lastPos=k;netSend({t:'p',a});}
const REMOTE=new Map();
function presence(list){const t=performance.now(),seen=new Set();
  for(const e of list){const [id,x,z,rot,spd,md,hp,hm,cx,cy,cz,cr,cm,rd]=e;seen.add(id);const pp=ON.pl.get(id);if(!pp)continue;let R=REMOTE.get(id);
    if(!R){R=makeRemote(pp,x,z,rot);if(!R)continue;REMOTE.set(id,R);}
    R.tx=x;R.tz=z;R.trot=rot;R.speed=spd;R.mode=md;R.hp=hp;R.hm=hm||100;R.cx=cx;R.cy=cy;R.cz=cz;R.cr=cr;R.cm=cm;R.raiding=!!rd;R.last=t;}
  for(const [id,R] of REMOTE)if(!seen.has(id)&&t-R.last>1500)dropRemote(id);}
function makeRemote(pp,x,z,rot){const st=pp.ship||{t:'sloop',sail:0,fig:0},sd=SH.SHIPS[st.t]||SH.SHIPS.sloop,lv=SHIP_LV[sd.lv];
  const look=Object.assign({},PLAYER_LOOK,{sail:SH.SAILS[st.sail]?parseInt(SH.SAILS[st.sail][0].slice(1),16):0xF1E8D2,flagTex:flagTexFor(pp)});
  const mesh=makeShip(look,lv.guns);mesh.scale.setScalar(lv.S);scene.add(mesh);addFigurehead(mesh,st.fig);
  const s={mesh,x,z,rot,speed:0,S:lv.S,alive:true,sink:0,remote:true,id:pp.id,level:sd.lv,side:1,hull:100,hullMax:100,crew:[],tx:x,tz:z,trot:rot,last:performance.now(),labelDirty:true,cap:null};
  mesh.userData.ship=s;return s;}
function dropRemote(id){const R=REMOTE.get(id);if(!R)return;scene.remove(R.mesh);if(R.label){scene.remove(R.label);R.label.material.map.dispose();R.label.material.dispose();}
  if(R.cap){scene.remove(R.cap.g);const i=PEOPLE.indexOf(R.cap);if(i>=0)PEOPLE.splice(i,1);}REMOTE.delete(id);}
function labelSprite(pp){const rel=relOf(pp),c=document.createElement('canvas');c.width=512;c.height=150;const x=c.getContext('2d');
  const tr=pp.traitor&&pp.traitor>srvNow();x.textAlign='center';x.textBaseline='middle';
  if(pp.tag){x.font='700 40px Tajawal,sans-serif';x.fillStyle='rgba(10,8,6,.55)';const tw=x.measureText('#'+pp.tag).width+30;x.fillRect(256-tw/2,6,tw,48);x.fillStyle='#F2D68E';x.fillText('#'+pp.tag,256,32);}
  x.font='800 52px Tajawal,sans-serif';const nm=(tr?'🗡 ':'')+pp.name,nw=x.measureText(nm).width+40;x.fillStyle='rgba(10,8,6,.62)';x.fillRect(256-nw/2,62,nw,70);
  x.fillStyle=tr?'#FF5A4A':REL_COL[rel];x.fillText(nm,256,99);
  const t=new THREE.CanvasTexture(c);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true,fog:false}));sp.renderOrder=12;sp.scale.set(16,4.7,1);return sp;}
function updateRemotes(dt){const t=performance.now();
  for(const [id,R] of REMOTE){const pp=ON.pl.get(id);if(!pp){dropRemote(id);continue;}
    const k=Math.min(1,dt*5);R.x+=(R.tx-R.x)*k;R.z+=(R.tz-R.z)*k;if(Math.hypot(R.tx-R.x,R.tz-R.z)>80){R.x=R.tx;R.z=R.tz;}R.rot+=wrap(R.trot-R.rot)*k;
    const sp=R.speed;R.speed=0;physShip(R,dt,T);R.speed=sp;updateCrew(R,dt);
    const vis=R.mode!==2;R.mesh.visible=vis;
    if(R.labelDirty&&R.label){scene.remove(R.label);R.label.material.map.dispose();R.label.material.dispose();R.label=null;}R.labelDirty=false;
    if(!R.label){R.label=labelSprite(pp);scene.add(R.label);}
    const d=Math.hypot(R.x-camera.position.x,R.z-camera.position.z);R.label.visible=vis&&d<1400;R.label.position.set(R.x,R.mesh.position.y+26*R.S,R.z);const ks=clamp(d/120,.6,3.2);R.label.scale.set(16*ks,4.7*ks,1);
    /* captain walking on an island */
    if(R.mode===1&&d<420){if(!R.cap){R.cap=makePerson('captain');scene.add(R.cap.g);R.cap.x=R.cx;R.cap.z=R.cz;R.cap.state='alive';}
      const c=R.cap,dx=R.cx-c.x,dz=R.cz-c.z;c.x+=dx*Math.min(1,dt*8);c.z+=dz*Math.min(1,dt*8);c.g.position.set(c.x,R.cy,c.z);c.g.rotation.y=R.cr;c.g.visible=true;
      if(R.cm)walkAnim(c,4.5,dt);}
    else if(R.cap)R.cap.g.visible=false;}}
/* ---- sea PvP: my cannonballs hitting other captains' ships, their hits on me ---- */
function pvpTargetable(R){const pp=ON.pl.get(R.id);return R.mode!==2&&relOf(pp)==='enemy';}
function pvpBallHit(p,dmg){for(const R of REMOTE.values()){if(R.mode===2||!R.mesh.visible)continue;if(hitShip(R,p)){const pp=ON.pl.get(R.id),rel=relOf(pp);
      if(rel==='enemy'){netSend({t:'hit',to:R.id,dmg:Math.min(40,dmg)});if(pp.shield&&pp.shield>srvNow())banner('🛡 '+esc(pp.name)+' بالدرع؛ الضربة ما أثّرت',1400);}
      else if(rel==='ally'&&!ON.warnedAlly){ON.warnedAlly=true;banner('هذا حليفك؛ ضرباتك ما تأثر عليه',1800);}
      return true;}}return false;}
function takePvpHit(m){if(!P.alive)return;const pp=ON.pl.get(m.by);const R=REMOTE.get(m.by);const p=R?new THREE.Vector3(P.x+(R.x-P.x)*.05,P.mesh.position.y+2,P.z+(R.z-P.z)*.05):new THREE.Vector3(P.x,2,P.z);
  damageShip(P,p,m.dmg,.25);boom(p);ON.lastPvpBy=m.by;ON.lastPvpT=performance.now();if(pp&&Math.random()<.2)banner('💥 '+esc(pp.name)+' يضرب سفينتك!',1200);}
function remoteFire(m){const R=REMOTE.get(m.id);if(!R||!R.mesh.visible)return;const tgt=m.tgt===ON.me.id&&P.alive?new THREE.Vector3(P.x,1,P.z):
  new THREE.Vector3(R.x+Math.cos(R.rot)*m.side*120,1,R.z-Math.sin(R.rot)*m.side*120);fireBroadside(R,tgt,'r',0,6);}
