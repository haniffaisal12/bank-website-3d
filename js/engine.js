/* Mesin halaman: dipakai bersama oleh semua halaman (index dan tiap konsep).
   start(concepts,{root,all,ideas}) membangun slide snap-scroll, HUD, dan loop render. */
import {$,AC,BGU,Box,CY,Cart,Cyl,EXRLoader,EffectComposer,GTAOPass,OutputPass,RBox,Reflector,RenderPass,RoundedBoxGeometry,ST,ShaderPass,Sky,Sph,T,TG,UnrealBloomPass,V,Water,brickHF,camera,canvas,clamp,ctex,dtex,emis,envCache,fbm,floorMat,glow,glowTex,hdri,hex2,leafGeo,leafMat,leafTexture,lerp,loadHdri,makeSky,mesh,noShadow,pbr,perfHF,physM,plankHF,pmrem,reduce,renderer,ridgeHF,rnd,rng,sstep,starField,stdM,sunDir,sunLight,tagSprite,textTex,tileHF,waterNormal,weaveHF,wetFloor,windowTex} from './core.js';
/* ---------- pipeline post-processing ---------- */
const GradeShader={uniforms:{tDiffuse:{value:null},uTime:{value:0},uVig:{value:.35},uGrain:{value:.03},uCA:{value:.0012},uTint:{value:new T.Vector3(1,1,1)},uLift:{value:new T.Vector3(0,0,0)},uSat:{value:1}},
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform sampler2D tDiffuse;uniform float uTime,uVig,uGrain,uCA,uSat;uniform vec3 uTint,uLift;varying vec2 vUv;
    float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+uTime)*43758.5453);}
    void main(){vec2 c=vUv-.5;float d=dot(c,c);vec2 o=c*d*uCA*8.;
      vec3 col=vec3(texture2D(tDiffuse,vUv+o).r,texture2D(tDiffuse,vUv).g,texture2D(tDiffuse,vUv-o).b);
      col=col*uTint+uLift;float l=dot(col,vec3(.2126,.7152,.0722));col=mix(vec3(l),col,uSat);
      col*=1.-uVig*smoothstep(.15,.75,d*2.2);
      col+=(h(vUv*vec2(1920.,1080.))-.5)*uGrain;
      gl_FragColor=vec4(max(col,0.),1.);}`};
let composer=null,rpass=null,bloom=null,gtao=null,grade=null,quality=2,autoQ=true;
function buildComposer(w,h){
  const rt=new T.WebGLRenderTarget(w,h,{type:T.HalfFloatType,samples:4});
  composer=new EffectComposer(renderer,rt);composer.setPixelRatio(renderer.getPixelRatio());composer.setSize(w,h);
  rpass=new RenderPass(new T.Scene(),camera);composer.addPass(rpass);
  try{gtao=new GTAOPass(new T.Scene(),camera,w,h);gtao.output=GTAOPass.OUTPUT.Default;gtao.updateGtaoMaterial({radius:.5,distanceExponent:1.4,thickness:1.2,scale:1.1,samples:12,distanceFallOff:1,screenSpaceRadius:false});gtao.updatePdMaterial({lumaPhi:10,depthPhi:2,normalPhi:3,radius:4,radiusExponent:1,rings:2,samples:8});composer.addPass(gtao)}catch(e){gtao=null}
  bloom=new UnrealBloomPass(new T.Vector2(w,h),.5,.6,.9);composer.addPass(bloom);
  grade=new ShaderPass(GradeShader);composer.addPass(grade);
  composer.addPass(new OutputPass());
}
function resizeAll(){if(!renderer)return;const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w/h<.9?72:55;camera.updateProjectionMatrix();if(!composer)buildComposer(w,h);else composer.setSize(w,h)}

export async function start(concepts,opts){
 opts=opts||{};
const scroller=$('#scroller');
/* ---------- bangun slide DOM ---------- */
let gi=0;const owner=[];
concepts.forEach(c=>{c.start=gi;c.n=c.slides.length;c.slides.forEach((s,i)=>{owner.push({c,i});gi++})});
const TOTAL=gi;
const ALL=opts.all||[],ROOT=opts.root||'',IDEAS=opts.ideas||[];
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
function mkUI(c){return{stat(id,v){document.querySelectorAll('[data-c="'+c.id+'"] [data-stat="'+id+'"] b').forEach(b=>{b.textContent=v})}}}

function slideHTML(c,s,i){
  if(s.cover){return '<div class="foot" style="flex-direction:column;flex-wrap:nowrap;align-items:stretch;gap:18px"><div class="big"><p class="tag">Bank inspirasi · '+ALL.length+' studi kasus</p><h1>Web 3D yang <em>masuk</em> ke dalam ceritanya.</h1><p class="lead">'+ALL.length+' konsep company profile dan e-commerce. Tiap konsep membawa kamera dari luar hingga menjelajahi interior dengan pencahayaan sinematik, pantulan, dan bayangan, plus tombol melayang yang mengubah adegan. Gulir untuk menonton, atau pilih satu di bawah.</p><span class="hint"><span></span>Gulir atau tekan panah bawah</span></div><div class="grid6">'+ALL.map(x=>'<a class="gc" style="--c:'+x.acc+'" href="'+ROOT+x.href+'"><i></i><strong>'+esc(x.name)+'</strong><span>'+esc(x.type)+'</span><small>'+esc(x.tag)+'</small></a>').join('')+'</div></div>'}
  if(s.ideas){return '<div class="foot" style="flex-direction:column;flex-wrap:nowrap;align-items:stretch;gap:12px"><div class="big"><p class="tag">Bank ide lanjutan</p><h1 style="font-size:clamp(1.7rem,4vw,3rem)">Delapan konsep berikutnya, siap dibangun dengan kerangka yang sama.</h1></div><div class="ideas"><div class="ideas-in">'+IDEAS.map(x=>'<div class="idea"><span>'+esc(x[0])+'</span><h4>'+esc(x[1])+'</h4><p>'+esc(x[2])+'</p></div>').join('')+'</div><div class="grammar"><span><b>Kamera</b> dolly-in · crane-down · fly-through · dive-cut · pull-back · orbit-reveal</span><span><b>Tombol</b> toggle suasana · aksi partikel · siklus varian · konfigurator · buka mekanisme</span></div></div></div>'}
  const items=(s.ui||[]).map((it,k)=>{
    if(it.t==='stat')return '<div class="chip" data-stat="'+it.id+'"><span>'+esc(it.label)+'</span><b>'+esc(it.val)+'</b></div>';
    const init=it.states?'<b>'+esc(it.states[it.def?1:0])+'</b>':'';
    return '<button class="fb" data-item="'+it.id+'" '+(it.t==='toggle'?'aria-pressed="'+!!it.def+'"':'')+'><i></i><span>'+esc(it.label)+'</span>'+init+'</button>'}).join('');
  let nxt='';if(ALL.length&&i===c.n-1&&c.id!=='cover'){const k=ALL.findIndex(x=>x.id===c.id),n=ALL[(k+1)%ALL.length];nxt='<a class="fb" href="'+ROOT+n.href+'" style="--acc:'+n.acc+'"><i></i><span>Konsep berikutnya</span><b>'+esc(n.name)+'</b></a>'}
  return '<div class="foot"><article class="card"><p class="tag">'+esc(c.name)+' · '+esc(s.tag)+'</p><h2>'+esc(s.title)+'</h2><p>'+esc(s.text)+'</p></article><div class="dock">'+items+'</div></div>'}
concepts.forEach(c=>{
  c.slides.forEach((s,i)=>{
    const sec=document.createElement('section');sec.className='slide';sec.dataset.c=c.id;sec.style.setProperty('--acc',c.acc);sec.innerHTML=slideHTML(c,s,i);scroller.appendChild(sec);s.el=sec;
    (s.ui||[]).forEach(it=>{if(it.t==='stat')return;it.on=!!it.def;it.i=it.on?1:0;it.c=c;const el=sec.querySelector('[data-item="'+it.id+'"]');it.el=el;el.addEventListener('click',()=>press(it,el))})
  })
});
concepts.forEach(c=>{c.ui=mkUI(c)});
function press(it,el){
  if(it.t==='toggle'){it.on=!it.on;it.i=it.on?1:0;el.setAttribute('aria-pressed',it.on)}
  else if(it.t==='cycle'){it.i=(it.i+1)%it.states.length}
  const b=el.querySelector('b');if(b&&it.states)b.textContent=it.states[it.i];
  if(it.t==='action'){el.classList.add('pulse');setTimeout(()=>el.classList.remove('pulse'),260)}
  const rt=it.c.rt;if(rt&&rt.actions[it.id])rt.actions[it.id](it.t==='toggle'?it.on:it.i,it)
}

/* ---------- HUD ---------- */
const dots=$('#dots'),brief=$('#brief'),menu=$('#menu');
menu.innerHTML='<h3>Peta konsep</h3><p class="sub">Tiap konsep punya halamannya sendiri.</p><a class="mi" style="--c:#5ee1ff" href="'+ROOT+'index.html"><em></em><strong>Beranda</strong><span>Semua konsep</span></a>'+ALL.map(c=>'<a class="mi" style="--c:'+c.acc+'" href="'+ROOT+c.href+'"><em></em><strong>'+esc(c.name)+'</strong><span>'+esc(c.type)+'</span></a>').join('');
function setBrief(c){brief.style.setProperty('--acc',c.acc);brief.innerHTML='<h3>'+esc(c.name)+'</h3><p class="sub">'+esc(c.type)+'</p><dl>'+Object.keys(c.brief).map(k=>'<div><dt>'+esc(k)+'</dt><dd>'+esc(c.brief[k])+'</dd></div>').join('')+'</dl>'}
function setDots(c){dots.innerHTML='';c.slides.forEach((s,i)=>{const b=document.createElement('button');b.setAttribute('aria-label',(s.tag||'Slide')+' '+(s.title||''));b.title=(s.tag||'')+(s.title?' · '+s.title:'');b.addEventListener('click',()=>go(c.start+i));dots.appendChild(b)});dots.style.display=c.n>1?'flex':'none'}
function go(i){i=clamp(i,0,TOTAL-1);scroller.scrollTo({top:i*scroller.clientHeight,behavior:reduce?'auto':'smooth'})}
document.addEventListener('click',e=>{const t=e.target.closest('[data-go]');if(t){go(+t.dataset.go);menu.classList.remove('open');$('#bMenu').setAttribute('aria-expanded','false')}});

function tog(panel,btn,other,ob){const o=panel.classList.toggle('open');btn.setAttribute('aria-expanded',o);if(o){other.classList.remove('open');ob.setAttribute('aria-expanded','false')}}
$('#bMenu').addEventListener('click',()=>tog(menu,$('#bMenu'),brief,$('#bBrief')));
$('#bBrief').addEventListener('click',()=>tog(brief,$('#bBrief'),menu,$('#bMenu')));
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){menu.classList.remove('open');brief.classList.remove('open');return}
  if(/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName))return;
  const cur=Math.round(scroller.scrollTop/scroller.clientHeight);
  if(e.key==='ArrowDown'||e.key==='PageDown'){e.preventDefault();go(cur+1)}
  else if(e.key==='ArrowUp'||e.key==='PageUp'){e.preventDefault();go(cur-1)}
  else if(e.key==='Home'){e.preventDefault();go(0)}else if(e.key==='End'){e.preventDefault();go(TOTAL-1)}
});
let mx=0,my=0,smx=0,smy=0;
addEventListener('pointermove',e=>{mx=e.clientX/innerWidth*2-1;my=e.clientY/innerHeight*2-1},{passive:true});
addEventListener('resize',resizeAll);resizeAll();

/* ---------- runtime per konsep (dibangun bertahap) ---------- */
function ensure(c){
  if(c.rt!==undefined)return c.rt;
  if(!renderer){c.rt=null;return null}
  try{
    c.rt=c.build(c.ui);
  }catch(e){console.error(c.id,e);c.rt=null}
  if(c.rt&&c.rt.setQ)c.rt.setQ(quality);
  c.pos=c.n>1?new T.CatmullRomCurve3(c.slides.map(s=>V(s.cam[0],s.cam[1],s.cam[2])),false,'catmullrom',.5):null;
  c.lookC=c.n>1?new T.CatmullRomCurve3(c.slides.map(s=>V(s.look[0],s.look[1],s.look[2])),false,'catmullrom',.5):null;
  if(c.rt&&c.rt.scene&&!c.rt.aoHide){const l=[];c.rt.scene.traverse(o=>{const m=o.material;if(o.isSprite||o.isPoints||o.isLine||(m&&!Array.isArray(m)&&m.transparent&&!m.alphaTest&&!m.alphaMap)||(m&&m.isShaderMaterial))l.push(o)});c.rt.aoHide=l}
  return c.rt;
}
/* ---------- kualitas ---------- */
const QN=['Hemat','Sedang','Tinggi'];const QP=matchMedia('(max-width:560px)').matches?'Q: ':'Kualitas: ';
const qb=document.createElement('button');qb.className='tb';qb.id='bQ';qb.textContent=QP+'Auto';$('.tools').prepend(qb);

function applyQ(q){quality=q;concepts.forEach(c=>{if(c.rt&&c.rt.setQ)c.rt.setQ(q)});if(renderer)renderer.setPixelRatio(q===0?1:Math.min(devicePixelRatio||1,SMALL?1.25:1.5));resizeAll()}
{const qp=new URLSearchParams(location.search).get('q');if(qp!=null){autoQ=false;quality=clamp(+qp||0,0,2)}else if(matchMedia('(max-width:820px)').matches||matchMedia('(pointer:coarse)').matches){quality=1}}
qb.addEventListener('click',()=>{if(autoQ){autoQ=false;applyQ(2)}else if(quality===2)applyQ(1);else if(quality===1)applyQ(0);else{autoQ=true;applyQ(2)}qb.textContent=QP+(autoQ?'Auto':QN[quality])});
if(!autoQ||quality!==2)qb.textContent=QP+(autoQ?'Auto':QN[quality]);
const SMALL=matchMedia('(max-width:820px)').matches||matchMedia('(pointer:coarse)').matches;
let hideAO=[];if(gtao){const orig=gtao.render.bind(gtao);gtao.render=function(...a){const l=hideAO;l.forEach(o=>{o._v=o.visible;o.visible=false});orig(...a);l.forEach(o=>{o.visible=o._v})}}
/* ---------- loop ---------- */
let sp=0,curC=null,curDot=-1,tt=0,last=performance.now(),fT=0.016,fN=0;
const iris=$('#iris'),tp=new T.Vector3(),tl=new T.Vector3();
const cur={exp:1,bl:[.5,.6,.9],vig:.35,grain:.03,tint:[1,1,1],sat:1};
function frame(now){
  requestAnimationFrame(frame);
  const raw=(now-last)/1000;const dt=Math.min(raw,.05);last=now;tt+=dt;
  const target=scroller.scrollTop/Math.max(1,scroller.clientHeight);
  sp+=(target-sp)*(reduce?1:1-Math.exp(-dt*4.5));
  const idx=clamp(Math.round(sp),0,TOTAL-1),o=owner[idx],c=o.c;
  if(c!==curC){curC=c;document.documentElement.style.setProperty('--acc',c.acc);setBrief(c);setDots(c);curDot=-1}
  if(curDot!==o.i){curDot=o.i;[...dots.children].forEach((b,k)=>b.classList.toggle('on',k===o.i))}
  const fl=Math.floor(sp);let io=0;if(fl>=0&&fl<TOTAL-1&&owner[fl].c!==owner[fl+1].c){io=clamp(1-Math.abs(sp-(fl+.5))/.32,0,1);io=Math.pow(io,.8)}
  iris.style.opacity=io.toFixed(3);
  if(!renderer)return;
  const rt=ensure(c);if(!rt)return;
  const local=clamp(sp-c.start,0,c.n-1);
  if(c.pos){const u=local/(c.n-1);c.pos.getPoint(u,tp);c.lookC.getPoint(u,tl)}else{const s0=c.slides[0];tp.set(s0.cam[0],s0.cam[1],s0.cam[2]);tl.set(s0.look[0],s0.look[1],s0.look[2])}
  smx+=(mx-smx)*Math.min(1,dt*3);smy+=(my-smy)*Math.min(1,dt*3);
  camera.position.copy(tp);if(!reduce)camera.position.y+=Math.sin(tt*.7)*.03;camera.lookAt(tl);
  if(!reduce){camera.translateX(smx*.3);camera.translateY(-smy*.18)}
  rt.update(tt,dt,camera);
  const L=rt.look||{},k=Math.min(1,dt*3);
  cur.exp+=((L.exp||1)-cur.exp)*k;for(let i=0;i<3;i++){cur.bl[i]+=((L.bloom||[.5,.6,.9])[i]-cur.bl[i])*k;cur.tint[i]+=((L.tint||[1,1,1])[i]-cur.tint[i])*k}
  cur.vig+=((L.vig==null?.35:L.vig)-cur.vig)*k;cur.grain+=((L.grain==null?.03:L.grain)-cur.grain)*k;cur.sat+=((L.sat||1)-cur.sat)*k;
  renderer.toneMappingExposure=cur.exp;
  if(quality>0&&composer){
    rpass.scene=rt.scene;if(gtao){gtao.scene=rt.scene;gtao.enabled=quality>=2;hideAO=rt.aoHide||[]}
    bloom.strength=cur.bl[0];bloom.radius=cur.bl[1];bloom.threshold=cur.bl[2];
    const u=grade.uniforms;u.uTime.value=tt%10;u.uVig.value=cur.vig;u.uGrain.value=cur.grain;u.uTint.value.set(cur.tint[0],cur.tint[1],cur.tint[2]);u.uSat.value=cur.sat;
    composer.render(dt);
  }else renderer.render(rt.scene,camera);
  if(autoQ&&quality>0){fT+=(raw-fT)*.08;fN++;if(fN>80&&fT>.05){applyQ(quality-1);fN=0;fT=.02;qb.textContent=QP+'Auto'}}
}
concepts.forEach(c=>ensure(c));requestAnimationFrame(t=>{last=t;frame(t)});
if(true)window.__bank={go,concepts,applyQ,jump(i){sp=i;const s=$('#scroller');s.style.scrollBehavior='auto';s.scrollTo(0,i*s.clientHeight)},get quality(){return quality}};
window.__bankBoot=1;const ld=$('#loader');if(ld){ld.classList.add('done');setTimeout(()=>ld.remove(),700)}

}
