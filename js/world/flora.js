/* FLORA — toko tanaman di rumah kacanya sendiri. Bukit = beranda, jalan setapak = cerita, lapak di depan pintu = katalog,
   meja kayu = kasir, pintu = kontak, bedeng = perawatan (siram & lampu tumbuh), alas batu di lorong = produk 360°. */
import {T,V,Box,RBox,Cyl,mesh,leafGeo,leafMat} from '../core.js';
import {world} from './world.js';
import {lath,label,shelf,pedestal,counter,wireShop} from './kit.js';
import * as shop from './shop.js';
import {esc,toast} from '../site/ui.js';
import site from '../sites/flora.js';
import {concept,plantGeo,potGeo} from '../concepts/flora.js';

/* ---------- model produk ---------- */
const POTC={'Terakota':0xb8613a,'Putih':0xf0eee8,'Abu':0x77797a};
const mats={};const M=(k,f)=>mats[k]||(mats[k]=f());
const potM=c=>M('pot'+c,()=>new T.MeshStandardMaterial({color:c,roughness:c===0xf0eee8?.35:.85}));
const soilM=()=>M('soil',()=>new T.MeshStandardMaterial({color:0x3a2616,roughness:1}));
function pot(r,h,c){const G=new T.Group();G.add(new T.Mesh(potGeo(r,h),potM(c)));const s=new T.Mesh(new T.CircleGeometry(r*.92,24),soilM());s.rotation.x=-Math.PI/2;s.position.y=h*.9;G.add(s);G.children.forEach(m=>m.castShadow=true);return G}
function leaves(G,n,geo,mat,y0,spread,tilt,sc){for(let i=0;i<n;i++){const a=i*2.399,l=new T.Mesh(geo,mat);l.position.set(Math.cos(a)*spread*(.4+(i%3)*.3),y0+(i%4)*sc*.12,Math.sin(a)*spread*(.4+(i%3)*.3));l.rotation.y=a;l.rotateX(-tilt-(i%3)*.15);l.scale.setScalar(sc*(.8+(i%5)*.08));l.castShadow=true;G.add(l)}}
function monstera(vr){const s={'Pot 20 cm':1,'Pot 25 cm':1.18,'Pot 30 cm':1.36}[(vr&&vr.Ukuran)||'Pot 20 cm'],G=pot(.1,.17,POTC[(vr&&vr.Pot)||'Terakota']);
  const lg=leafGeo(.32,.36,4,10,.45),lm=M('mon',()=>leafMat('monstera',1));const stm=M('stem',()=>new T.MeshStandardMaterial({color:0x2f6a34,roughness:.6}));
  for(let i=0;i<8;i++){const a=i*2.4,h=.2+(i%4)*.07,st=Cyl(.005,.007,h,stm,Math.cos(a)*.03,.15+h/2,Math.sin(a)*.03,G,5);st.rotation.set(Math.sin(a)*.4,0,-Math.cos(a)*.4);
    const l=new T.Mesh(lg,lm);l.position.set(Math.cos(a)*(.06+h*.35),.15+h,Math.sin(a)*(.06+h*.35));l.rotation.y=-a+Math.PI/2;l.rotateX(-.7);l.castShadow=true;G.add(l)}
  G.scale.setScalar(s);return G}
function ficus(vr){const s={'80 cm':1,'110 cm':1.3,'140 cm':1.6}[(vr&&vr.Tinggi)||'80 cm'],G=pot(.11,.18,0xb8613a);
  Cyl(.008,.012,.42,M('bark',()=>new T.MeshStandardMaterial({color:0x5a4030,roughness:.9})),0,.36,0,G,8);
  const lg=leafGeo(.13,.2,2,8,.3),lm=M('fic',()=>leafMat('ficus',3));for(let i=0;i<22;i++){const a=i*2.4,h=.4+i*.016,l=new T.Mesh(lg,lm);l.position.set(Math.cos(a)*.02*(i%3),h,Math.sin(a)*.02*(i%3));l.rotation.y=a;l.rotateX(-.5-(i%4)*.12);l.castShadow=true;G.add(l)}
  G.scale.setScalar(s);return G}
