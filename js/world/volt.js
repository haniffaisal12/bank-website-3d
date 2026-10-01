/* VOLT — showroom SUV listrik yang juga tokonya. Plaza = beranda, pintu = cerita, lorong cincin = kontak,
   aula = konfigurator (cat, velg, lampu), mobil di piringan putar = VOLT X1 360°, dinding aksesori = katalog,
   alas aksesori = produk 360°, meja konsultan = kasir. */
import {T,V,Box,RBox,Cyl,mesh} from '../core.js';
import {world} from './world.js';
import {lath,label,shelf,pedestal,counter,wireShop} from './kit.js';
import * as shop from './shop.js';
import {esc} from '../site/ui.js';
import site from '../sites/volt.js';
import {concept} from '../concepts/volt.js';

let RT=null;
const COL={'Merah Api':0,'Putih Mutiara':1,'Biru Malam':2,'Hijau Hutan':3,'Abu Titanium':4};
/* ---------- model produk ---------- */
function carClone(vr){const G=new T.Group();if(!RT)return G;const w=RT.world,src=w.car.children.find(o=>o.isGroup&&o.children.length);if(!src)return G;
  const c=src.clone(true),pm=w.paint.clone();pm.color.setHex(w.paints[COL[(vr&&vr.Warna)||'Merah Api']||0][0]);const sport=vr&&/Sport/.test(vr.Velg||'');
  c.traverse(o=>{if(o.isMesh&&o.material===w.paint)o.material=pm;let p=o;while(p){if(p.name&&p.name.startsWith('VelgAero_')){o.visible=!sport;break}if(p.name&&p.name.startsWith('VelgSport_')){o.visible=sport;break}p=p.parent}});
  c.scale.setScalar(.98);G.add(c);return G}
const blk=new T.MeshStandardMaterial({color:0x15171c,roughness:.4,metalness:.3}),lime=new T.MeshBasicMaterial({color:new T.Color(1.6,2.2,.3),toneMapped:false}),wht=new T.MeshPhysicalMaterial({color:0xf2f3f5,roughness:.25,clearcoat:.8});
function wallbox(vr){const G=new T.Group();RBox(.26,.36,.1,.04,wht,0,.18,0,G);const ring=new T.Mesh(new T.TorusGeometry(.05,.006,8,40),lime);ring.position.set(0,.22,.051);G.add(ring);
  const lab=new T.Mesh(new T.PlaneGeometry(.12,.03),new T.MeshBasicMaterial({map:label(256,64,'#f2f3f5',[{t:'VOLT · 11 kW',f:'800 34px sans-serif',c:'#15171c',y:32}])}));lab.position.set(0,.1,.051);G.add(lab);
  const coil=new T.Mesh(new T.TorusGeometry(.09,.014,8,40),blk);coil.position.set(0,.06,.09);coil.rotation.x=Math.PI/2.3;G.add(coil);RBox(.05,.07,.04,.01,blk,.1,.03,.12,G);
  if(vr&&/Dengan/.test(vr.Pemasangan||'')){const t=new T.Mesh(new T.PlaneGeometry(.09,.04),new T.MeshBasicMaterial({map:label(256,112,'#e8ff3a',[{t:'+ PASANG',f:'800 44px sans-serif',c:'#141800',y:56}])}));t.position.set(-.07,.32,.052);G.add(t)}return G}
function cable(){const G=new T.Group(),bag=new T.MeshStandardMaterial({color:0x22252c,roughness:.8});RBox(.32,.2,.12,.04,bag,0,.1,0,G);const st=new T.Mesh(new T.PlaneGeometry(.2,.05),new T.MeshBasicMaterial({map:label(256,64,'#22252c',[{t:'VOLT CHARGE',f:'800 32px sans-serif',c:'#e8ff3a',y:32}])}));st.position.set(0,.13,.061);G.add(st);
  for(let i=0;i<3;i++){const c=new T.Mesh(new T.TorusGeometry(.07-i*.004,.009,8,40),blk);c.position.set(.24,.075,0);c.rotation.y=Math.PI/2;c.rotation.x=i*.25;G.add(c)}RBox(.05,.08,.04,.01,wht,.24,.16,.03,G);return G}
function rim(){const G=new T.Group(),tire=new T.Mesh(new T.TorusGeometry(.17,.07,16,48),new T.MeshStandardMaterial({color:0x101114,roughness:.85}));G.add(tire);const al=new T.MeshStandardMaterial({color:0x1d1f24,metalness:.9,roughness:.3});
  const disk=new T.Mesh(new T.CylinderGeometry(.16,.16,.06,40),al);disk.rotation.x=Math.PI/2;G.add(disk);for(let i=0;i<10;i++){const s=new T.Mesh(new T.BoxGeometry(.018,.15,.03),al);s.position.set(Math.sin(i*.628)*.08,Math.cos(i*.628)*.08,.03);s.rotation.z=-i*.628;G.add(s)}
  const cap=new T.Mesh(new T.CylinderGeometry(.03,.03,.02,20),lime);cap.rotation.x=Math.PI/2;cap.position.z=.04;G.add(cap);return G}
