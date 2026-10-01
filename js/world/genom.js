/* HELIX — company profile klinik genomik di dalam sebuah sel.
   Sel dari luar = beranda, membran = tentang & kontak, inti = layanan, segmen heliks (dikitari 360°) = detail layanan & studi,
   badan Golgi = studi & kemitraan, mitokondria = wawasan & karier, celah heliks = jadwalkan konsultasi. */
import {T,V} from '../core.js';
import {world} from './world.js';
import * as C from './compro.js';
import {esc} from '../site/ui.js';
import site from '../sites/genom.js';
import {concept} from '../concepts/genom.js';

/* pusat segmen heliks di koordinat dunia (heliks di (0,0,-6), diputar -1 rad; segmen di sumbu z lokal) */
const SEGZ=[12-95*.17,12-175*.17,12-265*.17],seg=k=>[-Math.sin(1)*SEGZ[k],0,Math.cos(1)*SEGZ[k]-6];
const orbFor=(k,az)=>{const t=seg(k);return{target:t,az:az==null?.4:az,el:.18,d:6,dmin:4,dmax:9}};
const orbPos=o=>{const c=Math.cos(o.el);return[o.target[0]+Math.sin(o.az)*c*o.d,o.target[1]+Math.sin(o.el)*o.d,o.target[2]+Math.cos(o.az)*c*o.d]};
const stations={
  sel:{label:'Sel',pos:[0,16,118],look:[0,0,0],audio:'cell',href:'/'},
  membran:{label:'Membran',parent:'sel',pos:[14,7,38],look:[0,0,0],audio:'cell',href:'/tentang'},
  inti:{label:'Inti sel',parent:'membran',pos:[2,2,24],look:[0,0,-4],audio:'cell',href:'/layanan'},
  celah:{label:'Celah heliks',parent:'inti',pos:[-3.6,1.5,6.8],look:[8,-.6,-9],audio:'cell',href:'/konsultasi'},
  golgi:{label:'Badan Golgi',parent:'membran',pos:[-14,10,34],look:[-26,8,18],audio:'cell',href:'/proyek'},
  mito:{label:'Mitokondria',parent:'membran',pos:[24,-2,26],look:[0,0,0],audio:'cell',href:'/wawasan'}};
[0,1,2].forEach(k=>{const o=orbFor(k);stations['seg'+k]={label:['Segmen skrining','Segmen farmakogenomik','Segmen genom utuh'][k],parent:'inti',pos:orbPos(o),look:o.target,audio:'cell'}});
const tour=['sel','membran','inti','celah','golgi','mito'];
const SV={'skrining-kanker':0,'farmakogenomik':1,'genom-utuh':2,'konseling':0},PJ={'studi-kanker-payudara':0,'farmako-jantung':1,'penyakit-langka':2};

function setup(rt,W){
  W.focus=(k,unzip,scan)=>{rt.actions.svc(k);rt.actions.unzip(!!unzip);if(scan)rt.actions.scan();W.kick(.8)};
  W.onBookingChange=x=>{const k=SV[x.id];if(k!=null)rt.actions.svc(k)};
  W.pins=[{pos:[0,12,40],label:'Masuk ke sel',sub:'Membran',href:'#/tentang',at:['sel']},{pos:[0,15,0],label:'Inti sel',sub:'Layanan',href:'#/layanan',at:['membran','golgi','mito']},
    {pos:[-26,12,18],label:'Badan Golgi',sub:'Studi',href:'#/proyek',at:['membran','inti','mito']},{pos:[18,4,8],label:'Mitokondria',sub:'Wawasan',href:'#/wawasan',at:['membran','golgi']},
    ...site.services.slice(0,3).map((x,i)=>{const p=seg(i);return{pos:[p[0],3.2,p[2]],label:x.name,sub:'Lihat 360°',kind:'prod',href:'#/layanan/'+x.id,at:['inti','celah']}}),
    {pos:[1,3,-6],label:'Jadwalkan konsultasi',href:'#/konsultasi',at:['inti']},{pos:[10,6,30],label:'Keluar ke membran',sub:'Kontak',href:'#/kontak',at:['inti','celah']}];
}
const btn=(h,t,g)=>'<a class="wbtn'+(g?' ghost':'')+'" href="#'+h+'">'+t+'</a>';
function home(W){const h=site.home;return{st:'sel',kind:'hero',title:'Beranda',html:'<p class="wk">'+esc(h.eyebrow)+'</p><h1 class="wh big">'+h.title+'</h1><p class="wl">'+esc(h.sub)+'</p>'
  +'<div class="wrow">'+btn('/cek','Cek tes yang cocok')+btn('/tentang','Mulai dari awal',1)+'</div>'+C.stats(site)
  +h.testi.slice(0,2).map(t=>'<blockquote>“'+esc(t[0])+'” <cite>'+esc(t[1])+', '+esc(t[2])+'</cite></blockquote>').join('')+'<p class="wtiny">Gulir atau tekan › untuk masuk ke sel. Seret layar untuk melihat sekeliling 360°.</p>'}}
