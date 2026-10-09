'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
function validateWorld(d){
  if(!object(d)||d.v!==1||!Number.isSafeInteger(d.seq)||d.seq<1||
    !['players','names','clans','tags','slots','season'].every(k=>object(d[k]))||
    !Array.isArray(d.feed)||!Number.isFinite(d.created)||
    !['n','start','end'].every(k=>Number.isFinite(d.season[k])))
    throw new Error('Invalid world schema');
  for(const [id,p] of Object.entries(d.players)){
    if(!object(p)||p.id!==id||typeof p.name!=='string'||typeof p.hash!=='string'||
      typeof p.salt!=='string'||!Array.isArray(p.tokens)||!Array.isArray(p.ships)||
      !['res','bld','def','garrison'].every(k=>object(p[k])))
      throw new Error('Invalid player schema');
  }
  return d;
}
function resolveDataDir(env=process.env){
  const railway=!!(env.RAILWAY_ENVIRONMENT_ID||env.RAILWAY_PROJECT_ID);
  const production=env.NODE_ENV==='production'||railway;
  const dir=env.DATA_DIR||(railway?env.RAILWAY_VOLUME_MOUNT_PATH:production?null:path.join(__dirname,'data'));
  if(!dir||!path.isAbsolute(dir))throw new Error('DATA_DIR must be an absolute persistent directory');
  if(railway&&(!env.RAILWAY_VOLUME_MOUNT_PATH||
    path.resolve(dir)!==path.resolve(env.RAILWAY_VOLUME_MOUNT_PATH)))
    throw new Error('Railway Volume must be attached at DATA_DIR (recommended /data)');
  // Never create a missing production mount point on the ephemeral filesystem.
  if(!production)fs.mkdirSync(dir,{recursive:true});
  if(!fs.statSync(dir).isDirectory())throw new Error('DATA_DIR is not a directory');
  fs.accessSync(dir,fs.constants.R_OK|fs.constants.W_OK);
  return {dir,production};
}
function createStore({dir,allowNew=false,fresh,io=fs,logger=console}){
  const file=path.join(dir,'world.json'),backup=file+'.bak';
  let loaded=false,recovered=false;
  function read(f){
    try{return {data:validateWorld(JSON.parse(io.readFileSync(f,'utf8')))};}
    catch(error){return {error,missing:error.code==='ENOENT'};}
  }
  function syncDir(){const fd=io.openSync(dir,'r');try{io.fsyncSync(fd);}finally{io.closeSync(fd);}}
  function atomicWrite(target,text){
    const tmp=target+'.tmp';
    const fd=io.openSync(tmp,'w',0o600);
    try{io.writeFileSync(fd,text);io.fsyncSync(fd);}finally{io.closeSync(fd);}
    io.renameSync(tmp,target);syncDir();
  }
  function load(){
    const main=read(file);
    if(main.data){loaded=true;logger.log('loaded world.json',Object.keys(main.data.players).length,'players');return main.data;}
    const bak=read(backup);
    if(bak.data){loaded=true;recovered=true;logger.warn('Recovered world from world.json.bak; primary retained until next successful save');return bak.data;}
    // Leftover temporary/quarantine files also indicate an existing world.
    const remnants=io.readdirSync(dir).some(n=>n.startsWith('world.json'));
    if(main.missing&&bak.missing&&!remnants&&allowNew){
      const d=validateWorld(fresh());
      // Persist the initial world before the server accepts any player.
      atomicWrite(file,JSON.stringify(d));loaded=true;return d;
    }
    throw new Error('No readable world save; refusing to create/overwrite world. Restore a verified backup. Primary: '+main.error.message+'; backup: '+bak.error.message);
  }
  function save(d){
    if(!loaded)throw new Error('World must be loaded before saving');
    const text=JSON.stringify(validateWorld(d));
    const main=read(file);
    if(main.data){
      // Rotate only a validated snapshot. Backup replacement is atomic too.
      atomicWrite(backup,JSON.stringify(main.data));
    }else{
      const bak=read(backup);
      if(!bak.data)throw new Error('Primary and backup became unreadable; refusing save');
      if(!main.missing){
        // Retain corrupt evidence; never rotate it over the good backup.
        const archive=file+'.corrupt-'+Date.now()+'-'+crypto.randomBytes(6).toString('hex');
        io.copyFileSync(file,archive,fs.constants.COPYFILE_EXCL);
        const fd=io.openSync(archive,'r');try{io.fsyncSync(fd);}finally{io.closeSync(fd);}syncDir();
      }
    }
    atomicWrite(file,text);recovered=false;
  }
  return {load,save,get recovered(){return recovered;}};
}
module.exports={createStore,resolveDataDir,validateWorld};
