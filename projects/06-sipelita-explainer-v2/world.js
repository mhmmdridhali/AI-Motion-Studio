// SI-PELITA Low-Poly Isometric Island World (world.js)
// Flat-shaded hexagonal prism island, Operator Madrasah protagonist, 3 service docks (EMIS 4.0, VervalPD, Kolektif),
// 4-tier WhatsApp/Ticket tracking tower, Perbaiki Data turntable, 24h Lighthouse beacon, 3 anonymous 5-star monuments, and Banjar archipelago.
import * as THREE from 'three';
import { clamp, seg, ss, eio, lerp, hash, TAU } from '/core/lib.js';
import { DUR, BEAT } from './story.js';
import { waveH } from './sea.js';

const SQ3 = Math.sqrt(3);
export const hex2w = (q, r) => [SQ3 * (q + r / 2), 1.5 * r];
const hdist = (q, r) => Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r));

// —— Flat-shaded material cache (no photo textures on 3D meshes) ——
const MC = new Map();
export function mat(hex, o = {}) {
  const k = hex + JSON.stringify(o);
  if (!MC.has(k)) MC.set(k, new THREE.MeshStandardMaterial({ color: hex, flatShading: true, roughness: .86, metalness: 0, ...o }));
  return MC.get(k);
}
const jit = (hex, a) => {
  const c = new THREE.Color(hex), h = {};
  c.getHSL(h);
  c.setHSL(h.h, h.s, clamp(h.l * (1 + a), 0.05, 0.96));
  return '#' + c.getHexString();
};
const M = (g, m, cast = true) => {
  const x = new THREE.Mesh(g, m);
  x.castShadow = cast;
  x.receiveShadow = true;
  return x;
};

export const PAL = {
  sandTop: '#f3dfab', sandSide: '#e0c388',
  grassTop: '#8eches'.replace('eches', 'ec868') || '#8ec868', grassTop2: '#7ab85a',
  emeraldTop: '#2fb878', emeraldDark: '#1d8a56',
  blueTop: '#4a8fd8', blueDark: '#3168a8',
  amberTop: '#f2a84b', amberDark: '#c97e28',
  earth: '#c89a6c', earth2: '#b4865a',
  rockTop: '#b4b9bf', rockSide: '#8d939c', stone: '#dcd8cf',
  cream: '#fbf4e6', cream2: '#f3e8d4',
  roofRed: '#d96048', roofEmerald: '#279e68', roofBlue: '#3f7ac2', roofAmber: '#e0863c',
  pine: ['#3b8a58', '#4c9e64'], leaf: ['#7cc468', '#98d26e', '#6ab05a'], trunk: '#88583a',
  win: '#485870', warm: '#ffc874', wood: '#a8764c', woodDark: '#7a5234',
  redAlert: '#e04848', gold: '#ffd24c'
};
PAL.grassTop = '#8ec868';

// —— Geometry builders (following STYLE.md anti-z-fighting invariants) ——
function hexPrism(r, h, top, side, y0 = -2.4) {
  const g = new THREE.Group();
  const bt = h - .1; // side column stops 0.1 below h to prevent z-fighting with top cap
  const body = M(new THREE.CylinderGeometry(r * .985, r * .985, bt - y0, 6, 1), mat(side));
  body.position.y = (bt + y0) / 2;
  g.add(body);
  const cap = M(new THREE.CylinderGeometry(r, r, .16, 6, 1), mat(top));
  cap.position.y = h - .08;
  g.add(cap);
  return g;
}

function gable(w, d, h, over = .08) {
  const W = w / 2 + over, D = d / 2 + over, g = new THREE.BufferGeometry();
  const v = [
    -W, 0, -D, W, h, 0, W, 0, -D, -W, 0, -D, -W, h, 0, W, h, 0,
    -W, 0, D, W, h, 0, -W, h, 0, -W, 0, D, W, 0, D, W, h, 0,
    -W, 0, -D, W, 0, D, -W, 0, D, -W, 0, -D, W, 0, -D, W, 0, D
  ];
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  g.computeVertexNormals();
  return g;
}

function gableEnds(w, d, h) {
  const W = w / 2, D = d / 2, g = new THREE.BufferGeometry();
  const v = [W, 0, -D, W, h, 0, W, 0, D, -W, 0, D, -W, h, 0, -W, 0, -D];
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  g.computeVertexNormals();
  return g;
}

function makeTree(kind, s) {
  const g = new THREE.Group();
  if (kind === 'pine') {
    const tr = M(new THREE.CylinderGeometry(.06, .08, .3, 5), mat(PAL.trunk)); tr.position.y = .15; g.add(tr);
    const c1 = M(new THREE.ConeGeometry(.35, .6, 6), mat(PAL.pine[0])); c1.position.y = .54; g.add(c1);
    const c2 = M(new THREE.ConeGeometry(.25, .48, 6), mat(PAL.pine[1])); c2.position.y = .9; c2.rotation.y = .5; g.add(c2);
  } else {
    const tr = M(new THREE.CylinderGeometry(.06, .08, .32, 5), mat(PAL.trunk)); tr.position.y = .16; g.add(tr);
    const c = M(new THREE.IcosahedronGeometry(.34, 0), mat(PAL.leaf[Math.floor(s * 3) % 3]));
    c.position.y = .58; c.rotation.set(s * 3, s * 5, 0); g.add(c);
  }
  return g;
}

function makePavilion(w, d, fh, floors, wallHex, roofHex, winMat) {
  const root = new THREE.Group(), parts = [];
  const wallM = mat(wallHex);
  for (let f = 0; f < floors; f++) {
    const fl = new THREE.Group();
    const body = M(new THREE.BoxGeometry(w, fh, d), wallM);
    body.position.y = fh / 2;
    fl.add(body);
    const wg = new THREE.PlaneGeometry(.16, .22);
    for (let s = 0; s < 4; s++) {
      const a = s * Math.PI / 2;
      const span = (s % 2 === 0) ? d : w;
      for (let j = -1; j <= 1; j += 2) {
        const wm = new THREE.Mesh(wg, winMat);
        const off = j * .24;
        wm.position.set(Math.sin(a) * (span / 2 + .005) + Math.cos(a) * off, fh * .56, Math.cos(a) * (span / 2 + .005) - Math.sin(a) * off);
        wm.rotation.y = a;
        fl.add(wm);
      }
    }
    fl.position.y = f * fh;
    root.add(fl);
    parts.push({ obj: fl, y: f * fh, kind: 'floor' });
  }
  const roof = new THREE.Group();
  roof.add(M(gable(w, d, .48), mat(roofHex)));
  roof.add(M(gableEnds(w - .01, d - .01, .48), wallM));
  roof.position.y = floors * fh;
  root.add(roof);
  parts.push({ obj: roof, y: floors * fh, kind: 'roof' });
  return { root, parts, top: floors * fh + .48 };
}

