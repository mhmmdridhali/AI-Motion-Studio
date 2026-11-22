'use strict';

// =========================================================================
// Editorial Sketch Illustration Helpers — Tangga 02: AI Tools Mastery
// Pure Canvas 2D primitives (PEN, BLOB, OCC, TXT, bez, ell) for ipad-sketch
// =========================================================================
(function () {
  const mkT = (cx, cy, sc, rot = 0) => {
    const c = Math.cos(rot), s = Math.sin(rot);
    return (lx, ly) => [
      cx + (lx * c - ly * s) * sc,
      cy + (lx * s + ly * c) * sc,
    ];
  };
  const mapPts = (pts, tf) => pts.map(([x, y]) => tf(x, y));

  // ---------- 1. Human Characters (Murid & Mentor) ----------
  window.drawPerson = function drawPerson(cx, cy, sc, role, mood, t0, d, o) {
    o = o || {};
    const tf = mkT(cx, cy, sc, o.rot || 0);
    const gh = !!o.ghost;
    const wMain = o.w ?? 2.4;
    const tEnd = t0 + d;
    let cur = t0;
    const step = k => { const s = cur; cur += d * k; return [s, d * k]; };

    // Sweater / shirt shoulders wash + outline
    const torsoPts = [
      tf(-34, 48), tf(-28, 22), tf(-12, 16), tf(12, 16), tf(28, 22), tf(34, 48), tf(-34, 48),
    ];
    const [bT0, bTd] = step(0.22);
    const coatCol = role === 'mentor' ? C.sage : (mood === 'excited' ? C.mustard : C.sky);
    BLOB(torsoPts.slice(0, -1), coatCol, { dx: 5, dy: 4, a: 0.72, ghost: gh }, bT0, bTd);
    PEN(torsoPts, { w: wMain, smooth: false, ghost: gh }, bT0 + bTd * 0.25, bTd * 0.75);

    // Mentor collar V-neck or Murid scarf/collar
    const [cT0, cTd] = step(0.10);
    if (role === 'mentor') {
      PEN([tf(-12, 16), tf(0, 32), tf(12, 16)], { w: wMain * 0.85, smooth: false, ghost: gh }, cT0, cTd);
    } else {
      PEN([tf(-14, 17), tf(0, 24), tf(14, 17)], { w: wMain * 0.85, ghost: gh }, cT0, cTd);
    }

    // Head oval
    const [hT0, hTd] = step(0.22);
    const head = mapPts(ell(0, -10, 21, 24, 0, 0, TAU, 24), tf);
    BLOB(head, C.creamDark, { dx: 4, dy: 3, a: 0.55, ghost: gh }, hT0, hTd * 0.6);
    PEN(head, { w: wMain, wob: 0.45, ghost: gh }, hT0, hTd);

    // Hair & Glasses / Face expressions
    const [fT0, fTd] = step(0.24);
    if (role === 'murid') {
      // Friendly top/side bun & bangs
      const bun = mapPts(ell(-18, -32, 11, 10, -0.3, 0, TAU, 16), tf);
      BLOB(bun, C.graphite, { dx: 2, dy: 2, a: 0.35, ghost: gh }, fT0, fTd * 0.4);
      PEN(bun, { w: wMain * 0.9, ghost: gh }, fT0, fTd * 0.4);
      PEN([tf(-19, -18), tf(-4, -30), tf(18, -22)], { w: wMain, ghost: gh }, fT0 + fTd * 0.2, fTd * 0.4);
    } else {
      // Mentor swoop hair + signature round glasses
      PEN([tf(-20, -16), tf(-8, -36), tf(14, -34), tf(21, -18)], { w: wMain, ghost: gh }, fT0, fTd * 0.35);
      PEN(mapPts(ell(-7, -11, 6.5, 6, 0, 0, TAU, 14), tf), { w: 1.9, ghost: gh }, fT0 + fTd * 0.35, fTd * 0.25);
      PEN(mapPts(ell(9, -11, 6.5, 6, 0, 0, TAU, 14), tf), { w: 1.9, ghost: gh }, fT0 + fTd * 0.55, fTd * 0.25);
      PEN([tf(-1, -11), tf(3, -11)], { w: 1.9, ghost: gh }, fT0 + fTd * 0.78, fTd * 0.12);
    }

    // Eyes & Mouth per mood
    const [mT0, mTd] = step(0.22);
    if (role !== 'mentor') {
      PEN([tf(-7, -12), tf(-7, -9)], { w: 2.8, ghost: gh }, mT0, mTd * 0.2);
      PEN([tf(8, -12), tf(8, -9)], { w: 2.8, ghost: gh }, mT0 + mTd * 0.2, mTd * 0.2);
    }
    if (mood === 'confused') {
      // Wavy confused mouth + raised scratching hand
      PEN([tf(-8, -21), tf(-2, -18)], { w: 2.0, ghost: gh }, mT0, mTd * 0.2);
      PEN([tf(4, -18), tf(11, -22)], { w: 2.0, ghost: gh }, mT0 + mTd * 0.15, mTd * 0.2);
      PEN([tf(-6, 4), tf(-1, 1), tf(4, 4), tf(8, 2)], { w: 2.1, ghost: gh }, mT0 + mTd * 0.3, mTd * 0.25);
      PEN([tf(-29, 32), tf(-42, 4), tf(-24, -16)], { w: wMain * 0.9, layer: 'graph', ghost: gh }, mT0 + mTd * 0.45, mTd * 0.5);
    } else if (mood === 'excited') {
      // Big cheering smile + arms up V
      PEN([tf(-8, 1), tf(0, 8), tf(8, 1)], { w: 2.3, layer: 'coral', ghost: gh }, mT0 + mTd * 0.2, mTd * 0.3);
      PEN([tf(-30, 26), tf(-48, -10), tf(-44, -22)], { w: wMain, ghost: gh }, mT0 + mTd * 0.35, mTd * 0.32);
      PEN([tf(30, 26), tf(48, -10), tf(44, -22)], { w: wMain, ghost: gh }, mT0 + mTd * 0.65, mTd * 0.32);
    } else if (mood === 'phone') {
      // Smiling + holding upright phone
      PEN([tf(-6, 2), tf(0, 6), tf(6, 2)], { w: 2.2, ghost: gh }, mT0 + mTd * 0.2, mTd * 0.25);
      PEN([tf(26, 28), tf(40, 12)], { w: wMain * 0.9, ghost: gh }, mT0 + mTd * 0.35, mTd * 0.25);
      const ph = mapPts([[38, -14], [58, -14], [58, 18], [38, 18], [38, -14]], tf);
      BLOB(ph.slice(0, -1), C.teal, { dx: 3, dy: 3, a: 0.72, ghost: gh }, mT0 + mTd * 0.55, mTd * 0.2);
      PEN(ph, { w: 2.2, smooth: false, ghost: gh }, mT0 + mTd * 0.65, mTd * 0.35);
    } else if (mood === 'climber') {
      // Small energetic climber pointing up-right
      PEN([tf(-6, 2), tf(0, 7), tf(6, 2)], { w: 2.0, ghost: gh }, mT0 + mTd * 0.2, mTd * 0.25);
      PEN([tf(26, 24), tf(50, -6)], { w: wMain, layer: 'coral', ghost: gh }, mT0 + mTd * 0.45, mTd * 0.55);
    } else {
      // 'pointing' / warm smile Mentor pointing right
      PEN([tf(-6, 1), tf(1, 6), tf(8, 1)], { w: 2.2, ghost: gh }, mT0 + mTd * 0.2, mTd * 0.35);
      PEN([tf(28, 28), tf(52, 16), tf(62, 14)], { w: wMain, layer: 'coral', ghost: gh }, mT0 + mTd * 0.5, mTd * 0.5);
    }
    return tEnd;
  };

  // ---------- 2. Expressive AI Robot Buddy ----------
  window.drawRobot = function drawRobot(cx, cy, sc, mood, t0, d, o) {
    o = o || {};
    const tf = mkT(cx, cy, sc, o.rot || 0);
    const gh = !!o.ghost;
    const layerMain = o.layer || 'graph';
    const wMain = o.w ?? 2.4;

    if (mood === 'mini') {
      // Compact dashed agent robot silhouette (layer: light)
      const hd = mapPts(roundedRectPts(-16, -22, 32, 24, 6), tf);
      PEN(hd.concat([hd[0]]), { w: 1.9, layer: 'light', smooth: false, ghost: gh }, t0, d * 0.45);
      PEN([tf(0, -22), tf(0, -32)], { w: 1.9, layer: 'light', ghost: gh }, t0 + d * 0.45, d * 0.2);
      PEN([tf(-6, -11), tf(-4, -11)], { w: 2.4, layer: 'light', ghost: gh }, t0 + d * 0.65, d * 0.12);
      PEN([tf(4, -11), tf(6, -11)], { w: 2.4, layer: 'light', ghost: gh }, t0 + d * 0.78, d * 0.12);
      return t0 + d;
    }

    const bodyCol = mood === 'dizzy' ? C.terracotta : (mood === 'butler' ? C.teal : C.sage);
    const headPoly = mapPts(roundedRectPts(-28, -28, 56, 42, 12), tf);
    const visorPoly = mapPts(roundedRectPts(-20, -19, 40, 24, 6), tf);
    const bodyPoly = mapPts(roundedRectPts(-24, 18, 48, 30, 10), tf);

    BLOB(headPoly, bodyCol, { dx: 5, dy: 4, a: 0.72, cuts: [visorPoly], ghost: gh }, t0, d * 0.22);
    BLOB(bodyPoly, bodyCol, { dx: 5, dy: 4, a: 0.78, ghost: gh }, t0 + d * 0.14, d * 0.18);
    PEN(headPoly.concat([headPoly[0]]), { w: wMain, layer: layerMain, smooth: false, ghost: gh }, t0 + d * 0.20, d * 0.22);
    PEN(visorPoly.concat([visorPoly[0]]), { w: 1.9, layer: layerMain, smooth: false, ghost: gh }, t0 + d * 0.36, d * 0.14);
    PEN(bodyPoly.concat([bodyPoly[0]]), { w: wMain, layer: layerMain, smooth: false, ghost: gh }, t0 + d * 0.46, d * 0.16);

    // Antenna
    if (mood === 'dizzy') {
      PEN([tf(0, -28), tf(-9, -40), tf(6, -48), tf(-4, -56)], { w: 2.4, layer: 'coral', smooth: false, ghost: gh }, t0 + d * 0.56, d * 0.16);
      // Crossed X eyes
      PEN([tf(-12, -12), tf(-4, -4)], { w: 2.4, layer: 'coral', ghost: gh }, t0 + d * 0.68, d * 0.08);
      PEN([tf(-4, -12), tf(-12, -4)], { w: 2.4, layer: 'coral', ghost: gh }, t0 + d * 0.76, d * 0.08);
      PEN([tf(4, -12), tf(12, -4)], { w: 2.4, layer: 'coral', ghost: gh }, t0 + d * 0.84, d * 0.08);
      PEN([tf(12, -12), tf(4, -4)], { w: 2.4, layer: 'coral', ghost: gh }, t0 + d * 0.92, d * 0.08);
    } else {
      PEN([tf(0, -28), tf(0, -45)], { w: 2.4, layer: layerMain, ghost: gh }, t0 + d * 0.58, d * 0.10);
      PEN(mapPts(ell(0, -49, 4.5, 4.5, 0, 0, TAU, 12), tf), { w: 2.4, layer: 'coral', ghost: gh }, t0 + d * 0.66, d * 0.08);
      // Happy arched eyes ^ ^
      PEN([tf(-13, -7), tf(-8, -12), tf(-3, -7)], { w: 2.3, layer: layerMain, ghost: gh }, t0 + d * 0.72, d * 0.10);
      PEN([tf(3, -7), tf(8, -12), tf(13, -7)], { w: 2.3, layer: layerMain, ghost: gh }, t0 + d * 0.80, d * 0.10);
      if (mood === 'butler') {
        // Coral bow-tie + sleek serving arm & tray
        const bow = [tf(0, 24), tf(-11, 18), tf(-11, 30), tf(0, 24), tf(11, 18), tf(11, 30), tf(0, 24)];
        PEN(bow, { w: 2.4, layer: 'coral', smooth: false, ghost: gh }, t0 + d * 0.86, d * 0.08);
        PEN([tf(24, 34), tf(44, 34), tf(48, 22)], { w: 2.3, layer: layerMain, ghost: gh }, t0 + d * 0.90, d * 0.06);
        PEN([tf(32, 22), tf(64, 22)], { w: 3.0, layer: 'coral', ghost: gh }, t0 + d * 0.94, d * 0.06);
      }
    }
    return t0 + d;
  };

  // ---------- 3. Grand Jazz Piano (S03: MALAH JAZZ!) ----------
  window.drawJazzPiano = function drawJazzPiano(cx, cy, sc, t0, d) {
    const tf = mkT(cx, cy, sc, -0.02);
    // Stage spotlight shadow beneath piano
    const stage = mapPts(ell(0, 56, 98, 26, 0, 0, TAU, 28), tf);
    BLOB(stage, C.purple, { dx: 4, dy: 3, a: 0.48 }, t0, d * 0.22);

    // Grand piano curved rim body
    const body = mapPts([
      [-68, -4], [-68, 24], [64, 24], [74, -2],
      ...bez([74, -2], [68, -32], [26, -18], [-4, -44], 12),
      ...bez([-4, -44], [-34, -64], [-64, -46], [-68, -4], 12),
    ], tf);
    BLOB(body, C.purple, { dx: 6, dy: 5, a: 0.72 }, t0 + d * 0.08, d * 0.30);
    PEN(body.concat([body[0]]), { w: 2.8, smooth: false }, t0 + d * 0.20, d * 0.25);

    // Propped-open lid triangle + prop stick
    PEN([tf(-58, -14), tf(-12, -74), tf(56, -24)], { w: 2.5, smooth: false }, t0 + d * 0.42, d * 0.14);
    PEN([tf(26, -12), tf(20, -48)], { w: 2.0, layer: 'coral' }, t0 + d * 0.54, d * 0.08);

    // Keyboard bed & black sharp keys
    PEN([tf(-62, 12), tf(62, 12)], { w: 2.2 }, t0 + d * 0.60, d * 0.10);
    for (let k = -48; k <= 44; k += 18) {
      PEN([tf(k, 12), tf(k, 21)], { w: 3.4 }, t0 + d * 0.68, d * 0.03);
    }

    // 3 tapered legs
    PEN([tf(-54, 24), tf(-50, 56)], { w: 3.2 }, t0 + d * 0.76, d * 0.08);
    PEN([tf(14, 24), tf(14, 52)], { w: 3.0 }, t0 + d * 0.84, d * 0.08);
    PEN([tf(56, 24), tf(52, 56)], { w: 3.2 }, t0 + d * 0.92, d * 0.08);

    return stage; // Returned so S04 can re-register the stage spotlight clean!
  };

  // ---------- 4. Acoustic Pop Guitar (S04: POP ✓ with Re-register stage wash) ----------
  window.drawPopGuitar = function drawPopGuitar(cx, cy, sc, stagePoly, t0, d) {
    // Native Move #2: Re-register stage spotlight from purple -> warm mustard
    if (stagePoly) {
      BLOB(stagePoly, C.mustard, { dx: 4, dy: 3, a: 0.56, replace: true }, t0, d * 0.25);
    }

    const tf = mkT(cx, cy, sc, -0.34); // Jaunty tilted acoustic pop angle
    const body = mapPts([
      ...bez([0, -28], [26, -28], [32, -6], [20, 4], 10),
      ...bez([20, 4], [42, 14], [44, 52], [0, 52], 12),
      ...bez([0, 52], [-44, 52], [-42, 14], [-20, 4], 12),
      ...bez([-20, 4], [-32, -6], [-26, -28], [0, -28], 10),
    ], tf);
    const soundHole = mapPts(ell(0, 6, 11.5, 11.5, 0, 0, TAU, 18), tf);

    // Bright mustard wood body with cut-out soundhole
    BLOB(body, C.mustard, { dx: 5, dy: 5, a: 0.90, holes: [soundHole] }, t0 + d * 0.14, d * 0.30);
    // Coral teardrop pickguard
    const guard = mapPts(ell(12, 18, 10, 14, 0.2, 0, TAU, 14), tf);
    BLOB(guard, C.coral, { dx: 3, dy: 3, a: 0.82 }, t0 + d * 0.32, d * 0.14);

    // Crisp graphite outline + soundhole + bridge
    PEN(body.concat([body[0]]), { w: 2.8 }, t0 + d * 0.38, d * 0.24);
    PEN(soundHole, { w: 2.2 }, t0 + d * 0.56, d * 0.10);
    PEN([tf(-12, 30), tf(12, 30)], { w: 3.4, layer: 'coral' }, t0 + d * 0.64, d * 0.08);

    // Fretted neck + headstock + tuning pegs
    const neck = mapPts([[-5, -26], [-5, -78], [5, -78], [5, -26]], tf);
    BLOB(neck, C.creamDark, { dx: 3, dy: 2, a: 0.85 }, t0 + d * 0.68, d * 0.10);
    PEN([tf(-5, -26), tf(-5, -78), [tf(5, -78), tf(5, -26)][0]], { w: 2.4, smooth: false }, t0 + d * 0.72, d * 0.10);
    PEN([tf(5, -78), tf(5, -26)], { w: 2.4, smooth: false }, t0 + d * 0.78, d * 0.08);
    // Headstock box
    const head = mapPts([[-8, -78], [-9, -96], [9, -96], [8, -78]], tf);
    BLOB(head, C.coral, { dx: 3, dy: 2, a: 0.72 }, t0 + d * 0.82, d * 0.08);
    PEN(head.concat([head[0]]), { w: 2.3, smooth: false }, t0 + d * 0.86, d * 0.14);
  };

  // ---------- 5. Laptop Desk & Mug (S05 Skills setup) ----------
  window.drawLaptopDesk = function drawLaptopDesk(cx, cy, sc, t0, d) {
    const tf = mkT(cx, cy, sc, 0);
    // Desk surface plank
    PEN([tf(-95, 42), tf(95, 42)], { w: 3.2 }, t0, d * 0.18);
    // Laptop screen angled
    const scr = mapPts([[-42, -16], [34, -16], [42, 30], [-34, 30]], tf);
    BLOB(scr, C.sky, { dx: 5, dy: 4, a: 0.45 }, t0 + d * 0.12, d * 0.22);
    PEN(scr.concat([scr[0]]), { w: 2.6, smooth: false }, t0 + d * 0.24, d * 0.22);
    // Keyboard base trapezoid
    PEN([tf(-34, 30), tf(42, 30), tf(58, 42), tf(-46, 42), tf(-34, 30)], { w: 2.6, smooth: false }, t0 + d * 0.44, d * 0.22);
    // Steaming coffee mug on right side
    const mug = mapPts([[62, 16], [82, 16], [80, 42], [64, 42]], tf);
    BLOB(mug, C.terracotta, { dx: 3, dy: 3, a: 0.72 }, t0 + d * 0.64, d * 0.14);
    PEN(mug.concat([mug[0]]), { w: 2.2, smooth: false }, t0 + d * 0.74, d * 0.14);
    PEN([tf(68, 8), tf(72, -4)], { w: 1.8, layer: 'light' }, t0 + d * 0.86, d * 0.07);
    PEN([tf(76, 10), tf(79, -2)], { w: 1.8, layer: 'light' }, t0 + d * 0.92, d * 0.08);
  };

  // ---------- 6. Wooden-Handled Rubber Stamp (S05 Skills result) ----------
  window.drawRubberStamp = function drawRubberStamp(cx, cy, w, h, label, t0, d) {
    // Wooden handle knob above the stamp block
    const gripTop = ell(cx, cy - h * 0.82, 34, 24, 0, 0, TAU, 20);
    const gripNeck = [[cx - 18, cy - h * 0.68], [cx + 18, cy - h * 0.68], [cx + 28, cy - h * 0.42], [cx - 28, cy - h * 0.42]];
    BLOB(gripTop, C.terracotta, { dx: 5, dy: 4, a: 0.85 }, t0, d * 0.18);
    BLOB(gripNeck, C.terracotta, { dx: 4, dy: 3, a: 0.65 }, t0 + d * 0.08, d * 0.14);
    PEN(gripTop, { w: 2.6 }, t0 + d * 0.12, d * 0.16);
    PEN(gripNeck, { w: 2.4, smooth: false }, t0 + d * 0.22, d * 0.12);

    // Wide cushion base + mustard ink pad
    const pad = roundedRectPts(cx - w / 2, cy - h * 0.42, w, h * 0.84, 22, 0.01);
    BLOB(pad, C.mustard, { dx: 8, dy: 7, a: 0.92 }, t0 + d * 0.28, d * 0.26);
    PEN(pad.concat([pad[0]]), { w: 3.8, smooth: false }, t0 + d * 0.42, d * 0.22);
    TXT(label, cx, cy + 12, 48, { f: 'CB', align: 'center' }, t0 + d * 0.56, d * 0.44);
  };

  // ---------- 7. Architectural Mini-Studio Rooms (S06 Projects, Holes as Layers) ----------
  window.drawStudioRoom = function drawStudioRoom(x, y, w, h, title, col, theme, t0, d) {
    // Gabled studio silhouette + 2 open cut-out window holes revealing paper memory/files
    const roofPeak = y + 32;
    const roomPoly = [
      [x, roofPeak],
      [x + w * 0.5, y],
      [x + w, roofPeak],
      [x + w, y + h],
      [x, y + h],
    ];
    const win1 = roundedRectPts(x + 22, y + 74, w - 44, 72, 12);
    const win2 = roundedRectPts(x + 22, y + 162, w - 44, 72, 12);

    BLOB(roomPoly, col, { dx: 7, dy: 6, a: 0.80, holes: [win1, win2] }, t0, d * 0.32);
    PEN(roomPoly.concat([roomPoly[0]]), { w: 2.8, smooth: false }, t0 + d * 0.22, d * 0.20);
    PEN(win1.concat([win1[0]]), { w: 2.0, smooth: false }, t0 + d * 0.36, d * 0.12);
    PEN(win2.concat([win2[0]]), { w: 2.0, smooth: false }, t0 + d * 0.46, d * 0.12);

    TXT(title, x + w * 0.5, y + 58, 31, { f: 'CB', align: 'center' }, t0 + d * 0.32, d * 0.20);

    // Distinct interior props inside the cut-out windows!
    if (theme === 'A') {
      // Window 1: Desk lamp + Brain/Memory circle
      circleStroke(x + 54, y + 110, 14, { w: 2.2 }, t0 + d * 0.54, d * 0.10);
      PEN([[x + 42, y + 128], [x + 66, y + 128]], { w: 2.0 }, t0 + d * 0.62, d * 0.06);
      TXT('Memori', x + 132, y + 118, 25, { f: 'CM', align: 'center' }, t0 + d * 0.64, d * 0.14);
      // Window 2: Doc icon
      PEN([[x + 42, y + 178], [x + 64, y + 178], [x + 64, y + 214], [x + 42, y + 214], [x + 42, y + 178]],
          { w: 2.0, smooth: false }, t0 + d * 0.76, d * 0.10);
      TXT('File A', x + 132, y + 206, 25, { f: 'CM', align: 'center' }, t0 + d * 0.82, d * 0.18);
    } else {
      // Window 1: Bookshelf lines + Memory notebook
      PEN([[x + 42, y + 92], [x + 42, y + 128], [x + 66, y + 128], [x + 66, y + 92]], { w: 2.1, smooth: false }, t0 + d * 0.54, d * 0.10);
      PEN([[x + 50, y + 96], [x + 50, y + 124]], { w: 1.8 }, t0 + d * 0.62, d * 0.06);
      TXT('Memori', x + 132, y + 118, 25, { f: 'CM', align: 'center' }, t0 + d * 0.64, d * 0.14);
      // Window 2: Mini bar-chart doc
      PEN([[x + 44, y + 214], [x + 44, y + 196]], { w: 3.2 }, t0 + d * 0.74, d * 0.06);
      PEN([[x + 54, y + 214], [x + 54, y + 184]], { w: 3.2 }, t0 + d * 0.79, d * 0.06);
      PEN([[x + 64, y + 214], [x + 64, y + 190]], { w: 3.2 }, t0 + d * 0.84, d * 0.06);
      TXT('File B', x + 132, y + 206, 25, { f: 'CM', align: 'center' }, t0 + d * 0.86, d * 0.14);
    }
  };

  // ---------- 8. MCP & Connectors Physical Desk Props (S07-S08) ----------
  window.drawControlTower = function drawControlTower(cx, cy, sc, t0, d) {
    const tf = mkT(cx, cy, sc, 0);
    const dome = mapPts(ell(0, -16, 40, 26, 0, Math.PI, TAU, 18).concat([[40, 32], [-40, 32]]), tf);
    BLOB(dome, C.teal, { dx: 6, dy: 5, a: 0.82 }, t0, d * 0.35);
    PEN(dome.concat([dome[0]]), { w: 2.8, smooth: false }, t0 + d * 0.20, d * 0.30);
    // Broadcast antenna + signal arcs on top
    PEN([tf(0, -42), tf(0, -64)], { w: 2.8 }, t0 + d * 0.45, d * 0.15);
    circleStroke(...tf(0, -68), 5 * sc, { w: 2.6, layer: 'coral' }, t0 + d * 0.56, d * 0.12);
    PEN(mapPts(ell(0, -68, 16, 16, 0, -2.3, -0.8, 10), tf), { w: 2.0, layer: 'coral' }, t0 + d * 0.66, d * 0.12);
    TXT('AI HUB', cx, cy + 16 * sc, 32, { f: 'CB', align: 'center' }, t0 + d * 0.70, d * 0.30);
  };

  window.drawFlipCalendar = function drawFlipCalendar(cx, cy, sc, t0, d, fillT0) {
    const tf = mkT(cx, cy, sc, 0);
    const card = mapPts(roundedRectPts(-54, -32, 108, 72, 10), tf);
    const hdr = mapPts(roundedRectPts(-54, -32, 108, 22, 8), tf);
    PEN(card.concat([card[0]]), { w: 2.5, smooth: false }, t0, d * 0.35);
    PEN([tf(-54, -10), tf(54, -10)], { w: 2.0 }, t0 + d * 0.30, d * 0.15);
    // 2 binder rings on top
    circleStroke(...tf(-26, -34), 6 * sc, { w: 2.2 }, t0 + d * 0.42, d * 0.14);
    circleStroke(...tf(26, -34), 6 * sc, { w: 2.2 }, t0 + d * 0.54, d * 0.14);
    // Mini calendar grid lines
    PEN([tf(-30, 8), tf(12, 8)], { w: 1.8, layer: 'light' }, t0 + d * 0.64, d * 0.12);
    TXT('Kalender', cx, cy + 28 * sc, 27, { f: 'CB', align: 'center' }, t0 + d * 0.70, d * 0.30);
    if (fillT0) {
      BLOB(hdr, C.sky, { dx: 4, dy: 4, a: 0.85 }, fillT0, 0.45);
      checkMark(cx + 38 * sc, cy - 2 * sc, 14 * sc, { w: 3.6, layer: 'coral' }, fillT0 + 0.46, 0.25);
    }
  };

  window.drawSpiralNotebook = function drawSpiralNotebook(cx, cy, sc, t0, d, fillT0) {
    const tf = mkT(cx, cy, sc, 0);
    const pad = mapPts(roundedRectPts(-54, -34, 108, 74, 10), tf);
    PEN(pad.concat([pad[0]]), { w: 2.5, smooth: false }, t0, d * 0.35);
    // 4 spiral rings down left spine
    [-20, -6, 8, 22].forEach((yy, i) => {
      PEN([tf(-60, yy), tf(-46, yy)], { w: 2.4 }, t0 + d * (0.35 + i * 0.06), d * 0.06);
    });
    // Checklist lines
    PEN([tf(-28, -14), tf(28, -14)], { w: 1.8, layer: 'light' }, t0 + d * 0.60, d * 0.10);
    TXT('Catatan', cx + 4 * sc, cy + 22 * sc, 27, { f: 'CB', align: 'center' }, t0 + d * 0.68, d * 0.32);
    if (fillT0) {
      BLOB(pad, C.mustard, { dx: 5, dy: 4, a: 0.76 }, fillT0, 0.50);
      checkMark(cx + 38 * sc, cy - 12 * sc, 14 * sc, { w: 3.6, layer: 'coral' }, fillT0 + 0.52, 0.25);
    }
  };

  window.drawEnvelope = function drawEnvelope(cx, cy, sc, t0, d, fillT0) {
    const tf = mkT(cx, cy, sc, 0);
    const box = mapPts(roundedRectPts(-54, -32, 108, 68, 8), tf);
    PEN(box.concat([box[0]]), { w: 2.5, smooth: false }, t0, d * 0.35);
    // V flap fold
    PEN([tf(-52, -30), tf(0, 4), tf(52, -30)], { w: 2.2, smooth: false }, t0 + d * 0.35, d * 0.30);
    TXT('Email', cx, cy + 24 * sc, 27, { f: 'CB', align: 'center' }, t0 + d * 0.65, d * 0.35);
    if (fillT0) {
      BLOB(box, C.sage, { dx: 5, dy: 4, a: 0.74 }, fillT0, 0.55);
      checkMark(cx + 38 * sc, cy - 10 * sc, 14 * sc, { w: 3.6, layer: 'coral' }, fillT0 + 0.58, 0.28);
    }
  };

  window.drawPadlock = function drawPadlock(cx, cy, sc, t0, d) {
    const tf = mkT(cx, cy, sc, 0);
    PEN([tf(-10, -2), tf(-10, -14), tf(10, -14), tf(10, -2)], { w: 2.8 }, t0, d * 0.32);
    const body = mapPts(roundedRectPts(-15, -2, 30, 24, 5), tf);
    BLOB(body, C.mustard, { dx: 4, dy: 3, a: 0.92 }, t0 + d * 0.28, d * 0.32);
    PEN(body.concat([body[0]]), { w: 2.5, smooth: false }, t0 + d * 0.52, d * 0.32);
    circleStroke(...tf(0, 9), 3 * sc, { w: 2.6 }, t0 + d * 0.82, d * 0.18);
  };

  window.drawCrossedKey = function drawCrossedKey(cx, cy, sc, t0, d, crossT0) {
    const tf = mkT(cx, cy, sc, -0.08);
    circleStroke(...tf(-26, 0), 12 * sc, { w: 2.4, layer: 'light' }, t0, d * 0.32);
    PEN([tf(-14, 0), tf(28, 0), tf(28, 10)], { w: 2.4, layer: 'light', smooth: false }, t0 + d * 0.30, d * 0.32);
    PEN([tf(16, 0), tf(16, 8)], { w: 2.2, layer: 'light' }, t0 + d * 0.55, d * 0.15);
    TXT('Password', cx + 4 * sc, cy + 28 * sc, 26, { f: 'CM', align: 'center' }, t0 + d * 0.62, d * 0.38);
    if (crossT0) {
      PEN([tf(-44, -18), tf(44, 22)], { w: 3.8, layer: 'coral' }, crossT0, 0.30);
      PEN([tf(44, -18), tf(-44, 22)], { w: 3.8, layer: 'coral' }, crossT0 + 0.32, 0.30);
    }
  };

  // ---------- 9. Tactile 3D Mechanical Keyboard Keycaps: Ctrl+C & Ctrl+V (S07-S08) ----------
  window.drawCtrlKeycaps = function drawCtrlKeycaps(cx, cy, sc, t0, d, crossT0) {
    const tf = mkT(cx, cy, sc, -0.02);
    const drawCap = (x, y, w, h, col, label, ts, dur) => {
      const base = mapPts(roundedRectPts(x, y, w, h, 10), tf);
      const top = mapPts(roundedRectPts(x + 4, y + 3, w - 8, h - 11, 7), tf);
      BLOB(base, col, { dx: 4, dy: 4, a: 0.78 }, ts, dur * 0.35);
      PEN(base.concat([base[0]]), { w: 2.5, smooth: false }, ts + dur * 0.15, dur * 0.35);
      PEN(top.concat([top[0]]), { w: 1.8, layer: 'light', smooth: false }, ts + dur * 0.40, dur * 0.25);
      const [lx, ly] = tf(x + w * 0.5, y + h * 0.56);
      TXT(label, lx, ly, Math.round(28 * sc), { f: 'CB', align: 'center' }, ts + dur * 0.52, dur * 0.45);
    };

    // Row 1: [ Ctrl ] + [ C ]
    drawCap(-96, -62, 90, 52, C.creamDark, 'Ctrl', t0, d * 0.26);
    PEN([tf(4, -36), tf(20, -36)], { w: 3.0 }, t0 + d * 0.24, d * 0.06);
    PEN([tf(12, -44), tf(12, -28)], { w: 3.0 }, t0 + d * 0.28, d * 0.06);
    drawCap(30, -62, 62, 52, C.mustard, 'C', t0 + d * 0.30, d * 0.22);

    // Row 2: [ Ctrl ] + [ V ]
    drawCap(-96, 8, 90, 52, C.creamDark, 'Ctrl', t0 + d * 0.52, d * 0.24);
    PEN([tf(4, 34), tf(20, 34)], { w: 3.0 }, t0 + d * 0.74, d * 0.06);
    PEN([tf(12, 26), tf(12, 42)], { w: 3.0 }, t0 + d * 0.78, d * 0.06);
    drawCap(30, 8, 62, 52, C.sky, 'V', t0 + d * 0.78, d * 0.22);

    if (crossT0) {
      PEN([tf(-102, -62), tf(98, 60)], { w: 4.4, layer: 'coral' }, crossT0, 0.42);
      PEN([tf(98, -62), tf(-102, 60)], { w: 4.4, layer: 'coral' }, crossT0 + 0.44, 0.42);
    }
  };

  // ---------- 10. Productivity Turbo Gauge (S09 Recap Standalone Illustration) ----------
  window.drawTurboGauge = function drawTurboGauge(cx, cy, sc, t0, d) {
    const tf = mkT(cx, cy, sc, 0);
    const arcOuter = mapPts(ell(0, 22, 68, 68, 0, Math.PI, TAU, 24).concat([[68, 22], [-68, 22]]), tf);
    const redZone = mapPts(ell(0, 22, 64, 64, 0, Math.PI * 1.62, TAU, 12).concat([[0, 22]]), tf);
    BLOB(arcOuter, C.creamDark, { dx: 5, dy: 4, a: 0.75 }, t0, d * 0.28);
    BLOB(redZone, C.coral, { dx: 4, dy: 3, a: 0.78 }, t0 + d * 0.18, d * 0.24);
    PEN(arcOuter.concat([arcOuter[0]]), { w: 2.8, smooth: false }, t0 + d * 0.28, d * 0.30);
    // Gauge ticks around rim
    for (let i = 1; i <= 5; i++) {
      const a = Math.PI + (i / 6) * Math.PI;
      const p0 = tf(Math.cos(a) * 52, 22 + Math.sin(a) * 52);
      const p1 = tf(Math.cos(a) * 65, 22 + Math.sin(a) * 65);
      PEN([p0, p1], { w: 2.2 }, t0 + d * (0.52 + i * 0.04), d * 0.04);
    }
    // Pivot hub + needle pegged at max turbo!
    circleStroke(...tf(0, 18), 8 * sc, { w: 2.8 }, t0 + d * 0.72, d * 0.10);
    PEN([tf(0, 18), tf(46, -22)], { w: 4.2, layer: 'coral' }, t0 + d * 0.80, d * 0.20);
  };

  // ---------- 11. Hand-Sketched Recognizable AI Logos: ChatGPT, Claude, Gemini (S02) ----------
  window.drawAiLogo = function drawAiLogo(cx, cy, r, kind, t0, d) {
    // 1. Outer hand-sketched medallion ring
    circleStroke(cx, cy, r, { w: 2.8 }, t0, d * 0.22);

    if (kind === 'chatgpt') {
      // OpenAI / ChatGPT: 6 interwoven ribbon hooks forming a central regular hexagon
      const pDur = (d * 0.46) / 6;
      for (let k = 0; k < 6; k++) {
        const tf = mkT(cx, cy, r, (k * TAU) / 6);
        const ribbon = mapPts(
          [
            [0.11, -0.19],
            [-0.36, -0.19],
            ...bez([-0.36, -0.19], [-0.68, -0.19], [-0.72, 0.22], [-0.44, 0.38], 10),
            [-0.17, 0.54],
          ],
          tf
        );
        PEN(ribbon, { w: 2.5, smooth: false }, t0 + d * 0.20 + k * pDur, pDur * 0.92);
      }
      BLOB(ell(cx, cy, r * 0.96, r * 0.96, 0, 0, TAU, 28), C.teal, { dx: 7, dy: 6, a: 0.72 }, t0 + d * 0.66, d * 0.34);
    } else if (kind === 'claude') {
      // Anthropic Claude: 12-ray organic asymmetric sunburst / asterisk spark
      const lens = [0.68, 0.50, 0.64, 0.46, 0.68, 0.52, 0.65, 0.48, 0.68, 0.52, 0.62, 0.48];
      const rDur = (d * 0.46) / 12;
      for (let k = 0; k < 12; k++) {
        const a = (k * TAU) / 12 - 0.18;
        const r0 = r * 0.10;
        const r1 = r * lens[k];
        PEN(
          [[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]],
          { w: 3.4, ta: 0.08, tb: 0.15 },
          t0 + d * 0.20 + k * rDur,
          rDur * 0.90
        );
      }
      BLOB(ell(cx, cy, r * 0.96, r * 0.96, 0, 0, TAU, 28), C.terracotta, { dx: 7, dy: 6, a: 0.76 }, t0 + d * 0.66, d * 0.34);
    } else if (kind === 'gemini') {
      // Google Gemini: Concave 4-pointed curved astroid sparkle + mini top-right companion sparkle
      const rx = r * 0.64, ry = r * 0.68, k = r * 0.10;
      const astroid = []
        .concat(bez([cx, cy - ry], [cx + k, cy - k], [cx + k, cy - k], [cx + rx, cy], 10))
        .concat(bez([cx + rx, cy], [cx + k, cy + k], [cx + k, cy + k], [cx, cy + ry], 10))
        .concat(bez([cx, cy + ry], [cx - k, cy + k], [cx - k, cy + k], [cx - rx, cy], 10))
        .concat(bez([cx - rx, cy], [cx - k, cy - k], [cx - k, cy - k], [cx, cy - ry], 10));
      PEN(astroid, { w: 2.7, smooth: false }, t0 + d * 0.20, d * 0.34);
      // Mini companion 4-point sparkle at top-right
      const sx = cx + r * 0.40, sy = cy - r * 0.40, sr = r * 0.17;
      PEN([[sx, sy - sr], [sx, sy + sr]], { w: 2.2 }, t0 + d * 0.54, d * 0.06);
      PEN([[sx - sr, sy], [sx + sr, sy]], { w: 2.2 }, t0 + d * 0.60, d * 0.06);
      BLOB(ell(cx, cy, r * 0.96, r * 0.96, 0, 0, TAU, 28), C.sky, { dx: 7, dy: 6, a: 0.74 }, t0 + d * 0.66, d * 0.34);
    }
  };
})();
