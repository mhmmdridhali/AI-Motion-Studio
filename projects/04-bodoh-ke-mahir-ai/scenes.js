// Tablet Sketch Explainer — 10 Shots, 7 Master Canvas Zones, 5 Native Moves
// Project 04: Belajar AI dari Nol (Part 1: Fundamental AI)

window.buildPage = function buildPage(S, sched) {
  const { C, PEN, BLOB, OCC, TXT, ell, bez, rectPoly, roundRectPoly, circleStroke, arrow, dashedLine, starBurst } = S;
  const sh = idx => sched.shots[idx];
  const s1 = sh(0), s2 = sh(1), s3 = sh(2), s4 = sh(3), s5 = sh(4);
  const s6 = sh(5), s7 = sh(6), s8 = sh(7), s9 = sh(8), s10 = sh(9);

  // Camera helper: keeps zone center around screenY = 640px (well above y=1175 subtitle chip)
  const camY = (zy, z) => zy + 320 / z;

  // Helper: draw Murid character (curious young woman with shoulder-length hair & expressive brows)
  function drawMurid(cx, cy, mood, auraCol, t0, d, opts = {}) {
    const aura = ell(cx, cy + 12, 82, 92, -0.08, 0, Math.PI * 2, 36, 0.04);
    BLOB(aura, auraCol, { dx: 8, dy: 6, a: 0.55, sp: 10, replace: opts.replace }, t0, d * 0.24);

    PEN(ell(cx, cy - 28, 40, 44, 0, 0, Math.PI * 2, 26), { layer: 'light', w: 1.4, p: 0.5 }, t0, d * 0.10);

    const hairBack = [
      [cx - 44, cy - 8], [cx - 48, cy - 56], [cx - 22, cy - 74], [cx + 22, cy - 72],
      [cx + 46, cy - 52], [cx + 44, cy - 4]
    ];
    PEN(hairBack, { w: 3.0, wob: 0.6 }, t0 + d * 0.08, d * 0.18);
    PEN(ell(cx, cy - 26, 35, 38, 0, -0.2, Math.PI * 2.05, 34), { w: 2.8, wob: 0.55 }, t0 + d * 0.18, d * 0.18);
    PEN([[cx - 32, cy - 40], [cx - 8, cy - 54], [cx + 22, cy - 46], [cx + 34, cy - 32]], { w: 2.3 }, t0 + d * 0.28, d * 0.10);

    if (mood === 'frown') {
      PEN([[cx - 19, cy - 38], [cx - 6, cy - 33]], { w: 2.3 }, t0 + d * 0.34, d * 0.06);
      PEN([[cx + 19, cy - 38], [cx + 6, cy - 33]], { w: 2.3 }, t0 + d * 0.36, d * 0.06);
      PEN(ell(cx - 13, cy - 27, 3.4, 3.8), { w: 2.6 }, t0 + d * 0.38, d * 0.05);
      PEN(ell(cx + 13, cy - 27, 3.4, 3.8), { w: 2.6 }, t0 + d * 0.40, d * 0.05);
      PEN([[cx - 12, cy - 8], [cx, cy - 14], [cx + 12, cy - 8]], { w: 2.4 }, t0 + d * 0.43, d * 0.08);
    } else {
      PEN([[cx - 20, cy - 40], [cx - 12, cy - 44], [cx - 5, cy - 39]], { w: 2.1 }, t0 + d * 0.34, d * 0.06);
      PEN([[cx + 5, cy - 38], [cx + 13, cy - 43], [cx + 20, cy - 38]], { w: 2.1 }, t0 + d * 0.36, d * 0.06);
      PEN(ell(cx - 13, cy - 27, 3.6, 4.2), { w: 2.8 }, t0 + d * 0.38, d * 0.05);
      PEN(ell(cx + 13, cy - 27, 3.6, 4.2), { w: 2.8 }, t0 + d * 0.40, d * 0.05);
      PEN([[cx - 10, cy - 10], [cx + 2, cy - 12], [cx + 11, cy - 8]], { w: 2.3 }, t0 + d * 0.43, d * 0.08);
    }

    const torso = [
      [cx - 45, cy + 78], [cx - 40, cy + 30], [cx - 15, cy + 18],
      [cx + 15, cy + 18], [cx + 40, cy + 30], [cx + 45, cy + 78]
    ];
    PEN(torso, { w: 2.8, wob: 0.65 }, t0 + d * 0.50, d * 0.22);
    BLOB(torso, opts.shirtCol || C.slate, { dx: 6, dy: 5, a: 0.65, sp: 8 }, t0 + d * 0.70, d * 0.28);
    return aura;
  }

  // Helper: draw anatomical scalloped Brain contour (single continuous closed spline loop)
  function brainPath(cx, cy, rx, ry) {
    return [
      [cx, cy - ry * 0.92],
      [cx + rx * 0.42, cy - ry * 1.02],
      [cx + rx * 0.88, cy - ry * 0.72],
      [cx + rx * 1.04, cy - ry * 0.22],
      [cx + rx * 0.95, cy + ry * 0.34],
      [cx + rx * 0.62, cy + ry * 0.80],
      [cx + rx * 0.16, cy + ry * 0.88],
      [cx, cy + ry * 0.72],
      [cx - rx * 0.18, cy + ry * 0.90],
      [cx - rx * 0.66, cy + ry * 0.78],
      [cx - rx * 0.96, cy + ry * 0.30],
      [cx - rx * 1.04, cy - ry * 0.26],
      [cx - rx * 0.86, cy - ry * 0.74],
      [cx - rx * 0.40, cy - ry * 1.00]
    ];
  }

  // =========================================================================
  // PRE-DRAWN PAGE BASELINE & STRONG OPENING FRAME (t <= 0.0s)
  // =========================================================================
  const z1x = 285, z1y = 355;
  PEN([[70, 212], [1010, 212]], { layer: 'light', w: 1.5, p: 0.5 }, -0.60, 0.12);
  const tagBox = roundRectPoly(72, 148, 290, 44, 14);
  BLOB(tagBox, C.sage, { dx: 5, dy: 4, a: 0.78, sp: 8 }, -0.55, 0.12);
  PEN(tagBox.concat([tagBox[0]]), { w: 2.4 }, -0.50, 0.10);
  TXT('Belajar AI dari Nol', 90, 179, 30, { f: 'CB', k: 0.85, tEnd: 80.5 }, -0.45, 0.18);

  // Pre-sketch Murid outline & phone construction so Frame 0 (t=0.0s) is visually compelling
  const murid1Aura = drawMurid(z1x - 100, z1y + 8, 'curious', C.lav, -0.42, 0.40, { shirtCol: C.slate });
  const phX = z1x + 12, phY = z1y - 80, phW = 144, phH = 200;
  const phPoly = roundRectPoly(phX, phY, phW, phH, 16);
  PEN(phPoly.concat([phPoly[0]]), { w: 2.8, wob: 0.55 }, -0.22, 0.20);

  // =========================================================================
  // SHOT 1 (0.00 - 8.58s): Stereotip Teman Chat & Gambar Seru-seruan
  // =========================================================================
  BLOB(roundRectPoly(phX + 12, phY + 22, phW - 24, phH - 42, 8), '#e6decb', { dx: 3, dy: 3, a: 0.55, sp: 8 }, 0.25, 0.55);

  // Chat bubble on phone
  const bub = roundRectPoly(phX + 18, phY + 32, 108, 42, 10);
  S.addSFX({ t: 0.95, type: 'pop', d: 0.14, pan: 0.18 });
  BLOB(bub, C.sage, { dx: 4, dy: 3, a: 0.78, sp: 7 }, 0.95, 0.42);
  PEN(bub.concat([bub[0]]), { w: 2.1 }, 1.38, 0.38);
  TXT('Teman Chat?', phX + 26, phY + 60, 22, { f: 'CB', k: 0.85, pass: true }, 1.78, 0.45);

  // Cute cat doodle inside phone
  const catCx = phX + 74, catCy = phY + 132;
  const catHead = ell(catCx, catCy, 27, 22, 0, 0, Math.PI * 2, 24);
  S.addSFX({ t: 2.65, type: 'pop', d: 0.14, pan: 0.15 });
  BLOB(catHead, C.mustard, { dx: 4, dy: 3, a: 0.80, sp: 6 }, 2.65, 0.38);
  PEN([[catCx - 19, catCy - 14], [catCx - 23, catCy - 35], [catCx - 6, catCy - 20]], { w: 2.2 }, 3.02, 0.20);
  PEN([[catCx + 6, catCy - 20], [catCx + 23, catCy - 35], [catCx + 19, catCy - 14]], { w: 2.2 }, 3.22, 0.20);
  PEN(catHead, { w: 2.4 }, 3.42, 0.34);
  PEN(ell(catCx - 9, catCy - 3, 2.5, 2.5), { w: 2.4 }, 3.76, 0.08);
  PEN(ell(catCx + 9, catCy - 3, 2.5, 2.5), { w: 2.4 }, 3.84, 0.08);
  PEN([[catCx - 6, catCy + 6], [catCx, catCy + 10], [catCx + 6, catCy + 6]], { w: 2.0 }, 3.92, 0.12);
  const hat = [[catCx - 9, catCy - 21], [catCx, catCy - 43], [catCx + 9, catCy - 21]];
  BLOB(hat, C.coral, { dx: 3, dy: 2, a: 0.85, sp: 5 }, 4.04, 0.24);
  PEN(hat.concat([hat[0]]), { w: 1.9 }, 4.28, 0.22);

  // Beat at 4.65s (Mentor: "baru kulitnya.")
  PEN([[z1x - 165, z1y + 132], [z1x + 150, z1y + 132]], { layer: 'coral', w: 3.2 }, 4.70, 0.45);
  TXT('Baru kulitnya!', z1x - 95, z1y + 168, 34, { f: 'CB', layer: 'coral', k: 0.92, tEnd: 11.2 }, 5.05, 0.65);
  starBurst(z1x + 135, z1y + 154, 14, 26, 5, { layer: 'coral', w: 2.5 }, 5.90, 0.45);
  arrow([[z1x + 168, z1y - 10], [z1x + 232, z1y - 24], [z1x + 286, z1y - 10]], { layer: 'coral', w: 3.6, head: 17 }, 6.75, 0.85);

  // =========================================================================
  // SHOT 2 (8.58 - 17.35s): Peta 4 Tangga Belajar AI (Native Move #1 + Still Drawing)
  // =========================================================================
  const z2x = 775, z2y = 355;
  const stairSpecs = [
    { id: '01', title: 'Fondasi AI', x: z2x - 195, y: z2y + 38, w: 94, h: 74,  col: C.sage,    active: true },
    { id: '02', title: 'Tools',      x: z2x - 92,  y: z2y + 8,  w: 92, h: 104, col: C.mustard, active: false },
    { id: '03', title: 'Builder',    x: z2x + 10,  y: z2y - 24, w: 92, h: 136, col: C.slate,   active: false },
    { id: '04', title: 'Agent',      x: z2x + 112, y: z2y - 56, w: 98, h: 168, col: C.lav,     active: false }
  ];

  PEN([[z2x - 210, z2y + 116], [z2x + 215, z2y + 116]], { w: 2.4 }, 9.10, 0.45);

  stairSpecs.forEach((st, idx) => {
    const tStart = 9.55 + idx * 0.45;
    if (st.active) {
      const box = roundRectPoly(st.x, st.y, st.w, st.h, 8);
      PEN(box.concat([box[0]]), { w: 2.9 }, tStart, 0.45);
    } else {
      const x0 = st.x, y0 = st.y, x1 = st.x + st.w, y1 = st.y + st.h;
      dashedLine([x0, y0], [x1, y0], 11, 7, { w: 2.1, layer: 'graph' }, tStart, 0.14);
      dashedLine([x1, y0], [x1, y1], 11, 7, { w: 2.1, layer: 'graph' }, tStart + 0.12, 0.14);
      dashedLine([x0, y1], [x0, y0], 11, 7, { w: 2.1, layer: 'graph' }, tStart + 0.22, 0.14);
    }
    TXT(st.id, st.x + 12, st.y + 28, 25, { f: 'CB', k: 0.85, pass: true }, tStart + 0.25, 0.22);
  });

  // Native Move #1: Line, then colour
  const box01 = roundRectPoly(stairSpecs[0].x, stairSpecs[0].y, stairSpecs[0].w, stairSpecs[0].h, 8);
  BLOB(box01, C.sage, { dx: 6, dy: 5, a: 0.82, sp: 7 }, 11.75, 0.55);
  BLOB(rectPoly(stairSpecs[0].x + 38, stairSpecs[0].y + 8, 46, 20), C.mustard, { dx: 3, dy: 2, a: 0.88, sp: 5 }, 12.25, 0.25);

  for (let i = 1; i < 4; i++) {
    const st = stairSpecs[i];
    BLOB(rectPoly(st.x, st.y, st.w, st.h), st.col, { dx: 5, dy: 4, a: 0.42, sp: 10, stop: 0.42 }, 12.55 + (i - 1) * 0.28, 0.28);
  }

  TXT('Fondasi AI', stairSpecs[0].x + 6, stairSpecs[0].y + 54, 24, { f: 'CB', k: 0.9, tEnd: 17.5 }, 13.45, 0.45);
  TXT('Tools', stairSpecs[1].x + 14, stairSpecs[1].y + 54, 22, { f: 'CM', k: 0.72, pass: true }, 13.85, 0.30);
  TXT('Builder', stairSpecs[2].x + 10, stairSpecs[2].y + 54, 22, { f: 'CM', k: 0.72, pass: true }, 14.12, 0.30);
  TXT('Agent', stairSpecs[3].x + 14, stairSpecs[3].y + 54, 22, { f: 'CM', k: 0.72, pass: true }, 14.38, 0.30);

  circleStroke(stairSpecs[0].x + 47, stairSpecs[0].y + 38, 56, { layer: 'coral', w: 3.4, ry: 46 }, 14.85, 0.58);
  TXT('Mulai di sini!', z2x - 195, z2y - 36, 34, { f: 'CB', layer: 'coral', k: 0.9, tEnd: 17.6 }, 15.10, 0.55);
  // Smooth continuous connector arrow guiding two-finger pan directly into Zone 3 magnifier
  const z3x = 290, z3y = 755;
  arrow([
    [stairSpecs[0].x + 44, stairSpecs[0].y + 84],
    [530, 530],
    [438, 572],
    [z3x + 104, z3y - 134]
  ], { layer: 'coral', w: 3.6, head: 18 }, 15.85, 0.95);

  // =========================================================================
  // SHOT 3 (17.35 - 30.51s): Kamus & Otak LLM ("Balonku ada... Lima!")
  // =========================================================================
  // Camera glides smoothly along the coral arrow from Stair 01 down-left to Zone 3
  circleStroke(z3x, z3y, 174, { layer: 'coral', w: 4.3, ry: 166 }, 17.95, 0.72);
  PEN([[z3x + 122, z3y + 120], [z3x + 188, z3y + 186]], { layer: 'coral', w: 8.5, wob: 0.4 }, 18.68, 0.28);

  const bookL = [[z3x - 110, z3y - 46], [z3x - 4, z3y - 34], [z3x - 4, z3y + 42], [z3x - 115, z3y + 30]];
  const bookR = [[z3x - 4, z3y - 34], [z3x + 106, z3y - 46], [z3x + 110, z3y + 30], [z3x - 4, z3y + 42]];
  PEN(bookL.concat([bookL[0]]), { w: 2.5 }, 19.65, 0.55);
  PEN(bookR.concat([bookR[0]]), { w: 2.5 }, 20.15, 0.55);

  const brainPoly = ell(z3x, z3y - 66, 52, 34, 0, 0, Math.PI * 2, 32, 0.05);
  BLOB(brainPoly, C.slate, { dx: 6, dy: 5, a: 0.78, sp: 7 }, 20.75, 0.45);
  PEN(brainPoly, { w: 2.7 }, 21.15, 0.45);
  PEN([[z3x, z3y - 98], [z3x - 2, z3y - 34]], { w: 2.0 }, 21.58, 0.18);
  PEN(bez([z3x - 32, z3y - 72], [z3x - 18, z3y - 84], [z3x - 10, z3y - 60], [z3x - 24, z3y - 54]), { w: 1.9 }, 21.75, 0.22);
  PEN(bez([z3x + 30, z3y - 74], [z3x + 16, z3y - 84], [z3x + 8, z3y - 58], [z3x + 22, z3y - 52]), { w: 1.9 }, 21.95, 0.22);
  TXT('LLM = Otak', z3x - 68, z3y - 112, 34, { f: 'CB', k: 0.9, tEnd: 31.0 }, 22.15, 0.52);

  const pStrip = roundRectPoly(z3x - 135, z3y + 56, 165, 44, 8);
  PEN(pStrip.concat([pStrip[0]]), { w: 2.2 }, 23.45, 0.35);
  TXT('Balonku ada...', z3x - 124, z3y + 86, 26, { f: 'CM', k: 0.88, tEnd: 31.0 }, 23.75, 0.65);

  const limaBox = roundRectPoly(z3x + 38, z3y + 54, 102, 48, 10);
  BLOB(limaBox, C.mustard, { dx: 5, dy: 4, a: 0.92, sp: 6 }, 26.42, 0.26);
  PEN(limaBox.concat([limaBox[0]]), { layer: 'coral', w: 2.7 }, 26.55, 0.24);
  S.addSFX({ t: 26.68, type: 'pop', d: 0.14, pan: 0.15 });
  TXT('LIMA!', z3x + 52, z3y + 88, 32, { f: 'CB', layer: 'coral', k: 0.95, tEnd: 31.0 }, 26.68, 0.28);
  starBurst(z3x + 88, z3y + 78, 44, 62, 6, { layer: 'coral', w: 2.5 }, 26.82, 0.32);

  TXT('Penebak Kata', z3x - 76, z3y + 138, 30, { f: 'CB', k: 0.88, tEnd: 31.0 }, 27.45, 0.52);
  PEN([[z3x - 80, z3y + 146], [z3x + 70, z3y + 145]], { layer: 'coral', w: 2.9 }, 28.05, 0.35);
  arrow([[z3x + 165, z3y - 12], [z3x + 225, z3y - 22], [z3x + 275, z3y - 10]], { layer: 'coral', w: 3.5, head: 16 }, 28.85, 0.72);

  // =========================================================================
  // SHOT 4 & 5 (30.51 - 45.41s): Anatomical Brain + Harness Rig -> AI Agent
  // =========================================================================
  // Zone 4 cleanly centered at z4x=775, z4y=775 (corridor y=490..605 reserved for Shot 9)
  const z4x = 775, z4y = 775;

  // S4 Left: Scalloped Brain inside Glass Bell Jar + Floating Text Tokens
  const jx = z4x - 118, jy = z4y - 48; // (657, 727)
  const brainLobe = brainPath(jx, jy - 4, 34, 24);
  BLOB(brainLobe, C.slate, { dx: 5, dy: 4, a: 0.80, sp: 6 }, 30.65, 0.35);
  PEN(brainLobe.concat([brainLobe[0]]), { w: 2.5 }, 30.98, 0.38);
  PEN([[jx, jy - 26], [jx - 1, jy + 16]], { w: 1.7 }, 31.32, 0.12);
  PEN(bez([jx - 22, jy - 10], [jx - 12, jy - 18], [jx - 6, jy], [jx - 18, jy + 8]), { w: 1.5 }, 31.42, 0.14);
  PEN(bez([jx + 20, jy - 12], [jx + 10, jy - 18], [jx + 6, jy + 2], [jx + 16, jy + 8]), { w: 1.5 }, 31.54, 0.14);
  // Transparent glass bell jar dome + base
  const jarDome = ell(jx, jy + 6, 46, 44, 0, Math.PI, Math.PI * 2, 26);
  const jarOutline = [[jx - 46, jy + 32]].concat(jarDome, [[jx + 46, jy + 32]]);
  PEN(jarOutline, { w: 2.4, layer: 'graph' }, 31.66, 0.32);
  PEN(roundRectPoly(jx - 52, jy + 32, 104, 12, 5).concat([[jx - 52, jy + 32]]), { w: 2.3 }, 31.95, 0.20);
  // Floating text prompt token above-left of jar
  const tokCard = roundRectPoly(jx - 66, jy - 68, 56, 24, 6);
  PEN(tokCard.concat([tokCard[0]]), { layer: 'light', w: 1.7 }, 32.12, 0.18);
  PEN([[jx - 58, jy - 56], [jx - 22, jy - 56]], { layer: 'coral', w: 1.9 }, 32.28, 0.12);
  TXT('LLM', jx - 24, jy + 66, 23, { f: 'CB', k: 0.90, pass: true }, 32.38, 0.18);
  TXT('Cuma teks', jx - 48, jy + 88, 22, { f: 'CM', k: 0.82, tEnd: 38.0 }, 32.54, 0.34);

  // '+' connector
  TXT('+', z4x - 56, z4y - 44, 38, { f: 'CB', layer: 'coral', pass: true }, 32.92, 0.18);

  // S4 Right: Mechanical Exoskeleton Harness Rig + Tools (y: 660..802)
  const hx = z4x + 76, hy = z4y - 44; // (851, 731)
  // Empty top Brain Socket (U-shaped helmet cradle + dashed slot ring)
  PEN([[hx - 34, hy - 68], [hx - 32, hy - 38], [hx + 32, hy - 38], [hx + 34, hy - 68]], { w: 2.6 }, 33.15, 0.28);
  PEN(ell(hx, hy - 54, 24, 14, 0, Math.PI, Math.PI * 2, 16), { layer: 'light', w: 1.6 }, 33.40, 0.16);
  // Exoskeleton torso with beveled chest frame
  const hTorso = roundRectPoly(hx - 54, hy - 36, 108, 104, 16);
  PEN(hTorso.concat([hTorso[0]]), { w: 2.9 }, 33.56, 0.42);
  // Shoulder joints + articulated Left Arm holding App/Browser window
  PEN(ell(hx - 58, hy - 14, 9, 9), { w: 2.3 }, 33.96, 0.12);
  PEN([[hx - 66, hy - 8], [hx - 88, hy + 16], [hx - 78, hy + 34]], { w: 2.6 }, 34.08, 0.22);
  const appWin = roundRectPoly(hx - 110, hy + 26, 48, 34, 6);
  BLOB(appWin, C.sage, { dx: 3, dy: 2, a: 0.72, sp: 6 }, 34.28, 0.18);
  PEN(appWin.concat([appWin[0]]), { w: 2.0 }, 34.44, 0.20);
  PEN([[hx - 104, hy + 38], [hx - 70, hy + 38]], { w: 1.6 }, 34.62, 0.10);
  PEN([[hx - 102, hy + 48], [hx - 76, hy + 48]], { w: 1.6 }, 34.70, 0.10);
  // Shoulder joint + articulated Right Arm holding Pen/Wrench Tool & Cog
  PEN(ell(hx + 58, hy - 14, 9, 9), { w: 2.3 }, 34.78, 0.12);
  PEN([[hx + 66, hy - 8], [hx + 94, hy + 14], [hx + 86, hy + 36]], { w: 2.6 }, 34.90, 0.22);
  const mailMini = rectPoly(hx + 84, hy - 32, 34, 24);
  BLOB(mailMini, C.mustard, { dx: 3, dy: 2, a: 0.80, sp: 5 }, 35.10, 0.16);
  PEN(mailMini.concat([mailMini[0]]), { w: 1.9 }, 35.24, 0.16);
  PEN([[hx + 84, hy - 32], [hx + 101, hy - 18], [hx + 118, hy - 32]], { w: 1.7 }, 35.38, 0.12);
  PEN(ell(hx + 96, hy + 42, 12, 12), { w: 2.2 }, 35.48, 0.14);
  PEN([[hx + 96, hy + 26], [hx + 96, hy + 58]], { w: 1.8 }, 35.60, 0.08);
  PEN([[hx + 80, hy + 42], [hx + 112, hy + 42]], { w: 1.8 }, 35.66, 0.08);
  // Fill torso & write Zone 4 header
  BLOB(hTorso, C.terra, { dx: 6, dy: 5, a: 0.78, sp: 8 }, 35.72, 0.48);
  TXT('Harness = Badan & Alat', z4x - 165, z4y - 146, 30, { f: 'CB', k: 0.90, tEnd: 45.2 }, 36.15, 0.62);

  // S5 (38.03 - 45.41s): Brain docks into Harness Socket + Holes as Layers -> AI AGENT!
  arrow([[jx + 16, jy - 52], [jx + 112, jy - 78], [hx - 4, hy - 72]], { layer: 'coral', w: 3.1, head: 14 }, 38.04, 0.34);
  const dockedBrain = brainPath(hx, hy - 54, 30, 20);
  BLOB(dockedBrain, C.slate, { dx: 4, dy: 3, a: 0.88, sp: 6 }, 38.34, 0.26);
  PEN(dockedBrain.concat([dockedBrain[0]]), { w: 2.4 }, 38.56, 0.24);
  PEN(ell(hx, hy - 54, 36, 25, 0, Math.PI * 0.95, Math.PI * 2.05, 22), { layer: 'coral', w: 2.2 }, 38.76, 0.18);

  // Holes as Layers cutaway chest panel + coral neural wiring
  const chestHole = roundRectPoly(hx - 40, hy - 22, 80, 78, 10);
  OCC(chestHole, 38.92, ['light', 'graph', 'coral'], true);
  S.addSFX({ t: 38.92, type: 'pop', d: 0.15, pan: 0.1 });
  PEN(chestHole.concat([chestHole[0]]), { w: 2.4, layer: 'coral' }, 38.95, 0.32);

  PEN([[hx, hy - 34], [hx, hy + 6]], { layer: 'coral', w: 2.8 }, 39.26, 0.18);
  PEN([[hx, hy + 6], [hx - 24, hy + 26]], { layer: 'coral', w: 2.3 }, 39.42, 0.14);
  PEN([[hx, hy + 6], [hx + 24, hy + 26]], { layer: 'coral', w: 2.3 }, 39.54, 0.14);
  // Checked action card popping cleanly right next to torso
  const taskCard = roundRectPoly(hx + 76, hy + 4, 42, 28, 6);
  BLOB(taskCard, C.sage, { dx: 3, dy: 2, a: 0.85, sp: 5, replace: true }, 39.68, 0.22);
  PEN(taskCard.concat([taskCard[0]]), { w: 2.0 }, 39.88, 0.18);
  PEN([[hx + 86, hy + 18], [hx + 94, hy + 24], [hx + 108, hy + 10]], { layer: 'coral', w: 2.6 }, 40.04, 0.20);

  const agBadge = roundRectPoly(z4x - 165, z4y + 50, 220, 52, 12);
  BLOB(agBadge, C.ochre, { dx: 6, dy: 5, a: 0.85, sp: 7 }, 40.45, 0.38);
  PEN(agBadge.concat([agBadge[0]]), { w: 2.6 }, 40.82, 0.35);
  TXT('= AI AGENT', z4x - 148, z4y + 86, 36, { f: 'CB', k: 0.92, tEnd: 46.0 }, 41.15, 0.48);

  const gptBub = roundRectPoly(z4x - 155, z4y + 112, 198, 42, 12);
  S.addSFX({ t: 42.75, type: 'pop', d: 0.14, pan: -0.15 });
  BLOB(gptBub, C.slate, { dx: 4, dy: 3, a: 0.55, sp: 7 }, 42.75, 0.26);
  PEN(gptBub.concat([gptBub[0]]), { w: 2.2 }, 42.98, 0.22);
  TXT('Kayak ChatGPT?', z4x - 140, z4y + 141, 27, { f: 'CB', k: 0.90, tEnd: 46.5 }, 43.08, 0.42);

  // =========================================================================
  // SHOT 6 (45.41 - 53.65s): Mitos Versi Gratis = AI Bodoh?
  // =========================================================================
  const z5x = 290, z5y = 1105;
  drawMurid(z5x - 102, z5y + 6, 'frown', C.grey, 45.55, 1.35, { shirtCol: C.lav });

  const mythBox = roundRectPoly(z5x - 10, z5y - 68, 194, 104, 10);
  BLOB(mythBox, C.grey, { dx: 6, dy: 5, a: 0.70, sp: 8 }, 46.95, 0.38);
  PEN(mythBox.concat([mythBox[0]]), { w: 2.5 }, 47.32, 0.38);
  TXT('Versi Gratis', z5x + 12, z5y - 26, 27, { f: 'CB', k: 0.88, tEnd: 54.0 }, 47.72, 0.40);
  TXT('= AI Bodoh?', z5x + 12, z5y + 12, 29, { f: 'CB', k: 0.90, tEnd: 54.0 }, 48.18, 0.42);
  PEN(bez([z5x - 122, z5y - 86], [z5x - 108, z5y - 102], [z5x - 94, z5y - 80], [z5x - 80, z5y - 98]), { w: 2.2 }, 48.85, 0.35);

  PEN([[z5x - 4, z5y - 62], [z5x + 176, z5y + 30]], { layer: 'coral', w: 5.5 }, 50.55, 0.28);
  PEN([[z5x + 176, z5y - 62], [z5x - 4, z5y + 30]], { layer: 'coral', w: 5.5 }, 50.85, 0.28);
  TXT('Salah Kaprah!', z5x - 8, z5y + 76, 34, { f: 'CB', layer: 'coral', k: 0.92, tEnd: 54.0 }, 51.20, 0.55);
  arrow([[z5x + 185, z5y - 12], [z5x + 218, z5y - 22], [z5x + 245, z5y - 12]], { layer: 'coral', w: 3.4, head: 15 }, 52.10, 0.65);

  // =========================================================================
  // SHOT 7 (53.65 - 61.29s): Extreme Scale Contrast — 1 Stadion vs Seruangan
  // =========================================================================
  const z6x = 765, z6y = 1105;
  const baseY = z6y + 68; // 1173 shared ground horizon
  PEN([[540, baseY], [1016, baseY]], { w: 2.2, layer: 'light' }, 53.75, 0.22);

  // Colossal 290x175px Library Stadium (Model Pintar)
  const stCx = 692, stL = 548, stR = 836, stTopWall = 1068;
  const stadDome = ell(stCx, stTopWall, 144, 68, 0, Math.PI, Math.PI * 2, 34);
  const stadSil = stadDome.concat([[stR, baseY], [stL, baseY]]);
  PEN(stadSil.concat([stadSil[0]]), { w: 2.9 }, 53.95, 0.52);
  // Two-tier horizontal ledge + upper golden bookshelf gallery band
  PEN([[stL + 8, 1104], [stR - 8, 1104]], { w: 2.2 }, 54.48, 0.16);
  BLOB(rectPoly(stL + 16, 1072, 256, 28), C.ochre, { dx: 4, dy: 3, a: 0.62, sp: 7 }, 54.62, 0.26);
  // Upper tier visible book stacks + lower arched colonnade bays
  for (let b = 0; b < 6; b++) {
    const bx = stL + 22 + b * 42;
    PEN([[bx, 1104], [bx, baseY]], { w: 2.1 }, 54.86 + b * 0.05, 0.10);
    PEN(ell(bx + 21, 1134, 15, 16, 0, Math.PI, Math.PI * 2, 12), { w: 1.9 }, 54.90 + b * 0.05, 0.10);
  }
  BLOB(stadDome.concat([[stR, stTopWall], [stL, stTopWall]]), C.slate, { dx: 7, dy: 5, a: 0.82, sp: 8 }, 55.20, 0.36);
  BLOB(rectPoly(stL + 4, 1106, 280, 64), C.slate, { dx: 7, dy: 5, a: 0.56, sp: 9 }, 55.55, 0.38);
  // Two tiny 14px stick-figure humans at stadium entrance for scale shock
  for (const fx of [stCx - 22, stCx + 24]) {
    PEN(ell(fx, baseY - 12, 2.5, 2.5), { layer: 'coral', w: 2.0 }, 55.92, 0.08);
    PEN([[fx, baseY - 9], [fx, baseY]], { layer: 'coral', w: 2.1 }, 55.96, 0.08);
  }
  TXT('1 Stadion', 620, 990, 32, { f: 'CB', k: 0.90, tEnd: 61.5 }, 54.25, 0.42);
  TXT('Model Pintar', 618, 1208, 26, { f: 'CM', k: 0.85, tEnd: 61.5 }, 54.68, 0.42);

  // Tiny 54x42px Shoebox Kiosk ("Seruangan" - Versi Gratis) sitting on same horizon
  const rx0 = 900, ry0 = baseY - 42, rw = 54, rh = 42; // 900..954, 1131..1173
  const roomBox = rectPoly(rx0, ry0, rw, rh);
  const roomRoof = [[rx0 - 5, ry0], [rx0 + rw * 0.5, ry0 - 18], [rx0 + rw + 5, ry0]];
  TXT('vs', 852, 1146, 28, { f: 'CB', layer: 'coral', pass: true }, 57.10, 0.22);
  PEN(roomBox.concat([roomBox[0]]), { w: 2.5 }, 57.32, 0.34);
  PEN(roomRoof, { w: 2.5 }, 57.66, 0.24);
  PEN(rectPoly(rx0 + 12, ry0 + 14, 16, 28).concat([[rx0 + 12, ry0 + 14]]), { w: 1.7 }, 57.88, 0.16);
  BLOB(roomBox, C.lav, { dx: 4, dy: 3, a: 0.78, sp: 6 }, 58.02, 0.32);
  TXT('Seruangan', 886, 1198, 22, { f: 'CB', k: 0.90, tEnd: 65.2 }, 58.36, 0.36);
  TXT('Versi Gratis', 886, 1222, 19, { f: 'CM', k: 0.85, tEnd: 65.2 }, 58.74, 0.36);
  const costTag = roundRectPoly(962, 1136, 62, 28, 7);
  BLOB(costTag, C.mustard, { dx: 3, dy: 2, a: 0.86, sp: 5, replace: true }, 59.35, 0.30);
  TXT('Murah', 967, 1156, 18, { f: 'CB', k: 0.9, pass: true }, 59.65, 0.26);

  // =========================================================================
  // SHOT 8 (61.29 - 64.98s): Oversized Block Shatter -> "HALU!"
  // =========================================================================
  const bx0 = 860, by0 = 1044, bw = 134, bh = 44; // 2.5x wider than 54px tiny room!
  const beratBox = roundRectPoly(bx0, by0, bw, bh, 7);
  PEN(beratBox.concat([beratBox[0]]), { w: 2.5 }, 61.38, 0.28);
  BLOB(beratBox, C.terra, { dx: 5, dy: 4, a: 0.86, sp: 6 }, 61.66, 0.22);
  TXT('Tugas Berat', bx0 + 12, by0 + 30, 24, { f: 'CB', k: 0.9, tEnd: 65.0 }, 61.82, 0.28);
  OCC(roundRectPoly(bx0 - 4, by0 - 4, bw + 14, bh + 14, 8), 62.12, [], true);
  S.addSFX({ t: 62.12, type: 'shatter', d: 0.45, pan: 0.15 });
  PEN(beratBox.concat([beratBox[0]]), { w: 2.5 }, 62.13, 0.08);
  PEN([[908, 1106], [920, 1094], [932, 1108]], { layer: 'coral', w: 2.3 }, 62.18, 0.12);
  PEN([[944, 1108], [954, 1096]], { layer: 'coral', w: 2.2 }, 62.24, 0.10);

  const chips = [];
  for (let i = 0; i < 72; i++) {
    const a = -Math.PI * 0.92 + (i * 0.25);
    const sp = 60 + ((i * 37) % 155);
    const cols = [C.terra, C.lav, C.mustard, C.coral];
    chips.push({
      x0: bx0 + 18 + ((i * 19) % 98),
      y0: by0 + 10 + ((i * 13) % 24),
      vx: Math.cos(a) * sp * 0.85,
      vy: Math.sin(a) * sp * 0.68 - 22,
      rot: (i * 0.7) % 6.2,
      vr: ((i % 2 ? 1 : -1) * (2 + (i % 5))),
      w: 10 + (i % 9),
      h: 7 + (i % 6),
      col: cols[i % cols.length]
    });
  }
  S.addDYN({
    t0: 62.12,
    t1: 64.95,
    draw(t, c, dctx, toScr) {
      const dt = t - 62.12;
      const fade = Math.max(0, Math.min(1, (64.95 - t) / 0.35));
      dctx.save();
      dctx.globalAlpha = 0.88 * fade;
      for (const p of chips) {
        const wx = p.x0 + p.vx * dt;
        const wy = p.y0 + p.vy * dt + 185 * dt * dt;
        const [sx, sy] = toScr(c, wx, wy);
        dctx.save();
        dctx.translate(sx, sy);
        dctx.rotate(p.rot + p.vr * dt);
        dctx.fillStyle = p.col;
        dctx.fillRect(-p.w * 0.5 * c.z, -p.h * 0.5 * c.z, p.w * c.z, p.h * c.z);
        dctx.restore();
      }
      dctx.restore();
    }
  });

  // Cleanly positioned "HALU!" right above shatter in open paper (0 overlaps!)
  TXT('HALU!', 886, 1020, 34, { f: 'CB', layer: 'coral', k: 0.95, tEnd: 65.2 }, 62.55, 0.36);
  starBurst(984, 1004, 14, 28, 5, { layer: 'coral', w: 2.5 }, 63.05, 0.36);

  // =========================================================================
  // SHOT 9 (64.98 - 73.85s): Kunci Trik di Koridor Bersih (y=505..580)
  // =========================================================================
  const z9x = 710, z9y = 522;
  const kRing = ell(z9x - 105, z9y, 24, 24, 0, 0, Math.PI * 2, 24);
  BLOB(kRing, C.mustard, { dx: 4, dy: 3, a: 0.88, sp: 6 }, 65.45, 0.32);
  PEN(kRing, { w: 2.7 }, 65.72, 0.32);
  PEN([[z9x - 81, z9y], [z9x - 24, z9y], [z9x - 24, z9y + 14], [z9x - 36, z9y + 14], [z9x - 36, z9y]], { w: 2.9 }, 66.08, 0.42);
  TXT('Bukan cuma model mahal!', z9x - 175, z9y + 44, 30, { f: 'CB', k: 0.90, tEnd: 74.0 }, 66.65, 0.68);

  circleStroke(stairSpecs[1].x + 46, stairSpecs[1].y + 48, 56, { layer: 'coral', w: 3.1, ry: 48 }, 68.85, 0.58);
  TXT('Ada triknya?!', z9x + 8, z9y + 2, 34, { f: 'CB', layer: 'coral', k: 0.92, tEnd: 74.0 }, 70.45, 0.58);
  starBurst(z9x + 148, z9y - 12, 15, 28, 5, { layer: 'coral', w: 2.5 }, 71.45, 0.42);

  // =========================================================================
  // SHOT 10 (73.85 - 80.01s): Sequential Marks (1 tight cluster at a time -> 0 FPS drop)
  // =========================================================================
  BLOB(murid1Aura, C.mustard, { dx: 8, dy: 6, a: 0.82, sp: 10, replace: true }, 74.20, 0.58);
  TXT('AHA!', z1x - 190, z1y - 72, 34, { f: 'CB', layer: 'coral', pass: true }, 74.85, 0.26);

  PEN([[stairSpecs[0].x + 22, stairSpecs[0].y - 18], [stairSpecs[0].x + 40, stairSpecs[0].y - 4], [stairSpecs[0].x + 76, stairSpecs[0].y - 36]], { layer: 'coral', w: 4.5 }, 75.20, 0.34);

  // Main Page Title written sequentially in reserved top-right empty header space
  BLOB(roundRectPoly(622, 146, 260, 48, 10), C.mustard, { dx: 6, dy: 5, a: 0.88, sp: 7 }, 75.65, 0.40);
  TXT('4 TANGGA AI', 485, 188, 66, { f: 'CB', k: 0.94, tEnd: 80.5 }, 76.12, 0.88);
  PEN([[485, 200], [885, 198]], { layer: 'coral', w: 5.0 }, 77.08, 0.38);

  // Sequential footer doodle band & margin dashed guide
  PEN([[70, 1260], [1010, 1260]], { layer: 'light', w: 1.4, p: 0.45, ghost: true }, 77.52, 0.22);
  const swatches = [C.sage, C.slate, C.terra, C.lav, C.mustard];
  swatches.forEach((sc, idx) => {
    const tSw = 77.78 + idx * 0.18;
    const sx = 120 + idx * 185, sy = 1285;
    const swPoly = roundRectPoly(sx, sy, 120, 32, 8);
    BLOB(swPoly, sc, { dx: 4, dy: 3, a: 0.80, sp: 7, ghost: true }, tSw, 0.10);
    PEN(swPoly.concat([swPoly[0]]), { w: 2.0, ghost: true }, tSw + 0.10, 0.06);
  });
  dashedLine([975, 1140], [1005, 820], 14, 10, { layer: 'light', w: 2.0, ghost: true }, 78.72, 0.26);
  dashedLine([1005, 820], [990, 430], 14, 10, { layer: 'light', w: 2.0, ghost: true }, 79.00, 0.26);

  // =========================================================================
  // CAMERA CHOREOGRAPHY (Smooth continuous glides, 0 jarring cuts)
  // =========================================================================
  S.setCAM([
    { t: 0.00,              x: z1x - 10,  y: camY(z1y, 1.56), z: 1.56, r: -1.8, k: 'g' },
    { t: 4.50,              x: z1x,       y: camY(z1y + 12, 1.62), z: 1.62, r: -0.9, k: 'g' },
    { t: s1.end,            x: z1x + 20,  y: camY(z1y + 16, 1.66), z: 1.66, r: -0.5, k: 'd' },

    { t: s2.start + 0.82,   x: z2x - 10,  y: camY(z2y, 1.54), z: 1.54, r: 1.6,  k: 'g' },
    { t: s2.end - 0.55,     x: stairSpecs[0].x + 70, y: camY(z2y + 28, 1.72), z: 1.72, r: 0.4, k: 'd' },

    // Shot 3: Immersive continuous glide down-left along coral arrow onto Zone 3 magnifier
    { t: s3.start + 0.38,   x: 515,       y: camY(555, 1.38), z: 1.38, r: -0.6, k: 'g' },
    { t: s3.start + 1.15,   x: z3x,       y: camY(z3y, 1.64), z: 1.64, r: -1.3, k: 'g' },
    { t: 26.40,             x: z3x + 12,  y: camY(z3y + 8, 1.74), z: 1.74, r: -0.7, k: 'g' },
    { t: 26.62,             x: z3x + 36,  y: camY(z3y + 22, 1.88), z: 1.88, r: -0.4, k: 'p' },
    { t: s3.end,            x: z3x + 15,  y: camY(z3y + 12, 1.66), z: 1.66, r: -0.5, k: 'd' },

    { t: s4.start + 0.80,   x: z4x - 10,  y: camY(z4y - 12, 1.60), z: 1.60, r: 1.8,  k: 'g' },
    { t: s4.end,            x: z4x + 4,   y: camY(z4y - 4, 1.62), z: 1.62, r: 0.8,  k: 'd' },

    { t: s5.start + 0.58,   x: z4x + 12,  y: camY(z4y + 4, 1.72), z: 1.72, r: -0.9, k: 'p' },
    { t: s5.end + 0.25,     x: z4x - 8,   y: camY(z4y + 22, 1.66), z: 1.66, r: 0.4,  k: 'd' },

    { t: s6.start + 1.00,   x: z5x,       y: camY(z5y, 1.66), z: 1.66, r: -2.0, k: 'g' },
    { t: 50.55,             x: z5x + 18,  y: camY(z5y + 6, 1.74), z: 1.74, r: -0.9, k: 'p' },
    { t: s6.end,            x: z5x + 25,  y: camY(z5y + 8, 1.68), z: 1.68, r: -0.6, k: 'd' },

    // Shot 7a (wide 1 Stadion + tiny kiosk) -> Shot 7b (tight zoom onto tiny kiosk!)
    { t: s7.start + 0.82,   x: 760,       y: camY(1105, 1.48), z: 1.48, r: 1.2,  k: 'g' },
    { t: 57.55,             x: 766,       y: camY(1110, 1.50), z: 1.50, r: 0.8,  k: 'd' },
    { t: 58.45,             x: 928,       y: camY(1148, 2.32), z: 2.32, r: -0.6, k: 'g' },
    { t: s7.end,            x: 928,       y: camY(1148, 2.30), z: 2.30, r: -0.6, k: 'd' },

    // Shot 8: Oversized Tugas Berat crate drops onto tiny kiosk & shatters!
    { t: s8.start + 0.42,   x: 928,       y: camY(1118, 2.08), z: 2.08, r: -1.1, k: 'p' },
    { t: s8.end,            x: 928,       y: camY(1112, 2.04), z: 2.04, r: -0.7, k: 'd' },

    { t: s9.start + 0.85,   x: z9x - 12,  y: camY(z9y - 18, 1.54), z: 1.54, r: 1.2,  k: 'g' },
    { t: 70.35,             x: z9x + 14,  y: camY(z9y - 34, 1.68), z: 1.68, r: -0.5, k: 'p' },
    { t: s9.end,            x: z9x + 10,  y: camY(z9y - 28, 1.64), z: 1.64, r: -0.3, k: 'd' },

    // Shot 10: Pinch-out full whole-page view (0 deg)
    { t: s10.start + 1.05,  x: 540,       y: 970, z: 0.90, r: 0.0, k: 'g' },
    { t: sched.total,       x: 540,       y: 970, z: 0.90, r: 0.0, k: 'd' }
  ]);
};

