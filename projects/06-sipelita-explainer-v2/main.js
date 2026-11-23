// SI-PELITA Explainer v2 — Low-Poly Isometric Island (9:16 Vertical 1080x1920)
import * as THREE from 'three';
import { clamp, seg, ss, eio, lerp, TAU } from '/core/lib.js';
import { DUR, SHOTS, SKY, shotAt, KEEP_PAIRS } from './story.js';
import { makePost } from './post.js';
import { makeSea } from './sea.js';
import { buildWorld } from './world.js';

const W = 1080, H = 1920;
window.WIDTH = W;
window.HEIGHT = H;
window.DUR = DUR;

const QS = new URLSearchParams(location.search);
const SSAA = +(QS.get('ssaa') ?? 1.5);
const IS_THUMB = QS.get('thumb') === '1';

const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.02;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-6, 6, 10, -10, 1, 1600);
const post = makePost(renderer, scene, camera, W, H, { ssaa: SSAA, aoRadius: .68, aoScale: 1.5, aoThickness: .95 });
post.bloom.strength = .30;
post.bloom.threshold = .94;
post.bloom.radius = .55;

const sea = makeSea(scene);
const world = buildWorld(scene);

// —— Lights ——
const hemi = new THREE.HemisphereLight('#eef6fb', '#c6b89c', 1.12);
scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff6e8', 2.6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.bias = -.0006;
sun.shadow.normalBias = .02;
sun.shadow.radius = 2.5;
Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 120 });
sun.shadow.camera.updateProjectionMatrix();
scene.add(sun, sun.target);

// —— Sky colour interpolation ——
const C = h => new THREE.Color(h);
const SK = SKY.map(k => ({
  t: k[0], zen: C(k[1]), hor: C(k[2]), deep: C(k[3]), shal: C(k[4]),
  sun: C(k[5]), sunI: k[6], hs: C(k[7]), hg: C(k[8]), hI: k[9], el: k[10], az: k[11], night: k[12]
}));

function skyAt(t) {
  const qt = IS_THUMB ? 73.5 : t;
  let i = 0;
  while (i < SK.length - 2 && qt > SK[i + 1].t) i++;
  const a = SK[i], b = SK[i + 1], u = ss(seg(qt, a.t, b.t)), o = {};
  for (const k of ['zen', 'hor', 'deep', 'shal', 'sun', 'hs', 'hg']) o[k] = a[k].clone().lerp(b[k], u);
  for (const k of ['sunI', 'hI', 'el', 'az', 'night']) o[k] = lerp(a[k], b[k], u);
  return o;
}

