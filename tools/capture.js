/* Menangkap gambar dari tiap tempat (stasiun tur) di situs 3D, untuk gambar cadangan tanpa WebGL dan pratinjau berbagi.
   Pemakaian: node tools/capture.js [id ...]   (butuh playwright + server di :8765; lihat README)
   Hasil: assets/img/<id>/NN.jpg (00, 02, 04, ... sesuai urutan tur). Untuk lingkungan tanpa CDN, set THREE_DIR ke folder paket three. */
const {chromium}=require(process.env.PW||'playwright');const fs=require('fs');const path=require('path');
const ROOT=process.cwd(),BASE=process.env.BASE||'http://localhost:8765/',THREE=process.env.THREE_DIR;
const ids=process.argv.slice(2).length?process.argv.slice(2):['nexus','aqua','serena','flora','kaze','celeste','volt','genom','kopi'];
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
async function one(id){const ctx=await b.newContext({viewport:{width:1600,height:1000}});const pg=await ctx.newPage();
 if(THREE)await pg.route('https://cdn.jsdelivr.net/npm/three@*/**',r=>{const m=new URL(r.request().url()).pathname.match(/three@[^/]+\/(.*)$/);r.fulfill({contentType:'application/javascript',body:fs.readFileSync(path.join(THREE,m[1]))})});
 await pg.route('**/fonts.g*/**',r=>r.abort());
 await pg.goto(BASE+'concepts/'+id+'.html?q=1&bare=1&instant=1#/');await pg.waitForFunction(()=>window.__worldBoot,null,{timeout:180000});await pg.waitForTimeout(5000);
 const hrefs=await pg.evaluate(()=>{const W=window.__world;return Object.values(W.S).filter(s=>s.href).map(s=>s.href)});const out=path.join(ROOT,'assets/img',id);fs.mkdirSync(out,{recursive:true});
 const tour=[...new Set(hrefs)].slice(0,5);for(let i=0;i<tour.length;i++){await pg.evaluate(h=>{location.hash=h},tour[i]);await pg.waitForTimeout(9000);
  await pg.screenshot({path:path.join(out,String(i*2).padStart(2,'0')+'.jpg'),type:'jpeg',quality:82,timeout:180000})}
 console.log(id,tour.length,'gambar');await ctx.close()}
for(const id of ids){for(let t=0;t<3;t++){try{await one(id);break}catch(e){console.log(id,'gagal, ulang',t+1,String(e.message).split('\n')[0])}}}
await b.close()})();
