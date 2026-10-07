/* ================= online UI: HUD resources, main menu (island, army, fleet, flag, clan, ranking, log), profiles, dialogs ================= */
Object.assign(ICN,{
  barrel:[['M6.2,3.4H17.8Q20.2,12 17.8,20.6H6.2Q3.8,12 6.2,3.4Z',{}],['M5.4,8H18.6M4.9,12H19.1M5.4,16H18.6',{s:1.3,o:.45}]],
  pop:[['M10.4,20.6C10.4,15.4 12.8,12.4 16,12.4C19.2,12.4 21.6,15.4 21.6,20.6Z'+'M13.2,7.6a2.8,2.8 0 1,0 5.6,0a2.8,2.8 0 1,0 -5.6,0Z',{o:.62}],['M2.4,20.6C2.4,15 5.2,11.8 8.6,11.8C12,11.8 14.8,15 14.8,20.6Z'+'M5.4,6.8a3.2,3.2 0 1,0 6.4,0a3.2,3.2 0 1,0 -6.4,0Z',{}]],
  trophy:[['M6.2,2.8H17.8V8C17.8,12 15.4,14.4 12,14.4C8.6,14.4 6.2,12 6.2,8Z',{}],['M6.2,4.8H3.4V6.8C3.4,9 5,10.6 6.8,10.6M17.8,4.8H20.6V6.8C20.6,9 19,10.6 17.2,10.6',{s:1.6}],['M10.8,14.2H13.2V17.8H10.8ZM7.4,17.8H16.6V21.2H7.4Z',{}]],
  banner:[['M4.8,2.4H6.6V22H4.8Z',{}],['M6.6,3.4H19.6L15.8,8.6L19.6,13.8H6.6Z',{}]],
  scroll:[['M5.4,4.2H16.2Q19.2,4.2 19.2,7.2V20H8.4Q5.4,20 5.4,17Z',{}],['M8.6,8.8H15.8M8.6,12.2H15.8M8.6,15.6H13.4',{s:1.3,o:.4}]],
  chat:[['M3,5.6Q3,3.6 5,3.6H19Q21,3.6 21,5.6V14.4Q21,16.4 19,16.4H10.4L5.8,20.4V16.4H5Q3,16.4 3,14.4Z',{}]],
  ally:[['M1.8,10.8L6.6,6.8L12,8.8L17.4,6.8L22.2,10.8L17.2,17.4H6.8Z',{}],['M7.6,12L10.6,15M10.6,11L13.6,14M13.6,10.8L16,13.2',{s:1.3,o:.45}]],
  dagger:[['M11,1.8H13L13.6,13H10.4Z',{}],['M6.8,13H17.2V15H6.8Z',{}],['M11,15H13V19.6H11Z',{o:.8}],['M10.6,21.2a1.4,1.4 0 1,0 2.8,0a1.4,1.4 0 1,0 -2.8,0Z',{}]],
  gear:[['M6.8,12a5.2,5.2 0 1,0 10.4,0a5.2,5.2 0 1,0 -10.4,0ZM9.6,12a2.4,2.4 0 1,0 4.8,0a2.4,2.4 0 1,0 -4.8,0Z',{e:1}],['M12,1.6V5M12,19V22.4M1.6,12H5M19,12H22.4M4.6,4.6L7,7M17,17L19.4,19.4M4.6,19.4L7,17M17,7L19.4,4.6',{s:2}]],
  clock:[['M2.4,12a9.6,9.6 0 1,0 19.2,0a9.6,9.6 0 1,0 -19.2,0ZM4.2,12a7.8,7.8 0 1,0 15.6,0a7.8,7.8 0 1,0 -15.6,0Z',{e:1}],['M12,6.6V12L15.6,14.2',{s:1.8}]],
  bell:[['M12,2.8Q17.6,2.8 17.6,10V15L19.6,17.6H4.4L6.4,15V10Q6.4,2.8 12,2.8Z',{}],['M10.2,19.6a1.8,1.8 0 1,0 3.6,0a1.8,1.8 0 1,0 -3.6,0Z',{}]],
  chest:[['M3,9.4Q3,5 7.4,5H16.6Q21,5 21,9.4V11H3Z',{}],['M3,12.2H21V20.4H3Z',{o:.8}],['M10.8,9.6H13.2V14.4H10.8Z',{}]],
  star:[['M12,2.2L14.9,8.6L21.8,9.2L16.6,13.8L18.2,20.6L12,17L5.8,20.6L7.4,13.8L2.2,9.2L9.1,8.6Z',{}]],
  home:[['M2.6,11.6L12,3.8L21.4,11.6H18.6V20.6H14V15H10V20.6H5.4V11.6Z',{}]],
});
const RES_ICON={gold:'coin',wood:'wood',iron:'iron',food:'meat',powder:'barrel',pop:'pop'};
function resTxt(o,sep){const a=[];for(const r of SH.RES)if(o&&o[r])a.push(icoSVG(RES_ICON[r],'i-'+RES_ICON[r])+fmtN(o[r]));return a.join(sep||' ');}
function fmtN(v){v=Math.floor(v||0);return v>=1e6?(v/1e6).toFixed(1)+'م':v>=1e4?(v/1e3).toFixed(1)+'ألف':String(v);}
function fmtT(sec){sec=Math.max(0,Math.ceil(sec));const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return h?h+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0'):m+':'+String(s).padStart(2,'0');}
function ago(t){const s=(srvNow()-t)/1000;return s<60?'الحين':s<3600?'قبل '+Math.floor(s/60)+' د':s<86400?'قبل '+Math.floor(s/3600)+' س':'قبل '+Math.floor(s/86400)+' يوم';}
/* resources shown in the HUD: server values plus production since the last update */
function resNow(){const me=ON.me;if(!me)return{gold:0,wood:0,iron:0,food:0,powder:0,pop:0};const dt=Math.max(0,(srvNow()-me.resT)/60000),o={};
  for(const r of SH.RES){const v=me.res[r]||0,rt=me.rates?me.rates[r]:0;o[r]=rt>=0?(v>=me.cap?v:Math.min(me.cap,v+rt*dt)):Math.max(0,v+rt*dt);}o.pop=Math.min(me.popCap||0,(me.pop||0)+((me.pop||0)<(me.popCap||0)?3*dt:0));return o;}
function canPay(c){const r=resNow();for(const k in c)if((r[k]||0)<c[k])return false;return true;}
function costHTML(c){return resTxt(c,' ');}
let hudT=0;
function onlineHud(dt){hudT-=dt;if(hudT>0||!ON.me)return;hudT=.25;const r=resNow();
  for(const k of['gold','wood','iron','food','powder'])$('r_'+k).textContent=fmtN(r[k]);$('r_pop').textContent=Math.floor(r.pop)+'/'+(ON.me.popCap||0);
  $('r_honor').textContent=ON.me.honor|0;const sh=ON.me.shield>srvNow();$('r_shield').classList.toggle('hide',!sh);if(sh)$('r_shield').title='درع حماية: '+fmtT((ON.me.shield-srvNow())/1000);
  const tr=ON.me.traitor>srvNow();$('r_traitor').classList.toggle('hide',!tr);
  /* raid bar */
  const rb=$('raidBar');rb.classList.toggle('hide',!RAID.on);if(RAID.on){const left=RAID.dur-RAID.t;$('raidTime').textContent=fmtT(left);$('raidPct').textContent=Math.round(RAID.pct)+'%';$('raidName').textContent=RAID.name;}
  /* navigation hint */
  const nv=$('navHint');if(NAV&&!RAID.on){const hv=homeVessel(),d=Math.hypot(NAV.x-hv.x,NAV.z-hv.z);if(d<200){NAV=null;nv.classList.add('hide');}else{nv.classList.remove('hide');$('navTxt').textContent=NAV.name+' · '+(d>1000?(d/1000).toFixed(1)+' كم':Math.round(d)+' م');
    const a=Math.atan2(NAV.x-hv.x,NAV.z-hv.z)-camYaw;$('navArr').style.transform='rotate('+(-a)+'rad)';}}else nv.classList.add('hide');
  const ha=homeAction();$('aHome').classList.toggle('hide',!ha);if(ha)setIc($('aHome'),ha.label);ON.homeAct=ha;
  const ra=raidAction();$('aRaid').classList.toggle('hide',!ra);if(ra)setIc($('aRaid'),ra.label);ON.raidAct=ra;}
let NAV=null;
function setNav(x,z,name){NAV={x,z,name};banner('🧭 '+esc(name),1500);}
/* ---- menu badge ---- */
function menuBadge(){const n=(ON.unread.logs||0)+(ON.unread.chat||0)+(ON.me?ON.me.allyIn.length:0)+(ON.clan&&ON.clan.req&&myRole()&&roleRank(myRole())<=2?ON.clan.req.length:0);
  const b=$('menuBadge');b.textContent=n>9?'9+':n;b.classList.toggle('hide',!n);}
function myRole(){if(!ON.clan||!ON.me)return null;const m=ON.clan.members.find(x=>x.id===ON.me.id);return m?m.role:null;}
function roleRank(r){return SH.CLAN.roles.indexOf(r);}
/* ================= main menu ================= */
const UI={open:false,tab:'island',sub:'members',armyTo:'ship',armyShip:null,fleetSel:null,flagTool:'pen',flagCol:1,flagData:null,clanQ:'',clanList:null,top:null,prof:null};
const TABS=[['island','home','جزيرتي'],['army','swords','الجيش'],['fleet','ship','الأسطول'],['flag','flag','العلم'],['clan','banner','الكلان'],['top','trophy','الترتيب'],['logs','scroll','السجل']];
function uiOpen(tab){UI.open=true;if(tab)UI.tab=tab;$('ui').classList.remove('hide');if(UI.tab==='logs'){ON.unread.logs=0;netSend({t:'logsSeen'});}if(UI.tab==='clan'&&UI.sub==='chat')ON.unread.chat=0;
  if(UI.tab==='top')netSend({t:'top'});if(UI.tab==='clan'&&!ON.clan)netSend({t:'clanList',q:UI.clanQ});renderUI();menuBadge();}
function uiClose(){UI.open=false;$('ui').classList.add('hide');UI.prof=null;dropFocus();}
/* iOS keeps a hidden text field focused (login, chat) and then shows its Paste bubble on every long press: drop that focus as soon as the game itself is touched */
function dropFocus(){const a=document.activeElement;if(a&&a!==document.body&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))a.blur();}
for(const ev of['touchstart','pointerdown'])document.addEventListener(ev,e=>{const t=e.target;if(t&&t.closest&&t.closest('.ov:not(.hide)'))return;dropFocus();},{capture:true,passive:true});
function uiRefresh(what){if(!UI.open)return;if(what==='chat'&&!(UI.tab==='clan'))return;if(what==='players'&&!(UI.tab==='top'||UI.tab==='clan'||UI.tab==='logs'))return;renderUI();}
function keepInputs(f){const a=document.activeElement,id=a&&a.id,v={};$('uiBody').querySelectorAll('input,textarea,select').forEach(e=>{if(e.id)v[e.id]=e.type==='checkbox'?e.checked:e.value;});
  const st=$('uiBody').scrollTop;f();for(const id in v){const e=document.getElementById(id);if(e){if(e.type==='checkbox')e.checked=v[id];else e.value=v[id];}}if(id){const e=document.getElementById(id);if(e)e.focus();}$('uiBody').scrollTop=st;}
