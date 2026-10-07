/* ================= player islands: shape, base layout, buildings, defences, walls (merged into a few draw calls per island) ================= */
const PISL=new Map();/* slot -> island */
const metalMat=new THREE.MeshStandardMaterial({vertexColors:true,metalness:.6,roughness:.42});
const darkMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95});
const glowMat=new THREE.MeshStandardMaterial({vertexColors:true,emissive:0xFFB347,emissiveIntensity:1.4,roughness:.4});
const waterRingMat=new THREE.MeshStandardMaterial({color:0x2E5A5A,roughness:.15,metalness:.1});
function playerIsland(pp){if(pp.slot==null)return null;let il=PISL.get(pp.slot);if(!il){il=makePlayerIsland(pp.slot);PISL.set(pp.slot,il);}
  if(il.pid!==pp.id){if(il.pid&&il.built)clearBase(il);il.pid=pp.id;il.L=null;}il.name='جزيرة '+pp.name;il.owner=ON.me&&pp.id===ON.me.id?'me':'other';if(il.owner==='me')ON.myIsl=il;return il;}
function islandOfPlayer(id){const pp=ON.pl.get(id);return pp&&pp.slot!=null?PISL.get(pp.slot):null;}
function makePlayerIsland(slot){const sp=SH.slotPos(slot),save=rnd;rnd=mulberry32(90001+slot*7919);
  const r=sp.r,el=1.1+rnd()*.35,ea=rnd()*Math.PI;
  const il={x:sp.x,z:sp.z,r,rb:r,el,ea,p2x:0,p2z:0,h2:r*.1,hh:r*(.2+rnd()*.12),mw:.45,s1:rnd()*6.28,s2:rnd()*6.28,s3:rnd()*6.28,px:0,pz:0,
    fort:null,forts:[],town:null,farm:null,farm2:null,villages:[],castle:null,rivers:[],caveSpots:[],caves:[],trees:[],ores:[],digs:[],grass:[],flocks:[],
    owner:'other',units:[],people:[],obs:[],flats:[],name:'',big:false,huge:false,col:false,near:false,wantCave:false,built:false,pl:true,pslot:slot,pid:null,L:null,ents:{},walls:[]};
  islandShape(il,'col',Math.atan2(-sp.z,-sp.x));placePeaks(il);for(const p of il.peaks)p.H*=.7;il.hh*=.7;
  const ha=il.harborA,sr=shoreR(il,ha);let bf=.3;for(let f=.92;f>.12;f-=.01){const x=il.x+Math.cos(ha)*sr*f,z=il.z+Math.sin(ha)*sr*f;if(coastSD(il,x,z)>=74){bf=f;break;}}
  const bx=il.x+Math.cos(ha)*sr*bf,bz=il.z+Math.sin(ha)*sr*bf,h=clamp(rawH(il,bx,bz),4,8),dx=il.x+Math.cos(ha)*sr,dz=il.z+Math.sin(ha)*sr;
  il.base={x:bx,z:bz,ang:Math.atan2(dz-bz,dx-bx),h,R:62,dock:{x:dx,z:dz}};il.flats.push({x:bx,z:bz,R:64,h});
  il.space=landSpace(il);computeBaseLayout(il);rnd=save;islands.push(il);depthAdd(il);artDirty=true;return il;}
function computeBaseLayout(il){const B=il.base,A=B.ang,W=(r,a)=>({x:B.x+Math.cos(A+a)*r,z:B.z+Math.sin(A+a)*r,a});
  const L={plots:[],spots:{}};L.plots[0]=Object.assign(W(0,0),{r:9});
  {const ix=B.dock.x-Math.cos(A)*10,iz=B.dock.z-Math.sin(A)*10;L.plots[1]={x:ix,z:iz,r:7,a:0,yard:true};}
  let k=2;for(const [R,n,o] of[[17,8,.39],[29,12,.26],[41,16,.2]])for(let i=0;i<n;i++)L.plots[k++]=Object.assign(W(R,o+i/n*Math.PI*2),{r:R<20?4.8:6});
  L.wallR=51;L.gates=[0,Math.PI];
  const land=[];for(let i=0;i<14;i++){let a=.23+i/14*Math.PI*2;if(Math.abs(wrap(a))<.2||Math.abs(wrap(a-Math.PI))<.2)a+=.14;land.push(W(46.5,a));}L.spots.land=land;
  L.spots.gate=[W(L.wallR,0),W(L.wallR,Math.PI)];
  const ta=[-.42,-.28,-.14,.02,.16,.3,.44,Math.PI-.24,Math.PI,Math.PI+.24,1.55,-1.55];L.spots.trap=ta.map((a,i)=>W(i%2?57:62,a));
  L.spots.moat=[W(0,0)];
  const sea=[];for(let i=0;i<10;i++){const off=(i%2?1:-1)*(.3+Math.floor(i/2)*.2),a=il.harborA+off,sr=shoreR(il,a);let x=il.x+Math.cos(a)*sr,z=il.z+Math.sin(a)*sr;
    for(let s=0;s<50;s++){const sd=coastSD(il,x,z);if(sd>=6)break;coastGrad(il,x,z,_cg);const st=Math.max(.8,Math.min(6,6-sd));x+=_cg.x*st;z+=_cg.z*st;}sea.push({x,z,a:Math.atan2(z-il.z,x-il.x)});}
  L.spots.sea=sea;
  L.spots.water=[[-.2,48],[.2,48],[-.06,82],[.08,104]].map(([o,d])=>{const a=il.harborA+o,sr=shoreR(il,a);return{x:il.x+Math.cos(a)*(sr+d),z:il.z+Math.sin(a)*(sr+d),a};});
  {const a=il.harborA,sr=shoreR(il,a);L.spots.harbor=[{x:il.x+Math.cos(a)*(sr+26),z:il.z+Math.sin(a)*(sr+26),a}];}
  il.lay=L;}
