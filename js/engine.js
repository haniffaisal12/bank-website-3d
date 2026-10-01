/* Mesin halaman: dipakai bersama oleh semua halaman (index dan tiap konsep).
   start(concepts,{root,all,ideas}) membangun slide snap-scroll, HUD, dan loop render. */
import {$,AC,BGU,Box,CY,Cart,Cyl,EXRLoader,EffectComposer,GTAOPass,OutputPass,RBox,Reflector,RenderPass,RoundedBoxGeometry,ST,ShaderPass,Sky,Sph,T,TG,UnrealBloomPass,V,Water,brickHF,camera,canvas,clamp,ctex,dtex,emis,envCache,fbm,floorMat,glow,glowTex,hdri,hex2,leafGeo,leafMat,leafTexture,lerp,loadHdri,makeSky,mesh,noShadow,pbr,perfHF,physM,plankHF,pmrem,reduce,renderer,ridgeHF,rnd,rng,sstep,starField,stdM,sunDir,sunLight,tagSprite,textTex,tileHF,waterNormal,weaveHF,wetFloor,windowTex} from './core.js';
import * as SND from './audio.js';
import {META,DISCLAIMER} from './study.js';
let FOVB=55;
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
function resizeAll(){if(!renderer)return;const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;FOVB=w/h<.9?72:55;camera.fov=FOVB;camera.updateProjectionMatrix();if(!composer)buildComposer(w,h);else composer.setSize(w,h)}

