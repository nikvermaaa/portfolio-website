/**
 * WebGL2 Sunlit Koi Pond Simulation
 * Features Voronoi caustics, expanding ripples, procedural koi kinematics, 
 * water refraction, food particles, and responsive interaction.
 */

let cv = null;
let gl = null;
let ctx2d = null;
let hintEl = null;
let animationId = null;
let isRunning = false;

const S = document.createElement('canvas');
const sx = S.getContext('2d');
const B = document.createElement('canvas');
const bx = B.getContext('2d');

/* ===== TWEAKABLE CONSTANTS ===== */
const CFG = {
  causticScale: 1.35,     // 1 = cells ~120px (large) and ~50px (small)
  causticSpeed: 0.05,     // slow drift/morph of the light pattern
  causticStrength: 0.2,   // brightness of the light web
  glow: 0.1,              // bloom added back on top of the lines
  grain: 0.05,            // film grain strength (luminance only)
  refraction: 4,          // pixel offset of everything under the surface
  fishCount: 4,
  fishSpeed: 1.7
};

let W = 0, H = 0, L = 0, fish = [], pads = [], T = 0, nextDrop = 0, ri = 0, food = [], DK = 1, awake = false, t0 = null;
const NR = 16, R = new Float32Array(NR * 4);
for (let i = 0; i < NR; i++) R[i * 4 + 2] = -100;

let isVisible = true;
let isTabActive = true;
let pondObserver = null;
let lastFrameTime = 0;
const TARGET_FRAME_MS = 1000 / 60;

const mouse = { px: null, py: null, x: 0, y: 0, t: -1e9, d: -1e9 };
const rnd = (x = 1) => Math.random() * x;
const ad = v => {
  while (v > Math.PI) v -= 6.2832;
  while (v < -Math.PI) v += 6.2832;
  return v;
};

const PROF = [0.55, 0.85, 1, 0.95, 0.8, 0.62, 0.45, 0.32, 0.22, 0.14];
const N = PROF.length;

// Each koi temperament
const TR = [
  { sm: 1.3, ag: 0.7, wv: 0, wl: 520, zx: 0.28, zy: 0.35, tb: 0.85, dir: 1 },    // steady cruiser
  { sm: 0.7, ag: 0.9, wv: 0.012, wl: 300, zx: 0.72, zy: 0.32, tb: 1.1, dir: -1 }, // lazy drifter
  { sm: 1.05, ag: 1.6, wv: 0.02, wl: 200, zx: 0.3, zy: 0.72, tb: 1.3, dir: 1 },  // restless
  { sm: 0.88, ag: 1.1, wv: 0.03, wl: 360, zx: 0.72, zy: 0.7, tb: 1, dir: -1 }    // weaver
];

const PAL = [
  { b: '#f08a2a', fc: '#f7b070', p: [['#fff0dc', 4], ['#e8431f', 1]] },
  { b: '#f0b429', fc: '#f5cc5a', p: [['#1a1a1e', 2], ['#fff1b8', 1]] },
  { b: '#dfe6ea', fc: '#e9eef0', p: [['#ee7a2a', 3]] },
  { b: '#f3eee4', fc: '#f7f1e6', stripe: true, p: [['#e5401e', 5]] }
];

/* ---------- GPU side (WebGL2) ---------- */
const VS = `#version 300 es
layout(location=0) in vec2 a;
out vec2 vUv;
void main(){
  vUv = a * .5 + .5;
  gl_Position = vec4(a, 0., 1.);
}
`;

const COMMON = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform vec2 uRes;
uniform float uTime;
uniform int uRCount;
uniform vec4 uR[${NR}];

float hash21(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3. - 2. * f);
  return mix(mix(hash21(i), hash21(i + vec2(1,0)), f.x),
             mix(hash21(i + vec2(0,1)), hash21(i + vec2(1,1)), f.x), f.y);
}

float fbm(vec2 p){
  float a = .5, s = 0.;
  for(int i = 0; i < 3; i++){
    s += a * vnoise(p);
    p = p * 2.03 + 17.1;
    a *= .5;
  }
  return s;
}

vec2 ripple(vec2 p){
  vec2 g = vec2(0.);
  for(int i = 0; i < ${NR}; i++){
    if(i >= uRCount) break;
    vec4 r = uR[i];
    float age = uTime - r.z;
    if(age < 0. || age > 3.) continue;
    vec2 dv = p - r.xy;
    float d = max(length(dv), .0001);
    float x = d - age * .3, w = .025 + age * .015, E = exp(-x * x / (w * w));
    float att = r.w * exp(-age * 1.15) / (1. + d * 6.);
    g += att * E * (90. * cos(x * 90.) - sin(x * 90.) * 2. * x / (w * w)) * dv / d;
  }
  return g;
}`;

const CAUS_FS = COMMON + `
uniform vec2 uCS;
uniform float uCT;

vec2 voro(vec2 p, float t){
  vec2 ip = floor(p), fp = fract(p);
  float f1 = 8., f2 = 8.;
  for(int j = -1; j <= 1; j++){
    for(int i = -1; i <= 1; i++){
      vec2 g = vec2(i, j), r = vec2(hash21(ip + g), hash21(ip + g + 19.7));
      r = .5 + .5 * sin(t + 6.2831 * r);
      float d = length(g + r - fp);
      if(d < f1){ f2 = f1; f1 = d; }
      else if(d < f2){ f2 = d; }
    }
  }
  return vec2(f1, f2);
}

float caustic(vec2 px, float t){
  vec2 a = voro(px / uCS.x + vec2(t * .05, t * .035), t);
  vec2 b = voro(px / uCS.y + vec2(-t * .04, t * .03) + 7.3, t * 1.3);
  float l1 = pow(1. - smoothstep(0., .3, a.y - a.x), 3.);
  float l2 = pow(1. - smoothstep(0., .34, b.y - b.x), 3.);
  return clamp(l1 * (.3 + .55 * l2), 0., 1.);
}

void main(){
  float asp = uRes.x / uRes.y;
  vec2 g = ripple(vUv * vec2(asp, 1.));
  o = vec4(vec3(caustic((vUv + g * .033) * uRes, uCT)), 1.);
}`;

const BLUR_FS = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform sampler2D uTex;
uniform vec2 uDir;

void main(){
  vec4 s = texture(uTex, vUv) * .227027;
  float w[4] = float[4](.1945946, .1216216, .054054, .016216);
  for(int i = 1; i <= 4; i++){
    vec2 d = uDir * float(i) * 2.;
    s += (texture(uTex, vUv + d) + texture(uTex, vUv - d)) * w[i - 1];
  }
  o = s;
}`;