function spotPos(il,key){const m=/^([a-z]+)(\d+)$/.exec(key);if(!m)return null;const a=il.lay.spots[m[1]];return a?a[+m[2]]:null;}
/* ---- island job for player islands: terrain then the base ---- */
function* playerIslandJob(il){yield* decorateJob(il);buildGrassFor(il);yield;il.baseG=new THREE.Group();scene.add(il.baseG);buildDock(il);yield;
  if(il.pid&&ON.me&&il.pid===ON.me.id)applyLayout(Object.assign({id:ON.me.id},ON.me));else requestLayout(il);}
function requestLayout(il){if(!il.pid||!ON.me)return;if(il.pid===ON.me.id){applyLayout(Object.assign({id:ON.me.id},ON.me));return;}netSend({t:'layout',id:il.pid});}
function clearBase(il){clearAmbient(il);for(const k in il.ents)for(const o of il.ents[k].objs||[])disposeObj(o);il.ents={};il.walls=[];if(il.meshG){disposeObj(il.meshG);il.meshG=null;}if(il.flagG){disposeObj(il.flagG);il.flagG=null;}
  il.obs=il.obs.filter(o=>!o.base);il.L=null;}
function disposeObj(g){if(!g)return;if(g.parent)g.parent.remove(g);g.traverse(m=>{if(m.isMesh&&m.geometry&&!m.geometry.userData.keep)m.geometry.dispose();});}
function baseRefreshMine(){const il=ON.myIsl;if(il&&il.built&&!(RAID.on&&RAID.il===il))applyLayout(Object.assign({id:ON.me.id},ON.me));}
/* layout {bld,def,wall,flag} -> entries (one per building / defence) -> merged meshes */
function applyLayout(L){const pp=ON.pl.get(L.id);if(!pp)return;const il=PISL.get(pp.slot);if(!il||!il.built||!il.baseG)return;if(RAID.on&&RAID.il===il)return;
  il.L=L;const now=srvNow(),mine=pp.id===ON.me.id,old=il.ents,ents={};
  for(let k=0;k<il.lay.plots.length;k++){const b=L.bld[k];if(!b)continue;const P0=il.lay.plots[k],y=islandH(il,P0.x,P0.z),bd=SH.BLD[b.t];if(!bd)continue;
    const ry=k===0?Math.atan2(Math.cos(il.base.ang),Math.sin(il.base.ang)):Math.atan2(il.base.x-P0.x,il.base.z-P0.z)+(k===1?Math.PI:0);
    const e={kind:'bld',key:'b'+k,k,t:b.t,l:b.l,building:b.done>now,x:P0.x,y,z:P0.z,ry,sc:b.t==='castle'||b.t==='lighthouse'?1:1+Math.min(9,b.l-1)*.035,r:bd.fp,alive:true,objs:[]};
    e.max=e.hp=bd.hp(b.l);ents[e.key]=e;}
  for(const kind in il.lay.spots)il.lay.spots[kind].forEach((S,i)=>{const id=kind+i,d=L.def[id];if(!d||!SH.DEF[d.t])return;const st=SH.DEF[d.t].st(d.l),hidden=!!st.hidden;
    const y=kind==='water'||kind==='harbor'?0:islandH(il,S.x,S.z),ry=kind==='moat'||kind==='harbor'?0:Math.atan2(S.x-il.base.x,S.z-il.base.z);
    const e={kind:'def',key:'d'+id,id,spot:kind,S,t:d.t,l:d.l,building:d.done>now,x:S.x,y,z:S.z,ry,sc:1,r:kind==='sea'?3.2:kind==='land'?2.6:kind==='gate'?2.2:0,hidden,show:!hidden||mine,alive:true,objs:[],st};
    e.max=e.hp=st.hp||1;ents[e.key]=e;});
  for(const k in old)for(const o of old[k].objs||[])disposeObj(o);
  il.ents=ents;buildWallData(il,L.wall||0,L.wallDone>now);rebuildBase(il,pp);refreshIslandFlag(il,pp);if(!il.ambient)spawnAmbient(il,pp);}