function rims(){const G=new T.Group();[[-.2,.24,0,0],[.2,.24,0,.3],[-.2,.24,-.3,.6],[.2,.24,-.3,.9]].forEach(q=>{const r=rim();r.scale.setScalar(.95);r.position.set(q[0],q[1],q[2]);r.rotation.y=q[3]*.2;G.add(r)});return G}
function ppf(){const G=new T.Group();RBox(.5,.06,.12,.02,new T.MeshStandardMaterial({color:0x15171c,roughness:.5}),0,.03,0,G);const roll=new T.Mesh(new T.CylinderGeometry(.06,.06,.46,32),new T.MeshPhysicalMaterial({color:0xe8f4ff,transparent:true,opacity:.55,roughness:.05,clearcoat:1}));roll.rotation.z=Math.PI/2;roll.position.y=.12;G.add(roll);
  const core=new T.Mesh(new T.CylinderGeometry(.02,.02,.48,16),lime);core.rotation.z=Math.PI/2;core.position.y=.12;G.add(core);const film=new T.Mesh(new T.PlaneGeometry(.44,.2),new T.MeshPhysicalMaterial({color:0xe8f4ff,transparent:true,opacity:.35,roughness:.05,side:T.DoubleSide}));film.position.set(0,.08,.07);film.rotation.x=-.3;G.add(film);return G}
function model(pid,vr){if(pid==='volt-x1')return carClone(vr);if(pid==='wallbox')return wallbox(vr);if(pid==='kabel-portabel')return cable();if(pid==='velg-sport')return rims();if(pid==='ppf')return ppf();return ppf()}

/* ---------- tempat ---------- */
const CAR=[0,1.05,-44];const carOrb=(az,d)=>[CAR[0]+Math.sin(az)*Math.cos(.16)*d,CAR[1]+Math.sin(.16)*d,CAR[2]+Math.cos(az)*Math.cos(.16)*d];
const stations={
  plaza:{label:'Plaza',pos:[18,2.2,34],look:[0,4,-16],audio:'city',href:'/'},
  pintu:{label:'Pintu showroom',parent:'plaza',pos:[3,1.7,4],look:[0,3,-22],audio:'city',href:'/tentang'},
  lorong:{label:'Lorong cahaya',parent:'pintu',pos:[0,1.7,-15],look:[0,1.5,-40],audio:'showroom',href:'/kontak'},
  aula:{label:'Aula konfigurator',parent:'lorong',pos:[5.6,2.1,-37],look:[-3.4,.3,-42.2],audio:'showroom',href:'/konfigurator'},
  mobil:{label:'VOLT X1 360°',parent:'aula',pos:carOrb(.9,7.2),look:CAR,audio:'showroom',href:'/produk/volt-x1'},
  rak:{label:'Dinding aksesori',parent:'aula',pos:[-16.8,1.95,-36.4],look:[-21.4,1.2,-40],audio:'showroom',href:'/toko'},
  pajang:{label:'Alas aksesori',parent:'aula',pos:[-9.6,1.9,-29.4],look:[-12,1.3,-32],audio:'showroom',href:'/produk/wallbox'},
  kasir:{label:'Meja konsultan',parent:'aula',pos:[10.2,2.1,-31],look:[14.8,1.1,-34],audio:'showroom',href:'/keranjang'}};
const tour=['plaza','pintu','lorong','aula','mobil','rak'];
const items=[['wallbox',{Pemasangan:'Tanpa pemasangan'},1,-1.6],['wallbox',{Pemasangan:'Dengan pemasangan'},1,-.9],['kabel-portabel',null,1,.1],['ppf',null,1,1.2],
  ['velg-sport',null,0,-1.2],['velg-sport',null,0,.3],['kabel-portabel',null,0,1.4]];
