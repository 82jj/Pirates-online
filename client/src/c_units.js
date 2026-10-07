/* ================= pirate types & island defenders: looks, weapons, props, abilities, special AIs ================= */
const BONE_C=0xD8D0BC;
/* ---- extra hand weapons (hand-local: fist centre at y=-.078, forward along +z) ---- */
(()=>{const steel=C(0xCDD3DA),steelD=C(0x7E868E),dark=C(0x2A2A2E),wood=C(0x5A3A22),woodL=C(0x8A6440),brass=C(0xC9A04A),rope=C(0xB8A47A),bone=C(BONE_C),F=-.078;
  const b=(geo,col,m)=>{const g=geo.clone();if(m)g.applyMatrix4(m);return paintG(g,()=>col);};
  const Z=(r0,r1,len,seg)=>new THREE.CylinderGeometry(r1,r0,len,seg||8).rotateX(Math.PI/2);
  const cone=(r,h,s)=>new THREE.ConeGeometry(r,h,s||8).rotateX(Math.PI/2);
  WEAPG.spear=[b(Z(.015,.013,2.1),wood,mk(0,F,.55)),b(cone(.03,.26,6),steel,mk(0,F,1.72)),b(new THREE.BoxGeometry(.008,.17,.15),steel,mk(0,F+.075,1.5)),b(new THREE.BoxGeometry(.008,.07,.07),steelD,mk(0,F-.05,1.5))];
  WEAPG.fork=[b(Z(.014,.012,1.6),woodL,mk(0,F,.5)),b(new THREE.BoxGeometry(.17,.014,.016),dark,mk(0,F,1.3))].concat([-.075,0,.075].map(x=>b(Z(.007,.005,.32),dark,mk(x,F,1.46))));
  WEAPG.axe=[b(Z(.026,.022,1.15),wood,mk(0,F,.36)),b(new THREE.BoxGeometry(.035,.32,.2),steelD,mk(0,F+.12,.84)),b(new THREE.BoxGeometry(.04,.38,.035),steel,mk(0,F+.12,.95)),b(new THREE.BoxGeometry(.045,.09,.1),steelD,mk(0,F-.06,.84))];
  WEAPG.harpoon=[b(Z(.013,.012,1.75),woodL,mk(0,F,.52)),b(cone(.032,.22,6),steel,mk(0,F,1.5)),b(new THREE.BoxGeometry(.006,.06,.014),steel,mk(0,F+.03,1.37,.7,0,0)),b(new THREE.BoxGeometry(.006,.06,.014),steel,mk(0,F-.03,1.37,-.7,0,0)),
    b(new THREE.TorusGeometry(.07,.013,6,14),rope,mk(0,F-.13,-.06,0,Math.PI/2,0))];
  WEAPG.torch=[b(Z(.022,.016,.52),wood,mk(0,F,.16)),b(Z(.034,.038,.12),C(0x3A2416),mk(0,F,.45)),b(cone(.05,.2,8),C(0xFF8A2A),mk(0,F,.6)),b(cone(.03,.15,8),C(0xFFD860),mk(0,F,.58))];
  WEAPG.knife=[b(new THREE.ConeGeometry(.022,.22,4).rotateX(Math.PI/2).scale(.3,1,1),steel,mk(0,F,.19)),b(Z(.012,.011,.1),wood,mk(0,F,0)),b(new THREE.BoxGeometry(.05,.012,.012),brass,mk(0,F,.06))];
  WEAPG.blunder=[b(Z(.017,.046,.56),brass,mk(0,F+.01,.42)),b(new THREE.BoxGeometry(.04,.06,.42),wood,mk(0,F-.02,.02)),b(new THREE.BoxGeometry(.046,.12,.16),wood,mk(0,F-.06,-.24,.25,0,0))];
  WEAPG.bomb=[b(new THREE.SphereGeometry(.075,10,8),C(0x1A1A1E),mk(0,F,.07)),b(Z(.007,.006,.07),rope,mk(0,F,.16)),b(new THREE.SphereGeometry(.014,6,4),C(0xFFD860),mk(0,F,.2))];
  WEAPG.staff=[b(Z(.022,.016,1.6),C(0x3A2416),mk(0,F,.45)),b(new THREE.SphereGeometry(.066,10,8).scale(1,.95,1.15),bone,mk(0,F,1.31)),b(new THREE.SphereGeometry(.016,6,4),C(0x0A0806),mk(.024,F+.02,1.37)),b(new THREE.SphereGeometry(.016,6,4),C(0x0A0806),mk(-.024,F+.02,1.37)),
    b(new THREE.BoxGeometry(.006,.14,.035),C(0xB8261F),mk(.05,F+.06,1.2,0,0,-.5)),b(new THREE.BoxGeometry(.006,.14,.035),C(0x2E8A4A),mk(-.05,F+.06,1.2,0,0,.5)),b(new THREE.BoxGeometry(.006,.12,.03),C(0x1A1A1A),mk(0,F+.08,1.18))];
  WEAPG.cleaver=[b(Z(.013,.012,.13),wood,mk(0,F,0)),b(new THREE.BoxGeometry(.006,.1,.17),steel,mk(0,F+.035,.15))];
  WEAPG.bucket=[b(new THREE.CylinderGeometry(.078,.062,.16,12,1,true),C(0x6A4A2A),mk(0,F-.2,.02)),b(new THREE.CylinderGeometry(.062,.062,.008,12),C(0x5A3A1E),mk(0,F-.28,.02)),b(new THREE.TorusGeometry(.075,.006,4,12,Math.PI),dark,mk(0,F-.12,.02))];
  WEAPG.stick=[b(Z(.009,.006,.38),woodL,mk(0,F,.14)),b(new THREE.SphereGeometry(.013,6,4),woodL,mk(0,F,.33))];
  WEAPG.hook=[b(Z(.012,.011,.12),dark,mk(0,F,.04)),b(new THREE.TorusGeometry(.05,.009,6,14,Math.PI*1.35),steelD,mk(0,F+.05,.15,0,Math.PI/2,Math.PI*.5)),b(new THREE.ConeGeometry(.012,.04,5),steel,mk(0,F+.1,.12,1.6,0,0))];
  WEAPG.bag=[b(new THREE.BoxGeometry(.2,.13,.09),C(0x2A1A10),mk(0,F-.16,.03)),b(new THREE.BoxGeometry(.04,.02,.095),brass,mk(0,F-.1,.03)),b(new THREE.TorusGeometry(.04,.007,4,10,Math.PI),C(0x2A1A10),mk(0,F-.09,.03))];
  WEAPG.pole=[b(new THREE.CylinderGeometry(.016,.018,2.3,8),woodL,mk(0,F+.72,0)),b(new THREE.SphereGeometry(.03,8,6),brass,mk(0,F+1.88,0))];
  WEAPG.chart=[b(new THREE.CylinderGeometry(.028,.028,.34,10).rotateZ(Math.PI/2),C(0xE8DCB8),mk(0,F,.05)),b(new THREE.CylinderGeometry(.03,.03,.02,10).rotateZ(Math.PI/2),C(0xA8261F),mk(0,F,.05))];
})();
/* ---- looks: each type starts from a base outfit and changes it ---- */
const UT_BASE={rifle:'musket',sword:'sword',gunner:'gunner',repair:'repair',lookout:'lookout',dual:'sword',armored:'sword',giant:'sword',hook:'sword',assassin:'sword'};
const UNIT_LOOK={
  sailor:o=>{o.lw='none';},sword:o=>{},rifle:o=>{},repair:o=>{},lookout:o=>{o.hat='band';},
  dual:o=>{o.lw='sword';o.hat='band';o.hatC=C(0x1E1E1E);o.sash=C(0x2E4A7A);o.coat=null;o.vest=C(0x2A2A2A);o.muscle=1.08;},
  gunner:o=>{o.rw='blunder';o.lw='none';o.shirt=C(0x8A8070);o.hatC=C(0x3A3A3A);o.props=['bombs'];},
  doctor:o=>{o.coat=C(0x161414);o.coatLong=true;o.trim=null;o.vest=null;o.sash=null;o.shirt=C(0xD8D0BC);o.hat='tri';o.hatC=C(0x0E0C0B);o.rw='bag';o.lw='none';o.beard='none';o.props=['beak'];o.boots='tall';o.bootC=C(0x141210);},
  cook:o=>{o.coat=null;o.vest=null;o.shirt=C(0xEDE8DC);o.shirtSleeve='rolled';o.apron=C(0xF2EEE4);o.sash=null;o.hat='none';o.props=['chef'];o.build=1.18;o.rw='cleaver';o.lw='none';o.beard=pick(['full','stubble']);},
  looter:o=>{o.coat=null;o.vest=C(0x4A3A2A);o.hat='band';o.hatC=C(0x6A1A1A);o.lw='none';o.props=['sack'];},
  armored:o=>{o.coat=null;o.vest=null;o.sash=null;o.hat='none';o.props=['armor'];o.build=1.1;o.lw='none';o.boots='tall';o.bootC=C(0x1A1612);o.pants=C(0x2A2420);},
  knives:o=>{o.coat=null;o.vest=C(0x1E1E22);o.rw='knife';o.lw='knife';o.hat='band';o.hatC=C(0x14141A);o.props=['knives'];o.build=.95;},
  drummer:o=>{o.coat=C(0x8E2A22);o.coatLong=false;o.trim=C(0xD9B34A);o.hat='tri';o.hatC=C(0x16120F);o.rw='stick';o.lw='stick';o.props=['drum'];},
  hook:o=>{o.lw='hook';o.coat=C(0x3B2A1E);o.coatLong=true;o.patch=true;o.hat='tri';o.hatC=C(0x1B1714);},
  bomber:o=>{o.coat=null;o.vest=null;o.shirt=C(0x6A6458);o.rw='bomb';o.lw='none';o.hat='band';o.hatC=C(0x2A2A2A);o.props=['bombs'];},
  navigator:o=>{o.coat=C(0x1F2A44);o.coatLong=true;o.trim=C(0xC9A04A);o.hat='tri';o.hatC=C(0x141418);o.rw='chart';o.lw='none';o.beard='goatee';},
  bearer:o=>{o.coat=C(0x2A1E16);o.coatLong=true;o.trim=C(0xB8862A);o.rw='pole';o.lw='none';o.hat='band';o.hatC=C(0x111111);o.build=1.06;},
  fire:o=>{o.coat=null;o.vest=C(0x3A1E14);o.rw='torch';o.lw='none';o.hat='band';o.hatC=C(0x8A2A12);o.shirt=C(0x5A4A3A);o.props=['bombs'];},
  harpoon:o=>{o.coat=C(0x4A5A3A);o.coatLong=true;o.trim=null;o.rw='harpoon';o.lw='none';o.hat='band';o.hatC=C(0x2A3A4A);o.beard='full';o.build=1.08;},
  spy:o=>{o.coat=C(0x2A2C30);o.coatLong=true;o.trim=null;o.hat='scarf';o.hatC=C(0x24262A);o.rw='knife';o.lw='none';o.sash=null;o.beard='none';},
  assassin:o=>{o.coat=null;o.vest=C(0x121214);o.shirt=C(0x1A1A1E);o.pants=C(0x121214);o.hat='scarf';o.hatC=C(0x0E0E10);o.rw='knife';o.lw='knife';o.sash=C(0x5A1212);o.beard='none';o.props=['mask'];o.bootC=C(0x0E0E10);},
  diver:o=>{o.coat=null;o.vest=null;o.sash=null;o.shirt=o.skin;o.shirtSleeve='rolled';o.pants=C(0x2A3A44);o.boots='shoe';o.bootC=o.skin;o.hat='none';o.rw='knife';o.lw='none';o.props=['goggles'];o.muscle=1.1;},
  tamer:o=>{o.coat=null;o.vest=C(0x6A5A2A);o.hat='straw';o.rw='sword';o.lw='none';o.props=['parrot'];},
  voodoo:o=>{o.coat=null;o.vest=null;o.skin=C(pick([0x5E3A26,0x4A2E1E]));o.shirt=o.skin;o.shirtSleeve='rolled';o.sash=C(0x6A1A5A);o.pants=C(0x3A2A1A);o.hat='none';o.hairStyle='long';o.beard='goatee';o.rw='staff';o.lw='none';o.props=['voodoo'];o.boots='shoe';o.bootC=o.skin;},
  giant:o=>{o.coat=null;o.vest=null;o.shirt=o.skin;o.shirtSleeve='rolled';o.sash=C(0x5A3A22);o.scale=1.2;o.build=1.42;o.muscle=1.5;o.baggy=.02;o.beard='full';o.hat='none';o.hairStyle='short';o.rw='axe';o.lw='none';o.props=['fur'];},
};
function SKEL_LOOK(o,role){Object.assign(o,{skin:C(BONE_C),hair:C(BONE_C),hairStyle:'short',beard:'none',shirt:C(0x2A2622),shirtSleeve:'rolled',vest:null,coat:null,sash:Math.random()<.5?C(0x5A1A14):null,pants:C(0x3A3630),baggy:.004,
  boots:'shoe',bootC:C(BONE_C),hat:Math.random()<.4||role==='tguard'?'tri':'none',hatC:C(0x1A1612),rw:'sword',lw:'none',build:.86,muscle:.62,earring:false,patch:false,props:['ribs'],skel:true,scale:.85});}