/* objek transparan, sprite, dan partikel dikeluarkan dari pass oklusi ambien supaya tidak menggelapkan sekitarnya */
function collectAO(scene){const l=[];scene.traverse(o=>{const m=o.material;if(o.isSprite||o.isPoints||o.isLine||(m&&!Array.isArray(m)&&m.transparent&&!m.alphaTest&&!m.alphaMap)||(m&&m.isShaderMaterial))l.push(o)});return l}
export async function start(concepts,opts){
 opts=opts||{};
const scroller=$('#scroller');
/* ---------- bangun slide DOM ---------- */
const META_=opts.meta||META;
concepts.forEach(c=>{const m=META_[c.id];if(!m)return;c.study=m.study;c.hotspots=m.hotspots||[];c.audio=m.audio||null;
  if(m.study&&!c.slides.some(x=>x.caseStudy)){const last=c.slides[c.slides.length-1];c.slides.push({caseStudy:true,tag:'Studi kasus',title:'Studi kasus',cam:last.cam,look:last.look})}});
let gi=0;const owner=[];
concepts.forEach(c=>{c.start=gi;c.n=c.slides.length;c.slides.forEach((s,i)=>{owner.push({c,i});gi++})});
const TOTAL=gi;
const ALL=opts.all||[],ROOT=opts.root||'',IDEAS=opts.ideas||[];
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
function mkUI(c){return{site:()=>c.site,sfx:(n,a)=>SND.sfx(n,a),kick:a=>{kick=Math.max(kick,a||1);shake=Math.max(shake,(a||1)*.25)},press(id){for(const s of c.slides)for(const it of(s.ui||[]))if(it.id===id&&it.el){press(it,it.el);return}},stat(id,v){document.querySelectorAll('[data-c="'+c.id+'"] [data-stat="'+id+'"] b').forEach(b=>{b.textContent=v})}}}

function slideHTML(c,s,i){
  if(s.cover){return '<div class="foot" style="flex-direction:column;flex-wrap:nowrap;align-items:stretch;gap:18px"><div class="big"><p class="tag">Bank inspirasi · '+ALL.length+' studi kasus</p><h1>Web 3D yang <em>masuk</em> ke dalam ceritanya.</h1><p class="lead">'+ALL.length+' konsep company profile dan e-commerce. Tiap konsep membawa kamera dari luar hingga menjelajahi interior dengan pencahayaan sinematik, pantulan, dan bayangan, plus tombol melayang, titik panas yang bisa diklik, dan suara. Slide terakhir tiap konsep berisi studi kasusnya. Gulir untuk menonton, atau pilih satu di bawah.</p><span class="hint"><span></span>Gulir atau tekan panah bawah</span></div><div class="grid6">'+ALL.map(x=>'<a class="gc" style="--c:'+x.acc+'" href="'+ROOT+x.href+'"><i></i><strong>'+esc(x.name)+'</strong><span>'+esc(x.type)+'</span><small>'+esc(x.tag)+'</small></a>').join('')+'</div><p class="sitelinks"><b>Situs lengkap:</b> '+ALL.map(x=>'<a href="'+ROOT+'sites/'+x.id+'.html" style="--c:'+x.acc+'">'+esc(x.name)+'</a>').join('')+'</p></div>'}
  if(s.ideas){return '<div class="foot" style="flex-direction:column;flex-wrap:nowrap;align-items:stretch;gap:12px"><div class="big"><p class="tag">Bank ide lanjutan</p><h1 style="font-size:clamp(1.7rem,4vw,3rem)">Delapan konsep berikutnya, siap dibangun dengan kerangka yang sama.</h1></div><div class="ideas"><div class="ideas-in">'+IDEAS.map(x=>'<div class="idea"><span>'+esc(x[0])+'</span><h4>'+esc(x[1])+'</h4><p>'+esc(x[2])+'</p></div>').join('')+'</div><div class="grammar"><span><b>Kamera</b> dolly-in · crane-down · fly-through · dive-cut · pull-back · orbit-reveal</span><span><b>Tombol</b> toggle suasana · aksi partikel · siklus varian · konfigurator · buka mekanisme</span></div></div></div>'}
  if(s.caseStudy){const st=c.study,k=ALL.findIndex(x=>x.id===c.id),n=ALL.length?ALL[(k+1)%ALL.length]:null;
    return '<div class="foot case-foot"><article class="case"><p class="tag">Studi kasus · '+esc(c.name)+'</p><h2>'+esc(st.klien)+'</h2><p class="cs-meta">'+esc(st.peran)+' · '+esc(st.durasi)+'</p>'
    +'<div class="cs-cols"><section><h3>Tantangan</h3><p>'+esc(st.tantangan)+'</p></section><section><h3>Pendekatan</h3><ul>'+st.pendekatan.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></section></div>'
    +'<h3>Keputusan desain</h3><div class="cs-dec">'+st.keputusan.map(x=>'<div class="cs-d"><strong>'+esc(x.t)+'</strong><p>'+esc(x.d)+'</p><button class="cs-go" data-go="'+(c.start+x.slide)+'">Lihat di adegan</button></div>').join('')+'</div>'
    +'<h3>Target (hipotesis)</h3><div class="cs-kpi">'+st.target.map(x=>'<div><b>'+esc(x.v)+'</b><span>'+esc(x.l)+'</span></div>').join('')+'</div>'
    +'<p class="cs-stack">'+st.stack.map(x=>'<span>'+esc(x)+'</span>').join('')+'</p><p class="cs-note">'+esc(DISCLAIMER)+'</p>'
    +'<div class="cs-act"><button class="fb" data-go="'+c.start+'"><i></i><span>Ulangi dari awal</span></button>'+(n?'<a class="fb" href="'+ROOT+n.href+'" style="--acc:'+n.acc+'"><i></i><span>Konsep berikutnya</span><b>'+esc(n.name)+'</b></a>':'')+'</div></article></div>'}
  const items=(s.ui||[]).map((it,k)=>{
    if(it.t==='stat')return '<div class="chip" data-stat="'+it.id+'"><span>'+esc(it.label)+'</span><b>'+esc(it.val)+'</b></div>';
    const init=it.states?'<b>'+esc(it.states[it.def?1:0])+'</b>':'';
    return '<button class="fb" data-item="'+it.id+'" '+(it.t==='toggle'?'aria-pressed="'+!!it.def+'"':'')+'><i></i><span>'+esc(it.label)+'</span>'+init+'</button>'}).join('');
  let nxt='';if(false){const k=ALL.findIndex(x=>x.id===c.id),n=ALL[(k+1)%ALL.length];nxt='<a class="fb" href="'+ROOT+n.href+'" style="--acc:'+n.acc+'"><i></i><span>Konsep berikutnya</span><b>'+esc(n.name)+'</b></a>'}
  return '<div class="foot"><article class="card"><p class="tag">'+esc(c.name)+' · '+esc(s.tag)+'</p><h2>'+esc(s.title)+'</h2><p>'+esc(s.text)+'</p></article><div class="dock">'+items+'</div></div>'}
concepts.forEach(c=>{
  c.slides.forEach((s,i)=>{
    const sec=document.createElement('section');sec.className='slide';sec.dataset.c=c.id;sec.style.setProperty('--acc',c.acc);sec.innerHTML=slideHTML(c,s,i);scroller.appendChild(sec);s.el=sec;
    (s.ui||[]).forEach(it=>{if(it.t==='stat')return;it.on=!!it.def;it.i=it.on?1:0;it.c=c;const el=sec.querySelector('[data-item="'+it.id+'"]');it.el=el;el.addEventListener('click',()=>press(it,el))})
  })
});
concepts.forEach(c=>{c.ui=mkUI(c);import('./sites/'+c.id+'.js').then(m=>{c.site=m.default}).catch(()=>{})});
const SFXMAP={feed:'plop',water:'rain',brew:'pour',scan:'scan',power:'power',oc:'zap',cart:'coin',book:'chime',night:'chime',lava:'rumble',slit:'servo',species:'plop',neon:'zap',spin:'engine',lights:'on',roast:'sizzle',unzip:'servo',svc:'chime',uv:'power',aim:'servo',cons:'ping',holo:'cycle',way:'cycle',rims:'cycle',paint:'cycle'};
function itemSfx(it){const m=SFXMAP[it.id];if(it.t==='toggle'&&!m)return SND.sfx(it.on?'on':'off');if(m==='on')return SND.sfx(it.on?'on':'off');SND.sfx(m||'click',it.i);if(it.id==='water')setTimeout(()=>SND.sfx('grow'),900)}
function press(it,el){itemSfx(it);kick=Math.max(kick,1.2);shake=Math.max(shake,.12);try{navigator.vibrate&&navigator.vibrate(8)}catch(e){}
  if(it.t==='toggle'){it.on=!it.on;it.i=it.on?1:0;el.setAttribute('aria-pressed',it.on)}
  else if(it.t==='cycle'){it.i=(it.i+1)%it.states.length}
  const b=el.querySelector('b');if(b&&it.states)b.textContent=it.states[it.i];
  if(it.t==='action'){el.classList.add('pulse');setTimeout(()=>el.classList.remove('pulse'),260)}
  const rt=it.c.rt;if(rt&&rt.actions[it.id])rt.actions[it.id](it.t==='toggle'?it.on:it.i,it)
}

/* ---------- HUD ---------- */
const dots=$('#dots'),brief=$('#brief'),menu=$('#menu');
menu.innerHTML='<h3>Peta konsep</h3><p class="sub">Tiap konsep punya halamannya sendiri.</p><a class="mi" style="--c:#5ee1ff" href="'+ROOT+'index.html"><em></em><strong>Beranda</strong><span>Semua konsep</span></a>'+ALL.map(c=>'<a class="mi" style="--c:'+c.acc+'" href="'+ROOT+c.href+'"><em></em><strong>'+esc(c.name)+'</strong><span>'+esc(c.type)+'</span></a>').join('')+'<h3 style="margin-top:1.2rem">Situs lengkap</h3>'+ALL.map(c=>'<a class="mi" style="--c:'+c.acc+'" href="'+ROOT+'sites/'+c.id+'.html"><em></em><strong>'+esc(c.name)+'</strong><span>Buka situs</span></a>').join('');
function setBrief(c){brief.style.setProperty('--acc',c.acc);brief.innerHTML='<h3>'+esc(c.name)+'</h3><p class="sub">'+esc(c.type)+'</p><dl>'+Object.keys(c.brief).map(k=>'<div><dt>'+esc(k)+'</dt><dd>'+esc(c.brief[k])+'</dd></div>').join('')+'</dl>'}
function setDots(c){dots.innerHTML='';c.slides.forEach((s,i)=>{const b=document.createElement('button');b.setAttribute('aria-label',(s.tag||'Slide')+' '+(s.title||''));b.title=(s.tag||'')+(s.title?' · '+s.title:'');b.addEventListener('click',()=>go(c.start+i));dots.appendChild(b)});dots.style.display=c.n>1?'flex':'none'}
function go(i){i=clamp(i,0,TOTAL-1);scroller.scrollTo({top:i*scroller.clientHeight,behavior:reduce?'auto':'smooth'})}
document.addEventListener('click',e=>{const t=e.target.closest('[data-go]');if(t){go(+t.dataset.go);menu.classList.remove('open');$('#bMenu').setAttribute('aria-expanded','false')}});

function tog(panel,btn,other,ob){const o=panel.classList.toggle('open');btn.setAttribute('aria-expanded',o);if(o){other.classList.remove('open');ob.setAttribute('aria-expanded','false')}}
$('#bMenu').addEventListener('click',()=>tog(menu,$('#bMenu'),brief,$('#bBrief')));
$('#bBrief').addEventListener('click',()=>tog(brief,$('#bBrief'),menu,$('#bMenu')));
if(concepts.length===1){const sl=document.createElement('a');sl.className='tb';sl.id='bSite';sl.href=ROOT+'sites/'+concepts[0].id+'.html';sl.textContent=matchMedia('(max-width:560px)').matches?'Situs':'Buka situs';$('.tools').prepend(sl)}
if(concepts.length===1&&concepts[0].study){const cb=document.createElement('button');cb.className='tb';cb.id='bCase';cb.textContent=SQ0()?'Kasus':'Studi kasus';$('.tools').prepend(cb);cb.addEventListener('click',()=>go(concepts[0].start+concepts[0].n-1))}
function SQ0(){return matchMedia('(max-width:560px)').matches}
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){menu.classList.remove('open');brief.classList.remove('open');return}
  if(/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName))return;
  const cur=Math.round(scroller.scrollTop/scroller.clientHeight);
  if(e.key==='ArrowDown'||e.key==='PageDown'){e.preventDefault();go(cur+1)}
  else if(e.key==='ArrowUp'||e.key==='PageUp'){e.preventDefault();go(cur-1)}
  else if(e.key==='Home'){e.preventDefault();go(0)}else if(e.key==='End'){e.preventDefault();go(TOTAL-1)}
});
let kick=0,shake=0;
/* ---------- suara, titik panas, klik 3D, kursor ---------- */
const FINE=matchMedia('(pointer:fine)').matches;
const sndB=document.createElement('button');sndB.className='tb';sndB.id='bSnd';$('.tools').prepend(sndB);
const SQ=matchMedia('(max-width:560px)').matches;
function sndLabel(){sndB.textContent=(SQ?'':'Suara: ')+(SND.isOn()?'Nyala':'Mati');sndB.setAttribute('aria-pressed',SND.isOn())}sndLabel();
let ambKind=null;
function applyAmbient(){const c=curC;if(!c||!SND.ready())return;const k=c.audio&&c.audio[Math.max(0,curDot)];if(SND.isOn()&&k&&k!==ambKind){ambKind=k;SND.ambient(k)}}
function unlock(){if(!SND.ready()){if(SND.init()){applyAmbient();toast.classList.remove('show')}}}
const toast=document.createElement('div');toast.id='toast';toast.textContent=SND.isOn()?'Klik di mana saja untuk mengaktifkan suara':'Suara dimatikan';document.body.appendChild(toast);
if(SND.isOn()){setTimeout(()=>toast.classList.add('show'),1800);setTimeout(()=>toast.classList.remove('show'),9000)}
sndB.addEventListener('click',e=>{e.stopPropagation();unlock();SND.setOn(!SND.isOn());sndLabel();if(SND.isOn()){ambKind=null;applyAmbient();SND.sfx('on')}});
addEventListener('pointerdown',unlock,{once:false,passive:true});addEventListener('keydown',unlock,{passive:true});
document.addEventListener('pointerover',e=>{if(e.target.closest&&e.target.closest('.fb,.tb,.gc,.mi,.cs-go,#dots button'))SND.sfx('hover')},{passive:true});
document.addEventListener('click',e=>{const t=e.target;if(t.closest&&t.closest('.tb,#dots button,.gc,.mi,.cs-go,.brand'))SND.sfx('click')});
// riak klik dan kursor
const cur_=document.createElement('div');cur_.id='cur';document.body.appendChild(cur_);let cxp=-50,cyp=-50,tcx=-50,tcy=-50;
addEventListener('pointermove',e=>{tcx=e.clientX;tcy=e.clientY;const hot=e.target.closest&&e.target.closest('.fb,.tb,.gc,.mi,.cs-go,.hs,#dots button,a,button');cur_.classList.toggle('hot',!!(hot||pickHover))},{passive:true});
addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&!e.target.closest('.slide'))return;const r=document.createElement('i');r.className='rip';r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';document.body.appendChild(r);setTimeout(()=>r.remove(),700)},{passive:true});
// titik panas
const hsLayer=document.createElement('div');hsLayer.id='hs';document.body.appendChild(hsLayer);
const hsCard=document.createElement('div');hsCard.id='hsCard';hsCard.hidden=true;document.body.appendChild(hsCard);
let openHS=null;
function closeHS(){hsCard.hidden=true;openHS=null;[...hsLayer.children].forEach(b=>b.classList.remove('on'))}
concepts.forEach(c=>{(c.hotspots||[]).forEach((h,k)=>{const b=document.createElement('button');b.className='hs';b.setAttribute('aria-label',h.t);b.dataset.c=c.id;b.style.setProperty('--acc',c.acc);b.innerHTML='<i></i><span>'+esc(h.t)+'</span>';b.hidden=true;hsLayer.appendChild(b);h.el=b;h.v3=V(h.pos[0],h.pos[1],h.pos[2]);
  b.addEventListener('click',e=>{e.stopPropagation();if(openHS===h){closeHS();return}closeHS();openHS=h;b.classList.add('on');hsCard.innerHTML='<strong>'+esc(h.t)+'</strong><p>'+esc(h.d)+'</p>';hsCard.hidden=false;hsCard.style.setProperty('--acc',c.acc);SND.sfx('card');kick=Math.max(kick,.8)})})});
