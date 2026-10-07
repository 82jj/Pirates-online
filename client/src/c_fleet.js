/* ================= fleet: the flagship from the server profile, typed crews, escorts, figureheads, respawn ================= */
const DECK_ROLE={rifle:'musket',gunner:'gunner',repair:'repair',lookout:'lookout',sword:'sword',dual:'sword',armored:'sword',giant:'sword',hook:'sword',assassin:'sword'};
function deckRole(t){return DECK_ROLE[t]||'sailor';}
function shipLook(s,pp){const sc=SH.SAILS[s.sail||0]||SH.SAILS[0];return Object.assign({},PLAYER_LOOK,{sail:parseInt(sc[0].slice(1),16),flagTex:flagTexFor(pp||myPub()||{flag:SH.defaultFlag()})});}
function newShipLook(isPlayer,x,z,rot,level,look){const lv=SHIP_LV[level];
  const s={mesh:makeShip(look,lv.guns),look,x,z,rot,speed:0,level,S:lv.S,hull:lv.hull,hullMax:lv.hull,max:lv.crew,hp:0,cd:1+Math.random()*2,alive:true,sink:0,isPlayer,
    side:Math.random()<.5?-1:1,bar:null,crew:[],boarded:false,lastHit:-99,musketT:2,shoutT:1,maxSpeed:lv.speed};
  s.mesh.scale.setScalar(s.S);s.mesh.userData.ship=s;scene.add(s.mesh);if(isPlayer)ships.push(s);return s;}
/* figureheads under the bowsprit */
function addFigurehead(mesh,fig){if(!fig)return;const hb=hullAt(1),T_=BB(),y=hb.top-.55,z=hb.z+.55,gold=C(0xC9A04A),wood=C(0x8A6440),bone=C(0xE8E2D0);
  if(fig===1){P_(T_.wall,loft([{y:0,a:.18,b:.14},{y:.5,a:.22,b:.17},{y:.9,a:.17,b:.14},{y:1.05,a:.1,b:.1}],10,true),0,y-.9,z,1,1,1,C(0xC8A080),-.7,0,0);P_(T_.wall,SPHG,0,y+.25,z+.5,.16,.19,.17,C(0xC8A080));P_(T_.wall,BOXG,0,y+.3,z+.42,.3,.3,.2,C(0x5A2E1A));}
  else if(fig===2){P_(T_.metal,SPHG,0,y,z+.3,.42,.38,.5,gold);P_(T_.metal,SPHG,0,y-.05,z+.65,.25,.22,.25,gold);for(let k=0;k<8;k++){const a=k/8*Math.PI*2;P_(T_.metal,CONEG,Math.cos(a)*.42,y+Math.sin(a)*.42,z+.15,.12,.3,.12,gold,Math.PI/2,0,0);}}
  else if(fig===3){for(let k=0;k<6;k++)P_(T_.wall,SPHG,Math.sin(k*1.2)*.18,y-.1+k*.12,z+k*.16,.2-k*.015,.2-k*.015,.24,C(0x2E6A3A));P_(T_.glow,SPHG,0,y+.65,z+1.02,.05,.05,.05,0xFFD040);}
  else if(fig===4){P_(T_.stone,SPHG,0,y,z+.35,.38,.42,.38,bone);for(const sx of[-1,1])P_(T_.dark,SPHG,sx*.14,y+.05,z+.68,.09,.11,.06,0x0E0A08);P_(T_.stone,BOXG,0,y-.32,z+.5,.3,.14,.24,bone);}
  else if(fig===5){P_(T_.metal,SPHG,0,y,z+.25,.3,.36,.42,gold);P_(T_.metal,CONEG,0,y+.05,z+.7,.1,.3,.1,C(0xE0A030),Math.PI/2,0,0);for(const sx of[-1,1])P_(T_.metal,BOXG,sx*.6,y+.2,z,.9,.08,.4,gold,0,sx*.4,sx*.5);}
  const g=BBmesh(T_);g.traverse(m=>{if(m.isMesh)m.castShadow=true;});mesh.add(g);}
