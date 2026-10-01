/* KAZE 風 — butik sneaker di gang hujan. Gang = beranda, menyusuri neon = cerita, kaca etalase = kontak,
   meja drop = katalog, pedestal tengah = produk 360°, meja kasir = keranjang. */
import {T,V,Box,RBox,Cyl,mesh} from '../core.js';
import {world} from './world.js';
import {label,shelf,pedestal,counter,wireShop} from './kit.js';
import * as shop from './shop.js';
import {esc} from '../site/ui.js';
import site from '../sites/kaze.js';
import {concept,buildShoe} from '../concepts/kaze.js';

/* ---------- model produk ---------- */
const CW={Cyber:[0x141420,0x00e5ff,0xe8e8ec],Sunset:[0xff5a2b,0xffe14a,0xd8d8dc],Jade:[0x153a30,0x5bffb0,0xe8e8ec]},NEO={Hitam:[0x121214,0xff2bd6,0x2a2a2e],Putih:[0xf2f2f2,0xb8b8c0,0xf4f4f0]};
const shoeCache={};
function shoe(c,key){const s=(shoeCache[key]||(shoeCache[key]=buildShoe(c))).clone();s.scale.setScalar(.12);const G=new T.Group();s.position.y=.018;G.add(s);return G}
function jacket(vr){const G=new T.Group(),cloth=new T.MeshStandardMaterial({color:0x22222a,roughness:.75}),refl=new T.MeshBasicMaterial({color:new T.Color(1.8,1.8,1.9),toneMapped:false}),hm=new T.MeshStandardMaterial({color:0x8a8f96,metalness:.9,roughness:.3});
  const hook=new T.Mesh(new T.TorusGeometry(.03,.004,6,16,Math.PI*1.4),hm);hook.position.y=.66;G.add(hook);const bar=new T.Mesh(new T.CylinderGeometry(.004,.004,.36,6),hm);bar.rotation.z=Math.PI/2;bar.position.y=.6;G.add(bar);
  const body=RBox(.36,.46,.11,.04,cloth,0,.36,0,G);[-1,1].forEach(s=>{const sl=new T.Mesh(new T.CapsuleGeometry(.045,.36,6,12),cloth);sl.position.set(s*.22,.38,0);sl.rotation.z=s*.28;G.add(sl);const st=new T.Mesh(new T.CylinderGeometry(.047,.047,.02,12),refl);st.position.set(s*.25,.27,0);st.rotation.z=s*.28;G.add(st)});
  const hood=new T.Mesh(new T.SphereGeometry(.09,16,10,0,Math.PI*2,0,Math.PI/2),cloth);hood.position.set(0,.58,-.03);hood.rotation.x=-.4;G.add(hood);
  Box(.37,.018,.112,refl,0,.3,0,G);const zip=Box(.006,.44,.004,hm,0,.36,.057,G);const tag=new T.Mesh(new T.PlaneGeometry(.08,.03),new T.MeshBasicMaterial({map:label(256,96,'#000',[{t:'KAZE 風 · '+((vr&&vr.Ukuran)||'M'),f:'800 40px sans-serif',c:'#ff2bd6',y:48}])}));tag.position.set(-.09,.5,.057);G.add(tag);return G}
function box(w,h,d,col,rows,deco){const G=new T.Group(),side=new T.MeshStandardMaterial({color:col,roughness:.5}),top=new T.MeshStandardMaterial({map:label(512,Math.round(512*d/w),'#'+new T.Color(col).getHexString(),rows,deco),roughness:.5});
  const b=new T.Mesh(new T.BoxGeometry(w,h,d),[side,side,top,side,side,side]);b.position.y=h/2;b.castShadow=true;G.add(b);return G}
function socks(){const G=box(.2,.04,.26,0x0a0612,[{t:'KAZE 風',f:'800 56px sans-serif',c:'#ff2bd6',y:120},{t:'NEON CREW',f:'700 44px sans-serif',c:'#fff',y:300},{t:'3 PASANG',f:'600 34px sans-serif',c:'#00e5ff',y:420}]);
  ['#ff2bd6','#00e5ff','#5bffb0'].forEach((c,i)=>{const s=new T.Mesh(new T.CapsuleGeometry(.025,.14,6,10),new T.MeshStandardMaterial({color:c,roughness:.8}));s.rotation.x=Math.PI/2;s.position.set(-.05+i*.05,.065,0);G.add(s)});return G}