function calathea(){const G=pot(.08,.13,0xf0eee8),lg=leafGeo(.15,.17,3,8,.3),lm=M('cal',()=>{const m=leafMat('ficus',7);m.color=new T.Color(0xb8d8b0);return m});leaves(G,12,lg,lm,.15,.04,.55,1);return G}
function pothos(){const G=pot(.08,.12,0x77797a),lg=leafGeo(.07,.09,2,6,.3),lm=M('pot',()=>{const m=leafMat('ficus',11);m.color=new T.Color(0xe6f080);return m});
  for(let v=0;v<5;v++){const a=v*1.26;for(let k=0;k<8;k++){const t=k/7,l=new T.Mesh(lg,lm);l.position.set(Math.cos(a)*(.06+t*.05),.13-t*.18+Math.sin(t*3)*.02,Math.sin(a)*(.06+t*.05));l.rotation.y=a+k;l.rotateX(-.3);G.add(l)}}leaves(G,6,lg,lm,.14,.03,.4,1.1);return G}
function terracotta(vr){const r={'20 cm':.1,'25 cm':.125,'30 cm':.15}[(vr&&vr.Ukuran)||'20 cm'];const G=new T.Group();G.add(new T.Mesh(potGeo(r,r*1.5),potM(0xb8613a)));const sau=new T.Mesh(lath([[.001,0],[r*.95,0],[r*1.05,.02],[r*1.02,.025]],32),potM(0xa8552f));G.add(sau);G.children.forEach(m=>m.castShadow=true);return G}
function bag(){const G=new T.Group(),g=new T.BoxGeometry(.18,.26,.08,6,10,3),p=g.attributes.position;for(let i=0;i<p.count;i++){const t=(p.getY(i)+.13)/.26;p.setZ(i,p.getZ(i)*(1-Math.max(0,t-.7)*2.6))}g.computeVertexNormals();
  const base=new T.MeshStandardMaterial({color:0x2f5a34,roughness:.8}),front=new T.MeshStandardMaterial({map:label(384,560,'#2f5a34',[{t:'FLORA',f:'700 64px Georgia',c:'#e8f6d0',y:90},{t:'MEDIA TANAM',f:'700 40px system-ui',c:'#e8f6d0',y:240},{t:'Racik Aroid',f:'500 34px system-ui',c:'#cfe8b0',y:300},{t:'5 L',f:'800 80px system-ui',c:'#ffd23a',y:440}],(g,w,h)=>{g.fillStyle='#4a8a3a';g.fillRect(0,150,w,40)}),roughness:.8});
  const m=new T.Mesh(g,[base,base,base,base,front,base]);m.position.y=.13;m.castShadow=true;G.add(m);return G}
function growLamp(){const G=new T.Group(),blk=new T.MeshStandardMaterial({color:0x1a1a1a,roughness:.4,metalness:.4});Cyl(.06,.07,.015,blk,0,.008,0,G,32);
  G.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([V(0,.01,0),V(0,.15,0),V(.05,.28,0),V(.14,.32,0)]),24,.006,8),blk));const head=RBox(.16,.02,.05,.008,blk,.2,.32,0,G);
  const led=new T.Mesh(new T.PlaneGeometry(.14,.035),new T.MeshBasicMaterial({color:new T.Color(2.4,.5,1.8),toneMapped:false}));led.rotation.x=Math.PI/2;led.position.set(.2,.308,0);G.add(led);return G}
function model(pid,vr){if(pid==='monstera')return monstera(vr);if(pid==='ficus-lyrata')return ficus(vr);if(pid==='calathea')return calathea();if(pid==='pothos')return pothos();if(pid==='pot-terakota')return terracotta(vr);if(pid==='media-racik')return bag();if(pid==='lampu-tumbuh')return growLamp();return calathea()}