/* rebuild the merged meshes of one island (also used during raids when something is destroyed) */
function rebuildBase(il,pp){pp=pp||ON.pl.get(il.pid);const ALL=BB();il.obs=il.obs.filter(o=>!o.base);
  for(const k in il.ents){const e=il.ents[k];if(e.kind==='def'&&!e.show)continue;
    if(!e.alive){rubbleInto(ALL,e);continue;}
    const parts=partsFor(e.kind,e.t,e.l,e.building,pp,e.S),m=mk(e.x,e.y,e.z,0,e.ry,0,e.sc);for(const key in parts.T)if(parts.T[key].p.length)batchAppend(ALL[key],parts.T[key],m);
    if(!e.objs.length&&parts.mk)for(const f of parts.mk(pp)){f.position.applyMatrix4(m);f.rotation.y+=e.ry;il.baseG.add(f);e.objs.push(f);}
    if(e.r)il.obs.push({x:e.x,z:e.z,r:e.r+.4,base:true,ent:e});}
  for(const w of il.walls){if(!w.alive){rubbleInto(ALL,{x:w.x,y:w.y,z:w.z,r:2});continue;}wallPartsInto(ALL,il,w);
    const tx=-Math.sin(w.am+il.base.ang),tz=Math.cos(w.am+il.base.ang);
    if(w.gate>=0){il.obs.push({x:w.x,z:w.z,r:1.5,base:true,wall:w});for(const s of[-1,1])il.obs.push({x:w.x+tx*2.6*s,z:w.z+tz*2.6*s,r:1.3,base:true,wall:w});}
    else for(const s of[-1,1])il.obs.push({x:w.x+tx*1.25*s,z:w.z+tz*1.25*s,r:1.75,base:true,wall:w});}
  if(il.meshG)disposeObj(il.meshG);il.meshG=BBmesh(ALL);il.baseG.add(il.meshG);
  for(const k in il.ents){const e=il.ents[k];if(e.t==='crocs'&&e.alive&&e.show&&!e.ring){const ring=new THREE.Mesh(new THREE.RingGeometry(10.5,13,40),waterRingMat);ring.rotation.x=-Math.PI/2;ring.position.set(e.x,e.y+.12,e.z);il.baseG.add(ring);e.objs.push(ring);e.ring=ring;}}}
function rubbleInto(ALL,e){const r=Math.max(1.5,(e.r||3)*.8);for(let k=0;k<5;k++){const a=k*1.3,d=r*(.2+.15*k);P_(ALL.stone,ROCKS[k%3],e.x+Math.cos(a)*d,e.y+.3,e.z+Math.sin(a)*d,.5+r*.12,.35+r*.06,.5+r*.12,C(0x6A625A),k,a,0);}
  P_(ALL.dark,BOXG,e.x,e.y+.05,e.z,r*1.6,.1,r*1.6,0x2A221C,0,.4,0);}
/* ---- shared mesh helpers ---- */
function batchAppend(dst,src,m){const e=m.elements,n=src.p.length/3;
  for(let i=0;i<n;i++){const x=src.p[i*3],y=src.p[i*3+1],z=src.p[i*3+2],nx=src.n[i*3],ny=src.n[i*3+1],nz=src.n[i*3+2];
    dst.p.push(e[0]*x+e[4]*y+e[8]*z+e[12],e[1]*x+e[5]*y+e[9]*z+e[13],e[2]*x+e[6]*y+e[10]*z+e[14]);
    const tx=e[0]*nx+e[4]*ny+e[8]*nz,ty=e[1]*nx+e[5]*ny+e[9]*nz,tz=e[2]*nx+e[6]*ny+e[10]*nz,l=Math.hypot(tx,ty,tz)||1;dst.n.push(tx/l,ty/l,tz/l);}
  for(const v of src.u)dst.u.push(v);for(const v of src.c)dst.c.push(v);}
const PART_CACHE=new Map();
function partsFor(kind,t,l,building,pp,S){const key=kind+':'+t+':'+l+':'+(building?1:0)+(t==='harbor'&&S?':'+S.a.toFixed(2):'');let v=PART_CACHE.get(key);
  if(!v){v=kind==='bld'?buildingParts(t,l,building):defenceParts(t,l,building,S);if(PART_CACHE.size>500)PART_CACHE.clear();PART_CACHE.set(key,v);}return v;}
function BB(){return{wall:new Batch(),roof:new Batch(),thatch:new Batch(),win:new Batch(),stone:new Batch(),cloth:new Batch(),metal:new Batch(),dark:new Batch(),glow:new Batch()};}
const BB_MATS=()=>[['wall',wallMat],['roof',roofMat],['thatch',thatchMat],['win',winMat],['stone',rockMat],['cloth',clothMat],['metal',metalMat],['dark',darkMat],['glow',glowMat]];
function BBmesh(T_,g){g=g||new THREE.Group();for(const [k,m] of BB_MATS()){const b=T_[k];if(!b.p.length)continue;const me=b.mesh(m);me.castShadow=m!==winMat&&m!==glowMat;me.receiveShadow=true;g.add(me);}return g;}
const CONEG=new THREE.ConeGeometry(1,1,12),SPHG=new THREE.SphereGeometry(1,12,8),TORG=new THREE.TorusGeometry(1,.12,6,16),CONE4=new THREE.ConeGeometry(1,1,4);
function P_(b,geo,x,y,z,sx,sy,sz,c,rx,ry,rz){b.add(geo,mk(x,y,z,rx||0,ry||0,rz||0,sx,sy,sz),typeof c==='number'?C(c):c);}
const STONE=()=>C(0xA79E8C).multiplyScalar(.82+Math.random()*.25),TIMBER=0x5A3E26,TRIM=0x3A2818;
function scaffold(T_,w,h,d){for(const sx of[-1,1])for(const sz of[-1,1])P_(T_.wall,BOXG,sx*w/2,h/2,sz*d/2,.18,h,.18,0x8A6A44);
  for(let y=1.5;y<h;y+=2.2){P_(T_.wall,BOXG,0,y,d/2,w,.14,.14,0x8A6A44);P_(T_.wall,BOXG,0,y,-d/2,w,.14,.14,0x8A6A44);P_(T_.wall,BOXG,w/2,y,0,.14,.14,d,0x8A6A44);P_(T_.wall,BOXG,-w/2,y,0,.14,.14,d,0x8A6A44);}}
