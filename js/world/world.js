/* Mesin "situs di dalam 3D": seluruh halaman situs (beranda, katalog, produk, keranjang, checkout, kontak) dibuka di dalam adegan konsep.
   - Stasiun: titik kamera bernama. Pindah halaman = kamera terbang ke stasiun lewat jalur pohon (parent) antar-stasiun.
   - Tur 360°: seret untuk melihat sekeliling dari stasiun mana pun; pin di adegan untuk pindah stasiun.
   - Produk 360°: rute dengan `orbit` membuat kamera mengitari produk (seret = putar, roda/cubit = zoom).
   - Panel kaca berisi konten halaman (DOM sungguhan, bisa difokus dan dibaca pembaca layar).
   def = {concept, site, stations, tour, nav, route(r), setup(rt,W), pins, audio} — lihat js/world/kopi.js */
import {T,V,$,camera,renderer,clamp,lerp,sstep,reduce,EffectComposer,RenderPass,GTAOPass,UnrealBloomPass,ShaderPass,OutputPass} from '../core.js';
import * as SND from '../audio.js';
import {cart,on} from '../site/store.js';
import {esc,toast,validate,reveal} from '../site/ui.js';

/* ---------- pipeline pasca-proses (sama dengan engine.js) ---------- */
const GradeShader={uniforms:{tDiffuse:{value:null},uTime:{value:0},uVig:{value:.35},uGrain:{value:.03},uCA:{value:.0012},uTint:{value:new T.Vector3(1,1,1)},uSat:{value:1}},
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform sampler2D tDiffuse;uniform float uTime,uVig,uGrain,uCA,uSat;uniform vec3 uTint;varying vec2 vUv;
    float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+uTime)*43758.5453);}
    void main(){vec2 c=vUv-.5;float d=dot(c,c);vec2 o=c*d*uCA*8.;
      vec3 col=vec3(texture2D(tDiffuse,vUv+o).r,texture2D(tDiffuse,vUv).g,texture2D(tDiffuse,vUv-o).b);
      col=col*uTint;float l=dot(col,vec3(.2126,.7152,.0722));col=mix(vec3(l),col,uSat);
      col*=1.-uVig*smoothstep(.15,.75,d*2.2);col+=(h(vUv*vec2(1920.,1080.))-.5)*uGrain;
      gl_FragColor=vec4(max(col,0.),1.);}`};
function collectAO(scene){const l=[];scene.traverse(o=>{const m=o.material;if(o.isSprite||o.isPoints||o.isLine||(m&&!Array.isArray(m)&&m.transparent&&!m.alphaTest)||(m&&m.isShaderMaterial))l.push(o)});return l}

export async function world(def){
  const site=def.site,S=def.stations,ROOT=def.root||'../';
  let ox=0,oxSet=-1,oy=0,oySet=-1;
  const INSTANT=/[?&]instant=1/.test(location.search);
  const SMALL=matchMedia('(max-width:820px)').matches||matchMedia('(pointer:coarse)').matches,MOB=matchMedia('(max-width:720px)').matches;
  /* tema dari data situs: warna panel kaca, tinta, aksen, huruf */
  {const t=site.theme,r=document.documentElement.style,light=def.panelLight;const hx=c=>{const n=parseInt(c.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255].join(',')};
    const m={'--acc':t.acc,'--accInk':t.accInk||'#000','--fh':t.fh,'--fb':t.fb,'--wbg':t.bg,
      '--wink':light?t.ink:(t.mode==='light'?'#f6f1ea':t.ink),'--wmut':light?t.mut:(t.mode==='light'?'#cfc4b6':t.mut),
      '--wglass':light?'rgba(255,252,246,.82)':'rgba('+hx(t.mode==='light'?'#1c1712':t.bg)+',.64)','--wline':light?'rgba(40,30,20,.14)':'rgba(255,255,255,.14)'};
    for(const k in m)if(m[k])r.setProperty(k,m[k]);if(light)document.documentElement.classList.add('wlight');
    if(site.fonts&&!document.querySelector('link[data-wf]')){const l=document.createElement('link');l.rel='stylesheet';l.href=site.fonts;l.dataset.wf=1;document.head.appendChild(l)}}
  /* ---------- DOM ---------- */
  const nav=def.nav;
  document.body.insertAdjacentHTML('beforeend',
   '<a class="skip" href="#wpBody">Lewati ke konten</a>'
  +'<header class="wbar"><a class="wlogo" href="#/" aria-label="'+esc(site.brand.name)+' — beranda"><span>'+esc(site.brand.mark)+'</span>'+esc(site.brand.name)+'</a>'
  +'<nav class="wnav" id="wnav" aria-label="Menu utama">'+nav.map(n=>'<a href="#'+n[1]+'" data-r="'+n[1]+'">'+esc(n[0])+'</a>').join('')+'<a class="wback" href="'+ROOT+'index.html">← Bank inspirasi</a></nav>'
  +'<div class="wact"><button class="wic" id="wSnd" aria-pressed="false" title="Suara"></button><button class="wic" id="wQ" title="Kualitas grafis"></button>'
  +(site.type!=='shop'?'':'<a class="wic wcart" href="#/keranjang" aria-label="Keranjang"><svg viewBox="0 0 24 24"><path d="M3 4h2.5l2.2 11h10.6L20.5 7H6.2"/><circle cx="9" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/></svg><b id="wBadge" hidden>0</b></a>')
  +'<button class="wic wburg" id="wBurg" aria-label="Menu" aria-expanded="false" aria-controls="wnav"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button></div></header>'
  +'<div id="wpins" aria-label="Titik di adegan"></div>'
  +'<aside id="wp" aria-live="polite"><div class="wp-h"><button class="wp-tog" id="wpTog" aria-expanded="true" aria-controls="wpBody"><i></i><span id="wpTitle"></span></button></div><div class="wp-b" id="wpBody" tabindex="-1"></div></aside>'
  +'<div id="wloc"><b id="wlocN"></b><span id="wlocH">Seret untuk melihat sekeliling 360°</span><span class="wtour"><button id="wPrev" aria-label="Stasiun sebelumnya">‹</button><button id="wNext" aria-label="Stasiun berikutnya">›</button></span></div>'
  +'<div id="wtip" hidden></div>');
  const wp=$('#wp'),wpBody=$('#wpBody'),pinsEl=$('#wpins'),tip=$('#wtip');
  const badge=()=>{const b=$('#wBadge');if(!b)return;const n=cart.count(site.id);b.textContent=n;b.hidden=!n};badge();
  $('#wBurg').onclick=e=>{const o=$('#wnav').classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',o)};
  let collapsed=false;function setCollapsed(v){collapsed=v;wp.classList.toggle('min',v);$('#wpTog').setAttribute('aria-expanded',!v)}
  $('#wpTog').onclick=()=>{setCollapsed(!collapsed);SND.sfx(collapsed?'off':'on')};

  /* ---------- runtime adegan ---------- */
  const W={site,S,go:h=>{location.hash=h},sfx:(n,a)=>SND.sfx(n,a),toast,kick:a=>{kick=Math.max(kick,a||1)},rt:null,pins:[],picks:[],orbitObj:null,stationId:null};
  const fakeUI={stat(){},press(){},sfx:W.sfx,kick:W.kick,site:()=>site};
  let rt=null;
  if(renderer){try{rt=def.concept.build(fakeUI)}catch(e){console.error(e)}}
  W.rt=rt;if(rt&&def.setup)def.setup(rt,W);
  if(!rt){document.body.classList.add('nogl');document.body.style.backgroundImage='url('+ROOT+'assets/img/'+site.id+'/'+(def.noglImg||'04')+'.jpg)'}

  /* ---------- kamera: stasiun, terbang, lihat 360°, orbit produk ---------- */
  for(const id in S){const s=S[id];s.id=id;s.p=V(...s.pos);s.l=V(...s.look)}
  const pos=V(0,0,0),look=V(0,0,0);let flight=null,cur=null;
  let yaw=0,pitch=0,vyaw=0,vpitch=0,fovZ=0;
  const orb={on:false,t:V(0,0,0),az:0,el:.2,d:1.6,vaz:0,vel:0,dmin:.7,dmax:2.4,k:0};
  function chain(a,b){const up=x=>{const l=[];let s=x;while(s){l.push(s.id);s=s.parent?S[s.parent]:null}return l};const A=up(a),B=up(b);const lca=A.find(x=>B.includes(x));const l=A.slice(0,A.indexOf(lca)+1).concat(B.slice(0,B.indexOf(lca)).reverse());
    // antar-saudara (mis. rak -> kasir) tidak perlu mampir ke stasiun induk
    if(lca!==a.id&&lca!==b.id)l.splice(l.indexOf(lca),1);return l}
  function curPose(){const p=camera.position.clone(),d=new T.Vector3();camera.getWorldDirection(d);return{p,l:p.clone().add(d.multiplyScalar(pos.distanceTo(look)||5))}}
  function flyTo(id,instant){const s=S[id];if(!s)return;W.stationId=id;$('#wlocN').textContent=s.label;
    if(def.audio&&SND.ready()&&SND.isOn()&&s.audio)SND.ambient(s.audio);
    if(!cur||instant||reduce||INSTANT){cur=s;pos.copy(s.p);look.copy(s.l);yaw=pitch=0;flight=null;return}
    const ids=chain(cur,s),P=[],L=[];const cp=curPose();P.push(cp.p);L.push(cp.l);
    ids.slice(1,-1).forEach(k=>{if(S[k].pass===false)return;P.push(S[k].p.clone());L.push(S[k].l.clone())});
    P.push(s.p.clone());L.push(s.l.clone());
    if(P.length===2){const m=P[0].clone().lerp(P[1],.5);m.y+=Math.min(1.2,P[0].distanceTo(P[1])*.08);P.splice(1,0,m);L.splice(1,0,L[0].clone().lerp(L[1],.5))}
    const pc=new T.CatmullRomCurve3(P,false,'centripetal'),lc=new T.CatmullRomCurve3(L,false,'centripetal');
    const len=pc.getLength();flight={pc,lc,t:0,dur:clamp(.9+Math.sqrt(len)*.38,1,5.2)};
    // sisa sudut pandang 360° dibawa ke awal penerbangan lalu dilepas pelan
    yaw=0;pitch=0;cur=s;SND.sfx('whoosh',1);kick=Math.max(kick,1.6)}
  W.flyTo=flyTo;
  W.setOrbitTarget=t=>{orb.t.set(...t)};
  W.setOrbit=function(o){if(!o){orb.on=false;if(INSTANT)orb.k=0;return}orb.on=true;orb.t.set(...o.target);orb.az=o.az||0;orb.el=o.el==null?.18:o.el;orb.d=o.d||1.5;orb.dmin=o.dmin||.6;orb.dmax=o.dmax||2.4;orb.vaz=0;orb.vel=0;if(INSTANT)orb.k=1};

  /* ---------- masukan: seret, klik, roda, keyboard ---------- */
  const cv=$('#gl');const ray=new T.Raycaster(),pn=new T.Vector2();
  let drag=null,moved=0,hint=true;
  function pick(x,y){pn.set(x/innerWidth*2-1,-(y/innerHeight)*2+1);ray.setFromCamera(pn,camera);
    const lists=(W.picks||[]).concat(rt&&rt.pick?rt.pick.map(p=>({objects:p.objects,hint:p.hint,on:()=>{if(!(def.pickAction&&def.pickAction(p.id,W))&&rt.actions[p.id])rt.actions[p.id](p.id==='roast'?(rt.world.getRoast()+1)%3:undefined);def.onAction&&def.onAction(p.id,W)}})):[]);
    let best=null;for(const pk of lists){if(pk.when&&!pk.when())continue;const objs=(typeof pk.objects==='function'?pk.objects():pk.objects)||[];const h=ray.intersectObjects(objs,true)[0];if(h&&(!best||h.distance<best.h.distance))best={pk,h}}return best}
  cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,id:e.pointerId,t:performance.now()};moved=0;cv.setPointerCapture(e.pointerId);unlock()});
  cv.addEventListener('pointermove',e=>{
    if(drag&&e.pointerId===drag.id){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;moved+=Math.abs(dx)+Math.abs(dy);
      if(moved>4){cv.classList.add('grab');if(hint){hint=false;$('#wlocH').classList.add('gone')}}
      const k=(camera.fov/55);if(orb.on){orb.vaz=-dx*.009;orb.vel=dy*.005;orb.az+=orb.vaz;orb.el=clamp(orb.el+orb.vel,-.15,1.1)}else{vyaw=dx*.0042*k;vpitch=dy*.0036*k;yaw+=vyaw;pitch=clamp(pitch+vpitch,-1.15,1.15)}
      return}
    if(e.pointerType==='mouse'&&!flight&&++hov%3===0){const r=pick(e.clientX,e.clientY);cv.style.cursor=r?'pointer':'';if(r&&r.pk.hint){tip.hidden=false;tip.textContent=r.pk.hint;tip.style.transform='translate('+(e.clientX+16)+'px,'+(e.clientY+14)+'px)'}else tip.hidden=true}});
  let hov=0;
  const end=e=>{if(!drag||e.pointerId!==drag.id)return;cv.classList.remove('grab');const click=moved<6;drag=null;if(click&&!flight){const r=pick(e.clientX,e.clientY);if(r){SND.sfx('ping');r.pk.on(r.h);kick=Math.max(kick,.8)}}};
  cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);
  let wheelLock=0;
  cv.addEventListener('wheel',e=>{e.preventDefault();if(orb.on){orb.d=clamp(orb.d*(1+Math.sign(e.deltaY)*.08),orb.dmin,orb.dmax);return}
    if(e.ctrlKey){fovZ=clamp(fovZ+Math.sign(e.deltaY)*3,-25,15);return}
    const now=performance.now();if(now<wheelLock||flight||Math.abs(e.deltaY)<8)return;wheelLock=now+1100;tour(e.deltaY>0?1:-1)},{passive:false});
  // cubit untuk zoom di layar sentuh
  const tp=new Map();let pd0=0;
  cv.addEventListener('pointerdown',e=>{tp.set(e.pointerId,[e.clientX,e.clientY]);if(tp.size===2){const [a,b]=[...tp.values()];pd0=Math.hypot(a[0]-b[0],a[1]-b[1])}});
  cv.addEventListener('pointermove',e=>{if(!tp.has(e.pointerId))return;tp.set(e.pointerId,[e.clientX,e.clientY]);if(tp.size===2){const [a,b]=[...tp.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pd0){const r=pd0/d;if(orb.on)orb.d=clamp(orb.d*r,orb.dmin,orb.dmax);else fovZ=clamp(fovZ+(r-1)*40,-25,15)}pd0=d;moved=99}});
  const tpEnd=e=>{tp.delete(e.pointerId);if(tp.size<2)pd0=0};cv.addEventListener('pointerup',tpEnd);cv.addEventListener('pointercancel',tpEnd);
  function tour(dir){const T_=def.tour,i=T_.indexOf(W.stationId);const j=i<0?0:clamp(i+dir,0,T_.length-1);if(j!==i)location.hash=S[T_[j]].href}
  $('#wPrev').onclick=()=>tour(-1);$('#wNext').onclick=()=>tour(1);
  addEventListener('keydown',e=>{if(/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName))return;
    if(e.key==='ArrowLeft'){yaw+=.25;orb.az-=.25}else if(e.key==='ArrowRight'){yaw-=.25;orb.az+=.25}
    else if(e.key==='PageDown'||(e.key==='ArrowDown'&&!wp.contains(document.activeElement))){e.preventDefault();tour(1)}else if(e.key==='PageUp'||(e.key==='ArrowUp'&&!wp.contains(document.activeElement))){e.preventDefault();tour(-1)}
    else if(e.key==='Escape')setCollapsed(!collapsed)});

  /* ---------- pin di adegan ---------- */
  function mkPins(){pinsEl.innerHTML='';(W.pins||[]).forEach((p,i)=>{const b=document.createElement(p.href?'a':'button');b.className='wpin '+(p.kind||'way');if(p.href)b.href=p.href;b.innerHTML='<i></i><span><b>'+esc(p.label)+'</b>'+(p.sub?'<em>'+esc(p.sub)+'</em>':'')+'</span>';b.hidden=true;
    if(p.on)b.onclick=e=>{e.preventDefault();p.on()};b.addEventListener('pointerenter',()=>SND.sfx('hover'));pinsEl.appendChild(b);p.el=b;p.v=V(...p.pos)})}
  W.refreshPins=mkPins;mkPins();
  const pv=new T.Vector3();
  function updPins(){const show=!flight;for(const p of W.pins){const el=p.el;let ok=show&&(!p.at||p.at.includes(W.stationId))&&(!p.when||p.when());
      if(ok){pv.copy(p.v).project(camera);if(pv.z>1||pv.z<-1)ok=false;else{p.sx=(pv.x*.5+.5)*innerWidth;p.sy=(-pv.y*.5+.5)*innerHeight;if(p.sx<10||p.sx>innerWidth-10||p.sy<64||p.sy>innerHeight-10)ok=false}}
      if(ok&&!collapsed&&!MOB){const r=wp.getBoundingClientRect();if(p.sx>r.left-8&&p.sy>r.top&&p.sy<r.bottom)ok=false}
      if(!ok){if(!el.hidden)el.hidden=true}else{el.hidden=false;el.style.transform='translate('+p.sx.toFixed(1)+'px,'+p.sy.toFixed(1)+'px)'}}}

  /* ---------- router ---------- */
  let lastRoute=null;
  function parse(){const h=location.hash.replace(/^#/,'')||'/';const [p,q]=h.split('?');return{path:p.replace(/\/+$/,'')||'/',seg:p.split('/').filter(Boolean),q:new URLSearchParams(q||'')}}
  function render(){const r=parse();let out=null;try{out=def.route(r,W)}catch(e){console.error(e)}
    if(!out)out={st:W.stationId||def.tour[0],title:'Tidak ditemukan',html:'<h1 class="wh">Halaman tidak ditemukan</h1><p class="wl">Alamat ini tidak ada di situs kami.</p><a class="wbtn" href="#/">Kembali ke beranda</a>'};
    if(lastRoute&&lastRoute.leave)lastRoute.leave(W);lastRoute=out;
    W.setOrbit(out.orbit||null);
    if(out.st!==W.stationId||!cur)flyTo(out.st,!cur);
    $('#wpTitle').textContent=out.title||'';wp.dataset.kind=out.kind||'';
    wpBody.classList.remove('in');void wpBody.offsetWidth;wpBody.innerHTML=out.html;wpBody.classList.add('in');wpBody.scrollTop=0;
    if(out.collapse!=null)setCollapsed(out.collapse);else if(collapsed&&!MOB)setCollapsed(false);
    document.title=(out.title?out.title+' · ':'')+site.brand.name;
    $$('#wnav a[data-r]').forEach(a=>a.classList.toggle('on',a.dataset.r===r.path||(a.dataset.r!=='/'&&r.path.startsWith(a.dataset.r))));$('#wnav').classList.remove('open');
    reveal(wpBody);if(out.after)out.after(wpBody,r,W);
    if(document.activeElement&&document.activeElement!==document.body&&!wp.contains(document.activeElement))wpBody.focus({preventScroll:true})}
  const $$=(s,r)=>[...(r||document).querySelectorAll(s)];
  W.render=render;
  document.addEventListener('click',e=>{const t=e.target.closest('[data-act]');if(t&&def.act)def.act(t,e,W);if(e.target.closest('a,button'))SND.sfx('click')});
  document.addEventListener('input',e=>{const r=e.target.closest&&e.target.closest('.fld.bad');if(r){r.classList.remove('bad');const m=r.querySelector('.err');if(m)m.remove()}});
  on(e=>{if(e.detail!==site.id)return;badge();def.onCart&&def.onCart(W);const r=parse();if(def.refresh)def.refresh(r,W)});
  addEventListener('hashchange',render);

  /* ---------- suara & kualitas ---------- */
  const sb=$('#wSnd');const sl=()=>{sb.textContent=SND.isOn()?'♪':'♪̸';sb.setAttribute('aria-label','Suara '+(SND.isOn()?'nyala':'mati'));sb.setAttribute('aria-pressed',SND.isOn())};sl();
  function unlock(){if(!SND.ready()&&SND.init()){const s=S[W.stationId];if(s&&s.audio&&SND.isOn())SND.ambient(s.audio)}}
  addEventListener('keydown',unlock,{passive:true});addEventListener('pointerdown',unlock,{passive:true});
  sb.onclick=()=>{unlock();SND.setOn(!SND.isOn());sl();const s=S[W.stationId];if(SND.isOn()&&s&&s.audio)SND.ambient(s.audio)};
  let quality=SMALL?1:2,autoQ=true;{const qp=new URLSearchParams(location.search).get('q');if(qp!=null){autoQ=false;quality=clamp(+qp||0,0,2)}}
  const QN=['Hemat','Sedang','Tinggi'],qb=$('#wQ');const ql=()=>{qb.textContent=autoQ?'Auto':QN[quality];qb.title='Kualitas grafis: '+(autoQ?'otomatis ('+QN[quality]+')':QN[quality])};
  let composer=null,rpass,bloom,gtao,grade;
  function buildComposer(w,h){const rtg=new T.WebGLRenderTarget(w,h,{type:T.HalfFloatType,samples:4});composer=new EffectComposer(renderer,rtg);composer.setPixelRatio(renderer.getPixelRatio());composer.setSize(w,h);
    rpass=new RenderPass(rt.scene,camera);composer.addPass(rpass);
    try{gtao=new GTAOPass(rt.scene,camera,w,h);gtao.output=GTAOPass.OUTPUT.Default;gtao.updateGtaoMaterial({radius:.5,distanceExponent:1.4,thickness:1.2,scale:1.1,samples:12,distanceFallOff:1,screenSpaceRadius:false});gtao.updatePdMaterial({lumaPhi:10,depthPhi:2,normalPhi:3,radius:4,radiusExponent:1,rings:2,samples:8});composer.addPass(gtao);
      const hide=collectAO(rt.scene),orig=gtao.render.bind(gtao);gtao.render=function(...a){hide.forEach(o=>{o._v=o.visible;o.visible=false});orig(...a);hide.forEach(o=>{o.visible=o._v})}}catch(e){gtao=null}
    bloom=new UnrealBloomPass(new T.Vector2(w,h),.5,.6,.9);composer.addPass(bloom);grade=new ShaderPass(GradeShader);composer.addPass(grade);composer.addPass(new OutputPass())}
  let FOVB=55;
  function resize(){if(!renderer||!rt)return;const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;FOVB=w/h<.9?70:52;oxSet=-1;camera.updateProjectionMatrix();if(!composer)buildComposer(w,h);else composer.setSize(w,h)}
  function applyQ(q){quality=q;if(rt&&rt.setQ)rt.setQ(q);if(renderer)renderer.setPixelRatio(q===0?1:Math.min(devicePixelRatio||1,SMALL?1.25:1.5));resize();ql()}
  qb.onclick=()=>{if(autoQ){autoQ=false;applyQ(2)}else if(quality===2)applyQ(1);else if(quality===1)applyQ(0);else{autoQ=true;applyQ(SMALL?1:2)}ql()};
  addEventListener('resize',resize);applyQ(quality);

  /* ---------- loop ---------- */
  let kick=0,tt=0,last=performance.now(),fT=.016,fN=0;W.kickRef=()=>kick;
  const L0={exp:1,bl:[.5,.6,.9],vig:.35,grain:.03,tint:[1,1,1],sat:1},tpP=V(0,0,0),tpL=V(0,0,0),dir=V(0,0,0),up=V(0,1,0),side=V(0,0,0);
  function frame(now){requestAnimationFrame(frame);const raw=(now-last)/1000,dt=Math.min(raw,.05);last=now;tt+=dt;
    if(!rt)return;
    if(flight){flight.t+=dt/flight.dur;const u=flight.t>=1?1:flight.t,e=u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;flight.pc.getPoint(e,tpP);flight.lc.getPoint(e,tpL);pos.copy(tpP);look.copy(tpL);if(flight.t>=1){flight=null;pos.copy(cur.p);look.copy(cur.l);def.onArrive&&def.onArrive(cur.id,W)}}
    if(!drag){vyaw*=Math.exp(-dt*5);vpitch*=Math.exp(-dt*5);if(Math.abs(vyaw)>1e-4){yaw+=vyaw;pitch=clamp(pitch+vpitch,-1.15,1.15)}orb.vaz*=Math.exp(-dt*4);orb.az+=orb.vaz*(orb.on?1:0)}
    if(flight){yaw*=Math.exp(-dt*6);pitch*=Math.exp(-dt*6)}
    if(orb.on&&!flight){if(!drag&&Math.abs(orb.vaz)<.002&&!reduce)orb.az+=dt*.18;orb.k=Math.min(1,orb.k+dt*1.6)}else orb.k=Math.max(0,orb.k-dt*2);
    // posisi dasar stasiun + rotasi 360° (yaw di sumbu dunia, pitch di sumbu samping)
    dir.copy(look).sub(pos);const dl=dir.length();dir.normalize();dir.applyAxisAngle(up,yaw);side.crossVectors(dir,up).normalize();
    const bp=Math.asin(clamp(dir.y,-1,1)),np=clamp(bp-pitch,-1.35,1.35);dir.applyAxisAngle(side,np-bp);
    camera.position.copy(pos);
    if(orb.k>0){const k=orb.k*orb.k*(3-2*orb.k),op=V(orb.t.x+Math.sin(orb.az)*Math.cos(orb.el)*orb.d,orb.t.y+Math.sin(orb.el)*orb.d,orb.t.z+Math.cos(orb.az)*Math.cos(orb.el)*orb.d);
      camera.position.lerp(op,k);const lk=pos.clone().add(dir.clone().multiplyScalar(dl)).lerp(orb.t,k);camera.lookAt(lk)}
    else{if(!reduce&&!flight)camera.position.y+=Math.sin(tt*.6)*.012;camera.lookAt(camera.position.clone().add(dir))}
    // geser pusat gambar menjauhi panel: ke kiri di desktop, ke atas di ponsel (bottom sheet)
    const vo=collapsed?0:MOB?0:(wp.offsetWidth+24)/2,vh=collapsed||!MOB?0:Math.min(wp.offsetHeight,innerHeight*.6)/2;ox+=(vo-ox)*Math.min(1,dt*4);oy+=(vh-oy)*Math.min(1,dt*4);
    if(Math.abs(ox-oxSet)>.3||Math.abs(oy-oySet)>.3){oxSet=ox;oySet=oy;camera.setViewOffset(innerWidth,innerHeight,ox,oy,innerWidth,innerHeight)}
    kick*=Math.exp(-dt*5);const fv=FOVB+fovZ+(reduce?0:kick*1.4);if(Math.abs(camera.fov-fv)>.01){camera.fov=fv;camera.updateProjectionMatrix()}
    rt.update(tt,dt,camera);def.tick&&def.tick(tt,dt,W);camera.updateMatrixWorld();updPins();
    const Lk=rt.look||L0,k=Math.min(1,dt*3);
    L0.exp+=((Lk.exp||1)-L0.exp)*k;for(let i=0;i<3;i++){L0.bl[i]+=((Lk.bloom||[.5,.6,.9])[i]-L0.bl[i])*k;L0.tint[i]+=((Lk.tint||[1,1,1])[i]-L0.tint[i])*k}L0.vig+=((Lk.vig==null?.35:Lk.vig)-L0.vig)*k;L0.grain+=((Lk.grain==null?.03:Lk.grain)-L0.grain)*k;L0.sat+=((Lk.sat||1)-L0.sat)*k;
    renderer.toneMappingExposure=L0.exp;
    if(quality>0&&composer){if(gtao)gtao.enabled=quality>=2;bloom.strength=L0.bl[0];bloom.radius=L0.bl[1];bloom.threshold=L0.bl[2];const u=grade.uniforms;u.uTime.value=tt%10;u.uVig.value=L0.vig;u.uGrain.value=L0.grain;u.uTint.value.set(...L0.tint);u.uSat.value=L0.sat;composer.render(dt)}
    else renderer.render(rt.scene,camera);
    if(autoQ&&quality>0){fT+=(raw-fT)*.08;fN++;if(fN>90&&fT>.05){applyQ(quality-1);fN=0;fT=.02}}}
  render();requestAnimationFrame(t=>{last=t;frame(t)});
  if(/[?&]bare=1/.test(location.search))document.body.classList.add('bare');
  window.__world=W;W.dbg=()=>({st:W.stationId,flying:!!flight,cam:camera.position.toArray().map(v=>+v.toFixed(2)),dir:camera.getWorldDirection(V(0,0,0)).toArray().map(v=>+v.toFixed(2)),orb:orb.on});
  const ld=$('#loader');if(ld){ld.classList.add('done');setTimeout(()=>ld.remove(),700)}
  window.__worldBoot=1;return W;
}