const appt={title:'Jadwalkan konsultasi',where:'Celah heliks',kind:'konsultasi',optLabel:'Layanan',cta:'Jadwalkan',doneTitle:'Janji temu tercatat',sub:'Segmen heliks yang sesuai menyala saat Anda memilih layanan. Sesi pertama 45 menit tanpa kewajiban tes.',
  slots:['08.30','10.00','13.00','14.30','16.00'],options:site.services.map(x=>({id:x.id,name:x.name,note:x.short}))};
const ctrl=W=>'<div class="wrow"><button class="wtg" data-act="unzip" aria-pressed="'+!!W.unzip+'"><i></i>Heliks: <b>'+(W.unzip?'Terurai':'Utuh')+'</b></button><button class="wbtn sm ghost" data-act="scan">Pindai gen</button></div>';
/* ---------- pengalaman "perjalanan pasien": stepper kiri, panel klinis putih, cek kecocokan langsung ---------- */
const JOURNEY=[['/tentang','Kenali HELIX','Siapa kami & cara kerja'],['/layanan','Pilih layanan','Empat jenis tes'],['/cek','Cek kecocokan','4 pertanyaan, 1 menit'],['/konsultasi','Jadwalkan','Konselor bersertifikat'],['/setelah','Setelah tes','Sampel, hasil, konseling']];
const QX=[['k','Ada keluarga dekat yang terkena kanker sebelum usia 50?','skrining-kanker'],['o','Sedang menjalani terapi obat jangka panjang (jantung, psikiatri, nyeri)?','farmakogenomik'],['l','Ada anggota keluarga dengan gejala penyakit langka tanpa diagnosis?','genom-utuh'],['h','Sudah punya hasil tes genetik yang membingungkan?','konseling']];
function cek(W){const A=W.ans||(W.ans={});const picked=QX.filter(q=>A[q[0]]);const rec=picked.length?picked[0][2]:null;const x=rec&&site.services.find(s=>s.id===rec);
  if(rec&&W.focus)W.focus(SV[rec],rec==='genom-utuh',false);
  return{st:rec?'seg'+SV[rec]:'inti',orbit:rec?orbFor(SV[rec]):null,title:'Cek kecocokan',html:'<p class="wk">Langkah 3 · Cek kecocokan</p><h1 class="wh">Tes mana yang relevan untuk Anda?</h1><p class="wl">Jawab ya atau tidak. Saran berubah langsung, dan segmen DNA yang sesuai menyala di belakang.</p>'
    +'<div class="hx-q">'+QX.map(q=>'<div class="hx-row"><span>'+esc(q[1])+'</span><div class="hx-yn" role="group"><button data-act="ans" data-k="'+q[0]+'" data-v="1" aria-pressed="'+(A[q[0]]===true)+'">Ya</button><button data-act="ans" data-k="'+q[0]+'" data-v="0" aria-pressed="'+(A[q[0]]===false)+'">Tidak</button></div></div>').join('')+'</div>'
    +(x?'<div class="hx-rec"><small>Saran kami</small><b>'+esc(x.name)+'</b><p>'+esc(x.short)+'</p><div class="wrow"><a class="wbtn" href="#/konsultasi?pilih='+x.id+'">Jadwalkan konsultasi →</a><a class="wbtn ghost" href="#/layanan/'+x.id+'">Detail layanan</a></div></div>'
       :'<div class="hx-rec none"><small>Belum ada saran</small><p>Jika semua jawaban “tidak”, tes genetik mungkin belum perlu. Konseling awal tetap bisa membantu.</p></div>')
    +'<p class="wtiny">Ini bukan diagnosis. Keputusan tes selalu dibahas bersama dokter atau konselor.</p>'}}
function setelah(){return{st:'golgi',title:'Setelah tes',html:'<p class="wk">Langkah 5 · Setelah tes</p><h1 class="wh">Apa yang terjadi setelah sampel Anda tiba</h1>'
  +'<ol class="hx-tl"><li><b>Hari 0</b><span>Sampel ludah atau darah diterima, diberi kode tanpa nama.</span></li><li><b>Hari 1–10</b><span>Sekuensing dan kontrol kualitas di laboratorium terakreditasi.</span></li><li><b>Hari 11–14</b><span>Interpretasi varian oleh tim bioinformatika dan dokter genetika.</span></li><li><b>Hari 14</b><span>Laporan terbit; sesi konseling 45 menit membahas hasilnya.</span></li></ol>'
  +'<h3>Privasi</h3><p>Data dienkripsi dan tidak dibagikan ke pihak ketiga, termasuk asuransi, tanpa persetujuan tertulis.</p><h3>Pertanyaan umum</h3>'+site.faq.map(q=>'<details><summary>'+esc(q[0])+'</summary><p>'+esc(q[1])+'</p></details>').join('')
  +'<div class="wrow"><a class="wbtn" href="#/konsultasi">Jadwalkan konsultasi</a></div>'}}