function tierOf(l){return l>=7?2:l>=4?1:0;}
function gunInto(T_,x,y,z,s,ry,elev){T_.metal.add(CANNON,mk(x,y,z,Math.PI/2-(elev||.12),ry||0,0,s),C(0x2B2B2E));}
/* ---- buildings ---- */
function buildingParts(t,l,building){const T_=BB(),q=tierOf(l);let mkf=null;
  if(t==='castle')castleInto(T_,l,q);
  else if(t==='house'){const w=4.6+q*1.4,d=5+q*1.3,h=3+q*1.6;addHouse(T_,0,0,0,0,w,d,h,{wall:q===2?0xCFC6B0:q?0xB8A27E:0x9C8A6E,roof:q===0?0xC9B07A:q===1?0x6E4A3A:0x4A4A52,thatch:q===0,shut:SHUTTERS[l%4],chimney:q>0,porch:q>0,
      wins:q===2?[[-w*.3,h*.3],[w*.3,h*.3],[-w*.3,h*.72],[w*.3,h*.72]]:null});}
  else if(t==='farm'){const W=9+q*3;for(let i=-2;i<=2;i++)P_(T_.thatch,BOXG,i*W/5,.25,-2,W/5-.4,.5,8,i%2?0xB89A48:0x8A9A3A);
    addHouse(T_,0,0,5.2,Math.PI,4,3.6,2.6,{wall:0x8A2A1E,roof:0x3A3A40,shut:0xE8E2CF,pitch:.7,wins:[[0,1.6]]});
    for(let k=0;k<2+q;k++){P_(T_.thatch,CYLG,-W/2+1+k*1.8,.8,5.5,1.6,1.6,1.6,0xD9B860);P_(T_.thatch,CONEG,-W/2+1+k*1.8,2.1,5.5,.9,.9,.9,0xC9A850);}
    for(let k=-W/2;k<=W/2;k+=2)P_(T_.wall,BOXG,k,.55,-6.6,.12,1.1,.12,TIMBER);P_(T_.wall,BOXG,0,.8,-6.6,W,.08,.08,0x7A5A3A);}
  else if(t==='sawmill'){P_(T_.wall,BOXG,0,2.6,0,6,.2,4.4,TIMBER);for(const sx of[-1,1])for(const sz of[-1,1])P_(T_.wall,BOXG,sx*2.8,1.3,sz*2,.25,2.6,.25,TIMBER);
    P_(T_.roof,BOXG,0,3,0,6.6,.2,5,0x5A3A2A,0,0,.12);P_(T_.metal,CYLG,1.2,1.3,0,1.6,.08,1.6,0xBFC4C8,Math.PI/2,0,0);P_(T_.wall,BOXG,0,.9,0,4,.2,.8,0x7A5A38);
    for(let k=0;k<3+q*2;k++)P_(T_.wall,CYLG,-3.5,.35+(k%3)*.62,-3+Math.floor(k/3)*1.2,.6,4,.6,0x8A6440,0,0,Math.PI/2);}
  else if(t==='mine'){P_(T_.stone,ROCKS[0],0,1.2,-1,4.2+q,2.4+q*.6,3.6,C(0x7A7266));P_(T_.dark,BOXG,0,1.1,1.6,1.6,2.1,.5,0x120D0A);
    for(const sx of[-1,1])P_(T_.wall,BOXG,sx*1,1.2,1.9,.25,2.4,.25,TIMBER);P_(T_.wall,BOXG,0,2.45,1.9,2.4,.25,.25,TIMBER);
    P_(T_.metal,BOXG,1.6,.45,3,1,.6,1.4,0x5A5048);for(let k=0;k<3;k++)P_(T_.stone,BLOBS[k],1.6+(k-1)*.3,.85,3+(k-1)*.3,.35,.25,.35,C(0x8A4A2A));}
  else if(t==='powder'){P_(T_.stone,BOXG,0,1.4,0,3.4,2.8,3,C(0x9A5A44));P_(T_.roof,BOXG,0,2.95,0,3.8,.25,3.4,0x3A3A40);P_(T_.dark,BOXG,0,1.1,1.52,1,2,.1,0x2A1A10);
    for(let k=0;k<4+q*2;k++)P_(T_.wall,CYLG,-2.4+(k%3)*.8,.45+Math.floor(k/3)*.9,2.2,.7,.9,.7,0x6A4A2E);P_(T_.cloth,BOXG,0,3.6,0,.06,.7,1,0xA8261F);}
  else if(t==='store'){addHouse(T_,0,0,0,0,6+q*1.5,5+q,3.2+q*.8,{wall:0x8A6A48,roof:0x5A3A2A,shut:0x3A2818,pitch:.45,wins:[[0,1.8]]});
    for(let k=0;k<4+q*3;k++)P_(k%2?T_.wall:T_.stone,k%2?BOXG:CYLG,-3+(k%4)*1.2,.4+Math.floor(k/4)*.8,4+q*.6,.8,.8,.8,k%2?0x8A6A44:0x6A4A2E);}
  else if(t==='tavern'){addHouse(T_,0,0,0,0,6+q,6,4.6+q*.8,{wall:0xB8A27E,roof:0x7A3A2A,shut:0x2E4A6B,chimney:true,porch:true,wins:[[-1.8,1.6],[1.8,1.6],[-1.8,3.6],[1.8,3.6]]});
    P_(T_.wall,BOXG,2.2,3.2,4.4,.1,.1,1.2,TRIM);P_(T_.cloth,BOXG,2.2,2.7,4.9,.06,.8,.9,0xC9A04A);for(let k=0;k<3;k++)P_(T_.wall,CYLG,-2.8+k*.9,.45,4.2,.75,.9,.75,0x6A4A2E);}
  else if(t==='barracks'){addHouse(T_,0,0,0,0,8+q*1.5,4.6,3.2+q*.5,{wall:q===2?0xCFC6B0:0x8A6A48,roof:0x4A4A52,shut:0x7A2A22,pitch:.4,wins:[[-2.4,1.7],[0,1.7],[2.4,1.7]]});
    for(let k=0;k<3;k++){P_(T_.wall,BOXG,-2+k*2,1,3.2,.1,2,.1,TIMBER);P_(T_.metal,BOXG,-2+k*2,1.6,3.25,.04,1.3,.04,0xCDD3DA,0,0,.2);}
    P_(T_.wall,CYLG,-4.4,3,2,.16,6,.16,0x5A4030);
    mkf=pp=>{const fl=makeWaveFlag(flagTexFor(pp));fl.scale.setScalar(.7);fl.position.set(-4.4,5.4,2);return[fl];};}
  else if(t==='shipyard'){P_(T_.wall,BOXG,0,.25,0,7,.4,13,0x8A6A48);for(let z=-6;z<=6;z+=2){P_(T_.wall,CYLG,-3.3,-1.5,z,.4,4,.4,TIMBER);P_(T_.wall,CYLG,3.3,-1.5,z,.4,4,.4,TIMBER);}
    for(let i=0;i<7;i++){const z=-4.5+i*1.5,w=1.2+Math.sin(i/6*Math.PI)*1.6;P_(T_.wall,TORG,0,2.2,z,w,w*1.1,1,0x8A6440,0,Math.PI/2,0);}P_(T_.wall,BOXG,0,.9,0,.3,.3,10,0x6A4A2E);
    P_(T_.wall,BOXG,4.4,4,-5,.3,8,.3,TIMBER);P_(T_.wall,BOXG,2.6,7.8,-5,4,.25,.25,TIMBER,0,0,-.15);for(let k=0;k<q+1;k++)P_(T_.wall,CYLG,-4.6,.45,-4+k*1.1,.7,.9,.7,0x6A4A2E);}
  else if(t==='bell'){for(const sx of[-1,1])P_(T_.wall,BOXG,sx*1.2,2.4,0,.3,4.8,.3,TIMBER,0,0,-sx*.08);P_(T_.wall,BOXG,0,4.6,0,3,.3,.4,TIMBER);P_(T_.roof,BOXG,0,5.1,0,3.4,.18,1.4,0x5A3A2A);
    P_(T_.metal,new THREE.CylinderGeometry(.35,.75,1.1,14,1,true),0,3.9,0,1,1,1,0xC9A04A);P_(T_.stone,BOXG,0,.15,0,3.2,.3,1.4,STONE());}
  else if(t==='lighthouse'){const H=10+l*1.4;for(let k=0;k<6;k++)P_(T_.stone,CYLG,0,(k+.5)*H/6,0,2.6-k*.12,H/6,2.6-k*.12,k%2?0xE8E0CC:0xA8322A);
    P_(T_.glow,CYLG,0,H+.7,0,1.3,1.4,1.3,0xFFE0A0);P_(T_.roof,CONEG,0,H+2.2,0,1.2,1.4,1.2,0x3A3A40);P_(T_.metal,BOXG,0,H+.05,0,2.4,.12,2.4,0x2A2A2E);}
  else if(t==='vault'){P_(T_.stone,BOXG,0,1.6,0,4.6,3.2,4,STONE());P_(T_.stone,new THREE.CylinderGeometry(2.3,2.3,4,14,1,false,0,Math.PI),0,3.2,0,1,1,1,STONE(),0,0,Math.PI/2);
    P_(T_.metal,BOXG,0,1.3,2.05,1.6,2.4,.12,0x3A3A40);for(const sx of[-1,1])P_(T_.stone,SPHG,sx*.5,4.3,1.6,.28,.32,.28,0xE8E2D0);
    for(let k=0;k<2*l;k++){const a=-1.2+k*.5,x=Math.cos(a)*5.5,z=Math.sin(a)*5.5+1;P_(T_.stone,BOXG,x,.45,z,.6,.9,.15,0x8A8478,0,-a,0);P_(T_.dark,BOXG,x,.04,z+.8,.8,.06,1.6,0x4A3A2A,0,-a,0);}}
  if(building){const fp=(SH.BLD[t]||{fp:5}).fp;scaffold(T_,fp*1.5,4+(t==='castle'?8:0),fp*1.4);}
  return{T:T_,mk:mkf};}
