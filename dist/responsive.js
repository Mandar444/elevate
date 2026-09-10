export const PHONE_LAYOUT_QUERY='(max-width: 760px), (max-width: 1024px) and (pointer: coarse)';

// Keep high-density phone screens from spending desktop-sized pixel budgets.
export function renderBudget(width,height,dpr=1,coarse=false,saveData=false){
 const mobile=width<=760||coarse&&width<=1024;
 const cap=saveData?1:mobile?1.25:1.75;
 const pixelLimit=mobile?850000:Infinity;
 return {mobile,pixelRatio:Math.min(Math.max(1,dpr),cap,Math.sqrt(pixelLimit/Math.max(1,width*height))),fps:saveData?20:mobile?24:30};
}

// A vertical touch gesture always belongs to document scrolling, including after it turns sideways.
export function gestureIntent(dx,dy,pointerType,current='pending'){
 if(current!=='pending')return current;
 if(Math.hypot(dx,dy)<8)return 'pending';
 return pointerType==='touch'&&Math.abs(dy)>=Math.abs(dx)?'scroll':'pan';
}