const DEF_LOOK={
  guard:o=>{o.rw='spear';o.lw='none';o.hat='none';o.props=['armor'];},
  crew:o=>{o.coat=null;o.vest=C(0x2A3A5A);o.shirtSleeve='rolled';o.hat='band';o.hatC=C(0x2A3A5A);o.crossbelt=false;o.rw='sword';o.lw='none';},
  wallgun:o=>{o.rw='musket';o.lw='none';},
  firemen:o=>{o.hair=C(pick([0x16100C,0x3E2A1A,0x5A4632]));o.coat=null;o.vest=null;o.crossbelt=false;o.apron=C(0x6A4A2A);o.shirt=C(0xC9C2B0);o.hat='none';o.props=['lhelm'];o.rw='bucket';o.lw='none';},
  gdiver:o=>{o.hair=C(pick([0x16100C,0x241810,0x3E2A1A]));o.coat=null;o.vest=null;o.crossbelt=false;o.shirt=o.skin;o.shirtSleeve='rolled';o.pants=C(0x22303A);o.boots='shoe';o.bootC=o.skin;o.hat='none';o.props=['goggles'];o.rw='knife';o.lw='none';},
  cavalry:o=>{o.rw='sword';o.lw='none';o.boots='tall';o.props=['feather'];},
};
let LAST_OUTFIT=null;
const _outfitFor=outfitFor;
outfitFor=function(kind,role){let o;
  if(kind==='pirate'&&UNIT_LOOK[role]){o=_outfitFor('pirate',UT_BASE[role]||'sailor');UNIT_LOOK[role](o);}
  else if(kind==='skeleton'){o=_outfitFor('pirate','sailor');SKEL_LOOK(o,role);}
  else if(kind==='defender'){o=_outfitFor('soldier',role==='wallgun'?'musket':'sword');(DEF_LOOK[role]||(()=>{}))(o);}
  else if(kind==='villager'&&role==='fighters'){o=_outfitFor(Math.random()<.85?'villager':'villagerF','none');o.rw=pick(['fork','fork','sword','cleaver','torch']);o.lw='none';}
  else o=_outfitFor(kind,role);
  if(o.F)o.beard='none';LAST_OUTFIT=o;return o;};
