/* AQUARIA — toko akuarium yang hidup di adegannya: gerbang di ujung dermaga = beranda, ambang = cerita,
   etalase bawah laut = katalog dengan rak karang, pajangan batu = produk 360°, kios di dermaga = kasir. */
import {T,V,Box,RBox,Cyl,mesh,canvas,ctex,camera} from '../core.js';
import {world} from './world.js';
import {lath,label,shelf,pedestal,counter,wireShop} from './kit.js';
import * as shop from './shop.js';
import {esc,toast,$} from '../site/ui.js';
import site from '../sites/aqua.js';
import {concept,fishBodyGeo,finGeo,fishTex,branchCoral,reefRock} from '../concepts/aqua.js';

const SB=-22,gy=(x,z)=>SB+Math.sin(x*.09)*1.6+Math.cos(z*.11)*1.4+Math.sin((x+z)*.3)*.4;
/* ---------- model produk ---------- */
const glassM=()=>new T.MeshPhysicalMaterial({color:0xeaffff,roughness:.03,transparent:true,opacity:.18,clearcoat:1,side:T.DoubleSide,depthWrite:false});
const waterM=()=>new T.MeshPhysicalMaterial({color:0x3fb8d0,roughness:.1,transparent:true,opacity:.28,depthWrite:false});
let BODY=null,TAIL=null,DOR=null;const fishMat={};
function fish(pat,o){o=o||{};BODY=BODY||fishBodyGeo();TAIL=TAIL||finGeo(1,.9,.7);DOR=DOR||finGeo(1.1,.6,.4);
  const m=fishMat[pat]||(fishMat[pat]={body:new T.MeshPhysicalMaterial({map:fishTex(pat),roughness:.3,clearcoat:.9,iridescence:.35}),fin:new T.MeshStandardMaterial({map:fishTex(pat),roughness:.6,side:T.DoubleSide,transparent:true,opacity:.88})});
  const g=new T.Group(),b=new T.Mesh(BODY,m.body);if(o.disc)b.scale.set(.75,1.9,1);g.add(b);const fs=o.fins||1;
  const t=new T.Mesh(TAIL,m.fin);t.position.x=-1.4;t.rotation.y=Math.PI;t.scale.setScalar(fs);g.add(t);
  const d=new T.Mesh(DOR,m.fin);d.position.set(.3,o.disc?.9:.4,0);d.rotation.set(Math.PI/2,Math.PI,0);d.scale.set(-.9*fs,.9*fs,.9);g.add(d);
  if(fs>1){const a=new T.Mesh(DOR,m.fin);a.position.set(.2,-.5,0);a.rotation.set(-Math.PI/2,Math.PI,0);a.scale.set(-fs,fs,.9);g.add(a)}
  [-1,1].forEach(s=>{const e=new T.Mesh(new T.SphereGeometry(.09,10,8),new T.MeshStandardMaterial({color:0x080808,roughness:.1}));e.position.set(1.05,.13,s*.17);g.add(e)});return g}
/* ikan dikirim dalam kantong bening berisi air, diikat di atas */
function bagged(fishes){const G=new T.Group(),bag=new T.Mesh(lath([[.001,0],[.08,.01],[.11,.06],[.1,.16],[.05,.24],[.015,.27],[.02,.3],[.001,.3]],32),glassM());G.add(bag);
  const w=new T.Mesh(lath([[.001,.005],[.079,.012],[.105,.06],[.095,.15],[.001,.15]],32),waterM());G.add(w);
  const tie=new T.Mesh(new T.TorusGeometry(.018,.006,6,16),new T.MeshStandardMaterial({color:0xff7a1a}));tie.rotation.x=Math.PI/2;tie.position.y=.265;G.add(tie);
  fishes.forEach((f,i)=>{f.scale.setScalar(.034);f.position.set(-.01+i*.03,.075+i*.02,i*.02);f.rotation.y=.4-i*.8;G.add(f)});return G}
