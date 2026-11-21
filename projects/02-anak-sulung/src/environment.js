// Rich Risograph environment illustrations and background decor
// W = 1080, H = 1920
import { g, W, H, rect, rrect, circle, ellipse, poly, blob, line, curve, ring, over, inkA } from './draw.js';
import { hash, clamp, lerp, seg, eo, TAU } from './lib.js';

// Banded stepped sky (Haugomat style riso sky steps)
export function drawSkyBands(y0, y1, steps = 4, baseColor = [0, 0, 0]) {
  const h = (y1 - y0) / steps;
  for (let i = 0; i < steps; i++) {
    const d = (i + 1) / steps;
    rect(0, y1 - (i + 1) * h - 1, W, h + 2, [baseColor[0] * d, baseColor[1] * d, baseColor[2] * d]);
  }
}

// Distant city rooftops & chimneys (Town silhouette)
export function drawTownSilhouette(baseY, panX = 0, color = [0.45, 0, 0]) {
  g.save();
  g.beginPath();
  g.moveTo(-100, baseY);
  const buildings = [
    { w: 90, h: 120, roof: 'pitch' }, { w: 120, h: 180, roof: 'flat' },
    { w: 80, h: 220, roof: 'spire' }, { w: 140, h: 140, roof: 'dome' },
    { w: 110, h: 190, roof: 'pitch' }, { w: 130, h: 110, roof: 'flat' },
    { w: 90, h: 240, roof: 'spire' }, { w: 150, h: 160, roof: 'pitch' },
    { w: 100, h: 130, roof: 'flat' }, { w: 120, h: 200, roof: 'dome' },
    { w: 140, h: 150, roof: 'pitch' }
  ];
  let curX = -120 - (panX % 1200);
  for (let round = 0; round < 2; round++) {
    for (const b of buildings) {
      const top = baseY - b.h;
      g.lineTo(curX, baseY);
      g.lineTo(curX, top);
      if (b.roof === 'pitch') {
        g.lineTo(curX + b.w / 2, top - b.w * 0.45);
        g.lineTo(curX + b.w, top);
      } else if (b.roof === 'dome') {
        g.arc(curX + b.w / 2, top, b.w / 2, Math.PI, 0);
      } else if (b.roof === 'spire') {
        g.lineTo(curX + b.w * 0.45, top);
        g.lineTo(curX + b.w * 0.5, top - 70);
        g.lineTo(curX + b.w * 0.55, top);
        g.lineTo(curX + b.w, top);
      } else {
        g.lineTo(curX + b.w, top);
      }
      g.lineTo(curX + b.w, baseY);
      curX += b.w + 14;
    }
  }
  g.closePath();
  g.fillStyle = inkA(color);
  g.fill();
  g.restore();
}

// Organic riso pine & deciduous trees
export function drawTree(x, y, h = 180, w = 90, color = [0.85, 0.15, 0]) {
  g.save();
  // Trunk
  line([[x, y], [x, y - h * 0.4]], 10, [0.95, 0.2, 0]);
  // Foilage blobs in 3 tiers
  blob([
    [x - w * 0.5, y - h * 0.35], [x - w * 0.4, y - h * 0.6], [x - w * 0.2, y - h * 0.95],
    [x + w * 0.2, y - h * 0.95], [x + w * 0.4, y - h * 0.6], [x + w * 0.5, y - h * 0.35]
  ], color);
  g.restore();
}

