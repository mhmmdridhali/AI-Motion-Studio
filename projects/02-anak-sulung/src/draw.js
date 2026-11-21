// Separation canvas drawing helpers for Risograph print (W=1080, H=1920)
// Channel R = Navy Blue plate, Channel G = Terracotta plate, Channel B = Gold plate
export const W = 1080, H = 1920;
export const plate = document.createElement('canvas');
plate.width = W; plate.height = H;
const G0 = plate.getContext('2d', { alpha: false, willReadFrequently: false });
export let g = G0;

// Character & element layer with paper-white knockout halo
const layerC = document.createElement('canvas'); layerC.width = W; layerC.height = H;
const LG = layerC.getContext('2d');
export function layer(fn, halo = 6) {
  LG.setTransform(1, 0, 0, 1, 0, 0); LG.globalCompositeOperation = 'source-over'; LG.clearRect(0, 0, W, H);
  const prev = g; LG.setTransform(prev.getTransform()); g = LG;
  try { fn(); } finally { g = prev; }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  if (halo > 0) {
    g.filter = 'brightness(0)'; // paper knockout halo (0 ink)
    const n = 12;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2;
      g.drawImage(layerC, Math.cos(a) * halo, Math.sin(a) * halo);
    }
    g.filter = 'none';
  }
  g.drawImage(layerC, 0, 0);
  g.restore();
}

const c255 = v => Math.round(Math.max(0, Math.min(1, v)) * 255);
// b = navy (R), r = terracotta (G), y = gold (B)
export const ink = (b = 0, r = 0, y = 0) => `rgb(${c255(b)},${c255(r)},${c255(y)})`;
export const inkA = a => ink(a[0], a[1], a[2]);
export const PAPERINK = 'rgb(0,0,0)';

export function clear(c = [0, 0, 0]) {
  g.globalCompositeOperation = 'source-over';
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = inkA(c);
  g.fillRect(0, 0, W, H);
}

export function over(fn) {
  const o = g.globalCompositeOperation;
  g.globalCompositeOperation = 'lighter';
  fn();
  g.globalCompositeOperation = o;
}

export function fill(c) {
  g.fillStyle = Array.isArray(c) ? inkA(c) : c;
  g.fill();
}

export function circle(x, y, r, c) {
  g.beginPath();
  g.arc(x, y, Math.max(0.01, r), 0, Math.PI * 2);
  fill(c);
}

export function ring(x, y, r, w, c) {
  g.beginPath();
  g.arc(x, y, Math.max(0.01, r), 0, Math.PI * 2);
  g.lineWidth = w;
  g.strokeStyle = Array.isArray(c) ? inkA(c) : c;
  g.stroke();
}

export function ellipse(x, y, rx, ry, rot, c) {
  g.beginPath();
  g.ellipse(x, y, Math.max(.01, rx), Math.max(.01, ry), rot, 0, Math.PI * 2);
  fill(c);
}

export function rect(x, y, w, h, c) {
  g.fillStyle = Array.isArray(c) ? inkA(c) : c;
  g.fillRect(x, y, w, h);
}

export function rrect(x, y, w, h, r, c) {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
  fill(c);
}

export function poly(pts, c) {
  if (pts.length < 2) return;
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.closePath();
  fill(c);
}

export function blob(pts, c) {
  const n = pts.length;
  if (n < 3) return;
  g.beginPath();
  const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let s = m(pts[n - 1], pts[0]);
  g.moveTo(s[0], s[1]);
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = m(p, pts[(i + 1) % n]);
    g.quadraticCurveTo(p[0], p[1], q[0], q[1]);
  }
  g.closePath();
  fill(c);
}

export function line(pts, w, c, cap = 'round') {
  if (pts.length < 2) return;
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.lineWidth = w;
  g.lineCap = cap;
  g.lineJoin = 'round';
  g.strokeStyle = Array.isArray(c) ? inkA(c) : c;
  g.stroke();
}

export function curve(pts, w, c) {
  if (pts.length < 2) return;
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) {
    const q = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2];
    g.quadraticCurveTo(pts[i][0], pts[i][1], q[0], q[1]);
  }
  const L = pts[pts.length - 1];
  g.lineTo(L[0], L[1]);
  g.lineWidth = w;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.strokeStyle = Array.isArray(c) ? inkA(c) : c;
  g.stroke();
}

export function text(str, x, y, font, c, align = 'center', baseline = 'middle') {
  g.save();
  g.font = font;
  g.textAlign = align;
  g.textBaseline = baseline;
  g.fillStyle = Array.isArray(c) ? inkA(c) : c;
  g.fillText(str, x, y);
  g.restore();
}
