/* Perabot bersama untuk situs 3D: rak produk, pajangan berputar (produk 360°), meja kasir dengan keranjang, layar kanvas,
   dan gambar katalog yang dirender dari model produk. Semua dipasang di Group dengan koordinat lokal; depan = +z lokal. */
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {T,V,Box,RBox,Cyl,canvas,ctex,rng} from '../core.js';
import {cart} from '../site/store.js';
import * as shop from './shop.js';

export const lath=(pts,seg)=>new T.LatheGeometry(pts.map(q=>new T.Vector2(q[0],q[1])),seg||40);
export function speckle(g,w,h,a,seed,dark){const r=rng(seed||7);for(let i=0;i<w*h/90;i++){g.fillStyle='rgba('+(r()<.5?(dark||'40,25,10'):'255,240,220')+','+(r()*a)+')';g.fillRect(r()*w,r()*h,1+r()*2,1+r()*2)}}
/* label kanvas umum: baris = [{t,font,color,y}] di atas latar warna */
export function label(w,h,bg,rows,deco){const c=canvas(w,h),g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,w,h);if(deco)deco(g,w,h);g.textAlign='center';g.textBaseline='middle';
  rows.forEach(r=>{g.fillStyle=r.c||'#fff';g.font=r.f||'700 40px system-ui';g.fillText(r.t,w/2,r.y)});return ctex(c)}
export function group(parent,pos,rotY,k){const g=new T.Group();g.position.set(...pos);g.rotation.y=rotY||0;if(k)g.scale.setScalar(k);parent.add(g);return g}

/* ---------- gambar katalog: renderer kecil terpisah ---------- */
export function makeThumb(model,opts){opts=opts||{};let TR=null,TS,TC;const cache={};
  return function(pid,vr){const key=pid+JSON.stringify(vr||{});if(cache[key])return cache[key];
    try{if(!TR){TR=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});TR.setSize(320,320,false);TR.toneMapping=T.ACESFilmicToneMapping;TR.toneMappingExposure=opts.exp||1.05;TR.outputColorSpace=T.SRGBColorSpace;
        TS=new T.Scene();const pm=new T.PMREMGenerator(TR);TS.environment=pm.fromScene(new RoomEnvironment(),.04).texture;TS.environmentIntensity=.75;
        const k=new T.DirectionalLight(0xffffff,2.2);k.position.set(1.2,2,2);TS.add(k);TS.add(new T.HemisphereLight(0xffffff,0x9a9080,1.1));const f=new T.DirectionalLight(0xffffff,.9);f.position.set(-1.5,1,2);TS.add(f);const r=new T.DirectionalLight(opts.rim||0xff9a3a,1.4);r.position.set(-2,1,-1.5);TS.add(r);TC=new T.PerspectiveCamera(26,1,.01,200)}
      const m=model(pid,vr);m.rotation.y=opts.rot==null?-.45:opts.rot;TS.add(m);m.updateWorldMatrix(true,true);const bb=new T.Box3().setFromObject(m);if(bb.isEmpty()){TS.remove(m);return 'data:image/gif;base64,R0lGODlhAQABAAAAACw='}const c=bb.getCenter(V(0,0,0)),sz=bb.getSize(V(0,0,0)),r=Math.max(sz.x,sz.y,sz.z);
      TC.position.set(c.x+r*.55,c.y+r*.55,c.z+r*2.3);TC.near=r*.05;TC.far=r*20;TC.updateProjectionMatrix();TC.lookAt(c);TR.render(TS,TC);const url=TR.domElement.toDataURL('image/png');TS.remove(m);return cache[key]=url}
    catch(e){return 'data:image/gif;base64,R0lGODlhAQABAAAAACw='}}}

