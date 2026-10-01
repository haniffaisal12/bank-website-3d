/* NEXUS·AI — company profile di dalam menaranya sendiri.
   Plaza = beranda, lobi = tentang, zona depan = kios layanan, lorong server = proyek, inti hologram = layanan & proyek 360°,
   media wall = wawasan, dinding kanan = karier, resepsionis = kontak. */
import {T,V,Box,RBox,Cyl,mesh} from '../core.js';
import {world} from './world.js';
import {screen,wrapText} from './kit.js';
import * as C from './compro.js';
import {esc} from '../site/ui.js';
import site from '../sites/nexus.js';
import {concept} from '../concepts/nexus.js';

const stations={
  menara:{label:'Plaza',pos:[34,4,58],look:[0,26,0],audio:'city',href:'/'},
  lobi:{label:'Lobi kaca',parent:'menara',pos:[12,6,32],look:[0,10,0],audio:'city',href:'/tentang'},
  depan:{label:'Zona layanan',parent:'lobi',pos:[0,2.7,11.3],look:[0,2.4,2],audio:'hum',href:'/layanan'},
  lorong:{label:'Lorong server',parent:'depan',pos:[0,2.5,1.5],look:[0,3.1,-9],audio:'hum',href:'/proyek'},
  inti:{label:'Inti hologram',parent:'lorong',pos:[0,3.6,-4.8],look:[0,3.3,-8],audio:'hum',href:'/layanan/agen-ai'},
  media:{label:'Media wall',parent:'depan',pos:[-7,2.5,8.9],look:[-11.6,2.6,8.4],audio:'hum',href:'/wawasan'},
  karier:{label:'Dinding karier',parent:'depan',pos:[7,2.5,8.9],look:[11.6,2.6,8.4],audio:'hum',href:'/karier'},
  resepsi:{label:'Resepsionis',parent:'depan',pos:[1.2,2.3,6.2],look:[6.6,1.3,10.2],audio:'hum',href:'/kontak'}};
const tour=['menara','lobi','depan','lorong','inti','media','karier','resepsi'];
const HOLO={'platform-data':1,'agen-ai':0,'vision-edge':2,'tata-kelola':1,'arunika-verifikasi':0,'tirta-gudang':2,'bumi-prediksi':1};

