/* Konsep nexus — modul mandiri, dimuat oleh concepts/nexus.html */
import {$,AC,BGU,Box,CY,Cart,Cyl,EXRLoader,EffectComposer,GTAOPass,OutputPass,RBox,Reflector,RenderPass,RoundedBoxGeometry,ST,ShaderPass,Sky,Sph,T,TG,UnrealBloomPass,V,Water,brickHF,camera,canvas,clamp,ctex,dtex,emis,envCache,fbm,floorMat,glow,glowTex,hdri,hex2,leafGeo,leafMat,leafTexture,lerp,loadHdri,makeSky,mesh,noShadow,pbr,perfHF,physM,plankHF,pmrem,reduce,renderer,ridgeHF,rnd,rng,sstep,starField,stdM,sunDir,sunLight,tagSprite,textTex,tileHF,waterNormal,weaveHF,wetFloor,windowTex} from '../core.js';
/* ==========================================================
   KONSEP 1 — NEXUS AI : gedung kaca -> server room hologram
   ========================================================== */
function buildNexus(ui){
  const scene=new T.Scene();scene.background=new T.Color(0x03060d);scene.fog=new T.FogExp2(0x07121f,.0075);
  scene.environment=hdri('city');scene.environmentIntensity=.35;
  const moon=sunLight(0x8fb4ff,.9,V(-40,70,50),70,2048);scene.add(moon);
  scene.add(new T.HemisphereLight(0x33507a,0x05070c,.35));
  scene.add(starField(1400,900,1.6,true,1.2));
  const plaza=wetFloor(700,700,{color:0x080d16,mix:.7,dist:.03,rep:1/16,tex:768,rough:pbr({hf:tileHF(16,.035),fx:8,fy:8,c0:0x10151e,c1:0x2a3140,nS:3,w:256}).normalMap});plaza.position.y=0;scene.add(plaza);
  // kota
  const wt=windowTex(8,24,.32);
  const bm=(w,h)=>{const t=wt.clone();t.needsUpdate=true;t.repeat.set(Math.ceil(w/14),Math.ceil(h/40));return new T.MeshStandardMaterial({color:0x0b1320,roughness:.25,metalness:.85,emissive:0xffffff,emissiveMap:t,emissiveIntensity:1.1,envMapIntensity:1.4})};
  for(let i=0;i<90;i++){const w=rnd(6,16),h=rnd(14,85),d=rnd(6,16);let x,z;do{x=rnd(-190,190);z=rnd(-190,190)}while(Math.abs(x)<36&&Math.abs(z)<36);Box(w,h,d,bm(w,h),x,h/2,z,scene)}
  for(let i=0;i<14;i++){const x=rnd(-160,160),z=rnd(-160,160),h=rnd(60,90);if(Math.abs(x)<40&&Math.abs(z)<40)continue;glow(0xff2a2a,3,x,h+1.5,z,scene,.9)}
  // menara
  const tower=new T.Group();scene.add(tower);
  const glassM=physM(0x8fc8ff,{transparent:true,opacity:.2,metalness:.2,roughness:.03,envMapIntensity:3,clearcoat:1,clearcoatRoughness:.02,depthWrite:false});
  [[0,40,12,0],[0,40,-12,Math.PI],[12,40,0,Math.PI/2],[-12,40,0,-Math.PI/2]].forEach(f=>{const g=new T.Mesh(new T.PlaneGeometry(24,80),glassM);g.position.set(f[0],f[1],f[2]);g.rotation.y=f[3];tower.add(g)});
  const concrete=pbr({fx:6,fy:6,oct:6,seed:3,c0:0x2a2d33,c1:0x555a63,nS:2,r0:.7,r1:.95,rep:[6,6],w:256});
  const slabs=new T.InstancedMesh(new T.BoxGeometry(24.2,.5,24.2),concrete,16),pan=new T.InstancedMesh(new T.PlaneGeometry(2.6,2.6),new T.MeshBasicMaterial({color:new T.Color(1.15,1.2,1.3),toneMapped:false}),16*16);
  const m4=new T.Matrix4();let pi=0;
  for(let i=0;i<16;i++){const y=6+i*5;m4.makeTranslation(0,y,0);slabs.setMatrixAt(i,m4);
    for(let a=0;a<4;a++)for(let b=0;b<4;b++){const q=new T.Matrix4().makeRotationX(Math.PI/2).setPosition(-9+a*6,y-.28,-9+b*6);pan.setMatrixAt(pi++,q)}}
  slabs.castShadow=slabs.receiveShadow=true;tower.add(slabs,pan);
  const mullM=stdM(0x0b1018,{metalness:.9,roughness:.3});
  const vm=new T.InstancedMesh(new T.BoxGeometry(.18,80,.35),mullM,13*4),hm=new T.InstancedMesh(new T.BoxGeometry(24,.22,.4),mullM,16*4);let vi=0,hi=0;
  for(let f=0;f<4;f++){const rot=[0,Math.PI,Math.PI/2,-Math.PI/2][f];for(let k=0;k<13;k++){const q=new T.Object3D();q.rotation.y=rot;const x=-12+k*2,l=new T.Vector3(x,40,12.05).applyAxisAngle(V(0,1,0),rot);q.position.copy(l);q.updateMatrix();vm.setMatrixAt(vi++,q.matrix)}
    for(let k=0;k<16;k++){const q=new T.Object3D();q.rotation.y=rot;q.position.copy(V(0,6+k*5,12.05).applyAxisAngle(V(0,1,0),rot));q.updateMatrix();hm.setMatrixAt(hi++,q.matrix)}}
  vm.castShadow=hm.castShadow=true;tower.add(vm,hm);
  const edgeM=new T.MeshBasicMaterial({color:new T.Color(.3,1.4,2),toneMapped:false,transparent:true,opacity:.5});
  [[-12,-12],[12,-12],[-12,12],[12,12]].forEach(c=>{const e=new T.Mesh(new T.BoxGeometry(.3,80,.3),edgeM);e.position.set(c[0],40,c[1]);tower.add(e)});
  const sign=mesh(new T.PlaneGeometry(17,3.6),new T.MeshBasicMaterial({map:textTex('NEXUS·AI',1024,220,{fg:'#fff',font:'800 150px sans-serif'}),transparent:true,color:new T.Color(.6,2.2,3),toneMapped:false,depthWrite:false}),0,22,12.5,tower);sign.castShadow=false;
  const beam=mesh(new T.CylinderGeometry(1.2,3.2,300,32,1,true),new T.MeshBasicMaterial({color:new T.Color(.4,1.6,2.4),transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,fog:false,toneMapped:false}),0,230,0,tower);beam.castShadow=false;
  Cyl(.2,.5,20,mullM,0,90,0,tower);const spire=glow(0x4fe0ff,14,0,101,0,tower,.5);
  // server room
  const sfloor=wetFloor(23.6,23.6,{color:0x05080e,mix:.6,dist:.015,rep:1/9.6,tex:768,rough:pbr({hf:tileHF(16,.03),fx:6,fy:6,c0:0x10151c,c1:0x2a323d,nS:3,w:256}).normalMap});sfloor.position.y=.03;tower.add(sfloor);
  const wallM=pbr({hf:ridgeHF(24),fx:2,fy:24,oct:3,c0:0x0a0d14,c1:0x1c222c,nS:4,r0:.5,r1:.8,rep:[2,1],metal:.4,w:256});
  Box(23.6,6,.3,wallM,0,3,-11.7,tower);Box(.3,6,23.6,wallM,-11.8,3,0,tower);Box(.3,6,23.6,wallM,11.8,3,0,tower);
  for(let i=0;i<4;i++)mesh(new T.BoxGeometry(20,.05,.05),new T.MeshBasicMaterial({color:new T.Color(.3,1.3,2),toneMapped:false}),0,1+i*1.4,-11.5,tower);
  const rc=canvas(32,64),rg=rc.getContext('2d');for(let y=0;y<16;y++)for(let x=0;x<4;x++)if(Math.random()<.7){rg.fillStyle=['#38e8ff','#5cff9a','#ffb454','#38e8ff'][(Math.random()*4)|0];rg.fillRect(x*8+2,y*4,4,2)}
  const rackTex=ctex(rc);rackTex.wrapS=rackTex.wrapT=T.RepeatWrapping;rackTex.magFilter=T.NearestFilter;
  const rackM=stdM(0x0e131b,{metalness:.85,roughness:.32}),doorM=pbr({hf:perfHF(20),fx:2,fy:2,oct:1,c0:0x07090d,c1:0x1d232c,nS:5,r0:.3,r1:.55,metal:.9,rep:[1,2],w:256});
  const faces=[];
  [-1,1].forEach(s=>{[5.2,8.6].forEach(rx=>{for(let i=0;i<5;i++){const z=5-i*3.4;
    RBox(1.5,3.9,1.7,.05,rackM,s*rx,1.95,z,tower);
    const led=new T.MeshBasicMaterial({map:rackTex.clone(),transparent:true,color:new T.Color(2.2,2.2,2.2),toneMapped:false,depthWrite:false});led.map.needsUpdate=true;
    const f=mesh(new T.PlaneGeometry(1.3,3.4),led,s*rx-s*.88,1.95,z,tower);f.rotation.y=-s*Math.PI/2;f.castShadow=false;faces.push(f);
    const d=mesh(new T.PlaneGeometry(1.34,3.5),doorM,s*rx-s*.9,1.95,z,tower);d.rotation.y=-s*Math.PI/2;d.material.transparent=false;d.castShadow=false;d.material.opacity=1;
    d.material=new T.MeshStandardMaterial({map:doorM.map,normalMap:doorM.normalMap,roughnessMap:doorM.roughnessMap,roughness:1,metalness:.9,transparent:true,opacity:.55,depthWrite:false});d.renderOrder=2}});
    mesh(new T.BoxGeometry(.12,.03,22),new T.MeshBasicMaterial({color:new T.Color(.3,1.6,2.4),toneMapped:false}),s*3.2,.07,-.5,tower);
    Box(1,.15,22,rackM,s*5.2,5.2,-.5,tower);
    for(let k=0;k<8;k++)Cyl(.05,.05,22,stdM(k%2?0x1a1f28:0x2a3a4a,{roughness:.6}),s*(5.0+k*.05),5.3+(k%3)*.06,-.5,tower,6).rotation.x=Math.PI/2});
  const ceil=Box(23.6,.4,23.6,concrete,0,6.05,0,tower);
  const rlights=[];[-2.5,2.5].forEach(x=>{const rl=new T.RectAreaLight(0xbfe6ff,2.5,1.1,20);rl.position.set(x,5.8,-.5);rl.rotation.x=-Math.PI/2;tower.add(rl);rlights.push(rl);
    mesh(new T.BoxGeometry(1.1,.06,20),new T.MeshBasicMaterial({color:new T.Color(1.3,1.5,1.7),toneMapped:false}),x,5.83,-.5,tower).castShadow=false});
  const holoL=new T.PointLight(0x38d8ff,30,14,2);holoL.position.set(0,3.3,-8);tower.add(holoL);
  const fill=new T.PointLight(0x5aa0ff,8,20,2);fill.position.set(0,4.5,2);tower.add(fill);
  // hologram
  const holo=new T.Group();holo.position.set(0,3.3,-8);tower.add(holo);
  Cyl(1.9,2.2,.22,stdM(0x0a121c,{metalness:.9,roughness:.25}),0,-3.2,0,holo,48);
  const ringB=mesh(new T.TorusGeometry(1.7,.03,8,64),new T.MeshBasicMaterial({color:new T.Color(.4,1.8,2.6),toneMapped:false}),0,-3.05,0,holo);ringB.rotation.x=Math.PI/2;
  const hcol=new T.Color(.2,.8,1.2);
  const holoSh=(c)=>new T.ShaderMaterial({uniforms:{c:{value:c},t:{value:0}},transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,
    vertexShader:`varying vec3 vN;varying vec3 vP;varying vec3 vW;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vP=mv.xyz;vW=position;gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform vec3 c;uniform float t;varying vec3 vN;varying vec3 vP;varying vec3 vW;void main(){float f=pow(1.-abs(dot(normalize(vN),normalize(-vP))),2.2);float s=.55+.45*sin(vW.y*38.-t*4.);float fl=.9+.1*sin(t*40.);gl_FragColor=vec4(c*(.12+f*1.4)*s*fl,(.15+f)*.85);}`});
  const hSh=holoSh(hcol),hLine=new T.MeshBasicMaterial({color:hcol,wireframe:true,transparent:true,opacity:.55,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});
  const modes=[new T.Group(),new T.Group(),new T.Group()];modes.forEach(m=>holo.add(m));
  const ico=new T.IcosahedronGeometry(1.5,2);mesh(ico,hSh,0,0,0,modes[0]).castShadow=false;mesh(ico,hLine,0,0,0,modes[0]).castShadow=false;
  mesh(new T.IcosahedronGeometry(.8,1),hLine,0,0,0,modes[0]).castShadow=false;
  const nodes=new T.Points(ico,new T.PointsMaterial({color:new T.Color(.8,1.6,1.9),size:4,sizeAttenuation:false,blending:T.AdditiveBlending,transparent:true,depthWrite:false,toneMapped:false}));modes[0].add(nodes);
  const gp=[],N=1600;for(let i=0;i<N;i++){const y=1-2*(i+.5)/N,r=Math.sqrt(1-y*y),a=i*2.39996;gp.push(Math.cos(a)*r*1.5,y*1.5,Math.sin(a)*r*1.5)}
  const gg=new T.BufferGeometry();gg.setAttribute('position',new T.Float32BufferAttribute(gp,3));const globePts=new T.Points(gg,new T.PointsMaterial({color:new T.Color(.3,1.1,1.5),size:2.4,sizeAttenuation:false,blending:T.AdditiveBlending,transparent:true,depthWrite:false,toneMapped:false}));modes[1].add(globePts);
  mesh(new T.SphereGeometry(1.48,32,24),hSh,0,0,0,modes[1]).castShadow=false;
  for(let i=0;i<7;i++){const a=new T.Vector3().randomDirection().multiplyScalar(1.5),b=new T.Vector3().randomDirection().multiplyScalar(1.5),m=a.clone().add(b).multiplyScalar(.5).normalize().multiplyScalar(2.3);
    const cv=new T.QuadraticBezierCurve3(a,m,b);modes[1].add(new T.Line(new T.BufferGeometry().setFromPoints(cv.getPoints(40)),new T.LineBasicMaterial({color:new T.Color(1,2.4,3),transparent:true,opacity:.7,blending:T.AdditiveBlending,toneMapped:false})))}
  const kn=new T.TorusKnotGeometry(1,.3,160,16);mesh(kn,hSh,0,0,0,modes[2]).castShadow=false;mesh(kn,hLine,0,0,0,modes[2]).castShadow=false;
  modes[1].visible=modes[2].visible=false;
  const ring1=mesh(new T.TorusGeometry(2.3,.02,8,96),new T.MeshBasicMaterial({color:hcol,toneMapped:false}),0,-1,0,holo);ring1.rotation.x=Math.PI/2;
  const ring2=mesh(new T.TorusGeometry(2.6,.015,8,96),new T.MeshBasicMaterial({color:hcol,toneMapped:false}),0,1,0,holo);ring2.rotation.x=Math.PI/2;
  const scanR=mesh(new T.TorusGeometry(1.9,.05,8,64),new T.MeshBasicMaterial({color:new T.Color(2,3,3.4),toneMapped:false}),0,-3,0,holo);scanR.rotation.x=Math.PI/2;scanR.visible=false;
  const pn=200,pg=new T.BufferGeometry(),pp=new Float32Array(pn*3);for(let i=0;i<pn;i++){const a=Math.random()*6.28,r=Math.random()*1.8;pp[i*3]=Math.cos(a)*r;pp[i*3+1]=rnd(-3,3);pp[i*3+2]=Math.sin(a)*r}
  pg.setAttribute('position',new T.BufferAttribute(pp,3));holo.add(new T.Points(pg,new T.PointsMaterial({color:new T.Color(1,2.6,3),size:2.2,sizeAttenuation:false,transparent:true,opacity:.85,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false})));
  const hbeam=mesh(new T.CylinderGeometry(1.7,1.95,3.1,32,1,true),new T.MeshBasicMaterial({color:hcol,transparent:true,opacity:.06,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,toneMapped:false}),0,-1.6,0,holo);hbeam.castShadow=false;
  const pc=canvas(320,200),pcx=pc.getContext('2d'),ptex=ctex(pc);
  [[-3.4,.45],[3.4,-.45]].forEach(a=>{const p=mesh(new T.PlaneGeometry(2.4,1.5),new T.MeshBasicMaterial({map:ptex,transparent:true,blending:T.AdditiveBlending,depthWrite:false,color:new T.Color(1.6,1.6,1.6),toneMapped:false}),a[0],3.3,-9.6,tower);p.rotation.y=a[1];p.castShadow=false});
  const names=['NEURAL MESH','GLOBAL NODES','QUANTUM KEY'];let mode=0,oc=false,on=false,scanP=-1,lastB=0,lastP=0,spd=1;
  function drawPanel(t){pcx.clearRect(0,0,320,200);pcx.strokeStyle=oc?'#ff7a4a':'#4fe6ff';pcx.fillStyle=pcx.strokeStyle;pcx.lineWidth=2;pcx.strokeRect(2,2,316,196);pcx.font='700 22px monospace';pcx.fillText('NEXUS CORE',14,32);pcx.font='500 16px monospace';pcx.fillText(names[mode]+(oc?'  OC':''),14,56);
    for(let i=0;i<5;i++){const v=.35+.6*Math.abs(Math.sin(t*(.8+i*.3)+i*2))*(oc?1:.8);pcx.globalAlpha=.25;pcx.fillRect(14,74+i*22,292,10);pcx.globalAlpha=1;pcx.fillRect(14,74+i*22,292*v,10)}ptex.needsUpdate=true}
  const cA=new T.Color(),cN=new T.Color(.2,.8,1.2),cO=new T.Color(1.3,.5,.2);
  return{scene,look:{exp:.95,bloom:[.35,.6,1.05],vig:.4,grain:.02,tint:[.97,1,1.05],sat:1.05},
    setQ(q){plaza.setHigh(q>=1);sfloor.setHigh(q>=1)},
    update(t,dt){
      plaza.tick(t);sfloor.tick(t);
      holo.rotation.y+=dt*.45*spd;modes[0].rotation.x+=dt*.2*spd;modes[2].rotation.x+=dt*.5*spd;modes[2].rotation.z+=dt*.3*spd;globePts.rotation.y+=dt*.15*spd;
      ring1.rotation.z+=dt*.6*spd;ring2.rotation.z-=dt*.4*spd;hSh.uniforms.t.value=t;
      const pa=pg.attributes.position;for(let i=0;i<pn;i++){let y=pa.array[i*3+1]+dt*(.5+(i%5)*.15)*spd;if(y>3)y=-3;pa.array[i*3+1]=y}pa.needsUpdate=true;
      if(scanP>=0){scanP+=dt*.7;scanR.visible=true;scanR.position.y=lerp(-3,3,scanP);if(scanP>1){scanP=-1;scanR.visible=false}}
      if(t-lastB>.16){lastB=t;faces.forEach(f=>f.material.map.offset.set(Math.random(),Math.random()))}
      if(t-lastP>.25){lastP=t;drawPanel(t)}
      beam.material.opacity=on?.18+.05*Math.sin(t*3):0;edgeM.opacity=on?1:.45;spire.material.opacity=on?1:.5;
      cA.copy(oc?cO:cN);hcol.copy(cA);[hLine,ring1.material,ring2.material,hbeam.material,ringB.material].forEach(m=>m.color.copy(hcol));holoL.color.copy(oc?new T.Color(1,.5,.25):new T.Color(.22,.85,1));
    },
    actions:{power(v){on=v},holo(i){mode=i;modes.forEach((m,k)=>m.visible=k===i)},scan(){scanP=0},oc(v){oc=v;spd=v?3:1}}};
}

