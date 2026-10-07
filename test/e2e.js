/* end-to-end test: two captains (separate browsers) against the local server; the game is fast-forwarded without rendering between shots */
const {chromium}=require('/opt/npm-tools/node_modules/playwright');
const fs=require('fs'),path=require('path');
const URL=process.env.URL||'http://localhost:8092/?dbg';
const OUT=process.env.OUT||path.join(__dirname,'shots');fs.mkdirSync(OUT,{recursive:true});
const THREE_JS=fs.readFileSync(process.env.THREE_JS||path.join(__dirname,'three.min.js'));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const errs=[],browsers=[];
const ONLY=process.env.ONLY||'';
async function open(tag){const browser=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});browsers.push(browser);
  const ctx=await browser.newContext({viewport:{width:960,height:600},deviceScaleFactor:1});const page=await ctx.newPage();
  await page.route('https://cdnjs.cloudflare.com/**',r=>r.fulfill({status:200,contentType:'application/javascript',body:THREE_JS}));
  await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
  await page.route('https://fonts.gstatic.com/**',r=>r.abort());
  page.on('pageerror',e=>{errs.push(tag+' PAGEERROR '+e.message+'\n'+(e.stack||'').split('\n').slice(0,5).join('\n'));});
  page.on('console',m=>{if(m.type()==='error'||m.type()==='warning'){const t=m.text();if(!/GL_|WebGL|GPU|swiftshader|fonts|THREE\.WebGLRenderer|Context Lost/i.test(t))errs.push(tag+' '+m.type()+': '+t);}});
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(()=>window.__pir,null,{timeout:120000});
  await page.evaluate(()=>window.__pir.ev(`window.__ff=(sec)=>{const rr=renderer.render,raf=window.requestAnimationFrame;renderer.render=function(){};window.requestAnimationFrame=function(){return 0};
    try{const n=Math.round(sec/.05);for(let i=0;i<n;i++){last=performance.now()/1000-.05;loop();}}finally{renderer.render=rr;window.requestAnimationFrame=raf;}return 1;}`));
  return page;}
const ev=(p,c)=>p.evaluate(c=>window.__pir.ev(c),c);
const ff=async(p,sec)=>{for(let k=0;k<sec;k+=2){await p.evaluate(s=>window.__ff(s),Math.min(2,sec-k));await sleep(60);}};
async function shot(p,name){await sleep(400);await p.screenshot({path:path.join(OUT,name+'.png')});console.log('shot',name);}
async function register(p,name){await p.waitForSelector('#lgForm:not(.hide)',{timeout:120000});
  await p.evaluate(n=>{document.getElementById('lgName').value=n;document.getElementById('lgPass').value='pass1234';document.getElementById('lgReg').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true}));},name);
  await p.waitForFunction(()=>document.getElementById('start').classList.contains('hide'),null,{timeout:120000});}
