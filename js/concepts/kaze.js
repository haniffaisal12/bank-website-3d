/* Konsep kaze — modul mandiri, dimuat oleh concepts/kaze.html */
import {$,AC,BGU,Box,CY,Cart,Cyl,EXRLoader,EffectComposer,GTAOPass,OutputPass,RBox,Reflector,RenderPass,RoundedBoxGeometry,ST,ShaderPass,Sky,Sph,T,TG,UnrealBloomPass,V,Water,brickHF,camera,canvas,clamp,ctex,dtex,emis,envCache,fbm,floorMat,glow,glowTex,hdri,hex2,leafGeo,leafMat,leafTexture,lerp,loadHdri,makeSky,mesh,noShadow,pbr,perfHF,physM,plankHF,pmrem,reduce,renderer,ridgeHF,rnd,rng,sstep,starField,stdM,sunDir,sunLight,tagSprite,textTex,tileHF,waterNormal,weaveHF,wetFloor,windowTex} from '../core.js';
/* ==========================================================
   KONSEP 5 — KAZE : gang neon hujan -> toko sneaker
   ========================================================== */
function buildShoe(cw){
  const g=new T.Group(),[cu,ca,cs]=cw;
  const knit=pbr({hf:weaveHF(48),fx:3,fy:3,oct:2,c0:0x808080,c1:0xffffff,nS:2.4,r0:.75,r1:.95,rep:[3,2],w:256});
  const mU=knit.clone();mU.color=new T.Color(cu);const mA=new T.MeshPhysicalMaterial({color:ca,roughness:.35,clearcoat:.8,clearcoatRoughness:.2}),mS=pbr({fx:8,fy:8,oct:4,seed:5,c0:0x909090,c1:0xd0d0d0,nS:3,r0:.7,r1:.95,rep:[3,1],w:128});mS.color=new T.Color(cs);
  const mF=new T.MeshStandardMaterial({color:0xf4f4f0,roughness:.75,normalMap:knit.normalMap,normalScale:new T.Vector2(.6,.6)});
  // sol dari siluet kaki
  const sh=new T.Shape();sh.moveTo(-1.15,0);sh.bezierCurveTo(-1.15,.4,-.7,.42,-.35,.36);sh.bezierCurveTo(.1,.32,.5,.44,.95,.4);sh.bezierCurveTo(1.35,.36,1.35,-.36,.95,-.4);sh.bezierCurveTo(.5,-.44,.1,-.3,-.35,-.34);sh.bezierCurveTo(-.7,-.42,-1.15,-.4,-1.15,0);
  const sole=new T.Mesh(new T.ExtrudeGeometry(sh,{depth:.12,bevelEnabled:true,bevelSize:.03,bevelThickness:.03,bevelSegments:3,curveSegments:24}),mS);sole.rotation.x=-Math.PI/2;sole.position.y=0;sole.castShadow=sole.receiveShadow=true;g.add(sole);
  const mid=new T.Mesh(new T.ExtrudeGeometry(sh,{depth:.16,bevelEnabled:true,bevelSize:.035,bevelThickness:.03,bevelSegments:3,curveSegments:24}),mF);mid.rotation.x=-Math.PI/2;mid.position.y=.14;mid.scale.set(.985,.985,1);mid.castShadow=mid.receiveShadow=true;g.add(mid);
  // upper
  const ug=new T.SphereGeometry(1,56,36),up=ug.attributes.position;
  for(let i=0;i<up.count;i++){let x=up.getX(i),y=up.getY(i),z=up.getZ(i);if(y<0)y=y*.02;const xn=x;let X=xn*1.12-.02,Y=y*.5,Z=z*.36;
    const toe=Math.max(0,xn);Y*=1-.62*toe*toe;Z*=1-.22*toe;const heel=Math.max(0,-xn-.5);Y*=1+.55*heel;Z*=1-.12*heel;
    if(y>.55&&xn<-.05&&xn>-.75){Y-=(y-.55)*.55*Math.max(0,1-Math.abs(xn+.4)*3)}
    up.setXYZ(i,X,Y+.3,Z)}
  ug.computeVertexNormals();const upper=new T.Mesh(ug,mU);upper.castShadow=upper.receiveShadow=true;g.add(upper);
  const tc=new T.SphereGeometry(1,32,20),tp=tc.attributes.position;for(let i=0;i<tp.count;i++){let x=tp.getX(i),y=tp.getY(i),z=tp.getZ(i);if(y<0)y*=.02;tp.setXYZ(i,x*.48+.72,y*.2+.32,z*.34)}tc.computeVertexNormals();const toecap=new T.Mesh(tc,mA);toecap.castShadow=true;g.add(toecap);
  const hc=new T.SphereGeometry(1,24,16),hp=hc.attributes.position;for(let i=0;i<hp.count;i++){let x=hp.getX(i),y=hp.getY(i),z=hp.getZ(i);if(y<0)y*=.02;hp.setXYZ(i,x*.34-.86,y*.42+.4,z*.34)}hc.computeVertexNormals();g.add(new T.Mesh(hc,mA)).castShadow=true;
  // lubang kerah
  const hole=new T.Mesh(new T.SphereGeometry(1,20,12),new T.MeshStandardMaterial({color:0x121218,roughness:1}));hole.scale.set(.42,.16,.24);hole.position.set(-.5,.62,0);g.add(hole);
  const collar=new T.Mesh(new T.TorusGeometry(1,.09,10,32),mA);collar.scale.set(.42,.24,.25);collar.rotation.x=Math.PI/2;collar.position.set(-.5,.63,0);g.add(collar);
  const tong=RBox(.24,.5,.42,.06,mU,-.22,.7,0,g);tong.rotation.z=-.55;
  for(let i=0;i<5;i++){const x=-.15+i*.2,y=.66-i*.075;[-1,1].forEach(s=>{const e=new T.Mesh(new T.TorusGeometry(.035,.012,6,10),stdM(0xcfd4da,{metalness:.9,roughness:.3}));e.position.set(x,y+.02,s*.21);e.rotation.y=Math.PI/2;g.add(e)});
    const c=new T.CatmullRomCurve3([V(x,y,-.2),V(x+.02,y+.06,0),V(x,y,.2)]);const lc=new T.Mesh(new T.TubeGeometry(c,8,.022,6),stdM(0xffffff,{roughness:.9}));lc.castShadow=true;g.add(lc)}
  [-1,1].forEach(s=>{const sg=new T.Shape();sg.moveTo(-.5,0);sg.bezierCurveTo(-.2,.28,.3,.28,.8,.02);sg.bezierCurveTo(.3,.1,-.15,.08,-.5,0);const sw=new T.Mesh(new T.ExtrudeGeometry(sg,{depth:.02,bevelEnabled:false}),mA);sw.position.set(0,.26,s*.355);if(s<0)sw.position.z=-.375;sw.rotation.y=0;g.add(sw);sw.castShadow=true});
  // detail tambahan (pelajaran dari aset referensi: lapisan sol, alur, kerah berlapis, simpul tali, tab tumit)
  const dk=stdM(0x101014,{roughness:.8});
  const outline=sh.getPoints(72).map(p=>V(p.x*1.005,.15,-p.y*1.005));
  const gv=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(outline,true),120,.011,6,true),dk);gv.castShadow=false;g.add(gv);
  const gv2=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(outline.map(q=>V(q.x*.985,.03,q.z*.985)),true),120,.012,6,true),dk);g.add(gv2);
  for(let k=0;k<11;k++){const x=-.85+k*.17,w=Math.max(.2,.4-.22*Math.abs(x)*.3);const lug=RBox(.05,.02,w*1.55,.008,dk,x,-.005,0,g);lug.castShadow=false}
  const bowM=stdM(0xffffff,{roughness:.9});
  [-1,1].forEach(sd=>{const c=new T.CatmullRomCurve3([V(-.18,.7,0),V(-.3,.82,sd*.13),V(-.42,.8,sd*.08),V(-.26,.72,sd*.03),V(-.18,.7,0)]);const t=new T.Mesh(new T.TubeGeometry(c,16,.016,6),bowM);t.castShadow=true;g.add(t);
    const tail=new T.CatmullRomCurve3([V(-.18,.7,0),V(-.08,.62,sd*.18),V(.02,.5,sd*.25)]);g.add(new T.Mesh(new T.TubeGeometry(tail,10,.014,6),bowM))});
  const tab=RBox(.05,.24,.12,.025,mA,-1.05,.68,0,g);tab.rotation.z=.18;
  const pad=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([V(-.15,.62,-.2),V(-.5,.78,-.26),V(-.88,.8,-.2),V(-1.0,.74,0),V(-.88,.8,.2),V(-.5,.78,.26),V(-.15,.62,.2)]),40,.06,8),mU);pad.castShadow=true;g.add(pad);
  g.userData.m={mU,mA,mS};g.userData.parts={mU,mA,mS};return g}