const FIN_FS = COMMON + `
uniform sampler2D uScene, uCaus, uBloom;
uniform float uRefr, uGlow, uGrain, uCStr;

void main(){
  float asp = uRes.x / uRes.y;
  vec2 p = vUv * vec2(asp, 1.);
  vec2 g = ripple(p);

  vec2 q = p * 4. + vec2(uTime * .04, -uTime * .03), e = vec2(.1, 0.);
  vec2 nm = vec2(vnoise(q + e) - vnoise(q - e), vnoise(q + e.yx) - vnoise(q - e.yx))
         + .5 * vec2(vnoise(q * 2.3 + 5. + e) - vnoise(q * 2.3 + 5. - e),
                     vnoise(q * 2.3 + 5. + e.yx) - vnoise(q * 2.3 + 5. - e.yx));
  vec2 uvp = vUv + g * .011 + nm * uRefr * 8. / uRes;

  vec2 pp = uvp * vec2(asp, 1.);

  // --- Ground of the pond (Matte Sea Bed Texture) ---
  // 1. Natural underwater sand ripples (wave-formed bedform ridges)
  vec2 sCoord = pp * 14.0;
  float sWander = vnoise(pp * 2.5 + 3.1) * 1.8 + vnoise(pp * 5.0 + 8.2) * 0.7;
  float sAxis = sCoord.x * 0.72 + sCoord.y * 0.58 + sWander;
  float sandWave = sin(sAxis * 3.14159);
  sandWave = sign(sandWave) * pow(abs(sandWave), 0.75);

  // 2. Tactile sediment granularity & fine sand stippling (matte sea texture)
  float sandGrit1 = vnoise(pp * 34.0 + vec2(7.3, 3.1));
  float sandGrit2 = vnoise(pp * 68.0 + vec2(1.9, 8.5));
  float sandGrit = (sandGrit1 * 0.65 + sandGrit2 * 0.35 - 0.5) * 0.28;

  // 3. Ultra-fine micro sand specks (crisp seabed silt grain)
  vec2 grainCoord = floor(uvp * uRes * 0.4);
  float microSand = (hash21(grainCoord + 13.9) - 0.5) * 0.16;

  // 4. Organic seabed depth, mineral & silt mottling
  float bl = .55 * fbm(pp * 2.2 + 3.1) + .45 * fbm(pp * 5.0 + 8.7);
  float siltPatch = vnoise(pp * 3.0 + 11.7) * 0.6 + vnoise(pp * 6.5 + 4.2) * 0.4;

  vec3 bedDeep  = vec3(.032, .135, .110);
  vec3 bedMid   = vec3(.095, .285, .225);
  vec3 bedSand  = vec3(.175, .410, .305);
  vec3 bedOlive = vec3(.190, .365, .245);

  vec3 col = mix(bedDeep, bedMid, smoothstep(.22, .68, bl));
  col = mix(col, bedSand, smoothstep(.38, .76, bl) * 0.5);
  col = mix(col, bedOlive, smoothstep(.48, .82, siltPatch) * 0.35);

  // Apply tactile sea bed texture to ground albedo (strictly matte, no shine)
  float seaTexture = sandWave * 0.13 + sandGrit + microSand;
  col *= 1.0 + seaTexture;

  // Gentle sunlight falloff on the pond bed
  vec2 sd = (vUv - vec2(.5 + .07 * sin(uTime * .05), .5 + .06 * cos(uTime * .04))) * vec2(1.1, 1.5);
  float sun = exp(-dot(sd, sd) * 1.4);
  col *= .86 + .2 * sun;

  vec4 s = texture(uScene, uvp);
  col = mix(col, s.rgb, s.a);
  col = mix(col, col * vec3(.8, 1., .88) * .92, s.a * .35);
  vec3 n = normalize(vec3(-g * .3, 1.));
  col *= .9 + (dot(n, normalize(vec3(-.4, .5, .75))) - .75) * .85;
  col += vec3(.7, .9, .85) * min(.06, length(g) * .025);

  float cs = texture(uCaus, uvp).r, bm = texture(uBloom, uvp).r;
  float pt = smoothstep(.28, .72, fbm(pp * .9 + vec2(uTime * .015, -uTime * .01)));
  float lit = .62 + .5 * pt;
  cs *= lit;
  bm *= lit;
  col += vec3(.9, 1., .94) * (cs + bm * uGlow) * uCStr * mix(1., .3, s.a) * (.88 + .2 * sun);

  col += (hash21(gl_FragCoord.xy + fract(uTime) * 91.) - .5) * uGrain;
  col *= vec3(.96, 1.05, 1.);
  float lu = dot(col, vec3(.33));
  col = mix(col, col * vec3(.97, 1., 1.03), smoothstep(.6, 1., lu));

  // Organic squircle (rounded rectangle) feathered border that dissolves softly into page paper color (#fafafa)
  vec2 p_px = vUv * uRes;
  vec2 halfSize = uRes * 0.5;
  float minDim = min(uRes.x, uRes.y);
  float margin = minDim * 0.035;
  vec2 boxHalf = halfSize - margin;
  float corner = minDim * 0.15;
  float feather = minDim * 0.13;
  vec2 q_edge = abs(p_px - halfSize) - (boxHalf - corner);
  float inside = corner - length(max(q_edge, 0.0)) - min(max(q_edge.x, q_edge.y), 0.0);
  float wander = vnoise(vUv * 8.0) * 0.65 + vnoise(vUv * 20.0 + 8.3) * 0.35;
  inside -= clamp(wander * 0.5 + 0.5, 0.0, 1.0) * feather * 0.22;

  float edgeAlpha = pow(smoothstep(0.0, 1.0, clamp(inside / feather, 0.0, 1.0)), 1.3);
  vec3 paperCol = vec3(0.98039);
  col = mix(paperCol, col, edgeAlpha);

  o = vec4(col, 1.);
}`;

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || (window.innerWidth < 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
}

/* Pre-baked organic seabed & squircle feathered border (runs ONCE on resize to save mobile GPU) */
const BAKE_BED_FS = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform vec2 uRes;

float hash21(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3. - 2. * f);
  return mix(mix(hash21(i), hash21(i + vec2(1,0)), f.x),
             mix(hash21(i + vec2(0,1)), hash21(i + vec2(1,1)), f.x), f.y);
}

float fbm(vec2 p){
  float a = .5, s = 0.;
  for(int i = 0; i < 3; i++){
    s += a * vnoise(p);
    p = p * 2.03 + 17.1;
    a *= .5;
  }
  return s;
}

void main(){
  float asp = uRes.x / uRes.y;
  vec2 pp = vUv * vec2(asp, 1.);

  // 1. Natural underwater sand ripples
  vec2 sCoord = pp * 14.0;
  float sWander = vnoise(pp * 2.5 + 3.1) * 1.8 + vnoise(pp * 5.0 + 8.2) * 0.7;
  float sAxis = sCoord.x * 0.72 + sCoord.y * 0.58 + sWander;
  float sandWave = sin(sAxis * 3.14159);
  sandWave = sign(sandWave) * pow(abs(sandWave), 0.75);

  // 2. Tactile sediment granularity
  float sandGrit1 = vnoise(pp * 34.0 + vec2(7.3, 3.1));
  float sandGrit2 = vnoise(pp * 68.0 + vec2(1.9, 8.5));
  float sandGrit = (sandGrit1 * 0.65 + sandGrit2 * 0.35 - 0.5) * 0.28;

  // 3. Ultra-fine micro sand specks
  vec2 grainCoord = floor(vUv * uRes * 0.4);
  float microSand = (hash21(grainCoord + 13.9) - 0.5) * 0.16;

  // 4. Organic seabed depth, mineral & silt mottling
  float bl = .55 * fbm(pp * 2.2 + 3.1) + .45 * fbm(pp * 5.0 + 8.7);
  float siltPatch = vnoise(pp * 3.0 + 11.7) * 0.6 + vnoise(pp * 6.5 + 4.2) * 0.4;

  vec3 bedDeep  = vec3(.032, .135, .110);
  vec3 bedMid   = vec3(.095, .285, .225);
  vec3 bedSand  = vec3(.175, .410, .305);
  vec3 bedOlive = vec3(.190, .365, .245);

  vec3 col = mix(bedDeep, bedMid, smoothstep(.22, .68, bl));
  col = mix(col, bedSand, smoothstep(.38, .76, bl) * 0.5);
  col = mix(col, bedOlive, smoothstep(.48, .82, siltPatch) * 0.35);

  float seaTexture = sandWave * 0.13 + sandGrit + microSand;
  col *= 1.0 + seaTexture;

  // Gentle sunlight falloff on the pond bed
  vec2 sd = (vUv - vec2(.5, .5)) * vec2(1.1, 1.5);
  float sun = exp(-dot(sd, sd) * 1.4);
  col *= .86 + .2 * sun;
  col *= vec3(.96, 1.05, 1.);

  // Organic squircle border feathered edge
  vec2 p_px = vUv * uRes;
  vec2 halfSize = uRes * 0.5;
  float minDim = min(uRes.x, uRes.y);
  float margin = minDim * 0.035;
  vec2 boxHalf = halfSize - margin;
  float corner = minDim * 0.15;
  float feather = minDim * 0.13;
  vec2 q_edge = abs(p_px - halfSize) - (boxHalf - corner);
  float inside = corner - length(max(q_edge, 0.0)) - min(max(q_edge.x, q_edge.y), 0.0);
  float wander = vnoise(vUv * 8.0) * 0.65 + vnoise(vUv * 20.0 + 8.3) * 0.35;
  inside -= clamp(wander * 0.5 + 0.5, 0.0, 1.0) * feather * 0.22;

  float edgeAlpha = pow(smoothstep(0.0, 1.0, clamp(inside / feather, 0.0, 1.0)), 1.3);

  o = vec4(col, edgeAlpha);
}
`;

/* Ultra-lightweight 60 FPS mobile fragment shader (0 noise calls, zero tile desync) */
const FIN_MOBILE_FS = COMMON + `
uniform sampler2D uScene, uCaus, uBed;