function renderUI(){if(!UI.open||!ON.me)return;$('uiTabs').innerHTML=TABS.map(([k,ic,n])=>`<button class="tb${UI.tab===k?' on':''}" data-tab="${k}">${icoSVG(ic)}<span>${n}</span>${k==='logs'&&(ON.unread.logs||ON.me.allyIn.length)?'<i class="dot"></i>':''}${k==='clan'&&ON.unread.chat?'<i class="dot"></i>':''}</button>`).join('');
  UI.home=atHome();const gate=HOME_TABS.has(UI.tab)&&!UI.home;
  keepInputs(()=>{let h='';try{h=({island:tabIsland,army:tabArmy,fleet:tabFleet,flag:tabFlag,clan:tabClan,top:tabTop,logs:tabLogs})[UI.tab]();}catch(e){console.error(e);h='<p>صار خطأ</p>';}
    $('uiBody').innerHTML=(gate?awayCard():'')+h;if(gate)$('uiBody').querySelectorAll('[data-a]').forEach(b=>{if(HOME_ACTS.has(b.dataset.a))b.disabled=true;});});
  if(UI.tab==='flag')flagEditorInit();if(UI.tab==='clan'&&UI.sub==='chat'){const cl=$('chatLog');if(cl)cl.scrollTop=cl.scrollHeight;}}
let uiTick=0;function uiTimers(dt){if(!UI.open)return;uiTick-=dt;if(uiTick>0)return;uiTick=1;if(HOME_TABS.has(UI.tab)&&UI.home!==atHome()){renderUI();return;}if(UI.tab==='island'||UI.tab==='fleet'){const anyT=document.querySelector('#uiBody [data-timer]');if(anyT)renderUI();}}
/* ---------- building and training happen only at your own island ---------- */
const HOME_TABS=new Set(['island','army','fleet']),HOME_ACTS=new Set(['build','upgrade','defBuild','defUp','wallUp','recruit','train','mv','shipUp','sail','fig','flagship','scrap','shipBuild']);
function atHome(){const il=ON.myIsl;if(!il||!ON.me||RAID.on)return false;const R=il.r+260,hv=homeVessel();if(Math.hypot(hv.x-il.x,hv.z-il.z)<R)return true;
  if(mode==='foot'&&land&&land.cap&&land.cap.g.parent){const w=capWorld();return Math.hypot(w.x-il.x,w.z-il.z)<R;}return false;}
function awayCard(){return`<div class="away">${icoSVG('home')}<div class="tx"><b>أنت بعيد عن جزيرتك</b><span>البناء والتطوير والتجنيد يصير وأنت في جزيرتك.</span></div>
  <div class="row2"><button class="sbtn gold" data-a="goHome">ارجع الحين</button><button class="sbtn" data-a="navHome">وجّهني لها</button></div></div>`;}
/* standing next to one of your buildings: a card to upgrade or rush it */
function nearMyBuilding(){if(mode!=='foot'||!land||!land.cap||!ON.me)return null;const il=ON.myIsl;if(!il||land.il!==il||!il.lay)return null;const w=capWorld();let best=null,bd=1e9;
  for(const k in ON.me.bld){const p=il.lay.plots[k],b=ON.me.bld[k];if(!p||!SH.BLD[b.t])continue;const d=Math.hypot(p.x-w.x,p.z-w.z)-(p.r||6);if(d<6&&d<bd){bd=d;best={col:'bld',k:+k,name:SH.BLD[b.t].ar};}}
  for(const k in ON.me.def){const b=ON.me.def[k],dd=SH.DEF[b.t];if(!dd||!/^(land|gate)$/.test(dd.spot))continue;const p=spotPos(il,k);if(!p)continue;const d=Math.hypot(p.x-w.x,p.z-w.z)-3;if(d<4&&d<bd){bd=d;best={col:'def',k,name:dd.ar};}}
  return best;}
function bldCard(nb){const now=srvNow(),isB=nb.col==='bld',b=isB?ON.me.bld[nb.k]:ON.me.def[nb.k];if(!b)return;const d=isB?SH.BLD[b.t]:SH.DEF[b.t],cl=SH.castleL(ON.me),eff=e=>isB?bldEffect(b.t,e):defEffect(b.t,e);
  const title=d.ar+' · م'+b.l;let html=`<p class="mut">${eff(b.l)}</p>`;
  if(b.done>now){const g=SH.speedCost((b.done-now)/1000);confirmBox(title,html+`<p>${icoSVG('hammer')} يتبنى… ${fmtT((b.done-now)/1000)}</p>`,'سرّع بـ '+g+' ذهب',()=>act({t:'speed',col:nb.col,key:nb.k}).catch(()=>{}));return;}
  if(b.l>=d.max){confirmBox(title,html+'<p>وصل أعلى مستوى.</p>','تمام',null);return;}
  if((!isB||b.t!=='castle')&&b.l+1>cl){confirmBox(title,html+'<p>طوّر القلعة أول عشان تطوّره.</p>','تمام',null);return;}
  const nx=d.cost(b.l+1);html+=`<p>المستوى ${b.l+1}: <span class="mut">${eff(b.l+1)}</span></p><p>${costHTML(nx)}</p>`;
  confirmBox(title,html,'طوّر',()=>act(isB?{t:'upgrade',plot:nb.k}:{t:'defUpgrade',spot:nb.k}).then(()=>banner('🔨 بدأ التطوير',1400)).catch(()=>{}));}
