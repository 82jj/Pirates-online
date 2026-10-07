#!/usr/bin/env python3
"""Build the online client: base.html (single-player v18) + online modules -> server/public/index.html"""
import re, sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
ROOT = os.path.dirname(HERE)
DBG = os.environ.get('DBG') == '1'
base = open(os.path.join(HERE, 'base.html'), encoding='utf-8').read()
s = base

def rep(a, b, count=1):
    global s
    n = s.count(a)
    if n != count:
        sys.exit(f'PATCH FAILED ({n} matches, want {count}): {a[:110]!r}')
    s = s.replace(a, b)

def rrep(pat, b, flags=re.S):
    global s
    s2, n = re.subn(pat, b, s, count=1, flags=flags)
    if n != 1:
        sys.exit(f'REGEX PATCH FAILED: {pat[:110]!r}')
    s = s2

# ---------------- world & generation ----------------
rep("const rnd=mulberry32(4242);", "let rnd=mulberry32(4242);")
rep("const WORLD=7500;", "const WORLD=SHR.WORLD_R,WORLD_NPC=7500;")
rep("560+rnd()*(WORLD-650-sp.r*1.6)", "560+rnd()*(WORLD_NPC-650-sp.r*1.6)")
rep("d=600+Math.random()*(WORLD-900)", "d=600+Math.random()*(WORLD_NPC-900)")
rep("function buildDepthTex(){let ext=1200;", "function buildDepthTex(){let ext=SHR.WORLD_R+250;")
rep("function* islandJob(il){\n  yield* decorateJob(il);", "function* islandJob(il){if(il.pl){yield* playerIslandJob(il);return;}\n  yield* decorateJob(il);")
rep("    c.multiplyScalar(.92+n2*.14);cols[i*3]=c.r;",
    "    if(il.base){const bd=Math.hypot(x-il.base.x,z-il.base.z);if(bd<72&&y>.9)c.lerp(bd<22?cPave:cDirt,(1-smooth(50,72,bd))*.6);}\n    c.multiplyScalar(.92+n2*.14);cols[i*3]=c.r;")
# ---------------- resources now live on the server ----------------
rep("if(!s.isPlayer){const g=100*(s.level+1);gold+=g;", "if(!s.isPlayer&&!s.ev){const g=100*(s.level+1);gainSrv('ship',{gold:g});")
rep("f.mesh.visible=false;gold+=150;", "f.mesh.visible=false;gainSrv('fort',{gold:150});")
rep("const g=250*(e.level+1);gold+=g;", "const g=250*(e.level+1);gainSrv('board',{gold:g});")
rep("a.dead=.01;food+=a.food;", "a.dead=.01;gainSrv('hunt',{food:a.food});")
rep("gold+=c.loot.gold||0;wood+=c.loot.wood||0;iron+=c.loot.iron||0;food+=c.loot.food||0;",
    "gainSrv(c.kind==='cave'?'cave':c.kind==='sea'?'wreck':c.kind==='deck'?'deck':'chest',c.loot);")
rep("fishDead[i]=60;food+=1;", "fishDead[i]=60;gainSrv('fish',{food:1});")
rep("if(n){food+=n;hit=true;", "if(n){gainSrv('fish',{food:n});hit=true;")
rep("const g=2+Math.floor(Math.random()*2);iron+=g;", "const g=2+Math.floor(Math.random()*2);gainSrv('ore',{iron:g});")
rep("wood+=tr.wood;toast(", "gainSrv('tree',{wood:tr.wood});toast(")
rep("best.respawn=60;food+=2;", "best.respawn=60;gainSrv('bird',{food:2});")
rep("k.got=true;gold+=15;", "k.got=true;gainSrv('coin',{gold:15});")
rep("function captureIsland(il){il.owner='player';il.alert=false;gold+=500;", "function captureIsland(il){il.owner='player';il.alert=false;npcCaptured(il);")
rep("banner('🏴 '+il.name+' أصبحت جزيرتك! +500 💰',2600);", "banner('🏴 '+il.name+' رفعت علمك فوقها! الغنيمة في طريقها',2600);")
# the captured colony flies the captain's own flag
m = re.search(r"function updateFlag\(dt\)\{.*?\n\}\nfunction captureIsland\(il\)\{.*?\n\}", s, re.S)
if not m: sys.exit('flag functions not found')
blk = m.group(0).replace('TEX_PLAYER', 'myFlagTex()')
s = s[:m.start()] + blk + s[m.end():]
rep("  incomeT-=dt;if(incomeT<=0){incomeT=30;const n=islands.filter(i=>i.owner==='player').length;if(n){gold+=25*n;food+=n;toast('+'+(25*n)+' 💰 +'+n+' 🍖 من جزرك');}}",
    "  onlineUpdate(dt);")
