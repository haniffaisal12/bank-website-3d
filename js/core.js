import {cart as CS,totals as CSt} from './site/store.js';
import * as T from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {GTAOPass} from 'three/addons/postprocessing/GTAOPass.js';
import {EXRLoader} from 'three/addons/loaders/EXRLoader.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {Sky} from 'three/addons/objects/Sky.js';
import {Water} from 'three/addons/objects/Water.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';
import * as BGU from 'three/addons/utils/BufferGeometryUtils.js';

const $=(s,r)=>(r||document).querySelector(s);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const rnd=(a,b)=>a+Math.random()*(b-a);
const sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const V=(x,y,z)=>new T.Vector3(x,y,z);
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const rng=seed=>{let s=(seed>>>0)||1;return()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296)};

/* ---------- renderer ---------- */
let renderer=null;
try{
  renderer=new T.WebGLRenderer({canvas:$('#gl'),antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,(matchMedia('(max-width:820px)').matches||matchMedia('(pointer:coarse)').matches)?1.25:1.5));
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=T.PCFSoftShadowMap;
  RectAreaLightUniformsLib.init();
}catch(e){renderer=null;$('#nogl').style.display='grid'}
const camera=new T.PerspectiveCamera(55,1,.1,2000);camera.layers.enable(1);
const pmrem=renderer?new T.PMREMGenerator(renderer):null;

/* ---------- HDRI (Poly Haven, CC0) dimuat dari assets/hdri ---------- */
const envCache={},hdriRaw={};
async function loadHdri(names){
  await Promise.all((names||[]).map(async n=>{if(hdriRaw[n])return;const r=await fetch(new URL('../assets/hdri/'+n+'.exr',import.meta.url));hdriRaw[n]=await r.arrayBuffer()}));
}
function hdri(name){
  if(envCache[name])return envCache[name];
  const d=new EXRLoader().parse(hdriRaw[name].slice(0));
  const tex=new T.DataTexture(d.data,d.width,d.height,d.format,d.type);
  tex.colorSpace=T.LinearSRGBColorSpace;tex.minFilter=T.LinearFilter;tex.magFilter=T.LinearFilter;tex.generateMipmaps=false;tex.flipY=true;tex.needsUpdate=true;
  tex.mapping=T.EquirectangularReflectionMapping;
  const rt=pmrem.fromEquirectangular(tex);tex.dispose();
  return(envCache[name]=rt.texture);
}

/* ---------- model glTF dari assets/models (dengan berkas .json opsional untuk metadata) ---------- */
const modelCache={};
async function loadModel(name,opt){
  if(!modelCache[name]){
    modelCache[name]=(async()=>{
      const g=await new GLTFLoader().loadAsync(new URL('../assets/models/'+name+'.glb',import.meta.url).href);
      let meta={};if(opt&&opt.meta)try{meta=await (await fetch(new URL('../assets/models/'+name+'.json',import.meta.url))).json()}catch(e){}
      return{scene:g.scene,meta};
    })();
  }
  const r=await modelCache[name];return{scene:r.scene.clone(true),meta:r.meta};
}

/* ---------- tekstur prosedural ---------- */
function fbm(w,h,o){
  o=Object.assign({fx:4,fy:4,oct:5,gain:.5,seed:1},o);const out=new Float32Array(w*h);let amp=1,tot=0;const r=rng(o.seed);
  for(let k=0;k<o.oct;k++){
    const fx=o.fx<<k,fy=o.fy<<k,g=new Float32Array(fx*fy);for(let i=0;i<g.length;i++)g[i]=r();
    for(let y=0;y<h;y++){const py=y/h*fy,y0=Math.floor(py),ty=py-y0,sy=ty*ty*(3-2*ty),ya=y0%fy,yb=(y0+1)%fy;
      for(let x=0;x<w;x++){const px=x/w*fx,x0=Math.floor(px),tx=px-x0,sx=tx*tx*(3-2*tx),xa=x0%fx,xb=(x0+1)%fx;
        const a=g[ya*fx+xa],b=g[ya*fx+xb],c=g[yb*fx+xa],d=g[yb*fx+xb],t=a+(b-a)*sx,bt=c+(d-c)*sx;out[y*w+x]+=amp*(t+(bt-t)*sy)}}
    tot+=amp;amp*=o.gain}
  for(let i=0;i<out.length;i++)out[i]/=tot;return out}
