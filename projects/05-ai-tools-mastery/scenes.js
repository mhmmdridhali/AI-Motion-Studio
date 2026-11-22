'use strict';

// =========================================================================
// Scenes & Choreography — Tangga 02: AI Tools Mastery (133.094s, 10 Shots)
// Rich editorial illustrations via art.js + 6 serpentine zones + 5 Native Moves
// =========================================================================
window.buildPage = function buildPage() {
  R = mulberry(20261122);

  // Subtle margin construction guide on paper
  PEN([[86, 350], [1314, 350], [1314, 2490], [86, 2490], [86, 350]],
      { w: 1.5, layer: 'light', wob: 0.4, smooth: false, ghost: true }, -0.2, 0.05);

  // =======================================================================
  // SHOT 1 (0.00 - 11.959s): HOOK — Zona 1 (cx=370, cy=640)
  // =======================================================================
  // Frame 0 pre-drawn scene (t0 < 0): Confused Murid -> crooked prompt -> Dizzy Robot -> "Ngawur?"
  drawPerson(168, 558, 1.04, 'murid', 'confused', -0.19, 0.05, { ghost: true });
  const promptNote = roundedRectPts(235, 456, 180, 110, 14, -0.03);
  BLOB(promptNote, C.creamDark, { dx: 6, dy: 5, a: 0.85, ghost: true }, -0.18, 0.04);
  PEN(promptNote.concat([promptNote[0]]), { w: 2.3, smooth: false, ghost: true }, -0.17, 0.04);
  TXT('bikin jadwal', 325, 504, 30, { f: 'CM', align: 'center', ghost: true }, -0.16, 0.04);
  TXT('konten.', 325, 540, 30, { f: 'CM', align: 'center', ghost: true }, -0.15, 0.04);

  drawRobot(518, 522, 1.06, 'dizzy', -0.14, 0.05, { ghost: true });
  TXT('Ngawur?', 520, 622, 36, { f: 'CB', align: 'center', layer: 'coral', ghost: true }, -0.12, 0.04);
  // Coral question mark next to dizzy robot
  PEN(bez([585, 488], [592, 470], [622, 472], [618, 494], 10)
      .concat(bez([618, 494], [614, 506], [598, 510], [600, 522], 6)),
      { w: 4.2, layer: 'coral', ghost: true }, -0.11, 0.04);
  circleStroke(600, 536, 3.2, { w: 4.2, layer: 'coral', ghost: true }, -0.10, 0.03);

  // Lower answer stage dashed frame ready for S01 Mentor answer
  PEN([[134, 666], [618, 666], [618, 845], [134, 845], [134, 666]],
      { w: 1.7, layer: 'light', wob: 0.5, smooth: false, ghost: true }, -0.09, 0.04);

  // Live S01 Beats
  circleStroke(518, 522, 76, { w: 2.8, layer: 'coral', ry: 68 }, 0.45, 0.90);
  // 2.11 "rahasianya!" -> alert sparks
  PEN([[568, 466], [588, 446]], { w: 3.4, layer: 'coral' }, 2.10, 0.28);
  PEN([[588, 560], [612, 562]], { w: 3.4, layer: 'coral' }, 2.42, 0.28);
  PEN([[454, 468], [434, 448]], { w: 3.4, layer: 'coral' }, 2.75, 0.28);

  // 3.50-5.85 "AI suka ngawur pas kusuruh?" -> tangled ink + bold coral X over dizzy robot output
  PEN([[248, 588], [286, 574], [326, 598], [364, 572], [404, 594]], { w: 2.5, layer: 'coral', wob: 1.1 }, 3.55, 0.85);
  PEN([[456, 468], [580, 588]], { w: 4.2, layer: 'coral' }, 4.65, 0.48);
  PEN([[580, 468], [456, 588]], { w: 4.2, layer: 'coral' }, 5.18, 0.48);

  // 6.24-8.80 "Sebenarnya AI jarang jelek." -> Smiling Happy Robot!
  drawRobot(206, 738, 0.92, 'happy', 6.38, 1.35);
  TXT('AI BAGUS', 206, 824, 30, { f: 'CB', align: 'center' }, 7.75, 0.42);
  checkMark(266, 704, 18, { w: 3.8, layer: 'coral' }, 8.25, 0.35);

  // 8.85-11.55 "Yang sering kurang justru instruksi kita." -> Warm Mentor pointing right to INSTRUKSI
  drawPerson(334, 742, 0.90, 'mentor', 'pointing', 8.85, 1.00);
  const instrPoly = roundedRectPts(406, 704, 200, 88, 16, 0.01);
  BLOB(instrPoly, C.mustard, { dx: 7, dy: 6, a: 0.90 }, 9.15, 0.65);
  TXT('INSTRUKSI', 506, 760, 40, { f: 'CB', align: 'center' }, 9.28, 0.68);
  PEN([[416, 778], [506, 773], [596, 779]], { w: 4.4, layer: 'coral' }, 10.15, 0.55);
  PEN([[592, 694], [610, 680]], { w: 3.2, layer: 'coral' }, 10.75, 0.25);
  PEN([[598, 722], [620, 720]], { w: 3.2, layer: 'coral' }, 11.05, 0.25);

  // =======================================================================
  // SHOT 2 (11.959 - 28.600s): 3 AI UTAMA — Arrow 1->2 + Zona 2 (cx=1030, cy=640)
  // =======================================================================
  arrow(bez([628, 635], [670, 618], [712, 622], [758, 635], 16), { w: 5.0, layer: 'coral' }, 11.88, 0.65);

  const badge2 = roundedRectPts(772, 444, 245, 58, 28, -0.01);
  BLOB(badge2, C.mustard, { dx: 7, dy: 5, a: 0.88 }, 12.65, 0.65);
  PEN(badge2.concat([badge2[0]]), { w: 2.6, smooth: false }, 13.35, 0.50);
  TXT('02. AI TOOLS', 894, 484, 38, { f: 'CB', align: 'center' }, 13.90, 0.65);

  PEN([[875, 592], [1185, 592], [1030, 738], [875, 592]],
      { w: 2.0, layer: 'light', smooth: false }, 15.10, 0.95);

  // Native Move #1: Line then Colour for ChatGPT, Claude, Gemini with hand-sketched official-style logos!
  drawAiLogo(875, 592, 56, 'chatgpt', 16.40, 1.50);
  TXT('ChatGPT', 875, 680, 36, { f: 'CB', align: 'center' }, 17.95, 0.45);

  drawAiLogo(1185, 592, 56, 'claude', 18.48, 1.25);
  TXT('Claude', 1185, 680, 36, { f: 'CB', align: 'center' }, 19.76, 0.35);

  drawAiLogo(1030, 738, 56, 'gemini', 20.15, 1.20);
  TXT('Gemini', 1030, 824, 36, { f: 'CB', align: 'center' }, 21.38, 0.35);

  // 21.80 "AI Trinity!" Triangle + Banner
  PEN([[932, 592], [1128, 592]], { w: 4.5, layer: 'coral' }, 21.80, 0.25);
  PEN([[1148, 636], [1072, 708]], { w: 4.5, layer: 'coral' }, 22.05, 0.25);
  PEN([[988, 708], [912, 636]], { w: 4.5, layer: 'coral' }, 22.30, 0.25);

  const trinBox = roundedRectPts(1045, 444, 240, 62, 16, 0.02);
  BLOB(trinBox, C.coral, { dx: 7, dy: 6, a: 0.32 }, 22.55, 0.45);
  TXT('AI TRINITY!', 1165, 487, 44, { f: 'CB', align: 'center', layer: 'coral' }, 23.02, 0.55);

  // 23.82 "Aplikasinya udah ada." -> Mini Murid holding Smartphone + 3 checkmarks
  drawPerson(804, 766, 0.90, 'murid', 'phone', 23.82, 1.25);
  checkMark(922, 550, 22, { w: 4.0, layer: 'coral' }, 24.30, 0.30);
  checkMark(1232, 550, 22, { w: 4.0, layer: 'coral' }, 24.70, 0.30);
  checkMark(1082, 696, 22, { w: 4.0, layer: 'coral' }, 25.10, 0.30);
  SFX.push({ t: 23.85, type: 'pop', d: 0.15, pan: -0.3 });
  SFX.push({ t: 25.10, type: 'pop', d: 0.15, pan: 0.2 });

  // 25.80-28.20 "Terus biar hasilnya pas gimana?"
  circleStroke(1202, 772, 34, { w: 2.8, layer: 'coral' }, 25.85, 0.55);
  TXT('Gimana?', 1204, 782, 29, { f: 'CM', align: 'center', layer: 'coral' }, 26.45, 0.48);
  PEN([[775, 818], [728, 868], [678, 912]], { w: 3.2, layer: 'coral' }, 27.15, 0.85);

  // =======================================================================
  // SHOT 3 (28.600 - 39.540s): ANALOGI LAGU — Arrow 2->3 + Zona 3 (cx=370, cy=1140)
  // Music Metaphor: Wanted POP (Acoustic Guitar) -> Got JAZZ (Grand Piano)!
  // =======================================================================
  arrow(bez([760, 815], [705, 888], [665, 955], [615, 1020], 18), { w: 5.0, layer: 'coral' }, 28.50, 0.80);

  // 29.35-33.20 Wanted Bubble Top-Right: "MAU POP?" + mini dashed guitar clue
  const popWant = roundedRectPts(384, 968, 200, 68, 20, -0.02);
  PEN(popWant.concat([popWant[0]]), { w: 2.2, layer: 'light', smooth: false }, 29.40, 0.70);
  TXT('MAU POP?', 484, 1014, 36, { f: 'CB', align: 'center' }, 30.25, 0.65);

  // Light music note lines while imagining Pop
  circleStroke(248, 1025, 16, { w: 2.0, layer: 'light' }, 31.20, 0.45);
  PEN([[262, 1025], [262, 992], [294, 986], [294, 1018]], { w: 2.0, layer: 'light', smooth: false }, 31.68, 0.55);

  // 33.45 "malah dikasih jazz!" -> GRAND JAZZ PIANO swept in Purple + "MALAH JAZZ!"
  const stagePoly = drawJazzPiano(248, 1118, 1.24, 33.45, 1.65);
  TXT('MALAH JAZZ!', 498, 1086, 38, { f: 'CB', align: 'center', layer: 'coral' }, 34.45, 0.60);
  // Floating jazz notes next to piano
  PEN([[345, 1054], [345, 1026], [365, 1020], [365, 1048]], { w: 2.6, layer: 'coral', smooth: false }, 35.15, 0.30);
  circleStroke(339, 1056, 6, { w: 2.6, layer: 'coral' }, 35.48, 0.16);
  circleStroke(359, 1050, 6, { w: 2.6, layer: 'coral' }, 35.66, 0.16);

  // 36.20-39.10 "kan dia nggak bisa baca pikiran" -> funny crossed telepathy cloud under stage
  const mindCloud = ell(248, 1252, 84, 34, 0, 0, TAU, 22, 0.08);
  PEN(mindCloud.concat([mindCloud[0]]), { w: 2.2, layer: 'light' }, 36.25, 0.85);
  PEN([[195, 1232], [300, 1272]], { w: 3.8, layer: 'coral' }, 37.30, 0.45);
  PEN([[300, 1232], [195, 1272]], { w: 3.8, layer: 'coral' }, 37.80, 0.45);
  SFX.push({ t: 33.75, type: 'pop', d: 0.20, pan: -0.35 });

  // =======================================================================
  // SHOT 4 (39.540 - 51.939s): CONTEXT — Re-register Piano Stage -> POP Guitar + 4 Context Tags
  // =======================================================================
  // Cross out "MALAH JAZZ!" + OCC clears piano silhouette & crossed cloud cleanly!
  PEN([[402, 1074], [592, 1076]], { w: 4.0, layer: 'coral' }, 39.60, 0.30);
  OCC(roundedRectPts(136, 1015, 228, 185, 12), 39.70, ['light', 'graph', 'coral'], true);
  OCC(roundedRectPts(150, 1206, 198, 90, 12), 39.75);

  // Native Move #2 (Re-register a block): stage spotlight re-registers purple -> mustard,
  // and our hand-sketched Acoustic POP Guitar takes center stage!
  drawPopGuitar(248, 1118, 1.18, stagePoly, 39.95, 1.60);
  TXT('POP', 248, 1228, 42, { f: 'CB', align: 'center', layer: 'coral' }, 41.58, 0.35);
  checkMark(296, 1216, 20, { w: 4.0, layer: 'coral' }, 41.95, 0.20);

  // 42.20-44.80 4 Context Pill Tags on right col
  const tags4 = [
    { t: 42.22, y: 1138, label: '1. PERAN',  col: C.teal },
    { t: 42.82, y: 1192, label: '2. TUJUAN', col: C.mustard },
    { t: 43.50, y: 1246, label: '3. TARGET', col: C.sky },
    { t: 44.18, y: 1300, label: '4. BATAS',  col: C.coral },
  ];
  tags4.forEach((tg, idx) => {
    const tp = roundedRectPts(405, tg.y - 24, 198, 44, 14, idx % 2 ? 0.01 : -0.01);
    BLOB(tp, tg.col, { dx: 6, dy: 5, a: 0.72 }, tg.t, 0.32);
    PEN(tp.concat([tp[0]]), { w: 2.2, smooth: false }, tg.t + 0.14, 0.22);
    TXT(tg.label, 504, tg.y + 8, 29, { f: 'CB', align: 'center' }, tg.t + 0.25, 0.28);
    SFX.push({ t: tg.t + 0.15, type: 'pop', d: 0.12, pan: 0.2 });
  });

  // 45.45-51.30 Swatch Strip + "LENGKAP != PANJANG" + Check Wave
  const sw1 = roundedRectPts(136, 1254, 72, 30, 8);
  BLOB(sw1, C.light, { dx: 4, dy: 4, a: 0.60 }, 45.45, 0.35);
  PEN([[217, 1269], [250, 1269]], { w: 2.8, layer: 'graph' }, 45.85, 0.22);
  const sw2 = roundedRectPts(260, 1254, 92, 30, 8);
  BLOB(sw2, C.sage, { dx: 4, dy: 4, a: 0.85 }, 46.10, 0.42);
  TXT('LENGKAP != PANJANG', 252, 1330, 34, { f: 'CB', align: 'center' }, 46.60, 0.95);
  PEN([[122, 1340], [250, 1334], [385, 1340]], { w: 4.2, layer: 'coral' }, 47.65, 0.65);

  PEN([[142, 1376], [164, 1358], [186, 1386], [210, 1354], [236, 1380], [264, 1360], [290, 1372]],
      { w: 3.4, layer: 'coral' }, 49.00, 1.05);
  checkMark(322, 1370, 22, { w: 4.4, layer: 'coral' }, 50.25, 0.55);

  // =======================================================================
  // SHOT 5 (51.939 - 65.501s): SKILLS — Arrow 3->4 + Zona 4 (cx=1030, cy=1140)
  // Tired Murid at Laptop Desk typing repeating prompts -> Shatters into Rubber Stamp!
  // =======================================================================
  arrow(bez([624, 1140], [670, 1126], [716, 1128], [760, 1140], 16), { w: 5.0, layer: 'coral' }, 51.90, 0.70);

  // 52.75-56.00 Laptop Desk + Tired Murid + repeating scrolls
  drawLaptopDesk(1092, 1110, 1.06, 52.75, 1.25);
  drawPerson(902, 1088, 0.94, 'murid', 'confused', 53.85, 1.15);
  const repNote = roundedRectPts(970, 1004, 165, 62, 10, -0.03);
  BLOB(repNote, C.creamDark, { dx: 5, dy: 4, a: 0.80 }, 54.85, 0.40);
  PEN(repNote.concat([repNote[0]]), { w: 2.0, smooth: false }, 55.15, 0.30);
  TXT('Tiap Minggu?', 1052, 1218, 36, { f: 'CM', align: 'center' }, 55.35, 0.62);

  // 56.20-59.20 Dizzy repeat loop arrows + comic sweat drop
  PEN(bez([830, 1068], [826, 995], [888, 956], [964, 962], 14), { w: 3.0, layer: 'coral' }, 56.25, 0.78);
  PEN(bez([1218, 1090], [1226, 1168], [1168, 1208], [1102, 1200], 14), { w: 3.0, layer: 'coral' }, 57.15, 0.78);
  const sweat = [[854, 1004], [866, 1030], [846, 1032]];
  BLOB(sweat, C.sky, { dx: 3, dy: 3, a: 0.78 }, 58.10, 0.35);
  PEN(sweat.concat([sweat[0]]), { w: 2.4, layer: 'graph', smooth: false }, 58.25, 0.40);

  // 59.50-60.55 Coral lightning crack + OCC clear -> Shatter into Rubber Stamp!
  PEN([[978, 996], [1044, 1058], [1006, 1112], [1074, 1170], [1032, 1228]],
      { w: 4.8, layer: 'coral', smooth: false }, 59.52, 0.62);
  OCC(roundedRectPts(810, 945, 440, 310, 10), 60.55);

  // Native Move #3 (Shatter a block!): 86 chips explode out and magnetize into Stamp
  SFX.push({ t: 60.55, type: 'shatter', d: 1.55, pan: 0.0 });
  const SHARDS = [];
  for (let i = 0; i < 86; i++) {
    const a = rnd(0, TAU), dist = rnd(40, 210);
    SHARDS.push({
      sx: 1030 + rnd(-130, 130), sy: 1110 + rnd(-80, 80),
      mx: 1030 + Math.cos(a) * dist, my: 1110 + Math.sin(a) * dist,
      tx: 1030 + rnd(-165, 165), ty: 1158 + rnd(-34, 34),
      sz: rnd(7, 17), rot: rnd(0, TAU),
      col: i % 3 === 0 ? C.coral : (i % 3 === 1 ? C.mustard : C.teal),
    });
  }
  DYN.push({
    t0: 60.55, t1: 62.25,
    draw(t, c) {
      const u = clamp((t - 60.55) / 1.70);
      ctx.save();
      SHARDS.forEach(s => {
        const px = u < 0.45 ? lerp(s.sx, s.mx, eo(u / 0.45)) : lerp(s.mx, s.tx, eio((u - 0.45) / 0.55));
        const py = u < 0.45 ? lerp(s.sy, s.my, eo(u / 0.45)) : lerp(s.my, s.ty, eio((u - 0.45) / 0.55));
        const [X, Y] = toScreen(c, px, py);
        const al = u > 0.85 ? clamp((1 - u) / 0.15) : 0.92;
        ctx.save();
        ctx.translate(X, Y);
        ctx.rotate(s.rot + u * 4.5);
        ctx.globalAlpha = al;
        ctx.fillStyle = s.col;
        ctx.fillRect(-s.sz * 0.5 * c.z, -s.sz * 0.35 * c.z, s.sz * c.z, s.sz * 0.7 * c.z);
        ctx.restore();
      });
      ctx.restore();
    },
  });

  // 61.55-64.90 SKILLS badge + Tactile Rubber Stamp /riset-konten
  const skBadge = roundedRectPts(935, 976, 190, 52, 24, -0.02);
  BLOB(skBadge, C.teal, { dx: 6, dy: 5, a: 0.84 }, 61.55, 0.45);
  PEN(skBadge.concat([skBadge[0]]), { w: 2.5, smooth: false }, 61.95, 0.25);
  TXT('SKILLS', 1030, 1014, 34, { f: 'CB', align: 'center' }, 62.00, 0.32);

  drawRubberStamp(1030, 1168, 430, 114, '/riset-konten', 61.90, 1.55);
  SFX.push({ t: 62.45, type: 'pop', d: 0.15, pan: 0.0 });

  // Speed streaks & check mark
  PEN([[820, 1250], [910, 1250]], { w: 3.4, layer: 'coral' }, 63.70, 0.35);
  PEN([[850, 1272], [955, 1272]], { w: 3.4, layer: 'coral' }, 64.08, 0.35);
  checkMark(1030, 1262, 26, { w: 4.8, layer: 'coral' }, 64.45, 0.42);

  // =======================================================================
  // SHOT 6 (65.501 - 78.445s): PROJECTS — Arrow 4->5 + Zona 5 (cx=370, cy=1680)
  // Twin Architectural Mini-Studio Rooms divided by Brick Wall (Holes as Layers)
  // =======================================================================
  arrow(bez([760, 1320], [705, 1392], [665, 1460], [615, 1528], 18), { w: 5.0, layer: 'coral' }, 65.48, 0.80);

  // 66.80-70.10 Colliding mixed work cards -> Ketuker? -> OCC clear
  const cMix1 = roundedRectPts(175, 1605, 180, 120, 12, -0.09);
  const cMix2 = roundedRectPts(365, 1625, 180, 120, 12, 0.08);
  PEN(cMix1.concat([cMix1[0]]), { w: 2.2, layer: 'light', smooth: false }, 66.80, 0.55);
  PEN(cMix2.concat([cMix2[0]]), { w: 2.2, layer: 'light', smooth: false }, 67.38, 0.55);
  PEN([[330, 1640], [395, 1695]], { w: 3.5, layer: 'coral' }, 68.10, 0.45);
  PEN([[395, 1640], [330, 1695]], { w: 3.5, layer: 'coral' }, 68.58, 0.45);
  TXT('Ketuker?', 370, 1566, 38, { f: 'CB', align: 'center', layer: 'coral' }, 68.90, 0.55);
  OCC(roundedRectPts(130, 1510, 485, 340, 10), 70.62);

  // 70.75-72.15 Header PROJECTS + Bold Coral Brick Partition Wall down center
  TXT('PROJECTS', 370, 1546, 44, { f: 'CB', align: 'center' }, 70.75, 0.55);
  PEN([[370, 1568], [370, 1882]], { w: 5.4, layer: 'coral' }, 71.35, 0.65);
  // Subtle brick wall ticks along center divider
  for (let by = 1600; by <= 1850; by += 42) {
    PEN([[361, by], [379, by]], { w: 2.2, layer: 'coral' }, 71.80 + ((by - 1600) / 42) * 0.05, 0.06);
  }

  // Native Move #4 (Holes as layers): Cozy Mini-Studio Rooms A (sage) & B (terracotta)
  drawStudioRoom(120, 1582, 220, 282, 'PROYEK A', C.sage, 'A', 72.20, 2.55);
  drawStudioRoom(400, 1582, 220, 282, 'PROYEK B', C.terracotta, 'B', 74.95, 2.55);

  checkMark(230, 1884, 18, { w: 3.6, layer: 'coral' }, 77.55, 0.30);
  checkMark(510, 1884, 18, { w: 3.6, layer: 'coral' }, 77.88, 0.30);
  SFX.push({ t: 75.05, type: 'pop', d: 0.14, pan: 0.25 });

  // =======================================================================
  // SHOT 7 (78.445 - 91.930s): MCP & CONNECTORS — Arrow 5->6 + Zona 6 (cx=1030, cy=1680)
  // Tactile 3D Ctrl+C & Ctrl+V Keycaps + Control Tower Hub + Cables to Desk Props + Padlock
  // =======================================================================
  arrow(bez([624, 1680], [670, 1666], [716, 1668], [760, 1680], 16), { w: 5.0, layer: 'coral' }, 78.42, 0.72);

  // 79.40-84.10 Tactile 3D Mechanical Keyboard Keycaps: [Ctrl]+[C] and [Ctrl]+[V] crossed out!
  drawCtrlKeycaps(860, 1525, 0.90, 79.40, 1.45, 82.95);

  // 85.10-87.80 Detailed Broadcast Control-Tower AI HUB + MCP & Connectors title
  drawControlTower(915, 1696, 1.08, 85.10, 1.55);
  TXT('MCP & Connectors', 1148, 1516, 34, { f: 'CB', align: 'center' }, 86.65, 0.75);

  // Native Move #5a (Follow the stylus): Stylus pulls 3 curved two-way cables to Desk Props + Padlock!
  const c1Pts = bez([964, 1676], [1038, 1612], [1095, 1584], [1160, 1590], 16);
  const c2Pts = bez([968, 1700], [1045, 1700], [1102, 1702], [1160, 1704], 16);
  const c3Pts = bez([962, 1728], [1032, 1782], [1085, 1814], [1160, 1818], 16);

  arrow(c1Pts, { w: 4.0, layer: 'coral', head: 15 }, 87.90, 0.55);
  drawFlipCalendar(1224, 1590, 0.92, 88.25, 0.65, 94.10);

  arrow(c2Pts, { w: 4.0, layer: 'coral', head: 15 }, 88.75, 0.55);
  drawSpiralNotebook(1224, 1704, 0.92, 89.05, 0.65, 95.30);

  arrow(c3Pts, { w: 4.0, layer: 'coral', head: 15 }, 89.60, 0.55);
  drawEnvelope(1224, 1818, 0.92, 89.88, 0.65, 96.75);

  // Brass Padlock at cable junction
  drawPadlock(1055, 1640, 0.96, 90.60, 0.75);
  SFX.push({ t: 91.05, type: 'lock', d: 0.15, pan: 0.1 });

  // =======================================================================
  // SHOT 8 (91.930 - 103.983s): ASISTEN PRIBADI — Key crossed out, live data flow,
  // AI Butler Robot & Cheering Murid (keeping Ctrl+C / Ctrl+V keycaps visible!)
  // =======================================================================
  // 92.15-93.80 Crossed House Key ("Tanpa bagi password") below cables
  drawCrossedKey(1062, 1852, 0.88, 92.15, 0.85, 93.05);

  // Traveling glowing packets along cables 94.10..103.50
  DYN.push({
    t0: 94.10, t1: 103.50,
    draw(t, c) {
      const cables = [
        { P: c1Pts, t0: 94.1 },
        { P: c2Pts, t0: 95.3 },
        { P: c3Pts, t0: 96.8 },
      ];
      ctx.save();
      cables.forEach(cb => {
        if (t < cb.t0) return;
        const u = ((t - cb.t0) * 1.15) % 1.0;
        const idx = Math.min(cb.P.length - 1, Math.floor(u * (cb.P.length - 1)));
        const [X, Y] = toScreen(c, cb.P[idx][0], cb.P[idx][1]);
        ctx.fillStyle = C.coral;
        ctx.beginPath();
        ctx.arc(X, Y, 7 * c.z, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = '#fbf7ee';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      ctx.restore();
    },
  });

  // 98.95 Celebrate in bottom-left with Bow-Tie AI Butler + Excited Cheering Murid!
  drawRobot(804, 1824, 0.74, 'butler', 98.95, 0.95);
  drawPerson(914, 1826, 0.68, 'murid', 'excited', 99.65, 0.90);
  TXT('ASISTEN', 858, 1898, 30, { f: 'CB', align: 'center', layer: 'coral' }, 100.45, 0.45);
  starStroke(934, 1888, 12, 5, { inner: 0.42, layer: 'coral', w: 2.4 }, 101.00, 0.45);
  PEN([[756, 1784], [736, 1770]], { w: 2.8, layer: 'coral' }, 101.65, 0.32);
  PEN([[750, 1816], [728, 1816]], { w: 2.8, layer: 'coral' }, 102.05, 0.32);
  SFX.push({ t: 99.15, type: 'chime', d: 0.5, pan: -0.15 });

  // =======================================================================
  // SHOT 9 (103.983 - 115.867s): STANDALONE NEW ILLUSTRATION — Zona 7 (cx=370, cy=2220)
  // 4-Pillar AI Toolkit Workbench + Turbo Productivity Speedometer & 100x Banner!
  // =======================================================================
  arrow(bez([760, 1855], [705, 1925], [665, 1988], [615, 2048], 18), { w: 5.0, layer: 'coral' }, 103.95, 0.75);

  // Top Header Ribbon: 4 JURUS UTAMA
  const hdr9 = roundedRectPts(215, 2002, 310, 56, 24, -0.01);
  BLOB(hdr9, C.mustard, { dx: 6, dy: 5, a: 0.88 }, 104.55, 0.45);
  PEN(hdr9.concat([hdr9[0]]), { w: 2.6, smooth: false }, 104.95, 0.35);
  TXT('4 JURUS UTAMA', 370, 2042, 36, { f: 'CB', align: 'center' }, 105.15, 0.55);

  // 2x2 Interlocking Toolkit Badges + Mini Icons (105.75 - 110.90s)
  const pCards = [
    { x: 132, y: 2082, col: C.mustard, label: '1. Context',  t: 105.75 },
    { x: 394, y: 2082, col: C.teal,    label: '2. Skills',   t: 107.10 },
    { x: 132, y: 2188, col: C.sage,    label: '3. Projects', t: 108.40 },
    { x: 394, y: 2188, col: C.sky,     label: '4. MCP',      t: 109.70 },
  ];
  pCards.forEach((pc, idx) => {
    const poly = roundedRectPts(pc.x, pc.y, 214, 82, 16, idx % 2 ? 0.01 : -0.01);
    BLOB(poly, pc.col, { dx: 6, dy: 5, a: 0.78 }, pc.t, 0.38);
    PEN(poly.concat([poly[0]]), { w: 2.5, smooth: false }, pc.t + 0.22, 0.28);
    // Mini hand-sketched emblem on left of each badge
    const ix = pc.x + 36, iy = pc.y + 41;
    if (idx === 0) {
      // Mini guitar body + neck
      circleStroke(ix, iy + 6, 11, { w: 2.2 }, pc.t + 0.42, 0.14);
      PEN([[ix, iy - 5], [ix, iy - 22]], { w: 2.4 }, pc.t + 0.56, 0.10);
    } else if (idx === 1) {
      // Mini rubber stamp
      circleStroke(ix, iy - 12, 8, { w: 2.2 }, pc.t + 0.42, 0.14);
      PEN([[ix - 14, iy + 8], [ix + 14, iy + 8]], { w: 3.2, layer: 'coral' }, pc.t + 0.56, 0.10);
    } else if (idx === 2) {
      // Mini gabled studio roof
      PEN([[ix - 14, iy + 12], [ix - 14, iy - 2], [ix, iy - 16], [ix + 14, iy - 2], [ix + 14, iy + 12]],
          { w: 2.2, smooth: false }, pc.t + 0.42, 0.20);
    } else {
      // Mini padlock shackle + box
      PEN([[ix - 8, iy - 2], [ix - 8, iy - 12], [ix + 8, iy - 12], [ix + 8, iy - 2]], { w: 2.2 }, pc.t + 0.42, 0.12);
      PEN([[ix - 11, iy - 2], [ix + 11, iy - 2], [ix + 11, iy + 14], [ix - 11, iy + 14], [ix - 11, iy - 2]],
          { w: 2.2, smooth: false }, pc.t + 0.54, 0.12);
    }
    TXT(pc.label, pc.x + 128, pc.y + 52, 32, { f: 'CB', align: 'center' }, pc.t + 0.52, 0.45);
    SFX.push({ t: pc.t + 0.25, type: 'pop', d: 0.12, pan: idx % 2 ? 0.2 : -0.2 });
  });

  // Central coral power hub linking the 4 pillars
  circleStroke(370, 2175, 22, { w: 3.4, layer: 'coral' }, 110.75, 0.35);
  starStroke(370, 2175, 12, 4, { inner: 0.35, layer: 'coral', w: 2.4 }, 111.05, 0.25);

  // 111.35-115.10 Turbo Speedometer Gauge + 100x PRODUKTIF Banner!
  drawTurboGauge(196, 2346, 0.88, 111.35, 1.10);
  const ban100 = roundedRectPts(278, 2298, 336, 94, 22, -0.01);
  BLOB(ban100, C.mustard, { dx: 9, dy: 8, a: 0.94 }, 112.15, 0.65);
  PEN(ban100.concat([ban100[0]]), { w: 3.6, smooth: false }, 112.75, 0.48);
  TXT('100× PRODUKTIF!', 446, 2358, 44, { f: 'CB', align: 'center', layer: 'coral' }, 113.25, 0.85);
  checkMark(586, 2284, 22, { w: 4.2, layer: 'coral' }, 114.20, 0.35);
  PEN([[268, 2292], [248, 2276]], { w: 3.6, layer: 'coral' }, 114.55, 0.22);
  PEN([[618, 2312], [638, 2298]], { w: 3.6, layer: 'coral' }, 114.78, 0.22);
  SFX.push({ t: 112.25, type: 'chime', d: 0.6, pan: 0.0 });

  // =======================================================================
  // SHOT 10 (115.867 - 133.094s): STANDALONE NEW ILLUSTRATION — Zona 8 (cx=1030, cy=2220)
  // 200x?! -> 4-Step Staircase ("obrolan depan") -> 2.000x! -> Pasukan Agen Squad -> Title Last!
  // =======================================================================
  arrow(bez([624, 2220], [670, 2206], [716, 2208], [760, 2220], 16), { w: 5.0, layer: 'coral' }, 115.85, 0.70);

  // Beat 1 (116.45 - 119.60s): Excited Murid asking for "200x?!"
  drawPerson(812, 2064, 0.78, 'murid', 'excited', 116.45, 1.15);
  const box200 = roundedRectPts(876, 2016, 178, 76, 16, -0.02);
  PEN(box200.concat([box200[0]]), { w: 2.5, layer: 'light', smooth: false }, 117.65, 0.55);
  TXT('200×?!', 965, 2068, 46, { f: 'CB', align: 'center', layer: 'coral' }, 118.25, 0.85);

  // Beat 2 (119.65 - 124.65s): "Gimana caranya?" -> "Dua ratus?! Tenang, obrolan depan aku kasih tahu caranya"
  // Draw Steps 01 & 02 + Climber Murid, then dashed future Steps 03 & 04 ("obrolan depan")
  const st1 = roundedRectPts(764, 2236, 62, 36, 6);
  const st2 = roundedRectPts(832, 2214, 62, 58, 6);
  BLOB(st1, C.sage, { dx: 4, dy: 4, a: 0.85 }, 119.65, 0.35);
  PEN(st1.concat([st1[0]]), { w: 2.2, smooth: false }, 120.00, 0.28);
  TXT('01', 795, 2262, 22, { f: 'CB', align: 'center' }, 120.28, 0.24);

  BLOB(st2, C.coral, { dx: 4, dy: 4, a: 0.82 }, 120.52, 0.35);
  PEN(st2.concat([st2[0]]), { w: 2.2, smooth: false }, 120.85, 0.28);
  TXT('02', 863, 2256, 22, { f: 'CB', align: 'center' }, 121.12, 0.24);

  // Mentor laughs "Dua ratus?!" (121.52s) -> sparks around 200x?! + Climber Murid on Step 02
  PEN([[890, 2004], [872, 1988]], { w: 3.4, layer: 'coral' }, 121.50, 0.25);
  PEN([[1040, 2004], [1058, 1988]], { w: 3.4, layer: 'coral' }, 121.78, 0.25);
  drawPerson(862, 2184, 0.44, 'murid', 'climber', 122.10, 0.75);

  const dashedBox = (bx, by, bw, bh, ts) => {
    const segs = [
      [[bx, by], [bx + bw * 0.4, by]], [[bx + bw * 0.58, by], [bx + bw, by]],
      [[bx + bw, by], [bx + bw, by + bh * 0.42]], [[bx + bw, by + bh * 0.60], [bx + bw, by + bh]],
      [[bx + bw, by + bh], [bx + bw * 0.58, by + bh]], [[bx + bw * 0.4, by + bh], [bx, by + bh]],
      [[bx, by + bh], [bx, by + bh * 0.58]], [[bx, by + bh * 0.40], [bx, by]],
    ];
    segs.forEach((sg, idx) => PEN(sg, { w: 2.0, layer: 'light', smooth: false }, ts + idx * 0.05, 0.05));
  };
  // "obrolan depan aku kasih tahu caranya" (123.0 - 125.3s) -> Future Steps 03 & 04
  dashedBox(900, 2192, 62, 80, 122.95);
  TXT('03', 931, 2248, 22, { f: 'CM', align: 'center', layer: 'light' }, 123.45, 0.30);
  dashedBox(968, 2168, 64, 104, 123.80);
  TXT('04', 1000, 2240, 22, { f: 'CM', align: 'center', layer: 'light' }, 124.30, 0.30);

  // Beat 3 (124.75 - 127.60s): "...bahkan sampai 2.000 kali lipat!"
  PEN([[884, 2060], [1046, 2046]], { w: 4.4, layer: 'coral' }, 124.75, 0.42);
  const tag2k = roundedRectPts(1078, 2012, 214, 82, 18, 0.02);
  BLOB(tag2k, C.mustard, { dx: 8, dy: 7, a: 0.94 }, 125.25, 0.55);
  PEN(tag2k.concat([tag2k[0]]), { w: 3.2, smooth: false }, 125.82, 0.42);
  TXT('2.000×!', 1185, 2068, 50, { f: 'CB', align: 'center', layer: 'coral' }, 126.28, 0.72);
  SFX.push({ t: 126.30, type: 'pop', d: 0.16, pan: 0.25 });

  // Beat 4 (127.40 - 129.85s): "...lewat sistem dan pasukan agen sendiri." -> 3-Robot PASUKAN AGEN Squad!
  drawRobot(1088, 2188, 0.58, 'happy', 127.40, 0.55);
  drawRobot(1168, 2176, 0.64, 'butler', 128.00, 0.60);
  drawRobot(1248, 2188, 0.58, 'happy', 128.65, 0.55);
  TXT('PASUKAN AGEN', 1168, 2266, 30, { f: 'CB', align: 'center' }, 129.22, 0.55);

  // Beat 5 (129.80 - 133.094s): "Sampai jumpa lagi!" + TITLE WRITTEN LAST at bottom of Zona 8
  const titleWash = roundedRectPts(770, 2306, 520, 96, 18, -0.01);
  BLOB(titleWash, C.mustard, { dx: 10, dy: 8, a: 0.92 }, 129.80, 0.55);
  PEN(titleWash.concat([titleWash[0]]), { w: 3.0, smooth: false }, 130.25, 0.40);
  TXT('AI TOOLS MASTERY', 1030, 2370, 56, { f: 'CB', align: 'center' }, 130.45, 0.95);
  PEN([[800, 2412], [1030, 2404], [1260, 2413]], { w: 5.6, layer: 'coral' }, 131.35, 0.50);

  // =======================================================================
  // CAMERA TIMELINE (Uniform z ~ 1.48..1.55 across all 10 shots -> 0 frame drop!)
  // =======================================================================
  CAM = [
    { t: 0.00,   x: 370,  y: 810,  z: 1.50, r: -1.0, k: 'g' },
    { t: 5.90,   x: 376,  y: 804,  z: 1.54, r: -0.6, k: 'd' },
    { t: 11.75,  x: 382,  y: 798,  z: 1.58, r: -0.4, k: 'd' },

    { t: 12.95,  x: 1030, y: 812,  z: 1.48, r: 0.9,  k: 'g' },
    { t: 21.60,  x: 1036, y: 806,  z: 1.51, r: 0.6,  k: 'd' },
    { t: 28.45,  x: 1022, y: 822,  z: 1.54, r: 0.4,  k: 'd' },

    { t: 29.75,  x: 370,  y: 1318, z: 1.48, r: -1.1, k: 'g' },
    { t: 35.00,  x: 365,  y: 1322, z: 1.51, r: -0.8, k: 'd' },
    { t: 39.45,  x: 360,  y: 1324, z: 1.53, r: -0.6, k: 'd' },

    { t: 40.55,  x: 372,  y: 1330, z: 1.55, r: 0.4,  k: 'p' },
    { t: 46.50,  x: 366,  y: 1344, z: 1.52, r: 0.2,  k: 'd' },
    { t: 51.85,  x: 360,  y: 1338, z: 1.50, r: 0.0,  k: 'd' },

    { t: 53.05,  x: 1030, y: 1318, z: 1.48, r: -0.9, k: 'g' },
    { t: 60.40,  x: 1035, y: 1312, z: 1.52, r: -0.5, k: 'd' },
    { t: 65.40,  x: 1030, y: 1322, z: 1.54, r: -0.2, k: 'd' },

    { t: 66.75,  x: 370,  y: 1858, z: 1.48, r: 1.1,  k: 'g' },
    { t: 72.20,  x: 375,  y: 1852, z: 1.50, r: 0.6,  k: 'd' },
    { t: 78.35,  x: 380,  y: 1848, z: 1.53, r: 0.3,  k: 'd' },

    { t: 79.60,  x: 1030, y: 1858, z: 1.48, r: -0.9, k: 'g' },
    { t: 87.80,  x: 1038, y: 1848, z: 1.51, r: -0.4, k: 'd' },
    { t: 91.85,  x: 1044, y: 1852, z: 1.53, r: -0.2, k: 'f', fn: t => [1085, 1850] },

    { t: 93.10,  x: 1046, y: 1856, z: 1.54, r: 0.4,  k: 'd' },
    { t: 99.10,  x: 1034, y: 1852, z: 1.51, r: 0.2,  k: 'd' },
    { t: 103.90, x: 1030, y: 1848, z: 1.49, r: 0.0,  k: 'd' },

    { t: 105.20, x: 370,  y: 2385, z: 1.48, r: -0.8, k: 'g' },
    { t: 111.30, x: 376,  y: 2378, z: 1.50, r: -0.3, k: 'd' },
    { t: 115.80, x: 380,  y: 2374, z: 1.52, r: 0.0,  k: 'd' },

    { t: 117.10, x: 1030, y: 2405, z: 1.47, r: 0.7,  k: 'g' },
    { t: 131.92, x: 1030, y: 2408, z: 1.48, r: 0.1,  k: 'd' },
    { t: 132.75, x: 1030, y: 2285, z: 1.50, r: 0.0,  k: 'g' },
    { t: FULL,   x: 1030, y: 2282, z: 1.51, r: 0.0,  k: 'd' },
  ];

  CAM.forEach((b, i) => {
    if (i > 0 && (b.k === 'g' || b.k === 'p' || b.k === 'f') && b.t > CAM[i - 1].t) {
      SFX.push({ t: CAM[i - 1].t, type: b.k === 'p' ? 'punch' : 'gesture', d: b.t - CAM[i - 1].t, pan: 0 });
    }
  });
};