/* ---------- rak: papan bertingkat, produk menghadap +z lokal ---------- */
export function shelf(parent,o){const g=group(parent,o.pos,o.rotY,o.k),L=o.len||4.6,D=o.depth||.5,mat=o.mat,objs={},rows=o.rows||[.92,1.52,2.12];
  if(!o.noFrame){rows.forEach(y=>Box(L,.05,D,mat,0,y,0,g));const H=rows[rows.length-1]+.3;[-L/2,0,L/2].forEach(x=>Box(.06,H,D,mat,x,H/2,0,g));Box(L,H,.06,mat,0,H/2,-D/2+.03,g)}
  (o.items||[]).forEach(([pid,vr,row,x,z])=>{const p=shop.P(o.site,pid);const m=o.model(pid,vr||shop.defVar(p));m.scale.multiplyScalar(o.scale||1.3);m.rotation.y=Math.sin(x*7)*.18;m.position.set(x,rows[row]+.025,z||0);g.add(m);(objs[pid]=objs[pid]||[]).push(m)});
  g.updateWorldMatrix(true,true);
  const pins=[],seen={};(o.items||[]).forEach(([pid,vr,row,x,z])=>{if(seen[pid])return;seen[pid]=1;const p=shop.P(o.site,pid),wp=g.localToWorld(V(x,rows[row]+(o.pinY||.42),(z||0)+.05));
    pins.push({pos:wp.toArray(),label:p.name,sub:shop.rp(p.price),kind:'prod',href:'#/produk/'+pid+(o.q?o.q(vr):''),at:o.at})});
  return{g,objs,pins,center:g.localToWorld(V(0,1.4,0)).toArray()}}

/* ---------- pajangan berputar ---------- */
export function pedestal(parent,o){const g=group(parent,o.pos,o.rotY,o.k),h=o.h==null?1:o.h,r=o.r||.35;
  if(!o.noBase){Cyl(r+.05,r+.11,.12,o.baseMat||o.mat,0,.06,0,g,48);Cyl(r-.03,r+.01,h-.12,o.mat,0,.06+(h-.12)/2,0,g,48);Cyl(r,r,.03,o.topMat||o.baseMat||o.mat,0,h,0,g,48)}
  const col=o.ring||new T.Color(2.6,1.3,.4);const ring=new T.Mesh(new T.TorusGeometry(r+.005,.008,8,64),new T.MeshBasicMaterial({color:col,toneMapped:false}));ring.rotation.x=Math.PI/2;ring.position.y=h+.016;g.add(ring);
  if(o.light!==false){const ps=new T.SpotLight(o.lightColor||0xfff0dc,o.lightI||22,5+h,.45,.5,2);ps.position.set(.6,h+2.2,1.2);ps.target.position.set(0,h+.05,0);ps.castShadow=true;ps.shadow.mapSize.set(1024,1024);g.add(ps,ps.target)}
  const turn=new T.Group();turn.position.y=h+.016;g.add(turn);let shown=null;
  return{g,ring,show(pid,vr){if(shown)turn.remove(shown);shown=o.model(pid,vr);shown.scale.multiplyScalar(o.scale||1.7);turn.add(shown);turn.updateWorldMatrix(true,true);
      const bb=new T.Box3().setFromObject(shown),c=bb.getCenter(V(0,0,0)),sz=bb.getSize(V(0,0,0));return{target:c.toArray(),size:Math.max(sz.x,sz.y,sz.z)}},get obj(){return shown}}}

