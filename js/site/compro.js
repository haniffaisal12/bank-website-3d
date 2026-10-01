/* Template company profile: beranda, tentang, layanan, proyek, wawasan, karier. Kontak dan FAQ dari app.js. */
import {esc,$,$$,toast,validate,fmtDate} from './ui.js';
import {api} from './store.js';
import {ctx,img,link,pageHead} from './app.js';

export const nav=s=>[['Beranda','/'],['Tentang','/tentang'],['Layanan','/layanan'],[s.projLabel||'Proyek','/proyek'],['Wawasan','/wawasan'],['Karier','/karier']];
const sc=(s,x,i)=>'<a class="sv rv" href="#/layanan/'+x.id+'"><span class="no">0'+(i+1)+'</span><div class="sv-i">'+img(x.img,{alt:''})+'</div><h3>'+esc(x.name)+'</h3><p>'+esc(x.short)+'</p><em>Selengkapnya →</em></a>';
const pc=(s,x)=>'<a class="pj rv" href="#/proyek/'+x.id+'">'+img(x.img,{alt:x.name,pos:x.pos})+'<span><small>'+esc(x.sector)+' · '+x.year+'</small><b>'+esc(x.name)+'</b><em>'+esc(x.client)+'</em></span></a>';
const ic=(s,x)=>'<a class="ins rv" href="#/wawasan/'+x.id+'"><div class="ins-i">'+img(x.img,{alt:'',pos:x.pos})+'</div><small>'+esc(x.tag)+' · '+fmtDate(x.date)+'</small><h3>'+esc(x.title)+'</h3><p>'+esc(x.excerpt)+'</p></a>';
const cta=s=>'<section class="band"><div class="wrap"><h2>'+esc(s.cta.title)+'</h2><p>'+esc(s.cta.text)+'</p><div class="cta">'+link('/kontak',esc(s.cta.btn),'btn')+'<a class="btn ghost" href="'+ctx.base+'concepts/'+s.id+'.html">Masuk ke ruang 3D</a></div></div></section>';

function home(s){const h=s.home;return{html:'<section class="hero"><div class="hero-bg">'+img(h.heroImg,{alt:'',eager:1})+'</div><div class="wrap"><div class="hero-c"><p class="eyebrow">'+esc(h.eyebrow)+'</p><h1>'+h.title+'</h1><p class="lead">'+esc(h.sub)+'</p><div class="cta">'+link('/layanan',esc(h.cta),'btn')+'<a class="btn ghost" href="'+ctx.base+'concepts/'+s.id+'.html">Masuk ke ruang 3D</a></div></div></div></section>'
  +'<section class="stats"><div class="wrap">'+h.stats.map(x=>'<div><b data-to="'+x[0]+'" data-suf="'+esc(x[1])+'">0</b><span>'+esc(x[2])+'</span></div>').join('')+'</div></section>'
  +'<section class="sec"><div class="wrap story rv"><div class="st-i">'+img(h.intro.img,{alt:''})+'</div><div><p class="eyebrow">'+esc(h.intro.tag)+'</p><h2>'+esc(h.intro.title)+'</h2><p>'+esc(h.intro.text)+'</p>'+link('/tentang','Kenali kami →','more')+'</div></div></section>'
  +'<section class="sec alt"><div class="wrap"><div class="sh2"><h2>'+esc(s.svcTitle||'Layanan')+'</h2>'+link('/layanan','Semua layanan →','more')+'</div><div class="svs">'+s.services.map((x,i)=>sc(s,x,i)).join('')+'</div></div></section>'
  +'<section class="sec"><div class="wrap"><div class="sh2"><h2>'+esc(s.projTitle||'Proyek pilihan')+'</h2>'+link('/proyek','Semua →','more')+'</div><div class="pjs">'+s.projects.slice(0,3).map(x=>pc(s,x)).join('')+'</div></div></section>'
  +'<section class="sec alt"><div class="wrap"><p class="clients-t">Dipercaya oleh</p><div class="clients">'+h.clients.map(c=>'<span>'+esc(c)+'</span>').join('')+'</div><div class="quotes">'+h.testi.map(t=>'<blockquote class="rv"><p>“'+esc(t[0])+'”</p><footer>'+esc(t[1])+'<span>'+esc(t[2])+'</span></footer></blockquote>').join('')+'</div></div></section>'
  +'<section class="sec"><div class="wrap"><div class="sh2"><h2>Wawasan terbaru</h2>'+link('/wawasan','Semua →','more')+'</div><div class="inss">'+s.insights.slice(0,3).map(x=>ic(s,x)).join('')+'</div></div></section>'+cta(s)}}