function tank(vr){const L={'90 cm':.45,'120 cm':.6,'150 cm':.75}[(vr&&vr.Ukuran)||'90 cm'],H=.3,D=.26,fr=(vr&&vr.Rangka)==='Putih'?0xf2f2f2:0x161616;
  const G=new T.Group(),frame=new T.MeshStandardMaterial({color:fr,roughness:.35,metalness:.3});
  const gl=new T.Mesh(new T.BoxGeometry(L,H,D),glassM());gl.position.y=H/2+.02;G.add(gl);const wt=new T.Mesh(new T.BoxGeometry(L-.01,H*.86,D-.01),waterM());wt.position.y=H*.45+.02;G.add(wt);
  Box(L+.01,.02,D+.01,frame,0,.01,0,G);Box(L+.01,.012,D+.01,frame,0,H+.02,0,G);
  const sand=new T.Mesh(new T.BoxGeometry(L-.012,.035,D-.012),new T.MeshStandardMaterial({color:0xd6c08a,roughness:1}));sand.position.y=.04;G.add(sand);
  for(let i=0;i<3;i++){const r=new T.Mesh(reefRock(.05+i*.012,i+5),new T.MeshStandardMaterial({color:0x5a6066,roughness:.9}));r.position.set(-L*.3+i*L*.28,.08,-.03+i*.02);G.add(r)}
  const pm=new T.MeshStandardMaterial({color:0x3aa24a,roughness:.6,side:T.DoubleSide});for(let i=0;i<14;i++){const h=.08+Math.random()*.14,p=new T.Mesh(new T.PlaneGeometry(.012,h),pm);p.position.set((Math.random()-.5)*L*.85,.05+h/2,-D*.3+Math.random()*.08);p.rotation.y=Math.random()*3;G.add(p)}
  [['clown',.0],['tang',.12],['yellow',-.1]].forEach(([p,x],i)=>{const f=fish(p);f.scale.setScalar(.022);f.position.set(x*L,.16+i*.04,.02);f.rotation.y=i?Math.PI:0;G.add(f)});return G}
function setKarang(vr){const g=(vr&&vr.Gaya)||'Iwagumi',G=new T.Group();Cyl(.17,.18,.02,new T.MeshStandardMaterial({color:0x2a2e33,roughness:.9}),0,.01,0,G,40);
  const rk=new T.MeshStandardMaterial({color:g==='Iwagumi'?0x6a6e72:0x5a4a3a,roughness:.95});[[0,.07,.06],[-.08,.04,.045],[.09,.05,.04]].forEach((q,i)=>{const r=new T.Mesh(reefRock(q[2],i+11),rk);r.position.set(q[0],q[1],(i-1)*.03);G.add(r)});
  if(g!=='Iwagumi'){const wood=new T.MeshStandardMaterial({color:0x5a3a22,roughness:.8});const t=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([V(-.12,.02,0),V(-.04,.12,.02),V(.06,.18,-.02),V(.13,.24,0)]),20,.008,6),wood);G.add(t)}
  const pm=new T.MeshStandardMaterial({color:g==='Jungle'?0x2f8a3a:0x5ac24a,roughness:.6,side:T.DoubleSide});const n=g==='Jungle'?40:18;for(let i=0;i<n;i++){const a=Math.random()*6.28,r=.04+Math.random()*.12,h=.03+Math.random()*(g==='Jungle'?.16:.05),p=new T.Mesh(new T.PlaneGeometry(.01,h),pm);p.position.set(Math.cos(a)*r,.02+h/2,Math.sin(a)*r);p.rotation.y=a;G.add(p)}return G}
