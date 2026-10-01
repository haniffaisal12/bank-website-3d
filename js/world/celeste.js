/* CELESTE — toko teleskop & observatorium di kubahnya sendiri. Puncak = beranda, jalan menanjak = cerita, pintu = kontak,
   di bawah kubah = malam pengamatan (buka celah, arahkan teleskop), rak melengkung = katalog, alas kayu = produk 360°, meja = kasir. */
import {T,V,Box,RBox,Cyl,mesh,camera} from '../core.js';
import {world} from './world.js';
import {lath,label,shelf,pedestal,counter,wireShop} from './kit.js';
import * as shop from './shop.js';
import {esc} from '../site/ui.js';
import site from '../sites/celeste.js';
import {concept} from '../concepts/celeste.js';

/* ---------- model produk ---------- */
const mats={};const M=(k,f)=>mats[k]||(mats[k]=f());
const blk=()=>M('blk',()=>new T.MeshStandardMaterial({color:0x111216,roughness:.45})),al=()=>M('al',()=>new T.MeshStandardMaterial({color:0xc9ced6,metalness:1,roughness:.22})),brass=()=>M('br',()=>new T.MeshStandardMaterial({color:0xd0a24a,metalness:1,roughness:.28}));
const lens=()=>M('lens',()=>new T.MeshPhysicalMaterial({color:0x22306a,roughness:.03,clearcoat:1,metalness:.2}));
function strut(G,a,b,r,m){const d=b.clone().sub(a),c=new T.Mesh(new T.CylinderGeometry(r,r,d.length(),10),m);c.position.copy(a).add(b).multiplyScalar(.5);c.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());c.castShadow=true;G.add(c)}
function refractor(vr){const G=new T.Group(),tubeC=(vr&&vr.Warna)==='Biru malam'?0x1a2a5a:0xf1f1ee,tm=new T.MeshPhysicalMaterial({color:tubeC,roughness:.3,clearcoat:.7}),track=vr&&/tracking/.test(vr.Dudukan||'');
  const H=.62;for(let i=0;i<3;i++){const a=i*2.094+.3;strut(G,V(0,H,0),V(Math.sin(a)*.26,0,Math.cos(a)*.26),.009,al())}
  Cyl(.03,.03,.04,blk(),0,H+.02,0,G,16);const head=new T.Group();head.position.y=H+.05;G.add(head);
  if(track){RBox(.07,.09,.07,.01,blk(),0,.045,0,head);const pad=new T.Mesh(new T.PlaneGeometry(.04,.025),new T.MeshBasicMaterial({color:new T.Color(.4,1.8,.6),toneMapped:false}));pad.position.set(0,.06,.036);head.add(pad)}else RBox(.05,.06,.05,.01,blk(),0,.03,0,head);
  const T_=new T.Group();T_.position.y=.1;T_.rotation.z=-.55;head.add(T_);
  const tube=new T.Mesh(lath([[.04,-.2],[.042,-.18],[.042,.22],[.048,.24],[.048,.3],[.044,.3]],40),tm);T_.add(tube);
  const dew=new T.Mesh(lath([[.046,.22],[.05,.22],[.05,.33],[.046,.33]],40),blk());T_.add(dew);const ob=new T.Mesh(new T.CircleGeometry(.04,32),lens());ob.rotation.x=-Math.PI/2;ob.position.y=.25;T_.add(ob);
  Cyl(.018,.018,.08,blk(),0,-.24,0,T_,16);const dg=RBox(.03,.03,.03,.006,blk(),0,-.29,.01,T_);Cyl(.012,.012,.05,brass(),0,-.3,.04,T_,12).rotation.x=Math.PI/2;
  const fd=new T.Mesh(new T.CylinderGeometry(.012,.012,.08,12),blk());fd.position.set(.045,.05,0);T_.add(fd);
  const lab=new T.Mesh(new T.PlaneGeometry(.05,.15),new T.MeshBasicMaterial({map:label(128,384,'#00000000',[{t:'CX-80',f:'800 44px sans-serif',c:'#b9a6ff',y:192}]),transparent:true}));lab.rotation.y=Math.PI/2;lab.position.set(.0425,0,0);T_.add(lab);
  G.traverse(o=>{if(o.isMesh)o.castShadow=true});return G}
