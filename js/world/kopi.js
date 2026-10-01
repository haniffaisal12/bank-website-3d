/* KAWAH KOPI — situs e-commerce yang hidup di dalam adegan 3D konsepnya.
   Kawah = beranda, kebun = cerita, roastery = proses & kontak, ruang sangrai, meja seduh, rak toko, pajangan produk 360°, kasir.
   Produk dimodelkan prosedural (kemasan berlabel, dripper, ketel, gelas, kotak langganan) dan dipakai di rak, di pajangan, dan sebagai gambar katalog. */
import {T,V,Box,RBox,Cyl,mesh,canvas,ctex,clamp,sstep} from '../core.js';
import {lath,speckle,shelf,pedestal,counter,wireShop} from './kit.js';
import {world} from './world.js';
import * as shop from './shop.js';
import {cart} from '../site/store.js';
import {esc,toast} from '../site/ui.js';
import site from '../sites/kopi.js';
import {concept} from '../concepts/kopi.js';

/* ---------- label kemasan (kanvas) ---------- */
const ROASTC={Light:['#c89a5e','#f6e3c4'],Medium:['#8a5432','#f1d2b4'],Dark:['#3a2216','#e7c9ad']};
const NOTES={Light:'Floral · jeruk · teh hitam',Medium:'Cokelat · karamel · kacang',Dark:'Kakao · asap · pahit manis'};
const texCache={};
function volcano(g,x,y,s,lava){g.fillStyle='#1b100b';g.beginPath();g.moveTo(x-s,y+s*.55);g.lineTo(x-s*.22,y-s*.35);g.lineTo(x+s*.22,y-s*.35);g.lineTo(x+s,y+s*.55);g.closePath();g.fill();
  g.fillStyle=lava;g.beginPath();g.ellipse(x,y-s*.36,s*.22,s*.06,0,0,7);g.fill();g.strokeStyle=lava;g.lineWidth=s*.05;g.beginPath();g.moveTo(x-s*.05,y-s*.33);g.quadraticCurveTo(x-s*.18,y,x-s*.3,y+s*.4);g.stroke()}
function bagLabel(pid,vr){const key=pid+JSON.stringify(vr);if(texCache[key])return texCache[key];
  const w=512,h=768,c=canvas(w,h),g=c.getContext('2d'),lava=pid==='blend-lava';
  const roast=(vr&&vr.Sangrai)||'Dark',rc=ROASTC[roast];
  g.fillStyle=lava?'#151312':'#b88b58';g.fillRect(0,0,w,h);speckle(g,w,h,lava?.15:.35,pid.length*7);
  g.textAlign='center';g.fillStyle=lava?'#f4c27a':'#1b100b';g.font='800 52px Georgia,serif';g.fillText('KAWAH KOPI',w/2,120);
  volcano(g,w/2,230,95,lava?'#ff7a1a':'#e0561a');
  g.fillStyle=lava?'#ff7a1a':rc[0];g.fillRect(0,330,w,120);
  g.fillStyle=lava?'#160c06':rc[1];g.font='700 30px Georgia,serif';g.fillText(lava?'BLEND ESPRESSO':roast.toUpperCase()+' ROAST',w/2,380);
  g.font='500 24px system-ui,sans-serif';g.fillText(lava?'Cokelat · gula aren · body tebal':NOTES[roast],w/2,422);
  g.fillStyle=lava?'#f2e6da':'#1b100b';g.font='800 64px Georgia,serif';g.fillText(lava?'LAVA':'KINTAMANI',w/2,540);
  g.font='500 24px system-ui,sans-serif';g.fillText(lava?'70% arabika · 30% robusta':'Arabika · 1.400 mdpl · Washed',w/2,585);
  g.font='700 44px system-ui,sans-serif';g.fillText((vr&&vr.Berat)||'200 g',w/2,670);
  g.font='500 22px system-ui,sans-serif';g.fillText(((vr&&vr.Giling)||'Biji utuh')+' · disangrai '+new Date().toLocaleDateString('id-ID',{day:'numeric',month:'short'}),w/2,712);
  const t=ctex(c);texCache[key]=t;return t}