rrep(r"\}else\{P\.speed\*=\.98;\n    if\(!boat\)\{sunkT\+=dt;.*?',3200\);\}\}\}", "}else{P.speed*=.98;onlineSunk(dt);}")
rep("banner('سقط القبطان! رجاله أعادوه إلى السفينة (−10% ذهب)',2200);gold=Math.floor(gold*.9);",
    "banner('سقط القبطان! رجاله أعادوه إلى السفينة',2200);if(RAID.on)raidFinish(false);")
rep("function canClaim(d){return ", "function canClaim(d){return false&&")
# ---------------- clarity & moonlit nights ----------------
rep("renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));", "renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));")
rep("let dprNow=Math.min(devicePixelRatio||1,1.75),ftAvg=1/60,resT=0;", "let dprNow=Math.min(devicePixelRatio||1,2),ftAvg=1/60,resT=0;")
rep("if(resT>9&&ftAvg>1/38&&dprNow>1.01){dprNow=Math.max(1,dprNow-.15);", "if(resT>9&&ftAvg>1/30&&dprNow>1.36){dprNow=Math.max(1.35,dprNow-.15);")
rep("AU.uNightSky=[(.01+.025*moonUp)*nk,(.016+.04*moonUp)*nk,(.03+.08*moonUp)*nk];", "AU.uNightSky=[(.03+.03*moonUp)*nk,(.045+.045*moonUp)*nk,(.085+.09*moonUp)*nk];")
rep("AT.useSun=e>-.035;AT.LD=AT.useSun?sun:moon;", "AT.useSun=e>-.035;AT.LD=AT.useSun?sun:(moon[1]>.28?moon:[.33,.86,.39]);")
rep(":.45*moonUp*AT.csF*(1-.7*AT.gray);", ":(.34+.3*moonUp)*AT.csF*(1-.5*AT.gray);")
rep("AT.hemiI=(.25+.6*AT.dayK)*(1+.35*AT.gray)*(1-.3*wx.storm)+.1*AT.nightK;", "AT.hemiI=(.25+.6*AT.dayK)*(1+.35*AT.gray)*(1-.3*wx.storm)+.5*AT.nightK;")
rep("+.05*AT.nightK*moonUp;", "+(.1+.08*moonUp)*AT.nightK;")
rep("hemi.color.setRGB(Math.max(a[0]*1.7,.2*nb),Math.max(a[1]*1.55,.26*nb),Math.max(a[2]*1.35,.4*nb));", "hemi.color.setRGB(Math.max(a[0]*1.7,.36*nb),Math.max(a[1]*1.55,.45*nb),Math.max(a[2]*1.35,.66*nb));")
rep("hemi.groundColor.setRGB(.2,.24,.2).multiplyScalar(.25+.75*dayK);", "hemi.groundColor.setRGB(.2,.24,.2).multiplyScalar(.5+.5*dayK);")
rep("let fc=new THREE.Color(AT.fog[0],AT.fog[1],AT.fog[2]),fn=", "let fc=new THREE.Color(Math.max(AT.fog[0],.05*nightK),Math.max(AT.fog[1],.072*nightK),Math.max(AT.fog[2],.12*nightK)),fn=")
# ---------------- HUD ----------------
rep("$('gold').textContent=gold;$('wave').textContent=Math.max(1,wave);$('isl').textContent=islands.filter(i=>i.owner==='player').length+'/'+islands.filter(i=>i.town).length;", "")
rep("$('wood').textContent=wood;$('iron').textContent=iron;$('food').textContent=food;", "")
rep("$('aFlag').classList.toggle('hide',!flagOption());", "$('aFlag').classList.toggle('hide',!(flagOption()||RAID.on&&raidFlagOption()));")
rep("$('aEscape').classList.toggle('hide',!(ok&&mode==='sea'&&P.alive&&P.hull<P.hullMax*.35));", "$('aEscape').classList.add('hide');")
rep("$('aBuy').classList.toggle('hide',!(ok&&buyShipOption()));", "$('aBuy').classList.add('hide');")
rep("$('shopBtn').classList.toggle('hide',!P.alive);", "$('shopBtn').classList.toggle('hide',!ON.me);")
rep("$('shopBtn').addEventListener('pointerdown',e=>{e.preventDefault();if(playing)openShop();});", "")
rep("$('go').onclick=()=>{$('start').classList.add('hide');playing=true;};", "")
rep("if(!playing||paused||e.target.closest('button')||e.target.closest('#map'))return;",
    "if(!playing||paused||e.target.closest('button')||e.target.closest('#map')||e.target.closest('.ov')||e.target.closest('.top'))return;")
