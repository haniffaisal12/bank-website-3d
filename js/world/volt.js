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
    {pos:[0,3.3,-44],label:'VOLT X1',sub:'Lihat 360°',kind:'prod',href:'#/produk/volt-x1',at:['lorong','aula','rak','pajang','kasir']},{pos:[-21,2.6,-40],label:'Dinding aksesori',sub:'Katalog',href:'#/toko',at:['aula','kasir','pajang']},
    {pos:[-12,2.6,-32],label:'Alas aksesori 360°',href:'#/produk/wallbox',at:['aula','rak','kasir']},{pos:[14.8,2,-34],label:'Meja konsultan',sub:'Keranjang',href:'#/keranjang',at:['aula','mobil','rak','pajang']},{pos:[0,2.6,-26],label:'Lorong',sub:'Kontak',href:'#/kontak',at:['aula','rak','kasir']}];
  wireShop(W,{site,model,shelves:[sh],ped,counter:ct,thumb:{rim:0xe8ff3a}});
  // varian VOLT X1 langsung mengubah mobil di piringan
  const base=W.onVariant;W.onVariant=(pid,vr)=>{if(pid==='volt-x1'){applyCar(vr);W.kick(.8)}else base(pid,vr)};
  function applyCar(vr){rt.actions.paint(COL[vr.Warna]||0);rt.actions.rims(/Sport/.test(vr.Velg||''))}W.applyCar=applyCar;
}
const btn=(h,t,g)=>'<a class="wbtn'+(g?' ghost':'')+'" href="#'+h+'">'+t+'</a>';
const PN=['Merah Api','Putih Mutiara','Biru Malam','Hijau Hutan','Abu Titanium'],PC=['#c4102c','#f3f4f6','#0a1c4a','#0d3a2b','#8a9096'];
/* ---------- pengalaman "konfigurator": langkah bertahap di dok bawah, harga berjalan, kamera mengikuti langkah ---------- */
const STEPS=[['warna','Warna'],['velg','Velg'],['baterai','Baterai'],['aksesori','Aksesori'],['ringkasan','Ringkasan']];
const VIEW={warna:{az:.9,el:.16,d:7.2},velg:{az:1.45,el:.04,d:4.8},baterai:{az:2.3,el:.62,d:7.6},aksesori:{az:3.3,el:.2,d:7.4},ringkasan:{az:.45,el:.14,d:6.8}};
const X1=()=>shop.P(site,'volt-x1'),ACC=['wallbox','kabel-portabel','velg-sport','ppf'];
const cfg=W=>W.cfg2||(W.cfg2={Warna:'Merah Api',Velg:'Aero 20"',Baterai:'Standar 82 kWh',acc:new Set()});
const delta=(key,v)=>{const g=X1().variants.find(x=>x.key===key),o=g&&g.values.find(x=>x.v===v);return o&&o.delta||0};
const total=c=>X1().price+delta('Velg',c.Velg)+delta('Baterai',c.Baterai)+[...c.acc].reduce((a,id)=>a+shop.P(site,id).price,0);
function chrome(W){const d=document.createElement('section');d.id='voDock';d.hidden=true;d.setAttribute('aria-label','Konfigurator');document.body.appendChild(d);
  const pr=document.createElement('div');pr.id='voPrice';pr.innerHTML='<span>VOLT X1</span><b id="voP">'+shop.rp(X1().price)+'</b><em>booking fee Rp 5 jt</em>';document.querySelector('.wbar').appendChild(pr)}
