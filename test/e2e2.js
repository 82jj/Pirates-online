/* PvP at sea, NPC colony capture, full raid with the flag, clans and alliances */
const {open,ev,ff,shot,register,done,sleep}=require('./lib');
(async()=>{try{
  const A=await open('A');await register(A,'Kidd'+(Date.now()%1000));const B=await open('B');await register(B,'Mary'+(Date.now()%1000));await ff(A,1);await ff(B,1);
  const aid=await ev(A,'ON.me.id'),bid=await ev(B,'ON.me.id');
  /* ---- sea fight in open water ---- */
  await ev(B,`(()=>{P.x=Math.cos(1)*7300;P.z=Math.sin(1)*7300;P.rot=0;P.speed=0;P._y=undefined;return 1;})()`);
  await ev(A,`(()=>{P.x=Math.cos(1)*7300+70;P.z=Math.sin(1)*7300;P.rot=0;P.speed=0;P._y=undefined;camYaw=-Math.PI/2;camPitch=.25;return 1;})()`);
  for(let i=0;i<5;i++){await ff(B,.4);await ff(A,.4);await sleep(250);}
  console.log('A sees B',await ev(A,`REMOTE.has('${bid}')`),'B hull before',await ev(B,'P.hull|0'));
  for(let k=0;k<6;k++){await ev(A,`(()=>{const R=REMOTE.get('${bid}');if(!R)return 0;P.cd=0;playerFire(new THREE.Vector3(R.x,1.5,R.z));return 1;})()`);await ff(A,2.6);await sleep(300);await ff(B,.3);}
  await shot(A,'21_pvp_A');console.log('B hull after',await ev(B,'P.hull|0'),'B alive',await ev(B,'P.alive'));
  await shot(B,'22_pvp_B');
  /* finish B off */
  for(let k=0;k<12&&await ev(B,'P.alive');k++){await ev(A,`(()=>{const R=REMOTE.get('${bid}');if(!R)return 0;P.cd=0;playerFire(new THREE.Vector3(R.x,1.5,R.z));return 1;})()`);await ff(A,2.6);await sleep(250);await ff(B,.3);}
  await ff(B,1);await sleep(800);await ff(A,.5);
  console.log('B alive',await ev(B,'P.alive'),'A logs',await ev(A,'JSON.stringify(ON.me.logs.slice(0,1))'),'B logs',await ev(B,'JSON.stringify(ON.me.logs.slice(0,1))'));
  await ff(B,5);console.log('B respawned',await ev(B,'JSON.stringify({alive:P.alive,x:P.x|0,z:P.z|0,hull:P.hull|0})'));
  /* ---- NPC colony capture ---- */
  const before=await ev(A,'JSON.stringify(ON.me.res)');
  await ev(A,`(()=>{const il=islands.find(i=>i.town&&!i.pl&&!i.huge);buildNow(il);window.__npc=il;for(const u of il.units)if(u.ai==='soldier'){u.state='dead';u.deadT=20;}
    const t=il.town;P.x=t.dock.x+Math.cos(t.ang)*40;P.z=t.dock.z+Math.sin(t.ang)*40;P._y=undefined;P.speed=0;startFoot(il,false);return il.name;})()`);
  await ff(A,3);await ev(A,`(()=>{const il=window.__npc,c=land.cap;c.x=il.town.pole.x+1;c.z=il.town.pole.z+1;flagHeld=true;return flagOption();})()`).then(v=>console.log('flag option',v));
  await ff(A,4);await ev(A,'flagHeld=false;1');await sleep(800);await ff(A,.3);
  console.log('npc owner',await ev(A,'window.__npc.owner'),'res before',before,'after',await ev(A,'JSON.stringify(ON.me.res)'));
  await shot(A,'23_npc_capture');
  await ev(A,'endFootSilently();mode="sea";placeCaptain();FLEET_KEY="";syncFleet(false);1');await ff(A,1);
  /* ---- clan + alliance ---- */
  console.log('clan',await ev(A,`act({t:'clanCreate',name:'إخوة الموج',tag:'الموج',open:true}).then(()=>'ok').catch(e=>e.message)`));await sleep(500);
  console.log('ally',await ev(A,`act({t:'allyReq',to:'${bid}'}).then(()=>'ok').catch(e=>e.message)`));await sleep(500);
  console.log('accept',await ev(B,`act({t:'allyAccept',from:'${aid}'}).then(()=>'ok').catch(e=>e.message)`));await sleep(800);
  console.log('rel B->A',await ev(B,`relOf(ON.pl.get('${aid}'))`),'tag',await ev(B,`ON.pl.get('${aid}').tag`));
  /* ---- betrayal raid with the flag raised ---- */
  await ev(A,`(()=>{const il=islandOfPlayer('${bid}');buildNow(il);const a=il.harborA,sr=shoreR(il,a);P.x=il.x+Math.cos(a)*(sr+60);P.z=il.z+Math.sin(a)*(sr+60);P.rot=Math.atan2(il.x-P.x,il.z-P.z);P._y=undefined;P.speed=0;camYaw=P.rot;return 1;})()`);
  for(let i=0;i<4;i++){await ff(A,.4);await sleep(250);}
  await ev(A,`raidRequest('${bid}',false)`);await sleep(1200);await ff(A,.3);
  console.log('confirm shown',await ev(A,`!document.getElementById('confirm').classList.contains('hide')`));
  await ev(A,`document.getElementById('cfOk').click();1`);for(let i=0;i<20&&!(await ev(A,'RAID.on'));i++){await sleep(300);await ff(A,.2);}
  console.log('raid on',await ev(A,'RAID.on'),'traitor',await ev(A,'ON.me.traitor>srvNow()'));
  await ev(A,`(()=>{const il=RAID.il,B=il.base;P.x=B.dock.x+Math.cos(B.ang)*30;P.z=B.dock.z+Math.sin(B.ang)*30;P._y=undefined;startFoot(il,true);return 1;})()`);await ff(A,4);
  await ev(A,`(()=>{for(const u of RAID.il.units)if(u.team===1&&u.state!=='dead'){u.state='alive';hurt(u,9999);}const c=land.cap;c.x=RAID.il.pole.x+.5;c.z=RAID.il.pole.z+.5;flagHeld=true;return raidFlagOption();})()`).then(v=>console.log('raid flag option',v));
  await ff(A,4);await shot(A,'24_raid_flag');await ev(A,'flagHeld=false;1');await sleep(1500);await ff(A,.5);
  console.log('after flag',await ev(A,'JSON.stringify({on:RAID.on,log:ON.me.logs[0]})'));await sleep(500);await ff(B,.3);console.log('B log',await ev(B,'JSON.stringify(ON.me.logs[0])'));
}catch(e){console.error('TEST FAILED',e);}finally{await done();}})();
