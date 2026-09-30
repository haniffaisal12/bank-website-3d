/* Konsep celeste — modul mandiri, dimuat oleh concepts/celeste.html */
import {$,AC,BGU,Box,CY,Cart,Cyl,EXRLoader,EffectComposer,GTAOPass,OutputPass,RBox,Reflector,RenderPass,RoundedBoxGeometry,ST,ShaderPass,Sky,Sph,T,TG,UnrealBloomPass,V,Water,brickHF,camera,canvas,clamp,ctex,dtex,emis,envCache,fbm,floorMat,glow,glowTex,hdri,hex2,leafGeo,leafMat,leafTexture,lerp,loadHdri,makeSky,mesh,noShadow,pbr,perfHF,physM,plankHF,pmrem,reduce,renderer,ridgeHF,rnd,rng,sstep,starField,stdM,sunDir,sunLight,tagSprite,textTex,tileHF,waterNormal,weaveHF,wetFloor,windowTex} from '../core.js';
/* ==========================================================
   KONSEP 6 — CELESTE : observatorium gunung -> kubah & teleskop
   ========================================================== */
function milkyWay(){
  const w=1024,h=512,c=canvas(w,h),g=c.getContext('2d'),id=g.createImageData(w,h),n1=fbm(w,h,{fx:6,fy:3,oct:6,seed:3}),n2=fbm(w,h,{fx:12,fy:6,oct:4,seed:9});
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,u=x/w,v=y/h;const cy=.5+.18*Math.sin(u*6.283*1+.6);const d=(v-cy)/.09;const band=Math.exp(-d*d);const dust=Math.max(0,n2[i]-.48)*3.2;const b=clamp(band*(.35+n1[i]*1.1)-dust*band*.7,0,1.4);
    const bg=.012+.02*n1[i];id.data[i*4]=(bg+b*.62)*255;id.data[i*4+1]=(bg*1.2+b*.6)*255;id.data[i*4+2]=(bg*2+b*.72)*255;id.data[i*4+3]=255}
  g.putImageData(id,0,0);const r=rng(5);for(let i=0;i<6000;i++){const x=r()*w,y=r()*h,k=Math.pow(r(),4);g.fillStyle=`rgba(255,255,255,${.25+k*.75})`;const s=.4+k*1.4;g.fillRect(x,y,s,s)}
  const t=ctex(c);t.mapping=T.EquirectangularReflectionMapping;return t}
function moonTex(){const w=512,h=256,c=canvas(w,h),g=c.getContext('2d'),n=fbm(w,h,{fx:6,fy:3,oct:6,seed:8}),id=g.createImageData(w,h);for(let i=0;i<w*h;i++){const v=170+n[i]*70;id.data[i*4]=v;id.data[i*4+1]=v;id.data[i*4+2]=v*.97;id.data[i*4+3]=255}g.putImageData(id,0,0);const r=rng(4);for(let i=0;i<90;i++){const x=r()*w,y=r()*h,rad=3+Math.pow(r(),3)*26;g.fillStyle='rgba(60,60,64,.35)';g.beginPath();g.arc(x,y,rad,0,7);g.fill();g.strokeStyle='rgba(235,235,235,.35)';g.lineWidth=1.5;g.beginPath();g.arc(x-rad*.1,y-rad*.1,rad,0,7);g.stroke()}return ctex(c)}
function planetTex(kind){const w=512,h=256,c=canvas(w,h),g=c.getContext('2d'),n=fbm(w,h,{fx:4,fy:8,oct:5,seed:kind.length}),id=g.createImageData(w,h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,v=y/h;let r,gg,b;
    if(kind==='jupiter'){const band=Math.sin(v*38+n[i]*3)*.5+.5;r=200+band*45+n[i]*20;gg=150+band*60;b=110+band*60-n[i]*30}
    else if(kind==='saturn'){const band=Math.sin(v*24+n[i]*2)*.5+.5;r=215+band*30;gg=190+band*30;b=140+band*35}
    else{const m=n[i];r=170+m*70;gg=80+m*50;b=50+m*30;if(m<.4){r*=.55;gg*=.55;b*=.6}}
    id.data[i*4]=r;id.data[i*4+1]=gg;id.data[i*4+2]=b;id.data[i*4+3]=255}
  g.putImageData(id,0,0);if(kind==='jupiter'){g.fillStyle='rgba(180,70,40,.7)';g.beginPath();g.ellipse(w*.6,h*.63,26,14,0,0,7);g.fill()}return ctex(c)}
