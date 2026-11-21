// Upgraded cinematic narrative scenes for 'Perjalanan Anak Dalam Rumah (I): Anak Sulung'
// W = 1080, H = 1920 (Vertical 9:16)
import { g, W, H, clear, rect, rrect, circle, ellipse, poly, blob, line, curve, ring, text, layer, over, ink, inkA } from './draw.js';
import { clamp, lerp, seg, ss, eo, eio, ei, spring, hash, TAU } from './lib.js';
import { drawFullBoy, drawBoyHead, drawBoyTopDown } from './boy.js';
import { drawSkyBands, drawTownSilhouette, drawTree, drawStudyInterior, drawLivingRoomInterior } from './environment.js';

// =========================================================================
// SHOT 1: Rumah Sunyi di Tengah Malam (0.00s - 11.45s)
// Continuous camera zoom: Wide night landscape -> zooms directly into window
// =========================================================================
export function shot1(t, dur = 11.45) {
  const p = clamp(t / dur, 0, 1);
  clear([0.18, 0, 0]); // Midnight deep indigo base

  // Camera smooth zoom & pan into window
  const zoom = lerp(1.0, 1.48, ss(p));
  const panY = lerp(0, -320, ss(p));
  const panX = lerp(0, 160, ss(p));

  g.save();
  g.translate(W / 2, H / 2);
  g.scale(zoom, zoom);
  g.translate(-W / 2 + panX, -H / 2 + panY);

  // 1. Sky & Stars
  drawSkyBands(0, 1100, 5, [0.35, 0, 0]);
  const starN = 45;
  for (let i = 0; i < starN; i++) {
    const sx = hash(i * 17.3) * (W + 200) - 100;
    const sy = hash(i * 31.7) * 900;
    const tw = 0.3 + 0.6 * Math.sin(t * 2.8 + i * 2.1);
    circle(sx, sy, 2.5 + hash(i * 5.9) * 2, [0, 0, tw]);
  }

  // 2. Glowing Moon
  const moonX = 840, moonY = 320;
  circle(moonX, moonY, 110, [0, 0.25, 0.75]);
  over(() => circle(moonX, moonY, 140, [0, 0.35, 0.35]));

  // 3. Distant town rooftops & pine trees
  drawTownSilhouette(1180, t * 15, [0.45, 0, 0]);
  drawTree(160, 1260, 220, 110, [0.85, 0.15, 0]);
  drawTree(320, 1290, 180, 90, [0.75, 0.2, 0]);
  drawTree(920, 1270, 240, 120, [0.9, 0.15, 0]);

  // 4. House structure
  const houseX = 420, houseY = 820, houseW = 560, houseH = 680;
  poly([[houseX - 40, houseY + 220], [houseX + houseW / 2, houseY], [houseX + houseW + 40, houseY + 220]], [0.95, 0.25, 0]); // roof
  rect(houseX, houseY + 220, houseW, houseH, [0.95, 0.18, 0]); // walls
  rect(houseX + 80, houseY + 60, 48, 120, [0.95, 0.1, 0]); // chimney
  const puff = (t * 30) % 200;
  circle(houseX + 104, houseY + 40 - puff, 16 + puff * 0.15, [0.3, 0, 0]);

  // 5. Lighted study window on upper floor
  const winX = houseX + 110, winY = houseY + 280, winW = 340, winH = 260;
  rect(winX, winY, winW, winH, [0, 0.35, 0.95]);
  over(() => circle(winX + winW / 2, winY + winH / 2, 220, [0, 0.45, 0.5]));

  // Inside the window: Study interior with the little boy!
  layer(() => {
    rect(winX + 20, winY + 30, 80, 180, [0.9, 0.15, 0]);
    rect(winX + 24, winY + 90, 72, 8, [0.95, 0.1, 0]);
    rect(winX + 28, winY + 50, 16, 40, [0, 0.8, 0]);
    rect(winX + 48, winY + 45, 20, 45, [0, 0, 0.9]);
    rect(winX + 60, winY + 160, 220, 18, [0.95, 0.2, 0]);
    circle(winX + 90, winY + 135, 14, [0, 0.8, 0.8]);
    drawFullBoy(winX + 210, winY + 240, 1.25, {
      pose: 'sit',
      expr: 'thoughtful',
      lookX: -2, lookY: -1,
      headTilt: 0.18,
      breath: t * 2.2
    });
  }, 4);

  // Window frame cross
  rect(winX - 6, winY - 6, winW + 12, 12, [0.95, 0.1, 0]);
  rect(winX - 6, winY + winH - 6, winW + 12, 14, [0.95, 0.1, 0]);
  rect(winX + winW / 2 - 5, winY, 10, winH, [0.95, 0.1, 0]);
  rect(winX, winY + winH / 2 - 5, winW, 10, [0.95, 0.1, 0]);

  // Fluttering curtain
  const flutter = Math.sin(t * 3.5) * 12;
  blob([
    [winX - 8, winY], [winX + 35 + flutter, winY + 120],
    [winX + 25 + flutter * 0.8, winY + 220], [winX - 10, winY + 250]
  ], [0, 0.65, 0.35]);

  g.restore();

  // Floating cinematic Swiss title header
  const titleA = eo(seg(p, 0.05, 0.25));
  if (titleA > 0.01) {
    g.save();
    text('PERJALANAN ANAK DALAM RUMAH', W / 2, 180, '700 28px Jost', [0.85, 0, 0]);
    text('I. Anak Sulung: Kuat Karena Harus', W / 2, 235, '800 44px Jost', [0.95, 0.2, 0]);
    rect(W / 2 - 140, 275, 280, 4, [0, 0.85, 0.85]);
    g.restore();
  }
}