// Dedicated Clean Cover Thumbnail (?thumb=1)
window.buildThumbnailMarks = function buildThumbnailMarks(S) {
  const { C, PEN, BLOB, TXT, ell, roundRectPoly, starBurst } = S;

  PEN([[80, 290], [1000, 290]], { layer: 'light', w: 1.6, p: 0.5 }, 0, 0.1);
  PEN([[80, 1460], [1000, 1460]], { layer: 'light', w: 1.6, p: 0.5 }, 0, 0.1);

  const pill = roundRectPoly(305, 225, 470, 58, 16);
  BLOB(pill, C.slate, { dx: 6, dy: 5, a: 0.85, sp: 8 }, 0, 0.1);
  PEN(pill.concat([pill[0]]), { w: 3.0 }, 0, 0.1);
  TXT('BELAJAR AI DARI NOL', 345, 266, 38, { f: 'CB', k: 0.95 }, 0, 0.1);

  BLOB(roundRectPoly(355, 326, 475, 92, 14), C.mustard, { dx: 8, dy: 7, a: 0.92, sp: 8 }, 0, 0.1);
  TXT('4 TANGGA AI', 175, 405, 118, { f: 'CB', k: 0.96 }, 0, 0.1);
  PEN([[175, 424], [895, 420]], { layer: 'coral', w: 6.8 }, 0, 0.1);

  const ax = 305, ay = 780;
  BLOB(ell(ax, ay + 25, 185, 235, -0.05, 0, Math.PI * 2, 36), C.sage, { dx: 10, dy: 8, a: 0.38, sp: 12 }, 0, 0.1);
  const head = ell(ax, ay - 95, 82, 54, 0, 0, Math.PI * 2, 32);
  BLOB(head, C.slate, { dx: 7, dy: 6, a: 0.85, sp: 8 }, 0, 0.1);
  PEN(head, { w: 3.4 }, 0, 0.1);
  PEN([[ax, ay - 144], [ax, ay - 46]], { w: 2.2 }, 0, 0.1);
  TXT('LLM', ax - 42, ay - 80, 42, { f: 'CB', k: 0.95 }, 0, 0.1);

  const body = roundRectPoly(ax - 88, ay - 26, 176, 185, 22);
  BLOB(body, C.terra, { dx: 9, dy: 7, a: 0.82, sp: 9 }, 0, 0.1);
  PEN(body.concat([body[0]]), { w: 3.6 }, 0, 0.1);
  const win = roundRectPoly(ax - 55, ay + 12, 110, 108, 12);
  PEN(win.concat([win[0]]), { layer: 'coral', w: 3.0 }, 0, 0.1);
  TXT('Harness', ax - 54, ay + 78, 38, { f: 'CB', k: 0.92 }, 0, 0.1);

  const sx0 = 545, sy0 = 1040;
  PEN([[sx0 - 15, sy0 + 4], [990, sy0 + 4]], { w: 3.2 }, 0, 0.1);
  const steps = [
    { n: '01', x: 550, y: 890, w: 102, h: 150, col: C.sage, solid: true },
    { n: '02', x: 660, y: 810, w: 102, h: 230, col: C.mustard, solid: false },
    { n: '03', x: 770, y: 730, w: 102, h: 310, col: C.slate, solid: false },
    { n: '04', x: 880, y: 645, w: 102, h: 395, col: C.lav, solid: false }
  ];
  steps.forEach(st => {
    const p = roundRectPoly(st.x, st.y, st.w, st.h, 10);
    BLOB(p, st.col, { dx: 6, dy: 5, a: st.solid ? 0.86 : 0.45, sp: 8, stop: st.solid ? 1 : 0.45 }, 0, 0.1);
    PEN(p.concat([p[0]]), { w: st.solid ? 3.2 : 2.2 }, 0, 0.1);
    TXT(st.n, st.x + 18, st.y + 44, 38, { f: 'CB', k: 0.92 }, 0, 0.1);
  });
  starBurst(600, 860, 42, 65, 6, { layer: 'coral', w: 3.4 }, 0, 0.1);

  const bot = roundRectPoly(150, 1185, 780, 74, 16);
  BLOB(bot, C.mustard, { dx: 7, dy: 6, a: 0.88, sp: 8 }, 0, 0.1);
  PEN(bot.concat([bot[0]]), { w: 3.2 }, 0, 0.1);
  TXT('Otak + Badan + Ukuran Model', 210, 1236, 48, { f: 'CB', k: 0.95 }, 0, 0.1);
};