function castleInto(T_,l,q){const st=STONE;
  if(q===0){for(let i=0;i<14;i++){const a=i/14*Math.PI*2;P_(T_.wall,CYLG,Math.cos(a)*6,2,Math.sin(a)*6,.6,4+(i%2)*.4,.6,0x6A4A2E);}
    P_(T_.wall,BOXG,0,3.4,0,5,6.8,5,0x8A6A48);P_(T_.roof,CONE4,0,8.3,0,4.2,3,4.2,0x5A3A2A,0,Math.PI/4,0);P_(T_.dark,BOXG,0,1.2,2.55,1.4,2.4,.1,0x2A1A10);
    for(let k=0;k<Math.min(3,l);k++)P_(T_.win,BOXG,-1.6+k*1.6,4.5,2.55,.6,.8,.1,WHITE);return;}
  const S=q===1?7:9,WH=q===1?6:8,TH=WH+4;
  P_(T_.stone,BOXG,0,(WH+3)/2,0,S*1.1,WH+3,S*1.1,st());for(let k=-S*.5;k<=S*.5;k+=1.6){P_(T_.stone,BOXG,k,WH+3.5,S*.55,.8,1,.8,st());P_(T_.stone,BOXG,k,WH+3.5,-S*.55,.8,1,.8,st());P_(T_.stone,BOXG,S*.55,WH+3.5,k,.8,1,.8,st());P_(T_.stone,BOXG,-S*.55,WH+3.5,k,.8,1,.8,st());}
  for(const [tx,tz] of[[-1,-1],[1,-1],[-1,1],[1,1]]){const x=tx*S*.62,z=tz*S*.62;P_(T_.stone,CYLG,x,TH/2,z,2.8,TH,2.8,st());P_(T_.roof,CONEG,x,TH+1.6,z,1.9,3.2,1.9,0x3A3A46);P_(T_.dark,BOXG,x+tx*1.42,TH*.6,z,.12,1,.4,0x140E0A);}
  P_(T_.dark,BOXG,0,1.6,S*.56,2,3.2,.2,0x140E0A);for(const sd of[-1,1])P_(T_.cloth,BOXG,sd*2.2,WH*.7,S*.56,1.1,3.4,.06,0x9B1C1C);
  if(q===2){P_(T_.stone,CYLG,0,WH+6.5,-1,4,7,4,st());P_(T_.roof,CONEG,0,WH+12,-1,2.6,4,2.6,0x3A3A46);for(const wy of[3,6])for(const wx of[-2.4,2.4])P_(T_.win,BOXG,wx,wy,S*.56,.7,1.1,.1,WHITE);}}
