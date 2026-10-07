/* ================= world events: ghost ship, giant kraken, royal convoy (bosses shared by every captain) ================= */
const EVC=new Map();
const EV_AR={ghost:'سفينة الأشباح',kraken:'الأخطبوط العملاق',convoy:'قافلة الملك'},EV_IC={ghost:'skull',kraken:'octo',convoy:'crown'};
const GHOST_LOOK={hull:0x1E2622,trim:0x3A4A40,band:0x2A3A30,low:0x1A221E,rail:0x141A16,sail:0x7A9A84,flagTex:flagTex('#0E1A12','#7AF0A0')};
const ghostGlowMat=new THREE.SpriteMaterial({map:glintTex,color:0x6AFF9A,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,fog:false,opacity:.75});
function evPosC(e,t){const k=clamp((t-e.start)/e.dur,0,1),a=e.a0+(e.a1-e.a0)*k,d=Math.sign(e.a1-e.a0)||1;return{x:Math.cos(a)*e.r,z:Math.sin(a)*e.r,rot:Math.atan2(-Math.sin(a)*d,Math.cos(a)*d),k};}
function evCrew(s,n,fn){for(let i=0;i<n;i++){const p=fn();p.side=Math.random()<.5?-1:1;p.qd=false;p.role=p.rw==='musket'?'musket':'sailor';crewTarget(p);p.x=p.tx;p.z=p.tz;crewTarget(p);
  p.g.scale.setScalar(p.scale/s.S);s.mesh.add(p.g);s.crew.push(p);}s.hp=n;}
function evAdd(e){let c=EVC.get(e.id);if(c){c.e=e;c.hp=e.hp;return;}const p=evPosC(e,srvNow());c={e,hp:e.hp,ships:[],kr:null,cd:3,end:0,win:false,bar:makeBar(0x9A4AE0)};
  if(e.k==='ghost'){const s=newShipLook(false,p.x,p.z,p.rot,3,GHOST_LOOK);tatter(s.mesh);s.ev=true;evCrew(s,10,()=>makePerson('skeleton','sailor'));
    for(let i=0;i<6;i++){const sp=new THREE.Sprite(ghostGlowMat);sp.scale.set(3.2,3.2,1);sp.position.set((i%2?1:-1)*2.2,4+Math.random()*2,-5+i*2.2);s.mesh.add(sp);}c.ships.push({s,ox:0,oz:0});}
  else if(e.k==='convoy'){for(const [ox,oz] of[[0,0],[-26,-42],[26,-42]]){const s=newShipLook(false,p.x,p.z,p.rot,ox?2:3,FOE_LOOKS[2]);s.ev=true;evCrew(s,8,()=>makePerson('soldier',Math.random()<.5?'musket':'sword'));c.ships.push({s,ox,oz});}}
  else if(e.k==='kraken'){c.kr=makeKraken();c.kr.g.position.set(p.x,-30,p.z);scene.add(c.kr.g);c.rise=0;}
  EVC.set(e.id,c);artDirty=true;}
function evHpC(m){const c=EVC.get(m.id);if(c){c.e.hp=m.hp;c.hp=Math.min(c.hp,m.hp);if(m.hp>c.hp)c.hp=m.hp;}}
function evEndC(m){const c=EVC.get(m.id);if(!c)return;c.win=!!m.win;c.end=performance.now();c.hp=m.win?0:c.hp;
  for(const q of c.ships)if(m.win){q.s.alive=false;q.s.sink=0;boom(q.s.mesh.position.clone().add(new THREE.Vector3(0,4,0)));}
  if(m.win){const top=(m.top||[]).map(([n,p])=>esc(n)+' '+p+'%').join(' · ');banner('🏆 انهزم '+EV_AR[c.e.k]+'!'+(top?' '+top:''),4200);}else banner(EV_AR[c.e.k]+' اختفى في الضباب',2400);}
function evRemove(id){const c=EVC.get(id);if(!c)return;for(const q of c.ships){scene.remove(q.s.mesh);for(const p of q.s.crew){const j=PEOPLE.indexOf(p);if(j>=0)PEOPLE.splice(j,1);}}
  if(c.kr)scene.remove(c.kr.g);if(c.bar)scene.remove(c.bar.g);EVC.delete(id);artDirty=true;}
/* ---- the kraken: a big head with eyes and eight skinned tentacles ---- */
const krakenMat=new THREE.MeshStandardMaterial({color:0x3E1620,roughness:.42,metalness:.05}),krakenTentMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.48,skinning:true}),
  krEyeMat=new THREE.MeshStandardMaterial({color:0xE8C84A,emissive:0x6A4A08,roughness:.25}),krPupMat=new THREE.MeshStandardMaterial({color:0x0A0806,roughness:.3});