/* ---------- tempat ---------- */
const stations={
  bukit:{label:'Bukit',pos:[27,15,32],look:[0,3,0],audio:'garden',href:'/'},
  jalan:{label:'Jalan setapak',parent:'bukit',pos:[8,3.2,36],look:[0,3.6,0],audio:'garden',href:'/tentang'},
  lapak:{label:'Lapak tanaman',parent:'jalan',pos:[.6,1.75,22.5],look:[5.4,1,20],audio:'garden',href:'/toko'},
  kasir:{label:'Meja kasir',parent:'jalan',pos:[-.6,1.9,22.8],look:[-5.2,1.05,20],audio:'garden',href:'/keranjang'},
  pintu:{label:'Pintu rumah kaca',parent:'jalan',pos:[0,2.5,19],look:[0,2.5,0],audio:'garden',href:'/kontak'},
  bedeng:{label:'Bedeng',parent:'pintu',pos:[0,1.9,9],look:[0,2.4,-12],audio:'garden',href:'/rawat'},
  pajang:{label:'Pajangan 360°',parent:'bedeng',pos:[0,1.6,-4.6],look:[0,1.2,-6.6],audio:'garden',href:'/produk/monstera'}};
const tour=['bukit','jalan','lapak','pintu','bedeng','pajang'];
const items=[['monstera',{Ukuran:'Pot 25 cm',Pot:'Terakota'},0,-1.6],['ficus-lyrata',{Tinggi:'80 cm'},0,-.75],['monstera',{Ukuran:'Pot 20 cm',Pot:'Putih'},0,.1],['ficus-lyrata',{Tinggi:'80 cm'},0,.9],['monstera',{Ukuran:'Pot 20 cm',Pot:'Abu'},0,1.65],
  ['calathea',null,1,-1.6],['calathea',null,1,-1.15],['pothos',null,1,-.4],['pothos',null,1,.1],['pot-terakota',{Ukuran:'25 cm'},1,.8],['pot-terakota',{Ukuran:'20 cm'},1,1.3],['pot-terakota',{Ukuran:'20 cm'},1,1.7],
  ['media-racik',null,2,-1.5],['media-racik',null,2,-1.1],['lampu-tumbuh',null,2,-.2],['lampu-tumbuh',null,2,.5],['calathea',null,2,1.3]];