function drawDock(W,step){const c=cfg(W),d=document.getElementById('voDock');if(!d)return;const i=STEPS.findIndex(x=>x[0]===step);let opts='';
  if(step==='warna')opts=PN.map((x,k)=>'<button class="vo-sw'+(c.Warna===x?' on':'')+'" data-act="cfg" data-k="Warna" data-v="'+x+'"><i style="background:'+PC[k]+'"></i><span>'+x+'</span></button>').join('');
  else if(step==='velg'||step==='baterai'){const g=X1().variants.find(x=>x.key===(step==='velg'?'Velg':'Baterai'));opts=g.values.map(o=>'<button class="vo-card'+(c[g.key]===o.v?' on':'')+'" data-act="cfg" data-k="'+g.key+'" data-v="'+esc(o.v)+'"><b>'+esc(o.v)+'</b><span>'+(o.delta?'+'+shop.rp(o.delta):'Termasuk')+'</span><em>'+(step==='baterai'?(o.delta?'720 km WLTP':'620 km WLTP'):(o.delta?'Tempa, lebih ringan 11 kg':'Aerodinamis, hemat energi'))+'</em></button>').join('')}
  else if(step==='aksesori')opts=ACC.map(id=>{const p=shop.P(site,id),on=c.acc.has(id);return '<button class="vo-acc'+(on?' on':'')+'" data-act="acc" data-id="'+id+'" aria-pressed="'+on+'"><img src="'+(W.thumb?W.thumb(id,shop.defVar(p)):'')+'" alt=""><b>'+esc(p.name)+'</b><span>'+shop.rp(p.price)+'</span></button>'}).join('');
  else opts='<div class="vo-sum"><div><span>Warna</span><b>'+c.Warna+'</b></div><div><span>Velg</span><b>'+esc(c.Velg)+'</b></div><div><span>Baterai</span><b>'+c.Baterai+'</b></div><div><span>Aksesori</span><b>'+(c.acc.size?[...c.acc].map(id=>shop.P(site,id).name).join(', '):'—')+'</b></div><div class="tt"><span>Total on the road</span><b>'+shop.rp(total(c))+'</b></div></div><button class="wbtn" data-act="reserve">Reservasi · bayar booking fee Rp 5 jt</button>';
  d.innerHTML='<ol class="vo-steps">'+STEPS.map((x,k)=>'<li class="'+(k<i?'done':k===i?'cur':'')+'"><a href="#/rakit/'+x[0]+'"><b>'+(k+1)+'</b>'+x[1]+'</a></li>').join('')+'</ol><div class="vo-opts">'+opts+'</div>'
   +'<div class="vo-nav">'+(i>0?'<a class="wbtn ghost sm" href="#/rakit/'+STEPS[i-1][0]+'">‹ '+STEPS[i-1][1]+'</a>':'<span></span>')+(i<STEPS.length-1?'<a class="wbtn sm" href="#/rakit/'+STEPS[i+1][0]+'">'+STEPS[i+1][1]+' ›</a>':'')+'</div>';
  document.getElementById('voP').textContent=shop.rp(total(c))}
function rakit(W,step){if(!VIEW[step])step='warna';const c=cfg(W);W.applyCar&&W.applyCar(c);const v=VIEW[step];const p=X1();
  const info={warna:['Lima warna, satu bodi','Cat multi-lapis dengan pernis keramik. Klik mobil untuk mengganti warna, atau pilih di dok bawah.'],velg:['Aero atau Sport','Aero hemat energi; Sport tempa lebih ringan dan tajam saat menikung.'],
    baterai:['Jarak yang Anda butuhkan','Standar 82 kWh cukup untuk harian; Long Range 100 kWh untuk lintas kota.'],aksesori:['Lengkapi sejak awal','Wallbox, kabel portabel, velg, dan pelindung cat dikirim bersama mobil.'],ringkasan:['Siap dipesan','Booking fee dapat dikembalikan penuh sebelum produksi dimulai.']}[step];
  return{st:'mobil',kind:'spec',title:'Rakit VOLT X1',orbit:{target:CAR,az:v.az,el:v.el,d:v.d,dmin:4.4,dmax:11},
    html:'<p class="wk">Langkah '+(STEPS.findIndex(x=>x[0]===step)+1)+' dari 5</p><h1 class="wh">'+info[0]+'</h1><p class="wl">'+info[1]+'</p><table>'+p.spec.map(x=>'<tr><th>'+esc(x[0])+'</th><td>'+esc(x[1])+'</td></tr>').join('')+'</table>'
     +'<div class="wrow"><button class="wtg" data-act="lights" aria-pressed="'+!!(W.cfg&&W.cfg.l)+'"><i></i>Lampu depan</button><button class="wtg" data-act="spin" aria-pressed="'+!!(W.cfg&&W.cfg.s)+'"><i></i>Hentikan putaran</button></div><p class="wtiny">Seret untuk mengitari mobil 360°.</p>',step}}
function home(){const h=site.home;return{st:'plaza',kind:'hero',title:'VOLT X1',html:'<p class="wk">'+esc(h.eyebrow)+'</p><h1 class="wh big">VOLT X1</h1><p class="wl">'+esc(h.sub)+'</p>'
  +'<div class="vo-kpi">'+site.usp.map(u=>'<div><b>'+esc(u[0])+'</b><span>'+esc(u[1])+'</span></div>').join('')+'</div><div class="wrow">'+btn('/rakit/warna','Rakit milik Anda →')+btn('/tentang','Cerita VOLT',1)+'</div>'}}
function about(){const a=site.about;return{st:'pintu',title:'Cerita',html:'<p class="wk">Pintu showroom</p><h1 class="wh">'+esc(a.title)+'</h1><p class="wl">'+esc(a.sub)+'</p>'+a.paras.map(p=>'<p>'+esc(p)+'</p>').join('')
  +'<h3>Yang kami pegang</h3>'+a.values.map(v=>'<p><b>'+esc(v[0])+'.</b> '+esc(v[1])+'</p>').join('')+site.testi.slice(0,2).map(t=>'<blockquote>“'+esc(t[0])+'” <cite>'+esc(t[1])+', '+esc(t[2])+'</cite></blockquote>').join('')+'<div class="wrow">'+btn('/rakit/warna','Rakit VOLT X1')+'</div>'}}
