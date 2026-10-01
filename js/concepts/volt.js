/* Konsep volt — modul mandiri, dimuat oleh concepts/volt.html */
import {loadModel,$,AC,BGU,Box,CY,Cart,Cyl,EXRLoader,EffectComposer,GTAOPass,OutputPass,RBox,Reflector,RenderPass,RoundedBoxGeometry,ST,ShaderPass,Sky,Sph,T,TG,UnrealBloomPass,V,Water,brickHF,camera,canvas,clamp,ctex,dtex,emis,envCache,fbm,floorMat,glow,glowTex,hdri,hex2,leafGeo,leafMat,leafTexture,lerp,loadHdri,makeSky,mesh,noShadow,pbr,perfHF,physM,plankHF,pmrem,reduce,renderer,ridgeHF,rnd,rng,sstep,starField,stdM,sunDir,sunLight,tagSprite,textTex,tileHF,waterNormal,weaveHF,wetFloor,windowTex} from '../core.js';
/* ==========================================================
   KONSEP 7 — VOLT : showroom mobil listrik, konfigurator langsung
   ========================================================== */
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
  const bwc=canvas(2048,512),bw=bwc.getContext('2d');bw.fillStyle='#000';bw.fillRect(0,0,2048,512);bw.fillStyle='#fff';bw.font='800 360px sans-serif';bw.textAlign='center';bw.textBaseline='middle';bw.fillText('VOLT  X1',1024,280);
  mesh(new T.PlaneGeometry(30,7.5),new T.MeshBasicMaterial({map:ctex(bwc),color:new T.Color(.2,.24,.3),toneMapped:false,transparent:true,blending:T.AdditiveBlending,depthWrite:false}),0,6.5,HZ1+.25,hall).castShadow=false;
  [3,5.6,8.2].forEach(y=>Box(30,.05,.05,ringM,0,y-2.2,HZ1+.3,hall).castShadow=false);
  const CX=0,CZ=-44;
  const dock=new T.Group();dock.position.set(CX,0,CZ);hall.add(dock);
  const tt=Cyl(3.6,3.7,.3,stdM(0x0d0f14,{metalness:.85,roughness:.25}),0,.15,0,dock,64);
  const ttRing=mesh(new T.TorusGeometry(3.55,.05,8,96),ringM,0,.31,0,dock);ttRing.rotation.x=Math.PI/2;ttRing.castShadow=false;
  const ceilRing=mesh(new T.TorusGeometry(4.5,.09,10,96),new T.MeshBasicMaterial({color:new T.Color(3,3.2,3.6),toneMapped:false}),0,8.6,0,dock);ceilRing.rotation.x=Math.PI/2;ceilRing.castShadow=false;
  [-1,1].forEach(s=>{const rl=new T.RectAreaLight(0xffffff,4,7,2.2);rl.position.set(s*9,4.2,CZ+1);rl.lookAt(CX,1,CZ);hall.add(rl)});
  const spot=new T.SpotLight(0xffffff,70,20,.55,.7,2);spot.position.set(CX+2,9.5,CZ+2);spot.target.position.set(CX,.8,CZ);spot.castShadow=true;spot.shadow.mapSize.set(1024,1024);spot.shadow.bias=-.0003;hall.add(spot,spot.target);
  const ug=new T.PointLight(limeD,6,6,2);ug.position.set(CX,.5,CZ);hall.add(ug);
  // mobil
  const car=new T.Group();dock.add(car);car.position.y=.3;car.scale.setScalar(.98);
  const paints=[[0xc4102c,'Merah Api'],[0xf3f4f6,'Putih Mutiara'],[0x0a1c4a,'Biru Malam'],[0x0d3a2b,'Hijau Hutan'],[0x8a9096,'Abu Titanium']];
  const paint=new T.MeshPhysicalMaterial({color:paints[0][0],metalness:.55,roughness:.24,clearcoat:1,clearcoatRoughness:.025,envMapIntensity:1.4});
  const hlM=new T.MeshBasicMaterial({color:new T.Color(.25,.25,.28),toneMapped:false}),tlM=new T.MeshBasicMaterial({color:new T.Color(1.8,.1,.1),toneMapped:false});
  const rimsAero=[],rimsSport=[];
  // bodi mobil dibuat di Blender (blender/volt_car_v2.py) dan dimuat sebagai glTF
  const MAP={
    Cat:paint,
    Kaca:new T.MeshPhysicalMaterial({color:0x04070c,metalness:.35,roughness:.04,clearcoat:1,envMapIntensity:2.2}),
    Karet:stdM(0x0c0c0e,{roughness:.66}),
    Velg:new T.MeshStandardMaterial({color:0xd6dae2,metalness:1,roughness:.2}),
    Krom:new T.MeshStandardMaterial({color:0xeceef2,metalness:1,roughness:.12}),
    CakramRem:new T.MeshStandardMaterial({color:0x55565a,metalness:1,roughness:.45}),
    Kaliper:new T.MeshPhysicalMaterial({color:0xc81f26,roughness:.35,clearcoat:.5}),
    HitamDoff:stdM(0x08080a,{roughness:.55}),
    Trim:new T.MeshStandardMaterial({color:0x101014,metalness:.6,roughness:.28}),
    LampuDRL:hlM,
    LampuBelakang:tlM,
    LensaLampu:new T.MeshPhysicalMaterial({color:0x06070a,roughness:.03,clearcoat:1,envMapIntensity:2}),
    Celah:new T.MeshBasicMaterial({color:0x000000}),
    Plat:stdM(0xe8e8e2,{roughness:.5}),
    Kursi:stdM(0x8a7558,{roughness:.6}),
    Layar:new T.MeshBasicMaterial({color:new T.Color(.3,.6,1)})
  };
  loadModel('volt_car').then(({scene:cm})=>{
    cm.traverse(o=>{
      if(!o.isMesh)return;
      const nm=o.material&&o.material.name;if(MAP[nm])o.material=MAP[nm];
      o.castShadow=nm!=='Celah'&&nm!=='LampuDRL';o.receiveShadow=true;
      let p=o;while(p){if(p.name&&p.name.startsWith('VelgAero_')){rimsAero.push(o);break}if(p.name&&p.name.startsWith('VelgSport_')){rimsSport.push(o);break}p=p.parent}
    });
    rimsSport.forEach(o=>o.visible=false);
    car.add(cm);scene.userData.aoDirty=true;
  }).catch(e=>console.error('volt_car',e));
  const beams=[-1,1].map(s=>{const sp=new T.SpotLight(0xdfe8ff,0,26,.32,.6,2);sp.position.set(2.2,.66,s*.62);sp.target.position.set(9,.4,s*1.2);car.add(sp,sp.target);return sp});
  const cone=mesh(new T.ConeGeometry(2.2,7,24,1,true),new T.MeshBasicMaterial({color:0xbfd8ff,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,toneMapped:false}),5.6,.6,0,car);cone.rotation.z=Math.PI/2;cone.castShadow=false;
  let pi=0,spin=1,lightsOn=false,cartN=0,rot=.5;const cart=Cart(ui);
  return{scene,world:{car,paints,paint},pick:[{objects:()=>[car],id:'paint',hint:'Klik: ganti warna cat'}],look:{exp:1,bloom:[.35,.7,1.05],vig:.42,grain:.02,tint:[.98,1,1.03],sat:1.08},
    setQ(q){plaza.setHigh(q>=1);hfl.setHigh(q>=1)},
    update(t,dt,cam){
      plaza.tick(t);hfl.tick(t);
      rot+=dt*.25*spin;car.rotation.y=rot;dock.rotation.y=0;
      const target=lightsOn?1:0;hlM.color.setScalar(lerp(.25,3.2,target));beams.forEach(b=>b.intensity=lerp(b.intensity,lightsOn?900:0,dt*6));cone.material.opacity=lerp(cone.material.opacity,lightsOn?.05:0,dt*6);
      if(cam){const ins=cam.position.z<-11;this.look.exp=ins?.8:.95}
    },
    actions:{
      paint(i){pi=i;paint.color.setHex(paints[i][0]);ui.stat('color',paints[i][1])},
      rims(v){rimsAero.forEach(o=>o.visible=!v);rimsSport.forEach(o=>o.visible=v)},
      lights(v){lightsOn=v},
      spin(v){spin=v?0:1},
      cart(){cart('VOLT X1 '+paints[pi][1],689000000)}
    }};
}