addEventListener('keydown',e=>{if(e.key==='Escape')closeHS()});
scroller.addEventListener('click',e=>{if(!e.target.closest('.hs,#hsCard'))closeHS()});
const hv=new T.Vector3();
function updateHS(c,sp_){
  const vis=[];(c.hotspots||[]).forEach(h=>{const dist=Math.abs(sp_-(c.start+h.slide));let a=clamp(1-(dist-.15)/.35,0,1);
    if(a>0){hv.copy(h.v3).project(camera);if(hv.z>1||hv.z<-1)a=0;else{h.sx=(hv.x*.5+.5)*innerWidth;h.sy=(-hv.y*.5+.5)*innerHeight;if(h.sx<8||h.sx>innerWidth-8||h.sy<60||h.sy>innerHeight-8)a=0}}
    const el=h.el;if(a<=0){if(!el.hidden){el.hidden=true;if(openHS===h)closeHS()}}else{el.hidden=false;el.style.opacity=a.toFixed(2);el.style.transform='translate('+h.sx.toFixed(1)+'px,'+h.sy.toFixed(1)+'px)'}});
  if(openHS&&!openHS.el.hidden){const w=hsCard.offsetWidth||260,x=clamp(openHS.sx+18,10,innerWidth-w-10),y=clamp(openHS.sy+18,70,innerHeight-(hsCard.offsetHeight||120)-10);hsCard.style.transform='translate('+x+'px,'+y+'px)'}}