function backLabel(lava){const k='back'+lava;if(texCache[k])return texCache[k];const w=256,h=384,c=canvas(w,h),g=c.getContext('2d');g.fillStyle=lava?'#151312':'#b88b58';g.fillRect(0,0,w,h);speckle(g,w,h,.3,9);
  g.fillStyle=lava?'#d9c9b8':'#2a1a10';g.font='600 16px system-ui';g.textAlign='left';['Seduh: 15 g / 250 ml','Suhu air 92–94 °C','Simpan sejuk & kering','Dari koperasi petani','Kintamani, Bali'].forEach((s,i)=>g.fillText(s,28,120+i*30));
  g.fillStyle='#fff';g.fillRect(28,300,200,44);g.fillStyle='#000';for(let i=0;i<46;i++)if((i*7)%3)g.fillRect(34+i*4,304,2,36);return texCache[k]=ctex(c)}
function boxLabel(vr){const key='box'+JSON.stringify(vr);if(texCache[key])return texCache[key];const w=512,h=256,c=canvas(w,h),g=c.getContext('2d');g.fillStyle='#c39a68';g.fillRect(0,0,w,h);speckle(g,w,h,.35,4);
  g.fillStyle='#1b100b';g.textAlign='center';g.font='800 46px Georgia,serif';g.fillText('KAWAH KOPI',w/2,78);g.fillStyle='#e0561a';g.fillRect(40,104,w-80,6);g.fillStyle='#1b100b';g.font='700 34px system-ui';g.fillText('LANGGANAN',w/2,156);g.font='500 24px system-ui';g.fillText('2 × 200 g · '+((vr&&vr.Frekuensi)||'Tiap 2 minggu').toLowerCase(),w/2,200);return texCache[key]=ctex(c)}

/* ---------- model produk ---------- */
function bagGeo(){const g=new T.BoxGeometry(.16,.24,.075,8,18,4),p=g.attributes.position;for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);const t=(y+.12)/.24;
  z*=1-sstep(.6,1,t)*.9;z+=Math.sign(z)*.006*Math.sin(Math.PI*clamp(t*1.2,0,1))*Math.cos(x/.08*Math.PI/2);x*=1+.03*Math.sin(Math.PI*t);if(t<.02)z*=1.05;p.setXYZ(i,x,y,z)}g.computeVertexNormals();return g}
let BAGG=null;
function bag(pid,vr){BAGG=BAGG||bagGeo();const lava=pid==='blend-lava';const base=new T.MeshStandardMaterial({color:lava?0x161412:0xb88b58,roughness:lava?.55:.88,metalness:lava?.15:0});
  const front=new T.MeshStandardMaterial({map:bagLabel(pid,vr),roughness:lava?.5:.85}),back=new T.MeshStandardMaterial({map:backLabel(lava),roughness:.85});
  const G=new T.Group(),m=new T.Mesh(BAGG,[base,base,base,base,front,back]);m.position.y=.12;m.castShadow=true;G.add(m);
  const seal=new T.Mesh(new T.BoxGeometry(.163,.022,.008),new T.MeshStandardMaterial({color:lava?0x0c0b0a:0x9c744a,roughness:.8}));seal.position.y=.235;G.add(seal);
  const valve=new T.Mesh(new T.CylinderGeometry(.009,.009,.004,16),new T.MeshStandardMaterial({color:lava?0x2a2a2a:0xe8dcc8,roughness:.4}));valve.rotation.x=Math.PI/2;valve.position.set(.045,.19,.035);G.add(valve);
  const s=vr&&vr.Berat==='1 kg'?1.42:vr&&vr.Berat==='500 g'?1.2:1;G.scale.setScalar(s);return G}