function setup(rt,W){RT=rt;const sc=rt.scene,dark=new T.MeshStandardMaterial({color:0x0d0f14,metalness:.85,roughness:.25}),limeL=new T.MeshBasicMaterial({color:new T.Color(1.4,1.9,.2),toneMapped:false});
  const sh=shelf(sc,{pos:[-21.4,0,-40],rotY:Math.PI/2,len:4.4,depth:.6,rows:[.1,1.2],mat:dark,items,model,site,scale:1.6,pinY:.7,at:['rak']});
  Box(4.4,.03,.03,limeL,0,1.18,.31,sh.g);Box(4.4,.03,.03,limeL,0,.08,.31,sh.g);
  const l1=new T.SpotLight(0xffffff,60,14,.6,.6,2);l1.position.set(-16,7,-40);l1.target.position.set(-21,1,-40);sc.add(l1,l1.target);
  const ped=pedestal(sc,{pos:[-12,0,-32],k:1.2,mat:dark,model,scale:1.6,ring:new T.Color(1.4,1.9,.2),lightI:40});
  const ct=counter(sc,{pos:[14.8,0,-34],rotY:Math.PI*1.15,len:2.6,mat:dark,topMat:new T.MeshPhysicalMaterial({color:0xf2f3f5,roughness:.2,clearcoat:.8}),model,site,basket:0x22252c,screen:new T.Color(1.4,1.9,.2)});
  const l2=new T.PointLight(0xffffff,20,8,2);l2.position.set(13,3.2,-33);sc.add(l2);
  sc.userData.aoDirty=true;
  W.pins=[{pos:[0,6,-10],label:'Showroom VOLT',sub:'Masuk',href:'#/tentang',at:['plaza']},{pos:[0,2.8,-14],label:'Lorong cahaya',href:'#/kontak',at:['pintu']},
    {pos:[0,3.3,-44],label:'VOLT X1',sub:'Lihat 360°',kind:'prod',href:'#/produk/volt-x1',at:['lorong','aula','rak','pajang','kasir']},{pos:[-21,2.6,-40],label:'Dinding aksesori',sub:'Katalog',href:'#/toko',at:['aula','mobil','kasir','pajang']},
    {pos:[-12,2.6,-32],label:'Alas aksesori 360°',href:'#/produk/wallbox',at:['aula','rak','kasir']},{pos:[14.8,2,-34],label:'Meja konsultan',sub:'Keranjang',href:'#/keranjang',at:['aula','mobil','rak','pajang']},{pos:[0,2.6,-26],label:'Lorong',sub:'Kontak',href:'#/kontak',at:['aula','rak','kasir']}];
  wireShop(W,{site,model,shelves:[sh],ped,counter:ct,thumb:{rim:0xe8ff3a}});
  // varian VOLT X1 langsung mengubah mobil di piringan
  const base=W.onVariant;W.onVariant=(pid,vr)=>{if(pid==='volt-x1'){applyCar(vr);W.kick(.8)}else base(pid,vr)};
  function applyCar(vr){rt.actions.paint(COL[vr.Warna]||0);rt.actions.rims(/Sport/.test(vr.Velg||''))}W.applyCar=applyCar;
}
const btn=(h,t,g)=>'<a class="wbtn'+(g?' ghost':'')+'" href="#'+h+'">'+t+'</a>';
const PN=['Merah Api','Putih Mutiara','Biru Malam','Hijau Hutan','Abu Titanium'],PC=['#c4102c','#f3f4f6','#0a1c4a','#0d3a2b','#8a9096'];
function home(){const h=site.home;return{st:'plaza',kind:'hero',title:'Beranda',html:'<p class="wk">'+esc(h.eyebrow)+'</p><h1 class="wh big">'+h.title+'</h1><p class="wl">'+esc(h.sub)+'</p>'
  +'<div class="wrow">'+btn('/konfigurator','Konfigurasi VOLT X1')+btn('/tentang','Mulai tur',1)+'</div><ul class="wusp">'+site.usp.map(u=>'<li><b>'+esc(u[0])+'</b><span>'+esc(u[1])+'</span></li>').join('')+'</ul><p class="wtiny">Gulir atau tekan › untuk masuk ke showroom. Seret layar untuk melihat sekeliling 360°.</p>'}}
function about(){const a=site.about;return{st:'pintu',title:'Cerita',html:'<p class="wk">Pintu showroom</p><h1 class="wh">'+esc(a.title)+'</h1><p class="wl">'+esc(a.sub)+'</p>'+a.paras.map(p=>'<p>'+esc(p)+'</p>').join('')
  +'<h3>Yang kami pegang</h3>'+a.values.map(v=>'<p><b>'+esc(v[0])+'.</b> '+esc(v[1])+'</p>').join('')+site.testi.slice(0,2).map(t=>'<blockquote>“'+esc(t[0])+'” <cite>'+esc(t[1])+', '+esc(t[2])+'</cite></blockquote>').join('')+'<div class="wrow">'+btn('/konfigurator','Masuk ke aula')+'</div>'}}
