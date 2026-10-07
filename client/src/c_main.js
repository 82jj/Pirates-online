/* ================= online glue: start-up, per-frame hooks, map markers ================= */
Object.assign(ICN,{
  octo:[['M12,2.5C16.6,2.5 19,6 19,10C19,12.6 17.8,14.2 16.4,15.2C17.6,17.4 19.8,18.6 21.6,18.2C20.6,20.6 17.4,21 15.2,18.8C14.8,20.8 13.6,22 12,22C10.4,22 9.2,20.8 8.8,18.8C6.6,21 3.4,20.6 2.4,18.2C4.2,18.6 6.4,17.4 7.6,15.2C6.2,14.2 5,12.6 5,10C5,6 7.4,2.5 12,2.5Z'+
    'M8.6,9.6a1.4,1.4 0 1,0 2.8,0a1.4,1.4 0 1,0 -2.8,0ZM12.6,9.6a1.4,1.4 0 1,0 2.8,0a1.4,1.4 0 1,0 -2.8,0Z',{e:1}]],
  crown:[['M3,17.6L4.4,7.4L8.8,12L12,4.6L15.2,12L19.6,7.4L21,17.6Z',{}],['M3,19.2H21V21.6H3Z',{}],['M11,13.4a1,1 0 1,0 2,0a1,1 0 1,0 -2,0Z',{o:.45}]],
});
ICN_EMOJI.push(['🛡','shield'],['🧭','compass'],['📜','scroll'],['🤝','ally'],['💥','bomb'],['⛓','anchor'],['🗡','dagger'],['🏆','trophy'],['🔔','bell'],['🐙','octo'],['👑','crown'],['🕸','hook'],['🎉','star'],['🔥','bomb'],['🔭','spyglass']);
const MAP_REL={me:'#8C6A26',clan:'#2E7A3A',ally:'#2A5E9A',enemy:'#9A2A22'};
/* ---- shallow water around the player islands (same depth map as the rest of the sea) ---- */
function depthAdd(il){const S=oceanU.uDS.value,O=oceanU.uDO.value.x,px=S/DT_N,g=il.sd;if(!g)return;
  const i0=Math.max(0,Math.floor((il.x+g.x0-O)/px)),i1=Math.min(DT_N-1,Math.ceil((il.x+g.x0+g.nx*g.h-O)/px)),j0=Math.max(0,Math.floor((il.z+g.z0-O)/px)),j1=Math.min(DT_N-1,Math.ceil((il.z+g.z0+g.nz*g.h-O)/px));
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=O+(i+.5)*px,z=O+(j+.5)*px;if(coastSD(il,x,z)<-125)continue;const dep=clamp(-rawH(il,x,z),0,14.3),q=(j*DT_N+i)*4,v=Math.round(dep/16*255);if(v<dtData[q])dtData[q]=v;}
  dtTex.needsUpdate=true;}
function myFlagTex(){return flagTexFor((typeof myPub==='function'&&myPub())||{flag:SH.defaultFlag()});}
function nearHome(){const il=ON.myIsl,hv=homeVessel();return!!(il&&hv&&Math.hypot(hv.x-il.x,hv.z-il.z)<il.r+650);}
/* ---- first welcome: the single-player opening is replaced by the captain's own fleet ---- */
function startOnline(){for(const s of ships.slice()){scene.remove(s.mesh);if(s.bar)scene.remove(s.bar.g);}ships.length=0;
  land=null;board=null;mode='sea';wave=0;waveTimer=50;lastHit=-99;camPitch=.28;const il=ON.myIsl;if(il)camYaw=Math.atan2(-il.x,-il.z);}