function v60(vr){const col={'Hitam arang':0x1d1b1a,'Putih':0xeeeae4,'Terakota':0xb3603a}[(vr&&vr.Warna)||'Hitam arang'];const cer=new T.MeshPhysicalMaterial({color:col,roughness:.28,clearcoat:.6,side:T.DoubleSide});
  const G=new T.Group();const glass=new T.MeshPhysicalMaterial({color:0xffffff,roughness:.04,transparent:true,opacity:.16,clearcoat:1,side:T.DoubleSide,depthWrite:false});
  const srv=new T.Mesh(lath([[.001,0],[.05,0],[.058,.02],[.06,.07],[.05,.105],[.044,.115]],40),glass);G.add(srv);
  const coffee=new T.Mesh(lath([[.001,.004],[.05,.004],[.056,.02],[.057,.045],[.001,.045]],32),new T.MeshStandardMaterial({color:0x2a1408,roughness:.15}));G.add(coffee);
  const hd=new T.Mesh(new T.TorusGeometry(.026,.006,10,24,Math.PI),glass);hd.rotation.z=-Math.PI/2;hd.position.set(.066,.06,0);G.add(hd);
  const D=new T.Group();D.position.y=.115;G.add(D);
  D.add(new T.Mesh(lath([[.018,0],[.024,.004],[.064,.075],[.068,.08],[.064,.082],[.058,.078],[.02,.008],[.014,.004]],48),cer));
  const plate=new T.Mesh(new T.CylinderGeometry(.052,.052,.006,40),cer);plate.position.y=.002;D.add(plate);
  const hdl=new T.Mesh(new T.BoxGeometry(.045,.012,.02),cer);hdl.position.set(.078,.05,0);D.add(hdl);
  const paper=new T.Mesh(lath([[.019,.006],[.062,.08],[.066,.093]],40),new T.MeshStandardMaterial({color:0xf3eee4,roughness:.95,side:T.DoubleSide}));D.add(paper);
  G.traverse(o=>{if(o.isMesh)o.castShadow=true});return G}
function kettle(){const st=new T.MeshStandardMaterial({color:0xd8dbe0,metalness:1,roughness:.16}),blk=new T.MeshStandardMaterial({color:0x111111,roughness:.5});const G=new T.Group();
  G.add(new T.Mesh(lath([[.001,0],[.075,0],[.08,.008],[.082,.07],[.07,.12],[.04,.14],[.001,.14]],48),st));
  const lid=new T.Mesh(new T.SphereGeometry(.012,16,10),blk);lid.position.y=.147;G.add(lid);
  G.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([V(.07,.02,0),V(.13,.05,0),V(.15,.12,0),V(.17,.17,0),V(.215,.175,0)]),40,.0075,10),st));
  const h=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([V(-.07,.11,0),V(-.13,.12,0),V(-.14,.06,0),V(-.078,.03,0)]),30,.011,10),blk);G.add(h);
  G.traverse(o=>{if(o.isMesh)o.castShadow=true});return G}
function glaze(){const g=lath([[.001,0],[.032,0],[.036,.006],[.04,.085],[.036,.085],[.033,.01],[.001,.01]],48);const p=g.attributes.position,c=new Float32Array(p.count*3),a=new T.Color(0xc2410c),b=new T.Color(0x1a0f0a),k=new T.Color();
  for(let i=0;i<p.count;i++){const y=p.getY(i)/.085;k.copy(a).lerp(b,sstep(.25,.9,y));c[i*3]=k.r;c[i*3+1]=k.g;c[i*3+2]=k.b}g.setAttribute('color',new T.BufferAttribute(c,3));return g}
function cups(){const m=new T.MeshPhysicalMaterial({vertexColors:true,roughness:.22,clearcoat:.8}),G=new T.Group(),g=glaze();[-.045,.045].forEach((x,i)=>{const c=new T.Mesh(g,m);c.position.x=x;c.rotation.y=i*2;c.castShadow=true;G.add(c)});return G}
function subBox(vr){const kraft=new T.MeshStandardMaterial({color:0xc39a68,roughness:.9}),top=new T.MeshStandardMaterial({map:boxLabel(vr),roughness:.85});const G=new T.Group();
  const b=new T.Mesh(new T.BoxGeometry(.22,.1,.15),[kraft,kraft,top,kraft,kraft,kraft]);b.position.y=.05;b.castShadow=true;G.add(b);
  const rib=new T.Mesh(new T.BoxGeometry(.012,.102,.152),new T.MeshStandardMaterial({color:0xe0561a,roughness:.6}));rib.position.set(.07,.05,0);G.add(rib);
  const m1=bag('biji-kawah',{Sangrai:'Light'});m1.scale.setScalar(.55);m1.position.set(-.05,.1,-.03);m1.rotation.x=-.25;G.add(m1);return G}
