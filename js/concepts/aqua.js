/* Konsep aqua — modul mandiri, dimuat oleh concepts/aqua.html */
import {$,AC,BGU,Box,CY,Cart,Cyl,EXRLoader,EffectComposer,GTAOPass,OutputPass,RBox,Reflector,RenderPass,RoundedBoxGeometry,ST,ShaderPass,Sky,Sph,T,TG,UnrealBloomPass,V,Water,brickHF,camera,canvas,clamp,ctex,dtex,emis,envCache,fbm,floorMat,glow,glowTex,hdri,hex2,leafGeo,leafMat,leafTexture,lerp,loadHdri,makeSky,mesh,noShadow,pbr,perfHF,physM,plankHF,pmrem,reduce,renderer,ridgeHF,rnd,rng,sstep,starField,stdM,sunDir,sunLight,tagSprite,textTex,tileHF,waterNormal,weaveHF,wetFloor,windowTex} from '../core.js';
/* ==========================================================
   KONSEP 2 — AQUARIA : gerbang -> bawah air + beri makan ikan
   ========================================================== */
const CAUS={uTime:{value:0},uAmt:{value:1}};
function withCaustics(m,amt){
  m.onBeforeCompile=sh=>{
    sh.uniforms.uTime=CAUS.uTime;sh.uniforms.uAmt=CAUS.uAmt;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;').replace('#include <project_vertex>','#include <project_vertex>\nvWP=(modelMatrix*vec4(transformed,1.)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vWP;uniform float uTime,uAmt;
float caust(vec2 p,float t){vec2 q=p*.32;float a=0.;for(int i=0;i<3;i++){q+=vec2(sin(q.y*1.7+t*.6),cos(q.x*1.3-t*.5))*.55;a+=abs(sin(q.x*2.)*sin(q.y*2.));}return pow(clamp(1.-a/3.,0.,1.),3.)*2.;}`)
      .replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
float dep=clamp((vWP.y+2.)/-20.,0.,1.);totalEmissiveRadiance+=vec3(.35,.75,.9)*caust(vWP.xz,uTime)*uAmt*${(amt||1).toFixed(2)}*(1.-.55*dep)*step(vWP.y,-.5)*(1.-smoothstep(8.,40.,length(vViewPosition)));`);
  };return m}