function about(s){const a=s.about;return{title:'Tentang',html:pageHead(a.title,a.sub)+'<section class="sec"><div class="wrap story"><div class="st-i">'+img(a.img,{alt:''})+'</div><div>'+a.paras.map(p=>'<p>'+esc(p)+'</p>').join('')+'</div></div></section>'
  +'<section class="sec alt"><div class="wrap"><div class="sh2"><h2>Nilai kerja</h2></div><div class="vals">'+a.values.map(v=>'<div class="rv"><h3>'+esc(v[0])+'</h3><p>'+esc(v[1])+'</p></div>').join('')+'</div></div></section>'
  +'<section class="sec"><div class="wrap"><div class="sh2"><h2>Perjalanan</h2></div><ol class="tl2">'+a.timeline.map(t=>'<li class="rv"><b>'+t[0]+'</b><p>'+esc(t[1])+'</p></li>').join('')+'</ol></div></section>'
  +'<section class="sec alt"><div class="wrap"><div class="sh2"><h2>Tim pimpinan</h2></div><div class="team">'+a.team.map((t,i)=>'<div class="rv"><span class="av">'+t[0].split(' ').map(w=>w[0]).slice(0,2).join('')+'</span><b>'+esc(t[0])+'</b><small>'+esc(t[1])+'</small></div>').join('')+'</div></div></section>'+cta(s)}}
function services(s,r){const id=r.seg[1];
  if(!id)return{title:'Layanan',html:pageHead(s.svcTitle||'Layanan',s.svcSub)+'<section class="sec"><div class="wrap"><div class="svs">'+s.services.map((x,i)=>sc(s,x,i)).join('')+'</div></div></section>'+cta(s)};
  const x=s.services.find(v=>v.id===id);if(!x)return null;
  return{title:x.name,html:pageHead(x.name,x.short,link('/','Beranda')+' / '+link('/layanan','Layanan')+' / '+esc(x.name))+'<section class="sec"><div class="wrap story"><div class="st-i">'+img(x.img,{alt:''})+'</div><div><p>'+esc(x.desc)+'</p><ul class="ticks">'+x.points.map(p=>'<li>'+esc(p)+'</li>').join('')+'</ul></div></div></section>'
  +'<section class="sec alt"><div class="wrap"><div class="sh2"><h2>Cara kerja</h2></div><ol class="steps">'+x.steps.map((t,i)=>'<li class="rv"><span>'+(i+1)+'</span><b>'+esc(t[0])+'</b><p>'+esc(t[1])+'</p></li>').join('')+'</ol></div></section>'+cta(s)}}