/* ---- props: extra skinned parts merged into the same draw call ---- */
const PG={};function propGeo(k,f){return PG[k]||(PG[k]=f());}
const HM_=mk(0,1.61,0);
function HD(S,g,col,m){S.add(g,m?mm(HM_,m):HM_,C(col),5,.15,true);}
function BD(S,g,col,wf,m){S.add(g,m||null,C(col),wf==null?W_TORSO2:wf,.25,true);}
function lerpPts(p,t){const n=p.length-1,f=clamp(t,0,1)*n,i=Math.min(n-1,Math.floor(f)),k=f-i;return[p[i][0]+(p[i+1][0]-p[i][0])*k,p[i][1]+(p[i+1][1]-p[i][1])*k];}
const PROPS={
  armor:(S,o,TOR)=>{const st=0xA9B0B8;BD(S,torsoShell(TOR,.024,1.0,1.45),st,W_BODY2);BD(S,torsoShell(TOR,.03,.86,1.0),0x8E959D,W_BODY2);
    for(const s of[-1,1])BD(S,propGeo('pauld',()=>new THREE.SphereGeometry(.088,12,8,0,Math.PI*2,0,Math.PI*.55)),st,3,mk(s*.19,1.43,-.01,0,0,-s*.38));
    HD(S,propGeo('morion',()=>new THREE.SphereGeometry(.104,16,10,0,Math.PI*2,0,Math.PI*.55).scale(1,.92,1.14)),st,mk(0,.118,0));
    HD(S,propGeo('morionB',()=>new THREE.CylinderGeometry(.16,.16,.012,28).scale(1,1,1.32)),0x9AA2AA,mk(0,.12,0));HD(S,propGeo('morionC',()=>new THREE.BoxGeometry(.012,.07,.2)),0x9AA2AA,mk(0,.2,0));},
  beak:(S)=>{HD(S,propGeo('beak',()=>new THREE.ConeGeometry(.032,.18,10).rotateX(Math.PI/2)),0xE8DCC0,mk(0,.066,.175));
    for(const s of[-1,1]){HD(S,propGeo('lens',()=>new THREE.SphereGeometry(.018,8,6).scale(1,1,.5)),0x1A2A2A,mk(s*.032,.1,.097));HD(S,propGeo('rim',()=>new THREE.TorusGeometry(.019,.004,6,12)),0xC9A04A,mk(s*.032,.1,.098));}},
  chef:(S)=>{HD(S,propGeo('chefA',()=>new THREE.CylinderGeometry(.078,.074,.1,18)),0xF4F1EA,mk(0,.19,0));HD(S,propGeo('chefB',()=>new THREE.SphereGeometry(.105,14,8).scale(1,.55,1)),0xF4F1EA,mk(0,.255,0));},
  sack:(S,o,TOR)=>{BD(S,propGeo('sack',()=>new THREE.SphereGeometry(.16,12,10).scale(1,1.25,.75)),0x9A8256,3,mk(0,1.22,-.21));BD(S,propGeo('sackT',()=>new THREE.TorusGeometry(.05,.014,6,12).rotateX(Math.PI/2)),0x6A5434,3,mk(0,1.41,-.2));
    BD(S,strap(TOR,[[.13,1.46],[.05,1.3],[-.04,1.12]],.012,.012),0x5A4630);},
  drum:(S,o,TOR)=>{const x=.15,y=.86,z=.17;BD(S,propGeo('drumB',()=>new THREE.CylinderGeometry(.15,.15,.17,18,1,true)),0x8E2A22,1,mk(x,y,z));
    for(const dy of[-.088,.088])BD(S,propGeo('drumT',()=>new THREE.CylinderGeometry(.152,.152,.012,18)),0xEDE2C8,1,mk(x,y+dy,z));
    for(const dy of[-.08,.08])BD(S,propGeo('drumR',()=>new THREE.TorusGeometry(.153,.008,4,18).rotateX(Math.PI/2)),0xC9A04A,1,mk(x,y+dy,z));
    BD(S,strap(TOR,[[-.13,1.46],[0,1.24],[.13,1.0]],.014,.012),0xEDE6D4);},
  bombs:(S,o,TOR)=>{const pts=[[.13,1.46],[.04,1.3],[-.05,1.14],[-.13,1.0]];BD(S,strap(TOR,pts,.02,.012),0x3A2416);
    for(let k=0;k<4;k++){const [x,y]=lerpPts(pts,.15+k*.23);BD(S,propGeo('bmb',()=>new THREE.SphereGeometry(.034,8,6)),0x1A1A1E,null,mk(x,y,chestZ(TOR,x,y,.045)));}},
  knives:(S,o,TOR)=>{const pts=[[.13,1.46],[.04,1.3],[-.05,1.14],[-.13,1.0]];BD(S,strap(TOR,pts,.018,.012),0x2A1A10);
    for(let k=0;k<5;k++){const [x,y]=lerpPts(pts,.12+k*.19);BD(S,propGeo('kh',()=>new THREE.BoxGeometry(.014,.075,.014)),0x3A2416,null,mk(x,y+.01,chestZ(TOR,x,y,.03),0,0,.5));
      BD(S,propGeo('kt',()=>new THREE.ConeGeometry(.008,.05,4)),0xCDD3DA,null,mk(x-.02,y-.05,chestZ(TOR,x,y,.03),0,0,.5+Math.PI));}},
  parrot:(S)=>{const x=.175,y=1.5,z=-.015;BD(S,propGeo('pBody',()=>new THREE.SphereGeometry(.046,10,8).scale(1,1.45,1.1)),0x2EA043,3,mk(x,y+.075,z));
    BD(S,propGeo('pHead',()=>new THREE.SphereGeometry(.035,10,8)),0xD8352A,3,mk(x,y+.15,z+.012));BD(S,propGeo('pBeak',()=>new THREE.ConeGeometry(.012,.034,6).rotateX(Math.PI/2+.4)),0xE8D070,3,mk(x,y+.145,z+.05));
    BD(S,propGeo('pTail',()=>new THREE.BoxGeometry(.03,.13,.01)),0x2E6FE0,3,mk(x,y-.01,z-.05,.45,0,0));for(const s of[-1,1])BD(S,propGeo('pWing',()=>new THREE.BoxGeometry(.012,.075,.05)),s>0?0x2E6FE0:0xD8352A,3,mk(x+s*.04,y+.07,z-.01));
    for(const s of[-1,1])BD(S,propGeo('pEye',()=>new THREE.SphereGeometry(.007,6,4)),0x0A0806,3,mk(x+s*.024,y+.16,z+.03));},
  goggles:(S)=>{for(const s of[-1,1]){HD(S,propGeo('gR',()=>new THREE.TorusGeometry(.02,.006,6,12)),0xC9A04A,mk(s*.032,.1,.095));HD(S,propGeo('gL',()=>new THREE.SphereGeometry(.018,8,6).scale(1,1,.4)),0x2A4A5A,mk(s*.032,.1,.094));}
    HD(S,propGeo('gB',()=>new THREE.TorusGeometry(.082,.006,4,24).rotateX(Math.PI/2).scale(1,1,1.16)),0x2A1A10,mk(0,.1,.004));},
  mask:(S)=>{HD(S,propGeo('mask',()=>headShell((x,y,z)=>z<0?0:smoothB(.092,.08,y)*smoothB(-.04,-.028,y),()=>.006)),0x101012);},
  voodoo:(S)=>{BD(S,propGeo('neck',()=>new THREE.TorusGeometry(.115,.011,6,22).rotateX(Math.PI/2).scale(1,1,.85)),0xE8E2D0,3,mk(0,1.465,.01));
    for(let k=0;k<5;k++){const a=-.9+k*.45;BD(S,propGeo('tooth',()=>new THREE.ConeGeometry(.012,.045,5).rotateX(Math.PI)),0xF2EEE2,3,mk(Math.sin(a)*.115,1.44,Math.cos(a)*.1+.01));}
    const cols=[0xB8261F,0x1A1A1A,0x2E8A4A,0xB8261F,0x1A1A1A];for(let k=0;k<5;k++){const a=(k-2)*.38;HD(S,propGeo('fth',()=>new THREE.BoxGeometry(.008,.19,.04)),cols[k],mk(Math.sin(a)*.07,.24,-.04-Math.cos(a)*.02,-.35,0,-a*.9));}},
  fur:(S)=>{BD(S,propGeo('fur',()=>new THREE.TorusGeometry(.14,.05,8,18).rotateX(Math.PI/2)),0x5A4030,3,mk(0,1.47,-.01));},
  feather:(S)=>{HD(S,HATG.feather,0xB8261F);},
  lhelm:(S)=>{HD(S,propGeo('lhelm',()=>new THREE.SphereGeometry(.104,14,8,0,Math.PI*2,0,Math.PI*.55).scale(1,.95,1.16)),0x5A3A1E,mk(0,.115,0));HD(S,propGeo('lhB',()=>new THREE.BoxGeometry(.16,.08,.012)),0x4A2E16,mk(0,.06,-.108,.35,0,0));},
  ribs:(S,o,TOR)=>{for(let k=0;k<6;k++){const y=1.38-k*.052,w=.135-k*.006;BD(S,strap(TOR,[[-w,y-.03],[-w*.55,y-.004],[0,y+.006],[w*.55,y-.004],[w,y-.03]],.0105,.014),BONE_C);}BD(S,strap(TOR,[[0,1.42],[0,1.1]],.013,.016),BONE_C);},
};
function mergeSkinned(a,b){const g=new THREE.BufferGeometry();
  for(const k of['position','normal','uv','color','skinIndex','skinWeight']){const A=a.attributes[k],B=b.attributes[k],arr=new A.array.constructor(A.array.length+B.array.length);arr.set(A.array);arr.set(B.array,A.array.length);g.setAttribute(k,new THREE.BufferAttribute(arr,A.itemSize));}
  const n=a.attributes.position.count,ia=a.index.array,ib=b.index.array,tot=n+b.attributes.position.count,idx=new(tot>65535?Uint32Array:Uint16Array)(ia.length+ib.length);idx.set(ia);for(let i=0;i<ib.length;i++)idx[ia.length+i]=ib[i]+n;
  g.setIndex(new THREE.BufferAttribute(idx,1));g.boundingSphere=a.boundingSphere;return g;}