export const concept={id:'nexus',hdris:["city"],name:'NEXUS·AI',type:'Company Profile',acc:'#4fe0ff',build:buildNexus,
 brief:{Sektor:'Perusahaan AI dan cloud. Company profile.',Kamera:'Low-angle menengadah ke menara, dolly-in ke lobi, terbang lurus menembus kaca, lalu dolly panjang di lorong rak server.',Interaksi:'Toggle daya menara, ganti model hologram, pemindaian sekali jalan, overclock yang mengubah warna dan kecepatan.',Teknik:'Kaca fasad memantulkan HDRI kota, lantai plaza dan server room memakai pantulan nyata, lampu panel area, bayangan lembut, SSAO, bloom, dan hologram dengan shader fresnel.',Varian:'Ganti hologram dengan peta jaringan klien, atau model produk yang bisa diurai per lapisan.'},
 slides:[
  {tag:'Bab 1 · Eksterior',title:'Menara kaca yang menyala saat Anda tiba',text:'Kamera merayap dari plaza dan menengadah ke fasad setinggi 80 meter. Logo melayang di kaca sebagai kesan pertama.',cam:[34,4,58],look:[0,26,0]},
  {tag:'Bab 2 · Pendekatan',title:'Nyalakan menara, lihat isinya',text:'Tombol melayang mengaktifkan sinar pusat data ke langit sementara kamera turun mendekati lobi kaca.',cam:[12,6,32],look:[0,10,0],ui:[TG('power','Daya menara',['Mati','Nyala'])]},
  {tag:'Bab 3 · Menembus kaca',title:'Kaca menjadi pintu masuk',text:'Kamera lurus menembus dinding transparan tanpa cut. Satu gerakan menyambung luar dan dalam.',cam:[0,3.4,13],look:[0,3.2,-6],ui:[ST('nodes','Node aktif','2.048')]},
  {tag:'Bab 4 · Server room',title:'Lorong rak dan hologram yang hidup',text:'Rak berkedip mengarah ke inti hologram. Ganti model, jalankan pemindaian, atau paksa overclock.',cam:[0,2.5,0],look:[0,3.2,-9],ui:[CY('holo','Hologram',['Neural','Globe','Kristal']),AC('scan','Pindai'),TG('oc','Overclock',['Normal','Aktif'])]}
 ]};