// —— Orthographic Camera Choreography across 12 Shots ——
const DEG = Math.PI / 180;
let CAM = {};
function cam(t) {
  const sh = shotAt(t);
  const u = seg(t, sh.t0, sh.t1), eu = eio(u);
  let tg = [0, .8, 0], az = 35, el = 30, fh = 16, hzA = .08, hzB = .48, tiltF = .62, tiltB = .28;

  if (IS_THUMB) {
    tg = [0, 1.05, 0.3];
    az = 34;
    el = 31;
    fh = 18.2;
  } else {
    switch (sh.id) {
      case 's01': // Starter Operator Islet & Sinking Chat Cubes
        tg = [lerp(world.OP_POS[0] + .4, world.OP_POS[0] + .9, eu), .65, lerp(world.OP_POS[1] + .2, world.OP_POS[1] + .4, eu)];
        az = lerp(24, 38, u); el = lerp(28, 30, eu); fh = lerp(9.2, 10.4, eu);
        break;
      case 's02': // 3 Disconnected Form Mini-Islets & Retype Block
        tg = [lerp(-4.0, -4.6, eu), .65, lerp(3.4, 3.8, eu)];
        az = lerp(38, 56, u); el = 31; fh = lerp(12.2, 11.0, eu);
        break;
      case 's03': // Central SI-PELITA Island Hub Erasing Gaps & Rising
        tg = [lerp(-1.5, 0.0, eu), lerp(.8, 1.15, eu), lerp(1.6, 0.4, eu)];
        az = lerp(56, 26, eu); el = lerp(32, 30, eu); fh = lerp(17.5, 15.2, eu);
        break;
      case 's04': // East Emerald Dock: EMIS 4.0
        tg = [lerp(1.8, world.EMIS_POS[0] - .2, ss(seg(u, 0, .35))), .95, lerp(0.2, world.EMIS_POS[1] + .2, ss(seg(u, 0, .35)))];
        az = lerp(42, 64, u); el = 29; fh = lerp(11.5, 9.8, eu);
        break;
      case 's05': // South Royal-Blue Dock: Verval PD
        tg = [lerp(world.EMIS_POS[0] * .4, world.VERVAL_POS[0], ss(seg(u, 0, .35))), .95, lerp(1.5, world.VERVAL_POS[1] - .2, ss(seg(u, 0, .35)))];
        az = lerp(22, 8, u); el = 29; fh = lerp(10.8, 9.6, eu);
        break;
      case 's06': // West Amber-Mint Dock: Kolektif Excel & Anti-Ganda
        tg = [lerp(-1.2, world.KOL_POS[0] + .2, ss(seg(u, 0, .35))), .95, lerp(0.5, world.KOL_POS[1] + .2, ss(seg(u, 0, .35)))];
        az = lerp(-24, -46, u); el = 30; fh = lerp(11.4, 10.0, eu);
        break;
      case 's07': // 4-Tier WhatsApp & Ticket Tracking Tower
        tg = [lerp(0.5, world.TOWER_POS[0], ss(seg(u, 0, .3))), lerp(1.2, 1.85, eu), lerp(0.5, world.TOWER_POS[1], ss(seg(u, 0, .3)))];
        az = lerp(18, 36, u); el = lerp(28, 25, eu); fh = lerp(10.6, 9.4, eu);
        break;
      case 's08': // Revision Turntable: Perbaiki Data
        tg = [lerp(0.0, world.TURN_POS[0], ss(seg(u, 0, .3))), 1.35, lerp(0.8, world.TURN_POS[1], ss(seg(u, 0, .3)))];
        az = lerp(-12, -32, u); el = 28; fh = lerp(9.8, 8.8, eu);
        break;
      case 's09': // 24-Hour Night Transition & Rotating Lighthouse Beacon
        tg = [0, lerp(1.6, 1.3, eu), 0];
        az = lerp(15, 52, u); el = lerp(27, 33, eu); fh = lerp(15.5, 18.0, eu);
        break;
      case 's10': // Three 5-Star Anonymous Testimonial Monuments
        tg = [lerp(-1.2, 1.2, eu), 1.35, -2.45];
        az = lerp(162, 198, u); el = 28; fh = lerp(12.2, 12.8, eu);
        break;
      case 's11': // Archipelago Madrasah Se-Kabupaten Banjar
        tg = [0, 1.0, 0];
        az = lerp(20, 44, u); el = lerp(33, 36, eu); fh = lerp(22.0, 26.5, eu);
        break;
      case 's12': // Orthographic Pull-Back & Official End Card
      default:
        tg = [0, lerp(1.0, 0.85, eu), 0];
        az = lerp(44, 58, u); el = lerp(35, 32, eu); fh = lerp(24.0, 29.5, eu);
        break;
    }
  }

  const D = Math.max(300, fh * 3.2), ce = Math.cos(el * DEG);
  camera.position.set(tg[0] + D * ce * Math.sin(az * DEG), tg[1] + D * Math.sin(el * DEG), tg[2] + D * ce * Math.cos(az * DEG));
  camera.up.set(0, 1, 0);
  camera.lookAt(tg[0], tg[1], tg[2]);

  const fw = fh * W / H;
  camera.left = -fw / 2;
  camera.right = fw / 2;
  // Vertical shift: place 3D target (view Y=0) at screen y ~ 710px so 3D subject sits strictly in y <= 1120px
  camera.top = fh * 0.37;
  camera.bottom = -fh * 0.63;
  camera.near = 1;
  camera.far = D + fh * 5 + 800;
  camera.updateProjectionMatrix();

  const cot = 1 / Math.tan(el * DEG);
  post.comp.camDist.value = D;
  post.comp.hz0.value = hzA * fh * cot;
  post.comp.hz1.value = hzB * fh * cot;
  post.tilt.fy.value = tiltF;
  post.tilt.band.value = tiltB;
  CAM = { tg, az, el, fh, id: sh.id };
}