/* ---------- island tab ---------- */
function bldRows(){const me=ON.me,now=srvNow(),cl=SH.castleL(me);let h='';const keys=Object.keys(me.bld).map(Number).sort((a,b)=>a-b);
  for(const k of keys){const b=me.bld[k],d=SH.BLD[b.t];if(!d)continue;const busy=b.done>now,nx=b.l<d.max?d.cost(b.l+1):null,lock=b.t!=='castle'&&b.l+1>cl;
    h+=`<div class="srow"><div class="ic">${icoSVG(bldIcon(b.t))}</div><div class="tx"><b>${d.ar}</b> <span class="lv">م${b.l}</span><br><span class="mut">${bldEffect(b.t,b.l)}</span>`;
    if(busy)h+=`<div class="tmr" data-timer>${icoSVG('hammer')} يتبنى… ${fmtT((b.done-now)/1000)}</div>`;h+='</div>';
    if(busy)h+=`<button class="sbtn gold" data-a="speed" data-col="bld" data-k="${k}">${icoSVG('coin','i-coin')}${SH.speedCost((b.done-now)/1000)} سرّع</button>`;
    else if(nx)h+=`<button class="sbtn" data-a="upgrade" data-k="${k}" ${lock||!canPay(nx)?'disabled':''}>${lock?'طوّر القلعة':'طوّر '+costHTML(nx)}</button>`;else h+='<span class="mut">أعلى مستوى</span>';h+='</div>';}
  return h;}
function bldIcon(t){return{castle:'castle',house:'house',farm:'meat',sawmill:'wood',mine:'iron',powder:'barrel',store:'chest',tavern:'crew',barracks:'swords',shipyard:'ship',bell:'bell',lighthouse:'tower',vault:'skull'}[t]||'house';}
function bldEffect(t,l){const d=SH.BLD[t];const a=[];if(d.prod)for(const r in d.prod)a.push('+'+Math.round(d.prod[r](l)*60)+' '+SH.RES_AR[r]+'/ساعة');if(d.pop)a.push('+'+d.pop(l)+' سكان');if(d.store)a.push('سعة '+fmtN(d.store(l)));
  if(t==='store')a.push('يحمي '+Math.round(d.protect(l)*100)+'%');if(t==='barracks')a.push('حرّاس '+d.army(l));if(t==='shipyard')a.push('أسطول '+(1+Math.floor(l/2)));if(t==='tavern')a.push('يفتح '+SH.PU_ORDER.filter(u=>SH.PUNITS[u].tier<=l).length+' نوع');
  if(t==='bell')a.push('مقاتلون '+Math.round(d.militia(l)*100)+'% من السكان');if(t==='vault')a.push(d.guards(l)+' حرّاس كنز');return a.join(' · ');}
function tabIsland(){const me=ON.me,now=srvNow(),cl=SH.castleL(me),r=resNow(),rates=me.rates||{};
  let h=`<div class="hdr"><div>${icoSVG('castle')} <b>قلعة م${cl}</b> · ${icoSVG('pop')} ${Math.floor(r.pop)}/${me.popCap} · ${icoSVG('hammer')} بنّاؤون ${SH.busyBuilders(me,now)}/${SH.builders(me)}</div>
    <div class="mut">الإنتاج بالساعة: ${SH.RES.map(k=>icoSVG(RES_ICON[k],'i-'+RES_ICON[k])+Math.round((rates[k]||0)*60)).join(' ')} · السعة ${fmtN(me.cap)}</div>
    ${me.shield>now?`<div class="ok">${icoSVG('shield')} جزيرتك محمية بدرع ${fmtT((me.shield-now)/1000)}</div>`:''}</div>`;
  h+='<h2>المباني</h2>'+bldRows();
  h+='<h2>بناء جديد</h2>';for(const t of SH.BLD_ORDER){const d=SH.BLD[t];if(d.fixed!=null)continue;const n=SH.countOf(me,t),mx=d.count(cl),c=d.cost(1),lk=d.req&&cl<d.req;
    h+=`<div class="srow"><div class="ic">${icoSVG(bldIcon(t))}</div><div class="tx"><b>${d.ar}</b> <span class="mut">${n}/${mx}</span><br><span class="mut">${d.d}</span></div><button class="sbtn" data-a="build" data-t="${t}" ${lk||n>=mx||!canPay(c)?'disabled':''}>${lk?'قلعة م'+d.req:n>=mx?'الحد':costHTML(c)}</button></div>`;}
  h+='<h2>الدفاعات</h2>';const dk=Object.keys(me.def).sort();for(const k of dk){const b=me.def[k],d=SH.DEF[b.t];if(!d)continue;const busy=b.done>now,nx=b.l<d.max?d.cost(b.l+1):null,lock=b.l+1>cl;
    h+=`<div class="srow"><div class="ic">${icoSVG(defIcon(b.t))}</div><div class="tx"><b>${d.ar}</b> <span class="lv">م${b.l}</span>${d.crew?' <span class="mut">يحتاج طاقم مدافع</span>':''}<br><span class="mut">${defEffect(b.t,b.l)}</span>${busy?`<div class="tmr" data-timer>${icoSVG('hammer')} ${fmtT((b.done-now)/1000)}</div>`:''}</div>`;
    if(busy)h+=`<button class="sbtn gold" data-a="speed" data-col="def" data-k="${k}">${icoSVG('coin','i-coin')}${SH.speedCost((b.done-now)/1000)}</button>`;else if(nx)h+=`<button class="sbtn" data-a="defUp" data-k="${k}" ${lock||!canPay(nx)?'disabled':''}>${lock?'طوّر القلعة':'طوّر '+costHTML(nx)}</button>`;else h+='<span class="mut">أعلى مستوى</span>';h+='</div>';}
  {const wl=me.wall||0,busy=me.wallDone>now,nx=wl<SH.WALL.max?SH.WALL.cost(wl+1):null;h+=`<div class="srow"><div class="ic">${icoSVG('castle')}</div><div class="tx"><b>${SH.WALL.ar}</b> <span class="lv">م${wl}</span><br><span class="mut">${SH.WALL.d}</span>${busy?`<div class="tmr" data-timer>${fmtT((me.wallDone-now)/1000)}</div>`:''}</div>`+
    (busy?`<button class="sbtn gold" data-a="speed" data-col="wall" data-k="0">${icoSVG('coin','i-coin')}${SH.speedCost((me.wallDone-now)/1000)}</button>`:nx?`<button class="sbtn" data-a="wallUp" ${wl+1>cl||!canPay(nx)?'disabled':''}>${wl+1>cl?'طوّر القلعة':(wl?'طوّر ':'ابنِ ')+costHTML(nx)}</button>`:'')+'</div>';}
  h+='<h2>دفاع جديد</h2>';for(const t of SH.DEF_ORDER){const d=SH.DEF[t],n=SH.countOf(me,t,'def'),mx=d.count(cl),c=d.cost(1),lk=d.req&&cl<d.req;
    h+=`<div class="srow"><div class="ic">${icoSVG(defIcon(t))}</div><div class="tx"><b>${d.ar}</b> <span class="mut">${n}/${mx}</span><br><span class="mut">${d.d}</span></div><button class="sbtn" data-a="defBuild" data-t="${t}" ${lk||n>=mx||!canPay(c)?'disabled':''}>${lk?'قلعة م'+(d.req||1):n>=mx?'الحد':costHTML(c)}</button></div>`;}
  return h;}
function defIcon(t){return{cannon:'bomb',chain:'bomb',firecat:'bomb',mortar:'bomb',tower:'tower',gatling:'target',totem:'skull',oil:'castle',harbor:'anchor',mines:'barrel',pit:'dig',net:'hook',keg:'barrel',spikes:'sword',crocs:'fish'}[t]||'shield';}
function defEffect(t,l){const s=SH.DEF[t].st(l),a=[];if(s.rng)a.push('مدى '+Math.round(s.rng)+' م');if(s.dmg)a.push('ضرر '+Math.round(s.dmg));if(s.dps)a.push('ضرر '+Math.round(s.dps)+'/ث');if(s.slow)a.push('إبطاء '+Math.round(s.slow*100)+'%');
  if(s.stun)a.push('إيقاف '+s.stun.toFixed(1)+' ث');if(s.root)a.push('مسك '+s.root.toFixed(1)+' ث');if(s.burn)a.push('حرق');if(s.hidden)a.push('مخفي');if(s.hp)a.push('صلابة '+Math.round(s.hp));return a.join(' · ');}