/* gaya layar: latar gelap, garis sian, huruf mono */
function frame(g,w,h,tag){g.fillStyle='rgba(4,14,24,.92)';g.fillRect(0,0,w,h);g.strokeStyle='#4fe0ff';g.lineWidth=4;g.strokeRect(8,8,w-16,h-16);g.fillStyle='#4fe0ff';g.font='600 '+Math.round(h*.06)+'px monospace';g.textAlign='left';g.fillText(tag,w*.05,h*.13)}
function setup(rt,W){const sc=rt.scene,S={};
  const metal=new T.MeshStandardMaterial({color:0x0e131b,metalness:.85,roughness:.32}),glowM=new T.MeshBasicMaterial({color:new T.Color(.4,1.8,2.6),toneMapped:false});
  // kios layanan: empat panel berdiri di zona depan
  W.kiosk=site.services.map((x,i)=>{const px=[-5.4,-1.8,1.8,5.4][i],pz=8.1-Math.abs(px)*.06,ry=-px*.05;
    Box(.12,2.2,.12,metal,px,1.1,pz-.02,sc);const sk=screen(sc,{w:1.9,h:1.15,pos:[px,2.3,pz],rotY:ry,px:768,gain:[1.4,1.4,1.4]});
    mesh(new T.BoxGeometry(1.2,.04,.5),glowM,px,.03,pz,sc).castShadow=false;
    sk.draw((g,w,h)=>{frame(g,w,h,'LAYANAN 0'+(i+1));g.fillStyle='#fff';g.font='700 '+Math.round(h*.13)+'px sans-serif';const y=wrapText(g,x.name,w*.05,h*.36,w*.9,h*.15);g.fillStyle='#9fd7ea';g.font='400 '+Math.round(h*.07)+'px sans-serif';wrapText(g,x.short,w*.05,y+h*.02,w*.9,h*.09)});
    return{x,sk,pos:[px,2.3,pz]}});
  // layar proyek di kiri-kanan hologram
  S.pl=screen(sc,{w:2.4,h:1.5,pos:[-3.3,3.3,-9.35],rotY:.45,px:640,add:true,transparent:true,gain:[1.6,1.6,1.6]});
  S.pr=screen(sc,{w:2.4,h:1.5,pos:[3.3,3.3,-9.35],rotY:-.45,px:640,add:true,transparent:true,gain:[1.6,1.6,1.6]});
  // media wall & karier
  S.media=screen(sc,{w:5,h:2.8,pos:[-11.6,2.7,8.4],rotY:Math.PI/2,px:1024});S.job=screen(sc,{w:5,h:2.8,pos:[11.6,2.7,8.4],rotY:-Math.PI/2,px:1024});
  [-1,1].forEach(s=>{const l=new T.PointLight(0x4fe0ff,6,8,2);l.position.set(s*9.5,3,8.4);sc.add(l)});
  // resepsionis: meja lengkung + logo
  const desk=new T.Mesh(new T.CylinderGeometry(1.6,1.6,1.05,40,1,true,-.9,1.8),new T.MeshStandardMaterial({color:0x101722,metalness:.6,roughness:.25,side:T.DoubleSide}));desk.position.set(6.6,.53,10.4);desk.rotation.y=Math.PI;sc.add(desk);
  const top=new T.Mesh(new T.RingGeometry(1.45,1.75,40,1,-.9+Math.PI/2,1.8),new T.MeshStandardMaterial({color:0xdfe8f0,roughness:.2}));top.rotation.x=-Math.PI/2;top.position.set(6.6,1.06,10.4);sc.add(top);
  const strip=new T.Mesh(new T.CylinderGeometry(1.61,1.61,.03,40,1,true,-.9,1.8),glowM);strip.position.set(6.6,.25,10.4);strip.rotation.y=Math.PI;sc.add(strip);
  S.logo=screen(sc,{w:2.6,h:.7,pos:[6.6,2.7,11.6],rotY:Math.PI,px:768,add:true,transparent:true,gain:[1.8,1.8,1.8]});S.logo.draw((g,w,h)=>{g.fillStyle='#bff4ff';g.font='800 '+Math.round(h*.55)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('NEXUS·AI',w/2,h/2)});
  const dl=new T.PointLight(0xbfe6ff,8,6,2);dl.position.set(6,2.6,9);sc.add(dl);
  sc.userData.aoDirty=true;
  W.screens=S;
  W.drawProj=(x)=>{S.pl.draw((g,w,h)=>{g.fillStyle='#7fe8ff';g.textAlign='left';g.font='600 34px monospace';g.fillText(x?x.sector.toUpperCase()+' · '+x.year:'PROYEK PILIHAN',30,60);g.fillStyle='#fff';g.font='700 46px sans-serif';
      if(x)wrapText(g,x.name,30,130,w-60,54);else site.projects.forEach((p,i)=>{g.font='600 32px sans-serif';g.fillText((i+1)+'. '+p.name,30,130+i*70)})});
    S.pr.draw((g,w,h)=>{g.fillStyle='#7fe8ff';g.textAlign='left';g.font='600 34px monospace';g.fillText(x?'HASIL':'SEKTOR',30,60);const list=x?x.results:site.projects.map(p=>[p.sector,p.client]);
      list.forEach((r,i)=>{g.fillStyle='#fff';g.font='800 '+(x?60:34)+'px sans-serif';g.fillText(r[0],30,(x?140:130)+i*(x?110:70));g.fillStyle='#9fd7ea';g.font='400 26px sans-serif';g.fillText(r[1].slice(0,34),x?240:250,(x?140:130)+i*(x?110:70))})})};
  W.drawProj(null);
  W.drawMedia=(x)=>S.media.draw((g,w,h)=>{frame(g,w,h,x?x.tag.toUpperCase():'WAWASAN');g.fillStyle='#fff';g.font='700 64px sans-serif';
    if(x){const y=wrapText(g,x.title,50,220,w-100,76);g.fillStyle='#9fd7ea';g.font='400 34px sans-serif';wrapText(g,x.excerpt,50,y+20,w-100,44)}
    else site.insights.forEach((a,i)=>{g.fillStyle=i?'#cfeaf3':'#fff';g.font=(i?'600 38px':'700 50px')+' sans-serif';g.fillText(a.title.slice(0,46),50,200+i*120);g.fillStyle='#4fe0ff';g.font='400 26px monospace';g.fillText(a.tag+' · '+a.date,50,240+i*120)})});
  W.drawMedia(null);
  S.job.draw((g,w,h)=>{frame(g,w,h,'KARIER · KAMI MEREKRUT');site.jobs.forEach((j,i)=>{g.fillStyle='#fff';g.font='700 54px sans-serif';g.fillText(j.title,50,220+i*150);g.fillStyle='#9fd7ea';g.font='400 32px sans-serif';g.fillText(j.place+' · '+j.type,50,265+i*150)})});
  W.pins=[{pos:[0,9,12.5],label:'Masuk menara',sub:'Lobi kaca',href:'#/tentang',at:['menara']},{pos:[0,3,12.5],label:'Masuk',sub:'Zona layanan',href:'#/layanan',at:['lobi']},
    ...W.kiosk.map(k=>({pos:[k.pos[0],3.25,k.pos[2]],label:k.x.name,sub:'Lihat 360°',kind:'prod',href:'#/layanan/'+k.x.id,at:['depan']})),
    {pos:[0,4.6,-2],label:'Lorong server',sub:'Proyek',href:'#/proyek',at:['depan','media','karier','resepsi']},{pos:[-11,4.4,8.4],label:'Media wall',sub:'Wawasan',href:'#/wawasan',at:['depan','karier','resepsi']},
    {pos:[11,4.4,8.4],label:'Karier',href:'#/karier',at:['depan','media','resepsi']},{pos:[6.6,1.6,10.4],label:'Resepsionis',sub:'Kontak',href:'#/kontak',at:['depan','media','karier']},
    {pos:[0,5.2,-8],label:'Inti hologram',sub:'Layanan 360°',href:'#/layanan/agen-ai',at:['lorong']},{pos:[0,2.4,9],label:'Kembali ke depan',href:'#/layanan',at:['lorong','inti']}];
  W.picks=[{objects:()=>W.kiosk.map(k=>k.sk.mesh),hint:'Klik: buka layanan',on:h=>{const k=W.kiosk.find(k=>k.sk.mesh===h.object);if(k)location.hash='/layanan/'+k.x.id}},
    {objects:()=>[S.media.mesh],hint:'Klik: wawasan',on:()=>{location.hash='/wawasan'}},{objects:()=>[S.job.mesh],hint:'Klik: karier',on:()=>{location.hash='/karier'}},{objects:()=>[desk,S.logo.mesh],hint:'Klik: hubungi kami',on:()=>{location.hash='/kontak'}}];
}
const btn=(h,t,g)=>'<a class="wbtn'+(g?' ghost':'')+'" href="#'+h+'">'+t+'</a>';
function home(W){const h=site.home;return{st:'menara',kind:'hero',title:'Beranda',html:'<p class="wk">'+esc(h.eyebrow)+'</p><h1 class="wh big">'+h.title+'</h1><p class="wl">'+esc(h.sub)+'</p>'
  +'<div class="wrow">'+btn('/layanan','Lihat layanan')+btn('/tentang','Mulai tur',1)+'</div><div class="wrow"><button class="wtg" data-act="power" aria-pressed="'+!!W.power+'"><i></i>Daya menara: <b>'+(W.power?'Nyala':'Mati')+'</b></button></div>'
  +C.stats(site)+'<h3>Dipercaya oleh</h3><p class="wtiny">'+h.clients.map(esc).join(' · ')+' (fiktif)</p>'+h.testi.slice(0,2).map(t=>'<blockquote>“'+esc(t[0])+'” <cite>'+esc(t[1])+', '+esc(t[2])+'</cite></blockquote>').join('')
  +'<p class="wtiny">Gulir atau tekan › untuk masuk ke menara. Seret layar untuk melihat sekeliling 360°.</p>'}}