function coral(){const G=new T.Group();Cyl(.03,.04,.03,new T.MeshStandardMaterial({color:0xe8e0d0,roughness:.8}),0,.015,0,G,16);const m=new T.Mesh(branchCoral(30),new T.MeshPhysicalMaterial({color:0x7cff6a,roughness:.45,sheen:1,sheenColor:new T.Color(0xb06bff),emissive:0x2a8a1a,emissiveIntensity:.35}));m.scale.setScalar(.07);m.position.y=.03;G.add(m);return G}
function anemone(){const G=new T.Group(),tm=new T.MeshPhysicalMaterial({color:0xffb0d0,emissive:0xff4f9a,emissiveIntensity:.4,roughness:.3,sheen:1});const st=new T.Mesh(new T.CylinderGeometry(.035,.05,.06,16),new T.MeshStandardMaterial({color:0xff9a3a,roughness:.5}));st.position.y=.03;G.add(st);
  for(let k=0;k<60;k++){const a=k*2.4,r=Math.sqrt(k)*.012,t=new T.Mesh(new T.CylinderGeometry(.003,.005,.07,5),tm);t.position.set(Math.cos(a)*r,.09,Math.sin(a)*r);t.rotation.set(Math.sin(a)*.4,0,-Math.cos(a)*.4);G.add(t);const tip=new T.Mesh(new T.SphereGeometry(.0065,6,5),tm);tip.position.set(t.position.x+Math.cos(a)*.014,.125,t.position.z+Math.sin(a)*.014);G.add(tip)}return G}
function filter(){const G=new T.Group(),blk=new T.MeshStandardMaterial({color:0x1a1c1e,roughness:.35,metalness:.2}),gry=new T.MeshStandardMaterial({color:0x5a6066,roughness:.4});
  Cyl(.08,.08,.22,blk,0,.11,0,G,40);Cyl(.085,.085,.05,gry,0,.245,0,G,40);Box(.06,.02,.03,gry,0,.28,0,G);const lab=new T.Mesh(new T.PlaneGeometry(.08,.05),new T.MeshStandardMaterial({map:label(256,160,'#1a1c1e',[{t:'AQUARIA',f:'800 44px Georgia',c:'#38d6c4',y:60},{t:'F3 · 1.200 L/jam',f:'500 26px system-ui',c:'#ddd',y:110}])}));lab.position.set(0,.12,.081);G.add(lab);
  [-1,1].forEach(s=>G.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([V(s*.02,.27,0),V(s*.03,.36,0),V(s*.12,.38,-.02),V(s*.16,.3,-.03)]),24,.008,8),new T.MeshStandardMaterial({color:0x3a8a6a,roughness:.3,transparent:true,opacity:.8}))));return G}
function lamp(vr){const L=(vr&&vr.Panjang)==='120 cm'?.6:.45,G=new T.Group(),al=new T.MeshStandardMaterial({color:0xc8ccd0,metalness:.9,roughness:.25});RBox(L,.018,.07,.008,al,0,.16,0,G);
  const led=new T.Mesh(new T.PlaneGeometry(L-.02,.05),new T.MeshBasicMaterial({color:new T.Color(1.4,1.8,2.2),toneMapped:false}));led.rotation.x=Math.PI/2;led.position.y=.15;G.add(led);
  [-1,1].forEach(s=>{Box(.008,.16,.008,al,s*(L/2-.03),.08,0,G);Box(.03,.006,.08,al,s*(L/2-.03),.003,0,G)});return G}
function food(vr){const big=(vr&&vr.Isi)==='250 g',G=new T.Group(),h=big?.14:.1,r=big?.05:.04;const jar=new T.Mesh(new T.CylinderGeometry(r,r,h,40),new T.MeshStandardMaterial({map:label(512,256,'#38d6c4',[{t:'SPIRULINA',f:'800 70px Georgia',c:'#04201d',y:90},{t:(vr&&vr.Isi)||'100 g',f:'700 44px system-ui',c:'#04201d',y:170}]),roughness:.4}));jar.position.y=h/2;G.add(jar);
  Cyl(r+.004,r+.004,.025,new T.MeshStandardMaterial({color:0xff7a1a,roughness:.4}),0,h+.012,0,G,40);return G}
