/* Konsep genom — modul mandiri, dimuat oleh concepts/genom.html */
import {loadModel,$,AC,BGU,Box,CY,Cart,Cyl,EXRLoader,EffectComposer,GTAOPass,OutputPass,RBox,Reflector,RenderPass,RoundedBoxGeometry,ST,ShaderPass,Sky,Sph,T,TG,UnrealBloomPass,V,Water,brickHF,camera,canvas,clamp,ctex,dtex,emis,envCache,fbm,floorMat,glow,glowTex,hdri,hex2,leafGeo,leafMat,leafTexture,lerp,loadHdri,makeSky,mesh,noShadow,pbr,perfHF,physM,plankHF,pmrem,reduce,renderer,ridgeHF,rnd,rng,sstep,starField,stdM,sunDir,sunLight,tagSprite,textTex,tileHF,waterNormal,weaveHF,wetFloor,windowTex} from '../core.js';
/* ==========================================================
   KONSEP 8 — HELIX : klinik genomik, menyelam ke dalam sel hingga heliks DNA
   ========================================================== */
function buildGenom(ui){
  const scene=new T.Scene();scene.background=new T.Color(0x02090f);scene.fog=new T.FogExp2(0x03151d,.0075);
  scene.environment=hdri('studio');scene.environmentIntensity=.28;
  scene.add(new T.HemisphereLight(0x4fb8c8,0x10061a,.5));
  const key=new T.PointLight(0x5fe6ff,260,120,2);key.position.set(20,30,60);scene.add(key);
  const rim=new T.PointLight(0xff4fc0,260,120,2);rim.position.set(-30,-10,-20);scene.add(rim);
  scene.add(starField(900,700,1.4,false,.6));
  const rr=rng(9);
  // membran sel
  const memb=new T.Mesh(new T.SphereGeometry(44,64,48),new T.MeshPhysicalMaterial({color:0x8fe8ff,transparent:true,opacity:.14,roughness:.08,metalness:0,clearcoat:1,iridescence:1,iridescenceIOR:1.6,side:T.DoubleSide,depthWrite:false,envMapIntensity:2}));memb.castShadow=false;scene.add(memb);
  const bump=new T.Mesh(new T.IcosahedronGeometry(44.3,3),new T.MeshBasicMaterial({color:new T.Color(.15,.5,.6),wireframe:true,transparent:true,opacity:.09,blending:T.AdditiveBlending,depthWrite:false}));scene.add(bump);
  // organel: mitokondria
  const mitoM=new T.MeshPhysicalMaterial({color:0xff9a4a,roughness:.35,clearcoat:.6,emissive:0x8a3a10,emissiveIntensity:.5,transparent:true,opacity:.85});
  const crM=new T.MeshBasicMaterial({color:new T.Color(2.2,1.1,.4),toneMapped:false});
  function mito(){const g=new T.Group(),c=new T.Mesh(new T.CapsuleGeometry(1.4,3.6,10,20),mitoM);g.add(c);
    for(let k=0;k<7;k++){const t=new T.Mesh(new T.TorusGeometry(.8,.05,6,24,Math.PI),crM);t.position.y=-2.1+k*.7;t.rotation.set(Math.PI/2,0,k);g.add(t)}return g}
  for(let i=0;i<16;i++){const m=mito(),a=rr()*6.28,b=Math.acos(2*rr()-1),d=20+rr()*18;m.position.set(Math.sin(b)*Math.cos(a)*d,Math.cos(b)*d*.9,Math.sin(b)*Math.sin(a)*d);m.rotation.set(rr()*3,rr()*3,rr()*3);m.scale.setScalar(.8+rr()*.6);scene.add(m)}
  // golgi
  const golM=new T.MeshPhysicalMaterial({color:0xc8a0ff,roughness:.3,clearcoat:.8,emissive:0x40206a,emissiveIntensity:.5});
  for(let g=0;g<2;g++){const grp=new T.Group();for(let k=0;k<6;k++){const t=new T.Mesh(new T.TorusGeometry(3.6-k*.25,.55,12,48,Math.PI*1.4),golM);t.position.y=k*1.05;t.rotation.x=Math.PI/2;grp.add(t)}grp.position.set(g?-26:24,g?8:-12,g?18:10);grp.rotation.set(rr(),rr()*3,rr());scene.add(grp)}
  // vesikel dan ribosom
  const vesM=new T.MeshPhysicalMaterial({color:0x7fffe0,roughness:.1,transparent:true,opacity:.5,clearcoat:1,emissive:0x0a5a48,emissiveIntensity:.6});
  const ves=new T.InstancedMesh(new T.SphereGeometry(1,18,14),vesM,60),dm=new T.Object3D();
  for(let i=0;i<60;i++){const a=rr()*6.28,b=Math.acos(2*rr()-1),d=16+rr()*26;dm.position.set(Math.sin(b)*Math.cos(a)*d,Math.cos(b)*d,Math.sin(b)*Math.sin(a)*d);dm.scale.setScalar(.5+rr()*1.4);dm.updateMatrix();ves.setMatrixAt(i,dm.matrix)}scene.add(ves);
  const rp=[];for(let i=0;i<2200;i++){const a=rr()*6.28,b=Math.acos(2*rr()-1),d=15+rr()*28;rp.push(Math.sin(b)*Math.cos(a)*d,Math.cos(b)*d,Math.sin(b)*Math.sin(a)*d)}
  const rg=new T.BufferGeometry();rg.setAttribute('position',new T.Float32BufferAttribute(rp,3));const ribo=new T.Points(rg,new T.PointsMaterial({map:glowTex,color:0xbff8ff,size:.55,transparent:true,opacity:.7,blending:T.AdditiveBlending,depthWrite:false}));scene.add(ribo);
  // mikrotubulus dari inti ke membran
  const mtM=new T.MeshStandardMaterial({color:0xffd0f0,roughness:.4,emissive:0x8a2a6a,emissiveIntensity:.4});const mtP=[];
  for(let i=0;i<40;i++){const a=rr()*6.28,b=Math.acos(2*rr()-1),dir=V(Math.sin(b)*Math.cos(a),Math.cos(b),Math.sin(b)*Math.sin(a));const p0=dir.clone().multiplyScalar(15),p1=dir.clone().multiplyScalar(28).add(V(rr()*6-3,rr()*6-3,rr()*6-3)),p2=dir.clone().multiplyScalar(43);mtP.push(new T.TubeGeometry(new T.CatmullRomCurve3([p0,p1,p2]),24,.14,6))}
  scene.add(new T.Mesh(BGU.mergeGeometries(mtP),mtM));
  // inti sel: selaput bercelah + kromatin
  const nuc=new T.Mesh(new T.SphereGeometry(14,48,36),new T.MeshPhysicalMaterial({color:0xffb0e8,transparent:true,opacity:.16,roughness:.15,clearcoat:1,side:T.DoubleSide,depthWrite:false,envMapIntensity:1.5}));nuc.castShadow=false;scene.add(nuc);
  const nucW=new T.Mesh(new T.IcosahedronGeometry(14.1,2),new T.MeshBasicMaterial({color:new T.Color(1.4,.5,1.1),wireframe:true,transparent:true,opacity:.14,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}));scene.add(nucW);
  const chrP=[];for(let i=0;i<34;i++){const pts=[];let p=V((rr()-.5)*16,(rr()-.5)*16,(rr()-.5)*16);for(let k=0;k<9;k++){const h=Math.hypot(p.x,p.y);if(h<5.5){const k=(5.5+rr()*3)/Math.max(h,.3);p.x*=k;p.y*=k}pts.push(p.clone());p.add(V((rr()-.5)*6,(rr()-.5)*6,(rr()-.5)*6));if(p.length()>12.5)p.multiplyScalar(12.5/p.length())}chrP.push(new T.TubeGeometry(new T.CatmullRomCurve3(pts),60,.09,5))}
  scene.add(new T.Mesh(BGU.mergeGeometries(chrP),new T.MeshStandardMaterial({color:0xff8ad0,roughness:.5,emissive:0x8a2a6a,emissiveIntensity:.6})));
  // heliks DNA
  const N=700,RH=1.5,DZ=.17,DA=.2,Z0=12;
  const pearl=new T.MeshPhysicalMaterial({color:0xf2f6ff,roughness:.18,clearcoat:1,clearcoatRoughness:.05,metalness:0,envMapIntensity:1.6,emissive:0x102830,emissiveIntensity:.15});
  const back=new T.InstancedMesh(new T.SphereGeometry(.27,18,14),pearl,N*2);
  const rungM=new T.MeshBasicMaterial({toneMapped:false}),rA=new T.InstancedMesh(new T.CylinderGeometry(.1,.1,1,8),rungM,N),rB=new T.InstancedMesh(new T.CylinderGeometry(.1,.1,1,8),rungM,N);
  const helix=new T.Group();helix.add(back,rA,rB);helix.rotation.order='YXZ';helix.rotation.y=-1.0;helix.position.set(0,0,-6);scene.add(helix);back.frustumCulled=rA.frustumCulled=rB.frustumCulled=false;back.castShadow=true;
  const BC=[new T.Color(.15,.9,1.2),new T.Color(1.2,.2,.8),new T.Color(1.3,.85,.15),new T.Color(.55,1.2,.2)],pair=[1,0,3,2];   // A-T, C-G
  const bs=[];for(let i=0;i<N;i++)bs.push((rr()*4)|0);
  const SVC=[[60,130,'Skrining Keturunan',0x5fe6ff],[140,210,'Nutrigenomik',0xffd23a],[230,300,'Onkogenetik',0xff5fc0]];
  let unzipF=-60,unzipT=false,scanP=-1,svc=-1,dirty=true,zipU=new Float32Array(N);
  const q=new T.Quaternion(),up=V(0,1,0),m4=new T.Matrix4(),pv=V(0,0,0),dv=V(0,0,0),sv=V(1,1,1),cc=new T.Color();
  const seg=[];SVC.forEach((s,k)=>{const tag=tagSprite(s[2],'#'+new T.Color(s[3]).getHexString(),1.5);tag.position.set(RH*3.4,1.2,Z0-((s[0]+s[1])/2)*DZ);tag.visible=false;helix.add(tag);seg.push(tag)});
  function rod(mesh,k,p,dirV,len){dv.copy(dirV);q.setFromUnitVectors(up,dv);pv.copy(p).addScaledVector(dv,len/2);sv.set(1,len,1);m4.compose(pv,q,sv);mesh.setMatrixAt(k,m4)}
  function place(){
    for(let i=0;i<N;i++){const u=st((unzipF-i)/40+.0),a=i*DA+ (u*.9),z=Z0-i*DZ,ca=Math.cos(a),sa=Math.sin(a),s=1+1.9*u;zipU[i]=u;
      const p1=V(RH*ca*s,RH*sa*s,z),p2=V(-RH*ca*s,-RH*sa*s,z);
      m4.makeTranslation(p1.x,p1.y,p1.z);back.setMatrixAt(i*2,m4);m4.makeTranslation(p2.x,p2.y,p2.z);back.setMatrixAt(i*2+1,m4);
      rod(rA,i,p1,V(-ca,-sa,0),RH*.94);rod(rB,i,p2,V(ca,sa,0),RH*.94)}
    back.instanceMatrix.needsUpdate=rA.instanceMatrix.needsUpdate=rB.instanceMatrix.needsUpdate=true}
  function st(x){x=clamp(x,0,1);return x*x*(3-2*x)}
  function colors(t){
    for(let i=0;i<N;i++){let g=1;const b=bs[i];
      if(svc>=0&&i>=SVC[svc][0]&&i<=SVC[svc][1])g+=2.2;
      if(scanP>=0){const d=Math.abs(i-scanP);if(d<28)g+=3.5*(1-d/28)}
      cc.copy(BC[b]).multiplyScalar(g);rA.setColorAt(i,cc);cc.copy(BC[pair[b]]).multiplyScalar(g);rB.setColorAt(i,cc)}
    rA.instanceColor.needsUpdate=rB.instanceColor.needsUpdate=true}
  st.call&&0;place();colors(0);
  // partikel protein melayang
  const fn=500,fg=new T.BufferGeometry(),fp=new Float32Array(fn*3);for(let i=0;i<fn;i++){fp[i*3]=(rr()-.5)*24;fp[i*3+1]=(rr()-.5)*14;fp[i*3+2]=12-rr()*90}
  fg.setAttribute('position',new T.BufferAttribute(fp,3));const dust=new T.Points(fg,new T.PointsMaterial({map:glowTex,color:0x9ff3ff,size:.34,transparent:true,opacity:.75,blending:T.AdditiveBlending,depthWrite:false}));scene.add(dust);
  let booked=0;
  return{scene,look:{exp:1,bloom:[.5,.7,1.0],vig:.45,grain:.03,tint:[.96,1,1.04],sat:1.12},
    update(t,dt,cam){
      helix.rotation.z+=dt*.12;memb.rotation.y+=dt*.01;nuc.rotation.y-=dt*.02;nucW.rotation.y-=dt*.02;
      const tgt=unzipT?N+60:-60;if(Math.abs(unzipF-tgt)>.5){unzipF+=Math.sign(tgt-unzipF)*Math.min(Math.abs(tgt-unzipF),dt*110);place()}
      let need=false;if(scanP>=0){scanP+=dt*150;need=true;if(scanP>N+30){scanP=-1}}if(dirty){need=true;dirty=false}if(need)colors(t);
      const pa=fg.attributes.position;for(let i=0;i<fn;i++){pa.array[i*3+1]+=Math.sin(t*.4+i)*dt*.2;pa.array[i*3]+=Math.cos(t*.3+i*1.3)*dt*.15}pa.needsUpdate=true;
      seg.forEach((s,k)=>{s.visible=svc===k});
      if(cam){const inN=cam.position.length()<14;this.look.exp=inN?1.1:1}
    },
    actions:{
      unzip(v){unzipT=v},
      scan(){scanP=0},
      svc(i){svc=i;dirty=true;ui.stat('svc',SVC[i][2])},
      book(){booked++;ui.stat('book',booked+' jadwal')}
    }};
}
export const concept={id:'genom',hdris:["studio"],name:'HELIX',type:'Company Profile · Sains',acc:'#5fe6ff',build:buildGenom,
 brief:{Sektor:'Klinik genomik dan laboratorium sekuensing. Company profile.',Kamera:'Dari luar sel yang melayang di ruang gelap, dolly masuk menembus membran, mendekati inti, lalu menyelam ke dalam heliks DNA dan berhenti di antara pasangan basa.',Interaksi:'Urai heliks (pasangan basa terpisah dari arah kamera), pindai gen (pita cahaya menyapu heliks), ganti layanan (segmen gen tersorot dengan label), jadwalkan konsultasi.',Teknik:'Ribuan pasangan basa dengan instancing dan warna per instance, heliks diubah tiap frame saat terurai, membran dengan iridescence, organel prosedural, bloom pada basa yang menyala.',Varian:'Ganti segmen dengan hasil tes sungguhan, atau tambah kartu paket layanan yang muncul saat gen dipilih.'},
 slides:[
  {tag:'Bab 1 · Sel',title:'Semua cerita dimulai dari satu sel',text:'Sel melayang di ruang gelap, membran berkilau, mitokondria dan aparatus Golgi berpendar. Kesan pertama: ini laboratorium yang berani menunjukkan isi sel.',cam:[0,16,118],look:[0,0,0]},
  {tag:'Bab 2 · Menembus membran',title:'Masuk tanpa membuka apa pun',text:'Kamera menembus membran sel dan melayang di antara organel. Ribosom berkilau seperti debu di sekitar inti.',cam:[14,7,38],look:[0,0,0],ui:[ST('bases','Basa terbaca','3,2 miliar')]},
  {tag:'Bab 3 · Inti sel',title:'Kromatin yang tergulung di dalam inti',text:'Selaput inti tembus pandang. Di baliknya, kromatin merah muda menyimpan seluruh instruksi tubuh.',cam:[2,2,24],look:[0,0,-4]},
  {tag:'Bab 4 · Heliks',title:'Di antara pasangan basa',text:'Urai heliks untuk melihat pasangan basa terpisah, pindai untuk menyapu seluruh gen, lalu pilih layanan yang ingin Anda ketahui.',cam:[-3.6,1.5,6.8],look:[8,-.6,-9],ui:[TG('unzip','Heliks',['Utuh','Terurai']),AC('scan','Pindai gen'),CY('svc','Layanan',['Skrining','Nutrigenomik','Onkogenetik']),AC('book','Jadwalkan konsultasi'),ST('svc','Segmen tersorot','belum dipilih'),ST('book','Konsultasi','0 jadwal')]}
 ]};