rep("if(!playing)return;paused=true;{const hv=homeVessel();", "if(!playing)return;{const hv=homeVessel();")
# ---------------- sea combat: other captains, raid targets, bosses ----------------
rep("      if(b.owner==='p'){", "      if(b.owner==='r'){if(P.alive&&hitShip(P,p)){boom(p.clone());dead=true;}}\n      else if(b.owner==='p'){")
rep("      }else if(P.alive&&hitShip(P,p)){damageShip(P,p,b.dmg,.35);boom(p.clone());dead=true;}",
    "        if(!dead&&(pvpBallHit(p,b.dmg)||raidBallHit(p,b.dmg)||evBallHit(p,b.dmg))){boom(p.clone());dead=true;}\n      }else if(P.alive&&hitShip(P,p)){damageShip(P,p,b.dmg,.35);boom(p.clone());dead=true;}")
rep("function playerFire(target){fireBroadside(P,target||aimPoint(RANGE).p,'p',12,3);P.cd=RELOAD;}",
    "function playerFire(target){const tg=target||aimPoint(RANGE).p;fireBroadside(P,tg,'p',12*(P.gunDmg||1),3);P.cd=RELOAD*(P.reloadK||1);if(P.online)pvpFired(tg);}")
rep("if(t){fireBroadside(P,t,'p',12,4);P.cd=RELOAD*Math.max(.5,1.3-.12*gun);}",
    "if(t){fireBroadside(P,t,'p',12*(P.gunDmg||1),4);if(P.online)pvpFired(t);P.cd=RELOAD*(P.reloadK||1)*Math.max(.5,1.3-.12*gun);}")
rep("  for(const f of forts)if(f.alive&&f.il.owner!=='player')consider(new THREE.Vector3(f.x,f.y+7,f.z));\n  if(best)return{p:best,lock:true};",
    "  for(const f of forts)if(f.alive&&f.il.owner!=='player')consider(new THREE.Vector3(f.x,f.y+7,f.z));\n  pvpAimCandidates(consider);evAimCandidates(consider);\n  if(best)return{p:best,lock:true};")
rep("  return best;\n}\nfunction foeFire(s){", "  [best,bd]=pvpAutoTarget(best,bd);[best,bd]=evAutoTarget(best,bd);return best;\n}\nfunction foeFire(s){")
rep("const th=Math.max(ty,boostV>.05?boostV:ty),tg=th>0?th*P.maxSpeed*(1+.75*boostV):th*P.maxSpeed*.35;",
    "const th=Math.max(ty,boostV>.05?boostV:ty),msp=P.maxSpeed*(P.slowT>0?1-(P.slowK||.4):1),tg=th>0?th*msp*(1+.75*boostV):th*msp*.35;")
