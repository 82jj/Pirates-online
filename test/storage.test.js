'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawnSync}=require('node:child_process');
const {createStore,resolveDataDir}=require('../server/storage');
const fresh=()=>({v:1,seq:2,players:{p1:{id:'p1',name:'Captain',hash:'hash',salt:'salt',tokens:['token'],ships:[{id:'s1'}],res:{gold:1234},bld:{0:{t:'castle',l:3}},def:{},garrison:{}}},names:{captain:'p1'},clans:{},tags:{},slots:{0:'p1'},created:1,season:{n:1,start:1,end:2},feed:[]});
const logger={log(){},warn(){}};
function fixture(t){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'pirates-storage-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));return dir;}
function store(dir,extra={}){return createStore({dir,fresh,logger,...extra});}
test('save and fresh process restart preserve progress, credentials and indexes',t=>{
  const dir=fixture(t),s=store(dir,{allowNew:true}),d=s.load();d.players.p1.res.gold=999;d.players.p1.bld[0].l=4;s.save(d);
  const script="const {createStore}=require('./server/storage'); const s=createStore({dir:process.argv[1],logger:{log(){},warn(){}}}); process.stdout.write(JSON.stringify(s.load()));";
  const child=spawnSync(process.execPath,['-e',script,dir],{cwd:path.join(__dirname,'..'),encoding:'utf8'});
  assert.equal(child.status,0,child.stderr);assert.deepEqual(JSON.parse(child.stdout),d);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir,'world.json.bak'))),fresh());
});
test('recover corrupt primary, preserve evidence and good backup on next save',t=>{
  const dir=fixture(t),s=store(dir,{allowNew:true}),d=s.load();s.save(d);
  fs.writeFileSync(path.join(dir,'world.json'),'{broken');
  const r=store(dir),got=r.load();assert.equal(r.recovered,true);assert.deepEqual(got,d);
  assert.equal(fs.readFileSync(path.join(dir,'world.json'),'utf8'),'{broken');
  got.players.p1.res.gold=777;r.save(got);
  assert.deepEqual(store(dir).load(),got);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir,'world.json.bak'))),d);
  const archive=fs.readdirSync(dir).find(n=>n.includes('.corrupt-'));
  assert.equal(fs.readFileSync(path.join(dir,archive),'utf8'),'{broken');
});
test('missing primary recovers backup',t=>{
  const dir=fixture(t),s=store(dir,{allowNew:true}),d=s.load();s.save(d);
  fs.unlinkSync(path.join(dir,'world.json'));
  const r=store(dir);assert.deepEqual(r.load(),d);r.save(d);assert.deepEqual(store(dir).load(),d);
});
for(const invalid of ['{bad','{}','{"players":{}}',JSON.stringify({...fresh(),players:[]}),JSON.stringify({...fresh(),v:2}),JSON.stringify({...fresh(),players:{p1:{id:'p1'}}})]){
  test('unrecoverable save never initializes over existing data: '+invalid.slice(0,25),t=>{
    const dir=fixture(t);fs.writeFileSync(path.join(dir,'world.json'),invalid);fs.writeFileSync(path.join(dir,'world.json.bak'),invalid);
    assert.throws(()=>store(dir,{allowNew:true}).load(),/refusing/);
    assert.equal(fs.readFileSync(path.join(dir,'world.json'),'utf8'),invalid);
    assert.equal(fs.readFileSync(path.join(dir,'world.json.bak'),'utf8'),invalid);
    assert.equal(fs.readdirSync(dir).length,2);
  });
}
test('empty production directory requires explicit initialization; remnants block it',t=>{
  const dir=fixture(t);assert.throws(()=>store(dir).load(),/refusing/);
  fs.writeFileSync(path.join(dir,'world.json.tmp'),JSON.stringify(fresh()));
  assert.throws(()=>store(dir,{allowNew:true}).load(),/refusing/);
  assert.equal(fs.readdirSync(dir).length,1);
});
test('read errors do not masquerade as missing saves',t=>{
  const dir=fixture(t),io=Object.create(fs);
  io.readFileSync=()=>{const e=new Error('denied');e.code='EACCES';throw e;};
  assert.throws(()=>store(dir,{io,allowNew:true}).load(),/refusing/);assert.deepEqual(fs.readdirSync(dir),[]);
});
test('failed backup rotation does not replace primary; retry succeeds',t=>{
  const dir=fixture(t),initial=store(dir,{allowNew:true}).load(),io=Object.create(fs);
  let fail=true;io.renameSync=(a,b)=>{if(fail&&b.endsWith('.bak'))throw new Error('disk failure');return fs.renameSync(a,b);};
  const s=store(dir,{io}),d=s.load();d.players.p1.res.gold=5;
  assert.throws(()=>s.save(d),/disk failure/);assert.deepEqual(store(dir).load(),initial);
  fail=false;s.save(d);assert.deepEqual(store(dir).load(),d);
});
test('failed primary rename keeps primary and backup readable',t=>{
  const dir=fixture(t),s=store(dir,{allowNew:true}),initial=s.load();s.save(initial);
  const io=Object.create(fs);io.renameSync=(a,b)=>{if(b.endsWith('world.json'))throw new Error('rename failure');return fs.renameSync(a,b);};
  const r=store(dir,{io}),d=r.load();d.players.p1.res.gold=6;
  assert.throws(()=>r.save(d),/rename failure/);assert.deepEqual(store(dir).load(),initial);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir,'world.json.bak'))),initial);
});
test('fsync failure leaves last committed world intact',t=>{
  const dir=fixture(t),initial=store(dir,{allowNew:true}).load(),io=Object.create(fs);
  io.fsyncSync=()=>{throw new Error('sync failure');};
  const s=store(dir,{io}),d=s.load();d.players.p1.res.gold=8;
  assert.throws(()=>s.save(d),/sync failure/);assert.deepEqual(store(dir).load(),initial);
});
test('save refuses if both disk snapshots become corrupt after startup',t=>{
  const dir=fixture(t),s=store(dir,{allowNew:true}),d=s.load();
  fs.writeFileSync(path.join(dir,'world.json'),'broken');
  assert.throws(()=>s.save(d),/refusing save/);assert.equal(fs.readFileSync(path.join(dir,'world.json'),'utf8'),'broken');
});
test('production and Railway never silently fall back or create missing mount',t=>{
  const dir=fixture(t),absent=path.join(dir,'absent');
  assert.throws(()=>resolveDataDir({NODE_ENV:'production'}),/absolute persistent/);
  assert.throws(()=>resolveDataDir({NODE_ENV:'production',DATA_DIR:absent}),/ENOENT/);assert.equal(fs.existsSync(absent),false);
  assert.throws(()=>resolveDataDir({NODE_ENV:'production',DATA_DIR:'relative'}),/absolute/);
  assert.throws(()=>resolveDataDir({RAILWAY_PROJECT_ID:'test',DATA_DIR:dir}),/Volume/);
  assert.throws(()=>resolveDataDir({RAILWAY_PROJECT_ID:'test',DATA_DIR:dir,RAILWAY_VOLUME_MOUNT_PATH:'/wrong'}),/Volume/);
  assert.deepEqual(resolveDataDir({RAILWAY_PROJECT_ID:'test',RAILWAY_VOLUME_MOUNT_PATH:dir}),{dir,production:true});
  const file=path.join(dir,'file');fs.writeFileSync(file,'x');
  assert.throws(()=>resolveDataDir({NODE_ENV:'production',DATA_DIR:file}),/not a directory/);
});
