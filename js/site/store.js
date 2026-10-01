/* Penyimpanan sisi klien untuk keranjang, pesanan, dan pesan kontak. Tidak ada server: semuanya di localStorage.
   Untuk memakai backend sungguhan, ganti isi objek `api` di bawah dengan fetch ke API Anda; bentuk argumen dan hasilnya sudah dibuat sama. */
const ls={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const key=(s,n)=>'bank3d_'+n+'_'+s;
const bus=new EventTarget();
export const on=(fn)=>{bus.addEventListener('change',fn);return()=>bus.removeEventListener('change',fn)};
const emit=(s)=>bus.dispatchEvent(new CustomEvent('change',{detail:s}));
window.addEventListener('storage',e=>{if(e.key&&e.key.startsWith('bank3d_cart_'))bus.dispatchEvent(new CustomEvent('change',{detail:e.key.slice(12)}))});

export const rp=n=>'Rp '+Math.round(n).toLocaleString('id-ID');
const vkey=v=>v?Object.keys(v).sort().map(k=>k+'='+v[k]).join('|'):'';

export const cart={
  items:s=>ls.get(key(s,'cart'),[]),
  add(s,pid,variant,qty){const it=this.items(s),k=vkey(variant),f=it.find(x=>x.pid===pid&&vkey(x.variant)===k);if(f)f.qty=Math.min(99,f.qty+(qty||1));else it.push({pid,variant:variant||null,qty:qty||1});ls.set(key(s,'cart'),it);emit(s)},
  setQty(s,i,q){const it=this.items(s);if(!it[i])return;if(q<=0)it.splice(i,1);else it[i].qty=Math.min(99,q);ls.set(key(s,'cart'),it);emit(s)},
  remove(s,i){this.setQty(s,i,0)},
  clear(s){ls.set(key(s,'cart'),[]);emit(s)},
  count(s){return this.items(s).reduce((a,x)=>a+x.qty,0)},
  coupon:s=>ls.get(key(s,'coupon'),null),
  setCoupon(s,c){ls.set(key(s,'coupon'),c);emit(s)}
};
export function unitPrice(site,item){const p=site.products.find(x=>x.id===item.pid);if(!p)return 0;let v=p.price;if(item.variant&&p.variants)for(const g of p.variants){const sel=item.variant[g.key],o=g.values.find(y=>y.v===sel);if(o&&o.delta)v+=o.delta}return v}
export function totals(site,s){
  const items=cart.items(s).filter(i=>site.products.some(p=>p.id===i.pid));
  const sub=items.reduce((a,i)=>a+unitPrice(site,i)*i.qty,0);
  const cp=cart.coupon(s),def=cp&&site.coupons&&site.coupons[cp];let disc=0;
  if(def){disc=def.type==='percent'?Math.round(sub*def.value/100):Math.min(def.value,sub);if(def.max)disc=Math.min(disc,def.max);if(def.min&&sub<def.min)disc=0}
  return{items,sub,disc,coupon:disc>0?cp:null,qty:items.reduce((a,i)=>a+i.qty,0)}}
export const orders={
  list:s=>ls.get(key(s,'orders'),[]),
  add(s,o){const l=this.list(s);l.unshift(o);ls.set(key(s,'orders'),l)},
  find(s,no){return this.list(s).find(o=>o.no.toLowerCase()===String(no||'').trim().toLowerCase())}
};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
export const api={
  async submitContact(s,data){await wait(700);const l=ls.get(key(s,'msgs'),[]);const rec={id:'MSG-'+Date.now().toString(36).toUpperCase(),at:new Date().toISOString(),...data};l.unshift(rec);ls.set(key(s,'msgs'),l);return{ok:true,id:rec.id}},
  async createOrder(s,o){await wait(1100);const no=s.slice(0,3).toUpperCase()+'-'+new Date().toISOString().slice(2,10).replace(/-/g,'')+'-'+Math.floor(1000+Math.random()*9000);const rec={no,at:new Date().toISOString(),status:0,...o};orders.add(s,rec);cart.clear(s);cart.setCoupon(s,null);return{ok:true,order:rec}},
  async trackOrder(s,no){await wait(500);return orders.find(s,no)||null},
  async subscribe(s,email){await wait(400);const l=ls.get(key(s,'subs'),[]);if(!l.includes(email))l.push(email);ls.set(key(s,'subs'),l);return{ok:true}}
};
