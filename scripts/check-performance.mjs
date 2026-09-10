import assert from 'node:assert/strict';
import {createFrameClock,createQualityGovernor} from '../dist/frame-pacing.js';

for(const rate of [30,60])for(const refresh of [60,90,120,144]){
 const clock=createFrameClock(rate);let presented=0,previous=-Infinity,longest=0;
 for(let frame=0;frame<refresh*10;frame++){
  const now=frame*1000/refresh+Math.sin(frame*.73)*.15;
  if(clock.due(now)){presented++;if(Number.isFinite(previous))longest=Math.max(longest,now-previous);previous=now;}
 }
 assert.ok(Math.abs(presented-rate*10)<=2,`Frame pacing drift at ${refresh}Hz: ${presented}`);
 assert.ok(longest<=1000/rate+1000/refresh+1,'Avoidable frame gap');
 clock.reset();assert.equal(clock.due(100000),true);assert.equal(clock.due(100000.1),false);
 clock.setRate(30);assert.equal(clock.due(200000),true);assert.equal(clock.due(200010),false);assert.equal(clock.due(200034),true);
}
const quality=createQualityGovernor();let time=0;
for(let i=0;i<600;i++){time+=1000/60;quality.sample(time);}
assert.equal(quality.scale,1,'Healthy frames retain full quality');
for(let i=0;i<300;i++){time+=1000/30;quality.sample(time);}
assert.equal(quality.scale,.7,'Sustained pressure reaches the bounded lower resolution');
time+=10000;quality.sample(time);assert.equal(quality.scale,.7,'A hidden-tab gap must not change quality');
for(let i=0;i<3700;i++){time+=1000/60;quality.sample(time);}
assert.equal(quality.scale,1,'Resolution recovers after sustained headroom');
const before=quality.scale;quality.reset();quality.sample(1);assert.equal(quality.scale,before);
console.log('PASS: 30/60fps cadence across 60/90/120/144Hz, timestamp jitter, timing reset, bounded quality reduction, and gradual recovery.');