const def={site,concept,stations,tour,audio:true,noglImg:'04',
  nav:[['Beranda','/'],['Tentang','/tentang'],['Layanan','/layanan'],['Proyek','/proyek'],['Wawasan','/wawasan'],['Karier','/karier'],['Kontak','/kontak']],
  setup,
  pickAction(id,W){if(id==='holo'){W.holo=((W.holo||0)+1)%3;W.rt.actions.holo(W.holo);W.rt.actions.scan();W.sfx('cycle');return true}},

  route(r,W){const a=r.seg[0],id=r.seg[1],rt=W.rt;const holo=k=>{if(!rt)return;rt.actions.holo(k);rt.actions.scan();W.kick(1)};
    if(W.drawProj&&a!=='proyek')W.drawProj(null);if(W.drawMedia&&a!=='wawasan')W.drawMedia(null);
    if(!a)return home(W);
    if(a==='tentang')return Object.assign(C.about(site,'Lobi kaca'),{st:'lobi'});
    if(a==='layanan'&&!id)return Object.assign(C.services(site,'Zona layanan'),{st:'depan'});
    if(a==='layanan'){const o=C.service(site,id,'<p class="w360"><i></i>Seret untuk mengitari inti hologram 360°. Gulir atau cubit untuk mendekat.</p>');if(!o)return null;holo(HOLO[id]||0);return Object.assign(o,{st:'inti',orbit:{target:[0,3.3,-8],az:0,el:.08,d:3.1,dmin:2.3,dmax:3.4}})}
    if(a==='proyek'&&!id)return Object.assign(C.projects(site,r,'Lorong server'),{st:'lorong'});
    if(a==='proyek'){const x=site.projects.find(p=>p.id===id);const o=C.project(site,id,'<p class="w360"><i></i>Seret untuk mengitari inti hologram 360°. Layar kiri-kanan menampilkan hasilnya.</p>');if(!o)return null;holo(HOLO[id]||0);if(rt)rt.actions.oc(true);W.drawProj&&W.drawProj(x);return Object.assign(o,{st:'inti',orbit:{target:[0,3.3,-8],az:.35,el:.1,d:3.2,dmin:2.3,dmax:3.4},leave:()=>rt&&rt.actions.oc(false)})}
    if(a==='wawasan'&&!id)return Object.assign(C.insights(site,'Media wall'),{st:'media'});
    if(a==='wawasan'){const o=C.insight(site,id);if(!o)return null;W.drawMedia&&W.drawMedia(site.insights.find(x=>x.id===id));return Object.assign(o,{st:'media'})}
    if(a==='karier')return Object.assign(C.careers(site,'Dinding karier'),{st:'karier'});
    if(a==='kontak'||a==='faq')return Object.assign(C.contact(site,W,'Resepsionis'),{st:'resepsi'});return null},
  onArrive(id,W){if(id!=='menara'&&!W.power&&W.rt){W.power=true;W.rt.actions.power(true)}},
  act(t,e,W){if(t.dataset.act==='power'){W.power=!W.power;W.rt&&W.rt.actions.power(W.power);t.setAttribute('aria-pressed',W.power);t.querySelector('b').textContent=W.power?'Nyala':'Mati';W.sfx(W.power?'power':'off');W.kick(1.5)}}};
world(def);