rep("if(alive===0&&P.alive&&mode==='sea'){waveTimer-=dt;", "if(alive===0&&P.alive&&mode==='sea'&&!RAID.on&&!nearHome()){waveTimer-=dt;")
# ---------------- ground combat: unit types, raid AI, posts, walls ----------------
rep("function updateUnits(list,dt,ctx){", "function updateUnits(list,dt,ctx){unitAuras(list,dt,ctx);")
rep("    if(u.jump||u.state==='hidden')continue;", "    if(u.jump||u.state==='hidden')continue;if(u.custom){u.custom(u,dt,ctx,list,i);continue;}")
rep("const aggro=u.team===1?(ctx.alert?90:28):45;let [t,d]=nearestFoe(u,list,aggro);",
    "const aggro=u.aggro||(u.team===1?(ctx.alert?90:28):45);let [t,d]=nearestFoe(u,list,aggro);if(t&&u.post&&Math.hypot(t.x-u.post.x,t.z-u.post.z)>(u.leash||20)+12){t=null;d=1e9;}")
rep("if(u.rw==='musket'&&dw>3.4){faceT=true;", "if((u.rw==='musket'||u.ranged)&&dw>(u.minR||3.4)){faceT=true;")
rep("if(u.loaded&&dw<34&&!u.block){startAct(u,'shootM',{tgt:t});u.loaded=false;u.reload=6.5+Math.random()*3;}",
    "if(u.loaded&&dw<(u.rng||34)&&!u.block){startAct(u,u.throwClip||'shootM',{tgt:t});u.loaded=false;u.reload=(u.reloadT||6.5)+Math.random()*(u.throwClip?1:3);}")
rep("const want=dw<10?-1:dw>24?1:0;", "const want=dw<(u.rng?u.rng*.3:10)?-1:dw>(u.rng?u.rng*.8:24)?1:0;")
rep("const pool=u.rw==='musket'?['eThrust']:['eSlashA','eSlashB','eSlashA','eThrust','eChop'];startAct(u,pick(pool),{tgt:t});u.cd=1.1+Math.random()*1.6+(t===capT?.4:0);",
    "const pool=u.pool||(u.rw==='musket'?['eThrust']:['eSlashA','eSlashB','eSlashA','eThrust','eChop']);startAct(u,pick(pool),{tgt:t});u.cd=(1.1+Math.random()*1.6+(t===capT?.4:0))/((u.atkK||1)*(u.hasteT>T?1.25:1));")
rep("    else if(!t&&u.team===0&&ctx.follow&&ctx.follow.state==='alive'){",
    "    else if(!t&&u.team===0&&RAID.on&&ctx.il===RAID.il&&u.ai==='crew'&&(r=>{if(r){mvx=r.mx;mvz=r.mz;sp=r.sp;return true;}return false;})(raidStructAI(u,dt))){}\n    else if(!t&&u.team===0&&ctx.follow&&ctx.follow.state==='alive'){")
rep("    else if(!t&&u.team===1&&ctx.alert&&ctx.home){",
    "    else if(!t&&u.post&&Math.hypot(u.post.x-u.x,u.post.z-u.z)>2.5){const dx=u.post.x-u.x,dz=u.post.z-u.z,dd=Math.hypot(dx,dz);mvx=dx/dd;mvz=dz/dd;sp=dd>10?3.8:2.2;}\n    else if(!t&&u.team===1&&ctx.alert&&ctx.home&&!u.post){")
rep("    else if(!t&&u.team===1&&!ctx.alert){wander(u,dt,ctx,1);}", "    else if(!t&&u.team===1&&!ctx.alert&&!u.post){wander(u,dt,ctx,1);}")
rep("if(sp>0&&!u.act){const ml=Math.hypot(mvx,mvz)||1;u.x+=mvx/ml*sp/S*dt;u.z+=mvz/ml*sp/S*dt;",
    "if(sp>0&&!u.act){const ml=Math.hypot(mvx,mvz)||1,sk=unitSpd(u);u.x+=mvx/ml*sp*sk/S*dt;u.z+=mvz/ml*sp*sk/S*dt;")