// =========================================================================
// SHOT 2: Eksperimen Pertama Pengasuhan (11.45s - 19.41s)
// Fixed: High contrast sticky note, zero color overlap, clean blueprint
// =========================================================================
export function shot2(t, dur = 7.95) {
  const p = clamp((t - 11.45) / dur, 0, 1);
  clear([0, 0, 0]); // Warm cream paper

  const camZoom = lerp(0.96, 1.05, ss(p));
  const camY = lerp(30, -20, ss(p));

  g.save();
  g.translate(W / 2, H / 2);
  g.scale(camZoom, camZoom);
  g.translate(-W / 2, -H / 2 + camY);

  // 1. Large Drafting Blueprint Sheet
  const sheetX = 80, sheetY = 220, sheetW = 920, sheetH = 1440;
  rrect(sheetX, sheetY, sheetW, sheetH, 20, [0.15, 0, 0]);

  // Drafting grid lines
  for (let gy = sheetY + 70; gy < sheetY + sheetH; gy += 60) {
    line([[sheetX + 30, gy], [sheetX + sheetW - 30, gy]], 1.5, [0.28, 0, 0]);
  }
  for (let gx = sheetX + 50; gx < sheetX + sheetW; gx += 60) {
    line([[gx, sheetY + 40], [gx, sheetY + sheetH - 40]], 1.5, [0.28, 0, 0]);
  }

  // Blueprint title box
  rect(sheetX + 40, sheetY + 40, sheetW - 80, 110, [0.95, 0.1, 0]);
  text('RANCANG BANGUN HARAPAN KELUARGA [REV. 01]', W / 2, sheetY + 75, '700 24px Jost', [0, 0, 0]);
  text('"TRIAL VERSION OF PARENTING"', W / 2, sheetY + 115, '800 36px Jost', [0, 0.85, 0.85]);

  // 2. Drafting tools (separated away from text)
  poly([[120, sheetY + 1200], [380, sheetY + 1200], [120, sheetY + 900]], [0, 0.75, 0.25]);
  poly([[160, sheetY + 1170], [320, sheetY + 1170], [160, sheetY + 980]], [0, 0, 0]);
  line([[780, sheetY + 1160], [920, sheetY + 1300]], 14, [0.95, 0.2, 0]);

  // 3. The little boy standing in the center of the blueprint
  const boyY = sheetY + 980;
  layer(() => {
    drawFullBoy(W / 2, boyY, 2.1, {
      pose: 'stand',
      expr: 'thoughtful',
      lookX: 1, lookY: -2,
      headTilt: -0.08,
      breath: t * 2.5
    });
  }, 7);

  // 4. Large measurement arrows & ruler markers
  const rulerSweep = eo(seg(p, 0.15, 0.65));
  const arrowX = W / 2 - 180;
  line([[arrowX, boyY - 320 * rulerSweep], [arrowX, boyY + 140]], 4, [0, 0.85, 0]);
  line([[arrowX - 25, boyY - 320 * rulerSweep], [arrowX + 25, boyY - 320 * rulerSweep]], 4, [0, 0.85, 0]);
  line([[arrowX - 25, boyY + 140], [arrowX + 25, boyY + 140]], 4, [0, 0.85, 0]);
  text('STANDAR EKSPEKTASI', arrowX - 45, boyY - 90, '700 24px Jost', [0, 0.9, 0], 'right');

  // 5. High-contrast, clean Paper-White Sticky Note (Zero color overlap!)
  if (p > 0.3) {
    const noteX = W / 2 + 100, noteY = sheetY + 340, noteW = 340, noteH = 130;
    rrect(noteX, noteY, noteW, noteH, 10, [0, 0, 0]);
    g.strokeStyle = ink(0.95, 0.1, 0);
    g.lineWidth = 2.5;
    g.stroke();
    rect(noteX + noteW / 2 - 35, noteY - 10, 70, 18, [0, 0.9, 0.2]); // terracotta tape pin
    text('CATATAN PENGASUHAN:', noteX + noteW / 2, noteY + 45, '800 22px Jost', [0.95, 0.1, 0]);
    text('"Harus jadi contoh adik"', noteX + noteW / 2, noteY + 85, '600 24px Jost', [0, 0.85, 0.2]);
  }

  g.restore();
}