function skelFace(g){const P=g.attributes.position,Cc=g.attributes.color,SI=g.attributes.skinIndex;
  for(let i=0;i<P.count;i++){if(SI.getX(i)!==5)continue;const x=P.getX(i),y=P.getY(i),z=P.getZ(i);
    if(z>.06&&(Math.hypot(Math.abs(x)-.031,y-1.711)<.022||Math.abs(x)<.016&&y>1.66&&y<1.735&&z>.09))Cc.setXYZ(i,.04,.03,.03);}Cc.needsUpdate=true;}
const _buildPersonGeo=buildPersonGeo;
buildPersonGeo=function(kind,role){const v=_buildPersonGeo(kind,role),o=LAST_OUTFIT;if(!o)return v;
  if(o.props&&o.props.length){const S=new SBatch(),TOR=torsoSecs(o.F,o.build);for(const pr of o.props)if(PROPS[pr])PROPS[pr](S,o,TOR);if(S.v){const g=mergeSkinned(v.geo,S.geo());v.geo.dispose();v.geo=g;}}
  if(o.skel)skelFace(v.geo);return v;};
/* the flag bearer carries his captain's flag; the torch glows */
const fireGlowMat=new THREE.SpriteMaterial({map:glintTex,color:0xFF9A3A,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,fog:false});
const _makePerson=makePerson;
makePerson=function(kind,role){const p=_makePerson(kind,role);
  if(role==='bearer'){const pp=(typeof myPub==='function'&&myPub())||{flag:SH.defaultFlag()};const fl=makeWaveFlag(flagTexFor(pp));fl.scale.setScalar(.3);fl.position.set(0,1.62,0);fl.rotation.y=Math.PI/2;p.bones[8].add(fl);p.flagM=fl;}
  if(role==='fire'||(p.rw==='torch')){const sp=new THREE.Sprite(fireGlowMat);sp.scale.set(.55,.55,1);sp.position.set(0,-.078,.62);p.bones[8].add(sp);}
  return p;};
/* ---- guard dog: a small quadruped on the shared animal rig ---- */
QK.dog={BH:.58,BZ:.26,neck:[0,.66,.34],HJ:[0,.16,.14],tail:[[0,.66,-.4],[0,.72,-.6]],F:[.09,.52,.27,-.24,-.44],H:[.09,.54,-.27,-.24,-.46],
  gaits:[[0,1.5,.9,1.3,2],[1.5,5,1.8,2,3],[5,99,4.2,2.6,3.6]],hp:70,food:2};
