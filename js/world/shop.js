/* Panel e-commerce untuk situs 3D: katalog, produk, keranjang, checkout, konfirmasi, lacak, kontak, FAQ.
   Data dari js/sites/<id>.js, penyimpanan dari js/site/store.js (simulasi di localStorage; ganti `api` untuk backend sungguhan).
   Gambar produk = render model 3D-nya sendiri (W.thumb), bukan foto. */
import {esc,$,$$,stars,toast,validate,fmtDate} from '../site/ui.js';
import {cart,rp,unitPrice,totals,orders,api} from '../site/store.js';

export const P=(s,id)=>s.products.find(p=>p.id===id);
export const defVar=p=>p.variants?Object.fromEntries(p.variants.map(g=>[g.key,g.values[0].v])):null;
const rate=p=>p.rating||4.7;
const th=(W,p,vr,cls)=>'<span class="th '+(cls||'')+'"><img src="'+(W.thumb?W.thumb(p.id,vr||defVar(p)):'')+'" alt="" loading="lazy"></span>';
const vtxt=v=>v?Object.values(v).join(' · '):'';

export function catalog(s,W,r,o){o=o||{};const cat=r.q.get('k')||'semua',l=s.products.filter(p=>cat==='semua'||p.cat===cat);
  return{title:'Toko',html:'<p class="wk">'+esc(s.brand.name)+' · Toko</p><h1 class="wh">'+esc(o.title||'Rak toko')+'</h1><p class="wl">'+esc(o.sub||'Klik produk di rak, atau pilih di bawah. Setiap produk bisa diputar 360°.')+'</p>'
  +'<div class="wchips">'+['semua'].concat(s.categories.map(c=>c.id)).map(c=>'<a class="wchip'+(c===cat?' on':'')+'" href="#/toko'+(c==='semua'?'':'?k='+c)+'">'+(c==='semua'?'Semua':esc(s.categories.find(x=>x.id===c).name))+'</a>').join('')+'</div>'
  +'<div class="wgrid">'+l.map(p=>'<article class="wpc rv"><a href="#/produk/'+p.id+'">'+th(W,p)+(p.badge?'<em>'+esc(p.badge)+'</em>':'')+'</a><div><h3><a href="#/produk/'+p.id+'">'+esc(p.name)+'</a></h3><p>'+esc(p.short)+'</p><div class="wpf"><b>'+rp(p.price)+'</b><button class="wq" data-act="quick" data-pid="'+p.id+'" aria-label="Tambah '+esc(p.name)+' ke keranjang">+</button></div></div></article>').join('')+'</div>'}}

export function product(s,W,id,init){const p=P(s,id);if(!p)return null;const vr=defVar(p);if(init&&p.variants)p.variants.forEach(g=>{const v=init.get?init.get(g.key):init[g.key];if(v&&g.values.some(o=>o.v===v))vr[g.key]=v});W.sel={pid:p.id,vr,qty:1};const pr=unitPrice(s,{pid:p.id,variant:vr});
  return{title:p.name,html:'<p class="wk"><a href="#/toko">← Toko</a> · '+esc(s.categories.find(c=>c.id===p.cat).name)+'</p><h1 class="wh">'+esc(p.name)+'</h1>'
  +'<div class="wrt">'+stars(rate(p))+'<span>'+rate(p).toFixed(1)+' · '+(p.reviews||24)+' ulasan</span></div><p class="wpp"><b id="pPrice">'+rp(p.price)+'</b>'+(p.old?' <s>'+rp(p.old)+'</s>':'')+'</p>'
  +'<p class="w360"><i></i>Seret produk untuk memutar 360°, gulir atau cubit untuk mendekat.</p><p class="wl">'+esc(p.short)+'</p>'
  +(p.variants||[]).map(g=>'<fieldset class="wvar"><legend>'+esc(g.label)+': <b>'+esc(vr[g.key])+'</b></legend><div>'+g.values.map(o=>'<button type="button" class="'+(o.v===vr[g.key]?'on':'')+'" data-act="var" data-key="'+esc(g.key)+'" data-v="'+esc(o.v)+'" aria-pressed="'+(o.v===vr[g.key])+'">'+(o.sw?'<i style="background:'+o.sw+'"></i>':'')+esc(o.v)+(o.delta?' <small>+'+rp(o.delta)+'</small>':'')+'</button>').join('')+'</div></fieldset>').join('')
  +'<div class="wbuy"><div class="wqty"><button data-act="qm" aria-label="Kurangi">−</button><output id="pQty">1</output><button data-act="qp" aria-label="Tambah">+</button></div><button class="wbtn" data-act="add">Tambah ke keranjang</button><button class="wbtn ghost" data-act="buy">Beli sekarang</button></div>'
  +'<details open><summary>Deskripsi</summary><p>'+esc(p.desc)+'</p></details><details><summary>Spesifikasi</summary><table>'+p.spec.map(x=>'<tr><th>'+esc(x[0])+'</th><td>'+esc(x[1])+'</td></tr>').join('')+'</table></details>'
  +'<details><summary>Pengiriman &amp; retur</summary><p>'+esc(s.shipNote)+'</p></details>'
  +'<details><summary>Ulasan</summary>'+s.testi.map(t=>'<div class="wrev">'+stars(5)+'<p>'+esc(t[0])+'</p><small>'+esc(t[1])+' · '+esc(t[2])+'</small></div>').join('')+'</details>'}}