const FISH_PAT={
  clown:(g,w,h)=>{g.fillStyle='#ff7a1c';g.fillRect(0,0,w,h);[.28,.52,.8].forEach(y=>{g.fillStyle='#fff';g.fillRect(0,y*h,w,h*.09);g.fillStyle='#111';g.fillRect(0,y*h-2,w,3);g.fillRect(0,(y+.09)*h,w,3)})},
  tang:(g,w,h)=>{g.fillStyle='#1f6fe0';g.fillRect(0,0,w,h);g.fillStyle='#0a1230';g.beginPath();g.ellipse(w*.5,h*.5,w*.5,h*.14,0,0,7);g.fill();g.fillStyle='#ffd21f';g.fillRect(0,0,w,h*.08)},
  yellow:(g,w,h)=>{const q=g.createLinearGradient(0,0,0,h);q.addColorStop(0,'#ffe36a');q.addColorStop(1,'#ffbf1f');g.fillStyle=q;g.fillRect(0,0,w,h);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(0,h*.18,w,h*.03)},
  pink:(g,w,h)=>{const q=g.createLinearGradient(0,0,w,0);q.addColorStop(0,'#ff4f9a');q.addColorStop(1,'#ffc0da');g.fillStyle=q;g.fillRect(0,0,w,h);g.fillStyle='rgba(60,0,40,.5)';for(let i=0;i<4;i++)g.fillRect(0,h*(.15+i*.2),w,3)},
  neon:(g,w,h)=>{g.fillStyle='#0b2a4a';g.fillRect(0,0,w,h);const q=g.createLinearGradient(0,0,w,0);q.addColorStop(0,'#35f0ff');q.addColorStop(1,'#00ffa0');g.fillStyle=q;g.fillRect(0,h*.3,w,h*.14);g.fillStyle='#ff3a5e';g.fillRect(0,h*.6,w,h*.3)},
  violet:(g,w,h)=>{const q=g.createLinearGradient(0,0,w,0);q.addColorStop(0,'#7b5cff');q.addColorStop(1,'#37e3ff');g.fillStyle=q;g.fillRect(0,0,w,h)},
  mint:(g,w,h)=>{const q=g.createLinearGradient(0,0,w,0);q.addColorStop(0,'#2a7fff');q.addColorStop(1,'#6bffb0');g.fillStyle=q;g.fillRect(0,0,w,h)},
  koiA:(g,w,h)=>{g.fillStyle='#f5f2ea';g.fillRect(0,0,w,h);g.fillStyle='#ff5a1f';[[.1,.2,.6,.3],[.6,.55,.5,.28]].forEach(p=>{g.beginPath();g.ellipse(p[0]*w+w*.2,p[1]*h+h*.1,p[2]*w*.4,p[3]*h*.5,0,0,7);g.fill()});g.fillStyle='#161616';g.beginPath();g.ellipse(w*.7,h*.3,w*.12,h*.1,0,0,7);g.fill()},
  koiB:(g,w,h)=>{g.fillStyle='#ff5a1f';g.fillRect(0,0,w,h);g.fillStyle='#f5f2ea';g.beginPath();g.ellipse(w*.4,h*.45,w*.3,h*.22,0,0,7);g.fill()},
  koiC:(g,w,h)=>{g.fillStyle='#ffd23a';g.fillRect(0,0,w,h);g.fillStyle='#f5f2ea';g.fillRect(0,h*.7,w,h*.3)},
  koiD:(g,w,h)=>{g.fillStyle='#1a1a1a';g.fillRect(0,0,w,h);g.fillStyle='#ff5a1f';g.beginPath();g.ellipse(w*.5,h*.5,w*.25,h*.2,0,0,7);g.fill()}
};
function fishTex(pat,glowy){const w=128,h=256,c=canvas(w,h),g=c.getContext('2d');FISH_PAT[pat](g,w,h);
  const sh=g.createLinearGradient(0,0,w,0);sh.addColorStop(0,'rgba(0,0,0,.35)');sh.addColorStop(.35,'rgba(255,255,255,.12)');sh.addColorStop(.7,'rgba(0,0,0,.1)');sh.addColorStop(1,'rgba(0,0,0,.4)');g.fillStyle=sh;g.fillRect(0,0,w,h);
  g.strokeStyle='rgba(0,0,0,.14)';g.lineWidth=1;for(let y=0;y<h;y+=7)for(let x=(y/7%2)*6;x<w;x+=12){g.beginPath();g.arc(x,y,6,.2,Math.PI-.2);g.stroke()}
  g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(w*.5,h*.06,w*.5,4,0,0,7);g.fill();
  return ctex(c)}
function fishBodyGeo(){
  const g=new T.SphereGeometry(1,40,24);const p=g.attributes.position;
  for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    // pole axis y -> panjang; y=+1 ekor, y=-1 kepala
    const t=(y+1)/2;const prof=Math.pow(Math.sin(Math.PI*Math.pow(t,.72)),.6)*(.35+.65*(1-t*.55));const ped=1-.62*Math.pow(t,3.2);
    p.setXYZ(i,x*prof*.55*ped,y*1.5,z*prof*.24*ped+0)}
  g.rotateZ(Math.PI/2);g.computeVertexNormals();return g}
function finGeo(w,h,taper){const s=new T.Shape();s.moveTo(0,0);s.bezierCurveTo(w*.3,h*.1,w*.8,h*.5,w,h*taper);s.lineTo(w,-h*taper);s.bezierCurveTo(w*.8,-h*.5,w*.3,-h*.1,0,0);const g=new T.ShapeGeometry(s,10);return g}
function reefRock(r,seedv){const g=new T.IcosahedronGeometry(r,4),p=g.attributes.position,n=fbm(64,64,{fx:4,fy:4,oct:4,seed:seedv});
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),l=Math.hypot(x,y,z),u=(Math.atan2(z,x)/6.283+.5),v=y/l*.5+.5,h=n[(Math.floor(v*63)*64)+Math.floor(u*63)];const k=1+(h-.5)*.7;p.setXYZ(i,x*k,y*k*.8,z*k)}g.computeVertexNormals();return g}
function branchCoral(seed,col){const r=rng(seed),parts=[];
  function br(pos,dir,len,rad,depth){const end=pos.clone().addScaledVector(dir,len);const g=new T.CylinderGeometry(rad*.7,rad,len,7,1);g.translate(0,len/2,0);const q=new T.Quaternion().setFromUnitVectors(V(0,1,0),dir);g.applyQuaternion(q);g.translate(pos.x,pos.y,pos.z);parts.push(g);
    if(depth>0){const n=2+((r()*2)|0);for(let i=0;i<n;i++){const d=dir.clone().add(V((r()-.5)*1.1,(r()-.3)*.5,(r()-.5)*1.1)).normalize();br(end,d,len*.72,rad*.7,depth-1)}}else{const tg=new T.SphereGeometry(rad*1.1,8,6);tg.translate(end.x,end.y,end.z);parts.push(tg)}}
  for(let k=0;k<3;k++)br(V((r()-.5)*.6,0,(r()-.5)*.6),V((r()-.5)*.5,1,(r()-.5)*.5).normalize(),.9+r()*.5,.12,3);
  return BGU.mergeGeometries(parts)}
