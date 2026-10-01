/* Kerangka situs: shell (header/footer), tema, router berbasis hash, halaman bersama (kontak, FAQ, tentang).
   Satu berkas data per situs (js/sites/<id>.js) menentukan isi; template 'shop' dan 'compro' menentukan halamannya. */
import {esc,$,$$,toast,reveal,counters,validate} from './ui.js';
import {cart,on,api} from './store.js';
import * as shop from './shop.js';
import * as compro from './compro.js';

export const ctx={site:null,base:'../',go:null};
/* Hanya bingkai bernomor genap yang dipakai (posisi kamera di tiap slide); bingkai ganjil adalah antara-slide dan tidak disimpan. */
export const frameFile=n=>{const K=Math.ceil(ctx.site.frames/2),i=(((n||0)%K)+K)%K*2;return ctx.base+'assets/img/'+ctx.site.id+'/'+String(i).padStart(2,'0')+'.jpg'};
export const img=(n,o)=>{o=o||{};
  return '<img class="'+(o.cls||'')+'" src="'+frameFile(n)+'" alt="'+esc(o.alt||'')+'" loading="'+(o.eager?'eager':'lazy')+'" decoding="async" style="object-position:'+(o.pos||'50% 50%')+(o.zoom?';transform:scale('+o.zoom+');transform-origin:'+(o.pos||'50% 50%'):'')+(o.hue?';filter:hue-rotate('+o.hue+'deg) saturate(1.1)':'')+'">'};
export const link=(h,t,c)=>'<a href="#'+h+'"'+(c?' class="'+c+'"':'')+'>'+t+'</a>';
const tmpl=()=>ctx.site.type==='shop'?shop:compro;

function theme(s){const t=s.theme,r=document.documentElement.style;
  const m={bg:t.bg,bg2:t.bg2,ink:t.ink,mut:t.mut,acc:t.acc,line:t.line,card:t.card,'acc-ink':t.accInk||'#fff',fh:t.fh,fb:t.fb,r:t.radius||'10px'};
  for(const k in m)r.setProperty('--'+k,m[k]);document.documentElement.dataset.mode=t.mode||'dark';
  if(s.fonts){const l=document.createElement('link');l.rel='stylesheet';l.href=s.fonts;document.head.appendChild(l)}}