function model(pid,vr){if(pid==='biji-kawah'||pid==='blend-lava')return bag(pid,vr);if(pid==='v60-set')return v60(vr);if(pid==='gooseneck')return kettle();if(pid==='gelas-seduh')return cups();if(pid==='langganan-bulanan')return subBox(vr);return bag('biji-kawah',vr)}

/* ---------- stasiun kamera (koordinat dunia; roastery di z = -70) ---------- */
const IN=(x,y,z)=>[x,y,z-70];
const stations={
  kawah:{label:'Kawah',pos:[40,64,-62],look:[0,30,-175],audio:'volcano',href:'/'},
  kebun:{label:'Kebun kopi',parent:'kawah',pos:[-8,10,-4],look:[0,2,-66],audio:'garden',href:'/kebun'},
  roastery:{label:'Pintu roastery',parent:'kebun',pos:[0,2.2,-50],look:[0,2.4,-70],audio:'roastery',href:'/roastery'},
  sangrai:{label:'Ruang sangrai',parent:'roastery',pos:[-.3,2.3,-62.4],look:[-.4,1.1,-72.6],audio:'roastery',href:'/sangrai'},
  seduh:{label:'Meja seduh',parent:'sangrai',pos:IN(1.7,2.15,1.2),look:IN(4.6,1.5,-1.8),audio:'roastery',href:'/seduh'},
  toko:{label:'Rak toko',parent:'sangrai',pos:IN(1.4,1.95,4.9),look:IN(6.5,1.45,4.9),audio:'roastery',href:'/toko'},
  pajang:{label:'Pajangan 360°',parent:'sangrai',pos:IN(1,1.58,-4.15),look:IN(1,1.12,-5.6),audio:'roastery',href:'/produk/biji-kawah'},
  kasir:{label:'Kasir',parent:'sangrai',pos:IN(-2.5,2.15,7.3),look:IN(-5.6,1.1,4.4),audio:'roastery',href:'/keranjang'}};
const tour=['kawah','kebun','roastery','sangrai','seduh','toko'];

/* ---------- perabot toko: rak, pajangan berputar, kasir ---------- */
const shelfItems=[['langganan-bulanan',{Frekuensi:'Tiap 2 minggu'},0,-1.8],['gelas-seduh',null,0,-.7],['langganan-bulanan',{Frekuensi:'Tiap bulan'},0,.5],['gelas-seduh',null,0,1.7],
  ['biji-kawah',{Sangrai:'Light',Berat:'200 g'},1,-1.9],['biji-kawah',{Sangrai:'Light',Berat:'200 g'},1,-1.55],['biji-kawah',{Sangrai:'Medium',Berat:'200 g'},1,-.6],['biji-kawah',{Sangrai:'Medium',Berat:'500 g'},1,-.15],['biji-kawah',{Sangrai:'Dark',Berat:'200 g'},1,.8],['biji-kawah',{Sangrai:'Dark',Berat:'200 g'},1,1.15],['blend-lava',{Berat:'200 g'},1,1.9],
  ['v60-set',{Warna:'Hitam arang'},2,-1.9],['v60-set',{Warna:'Terakota'},2,-1.3],['gooseneck',null,2,-.3],['blend-lava',{Berat:'500 g'},2,.9],['blend-lava',{Berat:'200 g'},2,1.4],['v60-set',{Warna:'Putih'},2,2.0]];