AGEO.dog=[];
function dogGeo(){const q=QK.dog,S=new SBatch(),NB=new SBatch(),bz=q.BZ;
  const W_Q=(x,y,z)=>{if(z>bz*.5)return[2,1,0,0];if(z<-bz*.5)return[3,1,0,0];if(z>bz*.1){const t=smooth(bz*.1,bz*.5,z);return[1,1-t,2,t];}if(z<-bz*.1){const t=smooth(-bz*.1,-bz*.5,z);return[1,1-t,3,t];}return[1,1,0,0];};
  const t0=q.tail[0],W_T=(x,y,z)=>{const d=Math.hypot(y-t0[1],z-t0[2]);if(d<.08)return[3,1-d/.08*.5,6,d/.08*.5];const t=smooth(.1,.25,d);return[6,1-t,7,t];};
  const col=C(pick([0x3A2A1E,0x6A4A2A,0x1A1612,0x8A6A44,0xB89A6A])),dark=col.clone().multiplyScalar(.55),belly=col.clone().lerp(C(0xD8C8A8),.35);
  const body=tube([[0,.6,-.36],[0,.6,-.15],[0,.58,.05],[0,.62,.28]],[.12,.14,.14,.15],12,14);colorize(body,(x,y)=>y<.5?belly:col);S.add(body,null,WHITE,W_Q,.4);
  S.add(SP(.15,12,10).scale(.85,1,1.05),mk(0,.62,.24),col,W_Q,.4);S.add(SP(.13,12,10).scale(.85,.95,1),mk(0,.6,-.3),col,W_Q,.4);
  S.add(tube([[0,.64,-.4],[0,.7,-.55],[0,.76,-.66]],[.035,.028,.012],6,10),null,dark,W_T,.4);
  NB.add(tube([[0,-.04,0],[0,.08,.08],[0,.15,.14]],[.09,.075,.065],10,10),null,col,0,.4);
  NB.add(SP(.085,12,10).scale(1,.95,1.1),mk(0,.17,.17),col,0,.4);NB.add(tube([[0,.16,.23],[0,.14,.33]],[.05,.035],8,8),null,belly,0,.4);
  NB.add(SP(.018,6,4),mk(0,.145,.35),C(0x0A0806),0,.3);for(const s of[-1,1]){NB.add(new THREE.ConeGeometry(.035,.09,5),mk(s*.05,.27,.13,0,0,s*.3),dark,0,.4);NB.add(SP(.012,6,4),mk(s*.04,.2,.245),C(0x0A0806),0,.2);}
  const hj=q.HJ,hl2=hj[0]*hj[0]+hj[1]*hj[1]+hj[2]*hj[2];
  for(let i=0;i<NB.v;i++){const x=NB.p[i*3],y=NB.p[i*3+1],z=NB.p[i*3+2],t=(x*hj[0]+y*hj[1]+z*hj[2])/hl2,k=smooth(.72,1.02,t);NB.si[i*4]=4;NB.si[i*4+1]=5;NB.sw[i*4]=1-k;NB.sw[i*4+1]=k;}
  S.addBatch(NB,mk(q.neck[0],q.neck[1],q.neck[2]),[0,1,2,3,4,5]);
  const legB=(fr,pts,r)=>{const lb=new SBatch(),L=pts[pts.length-1][1],W=ramp([[fr[4]-.03,2],[fr[4]+.04,1],[fr[3]-.04,1],[fr[3]+.05,0]]);const g=tube(pts,r,8,10);colorize(g,(x,y)=>y<L*.7?dark:col);lb.add(g,null,WHITE,W,.45);
    lb.add(SP(r[r.length-1]*1.3,8,6).scale(1,.6,1.4),mk(0,L+.01,.02),dark,2,.3);return lb;};
  const Fp=[[0,0,0],[0,-.2,.02],[0,-.36,-.01],[0,-.5,.02]],Hp=[[0,0,0],[0,-.16,-.06],[0,-.32,.03],[0,-.5,.01]];let i=0;
  for(const s of[-1,1])for(const [fr,pts,r] of[[q.F,Fp,[.055,.04,.03,.028]],[q.H,Hp,[.065,.045,.03,.028]]]){const b0=8+i*3;S.addBatch(legB(fr,pts,r),mk(s*fr[0],fr[1],fr[2]),[b0,b0+1,b0+2]);i++;}
  const geo=S.geo();geo.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,.5,0),1.4);return geo;}
const _buildAnimalGeo=buildAnimalGeo;buildAnimalGeo=function(kind){return kind==='dog'?dogGeo():_buildAnimalGeo(kind);};
const animalFlashMat=animalMat.clone();animalFlashMat.emissive=new THREE.Color(0x8A2414);animalFlashMat.emissiveIntensity=1;
const stealthMat=personMat.clone();stealthMat.transparent=true;stealthMat.opacity=.26;stealthMat.depthWrite=false;
/* ---- unit stats & abilities ---- */
const ABIL={doctor:'heal',cook:'regen',drummer:'haste',bearer:'guard',voodoo:'curse',firemen:'mend',hook:'hook'};
function setupUnit(u,t,hpK){const d=SH.unitDef(t)||SH.AUNITS[t]||{hp:100,dmg:1};u.utype=t;
  u.max=u.hp=Math.round((d.hp||100)*(hpK||1));u.dmg=d.dmg||1;u.armor=d.armor||0;u.spdK=d.spd||1;u.atkK=d.atk||1;
  u.ranged=false;u.throwClip=null;u.rng=0;u.minR=0;u.reloadT=0;u.pool=null;u.aura=ABIL[t]||null;u.abT=Math.random();u.stealth=!!d.stealth;u.revealT=0;u.climb=t==='hook';
  if(t==='rifle'||t==='wallgun'){u.ranged=true;u.rng=t==='wallgun'?36:32;u.reloadT=5.5;}
  else if(t==='gunner'){u.ranged=true;u.rng=18;u.reloadT=5;}
  else if(t==='harpoon'){u.ranged=true;u.rng=22;u.reloadT=6;}
  else if(d.k==='thrown'){u.ranged=true;u.rng=d.rng||14;u.minR=3.2;u.throwClip='throwT';u.reloadT=t==='knives'?1.6:t==='bomber'?4.2:3.8;}
  if(u.rw==='spear'||u.rw==='fork'||t==='harpoon')u.pool=['eThrust','eThrust','eChop','eSlashA'];
  if(t==='giant')u.pool=['eChop','eSlashA','eChop'];
  u.loaded=true;u.reload=0;return u;}
const _mkUnit=mkUnit;mkUnit=function(p,team,x,z,space,ai){_mkUnit(p,team,x,z,space,ai);if(p.utype&&ai!=='captain')setupUnit(p,p.utype);return p;};
function unitSpd(u){return(u.spdK||1)*(u.hasteT>T?1.2:1)*(u.slowT>0?.5:1)*(u.curseT>T?.8:1);}
function healFx(o){const w=new THREE.Vector3();o.g.getWorldPosition(w);w.y+=1.2;puff(w,0x7AF09A,4,.18,1.2,2,.6);}
function unitAuras(list,dt,ctx){
  for(const u of list){
    if(u.state==='dead'){if(u.reviveAt&&T>u.reviveAt){u.reviveAt=0;u.revived=true;u.state='alive';u.hp=Math.round(u.max*.6);u.fall=0;u.deadT=0;u.g.rotation.x=0;u.g.scale.setScalar(u.scale/(u.space.S||1));
      const w=new THREE.Vector3();u.g.getWorldPosition(w);puff(w.add(new THREE.Vector3(0,.5,0)),0x6AFF8A,8,.35,2,2,.8);}continue;}
    if(u.state!=='alive')continue;
    if(u.slowT>0)u.slowT-=dt;
    if(u.burnT>0){u.burnT-=dt;hurt(u,(u.burnDps||5)*dt);if(Math.random()<dt*8){const w=new THREE.Vector3();u.g.getWorldPosition(w);w.y+=1;puff(w,0xFF8A2A,1,.3,.6,1.5,.4);}}
    if(u.stealth&&u.mesh&&u.mesh.material!==personFlashMat)u.mesh.material=u.revealT>T?personMat:stealthMat;
    if(!u.aura)continue;u.abT-=dt;if(u.abT>0)continue;
    const near=(r,foe)=>list.filter(o=>o!==u&&o.state==='alive'&&(foe?o.team!==u.team&&o.ai!=='villager':o.team===u.team)&&Math.hypot(o.x-u.x,o.z-u.z)<r);
    switch(u.aura){
      case'heal':{u.abT=1.5;let best=null,bv=1;for(const o of near(9))if(o.hp<o.max){const f=o.hp/o.max;if(f<bv){bv=f;best=o;}}if(best){best.hp=Math.min(best.max,best.hp+15);healFx(best);}break;}
      case'regen':u.abT=1;for(const o of near(10))if(o.hp<o.max)o.hp=Math.min(o.max,o.hp+2.5);break;
      case'haste':u.abT=.5;for(const o of near(12))o.hasteT=T+1;u.hasteT=T+1;break;
      case'guard':u.abT=.5;for(const o of near(10))o.guardT=T+1;break;
      case'curse':{u.abT=1;for(const o of near(10,true)){o.curseT=T+1.3;hurt(o,3);if(Math.random()<.5){const w=new THREE.Vector3();o.g.getWorldPosition(w);w.y+=1.3;puff(w,0x9A4AE0,2,.25,1,1,.5);}}
        u.raiseT=(u.raiseT==null?5:u.raiseT)-1;if(u.raiseT<=0&&ctx.il){u.raiseT=8;const dd=list.find(o=>o.state==='dead'&&!o.raised&&!o.custom&&o.ai!=='villager'&&o.ai!=='captain'&&Math.hypot(o.x-u.x,o.z-u.z)<16&&o.deadT<12);
          if(dd){dd.raised=true;const s=raiseSkeleton(dd.x,dd.z,u.team);if(s){s.summoned=true;shout(u,'قوموا!');}}}break;}
      case'mend':{u.abT=1;if(!RAID.on||ctx.il!==RAID.il)break;let best=null,bd=40;for(const k in RAID.il.ents){const e=RAID.il.ents[k];if(!e.alive||e.hp>=e.max&&!(e.burnT>0))continue;const d=Math.hypot(e.x-u.x,e.z-u.z);if(d<bd){bd=d;best=e;}}
        if(!u.post0)u.post0=u.post;if(best){u.post={x:best.x+(u.x-best.x)/(bd||1)*((best.r||2)+1.2),z:best.z+(u.z-best.z)/(bd||1)*((best.r||2)+1.2)};
          if(bd<(best.r||2)+3){best.hp=Math.min(best.max,best.hp+18);best.burnT=0;puff(new THREE.Vector3(best.x,best.y+1.5,best.z),0xCFE8F0,4,.4,2,2,.6);}}else if(u.post0)u.post=u.post0;break;}
      case'hook':{u.abT=6+Math.random()*2;const fs=near(14,true).filter(o=>Math.hypot(o.x-u.x,o.z-u.z)>4.5&&!o.custom);if(!fs.length){u.abT=1;break;}const t=fs.sort((a,b)=>(b.ranged?1:0)-(a.ranged?1:0))[0],d=Math.hypot(t.x-u.x,t.z-u.z);
        u.g.rotation.y=Math.atan2(t.x-u.x,t.z-u.z);ropeFx(handPos(u,u.arms[0],.2),t);knock(t,u,-(d-1.8));if(t.state==='alive')stagger(t,.7);shout(u,'تعال هنا!');break;}
    }}}
