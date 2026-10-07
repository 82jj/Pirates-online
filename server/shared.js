/* قراصنة البحر أونلاين — shared rules and catalogs (used by the server and inlined in the client) */
(function(root){
'use strict';
const r0=x=>Math.round(x),r5=x=>Math.round(x/5)*5;
const RES=['gold','wood','iron','food','powder'];
const RES_AR={gold:'ذهب',wood:'خشب',iron:'حديد',food:'طعام',powder:'بارود',pop:'سكان'};
const VERSION=1;
/* ---- world: player islands sit on two rings around the King's waters ---- */
const WORLD_R=9800,SLOTS=120,RING_A=56;
function hashU(i,k){let h=(i*374761393+k*668265263)|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296;}
function slotPos(i){const inA=i<RING_A,n=inA?RING_A:SLOTS-RING_A,j=inA?i:i-RING_A,R=(inA?8150:9150)+(hashU(i,1)-.5)*160;
  const a=(j+(inA?.5:.25)+(hashU(i,2)-.5)*.3)/n*Math.PI*2;return{x:Math.cos(a)*R,z:Math.sin(a)*R,a,r:165+hashU(i,3)*35};}
/* ---- layout: building plots and defence spots around the island's town ---- */
const LAYOUT={plots:38,sea:10,land:14,trap:12,water:4,gate:2,harbor:1,moat:1};
const SPOT_KIND={sea:'sea',land:'land',trap:'trap',water:'water',gate:'gate',harbor:'harbor',moat:'moat'};
/* ---- buildings ---- */
const cst=(g,w,i,e)=>l=>{const o={};if(g)o.gold=r5(g*Math.pow(l,1.55));if(w)o.wood=r5(w*Math.pow(l,1.5));if(i)o.iron=r5(i*Math.pow(l,1.45));if(e)for(const k in e)o[k]=r5(e[k]*Math.pow(l,1.4));return o;};
const BLD={
  castle:{ar:'القلعة',d:'قلب جزيرتك؛ مستواها يحدد مستوى المباني وعددها، وفيها ترفع علمك',max:10,cost:cst(380,320,70),time:l=>r0(10*Math.pow(l,1.55)),pop:l=>10*l,store:l=>800*l,hp:l=>900+450*l,fp:9,fixed:0,prod:{gold:l=>10+8*l}},
  shipyard:{ar:'حوض السفن',d:'تبني فيه السفن وتطوّرها؛ مستواه يحدد أنواع السفن وحجم الأسطول',max:10,cost:cst(200,220,60),time:l=>r0(8*Math.pow(l,1.5)),pop:l=>3,hp:l=>500+200*l,fp:7,fixed:1,count:c=>1},
  house:{ar:'بيت',d:'يزيد عدد السكان، والسكان يزيدون الإنتاج والذهب',max:10,cost:cst(50,70,0),time:l=>r0(4*Math.pow(l,1.45)),pop:l=>8*l,hp:l=>200+80*l,fp:4,count:c=>Math.min(12,2+c)},
  farm:{ar:'مزرعة',d:'تنتج الطعام لسكانك وطاقمك',max:10,cost:cst(55,60,0),time:l=>r0(5*Math.pow(l,1.45)),pop:l=>2+l,prod:{food:l=>9*l},hp:l=>220+80*l,fp:6,count:c=>Math.min(6,1+Math.floor(c/2))},
  sawmill:{ar:'منشرة',d:'تنتج الخشب للمباني والسفن',max:10,cost:cst(70,30,0),time:l=>r0(5*Math.pow(l,1.45)),pop:l=>2+l,prod:{wood:l=>8*l},hp:l=>240+90*l,fp:5,count:c=>Math.min(4,1+Math.floor(c/3))},
  mine:{ar:'منجم',d:'ينتج الحديد للمدافع والدروع',max:10,cost:cst(90,70,0),time:l=>r0(6*Math.pow(l,1.45)),pop:l=>2+l,prod:{iron:l=>4*l},hp:l=>260+90*l,fp:5,req:2,count:c=>c<2?0:Math.min(3,1+Math.floor((c-2)/3))},
  powder:{ar:'مصنع البارود',d:'ينتج البارود للأسلحة؛ إذا انهدم ينفجر على اللي حوله',max:10,cost:cst(100,60,30),time:l=>r0(6*Math.pow(l,1.45)),pop:l=>2+l,prod:{powder:l=>4*l},hp:l=>240+80*l,fp:4,req:2,boom:true,count:c=>c<2?0:(c>=6?2:1)},
  store:{ar:'المخزن',d:'يزيد سعة الموارد ويحمي جزءاً منها من النهب',max:10,cost:cst(80,100,0),time:l=>r0(5*Math.pow(l,1.45)),pop:l=>2,store:l=>1500*l,protect:l=>.04*l,hp:l=>400+150*l,fp:5,count:c=>Math.min(3,1+Math.floor(c/4))},
  tavern:{ar:'الحانة',d:'توظّف فيها القراصنة؛ كل مستوى يفتح أنواعاً جديدة',max:10,cost:cst(120,90,0),time:l=>r0(6*Math.pow(l,1.5)),pop:l=>4+l,hp:l=>350+120*l,fp:6,count:c=>1},
  barracks:{ar:'الثكنة',d:'تدرّب حرّاس الجزيرة وتحدد كم جندي يحرسها',max:10,cost:cst(150,120,40),time:l=>r0(7*Math.pow(l,1.5)),pop:l=>3,army:l=>8+6*l,hp:l=>450+160*l,fp:6,count:c=>1},
  bell:{ar:'جرس الإنذار',d:'إذا انهجمت الجزيرة ياخذ السكان سلاح ويصيرون مقاتلين',max:5,cost:cst(100,40,30),time:l=>r0(6*Math.pow(l,1.5)),pop:l=>1,militia:l=>.06*l,hp:l=>250+100*l,fp:3,count:c=>1},
  lighthouse:{ar:'المنارة',d:'تكشف المهاجمين من بعيد وتزيد مدى أبراجك ومدافعك بالليل',max:5,cost:cst(150,80,40),time:l=>r0(8*Math.pow(l,1.5)),pop:l=>1,hp:l=>300+120*l,fp:4,req:2,count:c=>c<2?0:1},
  vault:{ar:'مخزن الكنز',d:'يحرسه هياكل عظمية تقوم من القبور؛ إذا انكسر ياخذ المهاجم جزءاً من ذهبك',max:5,cost:cst(300,0,100),time:l=>r0(10*Math.pow(l,1.5)),pop:l=>1,guards:l=>2*l,hp:l=>700+250*l,fp:5,req:3,count:c=>c<3?0:1},
};
const BLD_ORDER=['castle','shipyard','house','farm','sawmill','mine','powder','store','tavern','barracks','bell','lighthouse','vault'];
/* ---- defences (spot kind, per-level stats used by the battle simulation) ---- */
const DEF={
  cannon:{ar:'مدفع ساحلي',d:'مداه بعيد وضربته قوية على السفن، بس حشوه بطيء',spot:'sea',max:10,crew:1,cost:cst(160,60,60),time:l=>r0(6*Math.pow(l,1.45)),count:c=>Math.min(6,1+Math.floor(c/2)),
    st:l=>({rng:150+6*l,dmg:9+3.5*l,rate:4.2-.12*l,hp:300+110*l,vs:'ship'})},
  chain:{ar:'مدفع السلاسل',d:'يقطّع الأشرعة ويبطّئ السفن',spot:'sea',max:6,crew:1,req:4,cost:cst(220,80,90),time:l=>r0(8*Math.pow(l,1.45)),count:c=>c<4?0:(c>=8?2:1),
    st:l=>({rng:120+6*l,dmg:4+1.5*l,rate:5,slow:.35+.04*l,hp:300+100*l,vs:'ship'})},
  firecat:{ar:'منجنيق النار',d:'يرمي براميل نار تولّع السفن وتحرق الجنود',spot:'sea',max:6,crew:1,req:5,cost:cst(260,120,60,{powder:20}),time:l=>r0(9*Math.pow(l,1.45)),count:c=>c<5?0:(c>=9?2:1),
    st:l=>({rng:130+5*l,dmg:6+2*l,burn:3+1.2*l,rate:6,hp:280+100*l,vs:'both'})},
  mortar:{ar:'مدفع الهاون',d:'قذائف من فوق تنفجر على مساحة؛ ممتاز ضد المجموعات وضعيف على القريب',spot:'land',max:8,crew:1,req:3,cost:cst(240,60,90,{powder:20}),time:l=>r0(8*Math.pow(l,1.45)),count:c=>c<3?0:Math.min(3,1+Math.floor((c-3)/3)),
    st:l=>({rng:110+5*l,min:14,dmg:14+5*l,aoe:5+.3*l,rate:6-.2*l,hp:320+110*l,vs:'both'})},
  tower:{ar:'برج البنادق',d:'فوقه رماة يضربون اللي ينزلون، سريع ومداه متوسط',spot:'land',max:10,cost:cst(130,90,30),time:l=>r0(6*Math.pow(l,1.45)),count:c=>Math.min(6,1+Math.floor(c/2)),
    st:l=>({rng:34+1.2*l,dmg:6+2.4*l,rate:1.3-.03*l,hp:300+120*l,vs:'unit'})},
  gatling:{ar:'مدفع الطلقات المتعددة',d:'له أكثر من فوهة، يرش رصاصاً سريعاً على القريبين',spot:'land',max:8,crew:1,req:4,cost:cst(260,60,120,{powder:15}),time:l=>r0(8*Math.pow(l,1.45)),count:c=>c<4?0:Math.min(3,1+Math.floor((c-4)/3)),
    st:l=>({rng:22+.8*l,dmg:2.4+.9*l,burst:6,rate:2.6,hp:340+120*l,vs:'unit'})},
  totem:{ar:'طوطم الفودو',d:'يبطّئ المهاجمين حوله ويقوّم جنودك اللي ماتوا هياكل عظمية',spot:'land',max:5,req:6,cost:cst(300,40,60,{food:60}),time:l=>r0(10*Math.pow(l,1.45)),count:c=>c<6?0:(c>=9?2:1),
    st:l=>({rng:14+l,slow:.3+.05*l,raise:11-l,hp:260+100*l,vs:'unit'})},
  oil:{ar:'برج الزيت المغلي',d:'فوق البوابة؛ يحرق اللي يحاولون يكسرونها',spot:'gate',max:6,req:3,cost:cst(180,80,50),time:l=>r0(7*Math.pow(l,1.45)),count:c=>c<3?0:(c>=6?2:1),
    st:l=>({rng:9,dmg:24+9*l,aoe:5,rate:4,hp:380+120*l,vs:'unit'})},
  harbor:{ar:'سلسلة الميناء',d:'سلسلة حديد على مدخل المرفأ؛ ما تدخل السفن لين يكسرونها',spot:'harbor',max:5,req:4,cost:cst(200,60,160),time:l=>r0(8*Math.pow(l,1.45)),count:c=>c<4?0:1,
    st:l=>({hp:500+250*l,vs:'ship'})},
  mines:{ar:'ألغام عايمة',d:'براميل بارود مخفية في الماء تنفجر لما تقرب منها سفينة',spot:'water',max:5,req:3,cost:cst(120,40,20,{powder:40}),time:l=>r0(5*Math.pow(l,1.45)),count:c=>c<3?0:Math.min(4,1+Math.floor((c-3)/2)),
    st:l=>({dmg:35+14*l,n:3,hidden:true,vs:'ship'})},
  pit:{ar:'الحفرة المموهة',d:'يطيح فيها المهاجم وما يطلع إلا بعد ثواني',spot:'trap',max:5,cost:cst(60,40,0),time:l=>r0(3*Math.pow(l,1.4)),count:c=>Math.min(4,1+Math.floor(c/3)),
    st:l=>({stun:2.5+.4*l,dmg:10+5*l,hidden:true,vs:'unit'})},
  net:{ar:'فخ الشبكة',d:'يمسك اللي يدوس عليه ويوقّفه',spot:'trap',max:5,req:3,cost:cst(80,30,10),time:l=>r0(3*Math.pow(l,1.4)),count:c=>c<3?0:Math.min(3,1+Math.floor((c-3)/3)),
    st:l=>({root:3+.5*l,aoe:3,hidden:true,vs:'unit'})},
  keg:{ar:'برميل البارود المدفون',d:'ينفجر على أول مجموعة تمر',spot:'trap',max:5,req:2,cost:cst(70,10,10,{powder:30}),time:l=>r0(3*Math.pow(l,1.4)),count:c=>c<2?0:Math.min(3,1+Math.floor((c-2)/3)),
    st:l=>({dmg:45+18*l,aoe:4.5,hidden:true,vs:'unit'})},
  spikes:{ar:'حقل الأوتاد',d:'يجرح ويبطّئ اللي يمشي فيه',spot:'trap',max:5,req:4,cost:cst(90,60,20),time:l=>r0(3*Math.pow(l,1.4)),count:c=>c<4?0:Math.min(2,1+Math.floor((c-4)/4)),
    st:l=>({dps:6+3*l,slow:.4,aoe:4,hidden:true,vs:'unit'})},
  crocs:{ar:'خندق التماسيح',d:'حول القلعة؛ اللي يطيح فيه ينعض',spot:'moat',max:5,req:7,cost:cst(400,200,100,{food:150}),time:l=>r0(10*Math.pow(l,1.45)),count:c=>c<7?0:1,
    st:l=>({dps:14+5*l,vs:'unit'})},
};
const DEF_ORDER=['cannon','chain','firecat','mortar','tower','gatling','totem','oil','harbor','mines','pit','net','keg','spikes','crocs'];
const WALL={ar:'الأسوار',d:'سور حول المدينة ببوابتين، يتطور من خشب لحجر لحديد',max:10,cost:cst(90,140,20),time:l=>r0(6*Math.pow(l,1.45)),hp:l=>260+140*l};
/* ---- units: pirates (ship crew or island garrison) and island-only defenders ----
   k: melee | ranged | thrown | support | special ; sp: housing space ; tier: tavern level (pirates) or barracks level (defenders) */
const U=(ar,tier,gold,o)=>Object.assign({ar,tier,cost:{gold},sp:1,hp:100,dmg:1,spd:1,k:'melee',d:''},o);
const PUNITS={
  sailor:U('بحّار',1,20,{hp:80,dmg:.8,d:'يملأ الطاقم ويرفع الأشرعة ويقاتل في الإنزال'}),
  sword:U('مبارز',1,35,{hp:120,dmg:1.15,d:'مقاتل سيف قوي'}),
  rifle:U('قرصان ببندقية',1,45,{hp:90,dmg:1,k:'ranged',rng:30,d:'يقنص من بعيد في البر والبحر'}),
  repair:U('فني تصليح',1,40,{hp:90,dmg:.7,k:'support',d:'يصلح هيكل السفينة أثناء القتال، ويعمّر المباني'}),
  lookout:U('قرصان مراقب',1,40,{hp:80,dmg:.7,k:'support',d:'يكشف المتخفين والفخاخ القريبة ويحسّن تصويب السفينة'}),
  dual:U('قرصان بسيفين',2,60,{hp:115,dmg:1.35,atk:1.5,d:'ضرباته سريعة بسيفين'}),
  gunner:U('قرصان مدافع',2,55,{hp:100,dmg:1,k:'ranged',rng:20,aoe:2.5,d:'يسرّع حشو مدافع السفينة، وفي البر معه مدفع يدوي'}),
  doctor:U('طبيب',2,70,{hp:85,dmg:.6,k:'support',heal:9,d:'يعالج اللي حوله أثناء القتال'}),
  cook:U('طباخ',2,50,{hp:110,dmg:.8,k:'support',regen:2,d:'يرفع صحة الطاقم ومعنوياتهم'}),
  looter:U('قرصان نهب',3,60,{hp:95,dmg:.9,loot:.06,d:'يزيد الغنيمة من مخازن العدو'}),
  armored:U('قرصان مدرّع',3,90,{cost:{gold:90,iron:20},sp:2,hp:240,dmg:1.1,spd:.78,armor:.45,d:'درعه ثقيل يتحمّل الضرب'}),
  knives:U('رامي السكاكين',3,60,{hp:90,dmg:.9,k:'thrown',rng:14,atk:1.6,d:'سريع ومداه متوسط'}),
  drummer:U('عازف الطبل',3,70,{hp:90,dmg:.6,k:'support',aura:'haste',d:'يسرّع هجوم القراصنة اللي حوله'}),
  hook:U('قرصان الخطّاف',4,75,{hp:120,dmg:1.1,k:'special',pull:true,d:'يسحب العدو بالخطّاف ويسرّع الاقتحام'}),
  bomber:U('رامي البارود',4,80,{cost:{gold:80,powder:15},hp:95,dmg:1,k:'thrown',rng:16,aoe:4,bld:3,d:'يرمي براميل وقنابل تهدم الأسوار والمباني'}),
  navigator:U('الملّاح',4,80,{hp:85,dmg:.6,k:'support',d:'يزيد سرعة السفينة ويطلع بها من العواصف'}),
  bearer:U('حامل الراية',4,80,{hp:130,dmg:.8,k:'support',aura:'guard',d:'يقوّي دفاع اللي حوله ويرفع العلم أسرع'}),
  skeleton:U('هيكل عظمي',5,30,{hp:60,dmg:.85,d:'رخيص وسريع الموت، ويقوم من جديد مع ساحر الفودو'}),
  fire:U('الحارق',5,90,{cost:{gold:90,powder:20},hp:95,dmg:1,k:'thrown',rng:15,burn:6,bld:2,d:'قنابل نار تحرق الأشرعة والبيوت'}),
  harpoon:U('صياد الحيتان',5,90,{hp:120,dmg:1.6,k:'ranged',rng:24,d:'بالحربة؛ يثبّت السفن ويضرب الوحوش البحرية'}),
  spy:U('الجاسوس',5,100,{hp:85,dmg:.9,k:'special',d:'يكشف دفاعات جزيرة العدو وفخاخها قبل الهجوم'}),
  assassin:U('قاتل الظل',6,120,{hp:100,dmg:1.9,k:'special',stealth:true,d:'يتخفّى ويستهدف القادة والرماة'}),
  diver:U('الغطّاس المخرّب',6,110,{hp:90,dmg:.9,k:'special',d:'يسبح تحت سفينة العدو ويخرق هيكلها'}),
  tamer:U('مروّض الحيوانات',6,110,{hp:100,dmg:.9,k:'special',d:'معه قرد يسرق الذهب وببغاء يكشف المنطقة'}),
  voodoo:U('ساحر الفودو',7,150,{cost:{gold:150,food:40},hp:95,dmg:.8,k:'special',raise:true,d:'يلعن الأعداء ويحيي هياكل عظمية تقاتل معك'}),
  giant:U('قرصان عملاق',7,200,{cost:{gold:200,food:80},sp:4,hp:520,dmg:2.6,spd:.72,aoe:2.2,bld:2,d:'ضخم وبطيء، ضربته تطيّر اللي قدامه'}),
};
const DUNITS={
  guard:U('حرس القلعة',1,60,{cost:{gold:60,iron:10},sp:2,hp:260,dmg:1.25,spd:.85,armor:.35,d:'مدرّعين برماح طويلة يسدّون البوابات، وأقوياء ضد العملاق'}),
  crew:U('طاقم المدافع',1,40,{hp:90,dmg:.8,d:'يشغّلون المدافع؛ إذا ماتوا يوقف المدفع'}),
  wallgun:U('رماة الأسوار',2,70,{hp:110,dmg:1,k:'ranged',rng:30,d:'يوقفون فوق الأسوار ويضربون بالبنادق'}),
  dog:U('الكلاب الحارسة',2,40,{hp:70,dmg:.9,spd:1.6,d:'تشم الجواسيس وقتلة الظل وتكشفهم'}),
  firemen:U('رجال الإطفاء',3,50,{hp:90,dmg:.7,k:'support',d:'يطفّون الحرايق اللي يسويها الحارق ورامي البارود'}),
  gdiver:U('الغطّاسين الحرّاس',3,50,{hp:80,dmg:.9,d:'يدورون حول الميناء تحت الماء ويصدّون الغطّاس المخرّب'}),
  cavalry:U('الفرسان',4,120,{cost:{gold:120,food:30},sp:3,hp:230,dmg:1.4,spd:1.7,d:'على الخيل؛ يوصلون بسرعة لأي مكان ينزل فيه العدو'}),
};
/* auto defenders (not trained): fighters from the alarm bell, treasure guards from the vault */
const AUNITS={fighters:{ar:'المقاتلون',hp:70,dmg:.7},tguard:{ar:'حراس الكنز',hp:90,dmg:.9}};
const PU_ORDER=Object.keys(PUNITS),DU_ORDER=Object.keys(DUNITS);
function unitDef(t){return PUNITS[t]||DUNITS[t]||null;}
/* ---- ships ---- */
const SHIPS={
  sloop:{ar:'سلوب',lv:0,yard:1,cost:{gold:400,wood:300},time:20,hull:100,guns:4,crew:14,speed:16},
  brig:{ar:'بريغانتين',lv:1,yard:3,cost:{gold:1200,wood:800,iron:150},time:60,hull:150,guns:5,crew:20,speed:15.5},
  frigate:{ar:'فرقاطة',lv:2,yard:5,cost:{gold:2800,wood:1800,iron:400},time:120,hull:220,guns:6,crew:28,speed:15},
  galleon:{ar:'غليون حربي',lv:3,yard:7,cost:{gold:6000,wood:3500,iron:900},time:240,hull:320,guns:7,crew:36,speed:14.5},
};
const SHIP_ORDER=['sloop','brig','frigate','galleon'];
const SHIP_UP={hull:{ar:'الهيكل',d:'+12% صلابة لكل مستوى'},guns:{ar:'المدافع',d:'+10% ضرر وحشو أسرع'},sails:{ar:'الأشرعة',d:'+6% سرعة'},crew:{ar:'سعة الطاقم',d:'+2 مكان للطاقم'}};
const SHIP_UP_MAX=5;
function shipUpCost(t,part,l){const k=SHIPS[t].lv+1,m={hull:1,guns:1.2,sails:.9,crew:.8}[part]||1;return{gold:r5(140*k*l*m),wood:r5(110*k*l*m),iron:r5(35*k*l*m)};}
const SAILS=[['#F1E8D2','أبيض'],['#E2CFA2','عاجي'],['#2A2622','أسود'],['#9E2A22','أحمر'],['#25406B','أزرق'],['#2F5A3A','أخضر'],['#5A2E6B','بنفسجي'],['#C9A04A','ذهبي']];
const FIGS=['بدون','حورية','أسد','ثعبان','جمجمة','نسر'];
function shipStats(s){const b=SHIPS[s.t],u=s.up||{};return{hull:r0(b.hull*(1+.12*(u.hull||0))),guns:b.guns,gunDmg:1+.1*(u.guns||0),reload:1-.06*(u.guns||0),speed:b.speed*(1+.06*(u.sails||0)),crew:b.crew+2*(u.crew||0)};}
/* ---- flag: 24x16 pixels, 16 colours ---- */
const FLAG_W=24,FLAG_H=16;
const FLAG_PAL=['#111111','#F4F1E8','#A8261F','#E0822A','#E8C547','#3E8E3A','#1F6E8C','#24407A','#6B2E8C','#C25A8A','#6B4426','#C9A04A','#8A8A8A','#3A3A3A','#7FC4E8','#B5D86A'];
function defaultFlag(){/* black flag, white skull and crossed bones */const a=new Array(FLAG_W*FLAG_H).fill(0),S=(x,y,c)=>{if(x>=0&&y>=0&&x<FLAG_W&&y<FLAG_H)a[y*FLAG_W+x]=c;};
  for(let y=3;y<9;y++)for(let x=9;x<15;x++)if(!((y===3||y===8)&&(x===9||x===14)))S(x,y,1);S(10,5,0);S(11,5,0);S(13,5,0);S(12,5,0);S(11,6,0);S(12,6,0);S(10,9,1);S(11,9,1);S(12,9,1);S(13,9,1);
  for(let k=0;k<7;k++){S(7+k,10+(k>>1),1);S(16-k,10+(k>>1),1);}return encFlag(a);}
function encFlag(a){let s='';for(let i=0;i<a.length;i++)s+='0123456789abcdef'[a[i]&15];return s;}
function decFlag(s){const a=new Array(FLAG_W*FLAG_H).fill(0);if(typeof s!=='string')return a;for(let i=0;i<a.length&&i<s.length;i++){const v=parseInt(s[i],16);a[i]=isNaN(v)?0:v;}return a;}
function validFlag(s){return typeof s==='string'&&s.length===FLAG_W*FLAG_H&&/^[0-9a-f]+$/.test(s);}
/* ---- economy helpers (operate on a player profile) ---- */
function castleL(p){const b=p.bld&&p.bld[0];return b?b.l:1;}
function bldDone(b,now){return b&&(!b.done||b.done<=now);}
function effL(b,now){/* level that is active right now (an upgrade in progress keeps the old level working) */return!b?0:bldDone(b,now)?b.l:b.l-1;}
function countOf(p,type,col){let n=0;const o=p[col||'bld'];for(const k in o)if(o[k].t===type)n++;return n;}
function popCap(p,now){let c=0;for(const k in p.bld){const b=p.bld[k],d=BLD[b.t],l=effL(b,now);if(l>0&&d.pop)c+=d.pop(l);}return c;}
function storeCap(p,now){let c=0;for(const k in p.bld){const b=p.bld[k],d=BLD[b.t],l=effL(b,now);if(l>0&&d.store)c+=d.store(l);}return Math.max(1000,c);}
function protectFrac(p,now){let f=.1;for(const k in p.bld){const b=p.bld[k],l=effL(b,now);if(l>0&&b.t==='store')f+=BLD.store.protect(l);}return Math.min(.6,f);}
function armyCap(p,now){let c=6;for(const k in p.bld){const b=p.bld[k],l=effL(b,now);if(l>0&&b.t==='barracks')c=BLD.barracks.army(l);}return c;}
function tavernL(p,now){let t=0;for(const k in p.bld){const b=p.bld[k];if(b.t==='tavern')t=Math.max(t,effL(b,now));}return t;}
function barracksL(p,now){let t=0;for(const k in p.bld){const b=p.bld[k];if(b.t==='barracks')t=Math.max(t,effL(b,now));}return t;}
function yardL(p,now){const b=p.bld[1];return b?effL(b,now):0;}
function fleetCap(p,now){return 1+Math.floor(yardL(p,now)/2);}
function prodRates(p,now,clanLvl){const o={gold:0,wood:0,iron:0,food:0,powder:0};
  for(const k in p.bld){const b=p.bld[k],d=BLD[b.t],l=effL(b,now);if(l>0&&d.prod)for(const r in d.prod)o[r]+=d.prod[r](l);}
  const cap=popCap(p,now),pop=Math.min(p.pop||0,cap),work=.55+.45*(cap?pop/cap:0),bonus=1+.03*Math.max(0,(clanLvl||1)-1);
  for(const r in o)o[r]*=work*bonus;o.gold+=pop*.22;
  const eat=pop*.035+unitTotal(p)*.03;o.food-=eat;return o;}
function unitTotal(p){let n=0;const add=o=>{for(const t in o)n+=o[t]||0;};add(p.garrison||{});for(const s of p.ships||[])add(s.crew||{});return n;}
function spaceOf(o){let n=0;for(const t in o){const d=unitDef(t);n+=(o[t]||0)*(d?d.sp:1);}return n;}
function crewCap(s){return shipStats(s).crew;}
function militiaN(p,now){let l=0;for(const k in p.bld){const b=p.bld[k];if(b.t==='bell')l=Math.max(l,effL(b,now));}return l?Math.min(30,Math.floor((p.pop||0)*BLD.bell.militia(l))):0;}
function vaultL(p,now){let l=0;for(const k in p.bld){const b=p.bld[k];if(b.t==='vault')l=Math.max(l,effL(b,now));}return l;}
function builders(p){return castleL(p)>=5?3:2;}
function busyBuilders(p,now){let n=0;for(const col of['bld','def'])for(const k in p[col])if(p[col][k].done>now)n++;if(p.wallDone>now)n++;return n;}
function canAfford(p,c){for(const r in c)if((p.res[r]||0)<c[r]-1e-6)return false;return true;}
function pay(p,c){for(const r in c)p.res[r]=Math.max(0,(p.res[r]||0)-c[r]);}
function speedCost(secLeft){return Math.max(5,Math.ceil(secLeft/6)*5);}
/* ---- clans, alliances, raids ---- */
const CLAN={cost:800,max:30,roles:['leader','co','officer','member'],rolesAr:{leader:'القائد',co:'النائب',officer:'ضابط',member:'عضو'},lvlXp:[0,2000,6000,15000,30000],maxLvl:5};
function clanLvl(xp){let l=1;for(let i=1;i<CLAN.lvlXp.length;i++)if(xp>=CLAN.lvlXp[i])l=i+1;return Math.min(CLAN.maxLvl,l);}
const ALLY={max:5,traitorH:24};
const RAID={maxSec:360,lootK:.35,shieldLo:6,shieldHi:10,newShieldH:24,npcCd:20*60};
function lootFor(p,pct,now,bonus){const prot=protectFrac(p,now),o={},k=RAID.lootK*Math.max(0,Math.min(100,pct))/100*(1+(bonus||0));
  for(const r of RES){const lootable=Math.max(0,(p.res[r]||0)*(1-prot));o[r]=Math.floor(lootable*k*(r==='food'?.6:1));}return o;}
function validName(s){return typeof s==='string'&&/^[ء-ي٠-٩A-Za-z0-9_]{3,16}$/.test(s);}
function validTag(s){return typeof s==='string'&&/^[ء-ي٠-٩A-Za-z0-9_]{2,10}$/.test(s);}
function validClanName(s){return typeof s==='string'&&s.trim().length>=3&&s.trim().length<=22&&!/[<>]/.test(s);}
const API={VERSION,RES,RES_AR,WORLD_R,SLOTS,slotPos,hashU,LAYOUT,SPOT_KIND,BLD,BLD_ORDER,DEF,DEF_ORDER,WALL,PUNITS,DUNITS,AUNITS,PU_ORDER,DU_ORDER,unitDef,
  SHIPS,SHIP_ORDER,SHIP_UP,SHIP_UP_MAX,shipUpCost,SAILS,FIGS,shipStats,FLAG_W,FLAG_H,FLAG_PAL,defaultFlag,encFlag,decFlag,validFlag,
  castleL,bldDone,effL,countOf,popCap,storeCap,protectFrac,armyCap,tavernL,barracksL,yardL,fleetCap,prodRates,unitTotal,spaceOf,crewCap,militiaN,vaultL,builders,busyBuilders,canAfford,pay,speedCost,
  CLAN,clanLvl,ALLY,RAID,lootFor,validName,validTag,validClanName};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.SH=API;
})(typeof window!=='undefined'?window:this);
