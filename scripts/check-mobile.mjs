import assert from 'node:assert/strict';
import {renderBudget,gestureIntent} from '../dist/responsive.js';
import {cameraPose} from '../dist/world.js';

// High-DPI phones and landscape rotation must remain within their rendering budget.
for(const [width,height] of [[320,568],[360,800],[390,844],[430,932],[768,1024],[844,390],[932,430],[1024,768]]){
 for(const dpr of [1,2,3,4]){
  const budget=renderBudget(width,height,dpr,true);
  assert.equal(budget.mobile,true);assert.ok(budget.pixelRatio>0&&budget.pixelRatio<=1.25);
  assert.ok(width*height*budget.pixelRatio**2<=850001);assert.equal(budget.fps,60);
  for(const panel of [false,true])for(const chapter of [0,1,2,3]){
   const pose=cameraPose(chapter,width,height,1,budget.mobile,panel);
   assert.ok(Object.values(pose).every(Number.isFinite));assert.ok(pose.height>0);
   assert.ok(Math.abs(pose.offsetX)<=.2&&Math.abs(pose.offsetY)<.2);
   if(panel){assert.equal(pose.offsetX,0);assert.equal(pose.offsetY,0);}
  }
 }
}
assert.equal(renderBudget(1440,900,2,false).fps,60);
assert.equal(renderBudget(1440,900,2,false).mobile,false);
assert.equal(renderBudget(1440,900,2,false).pixelRatio,1.75);
assert.equal(renderBudget(390,844,3,true,true).fps,30);
assert.equal(renderBudget(390,844,3,true,true).pixelRatio,1);
assert.ok(renderBudget(390,844,3,true).pixelRatio**2/1.5**2<.7,'Phone raster load is reduced from the previous 1.5 DPR cap');

// Tap jitter, swiping, diagonal scrolling, and a gesture that changes direction.
assert.equal(gestureIntent(3,4,'touch'),'pending');
assert.equal(gestureIntent(2,30,'touch'),'scroll');
assert.equal(gestureIntent(-9,-15,'touch'),'scroll');
assert.equal(gestureIntent(14,14,'touch'),'scroll');
assert.equal(gestureIntent(28,3,'touch'),'pan');
assert.equal(gestureIntent(80,31,'touch','scroll'),'scroll');
assert.equal(gestureIntent(30,80,'touch','pan'),'pan');
assert.equal(gestureIntent(0,30,'mouse'),'pan');
console.log('PASS: phone render budgets, eight portrait/landscape sizes, centered competition cameras, data-saving mode, and scroll-versus-pan gesture locking.');
