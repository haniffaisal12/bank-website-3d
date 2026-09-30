/* Konsep flora — modul mandiri, dimuat oleh concepts/flora.html */
import {$,AC,BGU,Box,CY,Cart,Cyl,EXRLoader,EffectComposer,GTAOPass,OutputPass,RBox,Reflector,RenderPass,RoundedBoxGeometry,ST,ShaderPass,Sky,Sph,T,TG,UnrealBloomPass,V,Water,brickHF,camera,canvas,clamp,ctex,dtex,emis,envCache,fbm,floorMat,glow,glowTex,hdri,hex2,leafGeo,leafMat,leafTexture,lerp,loadHdri,makeSky,mesh,noShadow,pbr,perfHF,physM,plankHF,pmrem,reduce,renderer,ridgeHF,rnd,rng,sstep,starField,stdM,sunDir,sunLight,tagSprite,textTex,tileHF,waterNormal,weaveHF,wetFloor,windowTex} from '../core.js';
/* ==========================================================
   KONSEP 4 — FLORA : rumah kaca botani, siram & lampu tumbuh
   ========================================================== */
function plantGeo(kind,seed){
  const r=rng(seed),parts=[];const n=kind==='fern'?16:kind==='monstera'?8:kind==='ficus'?12:9;
  const base=kind==='fern'?leafGeo(.55,1.3,3,10,.65):kind==='monstera'?leafGeo(.9,1.2,3,8,.4):kind==='ficus'?leafGeo(.45,.85,2,8,.35):leafGeo(.4,.9,2,8,.3);
  for(let i=0;i<n;i++){const g=base.clone();const s=.75+r()*.5;g.scale(s,s,s);g.rotateX(.35+r()*.9);g.translate(0,.25+(kind==='ficus'?i*.07:.02*i),.12+r()*.1);g.rotateY(i*2.399+r()*.4);parts.push(g)}
  const st=new T.CylinderGeometry(.02,.035,.5,6);st.translate(0,.25,0);parts.push(st);
  return BGU.mergeGeometries(parts)}