/* ---------- meja kasir + keranjang yang terisi sesuai isi keranjang belanja ---------- */
export function counter(parent,o){const g=group(parent,o.pos,o.rotY,o.k),L=o.len||2.6;
  RBox(1.1,1.05,L,.04,o.mat,0,.55,0,g);Box(1.2,.05,L+.1,o.topMat||o.mat,0,1.1,0,g);
  const reg=RBox(.34,.12,.3,.03,new T.MeshStandardMaterial({color:0x1f1c1a,roughness:.4,metalness:.4}),.1,1.19,-L*.27,g);
  const scr=new T.Mesh(new T.PlaneGeometry(.26,.16),new T.MeshBasicMaterial({color:o.screen||new T.Color(1.6,.9,.4),toneMapped:false}));scr.position.set(.24,1.38,-L*.27);scr.rotation.y=Math.PI/2;g.add(scr);
  const bsk=new T.Mesh(new T.CylinderGeometry(.32,.26,.2,28,1,true),new T.MeshStandardMaterial({color:o.basket||0x8a6236,roughness:.95,side:T.DoubleSide}));bsk.position.set(.05,1.225,L*.13);g.add(bsk);Cyl(.26,.26,.01,o.basketBase||o.mat,.05,1.13,L*.13,g,28);
  const basket=new T.Group();basket.position.set(.05,1.13,L*.13);g.add(basket);
  function fill(){basket.clear();const it=cart.items(o.site.id);let n=0;it.forEach(i=>{const p=shop.P(o.site,i.pid);if(!p)return;for(let k=0;k<i.qty&&n<9;k++,n++){const m=o.model(i.pid,i.variant||shop.defVar(p));const bb=new T.Box3().setFromObject(m),s=bb.getSize(V(0,0,0));m.scale.multiplyScalar(Math.min(1,.28/Math.max(s.x,s.y,s.z,.01)));const a=n*2.39,r=n?.08+.05*(n%3):0;m.position.set(Math.cos(a)*r,0,Math.sin(a)*r);m.rotation.y=a;basket.add(m)}})}
  fill();g.updateWorldMatrix(true,true);return{g,objs:[bsk,reg],fill,center:g.localToWorld(V(0,1.3,0)).toArray()}}

/* ---------- layar kanvas emisif (untuk company profile: judul proyek, angka, artikel) ---------- */
export function screen(parent,o){const w=o.px||1024,h=Math.round(w*o.h/o.w),c=canvas(w,h),g=c.getContext('2d'),t=ctex(c);
  const m=new T.Mesh(new T.PlaneGeometry(o.w,o.h),new T.MeshBasicMaterial({map:t,color:new T.Color(...(o.gain||[1.3,1.3,1.3])),toneMapped:false,transparent:!!o.transparent,depthWrite:!o.transparent,blending:o.add?T.AdditiveBlending:T.NormalBlending}));
  m.position.set(...o.pos);m.rotation.y=o.rotY||0;parent.add(m);
  return{mesh:m,draw(fn){g.clearRect(0,0,w,h);fn(g,w,h);t.needsUpdate=true}}}
/* tulisan berlapis untuk layar */
export function wrapText(g,txt,x,y,maxW,lh){const words=String(txt).split(' ');let line='';for(const wd of words){const t=line?line+' '+wd:wd;if(g.measureText(t).width>maxW&&line){g.fillText(line,x,y);y+=lh;line=wd}else line=t}if(line)g.fillText(line,x,y);return y+lh}

/* ---------- sambungan toko ke mesin: rak, pajangan, kasir, pin produk, klik produk ---------- */
export function wireShop(W,o){const {site,model}=o;const shelves=o.shelves||[];
  W.thumb=makeThumb(model,o.thumb);
  if(o.ped){W.showProduct=(pid,vr)=>{const r=o.ped.show(pid,vr);W.orbitHint=r;return r.target};W.onVariant=(pid,vr)=>{const t=W.showProduct(pid,vr);W.setOrbitTarget&&W.setOrbitTarget(t);W.kick(.6)}}
  if(o.counter)W.onCartChange=o.counter.fill;
  W.pins=(W.pins||[]).concat(...shelves.map(s=>s.pins));
  const all=()=>shelves.map(s=>Object.entries(s.objs)).flat();
  W.picks=(W.picks||[]).concat([{objects:()=>all().map(e=>e[1]).flat(),hint:'Klik: lihat produk 360°',when:o.shelfWhen,on:h=>{for(const [pid,list] of all())for(const m of list){let x=h.object;while(x){if(x===m){location.hash='/produk/'+pid;return}x=x.parent}}}}]);
  if(o.counter)W.picks.push({objects:()=>o.counter.objs,hint:'Klik: buka keranjang',on:()=>{location.hash='/keranjang'}})}