function buildAqua(ui){
  const scene=new T.Scene(),skyC=new T.Color(0xe9a884),deepC=new T.Color(0x05384f);
  scene.background=skyC.clone();scene.fog=new T.FogExp2(0xe9a884,.0028);
  const sky=makeSky();sky.material.uniforms.turbidity.value=4;sky.material.uniforms.rayleigh.value=2.6;sky.material.uniforms.mieCoefficient.value=.003;
  const sd=sunDir(1.6,196);sky.material.uniforms.sunPosition.value.copy(sd);
  const skyScene=new T.Scene();skyScene.add(sky.clone?sky.clone():sky);
  const envRT=pmrem.fromScene(skyScene,.02);scene.environment=envRT.texture;scene.environmentIntensity=.9;
  scene.add(sky);
  const sun=sunLight(0xffb27a,5,sd.clone().multiplyScalar(90),46,2048);sun.target.position.set(0,0,10);scene.add(sun,sun.target);
  const hemi=new T.HemisphereLight(0xffd9b8,0x1a5a7a,.45);scene.add(hemi);
  const hA=new T.Color(0xffd9b8),hB=new T.Color(0x4fa8d0),sA=new T.Color(0xffb27a),sB=new T.Color(0x8fd0ff);
  // permukaan air
  const wn=waterNormal();wn.wrapS=wn.wrapT=T.RepeatWrapping;
  const water=new Water(new T.PlaneGeometry(1600,1600),{textureWidth:512,textureHeight:512,waterNormals:wn,sunDirection:sd.clone(),sunColor:0xffc890,waterColor:0x0b4c5e,distortionScale:1.2,size:8,fog:true,alpha:.92});
  water.rotation.x=-Math.PI/2;scene.add(water);
  const under=new T.Mesh(new T.PlaneGeometry(800,800),new T.MeshPhysicalMaterial({color:0x7fd0e8,transparent:true,opacity:.42,roughness:.05,metalness:.1,normalMap:wn,normalScale:new T.Vector2(.6,.6),side:T.BackSide,depthWrite:false,envMapIntensity:.8}));
  under.material.normalMap=wn.clone();under.material.normalMap.repeat.set(60,60);under.material.normalMap.needsUpdate=true;under.rotation.x=-Math.PI/2;under.position.y=.02;scene.add(under);
  const SB=-22;
  const sandM=withCaustics(pbr({hf:ridgeHF(5),fx:5,fy:5,oct:5,c0:0x9b8558,c1:0xd9c691,nS:2,r0:.85,r1:1,rep:[10,10],w:256}),1);
  const sg=new T.PlaneGeometry(320,320,90,90);sg.rotateX(-Math.PI/2);const sp=sg.attributes.position;
  for(let i=0;i<sp.count;i++){const x=sp.getX(i),z=sp.getZ(i);sp.setY(i,SB+Math.sin(x*.09)*1.6+Math.cos(z*.11)*1.4+Math.sin((x+z)*.3)*.4+Math.sin(x*.7+z*.5)*.08)}
  sg.computeVertexNormals();const seabed=new T.Mesh(sg,sandM);seabed.receiveShadow=true;scene.add(seabed);
  // gerbang
  const lacq=pbr({fx:2,fy:24,oct:4,seed:4,c0:0xa82c18,c1:0xc63a20,nS:.6,r0:.3,r1:.55,rep:[1,3],phys:true,mat:{clearcoat:.7,clearcoatRoughness:.25},w:256});
  const dark=pbr({fx:2,fy:20,oct:4,seed:6,c0:0x16110f,c1:0x2a2019,nS:3,r0:.5,r1:.8,rep:[1,2],w:256});
  [-1,1].forEach(s=>{Cyl(.75,.85,16,lacq,s*6,2,0,scene,32);Cyl(1.08,1.08,.6,dark,s*6,-.3,0,scene,32);Box(1.15,.45,1.15,dark,s*6,10.2,0,scene)});
  Box(18,.7,1.5,lacq,0,8.5,0,scene);const kas=Box(20.2,.5,2.1,dark,0,9.05,0,scene);kas.rotation.z=0;
  [-1,1].forEach(s=>{const e=Box(2.4,.5,2.1,dark,s*10.2,9.4,0,scene);e.rotation.z=s*.22});
  Box(15,.5,1,lacq,0,6.5,0,scene);
  const signT=canvas(1024,130),sg2=signT.getContext('2d');sg2.fillStyle='#1c0f0c';sg2.fillRect(0,0,1024,130);sg2.strokeStyle='#c9a24a';sg2.lineWidth=4;sg2.strokeRect(8,8,1008,114);sg2.fillStyle='#f0d59a';sg2.font='800 92px serif';sg2.textAlign='center';sg2.textBaseline='middle';sg2.fillText('AQUARIA',512,70);
  mesh(new T.PlaneGeometry(9,1.15),new T.MeshStandardMaterial({map:ctex(signT),roughness:.5,emissive:0xffffff,emissiveMap:ctex(signT),emissiveIntensity:.25}),0,7.45,.8,scene);
  const lanM=[];const lampMat=()=>{const c=canvas(64,128),g=c.getContext('2d'),q=g.createLinearGradient(0,0,0,128);q.addColorStop(0,'#ffcf7a');q.addColorStop(1,'#ff8a20');g.fillStyle=q;g.fillRect(0,0,64,128);g.strokeStyle='rgba(120,40,0,.5)';for(let i=8;i<128;i+=16){g.beginPath();g.moveTo(0,i);g.lineTo(64,i);g.stroke()}return c};
  const lanTex=ctex(lampMat());
  [-3.4,3.4].forEach(x=>{Cyl(.02,.02,1.4,dark,x,5.3,0,scene,4);const m=new T.MeshStandardMaterial({color:0x331100,emissive:0xffa040,emissiveMap:lanTex,emissiveIntensity:2.2,roughness:.7});const lg=mesh(new T.LatheGeometry([[.05,-.6],[.4,-.45],[.55,0],[.4,.45],[.05,.6]].map(p=>new T.Vector2(p[0],p[1])),24),m,x,4.3,0,scene);lg.castShadow=false;lanM.push(m);
    const pl=new T.PointLight(0xffa040,60,16,2);pl.position.set(x,4.3,.6);scene.add(pl);glow(0xffa040,6,x,4.3,0,scene,.6)});
  const wood=pbr({hf:plankHF(6,1),fx:2,fy:30,oct:4,seed:2,c0:0x3d2718,c1:0x7a5535,nS:4,r0:.65,r1:.95,rep:[3,32],w:256});
  Box(6,.4,64,wood,0,.25,37,scene);for(let z=8;z<68;z+=6)[-1,1].forEach(s=>{Cyl(.16,.2,2.4,wood,s*3,.9,z,scene,10);const lp=Sph(.16,new T.MeshStandardMaterial({color:0x221100,emissive:0xffb060,emissiveIntensity:2.6}),s*3,2.2,z,scene,10,8);lp.castShadow=false;glow(0xffa550,2.6,s*3,2.2,z,scene,.5)});
  [-1,1].forEach(s=>{for(let z=8;z<68;z+=6){const r=Cyl(.03,.03,6,dark,s*3,1.9,z+3,scene,5);r.rotation.x=Math.PI/2}});
  // kolom air
  const shaftM=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,uniforms:{t:{value:0},k:{value:0}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'varying vec2 vUv;uniform float t,k;void main(){float f=pow(clamp(vUv.y,0.,1.),1.4);float s=.7+.3*sin(vUv.x*20.+t);gl_FragColor=vec4(vec3(.5,.85,1.)*.16*f*s*k,f*.16*k);}'});
  const shafts=[];for(let i=0;i<10;i++){const c=new T.Mesh(new T.CylinderGeometry(1.2,7,SB*-1,20,1,true),shaftM);c.position.set(rnd(-30,30),SB/2,rnd(-46,-6));c.rotation.z=rnd(-.2,.2);c.userData.ph=rnd(0,6);scene.add(c);shafts.push(c)}
  // kelp
  const kelpU={uT:{value:0}};
  const kelpM=new T.MeshStandardMaterial({color:0x2d8a52,roughness:.55,side:T.DoubleSide,emissive:0x0b3a1c,emissiveIntensity:.25});withCaustics(kelpM,.5);
  const kOBC=kelpM.onBeforeCompile;kelpM.onBeforeCompile=sh=>{kOBC(sh);sh.uniforms.uT=kelpU.uT;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uT;').replace('#include <begin_vertex>','#include <begin_vertex>\nfloat hh=max(position.y,0.);transformed.x+=sin(uT*.9+position.y*.25+modelMatrix[3][0]*.3)*hh*.055;transformed.z+=cos(uT*.7+position.y*.2+modelMatrix[3][2]*.3)*hh*.045;')};
  for(let i=0;i<70;i++){const h=rnd(9,20),g=new T.PlaneGeometry(rnd(.5,1.1),h,1,16);g.translate(0,h/2,0);const p=g.attributes.position;for(let k=0;k<p.count;k++){const y=p.getY(k)/h;p.setX(k,p.getX(k)*(1-y*.6)+Math.sin(y*6+i)*.15)}g.computeVertexNormals();const k=new T.Mesh(g,kelpM);k.position.set(rnd(-34,34),SB+.6,rnd(-54,-4));k.rotation.y=rnd(0,6.28);scene.add(k)}
  // karang
  const cols=[0xff5a8a,0xff9a3a,0xb06bff,0xffd23a,0x3ad6c8];
  const coralM=cols.map(c=>withCaustics(new T.MeshPhysicalMaterial({color:c,roughness:.5,sheen:1,sheenColor:new T.Color(c),emissive:c,emissiveIntensity:.08}),.8));
  for(let v=0;v<5;v++){const g=branchCoral(10+v),mm=coralM[v];for(let i=0;i<12;i++){const m=new T.Mesh(g,mm);const x=rnd(-36,36),z=rnd(-54,-6);m.position.set(x,SB+Math.sin(x*.09)*1.6+Math.cos(z*.11)*1.4-.2,z);m.rotation.y=rnd(0,6);m.scale.setScalar(rnd(.9,2));m.castShadow=false;scene.add(m)}}
  const rockM=withCaustics(pbr({fx:6,fy:6,oct:6,seed:8,c0:0x2b3236,c1:0x66747a,nS:5,r0:.8,r1:1,rep:[2,2],w:256}),.8);
  for(let i=0;i<26;i++){const x=rnd(-40,40),z=rnd(-58,-8),r=mesh(reefRock(rnd(1,3.4),i+3),rockM,x,SB+Math.sin(x*.09)*1.6+Math.cos(z*.11)*1.4+.3,z,scene);r.rotation.set(rnd(0,3),rnd(0,3),0)}
  const brainG=new T.IcosahedronGeometry(1.4,5),bp=brainG.attributes.position;for(let i=0;i<bp.count;i++){const x=bp.getX(i),y=bp.getY(i),z=bp.getZ(i),k=1+.05*Math.sin(x*14+Math.sin(z*9))*Math.sin(y*12);bp.setXYZ(i,x*k,y*k*.65,z*k)}brainG.computeVertexNormals();
  for(let i=0;i<9;i++){const x=rnd(-30,30),z=rnd(-46,-10);const m=new T.Mesh(brainG,coralM[(i+1)%5]);m.position.set(x,SB+Math.sin(x*.09)*1.6+Math.cos(z*.11)*1.4+.5,z);m.scale.setScalar(rnd(.8,1.7));scene.add(m)}
  // anemon produk
  const heroC=[[-8,-14],[7,-15],[0,-17]];
  const tags=[['Acropora Neon · Rp 245.000',245000],['Anemon Bubble-Tip · Rp 185.000',185000],['Clownfish Pair · Rp 320.000',320000]];
  const tagS=[],heroL=[];
  heroC.forEach((h,i)=>{const gy=SB+3+Math.sin(h[0]*.09)*1.6-1.5;const g=new T.Group();g.position.set(h[0],gy,h[1]-6);scene.add(g);
    if(i===0){const bg=branchCoral(30);const m=new T.Mesh(bg,coralM[0]);m.scale.setScalar(2.4);g.add(m)}
    else if(i===1){const stem=new T.Mesh(new T.CylinderGeometry(.35,.5,.8,16),coralM[1]);stem.position.y=.4;g.add(stem);const tm=new T.MeshPhysicalMaterial({color:0xffb0d0,emissive:0xff4f9a,emissiveIntensity:.5,roughness:.3,sheen:1});for(let k=0;k<70;k++){const a=k*2.4,r=Math.sqrt(k)*.16;const t=new T.Mesh(new T.CylinderGeometry(.035,.06,.9,5),tm);t.position.set(Math.cos(a)*r,.9,Math.sin(a)*r);t.rotation.set(Math.sin(a)*.4,0,-Math.cos(a)*.4);g.add(t);const tip=new T.Mesh(new T.SphereGeometry(.07,6,5),new T.MeshBasicMaterial({color:new T.Color(1.6,.6,1.2),toneMapped:false}));tip.position.set(t.position.x+Math.cos(a)*.18,1.35,t.position.z+Math.sin(a)*.18);g.add(tip)}}
    else{[0,1].forEach(k=>{const m=new T.Mesh(brainG,coralM[4]);m.position.set(k*1.6-.8,.4,0);g.add(m)})}
    const pl=new T.PointLight(cols[i],30,10,2);pl.position.set(h[0],gy+2,h[1]-3);scene.add(pl);heroL.push(pl);
    const s=tagSprite(tags[i][0],'#'+new T.Color(cols[i]).getHexString(),1.1);s.position.set(h[0],gy+5.6,h[1]-6);s.userData.b=0;scene.add(s);tagS.push(s)});
  // gelembung dan partikel
  const bn=300,bg=new T.BufferGeometry(),bp2=new Float32Array(bn*3);for(let i=0;i<bn;i++){bp2[i*3]=rnd(-24,24);bp2[i*3+1]=rnd(SB,0);bp2[i*3+2]=rnd(-46,0)}
  bg.setAttribute('position',new T.BufferAttribute(bp2,3));scene.add(new T.Points(bg,new T.PointsMaterial({map:glowTex,color:0xcff4ff,size:.35,transparent:true,opacity:.55,depthWrite:false,blending:T.AdditiveBlending})));
  const sn=500,sg3=new T.BufferGeometry(),sp3=new Float32Array(sn*3);for(let i=0;i<sn;i++){sp3[i*3]=rnd(-30,30);sp3[i*3+1]=rnd(SB,-1);sp3[i*3+2]=rnd(-50,0)}
  sg3.setAttribute('position',new T.BufferAttribute(sp3,3));const snow=new T.Points(sg3,new T.PointsMaterial({color:0xbfe6f0,size:2,sizeAttenuation:false,transparent:true,opacity:.5,depthWrite:false}));scene.add(snow);
  // ikan
  const bodyG=fishBodyGeo(),tailG=finGeo(1,.9,.7),dorG=finGeo(1.1,.6,.4),pecG=finGeo(.6,.4,.5);
  const SPEC=[['clown','tang','yellow','pink'],['neon','violet','mint','neon'],['koiA','koiB','koiC','koiD']];
  const fishMats=SPEC.map((arr,si)=>arr.map(p=>{const t=fishTex(p);return{body:new T.MeshPhysicalMaterial({map:t,roughness:.32,metalness:.05,clearcoat:.9,clearcoatRoughness:.15,iridescence:.35,iridescenceIOR:1.4,emissive:si===1?0x1a4a7a:0x000000,emissiveMap:si===1?t:null,emissiveIntensity:si===1?.9:0}),
    fin:new T.MeshStandardMaterial({map:t,roughness:.6,side:T.DoubleSide,transparent:true,opacity:.86,depthWrite:false})}}));
  const schools=[0,1,2,3].map(i=>({c:V(0,-11,-26),ph:i*1.7,big:i===3}));
  const fish=[];
  function mkFish(si,big,k){const g=new T.Group(),mm=fishMats[0][k%4];
    const body=new T.Mesh(bodyG,mm.body);body.castShadow=true;body.scale.set(1,1,1);g.add(body);
    const tail=new T.Group();tail.position.x=-1.45;g.add(tail);const tm=new T.Mesh(tailG,mm.fin);tm.rotation.set(0,Math.PI,0);tm.scale.set(1,1,1);tail.add(tm);
    const tm2=new T.Mesh(tailG,mm.fin);tm2.rotation.set(Math.PI/2,Math.PI,0);tm2.scale.set(.9,.9,.9);tail.add(tm2);
    const dor=new T.Mesh(dorG,mm.fin);dor.position.set(.4,.4,0);dor.rotation.set(Math.PI/2,Math.PI,0);dor.scale.set(-.9,.9,.9);g.add(dor);
    const pec=[-1,1].map(s=>{const f=new T.Mesh(pecG,mm.fin);f.position.set(.55,-.1,s*.24);f.rotation.set(s*.5,Math.PI*.8,-.3);g.add(f);return f});
    [-1,1].forEach(s=>{const e=new T.Mesh(new T.SphereGeometry(.09,10,8),new T.MeshStandardMaterial({color:0x080808,roughness:.1,metalness:.3}));e.position.set(1.05,.13,s*.17);g.add(e)});
    const sc=big?rnd(2.2,2.8):rnd(.42,.75);g.scale.setScalar(sc);scene.add(g);
    const o={g,s:sc,si,k:k%4,tail,body,tm,tm2,dor,pec,v:V(rnd(-1,1),0,rnd(-1,1)),off:V(rnd(-5,5),rnd(-2.5,2.5),rnd(-4,4)),sp:big?1.8:rnd(2.4,3.6),ph:rnd(0,6),pulse:0};if(big)o.off.multiplyScalar(2.5);
    g.position.set(rnd(-20,20),rnd(-17,-6),rnd(-40,-14));return o}
  for(let i=0;i<40;i++)fish.push(mkFish(i%3,false,i));for(let i=0;i<2;i++)fish.push(mkFish(3,true,i));
  let spec=0;function recolor(){fish.forEach(o=>{const mm=fishMats[spec][o.k];o.body.material=mm.body;[o.tm,o.tm2,o.dor,...o.pec].forEach(m=>m.material=mm.fin)})}
  const pellets=[];for(let i=0;i<40;i++){const m=Sph(.14,new T.MeshStandardMaterial({color:0xff9a3a,emissive:0xff6a10,emissiveIntensity:.8,roughness:.6}),0,0,0,scene,10,8);m.visible=false;pellets.push({m,a:false,sp:1,ph:0})}
  let fed=0,cartN=0;const tmp=V(0,0,0),desired=V(0,0,0),cart=Cart(ui);
  const B={x:[-28,28],y:[-19.5,-4],z:[-43,-10]};
  return{scene,world:{tags:tagS,clutter:()=>scene.children.filter(o=>o.isMesh&&(o.material===kelpM||coralM.includes(o.material)||o.material===rockM))},pick:[{objects:()=>fish.map(f=>f.g),id:'feed',hint:'Klik: beri makan ikan'}],look:{exp:.75,bloom:[.3,.7,1.5],vig:.4,grain:.02,tint:[1,1,1],sat:1.05},
    setQ(q){water.visible=true},
    update(t,dt,cam){
      const k=clamp((.6-cam.position.y)/2.2,0,1);scene.background.copy(skyC).lerp(deepC,k);scene.fog.color.copy(scene.background);scene.fog.density=lerp(.0028,.03,k);
      hemi.intensity=lerp(.45,.55,k);hemi.color.copy(hA).lerp(hB,k);sun.intensity=lerp(5,1.3,k);sun.color.copy(sA).lerp(sB,k);scene.environmentIntensity=lerp(.9,.45,k);
      sky.visible=k<.98;water.visible=cam.position.y>-.3;under.visible=cam.position.y<.4;water.material.uniforms.time.value=t*.5;
      CAUS.uTime.value=t;CAUS.uAmt.value=k;kelpU.uT.value=t;shaftM.uniforms.t.value=t;shaftM.uniforms.k.value=k;
      const ba=bg.attributes.position;for(let i=0;i<bn;i++){let y=ba.array[i*3+1]+dt*(.8+(i%7)*.15);if(y>0){y=SB;ba.array[i*3]=rnd(-24,24);ba.array[i*3+2]=rnd(-46,0)}ba.array[i*3+1]=y}ba.needsUpdate=true;
      const sa=sg3.attributes.position;for(let i=0;i<sn;i++){sa.array[i*3+1]-=dt*.12;sa.array[i*3]+=Math.sin(t*.3+i)*dt*.05;if(sa.array[i*3+1]<SB)sa.array[i*3+1]=-1}sa.needsUpdate=true;
      schools.forEach(s=>{s.c.set(Math.sin(t*.13+s.ph)*(s.big?18:14),-11+Math.sin(t*.21+s.ph*2)*4,-26+Math.cos(t*.11+s.ph)*(s.big?12:9))});
      pellets.forEach(p=>{if(!p.a)return;p.m.position.y-=dt*p.sp;p.m.position.x+=Math.sin(t*2+p.ph)*dt*.15;if(p.m.position.y<SB+1){p.a=false;p.m.visible=false}});
      fish.forEach(f=>{const g=f.g,p=g.position;let sp=f.sp;
        desired.copy(schools[f.si].c).add(f.off).sub(p);
        let best=null,bd=1e9;pellets.forEach(q=>{if(!q.a)return;const d=p.distanceTo(q.m.position);if(d<bd){bd=d;best=q}});
        if(best&&bd<42&&!(f.si===3&&bd>16)){desired.copy(best.m.position).sub(p);sp=f.sp*2.6;if(bd<.9*(f.s>1?3:1)){best.a=false;best.m.visible=false;fed++;f.pulse=1;ui.stat('fed',fed+' ekor kenyang');if(fed===15)ui.stat('voucher','PAKAN10 terbuka')}}
        desired.setLength(sp);f.v.lerp(desired,1-Math.exp(-dt*1.6));
        for(let j=0;j<fish.length;j+=3){const o=fish[(j+f.si)%fish.length];if(o===f)continue;const d=p.distanceTo(o.g.position);if(d<1.4*f.s+.6){tmp.subVectors(p,o.g.position).setLength(dt*6);f.v.add(tmp)}}
        p.addScaledVector(f.v,dt);p.x=clamp(p.x,B.x[0],B.x[1]);p.y=clamp(p.y,B.y[0],B.y[1]);p.z=clamp(p.z,B.z[0],B.z[1]);
        const vl=f.v.length()||1;g.rotation.order='YZX';g.rotation.y=Math.atan2(-f.v.z,f.v.x);g.rotation.z=Math.asin(clamp(f.v.y/vl,-1,1));
        const w=Math.sin(t*(4+vl*2.2)+f.ph);f.tail.rotation.y=w*.5;f.body.rotation.y=w*.06;f.pec.forEach((q,i)=>q.rotation.x=(i?1:-1)*(.5+Math.sin(t*3+f.ph)*.25));
        f.pulse=Math.max(0,f.pulse-dt*2);g.scale.setScalar(f.s*(1+f.pulse*.35))});
      tagS.forEach(s=>{s.userData.b=Math.max(0,s.userData.b-dt*2);const bs=1.1*(1+s.userData.b*.4);s.scale.set(bs*640/120,bs,1)});
    },
    actions:{
      feed(){let n=0;pellets.forEach(p=>{if(!p.a&&n<12){n++;p.a=true;p.ph=rnd(0,6);p.sp=rnd(.9,1.5);p.m.visible=true;p.m.position.set(rnd(-4.5,4.5),rnd(-2,-.5),rnd(-19,-12))}})},
      species(i){spec=i;recolor()},
      cart(){const t=tags[cartN%3];tagS[cartN%3].userData.b=1;cartN++;cart(t[0],t[1])}
    }};
}

