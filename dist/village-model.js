import * as T from './vendor/three.module.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';
import { mergeGeometries } from './vendor/BufferGeometryUtils.js';

// A purpose-built miniature village. All scenery is geometry, not a backdrop.
export function buildVillage() {
  const root = new T.Group();
  const animated = { flags: [], flames: [], waterfalls: [], crystals: [], clouds: [], villagers: [], mill: null };
  let state = 71;
  const random = () => { state=(state*16807)%2147483647;return (state-1)/2147483646; };
  const materials = {};
  function material(name,color,extra={}) { return materials[name] ||= new T.MeshStandardMaterial({color,roughness:.84,metalness:0,...extra}); }
  const m={
    grass:material('grass',0x66ac2a), grassLight:material('grassLight',0x8ac438), grassDark:material('grassDark',0x488522),
    cliff:material('cliff',0xb59161,{flatShading:true,vertexColors:true}), rock:material('rock',0x87968c,{flatShading:true}),
    stone:material('stone',0xc5c7b4), stoneDark:material('stoneDark',0x969b86), stoneLight:material('stoneLight',0xe4debd),
    wood:material('wood',0x75472b), woodLight:material('woodLight',0xa8723f), woodDark:material('woodDark',0x4b3729),
    roof:material('roof',0xe85c20), roofLight:material('roofLight',0xff8730), roofDark:material('roofDark',0xc33c18),
    blue:material('blue',0x237fbd), blueLight:material('blueLight',0x3bb3e2),
    gold:material('gold',0xf3c758,{metalness:.32,roughness:.44}), iron:material('iron',0x3f545b,{metalness:.45,roughness:.55}),
    sand:material('sand',0xdbbb78), leaves:material('leaves',0x277a34,{flatShading:true}), leavesLight:material('leavesLight',0x58a52c,{flatShading:true}),
    purple:material('purple',0xbc38df,{metalness:.13,roughness:.27,emissive:0x8011b6,emissiveIntensity:.26}),
    window:material('window',0xffd988,{emissive:0xffa23c,emissiveIntensity:.55,roughness:.4}),
    white:material('white',0xfff2cf), water:material('water',0x47bfd2,{roughness:.26,metalness:.2,transparent:true,opacity:.9}),
    dark:material('dark',0x252b27), red:material('red',0xc14832), flower:material('flower',0xf5d960),
  };
  const cube=new T.BoxGeometry(1,1,1), rounded=new RoundedBoxGeometry(1,1,1,1,.06);
  function mesh(geo,mat,parent=root,x=0,y=0,z=0,sx=1,sy=sx,sz=sx){const o=new T.Mesh(geo,mat);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function box(x,y,z,w,h,d,mat,parent=root,soft=true){return mesh(soft?rounded:cube,mat,parent,x,y,z,w,h,d);}
  function cyl(x,y,z,r,h,mat,parent=root,segments=12,top=r){return mesh(new T.CylinderGeometry(top,r,h,segments),mat,parent,x,y,z);}
  function ico(x,y,z,r,mat,parent=root,sx=1,sy=1,sz=1){return mesh(new T.IcosahedronGeometry(r,0),mat,parent,x,y,z,sx,sy,sz);}
  function line(a,b,r,mat,parent=root){const from=new T.Vector3(...a),to=new T.Vector3(...b),mid=from.clone().add(to).multiplyScalar(.5);const o=cyl(mid.x,mid.y,mid.z,r,from.distanceTo(to),mat,parent,7);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),to.sub(from).normalize());return o;}
  function group(x,y,z,rotation=0){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rotation;root.add(g);return g;}
  const floor=1.55;

  // Hand-sculpted faceted cliff, with an irregular lip and a tapered floating base.
  const outline=[];const n=44;
  for(let i=0;i<n;i++){const a=i/n*Math.PI*2,r=.94+random()*.11;outline.push([Math.cos(a)*11.3*r,Math.sin(a)*8.25*r]);}
  const shape=new T.Shape();outline.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
  const top=new T.ExtrudeGeometry(shape,{depth:.28,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.14,bevelThickness:.13});top.rotateX(-Math.PI/2);
  mesh(top,m.grass,root,0,floor-.28,0);
  const pos=[], colors=[];
  function triangle(a,b,c,shade){pos.push(...a,...b,...c);for(let j=0;j<3;j++)colors.push(shade,shade*.98,shade*.91);}
  for(let i=0;i<n;i++){
    const j=(i+1)%n,[ax,az]=outline[i],[bx,bz]=outline[j];
    const A=[ax,floor-.27,az],B=[bx,floor-.27,bz],C=[ax*.93,-.6-random()*.55,az*.93],D=[bx*.93,-.6-random()*.55,bz*.93];
    const E=[ax*.55,-3.8-random()*1.0,az*.55],F=[bx*.55,-3.8-random()*1.0,bz*.55];
    triangle(A,B,C,.84+random()*.2);triangle(B,D,C,.8+random()*.2);triangle(C,D,E,.65+random()*.27);triangle(D,F,E,.68+random()*.22);triangle(E,F,[0,-5.0,0],.65+random()*.2);
  }
  const cliff=new T.BufferGeometry();cliff.setAttribute('position',new T.Float32BufferAttribute(pos,3));cliff.setAttribute('color',new T.Float32BufferAttribute(colors,3));cliff.computeVertexNormals();mesh(cliff,m.cliff);
  for(let i=0;i<39;i++){const [x,z]=outline[Math.floor(random()*n)];const b=ico(x*.98,.85-random()*1.3,z*.98,.5+random()*.5,m.rock,root,1,.8,1);b.rotation.set(random(),random(),random());}
  for(let i=0;i<10;i++){const angle=random()*Math.PI*2;const x=Math.cos(angle)*(.8+random()*.2)*13,z=Math.sin(angle)*(.8+random()*.2)*10;const r=.25+random()*.6;ico(x,-2-random()*2,z,r,m.rock,root,1,1.5,1);}

  // Paths are shaped ribbons that lie just above the terrain.
  function path(points,width,mat=m.sand){const curve=new T.CatmullRomCurve3(points.map(([x,z])=>new T.Vector3(x,floor+.025,z)));const p=[],uv=[],idx=[];for(let i=0;i<=40;i++){const t=i/40,a=curve.getPoint(t),d=curve.getTangent(t),v=new T.Vector3(-d.z,0,d.x).multiplyScalar(width/2);p.push(...a.clone().add(v).toArray(),...a.clone().sub(v).toArray());uv.push(t,0,t,1);if(i<40){const q=i*2;idx.push(q,q+1,q+2,q+1,q+3,q+2);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const o=mesh(g,mat);o.material.side=T.DoubleSide;return o;}
  path([[0,0],[0,3.8],[1.3,5.3],[5.5,4.6],[6,1.7]],1.05);path([[0,3.3],[-2,4],[-4.4,3],[-5.4,1]],.8);path([[1.2,0],[3,-1],[4.9,-3.6]],.8);
  for(let i=0;i<11;i++)box((random()-.5)*.7,floor+.045,2.4+i*.25,.23,.05,.13,m.stoneLight,root);

  function roof(parent,x,y,z,w,d,h,mat=m.roof){
    // Layered hips, projecting eaves, and a broad terracotta ridge.
    box(x,y-.08,z,w+.28,.19,d+.28,m.woodDark,parent);
    for(let j=0;j<5;j++){const s=1-j*.15;const g=new T.CylinderGeometry(.60,.79,1,4,1,false);g.rotateY(Math.PI/4);mesh(g,j%2?mat:(mat===m.roof?m.roofLight:m.blueLight),parent,x,y+j*h/5,z,w*s,h/5+.025,d*s);}
    box(x,y+h+.04,z,w*.24,.18,d*.28,m.gold,parent);
  }
  function arch(parent,x,y,z,w,h,mat,depth=.12){const s=new T.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h-w/2);s.absarc(0,h-w/2,w/2,0,Math.PI,false);s.lineTo(-w/2,0);const g=new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.045,bevelThickness:.035,bevelSegments:1,steps:1,curveSegments:8});return mesh(g,mat,parent,x,y,z);}
  function flag(parent,x,y,z,color=m.red,scale=1){
    cyl(x,y+1.1*scale,z,.045*scale,2.2*scale,m.woodDark,parent,8);
    ico(x,y+2.25*scale,z,.105*scale,m.gold,parent);
    const cloth=new T.PlaneGeometry(.93*scale,.59*scale,10,5);cloth.translate(.46*scale,-.27*scale,0);
    const flagMat=color.clone();flagMat.side=T.DoubleSide;
    const f=mesh(cloth,flagMat,parent,x,y+2.1*scale,z);f.userData.dynamic=true;f.userData.original=cloth.attributes.position.array.slice();f.userData.seed=random()*6;animated.flags.push(f);
    box(x+.47*scale,y+1.79*scale,z+.015,.12*scale,.25*scale,.02,m.gold,parent);
  }

  const hall=group(0,floor,0);
  box(0,.16,0,4.4,.32,3.95,m.stoneDark,hall);box(0,.42,0,4.0,.28,3.6,m.stoneLight,hall);
  box(0,1.68,0,3.6,2.4,3.18,m.stone,hall);
  for(const x of [-1.77,1.77])for(const z of [-1.57,1.57]){box(x,1.65,z,.32,2.6,.32,m.wood,hall);box(x,2.83,z,.44,.17,.44,m.gold,hall);}
  box(0,2.75,1.63,3.75,.2,.17,m.wood,hall);box(0,1.0,1.63,3.5,.15,.15,m.stoneLight,hall);
  arch(hall,0,.55,1.62,1.26,1.86,m.woodDark,.11);arch(hall,0,.59,1.76,1.0,1.59,m.woodLight,.07);
  for(let i=-2;i<=2;i++)box(i*.19,1.28,1.85,.024,1.3,.025,m.woodDark,hall,false);
  box(0,.91,1.88,.95,.085,.035,m.iron,hall);box(0,1.67,1.87,.95,.085,.035,m.iron,hall);ico(.25,1.3,1.91,.075,m.gold,hall);
  for(const x of [-1.22,1.22]){arch(hall,x,1.36,1.7,.47,.83,m.woodDark);arch(hall,x,1.44,1.85,.32,.61,m.window,.035);}
  roof(hall,0,3.0,0,4.5,4.15,1.7);
  box(0,4.75,-.28,1.25,.9,1.1,m.stoneLight,hall);roof(hall,0,5.22,-.28,1.6,1.45,.67);
  arch(hall,0,4.49,.32,.42,.59,m.window,.045);
  box(-1.65,4.28,-1.1,.42,1.2,.48,m.stoneDark,hall);box(-1.65,4.91,-1.1,.53,.2,.6,m.stone,hall);
  for(let i=0;i<4;i++)box(0,.47-i*.12,2.05+i*.25,1.62,.22,.4,m.stoneLight,hall);
  flag(hall,-2.15,2.4,.2,m.red,.82);

  // Fortified perimeter, with proper raised stone joints and crenellations.
  function wall(x,z,angle){const g=group(x,floor,z,angle);box(0,.4,0,.85,.8,.62,m.stoneDark,g);box(0,.79,0,.96,.17,.76,m.stoneLight,g);box(0,1.03,0,.44,.32,.59,m.stone,g);box(-.23,.28,.32,.02,.28,.035,m.stoneLight,g,false);box(.23,.58,.32,.02,.2,.035,m.stoneLight,g,false);}
  for(let x=-3.5;x<=3.5;x+=.86){wall(x,-2.85,0);if(Math.abs(x)>1.25)wall(x,3.1,0);}
  for(let z=-2.1;z<=2.7;z+=.86){wall(-3.94,z,Math.PI/2);wall(3.94,z,Math.PI/2);}
  for(const x of [-3.95,3.95])for(const z of [-2.85,3.1]){const g=group(x,floor,z);box(0,.74,0,1.15,1.48,1.15,m.stoneDark,g);box(0,1.5,0,1.35,.25,1.35,m.stoneLight,g);for(const a of [-.48,.48])for(const b of [-.48,.48])box(a,1.84,b,.35,.43,.35,m.stone,g);}

  const shop=group(-6.15,floor,1.25,.10);
  box(0,.17,0,3.2,.34,2.7,m.stoneDark,shop);box(0,1.15,0,2.7,1.9,2.18,m.woodLight,shop);
  for(const x of [-1.24,1.24])box(x,1.2,1.08,.21,2,.2,m.woodDark,shop);
  for(let j=0;j<5;j++)box(0,.4+j*.34,1.1,2.6,.055,.025,m.wood,shop,false);
  arch(shop,0,.33,1.15,.86,1.5,m.woodDark);roof(shop,0,2.15,0,3.35,2.8,1.1,m.blue);
  // Open prototyping bench and its tiny luminous crystal.
  box(.2,.75,2.0,1.7,.13,.73,m.wood,shop);for(const x of [-.43,.85])box(x,.4,2.0,.12,.7,.15,m.woodDark,shop);
  box(-.04,.98,2.02,.52,.12,.4,m.iron,shop);const crystal=mesh(new T.OctahedronGeometry(.23,0),m.purple,shop,-.04,1.3,2.02,.7,1.4,.7);crystal.userData.dynamic=true;animated.crystals.push(crystal);
  cyl(-1.9,1.75,0,.085,3.5,m.wood,shop);line([-1.9,3.4,0],[-.3,3.4,0],.09,m.wood,shop);line([-1.9,2.4,0],[-.7,3.4,0],.065,m.woodLight,shop);line([-.35,3.4,0],[-.35,2.7,0],.018,m.iron,shop);
  flag(shop,-1.4,1.5,1.6,m.blue,.85);
  const mill=new T.Group();mill.position.set(0,2.8,-1.5);mill.userData.dynamic=true;shop.add(mill);for(let i=0;i<4;i++){const g=new T.Group();g.rotation.z=i*Math.PI/2;mill.add(g);box(0,.75,0,.13,1.45,.10,m.wood,g);box(.21,.94,.04,.39,.7,.055,m.white,g,false);}ico(0,0,.12,.16,m.gold,mill);animated.mill=mill;

  const pitch=group(6.4,floor,1.2,-.18);
  cyl(0,.22,0,2.05,.44,m.stoneDark,pitch,24);cyl(0,.49,0,1.9,.16,m.wood,pitch,24);cyl(0,.6,0,1.7,.09,m.woodLight,pitch,24);
  for(let i=-4;i<=4;i++)box(i*.31,.657,.1,.014,.01,Math.sqrt(Math.max(0,1.68**2-(i*.31)**2))*2,m.woodDark,pitch,false);
  for(const x of [-1.46,1.46]){cyl(x,1.83,-.85,.075,2.65,m.gold,pitch,9);flag(pitch,x,1.55,-.85,m.purple,.82);}
  box(0,1.23,-.24,.72,1.0,.5,m.wood,pitch);box(0,1.77,-.24,.88,.12,.68,m.gold,pitch);line([0,1.83,-.16],[0,2.2,-.16],.025,m.iron,pitch);ico(0,2.22,-.16,.065,m.iron,pitch);
  for(let r=0;r<2;r++)for(let j=0;j<6;j++){const a=.12+j*.57;const x=Math.cos(a)*(2.4+r*.53),z=Math.sin(a)*(2.4+r*.53);const bench=box(x,.39,z,.57,.16,.28,m.wood,pitch);bench.rotation.y=-a;box(x,.17,z,.25,.28,.21,m.stoneDark,pitch);}
  for(const x of [-.9,.9]){const gem=mesh(new T.OctahedronGeometry(.27),m.purple,pitch,x,.98,-.7,.8,1.7,.8);gem.userData.dynamic=true;animated.crystals.push(gem);}

  // Elixir refinery, gold vault, and defensive towers.
  for(const [x,z] of [[-5.6,-3.8],[-3.8,-4.5]]){const g=group(x,floor,z);cyl(0,.22,0,.85,.44,m.stoneDark,g);cyl(0,.51,0,.75,.13,m.iron,g);mesh(new T.SphereGeometry(.7,14,10),m.purple,g,0,1.14,0,1,1.03,1);for(let i=0;i<4;i++){const a=i*Math.PI/2;box(Math.cos(a)*.7,.96,Math.sin(a)*.7,.08,1.2,.08,m.gold,g);}cyl(0,1.73,0,.53,.15,m.iron,g);cyl(0,1.95,0,.17,.38,m.gold,g);}
  const vault=group(5.3,floor,-4.05,.2);box(0,.24,0,2.5,.45,1.92,m.stoneDark,vault);box(0,.83,0,2.18,.8,1.64,m.wood,vault);
  const lid=new T.CylinderGeometry(.8,.8,2.19,12,1,false,0,Math.PI);lid.rotateZ(Math.PI/2);mesh(lid,m.woodLight,vault,0,1.23,0);
  for(const x of [-.83,.83]){box(x,.96,.85,.16,.87,.07,m.gold,vault);box(x,.95,-.83,.16,.89,.07,m.gold,vault);}
  box(0,1.21,.86,.3,.35,.12,m.gold,vault);ico(0,1.2,.95,.062,m.woodDark,vault);
  for(let i=0;i<23;i++){const x=(random()-.5)*2.6,z=1.05+random()*.8;const coin=cyl(x,.10+random()*.18,z,.18,.07,m.gold,vault,10);coin.rotation.z=(random()-.5)*.4;}
  function cannon(x,z,angle){const g=group(x,floor,z,angle);box(0,.15,0,1.25,.3,1.1,m.stoneDark,g);for(const x of [-.42,.42]){const wheel=cyl(x,.53,0,.36,.15,m.wood,g,10);wheel.rotation.z=Math.PI/2;}box(0,.7,0,.55,.37,.7,m.iron,g);const gun=cyl(0,.91,.25,.29,1.3,m.iron,g,12,.34);gun.rotation.x=Math.PI/2+.18;const mouth=cyl(0,1.03,.86,.23,.025,m.dark,g,12);mouth.rotation.x=Math.PI/2+.18;}
  cannon(-2.0,5.5,-.35);cannon(4.4,5.4,.45);
  const tower=group(1.6,floor,-5.4);for(const x of [-.48,.48])for(const z of [-.48,.48])box(x,1.3,z,.18,2.6,.18,m.wood,tower);line([-.5,.4,.49],[.5,2.2,.49],.06,m.woodLight,tower);line([.5,.4,.49],[-.5,2.2,.49],.06,m.woodLight,tower);box(0,2.56,0,1.65,.24,1.5,m.wood,tower);for(const z of [-.64,.64])box(0,2.98,z,1.65,.6,.16,m.woodLight,tower);roof(tower,0,3.4,0,1.95,1.8,.7,m.roof);

  // Grass, trees, flower clusters and cliff-side greenery.
  function tree(x,z,s=1){const g=group(x,floor,z,random()*6);cyl(0,.65*s,0,.12*s,1.3*s,m.wood,g,7);for(let k=0;k<3;k++){const geo=new T.ConeGeometry((.85-k*.17)*s,1.45*s,7);mesh(geo,k%2?m.leavesLight:m.leaves,g,0,(1.4+k*.55)*s,0);}ico(.14*s,1.75*s,-.15*s,.55*s,m.leavesLight,g);}
  for(let i=0;i<27;i++){const a=i/27*Math.PI*2;const x=Math.cos(a)*(9.1+random()*.4),z=Math.sin(a)*(6.65+random()*.3);if(x<-6&&z>1)continue;if(x>4&&z>4)continue;tree(x,z,.6+random()*.58);}
  tree(-8.5,-3.5,1.2);tree(8.6,-3.0,1.0);tree(7.3,-5.2,.78);
  for(let i=0;i<85;i++){const x=(random()-.5)*20,z=(random()-.5)*14;if(x*x/100+z*z/49>.88||Math.abs(x)<4.8&&Math.abs(z)<4||Math.abs(x)>4.5&&Math.abs(x)<8.5&&Math.abs(z)<3.2)continue;ico(x,floor+.08,z,.08+random()*.15,i%5===0?m.flower:m.grassLight,root,1,.4,1);}

  // A stream leaves the island as flowing water, foam and mist.
  path([[-8.9,-2],[-8.1,.3],[-7.4,2.5],[-7.0,5.25]],1.25,m.water);
  const waterfallMat=new T.ShaderMaterial({transparent:true,side:T.DoubleSide,depthWrite:false,uniforms:{time:{value:0},night:{value:0}},vertexShader:`varying vec2 vUv;uniform float time;void main(){vUv=uv;vec3 p=position;p.z+=sin(uv.y*12.+time*2.+uv.x*9.)*.055;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`varying vec2 vUv;uniform float time;uniform float night;void main(){float lines=pow(.5+.5*sin(vUv.x*57.+sin(vUv.y*12.-time*4.)*1.2),9.);float foam=pow(.5+.5*sin(vUv.y*42.-time*9.),16.)*.3;float a=smoothstep(0.,.08,vUv.x)*smoothstep(1.,.9,vUv.x);vec3 c=mix(vec3(.22,.76,.86),vec3(.85,.99,1.),lines*.65+foam);c*=1.-night*.45;gl_FragColor=vec4(c,a*.78);}`});
  const waterfall=mesh(new T.PlaneGeometry(1.35,6.6,10,30),waterfallMat,root,-7.0,-1.72,5.28);waterfall.userData.dynamic=true;waterfall.castShadow=false;animated.waterfalls.push(waterfall);
  for(let j=0;j<7;j++)ico(-7+(random()-.5)*1.1,floor+.12,5.19+(random()-.5)*.4,.19,m.white,root,1,.25,.6);

  // A warm campfire. Only the flames remain independent after geometry batching.
  const fire=group(-3.7,floor,5.55);for(let j=0;j<7;j++){const a=j/7*Math.PI*2;ico(Math.cos(a)*.39,.12,Math.sin(a)*.39,.19,m.rock,fire,1,.6,1);}
  line([-.28,.13,-.15],[.28,.13,.15],.09,m.woodDark,fire);line([-.26,.15,.17],[.25,.15,-.17],.09,m.wood,fire);
  const flameMat=new T.MeshBasicMaterial({color:0xffb839,transparent:true,opacity:.85});for(let j=0;j<3;j++){const f=mesh(new T.OctahedronGeometry(.18,0),flameMat,fire,(j-1)*.1,.45,j*.06,1,2.0+j*.5,1);f.userData.dynamic=true;animated.flames.push(f);}

  // Small, articulated inhabitants make the village feel inhabited at every camera scale.
  const skin=material('skin',0xe5ad77),hair=material('hair',0xf2ca48),apron=material('apron',0x9b6238);
  function villager(x,z,type,scale,walking=false){
    const g=group(x,floor,z);g.scale.setScalar(scale);g.userData.dynamic=true;g.userData.start=g.position.clone();g.userData.walking=walking;g.userData.seed=random()*7;
    const torso=type==='wizard'?m.blue:type==='builder'?apron:skin;
    if(type==='wizard')mesh(new T.CylinderGeometry(.19,.34,.59,8),torso,g,0,.56,0);
    else box(0,.65,0,.5,.55,.31,torso,g);
    box(0,.43,0,.49,.11,.34,m.woodDark,g);box(0,.44,.185,.12,.13,.03,m.gold,g);
    const head=mesh(new T.SphereGeometry(.255,12,8),skin,g,0,1.13,.015,1,1.03,.92);
    if(type==='wizard'){
      const hood=mesh(new T.ConeGeometry(.325,.46,8),m.blue,g,0,1.39,-.025);hood.rotation.x=-.15;
      const beard=mesh(new T.ConeGeometry(.13,.26,7),m.woodDark,g,0,.96,.208);beard.rotation.z=Math.PI;
    }else{box(0,1.31,-.01,.51,.18,.47,type==='builder'?m.roofLight:hair,g);box(-.2,1.16,-.02,.09,.24,.35,type==='builder'?m.roofLight:hair,g);box(.2,1.16,-.02,.09,.24,.35,type==='builder'?m.roofLight:hair,g);}
    for(const x of [-.09,.09]){box(x,1.17,.224,.075,.064,.027,m.white,g);box(x,1.166,.243,.032,.035,.012,m.dark,g,false);box(x,1.233,.22,.11,.025,.025,m.woodDark,g);if(type==='barbarian')box(x*.7,1.048,.239,.135,.05,.047,hair,g);}
    const legs=[];for(const x of [-.14,.14]){const leg=new T.Group();leg.position.set(x,.39,0);g.add(leg);box(0,-.16,0,.145,.33,.15,type==='wizard'?m.blueDark||m.blue:m.woodDark,leg);box(0,-.31,.035,.17,.13,.26,m.wood,leg);legs.push(leg);}
    const arms=[];for(const side of [-1,1]){const arm=new T.Group();arm.position.set(side*.3,.86,0);arm.rotation.z=side*.15;g.add(arm);cyl(0,-.16,0,.082,.32,skin,arm,8);mesh(new T.SphereGeometry(.096,8,6),skin,arm,0,-.33,0);cyl(0,-.24,0,.09,.09,m.woodDark,arm,8);arms.push(arm);}
    if(type==='barbarian'){box(0,-.26,.3,.085,.035,.73,m.stoneLight,arms[1]);box(0,-.26,.0,.28,.085,.08,m.gold,arms[1]);}
    if(type==='builder'){box(0,-.2,.18,.065,.07,.55,m.woodDark,arms[1]);box(0,-.2,.42,.29,.18,.18,m.gold,arms[1]);}
    if(type==='wizard'){arms[1].rotation.x=-.95;mesh(new T.OctahedronGeometry(.13),m.purple,arms[1],0,-.43,.06);}
    g.userData.legs=legs;g.userData.arms=arms;g.userData.type=type;animated.villagers.push(g);
  }
  villager(-1.35,4.7,'barbarian',.8,true);
  villager(-6.65,3.0,'builder',.76);
  villager(5.2,3.75,'wizard',.76);
  villager(2.7,5.85,'barbarian',.67,true);

  // Cloud banks and a gently drifting red balloon frame the floating miniature.
  const cloudMat=new T.MeshStandardMaterial({color:0xffffff,roughness:1,transparent:true,opacity:.73,flatShading:false,depthWrite:false});
  for(let i=0;i<9;i++){const g=group(Math.cos(i*2.4)*19,-4.7-random()*2,Math.sin(i*2.4)*15);g.userData.dynamic=true;g.userData.start=g.position.clone();g.userData.seed=i;for(let j=0;j<5;j++){const c=mesh(new T.SphereGeometry(1,12,8),cloudMat,g,(j-2)*.85,random()*.25,random()*.5,1.2+random(),.44,.7+random());c.castShadow=false;}animated.clouds.push(g);}
  const balloon=group(8.0,7.1,-5.7);balloon.userData.dynamic=true;balloon.userData.start=balloon.position.clone();balloon.userData.seed=13;
  mesh(new T.SphereGeometry(1,16,12),m.red,balloon,0,1.4,0,1.05,1.3,1.05);for(let j=0;j<4;j++){const a=j*Math.PI/2+.4;line([Math.cos(a)*.64,.6,Math.sin(a)*.64],[Math.cos(a)*.34,-.4,Math.sin(a)*.34],.026,m.woodDark,balloon);}box(0,-.45,0,.83,.54,.7,m.woodLight,balloon);box(0,-.16,0,.93,.1,.79,m.wood,balloon);animated.clouds.push(balloon);

  // Merge static geometry by material: the detail does not cost thousands of draw calls.
  root.updateMatrixWorld(true);const buckets=new Map(), staticMeshes=[];
  root.traverse(o=>{if(!o.isMesh)return;let dynamic=false,p=o;while(p&&p!==root){if(p.userData.dynamic){dynamic=true;break;}p=p.parent;}if(dynamic)return;const geometry=o.geometry.clone();geometry.applyMatrix4(o.matrixWorld);geometry.deleteAttribute('uv');geometry.deleteAttribute('uv1');const normalized=geometry.index?geometry.toNonIndexed():geometry;const key=o.material.uuid+'-'+Object.keys(normalized.attributes).sort().join(',');if(!buckets.has(key))buckets.set(key,{mat:o.material,geometries:[],cast:o.castShadow});buckets.get(key).geometries.push(normalized);staticMeshes.push(o);});
  staticMeshes.forEach(o=>o.removeFromParent());
  for(const {mat,geometries,cast} of buckets.values()){const merged=mergeGeometries(geometries,false);if(!merged)throw new Error('Village geometry could not be combined');merged.computeBoundingSphere();const o=mesh(merged,mat);o.castShadow=cast;geometries.forEach(g=>g.dispose());}
  const landmarks={hackathon:new T.Vector3(-6.15,4.9,1.25),pitch:new T.Vector3(6.4,4.0,1.2),intel:new T.Vector3(5.3,3.1,-4.05)};
  return {root,animated,materials:m,landmarks,meshCount:root.getObjectsByProperty('isMesh',true).length};
}