function setup(rt,W){const w=rt.world,B=w.B,tm=w.timber;
  const SX=w.W/2-.5;
  const sh=shelf(B,{pos:[SX,0,4.9],rotY:-Math.PI/2,len:4.6,mat:tm,items:shelfItems,model,site,scale:1.35,at:['toko'],q:vr=>vr&&vr.Sangrai?'?Sangrai='+vr.Sangrai:''});
  const spot=new T.SpotLight(0xffd2a0,60,9,.75,.6,2);spot.position.set(3.4,4.2,4.9);spot.target.position.set(SX,1.4,4.9);B.add(spot,spot.target);
  const fill=new T.PointLight(0xffb870,10,6,2);fill.position.set(4.5,2.8,4.9);B.add(fill);
  const PX=1,PZ=-5.6,ped=pedestal(B,{pos:[PX,0,PZ],mat:tm,baseMat:w.stoneM,model,scale:1.7});
  const pr=new T.PointLight(0xff9a3a,4,3,2);pr.position.set(PX-.8,1.6,PZ-.9);B.add(pr);
  const KX=-5.6,KZ=4.6,ct=counter(B,{pos:[KX,0,KZ],mat:tm,topMat:w.stoneM,basketBase:w.jute,model,site});
  const kl=new T.PointLight(0xffb870,14,6,2);kl.position.set(KX+1,2.9,KZ);B.add(kl);
  {const lm=new T.MeshStandardMaterial({color:0x331a08,emissive:0xffb060,emissiveIntensity:2.4,roughness:.7});mesh(lath([[.02,-.2],[.22,-.12],[.3,.1],[.1,.26]],20),lm,KX+.2,3.3,KZ,B).castShadow=false;Cyl(.008,.008,1.2,tm,KX+.2,4,KZ,B,4)}
  rt.scene.userData.aoDirty=true;
  const P=(x,y,z)=>[x,y+w.by,z-70];
  W.pins=[
    {pos:[0,6,-28],label:'Kebun kopi',sub:'Cerita petani',href:'#/kebun',at:['kawah']},{pos:[0,9,-70],label:'Roastery',sub:'Sangrai & toko',href:'#/roastery',at:['kawah','kebun']},{pos:[0,76,-175],label:'Kawah',href:'#/',at:['kebun','roastery']},
    {pos:P(0,2.4,8.4),label:'Masuk',sub:'Ruang sangrai',href:'#/sangrai',at:['roastery']},{pos:[-10,3,-40],label:'Teras kebun',sub:'Ceri siap petik',kind:'info',at:['kebun'],on:()=>toast('Ceri merah dipetik tangan satu per satu, hanya yang matang penuh.')},
    {pos:P(w.RX,2.9,w.RZ),label:'Mesin sangrai',href:'#/sangrai',at:['seduh','toko','kasir','pajang']},{pos:P(w.CXp,2.0,w.CZ),label:'Meja seduh',href:'#/seduh',at:['sangrai','toko','kasir','pajang']},
    {pos:P(SX,2.6,4.9),label:'Rak toko',sub:'Belanja',href:'#/toko',at:['sangrai','seduh','kasir','pajang']},{pos:P(KX,1.6,KZ),label:'Kasir',sub:'Keranjang',href:'#/keranjang',at:['sangrai','seduh','toko','pajang']},
    {pos:P(PX,1.7,PZ),label:'Pajangan 360°',href:'#/produk/biji-kawah',at:['sangrai','seduh','toko','kasir']},{pos:P(0,2.2,7.6),label:'Keluar',sub:'Pintu & kontak',href:'#/roastery',at:['sangrai','toko','kasir']}];
  wireShop(W,{site,model,shelves:[sh],ped,counter:ct,shelfWhen:()=>W.stationId==='toko'||W.stationId==='kasir'});
}

