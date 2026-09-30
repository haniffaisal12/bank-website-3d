/* Konsep serena — modul mandiri, dimuat oleh concepts/serena.html */
import {loadModel,$,AC,BGU,Box,CY,Cart,Cyl,EXRLoader,EffectComposer,GTAOPass,OutputPass,RBox,Reflector,RenderPass,RoundedBoxGeometry,ST,ShaderPass,Sky,Sph,T,TG,UnrealBloomPass,V,Water,brickHF,camera,canvas,clamp,ctex,dtex,emis,envCache,fbm,floorMat,glow,glowTex,hdri,hex2,leafGeo,leafMat,leafTexture,lerp,loadHdri,makeSky,mesh,noShadow,pbr,perfHF,physM,plankHF,pmrem,reduce,renderer,ridgeHF,rnd,rng,sstep,starField,stdM,sunDir,sunLight,tagSprite,textTex,tileHF,waterNormal,weaveHF,wetFloor,windowTex} from '../core.js';
/* ==========================================================
   KONSEP 3 — SERENA : bird-eye pulau -> kamar, siang/malam
   ========================================================== */
function cloudTex(){const c=canvas(256,128),g=c.getContext('2d');for(let i=0;i<46;i++){const x=40+Math.random()*176,y=50+Math.random()*30,r=14+Math.random()*30,q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,'rgba(255,255,255,.55)');q.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=q;g.beginPath();g.arc(x,y,r,0,7);g.fill()}return ctex(c,false)}
function buildSerena(ui){
  const scene=new T.Scene(),dayBg=new T.Color(0x9cc7e6),nightBg=new T.Color(0x050a1c);
  scene.background=dayBg.clone();scene.fog=new T.FogExp2(0xa9cde6,.0022);
  const reg=[];const R=(o,prop,d,n)=>{reg.push({o,prop,d,n})};
  const sky=makeSky();scene.add(sky);const su=sky.material.uniforms;su.turbidity.value=2.2;su.rayleigh.value=2.1;su.mieCoefficient.value=.004;su.mieDirectionalG.value=.8;
  const skyEnvScene=new T.Scene();const skyClone=makeSky();skyEnvScene.add(skyClone);
  const stars=starField(1800,1200,1.6,true,1.1);stars.material.opacity=0;scene.add(stars);
  const moonMesh=new T.Mesh(new T.SphereGeometry(22,32,20),new T.MeshBasicMaterial({color:new T.Color(2.2,2.3,2.6),toneMapped:false,fog:false}));moonMesh.position.set(-380,300,-520);moonMesh.visible=false;scene.add(moonMesh);
  const moonGlow=glow(0xbcd0ff,320,-380,300,-520,scene,0);
  const clouds=[];const ct=cloudTex();for(let i=0;i<16;i++){const s=new T.Sprite(new T.SpriteMaterial({map:ct,transparent:true,opacity:.7,depthWrite:false,fog:false,color:0xffffff}));const a=rnd(0,6.28),d=rnd(500,900);s.position.set(Math.cos(a)*d,rnd(90,220),Math.sin(a)*d);s.scale.set(rnd(260,420),rnd(90,150),1);s.layers.set(1);scene.add(s);clouds.push(s);R(s.material,'opacity',.75,.05)}
  const sun=sunLight(0xfff0d6,3.4,V(60,90,50),58,3072);sun.target.position.set(0,0,18);scene.add(sun,sun.target);
  const hemi=new T.HemisphereLight(0xcfe8ff,0x8a7a5a,.35);scene.add(hemi);R(hemi,'intensity',.35,.12);
  scene.environmentIntensity=1;
  // laut + laguna
  const wn=waterNormal();wn.wrapS=wn.wrapT=T.RepeatWrapping;
  const sea=new Water(new T.PlaneGeometry(3000,3000),{textureWidth:512,textureHeight:512,waterNormals:wn,sunDirection:V(0,1,0),sunColor:0x9a9a92,waterColor:0x0b8290,distortionScale:.04,size:6,fog:true});sea.rotation.x=-Math.PI/2;sea.position.y=-.55;scene.add(sea);
  const lc=canvas(256,256),lg=lc.getContext('2d'),lgr=lg.createRadialGradient(128,128,40,128,128,128);lgr.addColorStop(0,'rgba(255,255,255,.95)');lgr.addColorStop(.62,'rgba(255,255,255,.55)');lgr.addColorStop(1,'rgba(255,255,255,0)');lg.fillStyle=lgr;lg.fillRect(0,0,256,256);
  const lagoonM=new T.MeshBasicMaterial({color:0x35e0cc,transparent:true,opacity:.55,alphaMap:ctex(lc,false),depthWrite:false,fog:true});const lagoon=new T.Mesh(new T.CircleGeometry(66,64),lagoonM);lagoon.rotation.x=-Math.PI/2;lagoon.position.set(0,-.3,26);scene.add(lagoon);R(lagoonM,'opacity',.55,.12);
  // pulau
  const CZ=26,SH=42;
  const hFn=(x,z)=>{const d=Math.hypot(x,z-CZ);let h;const t=(SH-d)/9;if(t<0)h=-1.6+t*.05;else if(t<1)h=-1.3+sstep(0,1,t)*1.5;else h=.2+Math.sin(x*.07)*.25*Math.cos(z*.06)+Math.sin(x*.19+z*.13)*.08;const flat=Math.max(sstep(16,9,Math.hypot(x*.8,(z-16)*.9)),0);return lerp(h,.06,flat*(d<38?1:0))};
  const tg=new T.PlaneGeometry(180,180,200,200);tg.rotateX(-Math.PI/2);tg.translate(0,0,CZ);const tp=tg.attributes.position,tcol=new Float32Array(tp.count*3),nz=fbm(64,64,{fx:6,fy:6,oct:4,seed:5});
  for(let i=0;i<tp.count;i++){const x=tp.getX(i),z=tp.getZ(i),h=hFn(x,z);tp.setY(i,h);const d=Math.hypot(x,z-CZ),n=nz[((Math.abs(Math.floor(z*.7))%64)*64)+(Math.abs(Math.floor(x*.7))%64)];
    const grass=sstep(.02,.32,h+(n-.5)*.5),wet=sstep(-.5,.1,h);const sand=new T.Color(0xc9b489).lerp(new T.Color(0x8a7a52),1-wet),gr=new T.Color(0x4f8a3a).lerp(new T.Color(0x86a84a),n);const c=sand.lerp(gr,grass*(d<SH-6?1:0));tcol[i*3]=c.r;tcol[i*3+1]=c.g;tcol[i*3+2]=c.b}
  tg.setAttribute('color',new T.BufferAttribute(tcol,3));tg.computeVertexNormals();
  const terrM=pbr({fx:8,fy:8,oct:6,seed:12,c0:0xc8c8c8,c1:0xffffff,nS:4,r0:.85,r1:1,rep:[70,70],w:256,mat:{vertexColors:true}});
  const terr=new T.Mesh(tg,terrM);terr.receiveShadow=true;scene.add(terr);
  const wood=pbr({hf:plankHF(6,1),fx:2,fy:30,oct:4,seed:2,c0:0x5a3d24,c1:0x9c7248,nS:1.4,r0:.45,r1:.8,rep:[1,1],w:256}),
    woodD=pbr({fx:2,fy:26,oct:4,seed:3,c0:0x3a2616,c1:0x6a4a2c,nS:3,r0:.5,r1:.8,rep:[1,4],w:256}),
    plaster=pbr({fx:8,fy:8,oct:5,seed:4,c0:0xc4bba6,c1:0xe0d7c2,nS:1,r0:.85,r1:1,rep:[3,1.4],w:256}),
    thatch=pbr({fx:2,fy:70,oct:3,seed:6,c0:0x7a5a26,c1:0xd6b060,nS:5,r0:.9,r1:1,rep:[10,3],w:256,mat:{side:T.DoubleSide}}),
    linen=pbr({hf:weaveHF(48),fx:3,fy:3,oct:2,c0:0xe4e0d6,c1:0xf7f4ec,nS:1.6,r0:.85,r1:1,rep:[3,3],w:256}),
    teal=pbr({hf:weaveHF(40),fx:3,fy:3,oct:2,c0:0x1f6f80,c1:0x3aa0ac,nS:1.6,r0:.85,r1:1,rep:[2,2],w:256}),
    mustard=pbr({hf:weaveHF(40),fx:3,fy:3,oct:2,c0:0xc08a22,c1:0xe0a83a,nS:1.6,r0:.85,r1:1,rep:[2,2],w:256}),
    rattan=pbr({hf:weaveHF(20),fx:3,fy:3,oct:2,c0:0x9a7440,c1:0xd0a464,nS:3,r0:.6,r1:.9,rep:[2,2],w:256,mat:{side:T.DoubleSide}}),
    rugM=pbr({hf:weaveHF(60),fx:4,fy:4,oct:3,c0:0xc9885a,c1:0xe8b884,nS:2,r0:.9,r1:1,rep:[1,1],w:256}),
    tileM=pbr({hf:tileHF(6,.03),fx:6,fy:6,oct:4,c0:0xcfd8d6,c1:0xeef3f0,nS:2,r0:.25,r1:.55,rep:[6,3],w:256});
  // villa utama
  const V0=new T.Group();scene.add(V0);
  const floor=Box(12.6,.3,8.6,wood,0,.15,0,V0);Box(12.6,.14,5.8,wood,0,.1,-6.9,V0);
  Box(.3,3.5,8,plaster,-6,1.9,0,V0);Box(.3,3.5,8,plaster,6,1.9,0,V0);
  Box(4.5,3.5,.3,plaster,-3.75,1.9,4,V0);Box(4.5,3.5,.3,plaster,3.75,1.9,4,V0);Box(3,.8,.3,plaster,0,3.35,4,V0);
  [-1.5,1.5].forEach(x=>Box(.16,3.4,.16,woodD,x,1.8,4.15,V0));Box(3.2,.2,.2,woodD,0,3.05,4.15,V0);
  const gm=new T.MeshPhysicalMaterial({color:0xcfeef7,transparent:true,opacity:.16,roughness:.02,metalness:0,envMapIntensity:2.2,clearcoat:1,depthWrite:false});
  Box(11.7,3.3,.05,gm,0,1.8,-4,V0).castShadow=false;for(let x=-6;x<=6;x+=2)Box(.1,3.4,.14,woodD,x,1.8,-4,V0);Box(12.3,.14,.16,woodD,0,3.45,-4,V0);Box(12.3,.14,.16,woodD,0,.3,-4,V0);
  const roof=mesh(new T.ConeGeometry(9.9,3.4,4,4,false),thatch,0,5.2,0,V0);roof.rotation.y=Math.PI/4;roof.scale.z=.72;
  for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;const rf=Box(.14,.2,6.6,woodD,Math.cos(a)*3.1*(i%2?.72:1),4.3,Math.sin(a)*2.3*(i%2?1:1),V0);rf.lookAt(0,6.8,0)}
  Box(13.6,.28,.28,woodD,0,3.6,4.3,V0);Box(13.6,.28,.28,woodD,0,3.6,-4.3,V0);
  // interior
  Cyl(1.9,1.9,.02,rugM,2.4,.32,-.6,V0,48);
  RBox(4.4,.55,3.9,.08,woodD,-2.5,.6,0,V0);RBox(.35,1.7,4.1,.06,woodD,-4.75,1.15,0,V0);
  RBox(4.1,.32,3.7,.14,linen,-2.4,1.05,0,V0);RBox(2.8,.16,3.72,.08,teal,-1.7,1.26,0,V0);RBox(.95,.1,3.74,.04,mustard,-.75,1.36,0,V0);
  [-1.2,-.4,.4,1.2].forEach((z,i)=>{const p=RBox(.85,.32,.62,.15,linen,-4.05,1.5,z*(i<2?1:1),V0);p.rotation.z=.25;p.scale.z=1});
  const lampMats=[],lampLights=[];
  [-1,1].forEach(s=>{RBox(.7,.7,.7,.04,woodD,-4.3,.65,s*2.55,V0);
    const base=mesh(new T.LatheGeometry([[.001,0],[.14,0],[.16,.05],[.08,.3],[.06,.5],[.05,.52]].map(p=>new T.Vector2(p[0],p[1])),20),stdM(0xd8c9a8,{roughness:.3,metalness:.5}),-4.3,1.0,s*2.55,V0);
    const lm=new T.MeshStandardMaterial({color:0xe8d8b0,emissive:0xffb060,emissiveIntensity:.05,roughness:.9,side:T.DoubleSide});const sh=mesh(new T.LatheGeometry([[.13,0],[.24,.32]].map(p=>new T.Vector2(p[0],p[1])),24),lm,-4.3,1.48,s*2.55,V0);sh.castShadow=false;R(lm,'emissiveIntensity',.05,2.2);
    const l=new T.PointLight(0xffb870,0,9,2);l.position.set(-4.1,1.9,s*2.55);V0.add(l);R(l,'intensity',0,14)});
  const fan=new T.Group();fan.position.set(2.2,3.55,-.4);V0.add(fan);Cyl(.04,.04,1.1,woodD,0,.5,0,fan,8);Cyl(.2,.2,.14,woodD,0,-.05,0,fan,16);for(let i=0;i<4;i++){const a=new T.Group();a.rotation.y=i*Math.PI/2;const b=Box(1.5,.03,.28,rattan,.95,-.06,0,a);b.rotation.z=.06;fan.add(a)}
  [[.9,-1.2],[3.4,-1.6]].forEach((p,i)=>{const px=p[0]+1.4;Cyl(.008,.008,1.1,woodD,px,3.0,p[1],V0,4);
    const pm=new T.MeshStandardMaterial({color:0xe6c890,emissive:0xffa850,emissiveIntensity:.15,roughness:.9,side:T.DoubleSide,map:rattan.map,normalMap:rattan.normalMap});const ps=mesh(new T.LatheGeometry([[.001,-.35],[.3,-.2],[.42,0],[.3,.2],[.08,.35]].map(q=>new T.Vector2(q[0],q[1])),28),pm,px,2.35,p[1],V0);ps.castShadow=false;R(pm,'emissiveIntensity',.15,2.6);
    const l=new T.PointLight(0xffb060,0,9,2);l.position.set(px,2.3,p[1]);V0.add(l);R(l,'intensity',0,22)});
  const egg=mesh(new T.SphereGeometry(.9,32,20,0,Math.PI*2,0,Math.PI*.72),rattan,3.9,1.1,-2.2,V0);egg.rotation.set(Math.PI*.98,0,.2);egg.scale.set(1,1.05,.9);
  RBox(.8,.2,.8,.08,teal,3.9,.85,-2.2,V0);Cyl(.02,.02,2,woodD,3.9,2.5,-2.2,V0,5);
  Cyl(.6,.6,.06,woodD,2.6,.95,-2.1,V0,30);Cyl(.05,.08,.65,woodD,2.6,.6,-2.1,V0,8);
  const vase=mesh(new T.LatheGeometry([[.001,0],[.16,0],[.22,.3],[.12,.6],[.1,.7],[.14,.78]].map(q=>new T.Vector2(q[0],q[1])),24),stdM(0xf0eadf,{roughness:.3}),5.2,.3,-3.4,V0);
  const fg=leafGeo(.6,1.5,2,8,.5),fm=leafMat('ficus',3);for(let i=0;i<9;i++){const l=new T.Mesh(fg,fm);l.position.set(5.2,1.0,-3.4);l.rotation.set(rnd(.1,.6),i*.7,0);l.rotation.z=rnd(-.3,.3);l.castShadow=true;V0.add(l)}
  const art=canvas(256,160),ag=art.getContext('2d'),agr=ag.createLinearGradient(0,0,0,160);agr.addColorStop(0,'#ffb26a');agr.addColorStop(.55,'#ff6a5a');agr.addColorStop(1,'#1b5c78');ag.fillStyle=agr;ag.fillRect(0,0,256,160);ag.fillStyle='#ffe8b0';ag.beginPath();ag.arc(128,84,22,0,7);ag.fill();ag.fillStyle='#0c3448';ag.fillRect(0,100,256,60);
  mesh(new T.PlaneGeometry(2.4,1.5),stdM(0xffffff,{map:ctex(art),roughness:.7}),0,2.1,3.82,V0).rotation.y=Math.PI;Box(2.55,1.65,.05,woodD,0,2.1,3.85,V0);
  [-2,2].forEach(s=>{const cg=new T.PlaneGeometry(2,3.2,30,1);const cp=cg.attributes.position;for(let i=0;i<cp.count;i++)cp.setZ(i,Math.sin(cp.getX(i)*9)*.09);cg.computeVertexNormals();const cur=new T.Mesh(cg,new T.MeshStandardMaterial({map:linen.map,normalMap:linen.normalMap,roughness:.95,side:T.DoubleSide,transparent:true,opacity:.92}));cur.position.set(s*4.2,1.9,-3.85);cur.castShadow=true;V0.add(cur)});
  const vl=new T.PointLight(0xffcf9a,0,16,2);vl.position.set(0,3,0);V0.add(vl);R(vl,'intensity',0,10);
  // lampu gantung kuningan (Chandelier 03, hasil studi aset Blender) — dimuat di latar belakang
  loadModel('chandelier_03').then(({scene:cm,meta})=>{
    const K=1.5,brass=new T.MeshPhysicalMaterial({color:0xd4a24a,metalness:1,roughness:.26,clearcoat:.15,envMapIntensity:1.3}),
      glass=new T.MeshPhysicalMaterial({color:0xf2f7ff,metalness:0,roughness:.03,transparent:true,opacity:.3,ior:1.5,envMapIntensity:3,depthWrite:false,side:T.DoubleSide});
    cm.traverse(o=>{if(!o.isMesh)return;const isGlass=/glass/i.test(o.material.name);o.material=isGlass?glass:brass;o.castShadow=!isGlass;o.receiveShadow=true});
    const g=new T.Group();g.add(cm);g.scale.setScalar(K);g.position.set(-1.7,4.3,.3);V0.add(g);const rope=Cyl(.012,.012,2.4,woodD,-1.7,5.5,.3,V0,6);rope.castShadow=false;
    (meta.tips||[]).forEach(p=>{const gl=glow(0xffb45c,.34,p[0],p[1],p[2],g,0);R(gl.material,'opacity',0,.95)});
    const cl=new T.PointLight(0xffb870,0,10,2);cl.position.set(0,-.5,0);g.add(cl);R(cl,'intensity',0,26);scene.userData.aoDirty=true;
  }).catch(()=>{});
  // dek
  [-1,1].forEach(s=>Box(.1,.9,5.6,woodD,s*6.2,.7,-6.9,V0));Box(12.6,.1,.1,woodD,0,1.15,-9.8,V0);
  [-2.4,2.4].forEach(x=>{RBox(1.4,.3,3,.08,linen,x,.6,-7.2,V0);Box(1.5,.08,3.2,woodD,x,.4,-7.2,V0)});
  for(let i=0;i<14;i++){const x=-6+i*12/13,y=3.2-Math.sin(i/13*Math.PI)*.5;const bm=new T.MeshStandardMaterial({color:0x221100,emissive:0xffc060,emissiveIntensity:.15});Sph(.09,bm,x,y,-9.7,V0,12,8).castShadow=false;R(bm,'emissiveIntensity',.15,4);const gl=glow(0xffc670,1.3,x,y,-9.7,V0,0);R(gl.material,'opacity',0,.7)}
  // kolam
  const poolWater=new T.MeshPhysicalMaterial({color:0x3fd8dc,transparent:true,opacity:.82,roughness:.05,metalness:0,envMapIntensity:1.6,clearcoat:1,normalMap:wn.clone(),normalScale:new T.Vector2(.25,.25),emissive:0x0aa0b0,emissiveIntensity:.15});poolWater.normalMap.repeat.set(8,4);poolWater.normalMap.needsUpdate=true;
  const pw=mesh(new T.PlaneGeometry(16,8),poolWater,0,.03,20,scene);pw.rotation.x=-Math.PI/2;pw.castShadow=false;R(poolWater,'emissiveIntensity',.15,1.3);
  Box(16,.05,8,tileM,0,-.6,20,scene);Box(16.8,.3,.4,tileM,0,.15,15.8,scene);Box(16.8,.3,.4,tileM,0,.15,24.2,scene);Box(.4,.3,8.4,tileM,-8.2,.15,20,scene);Box(.4,.3,8.4,tileM,8.2,.15,20,scene);
  const pl2=new T.PointLight(0x40e0f0,0,18,2);pl2.position.set(0,-.3,20);scene.add(pl2);R(pl2,'intensity',0,40);
  for(let i=0;i<4;i++){const x=-6+i*4;RBox(1,.32,2.3,.06,linen,x,.5,27.5,scene);Box(1.1,.1,2.4,woodD,x,.3,27.5,scene)}
  [-9,9].forEach(x=>{Cyl(.04,.04,2.6,woodD,x,1.3,26.5,scene,6);const um=mesh(new T.ConeGeometry(1.8,.7,16,1,true),new T.MeshStandardMaterial({map:linen.map,color:0xf3e4c8,side:T.DoubleSide,roughness:.9}),x,2.7,26.5,scene)});
  // jalan batu
  for(let i=0;i<8;i++)mesh(new T.CylinderGeometry(.5,.55,.08,16),plaster,rnd(-.3,.3),.05,6+i*1.2,scene);
  // obor
  const flames=[];[[-3,10],[3,10],[-7,-10.5],[7,-10.5]].forEach(p=>{Cyl(.05,.07,1.7,woodD,p[0],.85,p[1],scene,8);const fm2=new T.MeshBasicMaterial({color:new T.Color(3,1.4,.4),toneMapped:false,transparent:true,opacity:0});const f=Sph(.13,fm2,p[0],1.85,p[1],scene,12,8);f.scale.y=1.8;f.castShadow=false;R(fm2,'opacity',0,.95);const l=new T.PointLight(0xff9a40,0,10,2);l.position.set(p[0],2,p[1]);scene.add(l);R(l,'intensity',0,12);flames.push([f,l]);const gl=glow(0xff8a30,2.6,p[0],1.9,p[1],scene,0);R(gl.material,'opacity',0,.8)});
  // villa lain
  [[-22,20],[22,17],[-27,40],[-8,47],[14,42],[29,33],[-31,27],[30,52]].forEach(p=>{const g=new T.Group();g.position.set(p[0],hFn(p[0],p[1]),p[1]);g.rotation.y=Math.atan2(-p[0],-p[1]+26)+Math.PI;scene.add(g);
    Box(7,3,6,plaster,0,1.5,0,g);const rf=mesh(new T.ConeGeometry(6.2,2.8,4,3),thatch,0,4.4,0,g);rf.rotation.y=Math.PI/4;rf.scale.z=.86;
    const wm=new T.MeshStandardMaterial({color:0x332211,emissive:0xffb050,emissiveIntensity:.05});Box(2,1.4,.1,wm,0,1.6,3.05,g);R(wm,'emissiveIntensity',.05,2.4);Box(2.4,.15,.2,woodD,0,2.4,3.1,g);
    const dl=new T.PointLight(0xffb060,0,8,2);dl.position.set(0,1.6,4);g.add(dl);R(dl,'intensity',0,10)});
  // palem
  const fGeo=leafGeo(1.5,4.6,3,12,.5),fMat=leafMat('frond',2,{roughness:.7});
  const palmSpots=[];for(let i=0;i<34;i++){let x,z,ok=false,n=0;while(!ok&&n++<50){const a=rnd(0,6.28),r=rnd(10,38);x=Math.cos(a)*r;z=CZ+Math.sin(a)*r;const hh=hFn(x,z);ok=hh>.05&&!(Math.abs(x)<10&&z<8)&&!(Math.abs(x)<9&&z>=8&&z<28)}palmSpots.push([x,z])}
  const frondI=new T.InstancedMesh(fGeo,fMat,palmSpots.length*10);frondI.castShadow=true;frondI.frustumCulled=false;let fi=0;const dm=new T.Object3D(),palmRot=[];
  const trunkM=pbr({fx:1,fy:14,oct:3,seed:9,c0:0x5a4630,c1:0x8a7250,nS:6,r0:.8,r1:1,rep:[1,4],w:256});
  palmSpots.forEach(sp=>{const h=rnd(5.5,9),bend=rnd(-1.2,1.2),by=hFn(sp[0],sp[1]);const cv=new T.QuadraticBezierCurve3(V(sp[0],by,sp[1]),V(sp[0]+bend*.3,by+h*.55,sp[1]),V(sp[0]+bend,by+h,sp[1]+bend*.3));
    const tg2=new T.TubeGeometry(cv,14,.24,10,false);const p=tg2.attributes.position;const tm=new T.Mesh(tg2,trunkM);tm.castShadow=tm.receiveShadow=true;scene.add(tm);
    const top=cv.getPoint(1);for(let k=0;k<10;k++){dm.position.copy(top);dm.rotation.set(0,k*Math.PI*2/10+rnd(-.2,.2),0);dm.rotateX(-1.05+rnd(-.25,.25));dm.scale.setScalar(rnd(.85,1.15));dm.updateMatrix();frondI.setMatrixAt(fi++,dm.matrix)}
    for(let k=0;k<3;k++)Sph(.2,stdM(0x5a3a22,{roughness:.6}),top.x+rnd(-.3,.3),top.y-.35,top.z+rnd(-.3,.3),scene,10,8)});
  scene.add(frondI);
  // semak hibiscus
  const bushM=leafMat('ficus',5),bg2=leafGeo(.5,.8,1,4,.4);for(let i=0;i<40;i++){let x=rnd(-30,30),z=rnd(-8,60);if(hFn(x,z)<.1||(Math.abs(x)<10&&z<30&&z>-8))continue;const g=new T.Group();g.position.set(x,hFn(x,z),z);for(let k=0;k<10;k++){const l=new T.Mesh(bg2,bushM);l.rotation.set(rnd(.3,1.2),k*.65,0);l.scale.setScalar(rnd(.8,1.5));g.add(l)}
    if(i%2){for(let k=0;k<4;k++)Sph(.09,new T.MeshBasicMaterial({color:new T.Color(2.2,.4,.5),toneMapped:false}),rnd(-.4,.4),rnd(.3,.7),rnd(-.4,.4),g,8,6)}scene.add(g)}
  // dermaga
  const dock=pbr({hf:plankHF(1,10),fx:2,fy:2,oct:3,c0:0x5f472f,c1:0x8f7350,nS:3,r0:.7,r1:1,rep:[1,14],w:256});
  Box(2.4,.3,34,dock,16,.1,-24,scene);for(let z=-10;z>-40;z-=4)[-1,1].forEach(s=>Cyl(.13,.15,3,woodD,16+s*1.1,-1.2,z,scene,8));
  [[11.5,-37],[20.5,-37],[11.5,-27],[20.5,-27]].forEach(p=>{const g=new T.Group();g.position.set(p[0],0,p[1]);scene.add(g);Box(6,.3,6,dock,0,.1,0,g);Box(5,2.7,5,plaster,0,1.55,0,g);const rf=mesh(new T.ConeGeometry(5.2,2.5,4,3),thatch,0,4.1,0,g);rf.rotation.y=Math.PI/4;
    const wm=new T.MeshStandardMaterial({color:0x332211,emissive:0xffb050,emissiveIntensity:.05});Box(1.8,1.2,.1,wm,0,1.7,2.55,g);R(wm,'emissiveIntensity',.05,2.4);[-2.3,2.3].forEach(x=>Cyl(.16,.18,2,woodD,x,-.8,2.6,g,8))});
  const flies=(()=>{const n=140,g=new T.BufferGeometry(),p=new Float32Array(n*3);for(let i=0;i<n;i++){p[i*3]=rnd(-30,30);p[i*3+1]=rnd(.5,5);p[i*3+2]=rnd(-6,50)}g.setAttribute('position',new T.BufferAttribute(p,3));const o=new T.Points(g,new T.PointsMaterial({map:glowTex,color:0xd8ff8a,size:.35,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false}));scene.add(o);R(o.material,'opacity',0,.9);return o})();
  scene.traverse(o=>{if(o.isMesh&&o.material&&o.material.transparent&&o.material!==lagoonM)o.castShadow=false});
  let night=0,tgtN=0,booked=0,lastEnv=-1;const tc=new T.Color(),sd=new T.Vector3(),md=sunDir(38,-70);
  const flick=flames.map(()=>rnd(0,6));
  return{scene,look:{exp:.9,bloom:[.22,.6,1.3],vig:.32,grain:.02,tint:[1,1,1],sat:1.18},
    update(t,dt,cam){
      if(cam){const ins=Math.abs(cam.position.x)<6.5&&cam.position.z<4.4&&cam.position.z>-4.2&&cam.position.y<3.4;this.look.exp=ins?lerp(.5,.85,night):lerp(.9,.9,night)}
      night+=(tgtN-night)*(1-Math.exp(-dt*1.4));
      const el=lerp(34,-9,sstep(0,1,night)),az=lerp(115,120,night);sd.copy(sunDir(el,az));
      su.sunPosition.value.copy(sd);skyClone.material.uniforms.sunPosition.value.copy(sd);
      su.rayleigh.value=skyClone.material.uniforms.rayleigh.value=lerp(2.1,.9,night);
      if(Math.abs(night-lastEnv)>.05||lastEnv<0){lastEnv=night;const rt=pmrem.fromScene(skyEnvScene,.02);if(scene.userData.rt)scene.userData.rt.dispose();scene.userData.rt=rt;scene.environment=rt.texture}
      scene.environmentIntensity=lerp(1,.35,night);
      const lightDir=sd.clone().lerp(md,sstep(.55,.9,night)).normalize();sun.position.copy(lightDir).multiplyScalar(100).add(V(0,0,18));
      sun.intensity=lerp(3.4,.55,sstep(.3,.95,night));sun.color.setHex(0xfff0d6).lerp(tc.setHex(0xffc890),sstep(.05,.5,night)).lerp(tc.setHex(0x8fa8ff),sstep(.55,.95,night));
      scene.background.copy(dayBg).lerp(nightBg,night);scene.fog.color.setHex(0xa9cde6).lerp(tc.setHex(0x0a1430),sstep(.2,.9,night));scene.fog.density=lerp(.0022,.0018,night);
      stars.material.opacity=sstep(.45,1,night);moonMesh.visible=night>.4;moonGlow.material.opacity=sstep(.4,1,night)*.6;
      sea.material.uniforms.sunDirection.value.copy(lightDir);sea.material.uniforms.time.value=t*.55;sea.material.uniforms.waterColor.value.setHex(0x0b8290).lerp(tc.setHex(0x030d1e),night);sea.material.uniforms.sunColor.value.setHex(0xffffff).lerp(tc.setHex(0x7fa0ff),night);
      reg.forEach(r=>{r.o[r.prop]=lerp(r.d,r.n,night)});
      fan.rotation.y+=dt*2.2;flames.forEach((f,i)=>{f[1].intensity*=.85+.3*Math.sin(t*9+flick[i])*.3+.15;f[0].scale.y=1.8+Math.sin(t*12+flick[i])*.3});
      const fa=flies.geometry.attributes.position;for(let i=0;i<fa.count;i++){fa.array[i*3+1]+=Math.sin(t*.8+i)*dt*.3;fa.array[i*3]+=Math.cos(t*.6+i*1.7)*dt*.3}fa.needsUpdate=true;
      clouds.forEach((c,i)=>{c.position.x+=dt*.6*(i%2?1:-1)});
    },
    actions:{night(v){tgtN=v?1:0},book(){booked++;ui.stat('book',booked+' malam · Rp '+(booked*4200000).toLocaleString('id-ID'))}}};
}