function dtex(u8,w,h,srgb){const t=new T.DataTexture(u8,w,h,T.RGBAFormat);t.wrapS=t.wrapT=T.RepeatWrapping;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.generateMipmaps=true;t.anisotropy=8;if(srgb)t.colorSpace=T.SRGBColorSpace;t.needsUpdate=true;return t}
const hex2=c=>[(c>>16)&255,(c>>8)&255,c&255];
/* pbr({fx,fy,oct,seed,c0,c1,nS,r0,r1,rep,hf,metal,phys,mat,w}) -> material */
function pbr(o){
  const w=o.w||256,h=o.h||w;let H=fbm(w,h,o);if(o.hf)H=o.hf(H,w,h);
  const V2=fbm(w,h,{fx:3,fy:3,oct:3,seed:(o.seed||1)+77});
  const a=new Uint8Array(w*h*4),n=new Uint8Array(w*h*4),r=new Uint8Array(w*h*4);
  const c0=hex2(o.c0),c1=hex2(o.c1),ns=o.nS==null?3:o.nS,r0=o.r0==null?.6:o.r0,r1=o.r1==null?.9:o.r1;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=y*w+x,t=clamp(H[i],0,1),v=.86+.28*V2[i];
    for(let k=0;k<3;k++)a[i*4+k]=clamp((c0[k]+(c1[k]-c0[k])*t)*v,0,255);a[i*4+3]=255;
    const dx=H[y*w+(x+1)%w]-H[y*w+(x-1+w)%w],dy=H[((y+1)%h)*w+x]-H[((y-1+h)%h)*w+x];
    let nx=-dx*ns*8,ny=-dy*ns*8,nz=1;const l=Math.hypot(nx,ny,nz);
    n[i*4]=(nx/l*.5+.5)*255;n[i*4+1]=(ny/l*.5+.5)*255;n[i*4+2]=(nz/l*.5+.5)*255;n[i*4+3]=255;
    const rr=clamp((r0+(r1-r0)*(o.invR?1-t:t))*255,0,255);r[i*4]=r[i*4+1]=r[i*4+2]=rr;r[i*4+3]=255}
  const map=dtex(a,w,h,true),nm=dtex(n,w,h),rm=dtex(r,w,h);
  const rep=o.rep||[1,1];[map,nm,rm].forEach(t=>t.repeat.set(rep[0],rep[1]));
  const M=o.phys?T.MeshPhysicalMaterial:T.MeshStandardMaterial;
  return new M(Object.assign({map,normalMap:nm,roughnessMap:rm,roughness:1,metalness:o.metal||0,normalScale:new T.Vector2(1,1)},o.mat||{}));
}
/* variasi umum */
const plankHF=(cols,rows)=>(H,w,h)=>{const o=new Float32Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=(x/w*cols)%1,v=(y/h*rows)%1,g=Math.min(u,1-u,v*0+1);const gr=(u<.02||u>.98)?0:1;o[y*w+x]=H[y*w+x]*.7*gr+ (gr?0.15:0)}return o};
const tileHF=(n,g)=>(H,w,h)=>{const o=new Float32Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=(x/w*n)%1,v=(y/h*n)%1,e=Math.min(u,1-u,v,1-v);o[y*w+x]=e<g?0:.55+.45*H[y*w+x]}return o};
const weaveHF=n=>(H,w,h)=>{const o=new Float32Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=(x/w*n)%1,v=(y/h*n)%1,a=Math.sin(u*Math.PI),b=Math.sin(v*Math.PI),k=((Math.floor(x/w*n)+Math.floor(y/h*n))&1)?a:b;o[y*w+x]=.5*k+.5*H[y*w+x]}return o};
const ridgeHF=n=>(H,w,h)=>{const o=new Float32Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){o[y*w+x]=.5+.4*Math.sin((y/h*n+H[y*w+x]*.6)*Math.PI*2)*.5+.1*H[y*w+x]}return o};
function waterNormal(){
  const w=256,d=new Uint8Array(w*w*4),waves=[[1,0,.55],[0,2,.45],[3,1,.3],[2,3,.22],[1,4,.16],[4,2,.1]];
  for(let y=0;y<w;y++)for(let x=0;x<w;x++){let nx=0,ny=0;
    for(const q of waves){const ph=(q[0]*x+q[1]*y)/w*Math.PI*2,c=Math.cos(ph)*q[2]*.16;nx+=c*q[0];ny+=c*q[1]}
    const l=Math.hypot(nx,ny,1),i=(y*w+x)*4;d[i]=(nx/l*.5+.5)*255;d[i+1]=(ny/l*.5+.5)*255;d[i+2]=(1/l*.5+.5)*255;d[i+3]=255}
  const t=dtex(d,w,w);return t}
