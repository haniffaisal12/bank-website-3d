/* SERENA — company profile resor dengan reservasi, di dalam pulaunya sendiri.
   Udara = beranda, pantai = tentang, kolam = pengalaman, vila (dilihat 360° dari luar) = kamar & vila, kamar utama = wawasan,
   dek = reservasi (penanda menyala di atas vila yang dipilih), dermaga = makan malam, pintu vila = kontak. Siang/malam bisa diganti. */
import {T,V} from '../core.js';
import {world} from './world.js';
import * as C from './compro.js';
import {esc} from '../site/ui.js';
import site from '../sites/serena.js';
import {concept} from '../concepts/serena.js';

const VILLAS={'vila-samudra':{t:[11.5,2,-37],az:-.5,d:12,price:4800000},'vila-bintang':{t:[20.5,2,-27],az:1.1,d:12,price:5500000},'vila-karang':{t:[-22,1.8,20],az:1.27,d:12.5,price:6200000}};
const orbPos=v=>{const c=Math.cos(.25);return[v.t[0]+Math.sin(v.az)*c*v.d,v.t[1]+Math.sin(.25)*v.d,v.t[2]+Math.cos(v.az)*c*v.d]};
const stations={
  pulau:{label:'Di atas pulau',pos:[0,92,78],look:[0,0,24],audio:'sea',href:'/'},
  pantai:{label:'Garis pantai',parent:'pulau',pos:[6,24,46],look:[0,2,4],audio:'sea',href:'/tentang'},
  kolam:{label:'Kolam & spa',parent:'pantai',pos:[11,2.3,31],look:[0,.8,19],audio:'sea',href:'/layanan'},
  pintu:{label:'Pintu vila',parent:'pantai',pos:[0,2.1,13],look:[0,1.7,-1],audio:'garden',href:'/kontak'},
  kamar:{label:'Kamar utama',parent:'pintu',pos:[3.6,1.9,2.9],look:[-2.4,1.1,-.8],audio:'garden',href:'/wawasan'},
  dek:{label:'Dek & reservasi',parent:'kamar',pos:[0,1.9,-3],look:[8,.8,-30],audio:'sea',href:'/pesan'},
  dermaga:{label:'Dermaga',parent:'pantai',pos:[16,3,-9],look:[16,1.2,-38],audio:'sea',href:'/layanan/makan-malam'}};
for(const id in VILLAS){const v=VILLAS[id];stations[id]={label:site.projects.find(p=>p.id===id).name,parent:id==='vila-karang'?'pantai':'dermaga',pos:orbPos(v),look:v.t,audio:'sea',href:'/vila/'+id}}
const tour=['pulau','pantai','kolam','pintu','kamar','dek','dermaga'];
const SVC={'vila-air':'dermaga','vila-pantai':'vila-karang','makan-malam':'dermaga','spa':'kolam'};