const CUP={Biru:'tang',Magenta:'pink',Merah:'clown'};
function model(pid,vr){
  if(pid==='tank-ultraclear')return tank(vr);if(pid==='set-karang')return setKarang(vr);
  if(pid==='discus-merah'){const f=fish('pink',{disc:true});return bagged([f])}
  if(pid==='cupang-galaxy')return bagged([fish(CUP[(vr&&vr.Warna)||'Biru']||'violet',{fins:1.8})]);
  if(pid==='badut-pasangan')return bagged([fish('clown'),fish('clown')]);
  if(pid==='acropora-neon')return coral();if(pid==='anemon-bubble')return anemone();if(pid==='filter-f3')return filter();if(pid==='lampu-spektrum')return lamp(vr);if(pid==='pakan-spirulina')return food(vr);
  return food(vr)}

/* ---------- tempat ---------- */
const SH=[-20,-12],PD=[14,-26];
const stations={
  gerbang:{label:'Gerbang dermaga',pos:[0,3.4,46],look:[0,5.5,0],audio:'sea',href:'/'},
  ambang:{label:'Ambang gerbang',parent:'gerbang',pos:[0,2.3,15],look:[0,3.6,0],audio:'sea',href:'/tentang'},
  kasir:{label:'Kios dermaga',parent:'ambang',pos:[-1.6,2.2,15],look:[2.2,1.2,9.5],audio:'sea',href:'/keranjang'},
  selam:{label:'Menyelam',parent:'ambang',pos:[0,-1.6,-2.5],look:[0,-9,-17],audio:'under',pass:true,href:'/selam'},
  etalase:{label:'Etalase bawah laut',parent:'selam',pos:[0,-9,-8.5],look:[0,-10.5,-28],audio:'under',href:'/etalase'},
  rak:{label:'Rak karang',parent:'etalase',pos:[-11.2,-13.2,-9.2],look:[SH[0],-15.6,SH[1]],audio:'under',href:'/toko'},
  pajang:{label:'Pajangan 360°',parent:'etalase',pos:[12.6,-12.6,-22.6],look:[PD[0],-13.6,PD[1]],audio:'under',href:'/produk/tank-ultraclear'}};
const tour=['gerbang','ambang','etalase','rak','pajang'];
const items=[['pakan-spirulina',{Isi:'100 g'},0,-.9],['pakan-spirulina',{Isi:'250 g'},0,-.6],['filter-f3',null,0,0],['lampu-spektrum',{Panjang:'90 cm'},0,.75],
  ['acropora-neon',null,1,-.95],['anemon-bubble',null,1,-.45],['set-karang',{Gaya:'Iwagumi'},1,.2],['set-karang',{Gaya:'Jungle'},1,.85],
  ['discus-merah',null,2,-.95],['cupang-galaxy',{Warna:'Biru'},2,-.55],['cupang-galaxy',{Warna:'Magenta'},2,-.25],['badut-pasangan',null,2,.2],['tank-ultraclear',{Ukuran:'90 cm',Rangka:'Hitam'},2,.75]];