rep("if(o.team!==u.team&&o.state==='alive'&&!o.jump&&o.ai!=='villager'){", "if(o.team!==u.team&&o.state==='alive'&&!o.jump&&o.ai!=='villager'&&!(o.stealth&&!(o.revealT>T))){")
rep("const tw=il.town;if(!tw&&!(land&&(land.il===il||land.partyIl===il)))return;", "const tw=il.town;if(!tw&&!il.pl&&!(land&&(land.il===il||land.partyIl===il)))return;")
rep("const ctx={alert:il.alert,doors:tw?tw.doors:null,points:tw?tw.points:null,home:tw||null,",
    "const ctx={il,alert:il.alert,doors:tw?tw.doors:il.baseDoors||null,points:tw?tw.points:il.basePts||null,home:tw||il.base||null,")
rep("clampU(u){for(const o of il.obs){if(o.tr&&o.tr.gone)continue;", "clampU(u){for(const o of il.obs){if(o.tr&&o.tr.gone)continue;if(o.wall&&(u.climb||u.team===1&&o.wall.gate>=0))continue;")
rep("function placeUnit(u){const s=u.space;u.g.position.set(u.x,s.y(u.x,u.z),u.z);}", "function placeUnit(u){const s=u.space;u.g.position.set(u.x,s.y(u.x,u.z)+(u.yOff||0),u.z);}")
rep("const cap=land&&land.cap===u,horse=cap&&land.horse,swim=cap&&land.swim;", "const cap=land&&land.cap===u,horse=u.mount||cap&&land.horse,swim=cap&&land.swim;")
rep("spX=.1+(land.horse.speed>6?", "spX=.1+(horse.speed>6?")
rep("const mask=C.full?M_ALL:M_UP,legW=C.full?1:(1-mv)*.85;", "const mask=C.full?M_ALL:M_UP,legW=C.full?1:horse?0:(1-mv)*.85;")
# ---------------- frame hooks & maps ----------------
rep("  updateHud();\n  artTick(", "  updateHud();onlineFrame(dt);\n  artTick(")
rep("  x.restore();\n  /* frame, title, compass, scale */", "  onlineWorldMarks(x,tr,inView,gz,Z);x.restore();\n  /* frame, title, compass, scale */")
rep("  const hv=homeVessel(),[px,py]=tr(hv.x,hv.z),[hx,hy]=tr(hv.x+Math.sin(hv.rot)*10,hv.z+Math.cos(hv.rot)*10),a=Math.atan2(hy-py,hx-px);",
    "  onlineMiniMarks(mctx,tr,Cc);\n  const hv=homeVessel(),[px,py]=tr(hv.x,hv.z),[hx,hy]=tr(hv.x+Math.sin(hv.rot)*10,hv.z+Math.cos(hv.rot)*10),a=Math.atan2(hy-py,hx-px);")
rep("\nstartGame();\nlet dprNow=", "\nstartGame();netConnect();\nlet dprNow=")