// —— Preload Assets (Official Kemenag Logo & Word-Level Subtitles) ——
const ov = document.getElementById('ov'), g = ov.getContext('2d');
const logoImg = new Image();
logoImg.src = 'assets/logo-kemenag.png';
await new Promise(res => { logoImg.onload = res; logoImg.onerror = res; });

let WORDS_DATA = [];
try {
  const r = await fetch('voice/words.json');
  if (r.ok) WORDS_DATA = await r.json();
} catch (e) {}

// Build semantic subtitle phrases from voice/words.json honoring KEEP_PAIRS
function buildSubtitleCues(shots) {
  const cues = [];
  for (const sh of shots) {
    const ws = sh.words || [];
    if (!ws.length) continue;
    // Merge KEEP_PAIRS into atomic display tokens while keeping individual word timing for active highlight
    const units = [];
    let i = 0;
    while (i < ws.length) {
      if (i + 1 < ws.length) {
        const pairStr = `${ws[i].w} ${ws[i + 1].w}`;
        if (KEEP_PAIRS.has(pairStr)) {
          units.push({ text: pairStr, t0: ws[i].t0, t1: ws[i + 1].t1, subWords: [ws[i], ws[i + 1]] });
          i += 2;
          continue;
        }
      }
      units.push({ text: ws[i].w, t0: ws[i].t0, t1: ws[i].t1, subWords: [ws[i]] });
      i++;
    }
    // Chunk units into phrases of <= 44 chars
    let cur = [], curLen = 0;
    for (const u of units) {
      const uLen = u.text.length;
      if (cur.length && (curLen + 1 + uLen > 42 || (u.t0 - cur[cur.length - 1].t1 > 0.42 && curLen >= 16))) {
        cues.push(cur);
        cur = [u];
        curLen = uLen;
      } else {
        cur.push(u);
        curLen += curLen ? (1 + uLen) : uLen;
      }
    }
    if (cur.length) cues.push(cur);
  }
  return cues.map((grp, idx) => {
    const t0 = grp[0].t0 - 0.04;
    let t1 = Math.max(grp[grp.length - 1].t1 + 0.16, t0 + 0.85);
    if (idx + 1 < cues.length) t1 = Math.min(t1, cues[idx + 1][0].t0 - 0.02);
    // Split into at most 2 balanced lines without breaking any unit (so KEEP_PAIRS never split across lines!)
    const totalTxt = grp.map(u => u.text).join(' ');
    let lines = [grp];
    if (totalTxt.length > 25 && grp.length >= 2) {
      let bestK = 1, bestDiff = 999;
      for (let k = 1; k < grp.length; k++) {
        const l1 = grp.slice(0, k).map(u => u.text).join(' ').length;
        const l2 = grp.slice(k).map(u => u.text).join(' ').length;
        if (Math.abs(l1 - l2) < bestDiff) { bestDiff = Math.abs(l1 - l2); bestK = k; }
      }
      lines = [grp.slice(0, bestK), grp.slice(bestK)];
    }
    return { t0, t1, lines };
  });
}
const SUB_CUES = buildSubtitleCues(WORDS_DATA);

// —— 2D Helper Primitives ——
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function hexIcon(x, y, s, topCol) {
  const P = a => [x + Math.cos(a) * s, y + Math.sin(a) * s * .60];
  const pts = [0, 1, 2, 3, 4, 5].map(i => P(i * Math.PI / 3));
  const dy = s * .55;
  g.save();
  g.fillStyle = '#b88a5e';
  g.beginPath();
  g.moveTo(...pts[0]); g.lineTo(pts[0][0], pts[0][1] + dy);
  g.lineTo(pts[1][0], pts[1][1] + dy); g.lineTo(pts[2][0], pts[2][1] + dy);
  g.lineTo(pts[3][0], pts[3][1] + dy); g.lineTo(...pts[3]);
  g.closePath(); g.fill();
  g.fillStyle = '#9a7048';
  g.beginPath();
  g.moveTo(...pts[0]); g.lineTo(pts[0][0], pts[0][1] + dy);
  g.lineTo(pts[1][0], pts[1][1] + dy); g.lineTo(...pts[1]);
  g.closePath(); g.fill();
  g.fillStyle = topCol;
  g.beginPath();
  pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p));
  g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.28)';
  g.beginPath();
  g.moveTo(x, y); g.lineTo(...pts[3]); g.lineTo(...pts[4]); g.lineTo(...pts[5]);
  g.closePath(); g.fill();
  g.restore();
}