function laces(vr){const G=box(.12,.008,.2,0x111111,[{t:'TALI REFLEKTIF',f:'700 40px sans-serif',c:'#fff',y:120},{t:(vr&&vr.Panjang)||'120 cm',f:'800 70px sans-serif',c:'#ff2bd6',y:280}]),m=new T.MeshBasicMaterial({color:new T.Color(1.6,1.6,1.8),toneMapped:false});
  [0,1].forEach(i=>{const t=new T.Mesh(new T.TorusGeometry(.035,.005,6,40),m);t.rotation.x=Math.PI/2;t.position.set(0,.014+i*.01,.04);G.add(t)});return G}
function kit(){const G=box(.24,.08,.16,0x15121f,[{t:'KAZE CARE KIT',f:'800 52px sans-serif',c:'#00e5ff',y:150}]);const b=new T.Mesh(new T.CylinderGeometry(.025,.025,.12,20),new T.MeshStandardMaterial({color:0xff2bd6,roughness:.3}));b.position.set(.07,.14,0);G.add(b);
  const br=RBox(.1,.025,.04,.01,new T.MeshStandardMaterial({color:0x8a6a4a,roughness:.7}),-.05,.095,0,G);return G}
function model(pid,vr){if(pid==='air-kaze-02')return shoe(CW[(vr&&vr.Colorway)||'Cyber'],'k'+((vr&&vr.Colorway)||'Cyber'));if(pid==='neo-runner')return shoe(NEO[(vr&&vr.Warna)||'Hitam'],'n'+((vr&&vr.Warna)||'Hitam'));
  if(pid==='jaket-hujan')return jacket(vr);if(pid==='kaus-kaki')return socks();if(pid==='tali-reflektif')return laces(vr);if(pid==='kit-perawatan')return kit();return kit()}

/* ---------- tempat ---------- */
const stations={
  gang:{label:'Gang hujan',pos:[0,1.8,58],look:[0,6,-8],audio:'rain',href:'/'},
  neon:{label:'Di bawah neon',parent:'gang',pos:[0,2.1,28],look:[0,3.6,-8],audio:'rain',href:'/tentang'},
  kaca:{label:'Kaca etalase',parent:'neon',pos:[0,1.8,3],look:[0,2.3,-14],audio:'rain',href:'/kontak'},
  dalam:{label:'Tiga pedestal',parent:'kaca',pos:[0,1.8,-9.6],look:[0,1.4,-17],audio:'shop',href:'/drop'},
  meja:{label:'Meja drop',parent:'dalam',pos:[-1.4,2.5,-8.4],look:[-4.6,.95,-12.2],audio:'shop',href:'/toko'},
  kasir:{label:'Kasir',parent:'dalam',pos:[2.5,2.1,-9.2],look:[5.7,1.1,-11.8],audio:'shop',href:'/keranjang'},
  pajang:{label:'Pedestal 360°',parent:'dalam',pos:[0,1.8,-14.2],look:[0,1.25,-16],audio:'shop',href:'/produk/air-kaze-02'}};
const tour=['gang','neon','kaca','dalam','meja','pajang'];
const items=[['air-kaze-02',{Colorway:'Cyber',Ukuran:'42'},1,-1.5,-.2],['air-kaze-02',{Colorway:'Sunset',Ukuran:'42'},1,-.55,-.2],['air-kaze-02',{Colorway:'Jade',Ukuran:'42'},1,.4,-.2],['neo-runner',{Warna:'Hitam',Ukuran:'42'},1,1.35,-.2],
  ['kaus-kaki',null,0,-1.5,.25],['tali-reflektif',{Panjang:'120 cm'},0,-.85,.25],['kit-perawatan',null,0,-.15,.25],['neo-runner',{Warna:'Putih',Ukuran:'42'},0,.6,.25],['jaket-hujan',{Ukuran:'M'},0,1.45,.25]];
