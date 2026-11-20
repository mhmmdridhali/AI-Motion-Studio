// Stick-figure rig for SI-PELITA (1080x1920). Technique: even-hose quadratic limbs, damped springs, tangent-continuous joined hands.
const W = 1080, H = 1920;
const C = { paper: '#F4F1EA', ink: '#23252C', mute: '#8A877E', wire: '#DDD8CE', pale: '#E8E3D8', acc: '#157A3D', ghost: '#ABA69B' };
const cv = document.getElementById('c'), g = cv.getContext('2d');
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a)), ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const eo = x => { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const bell = (t, a, b) => { const u = seg(t, a, b); return Math.sin(Math.PI * u) ** 2; };
const lerpZ = (a, b, u) => Math.exp(lerp(Math.log(a), Math.log(b), u));
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function mix(a, b, t) { const A = hex(a), B = hex(b); return 'rgb(' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(t)))).join(',') + ')'; }
function popS(tau, w = 17, z = .45) { if (tau <= 0) return 0; const wd = w * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w * tau) * (Math.cos(wd * tau) + z * w / wd * Math.sin(wd * tau)); }
const V = { add: (a, b) => [a[0] + b[0], a[1] + b[1]], sub: (a, b) => [a[0] - b[0], a[1] - b[1]], mul: (a, k) => [a[0] * k, a[1] * k], len: a => Math.hypot(a[0], a[1]), norm: a => { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; } };
const L2D = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