function setup(rt,W){const sc=rt.scene;
  const wood=new T.MeshStandardMaterial({color:0x8a6236,roughness:.8}),stone=new T.MeshStandardMaterial({color:0xcfc8b8,roughness:.85});
  const sh=shelf(sc,{pos:[5.6,0,20],rotY:-Math.PI/2,len:3.6,depth:.55,rows:[.06,.82,1.45],mat:wood,items,model,site,scale:1.3,pinY:.55,at:['lapak']});
  // atap kain lapak
  const awn=new T.Mesh(new T.PlaneGeometry(4.2,1.6),new T.MeshStandardMaterial({color:0x3f7a3a,roughness:.9,side:T.DoubleSide}));awn.position.set(5.2,2.45,20);awn.rotation.set(-Math.PI/2,0,Math.PI/2);awn.rotateX(.25);sc.add(awn);
  [18.2,21.8].forEach(z=>Box(.06,2.4,.06,wood,4.6,1.2,z,sc));
  const ped=pedestal(sc,{pos:[0,0,-6.6],k:1.4,mat:stone,baseMat:new T.MeshStandardMaterial({color:0x6a3a2a,roughness:.8}),model,scale:1.5,ring:new T.Color(1.2,2.4,.6),lightI:30});
  const ct=counter(sc,{pos:[-5.4,0,20],len:2.2,mat:wood,topMat:new T.MeshStandardMaterial({color:0x6a4a2c,roughness:.6}),model,site,basket:0xa8834a,screen:new T.Color(1,2,.6)});
  sc.userData.aoDirty=true;
  W.pins=[{pos:[0,9,15],label:'Rumah kaca FLORA',sub:'Mulai tur',href:'#/tentang',at:['bukit']},{pos:[5.4,2.8,20],label:'Lapak tanaman',sub:'Belanja',href:'#/toko',at:['jalan','pintu','kasir']},
    {pos:[-5.4,1.8,20],label:'Meja kasir',sub:'Keranjang',href:'#/keranjang',at:['jalan','lapak','pintu']},{pos:[0,4.6,15.3],label:'Masuk rumah kaca',href:'#/rawat',at:['jalan','lapak','kasir','pintu']},
    {pos:[0,2.6,-6.6],label:'Pajangan 360°',href:'#/produk/monstera',at:['bedeng']},{pos:[0,2.4,14],label:'Keluar',sub:'Lapak & kasir',href:'#/toko',at:['bedeng','pajang']}];
  wireShop(W,{site,model,shelves:[sh],ped,counter:ct,thumb:{rim:0x9be564}});
}
const btn=(h,t,g)=>'<a class="wbtn'+(g?' ghost':'')+'" href="#'+h+'">'+t+'</a>';
/* ---------- pengalaman "jurnal kebun": buku catatan kiri bertab, kuis tanaman yang cocok ---------- */
const TABS=[['/','Sampul'],['/cocok','Cocokkan'],['/toko','Lapak'],['/rawat','Rawat'],['/tentang','Cerita'],['/keranjang','Keranjang']];
const QS=[{k:'c',q:'Seberapa terang ruangan Anda?',o:[['t','Terang, dekat jendela'],['s','Sedang, cahaya tidak langsung'],['r','Redup, jauh dari jendela']]},
  {k:'a',q:'Seberapa sering Anda sempat menyiram?',o:[['r','Rajin, dua kali seminggu'],['k','Kadang, seminggu sekali'],['l','Sering lupa']]},
  {k:'h',q:'Ada kucing atau anjing di rumah?',o:[['y','Ada'],['n','Tidak ada']]},
  {k:'u',q:'Tanamannya mau ditaruh di mana?',o:[['m','Meja atau rak'],['l','Lantai, jadi sorotan'],['g','Digantung']]}];
const FIT={monstera:{c:'ts',a:'kl',h:'n',u:'l'},'ficus-lyrata':{c:'t',a:'k',h:'n',u:'l'},calathea:{c:'sr',a:'r',h:'yn',u:'m'},pothos:{c:'srt',a:'rkl',h:'n',u:'gm'}};
const WHY={monstera:'Tahan lupa menyiram dan cepat tumbuh di cahaya tidak langsung.',"ficus-lyrata":'Butuh jendela terang dan siraman teratur; hasilnya dramatis.',calathea:'Aman untuk hewan dan senang ruangan teduh yang lembap.',pothos:'Hampir mustahil mati, cocok untuk ruang redup dan pot gantung.'};
function score(ans){return Object.entries(FIT).map(([id,f])=>{let s=0,n=0;for(const k in ans){n++;if(f[k]&&f[k].includes(ans[k]))s++}return{id,p:Math.round(s/Math.max(1,n)*100)}}).sort((a,b)=>b.p-a.p)}
function cocok(W,r){const ans={};QS.forEach(q=>{const v=r.q.get(q.k);if(v)ans[q.k]=v});const step=Object.keys(ans).length;
  if(step<QS.length){const q=QS[step];const base=new URLSearchParams(r.q);
    return{st:['bedeng','lapak','pintu','bedeng'][step],title:'Cocokkan',kind:'quiz',html:'<p class="wk">Halaman '+(step+1)+' dari '+QS.length+'</p><h1 class="wh">'+esc(q.q)+'</h1><div class="fl-dots">'+QS.map((_,i)=>'<i class="'+(i<step?'done':i===step?'cur':'')+'"></i>').join('')+'</div>'
      +'<div class="fl-opts">'+q.o.map(o=>{const u=new URLSearchParams(base);u.set(q.k,o[0]);return '<a href="#/cocok?'+u+'"><span>'+esc(o[1])+'</span><i>→</i></a>'}).join('')+'</div>'
      +(step?'<a class="fl-back" href="#/cocok">Ulangi dari awal</a>':'<p class="wtiny">Empat pertanyaan singkat. Jawaban Anda tidak disimpan.</p>')}}
  const res=score(ans),top=res[0];W.quizTop=top.id;
  return{st:'pajang',title:'Hasil',kind:'product',orbit:{target:[0,1.6,-6.6],az:.3,el:.12,d:1.9,dmin:.8,dmax:3.5},html:'<p class="wk">Hasil pencocokan</p><h1 class="wh">Tanaman untuk Anda</h1><p class="wl">Yang paling cocok sudah kami taruh di pajangan. Seret untuk memutarnya 360°.</p>'
    +res.map((x,i)=>{const p=shop.P(site,x.id);return '<a class="fl-res'+(i?'':' top')+'" href="#/produk/'+x.id+'"><img src="'+(W.thumb?W.thumb(x.id,shop.defVar(p)):'')+'" alt=""><span><b>'+esc(p.name)+'</b><em>'+esc(WHY[x.id])+'</em><small>'+shop.rp(p.price)+'</small></span><i>'+x.p+'%</i></a>'}).join('')
    +'<div class="wrow">'+btn('/produk/'+top.id,'Lihat '+esc(shop.P(site,top.id).name))+btn('/cocok','Ulangi',1)+'</div>'}}
