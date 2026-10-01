/* Audio prosedural (Web Audio): tanpa berkas suara. Ambien per adegan dan efek untuk interaksi.
   Browser baru mengizinkan suara setelah ada interaksi pertama, jadi init() dipanggil dari gestur pengguna. */
let ctx=null,master=null,ambBus=null,sfxBus=null,noiseBuf=null,brownBuf=null,on=true,cur=null,timers=[];
try{if(localStorage.getItem('bank3d_snd')==='0')on=false}catch(e){}
function mkNoise(brown){const n=ctx.sampleRate*3,b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;if(brown){l=(l+.02*w)/1.02;d[i]=l*3.5}else d[i]=w}return b}
export function init(){
  if(ctx){if(ctx.state==='suspended')ctx.resume();return true}
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  try{ctx=new AC()}catch(e){return false}
  master=ctx.createGain();master.gain.value=on?.9:0;const comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;master.connect(comp);comp.connect(ctx.destination);
  ambBus=ctx.createGain();ambBus.gain.value=.55;ambBus.connect(master);sfxBus=ctx.createGain();sfxBus.gain.value=.8;sfxBus.connect(master);
  noiseBuf=mkNoise(false);brownBuf=mkNoise(true);return true}
export function isOn(){return on}
export function setOn(v){on=v;try{localStorage.setItem('bank3d_snd',v?'1':'0')}catch(e){}if(master)master.gain.setTargetAtTime(v?.9:0,ctx.currentTime,.08)}
export function ready(){return !!ctx}
/* ---------- primitif ---------- */
function src(buf,loop){const s=ctx.createBufferSource();s.buffer=buf;s.loop=!!loop;s.loopStart=Math.random()*1.5;return s}
function env(g,t,a,d,peak,end){g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(end||0.0001,t+a+d)}
function tone(f,t,dur,type,peak,bus,slideTo){const o=ctx.createOscillator(),g=ctx.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(slideTo)o.frequency.exponentialRampToValueAtTime(slideTo,t+dur);env(g,t,.004,dur,peak||.2);o.connect(g);g.connect(bus||sfxBus);o.start(t);o.stop(t+dur+.05)}
function burst(t,dur,freq,q,peak,type,bus,sweepTo,brown){const s=src(brown?brownBuf:noiseBuf,false),f=ctx.createBiquadFilter(),g=ctx.createGain();f.type=type||'bandpass';f.frequency.setValueAtTime(freq,t);if(sweepTo)f.frequency.exponentialRampToValueAtTime(sweepTo,t+dur);f.Q.value=q||1;env(g,t,Math.min(.03,dur/3),dur,peak||.3);s.connect(f);f.connect(g);g.connect(bus||sfxBus);s.start(t,Math.random());s.stop(t+dur+.1)}
/* ---------- efek ---------- */
const FX={
  click(t){tone(1900,t,.05,'sine',.12);tone(1100,t,.04,'triangle',.06)},
  hover(t){tone(2600,t,.025,'sine',.035)},
  on(t){tone(660,t,.09,'sine',.16);tone(990,t+.07,.14,'sine',.16)},
  off(t){tone(780,t,.09,'sine',.14);tone(520,t+.07,.14,'sine',.14)},
  cycle(t,i=0){tone(520*Math.pow(1.122,(i%6)*2),t,.12,'triangle',.16);tone(1040*Math.pow(1.122,(i%6)*2),t+.03,.08,'sine',.07)},
  whoosh(t,up=1){burst(t,.55,up>0?300:2400,1.2,.22,'bandpass',sfxBus,up>0?2600:260);tone(up>0?120:260,t,.5,'sine',.06,sfxBus,up>0?420:90)},
  plop(t){tone(700,t,.09,'sine',.22,sfxBus,180);burst(t,.05,2500,2,.06,'bandpass')},
  splash(t){burst(t,.5,1800,.7,.28,'bandpass',sfxBus,500);burst(t+.02,.3,6000,1,.08,'highpass')},
  pour(t){burst(t,1.6,2400,.6,.18,'bandpass',sfxBus,1600);for(let i=0;i<8;i++)tone(500+Math.random()*600,t+.2+i*.18,.07,'sine',.05,sfxBus,200)},
  rain(t){burst(t,2.2,5200,.5,.2,'highpass');burst(t,2.2,1200,.4,.08,'lowpass')},
  coin(t){tone(988,t,.07,'square',.08);tone(1319,t+.07,.28,'square',.08)},
  chime(t){[880,1175,1480,1760].forEach((f,i)=>tone(f,t+i*.08,.6,'sine',.12))},
  scan(t){tone(180,t,.9,'sawtooth',.06,sfxBus,2400);burst(t,.9,800,3,.07,'bandpass',sfxBus,5000)},
  zap(t){tone(90,t,.45,'sawtooth',.14,sfxBus,880);burst(t,.3,3000,1,.12,'highpass')},
  power(t){tone(55,t,1.1,'sine',.3,sfxBus,220);tone(110,t,1.1,'sawtooth',.05,sfxBus,440);burst(t+.5,.7,400,1,.1,'lowpass',sfxBus,3000)},
  servo(t){tone(130,t,.8,'square',.05,sfxBus,260);burst(t,.8,900,2,.06)},
  rumble(t){burst(t,1.6,90,.6,.5,'lowpass',sfxBus,50,true)},
  ping(t){tone(1320,t,.5,'sine',.15);tone(1976,t+.02,.35,'sine',.07)},
  grow(t){[392,494,587,784].forEach((f,i)=>tone(f,t+i*.07,.3,'triangle',.1))},
  engine(t){tone(70,t,.8,'sawtooth',.1,sfxBus,150);tone(140,t,.8,'square',.03,sfxBus,300)},
  thud(t){tone(80,t,.25,'sine',.35,sfxBus,40)},
  sizzle(t){burst(t,1.2,6500,.7,.12,'highpass')},
  card(t){tone(740,t,.06,'triangle',.1);tone(1110,t+.05,.1,'triangle',.1)}
};
export function sfx(name,arg){if(!ctx||!on)return;if(ctx.state==='suspended')ctx.resume();const f=FX[name]||FX.click;try{f(ctx.currentTime+.005,arg)}catch(e){}}
/* ---------- ambien ---------- */
function layerNoise(freq,q,gain,type,lfoRate,lfoDepth,brown){const s=src(brown?brownBuf:noiseBuf,true),f=ctx.createBiquadFilter(),g=ctx.createGain();f.type=type||'bandpass';f.frequency.value=freq;f.Q.value=q||.7;g.gain.value=gain;s.connect(f);f.connect(g);if(lfoRate){const l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=lfoRate;lg.gain.value=lfoDepth*gain;l.connect(lg);lg.connect(g.gain);l.start()}s.start();return{g,stop(){try{s.stop()}catch(e){}}}}
function layerDrone(freq,gain,type,detune,lfoRate,lfoDepth){const o=ctx.createOscillator(),g=ctx.createGain();o.type=type||'sine';o.frequency.value=freq;o.detune.value=detune||0;g.gain.value=gain;o.connect(g);if(lfoRate){const l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=lfoRate;lg.gain.value=lfoDepth*gain;l.connect(lg);lg.connect(g.gain);l.start()}o.start();return{g,stop(){try{o.stop()}catch(e){}}}}
function every(min,max,fn){let alive=true;const tick=()=>{if(!alive)return;fn();timers.push(setTimeout(tick,(min+Math.random()*(max-min))*1000))};timers.push(setTimeout(tick,min*1000));return()=>{alive=false}}
const bird=()=>{if(!ctx||!on)return;const t=ctx.currentTime,f=2400+Math.random()*1800;for(let i=0;i<2+((Math.random()*3)|0);i++){tone(f*(1+i*.08),t+i*.11,.08,'sine',.035,ambBus,f*(1.2+Math.random()*.3))}};
const drip=()=>{if(!ctx||!on)return;tone(900+Math.random()*700,ctx.currentTime,.12,'sine',.05,ambBus,350)};
const cricket=()=>{if(!ctx||!on)return;const t=ctx.currentTime;for(let i=0;i<3;i++)tone(4300,t+i*.06,.03,'square',.012,ambBus)};
const bubble=()=>{if(!ctx||!on)return;tone(300+Math.random()*500,ctx.currentTime,.1,'sine',.05,ambBus,900)};
const crackle=()=>{if(!ctx||!on)return;burst(ctx.currentTime,.03,3000+Math.random()*3000,1.5,.05,'bandpass',ambBus)};
const star=()=>{if(!ctx||!on)return;const t=ctx.currentTime,f=1500+Math.random()*1500;tone(f,t,1.4,'sine',.02,ambBus)};
const beat=()=>{if(!ctx||!on)return;const t=ctx.currentTime;tone(60,t,.2,'sine',.16,ambBus,35);tone(60,t+.28,.2,'sine',.1,ambBus,35)};
const RECIPES={
  city:()=>[layerNoise(500,.5,.07,'bandpass',.07,.5),layerDrone(55,.05,'sine',0,.1,.4)],
  hum:()=>[layerDrone(55,.08,'sine',0),layerDrone(110.4,.04,'sawtooth',0,.2,.5),layerNoise(5000,.8,.01,'highpass'),layerNoise(180,.6,.04,'lowpass')],
  sea:()=>[layerNoise(700,.4,.1,'lowpass',.11,.8),layerNoise(2500,.6,.02,'bandpass',.13,.9),layerNoise(300,.5,.04,'bandpass',.05,.5)],
  under:()=>[layerNoise(260,.6,.12,'lowpass',.07,.4),layerDrone(48,.05,'sine',0,.06,.5),()=>every(.8,2.4,bubble)],
  jungle:()=>[layerNoise(900,.4,.05,'bandpass',.09,.6),layerNoise(2600,.7,.012,'highpass'),()=>every(1.5,4,bird),()=>every(2,5,cricket)],
  garden:()=>[layerNoise(600,.4,.07,'bandpass',.08,.7),()=>every(1.2,3.5,bird),()=>every(2.5,6,drip)],
  rain:()=>[layerNoise(4800,.4,.09,'highpass'),layerNoise(900,.4,.05,'lowpass',.1,.4),layerDrone(50,.03,'sine',0,.2,.5)],
  shop:()=>[layerDrone(60,.06,'sawtooth',0,.1,.3),layerNoise(5200,2,.012,'bandpass',.5,.8),layerNoise(240,.5,.05,'lowpass')],
  night:()=>[layerNoise(400,.4,.05,'bandpass',.06,.7),()=>every(.8,2,cricket)],
  dome:()=>[layerDrone(62,.07,'sine',0,.05,.5),layerDrone(93,.04,'sine',7,.07,.6),layerNoise(300,.5,.025,'lowpass'),()=>every(3,7,star)],
  space:()=>[layerDrone(55,.07,'sine',0,.04,.6),layerDrone(82.5,.04,'triangle',5,.06,.6),()=>every(2.5,6,star)],
  showroom:()=>[layerDrone(110,.03,'sine',0,.08,.4),layerDrone(165,.02,'sine',6,.09,.4),layerNoise(1800,.8,.012,'bandpass',.1,.5)],
  cell:()=>[layerDrone(65,.06,'sine',0,.05,.6),layerDrone(98,.03,'triangle',9,.08,.5),layerNoise(1400,2,.012,'bandpass',.12,.7),()=>every(1.1,1.1,beat)],
  volcano:()=>[layerNoise(90,.6,.35,'lowpass',.07,.5,true),layerNoise(900,.4,.04,'bandpass',.1,.6),()=>every(.15,.9,crackle)],
  roastery:()=>[layerNoise(180,.6,.08,'lowpass',.05,.4),layerDrone(98,.025,'sine',0,.1,.4),()=>every(.12,.7,crackle),()=>every(3,8,bird)]
};
export function ambient(kind){
  if(!ctx||cur&&cur.kind===kind)return;
  const old=cur;cur=null;timers.forEach(clearTimeout);timers=[];
  if(old){const g=old.out;g.gain.setTargetAtTime(0,ctx.currentTime,.5);setTimeout(()=>{old.nodes.forEach(n=>n.stop&&n.stop());try{g.disconnect()}catch(e){}},2500)}
  const r=RECIPES[kind];if(!r)return;
  const out=ctx.createGain();out.gain.value=0;out.connect(ambBus);const nodes=[],stops=[];
  r().forEach(x=>{if(typeof x==='function'){stops.push(x())}else{x.g.disconnect();x.g.connect(out);nodes.push(x)}});
  nodes.push({stop(){stops.forEach(s=>s&&s())}});
  out.gain.setTargetAtTime(1,ctx.currentTime,.9);cur={kind,out,nodes}}