let npcT=0;
function onlineUpdate(dt){if(!ON.me)return;raidUpdate(dt);shipEffects(dt);flushLosses(dt);npcT-=dt;if(npcT<=0){npcT=5;npcColonyTick();}}
function onlineFrame(dt){if(!ON.me)return;if(playing)presenceOut(dt);if(!paused){updateRemotes(dt);updateEscorts(dt);updateUProj(dt);updateRopes(dt);evFrame(dt);}onlineHud(dt);uiTimers(dt);}
/* ---- map markers: captains' castles, ships (clan, allies, enemies), bosses, the course ---- */
function onlineWorldMarks(x,tr,inView,gz,Z){if(!ON.me)return;const R=10*gz,now=srvNow();x.save();x.textAlign='center';x.textBaseline='top';
  for(const il of PISL.values()){if(!il.pid||!il.base)continue;const pp=ON.pl.get(il.pid);if(!pp)continue;const rel=relOf(pp),[px,py]=tr(il.base.x,il.base.z);if(!inView(px,py,30))continue;
    badgeDraw(x,'castle',px,py,R*1.25,MAP_REL[rel],MAP_REL[rel]);
    if(pp.shield&&pp.shield>now)icoDraw(x,'shield',px+R*1.35,py-R*1.05,R*1.25,'#2A5E9A');
    if(pp.traitor&&pp.traitor>now)icoDraw(x,'dagger',px-R*1.35,py-R*1.05,R*1.25,'#9A2A22');
    if(Z>1.25||rel!=='enemy'){x.font=`700 ${Math.round(12.5*clamp(gz,.9,1.4))}px Tajawal,sans-serif`;const nm=(pp.tag?'#'+pp.tag+' ':'')+pp.name;x.lineWidth=3.2;x.strokeStyle='rgba(243,229,190,.92)';x.strokeText(nm,px,py+R*1.4);x.fillStyle=MAP_REL[rel];x.fillText(nm,px,py+R*1.4);}}
  const seen=new Set(),mark=(id,wx,wz,rd)=>{const pp=ON.pl.get(id);if(!pp)return;const rel=relOf(pp),[a,b]=tr(wx,wz);if(!inView(a,b,20))return;
    icoDraw(x,'ship',a,b+1.5,21*gz,'rgba(243,229,190,.9)');icoDraw(x,'ship',a,b,18*gz,MAP_REL[rel]);if(rd)icoDraw(x,'swords',a+11*gz,b-9*gz,12*gz,'#9A2A22');
    if(rel!=='enemy'||Z>2){x.font=`600 ${Math.round(11*clamp(gz,.9,1.4))}px Tajawal,sans-serif`;x.lineWidth=3;x.strokeStyle='rgba(243,229,190,.9)';x.strokeText(pp.name,a,b+10*gz);x.fillStyle=MAP_REL[rel];x.fillText(pp.name,a,b+10*gz);}};
  for(const r of REMOTE.values()){seen.add(r.id);mark(r.id,r.x,r.z,r.raiding);}
  for(const f of ON.far||[])if(!seen.has(f[0]))mark(f[0],f[1],f[2],f[3]);
  for(const c of EVC.values()){if(c.end)continue;const p=evPosC(c.e,now),[a,b]=tr(p.x,p.z);if(!inView(a,b,20))continue;badgeDraw(x,EV_IC[c.e.k],a,b,R*1.45,'#6A2A9A','#4A1A6A');
    x.font=`700 ${Math.round(12*clamp(gz,.9,1.4))}px Tajawal,sans-serif`;x.lineWidth=3;x.strokeStyle='rgba(243,229,190,.92)';x.strokeText(EV_AR[c.e.k],a,b+R*1.6);x.fillStyle='#4A1A6A';x.fillText(EV_AR[c.e.k],a,b+R*1.6);}
  if(NAV){const [a,b]=tr(NAV.x,NAV.z);if(inView(a,b,20))icoDraw(x,'xmark',a,b,22*gz,'#B3312A');}
  x.restore();}
function onlineMiniMarks(m,tr,Cc){if(!ON.me)return;const clip=(x,y,pad)=>{const dx=x-Cc,dy=y-Cc,d=Math.hypot(dx,dy);return d>Cc-pad?[Cc+dx/d*(Cc-pad),Cc+dy/d*(Cc-pad)]:[x,y];};
  for(const il of PISL.values()){if(!il.pid||!il.base)continue;const pp=ON.pl.get(il.pid);if(!pp)continue;const [x,y]=tr(il.base.x,il.base.z);if(Math.hypot(x-Cc,y-Cc)>Cc)continue;badgeDraw(m,'castle',x,y,8,REL_COL[relOf(pp)]);}
  for(const r of REMOTE.values()){if(!r.mesh.visible)continue;const pp=ON.pl.get(r.id);if(!pp)continue;let [x,y]=tr(r.x,r.z);[x,y]=clip(x,y,10);icoDraw(m,'ship',x,y+1,21,'rgba(10,6,4,.6)');icoDraw(m,'ship',x,y,18,REL_COL[relOf(pp)]);}
  for(const c of EVC.values()){if(c.end)continue;const p=evPosC(c.e,srvNow());let [x,y]=tr(p.x,p.z);if(Math.hypot(x-Cc,y-Cc)>Cc*3)continue;[x,y]=clip(x,y,12);badgeDraw(m,EV_IC[c.e.k],x,y,9,'#9A4AE0');}
  if(NAV){let [x,y]=tr(NAV.x,NAV.z);[x,y]=clip(x,y,9);icoDraw(m,'xmark',x,y,15,'#F2C230');}}
const _mapLegend=mapLegend;mapLegend=function(){_mapLegend();let h='';
  for(const [r,t] of[['me','قلعتك'],['clan','كلانك'],['ally','حليفك'],['enemy','عدو']])h+=`<span>${badgeSVG('castle',MAP_REL[r],MAP_REL[r])}${t}</span>`;
  for(const [r,t] of[['clan','سفينة من كلانك'],['ally','سفينة حليف'],['enemy','سفينة قبطان عدو']])h+=`<span><span class="mg" style="color:${MAP_REL[r]}">${icoSVG('ship')}</span>${t}</span>`;
  h+=`<span>${badgeSVG('octo','#6A2A9A','#4A1A6A')}وحش أو قافلة</span>`;$('mleg').innerHTML+=h;};
/* ---- static HUD icons and the login form ---- */
document.querySelectorAll('[data-ic]').forEach(e=>{e.outerHTML=icoSVG(e.dataset.ic,'i-'+e.dataset.ic);});
$('lgForm').addEventListener('keydown',e=>e.stopPropagation());
{const n=lsGet('pir_name');if(n)$('lgName').value=n;}
/* test hook (only with ?dbg in the address) */
if(/[?&]dbg\b/.test(location.search))window.__pir={ev:c=>eval(c)};