export const concept={id:'serena',hdris:[],name:'SERENA',type:'Company Profile · Resort',acc:'#ffb066',build:buildSerena,
 brief:{Sektor:'Resort tropis. Company profile dengan tombol pemesanan.',Kamera:'Bird-eye dari 90 meter, turun ke garis pantai, masuk lewat pintu villa, lalu keluar ke dek menghadap laut.',Interaksi:'Toggle siang atau malam yang mengubah langit, laut, matahari, bulan, lampu kamar, kolam, lampu dek, dan kunang-kunang secara halus.',Teknik:'Langit fisik dan pencahayaan lingkungan dihitung ulang tiap kali suasana berubah. Matahari, bulan, lampu kamar, obor, dan kolam ikut berpindah. Bayangan lembut, anyaman rotan, dan jerami bertekstur.',Varian:'Tambah golden hour sebagai posisi ketiga, atau ganti musim hujan dengan partikel air.'},
 slides:[
  {tag:'Bab 1 · Bird-eye',title:'Pulau kecil dari ketinggian 90 meter',text:'Villa, kolam, dan dermaga terbaca sebagai satu peta. Kamera bergerak pelan seolah drone lepas landas.',cam:[0,92,78],look:[0,0,24]},
  {tag:'Bab 2 · Turun',title:'Meluncur ke garis pantai',text:'Kamera menukik di antara pohon kelapa dan kolam, mengarah ke villa utama di tepi laut.',cam:[6,24,46],look:[0,2,4]},
  {tag:'Bab 3 · Ambang',title:'Pintu villa terbuka',text:'Kamera merendah setinggi mata tamu dan berhenti di ambang pintu. Di ujung ruangan, kaca menghadap laut.',cam:[0,2.1,13],look:[0,1.7,-1]},
  {tag:'Bab 4 · Kamar',title:'Siang jadi malam dalam satu ketukan',text:'Lampu meja, lampu gantung, dan kolam menyala perlahan saat langit menggelap.',cam:[3.6,1.9,2.9],look:[-2.4,1.1,-.8],ui:[TG('night','Suasana',['Siang','Malam'])]},
  {tag:'Bab 5 · Dek',title:'Pesan kamar dengan pemandangan ini',text:'Kamera keluar ke dek dan menatap laut. Lampu untaian dan bulan ikut mengikuti suasana yang Anda pilih.',cam:[0,1.9,-3],look:[0,1.2,-30],ui:[AC('book','Pesan malam ini'),ST('book','Pesanan','Deluxe Ocean · Rp 4,2 jt/malam')]}
 ]};
