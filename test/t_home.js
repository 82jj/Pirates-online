/* island-only development, building card on foot, night look, phone-size screenshots */
const {open,ev,ff,shot,register,done,sleep}=require('./lib');
(async()=>{
  const p=await open('A',{width:390,height:844});
  await register(p,'بحار'+(Date.now()%10000));await ff(p,3);
  console.log('atHome start',await ev(p,`atHome()`));
  await ev(p,`uiOpen('island')`);await sleep(200);
  console.log('away card at home',await ev(p,`!!document.querySelector('#uiBody .away')`),'disabled build btns',await ev(p,`[...document.querySelectorAll('#uiBody [data-a=build]')].filter(b=>b.disabled).length+'/'+document.querySelectorAll('#uiBody [data-a=build]').length`));
  await shot(p,'home_menu_phone');
  await ev(p,`uiClose()`);
  /* sail far away */
  await ev(p,`P.x+=2500;P.z+=600;1`);await ff(p,1.5);
  console.log('atHome away',await ev(p,`atHome()`));
  await ev(p,`uiOpen('island')`);await sleep(200);
  console.log('away card away',await ev(p,`!!document.querySelector('#uiBody .away')`),'enabled gated btns',await ev(p,`[...document.querySelectorAll('#uiBody [data-a]')].filter(b=>HOME_ACTS.has(b.dataset.a)&&!b.disabled).length`));
  await shot(p,'away_menu_phone');
  console.log('server gate',await p.evaluate(()=>new Promise(r=>window.__pir.ev(`act({t:'build',plot:12,type:'house'})`).then(()=>r('ok?!')).catch(e=>r('fail:'+(e&&e.msg||e))))));
  await ev(p,`uiClose()`);
  /* back home, walk on the island next to the castle */
  await ev(p,`goHome()`);await ff(p,1.5);console.log('atHome after goHome',await ev(p,`atHome()`));
  /* night */
  await ev(p,`tod=.0;1`);await ff(p,2);await shot(p,'night_sea_phone');
  await ev(p,`tod=.04;1`);await ff(p,1);await shot(p,'night2_sea_phone');
  await ev(p,`tod=.5;1`);await ff(p,2);await shot(p,'day_sea_phone');
  await done();
})().catch(async e=>{console.error('FAIL',e);await done();process.exit(1);});