const def={site,concept,stations,tour,audio:true,noglImg:'06',layout:'config',avoid:['#wp','#voDock'],chrome,
  nav:[['Rakit','/rakit/warna'],['Aksesori','/toko'],['Cerita','/tentang'],['Lacak','/lacak'],['Kontak','/kontak']],
  setup,
  route(r,W){const a=r.seg[0];
    if(!a)return home();if(a==='tentang')return about();
    if(a==='rakit'||a==='konfigurator'||(a==='produk'&&r.seg[1]==='volt-x1')){const c=cfg(W);if(a==='produk')['Warna','Velg','Baterai'].forEach(k=>{const v=r.q.get(k);if(v)c[k]=v});return rakit(W,a==='rakit'?r.seg[1]:'warna')}
    if(a==='toko')return Object.assign(shop.catalog(site,W,r,{title:'Dinding aksesori',sub:'Pengisian daya dan aksesori. Bisa juga ditambahkan di langkah 4 konfigurator.'}),{st:'rak'});
    if(a==='produk'){const id=r.seg[1];const o=shop.product(site,W,id,r.q);if(!o)return null;let tg=[-12,1.5,-32],sz=.6;if(W.showProduct){tg=W.showProduct(W.sel.pid,W.sel.vr);sz=W.orbitHint.size}return Object.assign(o,{st:'pajang',kind:'product',orbit:{target:tg,az:.7,el:.2,d:sz*1.7+.5,dmin:sz,dmax:sz*4}})}
    if(a==='keranjang')return Object.assign(shop.cartPanel(site,W),{st:'kasir'});if(a==='checkout'){const o=shop.checkout(site,W);o.html=o.html.replace('<h1 class="wh">Checkout</h1>','<h1 class="wh">Reservasi</h1><p class="wl">Yang dibayar sekarang hanya booking fee Rp 5.000.000 (simulasi); sisanya saat serah terima.</p>');return Object.assign(o,{st:'kasir'})}
    if(a==='pesanan')return Object.assign(shop.order(site,W,decodeURIComponent(r.seg[1]||'')),{st:'kasir'});if(a==='lacak')return Object.assign(shop.track(site,W,r),{st:'kasir'});
    if(a==='kontak'||a==='faq')return Object.assign(shop.contact(site,W,'Lorong cahaya'),{st:'lorong'});return null},
  onRoute(r,out,W){const d=document.getElementById('voDock');d.hidden=!out.step;if(out.step)drawDock(W,out.step);else document.getElementById('voP').textContent=shop.rp(total(cfg(W)))},
  pickAction(id,W){if(id==='paint'){const c=cfg(W);c.Warna=PN[(PN.indexOf(c.Warna)+1)%5];W.applyCar(c);W.sfx('cycle');if(document.querySelector('#voDock:not([hidden])'))drawDock(W,W.parse().seg[1]||'warna');return true}},
  act(t,e,W){const a=t.dataset.act,c=W.cfg||(W.cfg={p:0,r:false,l:false,s:false}),k=cfg(W);
    if(a==='cfg'){k[t.dataset.k]=t.dataset.v;W.applyCar&&W.applyCar(k);W.sfx('cycle');W.kick(.8);drawDock(W,W.parse().seg[1]||'warna');return}
    if(a==='acc'){const id=t.dataset.id;k.acc.has(id)?k.acc.delete(id):k.acc.add(id);W.sfx('coin');drawDock(W,'aksesori');return}
    if(a==='reserve'){const v={Warna:k.Warna,Velg:k.Velg,Baterai:k.Baterai};shop.cart.add(site.id,'volt-x1',v,1);k.acc.forEach(id=>shop.cart.add(site.id,id,shop.defVar(shop.P(site,id)),1));W.sfx('coin');location.hash='/checkout';return}
    if(!W.rt&&/^(lights|spin)$/.test(a))return;
    if(a==='lights'){c.l=!c.l;W.rt.actions.lights(c.l);t.setAttribute('aria-pressed',c.l);W.sfx(c.l?'on':'off')}
    else if(a==='spin'){c.s=!c.s;W.rt.actions.spin(c.s);t.setAttribute('aria-pressed',c.s);W.sfx('engine')}
    else shop.act(site,W,t)},
  onCart(W){W.onCartChange&&W.onCartChange()},
  refresh(r,W){if(r.seg[0]==='keranjang')W.render()}};
world(def);
