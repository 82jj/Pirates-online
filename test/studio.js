/* close-up renders in the real game scene: node studio.js <mode> [tod]
   modes: people, faces, animals, town, nature, sea */
const {open,ev,ff,shot,register,done,sleep}=require('./lib');
const MODE=process.argv[2]||'people',TOD=+(process.argv[3]||.42),W=+process.env.VW||1000,H=+process.env.VH||640,TAG=process.env.TAG||'';
(async()=>{
  const p=await open('S',{width:W,height:H});
  await register(p,'استوديو'+(Date.now()%1000));await ff(p,2);
  await ev(p,`tod=${TOD};document.querySelector('.hud').style.display='none';1`);await ff(p,3);
  /* a camera we control + a list of props we animate ourselves */
  await ev(p,`window.ST={pos:new THREE.Vector3(),at:new THREE.Vector3(),ppl:[],an:[]};
    const rr=renderer.render;renderer.render=function(s,c){c.position.copy(ST.pos);c.lookAt(ST.at);c.updateMatrixWorld();c.updateProjectionMatrix();for(const u of ST.ppl){animPerson(u,.016);}for(const a of ST.an){if(a.custom)a.custom(.016);}rr.call(this,s,c);};
    window.stGround=(x,z)=>{const il=ON.myIsl;return Math.max(0,islandH(il,x,z));};1`);
  const B=await ev(p,`const il=ON.myIsl,B=il.base;JSON.stringify({x:B.x,z:B.z,a:B.ang,hx:il.x,hz:il.z})`);const b=JSON.parse(B);
  /* a clear patch of ground inland from the base: walk from the base toward the island centre */
  const spot=await ev(p,`(()=>{const il=ON.myIsl,B=il.base;const dx=il.x-B.x,dz=il.z-B.z,l=Math.hypot(dx,dz);const x=B.x+dx/l*95,z=B.z+dz/l*95;return JSON.stringify({x,z,ux:dx/l,uz:dz/l,y:stGround(x,z)});})()`);
  const S=JSON.parse(spot);
  if(MODE==='people'||MODE==='faces'){
    await ev(p,`(()=>{const S=${spot},list=[['captain'],['pirate','sailor'],['pirate','sword'],['pirate','musket'],['soldier','sword'],['soldier','musket'],['villager'],['villagerF'],['pirate','repair'],['pirate','lookout']];
      const px=-S.uz,pz=S.ux;list.forEach(([k,r],i)=>{const u=makePerson(k,r);u.state='alive';const o=(i-(list.length-1)/2)*1.25,x=S.x+px*o,z=S.z+pz*o;u.g.position.set(x,stGround(x,z),z);u.g.rotation.y=Math.atan2(-S.ux,-S.uz)+(i%2?-.3:.3);scene.add(u.g);ST.ppl.push(u);});return 1;})()`);
    if(MODE==='people'){await ev(p,`(()=>{const S=${spot};ST.pos.set(S.x-S.ux*9.5,S.y+1.6,S.z-S.uz*9.5);ST.at.set(S.x,S.y+1.0,S.z);return 1;})()`);await sleep(1500);await shot(p,'st_people'+TAG);}
    for(const [i,nm] of [[0,'captain'],[1,'sailor'],[4,'soldier'],[7,'villagerF']]){
      await ev(p,`(()=>{const u=ST.ppl[${i}],S=${spot},y=u.g.rotation.y,fx=Math.sin(y),fz=Math.cos(y),x=u.g.position.x,z=u.g.position.z,gy=u.g.position.y,h=1.62*u.scale;ST.pos.set(x+fx*1.15,gy+h*.93,z+fz*1.15);ST.at.set(x,gy+h*.86,z);return 1;})()`);
      await sleep(900);await shot(p,'st_face_'+nm+TAG);
      await ev(p,`(()=>{const u=ST.ppl[${i}],y=u.g.rotation.y,fx=Math.sin(y),fz=Math.cos(y),x=u.g.position.x,z=u.g.position.z,gy=u.g.position.y;ST.pos.set(x+fx*3.2-fz*.6,gy+1.25,z+fz*3.2+fx*.6);ST.at.set(x,gy+.85,z);return 1;})()`);
      await sleep(900);await shot(p,'st_body_'+nm+TAG);}
  }
  if(MODE==='animals'){
    await ev(p,`(()=>{const S=${spot},px=-S.uz,pz=S.ux;[['horse',-3],['cow',0],['sheep',2.4],['dog',4.2]].forEach(([k,o])=>{if(!QK[k])return;const a=makeAnimal(k);const x=S.x+px*o,z=S.z+pz*o;a.g.position.set(x,stGround(x,z),z);a.g.rotation.y=Math.atan2(px,pz)+.5;scene.add(a.g);});
      ST.pos.set(S.x-S.ux*8,S.y+1.7,S.z-S.uz*8);ST.at.set(S.x,S.y+.9,S.z);return 1;})()`);await sleep(1500);await shot(p,'st_animals'+TAG);
    await ev(p,`(()=>{const S=${spot},px=-S.uz,pz=S.ux,x=S.x+px*-3,z=S.z+pz*-3;ST.pos.set(x-S.ux*3.6+px*2,S.y+1.6,z-S.uz*3.6+pz*2);ST.at.set(x,S.y+1.1,z);return 1;})()`);await sleep(1000);await shot(p,'st_horse'+TAG);
  }
  if(MODE==='nature'){
    await ev(p,`(()=>{const S=${spot};ST.pos.set(S.x-S.ux*4,S.y+1.4,S.z-S.uz*4);ST.at.set(S.x+S.ux*6,S.y+.6,S.z+S.uz*6);return 1;})()`);await sleep(1500);await shot(p,'st_grass'+TAG);
    await ev(p,`(()=>{const il=ON.myIsl;let best=null,bd=1e9;for(const t of il.trees||[]){const d=Math.hypot(t.x-${S.x},t.z-${S.z});if(d<bd){bd=d;best=t;}}if(!best)return 0;const y=stGround(best.x,best.z);ST.pos.set(best.x+9,y+3,best.z+9);ST.at.set(best.x,y+4,best.z);return 1;})()`);await sleep(1200);await shot(p,'st_tree'+TAG);
  }
  if(MODE==='town'){
    /* the nearest NPC colony town */
    await ev(p,`(()=>{let best=null,bd=1e9;for(const il of islands){if(!il.town||il.pl)continue;const d=Math.hypot(il.x-P.x,il.z-P.z);if(d<bd){bd=d;best=il;}}const t=best.town;
      P.x=best.x+(best.r+120);P.z=best.z;window.TT={x:t.x,z:t.z,il:best};return 1;})()`);await ff(p,6);
    await ev(p,`(()=>{const t=TT,il=TT.il,y=Math.max(0,islandH(il,t.x,t.z));ST.pos.set(t.x+26,y+12,t.z+26);ST.at.set(t.x,y+2,t.z);return 1;})()`);await sleep(2500);await shot(p,'st_town'+TAG);
    await ev(p,`(()=>{const t=TT,il=TT.il,y=Math.max(0,islandH(il,t.x,t.z));ST.pos.set(t.x+12,y+2.2,t.z+9);ST.at.set(t.x,y+2.5,t.z);return 1;})()`);await sleep(1500);await shot(p,'st_town2'+TAG);
    /* the player's own base */
    await ev(p,`(()=>{const B=ON.myIsl.base,y=B.h;ST.pos.set(B.x-Math.cos(B.ang)*40+8,y+16,B.z-Math.sin(B.ang)*40+8);ST.at.set(B.x,y+2,B.z);return 1;})()`);await sleep(1500);await shot(p,'st_base'+TAG);
  }
  if(MODE==='sea'){
    await ev(p,`(()=>{ST.pos.set(P.x+14,3,P.z+14);ST.at.set(P.x+40,-1,P.z+40);return 1;})()`);await sleep(1500);await shot(p,'st_sea'+TAG);
  }
  await done();
})().catch(async e=>{console.error('FAIL',e);await done();process.exit(1);});
