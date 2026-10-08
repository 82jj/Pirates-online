'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),net=require('node:net');
const {spawn}=require('node:child_process'),{once}=require('node:events');
const WS=require('../server/vendor/ws');
async function port(){const s=net.createServer();s.listen(0,'127.0.0.1');await once(s,'listening');const p=s.address().port;await new Promise(r=>s.close(r));return p;}
async function start(t,dir,extra={}){
  const p=await port(),child=spawn(process.execPath,['server/server.js'],{cwd:path.join(__dirname,'..'),env:{...process.env,RAILWAY_ENVIRONMENT_ID:'',RAILWAY_PROJECT_ID:'',NODE_ENV:'production',DATA_DIR:dir,PORT:String(p),...extra},stdio:['ignore','pipe','pipe']});
  t.after(()=>{if(child.exitCode===null)child.kill('SIGKILL');});
  let logs='';child.stderr.on('data',b=>{logs+=b;});
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('startup timeout '+logs)),5000);
    child.stdout.on('data',b=>{logs+=b;if(logs.includes('pirates server on')){clearTimeout(timer);resolve();}});
    child.once('exit',code=>{clearTimeout(timer);reject(new Error('startup exited '+code+' '+logs));});
  });
  return {child,url:'ws://127.0.0.1:'+p,health:'http://127.0.0.1:'+p+'/health'};
}
async function stop(s){const done=once(s.child,'exit');s.child.kill('SIGTERM');const [code]=await done;assert.equal(code,0);}
async function request(url,msg){
  const ws=new WS(url);await once(ws,'open');
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{ws.terminate();reject(new Error('response timeout'));},5000);
    ws.on('error',reject);
    ws.on('message',b=>{const m=JSON.parse(b);if(m.t==='welcome'||m.t==='err'||m.t==='needLogin'){clearTimeout(timer);ws.close();resolve(m);}});
    ws.send(JSON.stringify(msg));
  });
}
test('actual server persists registration, token, island and progress across restart and backup recovery',async t=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'pirates-server-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  let s=await start(t,dir,{ALLOW_NEW_WORLD:'1'});
  const first=await request(s.url,{t:'register',name:'StorageCaptain',pass:'test-secret'});
  assert.equal(first.t,'welcome');assert.equal((await fetch(s.health)).status,200);await stop(s);
  const file=path.join(dir,'world.json'),saved=JSON.parse(fs.readFileSync(file)),p=saved.players[first.me.id];
  assert.equal(p.name,'StorageCaptain');assert.equal(p.bld[0].t,'castle');assert.ok(p.hash);assert.ok(p.tokens.length);
  s=await start(t,dir);
  const resumed=await request(s.url,{t:'resume',token:p.tokens[0]});assert.equal(resumed.t,'welcome');assert.equal(resumed.me.id,first.me.id);
  assert.deepEqual(resumed.me.bld,first.me.bld);assert.equal(resumed.me.slot,first.me.slot);await stop(s);
  const backup=JSON.parse(fs.readFileSync(file+'.bak'));assert.ok(backup.players[p.id]);
  fs.writeFileSync(file,'corrupt-primary');
  s=await start(t,dir);const login=await request(s.url,{t:'login',name:p.name,pass:'test-secret'});
  assert.equal(login.t,'welcome');assert.equal(login.me.id,p.id);await stop(s);
  assert.equal(JSON.parse(fs.readFileSync(file)).players[p.id].name,p.name);
  assert.ok(fs.readdirSync(dir).some(n=>n.includes('.corrupt-')));
});
test('actual production startup with corrupt saves fails without changing bytes',async t=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'pirates-corrupt-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  const file=path.join(dir,'world.json');fs.writeFileSync(file,'bad-main');fs.writeFileSync(file+'.bak','bad-backup');
  await assert.rejects(start(t,dir,{ALLOW_NEW_WORLD:'1'}),/refusing/);
  assert.equal(fs.readFileSync(file,'utf8'),'bad-main');assert.equal(fs.readFileSync(file+'.bak','utf8'),'bad-backup');
});
test('failed periodic save reports unhealthy, retries dirty data and clears health failure',async t=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'pirates-retry-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  const s=await start(t,dir,{ALLOW_NEW_WORLD:'1'});
  const first=await request(s.url,{t:'register',name:'RetryCaptain',pass:'test-secret'});
  assert.equal(first.t,'welcome');
  const obstruction=path.join(dir,'world.json.bak.tmp');fs.mkdirSync(obstruction);
  async function waitHealth(status){
    const deadline=Date.now()+11000;
    while(Date.now()<deadline){
      if((await fetch(s.health)).status===status)return;
      await new Promise(r=>setTimeout(r,100));
    }
    assert.fail('health never returned '+status);
  }
  await waitHealth(503);
  assert.equal(Object.keys(JSON.parse(fs.readFileSync(path.join(dir,'world.json'))).players).length,0);
  fs.rmdirSync(obstruction);
  await waitHealth(200);
  assert.ok(JSON.parse(fs.readFileSync(path.join(dir,'world.json'))).players[first.me.id]);
  await stop(s);
});