// =========================================================================
// SHOT 3: Pertanyaan yang Menuntut (19.41s - 25.87s)
// Fixed: High-Angle / Top-Down Bird's-Eye View of the overwhelmed child!
// =========================================================================
export function shot3(t, dur = 6.46) {
  const p = clamp((t - 19.41) / dur, 0, 1);
  clear([0.14, 0, 0]); // Muted night slate base

  const camZoom = lerp(0.95, 1.08, ss(p));
  g.save();
  g.translate(W / 2, H / 2);
  g.scale(camZoom, camZoom);
  g.translate(-W / 2, -H / 2);

  // 1. Giant clock dial shadow projected onto the floor from above
  const clockX = W / 2, clockY = 960, clockR = 460;
  circle(clockX, clockY, clockR, [0.22, 0.05, 0]);
  ring(clockX, clockY, clockR, 4, [0.45, 0.1, 0]);
  for (let a = 0; a < 12; a++) {
    const ang = (a / 12) * TAU;
    const x1 = clockX + Math.cos(ang) * (clockR - 35);
    const y1 = clockY + Math.sin(ang) * (clockR - 35);
    const x2 = clockX + Math.cos(ang) * (clockR - 12);
    const y2 = clockY + Math.sin(ang) * (clockR - 12);
    line([[x1, y1], [x2, y2]], 4, [0.65, 0.1, 0]);
  }
  const handAng = p * TAU * 1.5 - Math.PI / 2;
  poly([
    [clockX, clockY],
    [clockX + Math.cos(handAng - 0.06) * 420, clockY + Math.sin(handAng - 0.06) * 420],
    [clockX + Math.cos(handAng + 0.06) * 420, clockY + Math.sin(handAng + 0.06) * 420]
  ], [0.35, 0.08, 0]);

  // 2. Stress crack lines radiating out on the floor beneath the child
  const crackN = 10;
  for (let c = 0; c < crackN; c++) {
    const ca = (c / crackN) * TAU + 0.2;
    const r1 = 80, r2 = 220 + hash(c * 7.1) * 120;
    line([[clockX + Math.cos(ca) * r1, clockY + Math.sin(ca) * r1],
          [clockX + Math.cos(ca + 0.1) * (r1 + 60), clockY + Math.sin(ca + 0.1) * (r1 + 60)],
          [clockX + Math.cos(ca - 0.05) * r2, clockY + Math.sin(ca - 0.05) * r2]], 2.5, [0.55, 0, 0]);
  }

  // 3. Heavy stone slab weights pressing inward around the small child
  const labels = [
    { text: 'HARUS KUAT', x: clockX, y: clockY - 260, w: 260, h: 56 },
    { text: 'JADI PANUTAN', x: clockX + 270, y: clockY - 110, w: 240, h: 56 },
    { text: 'MENGALAH', x: clockX + 260, y: clockY + 140, w: 220, h: 56 },
    { text: 'JANGAN MENANGIS', x: clockX, y: clockY + 280, w: 280, h: 56 },
    { text: 'TUMPUAN KELUARGA', x: clockX - 270, y: clockY + 110, w: 280, h: 56 },
    { text: 'HARUS DEWASA', x: clockX - 260, y: clockY - 130, w: 240, h: 56 },
  ];

  for (let k = 0; k < labels.length; k++) {
    const b = labels[k];
    const press = Math.sin(t * 3.5 + k) * 6;
    rrect(b.x - b.w / 2, b.y - b.h / 2 + press, b.w, b.h, 10, [0.95, 0.18, 0]);
    rect(b.x - b.w / 2 + 6, b.y + b.h / 2 + press, b.w - 12, 6, [0.3, 0, 0]);
    text(b.text, b.x, b.y + press, '800 22px Jost', [0, 0, 0]);
  }

  // 4. The Little Boy seen from TOP-DOWN at the exact center (vulnerable & overwhelmed)
  layer(() => {
    drawBoyTopDown(clockX, clockY + 10, 2.5, { t });
  }, 8);

  // 5. Symmetric Swiss Editorial Headline at the top (Zero overlap with the boy!)
  g.save();
  text('"SUDAH SAMPAI MANA?"', W / 2, 210, '800 48px Jost', [0.98, 0.2, 0]);
  over(() => {
    text('dibanding: "masih sanggup atau tidak?"', W / 2, 275, '600 32px Jost', [0, 0.45, 0.75]);
  });
  g.restore();

  g.restore();
}