function dobson(){const G=new T.Group(),wood=new T.MeshStandardMaterial({color:0x8a5a2e,roughness:.6}),tm=new T.MeshPhysicalMaterial({color:0x1b1d24,roughness:.35,clearcoat:.6});
  Cyl(.2,.2,.02,wood,0,.01,0,G,40);[-1,1].forEach(s=>Box(.02,.32,.3,wood,s*.15,.18,0,G));Box(.3,.02,.3,wood,0,.03,0,G);Box(.3,.12,.02,wood,0,.08,-.14,G);
  const T_=new T.Group();T_.position.y=.3;T_.rotation.x=-.75;G.add(T_);T_.add(new T.Mesh(new T.CylinderGeometry(.12,.12,.9,48,1,true),tm));
  [-1,1].forEach(s=>{const b=new T.Mesh(new T.CylinderGeometry(.07,.07,.03,32),new T.MeshStandardMaterial({color:0xd0d0d0,roughness:.3}));b.rotation.z=Math.PI/2;b.position.x=s*.13;T_.add(b)});
  const rim=new T.Mesh(new T.TorusGeometry(.12,.008,8,48),al());rim.rotation.x=Math.PI/2;rim.position.y=.45;T_.add(rim);Cyl(.02,.02,.07,blk(),.13,.36,0,T_,12).rotation.z=Math.PI/2;
  G.traverse(o=>{if(o.isMesh)o.castShadow=true});return G}
function eyepieces(){const G=new T.Group(),c=new T.MeshStandardMaterial({color:0x22242a,roughness:.5});RBox(.26,.05,.18,.01,c,0,.025,0,G);const foam=new T.Mesh(new T.PlaneGeometry(.24,.16),new T.MeshStandardMaterial({color:0x111,roughness:1}));foam.rotation.x=-Math.PI/2;foam.position.y=.051;G.add(foam);
  [6.3,10,15,25].forEach((mm,i)=>{const e=new T.Group();e.position.set(-.09+i*.06,.05,0);G.add(e);e.add(new T.Mesh(lath([[.001,0],[.016,0],[.016,.03],[.02,.035],[.02,.07],[.014,.075],[.001,.075]],24),blk()));const r=new T.Mesh(new T.TorusGeometry(.0205,.002,6,24),brass());r.rotation.x=Math.PI/2;r.position.y=.05;e.add(r)});return G}
function filters(){const G=new T.Group();[['#ffcc66',0],['#66aaff',1],['#ff6a5a',2],['#ccc',3]].forEach(([c,i])=>{const f=new T.Group();f.position.set(-.06+i*.04,.012,0);f.rotation.x=-.2;G.add(f);Cyl(.02,.02,.008,blk(),0,0,0,f,24);
  const g=new T.Mesh(new T.CircleGeometry(.017,24),new T.MeshPhysicalMaterial({color:c,transparent:true,opacity:.7,roughness:.05}));g.rotation.x=-Math.PI/2;g.position.y=.0045;f.add(g)});return G}
function starmap(){const G=new T.Group(),c=label(512,512,'#0d1030',[{t:'PETA BINTANG',f:'700 34px sans-serif',c:'#b9a6ff',y:470}],(g,w,h)=>{g.fillStyle='#fff';for(let i=0;i<260;i++){g.globalAlpha=Math.random();g.beginPath();g.arc(Math.random()*w,Math.random()*h*.85,Math.random()*2.2,0,7);g.fill()}g.globalAlpha=1;g.strokeStyle='#b9a6ff';g.lineWidth=2;g.beginPath();g.arc(w/2,h*.45,h*.38,0,7);g.stroke()});
  const d=new T.Mesh(new T.CylinderGeometry(.15,.15,.006,64),[new T.MeshStandardMaterial({color:0x1a1d3a}),new T.MeshStandardMaterial({map:c}),new T.MeshStandardMaterial({color:0x1a1d3a})]);d.position.y=.15;d.rotation.x=Math.PI/2;G.add(d);
  RBox(.12,.02,.06,.008,blk(),0,.01,0,G);Box(.01,.13,.01,al(),0,.075,0,G);return G}