/* a short rope line for the grappling hook */
const ropeMat=new THREE.LineBasicMaterial({color:0x3A2A1A});const ROPES=[];
function ropeFx(from,t){const g=new THREE.BufferGeometry().setFromPoints([from,new THREE.Vector3(t.x,from.y,t.z)]);const l=new THREE.Line(g,ropeMat);scene.add(l);ROPES.push({l,t:.35});}
function updateRopes(dt){for(let i=ROPES.length-1;i>=0;i--){const r=ROPES[i];r.t-=dt;if(r.t<=0){scene.remove(r.l);r.l.geometry.dispose();ROPES.splice(i,1);}}}
/* ---- hits: armour, banner guard, curse; deaths reported; skeletons get back up near a voodoo priest ---- */
const _hurt=hurt;hurt=function(u,dmg){if(!u||u.state!=='alive')return;if(u.armor)dmg*=1-u.armor;if(u.guardT>T)dmg*=.8;if(u.curseT>T)dmg*=1.15;if(u.stealth)u.revealT=T+2;
  _hurt(u,dmg);if(u.state==='dead')onUnitDead(u);};
function onUnitDead(u){if(u.utype&&u.team===0&&!u.summoned&&typeof noteDeath==='function')noteDeath(u);
  if(u.utype==='skeleton'&&!u.revived&&(u.list||[]).some(o=>o.utype==='voodoo'&&o.team===u.team&&o.state==='alive'&&Math.hypot(o.x-u.x,o.z-u.z)<20))u.reviveAt=T+3;
  if(u.horse){/* the rider falls; cavalryAI handles the rest */}}
const _dmgOf=dmgOf;dmgOf=function(u,a){let d=_dmgOf(u,a);if(u.utype==='assassin'){const t=a.tgt;if(t&&t.g&&Math.abs(wrap(Math.atan2(u.x-t.x,u.z-t.z)-t.g.rotation.y))>1.6)d*=2;}if(u.hasteT>T&&u.ai!=='captain')d*=1.1;return d;};
const _meleeHit=meleeHit;meleeHit=function(u,a){const n=a.hit.length;_meleeHit(u,a);
  if(u.utype==='giant'&&a.hit.length>n&&!a.aoe){a.aoe=true;const c=a.hit[a.hit.length-1];for(const o of u.list||[]){if(o===u||o===c||o.state!=='alive'||o.team===u.team||o.ai==='villager'||o.jump)continue;
      if(Math.hypot(o.x-c.x,o.z-c.z)<2.6){hurt(o,dmgOf(u,a)*.6);knock(o,u,1.2);if(o.state==='alive')stagger(o,.6);}}
    knock(c,u,1.4);shake=Math.max(shake,.12);dust(new THREE.Vector3(c.x,c.space?c.space.y(c.x,c.z)+.2:0,c.z));}};
/* ---- thrown weapons and special shots ---- */
CLIP.throwT={k:[[0,null],[.2,'chop0'],[.34,'chop1'],[.56,null]]};CLIP.throwT.T=.56;
const _tickAct=tickAct;tickAct=function(u,dt){const a=u.act;_tickAct(u,dt);if(!a)return;
  if(a.name==='throwT'&&!a.fired&&a.t>=.3){a.fired=true;unitThrow(u,a.tgt);}
  if(u.stealth&&a.c.hit&&a.t>=a.c.hit[0])u.revealT=T+2.5;};
const UPROJ=[];
const steelMat=new THREE.MeshStandardMaterial({color:0xCDD3DA,metalness:.7,roughness:.3}),bombMat=new THREE.MeshStandardMaterial({color:0x1A1A1E,roughness:.6}),
  fireMat=new THREE.MeshBasicMaterial({color:0xFF8A2A}),harpMat=new THREE.MeshStandardMaterial({color:0x8A6440,roughness:.8});
const knifeGeo=new THREE.BoxGeometry(.04,.02,.32),harpGeo=new THREE.CylinderGeometry(.025,.025,1.5,6).rotateX(Math.PI/2),bombGeo=new THREE.SphereGeometry(.16,10,8);
function uLob(from,to,o){const m=new THREE.Mesh(o.geo||bombGeo,o.mat||bombMat);m.position.copy(from);scene.add(m);const d=from.distanceTo(to);
  UPROJ.push({m,from:from.clone(),to:to.clone(),t:0,T:o.T||clamp(d/(o.v||22),.2,2),arc:o.arc==null?Math.max(1.5,d*.3):o.arc,o,last:from.clone()});}
function updateUProj(dt){for(let i=UPROJ.length-1;i>=0;i--){const q=UPROJ[i];q.t+=dt;const k=Math.min(1,q.t/q.T);q.last.copy(q.m.position);
  q.m.position.lerpVectors(q.from,q.to,k);q.m.position.y+=Math.sin(k*Math.PI)*q.arc;
  if(q.o.spin)q.m.rotation.x+=dt*20;else{_v1.copy(q.m.position).multiplyScalar(2).sub(q.last);q.m.lookAt(_v1);}
  if(q.o.trail&&Math.random()<.6)puff(q.m.position.clone(),q.o.trail,1,.22,.3,.3,.3);
  if(k>=1){scene.remove(q.m);UPROJ.splice(i,1);try{q.o.onHit(q.to);}catch(e){console.error(e);}}}}