// ---- paper: fine matte grain, drawn once ----
let paperC = null;
function paper() {
  if (!paperC) {
    paperC = document.createElement('canvas'); paperC.width = W; paperC.height = H;
    const x = paperC.getContext('2d'); x.fillStyle = C.paper; x.fillRect(0, 0, W, H);
    const id = x.getImageData(0, 0, W, H), d = id.data, r = mulberry(11);
    for (let i = 0; i < d.length; i += 4) { const n = (r() + r() - 1) * 3.2; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
    x.putImageData(id, 0, 0);
  }
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.drawImage(paperC, 0, 0);
}

// ---- skeleton (figure height = 1) ----
const GEO = { thigh: .215, shin: .215, hipH: .42, spine: .285, sh: .065, upper: .18, fore: .155, headR: .112, stance: .09 };
const rest = () => ({ hx: 0, hy: 0, lean: 0, bend: 0, head: 0, la: -.56, lb: .24, ra: .56, rb: -.24, lfx: 0, lfy: 0, rfx: 0, rfy: 0, hdx: 0, hdy: 0 });
const KEYS = Object.keys(rest());
const dirv = a => [Math.sin(a), Math.cos(a)];
const UP = { la: -2.25, lb: -.5, ra: 2.25, rb: .5 };
function ik(Hh, F, L1, L2, side) {
  let dx = F[0] - Hh[0], dy = F[1] - Hh[1], d = Math.hypot(dx, dy); const m = (L1 + L2) * .9995;
  if (d > m) { F = [Hh[0] + dx / d * m, Hh[1] + dy / d * m]; dx = F[0] - Hh[0]; dy = F[1] - Hh[1]; d = m; }
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const px = Hh[0] + a * dx / d, py = Hh[1] + a * dy / d; let nx = -dy / d, ny = dx / d;
  if (nx * side < 0) { nx = -nx; ny = -ny; }
  return [[px + nx * h, py + ny * h], F];
}
function joints(f, p) {
  const S = f.S, bx = f.x, gy = f.gy;
  const Hp = [bx + p.hx * S, gy - (GEO.hipH - p.hy) * S];
  const sd = dirv(Math.PI - p.lean);
  const N = [Hp[0] + sd[0] * GEO.spine * S, Hp[1] + sd[1] * GEO.spine * S];
  const mid = [(Hp[0] + N[0]) / 2, (Hp[1] + N[1]) / 2], perp = [-sd[1], sd[0]];
  const Cc = [mid[0] + perp[0] * p.bend * S, mid[1] + perp[1] * p.bend * S];
  const u = 1 - GEO.sh / GEO.spine;
  const Sh = [(1 - u) * (1 - u) * Hp[0] + 2 * (1 - u) * u * Cc[0] + u * u * N[0], (1 - u) * (1 - u) * Hp[1] + 2 * (1 - u) * u * Cc[1] + u * u * N[1]];
  const lag = clamp(p.hdx / GEO.headR * .9, -.35, .35);
  const hd = dirv(Math.PI - (p.lean + p.head + lag)), hr = GEO.headR * S;
  const Hd = [N[0] + hd[0] * hr, N[1] + hd[1] * hr];
  const arm = (a, b) => { const e = dirv(a), E = [Sh[0] + e[0] * GEO.upper * S, Sh[1] + e[1] * GEO.upper * S]; const w = dirv(a + b); return [E, [E[0] + w[0] * GEO.fore * S, E[1] + w[1] * GEO.fore * S]]; };
  const st = GEO.stance;
  const footL = [bx + (-st + p.lfx) * S, gy - p.lfy * S], footR = [bx + (st + p.rfx) * S, gy - p.rfy * S];
  return { Hp, N, Cc, Sh, Hd, aL: arm(p.la, p.lb), aR: arm(p.ra, p.rb), lL: ik(Hp, footL, GEO.thigh * S, GEO.shin * S, -1), lR: ik(Hp, footR, GEO.thigh * S, GEO.shin * S, 1) };
}
function ctrl(A, B, E, k) { const m = [(A[0] + E[0]) / 2, (A[1] + E[1]) / 2]; return [B[0] + (B[0] - m[0]) * k, B[1] + (B[1] - m[1]) * k]; }
const qpt = (A, Q, E, t) => { const s = 1 - t; return [s * s * A[0] + 2 * s * t * Q[0] + t * t * E[0], s * s * A[1] + 2 * s * t * Q[1] + t * t * E[1]]; };
const qder = (A, Q, E, t) => [2 * (1 - t) * (Q[0] - A[0]) + 2 * t * (E[0] - Q[0]), 2 * (1 - t) * (Q[1] - A[1]) + 2 * t * (E[1] - Q[1])];
function figure(f, p) {
  const S = f.S, j = joints(f, p), col = f.col || C.ink, fill = f.fill || C.paper;
  const lws = f.lws ?? clamp(Math.sqrt(S / 380), .6, 1.05), k = f.lwk ?? 1, lw = Math.max(2.2, 8 * lws * k), hw = Math.max(2, 7.5 * lws * k);
  g.save(); g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = lw; g.beginPath();
  for (const [K, F] of [j.lL, j.lR]) { const Q = ctrl(j.Hp, K, F, .8); g.moveTo(j.Hp[0], j.Hp[1]); g.quadraticCurveTo(Q[0], Q[1], F[0], F[1]); }
  g.moveTo(j.Hp[0], j.Hp[1]); g.quadraticCurveTo(j.Cc[0], j.Cc[1], j.N[0], j.N[1]);
  [j.aL, j.aR].forEach(([El, Hn], ai) => { if ((ai === 0 && f.noL) || (ai === 1 && f.noR)) return; const Q = ctrl(j.Sh, El, Hn, .8); g.moveTo(j.Sh[0], j.Sh[1]); g.quadraticCurveTo(Q[0], Q[1], Hn[0], Hn[1]); });
  g.stroke();
  g.beginPath(); g.arc(j.Hd[0], j.Hd[1], GEO.headR * S, 0, Math.PI * 2); g.fillStyle = fill; g.fill();
  g.lineWidth = hw; g.beginPath(); g.arc(j.Hd[0], j.Hd[1], GEO.headR * S, 0, Math.PI * 2); g.stroke();
  g.restore(); return j;
}

// ---- springs ----
const SPR = { hx: [20, .8], hy: [24, .62], lean: [13, .6], bend: [12, .55], head: [9, .42], la: [13, .58], ra: [13, .58], lb: [9.5, .46], rb: [9.5, .46], lfx: [30, .85], lfy: [30, .85], rfx: [30, .85], rfy: [30, .85] };
const SK = Object.keys(SPR), HEADSPR = [16, .38], NK = KEYS.length, REC = 120;
function simulateActor(e) {
  const t0 = e.s0, t1 = e.s1, dt = 1 / 600, every = 5, n = Math.floor((t1 - t0) * REC) + 2;
  const fr = new Float32Array(n * NK), p = e.tg(t0), v = {}; for (const k in p) v[k] = 0;
  const rigid = q => { const hy = GEO.hipH - q.hy, s = GEO.spine, r = GEO.headR; return [q.hx + Math.sin(q.lean) * s + Math.sin(q.lean + q.head) * r, hy + Math.cos(q.lean) * s + Math.cos(q.lean + q.head) * r]; };
  let hp = null, hv = [0, 0], step = 0, idx = 0;
  for (let t = t0; idx < n; t += dt, step++) {
    if (step % every === 0) { for (let k = 0; k < NK; k++) fr[idx * NK + k] = p[KEYS[k]]; idx++; if (idx >= n) break; }
    const tg = e.tg(t);
    for (const k of SK) { const [w, z] = SPR[k]; const a = w * w * (tg[k] - p[k]) - 2 * z * w * v[k]; v[k] += a * dt; p[k] += v[k] * dt; }
    const R = rigid(p); if (!hp) hp = [...R];
    const [w, z] = HEADSPR;
    for (let q = 0; q < 2; q++) { const a = w * w * (R[q] - hp[q]) - 2 * z * w * hv[q]; hv[q] += a * dt; hp[q] += hv[q] * dt; }
    p.hdx = clamp(hp[0] - R[0], -.03, .03); p.hdy = clamp(hp[1] - R[1], -.03, .03);
  }
  e.fr = fr; e.n = n;
}
function poseAt(e, T) {
  const f = (T - e.s0) * REC, i = clamp(Math.floor(f), 0, e.n - 2), u = clamp(f - i), q = {};
  for (let k = 0; k < NK; k++) q[KEYS[k]] = lerp(e.fr[i * NK + k], e.fr[(i + 1) * NK + k], u);
  return q;
}
function idle(seed, T) {
  const p = rest(), ph = seed * 1.93 + .4;
  p.hx += .004 * Math.sin(T * 1.25 + ph); p.lean += .012 * Math.sin(T * 1.05 + ph * 1.3);
  p.hy += .004 * (.5 + .5 * Math.sin(T * 2.1 + ph)); p.la -= .03 * Math.sin(T * 1.5 + ph); p.ra += .03 * Math.sin(T * 1.5 + ph + .7);
  p.head += .05 * Math.sin(T * .7 + ph * 2.1);
  return p;
}
// stepping in place or travelling: amp 0..1, phase from travelled distance
function walkInto(p, x, T, S, dir) {
  const v = Math.abs((typeof x === 'function' ? x(T + .02) - x(T - .02) : 0) / .04);
  const amp = clamp(v / 150); if (amp < .02) return p;
  const ph = (typeof x === 'function' ? x(T) : 0) / (S * .22);
  p.lfy += .05 * amp * Math.max(0, Math.sin(ph)); p.rfy += .05 * amp * Math.max(0, -Math.sin(ph));
  p.lfx += .05 * amp * Math.sin(ph); p.rfx -= .05 * amp * Math.sin(ph);
  p.hy += .014 * amp * Math.abs(Math.sin(ph)); p.lean += .07 * amp * dir; p.la -= .35 * amp * Math.sin(ph); p.ra += .35 * amp * Math.sin(ph);
  return p;
}

// ---- actors and hand-holding ----
const ACTORS = [];
function actor(o) {
  o.col = o.col || (() => C.ink); o.fill = o.fill || (() => C.paper);
  o.s0 = o.life[0]; o.s1 = o.life[1]; ACTORS.push(o); return o;
}
const ex = (e, T) => typeof e.x === 'function' ? e.x(T) : e.x, ey = (e, T) => typeof e.y === 'function' ? e.y(T) : e.y;
function wJ(e, T) {
  const sc = popS(T - e.appear); if (sc <= .01) return null;
  const S = e.S * sc, p = poseAt(e, T), x = ex(e, T), y = ey(e, T), j = joints({ x: 0, gy: 0, S }, p), M = q => [x + q[0], y + q[1]];
  return { e, x, y, S, sc, p, Sh: M(j.Sh), aL: [M(j.aL[0]), M(j.aL[1])], aR: [M(j.aR[0]), M(j.aR[1])], head: M(j.Hd), chest: [x + j.Sh[0], y + j.Sh[1] + S * .2] };
}
function elbowD(Sh, Hn, L1, L2) {
  let dx = Hn[0] - Sh[0], dy = Hn[1] - Sh[1], d = Math.hypot(dx, dy) || 1e-6;
  if (d >= L1 + L2) return [Sh[0] + dx * L1 / (L1 + L2), Sh[1] + dy * L1 / (L1 + L2)];
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  let nx = -dy / d, ny = dx / d; if (ny < 0) { nx = -nx; ny = -ny; }
  return [Sh[0] + a * dx / d + nx * h, Sh[1] + a * dy / d + ny * h];
}
// link {a,b,c,rel,sag(T),over:[{t0,t1,rev,f0,f1}]}: a's right hand holds b's left hand
function linkGeo(L, T, A, B) {
  const c = L.c; let r = seg(T, c - .3, c); r = r < .3 ? -.10 * Math.sin(Math.PI * r / .3) : ss((r - .3) / .7);
  if (L.rel != null) r = Math.min(r, 1 - ss(seg(T, L.rel, L.rel + .32)));
  const joined = T >= c && (L.rel == null || T < L.rel), S = (A.S + B.S) / 2;
  const tc = T - c, bounce = tc > 0 && joined ? .045 * Math.exp(-tc * 6) * Math.sin(tc * 21) : 0;
  const mid = V.mul(V.add(A.Sh, B.Sh), .5), Pc = [mid[0], mid[1] + ((L.sag ? L.sag(T) : .17) + bounce) * S];
  const hi = L2D(A.aR[1], Pc, r), hj = L2D(B.aL[1], Pc, r);
  const Ei = elbowD(A.Sh, hi, GEO.upper * A.S, GEO.fore * A.S), Ej = elbowD(B.Sh, hj, GEO.upper * B.S, GEO.fore * B.S);
  let Qi = ctrl(A.Sh, Ei, hi, .8), Qj = ctrl(B.Sh, Ej, hj, .8);
  const jw = joined ? ss(seg(T, c, c + .14)) : 0;
  if (jw > 0) { const d = V.norm(V.sub(Qj, Qi)), li = V.len(V.sub(Pc, Qi)), lj = V.len(V.sub(Qj, Pc)); Qi = L2D(Qi, V.sub(Pc, V.mul(d, li)), jw); Qj = L2D(Qj, V.add(Pc, V.mul(d, lj)), jw); }
  return { Si: A.Sh, Qi, hi, Sj: B.Sh, Qj, hj, Pc, joined };
}
const engaged = (L, T) => T >= L.c - .3 && (L.rel == null || T < L.rel + .32);
const quadPts = (A, Q, E, n = 16) => { const o = []; for (let i = 0; i <= n; i++) o.push(qpt(A, Q, E, i / n)); return o; };
const polyLen = P => { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; };
function strokePoly(P, upto) {
  g.beginPath(); g.moveTo(P[0][0], P[0][1]); let L = 0;
  for (let i = 1; i < P.length; i++) { const s = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); if (L + s >= upto) { const u = (upto - L) / s; g.lineTo(lerp(P[i - 1][0], P[i][0], u), lerp(P[i - 1][1], P[i][1], u)); break; } g.lineTo(P[i][0], P[i][1]); L += s; }
  g.stroke();
}
const pathOf = G => quadPts(G.Si, G.Qi, G.hi).concat(quadPts(G.hj, G.Qj, G.Sj).slice(1));
const lwOf = J => Math.max(1.6, 8 * (J.e.lws ?? clamp(Math.sqrt(J.S / 380), .6, 1.05)) * clamp(J.sc * 1.6));
// draws links (behind), accent runs, then figures. returns {Jm: Map actor->J, Gm: Map link->geo}
function drawGroup(P, Ls, T, alpha = 1) {
  const Jm = new Map(), Gm = new Map(); for (const e of P) { const j = wJ(e, T); if (j) Jm.set(e, j); }
  if (alpha <= 0) return { Jm, Gm };
  g.save(); g.globalAlpha = alpha; g.lineCap = 'round'; g.lineJoin = 'round';
  const act = [];
  for (const L of Ls) {
    const A = Jm.get(L.a), B = Jm.get(L.b); if (!A || !B || !engaged(L, T)) continue;
    const geo = linkGeo(L, T, A, B); Gm.set(L, geo); act.push([L, geo, A, B]);
    g.strokeStyle = L.a.col(T); g.lineWidth = lwOf(A); g.beginPath(); g.moveTo(geo.Si[0], geo.Si[1]); g.quadraticCurveTo(geo.Qi[0], geo.Qi[1], geo.hi[0], geo.hi[1]); g.stroke();
    g.strokeStyle = L.b.col(T); g.lineWidth = lwOf(B); g.beginPath(); g.moveTo(geo.hj[0], geo.hj[1]); g.quadraticCurveTo(geo.Qj[0], geo.Qj[1], geo.Sj[0], geo.Sj[1]); g.stroke();
  }
  for (const [L, geo, A] of act) {
    if (!geo.joined || !L.over) continue;
    const pts = pathOf(geo), len = polyLen(pts);
    for (const ov of L.over) {
      const f = seg(T, ov.t0, ov.t1); if (f <= 0) continue;
      const vis = 1 - seg(T, ov.f0 ?? 1e9, ov.f1 ?? 1e9 + 1); if (vis <= 0) continue;
      g.strokeStyle = mix(C.ink, C.acc, vis); g.lineWidth = lwOf(A) + .6; strokePoly(ov.rev ? pts.slice().reverse() : pts, f * len);
    }
  }
  for (const e of P) {
    const j = Jm.get(e); if (!j) continue; let noL = false, noR = false;
    for (const L of Ls) { if (!engaged(L, T) || !Jm.get(L.a) || !Jm.get(L.b)) continue; if (L.a === e) noR = true; if (L.b === e) noL = true; }
    g.save(); g.translate(j.x, j.y);
    figure({ x: 0, gy: 0, S: j.S, col: e.col(T), fill: e.fill(T), lwk: clamp(j.sc * 1.6), lws: e.lws, noL, noR }, j.p);
    g.restore();
  }
  g.restore(); return { Jm, Gm };
}
function envelope(x, y, w, ang, grey, a = 1) {
  const h = w * .68; g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(ang);
  g.lineJoin = 'round'; g.lineCap = 'round'; g.lineWidth = w * .075;
  g.fillStyle = grey ? C.pale : C.paper; g.strokeStyle = grey ? C.mute : C.ink;
  g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, w * .08); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(-w / 2 + w * .06, -h / 2 + h * .1); g.lineTo(0, h * .08); g.lineTo(w / 2 - w * .06, -h / 2 + h * .1); g.stroke(); g.restore();
}
function ticket(x, y, w, a = 1, grey = false) {
  const h = w * .62; g.save(); g.globalAlpha = a; g.translate(x, y);
  g.fillStyle = grey ? C.pale : C.acc;
  g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, w * .1); g.fill();
  if (grey) { g.strokeStyle = C.mute; g.lineWidth = w * .055; g.stroke(); }
  g.fillStyle = C.paper; g.beginPath(); g.arc(-w / 2, 0, h * .14, 0, Math.PI * 2); g.arc(w / 2, 0, h * .14, 0, Math.PI * 2); g.fill();
  g.strokeStyle = grey ? C.mute : C.paper; g.lineWidth = w * .06; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-w * .26, -h * .12); g.lineTo(w * .26, -h * .12); g.moveTo(-w * .26, h * .14); g.lineTo(w * .1, h * .14); g.stroke();
  if (grey) {
    g.strokeStyle = C.mute; g.lineWidth = w * .07;
    g.beginPath(); g.moveTo(w * .14, -h * .16); g.lineTo(w * .32, h * .16); g.moveTo(w * .32, -h * .16); g.lineTo(w * .14, h * .16); g.stroke();
  }
  g.restore();
}
function chatBubble(x, y, w, h, tailSide = -1, grey = false, a = 1) {
  g.save(); g.globalAlpha = a; g.translate(x, y); g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 5.5;
  g.fillStyle = grey ? C.pale : C.paper; g.strokeStyle = grey ? C.mute : C.ink;
  const r = Math.min(w, h) * .28;
  g.beginPath();
  g.moveTo(-w / 2 + r, -h / 2); g.lineTo(w / 2 - r, -h / 2); g.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  g.lineTo(w / 2, h / 2 - r); g.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  if (tailSide > 0) { g.lineTo(w * .24, h / 2); g.lineTo(w * .34, h / 2 + 16); g.lineTo(w * .08, h / 2); }
  else { g.lineTo(-w * .08, h / 2); g.lineTo(-w * .34, h / 2 + 16); g.lineTo(-w * .24, h / 2); }
  g.lineTo(-w / 2 + r, h / 2); g.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  g.lineTo(-w / 2, -h / 2 + r); g.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = grey ? C.mute : C.ink; g.lineWidth = 4.5;
  g.beginPath(); g.moveTo(-w * .28, -h * .12); g.lineTo(w * .24, -h * .12); g.moveTo(-w * .28, h * .14); g.lineTo(w * .06, h * .14); g.stroke();
  g.restore();
}
function formSheet(x, y, w, h, ang = 0, grey = false, a = 1, accMark = false) {
  g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(ang); g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 5;
  g.fillStyle = grey ? C.pale : C.paper; g.strokeStyle = grey ? C.mute : (accMark ? C.acc : C.ink);
  g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, w * .12); g.fill(); g.stroke();
  g.strokeStyle = accMark ? C.acc : (grey ? C.mute : C.ink); g.lineWidth = 4.5;
  g.beginPath(); g.moveTo(-w * .28, -h * .24); g.lineTo(w * .18, -h * .24); g.stroke();
  g.strokeStyle = grey ? C.wire : C.mute; g.lineWidth = 3.8;
  g.beginPath(); g.moveTo(-w * .28, -h * .02); g.lineTo(w * .28, -h * .02); g.moveTo(-w * .28, h * .18); g.lineTo(w * .22, h * .18); g.stroke();
  if (accMark) {
    g.strokeStyle = C.acc; g.lineWidth = 5;
    g.beginPath(); g.moveTo(w * .08, h * .28); g.lineTo(w * .18, h * .38); g.lineTo(w * .36, h * .16); g.stroke();
  }
  g.restore();
}
function questionRing(x, y, r, a = 1) {
  g.save(); g.globalAlpha = a; g.translate(x, y);
  g.fillStyle = C.paper; g.strokeStyle = C.mute; g.lineWidth = 4.5;
  g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
  g.setLineDash([4, 8]); g.stroke(); g.setLineDash([]);
  g.font = `700 ${Math.round(r * 1.15)}px Jost`; g.fillStyle = C.ink; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('?', 0, 2);
  g.restore();
}
function portalArch(x, y, w, h, openU = 1, pulseU = 0, a = 1) {
  const s = clamp(openU, 0, 1.12); if (s <= .01 || a <= 0) return;
  g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(1, s); g.lineCap = 'round'; g.lineJoin = 'round';
  const r = w / 2, bodyH = Math.max(0, h - r);
  if (pulseU > 0) {
    for (let k = 0; k < 2; k++) {
      const pu = fract(pulseU + k * .5);
      g.save(); g.globalAlpha = a * (1 - pu) * .55; g.strokeStyle = C.acc; g.lineWidth = 4;
      const pw = w + pu * 86, pr = pw / 2;
      g.beginPath(); g.moveTo(-pr, 0); g.lineTo(-pr, -bodyH); g.arc(0, -bodyH, pr, Math.PI, 0); g.lineTo(pr, 0); g.stroke(); g.restore();
    }
  }
  g.fillStyle = C.pale;
  g.beginPath(); g.moveTo(-r + 12, 0); g.lineTo(-r + 12, -bodyH); g.arc(0, -bodyH, r - 12, Math.PI, 0); g.lineTo(r - 12, 0); g.closePath(); g.fill();
  g.strokeStyle = C.acc; g.lineWidth = 9;
  g.beginPath(); g.moveTo(-r, 0); g.lineTo(-r, -bodyH); g.arc(0, -bodyH, r, Math.PI, 0); g.lineTo(r, 0); g.stroke();
  g.fillStyle = C.acc; g.beginPath(); g.arc(0, -bodyH * .55, 11, 0, Math.PI * 2); g.fill();
  g.restore();
}
function fract(x) { return x - Math.floor(x); }
function channelGlyph(kind, x, y, s = 54, col = C.ink, a = 1) {
  g.save(); g.globalAlpha = a; g.translate(x, y); g.strokeStyle = col; g.fillStyle = C.paper;
  g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 5;
  if (kind === 'emis') {
    g.beginPath(); g.moveTo(0, -s * .38); g.lineTo(s * .52, -s * .14); g.lineTo(0, s * .10); g.lineTo(-s * .52, -s * .14); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-s * .30, .02 * s); g.lineTo(-s * .30, s * .26); g.quadraticCurveTo(0, s * .42, s * .30, s * .26); g.lineTo(s * .30, .02 * s); g.stroke();
  } else if (kind === 'verval') {
    g.beginPath(); g.roundRect(-s * .5, -s * .36, s, s * .72, s * .1); g.fill(); g.stroke();
    g.beginPath(); g.arc(-s * .22, -s * .02, s * .12, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(s * .02, -s * .1); g.lineTo(s * .32, -s * .1); g.moveTo(s * .02, s * .1); g.lineTo(s * .28, s * .1); g.stroke();
  } else {
    g.beginPath(); g.roundRect(-s * .34, -s * .42, s * .76, s * .68, s * .08); g.stroke();
    g.beginPath(); g.roundRect(-s * .46, -s * .28, s * .76, s * .68, s * .08); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-s * .26, -s * .04); g.lineTo(s * .12, -s * .04); g.moveTo(-s * .26, s * .14); g.lineTo(s * .12, s * .14); g.stroke();
  }
  g.restore();
}
function prismGate(x, y, r = 56, pulseU = 0, a = 1) {
  g.save(); g.globalAlpha = a; g.translate(x, y); g.lineJoin = 'round'; g.lineCap = 'round';
  if (pulseU > 0) {
    g.save(); g.globalAlpha = a * (1 - clamp(pulseU)) * .6; g.strokeStyle = C.acc; g.lineWidth = 4.5;
    const pr = r + 34 * clamp(pulseU); g.beginPath(); g.moveTo(0, -pr); g.lineTo(pr * .78, 0); g.lineTo(0, pr); g.lineTo(-pr * .78, 0); g.closePath(); g.stroke(); g.restore();
  }
  g.fillStyle = C.paper; g.strokeStyle = C.acc; g.lineWidth = 7.5;
  g.beginPath(); g.moveTo(0, -r); g.lineTo(r * .78, 0); g.lineTo(0, r); g.lineTo(-r * .78, 0); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = C.acc; g.beginPath(); g.arc(0, 0, r * .22, 0, Math.PI * 2); g.fill();
  g.restore();
}
function shieldPulse(x, y, r = 34, ringU = 0, a = 1) {
  g.save(); g.globalAlpha = a; g.translate(x, y); g.lineJoin = 'round'; g.lineCap = 'round';
  if (ringU > 0 && ringU < 1) {
    g.save(); g.globalAlpha = a * (1 - ringU) * .75; g.strokeStyle = C.acc; g.lineWidth = 5;
    g.beginPath(); g.arc(0, 0, r + 95 * eo(ringU), 0, Math.PI * 2); g.stroke(); g.restore();
  }
  g.fillStyle = C.paper; g.strokeStyle = C.acc; g.lineWidth = 6.5;
  g.beginPath(); g.moveTo(0, -r); g.lineTo(r * .84, -r * .58); g.quadraticCurveTo(r * .84, r * .46, 0, r); g.quadraticCurveTo(-r * .84, r * .46, -r * .84, -r * .58); g.closePath();
  g.fill(); g.stroke();
  g.strokeStyle = C.acc; g.lineWidth = 5;
  g.beginPath(); g.moveTo(-r * .28, 0); g.lineTo(-r * .04, r * .24); g.lineTo(r * .34, -r * .2); g.stroke();
  g.restore();
}
function phoneTracker(x, y, w = 86, h = 152, pulseU = 0, a = 1) {
  g.save(); g.globalAlpha = a; g.translate(x, y); g.lineJoin = 'round'; g.lineCap = 'round';
  g.fillStyle = C.paper; g.strokeStyle = C.ink; g.lineWidth = 6;
  g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, w * .18); g.fill(); g.stroke();
  g.strokeStyle = C.mute; g.lineWidth = 4; g.beginPath(); g.moveTo(-w * .16, -h * .36); g.lineTo(w * .16, -h * .36); g.stroke();
  const barW = w * .56; g.fillStyle = C.wire; g.fillRect(-barW / 2, -h * .04, barW, 8);
  g.fillStyle = C.acc; g.fillRect(-barW / 2, -h * .04, barW * clamp(pulseU), 8);
  g.beginPath(); g.arc(-w * .14, -h * .18, 9, 0, Math.PI * 2); g.fill();
  g.strokeStyle = C.acc; g.lineWidth = 4.5; g.beginPath(); g.moveTo(w * .02, -h * .18); g.lineTo(w * .24, -h * .18); g.stroke();
  g.restore();
}
function orbitalRing(x, y, r = 28, rot = 0, on = 0, a = 1) {
  g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(rot); g.lineCap = 'round';
  g.strokeStyle = mix(C.wire, C.acc, on); g.lineWidth = 6;
  g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 1.45); g.stroke();
  g.beginPath(); g.arc(0, 0, r * .62, Math.PI * .3, Math.PI * 1.3); g.stroke();
  g.fillStyle = mix(C.mute, C.acc, on); g.beginPath(); g.arc(0, 0, 7, 0, Math.PI * 2); g.fill();
  g.restore();
}
function checkBadge(x, y, r = 30, popU = 0, on = 0, a = 1) {
  g.save(); g.globalAlpha = a; g.translate(x, y); g.lineCap = 'round'; g.lineJoin = 'round';
  g.fillStyle = mix(C.paper, C.acc, on); g.strokeStyle = mix(C.wire, C.acc, on); g.lineWidth = 6;
  g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill(); g.stroke();
  const cp = clamp(popU);
  if (cp > .02) {
    g.strokeStyle = C.paper; g.lineWidth = 6; g.beginPath(); g.moveTo(-r * .36, r * .02);
    const p1 = [-r * .08, r * .30], p2 = [r * .40, -r * .26];
    if (cp < .45) { const u = cp / .45; g.lineTo(lerp(-r * .36, p1[0], u), lerp(r * .02, p1[1], u)); }
    else { const u = (cp - .45) / .55; g.lineTo(p1[0], p1[1]); g.lineTo(lerp(p1[0], p2[0], u), lerp(p1[1], p2[1], u)); }
    g.stroke();
  }
  g.restore();
}
function radialProgress(cx, cy, r = 228, frac = 0, ticksU = 0, a = 1) {
  g.save(); g.globalAlpha = a; g.translate(cx, cy); g.lineCap = 'round';
  g.strokeStyle = C.wire; g.lineWidth = 22; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke();
  const f = clamp(frac);
  if (f > .002) {
    g.strokeStyle = C.acc; g.lineWidth = 24;
    g.beginPath(); g.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + f * Math.PI * 2); g.stroke();
  }
  for (let i = 0; i < 24; i++) {
    const th = -Math.PI / 2 + (i / 24) * Math.PI * 2, lit = ss(seg(ticksU, i / 26, i / 26 + .08));
    const r0 = r + 40, r1 = r + (i % 6 === 0 ? 64 : 52);
    g.strokeStyle = mix(C.wire, C.acc, lit); g.lineWidth = i % 6 === 0 ? 5.5 : 3.5;
    g.beginPath(); g.moveTo(Math.cos(th) * r0, Math.sin(th) * r0); g.lineTo(Math.cos(th) * r1, Math.sin(th) * r1); g.stroke();
  }
  g.restore();
}
function monogramWaveBadge(x, y, letter, r = 46, on = 0, pulseU = 0, a = 1) {
  g.save(); g.globalAlpha = a; g.translate(x, y);
  if (pulseU > 0 && pulseU < 1) {
    g.save(); g.globalAlpha = a * (1 - pulseU) * .65; g.strokeStyle = C.acc; g.lineWidth = 4;
    g.beginPath(); g.arc(0, 0, r + 42 * eo(pulseU), 0, Math.PI * 2); g.stroke(); g.restore();
  }
  g.fillStyle = mix(C.paper, C.acc, on); g.strokeStyle = mix(C.wire, C.acc, on); g.lineWidth = 6;
  g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill(); g.stroke();
  g.font = '700 38px Jost'; g.fillStyle = mix(C.mute, C.paper, on); g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(letter, 0, 2);
  g.restore();
}
function star(cx, cy, r, col) {
  g.save(); g.fillStyle = col; g.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
  g.closePath(); g.fill(); g.restore();
}
// ---- text, recorded for readcheck ----
let TXT = null, T_NOW = 0;
function text(s, x, y, { size = 28, w = 500, col = C.ink, align = 'left', track = 0, a = 1, id } = {}) {
  if (a <= 0) return;
  g.save(); g.globalAlpha = clamp(a); g.font = `${w} ${size}px Jost`; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'alphabetic'; g.letterSpacing = track + 'px'; g.fillText(s, x, y);
  if (TXT) {
    const m = g.measureText(s), x0 = align === 'left' ? x : align === 'right' ? x - m.width : x - m.width / 2, t = g.getTransform();
    TXT.push({ id: id || s, text: s, x0: t.a * x0 + t.e, y0: t.d * (y - size * .8) + t.f, x1: t.a * (x0 + m.width) + t.e, y1: t.d * (y + size * .25) + t.f });
  }
  g.restore();
}
// HUD text: slides up and fades in at tin; stays (a cut ends the shot)
function hud(s, x, y, o, tin, dy = 16) {
  const a = eo(seg(T_NOW, tin, tin + .38)); if (a <= 0) return;
  text(s, x, y + dy * (1 - eo(seg(T_NOW, tin, tin + .45))), { ...o, a });
}
function groundWire(x0, x1, y, T, t0 = 0, t1 = .8) {
  const u = eio(seg(T, t0, t1)); if (u <= 0) return;
  g.save(); g.lineCap = 'round'; g.strokeStyle = C.wire; g.lineWidth = 7; g.beginPath(); g.moveTo(x0, y); g.lineTo(lerp(x0, x1, u), y); g.stroke(); g.restore();
}
function pulseOnWire(x0, x1, y, t0, t1, T, tail = 190) {
  const f = seg(T, t0, t1); if (f <= 0 || f >= 1 + tail / Math.abs(x1 - x0)) return;
  const dir = Math.sign(x1 - x0), L = Math.abs(x1 - x0), head = f * L, tl = Math.max(0, head - tail);
  g.save(); g.lineCap = 'round'; g.strokeStyle = C.acc; g.lineWidth = 7; g.beginPath(); g.moveTo(x0 + dir * tl, y); g.lineTo(x0 + dir * Math.min(head, L), y); g.stroke(); g.restore();
}
function node(x, y, on, r = 10, pop = 0) {
  g.beginPath(); g.arc(x, y, r + 5 * pop, 0, Math.PI * 2); g.fillStyle = mix(C.wire, C.acc, on); g.fill();
  if (on < .99) { g.beginPath(); g.arc(x, y, r * .46 * (1 - on), 0, Math.PI * 2); g.fillStyle = C.paper; g.fill(); }
}