function ticket(vr){const G=new T.Group(),t=label(512,256,'#140a33',[{t:'CELESTE',f:'800 54px Georgia',c:'#b9a6ff',y:70},{t:'MALAM PENGAMATAN',f:'700 34px sans-serif',c:'#fff',y:140},{t:'Sabtu · sesi '+((vr&&vr.Sesi)||'19.00'),f:'500 30px sans-serif',c:'#e8e0ff',y:200}],(g,w,h)=>{g.fillStyle='#fff';for(let i=0;i<60;i++){g.globalAlpha=Math.random()*.6;g.fillRect(Math.random()*w,Math.random()*h,2,2)}g.globalAlpha=1;g.setLineDash([8,8]);g.strokeStyle='#b9a6ff';g.beginPath();g.moveTo(w*.78,0);g.lineTo(w*.78,h);g.stroke()});
  const card=new T.Mesh(new T.BoxGeometry(.2,.1,.002),[0,0,0,0,new T.MeshStandardMaterial({map:t,roughness:.4}),new T.MeshStandardMaterial({color:0x140a33})].map(m=>m||new T.MeshStandardMaterial({color:0x140a33})));card.position.y=.07;card.rotation.x=-.15;G.add(card);
  RBox(.08,.015,.05,.005,new T.MeshStandardMaterial({color:0x8a5a2e,roughness:.6}),0,.0075,0,G);return G}
function model(pid,vr){if(pid==='refraktor-cx80')return refractor(vr);if(pid==='dobson-8')return dobson();if(pid==='lensa-mata')return eyepieces();if(pid==='filter-bulan')return filters();if(pid==='peta-bintang')return starmap();if(pid==='tiket-pengamatan')return ticket(vr);return starmap()}

/* ---------- tempat ---------- */
const R=4.75,at=(a,r)=>[Math.sin(a)*(r||R),.64,Math.cos(a)*(r||R)];
const SHA=Math.PI*.55,PDA=.62,KSA=-.72;
const stations={
  puncak:{label:'Puncak',pos:[0,52,150],look:[0,10,0],audio:'night',href:'/'},
  jalan:{label:'Jalan menanjak',parent:'puncak',pos:[10,16,44],look:[0,7,0],audio:'night',href:'/tentang'},
  pintu:{label:'Pintu kubah',parent:'jalan',pos:[0,1.8,10],look:[-.6,3,-1],audio:'night',href:'/kontak'},
  kubah:{label:'Di bawah kubah',parent:'pintu',pos:[.4,1.5,1.2],look:[0,12,-2.4],audio:'dome',href:'/langit'},
  rak:{label:'Rak teleskop',parent:'kubah',pos:at(SHA,.6).map((v,i)=>i===1?1.95:v),look:at(SHA,R).map((v,i)=>i===1?1.35:v),audio:'dome',href:'/toko'},
  kasir:{label:'Meja kasir',parent:'kubah',pos:[-.6,1.75,1.5],look:at(KSA,R).map((v,i)=>i===1?1.2:v),audio:'dome',href:'/keranjang'},
  pajang:{label:'Pajangan 360°',parent:'kubah',pos:[1.6,1.7,1.3],look:at(PDA,3.2).map((v,i)=>i===1?1.3:v),audio:'dome',href:'/produk/refraktor-cx80'}};
