/* Konsep volt — modul mandiri, dimuat oleh concepts/volt.html */
import {$,AC,BGU,Box,CY,Cart,Cyl,EXRLoader,EffectComposer,GTAOPass,OutputPass,RBox,Reflector,RenderPass,RoundedBoxGeometry,ST,ShaderPass,Sky,Sph,T,TG,UnrealBloomPass,V,Water,brickHF,camera,canvas,clamp,ctex,dtex,emis,envCache,fbm,floorMat,glow,glowTex,hdri,hex2,leafGeo,leafMat,leafTexture,lerp,loadHdri,makeSky,mesh,noShadow,pbr,perfHF,physM,plankHF,pmrem,reduce,renderer,ridgeHF,rnd,rng,sstep,starField,stdM,sunDir,sunLight,tagSprite,textTex,tileHF,waterNormal,weaveHF,wetFloor,windowTex} from '../core.js';
/* ==========================================================
   KONSEP 7 — VOLT : showroom mobil listrik, konfigurator langsung
   ========================================================== */
function hermite(keys,x){if(x<=keys[0][0])return keys[0][1];for(let i=0;i<keys.length-1;i++){const a=keys[i],b=keys[i+1];if(x<=b[0]){const t=(x-a[0])/(b[0]-a[0]),s=t*t*(3-2*t);return a[1]+(b[1]-a[1])*s}}return keys[keys.length-1][1]}
function loft(x0,x1,N,M,ring){
  const pos=[],idx=[];
  for(let i=0;i<=N;i++){const x=lerp(x0,x1,i/N);const r=ring(x,i/N);for(let j=0;j<M;j++)pos.push(x,r[j][1],r[j][0])}
  const c0=pos.length/3;const ring0=ring(x0,0),ring1=ring(x1,1);
  const avg=r=>[r.reduce((a,p)=>a+p[0],0)/r.length,r.reduce((a,p)=>a+p[1],0)/r.length];
  const a0=avg(ring0),a1=avg(ring1);pos.push(x0,a0[1],a0[0],x1,a1[1],a1[0]);
  for(let i=0;i<N;i++)for(let j=0;j<M;j++){const a=i*M+j,b=i*M+(j+1)%M,c=(i+1)*M+j,d=(i+1)*M+(j+1)%M;idx.push(a,c,b,b,c,d)}
  for(let j=0;j<M;j++){idx.push(c0,j,(j+1)%M);const o=N*M;idx.push(c0+1,o+(j+1)%M,o+j)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g}
const sgn=(v,p)=>Math.sign(v)*Math.pow(Math.abs(v),p);
function carBody(){
  const L=2.35,belt=[[-L,.52],[-2.1,.8],[-1.6,.9],[-.4,.95],[.9,.93],[1.5,.84],[2.0,.7],[L,.46]];
  return loft(-L,L,90,44,(x,u)=>{const top=hermite(belt,x),bot=.27+.06*Math.pow(Math.abs(x)/L,3),mid=(top+bot)/2,hh=(top-bot)/2;const nose=Math.pow(Math.max(0,1-Math.pow(Math.abs(x)/L,6)),.5);const w=.93*(1-.16*Math.pow(Math.abs(x)/L,3))*nose;const r=[];
    for(let j=0;j<44;j++){const a=j/44*Math.PI*2,c=Math.cos(a),s=Math.sin(a);let z=w*sgn(c,2/2.7),y=mid+hh*sgn(s,2/2.7);r.push([z,y])}return r})}
function carCabin(){
  const roof=[[-1.65,.9],[-1.35,1.24],[-.6,1.42],[.3,1.4],[.75,1.2],[1.08,.94]],belt=[[-2.35,.52],[-2.1,.8],[-1.6,.9],[-.4,.95],[.9,.93],[1.5,.84],[2.35,.46]];
  return loft(-1.65,1.08,60,36,(x)=>{const top=Math.max(hermite(roof,x),hermite(belt,x)+.01),bot=hermite(belt,x)-.02,mid=(top+bot)/2,hh=(top-bot)/2;const edge=Math.min(1,Math.min(x+1.65,1.08-x)*6);const r=[];
    for(let j=0;j<36;j++){const a=j/36*Math.PI*2,c=Math.cos(a),s=Math.sin(a);const t=(s+1)/2;const w=(.84-.34*Math.pow(t,1.4))*Math.pow(Math.max(edge,.001),.5);r.push([w*sgn(c,.85),mid+hh*sgn(s,.85)])}return r})}
function buildVolt(ui){
  const scene=new T.Scene();scene.background=new T.Color(0x060a14);scene.fog=new T.FogExp2(0x0a1220,.0085);
  scene.environment=hdri('studio');scene.environmentIntensity=.4;
  scene.add(starField(1200,900,1.5,true,.9));
  scene.add(new T.HemisphereLight(0x3a5a8a,0x05070c,.25));
  const moon=sunLight(0x9db8ff,.8,V(-30,60,60),50,1024);scene.add(moon);
  const LIME=new T.Color(.9,1.4,.15),limeD=0xe8ff3a;
  // plaza luar
  const plaza=wetFloor(200,120,{color:0x090c14,mix:.75,dist:.035,rep:1/16,tex:768,rough:pbr({hf:tileHF(16,.03),fx:8,fy:8,c0:0x10151e,c1:0x2a3140,nS:3,w:256}).normalMap});plaza.position.set(0,0,40);scene.add(plaza);
  const wt=windowTex(8,24,.3);
  for(let i=0;i<60;i++){const w=rnd(8,18),h=rnd(20,80),d=rnd(8,16);let x=rnd(-160,160),z=rnd(-40,-10)+(Math.random()<.5?-0:0);x=x+(x<0?-24:24);const zz=rnd(-120,-20);const t=wt.clone();t.needsUpdate=true;t.repeat.set(Math.ceil(w/14),Math.ceil(h/40));
    Box(w,h,d,new T.MeshStandardMaterial({color:0x0b1320,roughness:.25,metalness:.85,emissive:0xffffff,emissiveMap:t,emissiveIntensity:1,envMapIntensity:1}),x,h/2,zz-40,scene)}
  [-1,1].forEach(s=>{for(let z=14;z<70;z+=14){Cyl(.08,.1,9,stdM(0x1a1e26,{metalness:.7,roughness:.4}),s*22,4.5,z,scene,8);const l=new T.PointLight(0x9fc4ff,60,26,2);l.position.set(s*21,8.5,z);scene.add(l);Sph(.25,new T.MeshBasicMaterial({color:new T.Color(2,2.4,3),toneMapped:false}),s*21,8.6,z,scene,10,8).castShadow=false}});
  // fasad dan lorong
  const concrete=pbr({fx:3,fy:3,oct:4,seed:41,c0:0x14171d,c1:0x262a33,nS:.8,r0:.55,r1:.9,rep:[2,1],w:256});
  const HZ=-10;
  Box(60,16,.8,concrete,-35,8,HZ,scene);Box(60,16,.8,concrete,35,8,HZ,scene);Box(10,6,.8,concrete,0,13,HZ,scene);
  const glassM=new T.MeshPhysicalMaterial({color:0xaad0ff,transparent:true,opacity:.1,roughness:.02,metalness:0,envMapIntensity:3,clearcoat:1,depthWrite:false});
  Box(10.2,10,.06,glassM,0,5,HZ,scene).castShadow=false;
  const frame=stdM(0x0c0f16,{metalness:.9,roughness:.3});[-5,-2.5,0,2.5,5].forEach(x=>Box(.12,10,.16,frame,x,5,HZ,scene));Box(10.4,.14,.16,frame,0,10,HZ,scene);
  const sgc=canvas(1024,256),sg=sgc.getContext('2d');sg.fillStyle='#000';sg.fillRect(0,0,1024,256);sg.fillStyle='#fff';sg.font='800 190px sans-serif';sg.textAlign='center';sg.textBaseline='middle';sg.fillText('VOLT',512,140);
  const sign=mesh(new T.PlaneGeometry(10,2.5),new T.MeshBasicMaterial({map:ctex(sgc),color:new T.Color(2.4,3,.5),toneMapped:false,transparent:true,blending:T.AdditiveBlending,depthWrite:false}),0,13,HZ+.45,scene);sign.castShadow=false;
  glow(limeD,26,0,13,HZ+2,scene,.35);
  // lorong cincin cahaya
  const ringM=new T.MeshBasicMaterial({color:LIME,toneMapped:false});
  for(let z=HZ-2;z>-25;z-=1.5){const r=mesh(new T.TorusGeometry(2.8,.05,8,64),ringM,0,2.8,z,scene);r.castShadow=false}
  Box(.14,.03,14,ringM,0,.04,-17,scene).castShadow=false;
  // aula
  const HZ0=-25,HZ1=-62;
  const wallM=pbr({hf:ridgeHF(20),fx:2,fy:20,oct:3,seed:44,c0:0x07090d,c1:0x161a22,nS:1.5,r0:.4,r1:.7,rep:[6,1],metal:.3,w:256});
  const hall=new T.Group();scene.add(hall);
  Box(.4,12,40,wallM,-22,6,-42,hall);Box(.4,12,40,wallM,22,6,-42,hall);Box(44,12,.4,wallM,0,6,HZ1,hall);Box(44,.4,40,concrete,0,12,-42,hall);
  Box(44,12,.4,wallM,-22-10,6,HZ0+.2,hall);
  [-1,1].forEach(s=>{Box(19,12,.4,wallM,s*12.5,6,HZ0,hall)});
  const hfl=wetFloor(44,40,{color:0x06070b,mix:.6,dist:.012,rep:1/8,tex:1024,rough:pbr({hf:tileHF(8,.02),fx:8,fy:8,c0:0x0e1118,c1:0x222732,nS:2,w:256}).normalMap});hfl.position.set(0,.02,-42);hall.add(hfl);
  const bwc=canvas(2048,512),bw=bwc.getContext('2d');bw.fillStyle='#000';bw.fillRect(0,0,2048,512);bw.fillStyle='#fff';bw.font='800 360px sans-serif';bw.textAlign='center';bw.textBaseline='middle';bw.fillText('VOLT  E-1',1024,280);
  mesh(new T.PlaneGeometry(30,7.5),new T.MeshBasicMaterial({map:ctex(bwc),color:new T.Color(.2,.24,.3),toneMapped:false,transparent:true,blending:T.AdditiveBlending,depthWrite:false}),0,6.5,HZ1+.25,hall).castShadow=false;
  [3,5.6,8.2].forEach(y=>Box(30,.05,.05,ringM,0,y-2.2,HZ1+.3,hall).castShadow=false);
  const CX=0,CZ=-44;
  const dock=new T.Group();dock.position.set(CX,0,CZ);hall.add(dock);
  const tt=Cyl(3.6,3.7,.3,stdM(0x0d0f14,{metalness:.85,roughness:.25}),0,.15,0,dock,64);
  const ttRing=mesh(new T.TorusGeometry(3.55,.05,8,96),ringM,0,.31,0,dock);ttRing.rotation.x=Math.PI/2;ttRing.castShadow=false;
  const ceilRing=mesh(new T.TorusGeometry(4.5,.09,10,96),new T.MeshBasicMaterial({color:new T.Color(3,3.2,3.6),toneMapped:false}),0,8.6,0,dock);ceilRing.rotation.x=Math.PI/2;ceilRing.castShadow=false;
  [-1,1].forEach(s=>{const rl=new T.RectAreaLight(0xffffff,4,7,2.2);rl.position.set(s*9,4.2,CZ+1);rl.lookAt(CX,1,CZ);hall.add(rl);const b=Box(.05,2.2,7,new T.MeshBasicMaterial({color:new T.Color(.7,.75,.85),toneMapped:false}),s*9.2,4.2,CZ+1,hall);b.castShadow=false;b.rotation.y=0});
  const spot=new T.SpotLight(0xffffff,70,20,.55,.7,2);spot.position.set(CX+2,9.5,CZ+2);spot.target.position.set(CX,.8,CZ);spot.castShadow=true;spot.shadow.mapSize.set(1024,1024);spot.shadow.bias=-.0003;hall.add(spot,spot.target);
  const ug=new T.PointLight(limeD,26,8,2);ug.position.set(CX,.5,CZ);hall.add(ug);
  // mobil
  const car=new T.Group();dock.add(car);car.position.y=.3;car.scale.setScalar(1.05);
  const paints=[[0xc4102c,'Merah Api'],[0xf3f4f6,'Putih Mutiara'],[0x0a1c4a,'Biru Malam'],[0x0d3a2b,'Hijau Hutan'],[0x8a9096,'Abu Titanium']];
  const paint=new T.MeshPhysicalMaterial({color:paints[0][0],metalness:.55,roughness:.26,clearcoat:1,clearcoatRoughness:.03,envMapIntensity:1.4});
  const glassCar=new T.MeshPhysicalMaterial({color:0x05080e,metalness:.9,roughness:.05,clearcoat:1,envMapIntensity:2});
  const body=new T.Mesh(carBody(),paint);body.castShadow=body.receiveShadow=true;body.position.y=0;car.add(body);
  const cabin=new T.Mesh(carCabin(),glassCar);cabin.castShadow=true;car.add(cabin);
  const black=stdM(0x0a0b0e,{roughness:.35,metalness:.4});
  [[1.42,.87],[1.42,-.87],[-1.42,.87],[-1.42,-.87]].forEach(w=>{const arch=Cyl(.44,.44,.3,black,w[0],.36,w[1]>0?.86:-.86,car,32);arch.rotation.x=Math.PI/2});
  // roda
  const tireM=pbr({fx:30,fy:2,oct:2,c0:0x101010,c1:0x262626,nS:3,r0:.85,r1:1,rep:[16,1],w:128});
  const rimA=new T.MeshStandardMaterial({color:0xc9ced6,metalness:1,roughness:.22}),rimD=stdM(0x111317,{metalness:.9,roughness:.3});
  const wheels=[];
  [[1.42,1],[1.42,-1],[-1.42,1],[-1.42,-1]].forEach(w=>{const g=new T.Group();g.position.set(w[0],.36,w[1]*.86);const t=mesh(new T.TorusGeometry(.31,.1,20,48),tireM,0,0,0,g);
    const aero=new T.Group(),sport=new T.Group();g.add(aero,sport);
    const d=Cyl(.29,.29,.16,rimA,0,0,0,aero,40);d.rotation.x=Math.PI/2;const d2=Cyl(.18,.2,.02,rimD,0,0,w[1]*.09,aero,32);d2.rotation.x=Math.PI/2;
    const hub=Cyl(.3,.3,.05,rimD,0,0,0,sport,32);hub.rotation.x=Math.PI/2;for(let i=0;i<5;i++){const sp=Box(.28,.07,.05,rimA,0,0,w[1]*.03,sport);sp.position.set(Math.cos(i*1.2566)*.15,Math.sin(i*1.2566)*.15,w[1]*.04);sp.rotation.z=i*1.2566}
    const cal=Box(.16,.09,.04,new T.MeshStandardMaterial({color:0xd22,roughness:.4}),.12,-.05,w[1]*.07,sport);
    const rimO=mesh(new T.TorusGeometry(.29,.02,8,48),rimA,0,0,0,sport);sport.visible=false;wheels.push({g,aero,sport})});
  // lampu
  const hlM=new T.MeshBasicMaterial({color:new T.Color(.25,.25,.28),toneMapped:false}),tlM=new T.MeshBasicMaterial({color:new T.Color(1.8,.1,.1),toneMapped:false});
  const hl=Box(.06,.06,1.5,hlM,2.28,.62,0,car);hl.castShadow=false;[-1,1].forEach(s=>{const e=Box(.08,.05,.35,hlM,2.26,.6,s*.62,car);e.castShadow=false});
  const tl=Box(.06,.07,1.6,tlM,-2.3,.72,0,car);tl.castShadow=false;
  const badge=mesh(new T.PlaneGeometry(.4,.1),new T.MeshBasicMaterial({map:textTex('VOLT',256,64,{fg:'#fff'}),transparent:true,toneMapped:false,color:new T.Color(2,2.4,.6)}),2.31,.5,0,car);badge.rotation.y=Math.PI/2;badge.castShadow=false;
  const ugStrip=Box(3.6,.02,.05,ringM,0,.24,.9,car);ugStrip.castShadow=false;Box(3.6,.02,.05,ringM,0,.24,-.9,car).castShadow=false;
  const beams=[-1,1].map(s=>{const sp=new T.SpotLight(0xdfe8ff,0,26,.32,.6,2);sp.position.set(2.2,.66,s*.62);sp.target.position.set(9,.4,s*1.2);car.add(sp,sp.target);return sp});
  const cone=mesh(new T.ConeGeometry(2.2,7,24,1,true),new T.MeshBasicMaterial({color:0xbfd8ff,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,toneMapped:false}),5.6,.6,0,car);cone.rotation.z=Math.PI/2;cone.castShadow=false;
  let pi=0,spin=1,lightsOn=false,cartN=0,rot=.5;const cart=Cart(ui);
  return{scene,look:{exp:1,bloom:[.35,.7,1.05],vig:.42,grain:.02,tint:[.98,1,1.03],sat:1.08},
    setQ(q){plaza.setHigh(q>=1);hfl.setHigh(q>=1)},
    update(t,dt,cam){
      plaza.tick(t);hfl.tick(t);
      rot+=dt*.25*spin;car.rotation.y=rot;dock.rotation.y=0;
      wheels.forEach(w=>{w.g.children[0].rotation.z=0});
      const target=lightsOn?1:0;hlM.color.setScalar(lerp(.25,3.2,target));beams.forEach(b=>b.intensity=lerp(b.intensity,lightsOn?900:0,dt*6));cone.material.opacity=lerp(cone.material.opacity,lightsOn?.05:0,dt*6);
      if(cam){const ins=cam.position.z<-11;this.look.exp=ins?.8:.95}
    },
    actions:{
      paint(i){pi=i;paint.color.setHex(paints[i][0]);ui.stat('color',paints[i][1])},
      rims(v){wheels.forEach(w=>{w.aero.visible=!v;w.sport.visible=v})},
      lights(v){lightsOn=v},
      spin(v){spin=v?0:1},
      cart(){cart('VOLT E-1 '+paints[pi][1],689000000)}
    }};
}

export const concept={id:'volt',hdris:["studio"],name:'VOLT E-1',type:'E-commerce · Otomotif',acc:'#e8ff3a',build:buildVolt,
 brief:{Sektor:'Merek mobil listrik. E-commerce dengan konfigurator langsung.',Kamera:'Plaza malam menuju fasad kaca, dolly lurus di lorong cincin cahaya, lalu berhenti di tiga perempat depan mobil di atas piringan putar.',Interaksi:'Ganti warna cat lima pilihan, velg Aero atau Sport, lampu depan menyala dengan berkas cahaya, hentikan putaran, tambah ke keranjang.',Teknik:'Bodi mobil dibentuk dari penampang superellipse yang di-loft, cat dengan lapisan clearcoat, kaca gelap memantul, lampu area lunak untuk sorot cahaya di bodi, dan lantai mengilap dengan pantulan.',Varian:'Tambah pilihan interior, kamera mengitari mobil dengan seret jari, dan estimasi cicilan.'},
 slides:[
  {tag:'Bab 1 · Plaza',title:'Showroom kaca yang menyala di malam hari',text:'Kamera rendah di plaza basah. Dari luar, mobil sudah terlihat berputar pelan di ujung aula.',cam:[18,2.2,34],look:[0,4,-16]},
  {tag:'Bab 2 · Pintu',title:'Melangkah ke dalam',text:'Kamera mendekat ke pintu kaca setinggi 10 meter. Pantulan lampu jalan ikut bergeser di lantai.',cam:[3,1.7,4],look:[0,3,-22],ui:[ST('range','Jarak tempuh','620 km')]},
  {tag:'Bab 3 · Lorong cahaya',title:'Satu gerakan lurus menuju mobil',text:'Cincin lampu memberi ritme dan arah. Kamera meluncur tanpa cut sampai aula terbuka.',cam:[0,1.7,-15],look:[0,1.5,-40]},
  {tag:'Bab 4 · Aula',title:'Rakit mobil Anda sendiri',text:'Ganti cat, velg, dan lampu depan. Piringan berhenti kapan saja agar Anda bisa memeriksa satu sisi.',cam:[6.2,2.4,-36.4],look:[-4.6,-.2,-41.8],ui:[CY('paint','Warna cat',['Merah','Putih','Biru','Hijau','Titanium']),TG('rims','Velg',['Aero','Sport']),TG('lights','Lampu depan',['Mati','Nyala']),TG('spin','Putaran',['Jalan','Berhenti']),AC('cart','Tambah ke keranjang'),ST('color','Warna','Merah Api'),ST('cart','Keranjang','0 item')]}
 ]};
