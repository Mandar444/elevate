/** A small native WebGL scene: real perspective, rotating 3D shards, and drifting embers.
 * No runtime libraries. Artwork remains visible without WebGL or JavaScript.
 */
export function startWorld(canvas, world, reducedMotion) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false, powerPreference: 'low-power' });
  if (!gl) return;
  function shader(type, source) {
    const result = gl.createShader(type);
    gl.shaderSource(result, source); gl.compileShader(result);
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) { gl.deleteShader(result); throw new Error('Scene shader unavailable'); }
    return result;
  }
  const program = gl.createProgram();
  gl.attachShader(program, shader(gl.VERTEX_SHADER, `
    attribute vec3 aPosition;
    attribute vec3 aOffset;
    attribute vec3 aColor;
    attribute float aSeed;
    uniform float uTime;
    uniform float uAspect;
    uniform float uDpr;
    uniform vec2 uPointer;
    uniform float uParticles;
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      float t = uTime * .3 + aSeed;
      float c = cos(t), s = sin(t);
      float c2 = cos(t * .7), s2 = sin(t * .7);
      vec3 p = aPosition;
      p.xz = mat2(c, -s, s, c) * p.xz;
      p.yz = mat2(c2, -s2, s2, c2) * p.yz;
      p += aOffset;
      p.y += sin(uTime * .45 + aSeed) * .055;
      if (uParticles > .5) p.y = mod(p.y + uTime * (.022 + fract(aSeed) * .02) + 1.25, 2.5) - 1.25;
      p.xy += uPointer * .045 * (p.z + .8);
      float depth = 2.5 - p.z;
      gl_Position = vec4(p.x * 1.9 / uAspect, p.y * 1.9, 0., depth);
      gl_PointSize = (1.0 + fract(aSeed) * 2.0) * uDpr / depth;
      vColor = aColor;
      vAlpha = .35 + .25 * sin(aSeed + uTime * .7);
    }
  `));
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    uniform float uParticles;
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      float alpha = vAlpha;
      if (uParticles > .5) {
        float d = length(gl_PointCoord - .5);
        if (d > .5) discard;
        alpha *= 1.0 - smoothstep(.12, .5, d);
      }
      gl_FragColor = vec4(vColor, alpha);
    }
  `));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  const vertices = [], embers = [];
  const faces = [[0,2,3],[0,3,4],[0,4,5],[0,5,2],[1,3,2],[1,4,3],[1,5,4],[1,2,5]];
  const corners = [[0,1.8,0],[0,-1.8,0],[1,0,0],[0,0,1],[-1,0,0],[0,0,-1]];
  const shards = [[-.78,.4,.3,.036,0],[.82,.15,.35,.055,1],[-.59,-.63,.2,.027,0],[.58,-.7,.1,.023,1],[.58,.8,-.2,.023,0]];
  shards.forEach(([x,y,z,size,purple], i) => {
    faces.forEach((face,f) => {
      const color = purple ? [.63,.4,1] : [.93,.65,.23];
      const light = .5 + f / 15;
      face.forEach(index => { vertices.push(...corners[index].map(n => n * size), x,y,z,...color.map(n => n * light),i * 1.73); });
    });
  });
  let seed = 37;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  for (let i=0;i<95;i++) embers.push(0,0,0,(random()-.5)*2.2,(random()-.5)*2.4,(random()-.5)*1.4,.96,.66,.28,random()*20);
  function buffer(data) { const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);return b; }
  const shardBuffer=buffer(vertices), emberBuffer=buffer(embers);
  const attrs=[['aPosition',3,0],['aOffset',3,12],['aColor',3,24],['aSeed',1,36]].map(([name,size,offset])=>({location:gl.getAttribLocation(program,name),size,offset}));
  const uniforms=Object.fromEntries(['uTime','uAspect','uDpr','uPointer','uParticles'].map(name=>[name,gl.getUniformLocation(program,name)]));
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
  let raf=0, visible=true, last=0, width=1, height=1, dpr=1, elapsed=0;
  function resize(){const rect=canvas.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);dpr=Math.min(devicePixelRatio||1,1.75);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);gl.viewport(0,0,canvas.width,canvas.height);}
  function drawBuffer(b,count,mode,particles){gl.bindBuffer(gl.ARRAY_BUFFER,b);attrs.forEach(({location,size,offset})=>{gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,size,gl.FLOAT,false,40,offset);});gl.uniform1f(uniforms.uParticles,particles);gl.drawArrays(mode,0,count);}
  function frame(time){
    raf=0;
    if(document.hidden||!visible)return;
    if(time-last<32&&!reducedMotion.matches){raf=requestAnimationFrame(frame);return;}
    if(last)elapsed+=Math.min((time-last)/1000,.1);last=time;
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uniforms.uTime,reducedMotion.matches?0:elapsed);gl.uniform1f(uniforms.uAspect,width/height);gl.uniform1f(uniforms.uDpr,dpr);
    gl.uniform2f(uniforms.uPointer,reducedMotion.matches?0:Number(world.style.getPropertyValue('--mx')),reducedMotion.matches?0:-Number(world.style.getPropertyValue('--my')));
    drawBuffer(shardBuffer,vertices.length/10,gl.TRIANGLES,0);drawBuffer(emberBuffer,embers.length/10,gl.POINTS,1);
    if(!reducedMotion.matches)raf=requestAnimationFrame(frame);
  }
  function resume(){if(!raf){last=0;raf=requestAnimationFrame(frame);}}
  const resizeObserver=new ResizeObserver(()=>{resize();resume();});resizeObserver.observe(canvas);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)resume();else{cancelAnimationFrame(raf);raf=0;}},{threshold:0});observer.observe(canvas);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)resume();else{cancelAnimationFrame(raf);raf=0;}});
  reducedMotion.addEventListener('change',resume);
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(raf);raf=0;visible=false;canvas.style.display='none';});
  resize();resume();
}