# ---------------- HTML ----------------
rep("<title>قراصنة البحر</title>", "<title>قراصنة البحر أونلاين</title>")
TOP_ROWS = '''<div class="rg"><span title="ذهب"><i data-ic="coin"></i><b id="r_gold">0</b></span><span title="خشب"><i data-ic="wood"></i><b id="r_wood">0</b></span><span title="حديد"><i data-ic="iron"></i><b id="r_iron">0</b></span><span title="طعام"><i data-ic="meat"></i><b id="r_food">0</b></span><span title="بارود"><i data-ic="barrel"></i><b id="r_powder">0</b></span><span title="السكان"><i data-ic="pop"></i><b id="r_pop">0</b></span></div>
    <div class="row"><span class="lbl" id="clock">07:00</span><span class="lbl hon2" title="الشرف"><i data-ic="trophy"></i><b id="r_honor">0</b><span id="r_shield" class="hide"><i data-ic="shield"></i></span><span id="r_traitor" class="hide"><i data-ic="dagger"></i></span><i id="netDot" class="off"></i></span></div>
    <div id="raidBar" class="hide"><i data-ic="swords"></i><b id="raidName"></b><span id="raidTime">6:00</span><span id="raidPct">0%</span><button id="raidQuit">انسحاب</button></div>
    <div id="bossBar" class="hide"><span id="bossName"></span><div class="bar"><i id="bossFill"></i></div></div>
    <div id="navHint" class="hide"><svg id="navArr" viewBox="0 0 24 24" aria-hidden="true"><path d="M12,2L19.5,21L12,16.2L4.5,21Z" fill="currentColor"/></svg><span id="navTxt"></span></div>
    <button id="shopBtn"><i data-ic="scroll"></i> القائمة<i id="menuBadge" class="hide">0</i></button>
  </div>'''