function lines(s,W,t,edit){return t.items.map((it,i)=>{const p=P(s,it.pid);return '<div class="wli">'+th(W,p,it.variant)+'<div><b>'+esc(p.name)+'</b>'+(it.variant?'<small>'+esc(vtxt(it.variant))+'</small>':'')+'<span>'+rp(unitPrice(s,it))+'</span></div>'
  +(edit?'<div class="wqty sm"><button data-act="cq" data-i="'+i+'" data-d="-1" aria-label="Kurangi">−</button><output>'+it.qty+'</output><button data-act="cq" data-i="'+i+'" data-d="1" aria-label="Tambah">+</button></div><button class="wx" data-act="crm" data-i="'+i+'" aria-label="Hapus '+esc(p.name)+'">×</button>':'<span class="wn">×'+it.qty+'</span>')+'</div>'}).join('')}
const shipOf=(s,t,sid)=>{const o=s.shipping.find(x=>x.id===sid)||s.shipping[0];return(s.freeShip&&t.sub-t.disc>=s.freeShip&&o.id===s.shipping[0].id)?0:o.price};
function sum(t,ship){return '<dl class="wsum"><div><dt>Subtotal ('+t.qty+')</dt><dd>'+rp(t.sub)+'</dd></div>'+(t.disc?'<div class="ok"><dt>Kupon '+esc(t.coupon)+'</dt><dd>−'+rp(t.disc)+'</dd></div>':'')+(ship!=null?'<div><dt>Ongkir</dt><dd>'+(ship?rp(ship):'Gratis')+'</dd></div>':'')+'<div class="tt"><dt>Total</dt><dd>'+rp(t.sub-t.disc+(ship||0))+'</dd></div></dl>'}

export function cartPanel(s,W){const t=totals(s,s.id);
  if(!t.items.length)return{title:'Keranjang',html:'<p class="wk">Kasir</p><h1 class="wh">Keranjang masih kosong</h1><p class="wl">Pilih kopi di rak roastery. Barang yang Anda tambahkan akan muncul di meja kasir ini.</p><a class="wbtn" href="#/toko">Ke rak toko</a>'};
  const need=s.freeShip?Math.max(0,s.freeShip-(t.sub-t.disc)):0;
  return{title:'Keranjang',html:'<p class="wk">Kasir</p><h1 class="wh">Keranjang</h1>'+(s.freeShip?'<p class="wfree'+(need?'':' ok')+'">'+(need?'Belanja '+rp(need)+' lagi untuk gratis ongkir.':'Ongkir reguler gratis.')+'</p>':'')+lines(s,W,t,true)
  +'<form class="wcpn" id="cpn"><input id="cpIn" placeholder="Kode kupon" aria-label="Kode kupon" value="'+esc(cart.coupon(s.id)||'')+'"><button class="wbtn sm ghost">Pakai</button></form><p class="wtiny">Coba: '+Object.keys(s.coupons).map(k=>'<code>'+k+'</code>').join(' ')+'</p>'
  +sum(t)+'<a class="wbtn full" href="#/checkout">Lanjut ke checkout</a>',
  after:root=>{const f=$('#cpn',root);f.onsubmit=e=>{e.preventDefault();const c=$('#cpIn').value.trim().toUpperCase();if(!c){cart.setCoupon(s.id,null);return}const d=s.coupons[c];if(!d){toast('Kode kupon tidak dikenal.','bad');return}cart.setCoupon(s.id,c);const tt=totals(s,s.id);toast(tt.disc?'Kupon dipakai.':'Belum memenuhi syarat kupon'+(d.min?' (min. '+rp(d.min)+')':'.'),tt.disc?'ok':'bad')}}}}