function setup(rt,W){const sc=rt.scene;
  // penanda reservasi: cincin dan berkas cahaya di atas vila yang dipilih
  const bm=new T.MeshBasicMaterial({color:new T.Color(2.4,1.3,.5),transparent:true,opacity:.0,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false,side:T.DoubleSide});
  const beacon=new T.Group();sc.add(beacon);const beam=new T.Mesh(new T.CylinderGeometry(.35,.9,26,24,1,true),bm);beam.position.y=13;beacon.add(beam);
  const ring=new T.Mesh(new T.TorusGeometry(4.2,.09,8,64),bm);ring.rotation.x=Math.PI/2;ring.position.y=.4;beacon.add(ring);
  W.beacon=(id)=>{const v=VILLAS[id];W.beaconOn=!!v;if(v)beacon.position.set(v.t[0],0,v.t[2])};
  W.onBookingChange=x=>W.beacon(x.id);
  W.tickBeacon=(t,dt)=>{bm.opacity+=((W.beaconOn?.55:0)-bm.opacity)*Math.min(1,dt*3);ring.scale.setScalar(1+.08*Math.sin(t*3))};
  W.pins=[{pos:[0,6,24],label:'Turun ke pantai',href:'#/tentang',at:['pulau']},
    {pos:[0,1.5,20],label:'Kolam & spa',sub:'Pengalaman',href:'#/layanan',at:['pantai','pintu']},{pos:[0,7,0],label:'Vila utama',sub:'Masuk',href:'#/kontak',at:['pantai','kolam']},{pos:[16,2.5,-20],label:'Dermaga',sub:'Makan malam',href:'#/layanan/makan-malam',at:['pantai','dek']},
    ...Object.keys(VILLAS).map(id=>({pos:[VILLAS[id].t[0],6.5,VILLAS[id].t[2]],label:site.projects.find(p=>p.id===id).name,sub:'Lihat 360°',kind:'prod',href:'#/vila/'+id,at:['pantai','dek','dermaga','pulau']})),
    {pos:[0,1.8,4.2],label:'Masuk kamar',href:'#/wawasan',at:['pintu']},{pos:[0,1.6,-5],label:'Dek',sub:'Reservasi',href:'#/pesan',at:['kamar']},{pos:[0,1.8,4],label:'Kamar',href:'#/wawasan',at:['dek']},{pos:[0,1.8,5.5],label:'Keluar',sub:'Kontak',href:'#/kontak',at:['kamar']}];
}
const btn=(h,t,g)=>'<a class="wbtn'+(g?' ghost':'')+'" href="#'+h+'">'+t+'</a>';
/* ---------- pengalaman "editorial": bab bernomor, kolom teks majalah, bilah pemesanan tetap, indeks bab ---------- */
const CH=[['/','Pulau','pulau'],['/tentang','Pantai','pantai'],['/layanan','Kolam & spa','kolam'],['/vila','Vila','pantai'],['/wawasan','Kamar','kamar'],['/pesan','Dek','dek']];
const chOf=p=>{const i=CH.findIndex(c=>c[0]!=='/'&&p.startsWith(c[0]));return p==='/'?0:i<0?-1:i};
const head=(n,label,title,sub)=>'<div class="se-ch"><b>'+String(n+1).padStart(2,'0')+'</b><span>'+esc(label)+'</span></div><h1 class="wh big">'+title+'</h1>'+(sub?'<p class="se-lede">'+esc(sub)+'</p>':'');
function home(W){const h=site.home;return{st:'pulau',kind:'hero',title:'Beranda',html:head(0,'Kepulauan Riau','Pulau kecil, <em>ketenangan</em> yang besar.',h.sub)
  +'<p class="se-drop">'+esc(h.intro.text)+'</p><div class="se-stats">'+h.stats.map(x=>'<div><b>'+esc(x[0])+esc(x[1])+'</b><span>'+esc(x[2])+'</span></div>').join('')+'</div>'
  +h.testi.slice(0,1).map(t=>'<blockquote class="se-q">“'+esc(t[0])+'”<cite>'+esc(t[1])+' · '+esc(t[2])+'</cite></blockquote>').join('')
  +'<div class="wrow">'+btn('/tentang','Mulai membaca →',1)+'</div><p class="wtiny">Gulir untuk bab berikutnya · seret layar untuk melihat sekeliling 360°.</p>'}}
const booking=W=>({title:'Reservasi',where:'06 · Dek',kind:'kamar',optLabel:'Pilih vila',nights:true,cta:'Kirim reservasi',doneTitle:'Reservasi diterima',sub:'Pilih vila; penanda cahaya menunjukkan letaknya di pulau. Sarapan dan speedboat sudah termasuk.',
  options:site.projects.map(p=>({id:p.id,name:p.name,note:p.client,price:VILLAS[p.id].price,priceLabel:'Rp '+(VILLAS[p.id].price/1e6).toLocaleString('id-ID')+' jt/malam'}))});