function ringTex(){const c=canvas(512,8),g=c.getContext('2d'),r=rng(2);for(let x=0;x<512;x++){const u=x/512;const a=u<.08?0:u>.98?0:(.35+.5*Math.abs(Math.sin(u*40+r()*.5)))*(u>.55&&u<.6?.05:1);g.fillStyle=`rgba(226,205,160,${a})`;g.fillRect(x,0,1,8)}return ctex(c)}
function nebulaTex(){const w=256,c=canvas(w,w),g=c.getContext('2d'),n=fbm(w,w,{fx:4,fy:4,oct:5,seed:11}),id=g.createImageData(w,w);for(let y=0;y<w;y++)for(let x=0;x<w;x++){const i=y*w+x,d=Math.hypot(x-w/2,y-w/2)/(w/2),f=Math.max(0,1-d)**1.5*(.4+n[i]*1.2);id.data[i*4]=(1.0*f+.2*n[i])*255;id.data[i*4+1]=(.3*f+.1)*255;id.data[i*4+2]=(.7*f+.4*n[i]*f)*255;id.data[i*4+3]=f*255}g.putImageData(id,0,0);return ctex(c)}
function buildCeleste(ui){
  const scene=new T.Scene();scene.background=new T.Color(0x02030a);scene.fog=new T.FogExp2(0x040817,.0028);
  scene.environment=hdri('night');scene.environmentIntensity=.55;
  const sky=new T.Mesh(new T.SphereGeometry(1000,48,32),new T.MeshBasicMaterial({map:milkyWay(),side:T.BackSide,fog:false,toneMapped:false,color:new T.Color(1.5,1.5,1.7)}));sky.rotation.set(.5,1.2,.3);scene.add(sky);
  scene.add(starField(3800,900,1.4,false,.7));
  const moonL=sunLight(0xaec4ff,2.2,V(-70,90,-110),60,2048);moonL.target.position.set(0,2,0);scene.add(moonL,moonL.target);scene.add(new T.HemisphereLight(0x3a4c7a,0x0a0a12,.35));
  const moonM=new T.Mesh(new T.SphereGeometry(18,48,32),new T.MeshBasicMaterial({map:moonTex(),color:new T.Color(1.9,1.9,2),fog:false,toneMapped:false}));moonM.position.set(-190,120,-360);scene.add(moonM);glow(0xaec4ff,190,-190,120,-360,scene,.7);
  // aurora
  const aur=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,fog:false,uniforms:{t:{value:0}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.z+=sin(p.x*.02+p.y*.01)*20.;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}',
    fragmentShader:`varying vec2 vUv;uniform float t;float h(float x){return fract(sin(x*127.1)*43758.5453);}float n(float x){float i=floor(x),f=fract(x);return mix(h(i),h(i+1.),f*f*(3.-2.*f));}
      void main(){float x=vUv.x*14.;float s=n(x+t*.15)*.6+n(x*2.3-t*.1)*.4;float fall=pow(1.-vUv.y,1.6)*smoothstep(0.,.12,vUv.y);float rays=.6+.4*n(x*9.+t*.3);vec3 c=mix(vec3(.1,1.,.5),vec3(.5,.2,.9),vUv.y);gl_FragColor=vec4(c*fall*s*rays*.55,fall*s*.5);}`});
  [[0,-420,110,900],[-260,-380,90,700]].forEach((a,i)=>{const m=new T.Mesh(new T.PlaneGeometry(a[3],130,120,1),aur);m.position.set(a[0],a[2]+50,a[1]);m.rotation.y=i?.5:0;scene.add(m)});
  // medan
  const hFn=(x,z)=>{const d=Math.hypot(x,z);let h=(Math.sin(x*.03)*Math.cos(z*.026)*9+Math.sin(x*.09+z*.07)*3+Math.sin(z*.05+1)*5+10)*sstep(14,80,d);return Math.max(h,0)+Math.max(0,(d-40))*.06*sstep(30,120,d)};
  const tg=new T.PlaneGeometry(800,800,220,220);tg.rotateX(-Math.PI/2);const tp=tg.attributes.position,tc=new Float32Array(tp.count*3);
  for(let i=0;i<tp.count;i++){const x=tp.getX(i),z=tp.getZ(i),h=hFn(x,z);tp.setY(i,h-.05)}tg.computeVertexNormals();const tn=tg.attributes.normal;
  for(let i=0;i<tp.count;i++){const h=tp.getY(i),slope=1-tn.getY(i);const snow=sstep(.12,.02,slope)*sstep(2,10,h+2)+sstep(.03,.0,slope)*.6;const rock=new T.Color(0x2c3548),sn=new T.Color(0xdfe9ff);const c=rock.lerp(sn,clamp(snow+ (h<3?.75:0),0,1));tc[i*3]=c.r;tc[i*3+1]=c.g;tc[i*3+2]=c.b}
  tg.setAttribute('color',new T.BufferAttribute(tc,3));
  const snowM=pbr({fx:10,fy:10,oct:6,seed:14,c0:0xb8b8c0,c1:0xffffff,nS:3,r0:.55,r1:.9,rep:[80,80],w:256,mat:{vertexColors:true}});
  const terr=new T.Mesh(tg,snowM);terr.receiveShadow=true;terr.castShadow=true;scene.add(terr);
  // pinus
  const pineG=BGU.mergeGeometries([0,1,2,3].map(i=>{const c=new T.ConeGeometry(2.4-i*.4,3.4,10);c.translate(0,3+i*1.9,0);return c}).concat([(()=>{const t=new T.CylinderGeometry(.25,.35,3,6);t.translate(0,1.5,0);return t})()]));
  const NP=140,pines=new T.InstancedMesh(pineG,new T.MeshStandardMaterial({color:0x1b3a2c,roughness:.9}),NP),dm=new T.Object3D();let pi_=0;
  while(pi_<NP){const a=rnd(0,6.28),d=rnd(26,130),x=Math.cos(a)*d,z=Math.sin(a)*d;if(Math.abs(x)<9&&z>0&&z<60)continue;const h=hFn(x,z);dm.position.set(x,h-.1,z);dm.rotation.set(0,rnd(0,6),0);dm.scale.setScalar(rnd(.8,1.7));dm.updateMatrix();pines.setMatrixAt(pi_++,dm.matrix)}
  pines.castShadow=true;pines.frustumCulled=false;scene.add(pines);
  // observatorium
  const stone=pbr({hf:brickHF(8,6),fx:6,fy:6,oct:4,seed:19,c0:0x3a3d46,c1:0x7a7f8c,nS:4,r0:.8,r1:1,rep:[10,1],w:256});
  Cyl(12,13,.3,stone,0,0,0,scene,48);
  const wallM=pbr({hf:ridgeHF(14),fx:2,fy:14,oct:3,seed:20,c0:0xa8acb8,c1:0xd4d7de,nS:1,r0:.55,r1:.85,rep:[6,1],w:256,mat:{side:T.DoubleSide}});
  const wall=new T.Mesh(new T.CylinderGeometry(6,6,6,64,1,true,.2,Math.PI*2-.4),wallM);wall.position.y=3;wall.castShadow=wall.receiveShadow=true;scene.add(wall);
  Cyl(6.05,6.05,.55,stone,0,.28,0,scene,64);
  const flo=pbr({hf:plankHF(12,1),fx:2,fy:30,oct:4,seed:22,c0:0x4a3220,c1:0x8a6238,nS:2,r0:.4,r1:.75,rep:[3,3],w:256});Cyl(5.9,5.9,.08,flo,0,.6,0,scene,64);
  const woodD=pbr({fx:2,fy:26,oct:4,seed:3,c0:0x3a2616,c1:0x6a4a2c,nS:3,r0:.5,r1:.8,rep:[1,4],w:256});
  [-1,1].forEach(s=>Box(.3,4.2,.3,woodD,s*1.2,2.1,5.98,scene));Box(2.7,.3,.3,woodD,0,4.2,5.98,scene);
  for(let i=0;i<4;i++)Box(3+i*.4,.3,.9,stone,0,.3-i*.08,6.6+i*.9,scene);
  const doorL=new T.PointLight(0xffc890,220,26,2);doorL.position.set(0,2.6,4.6);doorL.castShadow=true;doorL.shadow.mapSize.set(512,512);scene.add(doorL);glow(0xffc890,9,0,2.2,5.6,scene,.5);
  [-2.6,2.6].forEach(x=>{Cyl(.06,.08,2.4,woodD,x,1.2,8,scene,8);const lm=new T.MeshStandardMaterial({color:0x221100,emissive:0xffc070,emissiveIntensity:3});Sph(.18,lm,x,2.55,8,scene,12,8).castShadow=false;glow(0xffc070,3.4,x,2.55,8,scene,.6)});
  const domeM=pbr({hf:tileHF(16,.012),fx:4,fy:4,oct:3,seed:25,c0:0xd0d6e2,c1:0xf2f5fb,nS:4,r0:.28,r1:.5,rep:[1,1],metal:.7,w:256,mat:{side:T.DoubleSide}});
  const dA=mesh(new T.SphereGeometry(6.1,64,24,0,Math.PI,0,Math.PI/2),domeM,0,6,0,scene),dB=mesh(new T.SphereGeometry(6.1,64,24,Math.PI,Math.PI,0,Math.PI/2),domeM,0,6,0,scene);
  const brass=stdM(0xb08a3c,{metalness:1,roughness:.3});
  const rimR=new T.Mesh(new T.CylinderGeometry(6.2,6.2,.35,64,1,true),new T.MeshStandardMaterial({color:0x9aa4b8,metalness:.6,roughness:.5,side:T.DoubleSide}));rimR.position.y=6.05;scene.add(rimR);
  const lamp=new T.PointLight(0xffc890,45,16,2);lamp.position.set(0,5.2,2);scene.add(lamp);
  const redL=new T.PointLight(0xff3a20,8,8,2);redL.position.set(3.5,1.6,-2.5);scene.add(redL);
  // teleskop refraktor kuningan di atas tripod (detail mengikuti pelajaran dari aset referensi: profil bertingkat, cincin,
  // dudukan bercabang, tabung pencari dengan braket, sambungan kaki tiga bagian)
  const PX=-1.9,PZ=-1.2;
  const brushed=pbr({hf:ridgeHF(90),fx:2,fy:60,oct:2,seed:30,c0:0xd8dade,c1:0xf6f7fa,nS:.8,r0:.28,r1:.42,rep:[6,1],metal:.9,w:256});
  const brassM=new T.MeshStandardMaterial({color:0xd0a24a,metalness:1,roughness:.26,envMapIntensity:1.4,normalMap:brushed.normalMap,normalScale:new T.Vector2(.35,.35)});
  const steelM=new T.MeshStandardMaterial({color:0xc9ced6,metalness:1,roughness:.2,envMapIntensity:1.4});
  const darkM=new T.MeshStandardMaterial({color:0x1d2128,metalness:.85,roughness:.32,envMapIntensity:1.2});
  const blackM=stdM(0x0c0d10,{roughness:.55});
  const glassM=new T.MeshPhysicalMaterial({color:0x14204a,metalness:.2,roughness:.03,clearcoat:1,envMapIntensity:2.6});
  const rig=new T.Group();rig.position.set(PX,.64,PZ);scene.add(rig);
  const L=(prof,mat,x,y,z,par,seg)=>mesh(new T.LatheGeometry(prof.map(q=>new T.Vector2(q[0],q[1])),seg||48),mat,x,y,z,par);
  const strut=(p0,p1,r0,r1,mat,par)=>{const d=p0.clone().sub(p1),len=d.length(),m=new T.Mesh(new T.CylinderGeometry(r0,r1,len,20),mat);m.position.copy(p0).add(p1).multiplyScalar(.5);m.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());m.castShadow=m.receiveShadow=true;par.add(m);return m};
  // tripod: kaki tiga bagian dengan klem kuningan dan telapak karet
  const HUB=1.32;
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3+.4,leg=new T.Group();leg.rotation.y=a;rig.add(leg);
    const top=V(0,HUB,.09),mid=V(0,HUB*.52,.52),foot=V(0,.05,.98);
    strut(top,mid,.046,.04,darkM,leg);strut(mid,foot,.038,.028,darkM,leg);
    const clamp=Cyl(.056,.056,.13,brassM,0,0,0,leg,20);clamp.position.copy(mid);clamp.quaternion.setFromUnitVectors(V(0,1,0),top.clone().sub(foot).normalize());
    const lug=RBox(.11,.08,.13,.02,brassM,0,HUB+.02,.1,leg);lug.rotation.x=.25;
    Cyl(.052,.06,.05,blackM,0,.025,.99,leg,16);
    Sph(.03,brassM,0,HUB*.52+.1,.54,leg,10,8);
    // batang penyangga ke pusat
    strut(V(0,HUB*.62,.34),V(0,HUB*.62,0),.012,.012,steelM,leg);
  }
  // pusat tripod dan kolom bertingkat
  L([[.001,HUB-.09],[.15,HUB-.09],[.16,HUB-.05],[.13,HUB+.02],[.09,HUB+.05],[.001,HUB+.05]],brassM,0,0,0,rig,48);
  L([[.001,HUB+.05],[.055,HUB+.05],[.06,HUB+.14],[.048,HUB+.2],[.048,HUB+.45],[.07,HUB+.48],[.07,HUB+.56],[.052,HUB+.6],[.052,HUB+.72],[.075,HUB+.75],[.075,HUB+.8],[.001,HUB+.8]],steelM,0,0,0,rig,40);
  [.3,.62].forEach(y=>{const k=mesh(new T.CylinderGeometry(.018,.018,.13,10),blackM,.075,HUB+y,0,rig);k.rotation.z=Math.PI/2;Sph(.032,blackM,.135,HUB+y,0,rig,10,8)});
  // garpu dudukan
  const PV=HUB+1.02;
  L([[.001,HUB+.8],[.11,HUB+.8],[.11,HUB+.86],[.001,HUB+.86]],brassM,0,0,0,rig,40);
  [-1,1].forEach(sd=>{const arm=RBox(.05,.32,.07,.018,brassM,sd*.13,HUB+1.0,0,rig);arm.rotation.z=sd*.02;const cap=mesh(new T.CylinderGeometry(.045,.045,.06,24),brassM,sd*.13,PV,0,rig);cap.rotation.z=Math.PI/2;
    Sph(.038,brassM,sd*.185,PV,0,rig,16,12);const kn=mesh(new T.CylinderGeometry(.028,.028,.07,12),blackM,sd*.23,PV,0,rig);kn.rotation.z=Math.PI/2});
  const axle=mesh(new T.CylinderGeometry(.018,.018,.28,12),steelM,0,PV,0,rig);axle.rotation.z=Math.PI/2;
  // tabung: sumbu +Y adalah arah bidik, titik putar di pusat garpu
  const tube=new T.Group();tube.position.set(0,PV,0);rig.add(tube);
  L([[.1,-.62],[.1,-.5],[.118,-.46],[.118,.62],[.124,.66],[.124,.9],[.15,.94],[.15,1.2],[.144,1.22],[.144,1.02]],brassM,0,0,0,tube,64);   // badan + tudung embun
  L([[.144,1.02],[.13,.96],[.13,.9]],blackM,0,0,0,tube,64);
  L([[.001,-.62],[.1,-.62],[.1,-.5],[.001,-.5]],brassM,0,0,0,tube,48);
  [-.28,.06,.42,.62,.9,1.2].forEach((y,i)=>{const r=mesh(new T.TorusGeometry(i>3?.152:.12,.011,8,64),i%2?steelM:brassM,0,y,0,tube);r.rotation.x=Math.PI/2});
  mesh(new T.CylinderGeometry(.128,.128,.01,48),glassM,0,.92,0,tube).castShadow=false;      // lensa objektif
  // okuler bertingkat dan penampang fokus
  L([[.001,-1.06],[.038,-1.06],[.046,-1.02],[.046,-.9],[.062,-.86],[.062,-.78],[.046,-.75],[.046,-.62]],steelM,0,0,0,tube,32);
  mesh(new T.TorusGeometry(.05,.016,8,24),blackM,0,-1.04,0,tube).rotation.x=Math.PI/2;
  const fo=RBox(.08,.18,.09,.02,brassM,.14,-.55,0,tube);const fk=mesh(new T.CylinderGeometry(.03,.03,.16,14),blackM,.22,-.55,0,tube);fk.rotation.z=Math.PI/2;
  // tabung pencari dengan dua braket bercincin
  const fx=.0,fz=-.235;
  L([[.048,-.18],[.048,.3],[.058,.32],[.058,.44],[.05,.46],[.05,.5]],darkM,fx,0,fz,tube,32);
  L([[.001,-.18],[.048,-.18],[.03,-.3],[.028,-.42],[.001,-.42]],steelM,fx,0,fz,tube,32);
  mesh(new T.CylinderGeometry(.046,.046,.008,24),glassM,fx,.46,fz,tube).castShadow=false;
  [-.02,.3].forEach(y=>{const r=mesh(new T.TorusGeometry(.058,.009,8,32),brassM,fx,y,fz,tube);r.rotation.x=Math.PI/2;
    [-1,1].forEach(sd=>{const arm=RBox(.012,.014,.16,.004,brassM,fx+sd*.05,y,fz/2-.03,tube)});
    const post=mesh(new T.CylinderGeometry(.011,.011,.12,8),steelM,0,y,fz*.6,tube);post.rotation.x=Math.PI/2});
  // baut pengunci
  [[.12,.3],[-.12,.3],[.12,-.35]].forEach(q=>Sph(.018,steelM,q[0],q[1],.03,tube,8,6));
  const upv=V(0,1,0),qFrom=new T.Quaternion(),qTo=new T.Quaternion();
  // isi ruang
  Cyl(1,1,.08,woodD,2.6,1.05,-2.4,scene,32);Cyl(.08,.1,1,stdM(0x2a2f3a,{metalness:.6}),2.6,.55,-2.4,scene,10);
  const chart=canvas(256,256),cg=chart.getContext('2d');cg.fillStyle='#0a1430';cg.fillRect(0,0,256,256);cg.strokeStyle='rgba(160,190,255,.5)';for(let i=1;i<5;i++){cg.beginPath();cg.arc(128,128,i*26,0,7);cg.stroke()}const cr=rng(7);cg.fillStyle='#fff';for(let i=0;i<90;i++){cg.fillRect(cr()*256,cr()*256,1.5,1.5)}cg.strokeStyle='rgba(255,220,150,.7)';cg.beginPath();cg.moveTo(60,80);cg.lineTo(100,110);cg.lineTo(150,90);cg.lineTo(190,140);cg.stroke();
  const ctop=mesh(new T.CircleGeometry(.95,40),stdM(0xffffff,{map:ctex(chart),roughness:.6}),2.6,1.1,-2.4,scene);ctop.rotation.x=-Math.PI/2;ctop.castShadow=false;
  const globe=mesh(new T.SphereGeometry(.42,32,20),new T.MeshStandardMaterial({map:ctex(chart),roughness:.4,metalness:.3,emissive:0x203060,emissiveIntensity:.5}),2.6,1.62,-2.4,scene);
  for(let i=0;i<2;i++){const m=new T.Group();m.position.set(3.7-i*.6,1.05,-1.2-i*1.1);m.rotation.y=.6;scene.add(m);Cyl(.09,.11,.9,brushed,0,.5,0,m,20).rotation.z=.9;Cyl(.03,.03,.5,stdM(0x222222),.05,.15,0,m,8)}
  const shelf=new T.Group();shelf.position.set(-5.5,0,-.5);scene.add(shelf);Box(.4,2.8,5,woodD,0,1.9,0,shelf);
  const bc=[0x8a2a2a,0x2a4a8a,0x2a7a4a,0xc9a23a,0x5a2a6a];for(let r=0;r<3;r++)for(let i=0;i<14;i++){Box(.22,.5+Math.random()*.25,.14,stdM(bc[(i+r)%5],{roughness:.7}),.06,1.3+r*.85,-2.2+i*.32,shelf)}
  const prod=[['Refraktor CX-80 · Rp 7.900.000',7900000],['Reflektor Dobson 8" · Rp 11.500.000',11500000]];
  const ts=prod.map((p,i)=>{const s=tagSprite(p[0],'#b9a6ff',.4);s.position.set(i?3.6:2.6,i?2.7:2.6,i?-1.6:-2.4);scene.add(s);return s});
  // planet di langit
  const P=[
    {name:'Saturnus',dir:V(.1,.975,-.2),make(){const g=new T.Group();g.add(new T.Mesh(new T.SphereGeometry(6,48,32),new T.MeshBasicMaterial({map:planetTex('saturn'),toneMapped:false,color:new T.Color(1.3,1.3,1.3)})));const r=new T.Mesh(new T.RingGeometry(7.5,14,96),new T.MeshBasicMaterial({map:ringTex(),transparent:true,side:T.DoubleSide,depthWrite:false,toneMapped:false,color:new T.Color(1.2,1.2,1.2)}));const rp=r.geometry.attributes.position,uv=r.geometry.attributes.uv;for(let i=0;i<rp.count;i++){const rad=Math.hypot(rp.getX(i),rp.getY(i));uv.setXY(i,(rad-7.5)/6.5,.5)}r.rotation.x=Math.PI/2.5;g.add(r);g.rotation.z=.3;return g}},
    {name:'Jupiter',dir:V(-.2,.955,-.2),make(){const g=new T.Group();g.add(new T.Mesh(new T.SphereGeometry(8,48,32),new T.MeshBasicMaterial({map:planetTex('jupiter'),toneMapped:false,color:new T.Color(1.25,1.25,1.25)})));return g}},
    {name:'Mars',dir:V(.2,.965,-.15),make(){const g=new T.Group();g.add(new T.Mesh(new T.SphereGeometry(5,48,32),new T.MeshBasicMaterial({map:planetTex('mars'),toneMapped:false,color:new T.Color(1.2,1.1,1.1)})));g.add(glow(0xff8a5a,18,0,0,0,null,.4));return g}},
    {name:'Nebula Orion',dir:V(0,.985,-.17),make(){const g=new T.Group();const s=new T.Sprite(new T.SpriteMaterial({map:nebulaTex(),transparent:true,blending:T.AdditiveBlending,depthWrite:false,fog:false,toneMapped:false}));s.scale.set(90,90,1);g.add(s);return g}}
  ];
  P.forEach(p=>{p.o=p.make();p.o.position.copy(p.dir).multiplyScalar(110);p.o.visible=false;scene.add(p.o)});
  const cons=new T.Group();scene.add(cons);cons.visible=false;
  [[[-28,4],[-20,12],[-12,10],[-4,18],[6,14],[14,22]],[[20,-8],[26,-2],[34,-6],[30,6]]].forEach((pts,k)=>{const ps=pts.map(p=>V(p[0]+(k?10:-14),98,-32+p[1]*.7));ps.forEach(p=>glow(0xcfe0ff,5,p.x,p.y,p.z,cons,.9));cons.add(new T.Line(new T.BufferGeometry().setFromPoints(ps),new T.LineBasicMaterial({color:0x8fb0ff,transparent:true,opacity:.7,fog:false})))});
  const shots=[];for(let i=0;i<3;i++){const m=new T.Mesh(new T.PlaneGeometry(14,.14),new T.MeshBasicMaterial({color:new T.Color(2,2.4,3),transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,fog:false,toneMapped:false}));scene.add(m);shots.push({m,t:-rnd(1,6),d:V(0,0,0),o:V(0,300,0)})}
  const snowP=(()=>{const n=600,g=new T.BufferGeometry(),p=new Float32Array(n*3);for(let i=0;i<n;i++){p[i*3]=rnd(-40,40);p[i*3+1]=rnd(0,25);p[i*3+2]=rnd(-20,50)}g.setAttribute('position',new T.BufferAttribute(p,3));const o=new T.Points(g,new T.PointsMaterial({color:0xdfe9ff,size:.05,transparent:true,opacity:.6,depthWrite:false}));scene.add(o);return o})();
  let openK=1,openT=1,aim=0,cartN=0;const cart=Cart(ui);
  return{scene,look:{exp:1.05,bloom:[.45,.8,1.2],vig:.4,grain:.02,tint:[.98,1,1.05],sat:1.05},
    update(t,dt,cam){
      aur.uniforms.t.value=t;
      openK+=(openT-openK)*(1-Math.exp(-dt*1.1));const s=sstep(0,1,openK)*3.7;dA.position.z=s;dB.position.z=-s;
      qFrom.copy(tube.quaternion);qTo.setFromUnitVectors(upv,P[aim].dir);tube.quaternion.copy(qFrom.slerp(qTo,1-Math.exp(-dt*1.4)));
      P.forEach((p,i)=>{p.o.rotation.y+=dt*.05;p.o.visible=i===aim&&openK>.2});globe.rotation.y+=dt*.3;
      shots.forEach(sh=>{sh.t+=dt;if(sh.t>0&&sh.t<1){const k=sh.t;sh.m.material.opacity=Math.sin(k*Math.PI)*.9;sh.m.position.copy(sh.d.clone().multiplyScalar(k)).add(sh.o)}else if(sh.t>=1){sh.t=-rnd(2,7);const a=rnd(0,6.28),e=rnd(.25,.7);sh.o=V(Math.cos(a)*Math.cos(e)*300,Math.sin(e)*300,Math.sin(a)*Math.cos(e)*300);sh.d=V(rnd(-60,60),-rnd(20,50),rnd(-60,60));sh.m.lookAt(0,0,0);sh.m.rotation.z=Math.atan2(sh.d.y,sh.d.x)}});
      lamp.intensity=45+Math.sin(t*2.3)*2;doorL.intensity=220+Math.sin(t*5)*6;
      const sa=snowP.geometry.attributes.position;for(let i=0;i<sa.count;i++){sa.array[i*3+1]-=dt*(.3+(i%5)*.06);sa.array[i*3]+=Math.sin(t*.5+i)*dt*.1;if(sa.array[i*3+1]<0)sa.array[i*3+1]=25}sa.needsUpdate=true;
      if(cam){const ins=cam.position.z<5.6&&Math.hypot(cam.position.x,cam.position.z)<5.8&&cam.position.y<5;this.look.exp=ins?1.15:1.05}
    },
    actions:{slit(v){openT=v?1:0},aim(i){aim=i;ui.stat('target',P[i].name)},cons(v){cons.visible=v},
      cart(){const p=prod[cartN%2];ts[cartN%2].scale.multiplyScalar(1.15);setTimeout(()=>{ts[0].scale.set(.4*640/120,.4,1);ts[1].scale.set(.4*640/120,.4,1)},350);cartN++;cart(p[0],p[1])}}};
}