/* ---------- army tab ---------- */
function shipName(s){return(SH.SHIPS[s.t]||{}).ar+' #'+s.id.slice(1);}
function tabArmy(){const me=ON.me,now=srvNow(),tv=SH.tavernL(me,now),bv=SH.barracksL(me,now);const ships=me.ships.filter(s=>!(s.done>now));
  if(!UI.armyShip||!me.ships.find(s=>s.id===UI.armyShip))UI.armyShip=me.flagship;const sh=me.ships.find(s=>s.id===UI.armyShip);
  const gUsed=SH.spaceOf(me.garrison),gCap=SH.armyCap(me,now),sUsed=sh?SH.spaceOf(sh.crew):0,sCap=sh?SH.crewCap(sh):0;
  let h=`<div class="hdr"><div>${icoSVG('castle')} حرّاس الجزيرة ${gUsed}/${gCap} · ${icoSVG('ship')} طاقم ${sh?shipName(sh):''} ${sUsed}/${sCap}</div>
    <div class="seg"><span>ينضم المجنّد إلى:</span><button class="sbtn ${UI.armyTo==='ship'?'on':''}" data-a="armyTo" data-v="ship">${icoSVG('ship')} السفينة</button><button class="sbtn ${UI.armyTo==='g'?'on':''}" data-a="armyTo" data-v="g">${icoSVG('castle')} الجزيرة</button>
    <select id="armyShipSel">${ships.map(s=>`<option value="${s.id}" ${s.id===UI.armyShip?'selected':''}>${shipName(s)}${s.id===me.flagship?' (القيادية)':''}</option>`).join('')}</select></div></div>`;
  h+=`<h2>${icoSVG('crew')} الحانة — توظيف القراصنة <span class="mut">(حانة م${tv})</span></h2>`;
  for(const t of SH.PU_ORDER){const d=SH.PUNITS[t],lk=d.tier>tv;const c1=d.cost;const have=(me.garrison[t]||0)+me.ships.reduce((a,s)=>a+(s.crew[t]||0),0);
    h+=`<div class="srow${lk?' lock':''}"><div class="ic uic">${unitBadge(t)}</div><div class="tx"><b>${d.ar}</b> <span class="mut">×${have}${d.sp>1?' · يشغل '+d.sp:''}</span><br><span class="mut">${d.d}</span></div>`+
      (lk?`<span class="mut">حانة م${d.tier}</span>`:`<button class="sbtn" data-a="recruit" data-t="${t}" data-n="1" ${!canPay(c1)?'disabled':''}>+1 ${costHTML(c1)}</button><button class="sbtn" data-a="recruit" data-t="${t}" data-n="5" ${!canPay(mulC(c1,5))?'disabled':''}>+5</button>`)+'</div>';}
  h+=`<h2>${icoSVG('shield')} الثكنة — حرّاس الجزيرة <span class="mut">(ثكنة م${bv})</span></h2>`;
  for(const t of SH.DU_ORDER){const d=SH.DUNITS[t],lk=d.tier>bv,c1=d.cost;h+=`<div class="srow${lk?' lock':''}"><div class="ic uic">${unitBadge(t)}</div><div class="tx"><b>${d.ar}</b> <span class="mut">×${me.garrison[t]||0}</span><br><span class="mut">${d.d}</span></div>`+
    (lk?`<span class="mut">ثكنة م${d.tier}</span>`:`<button class="sbtn" data-a="train" data-t="${t}" data-n="1" ${!canPay(c1)?'disabled':''}>+1 ${costHTML(c1)}</button><button class="sbtn" data-a="train" data-t="${t}" data-n="5" ${!canPay(mulC(c1,5))?'disabled':''}>+5</button>`)+'</div>';}
  {const m=ON.me.militiaN!=null?ON.me.militiaN:SH.militiaN(me,now);h+=`<p class="mut">${icoSVG('bell')} المقاتلون من السكان عند الهجوم: ${m} · ${icoSVG('skull')} حراس الكنز: ${SH.vaultL(me,now)*2}</p>`;}
  h+=`<h2>${icoSVG('ship')} توزيع الرجال بين الجزيرة و${sh?shipName(sh):'السفينة'}</h2><div class="dist">`;
  const types=new Set([...Object.keys(me.garrison),...Object.keys(sh?sh.crew:{})]);
  for(const t of types){const d=SH.unitDef(t);if(!d)continue;const g=me.garrison[t]||0,s=sh?sh.crew[t]||0:0,isD=!!SH.DUNITS[t];
    h+=`<div class="drow"><span class="dn">${unitBadge(t)} ${d.ar}</span><span class="dc">${icoSVG('castle')}${g}</span>
      <button class="sbtn sm" data-a="mv" data-t="${t}" data-from="g" ${!g||isD||!sh?'disabled':''} title="للسفينة">◀</button><button class="sbtn sm" data-a="mv" data-t="${t}" data-from="s" ${!s||!sh?'disabled':''} title="للجزيرة">▶</button>
      <span class="dc">${icoSVG('ship')}${s}</span></div>`;}
  h+='</div>';return h;}
function mulC(c,n){const o={};for(const k in c)o[k]=c[k]*n;return o;}
function unitBadge(t){const d=SH.unitDef(t);const ic={sailor:'anchor',sword:'sword',rifle:'target',repair:'hammer',lookout:'spyglass',dual:'swords',gunner:'bomb',doctor:'plus',cook:'meat',looter:'chest',armored:'shield',knives:'dagger',drummer:'bell',
  hook:'hook',bomber:'bomb',navigator:'compass',bearer:'flag',skeleton:'skull',fire:'bomb',harpoon:'target',spy:'spyglass',assassin:'dagger',diver:'dive',tamer:'fish',voodoo:'skull',giant:'crew',
  guard:'shield',crew:'bomb',wallgun:'target',dog:'horse',firemen:'wave',gdiver:'dive',cavalry:'horse'}[t]||'crew';return icoSVG(ic);}
/* ---------- fleet tab ---------- */
function tabFleet(){const me=ON.me,now=srvNow(),yl=SH.yardL(me,now),fc=SH.fleetCap(me,now);let h=`<div class="hdr">${icoSVG('ship')} الأسطول ${me.ships.length}/${fc} · حوض السفن م${yl}</div>`;
  if(P&&P.alive&&P.hull<P.hullMax){const miss=Math.ceil(P.hullMax-P.hull),w=Math.ceil(miss/6);h+=`<div class="srow"><div class="ic">${icoSVG('hammer')}</div><div class="tx"><b>إصلاح السفينة القيادية</b><br>${Math.ceil(P.hull)}/${P.hullMax}</div><button class="sbtn" data-a="repair" ${!canPay({wood:w})?'disabled':''}>${costHTML({wood:w})}</button></div>`;}
  for(const s of me.ships){const st=SH.shipStats(s),busy=s.done>now,fl=s.id===me.flagship;
    h+=`<div class="shipc${fl?' fl':''}"><div class="shd"><b>${shipName(s)}</b>${fl?' <span class="tag">القيادية</span>':''}<span class="mut"> هيكل ${st.hull} · ${st.guns}×2 مدافع · سرعة ${st.speed.toFixed(1)} · طاقم ${SH.spaceOf(s.crew)}/${st.crew}</span></div>`;
    if(busy){h+=`<div class="tmr" data-timer>${icoSVG('hammer')} تتبنى… ${fmtT((s.done-now)/1000)} <button class="sbtn gold" data-a="speed" data-col="ship" data-k="${s.id}">${icoSVG('coin','i-coin')}${SH.speedCost((s.done-now)/1000)}</button></div></div>`;continue;}
    for(const part in SH.SHIP_UP){const lv=s.up[part]||0,nx=lv<SH.SHIP_UP_MAX?SH.shipUpCost(s.t,part,lv+1):null;
      h+=`<div class="srow"><div class="tx"><b>${SH.SHIP_UP[part].ar}</b> <span class="lv">${lv}/${SH.SHIP_UP_MAX}</span> <span class="mut">${SH.SHIP_UP[part].d}</span></div>${nx?`<button class="sbtn" data-a="shipUp" data-id="${s.id}" data-p="${part}" ${lv+1>yl||!canPay(nx)?'disabled':''}>${lv+1>yl?'حوض م'+(lv+1):costHTML(nx)}</button>`:'<span class="mut">كامل</span>'}</div>`;}
    h+=`<div class="sw">${SH.SAILS.map(([c,n],i)=>`<button class="swc${s.sail===i?' on':''}" style="background:${c}" title="${n}" data-a="sail" data-id="${s.id}" data-v="${i}"></button>`).join('')}</div>
      <div class="sw">${SH.FIGS.map((n,i)=>`<button class="sbtn sm${s.fig===i?' on':''}" data-a="fig" data-id="${s.id}" data-v="${i}">${n}</button>`).join('')}</div>
      <div class="row2">${fl?'':`<button class="sbtn" data-a="flagship" data-id="${s.id}">${icoSVG('flag')} خلّها القيادية</button><button class="sbtn red" data-a="scrap" data-id="${s.id}">فكّكها</button>`}</div></div>`;}
  h+='<h2>بناء سفينة</h2>';for(const t of SH.SHIP_ORDER){const d=SH.SHIPS[t];const lk=yl<d.yard,full=me.ships.length>=fc,busy=me.ships.some(s=>s.done>now);
    h+=`<div class="srow"><div class="ic">${icoSVG('ship')}</div><div class="tx"><b>${d.ar}</b><br><span class="mut">هيكل ${d.hull} · ${d.guns}×2 مدافع · طاقم ${d.crew} · ${fmtT(d.time)}</span></div><button class="sbtn" data-a="shipBuild" data-t="${t}" ${lk||full||busy||!canPay(d.cost)?'disabled':''}>${lk?'حوض م'+d.yard:full?'الأسطول ممتلئ':busy?'الحوض مشغول':costHTML(d.cost)}</button></div>`;}
  return h;}