function castleTop(l){const q=tierOf(l);return q===0?11:q===1?16:22;}
/* ---- defences ---- */
function defenceParts(t,l,building,S){const T_=BB(),q=tierOf(l);let top=2.4;
  if(t==='cannon'||t==='chain'){P_(T_.stone,CYLG,0,.7,0,5.6,1.4,5.6,STONE());for(let k=0;k<8;k++){const a=k/8*Math.PI*2;if(Math.abs(Math.sin(a))<.38&&Math.cos(a)>0)continue;P_(T_.stone,BOXG,Math.sin(a)*2.5,1.75,Math.cos(a)*2.5,1,.8,1,STONE(),0,a,0);}
    P_(T_.wall,BOXG,0,1.75,0,1.3,.5,2.2,TIMBER);gunInto(T_,0,2.2,.2,1.1+q*.2,0);if(t==='chain'){gunInto(T_,.75,2.2,.2,.9,0);P_(T_.metal,TORG,.35,2.5,2,.25,.25,.25,0x5A5A60);}top=2.6;}
  else if(t==='mortar'){P_(T_.stone,CYLG,0,.5,0,4,1,4,STONE());P_(T_.metal,new THREE.CylinderGeometry(.75,.95,1.4,14,1,true),0,1.6,0,1+q*.15,1,1+q*.15,0x2B2B2E,-.5,0,0);P_(T_.wall,BOXG,0,1.05,0,1.6,.3,1.6,TIMBER);
    for(let k=0;k<4;k++)P_(T_.metal,SPHG,1.6,1.2+(k>2?.35:0),-.6+(k%3)*.35,.17,.17,.17,0x1A1A1E);top=2.4;}
  else if(t==='firecat'){P_(T_.wall,BOXG,0,.4,0,3,.4,4,TIMBER);for(const sx of[-1,1])P_(T_.wall,BOXG,sx*1.1,2,0,.3,3.6,.3,TIMBER,0,0,sx*.1);P_(T_.wall,BOXG,0,3.6,0,2.6,.3,.3,TIMBER);
    P_(T_.wall,BOXG,0,3.8,-.6,.25,.25,6,0x6A4A2E,.5,0,0);P_(T_.metal,new THREE.CylinderGeometry(.5,.35,.5,10,1,true),0,5.2,-3.1,1,1,1,0x3A3A40);P_(T_.glow,SPHG,0,5.4,-3.1,.35,.25,.35,0xFF8A2A);top=5;}
  else if(t==='tower'){const H=6+q*2.5;if(q<2){for(const sx of[-1,1])for(const sz of[-1,1])P_(T_.wall,BOXG,sx*1.3,H/2,sz*1.3,.3,H,.3,TIMBER);P_(T_.wall,BOXG,0,H,0,3.4,.25,3.4,0x8A6A48);
      for(let y=1.6;y<H;y+=2.2){P_(T_.wall,BOXG,0,y,1.3,2.6,.12,.12,TIMBER,0,0,.6);P_(T_.wall,BOXG,0,y,-1.3,2.6,.12,.12,TIMBER,0,0,-.6);}}
    else P_(T_.stone,CYLG,0,H/2,0,3.4,H,3.4,STONE());
    for(const [x,z,w,d] of[[1.6,0,.15,3.4],[-1.6,0,.15,3.4],[0,1.6,3.4,.15],[0,-1.6,3.4,.15]])P_(T_.wall,BOXG,x,H+.55,z,w,1,d,TIMBER);
    P_(q===0?T_.thatch:T_.roof,CONE4,0,H+2.3,0,2.6,1.8,2.6,q===0?0xC9B07A:0x5A3A2A,0,Math.PI/4,0);for(const sx of[-1,1])P_(T_.wall,BOXG,sx*1.5,H+1.25,1.5,.12,1.4,.12,TIMBER);top=H+.3;}
  else if(t==='gatling'){P_(T_.stone,CYLG,0,.4,0,3.2,.8,3.2,STONE());P_(T_.wall,BOXG,0,1.1,0,1.2,.6,1.4,TIMBER);for(let k=0;k<6;k++){const a=k/6*Math.PI*2;P_(T_.metal,CYLG,Math.cos(a)*.18,1.55+Math.sin(a)*.18,.8,.09,1.6,.09,0x2B2B2E,Math.PI/2,0,0);}
    for(const sx of[-1,1])P_(T_.wall,CYLG,sx*.75,.9,0,1,.12,1,0x5A3A22,0,0,Math.PI/2);top=1.6;}
  else if(t==='totem'){const H=4+l;for(let k=0;k<4;k++)P_(T_.wall,CYLG,0,(k+.5)*H/4,0,1.1-k*.08,H/4,1.1-k*.08,[0x6A3A22,0x8A4A2A,0x5A2A1A,0x7A5A2A][k]);
    P_(T_.stone,SPHG,0,H+.5,0,.6,.7,.6,0xE8E2D0);for(const sx of[-1,1])P_(T_.glow,SPHG,sx*.2,H+.6,.48,.08,.08,.08,0x6AFF8A);for(const sx of[-1,1])P_(T_.cloth,BOXG,sx*.7,H+.9,0,.06,1.2,.25,sx>0?0xC9452A:0x2E8A6A,0,0,sx*.4);top=H;}
  else if(t==='oil'){P_(T_.stone,CYLG,0,3,0,3,6,3,STONE());P_(T_.metal,new THREE.CylinderGeometry(.7,.5,.8,12),0,6.4,0,1,1,1,0x2A2A2E);P_(T_.glow,CYLG,0,6.85,0,1.1,.05,1.1,0xC28A2A);top=6.5;}
  else if(t==='harbor'){const a=S?S.a:0,len=60,ux=-Math.sin(a),uz=Math.cos(a);for(let k=-len/2;k<=len/2;k+=3)P_(T_.wall,CYLG,ux*k,.1,uz*k,.8,3,.8,0x6A4A2E,Math.PI/2,-a,0);
    for(const s of[-1,1])P_(T_.stone,CYLG,ux*s*len/2,1,uz*s*len/2,3,4,3,STONE());}
  else if(t==='mines'){for(let k=0;k<3;k++){const a=k*2.1;P_(T_.wall,CYLG,Math.cos(a)*3,.25,Math.sin(a)*3,.9,1.1,.9,0x5A3A22);P_(T_.metal,CYLG,Math.cos(a)*3,.85,Math.sin(a)*3,.06,.4,.06,0x2A2A2E);}}
  else if(t==='pit'){P_(T_.thatch,CYLG,0,.05,0,3.2,.1,3.2,0x8A7A50);for(let k=0;k<5;k++)P_(T_.wall,BOXG,-1.2+k*.6,.12,0,.12,.06,3,TIMBER);}
  else if(t==='net'){for(let k=-2;k<=2;k++){P_(T_.dark,BOXG,k*.7,.05,0,.04,.04,3,0x8A7A5A);P_(T_.dark,BOXG,0,.05,k*.7,3,.04,.04,0x8A7A5A);}}
  else if(t==='keg'){P_(T_.wall,CYLG,0,.15,0,.9,.4,.9,0x5A3A22);P_(T_.dark,BOXG,0,.32,0,.3,.04,.05,0x2A1A10);}
  else if(t==='spikes'){for(let k=0;k<14;k++){const a=k*2.4,r=(k%3)*.7+.4;P_(T_.wall,CONEG,Math.cos(a)*r,.4,Math.sin(a)*r,.08,.8,.08,0x8A6A44,0,0,(k%2-.5)*.4);}}
  else if(t==='crocs'){for(let k=0;k<2+l;k++){const a=k/(2+l)*Math.PI*2+.3,r=11.7;P_(T_.dark,BOXG,Math.cos(a)*r,.2,Math.sin(a)*r,.6,.25,2,0x3A4A2A,0,-a,0);for(const sx of[-1,1])P_(T_.glow,SPHG,Math.cos(a)*r+sx*.18,.34,Math.sin(a)*r,.06,.06,.06,0xE8D04A);}}
  if(building)scaffold(T_,3.4,3,3.4);return{T:T_,mk:null,top};}