/* one crew member of a given unit type on a ship deck */
function addCrewU(s,t){const p=makePerson('pirate',t);p.utype=t;p.role=deckRole(t);p.side=Math.random()<.5?-1:1;
  if(p.role==='gunner'){const gs=s.mesh.userData.guns,gg=gs[Math.floor(Math.random()*gs.length)];p.home={z:gg.z};p.side=gg.s;}
  if(p.role==='lookout'){const n=s.mesh.userData.nest;p.home={z:n.z,y:n.y};}
  p.qd=false;crewTarget(p);p.x=p.tx;p.z=p.tz;crewTarget(p);p.g.scale.setScalar(p.scale/s.S);s.mesh.add(p.g);s.crew.push(p);return p;}
function crewWanted(fs){const out=[];const types=Object.keys(fs.crew).sort((a,b)=>(deckRole(b)!=='sailor')-(deckRole(a)!=='sailor'));for(const t of types)for(let i=0;i<fs.crew[t];i++)out.push(t);
  /* at most 22 people on deck; the specialists first, then a mix */return out.slice(0,22);}
function syncCrew(s,fs){const want=crewWanted(fs),have={};for(const p of s.crew)if(p.state==='alive')have[p.utype]=(have[p.utype]||0)+1;
  if(s===P){const away=[];if(land&&land.partyIl)for(const u of land.partyIl.units)if(u.team===0&&u.ai==='crew'&&u.state==='alive'&&u.utype&&!u.summoned)away.push(u);if(board&&board.units)for(const u of board.units)if(u.team===0&&u.state==='alive'&&u.utype&&u.ai!=='captain')away.push(u);for(const u of away)have[u.utype]=(have[u.utype]||0)+1;}const need={};for(const t of want)need[t]=(need[t]||0)+1;
  for(const t in have)if((need[t]||0)<have[t]){let k=have[t]-(need[t]||0);for(let i=s.crew.length-1;i>=0&&k>0;i--){const p=s.crew[i];if(p.utype===t&&p.state==='alive'){s.mesh.remove(p.g);s.crew.splice(i,1);const j=PEOPLE.indexOf(p);if(j>=0)PEOPLE.splice(j,1);k--;}}}
  for(const t in need){const k=need[t]-(have[t]||0);for(let i=0;i<k;i++)addCrewU(s,t);}
  s.hp=s.crew.filter(q=>q.state==='alive').length;}
let FLEET_KEY='';
function homeHarbour(){const il=ON.myIsl;if(!il)return{x:0,z:-1500,rot:0};const sr=shoreR(il,il.harborA),x=il.x+Math.cos(il.harborA)*(sr+75),z=il.z+Math.sin(il.harborA)*(sr+75);return{x,z,rot:Math.atan2(il.x-x,il.z-z)+Math.PI};}
function syncFleet(first){const me=ON.me;if(!me)return;const now=srvNow(),fs=me.ships.find(s=>s.id===me.flagship)||me.ships[0];if(!fs)return;
  const st=SH.shipStats(fs),key=fs.id+':'+fs.t+':'+fs.sail+':'+fs.fig;
  if(first||!P||FLEET_KEY!==key||!P.online){const h=first||!P?homeHarbour():{x:P.x,z:P.z,rot:P.rot};const old=P,lv=SH.SHIPS[fs.t].lv;
    const n=newShipLook(true,h.x,h.z,h.rot,lv,shipLook(fs));addFigurehead(n.mesh,fs.fig);n.online=true;n.sid=fs.id;
    if(old){n.speed=old.speed;n.captain=old.captain;if(mode!=='foot'&&old.captain&&old.captain.g.parent===old.mesh)old.mesh.remove(old.captain.g);
      for(const p of old.crew){old.mesh.remove(p.g);const j=PEOPLE.indexOf(p);if(j>=0)PEOPLE.splice(j,1);}removeShip(old);}
    else n.captain=P0CAP||(P0CAP=makePerson('captain'));
    P=n;FLEET_KEY=key;if(!n.captain.max)mkUnit(n.captain,0,0,0,landSpace(islands[0]),'captain');if(mode!=='foot')placeCaptain();}
  P.hullMax=st.hull;if(first)P.hull=st.hull;P.hull=Math.min(P.hull,P.hullMax);P.max=st.crew;
  const nav=Math.min(3,fs.crew.navigator||0);P.maxSpeed=st.speed*(1+.06*nav);P.gunDmg=st.gunDmg;P.reloadK=st.reload;P.sid=fs.id;
  syncCrew(P,fs);syncEscorts();}
