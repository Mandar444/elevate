// Preserve a stable deadline instead of dropping alternate frames due to timestamp rounding.
export function createFrameClock(rate=60){
 let next=null,interval=1000/rate;
 return {
  due(now){
   if(next===null){next=now+interval;return true;}
   if(now+.8<next)return false;
   next+=Math.max(1,Math.floor((now-next)/interval)+1)*interval;
   return true;
  },
  setRate(value){interval=1000/value;next=null;},
  reset(){next=null;}
 };
}

// Adjust resolution only after sustained pressure; restore it slowly to avoid oscillation.
export function createQualityGovernor(){
 let scale=1,previous=null,elapsed=0,frames=0,healthy=0;
 return {
  sample(now,rate=60){
   if(previous===null){previous=now;return null;}
   const gap=now-previous;previous=now;
   if(gap<=0||gap>250){elapsed=0;frames=0;healthy=0;return null;}
   elapsed+=gap;frames++;
   if(elapsed<2000||frames<20)return null;
   const average=elapsed/frames,target=1000/rate;elapsed=0;frames=0;
   const before=scale;
   if(average>target*1.35){scale=Math.max(.7,Math.round((scale-.1)*100)/100);healthy=0;}
   else if(average<target*1.08){healthy++;if(healthy>=4){scale=Math.min(1,Math.round((scale+.05)*100)/100);healthy=0;}}
   else healthy=0;
   return scale===before?null:scale;
  },
  reset(){previous=null;elapsed=0;frames=0;healthy=0;},
  get scale(){return scale;}
 };
}