function flowerGeo(){const parts=[];for(let i=0;i<6;i++){const g=new T.SphereGeometry(.09,8,6);g.scale(1,.25,1.6);g.translate(0,0,.12);g.rotateY(i*Math.PI/3);parts.push(g)}const c=new T.SphereGeometry(.05,8,6);parts.push(c);return BGU.mergeGeometries(parts)}
function potGeo(r,h){const pts=[[.001,0],[r*.7,0],[r*.75,.02],[r*.95,h*.85],[r*1.05,h*.9],[r*1.05,h],[r*.95,h],[r*.9,h*.92]];return new T.LatheGeometry(pts.map(p=>new T.Vector2(p[0],p[1])),32)}
function buildFlora(ui){
  const scene=new T.Scene();
  const sky=makeSky();scene.add(sky);const su=sky.material.uniforms;su.turbidity.value=3.4;su.rayleigh.value=1.7;su.mieCoefficient.value=.006;su.mieDirectionalG.value=.86;
  const sd=sunDir(22,196);su.sunPosition.value.copy(sd);
  const es=new T.Scene();const sk2=makeSky();sk2.material.uniforms.sunPosition.value.copy(sd);sk2.material.uniforms.turbidity.value=3.4;es.add(sk2);
  const envRT=pmrem.fromScene(es,.02);scene.environment=envRT.texture;scene.environmentIntensity=1.05;
  scene.background=new T.Color(0xcfe0e6);scene.fog=new T.FogExp2(0xcfe0dc,.0062);
  const sun=sunLight(0xfff0d0,4.6,sd.clone().multiplyScalar(80),32,4096);sun.target.position.set(0,2,0);scene.add(sun,sun.target);
  const hemi=new T.HemisphereLight(0xeaf6ff,0x5a7a55,.35);scene.add(hemi);
  // bukit
  const grassM=pbr({fx:8,fy:8,oct:6,seed:21,c0:0x4a7a35,c1:0x8bb04c,nS:3,r0:.85,r1:1,rep:[90,90],w:256,mat:{vertexColors:true}});
  const hFn=(x,z)=>{const d=Math.hypot(x*.85,z-4);return (Math.sin(x*.035)*Math.cos(z*.03)*9+Math.sin(x*.09+z*.07)*2.4+8)*sstep(26,95,d)+(d<26?0:0)};
  const hg=new T.PlaneGeometry(700,700,180,180);hg.rotateX(-Math.PI/2);const hp=hg.attributes.position,hc=new Float32Array(hp.count*3);
  for(let i=0;i<hp.count;i++){const x=hp.getX(i),z=hp.getZ(i),h=hFn(x,z);hp.setY(i,h-.05);const v=.75+.25*Math.sin(x*.05)*Math.cos(z*.07);const c=new T.Color().setHSL(.25+.03*Math.sin(x*.02),.45,.42+.12*(h/14)*v);hc[i*3]=c.r;hc[i*3+1]=c.g;hc[i*3+2]=c.b}
  hg.setAttribute('color',new T.BufferAttribute(hc,3));hg.computeVertexNormals();const ground=new T.Mesh(hg,grassM);ground.receiveShadow=true;scene.add(ground);
  // rumput
  const gGeo=(()=>{const a=new T.PlaneGeometry(.7,.9);a.translate(0,.45,0);const b=a.clone();b.rotateY(Math.PI/2);return BGU.mergeGeometries([a,b])})();
  const gMat=leafMat('grass',7,{alphaTest:.45});const gU={uT:{value:0}};
  gMat.onBeforeCompile=sh=>{sh.uniforms.uT=gU.uT;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uT;').replace('#include <begin_vertex>','#include <begin_vertex>\nvec4 ip=instanceMatrix*vec4(0.,0.,0.,1.);transformed.x+=sin(uT*1.6+ip.x*.4+ip.z*.3)*position.y*position.y*.25;')};
  const NG=9000,grass=new T.InstancedMesh(gGeo,gMat,NG),dm=new T.Object3D();let gi=0;
  while(gi<NG){const a=rnd(0,6.28),d=rnd(22,90),x=Math.cos(a)*d*1.1,z=4+Math.sin(a)*d;if(Math.abs(x)<9&&z>16&&z<70)continue;dm.position.set(x,hFn(x,z)-.05,z);dm.rotation.set(0,rnd(0,6),0);dm.scale.setScalar(rnd(.7,1.5));dm.updateMatrix();grass.setMatrixAt(gi++,dm.matrix)}
  grass.frustumCulled=false;grass.castShadow=false;grass.receiveShadow=true;scene.add(grass);
  // pohon: batang bercabang bertingkat + ribuan daun kipas sebagai geometri (bukan kartu bertekstur), diperbanyak dengan instancing
  const barkM=pbr({fx:1,fy:12,oct:3,seed:34,c0:0x3a2c1e,c1:0x6a5238,nS:5,r0:.9,r1:1,rep:[1,3],w:256});
  function taperTube(curve,r0,r1,seg,rad){const g=new T.TubeGeometry(curve,seg,1,rad,false),pos=g.attributes.position,per=rad+1;
    for(let i=0;i<pos.count;i++){const t=Math.floor(i/per)/seg,c=curve.getPointAt(t),rr=lerp(r0,r1,Math.pow(t,.8));pos.setXYZ(i,c.x+(pos.getX(i)-c.x)*rr,c.y+(pos.getY(i)-c.y)*rr,c.z+(pos.getZ(i)-c.z)*rr)}
    g.deleteAttribute('uv');return g}
  function makeTree(seed){
    const r=rng(seed),parts=[],pts=[];
    const trunk=new T.CatmullRomCurve3([V(0,0,0),V((r()-.5)*.5,3,(r()-.5)*.5),V((r()-.5)*.9,6.4,(r()-.5)*.9),V((r()-.5)*.7,9.6,(r()-.5)*.7)]);
    parts.push(taperTube(trunk,.42,.13,14,7));
    const branch=(o,dir,len,r0,r1,depth)=>{const mid=o.clone().addScaledVector(dir,len*.5).add(V(0,len*.12,0)),end=o.clone().addScaledVector(dir,len).add(V(0,len*.1,0));
      const cv=new T.CatmullRomCurve3([o,mid,end]);parts.push(taperTube(cv,r0,r1,6,5));
      for(let k=0;k<8;k++)pts.push(cv.getPointAt(.45+.55*k/7));
      if(depth>0)for(let k=0;k<2;k++){const b=cv.getPointAt(.5+.3*k),az=r()*6.28,el=.6+r()*.6,d=V(Math.cos(az)*Math.sin(el),Math.cos(el)*.7,Math.sin(az)*Math.sin(el)).normalize();branch(b,d,len*.55,r1*1.3,r1*.35,depth-1)}};
    for(let k=0;k<9;k++){const t=.38+.6*k/8,o=trunk.getPointAt(t),az=k*2.399+r()*.5,el=.5+r()*.6,d=V(Math.cos(az)*Math.sin(el),Math.cos(el),Math.sin(az)*Math.sin(el));branch(o,d,4.6-2.2*t+r(),.13,.03,1)}
    for(let k=0;k<6;k++)pts.push(trunk.getPointAt(.85+.15*k/5).add(V(0,.4*k,0)));
    return{bark:BGU.mergeGeometries(parts),pts}}
  function leafGeo(){const g=new T.BufferGeometry(),P=[0,0,0],UV=[.5,0],R=.5,N=6;
    for(let i=0;i<=N;i++){const a=(-.95+1.9*i/N),x=Math.sin(a)*R,y=Math.cos(a)*R*.95+.05,z=-Math.abs(x)*.25;P.push(x,y,z);UV.push(.5+Math.sin(a)*.5/.83,Math.cos(a))}
    const idx=[];for(let i=1;i<=N;i++)idx.push(0,i,i+1);
    g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('uv',new T.Float32BufferAttribute(UV,2));g.setIndex(idx);g.computeVertexNormals();return g}
  function leafTex(){const c=canvas(128,128),g=c.getContext('2d'),q=g.createLinearGradient(0,128,0,0);q.addColorStop(0,'#6fa83a');q.addColorStop(1,'#3f8a2c');g.fillStyle=q;g.fillRect(0,0,128,128);
    g.strokeStyle='rgba(210,240,150,.5)';g.lineWidth=1.3;for(let i=-9;i<=9;i++){g.beginPath();g.moveTo(64,124);g.lineTo(64+i*7.2,6);g.stroke()}return ctex(c)}
  const variants=[makeTree(11),makeTree(23),makeTree(37)],treeSpots=[];
  for(let i=0;i<38;i++){const a=rnd(0,6.28),d=rnd(48,120),x=Math.cos(a)*d*1.1,z=4+Math.sin(a)*d;treeSpots.push({x,y:hFn(x,z)-.05,z,v:i%3,ry:rnd(0,6.28),sc:rnd(.9,1.5)})}
  {const dm=new T.Object3D(),lm=new T.Matrix4(),tm=new T.Matrix4(),LPT=1300,leafI=new T.InstancedMesh(leafGeo(),new T.MeshStandardMaterial({map:leafTex(),roughness:.62,side:T.DoubleSide}),treeSpots.length*LPT),rr=rng(5);
    const tints=[0xffffff,0xeaffb8,0xd2f0a0,0xf4ffd0];let li=0;
    variants.forEach((vt,vi)=>{const list=treeSpots.filter(s=>s.v===vi),im=new T.InstancedMesh(vt.bark,barkM,list.length);im.castShadow=im.receiveShadow=true;
      list.forEach((sp,k)=>{dm.position.set(sp.x,sp.y,sp.z);dm.rotation.set(0,sp.ry,0);dm.scale.setScalar(sp.sc);dm.updateMatrix();im.setMatrixAt(k,dm.matrix);tm.copy(dm.matrix);
        for(let j=0;j<LPT;j++){const p=vt.pts[(rr()*vt.pts.length)|0];dm.position.set(p.x+(rr()-.5)*1.5,p.y+(rr()-.3)*1.3,p.z+(rr()-.5)*1.5);dm.rotation.set((rr()-.5)*2.2-.4,rr()*6.28,(rr()-.5)*1.6);dm.scale.setScalar(.95+rr()*.7);dm.updateMatrix();lm.multiplyMatrices(tm,dm.matrix);leafI.setMatrixAt(li,lm);leafI.setColorAt(li,new T.Color(tints[(rr()*4)|0]).multiplyScalar(.75+rr()*.3));li++}});
      im.frustumCulled=false;scene.add(im)});
    leafI.count=li;leafI.castShadow=true;leafI.frustumCulled=false;scene.add(leafI)}
  // jalan
  const gravel=pbr({fx:24,fy:24,oct:4,seed:41,c0:0x8a8478,c1:0xcfc8b8,nS:6,r0:.9,r1:1,rep:[3,20],w:256});
  const pathG=new T.PlaneGeometry(6,60);pathG.rotateX(-Math.PI/2);const path=new T.Mesh(pathG,gravel);path.position.set(0,.03,46);path.receiveShadow=true;scene.add(path);
  // rumah kaca
  const sh=new T.Shape();sh.absarc(0,0,8,0,Math.PI,false);
  const eg=new T.ExtrudeGeometry(sh,{depth:30,bevelEnabled:false,curveSegments:40});eg.translate(0,0,-15);
  const glass=new T.Mesh(eg,new T.MeshPhysicalMaterial({color:0xdfffee,transparent:true,opacity:.1,metalness:0,roughness:.02,envMapIntensity:3.2,clearcoat:1,clearcoatRoughness:.02,side:T.DoubleSide,depthWrite:false}));glass.castShadow=false;scene.add(glass);
  const steel=stdM(0x2e4d3d,{metalness:.7,roughness:.4});
  for(let z=-15;z<=15;z+=3){const rib=mesh(new T.TorusGeometry(8,.1,8,64,Math.PI),steel,0,0,z,scene);rib.castShadow=true}
  [0,25,50,75,105,130,155,180].forEach(a=>{const r=a*Math.PI/180;Box(.1,.1,30,steel,Math.cos(r)*8,Math.sin(r)*8,0,scene)});
  const brick=pbr({hf:brickHF(6,14),fx:6,fy:6,oct:4,seed:23,c0:0x6a3a2a,c1:0xb0704e,nS:4,r0:.75,r1:1,rep:[10,1],w:256});
  [-1,1].forEach(s=>Box(.5,.9,30,brick,s*8,.45,0,scene));
  const paving=pbr({hf:tileHF(4,.04),fx:6,fy:6,oct:4,seed:24,c0:0x8e8474,c1:0xd6ccb6,nS:3,r0:.7,r1:.95,rep:[4,8],w:256});
  Box(16,.06,30,paving,0,.03,0,scene);
  const doorWood=pbr({fx:2,fy:20,oct:4,seed:26,c0:0x3a2a1c,c1:0x6a4a2c,nS:3,r0:.5,r1:.85,rep:[1,3],w:256});
  [-1,1].forEach(s=>Box(.3,4.4,.3,doorWood,s*1.9,2.2,15.2,scene));Box(4.1,.4,.3,doorWood,0,4.5,15.2,scene);
  const sgc=canvas(1024,240),sgx=sgc.getContext('2d');sgx.fillStyle='#173324';sgx.fillRect(0,0,1024,240);sgx.strokeStyle='#d9c88a';sgx.lineWidth=5;sgx.strokeRect(10,10,1004,220);sgx.fillStyle='#e8f6d0';sgx.font='700 96px serif';sgx.textAlign='center';sgx.textBaseline='middle';sgx.fillText('FLORA · Rumah Tanaman',512,125);
  mesh(new T.PlaneGeometry(3.8,.9),stdM(0xffffff,{map:ctex(sgc),roughness:.6}),0,5.15,15.25,scene);
  // tanah dan bedeng
  const soilM=pbr({fx:16,fy:16,oct:5,seed:27,c0:0x2a1c12,c1:0x5a3e28,nS:5,r0:.95,r1:1,rep:[3,12],w:256});const soilDry=new T.Color(1,1,1),soilWet=new T.Color(.45,.4,.38);
  const timber=pbr({fx:2,fy:24,oct:4,seed:28,c0:0x6a4a2c,c1:0xa07a4a,nS:3,r0:.6,r1:.9,rep:[1,8],w:256});
  [-1,1].forEach(s=>{Box(3.2,.5,26,soilM,s*4.3,.28,0,scene);[-1,1].forEach(q=>Box(.16,.58,26.2,timber,s*4.3+q*1.68,.29,0,scene));Box(3.4,.1,.16,timber,s*4.3,.55,13.1,scene);Box(3.4,.1,.16,timber,s*4.3,.55,-13.1,scene);Box(1,.4,26,brick,s*7.2,.2,0,scene)});
  // tanaman
  const pmats={monstera:leafMat('monstera',1),fern:leafMat('fern',2),ficus:leafMat('ficus',3),flower:leafMat('ficus',4)};
  const kinds=['fern','ficus','monstera','flower'];const pg={};kinds.forEach(k=>{pg[k]=[0,1,2].map(i=>plantGeo(k,k.length*10+i))});
  const flG=flowerGeo(),flC=[0xff6fa8,0xffd23a,0xffffff,0xff8a4a].map(c=>new T.MeshStandardMaterial({color:c,roughness:.5,emissive:c,emissiveIntensity:.15}));
  const plants=[];
  function plant(x,z,sc,k){const g=new T.Group();g.position.set(x,.55,z);const m=new T.Mesh(pg[k][(Math.random()*3)|0],pmats[k]);m.castShadow=m.receiveShadow=true;g.add(m);
    const fl=new T.Mesh(flG,flC[(Math.random()*4)|0]);fl.position.set(rnd(-.15,.15),1.1,rnd(-.15,.15));fl.scale.setScalar(0);fl.castShadow=true;g.add(fl);g.rotation.y=rnd(0,6);
    const o={g,fl,g_:sc,tgt:sc,ph:rnd(0,6)};g.scale.setScalar(sc);scene.add(g);plants.push(o)}
  [-1,1].forEach(s=>{for(let z=-11.5;z<=12;z+=1.5){plant(s*4.3+rnd(-.5,.5),z,rnd(.8,1.15),kinds[(Math.random()*4)|0]);plant(s*4.3+rnd(-.7,.7)+(s>0?.85:-.85),z+.75,rnd(.7,1),kinds[(Math.random()*4)|0])}});
  const terra=pbr({fx:10,fy:10,oct:5,seed:29,c0:0x9a4a2a,c1:0xd0764a,nS:3,r0:.7,r1:.95,rep:[2,2],w:256});
  function bigPlant(x,z,kind,s){const g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(s);const pt=mesh(potGeo(.5,.8),terra,0,0,0,g);
    if(kind==='monstera'){const lg=leafGeo(1.5,1.9,4,12,.45),lm=pmats.monstera;for(let i=0;i<16;i++){const a=i*2.4,r=.1+(i%5)*.13,h=1+(i%4)*.35;const st=Cyl(.02,.03,h,stdM(0x2f6a34),Math.cos(a)*r*.6,.8+h/2,Math.sin(a)*r*.6,g,6);st.rotation.set(Math.sin(a)*.5,0,-Math.cos(a)*.5);const l=new T.Mesh(lg,lm);l.position.set(Math.cos(a)*r*1.5,.8+h*.95,Math.sin(a)*r*1.5);l.rotation.set(0,-a+Math.PI/2,0);l.rotateX(-.5-Math.random()*.5);l.castShadow=true;g.add(l)}}
    else{Cyl(.05,.09,1.7,barkM,0,1.6,0,g,8);const lg=leafGeo(.75,1.2,3,10,.3),lm=pmats.ficus;for(let i=0;i<44;i++){const a=i*2.4,h=1.2+i*.05;const l=new T.Mesh(lg,lm);l.position.set(Math.cos(a)*.1*(i%4),h+.8,Math.sin(a)*.1*(i%4));l.rotation.set(0,a,0);l.rotateX(-.4-(i%5)*.13);l.scale.setScalar(1.1-i*.006);l.castShadow=true;g.add(l)}}
    g.userData.ph=rnd(0,6);scene.add(g);return g}
  const trees=[bigPlant(0,-12,'monstera',2.2),bigPlant(-2.3,6,'ficus',1),bigPlant(2.3,-2,'monstera',1.1)];
  // pot gantung
  const hangM=leafMat('fern',9);for(let i=0;i<9;i++){const z=-12+i*3,x=(i%2?1:-1)*rnd(2.6,3.4);Cyl(.008,.008,1.6,steel,x,6,z,scene,3);const p=mesh(potGeo(.3,.35),terra,x,5.05,z,scene);const fg=leafGeo(.4,1.1,2,8,.9);for(let k=0;k<9;k++){const l=new T.Mesh(fg,hangM);l.position.set(x,5.35,z);l.rotation.set(0,k*.7,0);l.rotateX(1.3);l.castShadow=true;scene.add(l)}}
  // bangku kerja
  const bench=new T.Group();bench.position.set(-6.6,0,-3);scene.add(bench);Box(.9,.08,5,timber,0,1,0,bench);[-2.3,2.3].forEach(z=>[-.35,.35].forEach(x=>Box(.08,1,.08,timber,x,.5,z,bench)));
  for(let i=0;i<7;i++)mesh(potGeo(.16,.2),terra,rnd(-.3,.3),1.04,-2+i*.65,bench);
  const can=mesh(new T.LatheGeometry([[.001,0],[.2,0],[.22,.05],[.2,.36],[.12,.4]].map(p=>new T.Vector2(p[0],p[1])),20),stdM(0x9aa6a0,{metalness:.8,roughness:.35}),0,1.04,1.6,bench);
  // pipa dan nozzle
  const nozzles=[];[-1,1].forEach(s=>{const p=Cyl(.05,.05,30,steel,s*4.3,6.2,0,scene,8);p.rotation.x=Math.PI/2;for(let z=-13;z<=13;z+=3){Sph(.1,steel,s*4.3,6.1,z,scene,8,6);nozzles.push([s*4.3,z])}});
  const DN=520,dropG=new T.CylinderGeometry(.008,.008,.14,4),dropM=new T.MeshBasicMaterial({color:0xcfeeff,transparent:true,opacity:.7,depthWrite:false});
  const drops=new T.InstancedMesh(dropG,dropM,DN);drops.visible=false;drops.frustumCulled=false;scene.add(drops);const dd=[];for(let i=0;i<DN;i++)dd.push({n:(Math.random()*nozzles.length)|0,y:rnd(.6,6),v:rnd(5,8),ox:rnd(-.5,.5),oz:rnd(-.5,.5)});
  // lampu tumbuh
  const uvM=new T.MeshStandardMaterial({color:0x220a1a,emissive:0xff3fb8,emissiveIntensity:.05}),uvL=[];
  [-1.6,1.6].forEach(x=>{Box(.25,.08,26,uvM,x,7,0,scene).castShadow=false;[-8,0,8].forEach(z=>{const l=new T.PointLight(0xff3fb8,0,22,2);l.position.set(x*1.6,6,z);scene.add(l);uvL.push(l)})});
  // pedestal produk
  const pedM=pbr({fx:6,fy:6,oct:4,seed:31,c0:0xb8b0a0,c1:0xe6e0d4,nS:2,r0:.6,r1:.9,rep:[1,1],w:256});
  const prod=[[-2,6,'Monstera Deliciosa · Rp 289.000',289000],[2,-2,'Ficus Lyrata · Rp 425.000',425000]];const tagS=[];
  prod.forEach(p=>{Cyl(.6,.7,.9,pedM,p[0]*1.2,.45,p[1],scene,32);const s=tagSprite(p[2],'#9be564',.42);s.position.set(p[0]*1.2,4.6,p[1]);scene.add(s);tagS.push(s)});
  // berkas cahaya + debu
  const shaftM=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,uniforms:{t:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform float t;void main(){float f=smoothstep(0.,.25,vUv.y)*(1.-smoothstep(.6,1.,vUv.y));float e=smoothstep(0.,.3,vUv.x)*(1.-smoothstep(.7,1.,vUv.x));gl_FragColor=vec4(vec3(1.,.93,.75)*.14*f*e*(.8+.2*sin(t*.6+vUv.x*9.)),f*e*.14);}'});
  const dir=sd.clone().negate();for(let i=0;i<8;i++){const g=new T.PlaneGeometry(1.6,16);g.translate(0,8,0);const m=new T.Mesh(g,shaftM);m.position.set(-8+i*2.3,0,rnd(-10,10));m.lookAt(m.position.clone().add(V(0,0,1)));m.quaternion.setFromUnitVectors(V(0,1,0),sd.clone().normalize());m.position.y=0;scene.add(m)}
  const dust=(()=>{const n=220,g=new T.BufferGeometry(),p=new Float32Array(n*3);for(let i=0;i<n;i++){p[i*3]=rnd(-7,7);p[i*3+1]=rnd(.5,7);p[i*3+2]=rnd(-14,14)}g.setAttribute('position',new T.BufferAttribute(p,3));const o=new T.Points(g,new T.PointsMaterial({map:glowTex,color:0xfff2c0,size:.14,transparent:true,opacity:.7,depthWrite:false,blending:T.AdditiveBlending}));scene.add(o);return o})();
  let waterT=0,uv=0,uvT=0,lastS=0,cartN=0,wet=0;const cart=Cart(ui);const avg=()=>plants.reduce((a,p)=>a+p.g_,0)/plants.length;const dumm=new T.Object3D();
  return{scene,look:{exp:.95,bloom:[.28,.7,1.2],vig:.3,grain:.02,tint:[1,1,.98],sat:1.15},
    update(t,dt,cam){
      gU.uT.value=t;shaftM.uniforms.t.value=t;
      plants.forEach(p=>{p.g_+=(p.tgt-p.g_)*(1-Math.exp(-dt*.9));p.g.scale.setScalar(p.g_);p.g.rotation.z=Math.sin(t*.8+p.ph)*.02;p.fl.scale.setScalar(clamp((p.g_-1.1)*5,0,1))});
      trees.forEach(g=>{g.rotation.z=Math.sin(t*.6+g.userData.ph)*.01});
      if(waterT>0){waterT-=dt;wet=Math.min(1,wet+dt*.4);drops.visible=true;dd.forEach((d,i)=>{d.y-=d.v*dt;if(d.y<.6)d.y=6.1;dumm.position.set(nozzles[d.n][0]+d.ox,d.y,nozzles[d.n][1]+d.oz);dumm.updateMatrix();drops.setMatrixAt(i,dumm.matrix)});drops.instanceMatrix.needsUpdate=true}else{drops.visible=false;wet=Math.max(0,wet-dt*.03)}
      soilM.color.copy(soilDry).lerp(soilWet,wet);soilM.roughness=1-wet*.45;
      if(t-lastS>.5){lastS=t;ui.stat('grow',Math.round(avg()*34)+' cm')}
      uv+=(uvT-uv)*(1-Math.exp(-dt*2));uvL.forEach(l=>l.intensity=uv*40);uvM.emissiveIntensity=.05+uv*4;hemi.intensity=.35-uv*.1;
      const da=dust.geometry.attributes.position;for(let i=0;i<da.count;i++){da.array[i*3+1]+=Math.sin(t*.5+i)*dt*.15;da.array[i*3]+=Math.cos(t*.4+i*1.3)*dt*.12}da.needsUpdate=true;
      if(cam){const ins=Math.abs(cam.position.x)<7.5&&cam.position.z<14.5&&cam.position.y<7;this.look.exp=ins?.8:.95}
    },
    actions:{water(){waterT=3.5;plants.forEach(p=>{p.tgt=Math.min(1.9,p.tgt+.3)})},uv(v){uvT=v?1:0},cart(){const p=prod[cartN%2];cartN++;cart(p[2],p[3])}}};
}

export const concept={id:'flora',hdris:[],name:'FLORA',type:'E-commerce',acc:'#9be564',build:buildFlora,
 brief:{Sektor:'Toko tanaman hias dan rumah kaca botani. E-commerce.',Kamera:'Aerial dari tebing, dolly turun di tepi kebun, masuk lewat pintu kaca, lalu lorong panjang di antara bedeng.',Interaksi:'Siram (tetesan dari pipa, tanaman tumbuh, bunga mekar), lampu tumbuh magenta, tambah tanaman ke keranjang.',Teknik:'Rumah kaca berkaca fisik dengan bayangan rangka baja di bedeng, rumput dan pepohonan di bukit, daun bertekstur alpha, tanah yang menggelap saat basah, dan berkas cahaya matahari.',Varian:'Tombol musim yang mengganti spesies, atau timelapse pertumbuhan 30 hari.'},
 slides:[
  {tag:'Bab 1 · Aerial',title:'Rumah kaca di antara perbukitan berkabut',text:'Pagi berkabut. Kubah kaca terlihat seperti lentera hijau yang menyala di lembah.',cam:[27,15,32],look:[0,3,0]},
  {tag:'Bab 2 · Pendekatan',title:'Menyusuri jalan setapak',text:'Kamera merendah ke tinggi pengunjung. Tulang rusuk kubah membentuk ritme yang menuntun ke pintu.',cam:[8,3.2,36],look:[0,3.6,0]},
  {tag:'Bab 3 · Pintu',title:'Papan nama, lalu udara yang lembap',text:'Kamera melewati ambang pintu. Cahaya menyebar lewat kaca dan debu halus melayang di udara.',cam:[0,2.5,19],look:[0,2.5,0]},
  {tag:'Bab 4 · Bedeng',title:'Siram, lalu lihat kebun bereaksi',text:'Air turun dari pipa atas, daun mengembang, bunga mekar. Nyalakan lampu tumbuh untuk suasana lain.',cam:[0,1.9,9],look:[0,2.4,-12],ui:[AC('water','Siram'),TG('uv','Lampu tumbuh',['Mati','Nyala']),AC('cart','Tambah tanaman'),ST('grow','Tinggi rata-rata','30 cm'),ST('cart','Keranjang','0 item')]}
 ]};
