/* character gallery: every pirate type and island defender rendered in a plain studio scene */
const {chromium}=require('/opt/npm-tools/node_modules/playwright');
const fs=require('fs'),path=require('path');
const URL=process.env.URL||'http://localhost:8092/?dbg';
const OUT=path.join(__dirname,'shots');fs.mkdirSync(OUT,{recursive:true});
const THREE_JS=fs.readFileSync(process.env.THREE_JS||path.join(__dirname,'three.min.js'));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const errs=[];
(async()=>{const browser=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
  try{const ctx=await browser.newContext({viewport:{width:1000,height:560}});const page=await ctx.newPage();
    await page.route('https://cdnjs.cloudflare.com/**',r=>r.fulfill({status:200,contentType:'application/javascript',body:THREE_JS}));
    await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
    page.on('pageerror',e=>errs.push('PAGEERROR '+e.message+'\n'+(e.stack||'').split('\n').slice(0,4).join('\n')));
    await page.goto(URL,{waitUntil:'domcontentloaded',timeout:120000});await page.waitForFunction(()=>window.__pir,null,{timeout:120000});
    const ev=c=>page.evaluate(c=>window.__pir.ev(c),c);
    await ev(`(()=>{const sc=new THREE.Scene();sc.background=new THREE.Color(0x9DBBD2);sc.add(new THREE.HemisphereLight(0xEAF2FF,0x6A5A44,.95));const dl=new THREE.DirectionalLight(0xFFF2DC,1.7);dl.position.set(4,7,6);sc.add(dl);
      const gr=new THREE.Mesh(new THREE.PlaneGeometry(80,30),new THREE.MeshStandardMaterial({color:0x8A9A66,roughness:1}));gr.rotation.x=-Math.PI/2;sc.add(gr);
      const P1=Object.keys(SHR.PUNITS),rows=[P1.slice(0,7),P1.slice(7,14),P1.slice(14,21),P1.slice(21).concat(['guard','crew','wallgun']),['firemen','gdiver','cavalry','fighters','fighters','tguard','captain']];
      const G={sc,rows:[],cam:new THREE.PerspectiveCamera(30,innerWidth/innerHeight,.1,200)};
      rows.forEach((r,ri)=>{const ps=[];r.forEach((t,i)=>{const kind=t==='captain'?'captain':t==='skeleton'||t==='tguard'?'skeleton':t==='fighters'?'villager':SHR.PUNITS[t]?'pirate':'defender';
        const p=makePerson(kind,t==='captain'?undefined:t);p.state='alive';p.g.position.set((i-(r.length-1)/2)*1.3,0,-ri*12);p.g.rotation.y=(i%2?-.25:.25);sc.add(p.g);ps.push(p);});G.rows.push(ps);});
      const d=makeAnimal('dog');d.g.position.set(-4.5,0,-4*12+2);sc.add(d.g);const h=makeAnimal('horse');h.g.position.set(4.6,0,-4*12+1.2);h.g.rotation.y=-.6;sc.add(h.g);
      window.__G=G;const rr=renderer.render;renderer.render=function(){const e=renderer.toneMappingExposure;renderer.toneMappingExposure=1;rr.call(renderer,G.sc,G.cam);renderer.toneMappingExposure=e;};document.querySelector('.hud').style.display='none';document.getElementById('start').style.display='none';return 1;})()`);
    for(let ri=0;ri<5;ri++){await ev(`(()=>{const G=window.__G,z=-${ri}*12;G.cam.aspect=innerWidth/innerHeight;G.cam.updateProjectionMatrix();G.cam.position.set(0,1.35,z+9.2);G.cam.lookAt(0,1.0,z);
        for(const p of G.rows[${ri}]){p.mv=0;animPerson(p,.016);}return 1;})()`);await sleep(1500);await page.screenshot({path:path.join(OUT,'g_row'+ri+'.png')});console.log('row',ri);}
    await ev(`(()=>{const G=window.__G,z=-4*12;G.cam.position.set(-2.6,1.2,z+5.2);G.cam.lookAt(-2.6,.9,z+1);return 1;})()`);await sleep(1200);await page.screenshot({path:path.join(OUT,'g_close.png')});
  }catch(e){console.error('FAILED',e);}finally{console.log('errors',errs.length);for(const e of errs.slice(0,10))console.log(e);await browser.close();}})();