function makeTentacle(len,r0,r1,nb){const seg=len/nb,geo=new THREE.CylinderGeometry(r1,r0,len,12,nb*3,false);geo.translate(0,len/2,0);
  const P=geo.attributes.position,si=[],sw=[],col=[],cTop=C(0x4A1A26),cIn=C(0xB87A82);
  for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),f=clamp(y/seg,0,nb-1e-3),b=Math.floor(f),k=f-b;si.push(b,Math.min(nb-1,b+1),0,0);sw.push(1-k,k,0,0);
    const inner=z<-.2*Math.hypot(x,z)?1:0,suck=inner&&Math.sin(y*3.1)>.4?1:0,c=cTop.clone().lerp(cIn,inner*.55+suck*.3);col.push(c.r,c.g,c.b);}
  geo.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(si,4));geo.setAttribute('skinWeight',new THREE.Float32BufferAttribute(sw,4));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  const bones=[];for(let i=0;i<nb;i++){const b=new THREE.Bone();b.position.y=i?seg:0;if(i)bones[i-1].add(b);bones.push(b);}
  const mesh=new THREE.SkinnedMesh(geo,krakenTentMat);mesh.add(bones[0]);mesh.bind(new THREE.Skeleton(bones));mesh.frustumCulled=false;mesh.castShadow=true;return{mesh,bones,seg,nb};}
function makeKraken(){const g=new THREE.Group();
  const head=new THREE.Mesh(new THREE.SphereGeometry(1,28,20),krakenMat);head.scale.set(7.5,8.5,8.2);head.position.y=2;head.castShadow=true;g.add(head);
  const mant=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),krakenMat);mant.scale.set(5.8,8.5,6.8);mant.position.set(0,8,-4.5);mant.rotation.x=-.55;mant.castShadow=true;g.add(mant);
  for(const s of[-1,1]){const eye=new THREE.Mesh(new THREE.SphereGeometry(1.3,16,12),krEyeMat);eye.position.set(s*5.1,4.4,5.2);g.add(eye);const pu=new THREE.Mesh(new THREE.BoxGeometry(.35,1.7,.5),krPupMat);pu.position.set(s*5.35,4.4,6.35);pu.rotation.y=s*.5;g.add(pu);
    const lid=new THREE.Mesh(new THREE.SphereGeometry(1.45,14,8,0,Math.PI*2,0,Math.PI*.42),krakenMat);lid.position.copy(eye.position);lid.rotation.x=-.5;g.add(lid);}
  const tents=[];for(let i=0;i<8;i++){const a=i/8*Math.PI*2+.2,t=makeTentacle(19+Math.random()*5,1.7,.16,12);t.mesh.position.set(Math.sin(a)*7.5,-2,Math.cos(a)*7.5);t.mesh.rotation.y=a;g.add(t.mesh);
    tents.push(Object.assign(t,{a,ph:Math.random()*6,atk:0}));}
  return{g,head,tents,slam:0,slamI:0};}
function animKraken(c,dt){const K=c.kr,t=T;for(const q of K.tents){const isAtk=K.slam>0&&q===K.tents[K.slamI];let atk=isAtk?Math.sin(Math.min(1,K.slam)*Math.PI):0;
    for(let j=0;j<q.nb;j++){const f=j/q.nb;q.bones[j].rotation.x=(j===0?.55:0)+Math.sin(t*1.3+q.ph+j*.55)*(.08+.16*f)+(j>2?.06:0)-atk*(j<4?.45:-.25);q.bones[j].rotation.z=Math.sin(t*.9+q.ph*1.7+j*.4)*.06*f;}}}
