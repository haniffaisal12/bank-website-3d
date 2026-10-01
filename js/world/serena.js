/* SERENA — company profile resor dengan reservasi, di dalam pulaunya sendiri.
   Udara = beranda, pantai = tentang, kolam = pengalaman, vila (dilihat 360° dari luar) = kamar & vila, kamar utama = wawasan,
   dek = reservasi (penanda menyala di atas vila yang dipilih), dermaga = makan malam, pintu vila = kontak. Siang/malam bisa diganti. */
import {T,V} from '../core.js';
import {world} from './world.js';
import * as C from './compro.js';
import {esc} from '../site/ui.js';
import site from '../sites/serena.js';
import {concept} from '../concepts/serena.js';

const VILLAS={'vila-samudra':{t:[11.5,2,-37],az:-.5,d:9.5,price:4800000},'vila-bintang':{t:[20.5,2,-27],az:.9,d:9.5,price:5500000},'vila-karang':{t:[-22,1.8,20],az:1.27,d:10,price:6200000}};
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
const nightBtn=W=>'<button class="wtg" data-act="night" aria-pressed="'+!!W.night+'"><i></i>Suasana: <b>'+(W.night?'Malam':'Siang')+'</b></button>';
function home(W){const h=site.home;return{st:'pulau',kind:'hero',title:'Beranda',html:'<p class="wk">'+esc(h.eyebrow)+'</p><h1 class="wh big">'+h.title+'</h1><p class="wl">'+esc(h.sub)+'</p>'
  +'<div class="wrow">'+btn('/pesan','Pesan vila')+btn('/tentang','Mulai tur',1)+'</div><div class="wrow">'+nightBtn(W)+'</div>'+C.stats(site)
  +h.testi.slice(0,2).map(t=>'<blockquote>“'+esc(t[0])+'” <cite>'+esc(t[1])+', '+esc(t[2])+'</cite></blockquote>').join('')+'<p class="wtiny">Gulir atau tekan › untuk turun ke pantai. Seret layar untuk melihat sekeliling 360°.</p>'}}
const booking=W=>({title:'Reservasi',where:'Dek vila',kind:'kamar',optLabel:'Pilih vila',nights:true,cta:'Kirim reservasi',doneTitle:'Reservasi diterima',sub:'Pilih vila; penanda cahaya menunjukkan letaknya di pulau. Sarapan dan speedboat sudah termasuk.',
  options:site.projects.map(p=>({id:p.id,name:p.name,note:p.client,price:VILLAS[p.id].price,priceLabel:'Rp '+(VILLAS[p.id].price/1e6).toLocaleString('id-ID')+' jt/malam'}))});
const def={site,concept,stations,tour,audio:true,panelLight:true,noglImg:'00',
  nav:[['Beranda','/'],['Tentang','/tentang'],['Pengalaman','/layanan'],['Vila','/vila'],['Wawasan','/wawasan'],['Reservasi','/pesan'],['Kontak','/kontak']],
  setup,
  pickAction(id,W){if(id==='night'){const b=document.querySelector('[data-act=night]');W.night=!W.night;W.rt.actions.night(W.night);document.querySelectorAll('[data-act=night]').forEach(b=>{b.setAttribute('aria-pressed',W.night);b.querySelector('b').textContent=W.night?'Malam':'Siang'});W.sfx('chime');return true}},
tick(t,dt,W){W.tickBeacon&&W.tickBeacon(t,dt)},
  route(r,W){const a=r.seg[0],id=r.seg[1];if(W.beacon&&a!=='pesan')W.beacon(null);
    if(!a)return home(W);
    if(a==='tentang')return Object.assign(C.about(site,'Garis pantai'),{st:'pantai'});
    if(a==='layanan'&&!id)return Object.assign(C.services(site,'Kolam & spa'),{st:'kolam'});
    if(a==='layanan'){const o=C.service(site,id);if(!o)return null;const st=SVC[id]||'kolam',v=VILLAS[st];return Object.assign(o,{st},v?{orbit:{target:v.t,az:v.az,el:.25,d:v.d,dmin:6,dmax:12}}:{})}
    if((a==='vila'||a==='proyek')&&!id)return Object.assign(C.projects(site,r,'Garis pantai'),{st:'pantai'});
    if(a==='vila'||a==='proyek'){const v=VILLAS[id];const o=C.project(site,id,'<p class="w360"><i></i>Seret untuk mengitari vila 360°, gulir atau cubit untuk mendekat.</p>');if(!o||!v)return null;
      o.html=o.html.replace(/href="#\/proyek/g,'href="#/vila');return Object.assign(o,{st:id,orbit:{target:v.t,az:v.az,el:.25,d:v.d,dmin:6,dmax:12}})}
    if(a==='wawasan'&&!id)return Object.assign(C.insights(site,'Kamar utama'),{st:'kamar',html:C.insights(site,'Kamar utama').html+'<div class="wrow">'+nightBtn(W)+'</div>'});
    if(a==='wawasan'){const o=C.insight(site,id);return o&&Object.assign(o,{st:'kamar'})}
    if(a==='pesan')return Object.assign(C.booking(site,W,booking(W),r),{st:'dek'});
    if(a==='karier')return Object.assign(C.careers(site,'Dermaga'),{st:'dermaga'});
    if(a==='kontak'||a==='faq')return Object.assign(C.contact(site,W,'Pintu vila'),{st:'pintu'});return null},
  act(t,e,W){if(t.dataset.act==='night'){W.night=!W.night;W.rt&&W.rt.actions.night(W.night);document.querySelectorAll('[data-act=night]').forEach(b=>{b.setAttribute('aria-pressed',W.night);b.querySelector('b').textContent=W.night?'Malam':'Siang'});W.sfx('chime');W.kick(1)}}};
world(def);