function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function ctex(c,srgb){const t=new T.CanvasTexture(c);t.anisotropy=8;if(srgb!==false)t.colorSpace=T.SRGBColorSpace;return t}
function textTex(txt,w,h,o){o=o||{};const c=canvas(w,h),g=c.getContext('2d');if(o.bg){g.fillStyle=o.bg;g.fillRect(0,0,w,h)}g.fillStyle=o.fg||'#fff';g.font=o.font||('700 '+(h*.58|0)+'px sans-serif');g.textAlign='center';g.textBaseline='middle';g.fillText(txt,w/2,h/2+(o.dy||0));return ctex(c)}
const glowTex=(()=>{const c=canvas(128,128),g=c.getContext('2d'),r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.2,'rgba(255,255,255,.4)');r.addColorStop(.5,'rgba(255,255,255,.08)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,128,128);return ctex(c,false)})();
function glow(col,size,x,y,z,p,op){const s=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:col,transparent:true,blending:T.AdditiveBlending,depthWrite:false,opacity:op==null?1:op,fog:false}));s.scale.set(size,size,1);s.position.set(x,y,z);if(p)p.add(s);return s}
function tagSprite(txt,col,scale){const w=640,h=120,c=canvas(w,h),g=c.getContext('2d');g.fillStyle='rgba(6,10,18,.82)';g.beginPath();g.roundRect(4,4,w-8,h-8,28);g.fill();g.strokeStyle=col;g.lineWidth=3;g.stroke();g.fillStyle='#fff';g.font='600 40px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,w/2,h/2+2);const s=new T.Sprite(new T.SpriteMaterial({map:ctex(c),transparent:true,depthWrite:false,fog:false,toneMapped:false}));s.scale.set(scale*w/h,scale,1);return s}
function starField(n,r,size,upper,bright){const g=new T.BufferGeometry(),p=new Float32Array(n*3),c=new Float32Array(n*3);for(let i=0;i<n;i++){const u=Math.random()*2-1,a=Math.random()*6.2832,s=Math.sqrt(1-u*u),y=upper?Math.abs(u):u;p[i*3]=r*s*Math.cos(a);p[i*3+1]=r*y;p[i*3+2]=r*s*Math.sin(a);const k=(.35+Math.pow(Math.random(),3)*1.6)*(bright||1),w=Math.random();c[i*3]=k*(w>.8?1:.85);c[i*3+1]=k*.92;c[i*3+2]=k*(w<.3?1:.94)}g.setAttribute('position',new T.BufferAttribute(p,3));g.setAttribute('color',new T.BufferAttribute(c,3));const pts=new T.Points(g,new T.PointsMaterial({size:size,sizeAttenuation:false,vertexColors:true,transparent:true,depthWrite:false,fog:false}));pts.frustumCulled=false;return pts}
function mesh(g,m,x,y,z,p){const o=new T.Mesh(g,m);o.position.set(x||0,y||0,z||0);o.castShadow=o.receiveShadow=true;if(p)p.add(o);return o}
const Box=(w,h,d,m,x,y,z,p)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,z,p);
const RBox=(w,h,d,r,m,x,y,z,p)=>mesh(new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/2-.001,h/2-.001,d/2-.001)),m,x,y,z,p);
const Cyl=(rt,rb,h,m,x,y,z,p,s)=>mesh(new T.CylinderGeometry(rt,rb,h,s||24),m,x,y,z,p);
const Sph=(r,m,x,y,z,p,ws,hs)=>mesh(new T.SphereGeometry(r,ws||24,hs||16),m,x,y,z,p);
const noShadow=o=>{o.castShadow=false;return o};
const stdM=(c,o)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.6,metalness:0},o||{}));
const physM=(c,o)=>new T.MeshPhysicalMaterial(Object.assign({color:c,roughness:.5,metalness:0},o||{}));
const emis=(c,i,o)=>new T.MeshStandardMaterial(Object.assign({color:0x000000,emissive:c,emissiveIntensity:i==null?2:i,roughness:.6},o||{}));
function sunLight(col,intensity,pos,ext,size){const l=new T.DirectionalLight(col,intensity);l.position.copy(pos);l.castShadow=true;l.shadow.mapSize.set(size||2048,size||2048);const c=l.shadow.camera;c.left=-ext;c.right=ext;c.top=ext;c.bottom=-ext;c.near=1;c.far=ext*6;l.shadow.bias=-.0004;l.shadow.normalBias=.04;l.shadow.radius=3;return l}
function Cart(ui){let n=0,sum=0;return function(name,price){
  const s=ui.site&&ui.site(),l=String(name).toLowerCase(),p=s&&s.products.find(x=>(x.kw||[]).some(k=>l.includes(k)));
  if(p){const vr=p.variants?Object.fromEntries(p.variants.map(g=>[g.key,(g.values.find(v=>l.includes(v.v.toLowerCase()))||g.values[0]).v])):null;
    CS.add(s.id,p.id,vr,1);const t=CSt(s,s.id);ui.stat('cart',t.qty+' item · Rp '+Math.round(t.sub-t.disc).toLocaleString('id-ID'));ui.sfx('coin');return}
  n++;sum+=price;ui.stat('cart',n+' item · Rp '+sum.toLocaleString('id-ID'))}}