const _v1=new THREE.Vector3();
function tgtPoint(t){return new THREE.Vector3(t.x,(t.space?t.space.y(t.x,t.z):0)+1,t.z).applyMatrix4(t.space&&t.space.type==='ship'?t.space.s.mesh.matrixWorld:I4);}
function aoeHit(list,team,p,r,dmg,burn){for(const o of list){if(o.team===team||o.state!=='alive'||o.ai==='villager'||o.jump)continue;const w=new THREE.Vector3();o.g.getWorldPosition(w);const d=Math.hypot(w.x-p.x,w.z-p.z);
    if(d<r){hurt(o,dmg*(1-d/r*.5));knock(o,{x:o.x-(w.x-p.x),z:o.z-(w.z-p.z)},.6);if(burn){o.burnT=4;o.burnDps=burn;}if(o.state==='alive'&&!o.act)startAct(o,'hit');}}}
function structAoe(p,r,dmg,burn){if(!RAID.on)return;const il=RAID.il;for(const k in il.ents){const e=il.ents[k];if(!e.alive||e.hidden&&!e.show||e.spot==='water'||e.spot==='harbor')continue;
    if(Math.hypot(e.x-p.x,e.z-p.z)<(e.r||2)+r){damageEnt(e,dmg);if(burn&&e.kind==='bld'){e.burnT=7;e.burnDps=burn;}}}
  for(const w of il.walls)if(w.alive&&Math.hypot(w.x-p.x,w.z-p.z)<2.5+r)damageWall(w,dmg);}
function unitThrow(u,t){if(!t||t.state!=='alive'||u.state!=='alive')return;const from=handPos(u,u.arms[1],.3),to=tgtPoint(t),d=SH.unitDef(u.utype)||{},list=u.list||[];
  if(u.utype==='knives')uLob(from,to,{geo:knifeGeo,mat:steelMat,arc:.5,v:30,spin:true,onHit:p=>{if(t.state==='alive'&&!(t.iframe>0)&&tgtPoint(t).distanceTo(p)<1.8){hurt(t,16*(u.dmg||1));t.flash=.1;if(t.state==='alive'&&!t.act)startAct(t,'hit');}else dust(p);}});
  else if(u.utype==='fire')uLob(from,to,{geo:bombGeo,mat:fireMat,v:16,trail:0xFF8A2A,onHit:p=>{puff(p,0xFF8A2A,9,.7,3,3,.7);puff(p,0x5A5550,4,1,2,2,1.1);aoeHit(list,u.team,p,3,22*(u.dmg||1),d.burn||6);structAoe(p,3,24*(d.bld||2),d.burn||6);}});
  else uLob(from,to,{geo:bombGeo,mat:bombMat,v:16,trail:0xFFC060,onHit:p=>{boom(p);aoeHit(list,u.team,p,d.aoe||4,40*(u.dmg||1));structAoe(p,d.aoe||4,40*(d.bld||3));}});}
const _aiShot=aiShot;aiShot=function(u,t){if(!t||t.state!=='alive'||u.state!=='alive')return;
  if(u.utype==='harpoon'){const from=handPos(u,u.arms[1],.6),to=tgtPoint(t);uLob(from,to,{geo:harpGeo,mat:harpMat,arc:.8,v:34,onHit:p=>{if(t.state==='alive'&&tgtPoint(t).distanceTo(p)<2.2){hurt(t,30*(u.dmg||1));t.flash=.12;
      const dd=Math.hypot(t.x-u.x,t.z-u.z);if(t.state==='alive'&&!t.custom){knock(t,u,-Math.max(0,dd-2.2)*.7);stagger(t,.5);}}else splash(p);}});return;}
  if(u.utype==='gunner'){const mz=handPos(u,u.arms[1],.7);puff(mz,0xFFB040,4,.45,1.5,1,.2);puff(mz,0xCFCAC0,9,.7,2,1.4,1.4);const p=tgtPoint(t);
    for(const o of u.list||[]){if(o.team===u.team||o.state!=='alive'||o.ai==='villager')continue;const w=tgtPoint(o),dd=w.distanceTo(p);if(dd<2.6&&Math.random()<.8){hurt(o,26*(u.dmg||1)*(1-dd/4));o.flash=.1;if(o.state==='alive'&&!o.act)startAct(o,'hit');}}return;}
  _aiShot(u,t);};
/* ---- special AIs: dogs, cavalry on horseback, riflemen on the walls ---- */
const _cv=new THREE.Vector3();
function makeDogUnit(il,x,z,team){const a=makeAnimal('dog');a.il=il;a.utype='dog';a.x=x;a.z=z;mkUnit(a,team,x,z,il.space,'dog');a.scale=.5;a.custom=dogAI;a.cd=0;a.act=null;scene.add(a.g);placeAnimal(a,0);return a;}
function dogAI(u,dt,ctx,list,i){
  if(u.state==='dead'){u.deadT+=dt;u.dead=u.deadT+.01;placeAnimal(u,dt);u.g.rotation.z=Math.min(1,u.deadT*2)*Math.PI/2;if(u.deadT>15){scene.remove(u.g);list.splice(i,1);}return;}
  u.cd-=dt;u.stunT=Math.max(0,(u.stunT||0)-dt);if(u.act)tickAct(u,dt);if(u.act&&!u.act.c.hit)u.act=null;applyKnock(u,dt);
  for(const o of list)if(o.stealth&&o.team!==u.team&&o.state==='alive'&&Math.hypot(o.x-u.x,o.z-u.z)<14){if(!(o.revealT>T))shout(u,'هَو! هَو!');o.revealT=T+1.5;}
  let [t,d]=nearestFoe(u,list,u.aggro||50);if(t&&u.post&&Math.hypot(t.x-u.post.x,t.z-u.post.z)>(u.leash||40)+15)t=null;
  let sp=0,face=u.rot;
  if(u.stunT>0){}
  else if(t){face=Math.atan2(t.x-u.x,t.z-u.z);if(d>1.5)sp=d>6?7.5:4;else if(u.cd<=0){u.cd=.85+Math.random()*.4;hurt(t,13*(u.dmg||1));t.flash=.1;if(t.state==='alive'&&!t.act)startAct(t,'hit');u.biteT=.25;}}
  else if(u.post){const dx=u.post.x-u.x,dz=u.post.z-u.z,dd=Math.hypot(dx,dz);if(dd>3){sp=dd>12?5:2;face=Math.atan2(dx,dz);}}
  u.rot+=wrap(face-u.rot)*Math.min(1,dt*8);if(sp>0){const k=sp*unitSpd(u)*dt;u.x+=Math.sin(u.rot)*k;u.z+=Math.cos(u.rot)*k;}
  u.space.clampU(u);u.speed+=(sp-u.speed)*Math.min(1,dt*6);placeAnimal(u,dt);
  if(u.biteT>0){u.biteT-=dt;u.bones[4].rotation.x-=.6*Math.sin(Math.max(0,u.biteT)/.25*Math.PI);}
  if(u.flash>0){u.flash-=dt;u.mesh.material=u.flash>0?animalFlashMat:animalMat;}}
function makeCavalryUnit(il,x,z,team){const p=makePerson('defender','cavalry');p.utype='cavalry';mkUnit(p,team,x,z,il.space,'soldier');const a=makeAnimal('horse');a.il=il;a.x=x;a.z=z;a.state='ride';a.rider=p;
  scene.add(a.g);scene.add(p.g);p.horse=a;p.mount=a;p.custom=cavalryAI;p.legs[0].rotation.set(-1.1,0,-.45);p.legs[1].rotation.set(-1.1,0,.45);return p;}