function setup(rt,W){const sc=rt.scene,w=rt.world;
  const m=new T.MeshStandardMaterial({color:0x15121f,roughness:.25,metalness:.6}),glowM=new T.MeshBasicMaterial({color:new T.Color(2.4,.6,2.2),toneMapped:false});
  // meja drop bertingkat
  const sh=shelf(sc,{pos:[-4.6,0,-12.2],rotY:0,len:3.6,depth:.9,rows:[.6,.95],mat:m,items,model,site,scale:1.35,pinY:.42,at:['meja'],noFrame:true});
  Box(3.6,.6,.9,m,0,.3,0,sh.g);Box(3.6,.35,.42,m,0,.775,-.2,sh.g);Box(3.62,.03,.04,glowM,0,.6,.46,sh.g);Box(3.62,.03,.04,glowM,0,.95,.02,sh.g);
  const dl=new T.PointLight(0xffffff,30,7,2);dl.position.set(-4.6,3.2,-11);sc.add(dl);
  // pedestal tengah dipakai sebagai pajangan 360°: sepatu bawaan disembunyikan selama tampilan produk
  const ped=pedestal(sc,{pos:[0,0,-16],noBase:true,h:1.02,r:1.28,model,scale:3.4,light:false,ring:new T.Color(2.4,.6,2.2)});ped.ring.visible=false;
  W.centerShoe=v=>{if(w.ped[1])w.ped[1].visible=v;ped.g.visible=!v};W.centerShoe(true);
  const ct=counter(sc,{pos:[5.7,0,-11.8],rotY:Math.PI,len:2.4,mat:m,topMat:new T.MeshStandardMaterial({color:0x2a2236,roughness:.3,metalness:.4}),model,site,basket:0x2a2a34,screen:new T.Color(.4,1.8,2.4)});
  const kl=new T.PointLight(0x00e5ff,20,7,2);kl.position.set(5,3,-11);sc.add(kl);
  sc.userData.aoDirty=true;
  W.pins=[{pos:[0,4.6,-7.9],label:'KAZE 風 SNEAKER LAB',sub:'Menyusuri gang',href:'#/tentang',at:['gang']},{pos:[0,2.6,-8],label:'Masuk',sub:'Tiga pedestal',href:'#/drop',at:['neon','kaca']},
    {pos:[-4.6,1.9,-12.2],label:'Meja drop',sub:'Katalog',href:'#/toko',at:['dalam','kasir','pajang','kaca']},{pos:[5.7,1.7,-11.8],label:'Kasir',sub:'Keranjang',href:'#/keranjang',at:['dalam','meja','pajang','kaca']},
    {pos:[0,2.6,-16],label:'Pedestal 360°',href:'#/produk/air-kaze-02',at:['dalam','meja','kasir']},{pos:[0,2.4,-8.4],label:'Keluar',sub:'Kontak',href:'#/kontak',at:['meja','kasir','pajang']}];
  wireShop(W,{site,model,shelves:[sh],ped,counter:ct,thumb:{rim:0xff2bd6}});
}
const btn=(h,t,g)=>'<a class="wbtn'+(g?' ghost':'')+'" href="#'+h+'">'+t+'</a>';
const PAL=['Cyber','Sunset','Jade'];
function home(){const h=site.home;return{st:'gang',kind:'hero',title:'Beranda',html:'<p class="wk">'+esc(h.eyebrow)+'</p><h1 class="wh big">'+h.title+'</h1><p class="wl">'+esc(h.sub)+'</p>'
  +'<div class="wrow">'+btn('/toko','Belanja drop')+btn('/tentang','Mulai tur',1)+'</div><ul class="wusp">'+site.usp.map(u=>'<li><b>'+esc(u[0])+'</b><span>'+esc(u[1])+'</span></li>').join('')+'</ul><p class="wtiny">Gulir atau tekan › untuk menyusuri gang. Seret layar untuk melihat sekeliling 360°.</p>'}}
function about(W){const a=site.about;return{st:'neon',title:'Cerita',html:'<p class="wk">Di bawah neon</p><h1 class="wh">'+esc(a.title)+'</h1><p class="wl">'+esc(a.sub)+'</p>'+a.paras.map(p=>'<p>'+esc(p)+'</p>').join('')
  +'<div class="wseg" role="group" aria-label="Palet neon">'+PAL.map((x,i)=>'<button data-act="neon" data-i="'+i+'" aria-pressed="'+((W.pal||0)===i)+'" style="--sw:'+['#00e5ff','#ff8a3d','#5bffb0'][i]+'"><i></i>'+x+'</button>').join('')+'</div>'
  +site.testi.slice(0,2).map(t=>'<blockquote>“'+esc(t[0])+'” <cite>'+esc(t[1])+', '+esc(t[2])+'</cite></blockquote>').join('')+'<div class="wrow">'+btn('/drop','Masuk ke toko')+'</div>'}}