/* ---------- lantai basah / mengilap (Reflector dengan shader sendiri) ---------- */
function floorMat(rep,hf,base){return pbr({fx:8,fy:8,oct:5,seed:5,c0:base[0],c1:base[1],nS:base[2]||2,r0:.35,r1:.85,rep:[1,1],hf,w:256})}
function wetFloor(w,d,o){
  o=Object.assign({color:0x0c0c14,mix:.75,dist:.05,rep:.08,tex:512,rough:null},o);
  const geo=new T.PlaneGeometry(w,d);
  const nm=o.rough||pbr({fx:10,fy:10,oct:4,seed:9,c0:0x101018,c1:0x303040,nS:2,w:256}).normalMap;
  const shader={name:'WetFloor',uniforms:{color:{value:null},tDiffuse:{value:null},textureMatrix:{value:null},tNorm:{value:nm},uMix:{value:o.mix},uDist:{value:o.dist},uRep:{value:o.rep},uBase:{value:new T.Color(o.color)},uTime:{value:0}},
    vertexShader:`uniform mat4 textureMatrix;varying vec4 vUv;varying vec2 vXZ;void main(){vUv=textureMatrix*vec4(position,1.0);vXZ=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`uniform vec3 color;uniform sampler2D tDiffuse;uniform sampler2D tNorm;uniform float uMix,uDist,uRep,uTime;uniform vec3 uBase;varying vec4 vUv;varying vec2 vXZ;
      void main(){vec2 p=vXZ*uRep;vec3 n=texture2D(tNorm,p+vec2(uTime*.003,0.)).rgb*2.-1.;float m=texture2D(tNorm,p*.23+.31).r;
        vec4 uv=vUv;uv.xy+=n.xy*uDist*uv.w;vec4 refl=texture2DProj(tDiffuse,uv);
        float puddle=smoothstep(.47,.53,m);float k=uMix*mix(.25,1.,puddle);
        vec3 col=mix(uBase*(.7+.6*n.z),refl.rgb,k);
        gl_FragColor=vec4(col,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>}`};
  const mir=new Reflector(geo,{shader,textureWidth:o.tex,textureHeight:o.tex,clipBias:.003});
  mir.rotation.x=-Math.PI/2;
  const fb=new T.Mesh(geo,stdM(o.color,{roughness:.35,metalness:.3}));fb.rotation.x=-Math.PI/2;fb.receiveShadow=true;fb.visible=false;
  const g=new T.Group();g.add(mir,fb);g.userData={mir,fb};
  g.setHigh=v=>{mir.visible=v;fb.visible=!v};
  g.tick=t=>{mir.material.uniforms.uTime.value=t};
  return g;
}

/* ---------- langit fisik (Sky) + IBL dinamis ---------- */
function makeSky(){const s=new Sky();s.scale.setScalar(4000);const u=s.material.uniforms;u.turbidity.value=6;u.rayleigh.value=1.6;u.mieCoefficient.value=.005;u.mieDirectionalG.value=.85;return s}
function sunDir(elev,az){const p=T.MathUtils.degToRad(90-elev),t=T.MathUtils.degToRad(az);return new T.Vector3().setFromSphericalCoords(1,p,t)}


function windowTex(cols,rows,lit,pal){pal=pal||['#ffe6a0','#9ee7ff','#ffffff'];const c=canvas(cols*8,rows*8),g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,c.width,c.height);for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(Math.random()<lit){g.fillStyle=pal[(Math.random()*pal.length)|0];g.globalAlpha=.5+Math.random()*.5;g.fillRect(x*8+1,y*8+1,5,5)}g.globalAlpha=1;const t=ctex(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.NearestFilter;return t}
const perfHF=n=>(H,w,h)=>{const o=new Float32Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=((x/w*n)%1)-.5,v=((y/h*n)%1)-.5;o[y*w+x]=Math.hypot(u,v)<.28?0:1}return o};

/* ---------- daun prosedural (alpha) ---------- */
function leafTexture(kind,seed){
  const r=rng(seed||1),w=256,h=512,c=canvas(w,h),g=c.getContext('2d');g.clearRect(0,0,w,h);
  const green=(l,v)=>`hsl(${96+(v||0)},${52}%,${l}%)`;
  if(kind==='frond'||kind==='fern'){
    const n=kind==='fern'?70:46;g.strokeStyle='#3d6b22';g.lineWidth=4;g.beginPath();g.moveTo(w/2,h);g.lineTo(w/2,8);g.stroke();
    for(let i=0;i<n;i++){const t=i/n,y=h-14-t*(h-30),len=w*.48*Math.pow(Math.sin(Math.PI*(.12+t*.88)),.75)*(kind==='fern'?.85:1);
      [-1,1].forEach(s=>{g.strokeStyle=green(22+r()*16,r()*14);g.lineWidth=kind==='fern'?3.2:4.2;g.beginPath();g.moveTo(w/2,y);g.quadraticCurveTo(w/2+s*len*.55,y-len*.3,w/2+s*len,y+len*.28);g.stroke()})}
  }else if(kind==='monstera'){
    g.beginPath();g.moveTo(w/2,h-6);g.bezierCurveTo(w*-.1,h*.85,w*-.05,h*.2,w/2,8);g.bezierCurveTo(w*1.05,h*.2,w*1.1,h*.85,w/2,h-6);
    const gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0,'#1d5a2b');gr.addColorStop(.5,'#2f7a3a');gr.addColorStop(1,'#1a4f28');g.fillStyle=gr;g.fill();
    g.globalCompositeOperation='destination-out';for(let i=0;i<5;i++){const y=h*(.28+i*.13);[-1,1].forEach(s=>{g.beginPath();g.moveTo(w/2+s*20,y+10);g.lineTo(w/2+s*w*.6,y-24);g.lineTo(w/2+s*w*.6,y+8);g.closePath();g.fill()});g.beginPath();g.ellipse(w/2+(i%2?-1:1)*w*.18,y+30,7,12,0,0,7);g.fill()}
    g.globalCompositeOperation='source-over';g.strokeStyle='rgba(160,220,140,.6)';g.lineWidth=3;g.beginPath();g.moveTo(w/2,h-8);g.lineTo(w/2,14);g.stroke();g.lineWidth=1.5;for(let i=0;i<9;i++){const y=h*(.2+i*.08);[-1,1].forEach(s=>{g.beginPath();g.moveTo(w/2,y+16);g.lineTo(w/2+s*w*.42,y-24);g.stroke()})}
  }else if(kind==='ficus'){
    g.beginPath();g.moveTo(w/2,h-6);g.bezierCurveTo(w*-.05,h*.7,w*.02,h*.15,w/2,6);g.bezierCurveTo(w*.98,h*.15,w*1.05,h*.7,w/2,h-6);
    const gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0,'#1a5326');gr.addColorStop(.5,'#3c8a45');gr.addColorStop(1,'#1a5326');g.fillStyle=gr;g.fill();g.strokeStyle='rgba(200,235,170,.7)';g.lineWidth=3;g.beginPath();g.moveTo(w/2,h-8);g.lineTo(w/2,12);g.stroke();g.lineWidth=1.4;
    for(let i=0;i<14;i++){const y=h*(.12+i*.06);[-1,1].forEach(s=>{g.beginPath();g.moveTo(w/2,y+14);g.quadraticCurveTo(w/2+s*w*.2,y-6,w/2+s*w*.42,y-22);g.stroke()})}
  }else if(kind==='grass'){
    for(let i=0;i<9;i++){const x=w*(.1+i*.1),tip=h*(.05+r()*.3);g.fillStyle=green(22+r()*22,r()*20);g.beginPath();g.moveTo(x-9,h);g.quadraticCurveTo(x-4+(r()-.5)*40,h*.5,x+(r()-.5)*60,tip);g.quadraticCurveTo(x+4+(r()-.5)*30,h*.5,x+9,h);g.fill()}
  }
  const t=ctex(c);t.wrapS=t.wrapT=T.ClampToEdgeWrapping;return t}
function leafMat(kind,seed,o){return new T.MeshStandardMaterial(Object.assign({map:leafTexture(kind,seed),alphaTest:.28,alphaToCoverage:true,side:T.DoubleSide,roughness:.55,metalness:0},o||{}))}
function leafGeo(wd,ln,sx,sy,bend){const g=new T.PlaneGeometry(wd,ln,sx||2,sy||10);g.translate(0,ln/2,0);const p=g.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i)/ln;p.setZ(i,-(y*y)*ln*(bend==null?.35:bend)+ Math.abs(p.getX(i))*.12*wd/wd)}g.computeVertexNormals();return g}

const brickHF=(cols,rows)=>(H,w,h)=>{const o=new Float32Array(w*h);for(let y=0;y<h;y++){const row=Math.floor(y/h*rows),off=(row&1)?.5:0;for(let x=0;x<w;x++){const u=((x/w*cols)+off)%1,v=(y/h*rows)%1;const e=Math.min(u,1-u,v,1-v);o[y*w+x]=e<.05?0:.5+.5*H[y*w+x]}}return o};

const ST=(id,label,val)=>({t:'stat',id,label,val});
const TG=(id,label,states,def)=>({t:'toggle',id,label,states:states||['Off','On'],def:!!def});
const CY=(id,label,states)=>({t:'cycle',id,label,states});
const AC=(id,label)=>({t:'action',id,label});

export {loadModel,GLTFLoader,$,AC,BGU,Box,CY,Cart,Cyl,EXRLoader,EffectComposer,GTAOPass,OutputPass,RBox,Reflector,RenderPass,RoundedBoxGeometry,ST,ShaderPass,Sky,Sph,T,TG,UnrealBloomPass,V,Water,brickHF,camera,canvas,clamp,ctex,dtex,emis,envCache,fbm,floorMat,glow,glowTex,hdri,hex2,leafGeo,leafMat,leafTexture,lerp,loadHdri,makeSky,mesh,noShadow,pbr,perfHF,physM,plankHF,pmrem,reduce,renderer,ridgeHF,rnd,rng,sstep,starField,stdM,sunDir,sunLight,tagSprite,textTex,tileHF,waterNormal,weaveHF,wetFloor,windowTex};