export function checkout(s,W){const t=totals(s,s.id);if(!t.items.length)return cartPanel(s,W);
  return{title:'Checkout',html:'<p class="wk"><a href="#/keranjang">← Keranjang</a></p><h1 class="wh">Checkout</h1><form class="wform" id="coF" novalidate>'
  +'<h3>1 · Penerima</h3><div class="fld"><label for="kn">Nama lengkap</label><input id="kn" name="nama" required autocomplete="name"></div><div class="fld"><label for="ke">Email</label><input id="ke" name="email" type="email" required autocomplete="email"></div><div class="fld"><label for="kp">Ponsel</label><input id="kp" name="telp" required data-phone inputmode="tel" autocomplete="tel"></div>'
  +'<div class="fld"><label for="ka">Alamat</label><textarea id="ka" name="alamat" rows="2" required data-min="10" autocomplete="street-address"></textarea></div><div class="w2"><div class="fld"><label for="kc">Kota</label><input id="kc" name="kota" required autocomplete="address-level2"></div><div class="fld"><label for="kz">Kode pos</label><input id="kz" name="pos" required inputmode="numeric" autocomplete="postal-code"></div></div>'
  +'<h3>2 · Pengiriman</h3>'+s.shipping.map((o,i)=>'<label class="wopt"><input type="radio" name="ship" value="'+o.id+'"'+(i?'':' checked')+'><span><b>'+esc(o.name)+'</b><em>'+esc(o.eta)+'</em></span><i data-ship="'+o.id+'"></i></label>').join('')
  +'<h3>3 · Pembayaran</h3>'+s.payments.map((o,i)=>'<label class="wopt"><input type="radio" name="pay" value="'+o.id+'"'+(i?'':' checked')+'><span><b>'+esc(o.name)+'</b><em>'+esc(o.note)+'</em></span></label>').join('')
  +'<div class="fld"><label for="kt">Catatan (opsional)</label><input id="kt" name="catatan"></div><div id="coSum"></div><button class="wbtn full" id="coGo">Buat pesanan</button><p class="wtiny">Simulasi: tidak ada pembayaran sungguhan. Data hanya tersimpan di peramban ini.</p></form>',
  after:root=>{const f=$('#coF',root),draw=()=>{const tt=totals(s,s.id);$('#coSum').innerHTML=sum(tt,shipOf(s,tt,f.ship.value));$$('[data-ship]',f).forEach(el=>{const v=shipOf(s,tt,el.dataset.ship);el.textContent=v?rp(v):'Gratis'})};f.addEventListener('change',draw);draw();
    f.onsubmit=async e=>{e.preventDefault();if(!validate(f))return;const b=$('#coGo');b.disabled=true;b.textContent='Memproses…';W.sfx('coin');const tt=totals(s,s.id),d=Object.fromEntries(new FormData(f)),ship=shipOf(s,tt,d.ship),so=s.shipping.find(x=>x.id===d.ship),po=s.payments.find(x=>x.id===d.pay);
      const res=await api.createOrder(s.id,{customer:{nama:d.nama,email:d.email,telp:d.telp,alamat:d.alamat+', '+d.kota+' '+d.pos,catatan:d.catatan},items:tt.items.map(i=>{const p=P(s,i.pid);return{pid:p.id,name:p.name,variant:i.variant,qty:i.qty,price:unitPrice(s,i)}}),shipping:{name:so.name,eta:so.eta,price:ship},payment:{id:po.id,name:po.name},sub:tt.sub,disc:tt.disc,coupon:tt.coupon,total:tt.sub-tt.disc+ship});
      location.hash='/pesanan/'+res.order.no}}}}