function makeOperatorDesk() {
  const g = new THREE.Group();
  // Wooden desk
  const top = M(new THREE.BoxGeometry(.95, .07, .56), mat(PAL.wood)); top.position.y = .46; g.add(top);
  for (const sx of [-.4, .4]) for (const sz of [-.22, .22]) {
    const leg = M(new THREE.BoxGeometry(.07, .44, .07), mat(PAL.woodDark));
    leg.position.set(sx, .22, sz); g.add(leg);
  }
  // Laptop on desk
  const lBase = M(new THREE.BoxGeometry(.34, .025, .24), mat('#d5dce2')); lBase.position.set(0, .51, .04); g.add(lBase);
  const lScr = M(new THREE.BoxGeometry(.34, .23, .02), mat('#2d3748')); lScr.position.set(0, .62, -.07); lScr.rotation.x = -.22; g.add(lScr);
  const scrMat = new THREE.MeshStandardMaterial({ color: '#90cdf4', emissive: '#63b3ed', emissiveIntensity: 1.2, flatShading: true });
  const lGlow = M(new THREE.PlaneGeometry(.29, .18), scrMat, false);
  lGlow.position.set(0, .62, -.058); lGlow.rotation.x = -.22; g.add(lGlow);

  // Operator Madrasah character sitting behind desk
  const op = new THREE.Group(); op.position.set(0, 0, -.36); g.add(op);
  const torso = M(new THREE.CylinderGeometry(.17, .21, .46, 6), mat('#27875c')); torso.position.y = .42; op.add(torso);
  const collar = M(new THREE.CylinderGeometry(.18, .18, .08, 6), mat('#fbf4e6')); collar.position.y = .63; op.add(collar);
  const headGroup = new THREE.Group(); headGroup.position.set(0, .78, 0); op.add(headGroup);
  const head = M(new THREE.IcosahedronGeometry(.155, 1), mat('#f4c8a4')); headGroup.add(head);
  // Traditional dark-emerald peci cap
  const peci = M(new THREE.CylinderGeometry(.15, .155, .11, 6), mat('#1e293b')); peci.position.y = .12; headGroup.add(peci);
  // Arms reaching toward laptop
  const armL = M(new THREE.BoxGeometry(.08, .28, .08), mat('#27875c')); armL.position.set(-.21, .52, .14); armL.rotation.x = -1.1; op.add(armL);
  const armR = M(new THREE.BoxGeometry(.08, .28, .08), mat('#27875c')); armR.position.set(.21, .52, .14); armR.rotation.x = -1.1; op.add(armR);

  return { g, headGroup, armL, armR, scrMat };
}

function makeLighthouse() {
  const g = new THREE.Group(), rings = [];
  const R = [[.46, .42], [.42, .38], [.38, .34], [.34, .31]], H = .40;
  R.forEach(([rb, rt], i) => {
    const m = M(new THREE.CylinderGeometry(rt, rb, H, 8), mat(i % 2 ? '#279e68' : '#fbf4e6'));
    m.position.y = H / 2;
    const w = new THREE.Group(); w.add(m); w.position.y = i * H; g.add(w);
    rings.push({ obj: w, y: i * H });
  });
  const top = new THREE.Group(); top.position.y = 4 * H;
  const gal = M(new THREE.CylinderGeometry(.42, .42, .06, 8), mat('#3d4250')); gal.position.y = .03; top.add(gal);
  const glassM = new THREE.MeshStandardMaterial({ color: '#fff3cf', emissive: '#ffe2a0', emissiveIntensity: 0, flatShading: true, roughness: .3 });
  const glass = M(new THREE.CylinderGeometry(.24, .24, .32, 8), glassM, false); glass.position.y = .22; top.add(glass);
  const cap = M(new THREE.ConeGeometry(.34, .32, 8), mat('#279e68')); cap.position.y = .54; top.add(cap);
  const ball = M(new THREE.IcosahedronGeometry(.05, 0), mat('#ffd24c')); ball.position.y = .73; top.add(ball);
  g.add(top); rings.push({ obj: top, y: 4 * H, top: true });
  return { g, rings, glassM, lampY: 4 * H + .22 };
}

function beamMats() {
  const cone = new THREE.ShaderMaterial({
    uniforms: { amt: { value: 0 }, len: { value: 55 }, soft: { value: 4.5 }, gain: { value: 1 }, col: { value: new THREE.Color('#fff1c8') } },
    vertexShader: `attribute float across; varying float vA; varying float vX; void main(){ vA = across; vX = position.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: `varying float vA; varying float vX; uniform float amt, len, soft, gain; uniform vec3 col; void main(){ float s = clamp(vX / len, 0., 1.);
      float core = pow(1. - s, 1.7) * .44 + exp(-s * 10.) * .75;
      float dust = .86 + .14 * sin(vX * 1.3) * sin(vX * .37 + 1.7);
      float a = exp(-vA * vA * soft) * core * dust * gain * amt * smoothstep(0., .012, s); gl_FragColor = vec4(col * a, a); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
  return { cone };
}

function makeBoat() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const hg = new THREE.BoxGeometry(.92, .22, .40, 2, 1, 1), p = hg.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    if (x > .28) p.setZ(i, p.getZ(i) * .15);
    if (p.getY(i) < 0) p.setZ(i, p.getZ(i) * .7);
  }
  hg.computeVertexNormals();
  const hull = M(hg, mat('#279e68')); hull.position.y = .1; body.add(hull);
  const rim = M(new THREE.BoxGeometry(.68, .04, .34), mat('#fbf4e6')); rim.position.set(-.08, .22, 0); body.add(rim);
  const mast = M(new THREE.CylinderGeometry(.018, .022, .85, 5), mat(PAL.woodDark)); mast.position.set(-.02, .62, 0); body.add(mast);
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, -.48, 0, 0, 0, .68, 0, 0, 0, 0, 0, .68, 0, -.48, 0, 0], 3));
  sg.computeVertexNormals();
  const sail = M(sg, mat('#fbf6ea', { side: THREE.DoubleSide })); sail.position.set(-.04, .28, 0); body.add(sail);
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(.07, .09, .07), new THREE.MeshStandardMaterial({ color: '#ffe6a8', emissive: '#ffc676', emissiveIntensity: 0, flatShading: true }));
  lamp.position.set(.28, .30, 0); body.add(lamp);
  return { g, body, sail, lamp };
}

// —— Island Layout ——
const REMOVE = new Set(['0,-3', '-3,0', '3,-3', '-1,3']);
function buildLayout() {
  const cells = [];
  for (let q = -3; q <= 3; q++) for (let r = -3; r <= 3; r++) {
    const d = hdist(q, r);
    if (d > 3 || REMOVE.has(q + ',' + r)) continue;
    const [x, z] = hex2w(q, r), key = q + ',' + r, ang = Math.atan2(z, x);
    let type = 'grass', h = .76;
    if (d === 0) { type = 'rock'; h = 1.65; }
    else if (d === 1) { h = 1.12 + (hash(q * 3 + r * 7) * .18); }
    else if (d === 2) { h = .76 + (hash(q * 7 + r * 13) > .5 ? .14 : 0); }
    else { type = 'sand'; h = .38 + hash(q * 3 + r * 5) * .06; }
    cells.push({ q, r, d, x, z, ang, key, type, h });
  }
  return cells;
}
export const CELLS = buildLayout();

