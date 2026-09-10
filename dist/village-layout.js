// Grid coordinates preserve the game's fixed isometric footprint and dense compartments.
export const buildings=[];
const add=(type,x,z,size=3,extra={})=>buildings.push({type,x,z,size,...extra});
add('town-hall',0,0,4.4,{name:'Elevate Town Hall',destination:'intel'});
add('clan-castle',7,-8,3.6,{name:'The Pitch Arena',destination:'pitch'});
add('laboratory',-7,6,3.3,{name:'Builder’s Camp',destination:'hackathon'});
add('dark-storage',-9,0,2.3);
add('elixir-storage',0,-6.2,3);add('gold-storage',-6,-7,3);
add('elixir-storage',9,0,3);add('gold-storage',0,6,3);
add('gold-storage',-8,10,3);add('elixir-storage',5,7,3);
add('wizard-tower',-9,-3,3);add('wizard-tower',9,-3,3);add('wizard-tower',0,9.6,3);
add('mortar',-5,0,2.5);add('mortar',0,-10,2.6);add('mortar',10,5,2.6);add('mortar',8,10,2.6);
add('air-defense',-3,-9,2.3);add('air-defense',5,0,2.3);add('air-defense',-10,5,2.3);
add('tesla',-13,5,1.8);add('tesla',11,10,1.8);add('tesla',10,-10,1.8);
add('air-sweeper',-9,-10,2.4);
add('archer-tower',-13,-7,2.8);add('archer-tower',-6,-13,2.8);add('archer-tower',9,-13,2.8);add('archer-tower',14,0,2.8);add('archer-tower',8,13,2.8);
add('cannon',-13,-1,2.8);add('cannon',1,-13,2.8);add('cannon',14,7,2.8);add('cannon',3,15,2.8);add('cannon',-11,13,2.8);
add('barracks',-16,-6,3);add('barracks',-10,-16,3);add('barracks',11,-16,3);add('barracks',16,11,3);
add('army-camp',-17,7,4.3);add('army-camp',-13,-13,4.3);add('army-camp',17,-8,4.3);add('army-camp',10,18,4.3);
for(const [x,z] of [[-17,-1],[-17,3],[-5,-17],[0,-17],[17,0],[17,4]])add('gold-mine',x,z,2.6);
for(const [x,z] of [[-17,12],[-12,17],[-7,17],[5,-17],[17,-3],[16,16]])add('elixir-collector',x,z,2.6);
add('spell-factory',-14,3,2.7);add('dark-drill',-1,16,2.5);add('dark-drill',15,-13,2.5);
for(const [x,z] of [[-20,-10],[-5,-20],[18,20],[-17,19],[20,6]])add('builder-hut',x,z,1.9);

// Shared wall lines keep the base readable, with a central enclosure and defensive compartments.
const segments=new Map();
function line(x1,z1,x2,z2){const length=Math.max(Math.abs(x2-x1),Math.abs(z2-z1));for(let i=0;i<=length;i++){const x=x1+(x2-x1)*i/length,z=z1+(z2-z1)*i/length;segments.set(x+','+z,{x,z});}}
function ring(x1,z1,x2,z2){line(x1,z1,x2,z1);line(x2,z1,x2,z2);line(x2,z2,x1,z2);line(x1,z2,x1,z1);}
ring(-3,-3,3,3);ring(-12,-12,12,12);
line(-12,-5,-3,-5);line(-3,-12,-3,-5);line(3,-12,3,-5);line(3,-5,12,-5);
line(-12,3,-3,3);line(-4,3,-4,12);line(3,3,12,3);line(3,3,3,12);
line(-12,-5,-12,-12);line(-7,-5,-7,3);line(7,-5,7,3);
export const walls=[...segments.values()];

export const landmarks={hackathon:{x:-7,z:6,height:4.3},pitch:{x:7,z:-8,height:4.6},intel:{x:0,z:0,height:5.7}};
export const cameraStops=[
 {x:0,z:0,height:43,offsetX:-.13,offsetY:-.015},
 {x:-7,z:6,height:22,offsetX:-.16,offsetY:0},
 {x:7,z:-8,height:22,offsetX:-.16,offsetY:0},
 {x:0,z:0,height:47,offsetX:0,offsetY:0}
];