const iconTopAt = t => t < 14.15 ? '#f59e84' : t < 41.85 ? '#68d391' : t < 56.85 ? '#f6ad55' : '#ffd24c';

// —— 2D HUD, In-World Callouts (y <= 1120px), Creative Stylized Subtitles (y: 1170-1325px <= 1360px), & End Card ——
function drawThumbnailHud() {
  // Dedicated 9:16 Cover Poster (?thumb=1)
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, 'rgba(12, 32, 48, 0.58)');
  gr.addColorStop(0.28, 'rgba(12, 32, 48, 0.08)');
  gr.addColorStop(0.68, 'rgba(12, 32, 48, 0.15)');
  gr.addColorStop(1, 'rgba(10, 26, 40, 0.85)');
  g.fillStyle = gr;
  g.fillRect(0, 0, W, H);

  // Top institutional pill with official Kemenag logo
  g.save();
  roundRect(g, 140, 120, 800, 84, 42);
  g.fillStyle = 'rgba(15, 38, 54, 0.86)';
  g.fill();
  g.lineWidth = 2.5;
  g.strokeStyle = 'rgba(255, 210, 76, 0.75)';
  g.stroke();
  if (logoImg.complete && logoImg.naturalWidth) {
    g.drawImage(logoImg, 168, 132, 58, 58);
  }
  g.font = '700 27px "Plus Jakarta Sans"';
  g.fillStyle = '#ffd24c';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.fillText('SEKSI PENMAD · KEMENAG KAB. BANJAR', 244, 162);
  g.restore();

  // Main Poster Title Block (y: 235px - 440px)
  g.save();
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.shadowColor = 'rgba(8, 22, 36, 0.65)';
  g.shadowBlur = 24;
  g.shadowOffsetY = 6;
  g.font = '800 108px "Plus Jakarta Sans"';
  g.fillStyle = '#ffffff';
  g.fillText('SI-PELITA', W / 2, 295);

  g.font = '700 34px "Plus Jakarta Sans"';
  g.fillStyle = '#a7f3d0';
  g.fillText('SISTEM PELAPORAN INFORMASI & DATA', W / 2, 372);
  g.restore();

  // Bottom Feature Trio & Tagline Card (y: 1120px - 1460px on Cover Thumbnail)
  const badges = [
    ['#27ae60', 'EMIS 4.0', 'Salah Tingkat & Reaktivasi'],
    ['#3b82f6', 'VERVAL PD', 'NISN / NIK Ganda Tuntas'],
    ['#f59e0b', 'KOLEKTIF EXCEL', 'Anti-Tiket Ganda · Lacak WA'],
  ];
  badges.forEach(([col, title, desc], i) => {
    const bx = 76 + i * 316, by = 1130, bw = 296, bh = 132;
    g.save();
    roundRect(g, bx, by, bw, bh, 22);
    g.fillStyle = 'rgba(15, 35, 52, 0.88)';
    g.fill();
    g.lineWidth = 2.5;
    g.strokeStyle = col;
    g.stroke();
    hexIcon(bx + 36, by + 44, 16, col);
    g.textAlign = 'left';
    g.font = '800 25px "Plus Jakarta Sans"';
    g.fillStyle = '#ffffff';
    g.fillText(title, bx + 64, by + 46);
    g.font = '600 19px "Quicksand"';
    g.fillStyle = '#cbd5e1';
    g.fillText(desc, bx + 22, by + 94);
    g.restore();
  });

  g.save();
  roundRect(g, 110, 1300, 860, 96, 48);
  g.fillStyle = 'rgba(22, 101, 52, 0.92)';
  g.fill();
  g.lineWidth = 3;
  g.strokeStyle = '#ffd24c';
  g.stroke();
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '800 34px "Plus Jakarta Sans"';
  g.fillStyle = '#ffffff';
  g.fillText('LAPOR GAMPANG · LACAK TENANG · DATA BERES', W / 2, 1348);
  g.restore();
}