/* ---------- panel cerita ---------- */
const btn=(h,t,g)=>'<a class="wbtn'+(g?' ghost':'')+'" href="#'+h+'">'+t+'</a>';
function home(W){return{st:'kawah',title:'Beranda',kind:'hero',html:'<p class="wk">Roastery vulkanik · Kintamani, Bali</p><h1 class="wh big">Kopi yang tumbuh di <em>tanah berapi</em>.</h1><p class="wl">'+esc(site.home.sub)+'</p>'
  +'<div class="wrow">'+btn('/toko','Belanja kopi')+btn('/kebun','Mulai tur',1)+'</div>'
  +'<div class="wrow"><button class="wtg" data-act="lava" aria-pressed="'+(W.lava?'true':'false')+'"><i></i>Kawah: <b>'+(W.lava?'Aktif':'Tenang')+'</b></button></div>'
  +'<ul class="wusp">'+site.usp.map(u=>'<li><b>'+esc(u[0])+'</b><span>'+esc(u[1])+'</span></li>').join('')+'</ul><p class="wtiny">Gulir, geser, atau tekan › untuk turun ke kebun. Seret layar untuk melihat sekeliling 360°.</p>'}}
function kebun(){const a=site.about;return{st:'kebun',title:'Cerita',html:'<p class="wk">Kebun · 1.400 mdpl</p><h1 class="wh">'+esc(a.title)+'</h1><p class="wl">'+esc(a.sub)+'</p>'+a.paras.map(p=>'<p>'+esc(p)+'</p>').join('')
  +'<div class="wstat"><div><b>1.400</b><span>mdpl</span></div><div><b>42</b><span>keluarga petani</span></div><div><b>Washed</b><span>proses</span></div></div>'
  +'<h3>Yang kami pegang</h3>'+a.values.map(v=>'<p><b>'+esc(v[0])+'.</b> '+esc(v[1])+'</p>').join('')
  +'<h3>Kata pelanggan</h3>'+site.testi.map(t=>'<blockquote>“'+esc(t[0])+'” <cite>'+esc(t[1])+', '+esc(t[2])+'</cite></blockquote>').join('')+'<div class="wrow">'+btn('/roastery','Lanjut ke roastery')+'</div>'}}
function roastery(){return{st:'roastery',title:'Proses',html:'<p class="wk">Pintu roastery</p><h1 class="wh">Dari ceri ke cangkir</h1><ol class="wsteps"><li><b>Petik</b>Ceri merah dipetik tangan saat matang penuh.</li><li><b>Cuci & jemur</b>Proses washed, dijemur di para-para 14 hari.</li><li><b>Sangrai</b>Kecil-kecilan setiap Senin dan Kamis.</li><li><b>Kirim</b>Di hari yang sama, tanggal sangrai di kemasan.</li></ol>'
  +'<p class="wl">'+esc(site.brand.address)+' · '+esc(site.contact.hours)+'</p><div class="wrow">'+btn('/sangrai','Masuk ke ruang sangrai')+btn('/kontak','Kontak & FAQ',1)+'</div>'}}
function sangrai(W){const r=W.rt?W.rt.world.getRoast():0,R=['Light','Medium','Dark'],k=R[r],t=W.rt?W.rt.world.ROAST[r]:[0,'Light','196 °C',NOTES.Light];
  return{st:'sangrai',title:'Sangrai',html:'<p class="wk">Ruang sangrai</p><h1 class="wh">Pilih tingkat sangrai</h1><p class="wl">Biji di baki pendingin berubah warna mengikuti pilihan Anda. Klik bijinya atau pilih di bawah.</p>'
  +'<div class="wseg" role="group" aria-label="Tingkat sangrai">'+R.map((x,i)=>'<button data-act="roast" data-i="'+i+'" aria-pressed="'+(i===r)+'" style="--sw:'+ROASTC[x][0]+'"><i></i>'+x+'</button>').join('')+'</div>'
  +'<div class="wstat"><div><b>'+t[2]+'</b><span>suhu akhir</span></div><div><b>'+(r===0?'9':r===1?'11':'13')+' mnt</b><span>waktu sangrai</span></div></div><p><b>Profil rasa:</b> '+esc(t[3])+'</p>'
  +'<div class="wrow">'+btn('/produk/biji-kawah?Sangrai='+k,'Beli biji '+k+' →')+btn('/seduh','Ke meja seduh',1)+'</div>'}}
