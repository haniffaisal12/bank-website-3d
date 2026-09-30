/* Halaman depan: portal ke semua konsep */
import {REG} from './registry.js';
import {$,AC,BGU,Box,CY,Cart,Cyl,EXRLoader,EffectComposer,GTAOPass,OutputPass,RBox,Reflector,RenderPass,RoundedBoxGeometry,ST,ShaderPass,Sky,Sph,T,TG,UnrealBloomPass,V,Water,brickHF,camera,canvas,clamp,ctex,dtex,emis,envCache,fbm,floorMat,glow,glowTex,hdri,hex2,leafGeo,leafMat,leafTexture,lerp,loadHdri,makeSky,mesh,noShadow,pbr,perfHF,physM,plankHF,pmrem,reduce,renderer,ridgeHF,rnd,rng,sstep,starField,stdM,sunDir,sunLight,tagSprite,textTex,tileHF,waterNormal,weaveHF,wetFloor,windowTex} from './core.js';
function buildCover(ui){
  const scene=new T.Scene();scene.background=new T.Color(0x02040a);scene.fog=new T.FogExp2(0x02040a,.0028);
  scene.environment=hdri('night');scene.environmentIntensity=.25;
  scene.add(starField(3200,700,1.7,false,1.3));scene.add(new T.AmbientLight(0x8899cc,.4));
  const key=new T.DirectionalLight(0xbcd0ff,1.4);key.position.set(20,30,40);scene.add(key);
  const rig=new T.Group();scene.add(rig);const items=[];
  REG.forEach((c,i)=>{const a=i/REG.length*Math.PI*2,g=new T.Group();g.position.set(Math.cos(a)*28,4+Math.sin(i*1.7)*3,Math.sin(a)*28);g.lookAt(0,4,0);rig.add(g);
    const col=new T.Color(c.acc);const hi=col.clone().multiplyScalar(3);
    g.add(new T.Mesh(new T.TorusGeometry(5,.14,16,96),new T.MeshBasicMaterial({color:hi,toneMapped:false})));glow(col,30,0,0,0,g,.5);
    g.add(new T.Mesh(new T.CircleGeometry(4.8,64),new T.MeshBasicMaterial({color:col,transparent:true,opacity:.07,side:T.DoubleSide,depthWrite:false})));
    const m=new T.MeshPhysicalMaterial({color:col,roughness:.25,metalness:.6,clearcoat:1,emissive:col,emissiveIntensity:.35});let ic;
    if(i===0)ic=new T.Mesh(new RoundedBoxGeometry(1.6,4,1.6,4,.12),m);else if(i===1)ic=new T.Mesh(new T.OctahedronGeometry(2),m);else if(i===2)ic=new T.Mesh(new T.ConeGeometry(2,3.4,4),m);
    else if(i===3)ic=new T.Mesh(new T.IcosahedronGeometry(2,1),m);else if(i===4)ic=new T.Mesh(new RoundedBoxGeometry(3.2,1.2,1.4,4,.2),m);else if(i===5)ic=new T.Mesh(new T.SphereGeometry(2.1,32,16,0,6.28,0,1.57),m);else if(i===6)ic=new T.Mesh(new RoundedBoxGeometry(3.6,.9,1.6,4,.4),m);else if(i===7)ic=new T.Mesh(new T.TorusKnotGeometry(1.1,.35,96,12),m);else ic=new T.Mesh(new T.DodecahedronGeometry(1.8,0),m);
    g.add(ic);const s=tagSprite(c.name,c.acc,1.5);s.position.set(0,-6.5,0);g.add(s);items.push(ic)});
  const core=new T.Mesh(new T.IcosahedronGeometry(3,2),new T.MeshBasicMaterial({color:new T.Color(.3,1.2,1.8),wireframe:true,transparent:true,opacity:.35,toneMapped:false}));core.position.y=4;rig.add(core);
  return{scene,look:{exp:1,bloom:[.8,.8,.7],vig:.4,grain:.03,tint:[1,1,1],sat:1.05},update(t,dt){rig.rotation.y+=dt*.045;core.rotation.x+=dt*.1;core.rotation.y+=dt*.15;items.forEach(m=>{m.rotation.y+=dt*.6})},actions:{}};
}

export const concept={id:'cover',hdris:['night'],name:'Bank Inspirasi',type:'Pembuka',acc:'#5ee1ff',build:buildCover,
 slides:[{cam:[0,7,62],look:[0,4,0],cover:true},{cam:[0,58,.1],look:[0,0,0],ideas:true}],
 brief:{Sektor:'Seluruh bank inspirasi',Kamera:'Dolly-in menuju cincin portal, lalu pull-back ke tampak atas di slide penutup.',Interaksi:'Klik kartu konsep untuk membuka halamannya.',Teknik:'Satu renderer WebGL dengan pipeline post-processing sinematik; posisi kamera dihitung dari posisi scroll.'}};