const tour=['puncak','jalan','pintu','kubah','rak','pajang'];
const items=[['peta-bintang',null,0,-.9],['tiket-pengamatan',{Sesi:'19.00'},0,-.35],['filter-bulan',null,0,.15],['lensa-mata',null,0,.7],
  ['refraktor-cx80',{Dudukan:'Altaz manual',Warna:'Putih'},1,-.75],['dobson-8',null,1,.2],['refraktor-cx80',{Dudukan:'Altaz + tracking',Warna:'Biru malam'},1,.85]];
function setup(rt,W){const sc=rt.scene;const wood=new T.MeshStandardMaterial({color:0x5a3a22,roughness:.6}),stone=new T.MeshStandardMaterial({color:0x8a8f99,roughness:.8});
  const sp=at(SHA);const sh=shelf(sc,{pos:sp,rotY:SHA+Math.PI,len:2.6,depth:.5,rows:[.5,1.05],mat:wood,items,model,site,scale:1.05,pinY:.5,at:['rak']});
  const l1=new T.PointLight(0xffd8a8,14,6,2);l1.position.set(sp[0]*.7,2.6,sp[2]*.7);sc.add(l1);
  const ped=pedestal(sc,{pos:at(PDA,3.2),mat:wood,baseMat:stone,model,scale:1.4,ring:new T.Color(1.4,1.2,2.6),lightColor:0xe8e0ff,lightI:26});
  const kp=at(KSA);const ct=counter(sc,{pos:kp,rotY:Math.PI/2+KSA,len:2,mat:wood,topMat:stone,model,site,basket:0x3a2a1a,screen:new T.Color(1.2,1,2.4)});
  const l2=new T.PointLight(0xffc890,10,5,2);l2.position.set(kp[0]*.7,2.5,kp[2]*.7);sc.add(l2);
  sc.userData.aoDirty=true;
  W.pins=[{pos:[0,9,0],label:'Observatorium CELESTE',sub:'Mulai tur',href:'#/tentang',at:['puncak']},{pos:[0,3,6.4],label:'Masuk kubah',href:'#/langit',at:['jalan','pintu']},
    {pos:[sp[0],2.2,sp[2]],label:'Rak teleskop',sub:'Katalog',href:'#/toko',at:['kubah','kasir','pajang']},{pos:[kp[0],1.9,kp[2]],label:'Meja kasir',sub:'Keranjang',href:'#/keranjang',at:['kubah','rak','pajang']},
    {pos:[...at(PDA,3.2)].map((v,i)=>i===1?2.2:v),label:'Pajangan 360°',href:'#/produk/refraktor-cx80',at:['kubah','rak','kasir']},{pos:[0,2.2,5.8],label:'Keluar',sub:'Kontak',href:'#/kontak',at:['rak','kasir','pajang']}];
  wireShop(W,{site,model,shelves:[sh],ped,counter:ct,thumb:{rim:0xb9a6ff}});
  if(rt.world)rt.world.tags.forEach(t=>t.visible=false);
  W.aimAt=i=>{W.aim=i;rt.actions.aim(i);if(W.slit===false){W.slit=true;rt.actions.slit(true)}W.sfx('servo')};
}
const btn=(h,t,g)=>'<a class="wbtn'+(g?' ghost':'')+'" href="#'+h+'">'+t+'</a>';
const TG=['Saturnus','Jupiter','Mars','Nebula'];
function home(){const h=site.home;return{st:'puncak',kind:'hero',title:'Beranda',html:'<p class="wk">'+esc(h.eyebrow)+'</p><h1 class="wh big">'+h.title+'</h1><p class="wl">'+esc(h.sub)+'</p>'
  +'<div class="wrow">'+btn('/toko','Pilih teleskop')+btn('/langit','Malam pengamatan',1)+'</div><ul class="wusp">'+site.usp.map(u=>'<li><b>'+esc(u[0])+'</b><span>'+esc(u[1])+'</span></li>').join('')+'</ul><p class="wtiny">Gulir atau tekan › untuk menanjak ke kubah. Seret layar untuk melihat sekeliling 360°.</p>'}}