/* ---------- flag editor ---------- */
const FLAG_STAMPS={skull:[[9,3,6,5,1],[10,5,1,1,0],[13,5,1,1,0],[11,6,2,1,0],[10,8,4,2,1],[10,9,1,1,0],[12,9,1,1,0]],swords:'X',anchor:'A',moon:'M',star:'S'};
function tabFlag(){if(!UI.flagData)UI.flagData=SH.decFlag(ON.me.flag);const pp=myPub();
  let h=`<div class="hdr">${icoSVG('flag')} ارسم علمك؛ يطلع على سفنك وقلعتك وفوق اسمك.${pp&&pp.lead&&pp.lead!==pp.id?' <span class="mut">علم قائد الكلان يطلع في زاوية علمك.</span>':''}</div>
    <div class="fed"><canvas id="flagCv" width="480" height="320"></canvas></div><div class="pal">${SH.FLAG_PAL.map((c,i)=>`<button class="swc${UI.flagCol===i?' on':''}" style="background:${c}" data-a="fcol" data-v="${i}"></button>`).join('')}</div>
    <div class="row2">${[['pen','قلم'],['fill','تعبئة'],['pick','قطّارة']].map(([k,n])=>`<button class="sbtn sm${UI.flagTool===k?' on':''}" data-a="ftool" data-v="${k}">${n}</button>`).join('')}
      ${[['skull','جمجمة'],['swords','سيفين'],['anchor','مرساة'],['moon','هلال'],['star','نجمة']].map(([k,n])=>`<button class="sbtn sm" data-a="fstamp" data-v="${k}">${n}</button>`).join('')}</div>
    <div class="row2"><button class="sbtn red" data-a="fclear">مسح</button><button class="sbtn" data-a="fdef">الافتراضي</button><button class="sbtn gold" data-a="fsave">${icoSVG('flag')} احفظ العلم</button></div>
    <div class="fprev"><img id="flagPrev" alt="معاينة العلم"></div>`;return h;}
function flagDraw(){const cv=$('flagCv');if(!cv)return;const x=cv.getContext('2d'),a=UI.flagData,W=SH.FLAG_W,H=SH.FLAG_H,cw=cv.width/W,ch=cv.height/H;
  for(let j=0;j<H;j++)for(let i=0;i<W;i++){x.fillStyle=SH.FLAG_PAL[a[j*W+i]];x.fillRect(i*cw,j*ch,cw+.5,ch+.5);}
  x.strokeStyle='rgba(255,255,255,.08)';x.lineWidth=1;for(let i=1;i<W;i++){x.beginPath();x.moveTo(i*cw,0);x.lineTo(i*cw,cv.height);x.stroke();}for(let j=1;j<H;j++){x.beginPath();x.moveTo(0,j*ch);x.lineTo(cv.width,j*ch);x.stroke();}
  const pp=myPub(),pv=$('flagPrev');if(pv)pv.src=flagCanvas(SH.encFlag(a),pp?leaderFlag(pp):null,192,120).toDataURL();}
function flagEditorInit(){const cv=$('flagCv');if(!cv)return;flagDraw();let down=false;
  const cell=e=>{const r=cv.getBoundingClientRect(),i=Math.floor((e.clientX-r.left)/r.width*SH.FLAG_W),j=Math.floor((e.clientY-r.top)/r.height*SH.FLAG_H);return i>=0&&j>=0&&i<SH.FLAG_W&&j<SH.FLAG_H?[i,j]:null;};
  const paint=e=>{const c=cell(e);if(!c)return;const a=UI.flagData,idx=c[1]*SH.FLAG_W+c[0];
    if(UI.flagTool==='pick'){UI.flagCol=a[idx];UI.flagTool='pen';renderUI();return;}
    if(UI.flagTool==='fill'){const from=a[idx],to=UI.flagCol;if(from===to)return;const st=[c];while(st.length){const [i,j]=st.pop();if(i<0||j<0||i>=SH.FLAG_W||j>=SH.FLAG_H)continue;const q=j*SH.FLAG_W+i;if(a[q]!==from)continue;a[q]=to;st.push([i+1,j],[i-1,j],[i,j+1],[i,j-1]);}}
    else a[idx]=UI.flagCol;flagDraw();};
  cv.onpointerdown=e=>{e.preventDefault();down=true;cv.setPointerCapture(e.pointerId);paint(e);};cv.onpointermove=e=>{if(down&&UI.flagTool==='pen')paint(e);};cv.onpointerup=()=>{down=false;};}
function flagStamp(k){const a=UI.flagData,W=SH.FLAG_W,S=(x,y,c)=>{if(x>=0&&y>=0&&x<W&&y<SH.FLAG_H)a[y*W+x]=c;},c=UI.flagCol,bg=a[0];
  if(k==='skull'){const d=SH.decFlag(SH.defaultFlag());for(let i=0;i<d.length;i++)if(d[i]===1)a[i]=c;}
  else if(k==='swords'){for(let t=0;t<12;t++){S(6+t,2+t,c);S(17-t,2+t,c);}S(5,13,c);S(6,12,c);S(18,13,c);S(17,12,c);}
  else if(k==='anchor'){for(let y=3;y<14;y++)S(12,y,c);S(11,3,c);S(13,3,c);S(11,2,c);S(12,2,c);S(13,2,c);for(let x=9;x<16;x++)S(x,5,c);for(let t=0;t<4;t++){S(8+t,13-t+1,c);S(16-t,13-t+1,c);}S(8,11,c);S(16,11,c);}
  else if(k==='moon'){for(let y=0;y<16;y++)for(let x=0;x<24;x++){const d1=Math.hypot(x-11,y-7.5),d2=Math.hypot(x-13.5,y-6.5);if(d1<5.5&&d2>4.5)S(x,y,c);}}
  else if(k==='star'){for(let y=0;y<16;y++)for(let x=0;x<24;x++){const dx=x-12,dy=y-7.5,r=Math.hypot(dx,dy),th=Math.atan2(dy,dx)+Math.PI/2,R=2.2+2.4*Math.pow(Math.abs(Math.cos(th*2.5)),3);if(r<R)S(x,y,c);}}
  flagDraw();}