function shell(s){
  const nav=tmpl().nav(s);
  document.body.innerHTML='<a class="skip" href="#view">Lewati ke konten</a>'
  +(s.promo?'<div class="promo">'+esc(s.promo)+'</div>':'')
  +'<header class="sh"><div class="sh-in"><a class="logo" href="#/" aria-label="'+esc(s.brand.name)+' — beranda"><span class="lg">'+(s.brand.mark||esc(s.brand.name[0]))+'</span><span class="ln">'+esc(s.brand.name)+'</span></a>'
  +'<nav class="snav" id="snav" aria-label="Menu utama">'+nav.map(n=>'<a href="#'+n[1]+'" data-r="'+n[1]+'">'+esc(n[0])+'</a>').join('')+'<a class="d3 m" href="'+ctx.base+'concepts/'+s.id+'.html">Jelajah 3D</a></nav>'
  +'<div class="sh-act">'+(s.type==='shop'?'<button class="ic" id="bSearch" aria-label="Cari"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/></svg></button><a class="ic" href="#/keranjang" aria-label="Keranjang"><svg viewBox="0 0 24 24"><path d="M3 4h2.5l2.2 11h10.6L20.5 7H6.2"/><circle cx="9" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/></svg><b id="cBadge" hidden>0</b></a>':'<a class="btn sm" href="#/kontak">Hubungi kami</a>')
  +'<a class="d3 dsk" href="'+ctx.base+'concepts/'+s.id+'.html" title="Buka pengalaman 3D imersif">Jelajah 3D</a><button class="ic burger" id="bBurger" aria-label="Menu" aria-expanded="false" aria-controls="snav"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button></div></div>'
  +(s.type==='shop'?'<form class="sbar" id="sbar" role="search" hidden><input type="search" id="sq" placeholder="Cari produk…" aria-label="Cari produk" autocomplete="off"><button class="btn sm">Cari</button></form>':'')+'</header>'
  +'<main id="view" tabindex="-1"></main>'
  +'<footer class="sf"><div class="sf-in"><div class="sf-b"><span class="logo"><span class="lg">'+(s.brand.mark||esc(s.brand.name[0]))+'</span><span class="ln">'+esc(s.brand.name)+'</span></span><p>'+esc(s.brand.tagline)+'</p>'
  +'<form class="news" id="news" novalidate><div class="fld"><input type="email" required placeholder="Email untuk kabar terbaru" aria-label="Email"></div><button class="btn sm">Berlangganan</button></form></div>'
  +'<div><h4>Jelajah</h4>'+nav.map(n=>'<a href="#'+n[1]+'">'+esc(n[0])+'</a>').join('')+'</div>'
  +'<div><h4>Kontak</h4><p>'+esc(s.brand.address)+'</p><p>'+esc(s.brand.phone)+'</p><p>'+esc(s.brand.email)+'</p></div>'
  +'<div><h4>Bantuan</h4><a href="#/faq">Pertanyaan umum</a>'+(s.type==='shop'?'<a href="#/lacak">Lacak pesanan</a>':'<a href="#/karier">Karier</a>')+'<a href="'+ctx.base+'index.html">Bank inspirasi</a></div></div>'
  +'<p class="sf-note">© 2026 '+esc(s.brand.name)+'. Situs demonstrasi dari Bank Inspirasi 3D — merek, produk, harga, dan klien adalah fiktif. Formulir, keranjang, dan pembayaran hanya simulasi di peramban Anda.</p></footer>';
  $('#bBurger').onclick=e=>{const o=$('#snav').classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',o)};
  const bs=$('#bSearch');if(bs)bs.onclick=()=>{const b=$('#sbar');b.hidden=!b.hidden;if(!b.hidden)$('#sq').focus()};
  const sb=$('#sbar');if(sb)sb.onsubmit=e=>{e.preventDefault();location.hash='/kategori/semua?q='+encodeURIComponent($('#sq').value.trim());sb.hidden=true};
  $('#news').onsubmit=async e=>{e.preventDefault();if(!validate(e.target))return;await api.subscribe(s.id,$('input',e.target).value);e.target.reset();toast('Terima kasih, Anda sudah berlangganan.','ok')};
  const badge=()=>{const b=$('#cBadge');if(!b)return;const n=cart.count(s.id);b.textContent=n;b.hidden=!n};badge();on(e=>{if(e.detail===s.id)badge()});
}

/* ---- halaman bersama ---- */
export function pageHead(t,sub,crumb){return '<section class="ph"><div class="wrap">'+(crumb?'<p class="crumb">'+crumb+'</p>':'')+'<h1>'+esc(t)+'</h1>'+(sub?'<p class="lead">'+esc(sub)+'</p>':'')+'</div></section>'}
export function faqHTML(list){return '<div class="faq">'+list.map((q,i)=>'<details'+(i===0?' open':'')+'><summary>'+esc(q[0])+'</summary><p>'+esc(q[1])+'</p></details>').join('')+'</div>'}
export function faqPage(s){return pageHead('Pertanyaan umum','Jawaban untuk hal yang paling sering ditanyakan.')+'<section class="sec"><div class="wrap narrow">'+faqHTML(s.faq)+'<p class="more">Belum menemukan jawabannya? '+link('/kontak','Tulis ke kami')+'.</p></div></section>'}
export function contactPage(s,opts){opts=opts||{};const c=s.contact||{};
  return pageHead(opts.title||'Hubungi kami',opts.sub||c.sub||'Kami membalas dalam satu hari kerja.')+'<section class="sec"><div class="wrap split">'
  +'<form class="form" id="cForm" novalidate><div class="fld"><label for="cn">Nama</label><input id="cn" name="nama" required autocomplete="name"></div>'
  +'<div class="row2"><div class="fld"><label for="ce">Email</label><input id="ce" name="email" type="email" required autocomplete="email"></div><div class="fld"><label for="cp">Ponsel (opsional)</label><input id="cp" name="telp" inputmode="tel" data-phone autocomplete="tel"></div></div>'
  +(c.topics?'<div class="fld"><label for="ct">Topik</label><select id="ct" name="topik">'+c.topics.map(t=>'<option>'+esc(t)+'</option>').join('')+'</select></div>':'')
  +'<div class="fld"><label for="cm">Pesan</label><textarea id="cm" name="pesan" rows="5" required data-min="10"></textarea></div><button class="btn" id="cSend">Kirim pesan</button><p class="hint">Pesan disimpan di peramban ini saja (simulasi).</p></form>'
  +'<aside class="info"><h3>Kantor</h3><p>'+esc(s.brand.address)+'</p><h3>Jam layanan</h3><p>'+esc(c.hours||'Senin–Jumat, 09.00–17.00 WIB')+'</p><h3>Langsung</h3><p>'+esc(s.brand.phone)+'<br>'+esc(s.brand.email)+'</p><div class="map" role="img" aria-label="Ilustrasi peta lokasi">'+img(c.img||0,{alt:''})+'<span>'+esc(s.brand.address.split(',')[0])+'</span></div></aside></div></section>'}
function bindContact(s){const f=$('#cForm');if(!f)return;const tp=new URLSearchParams(location.hash.split('?')[1]||'').get('topik'),sel=$('#ct');if(tp&&sel){const o=document.createElement('option');o.textContent=tp;sel.prepend(o);sel.value=tp}f.onsubmit=async e=>{e.preventDefault();if(!validate(f))return;const b=$('#cSend');b.disabled=true;b.textContent='Mengirim…';const d=Object.fromEntries(new FormData(f));const r=await api.submitContact(s.id,d);
  f.outerHTML='<div class="done"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m7.5 12.5 3 3 6-7"/></svg><h3>Pesan terkirim</h3><p>Nomor referensi <b>'+r.id+'</b>. Tim '+esc(s.brand.name)+' akan membalas ke email Anda.</p></div>'}}

/* ---- router ---- */
function parse(){const h=location.hash.replace(/^#/,'')||'/';const [p,q]=h.split('?');return{path:p.replace(/\/+$/,'')||'/',seg:p.split('/').filter(Boolean),q:new URLSearchParams(q||'')}}
function render(){const s=ctx.site,r=parse(),T=tmpl();let out=null;
  if(r.path==='/faq')out={html:faqPage(s)};else if(r.path==='/kontak')out={html:contactPage(s,T.contactOpts&&T.contactOpts(s)),after:()=>bindContact(s)};
  else out=T.route(s,r);
  if(!out)out={html:pageHead('Halaman tidak ditemukan','Alamat yang Anda tuju tidak ada.')+'<section class="sec"><div class="wrap"><a class="btn" href="#/">Kembali ke beranda</a></div></section>'};
  const v=$('#view');v.innerHTML=out.html;v.classList.remove('swap');void v.offsetWidth;v.classList.add('swap');
  $$('#snav a[data-r]').forEach(a=>a.classList.toggle('on',a.dataset.r===r.path||(a.dataset.r!=='/'&&r.path.startsWith(a.dataset.r))));$('#snav').classList.remove('open');$('#bBurger').setAttribute('aria-expanded','false');
  document.title=(out.title?out.title+' · ':'')+s.brand.name;
  reveal(v);counters(v);if(out.after)out.after(v,r);
  if(!r.q.get('keep')){window.scrollTo(0,0);}v.focus({preventScroll:true})}

export function boot(site){ctx.site=site;theme(site);shell(site);
  const D=document;D.addEventListener('click',e=>{const t=e.target.closest('[data-act]');if(t&&tmpl().act)tmpl().act(site,t,e)});
  D.addEventListener('input',e=>{const r=e.target.closest&&e.target.closest('.fld.bad');if(r){r.classList.remove('bad');const m=$('.err',r);if(m)m.remove()}});
  window.addEventListener('hashchange',render);render();
  on(e=>{if(e.detail===site.id&&tmpl().refresh)tmpl().refresh(site,parse())})}