function drop(W){return{st:'dalam',title:'Drop 02',html:'<p class="wk">Tiga pedestal</p><h1 class="wh">Drop 02: Air Kaze</h1><p class="wl">Tiga colorway berputar di pedestal. Ganti colorway atau percepat putaran, lalu lihat detailnya 360°.</p>'
  +'<div class="wrow"><button class="wbtn ghost" data-act="way">Ganti colorway</button><button class="wtg" data-act="spin" aria-pressed="'+!!W.spin+'"><i></i>Putaran: <b>'+(W.spin?'Cepat':'Santai')+'</b></button></div>'
  +'<div class="wmini">'+['Cyber','Sunset','Jade'].map(c=>'<a href="#/produk/air-kaze-02?Colorway='+c+'"><img src="'+(W.thumb?W.thumb('air-kaze-02',{Colorway:c,Ukuran:'40'}):'')+'" alt=""><span>Air Kaze 02 · '+c+'<b>'+shop.rp(1890000)+'</b></span></a>').join('')+'</div>'}}
const def={site,concept,stations,tour,audio:true,noglImg:'06',
  nav:[['Beranda','/'],['Cerita','/tentang'],['Drop 02','/drop'],['Toko','/toko'],['Lacak','/lacak'],['Kontak','/kontak']],
  setup,
  route(r,W){const a=r.seg[0];if(W.centerShoe)W.centerShoe(a!=='produk');
    if(!a)return home();if(a==='tentang')return about(W);if(a==='drop')return drop(W);
    if(a==='toko')return Object.assign(shop.catalog(site,W,r,{title:'Meja drop',sub:'Klik produk di meja, atau pilih di bawah. Setiap produk bisa diputar 360° di pedestal tengah.'}),{st:'meja'});
    if(a==='produk'){const o=shop.product(site,W,r.seg[1],r.q);if(!o)return null;let tg=[0,1.3,-16],sz=.6;if(W.showProduct){tg=W.showProduct(W.sel.pid,W.sel.vr);sz=W.orbitHint.size}return Object.assign(o,{st:'pajang',kind:'product',orbit:{target:tg,az:.5,el:.22,d:Math.max(1.55,sz*2+.4),dmin:Math.max(1.4,sz),dmax:4}})}
    if(a==='keranjang')return Object.assign(shop.cartPanel(site,W),{st:'kasir'});if(a==='checkout')return Object.assign(shop.checkout(site,W),{st:'kasir'});
    if(a==='pesanan')return Object.assign(shop.order(site,W,decodeURIComponent(r.seg[1]||'')),{st:'kasir'});if(a==='lacak')return Object.assign(shop.track(site,W,r),{st:'kasir'});
    if(a==='kontak'||a==='faq')return Object.assign(shop.contact(site,W,'Kaca etalase'),{st:'kaca'});return null},
  pickAction(id,W){if(id==='way'){W.rt.actions.way();W.sfx('cycle');return true}},
  act(t,e,W){const a=t.dataset.act;if(!W.rt&&a!=='quick')return shop.act(site,W,t);
    if(a==='neon'){W.pal=+t.dataset.i;W.rt.actions.neon(W.pal);document.querySelectorAll('[data-act=neon]').forEach(b=>b.setAttribute('aria-pressed',b===t));W.sfx('zap')}
    else if(a==='way'){W.rt.actions.way();W.sfx('cycle')}else if(a==='spin'){W.spin=!W.spin;W.rt.actions.spin(W.spin);t.setAttribute('aria-pressed',W.spin);t.querySelector('b').textContent=W.spin?'Cepat':'Santai';W.sfx('engine')}
    else shop.act(site,W,t)},
  onCart(W){W.onCartChange&&W.onCartChange()},
  refresh(r,W){if(r.seg[0]==='keranjang')W.render()}};
world(def);