function about(){const a=site.about;return{st:'jalan',title:'Cerita',html:'<p class="wk">Jalan menanjak</p><h1 class="wh">'+esc(a.title)+'</h1><p class="wl">'+esc(a.sub)+'</p>'+a.paras.map(p=>'<p>'+esc(p)+'</p>').join('')
  +'<h3>Yang kami pegang</h3>'+a.values.map(v=>'<p><b>'+esc(v[0])+'.</b> '+esc(v[1])+'</p>').join('')+site.testi.slice(0,2).map(t=>'<blockquote>“'+esc(t[0])+'” <cite>'+esc(t[1])+', '+esc(t[2])+'</cite></blockquote>').join('')+'<div class="wrow">'+btn('/langit','Masuk ke kubah')+'</div>'}}
function langit(W){return{st:'kubah',title:'Malam pengamatan',html:'<p class="wk">Di bawah kubah</p><h1 class="wh">Malam pengamatan</h1><p class="wl">Buka celah kubah dan arahkan teleskop. Setiap Sabtu kami membuka kubah ini untuk pengunjung.</p>'
  +'<div class="wrow"><button class="wtg" data-act="slit" aria-pressed="'+(W.slit!==false)+'"><i></i>Celah kubah: <b>'+(W.slit!==false?'Terbuka':'Tertutup')+'</b></button><button class="wtg" data-act="cons" aria-pressed="'+!!W.cons+'"><i></i>Rasi bintang</button></div>'
  +'<div class="wseg" role="group" aria-label="Arahkan teleskop" style="grid-template-columns:repeat(4,1fr)">'+TG.map((x,i)=>'<button data-act="aim" data-i="'+i+'" aria-pressed="'+((W.aim||0)===i)+'" style="--sw:'+['#e8d2a0','#d8a878','#d8603a','#b9a6ff'][i]+'"><i></i>'+x+'</button>').join('')+'</div>'
  +'<div class="wrow">'+btn('/produk/tiket-pengamatan','Pesan tiket Sabtu')+btn('/produk/refraktor-cx80','Teleskop ini 360°',1)+'</div>'}}
/* ---------- pengalaman "peta langit": nav rasi bintang, panel kubah, pencari "ingin melihat apa?", koordinat langsung ---------- */
const STARS=[['/','Puncak',18,150],['/tentang','Cerita',62,112],['/langit','Kubah',112,96],['/cari','Cari',150,58],['/toko','Rak',206,40],['/keranjang','Kasir',248,82],['/kontak','Kontak',232,140]];
const WANT={planet:{t:'Bulan & planet',aim:0,d:'Cincin Saturnus, sabuk Jupiter, kawah bulan. Butuh ketajaman, bukan apertur raksasa.',rec:[['refraktor-cx80','Tajam dan cepat dipasang untuk planet.'],['filter-bulan','Mengurangi silau bulan, menaikkan kontras planet.'],['lensa-mata','Lensa 6,3 mm untuk perbesaran tinggi.']]},
  nebula:{t:'Nebula & galaksi',aim:3,d:'Objek redup butuh apertur besar untuk mengumpulkan cahaya.',rec:[['dobson-8','Cermin 203 mm: nebula Orion jadi jelas.'],['peta-bintang','Menemukan objek langit dalam tanpa aplikasi.'],['lensa-mata','Lensa 25 mm untuk lapang pandang lebar.']]},
  foto:{t:'Foto langit',aim:2,d:'Butuh dudukan yang mengikuti gerak langit.',rec:[['refraktor-cx80','Pilih dudukan Altaz + tracking.',{Dudukan:'Altaz + tracking'}],['filter-bulan','Filter warna untuk detail Mars dan Jupiter.']]},
  anak:{t:'Untuk anak & keluarga',aim:1,d:'Mudah dipakai, cepat dapat hasil, lalu datang ke malam pengamatan.',rec:[['tiket-pengamatan','Dua jam bersama pemandu di kubah ini.'],['peta-bintang','Belajar rasi bintang bersama.'],['refraktor-cx80','Ringan dan sederhana untuk mulai.']]}};
