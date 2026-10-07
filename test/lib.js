/* shared helpers for the browser tests */
const {chromium}=require('/opt/npm-tools/node_modules/playwright');
const fs=require('fs'),path=require('path');
const URL=process.env.URL||'http://localhost:8092/?dbg';
const OUT=process.env.OUT||path.join(__dirname,'shots');fs.mkdirSync(OUT,{recursive:true});
const THREE_JS=fs.readFileSync(process.env.THREE_JS||path.join(__dirname,'three.min.js'));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const errs=[],browsers=[];
async function open(tag,vw){const browser=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});browsers.push(browser);
  const ctx=await browser.newContext({viewport:vw||{width:960,height:600},deviceScaleFactor:1});const page=await ctx.newPage();
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
const ff=async(p,sec)=>{for(let k=0;k<sec;k+=1){await p.evaluate(s=>window.__ff(s),Math.min(1,sec-k));await sleep(40);}};
async function shot(p,name){await sleep(300);await p.screenshot({path:path.join(OUT,name+'.png')});console.log('shot',name);}
async function register(p,name){await p.waitForSelector('#lgForm:not(.hide)',{timeout:120000});
  await p.evaluate(n=>{document.getElementById('lgName').value=n;document.getElementById('lgPass').value='pass1234';document.getElementById('lgReg').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true}));},name);
  await p.waitForFunction(()=>document.getElementById('start').classList.contains('hide'),null,{timeout:120000});}
async function done(){console.log('---- errors ('+errs.length+')');const seen=new Map();for(const e of errs){const k=e.split('\n')[0];seen.set(k,(seen.get(k)||0)+1);if(seen.get(k)===1)console.log(e);}
  for(const [k,n] of seen)if(n>1)console.log('x'+n,k);for(const b of browsers)await b.close();}
module.exports={open,ev,ff,shot,register,done,sleep,errs};