/* ---- per frame ---- */
function evFrame(dt){const now=srvNow(),pn=performance.now();let best=null,bd=900;
  for(const [id,c] of EVC){const e=c.e,pos=evPosC(e,now),far=Math.hypot(pos.x-camera.position.x,pos.z-camera.position.z)>2600;
    if(c.end&&pn-c.end>9000){evRemove(id);continue;}
    if(!c.end&&now>e.start+e.dur+5000){evRemove(id);continue;}
    for(const q of c.ships){const s=q.s;s.mesh.visible=!far;if(far&&s.alive){s.x=pos.x;s.z=pos.z;continue;}
      if(s.alive){const fx=Math.sin(pos.rot),fz=Math.cos(pos.rot),rx=Math.cos(pos.rot),rz=-Math.sin(pos.rot),tx=pos.x+fx*q.oz+rx*q.ox,tz=pos.z+fz*q.oz+rz*q.ox;
        if(Math.hypot(tx-s.x,tz-s.z)>200){s.x=tx;s.z=tz;}else{s.x+=(tx-s.x)*Math.min(1,dt*.8);s.z+=(tz-s.z)*Math.min(1,dt*.8);}s.rot+=wrap(pos.rot-s.rot)*Math.min(1,dt*.6);}
      const sp=s.speed;s.speed=0;physShip(s,dt,T);s.speed=sp;updateCrew(s,dt);
      if(!c.end&&s.alive&&P&&P.alive&&mode!=='foot'){const d=Math.hypot(P.x-s.x,P.z-s.z);s.cd=(s.cd||2)-dt;
        if(d<175&&s.cd<=0){const ang=Math.atan2(P.x-s.x,P.z-s.z);if(Math.abs(Math.sin(wrap(ang-s.rot)))>.45){const tf=d/(VB*.92);fireBroadside(s,new THREE.Vector3(P.x+Math.sin(P.rot)*P.speed*tf,1,P.z+Math.cos(P.rot)*P.speed*tf),'e',e.k==='ghost'?9:7,8+d*.05);s.cd=e.k==='ghost'?3.6:4.4+Math.random();}else s.cd=.4;}}
      if(e.k==='ghost'&&!far&&Math.random()<dt*3)puff(new THREE.Vector3(s.x+(Math.random()-.5)*8,s.mesh.position.y+2+Math.random()*6,s.z+(Math.random()-.5)*14),0x9AF0B0,1,1.2,1,1.5,1.4);}
    if(c.kr){const K=c.kr;K.g.visible=!far;
      if(!far){c.rise=c.end&&c.win?Math.max(0,c.rise-dt*.25):Math.min(1,c.rise+dt*.3);K.g.position.set(pos.x,lerp(-30,-2+Math.sin(T*.5)*.6,c.rise),pos.z);
        if(P&&P.alive)K.g.rotation.y+=wrap(Math.atan2(P.x-pos.x,P.z-pos.z)-K.g.rotation.y)*Math.min(1,dt*.3);
        if(K.slam>0){K.slam+=dt*1.6;if(K.slam>=1){K.slam=0;}}animKraken(c,dt);
        if(Math.random()<dt*2)splash(new THREE.Vector3(pos.x+(Math.random()-.5)*26,0,pos.z+(Math.random()-.5)*26));
        if(!c.end&&P&&P.alive&&mode!=='foot'&&c.rise>.9){const d=Math.hypot(P.x-pos.x,P.z-pos.z);c.cd-=dt;
          if(d<85&&c.cd<=0){c.cd=2.6+Math.random();let bi=0,ba=9;const la=Math.atan2(P.x-pos.x,P.z-pos.z)-K.g.rotation.y;K.tents.forEach((q,i)=>{const da=Math.abs(wrap(q.a-la));if(da<ba){ba=da;bi=i;}});K.slamI=bi;K.slam=.001;
            setTimeout(()=>{if(!P.alive)return;const p=new THREE.Vector3(P.x+(Math.random()-.5)*6,1,P.z+(Math.random()-.5)*6);splash(p);splash(p.clone().add(new THREE.Vector3(2,0,1)));damageShip(P,p,d<45?12:8,.22);shake=Math.max(shake,.5);
              if(d<45){P.slowT=1.6;P.slowK=.55;}},450);}}}}
    const cp=c.kr?c.kr.g.position:c.ships[0]&&c.ships[0].s.mesh.position;if(cp){setBar(c.bar,cp.x,(c.kr?16:cp.y+30),cp.z,c.hp/e.max,!far&&!c.end&&Math.hypot(cp.x-focus.x,cp.z-focus.z)<700,'');
      if(!c.end){const d=Math.hypot(cp.x-focus.x,cp.z-focus.z);if(d<bd){bd=d;best=c;}}}}
  const bb=$('bossBar');if(bb){bb.classList.toggle('hide',!best);if(best){$('bossName').textContent=EV_AR[best.e.k];$('bossFill').style.width=Math.max(0,best.hp/best.e.max*100)+'%';}}}
/* ---- my cannonballs hitting a boss ---- */
function evBallHit(p,dmg){for(const [id,c] of EVC){if(c.end)continue;let hit=false;
    for(const q of c.ships)if(q.s.alive&&q.s.mesh.visible&&hitShip(q.s,p)){hit=true;break;}
    if(!hit&&c.kr&&c.kr.g.visible){const g=c.kr.g.position;if(Math.hypot(p.x-g.x,p.z-g.z)<12&&p.y<g.y+16)hit=true;}
    if(hit){netSend({t:'evHit',id,dmg:Math.min(60,dmg)});c.hp=Math.max(0,c.hp-dmg);if(c.kr)puff(p.clone(),0x5A1A3A,6,.6,3,3,.6);return true;}}
  return false;}
function evTargets(){const out=[];for(const c of EVC.values()){if(c.end)continue;for(const q of c.ships)if(q.s.alive&&q.s.mesh.visible)out.push({x:q.s.x,z:q.s.z,y:q.s.mesh.position.y+3*q.s.S,rot:q.s.rot,sp:3});
    if(c.kr&&c.kr.g.visible)out.push({x:c.kr.g.position.x,z:c.kr.g.position.z,y:4,rot:0,sp:0});}return out;}
function evAimCandidates(consider){for(const t of evTargets()){const c=new THREE.Vector3(t.x,t.y,t.z);c.s=1.6;consider(c,()=>new THREE.Vector3(t.x,1.5,t.z));}}
function evAutoTarget(best,bd){for(const t of evTargets()){const d=Math.hypot(t.x-P.x,t.z-P.z);if(d<175&&d<bd){const [lx,lz]=toLocal(P,t.x,t.z);if(Math.abs(lx)/Math.hypot(lx,lz)>.6){bd=d;best=new THREE.Vector3(t.x,1.5,t.z);}}}return[best,bd];}
