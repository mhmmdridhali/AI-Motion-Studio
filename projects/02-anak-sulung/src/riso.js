// Riso print compositor (WebGL2) for vertical 1080x1920
export const INK = {
  blue: [35, 57, 91],      // Navy Indigo (plate 0, R channel)
  red: [224, 90, 71],      // Terracotta Warm Red (plate 1, G channel)
  yellow: [232, 168, 56],  // Ocher / Sunlight Gold (plate 2, B channel)
};
export const PAPER = [246, 239, 226]; // Warm Cream paper

const VS = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;

const FS = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uOff[3];      // per-plate offset (px)
uniform float uRot[3];     // per-plate rotation (rad)
uniform float uAng[3];     // halftone screen angle
uniform vec3 uInk[3];
uniform vec3 uPaper;
uniform float uSeed;       // sheet variation
uniform float uBoil;
uniform float uSheet;
uniform float uPeriod;     // halftone dot period (px)
uniform float uGate[3];    // active plates (0 or 1)
uniform float uSweep[3];   // reveal x
uniform float uGrain;
out vec4 o;

float h21(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float h21s(vec2 p, float s){ return h21(p + s * 17.13); }
float vn(vec2 p, float s){
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  float a = h21s(i, s), b = h21s(i + vec2(1, 0), s), c = h21s(i + vec2(0, 1), s), d = h21s(i + vec2(1, 1), s);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
vec2 rot(vec2 v, float a){ float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }

float dens(int i, vec2 px){
  vec2 q = rot(px - uRes * .5, uRot[i]) + uRes * .5 - uOff[i];
  return texture(uTex, q / uRes)[i];
}

void main(){
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  // Paper texture with organic subtle fibres
  float fib = vn(px * vec2(.9, .25), 7.) * .5 + vn(px * .05, 9.) * .5;
  vec3 col = uPaper * (.975 + .03 * fib);
  
  for (int i = 0; i < 3; i++) {
    if (uGate[i] <= 0.001) continue;
    vec2 q = rot(px - uRes * .5, uRot[i]) + uRes * .5 - uOff[i];
    float d = dens(i, px);
    float reveal = 1. - smoothstep(-6., 6., px.y - uSweep[i]); // vertical sweep for 9:16
    float band = exp(-pow((px.y - uSweep[i]) / 26., 2.));
    if (d < .002 && band < .01) continue;
    
    // Halftone dots on rotated screen grid
    vec2 g = rot(q, uAng[i]) / uPeriod;
    float spot = 1. - (cos(6.2831853 * g.x) + cos(6.2831853 * g.y) + 2.) * .25;
    
    // Ink grain and paper tooth
    float n1 = mix(h21s(floor(q * .8), uSheet + float(i) * 3.1), h21s(floor(q * .8), uSeed + float(i) * 3.1), uBoil);
    float n2 = vn(q * .28, uSheet * .7 + float(i));
    float thr = spot + (n1 - .5) * .15 * uGrain + (n2 - .5) * .10;
    float dd = d * 1.05;
    float cov = smoothstep(thr - .07, thr + .07, dd);
    cov = max(cov, smoothstep(.9, 1., d) * .96);
    
    // White pinholes in solid ink
    float sp = h21s(floor(q * .5), uSheet * 1.3 + float(i) * 7.7);
    cov *= 1. - step(.96 - .025 * uGrain, sp) * .72 * smoothstep(.45, 1., d);
    
    // Ink feed streaks (paper roller direction)
    float streak = vn(vec2(q.x * .002, q.y * .03), 11. + float(i) + uSheet * .37);
    float blot = vn(q * .003, 5. + float(i) * 2. + uSheet * .13);
    float k = clamp(.82 + .13 * streak + .08 * blot, 0., 1.);
    
    float c = clamp(cov * k * reveal + band * .45 * smoothstep(0., .25, d), 0., 1.) * uGate[i];
    col *= mix(vec3(1.), uInk[i], c);
  }
  o = vec4(col, 1.);
}`;

export function makeRiso(out, W, H) {
  const gl = out.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false, alpha: false });
  const sh = (t, s) => {
    const x = gl.createShader(t);
    gl.shaderSource(x, s);
    gl.compileShader(x);
    if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x));
    return x;
  };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
  gl.useProgram(pr);

  const b = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

  const U = n => gl.getUniformLocation(pr, n);
  const u = {};
  for (const n of ['uTex', 'uRes', 'uOff', 'uRot', 'uAng', 'uInk', 'uPaper', 'uSeed', 'uBoil', 'uSheet', 'uPeriod', 'uGate', 'uSweep', 'uGrain']) {
    u[n] = U(n);
  }
  gl.viewport(0, 0, W, H);

  return function print(plate, o = {}) {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, plate);
    const inks = o.inks || [INK.blue, INK.red, INK.yellow];
    gl.uniform1i(u.uTex, 0);
    gl.uniform2f(u.uRes, W, H);
    const off = o.off || [[0, 0], [0, 0], [0, 0]];
    gl.uniform2fv(u.uOff, off.flat());
    gl.uniform1fv(u.uRot, o.rot || [0, 0, 0]);
    gl.uniform1fv(u.uAng, o.ang || [0.2618, 0.7854, 1.309]); // 15° / 45° / 75°
    gl.uniform3fv(u.uInk, inks.map(c => c.map(v => v / 255)).flat());
    gl.uniform3fv(u.uPaper, (o.paper || PAPER).map(v => v / 255));
    gl.uniform1f(u.uSeed, o.seed ?? 0);
    gl.uniform1f(u.uSheet, o.sheet ?? 0);
    gl.uniform1f(u.uBoil, o.boil ?? .35);
    gl.uniform1f(u.uPeriod, o.period ?? 7.5);
    gl.uniform1fv(u.uGate, o.gate || [1, 1, 1]);
    gl.uniform1fv(u.uSweep, o.sweep || [1e5, 1e5, 1e5]);
    gl.uniform1f(u.uGrain, o.grain ?? 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
}