/* ---- walls: ring of segments with two gatehouses ---- */
function buildWallData(il,lvl,building){il.walls=[];il.wallL=lvl;if(!lvl)return;const B=il.base,R=il.lay.wallR,n=Math.round(Math.PI*2*R/5),q=tierOf(lvl);
  for(let i=0;i<n;i++){const am=(i+.5)/n*Math.PI*2;let gate=-1;il.lay.gates.forEach((ga,gi)=>{if(Math.abs(wrap(am-ga))<Math.PI/n*1.05)gate=gi;});
    const x=B.x+Math.cos(B.ang+am)*R,z=B.z+Math.sin(B.ang+am)*R,y=islandH(il,x,z),hp=SH.WALL.hp(lvl)*(gate>=0?2.2:1);
    il.walls.push({x,z,y,am,gate,hp,max:hp,alive:true,i,len:2*R*Math.sin(Math.PI/n)+.3,q,building});}}
function wallPartsInto(ALL,il,w){const H=w.q===0?3.4:w.q===1?4.6:5.4,ry=-(il.base.ang+w.am),m=mk(w.x,w.y,w.z,0,ry,0),T_=BB(),len=w.len;
  if(w.gate>=0){for(const s of[-1,1])P_(T_.stone,BOXG,0,(H+2)/2,s*2.4,2.2,H+2,1.6,C(0xA79E8C));P_(T_.stone,BOXG,0,H+1.4,0,2.2,1.2,6.4,C(0x9A917F));P_(T_.wall,BOXG,0,H*.42,0,.3,H*.84,3.2,w.q===2?0x4A4A50:0x5A3A22);}
  else if(w.q===0){for(let k=-2;k<=2;k++)P_(T_.wall,CYLG,0,H/2,k*len/5,.5,H+(k%2)*.4,.5,0x6A4A2E);P_(T_.wall,BOXG,0,H*.7,0,.2,.2,len,TIMBER);}
  else{P_(T_.stone,BOXG,0,H/2,0,1.6,H,len,C(0xA79E8C).multiplyScalar(.9+(w.i%3)*.05));for(const s of[-.25,.25])P_(T_.stone,BOXG,0,H+.45,s*len,1.7,.9,len*.3,C(0x9A917F));if(w.q===2)P_(T_.metal,BOXG,.82,H*.5,0,.08,.3,len,0x3A3A40);}
  if(w.building)scaffold(T_,2,H,len);for(const k in T_)if(T_[k].p.length)batchAppend(ALL[k],T_[k],m);}
