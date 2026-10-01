/* Konsep kopi — modul mandiri, dimuat oleh concepts/kopi.html */
import {loadModel,$,AC,BGU,Box,CY,Cart,Cyl,EXRLoader,EffectComposer,GTAOPass,OutputPass,RBox,Reflector,RenderPass,RoundedBoxGeometry,ST,ShaderPass,Sky,Sph,T,TG,UnrealBloomPass,V,Water,brickHF,camera,canvas,clamp,ctex,dtex,emis,envCache,fbm,floorMat,glow,glowTex,hdri,hex2,leafGeo,leafMat,leafTexture,lerp,loadHdri,makeSky,mesh,noShadow,pbr,perfHF,physM,plankHF,pmrem,reduce,renderer,ridgeHF,rnd,rng,sstep,starField,stdM,sunDir,sunLight,tagSprite,textTex,tileHF,waterNormal,weaveHF,wetFloor,windowTex} from '../core.js';
/* ==========================================================
   KONSEP 9 — KAWAH KOPI : gunung api -> kebun kopi -> roastery
   ========================================================== */
function buildKopi(ui){
  const scene=new T.Scene();
  const sky=makeSky();scene.add(sky);const su=sky.material.uniforms;su.turbidity.value=6;su.rayleigh.value=1.8;su.mieCoefficient.value=.008;su.mieDirectionalG.value=.88;
  const sd=sunDir(7,140);su.sunPosition.value.copy(sd);
  const es=new T.Scene();const sk2=makeSky();sk2.material.uniforms.sunPosition.value.copy(sd);sk2.material.uniforms.turbidity.value=6;es.add(sk2);
  scene.environment=pmrem.fromScene(es,.02).texture;scene.environmentIntensity=.8;
  scene.background=new T.Color(0xd9a67e);scene.fog=new T.FogExp2(0xd6a27c,.0042);
  const sun=sunLight(0xffc48a,3.6,sd.clone().multiplyScalar(120).add(V(0,0,-60)),70,3072);sun.target.position.set(0,0,-70);scene.add(sun,sun.target);
  scene.add(new T.HemisphereLight(0xffd9b8,0x3a2a24,.4));
  const rr=rng(21);
  // ---- medan dengan gunung api
  const VZ=-175,VH=85;
  const hFn=(x,z)=>{const d=Math.hypot(x*.8,z-VZ);let h=d<140?VH*Math.pow(1-d/140,1.5):0;h-=14*sstep(18,0,d);
    h+=(3*Math.sin(x*.03)*Math.cos(z*.02)+2*Math.sin(x*.11+z*.07)+1.2*Math.sin(x*.27-z*.2))*sstep(10,60,Math.hypot(x,z+70)*.8);
    h+=7*Math.sin(x*.035+1)*Math.cos(z*.045)*sstep(30,100,Math.abs(x));
    const dd=Math.hypot(x,z+70);h*=sstep(16,44,dd)*.995+.005;return h};
  const tg=new T.PlaneGeometry(700,700,240,240);tg.rotateX(-Math.PI/2);const tp=tg.attributes.position,tc=new Float32Array(tp.count*3);
  for(let i=0;i<tp.count;i++){tp.setY(i,hFn(tp.getX(i),tp.getZ(i)))}tg.computeVertexNormals();const tn=tg.attributes.normal;
  for(let i=0;i<tp.count;i++){const x=tp.getX(i),z=tp.getZ(i),h=tp.getY(i),sl=1-tn.getY(i),d=Math.hypot(x*.8,z-VZ);
    const ash=sstep(30,65,h)+sstep(.05,.2,sl)*.6,rich=new T.Color(0x3a2c1c).lerp(new T.Color(0x4f6a2e),sstep(-70,-20,-Math.abs(z+40)*.5)*.6),c=rich.lerp(new T.Color(0x2b2826),clamp(ash,0,1)).lerp(new T.Color(0x6a6a70),sstep(.4,.7,h/VH)*.5);
    tc[i*3]=c.r;tc[i*3+1]=c.g;tc[i*3+2]=c.b}
  tg.setAttribute('color',new T.BufferAttribute(tc,3));
  const soil=pbr({fx:10,fy:10,oct:6,seed:61,c0:0xbdbdbd,c1:0xffffff,nS:4,r0:.85,r1:1,rep:[90,90],w:256,mat:{vertexColors:true}});
  const terr=new T.Mesh(tg,soil);terr.receiveShadow=true;terr.castShadow=true;scene.add(terr);
  // ---- kawah: danau lava, aliran, asap, bara
  const cY=hFn(0,VZ)+1;const lavaCol=new T.Color(3.2,.9,.12);
  const lake=new T.Mesh(new T.CircleGeometry(15,48),new T.MeshBasicMaterial({color:lavaCol,toneMapped:false}));lake.rotation.x=-Math.PI/2;lake.position.set(0,cY+.4,VZ);scene.add(lake);
  const lavaLight=new T.PointLight(0xff6a1a,3000,260,2);lavaLight.position.set(0,cY+8,VZ);scene.add(lavaLight);glow(0xff6a1a,90,0,cY+6,VZ,scene,.8);
  const lavaM=new T.MeshBasicMaterial({color:new T.Color(2.8,.7,.1),toneMapped:false});
  for(let k=0;k<7;k++){const a=k/7*6.28+rr()*.5,pts=[];for(let s=0;s<=18;s++){const d=18+s*3.4,w=(rr()-.5)*2.4,x=Math.cos(a)*d+Math.sin(a)*w,z=VZ+Math.sin(a)*d/1-Math.cos(a)*w;pts.push(V(x/ .8*.8,hFn(x,z)+.35,z))}
    scene.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),90,.42,6),lavaM))}
  const smT=(()=>{const c=canvas(128,128),g=c.getContext('2d'),n=fbm(128,128,{fx:4,fy:4,oct:4,seed:3});const id=g.createImageData(128,128);for(let y=0;y<128;y++)for(let x=0;x<128;x++){const d=Math.hypot(x-64,y-64)/64,a=Math.max(0,1-d)*(.4+n[y*128+x]*.9);id.data[(y*128+x)*4]=70;id.data[(y*128+x)*4+1]=62;id.data[(y*128+x)*4+2]=60;id.data[(y*128+x)*4+3]=Math.min(255,a*255)}g.putImageData(id,0,0);return ctex(c)})();
  const plume=[];for(let i=0;i<34;i++){const s=new T.Sprite(new T.SpriteMaterial({map:smT,transparent:true,opacity:.5,depthWrite:false,fog:true,color:0x6a6460}));s.userData.p=i/34;scene.add(s);plume.push(s)}
  const EN=360,eg=new T.BufferGeometry(),ep=new Float32Array(EN*3);eg.setAttribute('position',new T.BufferAttribute(ep,3));const embers=new T.Points(eg,new T.PointsMaterial({map:glowTex,color:0xffa040,size:1.6,transparent:true,opacity:.9,blending:T.AdditiveBlending,depthWrite:false,fog:false}));embers.frustumCulled=false;scene.add(embers);const ev=[];for(let i=0;i<EN;i++)ev.push({x:rnd(-8,8),y:rnd(0,60),z:rnd(-8,8),s:rnd(3,9)});
  // ---- ladang kopi: semak, ceri, teras batu
  const NS=420,shrubG=new T.IcosahedronGeometry(.85,2);{const p=shrubG.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=1+.2*Math.sin(x*5+z*4)*Math.cos(y*6);p.setXYZ(i,x*k*1.15,Math.max(y,-.2)*k*.8,z*k*1.15)}shrubG.computeVertexNormals()}
  const leafT=(()=>{const c=canvas(128,128),g=c.getContext('2d'),n=fbm(128,128,{fx:12,fy:12,oct:3,seed:8});const id=g.createImageData(128,128);for(let i=0;i<128*128;i++){const v=n[i];id.data[i*4]=20+v*30;id.data[i*4+1]=70+v*90;id.data[i*4+2]=24+v*20;id.data[i*4+3]=255}g.putImageData(id,0,0);const t=ctex(c);t.wrapS=t.wrapT=T.RepeatWrapping;return t})();
  const shrubI=new T.InstancedMesh(shrubG,new T.MeshStandardMaterial({map:leafT,color:0x9bd08a,roughness:.55}),NS),cherG=BGU.mergeGeometries(Array.from({length:9},(_,i)=>{const g=new T.SphereGeometry(.09,8,6);g.translate((rr()-.5)*1.4,.15+rr()*.7,(rr()-.5)*1.4);return g})),cherI=new T.InstancedMesh(cherG,new T.MeshStandardMaterial({color:0xc4182a,roughness:.35,emissive:0x3a0408,emissiveIntensity:.5}),NS),dm=new T.Object3D();
  let n=0;for(let row=0;row<12&&n<NS;row++){const z=-4-row*4.2;for(let k=-17;k<=17&&n<NS;k++){const x=k*2.5+(row%2?1.2:0);if(Math.abs(x)<5.5)continue;const zz=z-2*Math.abs(Math.sin(x*.05)),y=hFn(x,zz);
    dm.position.set(x,y+.3,zz);dm.rotation.set(0,rr()*6,0);dm.scale.setScalar(.8+rr()*.45);dm.updateMatrix();shrubI.setMatrixAt(n,dm.matrix);cherI.setMatrixAt(n,dm.matrix);n++}}
  shrubI.count=cherI.count=n;shrubI.castShadow=true;shrubI.receiveShadow=true;scene.add(shrubI,cherI);
  const stoneM=pbr({hf:brickHF(6,3),fx:6,fy:6,oct:4,seed:42,c0:0x2e2b2a,c1:0x6a6560,nS:5,r0:.85,r1:1,rep:[6,1],w:256});
  for(let row=0;row<12;row++){const z=-2-row*4.2;for(let k=-3;k<=3;k++){const x=k*14;const w=Box(14,.5,.5,stoneM,x,hFn(x,z)+.2,z,scene);w.castShadow=false}}
  // pohon peneduh (dadap)
  const shade=BGU.mergeGeometries([0,1,2].map(i=>{const g=new T.IcosahedronGeometry(2.2-i*.3,2);g.translate((i-1)*1.2,5.2+i*.4,(i%2)*1);return g}).concat([(()=>{const t=new T.CylinderGeometry(.16,.28,5.2,7);t.translate(0,2.6,0);return t.toNonIndexed()})()]));
  const shI=new T.InstancedMesh(shade,new T.MeshStandardMaterial({color:0x3d6a2a,roughness:.7}),40);for(let i=0;i<40;i++){const x=rnd(-60,60),z=rnd(-52,-10);if(Math.abs(x)<8){dm.position.set(x+14*Math.sign(x||1),hFn(x+14*Math.sign(x||1),z),z)}else dm.position.set(x,hFn(x,z),z);dm.rotation.set(0,rr()*6,0);dm.scale.setScalar(.8+rr()*.7);dm.updateMatrix();shI.setMatrixAt(i,dm.matrix)}shI.castShadow=true;shI.frustumCulled=false;scene.add(shI);
  // jalan tanah ke roastery
  const path=new T.Mesh(new T.PlaneGeometry(5,62,1,30),pbr({fx:24,fy:24,oct:4,seed:44,c0:0x6a5640,c1:0xa88a68,nS:6,r0:.9,r1:1,rep:[2,12],w:256}));path.geometry.rotateX(-Math.PI/2);const pp=path.geometry.attributes.position;for(let i=0;i<pp.count;i++)pp.setY(i,hFn(pp.getX(i),pp.getZ(i)-31)+.04);path.position.z=-31+0;path.receiveShadow=true;scene.add(path);
  // ---- roastery
  const BX=0,BZ=-70,W=14,Dp=16;
  const plasterM=pbr({hf:brickHF(8,16),fx:6,fy:6,oct:4,seed:45,c0:0x4a2e22,c1:0x8a5a42,nS:4,r0:.82,r1:1,rep:[7,3.4],w:256});
  const timber=pbr({fx:2,fy:26,oct:4,seed:46,c0:0x2a1a10,c1:0x5a3a22,nS:4,r0:.5,r1:.85,rep:[1,3],w:256}),floorM=pbr({hf:plankHF(10,3),fx:3,fy:14,oct:4,seed:47,c0:0x3a2414,c1:0x7a5230,nS:2,r0:.45,r1:.8,rep:[8,4],w:256});
  const tin=pbr({hf:ridgeHF(24),fx:1,fy:24,oct:2,seed:48,c0:0x5a5e66,c1:0x9aa0a8,nS:3,r0:.45,r1:.65,rep:[10,1],metal:.8,w:256,mat:{side:T.DoubleSide}});
  const by=hFn(BX,BZ);const B=new T.Group();B.position.set(BX,by,BZ);scene.add(B);
  Box(W+.6,.4,Dp+.6,stoneM,0,.2,0,B);Box(W,.15,Dp,floorM,0,.43,0,B);
  Box(.5,4.6,Dp,plasterM,-W/2,2.5,0,B);Box(.5,4.6,Dp,plasterM,W/2,2.5,0,B);Box(W,4.6,.5,plasterM,0,2.5,-Dp/2,B);
  Box(4.8,4.6,.5,plasterM,-4.6,2.5,Dp/2,B);Box(4.8,4.6,.5,plasterM,4.6,2.5,Dp/2,B);Box(4.4,1.2,.5,plasterM,0,4.2,Dp/2,B);
  [-1,1].forEach(s=>{Box(.3,3.4,.3,timber,s*2.15,2.2,Dp/2+.1,B)});Box(4.8,.3,.3,timber,0,3.85,Dp/2+.1,B);
  [-1,1].forEach(s=>{const wg=Box(.06,1.6,2.2,new T.MeshPhysicalMaterial({color:0xcfe0ff,transparent:true,opacity:.14,roughness:.03,clearcoat:1,depthWrite:false}),s*W/2,2.6,0,B);wg.castShadow=false;Box(.2,1.8,.14,timber,s*W/2,2.6,1.15,B);Box(.2,1.8,.14,timber,s*W/2,2.6,-1.15,B)});
  [-1,1].forEach(s=>{const r=Box(W+2,.18,Dp/2+1.6,tin,0,5.9,s*(Dp/4+.2),B);r.rotation.x=-s*.42;r.position.y=5.55+Math.abs(s)*.0});
  Box(W+.6,.5,.5,timber,0,4.95,Dp/2+.3,B);
  const sgc=canvas(1024,200),sg=sgc.getContext('2d');sg.fillStyle='#1b100b';sg.fillRect(0,0,1024,200);sg.strokeStyle='#e8a050';sg.lineWidth=6;sg.strokeRect(10,10,1004,180);sg.fillStyle='#f4c27a';sg.font='800 100px serif';sg.textAlign='center';sg.textBaseline='middle';sg.fillText('KAWAH KOPI',512,104);
  mesh(new T.PlaneGeometry(4.6,.9),stdM(0xffffff,{map:ctex(sgc),roughness:.6,emissive:0xffffff,emissiveMap:ctex(sgc),emissiveIntensity:.18}),0,4.35,Dp/2+.3,B);
  const ch=Cyl(.35,.35,4,tin,-3.6,7.6,-2,B,16);Cyl(.5,.35,.4,tin,-3.6,9.6,-2,B,16);
  // lampu dalam
  const il=new T.PointLight(0xffb870,70,16,2);il.position.set(0,4.2,-1);B.add(il);const il2=new T.PointLight(0xffa860,40,12,2);il2.position.set(-3.5,2.4,-1.5);B.add(il2);
  [-3,0,3].forEach(x=>{const lm=new T.MeshStandardMaterial({color:0x331a08,emissive:0xffb060,emissiveIntensity:2.4,roughness:.7});mesh(new T.LatheGeometry([[.02,-.2],[.2,-.12],[.28,.1],[.1,.26]].map(q=>new T.Vector2(q[0],q[1])),20),lm,x,4.1,1,B).castShadow=false;Cyl(.008,.008,.8,timber,x,4.6,1,B,4);glow(0xffb870,2.2,x,4.0,1,B,.6)});
  // mesin sangrai
  const metal=new T.MeshStandardMaterial({color:0x2a2e34,metalness:.85,roughness:.35,envMapIntensity:1.2}),copper=new T.MeshStandardMaterial({color:0xb8683a,metalness:1,roughness:.3,envMapIntensity:1.4});
  const RX=-3.4,RZ=-3.4;
  RBox(2.2,1.7,1.9,.08,metal,RX,1.35,RZ,B);RBox(1.4,.5,1.2,.06,metal,RX,2.5,RZ,B);const hop=mesh(new T.ConeGeometry(.55,.9,24,1,true),copper,RX,3.2,RZ,B);hop.rotation.x=Math.PI;Cyl(.18,.18,2.4,metal,RX,5.0,RZ-.3,B,16).rotation.x=0;
  const drumW=new T.Mesh(new T.CylinderGeometry(.5,.5,.06,40),new T.MeshPhysicalMaterial({color:0x201810,metalness:.2,roughness:.05,clearcoat:1,transparent:true,opacity:.45,depthWrite:false}));drumW.rotation.x=Math.PI/2;drumW.position.set(RX,1.5,RZ+.98);B.add(drumW);
  const ring=mesh(new T.TorusGeometry(.52,.05,12,40),copper,RX,1.5,RZ+.98,B);
  const padl=new T.Group();padl.position.set(RX,1.5,RZ+.9);B.add(padl);const beanIn=new T.MeshStandardMaterial({color:0xb68a55,roughness:.55});for(let k=0;k<4;k++){const b=RBox(.08,.8,.12,.02,metal,0,0,0,padl);b.rotation.z=k*Math.PI/4;b.position.set(0,0,0)}
  const rb=new T.InstancedMesh(new T.SphereGeometry(.05,10,8),beanIn,90);for(let i=0;i<90;i++){const a=rr()*6.28,d=Math.sqrt(rr())*.4;dm.position.set(Math.cos(a)*d,Math.sin(a)*d,-.02+rr()*.04);dm.scale.set(1.3,1,.8);dm.rotation.set(rr()*3,rr()*3,rr()*3);dm.updateMatrix();rb.setMatrixAt(i,dm.matrix)}padl.add(rb);
  [-.8,.8].forEach(x=>{const dial=mesh(new T.CylinderGeometry(.09,.09,.06,18),new T.MeshBasicMaterial({color:new T.Color(1.8,1.1,.3),toneMapped:false}),RX+x,2.4,RZ+.98,B);dial.rotation.x=Math.PI/2});
  // baki pendingin dan biji
  const TX=RX+.1,TZ=RZ+2.3;Cyl(1.05,1.05,.1,metal,TX,.98,TZ,B,40);const tr=new T.Mesh(new T.TorusGeometry(1.05,.05,10,48),metal);tr.rotation.x=Math.PI/2;tr.position.set(TX,1.03,TZ);B.add(tr);Cyl(.06,.06,.5,metal,TX,.7,TZ,B,10);
  const BN=330,beanG=new T.SphereGeometry(1,10,8),beanM=new T.MeshStandardMaterial({color:0xffffff,roughness:.5}),beans=new T.InstancedMesh(beanG,beanM,BN);beans.castShadow=true;
  const bpos=[];for(let i=0;i<BN;i++){const a=rr()*6.28,d=Math.sqrt(rr())*.98;bpos.push([Math.cos(a)*d,rr()*.1,Math.sin(a)*d,rr()*3,rr()*3,rr()*3,.8+rr()*.4])}
  bpos.forEach((p,i)=>{dm.position.set(TX+p[0],1.07+p[1],TZ+p[2]);dm.rotation.set(p[3],p[4],p[5]);dm.scale.set(.07*p[6],.045*p[6],.05*p[6]);dm.updateMatrix();beans.setMatrixAt(i,dm.matrix)});B.add(beans);
  const ROAST=[[0xb98c55,'Light','196 °C','Floral, jeruk, teh hitam'],[0x7c4b2b,'Medium','210 °C','Cokelat, karamel, kacang'],[0x2e1a10,'Dark','224 °C','Pahit manis, asap, kakao']];
  const col=new T.Color(),tint=new T.Color();let roast=0,roastF=0,toneT=0;
  function paintBeans(f){const a=ROAST[Math.floor(f)],b=ROAST[Math.min(2,Math.floor(f)+1)],k=f-Math.floor(f);for(let i=0;i<BN;i++){col.setHex(a[0]).lerp(tint.setHex(b[0]),k).multiplyScalar(.82+rr()*.3);beans.setColorAt(i,col)}beans.instanceColor.needsUpdate=true;beanIn.color.setHex(a[0]).lerp(tint.setHex(b[0]),k)}
  paintBeans(roastF);
  // karung goni dan rak toples
  const jute=pbr({hf:weaveHF(36),fx:3,fy:3,oct:2,seed:49,c0:0x8a6a3a,c1:0xc2a066,nS:3,r0:.95,r1:1,rep:[2,2],w:256});
  [[-5.5,-5.5],[-4.6,-6],[-5.6,-4.5],[-2.2,-6.5]].forEach((q,i)=>{const sk=mesh(new T.CapsuleGeometry(.4,.7,6,14),jute,q[0],.95,q[1],B);sk.scale.set(1,1,.8);sk.rotation.y=i;Box(.5,.04,.3,timber,q[0],1.6,q[1],B)});
  Box(.5,.1,7,timber,W/2-.4,1.6,-1,B);Box(.5,.1,7,timber,W/2-.4,2.5,-1,B);Box(.5,.1,7,timber,W/2-.4,3.4,-1,B);
  const jarM=new T.MeshPhysicalMaterial({color:0xdff0ff,transparent:true,opacity:.22,roughness:.04,clearcoat:1,depthWrite:false});
  for(let r=0;r<3;r++)for(let k=0;k<7;k++){const y=1.65+r*.9,z=-4+k*.92;mesh(new T.CylinderGeometry(.28,.28,.6,18),jarM,W/2-.4,y+.35,z,B).castShadow=false;mesh(new T.CylinderGeometry(.25,.25,.4,16),beanIn,W/2-.4,y+.25,z,B);Cyl(.2,.2,.08,timber,W/2-.4,y+.68,z,B,12)}
  // meja seduh
  const CXp=4.6,CZ=-1.6;RBox(2.2,1.0,5.2,.05,timber,CXp,.95,CZ,B);Box(2.3,.08,5.3,stoneM,CXp,1.5,CZ,B);
  const cup=Cyl(.2,.15,.28,new T.MeshPhysicalMaterial({color:0xf6f2ec,roughness:.15,clearcoat:1}),CXp-.1,1.68,CZ-.2,B,24);const liquid=Cyl(.17,.135,.01,new T.MeshStandardMaterial({color:0x3a1e10,roughness:.2,metalness:.1}),CXp-.1,1.56,CZ-.2,B,24);liquid.castShadow=false;
  const dripper=mesh(new T.CylinderGeometry(.26,.07,.3,24,1,true),new T.MeshPhysicalMaterial({color:0xf0f4ff,transparent:true,opacity:.5,roughness:.05,side:T.DoubleSide,clearcoat:1,depthWrite:false}),CXp-.1,2.02,CZ-.2,B);
  const kettle=new T.Group();kettle.position.set(CXp+.7,1.76,CZ-.2);B.add(kettle);mesh(new T.LatheGeometry([[.001,0],[.2,0],[.22,.05],[.2,.35],[.12,.42],[.001,.42]].map(q=>new T.Vector2(q[0],q[1])),28),new T.MeshStandardMaterial({color:0xd6d9de,metalness:1,roughness:.2}),0,0,0,kettle);
  const sp=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([V(-.15,.12,0),V(-.4,.3,0),V(-.62,.52,0),V(-.78,.5,0)]),12,.028,8),new T.MeshStandardMaterial({color:0xd6d9de,metalness:1,roughness:.2}));kettle.add(sp);
  const stream=new T.Mesh(new T.CylinderGeometry(.012,.012,1,8),new T.MeshPhysicalMaterial({color:0x5a3a24,transparent:true,opacity:.8,roughness:.1}));stream.visible=false;B.add(stream);
  const stN=60,stg=new T.BufferGeometry(),stp=new Float32Array(stN*3);stg.setAttribute('position',new T.BufferAttribute(stp,3));const steam=new T.Points(stg,new T.PointsMaterial({map:glowTex,color:0xfff0e0,size:.22,transparent:true,opacity:.0,depthWrite:false}));steam.frustumCulled=false;B.add(steam);const sv=[];for(let i=0;i<stN;i++)sv.push({a:rnd(0,6),r:rnd(0,.12),y:rnd(0,.9),s:rnd(.2,.5)});
  const grinder=mesh(new T.CylinderGeometry(.16,.2,.55,20),metal,CXp+.3,1.82,CZ+1.4,B);mesh(new T.ConeGeometry(.2,.3,20,1,true),copper,CXp+.3,2.2,CZ+1.4,B);
  let pf=0,brewT=-1,cartN=0,lava=false,lavaK=0;const cart=Cart(ui);
  function stat(){ui.stat('profile',ROAST[roast][3]);ui.stat('temp',ROAST[roast][2])}
  /* pegangan untuk situs 3D (js/world/kopi.js): posisi bangunan dan fungsi tinggi medan */
  const world={B,by,BX,BZ,W,Dp,hFn,RX,RZ,TX,TZ,CXp,CZ,ROAST,stoneM,timber,metal,copper,jute,getRoast:()=>roast,isBrewing:()=>brewT>=0};
  return{scene,world,pick:[{objects:()=>[beans,rb],id:'roast',hint:'Klik: ganti tingkat sangrai'},{objects:()=>[kettle,dripper,cup],id:'brew',hint:'Klik: seduh kopi'}],look:{exp:.95,bloom:[.45,.7,1.0],vig:.38,grain:.025,tint:[1.02,1,.97],sat:1.1},
    update(t,dt,cam){
      lavaK+=((lava?1:0)-lavaK)*(1-Math.exp(-dt*1.5));lavaLight.intensity=2200+1800*lavaK+Math.sin(t*3)*140;lake.material.color.setRGB(3.2*(.85+.3*lavaK),.9*(.8+.6*lavaK),.12);
      plume.forEach((s,i)=>{s.userData.p=(s.userData.p+dt*(.018+.012*lavaK))%1;const p=s.userData.p;s.position.set(Math.sin(i*2.1)*6*p+p*p*30,cY+p*(70+40*lavaK),VZ+Math.cos(i*1.7)*5*p-p*20);s.scale.setScalar(10+p*(55+25*lavaK));s.material.opacity=.55*(1-p)*Math.min(1,p*6)})
      ;const ea=eg.attributes.position;ev.forEach((e,i)=>{e.y+=dt*e.s*(1+lavaK*1.2);if(e.y>60+40*lavaK){e.y=0;e.x=rnd(-8,8);e.z=rnd(-8,8)}ea.array[i*3]=e.x+Math.sin(t+i)*e.y*.12;ea.array[i*3+1]=cY+e.y;ea.array[i*3+2]=VZ+e.z+e.y*.1});ea.needsUpdate=true;
      padl.rotation.z+=dt*1.6;roastF+=(roast-roastF)*(1-Math.exp(-dt*1.2));if(Math.abs(roast-roastF)>.01&&(++pf%3===0||Math.abs(roast-roastF)<.02))paintBeans(roastF);
      if(brewT>=0){brewT+=dt;const k=clamp(brewT/2,0,1),pour=brewT>1.5&&brewT<8;kettle.position.x=lerp(CXp+.7,CXp+.62,k);kettle.rotation.z=-sstep(1,2.2,brewT)*.55+sstep(8,9.2,brewT)*.55;
        stream.visible=pour;if(pour){const x0=CXp+.62-.78*Math.cos(.55)*.9,top=2.27,bot=2.0;stream.position.set(CXp-.1,(top+bot)/2,CZ-.2);stream.scale.y=top-bot;stream.position.x=CXp-.2}
        liquid.scale.y=1+clamp((brewT-3)/5,0,1)*20;liquid.position.y=1.56+liquid.scale.y*.005;steam.material.opacity=sstep(4,8,brewT)*.5;
        if(brewT>11){brewT=-1;kettle.rotation.z=0;kettle.position.x=CXp+.7;stream.visible=false}}
      if(steam.material.opacity>.01||brewT>=0){const sa=stg.attributes.position;sv.forEach((v,i)=>{v.y+=dt*v.s;if(v.y>1)v.y=0;sa.array[i*3]=CXp-.1+Math.cos(v.a+t*.5)*(v.r+v.y*.1);sa.array[i*3+1]=1.9+v.y;sa.array[i*3+2]=CZ-.2+Math.sin(v.a+t*.5)*(v.r+v.y*.1)});sa.needsUpdate=true;if(brewT<0)steam.material.opacity*=.97}
      if(cam){const ins=cam.position.z<BZ+Dp/2&&Math.abs(cam.position.x)<W/2&&cam.position.z>BZ-Dp/2;this.look.exp=ins?.78:.95}
    },
    actions:{lava(v){lava=v},roast(i){roast=i;stat()},brew(){brewT=0;liquid.scale.y=1;liquid.position.y=1.56},
      cart(){cart('Biji kopi '+ROAST[roast][1],95000)}}};
}
export const concept={id:'kopi',hdris:["studio"],name:'KAWAH KOPI',type:'E-commerce · F&B',acc:'#ff9a3a',build:buildKopi,
 brief:{Sektor:'Kedai dan roastery kopi dari lereng gunung api. E-commerce.',Kamera:'Dari tepi kawah yang menyala, turun mengikuti lereng melewati teras kebun kopi, berhenti di pintu roastery, lalu masuk ke antara mesin sangrai dan meja seduh.',Interaksi:'Kawah tenang atau aktif (lava, asap, bara), tingkat sangrai Light/Medium/Dark mengubah warna biji, suhu, dan profil rasa, seduh (cerat menuang, cangkir terisi, uap naik), tambah ke keranjang.',Teknik:'Medan gunung api dari heightfield dengan kawah dan aliran lava emisif, asap dari sprite, kebun ribuan semak dan ceri dengan instancing, biji kopi berwarna per instance, air tuangan dan uap dari partikel.',Varian:'Tambah penggiling dengan pilihan kekasaran, atau peta asal biji yang menyorot lereng tempat panen.'},
 slides:[
  {tag:'Bab 1 · Kawah',title:'Kopi yang tumbuh di tanah vulkanik',text:'Fajar di tepi gunung api. Lava mengalir di lereng, asap naik pelan, dan di kaki gunung ada kebun yang menghasilkan biji kami.',cam:[40,64,-62],look:[0,30,-175],ui:[TG('lava','Kawah',['Tenang','Aktif'])]},
  {tag:'Bab 2 · Kebun',title:'Turun lewat teras kebun',text:'Kamera meluncur di atas barisan semak kopi. Ceri merah menandai yang siap petik, dan dinding batu menahan tanah di setiap teras.',cam:[-8,10,-4],look:[0,2,-66]},
  {tag:'Bab 3 · Roastery',title:'Pintu kayu, bau sangrai',text:'Jalan tanah berakhir di roastery bergenteng seng. Lampu hangat menyala dari dalam dan cerobong mengepul di atap.',cam:[0,2.2,-50],look:[0,2.4,-70]},
  {tag:'Bab 4 · Sangrai dan seduh',title:'Pilih sangrai, lalu seduh',text:'Mesin berputar, biji di baki berubah warna sesuai tingkat sangrai. Seduh satu cangkir untuk melihat prosesnya.',cam:[-.3,2.3,-62.4],look:[-.4,1.1,-72.6],ui:[CY('roast','Sangrai',['Light','Medium','Dark']),AC('brew','Seduh'),AC('cart','Tambah biji ke keranjang'),ST('temp','Suhu','196 °C'),ST('profile','Profil rasa','Floral, jeruk, teh hitam'),ST('cart','Keranjang','0 item')]}
 ]};