function cavalryAI(u,dt,ctx,list,i){const a=u.horse;
  if(u.state==='dead'){if(u.mount){u.mount=null;a.rider=null;a.t=5;u.g.rotation.set(0,a.rot,0);u.legs[0].rotation.set(0,0,0);u.legs[1].rotation.set(0,0,0);}
    u.fall=Math.min(1,(u.fall||0)+dt*2.5);u.g.rotation.x=u.fall*Math.PI/2;u.deadT+=dt;placeUnit(u);
    if(a.t>0){a.t-=dt;const k=8*dt;a.x+=Math.sin(a.rot)*k;a.z+=Math.cos(a.rot)*k;if(islandH(a.il,a.x,a.z)<.6)a.rot+=Math.PI*.7;a.speed=8;}else a.speed=0;placeAnimal(a,dt);
    if(u.deadT>15){scene.remove(u.g);scene.remove(a.g);list.splice(i,1);}return;}
  u.cd-=dt;u.stunT=Math.max(0,(u.stunT||0)-dt);tickAct(u,dt);applyKnock(u,dt);
  let [t,d]=nearestFoe(u,list,u.aggro||70);if(t&&u.post&&Math.hypot(t.x-u.post.x,t.z-u.post.z)>(u.leash||60)+20)t=null;u.stance=t&&d<16?1:0;
  let sp=0,face=a.rot;
  if(u.stunT>0){}
  else if(t){face=Math.atan2(t.x-u.x,t.z-u.z);if(d>2.6)sp=d>12?9.5:4;else{sp=.8;if(u.cd<=0&&!u.act){startAct(u,pick(['eSlashA','eSlashB']),{tgt:t});u.cd=1.3+Math.random()*.8;}}}
  else if(u.post){const dx=u.post.x-u.x,dz=u.post.z-u.z,dd=Math.hypot(dx,dz);if(dd>4){sp=dd>15?6:2.5;face=Math.atan2(dx,dz);}}
  a.rot+=wrap(face-a.rot)*Math.min(1,dt*(sp>5?2.5:5));if(sp>0){const k=sp*unitSpd(u)*dt;u.x+=Math.sin(a.rot)*k;u.z+=Math.cos(a.rot)*k;}
  u.space.clampU(u);a.x=u.x;a.z=u.z;a.speed+=(sp-a.speed)*Math.min(1,dt*3);placeAnimal(a,dt);
  a.g.updateMatrixWorld(true);a.bones[1].localToWorld(_cv.set(0,a.seatY,-.1));u.g.position.copy(_cv);u.g.rotation.set(0,a.rot,0);a.g.visible=u.g.visible;}
function wallgunAI(u,dt,ctx,list,i){
  if(u.state==='dead'){u.yOff=Math.max(0,(u.yOff||0)-dt*7);u.fall=Math.min(1,u.fall+dt*2.5);u.g.rotation.x=u.fall*Math.PI/2;u.deadT+=dt;placeUnit(u);if(u.deadT>15){scene.remove(u.g);list.splice(i,1);}return;}
  if(u.wallSeg&&!u.wallSeg.alive&&u.yOff>0){u.yOff=0;hurt(u,45);if(u.state!=='alive')return;}
  tickAct(u,dt);u.reload-=dt;if(!u.loaded&&u.reload<=0)u.loaded=true;u.stunT=Math.max(0,(u.stunT||0)-dt);
  const [t]=nearestFoe(u,list,u.rng||36);u.stance=t?1:0;
  if(t&&u.stunT<=0){u.g.rotation.y+=wrap(Math.atan2(t.x-u.x,t.z-u.z)-u.g.rotation.y)*Math.min(1,dt*6);if(u.loaded&&!u.act){startAct(u,'shootM',{tgt:t});u.loaded=false;u.reload=5+Math.random()*2.5;}}
  placeUnit(u);}
/* ---- landing party: the fighting crew go ashore (bigger party for raids) ---- */
const _fighters=fighters;fighters=function(n,keep){if(!P||!P.online)return _fighters(n,keep);
  const pr={giant:0,armored:1,sword:2,dual:2,hook:3,bearer:3,assassin:3,voodoo:4,doctor:4,drummer:4,bomber:5,fire:5,knives:5,rifle:6,harpoon:6,tamer:6,spy:6,diver:6,gunner:6,looter:7,skeleton:7,cook:8,sailor:9,navigator:10};
  const al=P.crew.filter(q=>q.state==='alive'&&q.role!=='lookout'&&q.role!=='repair'&&!(q.role==='gunner'&&!RAID.on));al.sort((a,b)=>(pr[a.utype]??8)-(pr[b.utype]??8));
  const N=RAID.on?18:10;return al.slice(0,Math.max(0,Math.min(N,P.hp-keep,al.length)));};
/* summoned skeletons do not follow the crew back on board */
const _endFoot=endFoot;endFoot=function(){const pil=land&&land.partyIl;if(pil)for(const u of pil.units.slice())if(u.summoned&&u.team===0){pil.units.splice(pil.units.indexOf(u),1);scene.remove(u.g);puff(new THREE.Vector3(u.x,u.space.y(u.x,u.z)+.5,u.z),0x6AFF8A,6,.3,2,2,.7);}_endFoot();};
/* the captain's sword also breaks buildings, defences and walls during a raid */
const _swingHits=swingHits;swingHits=function(){if(RAID.on&&land&&land.il===RAID.il&&land.cap){const c=land.cap,y=c.g.rotation.y;if(hitStructAt(c.x+Math.sin(y)*1.6,c.z+Math.cos(y)*1.6,1.7,34))return;}_swingHits();};
/* crew killed on deck by cannon fire are reported to the server */
const _damageShip=damageShip;damageShip=function(s,p,dmg,k){if(s!==P||!s.online){_damageShip(s,p,dmg,k);return;}const before=s.crew.filter(q=>q.state==='alive');_damageShip(s,p,dmg,k);
  for(const q of before)if(q.state!=='alive'||!s.crew.includes(q))noteCrewDeath(q);};
/* ---- life on player islands: villagers walk between the buildings ---- */
function spawnAmbient(il,pp){if(il.ambient||!il.baseG||RAID.on&&RAID.il===il)return;const B=il.base,pts=[];
  for(const k in il.ents){const e=il.ents[k];if(e.kind!=='bld')continue;const a=Math.atan2(B.z-e.z,B.x-e.x);pts.push({x:e.x+Math.cos(a)*((e.r||4)*.9+1.5),z:e.z+Math.sin(a)*((e.r||4)*.9+1.5)});}
  if(!pts.length)return;il.ambient=true;pts.push({x:B.x+Math.cos(B.ang)*14,z:B.z+Math.sin(B.ang)*14});il.basePts=pts;il.baseDoors=pts;
  const n=Math.min(12,3+Math.floor((pp&&pp.castle||1)*1.3));
  for(let i=0;i<n;i++){const q=pick(pts),p=makePerson(Math.random()<.5?'villager':'villagerF','none'),u=mkUnit(p,2,q.x+(Math.random()-.5)*4,q.z+(Math.random()-.5)*4,il.space,'villager');
    u.tx=u.x;u.tz=u.z;u.amb=true;u.pts=pts;scene.add(p.g);placeUnit(u);il.units.push(u);u.g.visible=false;}}
function clearAmbient(il){for(const u of il.units.slice())if(u.amb){il.units.splice(il.units.indexOf(u),1);scene.remove(u.g);const j=PEOPLE.indexOf(u);if(j>=0)PEOPLE.splice(j,1);}il.ambient=false;}