function setup(rt,W){const sc=rt.scene;
  const stone=new T.MeshStandardMaterial({color:0x4a5258,roughness:.9}),dark=new T.MeshStandardMaterial({color:0x2a2018,roughness:.8});
  const sh=shelf(sc,{pos:[SH[0],gy(SH[0],SH[1])-.3,SH[1]],rotY:1.3,k:3.2,len:2.4,depth:.45,mat:stone,items,model,site,scale:1.25,pinY:.36,at:['rak']});
  [[-13,-11,-8],[-15,-11,-15]].forEach(p=>{const l=new T.PointLight(0x9fe8ff,60,22,2);l.position.set(...p);sc.add(l)});
  const ped=pedestal(sc,{pos:[PD[0],gy(PD[0],PD[1])-.2,PD[1]],k:3,h:2.3,mat:stone,baseMat:stone,model,scale:1.8,ring:new T.Color(.4,2.2,2.4),lightColor:0xdff8ff,lightI:60});
  const pl=new T.PointLight(0x9fe8ff,40,16,2);pl.position.set(PD[0]-3,-12,PD[1]+4);sc.add(pl);
  // kios kasir di dermaga, sisi kanan sebelum gerbang
  const ct=counter(sc,{pos:[2.2,.45,9.5],rotY:Math.PI,len:2.2,mat:dark,topMat:new T.MeshStandardMaterial({color:0xa82c18,roughness:.4}),model,site,basket:0x8a6a3a,screen:new T.Color(.4,1.8,1.8)});
  const kl=new T.PointLight(0xffa040,25,8,2);kl.position.set(1.5,3.2,9.5);sc.add(kl);
  // label harga bawaan konsep diganti pin situs; kelp/karang di depan rak dan pajangan disingkirkan
  if(rt.world){rt.world.tags.forEach(t=>t.visible=false);const clear=[[PD[0],PD[1],6.5],[SH[0],SH[1],6],[(PD[0]+12.6)/2,(PD[1]-22.6)/2,3.5],[-15,-10.5,4]];
    rt.world.clutter().forEach(o=>{for(const c of clear)if(Math.hypot(o.position.x-c[0],o.position.z-c[1])<c[2]){o.visible=false;break}})}
  sc.userData.aoDirty=true;
  W.pins=[{pos:[0,7.5,0],label:'Gerbang AQUARIA',sub:'Masuk',href:'#/tentang',at:['gerbang']},{pos:[2.2,2,9.5],label:'Kios dermaga',sub:'Keranjang',href:'#/keranjang',at:['ambang','gerbang']},
    {pos:[0,-.5,-4],label:'Menyelam',sub:'Etalase bawah laut',href:'#/etalase',at:['ambang','kasir']},
    {pos:[SH[0],-9,SH[1]],label:'Rak karang',sub:'Katalog',href:'#/toko',at:['etalase','pajang']},{pos:[PD[0],-11.5,PD[1]],label:'Pajangan 360°',href:'#/produk/tank-ultraclear',at:['etalase','rak']},
    {pos:[0,-1,-10],label:'Naik ke dermaga',sub:'Kasir',href:'#/keranjang',at:['etalase','rak','pajang']}];
  wireShop(W,{site,model,shelves:[sh],ped,counter:ct,thumb:{rim:0x38d6c4}});
}
const btn=(h,t,g)=>'<a class="wbtn'+(g?' ghost':'')+'" href="#'+h+'">'+t+'</a>';
function home(){const h=site.home;return{st:'gerbang',kind:'hero',title:'Beranda',html:'<p class="wk">'+esc(h.eyebrow)+'</p><h1 class="wh big">'+h.title+'</h1><p class="wl">'+esc(h.sub)+'</p>'
  +'<div class="wrow">'+btn('/toko','Belanja')+btn('/tentang','Mulai tur',1)+'</div><ul class="wusp">'+site.usp.map(u=>'<li><b>'+esc(u[0])+'</b><span>'+esc(u[1])+'</span></li>').join('')+'</ul><p class="wtiny">Gulir atau tekan › untuk melewati gerbang dan menyelam. Seret layar untuk melihat sekeliling 360°.</p>'}}
function about(){const a=site.about;return{st:'ambang',title:'Cerita',html:'<p class="wk">Ambang gerbang</p><h1 class="wh">'+esc(a.title)+'</h1><p class="wl">'+esc(a.sub)+'</p>'+a.paras.map(p=>'<p>'+esc(p)+'</p>').join('')
  +'<h3>Yang kami pegang</h3>'+a.values.map(v=>'<p><b>'+esc(v[0])+'.</b> '+esc(v[1])+'</p>').join('')+site.testi.slice(0,2).map(t=>'<blockquote>“'+esc(t[0])+'” <cite>'+esc(t[1])+', '+esc(t[2])+'</cite></blockquote>').join('')+'<div class="wrow">'+btn('/etalase','Menyelam ke etalase')+'</div>'}}