rrep(r'  <button id="shopBtn">.*?</button>\n', '')
rrep(r'    <div class="row"><span><svg class="ic i-coin".*?<span class="lbl">موجة <b id="wave">1</b></span></div>\n  </div>', TOP_ROWS.replace('\\', '\\\\'))
rep('<div id="acts">', '<div id="acts">\n    <button class="act hide" id="aHome"></button><button class="act hide" id="aRaid"></button>')
START = '''<div class="ov" id="start">
  <div class="card">
    <h1>قراصنة البحر</h1>
    <p class="sub">أونلاين</p>
    <p>جزيرتك لك: ابنِ قلعتك وبيوتك ومزارعك، جهّز دفاعاتها وحرّاسها، كوّن أسطولك وطاقمك من أنواع القراصنة، تحالف أو اغدر، وارفع علمك اللي ترسمه بإيدك.</p>
    <div id="lgForm" class="hide">
      <input id="lgName" placeholder="اسم القبطان" maxlength="16" autocomplete="username" spellcheck="false">
      <input id="lgPass" type="password" placeholder="كلمة المرور" maxlength="64" autocomplete="current-password">
      <div class="row2 cen"><button class="btn" id="lgIn">دخول</button><button class="btn alt" id="lgReg">حساب جديد</button></div>
    </div>
    <div id="lgWait"><p>لحظة… نتصل بالسيرفر</p></div>
    <p id="lgMsg" class="msg"></p>
    <details><summary>طريقة اللعب</summary><ul>
      <li>عصا اليسار للإبحار، وانقر الشاشة لتسرّع، واسحب يمين الشاشة للكاميرا، والخريطة الصغيرة تفتح خريطة العالم</li>
      <li>«القائمة» فيها جزيرتك: المباني والدفاعات والفخاخ والسور، والجيش (الحانة للقراصنة والثكنة لحرّاس الجزيرة)، والأسطول، والعلم، والكلان، والترتيب، والسجل</li>
      <li>قرّب من جزيرة قبطان ثاني واضغط «اغزُ»، انزل بطاقمك، دمّر الدفاعات واكسر السور، وارفع علمك فوق قلعته للنصر الكامل</li>
      <li>الحليف يشوف اسمه أزرق، والكلان أخضر، والعدو أحمر. الغدر بحليف يخليك «غدّار» عليه مكافأة</li>
      <li>وحوش البحر وقافلة الملك تظهر على الحلقة بين الجزر؛ كل اللي يشاركون ياخذون نصيب</li>
    </ul></details>
  </div>
</div>'''
rrep(r'<div class="ov" id="start">.*?\n</div>\n(?=<div class="ov hide" id="over">)', START.replace('\\', '\\\\') + '\n')
OVERLAYS = '''<div class="ov hide" id="ui"><div class="card uiCard"><div class="uiHead"><div id="uiTabs"></div><button class="sbtn" id="uiClose" aria-label="إغلاق">✕</button></div><div id="uiBody"></div></div></div>
<div class="ov hide" id="prof"><div class="card" id="profCard"></div></div>
<div class="ov hide" id="confirm"><div class="card"><h2 id="cfTitle"></h2><div id="cfBody"></div><div class="row2 cen"><button class="btn" id="cfOk">تمام</button><button class="sbtn" id="cfNo">رجوع</button></div></div></div>
'''
rep('<div class="ov hide" id="shop"><div class="card shop" id="shopCard"></div></div>\n', '<div class="ov hide" id="shop"><div class="card shop" id="shopCard"></div></div>\n' + OVERLAYS)
CSS = open(os.path.join(HERE, 'online.css'), encoding='utf-8').read()
rep('</style>\n</head>', CSS + '\n</style>\n</head>')
# shared rules (window.SH) before the game script
shared = open(os.path.join(ROOT, 'server', 'shared.js'), encoding='utf-8').read()
rep('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n<script>',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n<script>\n' + shared + '\nwindow.SHR=window.SH;\n</script>\n<script>')

# ---------------- modules, inside the game's closure, before the boot ----------------
ORDER = ['c_net.js', 'c_raid.js', 'c_base.js', 'c_fleet.js', 'c_units.js', 'c_ui.js', 'c_events.js', 'c_main.js']
mods = {f: re.sub(r'\bSH\.', 'SHR.', open(os.path.join(SRC, f), encoding='utf-8').read()) for f in ORDER}  # the game already uses the name SH (sky LUT height)
if not DBG:
    mods['c_main.js'] = re.sub(r'/\* test hook.*$', '', mods['c_main.js'], flags=re.S)
# name clash check between the game and the modules (a later function declaration would silently replace the game's)
decl = re.compile(r'(?m)^(?:async\s+)?function\*?\s+([A-Za-z_$][\w$]*)|^(?:const|let|var|class)\s+([A-Za-z_$][\w$]*)')
def names(txt):
    out = set()
    for m in decl.finditer(txt):
        out.add(m.group(1) or m.group(2))
    for m in re.finditer(r'\bfunction\*?\s+([A-Za-z_$][\w$]*)\s*\(', txt):
        out.add(m.group(1))

    # also comma lists on const/let lines
    for m in re.finditer(r'(?m)^(?:const|let)\s+(.+)$', txt):
        line, depth, cur, parts, q = m.group(1), 0, '', [], None
        for ch in line:
            if q:
                cur += ch
                if ch == q: q = None
                continue
            if ch in '\'"`': q = ch; cur += ch; continue
            if ch in '([{': depth += 1
            elif ch in ')]}': depth -= 1
            if ch == ';' and depth == 0: break
            if ch == ',' and depth == 0: parts.append(cur); cur = ''; continue
            cur += ch
        parts.append(cur)
        for part in parts:
            mm = re.match(r'\s*([A-Za-z_$][\w$]*)\s*=(?![=>])', part)
            if mm: out.add(mm.group(1))
    return out
game_js = s[s.index('(function(){'):]
gnames = names(game_js)
seen = {}
bad = False
for f in ORDER:
    for n in names(mods[f]):
        if n in gnames:
            print(f'NAME CLASH: {n} ({f}) also declared in the game'); bad = True
        if n in seen:
            print(f'NAME CLASH: {n} in {f} and {seen[n]}'); bad = True
        seen[n] = f
if bad: sys.exit(1)
BOOT = "\n\nlet last=performance.now()/1000,wakeT=0;\ngenerateIslands();"
rep(BOOT, "\n/* ======================= ONLINE ======================= */\n" + "\n".join(f"/* ---- {f} ---- */\n{mods[f]}" for f in ORDER) + BOOT)
out = os.environ.get('OUT') or os.path.join(ROOT, 'server', 'public', 'index.html')
open(out, 'w', encoding='utf-8').write(s)
print('built', out, len(s.encode('utf-8')), 'bytes')