/* ---------- clan tab ---------- */
function tabClan(){if(!ON.clan)return clanBrowse();const cl=ON.clan,me=ON.me,rr=roleRank(myRole());const lvl=cl.lvl,nx=SH.CLAN.lvlXp[lvl]||null,pp=ON.pl.get(cl.leader);
  let h=`<div class="hdr clh">${pp?`<img class="cflag" src="${flagDataURL(pp,72,48)}" alt="">`:''}<div><b class="cn">${esc(cl.name)}</b> <span class="tagx">#${esc(cl.tag)}</span><br>
    <span class="mut">المستوى ${lvl} ${nx?'· '+fmtN(cl.xp)+'/'+fmtN(nx)+' ذهب للمستوى الجاي':''} · الأعضاء ${cl.members.length}/${SH.CLAN.max} · إنتاج +${(lvl-1)*3}%</span></div></div>`;
  const subs=[['members','الأعضاء'],['chat','الشات'+(ON.unread.chat?' •':'')],['req','الطلبات'+(cl.req.length?' ('+cl.req.length+')':'')],['bank','الخزنة والتعزيزات'],['set','الإعدادات']];
  h+=`<div class="subs">${subs.map(([k,n])=>`<button class="sbtn sm${UI.sub===k?' on':''}" data-a="csub" data-v="${k}">${n}</button>`).join('')}</div>`;
  if(UI.sub==='members'){const ms=cl.members.slice().sort((a,b)=>roleRank(a.role)-roleRank(b.role)||b.honor-a.honor);
    for(const m of ms){const r2=roleRank(m.role),can=m.id!==me.id&&rr<=2&&rr<r2;
      h+=`<div class="srow"><div class="ic"><i class="od${m.online?' on':''}"></i></div><div class="tx"><b>${esc(m.name)}</b> <span class="tag">${SH.CLAN.rolesAr[m.role]}</span><br><span class="mut">قلعة م${m.castle} · ${icoSVG('trophy')}${m.honor}</span></div>
        <button class="sbtn sm" data-a="visit" data-id="${m.id}">${icoSVG('compass')} زيارة</button>${can?`<select id="role_${m.id}" data-a="role" data-id="${m.id}">${SH.CLAN.roles.filter(r=>roleRank(r)>rr||(rr===0&&r==='leader')).map(r=>`<option value="${r}" ${r===m.role?'selected':''}>${SH.CLAN.rolesAr[r]}</option>`).join('')}</select><button class="sbtn sm red" data-a="kick" data-id="${m.id}">طرد</button>`:''}</div>`;}}
  else if(UI.sub==='chat'){h+=`<div id="chatLog" class="chat">${cl.chat.map(c=>c.sys?`<div class="cs">${esc(c.msg)}</div>`:`<div class="cm${c.by===me.id?' me':''}"><b>${esc(c.name)}</b> ${esc(c.msg)}<span class="ct">${ago(c.t)}</span></div>`).join('')}</div>
    <div class="cin"><input id="chatIn" maxlength="200" placeholder="اكتب رسالة لأفراد الكلان" autocomplete="off"><button class="sbtn" data-a="chat">${icoSVG('chat')} أرسل</button></div>`;ON.unread.chat=0;menuBadge();}
  else if(UI.sub==='req'){if(!cl.req.length)h+='<p class="mut">ما فيه طلبات انضمام.</p>';for(const q of cl.req)h+=`<div class="srow"><div class="tx"><b>${esc(q.name)}</b></div>${rr<=2?`<button class="sbtn" data-a="cacc" data-id="${q.id}">اقبل</button><button class="sbtn red" data-a="crej" data-id="${q.id}">ارفض</button>`:''}</div>`;}
  else if(UI.sub==='bank'){h+=`<p>تبرّع بالذهب للكلان؛ كل مستوى يزيد إنتاج جزر الأعضاء 3%.</p><div class="cin"><input id="donIn" type="number" min="1" step="50" value="100"><button class="sbtn gold" data-a="donate">${icoSVG('coin','i-coin')} تبرّع</button></div>
    <h2>${icoSVG('swords')} أرسل تعزيزات لجزيرة عضو</h2><div class="cin"><select id="rfTo">${cl.members.filter(m=>m.id!==me.id).map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join('')}</select>
    <select id="rfType">${Object.keys(me.garrison).filter(t=>me.garrison[t]>0).map(t=>`<option value="${t}">${SH.unitDef(t).ar} (${me.garrison[t]})</option>`).join('')}</select><input id="rfN" type="number" min="1" value="1"><button class="sbtn" data-a="reinf">أرسل</button></div>`;}
  else if(UI.sub==='set'){if(rr<=1)h+=`<label class="chk"><input type="checkbox" id="cOpen" ${cl.open?'checked':''}> الكلان مفتوح (أي أحد يدخل بدون موافقة)</label><textarea id="cDesc" maxlength="140" placeholder="وصف الكلان">${esc(cl.desc||'')}</textarea><button class="sbtn" data-a="cset">احفظ</button>`;
    h+=`<div class="row2"><button class="sbtn red" data-a="cleave">اطلع من الكلان</button></div>`;}
  return h;}
function clanBrowse(){let h=`<div class="hdr">${icoSVG('banner')} أنت مو في كلان. ادخل كلان أو أسس كلانك (${SH.CLAN.cost} ذهب).</div>
  <div class="cin"><input id="clanQ" placeholder="ابحث باسم الكلان أو الهاشتاق" value="${esc(UI.clanQ)}"><button class="sbtn" data-a="csearch">بحث</button></div>`;
  const l=UI.clanList||[];if(!l.length)h+='<p class="mut">ما فيه كلانات بعد — كن أول واحد!</p>';
  for(const c of l)h+=`<div class="srow">${c.flag?`<img class="mflag" src="${flagCanvas(c.flag,null,48,32).toDataURL()}" alt="">`:''}<div class="tx"><b>${esc(c.name)}</b> <span class="tagx">#${esc(c.tag)}</span><br><span class="mut">القائد ${esc(c.lead||'')} · ${c.n}/${SH.CLAN.max} · م${c.lvl} · ${icoSVG('trophy')}${c.honor} · ${c.open?'مفتوح':'بموافقة'}</span>${c.desc?'<br><span class="mut">'+esc(c.desc)+'</span>':''}</div>
    <button class="sbtn" data-a="cjoin" data-id="${c.id}">${c.open?'ادخل':'اطلب'}</button></div>`;
  h+=`<h2>تأسيس كلان</h2><input id="cName" maxlength="22" placeholder="اسم الكلان"><input id="cTag" maxlength="10" placeholder="الهاشتاق (بدون مسافات) مثل: الصقور"><label class="chk"><input type="checkbox" id="cOpenN" checked> مفتوح للجميع</label>
    <button class="sbtn gold" data-a="ccreate" ${!canPay({gold:SH.CLAN.cost})?'disabled':''}>${icoSVG('banner')} أسّس (${SH.CLAN.cost} ذهب)</button>`;return h;}
function uiClanList(l){UI.clanList=l;if(UI.open&&UI.tab==='clan'&&!ON.clan)renderUI();}
/* ---------- ranking ---------- */
function tabTop(){const se=ON.season;let h=`<div class="hdr">${icoSVG('trophy')} الموسم ${se?se.n:1}${se?' · ينتهي '+fmtT((se.end-srvNow())/1000):''} · أول 3 ياخذون ذهب</div>`;
  const l=UI.top||[];if(!l.length)h+='<p class="mut">جاري التحميل…</p>';l.forEach((p,i)=>{const rel=relOf(p);
    h+=`<div class="srow pl" data-a="prof" data-id="${p.id}"><div class="rk">${i+1}</div><img class="mflag" src="${flagDataURL(p,42,28)}" alt=""><div class="tx"><b style="color:${p.id===ON.me.id?'#8C6A26':''}">${esc(p.name)}</b>${p.tag?' <span class="tagx">#'+esc(p.tag)+'</span>':''}${p.traitor?' '+icoSVG('dagger'):''}<br><span class="mut">قلعة م${p.castle} · ${p.online?'متصل':'غير متصل'}${rel==='ally'?' · حليف':rel==='clan'?' · من كلانك':''}</span></div><div class="hon">${icoSVG('trophy')}${p.honor}</div></div>`;});return h;}
function uiTop(l){UI.top=l;if(UI.open&&UI.tab==='top')renderUI();}
/* ---------- log ---------- */
function logLine(e){const L=e.loot?' '+resTxt(e.loot):'';switch(e.k){
  case'def':return`${icoSVG('swords')} <b>${esc(e.by)}</b> ${e.win?'هجم على جزيرتك وصدّيته':'نهب جزيرتك ('+e.pct+'%)'+L}`;
  case'raid':return`${icoSVG('flag')} غزيت <b>${esc(e.who)}</b> (${e.pct}%)${L}${e.bounty?' + مكافأة '+e.bounty:''}`;
  case'sunk':return`${icoSVG('wreck')} <b>${esc(e.by)}</b> أغرق سفينتك (−${e.gold} ذهب)`;case'sink':return`${icoSVG('ship')} أغرقت <b>${esc(e.who)}</b> (+${e.gold} ذهب)`;
  case'ally':return`${icoSVG('ally')} صرت حليف <b>${esc(e.who)}</b>`;case'allyEnd':return`${icoSVG('ally')} <b>${esc(e.who)}</b> فك التحالف`;
  case'betray':return`${icoSVG('dagger')} غدرت بـ <b>${esc(e.who)}</b>`;case'betrayed':return`${icoSVG('dagger')} <b>${esc(e.by)}</b> غدر فيك!`;
  case'npc':return`${icoSVG('flag')} نهبت مستعمرة ${esc(e.name||'')}${L}`;case'season':return`${icoSVG('trophy')} خلصت الموسم بالمركز ${e.rank}!`;case'boss':return`${icoSVG('trophy')} شاركت بهزيمة ${esc(e.name||'')}${L}`;}return esc(e.k);}
