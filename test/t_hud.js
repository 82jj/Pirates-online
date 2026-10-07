/* screenshots of the interface on a phone: login, sea HUD, menus, on foot, map, landscape */
const {open,ev,ff,shot,register,done,sleep}=require('./lib');
const W=+process.env.VW||390,H=+process.env.VH||844,TAG=process.env.TAG||'p';
(async()=>{
  const p=await open('A',{width:W,height:H});
  await p.waitForSelector('#lgForm:not(.hide)',{timeout:120000});await sleep(600);await shot(p,TAG+'_login');
  await register(p,'سندباد'+(Date.now()%1000));await ff(p,3);
  await ev(p,`tod=.42;1`);await ff(p,2);await shot(p,TAG+'_sea_day');
  await ev(p,`banner('🏴 رفعت علمك فوق جزيرة الشمس! الغنيمة 💰 1200',4000);1`);await sleep(500);await shot(p,TAG+'_banner');
  for(const t of ['island','army','fleet','clan','top','logs']){await ev(p,`uiOpen('${t}')`);await sleep(350);await shot(p,TAG+'_menu_'+t);}
  await ev(p,`uiClose()`);
  await ev(p,`confirmBox('تفكيك السفينة','بتسترجع 30% من تكلفتها، والطاقم يرجع للجزيرة إذا فيه مكان.','فكّكها',null)`);await sleep(300);await shot(p,TAG+'_confirm');await ev(p,`confirmClose()`);
  /* on foot on the home island */
  await ev(p,`const il=ON.myIsl;startFoot(il,true);1`);await ff(p,4);
  await ev(p,`const c=land.cap,B=ON.myIsl.base;c.x=B.x+12;c.z=B.z+3;1`);await ff(p,1.5);await shot(p,TAG+'_foot');
  await ev(p,`endFoot();1`);await ff(p,1);
  /* raid bar + nav */
  await ev(p,`RAID.on=true;RAID.name='جزيرة القرصان الأحمر';RAID.dur=360;RAID.t=40;RAID.pct=35;hudT=0;onlineHud(1);$('navHint').classList.remove('hide');$('navTxt').textContent='جزيرة الصقر · 3.2 كم';$('bossBar').classList.remove('hide');$('bossName').textContent='الأخطبوط العملاق';$('bossFill').style.width='62%';1`);await sleep(300);await shot(p,TAG+'_raidbar');
  await ev(p,`RAID.on=false;hudT=0;onlineHud(1);$('bossBar').classList.add('hide');1`);
  await ev(p,`$('map').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));1`);await sleep(800);await shot(p,TAG+'_worldmap');
  await done();
})().catch(async e=>{console.error('FAIL',e);await done();process.exit(1);});