// Cozy bedroom / study interior with wooden floor, desk lamp, curtains
export function drawStudyInterior(t, camY = 0) {
  // Wallpaper with subtle vertical pinstripes
  rect(0, 0, W, 1420, [0.12, 0, 0]);
  for (let x = 40; x < W; x += 60) {
    line([[x, 0], [x, 1420]], 1.5, [0.18, 0, 0]);
  }

  // Wooden floorboards with perspective grain
  rect(0, 1420, W, H - 1420, [0.85, 0.2, 0]);
  for (let fy = 1420; fy < H; fy += 70) {
    line([[0, fy], [W, fy]], 3, [0.95, 0.1, 0]);
  }

  // Bookshelf on the left
  rect(80, 520, 180, 840, [0.95, 0.15, 0]);
  for (let sy = 560; sy < 1340; sy += 180) {
    rect(80, sy, 180, 16, [0.98, 0.1, 0]);
    // Colorful book spines
    let bx = 95;
    while (bx < 240) {
      const bw = 16 + (hash(bx * 3.1) * 20);
      const bh = 100 + (hash(bx * 7.7) * 45);
      const col = hash(bx * 11.3) > 0.5 ? [0, 0.85, 0.15] : [0, 0.2, 0.9];
      rect(bx, sy - bh, bw, bh, col);
      bx += bw + 5;
    }
  }

  // Window on right with fluttering curtains
  const winX = 620, winY = 480, winW = 380, winH = 540;
  // Night view outside window
  rect(winX, winY, winW, winH, [0.8, 0, 0]);
  // Stars in window
  for (let i = 0; i < 12; i++) {
    const sx = winX + 30 + hash(i * 3.7) * (winW - 60);
    const sy = winY + 30 + hash(i * 9.1) * (winH - 60);
    circle(sx, sy, 2.5, [0, 0, 0.8]);
  }
  // Wooden window frame
  rect(winX - 10, winY - 10, winW + 20, 16, [0.95, 0.1, 0]);
  rect(winX - 10, winY + winH - 6, winW + 20, 20, [0.95, 0.1, 0]);
  rect(winX + winW / 2 - 5, winY, 10, winH, [0.95, 0.1, 0]);
  rect(winX, winY + winH / 2 - 5, winW, 10, [0.95, 0.1, 0]);

  // Fluttering curtain
  const flutter = Math.sin(t * 3.5) * 14;
  blob([
    [winX - 15, winY], [winX + 45 + flutter, winY + 180],
    [winX + 30 + flutter * 0.8, winY + 460], [winX - 25, winY + 540]
  ], [0, 0.65, 0.35]);

  // Desk on right
  const deskX = 540, deskY = 1260, deskW = 460, deskH = 26;
  rect(deskX, deskY, deskW, deskH, [0.95, 0.2, 0]);
  rect(deskX + 30, deskY + deskH, 18, 160, [0.95, 0.2, 0]);
  rect(deskX + deskW - 48, deskY + deskH, 18, 160, [0.95, 0.2, 0]);

  // Vintage desk lamp casting a warm cone of light
  const lampX = deskX + 80, lampY = deskY - 160;
  line([[lampX, deskY], [lampX - 15, lampY + 70], [lampX + 35, lampY + 20]], 7, [0.95, 0.1, 0]);
  circle(lampX + 35, lampY + 20, 18, [0, 0.85, 0.2]); // lamp hood
  // Volumetric warm light cone (Gold + Terracotta)
  over(() => {
    poly([
      [lampX + 35, lampY + 28],
      [deskX - 40, deskY + 14],
      [deskX + 380, deskY + 14]
    ], [0, 0.45, 0.85]);
  });

  // Floating ambient dust particles in the lamp light
  for (let k = 0; k < 18; k++) {
    const dx = deskX + 30 + (hash(k * 4.3) * 280) + Math.sin(t * 2 + k) * 8;
    const dy = lampY + 40 + (hash(k * 8.9) * 110) + Math.cos(t * 1.5 + k) * 8;
    circle(dx, dy, 2, [0, 0.3, 0.8]);
  }
}

// Warm living room interior with carpet, armchair, toys, and sibling space
export function drawLivingRoomInterior(t) {
  // Warm creamy peach wallpaper
  rect(0, 0, W, 1380, [0.08, 0.15, 0]);
  // Decorative riso floral / diamond wallpaper pattern
  for (let wy = 80; wy < 1320; wy += 90) {
    for (let wx = 60; wx < W; wx += 90) {
      ring(wx, wy, 8, 2, [0.18, 0.08, 0]);
      circle(wx, wy, 2.5, [0, 0.25, 0]);
    }
  }

  // Large family wall portrait in vintage frame
  rrect(W / 2 - 110, 240, 220, 160, 10, [0.95, 0.15, 0]);
  rect(W / 2 - 96, 254, 192, 132, [0, 0.3, 0.85]); // warm picture inside
  // Little family silhouettes in the frame
  circle(W / 2 - 45, 310, 16, [0.9, 0.1, 0]);
  circle(W / 2, 305, 18, [0.9, 0.1, 0]);
  circle(W / 2 + 45, 315, 14, [0.9, 0.1, 0]);

  // Wooden baseboard & warm patterned carpet
  rect(0, 1380, W, 28, [0.95, 0.2, 0]);
  rect(0, 1408, W, H - 1408, [0.85, 0.25, 0]); // floor
  // Oval woven living room rug (Terracotta + Gold)
  ellipse(W / 2 + 120, 1660, 380, 160, 0, [0, 0.85, 0.65]);
  ellipse(W / 2 + 120, 1660, 320, 130, 0, [0.15, 0.7, 0.8]);

  // Cozy armchair on the right
  const chairX = 860, chairY = 1420;
  rrect(chairX - 80, chairY - 140, 160, 180, 24, [0.95, 0.15, 0]); // backrest
  rrect(chairX - 90, chairY - 40, 180, 60, 18, [0.95, 0.15, 0]); // seat
  rect(chairX - 80, chairY + 20, 14, 50, [0.95, 0.2, 0]); // legs
  rect(chairX + 66, chairY + 20, 14, 50, [0.95, 0.2, 0]);

  // Hanging pendant lamp with warm radiating cone of light
  line([[W / 2 + 120, 0], [W / 2 + 120, 560]], 4, [0.95, 0.1, 0]);
  circle(W / 2 + 120, 570, 28, [0, 0.85, 0.2]); // lamp fixture
  over(() => {
    circle(W / 2 + 120, 570, 65, [0, 0.4, 0.6]);
    poly([
      [W / 2 + 120, 580],
      [140, 1780],
      [W + 80, 1780]
    ], [0, 0.35, 0.85]);
  });
}