function drawInWorldContextPill(t, sh) {
  // Contextual pill anchored at y = 965px..1055px (strictly <= 1120px, right below the 3D island)
  const entryA = sh.id === 's01' ? 1 : ss(seg(t, sh.t0 + 0.08, sh.t0 + 0.38));
  const alpha = entryA * (1 - ss(seg(t, sh.t1 - 0.30, sh.t1)));
  if (alpha <= 0.02) return;

  g.save();
  g.globalAlpha = alpha;
  const cy = 995;

  if (sh.id === 's07') {
    // 4-Status Progress Bar (Baru -> Diterima -> Diproses -> Selesai)
    const steps = ['1. BARU', '2. DITERIMA', '3. DIPROSES', '4. SELESAI'];
    const activeIdx = t < 47.4 ? 0 : t < 48.2 ? 1 : t < 49.0 ? 2 : 3;
    roundRect(g, 64, cy - 42, 952, 84, 24);
    g.fillStyle = 'rgba(15, 34, 50, 0.84)';
    g.fill();
    g.lineWidth = 2;
    g.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    g.stroke();

    steps.forEach((st, i) => {
      const sx = 82 + i * 232, sw = 216;
      const isAct = i <= activeIdx;
      roundRect(g, sx, cy - 28, sw, 56, 16);
      g.fillStyle = i === activeIdx ? '#16a34a' : (isAct ? 'rgba(34, 197, 94, 0.35)' : 'rgba(255, 255, 255, 0.08)');
      g.fill();
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = '700 22px "Plus Jakarta Sans"';
      g.fillStyle = isAct ? '#ffffff' : 'rgba(255, 255, 255, 0.55)';
      g.fillText(st, sx + sw / 2, cy);
    });
  } else if (sh.id === 's09') {
    // 3 Evergreen Metric Pills (Akses 24 Jam | Ratusan Laporan | > 95% Tuntas)
    const metrics = [
      ['24 JAM', 'Akses Kapan Saja', '#ffd24c'],
      ['RATUSAN', 'Laporan Masuk', '#60a5fa'],
      ['> 95%', 'Laporan Tuntas', '#34d399']
    ];
    metrics.forEach(([big, sub, col], i) => {
      const mx = 74 + i * 318, mw = 296;
      roundRect(g, mx, cy - 48, mw, 96, 22);
      g.fillStyle = 'rgba(13, 28, 48, 0.86)';
      g.fill();
      g.lineWidth = 2;
      g.strokeStyle = col;
      g.stroke();
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = '800 32px "Plus Jakarta Sans"';
      g.fillStyle = col;
      g.fillText(big, mx + mw / 2, cy - 14);
      g.font = '600 20px "Quicksand"';
      g.fillStyle = '#f1f5f9';
      g.fillText(sub, mx + mw / 2, cy + 22);
    });
  } else if (sh.id === 's10') {
    // Anonymous 5-Star Testimonial Cards (Operator Madrasah A, B, C)
    const testis = [
      ['Operator Madrasah A', '"Layanan cepat, tak perlu antre chat lagi"'],
      ['Operator Madrasah B', '"Sigap diproses, pantau WA langsung jelas"'],
      ['Operator Madrasah C', '"Praktis tanpa ribet, revisi tinggal klik"']
    ];
    const idx = t < 65.8 ? 0 : t < 67.6 ? 1 : 2;
    const [who, quote] = testis[idx];
    roundRect(g, 110, cy - 52, 860, 104, 26);
    g.fillStyle = 'rgba(15, 36, 54, 0.88)';
    g.fill();
    g.lineWidth = 2.5;
    g.strokeStyle = '#ffd24c';
    g.stroke();
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = '700 24px "Plus Jakarta Sans"';
    g.fillStyle = '#ffd24c';
    g.fillText(`★★★★★  ·  ${who}`, W / 2, cy - 18);
    g.font = '600 25px "Quicksand"';
    g.fillStyle = '#ffffff';
    g.fillText(quote, W / 2, cy + 22);
  } else if (sh.id !== 's12') {
    // Crisp single pill reinforcing the 3D scene action
    const labels = {
      s01: ['Chat Lapor Tenggelam di Grup', '#f87171'],
      s02: ['3 Link Formulir Terpisah · Salah Sedikit Ketik Ulang', '#fb923c'],
      s03: ['Gerbang Satu Pintu · Seksi Penmad Kemenag Banjar', '#34d399'],
      s04: ['Dermaga EMIS 4.0 · Salah Tingkat & Reaktivasi Siswa', '#34d399'],
      s05: ['Dermaga Verval PD · Solusi NISN / NIK Ganda', '#60a5fa'],
      s06: ['Dermaga Kolektif Excel · Otomatis Tolak Tiket Ganda', '#fbbf24'],
      s08: ['Meja Putar Perbaiki Data · Revisi Tanpa Tiket Baru', '#34d399'],
      s11: ['MI · MTs · MA Se-Kabupaten Banjar Terhubung Satu Pintu', '#ffd24c']
    };
    const [txt, col] = labels[sh.id] || [sh.sub, '#68d391'];
    g.font = '700 25px "Plus Jakarta Sans"';
    const tw = g.measureText(txt).width;
    const pw = Math.min(940, tw + 108), px = (W - pw) / 2;
    roundRect(g, px, cy - 34, pw, 68, 34);
    g.fillStyle = 'rgba(15, 34, 50, 0.84)';
    g.fill();
    g.lineWidth = 2;
    g.strokeStyle = col;
    g.stroke();
    hexIcon(px + 38, cy - 3, 14, col);
    g.textAlign = 'left';
    g.textBaseline = 'middle';
    g.fillStyle = '#ffffff';
    g.fillText(txt, px + 68, cy + 1);
  }
  g.restore();
}