function projects(s,r){const id=r.seg[1];
  if(!id){const f=r.q.get('s')||'semua',secs=['semua'].concat([...new Set(s.projects.map(p=>p.sector))]);
    return{title:s.projLabel||'Proyek',html:pageHead(s.projTitle||'Proyek',s.projSub)+'<section class="sec"><div class="wrap"><div class="chips">'+secs.map(c=>'<a class="chip'+(c===f?' on':'')+'" href="#/proyek?s='+encodeURIComponent(c)+'">'+(c==='semua'?'Semua':esc(c))+'</a>').join('')+'</div><div class="pjs">'+s.projects.filter(p=>f==='semua'||p.sector===f).map(x=>pc(s,x)).join('')+'</div></div></section>'}}
  const k=s.projects.findIndex(v=>v.id===id);if(k<0)return null;const x=s.projects[k],nx=s.projects[(k+1)%s.projects.length];
  return{title:x.name,html:'<section class="ph pj-h"><div class="hero-bg">'+img(x.img,{alt:'',pos:x.pos,eager:1})+'</div><div class="wrap"><p class="crumb">'+link('/proyek','← Semua')+'</p><p class="eyebrow">'+esc(x.sector)+' · '+x.year+'</p><h1>'+esc(x.name)+'</h1><p class="lead">'+esc(x.summary)+'</p></div></section>'
  +'<section class="sec"><div class="wrap narrow"><dl class="meta"><div><dt>Klien</dt><dd>'+esc(x.client)+'</dd></div><div><dt>Sektor</dt><dd>'+esc(x.sector)+'</dd></div><div><dt>Tahun</dt><dd>'+x.year+'</dd></div></dl><h2>Tantangan</h2><p>'+esc(x.challenge)+'</p><h2>Solusi</h2><p>'+esc(x.solution)+'</p><h2>Hasil</h2><div class="res">'+x.results.map(v=>'<div><b>'+esc(v[0])+'</b><span>'+esc(v[1])+'</span></div>').join('')+'</div><p class="hint">Angka pada studi kasus ini fiktif untuk keperluan demonstrasi.</p></div></section>'
  +'<section class="band"><div class="wrap"><h2>Berikutnya: '+esc(nx.name)+'</h2><div class="cta">'+link('/proyek/'+nx.id,'Lihat proyek','btn')+link('/kontak','Diskusikan proyek Anda','btn ghost')+'</div></div></section>'}}
function insights(s,r){const id=r.seg[1];
  if(!id)return{title:'Wawasan',html:pageHead('Wawasan','Catatan dan pandangan dari tim kami.')+'<section class="sec"><div class="wrap"><div class="inss">'+s.insights.map(x=>ic(s,x)).join('')+'</div></div></section>'};
  const x=s.insights.find(v=>v.id===id);if(!x)return null;
  return{title:x.title,html:pageHead(x.title,'',link('/wawasan','← Wawasan')+' · '+esc(x.tag)+' · '+fmtDate(x.date))+'<section class="sec"><div class="wrap narrow art"><div class="art-i">'+img(x.img,{alt:'',pos:x.pos})+'</div>'+x.body.map(p=>'<p>'+esc(p)+'</p>').join('')+'</div></section>'+cta(s)}}
function careers(s){return{title:'Karier',html:pageHead('Karier','Bergabung dengan tim '+s.brand.name+'.')+'<section class="sec"><div class="wrap narrow"><div class="jobs">'+s.jobs.map((j,i)=>'<details class="job"><summary><b>'+esc(j.title)+'</b><span>'+esc(j.place)+' · '+esc(j.type)+'</span></summary><p>'+esc(j.desc)+'</p><ul class="ticks">'+j.req.map(q=>'<li>'+esc(q)+'</li>').join('')+'</ul><a class="btn sm" href="#/kontak?topik='+encodeURIComponent('Karier: '+j.title)+'">Lamar posisi ini</a></details>').join('')+'</div><p class="hint">Tidak ada lowongan yang cocok? Kirim profil Anda lewat halaman kontak.</p></div></section>'}}
export const contactOpts=s=>({});
export function route(s,r){const a=r.seg[0];
  if(!a)return home(s);if(a==='tentang')return about(s);if(a==='layanan')return services(s,r);if(a==='proyek')return projects(s,r);if(a==='wawasan')return insights(s,r);if(a==='karier')return careers(s);return null}