export const concept={id:'celeste',hdris:["night"],name:'CELESTE',type:'E-commerce · Company Profile',acc:'#b9a6ff',build:buildCeleste,
 brief:{Sektor:'Toko teleskop dan observatorium wisata. Bisa dipakai untuk e-commerce atau company profile.',Kamera:'Pegunungan bersalju di bawah bulan, dolly menuju kubah, masuk lewat pintu, lalu menengadah ke celah kubah.',Interaksi:'Buka celah kubah (dua belahan bergeser), arahkan teleskop ke Saturnus, Jupiter, Mars atau nebula, tampilkan rasi bintang, tambah teleskop ke keranjang.',Teknik:'Langit malam dengan Bimasakti prosedural, aurora, bulan bertekstur kawah, salju dan pinus, kubah logam dengan pantulan, teleskop aluminium sikat, dan planet bertekstur.',Varian:'Tambah jadwal malam pengamatan sebagai kalender yang memutar langit sesuai tanggal.'},
 slides:[
  {tag:'Bab 1 · Puncak',title:'Kubah kecil di bawah bulan besar',text:'Pegunungan bersalju, ribuan bintang, dan sesekali bintang jatuh. Skala kubah dibuat kecil supaya langit terasa luas.',cam:[0,52,150],look:[0,10,0]},
  {tag:'Bab 2 · Menanjak',title:'Jalan menuju cahaya hangat di pintu',text:'Kamera naik perlahan. Lampu hangat dari pintu menjadi satu-satunya warna di lanskap biru.',cam:[10,16,44],look:[0,7,0]},
  {tag:'Bab 3 · Pintu kubah',title:'Anak tangga, lalu ruang bundar',text:'Kamera melewati pintu setinggi bahu dan masuk ke ruangan dengan teleskop di sisi kiri.',cam:[0,1.8,10],look:[-.6,3,-1]},
  {tag:'Bab 4 · Di bawah kubah',title:'Buka celah, arahkan, lalu belanja',text:'Dua belahan kubah bergeser, teleskop berputar ke target, dan langit menjadi etalase.',cam:[.4,1.5,1.2],look:[0,12,-2.4],ui:[TG('slit','Celah kubah',['Tertutup','Terbuka'],true),CY('aim','Arahkan',['Saturnus','Jupiter','Mars','Nebula']),TG('cons','Rasi bintang'),AC('cart','Tambah teleskop'),ST('target','Target','Saturnus'),ST('cart','Keranjang','0 item')]}
 ]};