function konfig(W){const c=W.cfg||{p:0,r:false,l:false,s:false};W.cfg=c;return{st:'aula',title:'Konfigurator',html:'<p class="wk">Aula konfigurator</p><h1 class="wh">Rakit VOLT X1 Anda</h1><p class="wl">Pilihan langsung tampil di mobil. Lanjutkan ke halaman produk untuk memutar 360° dan memesan.</p>'
  +'<fieldset class="wvar"><legend>Warna cat: <b id="cfgP">'+PN[c.p]+'</b></legend><div>'+PN.map((x,i)=>'<button type="button" data-act="paint" data-i="'+i+'" class="'+(i===c.p?'on':'')+'" aria-pressed="'+(i===c.p)+'"><i style="background:'+PC[i]+'"></i>'+x+'</button>').join('')+'</div></fieldset>'
  +'<div class="wrow"><button class="wtg" data-act="rims" aria-pressed="'+c.r+'"><i></i>Velg: <b>'+(c.r?'Sport 21"':'Aero 20"')+'</b></button><button class="wtg" data-act="lights" aria-pressed="'+c.l+'"><i></i>Lampu depan</button><button class="wtg" data-act="spin" aria-pressed="'+c.s+'"><i></i>Hentikan putaran</button></div>'
  +'<div class="wstat"><div><b>620 km</b><span>jarak WLTP</span></div><div><b>4,9 s</b><span>0–100 km/jam</span></div><div><b>22 mnt</b><span>10–80%</span></div></div>'
  +'<div class="wrow"><a class="wbtn" id="cfgGo" href="#/produk/volt-x1?Warna='+encodeURIComponent(PN[c.p])+'&Velg='+encodeURIComponent(c.r?'Sport 21"':'Aero 20"')+'">Lihat 360° &amp; pesan</a>'+btn('/toko','Aksesori',1)+'</div>'}}
const def={site,concept,stations,tour,audio:true,noglImg:'06',
  nav:[['Beranda','/'],['Cerita','/tentang'],['Konfigurator','/konfigurator'],['VOLT X1','/produk/volt-x1'],['Aksesori','/toko'],['Lacak','/lacak'],['Kontak','/kontak']],
  setup,
  route(r,W){const a=r.seg[0];
    if(!a)return home();if(a==='tentang')return about();if(a==='konfigurator')return konfig(W);
    if(a==='toko')return Object.assign(shop.catalog(site,W,r,{title:'Dinding aksesori',sub:'Pengisian daya dan aksesori. VOLT X1 sendiri bisa dikitari 360° di piringan putar.'}),{st:'rak'});
    if(a==='produk'){const id=r.seg[1];const o=shop.product(site,W,id,r.q);if(!o)return null;
      if(id==='volt-x1'){W.applyCar&&W.applyCar(W.sel.vr);o.html=o.html.replace('Seret produk untuk memutar 360°','Seret untuk mengitari mobil 360°');return Object.assign(o,{st:'mobil',kind:'product',orbit:{target:CAR,az:.9,el:.16,d:7.2,dmin:4.6,dmax:11}})}
      let tg=[-12,1.5,-32],sz=.6;if(W.showProduct){tg=W.showProduct(W.sel.pid,W.sel.vr);sz=W.orbitHint.size}return Object.assign(o,{st:'pajang',kind:'product',orbit:{target:tg,az:.7,el:.2,d:sz*1.7+.5,dmin:sz,dmax:sz*4}})}
    if(a==='keranjang')return Object.assign(shop.cartPanel(site,W),{st:'kasir'});if(a==='checkout')return Object.assign(shop.checkout(site,W),{st:'kasir'});
    if(a==='pesanan')return Object.assign(shop.order(site,W,decodeURIComponent(r.seg[1]||'')),{st:'kasir'});if(a==='lacak')return Object.assign(shop.track(site,W,r),{st:'kasir'});
    if(a==='kontak'||a==='faq')return Object.assign(shop.contact(site,W,'Lorong cahaya'),{st:'lorong'});return null},
  pickAction(id,W){if(id==='paint'){const c=W.cfg||(W.cfg={p:0,r:false,l:false,s:false});c.p=(c.p+1)%5;W.rt.actions.paint(c.p);W.sfx('cycle');if(W.stationId==='aula')W.render();return true}},
  act(t,e,W){const a=t.dataset.act,c=W.cfg||(W.cfg={p:0,r:false,l:false,s:false});if(!W.rt&&/^(paint|rims|lights|spin)$/.test(a))return;
    if(a==='paint'){c.p=+t.dataset.i;W.rt.actions.paint(c.p);W.sfx('cycle');W.render()}
    else if(a==='rims'){c.r=!c.r;W.rt.actions.rims(c.r);W.sfx('cycle');W.render()}
    else if(a==='lights'){c.l=!c.l;W.rt.actions.lights(c.l);t.setAttribute('aria-pressed',c.l);W.sfx(c.l?'on':'off')}
    else if(a==='spin'){c.s=!c.s;W.rt.actions.spin(c.s);t.setAttribute('aria-pressed',c.s);W.sfx('engine')}
    else shop.act(site,W,t)},
  onCart(W){W.onCartChange&&W.onCartChange()},
  refresh(r,W){if(r.seg[0]==='keranjang')W.render()}};
world(def);