let P0CAP=null;
/* ---- escorts: the other finished ships with crews follow the flagship ---- */
const ESC=[];
function syncEscorts(){const me=ON.me,now=srvNow();const want=me.ships.filter(s=>s.id!==me.flagship&&!(s.done>now)&&SH.spaceOf(s.crew)>0);
  for(let i=ESC.length-1;i>=0;i--){const e=ESC[i];const d=want.find(s=>s.id===e.sid);if(!d||e.key!==d.t+':'+d.sail+':'+d.fig){removeEsc(e);ESC.splice(i,1);}}
  want.forEach((d,i)=>{let e=ESC.find(q=>q.sid===d.id);if(!e){if(ESC.some(q=>q.deadT>0&&q.sid===d.id))return;const lv=SH.SHIPS[d.t].lv,h=P||homeHarbour(),a=(i%2?1:-1)*(.6+Math.floor(i/2)*.35);
      const s=newShipLook(false,h.x-Math.sin(h.rot)*40*(1+Math.floor(i/2))+Math.cos(h.rot)*25*(i%2?1:-1),h.z-Math.cos(h.rot)*40,h.rot,lv,shipLook(d));addFigurehead(s.mesh,d.fig);s.escort=true;s.isPlayer=false;
      e={s,sid:d.id,key:d.t+':'+d.sail+':'+d.fig,idx:i,deadT:0};ESC.push(e);s.hullMax=s.hull=SH.shipStats(d).hull;}
    e.idx=i;const fsd=me.ships.find(q=>q.id===e.sid);if(fsd)syncCrew(e.s,fsd);});}
function removeEsc(e){scene.remove(e.s.mesh);for(const p of e.s.crew){const j=PEOPLE.indexOf(p);if(j>=0)PEOPLE.splice(j,1);}}
function updateEscorts(dt){if(!P)return;for(let i=ESC.length-1;i>=0;i--){const e=ESC[i],s=e.s;
    if(!s.alive){s.sink=(s.sink||0)+dt;physShip(s,dt,T);if(s.sink>6){scene.remove(s.mesh);e.deadT=60;s.mesh.visible=false;}if(e.deadT>0){e.deadT-=dt;if(e.deadT<=0){removeEsc(e);ESC.splice(i,1);syncEscorts();}}continue;}
    const k=e.idx,row=1+Math.floor(k/2),side=k%2?1:-1,fx=Math.sin(P.rot),fz=Math.cos(P.rot),rx=Math.cos(P.rot),rz=-Math.sin(P.rot);
    const gx=P.x-fx*38*row+rx*26*side*row,gz=P.z-fz*38*row+rz*26*side*row,dx=gx-s.x,dz=gz-s.z,d=Math.hypot(dx,dz);
    if(d>1600){s.x=gx;s.z=gz;s._y=undefined;}
    let want=Math.atan2(dx,dz);const tgt=nearestFoeShip(s,170);
    if(tgt&&d<260){const ang=Math.atan2(tgt.x-s.x,tgt.z-s.z);want=ang+(Math.sin(wrap(ang-s.rot))>0?-1:1)*Math.PI/2*.85;s.cd-=dt;
      if(s.cd<=0&&Math.abs(Math.sin(wrap(ang-s.rot)))>.5){const tf=Math.hypot(tgt.x-s.x,tgt.z-s.z)/(VB*.92);fireBroadside(s,new THREE.Vector3(tgt.x+Math.sin(tgt.rot)*tgt.speed*tf,1.5,tgt.z+Math.cos(tgt.rot)*tgt.speed*tf),'p',10,5);s.cd=3.2+Math.random();}}
    else if(d<30)want=P.rot;
    s.rot+=clamp(wrap(want-s.rot),-.6*dt,.6*dt);const tsp=d>60?Math.min(s.maxSpeed*1.15,P.maxSpeed*1.2):d>25?Math.max(2,Math.abs(P.speed)):Math.abs(P.speed)*.9;s.speed+=(tsp-s.speed)*Math.min(1,dt*.6);
    for(const o of ships.concat(ESC.map(q=>q.s))){if(o===s||!o.alive)continue;const ox=s.x-o.x,oz=s.z-o.z,od=Math.hypot(ox,oz),mn=9*(s.S+o.S);if(od<mn&&od>0){s.x+=ox/od*(mn-od)*.5;s.z+=oz/od*(mn-od)*.5;}}
    physShip(s,dt,T);updateCrew(s,dt);}}