// =========================================================================
// SHOT 4: Menjaga yang Kecil (25.87s - 39.04s)
// Fixed: Swiss Editorial kinetic typography (no clumsy boxes!), siblings playing
// =========================================================================
export function shot4(t, dur = 13.17) {
  const p = clamp((t - 25.87) / dur, 0, 1);
  clear([0, 0, 0]); // Warm cream paper

  const camX = lerp(40, -40, ss(p));
  g.save();
  g.translate(camX, 0);

  // 1. Warm living room interior
  drawLivingRoomInterior(t);

  // 2. Two younger siblings happily playing on the carpet
  const rugCenterX = W / 2 + 140, rugCenterY = 1480;
  layer(() => {
    // Little sister with cute pigtails
    const sisX = rugCenterX - 90, sisY = rugCenterY - 40;
    circle(sisX - 18, sisY - 80, 9, [0.95, 0.15, 0]);
    circle(sisX + 18, sisY - 80, 9, [0.95, 0.15, 0]);
    blob([[-20, -70], [0, -90], [20, -70], [18, -50], [-18, -50]], [0.95, 0.15, 0]);
    circle(sisX, sisY - 60, 16, [0, 0.28, 0.08]);
    circle(sisX - 8, sisY - 55, 4, [0, 0.15, 0.7]);
    circle(sisX + 8, sisY - 55, 4, [0, 0.15, 0.7]);
    poly([[sisX - 18, sisY], [sisX + 18, sisY], [sisX + 12, sisY - 45], [sisX - 12, sisY - 45]], [0, 0.85, 0.2]);

    // Little toddler brother with toy train
    const broX = rugCenterX + 90, broY = rugCenterY - 20;
    circle(broX, broY - 50, 15, [0, 0.28, 0.08]);
    blob([[-16, -60], [0, -72], [16, -60], [12, -45], [-12, -45]], [0.95, 0.15, 0]);
    ellipse(broX - 12, broY - 10, 24, 16, 0.3, [0.85, 0.15, 0]);

    // Colorful wooden toys
    rrect(rugCenterX - 20, rugCenterY - 10, 36, 28, 6, [0, 0.9, 0]);
    circle(rugCenterX - 8, rugCenterY + 22, 6, [0.95, 0.1, 0]);
    circle(rugCenterX + 12, rugCenterY + 22, 6, [0.95, 0.1, 0]);
    rrect(rugCenterX + 28, rugCenterY - 18, 30, 34, 6, [0.85, 0, 0]);
  }, 5);

  // 3. Eldest brother leaning on the doorframe watching with warm eyes
  const doorX = 240, doorY = 1460;
  rect(60, 0, 180, H, [0.95, 0.15, 0]);
  line([[240, 0], [240, H]], 10, [0.98, 0.2, 0]);

  layer(() => {
    drawFullBoy(doorX + 20, doorY, 1.8, {
      pose: 'stand',
      expr: 'warm',
      lookX: 2, lookY: 1,
      headTilt: 0.12,
      breath: t * 2.4
    });
  }, 7);

  poly([[doorX + 10, doorY + 60], [doorX + 420, doorY + 260], [doorX + 280, doorY + 290], [doorX - 15, doorY + 60]], [0.4, 0.1, 0]);

  // 4. Swiss Editorial Kinetic Typography (Story IG Style - Aesthetic & Balanced!)
  if (p > 0.35) {
    g.save();
    text('TAKUT MENGECEWAKAN', W / 2, 180, '800 46px Jost', [0.98, 0.2, 0]);
    over(() => {
      text('orang-orang yang mereka cintai', W / 2, 235, '600 34px Jost', [0, 0.85, 0.25]);
    });
    rect(W / 2 - 160, 275, 320, 3, [0.95, 0.15, 0]);
    g.restore();
  }

  g.restore();
}