function drawStylizedSubtitles(t) {
  // Creative Stylized Subtitles strictly inside y: 1165px - 1325px (y <= 1360px)
  const cue = SUB_CUES.find(c => t >= c.t0 && t < c.t1);
  if (!cue) return;
  const al = ss(seg(t, cue.t0, cue.t0 + 0.14)) * (1 - ss(seg(t, cue.t1 - 0.14, cue.t1)));
  if (al <= 0.01) return;

  g.save();
  g.globalAlpha = al;
  g.font = '700 37px "Quicksand"';
  g.textBaseline = 'middle';

  const lineCount = cue.lines.length;
  const lineH = 48;
  const boxH = lineCount === 1 ? 86 : 134;
  const cy = 1245;
  const boxY = cy - boxH / 2;

  // Measure widest line
  let maxW = 0;
  const lineTokens = cue.lines.map(ln => {
    const items = [];
    let wSum = 0;
    ln.forEach((u, ui) => {
      u.subWords.forEach((sw, si) => {
        const ww = g.measureText(sw.w).width;
        items.push({ w: sw.w, t0: sw.t0, t1: sw.t1, width: ww });
        wSum += ww + 11;
      });
    });
    wSum = Math.max(0, wSum - 11);
    if (wSum > maxW) maxW = wSum;
    return { items, width: wSum };
  });

  const boxW = Math.min(980, Math.max(380, maxW + 132));
  const boxX = (W - boxW) / 2;

  // Editorial rounded backdrop pill
  roundRect(g, boxX, boxY, boxW, boxH, 28);
  g.fillStyle = 'rgba(12, 28, 44, 0.86)';
  g.fill();
  g.lineWidth = 2;
  g.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  g.stroke();

  // Left hexagonal low-poly tile icon synced to time of day
  hexIcon(boxX + 42, cy - 4, 17, iconTopAt(t));

  // Render words with active word highlight & spring lift
  const textCenterX = boxX + 74 + (boxW - 96) / 2;
  lineTokens.forEach((lt, li) => {
    const ly = lineCount === 1 ? cy + 2 : (cy - 23 + li * lineH);
    let curX = textCenterX - lt.width / 2;
    lt.items.forEach(it => {
      const active = t >= it.t0 - 0.04 && t <= it.t1 + 0.12;
      const past = t > it.t1 + 0.12;
      const lift = active ? -4 * Math.sin(clamp((t - it.t0) / Math.max(0.12, it.t1 - it.t0), 0, 1) * Math.PI) : 0;
      g.save();
      g.textAlign = 'left';
      g.shadowColor = 'rgba(8, 16, 28, 0.65)';
      g.shadowBlur = active ? 14 : 8;
      g.shadowOffsetY = 2;
      g.fillStyle = active ? '#ffd86b' : (past ? '#ffffff' : 'rgba(241, 245, 249, 0.85)');
      g.fillText(it.w, curX, ly + lift);
      g.restore();
      curX += it.width + 11;
    });
  });

  g.restore();
}

