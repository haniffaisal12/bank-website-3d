/* Menangkap gambar dari adegan 3D untuk dipakai sebagai foto produk/hero di situs.
   Pemakaian: node tools/capture.js [id ...]   (butuh playwright + server di :8765; lihat README)
   Hasil: assets/img/<id>/NN.jpg. Untuk lingkungan tanpa CDN, set THREE_DIR ke folder paket three. */
const {chromium}=require(process.env.PW||'playwright');const fs=require('fs');const path=require('path');
const ROOT=process.cwd(),BASE=process.env.BASE||'http://localhost:8765/',THREE=process.env.THREE_DIR;
const ids=process.argv.slice(2).length?process.argv.slice(2):['nexus','aqua','serena','flora','kaze','celeste','volt','genom','kopi'];
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
async function one(id){const ctx=await b.newContext({viewport:{width:1600,height:1000}});const pg=await ctx.newPage();
 if(THREE)await pg.route('https://cdn.jsdelivr.net/npm/three@*/**',r=>{const m=new URL(r.request().url()).pathname.match(/three@[^/]+\/(.*)$/);r.fulfill({contentType:'application/javascript',body:fs.readFileSync(path.join(THREE,m[1]))})});
 await pg.route('**/fonts.g*/**',r=>r.abort());
 await pg.goto(BASE+'concepts/'+id+'.html?q=1&bare=1');await pg.waitForFunction(()=>window.__bankBoot,null,{timeout:120000});await pg.waitForTimeout(6000);
 const n=await pg.evaluate(()=>window.__bank.concepts[0].n-1);const out=path.join(ROOT,'assets/img',id);fs.mkdirSync(out,{recursive:true});let k=0;
 await pg.evaluate(()=>{const s=document.getElementById('scroller');s.style.scrollSnapType='none';s.style.scrollBehavior='auto'});
 for(let f=0;f<=(n-1)*2;f++){const i=f/2;await pg.evaluate(i=>window.__bank.jump(i),i);await pg.waitForTimeout(7000);
  await pg.screenshot({path:path.join(out,String(k).padStart(2,'0')+'.jpg'),type:'jpeg',quality:82,timeout:150000});k++}
 console.log(id,k,'gambar');await ctx.close()}
for(const id of ids){for(let t=0;t<3;t++){try{await one(id);break}catch(e){console.log(id,'gagal, ulang',t+1,String(e.message).split('\n')[0])}}}
await b.close()})();