export const concept={id:'aqua',hdris:[],name:'AQUARIA',type:'E-commerce',acc:'#38d6c4',build:buildAqua,
 brief:{Sektor:'Toko akuarium dan biota laut. E-commerce.',Kamera:'Dermaga menuju gerbang merah saat senja, dolly rendah, lalu menukik menembus permukaan air ke etalase bawah laut.',Interaksi:'Beri makan (pelet jatuh, ikan mengejar), ganti spesies, tambah produk ke keranjang dari label yang melayang di dekat karang.',Teknik:'Sky fisik dengan matahari terbenam, air dengan pantulan dan pembiasan, kaustik di dasar laut, kabut yang berubah menurut kedalaman, ikan bertekstur sisik dengan clearcoat, dan steering kawanan.',Varian:'Hitung ikan kenyang untuk membuka voucher. Ganti spesies menjadi katalog produk sungguhan.'},
 slides:[
  {tag:'Bab 1 · Gerbang',title:'Gerbang merah di ujung dermaga',text:'Matahari terbenam tepat di belakang gerbang. Kamera rendah di atas kayu dermaga, laut tenang di kiri dan kanan.',cam:[0,3.4,46],look:[0,5.5,0]},
  {tag:'Bab 2 · Ambang',title:'Satu langkah sebelum menyelam',text:'Kamera turun mendekati permukaan. Lentera gerbang memantul di air sebagai tanda pintu masuk toko.',cam:[0,2.3,15],look:[0,3.6,0]},
  {tag:'Bab 3 · Menyelam',title:'Permukaan air pecah',text:'Kamera menembus permukaan. Langit oranye berubah menjadi biru pekat dan kabut menebal, tanpa cut.',cam:[0,-1.6,-2.5],look:[0,-9,-17]},
  {tag:'Bab 4 · Etalase',title:'Toko yang berenang',text:'Produk melayang di antara karang. Beri makan ikan, ganti spesies, lalu masukkan yang Anda suka ke keranjang.',cam:[0,-9,-8.5],look:[0,-10.5,-28],ui:[AC('feed','Beri makan'),CY('species','Spesies',['Tropis','Laut dalam','Koi']),AC('cart','Tambah ke keranjang'),ST('fed','Ikan kenyang','0 ekor kenyang'),ST('voucher','Voucher','terkunci'),ST('cart','Keranjang','0 item')]}
 ]};

/* dipakai ulang oleh situs 3D (js/world/aqua.js) untuk model produk */
export {fishBodyGeo,finGeo,fishTex,branchCoral,reefRock,FISH_PAT,withCaustics};