function cari(W,k){if(!k||!WANT[k])return{st:'kubah',title:'Cari',html:'<p class="wk">Pencari teleskop</p><h1 class="wh">Malam ini Anda ingin melihat apa?</h1><p class="wl">Pilih satu. Kami arahkan teleskop di kubah ini dan menyarankan alat yang tepat.</p>'
  +'<div class="ce-want">'+Object.entries(WANT).map(([id,x])=>'<a href="#/cari/'+id+'"><i class="ce-'+id+'"></i><b>'+x.t+'</b><span>'+esc(x.d)+'</span></a>').join('')+'</div>'};
  const x=WANT[k];W.aimAt&&W.aimAt(x.aim);
  return{st:'kubah',title:x.t,html:'<p class="wk"><a href="#/cari">← Pencari</a> · '+x.t+'</p><h1 class="wh">Teleskop sudah diarahkan.</h1><p class="wl">'+esc(x.d)+' Lihat ke atas melalui celah kubah; seret untuk menengadah.</p>'
   +x.rec.map((r,i)=>{const p=shop.P(site,r[0]);const q=r[2]?'?'+new URLSearchParams(r[2]):'';return '<a class="ce-rec'+(i?'':' top')+'" href="#/produk/'+p.id+q+'"><img src="'+(W.thumb?W.thumb(p.id,Object.assign(shop.defVar(p)||{},r[2]||{})):'')+'" alt=""><span><b>'+esc(p.name)+'</b><em>'+esc(r[1])+'</em></span><i>'+shop.rp(p.price)+'</i></a>'}).join('')
   +'<div class="wrow">'+btn('/cari','Pilih yang lain',1)+btn('/toko','Bandingkan semua')+'</div>'}}
function compare(){const t=['refraktor-cx80','dobson-8'].map(id=>shop.P(site,id));const row=(l,f)=>'<tr><th>'+l+'</th>'+t.map(p=>'<td>'+f(p)+'</td>').join('')+'</tr>';const sp=(p,k)=>(p.spec.find(x=>x[0]===k)||['','—'])[1];
  return '<table class="ce-cmp"><tr><th></th>'+t.map(p=>'<td><b>'+esc(p.name)+'</b></td>').join('')+'</tr>'+row('Apertur',p=>sp(p,'Apertur'))+row('Fokus',p=>sp(p,'Panjang fokus'))+row('Berat',p=>sp(p,'Berat'))+row('Terbaik untuk',p=>p.id==='dobson-8'?'Nebula, galaksi':'Bulan, planet')+row('Harga',p=>shop.rp(p.price))+'</table>'}
function chrome(W){const sky=document.createElement('nav');sky.id='ceSky';sky.setAttribute('aria-label','Peta situs rasi bintang');
  sky.innerHTML='<svg viewBox="0 0 270 170" aria-hidden="true"><polyline points="'+STARS.map(x=>x[2]+','+x[3]).join(' ')+'"/><line x1="'+STARS[4][2]+'" y1="'+STARS[4][3]+'" x2="'+STARS[6][2]+'" y2="'+STARS[6][3]+'"/></svg>'
   +STARS.map(x=>'<a href="#'+x[0]+'" data-r="'+x[0]+'" style="left:'+x[2]+'px;top:'+x[3]+'px"><i></i><span>'+x[1]+'</span></a>').join('');document.body.appendChild(sky);
  const c=document.createElement('div');c.id='ceCoord';c.innerHTML='<span>ALT</span><b id="ceAlt">0°</b><span>AZ</span><b id="ceAz">0°</b>';document.body.appendChild(c)}