export function buildWorld(scene) {
  const W = {};
  const S = new THREE.Group();
  scene.add(S);

  const EVS = [];
  const ev = (t, type, o = {}) => { EVS.push({ t: +t.toFixed(4), type, ...o }); return t; };
  const NOTES = [62, 64, 66, 69, 71, 74, 76, 78, 81];

  const winMat = new THREE.MeshStandardMaterial({ color: PAL.win, emissive: PAL.warm, emissiveIntensity: 0, flatShading: true, roughness: .4 });

  // ============================================================================
  // 1. STARTER OPERATOR ISLET (s01-s02, at [-5.2, 4.2], visible at t=0.0s!)
  // ============================================================================
  const OP_POS = [-5.2, 4.2];
  const opIslet = new THREE.Group();
  opIslet.position.set(OP_POS[0], 0, OP_POS[1]);
  S.add(opIslet);
  const opTileMain = hexPrism(1.18, .55, PAL.sandTop, PAL.sandSide);
  opIslet.add(opTileMain);
  const opTileSub = hexPrism(.75, .42, PAL.rockTop, PAL.rockSide);
  opTileSub.position.set(-.95, 0, -.65);
  opIslet.add(opTileSub);
  const opFoam = new THREE.Mesh(new THREE.RingGeometry(1.18, 1.34, 6, 1, Math.PI / 6), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .35, depthWrite: false }));
  opFoam.rotation.x = -Math.PI / 2; opFoam.position.y = .08; opIslet.add(opFoam);

  const opDesk = makeOperatorDesk();
  opDesk.g.position.set(0, .55, -.05);
  opDesk.g.rotation.y = 0.55;
  opIslet.add(opDesk.g);

  // 5 Sinking Chat-Bubble Cubes (s01: t=0.0s - 6.1s)
  const chatOffsets = [[1.35, .65], [1.85, -.25], [.85, 1.45], [2.15, .95], [1.45, -.95]];
  const chatCubes = chatOffsets.map(([dx, dz], i) => {
    const cg = new THREE.Group();
    const box = M(new THREE.BoxGeometry(.44, .30, .12), mat(i % 2 === 0 ? '#27ae60' : '#2ecc71'));
    const line1 = M(new THREE.BoxGeometry(.28, .05, .13), mat('#ffffff')); line1.position.y = .05;
    const line2 = M(new THREE.BoxGeometry(.18, .05, .13), mat('#d4efdf')); line2.position.set(-.05, -.05, 0);
    cg.add(box, line1, line2);
    S.add(cg);
    const tPop = i === 0 ? -0.35 : (0.25 + i * 0.92);
    const tSink = tPop + 0.95;
    ev(tPop, 'bubble', { note: NOTES[i % 5], v: .72 });
    ev(tSink, 'splash', { note: NOTES[(i + 2) % 5], v: .78 });
    return { g: cg, dx, dz, tPop, tSink };
  });

  // Warning Buoy near starter islet
  const buoy = new THREE.Group();
  const bBase = M(new THREE.CylinderGeometry(.32, .38, .2, 8), mat('#d9544a')); bBase.position.y = .05; buoy.add(bBase);
  const bBand = M(new THREE.CylinderGeometry(.18, .28, .28, 8), mat('#fbf4e6')); bBand.position.y = .28; buoy.add(bBand);
  const bTop = M(new THREE.CylinderGeometry(.06, .18, .3, 8), mat('#d9544a')); bTop.position.y = .56; buoy.add(bTop);
  const buoyLM = new THREE.MeshStandardMaterial({ color: '#ffe8b0', emissive: '#ffcf7a', emissiveIntensity: 1.5, flatShading: true });
  const bLight = M(new THREE.IcosahedronGeometry(.085, 0), buoyLM, false); bLight.position.y = .76; buoy.add(bLight);
  const BUOY_POS = [OP_POS[0] - 1.55, OP_POS[1] + 1.35];
  S.add(buoy);

  // ============================================================================
  // 2. THREE DISCONNECTED FORM MINI-ISLETS & RETYPE BLOCK (s02: 6.1s - 14.15s)
  // ============================================================================
  const splitCoords = [[-2.6, 5.2, '#e0644a'], [-3.0, 2.3, '#4a8fd8'], [-5.4, 1.4, '#e0983c']];
  const splitIslets = splitCoords.map(([x, z, col], i) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g);
    const pr = hexPrism(.74, .52, PAL.sandTop, PAL.sandSide); g.add(pr);
    // Form clipboard pillar
    const board = M(new THREE.BoxGeometry(.42, .56, .10), mat(col)); board.position.y = .80; g.add(board);
    const paper = M(new THREE.BoxGeometry(.32, .42, .12), mat('#ffffff')); paper.position.y = .80; g.add(paper);
    const t0 = 6.35 + i * 0.90;
    ev(t0, 'rise', { note: [64, 62, 59][i], v: .75, n: 1 });
    return { g, x, z, t0 };
  });

  // Unsteady plank bridge between starter islet and split islet 0
  const wobblePlanks = [0, 1, 2].map(i => {
    const p = M(new THREE.BoxGeometry(.46, .06, .24), mat(PAL.wood));
    const f = (i + 1) / 4;
    p.position.set(lerp(OP_POS[0], splitCoords[0][0], f), .48, lerp(OP_POS[1], splitCoords[0][1], f));
    p.rotation.y = Math.atan2(splitCoords[0][0] - OP_POS[0], splitCoords[0][1] - OP_POS[1]);
    S.add(p);
    const t0 = 9.05 + i * 0.48;
    ev(t0, 'plank', { note: 62 - i * 2, v: .68 });
    return { mesh: p, t0 };
  });

  // Red "Ketik Ulang" form block bouncing onto operator desk at t=11.6s & 12.7s
  const retypeBlock = new THREE.Group();
  const rbBox = M(new THREE.BoxGeometry(.42, .14, .32), mat('#e04848'));
  const rbTop = M(new THREE.BoxGeometry(.34, .16, .24), mat('#ffffff'));
  retypeBlock.add(rbBox, rbTop);
  opIslet.add(retypeBlock);
  ev(11.65, 'reject', { note: 57, v: .82 });
  ev(12.75, 'reject', { note: 55, v: .85 });

  // ============================================================================
  // 3. CENTRAL SI-PELITA HEXAGONAL ISLAND HUB (s03: 14.15s - 22.40s)
  // ============================================================================
  const tiles = CELLS.map((c, idx) => {
    const j = (hash(c.q * 17 + c.r * 31) - .5) * .08;
    let top = PAL.grassTop, side = PAL.earth;
    if (c.type === 'sand') { top = PAL.sandTop; side = PAL.sandSide; }
    if (c.type === 'rock') { top = PAL.rockTop; side = PAL.rockSide; }
    if (c.type === 'grass' && hash(c.q * 5 - c.r * 11) > .55) top = PAL.grassTop2;
    const g = hexPrism(1, c.h, jit(top, j), jit(side, j * .7));
    g.position.set(c.x, 0, c.z);
    S.add(g);
    const foam = new THREE.Mesh(new THREE.RingGeometry(.99, 1.13, 6, 1, Math.PI / 6), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false }));
    foam.rotation.x = -Math.PI / 2; foam.position.set(c.x, .07, c.z); S.add(foam);
    // Radial growth schedule from t=14.35s to 18.8s
    const t0 = 14.35 + c.d * 1.05 + hash(idx * 11.3) * 0.65;
    return { c, g, foam, t0 };
  });

  // Emit musical rise events for the 7 radial island growth waves in s03
  for (let w = 0; w < 7; w++) {
    const tw = 14.35 + w * 0.68;
    ev(tw, w === 0 ? 'rise_big' : 'rise', { note: NOTES[w % NOTES.length], v: .82, big: w === 0 ? 1 : 0, n: 4 });
  }

  // Golden Boardwalk Bridge linking Operator Islet to Central Island (t=16.6s)
  const hubBridge = [0, 1, 2, 3].map(i => {
    const g = new THREE.Group();
    const f = (i + 1) / 5;
    const bx = lerp(OP_POS[0], -2.2, f), bz = lerp(OP_POS[1], 1.8, f);
    const pl = M(new THREE.BoxGeometry(.58, .08, .48), mat(i % 2 ? PAL.wood : '#c89664')); pl.position.y = .48; g.add(pl);
    for (const s of [-1, 1]) {
      const post = M(new THREE.CylinderGeometry(.04, .04, .85, 5), mat(PAL.woodDark));
      post.position.set(s * .24, .12, 0); g.add(post);
    }
    g.position.set(bx, 0, bz);
    g.rotation.y = Math.atan2(-2.2 - OP_POS[0], 1.8 - OP_POS[1]);
    S.add(g);
    const t0 = 16.5 + i * 0.25;
    ev(t0, 'plank', { note: NOTES[(i + 2) % NOTES.length], v: .72 });
    return { g, t0 };
  });

  // Central SI-PELITA Satu Pintu Hub Building (on ring-1 cell [0, 1.5])
  const hubPav = makePavilion(1.25, 1.05, .64, 2, PAL.cream, PAL.roofEmerald, winMat);
  hubPav.root.position.set(0, 1.18, 1.45);
  S.add(hubPav.root);
  // Golden "Satu Pintu" Archway in front of Hub Building
  const archGroup = new THREE.Group();
  const archL = M(new THREE.BoxGeometry(.14, .65, .14), mat(PAL.gold)); archL.position.set(-.32, .32, .62);
  const archR = M(new THREE.BoxGeometry(.14, .65, .14), mat(PAL.gold)); archR.position.set(.32, .32, .62);
  const archT = M(new THREE.BoxGeometry(.82, .14, .18), mat(PAL.roofEmerald)); archT.position.set(0, .68, .62);
  archGroup.add(archL, archR, archT);
  hubPav.root.add(archGroup);
  hubPav.parts[0].t0 = 18.20; ev(18.20, 'floor', { note: 62, v: .8 });
  hubPav.parts[1].t0 = 18.95; ev(18.95, 'floor', { note: 66, v: .82 });
  hubPav.parts[2].t0 = 19.70; ev(19.70, 'roof',  { note: 74, v: .88 });

  // Trees around central island (popping in s03 between 20.1s and 21.8s)
  const trees = [];
  CELLS.filter(c => c.d >= 1 && c.d <= 2).forEach((c, i) => {
    if (i % 2 !== 0) return;
    const tr = makeTree(i % 4 === 0 ? 'pine' : 'round', hash(i * 3.7));
    tr.position.set(c.x + (hash(i) - .5) * .45, c.h, c.z + (hash(i + 5) - .5) * .45);
    tr.rotation.y = hash(i * 9) * TAU;
    tr.scale.setScalar(0);
    S.add(tr);
    const t0 = 20.10 + (i % 6) * 0.28;
    if (i < 6) ev(t0, 'pop', { note: NOTES[(i + 3) % NOTES.length], v: .72 });
    trees.push({ g: tr, t0, s: .88 + hash(i * 7) * .24 });
  });

  // ============================================================================
  // 4. DOCK 1: EAST EMERALD DOCK — EMIS 4.0 (s04: 22.40s - 28.95s, at [3.8, -0.8])
  // ============================================================================
  const EMIS_POS = [3.85, -0.85];
  const emisGroup = new THREE.Group();
  emisGroup.position.set(EMIS_POS[0], 0, EMIS_POS[1]);
  S.add(emisGroup);
  const emisBase = hexPrism(1.22, .68, PAL.emeraldTop, PAL.emeraldDark);
  emisGroup.add(emisBase);
  const emisPav = makePavilion(.92, .84, .58, 1, PAL.cream, PAL.roofEmerald, winMat);
  emisPav.root.position.set(-.18, .68, -.15);
  emisPav.root.rotation.y = 0.45;
  emisGroup.add(emisPav.root);
  emisPav.parts[0].t0 = 23.45; ev(23.45, 'floor', { note: 66, v: .78 });
  emisPav.parts[1].t0 = 24.20; ev(24.20, 'roof',  { note: 74, v: .84 });
  ev(22.65, 'rise', { note: 62, v: .80, n: 2 });

  // Student Level Stairs (Salah Tingkat -> Naik Tingkat) + Reactivation Beacon
  const emisStairs = [0, 1, 2].map(i => {
    const h = .22 + i * .18;
    const st = M(new THREE.BoxGeometry(.26, h, .26), mat(i === 2 ? '#2ecc71' : '#d5dce2'));
    st.position.set(.32 + i * .28, .68 + h / 2, .35);
    emisGroup.add(st);
    const t0 = 24.95 + i * 0.55;
    ev(t0, 'wood', { note: 66 + i * 4, v: .75 });
    return { mesh: st, t0, h };
  });
  const studentPawn = new THREE.Group();
  const spBody = M(new THREE.CylinderGeometry(.09, .12, .26, 6), mat('#ffd24c')); spBody.position.y = .13;
  const spHead = M(new THREE.IcosahedronGeometry(.085, 0), mat('#fbf4e6')); spHead.position.y = .32;
  studentPawn.add(spBody, spHead);
  emisGroup.add(studentPawn);
  ev(26.85, 'chime', { note: 78, v: .85 });
  ev(27.75, 'chime', { note: 81, v: .88 });

  // ============================================================================
  // 5. DOCK 2: SOUTH ROYAL-BLUE DOCK — VERVAL PD (s05: 28.95s - 34.45s, at [0.8, 3.9])
  // ============================================================================
  const VERVAL_POS = [0.85, 3.95];
  const vervalGroup = new THREE.Group();
  vervalGroup.position.set(VERVAL_POS[0], 0, VERVAL_POS[1]);
  S.add(vervalGroup);
  const vervalBase = hexPrism(1.22, .68, PAL.blueTop, PAL.blueDark);
  vervalGroup.add(vervalBase);
  const vervalPav = makePavilion(.90, .82, .58, 1, PAL.cream, PAL.roofBlue, winMat);
  vervalPav.root.position.set(0, .68, -.22);
  vervalGroup.add(vervalPav.root);
  ev(29.15, 'rise',  { note: 64, v: .80, n: 2 });
  vervalPav.parts[0].t0 = 29.85; ev(29.85, 'floor', { note: 69, v: .78 });
  vervalPav.parts[1].t0 = 30.55; ev(30.55, 'roof',  { note: 76, v: .84 });

  // Two duplicate NISN/NIK blocks merging into 1 gold-verified block
  const dupCardL = M(new THREE.BoxGeometry(.28, .38, .10), mat('#e05a48'));
  const dupCardR = M(new THREE.BoxGeometry(.28, .38, .10), mat('#f2a84b'));
  const mergedCard = M(new THREE.BoxGeometry(.34, .46, .12), mat('#2ecc71'));
  const mergedBadge = M(new THREE.OctahedronGeometry(.11, 0), mat('#ffd24c'));
  mergedBadge.position.set(0, .32, 0); mergedCard.add(mergedBadge);
  vervalGroup.add(dupCardL, dupCardR, mergedCard);
  ev(31.40, 'wood',  { note: 67, v: .74 });
  ev(32.25, 'clack', { note: 71, v: .78 });
  ev(33.10, 'chime', { note: 78, v: .90 });

  // ============================================================================
  // 6. DOCK 3: WEST AMBER-MINT DOCK — KOLEKTIF EXCEL & ANTI-GANDA (s06: 34.45s - 41.85s, at [-3.6, -1.6])
  // ============================================================================
  const KOL_POS = [-3.65, -1.65];
  const kolGroup = new THREE.Group();
  kolGroup.position.set(KOL_POS[0], 0, KOL_POS[1]);
  S.add(kolGroup);
  const kolBase = hexPrism(1.26, .68, PAL.amberTop, PAL.amberDark);
  kolGroup.add(kolBase);
  ev(34.65, 'rise', { note: 62, v: .82, n: 2 });

  // Cargo barge platform + 3x3 grid of emerald Excel data cubes
  const barge = M(new THREE.BoxGeometry(1.15, .14, 1.15), mat(PAL.woodDark));
  barge.position.set(-.1, .75, -.1);
  kolGroup.add(barge);
  const excelCubes = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const idx = r * 3 + c;
    const cb = M(new THREE.BoxGeometry(.26, .24, .26), mat((r + c) % 2 === 0 ? '#27ae60' : '#2ecc71'));
    const cap = M(new THREE.BoxGeometry(.20, .04, .20), mat('#ffffff')); cap.position.y = .13; cb.add(cap);
    cb.position.set(-.38 + c * .28, .94, -.38 + r * .28);
    kolGroup.add(cb);
    const t0 = 35.45 + idx * 0.36;
    if (idx % 2 === 0) ev(t0, 'wood', { note: NOTES[idx % NOTES.length], v: .74 });
    excelCubes.push({ mesh: cb, t0, baseY: .94 });
  }

  // Anti-duplicate barrier gate + bouncing red duplicate cube (t=39.6s - 41.5s)
  const gatePivot = new THREE.Group();
  gatePivot.position.set(.48, .75, .45);
  const gatePost = M(new THREE.CylinderGeometry(.06, .06, .42, 6), mat('#3d4250')); gatePost.position.y = .21; gatePivot.add(gatePost);
  const gateArm = M(new THREE.BoxGeometry(.75, .07, .07), mat('#e04848')); gateArm.position.set(-.32, .38, 0); gatePivot.add(gateArm);
  kolGroup.add(gatePivot);
  const dupTicketCube = M(new THREE.BoxGeometry(.32, .32, .32), mat('#e04848'));
  kolGroup.add(dupTicketCube);
  ev(39.75, 'clack',  { note: 64, v: .76 });
  ev(40.55, 'reject', { note: 55, v: .92 });

  // ============================================================================
  // 7. 4-TIER WHATSAPP & TICKET TRACKING TOWER (s07: 41.85s - 50.40s, at [1.55, 0.85])
  // ============================================================================
  const TOWER_POS = [1.55, 0.85];
  const towerGroup = new THREE.Group();
  towerGroup.position.set(TOWER_POS[0], 1.15, TOWER_POS[1]);
  S.add(towerGroup);
  const tierColors = ['#f2a84b', '#4a8fd8', '#ffd24c', '#2ecc71'];
  const towerTiers = [0, 1, 2, 3].map(i => {
    const r = .56 - i * .07, h = .42;
    const tg = new THREE.Group();
    const colM = new THREE.MeshStandardMaterial({ color: PAL.cream, emissive: tierColors[i], emissiveIntensity: 0, flatShading: true, roughness: .5 });
    const body = M(new THREE.CylinderGeometry(r * .92, r, h, 6), colM); body.position.y = h / 2; tg.add(body);
    const band = M(new THREE.CylinderGeometry(r * 1.06, r * 1.06, .08, 6), mat(tierColors[i])); band.position.y = h; tg.add(band);
    tg.position.y = i * h;
    towerGroup.add(tg);
    const tRise = 42.10 + i * 0.42;
    const tLit  = 46.90 + i * 0.68;
    ev(tRise, 'stone', { note: 62 + i * 3, v: .78 });
    ev(tLit,  'chime', { note: 69 + i * 3, v: .86 });
    return { g: tg, colM, y: i * h, tRise, tLit };
  });

  // Floating Question Mark / WhatsApp Phone Prism in front of Tracking Tower
  const waPrism = new THREE.Group();
  waPrism.position.set(0, .55, .82);
  const waBody = M(new THREE.BoxGeometry(.42, .56, .12), mat('#25d366'));
  const waScreen = M(new THREE.BoxGeometry(.34, .44, .14), mat('#ffffff'));
  const qBadge = M(new THREE.OctahedronGeometry(.22, 0), mat('#f2a84b'));
  waPrism.add(waBody, waScreen, qBadge);
  towerGroup.add(waPrism);
  ev(45.00, 'pop',   { note: 71, v: .80 });
  ev(46.15, 'chime', { note: 78, v: .88 });

  // ============================================================================
  // 8. REVISION TURNTABLE — "PERBAIKI DATA" (s08: 50.40s - 56.85s, at [-1.55, 0.85])
  // ============================================================================
  const TURN_POS = [-1.55, 0.85];
  const turnGroup = new THREE.Group();
  turnGroup.position.set(TURN_POS[0], 1.15, TURN_POS[1]);
  S.add(turnGroup);
  const turnBase = M(new THREE.CylinderGeometry(.78, .85, .18, 12), mat(PAL.stone)); turnBase.position.y = .09; turnGroup.add(turnBase);
  const turnDisc = new THREE.Group(); turnDisc.position.y = .20; turnGroup.add(turnDisc);
  const discMesh = M(new THREE.CylinderGeometry(.68, .68, .08, 12), mat(PAL.wood)); turnDisc.add(discMesh);
  // Crooked red-corner document on side A, emerald verified document on side B
  const docWrong = new THREE.Group(); docWrong.position.set(0, .28, .28);
  const dwPage = M(new THREE.BoxGeometry(.38, .48, .08), mat('#ffffff'));
  const dwFlag = M(new THREE.BoxGeometry(.18, .18, .10), mat('#e04848')); dwFlag.position.set(.12, .16, 0); dwFlag.rotation.z = .35;
  docWrong.add(dwPage, dwFlag); turnDisc.add(docWrong);

  const docFixed = new THREE.Group(); docFixed.position.set(0, .28, -.28);
  const dfPage = M(new THREE.BoxGeometry(.38, .48, .08), mat('#ffffff'));
  const dfCheck = M(new THREE.BoxGeometry(.24, .24, .10), mat('#2ecc71')); dfCheck.position.set(0, .05, 0);
  const dfGold = M(new THREE.OctahedronGeometry(.12, 0), mat('#ffd24c')); dfGold.position.set(0, .32, 0);
  docFixed.add(dfPage, dfCheck, dfGold); turnDisc.add(docFixed);

  // "Perbaiki Data" mechanical button pillar next to turntable
  const fixBtn = M(new THREE.CylinderGeometry(.24, .26, .28, 6), mat('#2ecc71'));
  fixBtn.position.set(.78, .22, .35);
  turnGroup.add(fixBtn);
  ev(50.70, 'wood',  { note: 64, v: .76 });
  ev(52.45, 'clack', { note: 69, v: .84 });
  ev(53.65, 'stone', { note: 74, v: .85 });
  ev(54.85, 'chime', { note: 81, v: .90 });

  // ============================================================================
  // 9. 24-HOUR LIGHTHOUSE BEACON ON CENTRAL SUMMIT (s09: 56.85s - 63.85s, at [0, 0])
  // ============================================================================
  const centerCell = CELLS.find(c => c.key === '0,0');
  const lh = makeLighthouse();
  lh.g.position.set(0, centerCell.h, 0);
  S.add(lh.g);
  lh.rings.forEach((r, i) => {
    r.t0 = 56.95 + i * 0.36;
    ev(r.t0, i < 4 ? 'ring' : 'ignite', { note: 62 + i * 3, v: .85 });
  });
  const T_IGNITE = 58.65;
  const bm = beamMats();
  const BL = 62;
  const beamGeo = (() => {
    const g = new THREE.BufferGeometry(), P = [], A = [], I = [], NX = 24, NY = 8;
    for (let i = 0; i <= NX; i++) for (let j = 0; j <= NY; j++) {
      const x = BL * Math.pow(i / NX, 1.3), a = j / NY * 2 - 1, w = .3 + x * .1;
      P.push(x, a * w / 2, 0); A.push(a);
    }
    for (let i = 0; i < NX; i++) for (let j = 0; j < NY; j++) {
      const k = i * (NY + 1) + j;
      I.push(k, k + NY + 1, k + 1, k + 1, k + NY + 1, k + NY + 2);
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute('across', new THREE.Float32BufferAttribute(A, 1));
    g.setIndex(I);
    return g;
  })();
  const beam = new THREE.Mesh(beamGeo, bm.cone);
  beam.position.set(0, centerCell.h + lh.lampY, 0);
  beam.renderOrder = 5;
  S.add(beam);
  const haloMat = bm.cone.clone(); haloMat.uniforms.soft.value = 2.2; haloMat.uniforms.gain.value = .32;
  const halo = new THREE.Mesh(beamGeo, haloMat); halo.scale.set(1, 2.4, 1); beam.add(halo); halo.renderOrder = 5;
  const spot = new THREE.SpotLight('#fff0cc', 0, 55, .22, .6, 1.2); spot.position.copy(beam.position); S.add(spot, spot.target);
  const lampLight = new THREE.PointLight('#ffe2a0', 0, 10, 1.5); lampLight.position.copy(beam.position); S.add(lampLight);

  // Beam sweeps & night window chimes during s09
  for (let b = 0; b < 6; b++) {
    ev(59.0 + b * 0.78, 'beamhit', { note: NOTES[(b + 2) % NOTES.length], v: .82 });
  }

  // ============================================================================
  // 10. THREE 5-STAR ANONYMOUS TESTIMONIAL MONUMENTS (s10: 63.85s - 69.85s)
  // ============================================================================
  const testiCoords = [[-2.35, -2.35, PAL.roofEmerald], [0.0, -3.15, PAL.roofBlue], [2.35, -2.35, PAL.roofAmber]];
  const testiMonuments = testiCoords.map(([x, z, rCol], idx) => {
    const g = new THREE.Group(); g.position.set(x, .82, z); S.add(g);
    const pav = makePavilion(.84, .76, .54, 1, PAL.cream, rCol, winMat);
    g.add(pav.root);
    const t0 = 64.05 + idx * 1.55;
    pav.parts[0].t0 = t0;       ev(t0, 'floor', { note: 66 + idx * 3, v: .80 });
    pav.parts[1].t0 = t0 + .35; ev(t0 + .35, 'roof', { note: 74 + idx * 2, v: .84 });
    // 5 Golden Low-Poly Stars arching above each monument
    const stars = [-2, -1, 0, 1, 2].map((k, si) => {
      const st = M(new THREE.OctahedronGeometry(.11, 0), mat('#ffd24c'));
      st.position.set(k * .22, 1.32 + (2 - Math.abs(k)) * .08, 0);
      g.add(st);
      const ts = t0 + 0.55 + si * 0.14;
      if (si === 0 || si === 4) ev(ts, 'star', { note: 76 + si, v: .85 });
      return { mesh: st, t0: ts };
    });
    return { g, pav, stars, t0 };
  });

  // ============================================================================
  // 11. ARCHIPELAGO MADRASAH SE-KABUPATEN BANJAR & BOAT (s11-s12: 69.85s - 81.85s)
  // ============================================================================
  const archAngles = [0.35, 1.25, 2.25, 3.45, 4.45, 5.45];
  const archIslets = archAngles.map((ang, i) => {
    const rad = 8.4 + (i % 2) * 1.4;
    const x = Math.cos(ang) * rad, z = Math.sin(ang) * rad;
    const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g);
    const col = hexPrism(1.05, .62, i % 2 === 0 ? PAL.grassTop : PAL.sandTop, PAL.earth);
    g.add(col);
    const miniH = makePavilion(.68, .62, .48, 1, PAL.cream, [PAL.roofEmerald, PAL.roofBlue, PAL.roofAmber][i % 3], winMat);
    miniH.root.position.y = .62;
    g.add(miniH.root);
    const t0 = 70.05 + i * 0.58;
    miniH.parts[0].t0 = t0 + .2;
    miniH.parts[1].t0 = t0 + .4;
    ev(t0, 'rise', { note: NOTES[i % NOTES.length], v: .78, n: 2 });
    return { g, x, z, miniH, t0 };
  });

  const boat = makeBoat();
  S.add(boat.g);

  // Seagulls circling in daylight
  const gulls = [0, 1, 2].map(i => {
    const g = new THREE.Group(), wm = mat('#fbfbf6', { side: THREE.DoubleSide });
    const wg = new THREE.BufferGeometry();
    wg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -.06, 0, 0, .06, .34, 0, 0], 3));
    wg.computeVertexNormals();
    const L = new THREE.Mesh(wg, wm), R = new THREE.Mesh(wg, wm); R.scale.x = -1;
    const body = M(new THREE.ConeGeometry(.045, .26, 4), mat('#f4f4ee')); body.rotation.x = Math.PI / 2;
    g.add(L, R, body); S.add(g);
    return { g, L, R, ph: i * 2.1, rad: 4.8 + i * 1.4, hgt: 3.4 + i * .6, sp: .55 - i * .08 };
  });

  // Water droplet splash InstancedMesh
  const DROP_N = 12;
  const dropMesh = new THREE.InstancedMesh(new THREE.TetrahedronGeometry(.09, 0), new THREE.MeshBasicMaterial({ color: '#f4fdff' }), (tiles.length + 16) * DROP_N);
  dropMesh.castShadow = false; dropMesh.frustumCulled = false; S.add(dropMesh);

  // —— Per-Frame Deterministic Update ——
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
  const dropY = (s, h0 = 2.2, dur = .24) => {
    if (s < -dur) return null;
    if (s < 0) { const u = 1 + s / dur; return { y: h0 * (1 - u * u), sy: 1 + .12 * u }; }
    return { y: Math.abs(Math.sin(s * 14)) * Math.exp(-s * 8.5) * .20, sy: 1 - .15 * Math.exp(-s * 11) * Math.cos(s * 24) };
  };
  const popS = s => s < 0 ? 0 : s > 1.2 ? 1 : 1 - Math.exp(-s * 9) * Math.cos(s * 17);

  W.update = (t, ctx) => {
    const night = ctx.night, amp = ctx.amp, thumb = !!ctx.thumb;
    // In thumbnail mode (?thumb=1), evaluate world at t=73.5s with full island + Docks + Tower + Lighthouse visible
    const wt = thumb ? 73.5 : t;
    let di = 0;
    const blobs = [[OP_POS[0], OP_POS[1], 3.2, 0.95]];

    // 1. Starter Operator Islet & Character animation
    const frustrated = wt < 14.15;
    opDesk.headGroup.rotation.z = frustrated ? Math.sin(wt * 4.5) * 0.18 : 0;
    opDesk.headGroup.rotation.x = frustrated ? 0.22 + Math.sin(wt * 2.5) * 0.08 : -0.08 + Math.sin(wt * 3.2) * 0.06;
    opDesk.armL.rotation.x = -1.1 + Math.sin(wt * 9) * 0.14;
    opDesk.armR.rotation.x = -1.1 + Math.cos(wt * 9) * 0.14;
    opDesk.scrMat.emissive.set(frustrated ? '#fc8181' : '#4fd1c5');

    // Warning buoy bobbing
    {
      const bx = BUOY_POS[0], bz = BUOY_POS[1];
      const wy = waveH(bx, bz, wt, amp);
      buoy.position.set(bx, wy - .06, bz);
      buoy.rotation.set(Math.sin(wt * 2.1) * .12, 0, Math.cos(wt * 1.8) * .12);
      buoyLM.emissiveIntensity = 1.2 + 1.8 * Math.max(0, Math.sin(wt * 4.2));
    }

    // Sinking Chat Cubes (s01)
    chatCubes.forEach((cc, i) => {
      if (wt < cc.tPop || wt > 14.5) { cc.g.visible = false; return; }
      cc.g.visible = true;
      const u = clamp((wt - cc.tPop) / (cc.tSink - cc.tPop), 0, 1);
      const sx = OP_POS[0] + cc.dx * u, sz = OP_POS[1] + cc.dz * u;
      const sinkDepth = wt > cc.tSink ? (wt - cc.tSink) * 1.45 : 0;
      const arcY = (1 - u) * 1.15 + Math.sin(u * Math.PI) * 0.65 - sinkDepth;
      cc.g.position.set(sx, Math.max(-1.6, arcY), sz);
      cc.g.rotation.set(wt * 1.8 + i, wt * 1.2, Math.sin(wt * 3 + i) * .3);
      if (arcY <= -1.4) cc.g.visible = false;
      // Droplet splash when chat cube hits water
      const ss_ = wt - cc.tSink;
      if (ss_ > 0 && ss_ < 0.75) {
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * TAU + i;
          const yy = 2.4 * ss_ - 7.5 * ss_ * ss_;
          if (yy < 0) continue;
          _v.set(sx + Math.cos(a) * (.2 + ss_ * 1.1), yy, sz + Math.sin(a) * (.2 + ss_ * 1.1));
          _q.identity(); _s.setScalar(.85 - ss_);
          dropMesh.setMatrixAt(di++, _m.compose(_v, _q, _s));
        }
      }
    });

    // 2. Disconnected Form Mini-Islets & Wobble Planks (s02)
    splitIslets.forEach(si => {
      const s = wt - si.t0;
      if (s < -.4 || wt > 18.0) { si.g.visible = false; return; }
      si.g.visible = true;
      const fadeOut = wt > 14.5 ? clamp((wt - 14.5) / 1.5, 0, 1) : 0;
      const y = (s < 0 ? -2.2 * (1 - Math.pow(1 + s / .4, 3)) : Math.sin(s * 12) * Math.exp(-s * 6) * .16) - fadeOut * 2.4;
      si.g.position.y = y;
      blobs.push([si.x, si.z, 1.8, (1 - fadeOut) * .75]);
    });
    wobblePlanks.forEach((wp, i) => {
      const s = wt - wp.t0;
      if (s < -.2 || wt > 14.5) { wp.mesh.visible = false; return; }
      wp.mesh.visible = true;
      const fall = wt > 10.6 + i * .15 ? Math.min(1.8, (wt - (10.6 + i * .15)) * 2.2) : 0;
      wp.mesh.position.y = .48 - fall;
      wp.mesh.rotation.z = Math.sin(wt * 8 + i) * .22 + fall * .8;
    });
    // Retype block bouncing on operator desk (t=11.5s - 14.1s)
    if (wt >= 11.45 && wt < 14.2) {
      retypeBlock.visible = true;
      const b1 = Math.max(0, wt - 11.65), b2 = Math.max(0, wt - 12.75);
      const jump = Math.abs(Math.sin(b1 * 10)) * Math.exp(-b1 * 3.5) * .45 + Math.abs(Math.sin(b2 * 10)) * Math.exp(-b2 * 3.5) * .55;
      retypeBlock.position.set(0, .64 + jump, .08);
      retypeBlock.rotation.y = wt * 2.4;
    } else {
      retypeBlock.visible = false;
    }

    // 3. Central SI-PELITA Hexagonal Island Tiles (s03+)
    tiles.forEach((T0, i) => {
      const s = wt - T0.t0, c = T0.c;
      if (s < -.5) { T0.g.visible = false; T0.foam.visible = false; return; }
      T0.g.visible = true;
      const dep = c.h + 2.5;
      const y = s < 0 ? -dep * (1 - Math.pow(1 + s / .5, 3)) : Math.sin(s * 13) * Math.exp(-s * 7) * .18;
      T0.g.position.y = y;
      blobs.push([c.x, c.z, 2.5, clamp((s + .3) / .6, 0, 1)]);
      T0.foam.visible = s > -.1;
      T0.foam.material.opacity = .32 * clamp((s + .1) / .5, 0, 1) * (.7 + .3 * Math.sin(wt * 1.7 + i)) * (1 - .4 * night);
      const ss_ = s + .12;
      if (ss_ > 0 && ss_ < .85) {
        for (let k = 0; k < DROP_N; k++) {
          const a = (k / DROP_N) * TAU + hash(i * 31 + k), sp = 1.5 + hash(k * 7 + i) * 1.5, vy = 3.0 + hash(k * 3 + i * 5) * 2.2;
          const yy = vy * ss_ - 9.8 * ss_ * ss_ / 1.3;
          if (yy < -.1) continue;
          _v.set(c.x + Math.cos(a) * (.9 + sp * ss_), yy, c.z + Math.sin(a) * (.9 + sp * ss_));
          _e.set(ss_ * 9 + k, ss_ * 7, 0); _q.setFromEuler(_e); _s.setScalar(1 - ss_ / 1.0);
          dropMesh.setMatrixAt(di++, _m.compose(_v, _q, _s));
        }
      }
    });

    hubBridge.forEach(hb => {
      const d = dropY(wt - hb.t0, 1.5);
      hb.g.visible = !!d;
      if (d) hb.g.position.y = d.y;
    });

    // Central Hub Building & Trees
    const animPav = (pav) => {
      pav.root.visible = wt > pav.parts[0].t0 - .28;
      pav.parts.forEach(p => {
        const d = dropY(wt - p.t0);
        if (!d) { p.obj.visible = false; return; }
        p.obj.visible = true;
        p.obj.position.y = p.y + d.y;
        p.obj.scale.set(1 / Math.sqrt(d.sy), d.sy, 1 / Math.sqrt(d.sy));
      });
    };
    animPav(hubPav);
    trees.forEach(tr => {
      const sc = popS(wt - tr.t0) * tr.s;
      tr.g.scale.setScalar(sc);
      tr.g.visible = sc > 0.01;
    });

    // 4. Dock 1: EMIS 4.0 (s04: t >= 22.3s)
    {
      const s = wt - 22.55;
      emisGroup.visible = s > -.45;
      if (emisGroup.visible) {
        emisGroup.position.y = s < 0 ? -2.4 * (1 - Math.pow(1 + s / .45, 3)) : Math.sin(s * 12) * Math.exp(-s * 6.5) * .16;
        blobs.push([EMIS_POS[0], EMIS_POS[1], 2.8, clamp((s + .2) / .5, 0, 1)]);
        animPav(emisPav);
        emisStairs.forEach(st => {
          const sc = popS(wt - st.t0);
          st.mesh.scale.setScalar(sc);
          st.mesh.visible = sc > 0.01;
        });
        // Student pawn hops from stair 0 -> 1 -> 2 between t=25.5s and 27.6s
        studentPawn.visible = wt >= 25.3;
        if (studentPawn.visible) {
          const stepU = clamp((wt - 25.6) / 1.8, 0, 1) * 2;
          const idx = Math.min(2, Math.floor(stepU)), frac = stepU - idx;
          const x = .32 + stepU * .28;
          const baseH = .68 + (.22 + stepU * .18);
          const hop = Math.sin(frac * Math.PI) * .28;
          studentPawn.position.set(x, baseH + hop, .35);
        }
      }
    }

    // 5. Dock 2: Verval PD (s05: t >= 28.9s)
    {
      const s = wt - 29.10;
      vervalGroup.visible = s > -.45;
      if (vervalGroup.visible) {
        vervalGroup.position.y = s < 0 ? -2.4 * (1 - Math.pow(1 + s / .45, 3)) : Math.sin(s * 12) * Math.exp(-s * 6.5) * .16;
        blobs.push([VERVAL_POS[0], VERVAL_POS[1], 2.8, clamp((s + .2) / .5, 0, 1)]);
        animPav(vervalPav);
        const mergeU = clamp((wt - 31.1) / 1.8, 0, 1);
        const merged = wt >= 32.9;
        dupCardL.visible = wt >= 30.9 && !merged;
        dupCardR.visible = wt >= 31.1 && !merged;
        dupCardL.position.set(lerp(-.55, -.08, eio(mergeU)), .95, .42);
        dupCardR.position.set(lerp(.55, .08, eio(mergeU)), .95, .42);
        mergedCard.visible = merged;
        if (merged) {
          const sc = popS(wt - 32.9);
          mergedCard.scale.setScalar(sc);
          mergedCard.position.set(0, .98 + Math.sin(wt * 3.5) * .05, .42);
          mergedCard.rotation.y = Math.sin(wt * 2.2) * .25;
        }
      }
    }

    // 6. Dock 3: Kolektif Excel & Anti-Tiket Ganda (s06: t >= 34.4s)
    {
      const s = wt - 34.65;
      kolGroup.visible = s > -.45;
      if (kolGroup.visible) {
        kolGroup.position.y = s < 0 ? -2.4 * (1 - Math.pow(1 + s / .45, 3)) : Math.sin(s * 12) * Math.exp(-s * 6.5) * .16;
        blobs.push([KOL_POS[0], KOL_POS[1], 2.8, clamp((s + .2) / .5, 0, 1)]);
        excelCubes.forEach(ec => {
          const d = dropY(wt - ec.t0, 1.4, .20);
          ec.mesh.visible = !!d;
          if (d) ec.mesh.position.y = ec.baseY + d.y;
        });
        // Gate arm drops at t=40.2s to block duplicate cube
        const blockU = ss(seg(wt, 39.9, 40.35)) * (1 - ss(seg(wt, 41.5, 42.0)));
        gateArm.rotation.z = lerp(1.15, 0, blockU);
        // Duplicate ticket cube approaches from z=1.35 and bounces back at t=40.55s
        if (wt >= 39.4 && wt < 41.75) {
          dupTicketCube.visible = true;
          if (wt < 40.55) {
            const u = seg(wt, 39.4, 40.55);
            dupTicketCube.position.set(.20, .92, lerp(1.35, .58, u));
            dupTicketCube.rotation.set(0, 0, 0);
          } else {
            const b = wt - 40.55;
            dupTicketCube.position.set(.20 + b * .45, .92 + Math.sin(b * 9) * .45 - b * b * 1.8, .58 + b * 1.35);
            dupTicketCube.rotation.set(b * 8, b * 5, b * 6);
          }
        } else {
          dupTicketCube.visible = false;
        }
      }
    }

    // 7. 4-Tier Tracking Tower & WhatsApp Prism (s07: t >= 41.8s)
    towerGroup.visible = wt >= 41.85;
    if (towerGroup.visible) {
      towerTiers.forEach(tr => {
        const d = dropY(wt - tr.tRise, 1.8);
        tr.g.visible = !!d;
        if (d) { tr.g.position.y = tr.y + d.y; tr.g.scale.y = d.sy; }
        const lit = ss(seg(wt, tr.tLit - .05, tr.tLit + .20));
        tr.colM.emissiveIntensity = lit * (1.2 + night * .8);
      });
      waPrism.visible = wt >= 44.7;
      if (waPrism.visible) {
        const isWA = wt >= 46.1;
        qBadge.visible = !isWA;
        waBody.visible = waScreen.visible = isWA;
        waPrism.scale.setScalar(popS(wt - (isWA ? 46.1 : 44.7)));
        waPrism.position.y = .58 + Math.sin(wt * 3.8) * .06;
        waPrism.rotation.y = Math.sin(wt * 2.5) * .22;
      }
    }

    // 8. Revision Turntable "Perbaiki Data" (s08: t >= 50.3s)
    turnGroup.visible = wt >= 50.35;
    if (turnGroup.visible) {
      turnGroup.scale.setScalar(popS(wt - 50.4));
      const press = ss(seg(wt, 52.3, 52.55)) * (1 - ss(seg(wt, 52.7, 53.0)));
      fixBtn.position.y = .22 - press * .10;
      const spinU = eio(seg(wt, 53.4, 54.4));
      turnDisc.rotation.y = spinU * Math.PI;
    }

    // 9. 24-Hour Lighthouse & Volumetric Beam (s09: t >= 56.8s)
    lh.rings.forEach(r => {
      const d = dropY(wt - r.t0, 2.2);
      r.obj.visible = !!d;
      if (d) { r.obj.position.y = r.y + d.y; r.obj.scale.y = d.sy; }
    });
    const ig = (wt >= T_IGNITE && !thumb) ? 1 : 0;
    const beamAmt = ig * ss(seg(wt, T_IGNITE, T_IGNITE + .3)) * (0.25 + 0.75 * night);
    lh.glassM.emissiveIntensity = thumb ? 1.8 : (ig * (1.6 + night * 2.4));
    const phi = (wt - T_IGNITE) * 1.45;
    beam.visible = beamAmt > 0.02;
    {
      const X = new THREE.Vector3(Math.cos(phi) * .993, -.12, Math.sin(phi) * .993);
      const Z = ctx.camBack.clone(); Z.addScaledVector(X, -Z.dot(X)).normalize();
      const Y = new THREE.Vector3().crossVectors(Z, X);
      beam.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
    }
    bm.cone.uniforms.amt.value = beamAmt;
    haloMat.uniforms.amt.value = beamAmt;
    ctx.sea.U.uBeam.value.set(phi, beamAmt * 1.15, .09, 55);
    spot.intensity = beamAmt * 75;
    spot.target.position.set(Math.cos(phi) * 18, 0, Math.sin(phi) * 18);
    lampLight.intensity = beamAmt * 6;

    // Warm window glow across all buildings at dusk/night
    winMat.emissiveIntensity = lerp(0.15, 2.2, night);

    // 10. Three 5-Star Testimonial Monuments (s10: t >= 63.8s)
    testiMonuments.forEach(tm => {
      tm.g.visible = wt >= tm.t0 - .3;
      if (!tm.g.visible) return;
      animPav(tm.pav);
      tm.stars.forEach((st, si) => {
        const sc = popS(wt - st.t0);
        st.mesh.scale.setScalar(sc);
        st.mesh.visible = sc > 0.01;
        st.mesh.rotation.y = wt * 2.2 + si * .6;
      });
    });

    // 11. Archipelago Madrasah Islets & Boat (s11-s12: t >= 69.8s)
    archIslets.forEach(ai => {
      const s = wt - ai.t0;
      ai.g.visible = s > -.45;
      if (!ai.g.visible) return;
      ai.g.position.y = s < 0 ? -2.2 * (1 - Math.pow(1 + s / .45, 3)) : Math.sin(s * 11) * Math.exp(-s * 6) * .15;
      blobs.push([ai.x, ai.z, 2.2, clamp((s + .2) / .5, 0, 1)]);
      animPav(ai.miniH);
    });

    // Sailboat orbiting harbour from s03 onward
    boat.g.visible = wt >= 17.5;
    if (boat.g.visible) {
      const bAng = (wt - 17.5) * 0.24 + 0.8;
      const bRad = 5.6 + Math.sin(wt * 0.35) * 0.6;
      const bx = Math.cos(bAng) * bRad, bz = Math.sin(bAng) * bRad;
      const wy = waveH(bx, bz, wt, amp);
      boat.g.position.set(bx, wy + .02, bz);
      boat.g.rotation.set(0, -bAng - Math.PI / 2, 0);
      boat.body.rotation.set(Math.sin(wt * 2.1) * .08 * amp, 0, Math.sin(wt * 1.7 + 1) * .06 * amp);
      boat.lamp.material.emissiveIntensity = night * 2.4;
    }

    // Gulls flying in daylight
    gulls.forEach(G => {
      const vis = wt > 15.0 && night < 0.5;
      G.g.visible = vis;
      if (!vis) return;
      const a = G.ph + wt * G.sp;
      G.g.position.set(Math.cos(a) * G.rad, G.hgt + Math.sin(wt * 1.3 + G.ph) * .25, Math.sin(a) * G.rad);
      G.g.rotation.set(0, -a, Math.sin(wt * 1.1 + G.ph) * .22);
      const f = Math.sin(wt * 9 + G.ph * 3) * .52;
      G.L.rotation.z = f; G.R.rotation.z = -f;
    });

    dropMesh.count = di;
    dropMesh.instanceMatrix.needsUpdate = true;
    ctx.sea.drawShallow(blobs);
  };

  Object.assign(W, { S, tiles, EVS, OP_POS, EMIS_POS, VERVAL_POS, KOL_POS, TOWER_POS, TURN_POS });
  return W;
}