function chrome(W){const j=document.createElement('nav');j.id='hxJ';j.setAttribute('aria-label','Perjalanan pasien');
  j.innerHTML='<p>Perjalanan Anda</p><ol>'+JOURNEY.map((x,i)=>'<li><a href="#'+x[0]+'" data-r="'+x[0]+'"><b>'+(i+1)+'</b><span>'+x[1]+'<em>'+x[2]+'</em></span></a></li>').join('')+'</ol><div class="hx-more"><a href="#/proyek">Studi</a><a href="#/wawasan">Wawasan</a><a href="#/karier">Karier</a><a href="#/kontak">Kontak</a></div>';document.body.appendChild(j)}
const def={site,concept,stations,tour,audio:true,noglImg:'06',layout:'clinic',avoid:['#wp'],chrome,
  nav:[['Beranda','/'],['Kenali','/tentang'],['Layanan','/layanan'],['Cek','/cek'],['Jadwalkan','/konsultasi'],['Setelah tes','/setelah'],['Studi','/proyek'],['Wawasan','/wawasan'],['Kontak','/kontak']],
  setup,
  pickAction(id,W){if(id==='unzip'){W.unzip=!W.unzip;W.rt.actions.unzip(W.unzip);const b=document.querySelector('[data-act=unzip]');if(b){b.setAttribute('aria-pressed',W.unzip);b.querySelector('b').textContent=W.unzip?'Terurai':'Utuh'}W.sfx('servo');return true}},

  route(r,W){const a=r.seg[0],id=r.seg[1];
    if(!a)return home(W);if(a==='cek')return cek(W);if(a==='setelah')return setelah();
    if(a==='tentang')return Object.assign(C.about(site,'Langkah 1 · Kenali HELIX'),{st:'membran'});
    if(a==='layanan'&&!id)return Object.assign(C.services(site,'Langkah 2 · Pilih layanan'),{st:'inti'});
    if(a==='layanan'){const k=SV[id];const o=C.service(site,id,'<p class="w360"><i></i>Seret untuk mengitari segmen heliks 360°, gulir atau cubit untuk mendekat.</p>'+ctrl(W));if(!o||k==null)return null;W.focus&&W.focus(k,W.unzip,true);return Object.assign(o,{st:'seg'+k,orbit:orbFor(k)})}
    if(a==='proyek'&&!id)return Object.assign(C.projects(site,r,'Badan Golgi'),{st:'golgi'});
    if(a==='proyek'){const k=PJ[id];const o=C.project(site,id,'<p class="w360"><i></i>Seret untuk mengitari segmen heliks yang diteliti.</p>');if(!o||k==null)return null;W.focus&&W.focus(k,id==='penyakit-langka',true);return Object.assign(o,{st:'seg'+k,orbit:orbFor(k,-.6)})}
    if(a==='wawasan'&&!id)return Object.assign(C.insights(site,'Mitokondria'),{st:'mito'});
    if(a==='wawasan'){const o=C.insight(site,id);return o&&Object.assign(o,{st:'mito'})}
    if(a==='karier')return Object.assign(C.careers(site,'Mitokondria'),{st:'mito'});
    if(a==='konsultasi')return Object.assign(C.booking(site,W,Object.assign({},appt,{where:'Langkah 4 · Jadwalkan'}),r),{st:'celah'});
    if(a==='kontak'||a==='faq')return Object.assign(C.contact(site,W,'Membran sel'),{st:'membran'});return null},
  onRoute(r,out,W){const i=JOURNEY.findIndex(x=>r.path.startsWith(x[0]));document.querySelectorAll('#hxJ li').forEach((li,k)=>{li.className=k<i?'done':k===i?'cur':''});document.getElementById('hxJ').style.setProperty('--p',i<0?0:i/(JOURNEY.length-1))},
  keepFocus:()=>document.activeElement&&document.activeElement.dataset&&document.activeElement.dataset.act==='ans',
  act(t,e,W){const a=t.dataset.act;if(a==='ans'){(W.ans||(W.ans={}))[t.dataset.k]=t.dataset.v==='1';W.sfx('cycle');const k=t.dataset.k,v=t.dataset.v;W.render();const b=document.querySelector('[data-act=ans][data-k="'+k+'"][data-v="'+v+'"]');b&&b.focus();return}
    if(!W.rt)return;
    if(a==='unzip'){W.unzip=!W.unzip;W.rt.actions.unzip(W.unzip);t.setAttribute('aria-pressed',W.unzip);t.querySelector('b').textContent=W.unzip?'Terurai':'Utuh';W.sfx('servo');W.kick(1)}
    else if(a==='scan'){W.rt.actions.scan();W.sfx('scan')}}};
world(def);