// =========================================================================
// SHOT 5: Rumah Yang Dilanda Badai (39.04s - 46.81s)
// Fixed: Pure House in a fierce storm (NO character obstruction, clean foundation!)
// =========================================================================
export function shot5(t, dur = 7.77) {
  const p = clamp((t - 39.04) / dur, 0, 1);
  clear([0.22, 0, 0]); // Stormy deep navy base

  // Dynamic storm wind & thunder camera shake
  const shake = (Math.sin(t * 38) * 4) * (0.6 + 0.4 * Math.sin(t * 7));
  g.save();
  g.translate(shake, 0);

  // 1. Dark stormy clouds looming at the top
  blob([[-100, 180], [240, 280], [620, 220], [1000, 300], [1200, 160], [1200, -100], [-100, -100]], [0.38, 0, 0]);
  blob([[80, 260], [420, 340], [780, 310], [1120, 360], [1200, 220], [1200, -50], [-100, -50]], [0.48, 0, 0]);

  // Lightning flash on beats (t = 40.5s & t = 44.2s)
  const isLightning = (t > 40.45 && t < 40.65) || (t > 44.15 && t < 44.35);
  if (isLightning) {
    over(() => rect(0, 0, W, H, [0, 0.4, 0.8]));
  }

  // 2. Fierce rain streaks lashing diagonally across frame
  const rainN = 55;
  for (let i = 0; i < rainN; i++) {
    const rx = (hash(i * 13.7) * (W + 700)) - 350 + Math.sin(t * 16 + i) * 110;
    const ry = (hash(i * 27.9) * H);
    line([[rx, ry], [rx - 110, ry + 180]], 3.5, [0.48, 0, 0]);
  }

  // 3. THE RESILIENT HOUSE STANDING FIRM IN THE STORM
  const houseX = 140, houseY = 640, houseW = 800, houseH = 680;

  // A. Heavy Pitch Roof with Terracotta Tiles holding back the storm
  const roofApexY = houseY - 240;
  poly([[houseX - 60, houseY], [houseX + houseW / 2, roofApexY], [houseX + houseW + 60, houseY]], [0.98, 0.35, 0]);
  // Stepped terracotta ridge tiles
  for (let ty = roofApexY; ty < houseY; ty += 40) {
    const frac = (ty - roofApexY) / (houseY - roofApexY);
    const hw = frac * (houseW / 2 + 60);
    rect(houseX + houseW / 2 - hw, ty, hw * 2, 16, [0, 0.85, 0.2]);
  }
  // Heavy timber eaves crossbeam
  rect(houseX - 40, houseY, houseW + 80, 32, [0.98, 0.25, 0]);

  // B. Warm, Protected House Body & Walls
  rect(houseX, houseY + 32, houseW, houseH - 32, [0.92, 0.18, 0]);

  // C. Multiple illuminated glowing windows (The warm sanctuary inside!)
  // Second floor warm window
  const w1x = houseX + 130, w1y = houseY + 110, w1w = 200, w1h = 180;
  rect(w1x, w1y, w1w, w1h, [0, 0.4, 0.95]);
  rect(w1x + w1w / 2 - 4, w1y, 8, w1h, [0.95, 0.1, 0]);
  rect(w1x, w1y + w1h / 2 - 4, w1w, 8, [0.95, 0.1, 0]);

  const w2x = houseX + 470, w2y = houseY + 110, w2w = 200, w2h = 180;
  rect(w2x, w2y, w2w, w2h, [0, 0.4, 0.95]);
  rect(w2x + w2w / 2 - 4, w2y, 8, w2h, [0.95, 0.1, 0]);
  rect(w2x, w2y + w2h / 2 - 4, w2w, 8, [0.95, 0.1, 0]);

  // Ground floor front door
  const doorX = houseX + houseW / 2 - 70, doorY = houseY + 390;
  rect(doorX, doorY, 140, 260, [0.98, 0.22, 0]); // wooden door
  rect(doorX + 16, doorY + 20, 48, 100, [0.95, 0.15, 0]); // door panel 1
  rect(doorX + 76, doorY + 20, 48, 100, [0.95, 0.15, 0]); // door panel 2
  rect(doorX + 16, doorY + 140, 48, 100, [0.95, 0.15, 0]); // door panel 3
  rect(doorX + 76, doorY + 140, 48, 100, [0.95, 0.15, 0]); // door panel 4
  rect(doorX + 24, doorY + 120, 6, 20, [0, 0.85, 0.3]); // brass handle

  // D. MASSIVE SOLID STONE FOUNDATION (Completely unobstructed & clear!)
  const baseTop = houseY + houseH;
  rect(houseX - 80, baseTop, houseW + 160, 380, [0.95, 0.22, 0]);
  // Stacked stone masonry block lines
  for (let by = baseTop + 60; by < baseTop + 360; by += 60) {
    line([[houseX - 80, by], [houseX + houseW + 80, by]], 3.5, [0.98, 0.1, 0]);
    for (let bx = houseX - 40 + ((by / 60) % 2) * 80; bx < houseX + houseW + 40; bx += 160) {
      line([[bx, by - 60], [bx, by]], 3, [0.98, 0.1, 0]);
    }
  }

  // Clear, crisp inscription on the foundation stone (100% visible!)
  text('PONDASI TEMPAT KELUARGA BERTUMPU', W / 2, baseTop + 140, '800 36px Jost', [0, 0, 0]);
  over(() => {
    text('PONDASI TEMPAT KELUARGA BERTUMPU', W / 2, baseTop + 140, '800 36px Jost', [0, 0.85, 0.85]);
  });

  // Top Title Banner
  text('PONDASI SEKALIGUS ATAP', W / 2, 190, '800 48px Jost', [0, 0.95, 0.95]);

  g.restore();
}