function hideAllHS(c){hsLayer.querySelectorAll('.hs').forEach(b=>{if(b.dataset.c!==c.id&&!b.hidden)b.hidden=true})}
// klik objek 3D
const ray=new T.Raycaster(),pn=new T.Vector2();let pickHover=false,pickTick=0,lastPointer=null;
const hintEl=document.createElement('div');hintEl.id='pickHint';hintEl.hidden=true;document.body.appendChild(hintEl);
function pickAt(x,y){const c=curC;if(!c||!c.rt||!c.rt.pick)return null;pn.set(x/innerWidth*2-1,-(y/innerHeight)*2+1);ray.setFromCamera(pn,camera);
  for(const pk of c.rt.pick){const objs=(typeof pk.objects==='function'?pk.objects():pk.objects)||[];const hit=ray.intersectObjects(objs,true)[0];if(hit)return{pk,hit}}return null}
function pickable(el){return el&&!el.closest('.card,.dock,.fb,.chip,.gc,.ideas,.case,.hs,#hsCard,button,a,.panel,.hud')}
scroller.addEventListener('pointermove',e=>{lastPointer=e;if(!pickable(e.target)){if(pickHover){pickHover=false;hintEl.hidden=true;scroller.style.cursor=''}return}if(++pickTick%4)return;const r=pickAt(e.clientX,e.clientY);const was=pickHover;pickHover=!!r;if(r){hintEl.hidden=false;hintEl.textContent=r.pk.hint||'Klik';hintEl.style.transform='translate('+(e.clientX+16)+'px,'+(e.clientY+14)+'px)'}else hintEl.hidden=true;if(was!==pickHover)cur_.classList.toggle('hot',pickHover)},{passive:true});
scroller.addEventListener('click',e=>{if(!pickable(e.target))return;const r=pickAt(e.clientX,e.clientY);if(r){SND.sfx('ping');curC.ui.press(r.pk.id)}});
// progres dan reveal
const prog=document.createElement('div');prog.id='prog';document.body.appendChild(prog);let liveEl=null;
let prevIdx=-1;
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
  if(c.rt&&c.rt.scene)c.rt.aoHide=collectAO(c.rt.scene);
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
let aoTick=0,sp=0,curC=null,curDot=-1,tt=0,last=performance.now(),fT=0.016,fN=0;
const iris=$('#iris'),tp=new T.Vector3(),tl=new T.Vector3();
const cur={exp:1,bl:[.5,.6,.9],vig:.35,grain:.03,tint:[1,1,1],sat:1};
function frame(now){
  requestAnimationFrame(frame);
  const raw=(now-last)/1000;const dt=Math.min(raw,.05);last=now;tt+=dt;
  const target=scroller.scrollTop/Math.max(1,scroller.clientHeight);
  sp+=(target-sp)*(reduce?1:1-Math.exp(-dt*4.5));
  const idx=clamp(Math.round(sp),0,TOTAL-1),o=owner[idx],c=o.c;
  if(c!==curC){curC=c;document.documentElement.style.setProperty('--acc',c.acc);setBrief(c);setDots(c);curDot=-1}
  if(curDot!==o.i){curDot=o.i;[...dots.children].forEach((b,k)=>b.classList.toggle('on',k===o.i));applyAmbient()}
  if(idx!==prevIdx){if(prevIdx>=0){SND.sfx('whoosh',idx>prevIdx?1:-1);kick=Math.max(kick,2.2);closeHS()}prevIdx=idx;if(liveEl)liveEl.classList.remove('live');liveEl=c.slides[o.i].el;liveEl.classList.add('live');hideAllHS(c)}
  prog.style.transform='scaleX('+(clamp(sp,0,TOTAL-1)/Math.max(1,TOTAL-1)).toFixed(4)+')';
  if(FINE){cxp+=(tcx-cxp)*Math.min(1,dt*18);cyp+=(tcy-cyp)*Math.min(1,dt*18);cur_.style.transform='translate('+cxp.toFixed(1)+'px,'+cyp.toFixed(1)+'px)'}
  const fl=Math.floor(sp);let io=0;if(fl>=0&&fl<TOTAL-1&&owner[fl].c!==owner[fl+1].c){io=clamp(1-Math.abs(sp-(fl+.5))/.32,0,1);io=Math.pow(io,.8)}
  iris.style.opacity=io.toFixed(3);
  if(!renderer)return;
  const rt=ensure(c);if(!rt)return;
  const local=clamp(sp-c.start,0,c.n-1);
  if(c.pos){const u=local/(c.n-1);c.pos.getPoint(u,tp);c.lookC.getPoint(u,tl)}else{const s0=c.slides[0];tp.set(s0.cam[0],s0.cam[1],s0.cam[2]);tl.set(s0.look[0],s0.look[1],s0.look[2])}
  smx+=(mx-smx)*Math.min(1,dt*3);smy+=(my-smy)*Math.min(1,dt*3);
  camera.position.copy(tp);if(!reduce)camera.position.y+=Math.sin(tt*.7)*.03;camera.lookAt(tl);
  if(!reduce){camera.translateX(smx*.3);camera.translateY(-smy*.18);if(shake>.002){camera.translateX((Math.random()-.5)*shake);camera.translateY((Math.random()-.5)*shake)}}
  kick*=Math.exp(-dt*5);shake*=Math.exp(-dt*9);const fv=FOVB+(reduce?0:kick*1.6);if(Math.abs(camera.fov-fv)>.01){camera.fov=fv;camera.updateProjectionMatrix()}
  rt.update(tt,dt,camera);camera.updateMatrixWorld();updateHS(c,sp);
  const L=rt.look||{},k=Math.min(1,dt*3);
  cur.exp+=((L.exp||1)-cur.exp)*k;for(let i=0;i<3;i++){cur.bl[i]+=((L.bloom||[.5,.6,.9])[i]-cur.bl[i])*k;cur.tint[i]+=((L.tint||[1,1,1])[i]-cur.tint[i])*k}
  cur.vig+=((L.vig==null?.35:L.vig)-cur.vig)*k;cur.grain+=((L.grain==null?.03:L.grain)-cur.grain)*k;cur.sat+=((L.sat||1)-cur.sat)*k;
  renderer.toneMappingExposure=cur.exp;
  if(quality>0&&composer){
    rpass.scene=rt.scene;if(gtao){gtao.scene=rt.scene;gtao.enabled=quality>=2;if(rt.scene.userData.aoDirty||++aoTick%600===0){rt.scene.userData.aoDirty=false;rt.aoHide=collectAO(rt.scene)}hideAO=rt.aoHide||[]}
    bloom.strength=cur.bl[0];bloom.radius=cur.bl[1];bloom.threshold=cur.bl[2];
    const u=grade.uniforms;u.uTime.value=tt%10;u.uVig.value=cur.vig;u.uGrain.value=cur.grain;u.uTint.value.set(cur.tint[0],cur.tint[1],cur.tint[2]);u.uSat.value=cur.sat;
    composer.render(dt);
  }else renderer.render(rt.scene,camera);
  if(autoQ&&quality>0){fT+=(raw-fT)*.08;fN++;if(fN>80&&fT>.05){applyQ(quality-1);fN=0;fT=.02;qb.textContent=QP+'Auto'}}
}
concepts.forEach(c=>ensure(c));requestAnimationFrame(t=>{last=t;frame(t)});
if(true)window.__bank={go,concepts,applyQ,jump(i){sp=i;const s=$('#scroller');s.style.scrollBehavior='auto';s.scrollTo(0,i*s.clientHeight)},get quality(){return quality},get dbg(){return{sp,cam:camera.position.toArray().map(v=>+v.toFixed(1)),top:scroller.scrollTop,h:scroller.clientHeight}}};
if(/[?&]bare=1/.test(location.search))document.body.classList.add('bare');
window.__bankBoot=1;const ld=$('#loader');if(ld){ld.classList.add('done');setTimeout(()=>ld.remove(),700)}

}