function chrome(W){
  const today=new Date(Date.now()+864e5).toISOString().slice(0,10);
  const bar=document.createElement('form');bar.id='seBook';bar.setAttribute('aria-label','Pemesanan cepat');
  bar.innerHTML='<label><span>Check-in</span><input type="date" name="masuk" min="'+today+'" value="'+today+'"></label><label><span>Malam</span><select name="malam">'+[1,2,3,4,5,6,7].map(n=>'<option'+(n===2?' selected':'')+'>'+n+'</option>').join('')+'</select></label>'
   +'<label><span>Tamu</span><select name="tamu">'+[1,2,3,4].map(n=>'<option'+(n===2?' selected':'')+' value="'+n+'">'+n+' orang</option>').join('')+'</select></label><label><span>Vila</span><select name="pilih">'+site.projects.map(p=>'<option value="'+p.id+'">'+esc(p.name)+'</option>').join('')+'</select></label><button class="wbtn">Cek ketersediaan</button>';
  document.body.appendChild(bar);bar.onsubmit=e=>{e.preventDefault();const d=new FormData(bar);location.hash='/pesan?'+new URLSearchParams(d)};
  bar.pilih.onchange=()=>W.beacon&&W.beacon(bar.pilih.value);
  const idx=document.createElement('nav');idx.id='seIdx';idx.setAttribute('aria-label','Bab');idx.innerHTML=CH.map((c,i)=>'<a href="#'+c[0]+'" data-i="'+i+'"><b>'+String(i+1).padStart(2,'0')+'</b><span>'+c[1]+'</span></a>').join('');document.body.appendChild(idx);
  const sun=document.createElement('button');sun.id='seSun';sun.className='wic';sun.setAttribute('aria-label','Siang atau malam');sun.dataset.act='night';sun.innerHTML='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>';
  document.querySelector('.wact').prepend(sun);
}
function setNight(W,v){W.night=v;W.rt&&W.rt.actions.night(v);document.documentElement.classList.toggle('se-night',v);document.querySelectorAll('[data-act=night]').forEach(b=>{b.setAttribute('aria-pressed',v);const t=b.querySelector('b');if(t)t.textContent=v?'Malam':'Siang'});W.sfx('chime');W.kick(1)}
const def={site,concept,stations,tour,audio:true,panelLight:true,noglImg:'00',layout:'editorial',avoid:['#wp','#seBook'],chrome,
  nav:[['Tentang','/tentang'],['Pengalaman','/layanan'],['Vila','/vila'],['Jurnal','/wawasan'],['Kontak','/kontak']],
  setup,
  pickAction(id,W){if(id==='night'){setNight(W,!W.night);return true}},
  tick(t,dt,W){W.tickBeacon&&W.tickBeacon(t,dt)},
  route(r,W){const a=r.seg[0],id=r.seg[1];if(W.beacon&&a!=='pesan')W.beacon(null);const wrap=(o,n,label)=>{if(!o)return o;o.html=o.html.replace(/<p class="wk">[\s\S]*?<\/p><h1 class="wh">([\s\S]*?)<\/h1>(<p class="wl">([\s\S]*?)<\/p>)?/,(m,t,_,sub)=>head(n,label,t,sub?sub.replace(/&amp;/g,'&'):''));return o};
    if(!a)return home(W);
    if(a==='tentang')return wrap(Object.assign(C.about(site),{st:'pantai'}),1,'Garis pantai');
    if(a==='layanan'&&!id)return wrap(Object.assign(C.services(site),{st:'kolam'}),2,'Kolam & spa');
    if(a==='layanan'){const o=C.service(site,id);if(!o)return null;const st=SVC[id]||'kolam',v=VILLAS[st];return wrap(Object.assign(o,{st},v?{orbit:{target:v.t,az:v.az,el:.25,d:v.d,dmin:7,dmax:17}}:{}),2,'Pengalaman')}
    if((a==='vila'||a==='proyek')&&!id)return wrap(Object.assign(C.projects(site,r),{st:'pantai'}),3,'Vila');
    if(a==='vila'||a==='proyek'){const v=VILLAS[id];const o=C.project(site,id,'<p class="w360"><i></i>Seret untuk mengitari vila 360°, gulir atau cubit untuk mendekat.</p>');if(!o||!v)return null;
      o.html=o.html.replace(/href="#\/proyek/g,'href="#/vila');return wrap(Object.assign(o,{st:id,orbit:{target:v.t,az:v.az,el:.25,d:v.d,dmin:7,dmax:17}}),3,'Vila')}
    if(a==='wawasan'&&!id){const o=wrap(Object.assign(C.insights(site),{st:'kamar'}),4,'Kamar utama');o.html+='<div class="wrow"><button class="wtg" data-act="night" aria-pressed="'+!!W.night+'"><i></i>Suasana: <b>'+(W.night?'Malam':'Siang')+'</b></button></div>';return o}
    if(a==='wawasan'){const o=C.insight(site,id);return o&&wrap(Object.assign(o,{st:'kamar'}),4,'Jurnal')}
    if(a==='pesan')return wrap(Object.assign(C.booking(site,W,booking(W),r),{st:'dek'}),5,'Dek & reservasi');
    if(a==='karier')return Object.assign(C.careers(site,'Dermaga'),{st:'dermaga'});
    if(a==='kontak'||a==='faq')return Object.assign(C.contact(site,W,'Pintu vila'),{st:'pintu'});return null},
  onRoute(r,out,W){const i=chOf(r.path);document.querySelectorAll('#seIdx a').forEach(a=>a.classList.toggle('on',+a.dataset.i===i));const b=document.getElementById('seBook');if(b)b.hidden=r.seg[0]==='pesan'},
  act(t,e,W){if(t.dataset.act==='night')setNight(W,!W.night)}};
world(def);