function tabLogs(){const me=ON.me;let h='';
  if(me.allyIn.length){h+=`<h2>${icoSVG('ally')} طلبات تحالف</h2>`;for(const id of me.allyIn){const p=ON.pl.get(id);h+=`<div class="srow"><div class="tx"><b>${esc(p?p.name:id)}</b></div><button class="sbtn" data-a="aacc" data-id="${id}">اقبل</button><button class="sbtn red" data-a="adec" data-id="${id}">ارفض</button></div>`;}}
  h+=`<h2>${icoSVG('ally')} حلفاؤك (${me.allies.length}/${SH.ALLY.max})</h2>`;if(!me.allies.length)h+='<p class="mut">ما عندك حلفاء. افتح ملف أي قبطان من الترتيب أو الخريطة واطلب التحالف.</p>';
  for(const id of me.allies){const p=ON.pl.get(id);h+=`<div class="srow pl" data-a="prof" data-id="${id}"><div class="tx"><b>${esc(p?p.name:'؟')}</b>${p&&p.tag?' <span class="tagx">#'+esc(p.tag)+'</span>':''}</div><button class="sbtn sm red" data-a="abreak" data-id="${id}">فك التحالف</button></div>`;}
  h+=`<h2>${icoSVG('scroll')} سجلّك</h2>`;if(!me.logs.length)h+='<p class="mut">ما صار شي بعد.</p>';
  for(const e of me.logs){const rev=e.k==='def'&&!e.win&&srvNow()-e.t<24*3600e3&&e.byId;h+=`<div class="lg"><div>${logLine(e)}</div><span class="ct">${ago(e.t)}</span>${rev?`<button class="sbtn sm red" data-a="revenge" data-id="${e.byId}">${icoSVG('swords')} انتقم</button>`:''}</div>`;}
  h+=`<h2>${icoSVG('wave')} أخبار البحار</h2>`;for(const f of ON.feed.slice(0,12))h+=`<div class="lg"><div>${esc(f.text)}</div><span class="ct">${ago(f.t)}</span></div>`;return h;}
/* ---------- profile card ---------- */
function openProfile(id){if(!id||id===ON.me.id){uiOpen('island');return;}UI.prof={id};netSend({t:'prof',id});showProfile();}
function uiProfile(p){if(UI.prof&&UI.prof.id===p.id){UI.prof=p;showProfile();}}
function showProfile(){const p=UI.prof;if(!p)return;const pp=ON.pl.get(p.id)||p,rel=relOf(pp),me=ON.me,isAlly=me.allies.includes(pp.id),req=me.allyIn.includes(pp.id);
  let h=`<div class="pc"><img class="pflag" src="${flagDataURL(pp,96,64)}" alt=""><div><b class="pn">${esc(pp.name)}</b>${pp.tag?' <span class="tagx">#'+esc(pp.tag)+'</span>':''}${pp.traitor&&pp.traitor>srvNow()?` <span class="bad">${icoSVG('dagger')} غدّار · مكافأة ${pp.bounty}</span>`:''}<br>
    <span class="mut">قلعة م${pp.castle} · ${icoSVG('trophy')}${pp.honor} · ${pp.online?'متصل':'غير متصل'}${pp.shield&&pp.shield>srvNow()?' · '+icoSVG('shield')+' محمي '+fmtT((pp.shield-srvNow())/1000):''}</span>
    ${p.stats?`<br><span class="mut">غزوات ${p.stats.raids} (فاز ${p.stats.wins}) · صد ${p.stats.defWins}/${p.stats.defs} · أغرق ${p.stats.sunk}</span>`:''}</div></div><div class="row2">`;
  const il=islandOfPlayer(pp.id);if(il)h+=`<button class="sbtn" data-a="visit" data-id="${pp.id}">${icoSVG('compass')} ${rel==='clan'?'زيارة جزيرته':'وجّهني لجزيرته'}</button>`;
  if(rel!=='clan'){if(isAlly)h+=`<button class="sbtn red" data-a="abreak" data-id="${pp.id}">فك التحالف</button>`;else if(req)h+=`<button class="sbtn" data-a="aacc" data-id="${pp.id}">اقبل التحالف</button>`;
    else if(!p.req)h+=`<button class="sbtn" data-a="areq" data-id="${pp.id}">${icoSVG('ally')} اطلب تحالف</button>`;else h+='<span class="mut">طلبك قيد الانتظار</span>';}
  h+=`<button class="sbtn" data-a="pclose">رجوع</button></div>`;$('profCard').innerHTML=h;$('prof').classList.remove('hide');}
function closeProfile(){$('prof').classList.add('hide');UI.prof=null;}
/* ---------- confirm dialog ---------- */
let CONFIRM=null;
function confirmBox(title,html,okTxt,fn){CONFIRM=fn;$('cfTitle').textContent=title;$('cfBody').innerHTML=html;$('cfOk').textContent=okTxt||'تمام';$('confirm').classList.remove('hide');}
function confirmClose(){$('confirm').classList.add('hide');CONFIRM=null;}
/* ---------- actions ---------- */
function freePlot(){const me=ON.me;for(let k=2;k<SH.LAYOUT.plots;k++)if(!me.bld[k])return k;return -1;}
function freeDefSpot(kind){const me=ON.me;for(let i=0;i<SH.LAYOUT[kind];i++)if(!me.def[kind+i])return kind+i;return null;}
function goHome(){const il=ON.myIsl;if(!il)return;if(RAID.on){banner('أنت في غزوة',1400);return;}if(mode==='foot')endFoot();if(mode==='board')return;
  const near=ships.some(s=>!s.isPlayer&&s.alive&&Math.hypot(s.x-P.x,s.z-P.z)<300);if(near){banner('فيه أعداء قريبين؛ ما تقدر ترجع الحين',1800);return;}
  if(ON.homeCd>performance.now()){banner('تقدر ترجع بعد '+Math.ceil((ON.homeCd-performance.now())/1000)+' ث',1500);return;}ON.homeCd=performance.now()+90000;
  const a=il.base.ang,sr=shoreR(il,il.harborA),x=il.x+Math.cos(il.harborA)*(sr+70),z=il.z+Math.sin(il.harborA)*(sr+70);P.x=x;P.z=z;P.rot=Math.atan2(il.x-x,il.z-z);P.speed=0;P._y=undefined;
  if(!P.alive)respawnShip();uiClose();banner('⚓ رجعت لجزيرتك',1600);}