function etalase(W){return{st:'etalase',title:'Etalase',html:'<p class="wk">Etalase bawah laut</p><h1 class="wh">Toko yang berenang</h1><p class="wl">Klik ikan untuk memberi makan, ganti jenis ikan yang berenang, lalu buka rak karang untuk belanja.</p>'
  +'<div class="wrow"><button class="wbtn" data-act="feed">Beri makan</button><button class="wbtn ghost" data-act="species">Ganti spesies</button></div><div class="wstat"><div><b id="fedN">'+(W.fed||0)+'</b><span>ikan kenyang</span></div><div><b>'+(W.fed>=10?'IKANKENYANG':'terkunci')+'</b><span>voucher (beri makan 10×)</span></div></div>'
  +'<div class="wrow">'+btn('/toko','Ke rak karang')+btn('/produk/badut-pasangan','Lihat ikan badut 360°',1)+'</div>'}}
/* ---------- pengalaman "menyelam": pengukur kedalaman, etalase gelembung, panel gelembung ---------- */
const UNDER=['etalase','rak','pajang'];
const GAUGE=[['gerbang','Gerbang'],['kasir','Kios & kasir'],['ambang','Ambang'],['etalase','Etalase'],['pajang','Pajangan'],['rak','Rak karang']];
/* penanda dibagi rata; posisi penunjuk diinterpolasi dari kedalaman kamera */
const gTop=i=>i/(GAUGE.length-1)*100,depthPos=y=>{const d=GAUGE.map(g=>depthOf(g[0]));if(y<=d[0])return 0;for(let i=1;i<d.length;i++)if(y<=d[i])return gTop(i-1)+(y-d[i-1])/Math.max(.01,d[i]-d[i-1])*(gTop(i)-gTop(i-1));return 100};
const depthOf=st=>Math.max(0,-stations[st].pos[1]);
function chrome(W){
  const g=document.createElement('nav');g.id='aqDepth';g.setAttribute('aria-label','Kedalaman');const max=16;
  g.innerHTML='<div class="aq-track"><i id="aqNow"><b id="aqM">0 m</b></i>'+GAUGE.map(([id,l],i)=>'<a href="#'+stations[id].href+'" data-st="'+id+'" style="top:'+gTop(i)+'%"><span>'+l+'</span><em>'+(depthOf(id)?'−'+depthOf(id).toFixed(0)+' m':'0 m')+'</em></a>').join('')+'</div>';document.body.appendChild(g);
  const reel=document.createElement('div');reel.id='aqReel';reel.hidden=true;reel.innerHTML='<button class="aq-nav" data-dir="-1" aria-label="Geser kiri">‹</button><div class="aq-strip" id="aqStrip"></div><button class="aq-nav" data-dir="1" aria-label="Geser kanan">›</button>';document.body.appendChild(reel);
  reel.addEventListener('click',e=>{const b=e.target.closest('.aq-nav');if(b)$('#aqStrip').scrollBy({left:+b.dataset.dir*280,behavior:'smooth'})});
  const bub=document.createElement('div');bub.id='aqBub';document.body.appendChild(bub);W.bubbles=()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;bub.innerHTML=Array.from({length:18},(_,i)=>'<i style="left:'+(Math.random()*100)+'%;animation-delay:'+(Math.random()*.6)+'s;width:'+(6+Math.random()*16)+'px"></i>').join('');bub.classList.remove('go');void bub.offsetWidth;bub.classList.add('go')};
}
function drawReel(W,cat,active){const st=$('#aqStrip');if(!st)return;const l=site.products.filter(p=>!cat||cat==='semua'||p.cat===cat);
  st.innerHTML=l.map(p=>'<a href="#/produk/'+p.id+'" class="'+(p.id===active?'on':'')+'"><span class="b"><img src="'+(W.thumb?W.thumb(p.id,shop.defVar(p)):'')+'" alt=""></span><b>'+esc(p.name)+'</b><em>'+shop.rp(p.price)+'</em></a>').join('')}