function hud(t) {
  g.clearRect(0, 0, W, H);
  if (QS.get('nohud')) return;
  if (IS_THUMB) {
    drawThumbnailHud();
    return;
  }

  const sh = shotAt(t);

  // 1. Top Institutional Header & Shot Callout Card (y: 118px - 320px)
  g.save();
  roundRect(g, 170, 114, 740, 68, 34);
  g.fillStyle = 'rgba(14, 34, 50, 0.82)';
  g.fill();
  g.lineWidth = 1.8;
  g.strokeStyle = 'rgba(255, 210, 76, 0.65)';
  g.stroke();
  if (logoImg.complete && logoImg.naturalWidth) {
    g.drawImage(logoImg, 194, 124, 48, 48);
  }
  g.font = '700 23px "Plus Jakarta Sans"';
  g.fillStyle = '#ffd24c';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.fillText('SEKSI PENMAD · KEMENAG KAB. BANJAR', 258, 148);
  g.restore();

  // Dynamic Shot Title Card (y: 198px - 332px)
  if (sh.id !== 's12') {
    const entryA = sh.id === 's01' ? 1 : ss(seg(t, sh.t0, sh.t0 + 0.28));
    const cardAlpha = entryA * (1 - ss(seg(t, sh.t1 - 0.22, sh.t1)));
    const slideY = sh.id === 's01' ? 0 : (1 - ss(seg(t, sh.t0, sh.t0 + 0.32))) * -16;
    g.save();
    g.globalAlpha = Math.max(0.15, cardAlpha);
    roundRect(g, 90, 198 + slideY, 900, 132, 26);
    g.fillStyle = 'rgba(15, 34, 52, 0.78)';
    g.fill();
    g.lineWidth = 2;
    g.strokeStyle = iconTopAt(t);
    g.stroke();

    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = '700 20px "Plus Jakarta Sans"';
    g.fillStyle = iconTopAt(t);
    g.fillText(sh.badge, W / 2, 228 + slideY);

    g.font = '800 38px "Plus Jakarta Sans"';
    g.fillStyle = '#ffffff';
    g.fillText(sh.title, W / 2, 268 + slideY);

    g.font = '600 23px "Quicksand"';
    g.fillStyle = '#dbeafe';
    g.fillText(sh.sub, W / 2, 306 + slideY);
    g.restore();
  }

  // 2. In-World Contextual Status Pill (y ~ 995px, strictly <= 1120px)
  drawInWorldContextPill(t, sh);

  // 3. Official End Card Overlay (s12: t >= 74.70s, positioned at y: 195-380px & y: 920-1105px so 3D island and subtitles stay clear!)
  if (t >= 74.70) {
    const a = ss(seg(t, 74.70, 75.35));
    g.save();
    g.globalAlpha = a;
    // Upper End-Card Hero Banner
    roundRect(g, 80, 196, 920, 188, 30);
    g.fillStyle = 'rgba(12, 32, 48, 0.90)';
    g.fill();
    g.lineWidth = 3;
    g.strokeStyle = '#ffd24c';
    g.stroke();

    if (logoImg.complete && logoImg.naturalWidth) {
      g.drawImage(logoImg, 118, 228, 120, 120);
    }
    g.textAlign = 'left';
    g.textBaseline = 'middle';
    g.font = '800 58px "Plus Jakarta Sans"';
    g.fillStyle = '#ffffff';
    g.fillText('SI-PELITA', 264, 254);

    g.font = '700 26px "Plus Jakarta Sans"';
    g.fillStyle = '#6ee7b7';
    g.fillText('Sistem Pelaporan Informasi dan Data', 264, 304);

    g.font = '600 22px "Quicksand"';
    g.fillStyle = '#fde68a';
    g.fillText('Seksi Pendidikan Madrasah · Kemenag Kabupaten Banjar', 264, 344);

    // Lower End-Card Tagline Banner (at y: 950-1065px, above y=1120px)
    roundRect(g, 110, 955, 860, 102, 51);
    g.fillStyle = 'rgba(22, 101, 52, 0.92)';
    g.fill();
    g.lineWidth = 2.5;
    g.strokeStyle = '#ffd24c';
    g.stroke();
    g.textAlign = 'center';
    g.font = '800 33px "Plus Jakarta Sans"';
    g.fillStyle = '#ffffff';
    g.fillText('Lapor Gampang · Lacak Tenang · Data Beres', W / 2, 1006);
    g.restore();
  }

  // 4. Creative Stylized Subtitles (y: 1178px - 1312px, strictly <= 1360px)
  drawStylizedSubtitles(t);
}