function buildKaze(ui){
  const scene=new T.Scene();scene.background=new T.Color(0x0a0612);scene.fog=new T.FogExp2(0x100a1c,.022);
  scene.environment=hdri('city');scene.environmentIntensity=.16;
  scene.add(new T.HemisphereLight(0x4a3a8a,0x0a0812,.25));
  const pal=[[0x00e5ff,0xff2bd6],[0xff8a3d,0xff3d6e],[0x5bffb0,0x7bd2ff]];const NI=2.0;
  const neonA=[],neonB=[],nbase={A:0,B:1};
  const nMat=(k,o)=>{const m=new T.MeshBasicMaterial(Object.assign({color:new T.Color(pal[0][k]).multiplyScalar(NI),toneMapped:false},o||{}));(k?neonB:neonA).push(m);return m};
  const asph=pbr({fx:40,fy:40,oct:5,seed:15,c0:0x0c0c12,c1:0x2a2a34,nS:6,w:256});
  const street=wetFloor(18,70,{color:0x0a0a10,mix:.78,dist:.05,rep:1/6,tex:1024,rough:asph.normalMap});street.position.set(0,0,22);scene.add(street);
  const walk=pbr({hf:tileHF(3,.04),fx:8,fy:8,oct:4,seed:16,c0:0x282833,c1:0x50505e,nS:3,r0:.45,r1:.8,rep:[2,14],w:256});
  [-1,1].forEach(s=>{Box(4,.16,70,walk,s*11,.08,22,scene);Box(.3,.22,70,stdM(0x3a3a46,{roughness:.6}),s*9.1,.11,22,scene)});
  const wt=windowTex(4,12,.3,['#ffd9a0','#a0e4ff','#ff9ad8']);
  const concrete=pbr({fx:6,fy:6,oct:6,seed:17,c0:0x1a1a22,c1:0x3a3a48,nS:2.5,r0:.6,r1:.95,rep:[3,4],w:256});
  const acM=stdM(0x8a8f96,{metalness:.5,roughness:.5}),pipeM=stdM(0x3a3a44,{metalness:.7,roughness:.4});
  const labels=['RAMEN','24H','BAR','靴 SHOP','SAKE','GAME','カフェ','MAMA'];
  for(let side=-1;side<=1;side+=2)for(let z=-4;z<62;z+=9){
    const w=9,h=rnd(16,42),d=8.6;const t=wt.clone();t.needsUpdate=true;t.repeat.set(1,Math.ceil(h/24));
    const bm=concrete.clone();bm.emissive=new T.Color(0xffffff);bm.emissiveMap=t;bm.emissiveIntensity=1.1;
    Box(w,h,d,bm,side*(9+w/2+.02),h/2,z,scene);
    const isA=((z+4)/9|0)%2===0,label=labels[((z+4)/9|0)%8],face=side*9.03;
    const sm=new T.MeshBasicMaterial({map:textTex(label,512,128,{fg:'#fff',font:'800 84px sans-serif'}),transparent:true,color:new T.Color(pal[0][isA?0:1]).multiplyScalar(NI),toneMapped:false,depthWrite:false});(isA?neonA:neonB).push(sm);
    const sy=rnd(5.5,11);const sg=mesh(new T.PlaneGeometry(5,1.25),sm,face,sy,z,scene);sg.rotation.y=-side*Math.PI/2;sg.castShadow=false;
    Box(5.2,1.45,.15,stdM(0x0a0a10,{roughness:.5}),side*9.1,sy,z,scene);
    const gl=glow(pal[0][isA?0:1],11,side*8.2,sy,z,scene,.5);(isA?neonA:neonB).push(gl.material);
    const tube=nMat(isA?1:0);Box(.1,h*.9,.1,tube,side*9.05,h*.45,z-4.2,scene).castShadow=false;
    for(let k=0;k<3;k++){const ac=Box(.9,.6,.7,acM,side*9.4,rnd(4,h-3),z+rnd(-3,3),scene)}
    Cyl(.09,.09,h,pipeM,side*9.1,h/2,z+3.9,scene,8);
    const aw=Box(4.6,.08,1.7,stdM(isA?0x6a1a3a:0x1a3a6a,{roughness:.9}),side*9.9,3.5,z,scene);aw.rotation.z=side*.18;
    if(((z+4)/9|0)%3===0){const vm=Box(1,2.1,.8,stdM(0x1a1a22,{roughness:.3,metalness:.5}),side*9.6,1.15,z+3,scene);const vp=new T.MeshBasicMaterial({map:(()=>{const c=canvas(64,128),g=c.getContext('2d');for(let i=0;i<8;i++){g.fillStyle=`hsl(${i*45},80%,${55+Math.random()*20}%)`;g.fillRect(4+(i%2)*30,6+((i/2)|0)*30,26,26)}return ctex(c)})(),color:new T.Color(1.4,1.4,1.4),toneMapped:false});const vpl=mesh(new T.PlaneGeometry(.8,1.6),vp,side*9.19,1.3,z+3,scene);vpl.rotation.y=-side*Math.PI/2;vpl.castShadow=false;glow(0xaad8ff,3.5,side*8.4,1.3,z+3,scene,.35)}
    const gg=mesh(new T.PlaneGeometry(9,6),new T.MeshBasicMaterial({map:glowTex,color:new T.Color(pal[0][isA?0:1]),transparent:true,opacity:.28,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}),side*5.5,.04,z,scene);gg.rotation.x=-Math.PI/2;gg.castShadow=false;(isA?neonA:neonB).push(gg.material)}
  // kabel + lentera
  const wire=stdM(0x111118,{roughness:.6});
  for(let z=52;z>4;z-=6){const wr=Cyl(.012,.012,18,wire,0,8.4,z,scene,3);wr.rotation.z=Math.PI/2;
    for(let x=-6;x<=6;x+=4){const lm=new T.MeshStandardMaterial({color:0x4a0a0a,emissive:0xff2a1a,emissiveIntensity:2.4,roughness:.8,side:T.DoubleSide});const lg=mesh(new T.LatheGeometry([[.001,-.55],[.35,-.4],[.5,0],[.35,.4],[.05,.55]].map(p=>new T.Vector2(p[0],p[1])),20),lm,x,7.6,z,scene);lg.castShadow=false;
      Cyl(.005,.005,.8,wire,x,8.0,z,scene,3);glow(0xff4030,3.6,x,7.6,z,scene,.55)}}
  const lights=[];[[-6,6,40,0],[6,6,26,1],[-6,6,14,1],[6,6,4,0]].forEach(p=>{const l=new T.PointLight(pal[0][p[3]],140,32,2);l.position.set(p[0],p[1],p[2]);scene.add(l);lights.push([l,p[3]])});
  const redL=new T.PointLight(0xff4a30,90,26,2);redL.position.set(0,6.6,32);scene.add(redL);
  // uap
  const steamT=(()=>{const c=canvas(64,64),g=c.getContext('2d'),r=g.createRadialGradient(32,32,2,32,32,32);r.addColorStop(0,'rgba(220,220,235,.5)');r.addColorStop(1,'rgba(220,220,235,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return ctex(c,false)})();
  const steam=[];for(let i=0;i<14;i++){const s=new T.Sprite(new T.SpriteMaterial({map:steamT,transparent:true,opacity:.35,depthWrite:false,color:0xb8b0d8}));s.userData.p=i/14;scene.add(s);steam.push(s)}
  // hujan
  const RN=2200,rg=new T.BufferGeometry(),rp=new Float32Array(RN*6),rd=[];for(let i=0;i<RN;i++)rd.push([rnd(-14,14),rnd(0,26),rnd(-6,58),rnd(24,38)]);
  rg.setAttribute('position',new T.BufferAttribute(rp,3));const rain=new T.LineSegments(rg,new T.LineBasicMaterial({color:0xb9ccff,transparent:true,opacity:.3,depthWrite:false,blending:T.AdditiveBlending}));rain.frustumCulled=false;scene.add(rain);
  // toko
  const slat=pbr({hf:ridgeHF(28),fx:2,fy:28,oct:3,seed:18,c0:0x120e18,c1:0x2a2236,nS:4,r0:.4,r1:.8,rep:[4,1],w:256,metal:.2});
  const shell=stdM(0x0d0b16,{roughness:.6,metalness:.3});
  Box(.4,6,16,slat,-9,3,-16,scene);Box(.4,6,16,slat,9,3,-16,scene);Box(18.4,.4,16,concrete,0,6.2,-16,scene);Box(18.4,6,.4,slat,0,3,-24.2,scene);Box(18,14,16,concrete,0,13.4,-16,scene);
  const sfl=wetFloor(18,16,{color:0x07070c,mix:.5,dist:.02,rep:1/4,tex:768,rough:pbr({hf:tileHF(4,.03),fx:8,fy:8,c0:0x101018,c1:0x282834,nS:3,w:256}).normalMap});sfl.position.set(0,.02,-16);scene.add(sfl);
  const gm=new T.MeshPhysicalMaterial({color:0xaad8ff,transparent:true,opacity:.1,roughness:.03,metalness:0,envMapIntensity:2,clearcoat:1,depthWrite:false});
  [-5.25,5.25].forEach(x=>{const g2=Box(7.5,4.4,.06,gm,x,2.2,-8,scene);g2.castShadow=false});
  const fm=nMat(0);[-1.5,1.5].forEach(x=>Box(.1,4.6,.1,fm,x,2.3,-8,scene).castShadow=false);Box(18,.12,.12,fm,0,4.5,-8,scene).castShadow=false;
  const fasc=new T.MeshBasicMaterial({map:textTex('KAZE 風 SNEAKER LAB',1024,150,{fg:'#fff',bg:'#000',font:'800 86px sans-serif'}),color:new T.Color(pal[0][1]).multiplyScalar(NI),toneMapped:false});neonB.push(fasc);mesh(new T.PlaneGeometry(14,2),fasc,0,5.4,-7.95,scene).castShadow=false;
  const g6=glow(pal[0][1],26,0,5.2,-6,scene,.5);neonB.push(g6.material);
  const strip=nMat(1),strip2=nMat(0);
  [-6,0,6].forEach((x,i)=>Box(.14,.08,15,i===1?strip:strip2,x,6,-16,scene).castShadow=false);[-11,-15,-19,-23].forEach((z,i)=>Box(17,.08,.14,i%2?strip:strip2,0,6,z,scene).castShadow=false);
  const il=[new T.PointLight(pal[0][1],70,16,2),new T.PointLight(pal[0][0],70,16,2)];il[0].position.set(-5,4.8,-13);il[1].position.set(5,4.8,-18);il.forEach(l=>scene.add(l));
  const lc=canvas(512,160),lx=lc.getContext('2d'),ltex=ctex(lc);mesh(new T.PlaneGeometry(12,3.75),new T.MeshBasicMaterial({map:ltex,color:new T.Color(1.6,1.6,1.6),toneMapped:false}),0,3.4,-23.9,scene).castShadow=false;
  function drawLed(t){lx.fillStyle='#08060f';lx.fillRect(0,0,512,160);const g=lx.createLinearGradient(0,0,512,0);g.addColorStop(0,'#'+new T.Color(pal[0][0]).getHexString());g.addColorStop(1,'#'+new T.Color(pal[0][1]).getHexString());lx.fillStyle=g;for(let i=0;i<10;i++){lx.globalAlpha=.16;lx.fillRect(((i*70+t*60)%620)-90,0,36,160)}lx.globalAlpha=1;lx.font='800 46px sans-serif';lx.fillStyle=g;lx.textBaseline='middle';const s='NEW DROP  AIR KAZE 02  ¥18.900   ';const off=(t*90)%lx.measureText(s).width;lx.fillText(s+s,-off,80);ltex.needsUpdate=true}
  let curP=0;
  const ways=[[0xf2f2f2,0xff2bd6,0xd8d8dc,'Ghost'],[0x141420,0x00e5ff,0xe8e8ec,'Midnight'],[0xff5a2b,0xffe14a,0xd8d8dc,'Ember'],[0x7b5cff,0xffffff,0xd8d8dc,'Ultraviolet']];
  const pedM=stdM(0x15121f,{roughness:.25,metalness:.6});
  const ped=[-4.5,0,4.5].map((x,i)=>{mesh(new T.LatheGeometry([[.001,0],[1.4,0],[1.4,.15],[1.25,.2],[1.25,.95],[1.4,1]].map(p=>new T.Vector2(p[0],p[1])),40),pedM,x,0,-16,scene);
    const rm=i%2?strip:strip2;const r=mesh(new T.TorusGeometry(1.28,.035,8,64),rm,x,.98,-16,scene);r.rotation.x=Math.PI/2;r.castShadow=false;
    const s=buildShoe(ways[i]);s.position.set(x,1.12,-16);s.scale.setScalar(i===1?1.2:.95);scene.add(s);
    const sp=new T.SpotLight(0xffffff,i===1?260:170,14,.5,.6,2);sp.position.set(x,5.6,-15);sp.target.position.set(x,1,-16);sp.castShadow=i===1;sp.shadow.mapSize.set(1024,1024);sp.shadow.bias=-.0005;scene.add(sp,sp.target);return s});
  const shelfM=stdM(0x1a1626,{metalness:.5,roughness:.4}),ledS=new T.MeshBasicMaterial({color:new T.Color(2.4,2.4,2.8),toneMapped:false});
  [-1,1].forEach(sd=>[1.2,2.5,3.8].forEach(y=>{Box(.7,.06,14,shelfM,sd*8.6,y,-16,scene);Box(.05,.04,14,ledS,sd*8.32,y-.05,-16,scene).castShadow=false;
    for(let z=-10;z>=-22;z-=1.9){const s=buildShoe(ways[(Math.random()*4)|0]);s.scale.setScalar(.34);s.position.set(sd*8.5,y+.03,z);s.rotation.y=sd>0?Math.PI/2:-Math.PI/2;scene.add(s)}}));
  let wi=0,pi=0,spin=1,cartN=0;const cart=Cart(ui),prices=[1890000,2150000,1950000,2290000];
  function applyPal(){const p=pal[pi];neonA.forEach(m=>m.color.setHex(p[0]).multiplyScalar(m.isSpriteMaterial||m.blending===T.AdditiveBlending?1:NI));neonB.forEach(m=>m.color.setHex(p[1]).multiplyScalar(m.isSpriteMaterial||m.blending===T.AdditiveBlending?1:NI));lights.forEach(o=>o[0].color.setHex(p[o[1]]));il[0].color.setHex(p[1]);il[1].color.setHex(p[0])}
  applyPal();let lastL=0;
  function applyWay(){ped.forEach((s,i)=>{const c=ways[(wi+i)%4],m=s.userData.m;m.mU.color.setHex(c[0]);m.mA.color.setHex(c[1]);m.mS.color.setHex(c[2])});ui.stat('way',ways[(wi+1)%4][3])}
  setTimeout(()=>ui.stat('way',ways[1][3]),0);
  return{scene,world:{ped,ways,shelfM},pick:[{objects:()=>ped,id:'way',hint:'Klik: ganti colorway'}],look:{exp:1,bloom:[.38,.75,1.05],vig:.42,grain:.025,tint:[1,.98,1.04],sat:1.1},
    setQ(q){street.setHigh(q>=1);sfl.setHigh(q>=1)},
    update(t,dt,cam){
      street.tick(t);sfl.tick(t);
      const ra=rain.geometry.attributes.position;rain.visible=cam.position.z>-7;
      if(rain.visible){for(let i=0;i<RN;i++){const d=rd[i];d[1]-=d[3]*dt;if(d[1]<0)d[1]=26;ra.array[i*6]=d[0];ra.array[i*6+1]=d[1];ra.array[i*6+2]=d[2];ra.array[i*6+3]=d[0]+.04;ra.array[i*6+4]=d[1]+.9;ra.array[i*6+5]=d[2]}ra.needsUpdate=true}
      steam.forEach(s=>{s.userData.p=(s.userData.p+dt*.12)%1;const p=s.userData.p;s.position.set(3+Math.sin(p*6+s.id)*.5,.3+p*5,20);s.scale.setScalar(1+p*4);s.material.opacity=.35*(1-p)})
      ped.forEach((s,i)=>{s.rotation.y+=dt*.7*spin;s.position.y=1.12+Math.sin(t*1.4+i)*.03});
      if(t-lastL>.07){lastL=t;drawLed(t)}
      lights.forEach((o,i)=>{o[0].intensity=140*(1+Math.sin(t*3+i*2)*.05)});
      strip.color.copy(new T.Color(pal[pi][1]).multiplyScalar(NI*(Math.sin(t*23)>.97?.4:1)));
    },
    actions:{neon(i){pi=i;applyPal()},way(){wi=(wi+1)%4;applyWay()},spin(v){spin=v?3.2:1},cart(){cart('Air Kaze 02',prices[(wi+1)%4]);cartN++}}};
}

export const concept={id:'kaze',hdris:["city"],name:'KAZE 風',type:'E-commerce',acc:'#ff2bd6',build:buildKaze,
 brief:{Sektor:'Butik sneaker edisi terbatas. E-commerce.',Kamera:'Gang hujan sejajar tanah, dolly di bawah lentera, masuk lewat pintu kaca, berhenti di pedestal utama.',Interaksi:'Ganti palet neon (Cyber, Sunset, Jade), ganti colorway tiga sepatu sekaligus, percepat putaran 360 derajat, tambah ke keranjang.',Teknik:'Jalan basah dengan pantulan waktu nyata, neon emisif dengan bloom, lampu titik berwarna, hujan, uap, dan sepatu dengan sol ekstrusi, rajut bertekstur, dan lampu sorot berbayang.',Varian:'Tambah mode inspeksi: seret untuk memutar sepatu, atau lihat sol dari bawah.'},
 slides:[
  {tag:'Bab 1 · Gang',title:'Hujan, neon, dan satu pintu kaca di ujung',text:'Kamera menempel ke aspal. Lampu lentera menggantung di atas kepala dan papan neon memantul di jalan basah.',cam:[0,1.8,58],look:[0,6,-8]},
  {tag:'Bab 2 · Menyusuri',title:'Ganti nuansa kota dengan satu tombol',text:'Palet neon berubah untuk seluruh gang: papan, tabung, lampu, dan pantulan di jalan.',cam:[0,2.1,28],look:[0,3.6,-8],ui:[CY('neon','Palet neon',['Cyber','Sunset','Jade'])]},
  {tag:'Bab 3 · Etalase',title:'Mendekat ke papan nama toko',text:'Kamera berhenti sebentar di depan kaca, cukup dekat untuk membaca papan dan melihat pedestal dari luar.',cam:[0,1.8,3],look:[0,2.3,-14]},
  {tag:'Bab 4 · Di dalam',title:'Tiga pedestal, satu keputusan',text:'Rak dinding penuh, layar LED berjalan. Pilih colorway, percepat putaran, atau langsung ambil satu.',cam:[0,1.8,-9.6],look:[0,1.4,-17],ui:[AC('way','Ganti colorway'),TG('spin','Putaran',['Santai','Cepat']),AC('cart','Tambah ke keranjang'),ST('way','Colorway','Midnight'),ST('cart','Keranjang','0 item')]}
 ]};

/* dipakai ulang oleh situs 3D (js/world/kaze.js) */
export {buildShoe};