/* ---- castle flag with the owner's flag (clan leader's flag in the corner) ---- */
function refreshIslandFlag(il,pp){if(il.flagG){disposeObj(il.flagG);il.flagG=null;}const e=il.ents.b0;if(!e||!e.alive)return;const h=castleTop(e.l);
  const g=new THREE.Group(),pole=new THREE.Mesh(new THREE.CylinderGeometry(.1,.14,7,8),M(0x5A4030));pole.position.y=3.5;g.add(pole);const fl=makeWaveFlag(flagTexFor(pp));fl.position.set(0,6.2,0);fl.rotation.y=-.6;g.add(fl);
  g.position.set(e.x,e.y+h,e.z);il.baseG.add(g);il.flagG=g;il.flagM=fl;il.flagTop=e.y+h+6.2;il.pole={x:e.x+Math.cos(il.base.ang)*10.5,z:e.z+Math.sin(il.base.ang)*10.5};}
function refreshMyFlag(){if(!ON.me)return;const pp=myPub();if(!pp)return;for(const il of PISL.values())if(il.pid&&il.built&&il.baseG){const q=ON.pl.get(il.pid);if(q)refreshIslandFlag(il,q);}
  if(P&&P.mesh&&P.mesh.userData.flag){P.mesh.userData.flag.material.map=flagTexFor(pp);P.mesh.userData.flag.material.needsUpdate=true;}}
/* ---- dock in front of the shipyard ---- */
function buildDock(il){const B=il.base,a=B.ang,T_=BB(),x0=B.dock.x-Math.cos(a)*6,z0=B.dock.z-Math.sin(a)*6;
  for(let k=0;k<26;k+=.9){const x=x0+Math.cos(a)*k,z=z0+Math.sin(a)*k;P_(T_.wall,BOXG,x,1.85,z,3.6,.14,.8,C(0x8A6A48).multiplyScalar(.85+Math.random()*.25),0,-a+Math.PI/2,0);
    if(Math.round(k/.9)%4===0)for(const s of[-1,1])P_(T_.wall,CYLG,x-Math.sin(a)*s*1.7,-.5,z+Math.cos(a)*s*1.7,.3,4.8,.3,0x4A3424);}
  il.dockEnd={x:x0+Math.cos(a)*30,z:z0+Math.sin(a)*30};BBmesh(T_,il.baseG);}