const STEPS=['Pesanan diterima','Pembayaran dikonfirmasi','Disangrai & dikemas','Dalam pengiriman','Tiba di tujuan'];
const stepOf=o=>Math.min(4,Math.floor((Date.now()-new Date(o.at))/30000));
const timeline=o=>{const k=stepOf(o);return '<ol class="wtl">'+STEPS.map((x,i)=>'<li class="'+(i<k?'done':i===k?'cur':'')+'"><b>'+x+'</b><small>'+(i<=k?(i===0?fmtDate(o.at):'Selesai'):'Menunggu')+'</small></li>').join('')+'</ol><p class="wtiny">Demo: status maju otomatis tiap 30 detik.</p>'};
function va(o){let h=0;for(const c of o.no)h=(h*31+c.charCodeAt(0))>>>0;return '8808'+String(h).padStart(10,'0').slice(0,10)}
export function order(s,W,no){const o=orders.find(s.id,no);if(!o)return{title:'Pesanan',html:'<h1 class="wh">Pesanan tidak ditemukan</h1><p class="wl">Nomor ini tidak ada di peramban Anda.</p><a class="wbtn" href="#/lacak">Lacak pesanan</a>'};
  const pay=o.payment.id==='cod'?'Siapkan '+rp(o.total)+' saat kurir tiba.':o.payment.id==='va'?'Transfer '+rp(o.total)+' ke virtual account <b>'+va(o)+'</b> (simulasi).':'Selesaikan pembayaran lewat '+esc(o.payment.name)+' (simulasi).';
  return{title:'Pesanan '+o.no,html:'<p class="wk">Terima kasih</p><h1 class="wh">Pesanan '+esc(o.no)+' diterima</h1><p class="wl">Konfirmasi dikirim ke '+esc(o.customer.email)+'.</p><h3>Status</h3><div id="tlBox">'+timeline(o)+'</div><h3>Pembayaran</h3><p>'+pay+'</p><h3>Barang</h3>'
  +o.items.map(i=>'<div class="wli">'+th(W,P(s,i.pid)||{id:i.pid},i.variant)+'<div><b>'+esc(i.name)+'</b><small>'+esc(vtxt(i.variant))+'</small></div><span class="wn">×'+i.qty+'</span></div>').join('')
  +'<dl class="wsum"><div class="tt"><dt>Total</dt><dd>'+rp(o.total)+'</dd></div></dl><p class="wtiny">'+esc(o.customer.nama)+' · '+esc(o.customer.alamat)+' · '+esc(o.shipping.name)+'</p><a class="wbtn ghost" href="#/toko">Belanja lagi</a>',
  after:()=>{clearInterval(window.__tl);window.__tl=setInterval(()=>{const b=$('#tlBox');if(!b){clearInterval(window.__tl);return}b.innerHTML=timeline(o)},5000)}}}
export function track(s,W,r){const no=r.q.get('no')||'';let res='';if(no){const o=orders.find(s.id,no);res=o?'<div class="wtrk"><b>'+esc(o.no)+'</b> · '+rp(o.total)+timeline(o)+'<a href="#/pesanan/'+o.no+'">Detail pesanan →</a></div>':'<p class="wbad">Nomor “'+esc(no)+'” tidak ditemukan di peramban ini.</p>'}
  const mine=orders.list(s.id).slice(0,5);
  return{title:'Lacak pesanan',html:'<p class="wk">Kasir</p><h1 class="wh">Lacak pesanan</h1><form class="wcpn" id="trF"><input name="no" required placeholder="Nomor pesanan" aria-label="Nomor pesanan" value="'+esc(no)+'"><button class="wbtn sm">Lacak</button></form>'+res
  +(mine.length?'<h3>Pesanan di perangkat ini</h3>'+mine.map(o=>'<a class="wol" href="#/pesanan/'+o.no+'"><b>'+esc(o.no)+'</b><span>'+fmtDate(o.at)+' · '+rp(o.total)+'</span></a>').join(''):''),
  after:root=>{$('#trF',root).onsubmit=e=>{e.preventDefault();const v=e.target.no.value.trim();if(v)location.hash='/lacak?no='+encodeURIComponent(v)}}}}