export const concept={id:'volt',hdris:["studio"],name:'VOLT X1',type:'E-commerce · Otomotif',acc:'#e8ff3a',build:buildVolt,
 brief:{Sektor:'SUV listrik. E-commerce dengan konfigurator langsung.',Kamera:'Plaza malam menuju fasad kaca, dolly lurus di lorong cincin cahaya, lalu berhenti di tiga perempat depan mobil di atas piringan putar.',Interaksi:'Ganti warna cat lima pilihan, velg Aero atau Sport, lampu depan menyala dengan berkas cahaya, hentikan putaran, tambah ke keranjang.',Teknik:'Bodi SUV dibuat di Blender (proporsi diturunkan dari model SUV besar sebagai acuan lalu diubah: hidung tertutup, atap fastback) dan dimuat sebagai glTF, cat dengan lapisan clearcoat, kaca gelap memantul, lampu area lunak untuk sorot cahaya di bodi, dan lantai mengilap dengan pantulan.',Varian:'Tambah pilihan interior, kamera mengitari mobil dengan seret jari, dan estimasi cicilan.'},
 slides:[
  {tag:'Bab 1 · Plaza',title:'Showroom kaca yang menyala di malam hari',text:'Kamera rendah di plaza basah. Dari luar, mobil sudah terlihat berputar pelan di ujung aula.',cam:[18,2.2,34],look:[0,4,-16]},
  {tag:'Bab 2 · Pintu',title:'Melangkah ke dalam',text:'Kamera mendekat ke pintu kaca setinggi 10 meter. Pantulan lampu jalan ikut bergeser di lantai.',cam:[3,1.7,4],look:[0,3,-22],ui:[ST('range','Jarak tempuh','620 km')]},
  {tag:'Bab 3 · Lorong cahaya',title:'Satu gerakan lurus menuju mobil',text:'Cincin lampu memberi ritme dan arah. Kamera meluncur tanpa cut sampai aula terbuka.',cam:[0,1.7,-15],look:[0,1.5,-40]},
  {tag:'Bab 4 · Aula',title:'Rakit mobil Anda sendiri',text:'Ganti cat, velg, dan lampu depan. Piringan berhenti kapan saja agar Anda bisa memeriksa satu sisi.',cam:[5.6,2.1,-37],look:[-3.4,.3,-42.2],ui:[CY('paint','Warna cat',['Merah','Putih','Biru','Hijau','Titanium']),TG('rims','Velg',['Aero','Sport']),TG('lights','Lampu depan',['Mati','Nyala']),TG('spin','Putaran',['Jalan','Berhenti']),AC('cart','Tambah ke keranjang'),ST('color','Warna','Merah Api'),ST('cart','Keranjang','0 item')]}
 ]};