function tokoPanel(r){const cat=r.q.get('k')||'semua';return{st:'rak',title:'Rak karang',html:'<p class="wk">Rak karang · −14 m</p><h1 class="wh">Belanja di bawah laut</h1><p class="wl">Geser etalase gelembung di bawah, atau klik produk di rak karang. Setiap produk bisa dilihat 360° di pajangan batu.</p>'
  +'<div class="wchips">'+['semua'].concat(site.categories.map(c=>c.id)).map(c=>'<a class="wchip'+(c===cat?' on':'')+'" href="#/toko'+(c==='semua'?'':'?k='+c)+'">'+(c==='semua'?'Semua':esc(site.categories.find(x=>x.id===c).name))+'</a>').join('')+'</div>'
  +'<ul class="wusp">'+site.usp.slice(0,2).map(u=>'<li><b>'+esc(u[0])+'</b><span>'+esc(u[1])+'</span></li>').join('')+'</ul><div class="wrow"><a class="wbtn ghost" href="#/keranjang">Naik ke kios kasir ↑</a></div>'}}
const def={site,concept,stations,tour,audio:true,noglImg:'06',layout:'dive',avoid:['#wp','#aqReel'],chrome,
  nav:[['Beranda','/'],['Cerita','/tentang'],['Etalase','/etalase'],['Toko','/toko'],['Lacak','/lacak'],['Kontak','/kontak']],
  setup,
  route(r,W){const a=r.seg[0];
    if(!a)return home();if(a==='tentang')return about();if(a==='etalase'||a==='selam')return etalase(W);
    if(a==='toko')return tokoPanel(r);
    if(a==='produk'){const o=shop.product(site,W,r.seg[1],r.q);if(!o)return null;let tg=[PD[0],-15,PD[1]],sz=.6;if(W.showProduct){tg=W.showProduct(W.sel.pid,W.sel.vr);sz=W.orbitHint.size}return Object.assign(o,{st:'pajang',kind:'product',orbit:{target:tg,az:-.5,el:.2,d:sz*1.5+.35,dmin:sz*.9,dmax:sz*4}})}
    if(a==='keranjang')return Object.assign(shop.cartPanel(site,W),{st:'kasir'});if(a==='checkout')return Object.assign(shop.checkout(site,W),{st:'kasir'});
    if(a==='pesanan')return Object.assign(shop.order(site,W,decodeURIComponent(r.seg[1]||'')),{st:'kasir'});if(a==='lacak')return Object.assign(shop.track(site,W,r),{st:'kasir'});
    if(a==='kontak'||a==='faq')return Object.assign(shop.contact(site,W,'Kios dermaga'),{st:'kasir'});return null},
  pickAction(id,W){if(id==='feed'){W.rt.actions.feed();W.fed=(W.fed||0)+1;const n=document.getElementById('fedN');if(n)n.textContent=W.fed;if(W.fed===10){toast('Voucher IKANKENYANG terbuka: diskon 10%.','ok');site.coupons.IKANKENYANG={type:'percent',value:10,max:200000}}W.sfx('plop');return true}},
  act(t,e,W){const a=t.dataset.act;if(a==='feed')def.pickAction('feed',W);else if(a==='species'){W.sp=((W.sp||0)+1)%3;W.rt&&W.rt.actions.species(W.sp);W.sfx('plop')}else shop.act(site,W,t)},
  onRoute(r,out,W){const st=out.st,under=UNDER.includes(st),reel=$('#aqReel');reel.hidden=!under;if(under)drawReel(W,r.q.get('k'),r.seg[0]==='produk'?r.seg[1]:null);
    document.querySelectorAll('#aqDepth a').forEach(a=>a.classList.toggle('on',a.dataset.st===st));document.documentElement.classList.toggle('aq-under',under);if(W.bubbles&&W._lastSt!==st&&(under||(W._lastSt&&UNDER.includes(W._lastSt))))W.bubbles();W._lastSt=st},
  tick(t,dt,W){const n=$('#aqNow');if(!n)return;const y=Math.max(0,-camera.position.y);n.style.top=depthPos(y)+'%';const m=$('#aqM');const v=y<.3?'0 m':'−'+y.toFixed(1)+' m';if(m.textContent!==v)m.textContent=v},
  onCart(W){W.onCartChange&&W.onCartChange()},
  refresh(r,W){if(r.seg[0]==='keranjang')W.render()}};
world(def);