// =========================================================================
// SHOT 6: Penutup Quote Swiss Editorial (46.81s - 59.39s)
// Fixed: Pure, elegant Swiss Editorial typographic closing card (NO boulder!)
// =========================================================================
export function shot6(t, dur = 12.58) {
  const p = clamp((t - 46.81) / dur, 0, 1);
  clear([0, 0, 0]); // Warm cream riso paper base

  const zoom = lerp(0.97, 1.04, ss(p));
  g.save();
  g.translate(W / 2, H / 2);
  g.scale(zoom, zoom);
  g.translate(-W / 2, -H / 2);

  // 1. Soft Morning Sunlight Radiance in background (Pure riso sunburst halo)
  const sunY = 1280 - p * 120;
  circle(W / 2, sunY, 560, [0, 0.25, 0.85]);
  over(() => {
    circle(W / 2, sunY, 400, [0, 0.45, 0.55]);
    circle(W / 2, sunY, 260, [0, 0.75, 0.25]);
  });

  // Floating gentle golden light dust motes drifting upward
  for (let k = 0; k < 42; k++) {
    const px = hash(k * 7.7) * (W + 200) - 100 + Math.sin(t * 1.6 + k) * 35;
    const py = hash(k * 13.9) * H - p * 150;
    circle(px, py, 3 + 2.5 * hash(k * 3.1), [0, 0.65, 0.75]);
  }

  // 2. MASTERPIECE SWISS EDITORIAL TYPOGRAPHY CLOSING CARD
  const cardY = 540;

  // Sub-header category tag
  text('— CATATAN UNTUK ANAK SULUNG —', W / 2, cardY, '700 24px Jost', [0.85, 0.1, 0]);

  // Main Quotation (Varied scale, rhythm & deep emotional resonance)
  const qProg = eo(seg(p, 0.08, 0.55));
  if (qProg > 0.01) {
    g.save();
    // Line 1: Bold statement
    text('"Kamu berhak lelah.', W / 2, cardY + 110, '800 52px Jost', [0.95, 0.1, 0]);

    // Line 2: Terracotta accent of compassion
    over(() => {
      text('Boleh gagal.', W / 2, cardY + 185, '800 52px Jost', [0, 0.9, 0.25]);
    });
    text('Boleh gagal.', W / 2, cardY + 185, '800 52px Jost', [0.25, 0.7, 0]);

    // Line 3: Deep validation
    text('Dan layak dirayakan...', W / 2, cardY + 265, '700 44px Jost', [0.95, 0.15, 0]);

    // Line 4: Symmetrical hero climax
    over(() => {
      text('karena tetap bertahan."', W / 2, cardY + 345, '800 54px Jost', [0, 0.85, 0.25]);
    });
    text('karena tetap bertahan."', W / 2, cardY + 345, '800 54px Jost', [0.98, 0.1, 0]);

    // Symmetrical geometric divider rule with diamond riso mark
    const ruleW = 340;
    rect(W / 2 - ruleW / 2, cardY + 420, ruleW, 2.5, [0.95, 0.15, 0]);
    poly([
      [W / 2, cardY + 412],
      [W / 2 + 8, cardY + 420],
      [W / 2, cardY + 428],
      [W / 2 - 8, cardY + 420]
    ], [0, 0.9, 0.2]); // terracotta diamond

    g.restore();
  }

  g.restore();
}