function seduh(W){return{st:'seduh',title:'Seduh',html:'<p class="wk">Meja seduh</p><h1 class="wh">Resep V60 kami</h1><div class="wstat"><div><b>15 g</b><span>kopi</span></div><div><b>250 ml</b><span>air 93 °C</span></div><div><b>2:30</b><span>menit</span></div></div>'
  +'<ol class="wsteps"><li><b>Bilas</b>Basahi kertas filter, buang airnya.</li><li><b>Bloom</b>Tuang 40 ml, tunggu 30 detik.</li><li><b>Tuang</b>Melingkar pelan hingga 250 ml.</li><li><b>Nikmati</b>Biarkan turun sampai 2:30.</li></ol>'
  +'<div class="wrow"><button class="wbtn" data-act="brew">Seduh sekarang</button></div><h3>Alat di meja ini</h3><div class="wmini">'+['v60-set','gooseneck','gelas-seduh'].map(id=>{const p=shop.P(site,id);return '<a href="#/produk/'+id+'"><img src="'+(W.thumb?W.thumb(id,shop.defVar(p)):'')+'" alt=""><span>'+esc(p.name)+'<b>'+shop.rp(p.price)+'</b></span></a>'}).join('')+'</div>'}}

/* ---------- rute ---------- */
const def={site,concept,stations,tour,audio:true,
  nav:[['Beranda','/'],['Cerita','/kebun'],['Sangrai','/sangrai'],['Seduh','/seduh'],['Toko','/toko'],['Lacak','/lacak'],['Kontak','/kontak']],
  setup,
  route(r,W){const a=r.seg[0];
    if(!a)return home(W);if(a==='kebun')return kebun();if(a==='roastery')return roastery();if(a==='sangrai')return sangrai(W);if(a==='seduh')return seduh(W);
    if(a==='toko')return Object.assign(shop.catalog(site,W,r,{title:'Rak roastery'}),{st:'toko'});
    if(a==='produk'){const o=shop.product(site,W,r.seg[1],r.q);if(!o)return null;let tg=[1,1.12,-75.6];if(W.showProduct)tg=W.showProduct(W.sel.pid,W.sel.vr);return Object.assign(o,{st:'pajang',kind:'product',orbit:{target:tg,az:0,el:.16,d:.95,dmin:.45,dmax:1.8}})}
    if(a==='keranjang')return Object.assign(shop.cartPanel(site,W),{st:'kasir'});if(a==='checkout')return Object.assign(shop.checkout(site,W),{st:'kasir'});
    if(a==='pesanan')return Object.assign(shop.order(site,W,decodeURIComponent(r.seg[1]||'')),{st:'kasir'});if(a==='lacak')return Object.assign(shop.track(site,W,r),{st:'kasir'});
    if(a==='kontak'||a==='faq')return Object.assign(shop.contact(site,W,'Pintu roastery'),{st:'roastery'});return null},
  act(t,e,W){const a=t.dataset.act;
    if(a==='lava'){W.lava=!W.lava;W.rt&&W.rt.actions.lava(W.lava);t.setAttribute('aria-pressed',W.lava);t.querySelector('b').textContent=W.lava?'Aktif':'Tenang';W.sfx(W.lava?'rumble':'off');W.kick(W.lava?2:.5)}
    else if(a==='roast'){W.rt&&W.rt.actions.roast(+t.dataset.i);W.sfx('sizzle');W.render()}
    else if(a==='brew'){W.rt&&W.rt.actions.brew();W.sfx('pour');t.disabled=true;setTimeout(()=>{t.disabled=false},11000)}
    else shop.act(site,W,t)},
  onAction(id,W){if(id==='roast'&&W.stationId==='sangrai')W.render();if(id==='brew')W.sfx('pour')},
  onCart(W){W.onCartChange&&W.onCartChange()},
  refresh(r,W){if(r.seg[0]==='keranjang')W.render()}};
world(def);