void main(){
  float asp = uRes.x / uRes.y;
  vec2 p = vUv * vec2(asp, 1.);
  vec2 g = ripple(p);
  vec2 uvp = vUv + g * 0.008;

  // 1. Fetch pre-baked organic seabed (RGB) and feathered border alpha (A)
  vec4 bed = texture(uBed, uvp);

  // 2. Fetch fish & dynamic scene elements
  vec4 s = texture(uScene, uvp);
  vec3 col = mix(bed.rgb, s.rgb, s.a);
  col = mix(col, col * vec3(.85, 1., .9), s.a * .25);

  // 3. Water surface normal and lighting
  vec3 n = normalize(vec3(-g * .3, 1.));
  col *= .92 + (dot(n, normalize(vec3(-.4, .5, .75))) - .75) * .6;
  col += vec3(.7, .9, .85) * min(.05, length(g) * .02);

  // 4. Subtle caustic web from uCaus
  float cs = texture(uCaus, uvp).r;
  col += vec3(.85, 1., .92) * cs * 0.18 * mix(1., .3, s.a);

  // 5. Feathered edge dissolve to page paper color (#fafafa)
  vec3 paperCol = vec3(0.98039);
  col = mix(paperCol, col, bed.a);

  o = vec4(col, 1.);
}
`;

let P = {}, tex, fb = {};

function sh(type, src) {
  const x = gl.createShader(type);
  gl.shaderSource(x, src);
  gl.compileShader(x);
  if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(x));
  }
  return x;
}

function mkProg(fs) {
  const p = gl.createProgram();
  gl.attachShader(p, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  return { p, u: {} };
}

function mkTex(w, h) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  if (w) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  for (const [k, v] of [
    [gl.TEXTURE_MIN_FILTER, gl.LINEAR],
    [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
    [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
    [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]
  ]) {
    gl.texParameteri(gl.TEXTURE_2D, k, v);
  }
  return t;
}

function mkFB(w, h) {
  const t = mkTex(w, h), f = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, f);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
  return { t, f, w, h };
}

function glInit() {
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  P.caus = mkProg(CAUS_FS);
  P.blur = mkProg(BLUR_FS);
  P.fin = mkProg(FIN_FS);
  P.bakeBed = mkProg(BAKE_BED_FS);
  P.finMobile = mkProg(FIN_MOBILE_FS);
  tex = mkTex(0, 0);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
}

function bakeBedTexture() {
  if (!gl || !fb.bed || !P.bakeBed) return;
  use(P.bakeBed, fb.bed);
  gl.uniform2f(Uc(P.bakeBed, 'uRes'), cv.width, cv.height);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function glSize() {
  for (const k in fb) {
    if (fb[k]) {
      gl.deleteTexture(fb[k].t);
      gl.deleteFramebuffer(fb[k].f);
    }
  }
  fb = {};
  const w = Math.ceil(cv.width / 2);
  const h = Math.ceil(cv.height / 2);
  fb.c = mkFB(w, h);
  fb.p = mkFB(w, h);
  fb.q = mkFB(w, h);

  if (isMobileDevice()) {
    fb.bed = mkFB(cv.width, cv.height);
    bakeBedTexture();
  }

  // Pre-allocate scene texture GPU storage once on resize (zero reallocation during rendering)
  if (tex) {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  }
}

const Uc = (o, n) => o.u[n] || (o.u[n] = gl.getUniformLocation(o.p, n));

function use(o, t) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, t ? t.f : null);
  gl.viewport(0, 0, t ? t.w : cv.width, t ? t.h : cv.height);
  gl.useProgram(o.p);
}

function bind(u, t) {
  gl.activeTexture(gl.TEXTURE0 + u);
  gl.bindTexture(gl.TEXTURE_2D, t);
}

function common(o) {
  gl.uniform2f(Uc(o, 'uRes'), cv.width, cv.height);
  gl.uniform1f(Uc(o, 'uTime'), T);
  gl.uniform4fv(Uc(o, 'uR[0]'), R);
  let maxActive = 0;
  for (let i = 0; i < NR; i++) {
    const age = T - R[i * 4 + 2];
    if (age >= 0 && age <= 3.0) {
      if (i + 1 > maxActive) maxActive = i + 1;
    }
  }
  gl.uniform1i(Uc(o, 'uRCount'), maxActive);
}

function render() {
  if (gl) {
    bind(0, tex);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, S);

    if (isMobileDevice() && fb.bed) {
      // 1. Fast single caustics pass on half-res FBO
      use(P.caus, fb.c);
      common(P.caus);
      gl.uniform2f(Uc(P.caus, 'uCS'), CFG.causticScale * 120 * DK, CFG.causticScale * 50 * DK);
      gl.uniform1f(Uc(P.caus, 'uCT'), T * CFG.causticSpeed * 6.2831);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // 2. Ultra-lightweight direct composite to canvas using pre-baked bed (0 live noise calls)
      use(P.finMobile, null);
      common(P.finMobile);
      bind(0, tex);
      bind(1, fb.c.t);
      bind(2, fb.bed.t);
      gl.uniform1i(Uc(P.finMobile, 'uScene'), 0);
      gl.uniform1i(Uc(P.finMobile, 'uCaus'), 1);
      gl.uniform1i(Uc(P.finMobile, 'uBed'), 2);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      use(P.caus, fb.c);
      common(P.caus);
      gl.uniform2f(Uc(P.caus, 'uCS'), CFG.causticScale * 120 * DK, CFG.causticScale * 50 * DK);
      gl.uniform1f(Uc(P.caus, 'uCT'), T * CFG.causticSpeed * 6.2831);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      use(P.blur, fb.p);
      bind(1, fb.c.t);
      gl.uniform1i(Uc(P.blur, 'uTex'), 1);
      gl.uniform2f(Uc(P.blur, 'uDir'), 1 / fb.c.w, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      use(P.blur, fb.q);
      bind(1, fb.p.t);
      gl.uniform2f(Uc(P.blur, 'uDir'), 0, 1 / fb.c.h);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      use(P.fin, null);
      common(P.fin);
      bind(0, tex);
      bind(1, fb.c.t);
      bind(2, fb.q.t);
      gl.uniform1i(Uc(P.fin, 'uScene'), 0);
      gl.uniform1i(Uc(P.fin, 'uCaus'), 1);
      gl.uniform1i(Uc(P.fin, 'uBloom'), 2);
      gl.uniform1f(Uc(P.fin, 'uRefr'), CFG.refraction);
      gl.uniform1f(Uc(P.fin, 'uGlow'), CFG.glow);
      gl.uniform1f(Uc(P.fin, 'uGrain'), CFG.grain);
      gl.uniform1f(Uc(P.fin, 'uCStr'), CFG.causticStrength);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  } else if (ctx2d) {
    ctx2d.clearRect(0, 0, cv.width, cv.height);
    const grad = ctx2d.createRadialGradient(
      cv.width * 0.5, cv.height * 0.45, cv.width * 0.08,
      cv.width * 0.5, cv.height * 0.5, cv.width * 0.48
    );
    grad.addColorStop(0, '#1f4e40');
    grad.addColorStop(0.5, '#133a2f');
    grad.addColorStop(0.75, '#0b231c');
    grad.addColorStop(0.95, '#fafafa');
    grad.addColorStop(1, '#fafafa');
    ctx2d.fillStyle = grad;
    ctx2d.fillRect(0, 0, cv.width, cv.height);
    ctx2d.drawImage(S, 0, 0, cv.width, cv.height);
  }
}

function resizeSimulation() {
  if (!cv) return;
  const r = cv.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return;
  const isMobile = isMobileDevice();
  const maxDPR = isMobile ? 1.0 : 1.25;
  const k = Math.min(window.devicePixelRatio || 1, maxDPR, Math.sqrt(900000 / (r.width * r.height)));
  cv.width = Math.round(r.width * k);
  cv.height = Math.round(r.height * k);
  DK = cv.width / r.width;
  const sc = Math.max(1, Math.sqrt(r.width * r.height / 220000));
  W = Math.ceil(r.width / sc);
  H = Math.ceil(r.height / sc);
  S.width = B.width = W;
  S.height = B.height = H;
  L = Math.max(34, Math.min(W, H) * 0.32);
  mkBG();
  t0 = null;
  fish = PAL.slice(0, CFG.fishCount).map((p, i) => mkFish(p, i));
  pads = Array.from({ length: 2 }, (_, i) => ({
    x: W * (0.12 + 0.1 * i + rnd(0.08)),
    y: H * (0.2 + 0.18 * i + rnd(0.12)),
    r: L * (0.2 + rnd(0.1)),
    rot: rnd(6.28),
    ph: rnd(6)
  }));
  mkExtras();
  food = [];
  mkFrog();
  mkFly();
  if (gl) glSize();
}

function mkBG() {
  bx.clearRect(0, 0, W, H);
  stones = [];
  // 4 primary large sitting stones
  const SP = [[0.2, 0.3], [0.42, 0.68], [0.66, 0.32], [0.8, 0.7]];
  for (let i = 0; i < 4; i++) {
    const x = W * (SP[i][0] + (rnd() - 0.5) * 0.05);
    const y = H * (SP[i][1] + (rnd() - 0.5) * 0.05);
    const r = L * (0.2 + rnd(0.08)), rot = rnd(3);
    stones.push({ x, y, r, isPebble: false });
    bx.fillStyle = 'rgba(0,8,10,.45)';
    bx.beginPath();
    bx.ellipse(x + r * 0.2, y + r * 0.3, r * 1.02, r * 0.82, rot, 0, 7);
    bx.fill();
    const gg = bx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    gg.addColorStop(0, '#4d5a56');
    gg.addColorStop(0.6, '#1e2a28');
    gg.addColorStop(1, '#0c1513');
    bx.fillStyle = gg;
    bx.beginPath();
    bx.ellipse(x, y, r, r * 0.8, rot, 0, 7);
    bx.fill();
    bx.fillStyle = 'rgba(255,255,255,.04)';
    bx.beginPath();
    bx.ellipse(x - r * 0.25, y - r * 0.3, r * 0.42, r * 0.1, -0.5, 0, 7);
    bx.fill();
    bx.fillStyle = 'rgba(255,255,255,.02)';
    bx.beginPath();
    bx.ellipse(x - r * 0.12, y - r * 0.2, r * 0.06, r * 0.3, -0.5, 0, 7);
    bx.fill();
  }

  // 4 small tiny stones (river pebbles) scattered on the sea bed
  const PEBBLES = [[0.29, 0.22], [0.48, 0.79], [0.60, 0.44], [0.74, 0.82]];
  for (let i = 0; i < PEBBLES.length; i++) {
    const x = W * (PEBBLES[i][0] + (rnd() - 0.5) * 0.04);
    const y = H * (PEBBLES[i][1] + (rnd() - 0.5) * 0.04);
    const r = L * (0.045 + rnd(0.025)), rot = rnd(3.14);
    stones.push({ x, y, r, isPebble: true });
    // Soft pebble shadow
    bx.fillStyle = 'rgba(0,8,10,.35)';
    bx.beginPath();
    bx.ellipse(x + r * 0.15, y + r * 0.2, r * 1.05, r * 0.85, rot, 0, 7);
    bx.fill();
    // Matte pebble body
    const gg = bx.createRadialGradient(x - r * 0.25, y - r * 0.25, r * 0.05, x, y, r);
    gg.addColorStop(0, '#55635f');
    gg.addColorStop(0.55, '#222e2c');
    gg.addColorStop(1, '#0e1615');
    bx.fillStyle = gg;
    bx.beginPath();
    bx.ellipse(x, y, r, r * (0.75 + rnd(0.15)), rot, 0, 7);
    bx.fill();
    // Subtle matte top sheen (no shine)
    bx.fillStyle = 'rgba(255,255,255,.03)';
    bx.beginPath();
    bx.ellipse(x - r * 0.2, y - r * 0.2, r * 0.35, r * 0.12, -0.4, 0, 7);
    bx.fill();
  }
}

let plants = [], drift = [], stones = [], frog = null, fly = null;

function mkFish(p, idx) {
  const a0 = (idx || 0) * 1.571 + rnd(0.5);
  const f = {
    p,
    home: a0,
    L: L * (0.8 + rnd(0.45)),
    x: W / 2 + Math.cos(a0) * L * 0.9,
    y: H / 2 + Math.sin(a0) * L * 0.6,
    ang: a0 + 1.571 * TR[(idx || 0) % TR.length].dir,
    turn: 0,
    sp: 0.5,
    base: 0.4 + rnd(0.4),
    ph: rnd(6),
    k: 0,
    xs: [],
    ys: [],
    dx: [],
    dy: [],
    tx: [],
    ty: [],
    patches: [],
    gt: (100 + rnd(200)) | 0,
    pa: 0,
    lag: 0,
    lv: 0,
    tr: TR[(idx || 0) % TR.length],
    leave: 3 + (idx || 0) * 0.9 + rnd(1),
    wx: 0,
    wy: 0,
    wt: 0,
    hasWP: false,
    flee: 0,
    boost: 0
  };
  f.pa = f.ang;
  f.shd = Array.from({ length: 7 }, () => ({
    t: 1 + rnd(6),
    o: (rnd() - 0.5) * 0.9,
    r: f.L * (0.05 + rnd(0.06))
  }));
  for (let i = 0; i < N; i++) {
    f.xs.push(f.x - Math.cos(f.ang) * i * f.L / N);
    f.ys.push(f.y - Math.sin(f.ang) * i * f.L / N);
    f.dx.push(0);
    f.dy.push(0);
    f.tx.push(1);
    f.ty.push(0);
  }
  if (p.stripe) {
    for (let i = 0; i < 4; i++) {
      f.patches.push({
        t: 1.3 + i * 1.4,
        o: (rnd() - 0.5) * 0.25,
        rx: f.L * 0.11,
        ry: f.L * 0.032,
        rot: (rnd() - 0.5) * 0.2,
        c: p.p[0][0]
      });
    }
  } else {
    for (const [c, cnt] of p.p) {
      for (let i = 0; i < cnt; i++) {
        f.patches.push({
          t: 0.8 + rnd(6.5),
          o: (rnd() - 0.5) * 0.9,
          rx: f.L * (0.05 + rnd(0.07)),
          ry: f.L * (0.03 + rnd(0.04)),
          rot: rnd(3),
          c
        });
      }
    }
  }
  return f;
}

function mkExtras() {
  plants = [];
  for (let c = 0; c < 9; c++) {
    const e = rnd(4) | 0;
    let x, y;
    if (e === 0) { x = rnd(W); y = -4; }
    else if (e === 1) { x = rnd(W); y = H + 4; }
    else if (e === 2) { x = -4; y = rnd(H); }
    else { x = W + 4; y = rnd(H); }
    const base = Math.atan2(H / 2 - y, W / 2 - x), bl = [];
    for (let k = 0; k < 6; k++) bl.push({ a: base + (rnd() - 0.5) * 1.5, len: L * (0.7 + rnd(0.7)), ph: rnd(6) });
    plants.push({ x, y, bl });
  }
  drift = [];
  for (let i = 0; i < 7; i++) {
    drift.push({
      x: rnd(W),
      y: rnd(H),
      vx: (rnd() - 0.5) * 0.06,
      vy: (rnd() - 0.5) * 0.06,
      rot: rnd(6.28),
      vr: (rnd() - 0.5) * 0.003,
      leaf: true,
      c: rnd() < 0.5 ? '#2d7a4a' : '#4f9a5a'
    });
  }
}

function rip(x, y, amp) {
  let idx = -1;
  for (let i = 0; i < NR; i++) {
    if (T - R[i * 4 + 2] > 3.0 || R[i * 4 + 2] < 0) {
      idx = i;
      break;
    }
  }
  if (idx === -1) {
    idx = ri++ % NR;
  }
  R[idx * 4] = x / H;
  R[idx * 4 + 1] = 1 - y / H;
  R[idx * 4 + 2] = T;
  R[idx * 4 + 3] = amp;
}

function pickWP(f, ax, ay) {
  const mx = L * 0.4, my = L * 0.35;
  let x, y, t = 0;
  const tries = rnd() < 0.35 ? 1 : 24;
  do {
    x = mx + rnd(W - 2 * mx);
    y = my + rnd(H - 2 * my);
    if (rnd() < 0.5) {
      x = Math.max(mx, Math.min(W - mx, W * f.tr.zx + (rnd() - 0.5) * W * 0.4));
      y = Math.max(my, Math.min(H - my, H * f.tr.zy + (rnd() - 0.5) * H * 0.4));
    }
    t++;
  } while (
    t < tries && (
      Math.hypot(x - f.x, y - f.y) < L * 1.5 ||
      (ax !== undefined && Math.hypot(x - ax, y - ay) < L * 2.5) ||
      (frog && Math.hypot(x - frog.x, y - frog.y) < L * 1.1) ||
      fish.some(o => o !== f && (Math.hypot(x - o.x, y - o.y) < L * 1.1 || (o.hasWP && Math.hypot(x - o.wx, y - o.wy) < L * 1.2)))
    )
  );
  f.wx = x;
  f.wy = y;
  f.wt = (f.tr.wl * 0.6 + rnd(f.tr.wl)) | 0;
  f.hasWP = true;
}

function updFish(f) {
  const mx = L * 0.4, my = L * 0.35, now = performance.now();
  const intro = !awake && (T - t0) < f.leave, aStart = f.ang;
  let tgt = f.base * CFG.fishSpeed * f.tr.sm * (0.8 + 0.25 * Math.sin(T * 0.9 + f.home * 3)), want = f.ang;
  f.turn += (rnd() - 0.5) * 0.01;
  f.turn *= 0.96;
  if (--f.gt <= 0) {
    f.base = 0.2 + rnd(0.6);
    f.gt = (100 + rnd(260)) | 0;
  }
  if (intro) {
    const a = f.home + (T * 0.4 + 0.7) * f.tr.dir;
    want = Math.atan2(H / 2 + Math.sin(a) * L * 0.6 - f.y, W / 2 + Math.cos(a) * L * 0.9 - f.x);
    tgt = 0.4 * CFG.fishSpeed;
  } else {
    if (!f.hasWP) { pickWP(f); f.boost = 100; }
    if (--f.wt <= 0 || Math.hypot(f.wx - f.x, f.wy - f.y) < L * 0.35) pickWP(f);
    want = Math.atan2(f.wy - f.y, f.wx - f.x);
    if (f.boost > 0) { f.boost--; tgt = Math.max(tgt, 0.8 * CFG.fishSpeed); }
  }
  const ag = f.tr.ag, wv = Math.sin(T * (0.45 + f.home * 0.12) + f.home * 5) * f.tr.wv;
  f.ang += Math.max(-0.035 * ag, Math.min(0.035 * ag, ad(want - f.ang) * 0.025 * ag + f.turn * 0.3 + wv));
  if (f.x < mx || f.x > W - mx || f.y < my || f.y > H - my) {
    f.ang += ad(Math.atan2(H / 2 - f.y, W / 2 - f.x) - f.ang) * 0.1;
  }
  for (const o of fish) {
    if (o === f) continue;
    let dx = 0, dy = 0, d = 1e9;
    for (let i = 0; i < N; i++) {
      const ex = o.xs[i] - f.x, ey = o.ys[i] - f.y, ee = Math.hypot(ex, ey);
      if (ee < d) { d = ee; dx = ex; dy = ey; }
    }
    const R0 = L * (intro ? 0.5 : 0.9);
    if (d < R0) f.ang -= (ad(Math.atan2(dy, dx) - f.ang) + 0.05) * 0.1 * (1 - d / R0);
  }
  let best = null, bd = L * 3.5;
  for (const fd of food) {
    const d = Math.hypot(fd.x - f.x, fd.y - f.y);
    if (d < bd) { bd = d; best = fd; }
  }
  if (best) {
    f.ang += ad(Math.atan2(best.y - f.y, best.x - f.x) - f.ang) * 0.08;
    tgt = (bd > L * 0.5 ? 1.2 : 0.5) * CFG.fishSpeed;
    if (bd < L * 0.22) {
      food.splice(food.indexOf(best), 1);
      rip(best.x, best.y, 0.012);
    }
  }
  if (now - mouse.t < 550) {
    const d = Math.hypot(f.x - mouse.x, f.y - mouse.y);
    if (d < Math.max(30, L * 1.15) && f.flee <= 0) {
      f.flee = (16 + rnd(10)) | 0;
      f.hasWP = true;
      f.fleeSp = 1.35 + rnd(0.35);
    }
  }
  if (f.flee > 0) {
    f.flee--;
    f.ang += ad(Math.atan2(f.y - mouse.y, f.x - mouse.x) + (rnd() - 0.5) * 0.3 - f.ang) * 0.10;
    tgt = f.fleeSp || 1.35;
    if (f.flee === 0) pickWP(f, mouse.x, mouse.y);
  }
  f.ang = aStart + Math.max(-0.07, Math.min(0.07, ad(f.ang - aStart)));
  f.sp += (tgt - f.sp) * (f.flee > 0 ? 0.08 : 0.04);
  f.x += Math.cos(f.ang) * f.sp;
  f.y += Math.sin(f.ang) * f.sp;
  f.x = Math.max(mx * 0.5, Math.min(W - mx * 0.5, f.x));
  f.y = Math.max(my * 0.5, Math.min(H - my * 0.5, f.y));

  const dA = ad(f.ang - f.pa);
  f.pa = f.ang;
  f.lv += -0.12 * f.lag - 0.15 * f.lv - dA * 1.2;
  f.lag = Math.max(-0.7, Math.min(0.7, f.lag + f.lv));

  f.xs[0] = f.x;
  f.ys[0] = f.y;
  const sp = f.L / N;
  let ph0 = f.ang + Math.PI;
  for (let i = 1; i < N; i++) {
    let a = Math.atan2(f.ys[i] - f.ys[i - 1], f.xs[i] - f.xs[i - 1]);
    a = ph0 + Math.max(-0.13, Math.min(0.13, ad(a - ph0)));
    ph0 = a;
    f.xs[i] = f.xs[i - 1] + Math.cos(a) * sp;
    f.ys[i] = f.ys[i - 1] + Math.sin(a) * sp;
  }
  f.ph += f.sp * 0.2 * f.tr.tb + 0.05 * f.tr.tb;
  for (let i = 0; i < N; i++) {
    const j = Math.max(i - 1, 0), k = Math.min(i + 1, N - 1);
    let tx = f.xs[j] - f.xs[k], ty = f.ys[j] - f.ys[k], d = Math.hypot(tx, ty) || 1;
    tx /= d; ty /= d;
    f.tx[i] = tx; f.ty[i] = ty;
    const w = Math.sin(f.ph - i * 0.7) * (i / N) * f.L * 0.13 * Math.min(1.3, 0.45 + f.sp * 0.45);
    f.dx[i] = f.xs[i] - ty * w;
    f.dy[i] = f.ys[i] + tx * w;
  }
  if (++f.k % 9 === 0 && f.sp > 0.3) rip(f.x, f.y, Math.min(0.016, f.sp * 0.006));
}

function bodyPath(f, ox, oy) {
  const n = N, w = i => PROF[i] * f.L * 0.115, P = [];
  P.push([f.dx[0] + f.tx[0] * w(0) * 0.9 + ox, f.dy[0] + f.ty[0] * w(0) * 0.9 + oy]);
  for (let i = 0; i < n; i++) P.push([f.dx[i] - f.ty[i] * w(i) + ox, f.dy[i] + f.tx[i] * w(i) + oy]);
  P.push([f.dx[n - 1] - f.tx[n - 1] * w(n - 1) * 0.6 + ox, f.dy[n - 1] - f.tx[n - 1] * w(n - 1) * 0.6 + oy]);
  for (let i = n - 1; i >= 0; i--) P.push([f.dx[i] + f.ty[i] * w(i) + ox, f.dy[i] - f.tx[i] * w(i) + oy]);
  const m = P.length;
  sx.beginPath();
  sx.moveTo((P[m - 1][0] + P[0][0]) / 2, (P[m - 1][1] + P[0][1]) / 2);
  for (let k = 0; k < m; k++) {
    const a = P[k], b = P[(k + 1) % m];
    sx.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
  }
  sx.closePath();
}

function hexA(h, a) {
  const n = parseInt(h.slice(1), 16);
  return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
}

function fin(x, y, a, len, wid, col, al) {
  const c = Math.cos(a), s = Math.sin(a), px = -s, py = c, ex = x + c * len, ey = y + s * len;
  const Ax = ex + px * wid, Ay = ey + py * wid, Bx = ex - px * wid * 0.2, By = ey - py * wid * 0.2;
  const g = sx.createLinearGradient(x, y, ex, ey);
  g.addColorStop(0, hexA(col, 0.75 * al));
  g.addColorStop(1, hexA(col, 0.14 * al));
  sx.fillStyle = g;
  sx.beginPath();
  sx.moveTo(x, y);
  sx.lineTo(Ax, Ay);
  for (let i = 1; i <= 3; i++) {
    const u = i / 3, qx = Ax + (Bx - Ax) * u, qy = Ay + (By - Ay) * u, o = len * (i % 2 ? 0.1 : 0.04);
    sx.quadraticCurveTo(qx - (Bx - Ax) / 6 + c * o, qy - (By - Ay) / 6 + s * o, qx, qy);
  }
  sx.closePath();
  sx.fill();
  sx.strokeStyle = 'rgba(40,20,5,' + (0.13 * al) + ')';
  sx.lineWidth = 0.5;
  sx.beginPath();
  for (let i = 0; i <= 7; i++) {
    const u = i / 7;
    sx.moveTo(x, y);
    sx.lineTo(Ax + (Bx - Ax) * u, Ay + (By - Ay) * u);
  }
  sx.stroke();
}

function drawFish(f) {
  const n = N, Lf = f.L, w = i => PROF[i] * Lf * 0.115, hd = Math.atan2(f.ty[0], f.tx[0]);
  // Soft layered shadow without CPU Gaussian filter pass
  bodyPath(f, 8, 12);
  sx.fillStyle = 'rgba(0,8,12,.06)';
  sx.fill();
  bodyPath(f, 7, 11);
  sx.fillStyle = 'rgba(0,8,12,.12)';
  sx.fill();
  bodyPath(f, 6, 10);
  sx.fillStyle = 'rgba(0,8,12,.06)';
  sx.fill();

  const ta = Math.atan2(-f.ty[n - 1], -f.tx[n - 1]) + f.lag * 0.9 + Math.sin(f.ph - n * 0.7 - 0.8) * 0.3;
  fin(f.dx[n - 1], f.dy[n - 1], ta - 0.32, Lf * 0.52, Lf * 0.17, f.p.fc, 0.6);
  fin(f.dx[n - 1], f.dy[n - 1], ta + 0.32, Lf * 0.52, -Lf * 0.17, f.p.fc, 0.6);
  fin(f.dx[n - 1], f.dy[n - 1], ta - 0.05 + Math.sin(f.ph - n * 0.7 - 1.6) * 0.1, Lf * 0.36, Lf * 0.1, f.p.fc, 0.65);
  for (const s of [-1, 1]) {
    const sw = Math.sin(f.ph + (s > 0 ? 0 : 1.5)) * 0.18 + f.lag * s * 0.4;
    fin(f.dx[2] - f.ty[2] * w(2) * s, f.dy[2] + f.tx[2] * w(2) * s, hd + Math.PI - s * (0.7 + sw), Lf * 0.27, s * Lf * 0.09, f.p.fc, 0.75);
    fin(f.dx[5] - f.ty[5] * w(5) * s, f.dy[5] + f.tx[5] * w(5) * s, hd + Math.PI - s * (0.5 + sw * 0.5), Lf * 0.11, s * Lf * 0.035, f.p.fc, 0.5);
  }
  bodyPath(f, 0, 0);
  sx.fillStyle = f.p.b;
  sx.fill();
  sx.save();
  bodyPath(f, 0, 0);
  sx.clip();
  for (const q of f.patches) {
    const i = Math.min(n - 2, q.t | 0), u = q.t - i;
    const x = f.dx[i] + (f.dx[i + 1] - f.dx[i]) * u - f.ty[i] * q.o * w(i);
    const y = f.dy[i] + (f.dy[i + 1] - f.dy[i]) * u + f.tx[i] * q.o * w(i);
    const ca = Math.cos(q.rot + hd), sa = Math.sin(q.rot + hd);
    sx.fillStyle = q.c;
    for (const [k, al] of [[1.6, 0.1], [1.3, 0.2], [1, 0.9]]) {
      sx.globalAlpha = al;
      sx.beginPath();
      sx.ellipse(x, y, q.rx * k, q.ry * k, q.rot + hd, 0, 7);
      sx.fill();
      sx.beginPath();
      sx.ellipse(x + ca * q.rx * 0.6, y + sa * q.rx * 0.6, q.rx * 0.6 * k, q.ry * 0.8 * k, q.rot + hd + 1, 0, 7);
      sx.fill();
      sx.beginPath();
      sx.ellipse(x - ca * q.rx * 0.5, y - sa * q.rx * 0.5, q.rx * 0.5 * k, q.ry * 0.9 * k, q.rot + hd + 0.6, 0, 7);
      sx.fill();
    }
  }
  sx.globalAlpha = 1;
  for (const q of f.shd) {
    const i = Math.min(n - 2, q.t | 0), u = q.t - i;
    const x = f.dx[i] + (f.dx[i + 1] - f.dx[i]) * u - f.ty[i] * q.o * w(i);
    const y = f.dy[i] + (f.dy[i + 1] - f.dy[i]) * u + f.tx[i] * q.o * w(i);
    sx.fillStyle = 'rgba(60,20,0,.07)';
    sx.beginPath();
    sx.arc(x, y, q.r, 0, 7);
    sx.fill();
  }
  const r = Lf * 0.022;
  sx.lineWidth = 0.55;
  for (const [ox, oy, col] of [[0, 0, 'rgba(0,0,0,.17)'], [0.5, 0.5, 'rgba(255,255,255,.05)']]) {
    sx.strokeStyle = col;
    sx.beginPath();
    for (let i = 1; i < n - 2; i++) {
      for (let j = -2; j <= 2; j++) {
        const o = (j + (i % 2) * 0.5) * w(i) * 0.4;
        const x = f.dx[i] - f.ty[i] * o + ox * r;
        const y = f.dy[i] + f.tx[i] * o + oy * r;
        const a0 = hd + Math.PI - 1.1;
        sx.moveTo(x + Math.cos(a0) * r, y + Math.sin(a0) * r);
        sx.arc(x, y, r, a0, a0 + 2.2);
      }
    }
    sx.stroke();
  }
  sx.lineCap = 'round';
  sx.lineJoin = 'round';
  sx.strokeStyle = 'rgba(40,15,0,.08)';
  sx.lineWidth = w(2) * 0.5;
  sx.beginPath();
  sx.moveTo(f.dx[1], f.dy[1]);
  for (let i = 2; i < n - 1; i++) sx.lineTo(f.dx[i], f.dy[i]);
  sx.stroke();

  for (const [k, al] of [[2.2, 0.03], [0.5, 0.03]]) {
    sx.strokeStyle = 'rgba(255,255,255,' + al + ')';
    sx.lineWidth = w(2) * k;
    sx.beginPath();
    sx.moveTo(f.dx[1], f.dy[1]);
    for (let i = 2; i < n - 1; i++) sx.lineTo(f.dx[i], f.dy[i]);
    sx.stroke();
  }
  sx.strokeStyle = f.p.fc;
  sx.globalAlpha = 0.3;
  sx.lineWidth = w(4) * 0.6;
  sx.beginPath();
  sx.moveTo(f.dx[2], f.dy[2]);
  for (let i = 3; i < 8; i++) sx.lineTo(f.dx[i], f.dy[i]);
  sx.stroke();
  sx.globalAlpha = 1;

  sx.strokeStyle = 'rgba(0,0,0,.16)';
  sx.lineWidth = 1;
  sx.beginPath();
  sx.moveTo(f.dx[2], f.dy[2]);
  for (let i = 3; i < 8; i++) sx.lineTo(f.dx[i], f.dy[i]);
  sx.stroke();

  for (const [lw, al] of [[14, 0.1], [8, 0.12], [3, 0.2]]) {
    bodyPath(f, 0, 0);
    sx.strokeStyle = 'rgba(0,0,0,' + al + ')';
    sx.lineWidth = lw;
    sx.stroke();
  }
  // Soft spine highlights and crease without CPU blur
  for (const [ox, oy, col, lw] of [
    [-0.3, -0.3, 'rgba(255,255,255,.05)', 1.6],
    [-0.3, -0.3, 'rgba(255,255,255,.08)', 1.1],
    [0.35, 0.35, 'rgba(0,10,20,.06)', 1.7],
    [0.35, 0.35, 'rgba(0,10,20,.10)', 1.2]
  ]) {
    sx.strokeStyle = col;
    sx.lineWidth = w(3) * lw;
    sx.beginPath();
    for (let i = 1; i < n - 1; i++) {
      const x = f.dx[i] + ox * w(i), y = f.dy[i] + oy * w(i);
      i === 1 ? sx.moveTo(x, y) : sx.lineTo(x, y);
    }
    sx.stroke();
  }
  sx.restore();

  sx.strokeStyle = 'rgba(0,0,0,.2)';
  sx.lineWidth = 0.8;
  for (const d of [1, 1.7]) {
    const i = d | 0, u = d - i;
    const x = f.dx[i] + (f.dx[i + 1] - f.dx[i]) * u;
    const y = f.dy[i] + (f.dy[i + 1] - f.dy[i]) * u;
    const ww = w(i) * 0.85;
    sx.beginPath();
    sx.moveTo(x - f.ty[i] * ww, y + f.tx[i] * ww);
    sx.quadraticCurveTo(x - f.tx[i] * Lf * 0.04, y - f.ty[i] * Lf * 0.04, x + f.ty[i] * ww, y - f.tx[i] * ww);
    sx.stroke();
  }
  for (const s of [-1, 1]) {
    const x = f.dx[0] + f.tx[0] * w(0) * 0.15 - f.ty[0] * w(0) * 0.8 * s;
    const y = f.dy[0] + f.ty[0] * w(0) * 0.15 + f.tx[0] * w(0) * 0.8 * s;
    sx.fillStyle = 'rgba(0,0,0,.22)';
    sx.beginPath();
    sx.arc(x, y, Lf * 0.02, 0, 7);
    sx.fill();
    sx.fillStyle = '#0c1114';
    sx.beginPath();
    sx.arc(x, y, Lf * 0.014, 0, 7);
    sx.fill();
  }
  const mx = f.dx[0] + f.tx[0] * w(0) * 0.92, my = f.dy[0] + f.ty[0] * w(0) * 0.92;
  sx.strokeStyle = 'rgba(0,0,0,.28)';
  sx.lineWidth = 0.9;
  sx.beginPath();
  sx.moveTo(mx - f.ty[0] * w(0) * 0.3, my + f.tx[0] * w(0) * 0.3);
  sx.lineTo(mx + f.ty[0] * w(0) * 0.3, my - f.tx[0] * w(0) * 0.3);
  sx.stroke();
  sx.strokeStyle = hexA(f.p.fc, 0.6);
  sx.lineWidth = 0.6;
  for (const s of [-1, 1]) {
    sx.beginPath();
    sx.moveTo(mx - f.ty[0] * w(0) * 0.3 * s, my + f.tx[0] * w(0) * 0.3 * s);
    sx.quadraticCurveTo(mx + f.tx[0] * Lf * 0.05 - f.ty[0] * Lf * 0.06 * s, my + f.ty[0] * Lf * 0.05 + f.tx[0] * Lf * 0.06 * s, mx - f.tx[0] * Lf * 0.02 - f.ty[0] * Lf * 0.1 * s, my - f.ty[0] * Lf * 0.02 + f.tx[0] * Lf * 0.1 * s);
    sx.stroke();
  }
}

function drawPlants() {
  for (const p of plants) {
    for (const b of p.bl) {
      const ex = p.x + Math.cos(b.a) * b.len, ey = p.y + Math.sin(b.a) * b.len;
      const sw = Math.sin(T * 0.7 + b.ph) * L * 0.05;
      const nx = -Math.sin(b.a), ny = Math.cos(b.a);
      const cx = (p.x + ex) / 2 + nx * sw * 2, cy = (p.y + ey) / 2 + ny * sw * 2;
      const tx = ex + nx * sw, ty = ey + ny * sw, wd = L * 0.03;
      sx.fillStyle = 'rgba(14,62,40,.92)';
      sx.beginPath();
      sx.moveTo(p.x - nx * wd, p.y - ny * wd);
      sx.quadraticCurveTo(cx - nx * wd * 0.7, cy - ny * wd * 0.7, tx, ty);
      sx.quadraticCurveTo(cx + nx * wd * 0.7, cy + ny * wd * 0.7, p.x + nx * wd, p.y + ny * wd);
      sx.closePath();
      sx.fill();
      sx.strokeStyle = 'rgba(70,150,95,.45)';
      sx.lineWidth = 0.8;
      sx.beginPath();
      sx.moveTo(p.x, p.y);
      sx.quadraticCurveTo(cx, cy, tx, ty);
      sx.stroke();
    }
  }
}

function drawPad(p, k) {
  const x = p.x + Math.sin(T + p.ph) * 0.6, y = p.y + Math.cos(T * 0.8 + p.ph) * 0.6, r = p.r;
  sx.fillStyle = 'rgba(0,8,12,.3)';
  sx.beginPath();
  sx.arc(x + 4, y + 6, r, 0, 7);
  sx.fill();
  const g = sx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, '#58a468');
  g.addColorStop(1, '#1f5038');
  sx.fillStyle = g;
  sx.beginPath();
  sx.arc(x, y, r, p.rot + 0.3, p.rot + 5.98);
  sx.lineTo(x, y);
  sx.closePath();
  sx.fill();
  sx.strokeStyle = 'rgba(20,60,40,.5)';
  sx.lineWidth = 0.8;
  sx.beginPath();
  for (let a = p.rot + 0.6; a < p.rot + 5.8; a += 0.42) {
    sx.moveTo(x, y);
    sx.lineTo(x + Math.cos(a) * r * 0.96, y + Math.sin(a) * r * 0.96);
  }
  sx.stroke();
  sx.strokeStyle = 'rgba(120,200,140,.18)';
  sx.lineWidth = 1;
  sx.beginPath();
  sx.arc(x, y, r, p.rot + 0.3, p.rot + 5.98);
  sx.stroke();
  sx.fillStyle = 'rgba(255,255,255,.1)';
  sx.beginPath();
  sx.ellipse(x - r * 0.35, y - r * 0.3, r * 0.07, r * 0.04, 0.6, 0, 7);
  sx.fill();
  if (k === 0) {
    for (let i = 0; i < 10; i++) {
      sx.fillStyle = '#ffc2d4';
      sx.beginPath();
      sx.ellipse(x + Math.cos(i * 0.628) * r * 0.34, y + Math.sin(i * 0.628) * r * 0.34, r * 0.3, r * 0.1, i * 0.628, 0, 7);
      sx.fill();
    }
    for (let i = 0; i < 8; i++) {
      sx.fillStyle = '#ff9fbd';
      sx.beginPath();
      sx.ellipse(x + Math.cos(i * 0.785 + 0.3) * r * 0.2, y + Math.sin(i * 0.785 + 0.3) * r * 0.2, r * 0.2, r * 0.08, i * 0.785 + 0.3, 0, 7);
      sx.fill();
    }
    sx.fillStyle = '#ffd45e';
    sx.beginPath();
    sx.arc(x, y, r * 0.1, 0, 7);
    sx.fill();
  }
}

function drawDrift() {
  for (const d of drift) {
    d.x += d.vx; d.y += d.vy; d.rot += d.vr;
    if (d.x < -10) d.x = W + 10;
    if (d.x > W + 10) d.x = -10;
    if (d.y < -10) d.y = H + 10;
    if (d.y > H + 10) d.y = -10;
    const rx = L * 0.07, ry = L * 0.035;
    sx.fillStyle = 'rgba(0,8,12,.25)';
    sx.beginPath();
    sx.ellipse(d.x + 2, d.y + 3, rx, ry, d.rot, 0, 7);
    sx.fill();
    sx.fillStyle = d.leaf ? d.c : '#ffb3c8';
    sx.beginPath();
    sx.ellipse(d.x, d.y, rx, ry, d.rot, 0, 7);
    sx.fill();
    if (d.leaf) {
      sx.strokeStyle = 'rgba(90,40,10,.5)';
      sx.lineWidth = 0.7;
      sx.beginPath();
      sx.moveTo(d.x - Math.cos(d.rot) * rx, d.y - Math.sin(d.rot) * rx);
      sx.lineTo(d.x + Math.cos(d.rot) * rx, d.y + Math.sin(d.rot) * rx);
      sx.stroke();
    }
  }
}

function drawFood() {
  for (const fd of food) {
    sx.globalAlpha = Math.min(1, (25 - (T - fd.born)) / 4);
    sx.fillStyle = 'rgba(0,8,12,.3)';
    sx.beginPath();
    sx.arc(fd.x + 1.5, fd.y + 2, L * 0.022, 0, 7);
    sx.fill();
    sx.fillStyle = '#c98a3a';
    sx.beginPath();
    sx.arc(fd.x, fd.y, L * 0.022, 0, 7);
    sx.fill();
    sx.fillStyle = '#f0c27a';
    sx.beginPath();
    sx.arc(fd.x - L * 0.007, fd.y - L * 0.007, L * 0.008, 0, 7);
    sx.fill();
  }
  sx.globalAlpha = 1;
}

function mkFrog() { frog = null; }

function mkFly() {
  fly = [0, 1].map(i => ({
    x: W * (0.3 + 0.4 * i),
    y: H * (0.3 + 0.4 * i),
    ang: rnd(6.28),
    sp: 1,
    wx: W / 2,
    wy: H / 2,
    wt: 100,
    hov: 0,
    ph: rnd(6)
  }));
}

function updFrog(now) {
  const g = frog;
  if (!g) return;
  if (g.air) {
    g.u += 1 / 18;
    if (g.u >= 1) {
      g.u = 1; g.air = false; g.x = g.tx; g.y = g.ty; g.st = g.to; g.cool = 25;
      rip(g.x, g.y, 0.012);
    } else {
      const e = g.u * g.u * (3 - 2 * g.u);
      g.x = g.fx + (g.tx - g.fx) * e;
      g.y = g.fy + (g.ty - g.fy) * e;
    }
    return;
  }
  g.cool--;
  const dm = Math.hypot(mouse.x - g.x, mouse.y - g.y);
  if (now - mouse.d < 2000 && dm < L * 2.5) {
    g.ang += ad(Math.atan2(mouse.y - g.y, mouse.x - g.x) - g.ang) * 0.03;
  }
  const trig = now - mouse.d < 500 && dm < L * 0.8;
  if (g.cool <= 0 && (trig || --g.idle <= 0)) {
    g.idle = (70 + rnd(120)) | 0;
    let best = -1, bd = -1;
    stones.forEach((s, i) => {
      if (i === g.st || s.isPebble) return;
      const dj = Math.hypot(s.x - g.x, s.y - g.y);
      const dc = (trig ? Math.hypot(s.x - mouse.x, s.y - mouse.y) : 0) + rnd() * L * (trig ? 0.3 : 3);
      if (dj < L * 2.4 && dc > bd) { bd = dc; best = i; }
    });
    if (best < 0) {
      const big = stones.map((s, idx) => s.isPebble ? -1 : idx).filter(idx => idx >= 0);
      best = big.length ? big[(g.st + 1) % big.length] : 0;
    }
    const s = stones[best];
    g.fx = g.x; g.fy = g.y;
    g.tx = s.x + (rnd() - 0.5) * s.r * 0.3;
    g.ty = s.y + (rnd() - 0.5) * s.r * 0.3;
    g.ang = Math.atan2(g.ty - g.fy, g.tx - g.fx);
    g.to = best; g.air = true; g.u = 0;
    rip(g.x, g.y, 0.01);
  }
}

function updFly(d) {
  let tgt = 1.7 + 0.7 * Math.sin(T * 0.7);
  const pick = () => {
    d.wx = W * 0.08 + rnd(W * 0.84);
    d.wy = H * 0.08 + rnd(H * 0.84);
    d.wt = (120 + rnd(180)) | 0;
  };
  if (d.hov > 0) {
    d.hov--; tgt = 0.1;
    if (d.hov === 0) pick();
  } else if (Math.hypot(d.wx - d.x, d.wy - d.y) < L * 0.2 || --d.wt <= 0) {
    if (rnd() < 0.5) d.hov = (40 + rnd(70)) | 0;
    else pick();
  }
  d.ang += Math.max(-0.07, Math.min(0.07, ad(Math.atan2(d.wy - d.y, d.wx - d.x) - d.ang) * 0.06));
  d.sp += (tgt - d.sp) * 0.08;
  d.x += Math.cos(d.ang) * d.sp + Math.sin(T * 2.3) * 0.12;
  d.y += Math.sin(d.ang) * d.sp + Math.cos(T * 1.9) * 0.12;
  d.x = Math.max(L * 0.1, Math.min(W - L * 0.1, d.x));
  d.y = Math.max(L * 0.1, Math.min(H - L * 0.1, d.y));
  d.ph += 1.5;
}

function drawFly(d) {
  const s = L * 0.17, fl = Math.cos(d.ph), fl2 = Math.cos(d.ph + 1.5);
  // Soft layered shadow without CPU blur filter pass
  sx.fillStyle = 'rgba(0,8,12,.06)';
  sx.beginPath();
  sx.ellipse(d.x + L * 0.08, d.y + L * 0.14, s * 1.1, s * 0.14, d.ang, 0, 7);
  sx.fill();
  sx.fillStyle = 'rgba(0,8,12,.10)';
  sx.beginPath();
  sx.ellipse(d.x + L * 0.08, d.y + L * 0.14, s * 0.85, s * 0.09, d.ang, 0, 7);
  sx.fill();
  sx.save();
  sx.translate(d.x, d.y);
  sx.rotate(d.ang);
  for (const k of [-1, 1]) {
    for (const [px, sw, ln, f] of [[0.12, -0.28, 1.1, fl], [-0.04, 0.3, 1, fl2]]) {
      sx.save();
      sx.translate(s * px, 0);
      sx.rotate(k * (1.5708 + sw));
      sx.fillStyle = 'rgba(215,238,246,.3)';
      sx.strokeStyle = 'rgba(70,100,110,.35)';
      sx.lineWidth = 0.5;
      sx.beginPath();
      sx.ellipse(s * ln * 0.5, 0, s * ln * 0.5 * (0.88 + 0.12 * f), s * 0.17, 0, 0, 7);
      sx.fill();
      sx.stroke();
      sx.beginPath();
      sx.moveTo(0, 0);
      sx.lineTo(s * ln * (0.9 + 0.1 * f), 0);
      sx.stroke();
      sx.restore();
    }
  }
  for (let i = 0; i < 8; i++) {
    sx.fillStyle = i % 2 ? '#1d5f7a' : '#2c8db0';
    sx.beginPath();
    sx.arc(-s * (0.3 + i * 0.22), Math.sin(T * 2 + i * 0.5) * s * 0.02, s * 0.075 * (1 - 0.05 * i), 0, 7);
    sx.fill();
  }
  sx.fillStyle = '#3aa3a0';
  sx.beginPath();
  sx.ellipse(0, 0, s * 0.22, s * 0.15, 0, 0, 7);
  sx.fill();
  sx.fillStyle = '#2a5560';
  sx.beginPath();
  sx.arc(s * 0.3, 0, s * 0.12, 0, 7);
  sx.fill();
  sx.fillStyle = '#5fd3b0';
  for (const k of [-1, 1]) {
    sx.beginPath();
    sx.arc(s * 0.34, k * s * 0.09, s * 0.08, 0, 7);
    sx.fill();
  }
  sx.restore();
}

function shiftFish(f, x, y) {
  f.x += x; f.y += y;
  for (let i = 0; i < N; i++) {
    f.xs[i] += x; f.ys[i] += y;
    f.dx[i] += x; f.dy[i] += y;
  }
}

function sepBodies() {
  for (let pass = 0; pass < 2; pass++) {
    for (let a = 0; a < fish.length; a++) {
      for (let b = a + 1; b < fish.length; b++) {
        const A = fish[a], B = fish[b];
        // Broadphase distance rejection
        if (Math.hypot(B.x - A.x, B.y - A.y) > (A.L + B.L) * 0.7) continue;
        let worst = 0, nx = 0, ny = 0;
        for (let i = 0; i < N; i++) {
          for (let j = 0; j < N; j++) {
            const dx = B.dx[j] - A.dx[i], dy = B.dy[j] - A.dy[i];
            const d = Math.hypot(dx, dy) || 0.01;
            const ov = (PROF[i] * A.L + PROF[j] * B.L) * 0.115 + 3 - d;
            if (ov > worst) { worst = ov; nx = dx / d; ny = dy / d; }
          }
        }
        if (worst > 0) {
          shiftFish(A, -nx * worst * 0.5, -ny * worst * 0.5);
          shiftFish(B, nx * worst * 0.5, ny * worst * 0.5);
        }
      }
    }
  }
}

function checkPlaybackState() {
  if (isRunning && isVisible && isTabActive) {
    if (!animationId) {
      lastFrameTime = performance.now();
      animationId = requestAnimationFrame(frame);
    }
  } else {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }
}

function frame(now) {
  if (!isRunning || !isVisible || !isTabActive) {
    animationId = null;
    return;
  }
  animationId = requestAnimationFrame(frame);
  const delta = now - lastFrameTime;
  if (delta < 15.0) return; // Cap at clean 60 FPS on 120Hz/144Hz displays
  lastFrameTime = now - (delta % TARGET_FRAME_MS);

  T = now / 1000;
  if (t0 === null) t0 = T;
  if (now > nextDrop) {
    rip(8 + rnd(W - 16), 8 + rnd(H - 16), 0.026);
    nextDrop = now + 1600 + rnd(2200);
  }
  food = food.filter(fd => T - fd.born < 25);
  fish.forEach(updFish);
  sepBodies();
  updFrog(performance.now());
  fly.forEach(updFly);

  sx.clearRect(0, 0, W, H);
  sx.drawImage(B, 0, 0);
  drawPlants();
  fish.forEach(drawFish);
  pads.forEach(drawPad);
  drawFood();
  drawDrift();
  fly.forEach(drawFly);

  render();
}

function pos(e) {
  const r = cv.getBoundingClientRect();
  return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H];
}

function touch(e, big) {
  const [x, y] = pos(e);
  mouse.x = x; mouse.y = y;
  mouse.d = performance.now();
  if (!big) mouse.t = performance.now();
  if (hintEl) hintEl.classList.add('opacity-0', 'pointer-events-none');
  awake = true;
  if (big) rip(x, y, 0.04);
  else if (mouse.px === null) { mouse.px = x; mouse.py = y; }
  else if (Math.hypot(x - mouse.px, y - mouse.py) > L * 0.12) {
    rip(x, y, 0.013);
    mouse.px = x; mouse.py = y;
  }
}

export function initKoiPond(canvasId = 'koi-canvas', hintId = 'koi-hint') {
  cv = document.getElementById(canvasId);
  hintEl = document.getElementById(hintId);
  if (!cv) return false;

  const force2d = window.location.search.includes('canvas=2d') || window.location.search.includes('capture=1');

  if (!force2d) {
    try {
      gl = cv.getContext('webgl2', { antialias: false, alpha: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' });
      if (gl) {
        glInit();
      }
    } catch (e) {
      console.warn('WebGL2 init failed:', e);
      gl = null;
    }
  }

  if (!gl) {
    ctx2d = cv.getContext('2d');
    if (!ctx2d) {
      if (hintEl) hintEl.textContent = 'Canvas is not supported on your browser.';
      return false;
    }
  }

  resizeSimulation();

  cv.addEventListener('pointerdown', e => {
    mouse.px = null;
    touch(e, true);
    const [x, y] = pos(e);
    let hit = false;
    for (const f of fish) {
      for (let i = 0; i < N; i++) {
        if (Math.hypot(f.dx[i] - x, f.dy[i] - y) < PROF[i] * f.L * 0.115 + L * 0.08) {
          f.flee = (35 + rnd(15)) | 0;
          f.fleeSp = 2.0 + rnd(0.4);
          f.hasWP = true;
          hit = true;
          break;
        }
      }
      if (hit) break;
    }
    if (hit) return;
    for (let i = 0; i < 4; i++) {
      food.push({ x: x + (rnd() - 0.5) * L * 0.12, y: y + (rnd() - 0.5) * L * 0.12, born: T });
    }
  });

  cv.addEventListener('pointermove', e => touch(e, false));
  cv.addEventListener('pointerleave', () => {
    mouse.px = null;
    mouse.t = -1e9;
  });

  cv.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    console.warn('WebGL context lost. Pausing Koi Pond simulation.');
  }, false);

  cv.addEventListener('webglcontextrestored', () => {
    console.info('WebGL context restored. Reinitializing Koi Pond.');
    glInit();
    resizeSimulation();
    checkPlaybackState();
  }, false);

  if ('IntersectionObserver' in window && !pondObserver) {
    pondObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        checkPlaybackState();
      });
    }, { threshold: 0.05 });
    pondObserver.observe(cv);
  }

  document.addEventListener('visibilitychange', () => {
    isTabActive = !document.hidden;
    checkPlaybackState();
  });

  window.addEventListener('resize', () => {
    if (isRunning) resizeSimulation();
  });

  resumeKoiPond();
  return true;
}

export function resumeKoiPond() {
  if (isRunning) return;
  isRunning = true;
  resizeSimulation();
  checkPlaybackState();
}

export function pauseKoiPond() {
  isRunning = false;
  checkPlaybackState();
}

export function disposeKoiPond() {
  pauseKoiPond();
  if (pondObserver) {
    pondObserver.disconnect();
    pondObserver = null;
  }
  if (gl) {
    for (const k in fb) {
      if (fb[k]) {
        gl.deleteTexture(fb[k].t);
        gl.deleteFramebuffer(fb[k].f);
      }
    }
    fb = {};
    if (tex) {
      gl.deleteTexture(tex);
      tex = null;
    }
    for (const k in P) {
      if (P[k]?.p) {
        gl.deleteProgram(P[k].p);
      }
    }
    P = {};
  }
}