export function contact(s,W,where){const c=s.contact||{};
  return{title:'Kontak',html:'<p class="wk">'+esc(where||'Kontak')+'</p><h1 class="wh">Hubungi kami</h1><p class="wl">'+esc(s.brand.address)+' · '+esc(c.hours||'')+'<br>'+esc(s.brand.phone)+' · '+esc(s.brand.email)+'</p>'
  +'<form class="wform" id="cForm" novalidate><div class="fld"><label for="cn">Nama</label><input id="cn" name="nama" required autocomplete="name"></div><div class="fld"><label for="ce">Email</label><input id="ce" name="email" type="email" required autocomplete="email"></div>'
  +(c.topics?'<div class="fld"><label for="ct">Topik</label><select id="ct" name="topik">'+c.topics.map(t=>'<option>'+esc(t)+'</option>').join('')+'</select></div>':'')
  +'<div class="fld"><label for="cm">Pesan</label><textarea id="cm" name="pesan" rows="4" required data-min="10"></textarea></div><button class="wbtn full" id="cSend">Kirim pesan</button><p class="wtiny">Pesan disimpan di peramban ini saja (simulasi).</p></form>'
  +'<h3>Pertanyaan umum</h3>'+s.faq.map(q=>'<details><summary>'+esc(q[0])+'</summary><p>'+esc(q[1])+'</p></details>').join(''),
  after:root=>{const f=$('#cForm',root);f.onsubmit=async e=>{e.preventDefault();if(!validate(f))return;const b=$('#cSend');b.disabled=true;b.textContent='Mengirim…';const r=await api.submitContact(s.id,Object.fromEntries(new FormData(f)));f.outerHTML='<div class="wdone"><b>Pesan terkirim</b><p>Nomor referensi '+r.id+'. Kami membalas ke email Anda.</p></div>';W.sfx('chime')}}}}

/* aksi panel: tambah cepat, varian, jumlah, keranjang */
export function act(s,W,t){const a=t.dataset.act;
  if(a==='quick'){const p=P(s,t.dataset.pid);cart.add(s.id,p.id,defVar(p),1);toast(p.name+' masuk keranjang.','ok');W.sfx('coin')}
  else if(a==='cq'){const it=cart.items(s.id)[+t.dataset.i];if(it)cart.setQty(s.id,+t.dataset.i,it.qty+ +t.dataset.d)}
  else if(a==='crm'){cart.remove(s.id,+t.dataset.i)}
  else if(a==='var'&&W.sel){const p=P(s,W.sel.pid);W.sel.vr[t.dataset.key]=t.dataset.v;$$('button',t.parentNode).forEach(b=>{const o=b===t;b.classList.toggle('on',o);b.setAttribute('aria-pressed',o)});t.closest('fieldset').querySelector('legend b').textContent=t.dataset.v;
    $('#pPrice').textContent=rp(unitPrice(s,{pid:p.id,variant:W.sel.vr}));W.onVariant&&W.onVariant(p.id,W.sel.vr);W.sfx('cycle')}
  else if(a==='qm'||a==='qp'){if(!W.sel)return;W.sel.qty=Math.max(1,Math.min(99,W.sel.qty+(a==='qp'?1:-1)));$('#pQty').textContent=W.sel.qty}
  else if((a==='add'||a==='buy')&&W.sel){const p=P(s,W.sel.pid);cart.add(s.id,p.id,Object.assign({},W.sel.vr),W.sel.qty);W.sfx('coin');W.kick(1.2);if(a==='buy')location.hash='/checkout';else toast(W.sel.qty+' × '+p.name+' masuk keranjang.','ok')}}
export {cart,totals,rp};