function nearestFoeShip(s,maxD){let b=null,bd=maxD;for(const e of ships){if(e.isPlayer||!e.alive||e.boarded||e.escort)continue;const d=Math.hypot(e.x-s.x,e.z-s.z);if(d<bd){bd=d;b=e;}}return b;}
/* ---- sinking and respawn at the home harbour ---- */
let sinkWait=0;
function onlineSunk(dt){if(sinkWait===0){sinkWait=.001;if(ON.lastPvpBy&&performance.now()-ON.lastPvpT<20000)netSend({t:'sunk'});banner('💥 غرقت سفينتك! رجالك بيرجعونها لجزيرتك',3000);}
  sinkWait+=dt;if(sinkWait>4){sinkWait=0;respawnShip();}}
function respawnShip(){const h=homeHarbour();if(land)endFootSilently();if(mode==='board')board=null;if(boat){scene.remove(boat.mesh);boat=null;}const fsid=P&&P.sid;FLEET_KEY='';const old=P;
  syncFleet(false);if(P===old){/* same key: rebuild anyway */FLEET_KEY='x';syncFleet(false);}P.x=h.x;P.z=h.z;P.rot=h.rot;P.speed=0;P.alive=true;P.hull=P.hullMax;P._y=undefined;mode='sea';placeCaptain();}
function endFootSilently(){const c=land.cap;if(land.horse)dismount();if(land.space==='cave')exitCave();if(land.il){const L=land.il.units,i=L.indexOf(c);if(i>=0)L.splice(i,1);}
  const pil=land.partyIl;if(pil)for(const u of pil.units.slice())if(u.team===0&&u.ai==='crew'){pil.units.splice(pil.units.indexOf(u),1);scene.remove(u.g);const j=PEOPLE.indexOf(u);if(j>=0)PEOPLE.splice(j,1);}
  land=null;$('breath').classList.add('hide');}
/* ---- crew losses at sea are reported in batches ---- */
const LOSS={units:{},t:0};
function noteCrewDeath(p){if(!p||!p.utype||p._lossNoted)return;p._lossNoted=true;LOSS.units[p.utype]=(LOSS.units[p.utype]||0)+1;}
function flushLosses(dt){LOSS.t-=dt;if(LOSS.t>0)return;LOSS.t=3;let any=false;for(const k in LOSS.units)if(LOSS.units[k])any=true;if(!any)return;netSend({t:'crewLoss',ship:P.sid,units:LOSS.units});LOSS.units={};}