function home(){const h=site.home;return{st:'bukit',kind:'hero',title:'Sampul',html:'<p class="wk">Jurnal kebun · Lembang</p><h1 class="wh big">'+h.title+'</h1><p class="wl">'+esc(h.sub)+'</p>'
  +'<div class="fl-note">Belum tahu tanaman apa yang cocok? Jawab empat pertanyaan, kami taruh pilihannya di pajangan.</div>'
  +'<div class="wrow">'+btn('/cocok','Cocokkan tanaman')+btn('/toko','Ke lapak',1)+'</div><ul class="wusp">'+site.usp.map(u=>'<li><b>'+esc(u[0])+'</b><span>'+esc(u[1])+'</span></li>').join('')+'</ul>'}}
function about(){const a=site.about;return{st:'jalan',title:'Cerita',html:'<p class="wk">Jalan setapak</p><h1 class="wh">'+esc(a.title)+'</h1><p class="wl">'+esc(a.sub)+'</p>'+a.paras.map(p=>'<p>'+esc(p)+'</p>').join('')
  +'<h3>Yang kami pegang</h3>'+a.values.map(v=>'<p><b>'+esc(v[0])+'.</b> '+esc(v[1])+'</p>').join('')+site.testi.slice(0,2).map(t=>'<blockquote>“'+esc(t[0])+'” <cite>'+esc(t[1])+', '+esc(t[2])+'</cite></blockquote>').join('')+'<div class="wrow">'+btn('/cocok','Cocokkan tanaman')+'</div>'}}
function rawat(W){return{st:'bedeng',title:'Rawat',html:'<p class="wk">Bedeng rumah kaca</p><h1 class="wh">Cara kami merawat</h1><p class="wl">Siram bedeng dan lihat tanaman tumbuh, atau nyalakan lampu tumbuh. Setiap tanaman diaklimatisasi tiga minggu di sini sebelum dikirim.</p>'
  +'<div class="wrow"><button class="wbtn" data-act="water">Siram</button><button class="wtg" data-act="uv" aria-pressed="'+!!W.uv+'"><i></i>Lampu tumbuh: <b>'+(W.uv?'Nyala':'Mati')+'</b></button></div>'
  +'<ol class="wsteps"><li><b>Cahaya</b>Terang tidak langsung untuk sebagian besar tanaman daun.</li><li><b>Air</b>Siram saat 3 cm tanah atas kering.</li><li><b>Kelembapan</b>Calathea suka lembap; semprot pagi hari.</li><li><b>Pupuk</b>Sebulan sekali di musim tumbuh.</li></ol>'
  +'<div class="wrow">'+btn('/produk/monstera','Lihat Monstera 360°')+btn('/toko','Ke lapak',1)+'</div>'}}