$('uiBody').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||b.disabled)return;const a=b.dataset.a,d=b.dataset;
  const go=(m,okMsg)=>act(m).then(()=>{if(okMsg)banner(okMsg,1500);}).catch(()=>{});
  switch(a){
    case'goHome':goHome();break;
    case'navHome':{const il=ON.myIsl;if(il){setNav(il.x+Math.cos(il.harborA)*(shoreR(il,il.harborA)+60),il.z+Math.sin(il.harborA)*(shoreR(il,il.harborA)+60),'جزيرتي');uiClose();}break;}
    case'build':{const k=freePlot();if(k<0){banner('ما فيه مكان فاضي',1400);break;}go({t:'build',plot:k,type:d.t},'🔨 بدأ البناء');break;}
    case'upgrade':go({t:'upgrade',plot:+d.k},'🔨 بدأ التطوير');break;
    case'speed':go({t:'speed',col:d.col,key:d.col==='bld'?+d.k:d.k});break;
    case'defBuild':{const kind=SH.DEF[d.t].spot,k=freeDefSpot(kind);if(!k){banner('ما فيه مكان فاضي لهذا الدفاع',1600);break;}go({t:'defBuild',spot:k,type:d.t},'🔨 بدأ البناء');break;}
    case'defUp':go({t:'defUpgrade',spot:d.k},'🔨 بدأ التطوير');break;
    case'wallUp':go({t:'wallUp'},'🔨 بدأ بناء السور');break;
    case'armyTo':UI.armyTo=d.v;renderUI();break;
    case'recruit':go({t:'recruit',type:d.t,n:+d.n,to:UI.armyTo==='g'?'g':UI.armyShip});break;
    case'train':go({t:'train',type:d.t,n:+d.n});break;
    case'mv':go(d.from==='g'?{t:'move',type:d.t,n:1,from:'g',to:UI.armyShip}:{t:'move',type:d.t,n:1,from:UI.armyShip,to:'g'});break;
    case'repair':{const miss=Math.ceil(P.hullMax-P.hull),w=Math.ceil(miss/6);act({t:'pay',wood:w}).then(()=>{P.hull=P.hullMax;banner('🔨 تصلّحت السفينة',1400);renderUI();}).catch(()=>{});break;}
    case'shipUp':go({t:'shipUp',id:d.id,part:d.p});break;
    case'sail':go({t:'shipStyle',id:d.id,sail:+d.v});break;case'fig':go({t:'shipStyle',id:d.id,fig:+d.v});break;
    case'flagship':go({t:'flagship',id:d.id},'⛵ صارت السفينة القيادية');break;
    case'scrap':confirmBox('تفكيك السفينة','بتسترجع 30% من تكلفتها، والطاقم يرجع للجزيرة إذا فيه مكان.','فكّكها',()=>go({t:'shipScrap',id:d.id}));break;
    case'shipBuild':go({t:'shipBuild',type:d.t},'🔨 بدأ بناء السفينة');break;
    case'fcol':UI.flagCol=+d.v;UI.flagTool=UI.flagTool==='pick'?'pen':UI.flagTool;renderUI();break;
    case'ftool':UI.flagTool=d.v;renderUI();break;case'fstamp':flagStamp(d.v);break;
    case'fclear':UI.flagData=new Array(SH.FLAG_W*SH.FLAG_H).fill(UI.flagCol);flagDraw();break;case'fdef':UI.flagData=SH.decFlag(SH.defaultFlag());flagDraw();break;
    case'fsave':go({t:'flag',flag:SH.encFlag(UI.flagData)},'🏴 انحفظ علمك');break;
    case'csub':UI.sub=d.v;renderUI();break;
    case'chat':{const i=$('chatIn');const v=i.value.trim();if(!v)break;act({t:'clanChat',msg:v}).then(()=>{}).catch(()=>{});i.value='';break;}
    case'cacc':go({t:'clanAccept',id:d.id});break;case'crej':go({t:'clanReject',id:d.id});break;
    case'kick':confirmBox('طرد عضو','متأكد تبي تطرده من الكلان؟','اطرده',()=>go({t:'clanKick',id:d.id}));break;
    case'donate':{const g=Math.floor(+$('donIn').value||0);if(g>0)go({t:'clanDonate',gold:g},'شكراً على تبرعك');break;}
    case'reinf':go({t:'clanReinforce',to:$('rfTo').value,type:$('rfType').value,n:Math.max(1,+$('rfN').value|0)},'⚔ انرسلت التعزيزات');break;
    case'cset':go({t:'clanSet',open:$('cOpen')?$('cOpen').checked:undefined,desc:$('cDesc')?$('cDesc').value:undefined},'انحفظ');break;
    case'cleave':confirmBox('الطلوع من الكلان','متأكد؟'+(myRole()==='leader'?' القيادة بتنتقل لأعلى رتبة.':''),'اطلع',()=>go({t:'clanLeave'}));break;
    case'csearch':UI.clanQ=$('clanQ').value.trim();netSend({t:'clanList',q:UI.clanQ});break;
    case'cjoin':go({t:'clanJoin',id:d.id});break;
    case'ccreate':go({t:'clanCreate',name:$('cName').value,tag:$('cTag').value.replace(/^#/,''),open:$('cOpenN').checked},'🏴 تأسس كلانك!');break;
    case'prof':openProfile(d.id);break;
    case'visit':{const il=islandOfPlayer(d.id);if(il){setNav(il.x+Math.cos(il.harborA)*(shoreR(il,il.harborA)+60),il.z+Math.sin(il.harborA)*(shoreR(il,il.harborA)+60),il.name);uiClose();}break;}
    case'aacc':go({t:'allyAccept',from:d.id});break;case'adec':go({t:'allyDecline',from:d.id});break;
    case'abreak':confirmBox('فك التحالف','بتفك التحالف بشكل رسمي. (لو هاجمته خلال ساعة تنحسب غدر.)','فك التحالف',()=>go({t:'allyBreak',id:d.id}));break;
    case'revenge':{const il=islandOfPlayer(d.id);if(il){setNav(il.x+Math.cos(il.harborA)*(shoreR(il,il.harborA)+60),il.z+Math.sin(il.harborA)*(shoreR(il,il.harborA)+60),'انتقام: '+il.name);uiClose();banner('قرّب من جزيرته واضغط «غزو»؛ الدرع ما يمنع الانتقام',2600);}break;}
  }});
$('uiBody').addEventListener('change',e=>{const t=e.target;if(t.id==='armyShipSel'){UI.armyShip=t.value;renderUI();}else if(t.dataset&&t.dataset.a==='role'){const v=t.value;
  if(v==='leader')confirmBox('تسليم القيادة','بتصير نائب وهو القائد.','سلّمه',()=>act({t:'clanRole',id:t.dataset.id,role:v}).catch(()=>{}));else act({t:'clanRole',id:t.dataset.id,role:v}).catch(()=>{});}});
$('uiBody').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='chatIn'){e.preventDefault();const b=document.querySelector('[data-a="chat"]');if(b)b.click();}e.stopPropagation();});
$('uiTabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b)uiOpen(b.dataset.tab);});
$('uiClose').addEventListener('click',uiClose);
$('profCard').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const d=b.dataset;
  if(d.a==='pclose')closeProfile();else if(d.a==='areq')act({t:'allyReq',to:d.id}).then(()=>closeProfile()).catch(()=>{});else if(d.a==='aacc')act({t:'allyAccept',from:d.id}).then(()=>closeProfile()).catch(()=>{});
  else if(d.a==='abreak'){closeProfile();confirmBox('فك التحالف','متأكد؟','فك التحالف',()=>act({t:'allyBreak',id:d.id}).catch(()=>{}));}
  else if(d.a==='visit'){const il=islandOfPlayer(d.id);if(il){setNav(il.x+Math.cos(il.harborA)*(shoreR(il,il.harborA)+60),il.z+Math.sin(il.harborA)*(shoreR(il,il.harborA)+60),il.name);closeProfile();uiClose();}}});
$('cfOk').addEventListener('click',()=>{const f=CONFIRM;confirmClose();if(f)f();});$('cfNo').addEventListener('click',confirmClose);
/* ---- HUD actions near islands: home build menu, visiting / raiding other captains ---- */
function homeAction(){if(!playing||!ON.me||RAID.on)return null;const il=ON.myIsl;if(!il)return null;
  const nb=nearMyBuilding();if(nb)return{label:'🔨 '+nb.name,fn:()=>bldCard(nb)};
  if(atHome())return{label:'🏰 جزيرتي',fn:()=>uiOpen('island')};return null;}
function nearPlayerIsland(){const hv=homeVessel();let best=null,bd=1e9;for(const il of PISL.values()){if(!il.pid||il.pid===ON.me.id)continue;const d=Math.hypot(hv.x-il.x,hv.z-il.z)-il.r;if(d<520&&d<bd){bd=d;best=il;}}return best;}
function raidAction(){if(!playing||!ON.me||RAID.on||mode==='board')return null;const il=nearPlayerIsland();if(!il)return null;const pp=ON.pl.get(il.pid);if(!pp)return null;const rel=relOf(pp);
  if(rel==='clan')return null;if(pp.shield&&pp.shield>srvNow()&&!ON.me.logs.some(e=>e.k==='def'&&e.byId===pp.id&&!e.rev&&srvNow()-e.t<24*3600e3))return{label:'🛡 '+pp.name+' محمي '+fmtT((pp.shield-srvNow())/1000),fn:()=>openProfile(pp.id)};
  return{label:'⚔️ اغزُ '+pp.name,fn:()=>raidRequest(pp.id,false)};}
tap('aHome',()=>{if(ON.homeAct)ON.homeAct.fn();});tap('aRaid',()=>{if(ON.raidAct)ON.raidAct.fn();});
tap('shopBtn',()=>{if(playing)uiOpen();});
tap('lgIn',()=>loginSubmit('login'));tap('lgReg',()=>loginSubmit('register'));
$('lgPass').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();loginSubmit('login');}});
tap('raidQuit',()=>confirmBox('الانسحاب','تبي تنهي الغزوة الحين؟ تاخذ اللي نهبته حسب نسبة الدمار.','انسحب',()=>raidFinish(false)));