const want=k=>!ONLY||ONLY.split(',').includes(k);
(async()=>{
  try{
    const A=await open('A');await register(A,'Jack'+(Date.now()%1000));await ff(A,3);
    console.log('A state',await ev(A,'JSON.stringify({mode,P:[P.x|0,P.z|0,P.online,P.crew.length,P.hullMax],isl:!!ON.myIsl,res:ON.me.res})'));
    await shot(A,'01_sea_home');
    const B=await open('B');await register(B,'Anne'+(Date.now()%1000));await ff(B,2);
    if(want('menu')){for(const t of['island','army','fleet','flag','clan','top','logs']){await ev(A,`uiOpen('${t}')`);await sleep(500);await shot(A,'02_menu_'+t);}await ev(A,'uiClose()');}
    console.log('build',await ev(A,`act({t:'build',plot:freePlot(),type:'house'}).then(()=>'ok').catch(e=>e.message)`));
    console.log('recruit',await ev(A,`act({t:'recruit',type:'sword',n:3,to:ON.me.flagship}).then(()=>'ok').catch(e=>e.message)`));
    console.log('defence',await ev(A,`act({t:'defBuild',spot:freeDefSpot('land'),type:'tower'}).then(()=>'ok').catch(e=>e.message)`));
    await sleep(800);await ff(A,1);console.log('A crew',await ev(A,'JSON.stringify(ON.me.ships[0].crew)+" deck "+P.crew.length'));
    if(want('home')){
      await ev(A,`(()=>{const il=ON.myIsl;buildNow(il);const B=il.base;P.x=B.x+Math.cos(B.ang)*(il.r*.9+70);P.z=B.z+Math.sin(B.ang)*(il.r*.9+70);P.rot=Math.atan2(B.x-P.x,B.z-P.z)+.5;P._y=undefined;P.speed=0;camYaw=Math.atan2(B.x-P.x,B.z-P.z);camPitch=.42;return 1;})()`);
      await ff(A,3);await shot(A,'03_home_island');
      console.log('ents',await ev(A,'Object.keys(ON.myIsl.ents).length+" walls "+ON.myIsl.walls.length+" units "+ON.myIsl.units.length'));
      await ev(A,'startFoot(ON.myIsl,true)');await ff(A,4);
      await ev(A,`(()=>{const c=land.cap,B=ON.myIsl.base;c.x=B.x+Math.cos(B.ang)*24;c.z=B.z+Math.sin(B.ang)*24;camYaw=Math.atan2(B.x-c.x,B.z-c.z);camPitch=.18;return 1;})()`);await ff(A,1.5);await shot(A,'04_home_foot');
      await ev(A,'endFootSilently();mode="sea";placeCaptain();FLEET_KEY="";syncFleet(false);1');await ff(A,1);console.log('crew back',await ev(A,'P.crew.length+" hp "+P.hp'));}
    /* A sails to B's island and raids it */
    const bid=await ev(B,'ON.me.id');
    await ev(A,`(()=>{const il=islandOfPlayer('${bid}');buildNow(il);const a=il.harborA,sr=shoreR(il,a);P.x=il.x+Math.cos(a)*(sr+60);P.z=il.z+Math.sin(a)*(sr+60);P.rot=Math.atan2(il.x-P.x,il.z-P.z);P._y=undefined;P.speed=0;camYaw=P.rot;return 1;})()`);
    for(let i=0;i<6;i++){await ff(A,.5);await ff(B,.5);await sleep(300);}
    console.log('B sees A',await ev(B,'REMOTE.size'),'A sees B',await ev(A,'REMOTE.size'));
    await ev(A,`raidRequest('${bid}',false)`);for(let i=0;i<20&&!(await ev(A,'RAID.on'));i++){await sleep(300);await ff(A,.2);}
    console.log('raid',await ev(A,'JSON.stringify({on:RAID.on,name:RAID.name,units:RAID.on?RAID.il.units.filter(u=>u.team===1).map(u=>u.utype).join(","):""})'));
    await ff(A,1);await shot(A,'05_raid_start');
    if(await ev(A,'RAID.on')){
      await ev(A,`(()=>{const il=RAID.il,B=il.base;P.x=B.dock.x+Math.cos(B.ang)*30;P.z=B.dock.z+Math.sin(B.ang)*30;P._y=undefined;P.speed=0;startFoot(il,true);return 1;})()`);
      for(let i=0;i<6;i++){await ff(A,6);await ev(A,`(()=>{const c=land&&land.cap;if(!c)return 0;const a=raidAttackers().filter(u=>u!==c);if(!a.length)return 0;let x=0,z=0;for(const u of a){x+=u.x;z+=u.z;}x/=a.length;z/=a.length;c.x=x-Math.sin(camYaw)*6;c.z=z-Math.cos(camYaw)*6;camPitch=.3;return 1;})()`);
        await ff(A,.3);await shot(A,'06_raid_fight_'+i);console.log('raid t',await ev(A,'JSON.stringify({t:RAID.t|0,pct:RAID.pct|0,att:raidAttackers().length,def:RAID.il.units.filter(u=>u.team===1&&u.state==="alive").length,dead:RAID.il.units.filter(u=>u.state==="dead").length})'));}
      await ev(A,'raidFinish(false)');for(let i=0;i<10;i++){await sleep(200);await ff(A,.3);}
      console.log('after raid',await ev(A,'JSON.stringify({on:RAID.on,logs:ON.me.logs.slice(0,1)})'));
      await sleep(500);await ff(B,.3);console.log('B logs',await ev(B,'JSON.stringify(ON.me.logs.slice(0,1))'));}
    /* unit gallery on A's own island */
    if(want('gallery')){await ev(A,`(()=>{if(land)endFootSilently();mode='sea';placeCaptain();const il=ON.myIsl,B=il.base;P.x=B.dock.x+Math.cos(B.ang)*40;P.z=B.dock.z+Math.sin(B.ang)*40;P._y=undefined;
      const types=Object.keys(SHR.PUNITS).concat(['guard','crew','wallgun','firemen','gdiver','fighters','tguard']);const out=[];
      types.forEach((t,i)=>{const row=Math.floor(i/11),col=i%11,a=B.ang+Math.PI*.5,ox=(col-5)*1.6,oz=row*2.6-2,x=B.x+Math.cos(a)*ox,z=B.z+Math.sin(a)*ox;
        const kind=t==='skeleton'||t==='tguard'?'skeleton':t==='fighters'?'villager':SHR.PUNITS[t]?'pirate':'defender';const p=makePerson(kind,t);p.utype=t;
        const u=mkUnit(p,2,x+Math.cos(B.ang)*oz,z+Math.sin(B.ang)*oz,il.space,'villager');u.tx=u.x;u.tz=u.z;u.wait=999;u.g.rotation.y=Math.atan2(Math.cos(B.ang),Math.sin(B.ang));scene.add(p.g);placeUnit(u);il.units.push(u);out.push(u);});
      const d=makeDogUnit(il,B.x+Math.cos(B.ang)*7,B.z+Math.sin(B.ang)*7,2);d.custom=null;il.units.push(d);
      window.__gal=out;startFoot(il,false);return out.length;})()`);
      await ff(A,4);
      await ev(A,`(()=>{const c=land.cap,B=ON.myIsl.base;c.x=B.x+Math.cos(B.ang)*13;c.z=B.z+Math.sin(B.ang)*13;camYaw=Math.atan2(B.x-c.x,B.z-c.z);camPitch=.02;return 1;})()`);
      await ff(A,1);await shot(A,'07_gallery');
      await ev(A,`(()=>{const c=land.cap,B=ON.myIsl.base,a=B.ang+Math.PI*.5;c.x=B.x+Math.cos(B.ang)*6+Math.cos(a)*4;c.z=B.z+Math.sin(B.ang)*6+Math.sin(a)*4;camYaw=Math.atan2(B.x-c.x,B.z-c.z)-.35;camPitch=-.05;return 1;})()`);
      await ff(A,.6);await shot(A,'07b_gallery_close');
      await ev(A,'endFootSilently();mode="sea";placeCaptain();for(const u of window.__gal){scene.remove(u.g);ON.myIsl.units.splice(ON.myIsl.units.indexOf(u),1);}1');}
    /* world events */
    if(want('events')){console.log('events',await ev(A,'JSON.stringify([...EVC.values()].map(c=>c.e.k))'));
      await ev(A,`(()=>{const c=[...EVC.values()].find(c=>c.e.k==='kraken');if(!c)return 0;const p=evPosC(c.e,srvNow());P.x=p.x+80;P.z=p.z+50;P._y=undefined;P.rot=Math.atan2(p.x-P.x,p.z-P.z)+1.2;P.speed=0;camYaw=Math.atan2(p.x-P.x,p.z-P.z);camPitch=.2;return 1;})()`);
      await ff(A,6);await shot(A,'08_kraken');
      console.log('kraken fire',await ev(A,'(()=>{const k=[...EVC.values()].find(c=>c.e.k==="kraken");if(!k)return 0;playerFire(new THREE.Vector3(k.kr.g.position.x,1,k.kr.g.position.z));return 1;})()'));await ff(A,3);
      console.log('kraken hp',await ev(A,'JSON.stringify([...EVC.values()].map(c=>[c.e.k,c.hp,c.e.hp]))'));
      await ev(A,`(()=>{const c=[...EVC.values()].find(c=>c.e.k==='ghost');if(!c)return 0;const s=c.ships[0].s;P.x=s.x+90;P.z=s.z+60;P._y=undefined;P.rot=Math.atan2(s.x-P.x,s.z-P.z)+1.4;camYaw=Math.atan2(s.x-P.x,s.z-P.z);return 1;})()`);
      await ff(A,5);await shot(A,'09_ghost');}
    if(want('map')){await A.evaluate(()=>document.getElementById('map').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true})));await sleep(2500);await shot(A,'10_worldmap');await A.evaluate(()=>document.getElementById('wclose').click());}
    await shot(B,'11_B_view');
  }catch(e){console.error('TEST FAILED',e);}
  finally{console.log('---- errors ('+errs.length+')');const seen=new Map();for(const e of errs){const k=e.split('\n')[0];seen.set(k,(seen.get(k)||0)+1);if(seen.get(k)===1)console.log(e);}
    for(const [k,n] of seen)if(n>1)console.log('x'+n,k);for(const b of browsers)await b.close();}})();