function chrome(W){const t=document.createElement('nav');t.id='flTabs';t.setAttribute('aria-label','Tab jurnal');t.innerHTML=TABS.map(x=>'<a href="#'+x[0]+'" data-r="'+x[0]+'">'+x[1]+'</a>').join('');document.body.appendChild(t)}
const def={site,concept,stations,tour,audio:true,panelLight:true,noglImg:'04',layout:'journal',avoid:['#wp'],chrome,
  nav:[['Sampul','/'],['Cocokkan','/cocok'],['Lapak','/toko'],['Rawat','/rawat'],['Cerita','/tentang'],['Lacak','/lacak'],['Kontak','/kontak']],
  setup,
  route(r,W){const a=r.seg[0];
    if(!a)return home();if(a==='tentang')return about();if(a==='rawat')return rawat(W);
    if(a==='cocok'){const o=cocok(W,r);if(o.orbit&&W.showProduct){const p=shop.P(site,W.quizTop);const tg=W.showProduct(p.id,shop.defVar(p));const sz=W.orbitHint.size;o.orbit=Object.assign(o.orbit,{target:tg,d:sz*2.1+.5,dmin:sz,dmax:sz*4})}return o}
    if(a==='toko')return Object.assign(shop.catalog(site,W,r,{title:'Lapak tanaman',sub:'Klik tanaman di lapak, atau pilih di bawah. Setiap tanaman bisa diputar 360° di pajangan rumah kaca.'}),{st:'lapak'});
    if(a==='produk'){const o=shop.product(site,W,r.seg[1],r.q);if(!o)return null;let tg=[0,1.6,-6.6],sz=.6;if(W.showProduct){tg=W.showProduct(W.sel.pid,W.sel.vr);sz=W.orbitHint.size}return Object.assign(o,{st:'pajang',kind:'product',orbit:{target:tg,az:0,el:.12,d:sz*2.1+.5,dmin:sz,dmax:sz*4}})}
    if(a==='keranjang')return Object.assign(shop.cartPanel(site,W),{st:'kasir'});if(a==='checkout')return Object.assign(shop.checkout(site,W),{st:'kasir'});
    if(a==='pesanan')return Object.assign(shop.order(site,W,decodeURIComponent(r.seg[1]||'')),{st:'kasir'});if(a==='lacak')return Object.assign(shop.track(site,W,r),{st:'kasir'});
    if(a==='kontak'||a==='faq')return Object.assign(shop.contact(site,W,'Pintu rumah kaca'),{st:'pintu'});return null},
  onRoute(r,out,W){document.querySelectorAll('#flTabs a').forEach(a=>a.classList.toggle('on',a.dataset.r===r.path||(a.dataset.r!=='/'&&r.path.startsWith(a.dataset.r))||(a.dataset.r==='/toko'&&r.path.startsWith('/produk'))||(a.dataset.r==='/keranjang'&&/^\/(checkout|pesanan|lacak)/.test(r.path))))},
  pickAction(id,W){if(id==='water'){W.rt.actions.water();W.sfx('rain');return true}},
  act(t,e,W){const a=t.dataset.act;if(a==='water'){W.rt&&W.rt.actions.water();W.sfx('rain')}else if(a==='uv'){W.uv=!W.uv;W.rt&&W.rt.actions.uv(W.uv);t.setAttribute('aria-pressed',W.uv);t.querySelector('b').textContent=W.uv?'Nyala':'Mati';W.sfx(W.uv?'power':'off')}else shop.act(site,W,t)},
  onCart(W){W.onCartChange&&W.onCartChange()},
  refresh(r,W){if(r.seg[0]==='keranjang')W.render()}};
world(def);