// —— Deterministic Render Entrypoint ——
function render(t = 0) {
  const ct = clamp(Number.isFinite(t) ? t : 0, 0, DUR);
  const sk = skyAt(ct);
  cam(ct);

  const night = sk.night, amp = 1 + night * .32;
  sea.U.uTime.value = ct;
  sea.U.uAmp.value = amp;
  sea.U.uDeep.value.copy(sk.deep);
  sea.U.uShal.value.copy(sk.shal);
  sea.U.uFoam.value.set(night > .5 ? '#9fb0e0' : '#ffffff');

  hemi.color.copy(sk.hs);
  hemi.groundColor.copy(sk.hg);
  hemi.intensity = sk.hI;

  const se = sk.el * DEG, sa = sk.az * DEG;
  sun.color.copy(sk.sun);
  sun.intensity = sk.sunI;
  sun.target.position.set(0, 0, 0);
  sun.position.set(Math.cos(se) * Math.sin(sa) * 60, Math.sin(se) * 60, Math.cos(se) * Math.cos(sa) * 60);

  post.comp.zen.value.copy(sk.zen);
  post.comp.hor.value.copy(sk.hor);
  post.comp.stars.value = ss(seg(night, .3, 1));
  post.comp.starOff.value = CAM.az / 60;
  post.comp.time.value = ct;

  const gd = post.grade;
  gd.sat.value = lerp(1.05, 1.12, night);
  gd.contrast.value = lerp(.06, .12, night);
  gd.lift.value.setRGB(lerp(.016, .012, night), lerp(.016, .016, night), lerp(.022, .042, night));
  gd.vig.value = lerp(.16, .30, night);
  post.bloom.strength = lerp(.22, .48, night);

  {
    const f = new THREE.Vector3();
    camera.getWorldDirection(f);
    const fl = Math.hypot(f.x, f.z) || 1;
    sea.U.uFwd.value.set(f.x / fl, f.z / fl);
    sea.U.uTgt.value.set(CAM.tg[0], CAM.tg[2]);
    sea.U.uSpanF.value = CAM.fh / Math.tan(CAM.el * DEG) * .5;
    sea.U.uNight.value = night;
  }

  const camBack = new THREE.Vector3().subVectors(camera.position, new THREE.Vector3(...CAM.tg)).normalize();
  world.update(ct, { night, amp, sea, thumb: IS_THUMB, px: CAM.fh / H, camBack });
  post.composer.render();
  hud(ct);
}

function events() {
  const ev = world.EVS.slice();
  WORDS_DATA.forEach(s => ev.push({ t: s.t0, type: 'vo', id: s.id, text: s.text }));
  return ev.sort((a, b) => a.t - b.t);
}

window.render = render;
window.EV = events();
window.DBG = { camera, world, post, scene, sun, hemi };

await document.fonts.load('700 37px "Quicksand"');
await document.fonts.load('800 58px "Plus Jakarta Sans"');
await document.fonts.load('700 25px "Plus Jakarta Sans"');

render(parseFloat(QS.get('t') ?? '0'));
window.READY = true;