const def={site,concept,stations,tour,audio:true,noglImg:'06',layout:'sky',avoid:['#wp'],chrome,
  nav:[['Puncak','/'],['Cerita','/tentang'],['Kubah','/langit'],['Cari teleskop','/cari'],['Rak','/toko'],['Lacak','/lacak'],['Kontak','/kontak']],
  setup,
  route(r,W){const a=r.seg[0];
    if(!a)return home();if(a==='tentang')return about();if(a==='langit')return langit(W);if(a==='cari')return cari(W,r.seg[1]);
    if(a==='toko'){const o=shop.catalog(site,W,r,{title:'Rak teleskop',sub:'Bandingkan dua teleskop kami, atau gunakan pencari jika masih ragu.'});o.html=o.html.replace('<div class="wchips">',compare()+'<div class="wrow">'+btn('/cari','Bantu saya memilih',1)+'</div><div class="wchips">');return Object.assign(o,{st:'rak'})}
    if(a==='produk'){const o=shop.product(site,W,r.seg[1],r.q);if(!o)return null;let tg=[0,1.3,0],sz=.6;if(W.showProduct){tg=W.showProduct(W.sel.pid,W.sel.vr);sz=W.orbitHint.size}return Object.assign(o,{st:'pajang',kind:'product',orbit:{target:tg,az:PDA+.6,el:.2,d:sz*1.6+.35,dmin:sz*.8,dmax:Math.min(2.4,sz*4)}})}
    if(a==='keranjang')return Object.assign(shop.cartPanel(site,W),{st:'kasir'});if(a==='checkout')return Object.assign(shop.checkout(site,W),{st:'kasir'});
    if(a==='pesanan')return Object.assign(shop.order(site,W,decodeURIComponent(r.seg[1]||'')),{st:'kasir'});if(a==='lacak')return Object.assign(shop.track(site,W,r),{st:'kasir'});
    if(a==='kontak'||a==='faq')return Object.assign(shop.contact(site,W,'Pintu kubah'),{st:'pintu'});return null},
  pickAction(id,W){if(id==='aim'){W.aim=((W.aim||0)+1)%4;W.rt.actions.aim(W.aim);document.querySelectorAll('[data-act=aim]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.i===W.aim));W.sfx('servo');return true}},
  act(t,e,W){const a=t.dataset.act;if(!W.rt&&a!=='quick'&&!/^(var|qm|qp|add|buy|cq|crm)$/.test(a))return;
    if(a==='slit'){W.slit=W.slit===false;W.rt.actions.slit(W.slit);t.setAttribute('aria-pressed',W.slit);t.querySelector('b').textContent=W.slit?'Terbuka':'Tertutup';W.sfx('servo')}
    else if(a==='cons'){W.cons=!W.cons;W.rt.actions.cons(W.cons);t.setAttribute('aria-pressed',W.cons);W.sfx('chime')}
    else if(a==='aim'){W.aim=+t.dataset.i;W.rt.actions.aim(W.aim);document.querySelectorAll('[data-act=aim]').forEach(b=>b.setAttribute('aria-pressed',b===t));W.sfx('servo')}
    else shop.act(site,W,t)},
  onRoute(r,out,W){document.querySelectorAll('#ceSky a').forEach(a=>a.classList.toggle('on',a.dataset.r===r.path||(a.dataset.r!=='/'&&r.path.startsWith(a.dataset.r))||(a.dataset.r==='/toko'&&r.path.startsWith('/produk'))))},
  tick(t,dt,W){if((W._ct=(W._ct||0)+1)%6)return;const d=camera.getWorldDirection(V(0,0,0)),alt=Math.asin(d.y)*57.3,az=(Math.atan2(d.x,-d.z)*57.3+360)%360;const A=document.getElementById('ceAlt');if(A){A.textContent=alt.toFixed(1)+'°';document.getElementById('ceAz').textContent=az.toFixed(1)+'°'}},
  onCart(W){W.onCartChange&&W.onCartChange()},
  refresh(r,W){if(r.seg[0]==='keranjang')W.render()}};
world(def);
