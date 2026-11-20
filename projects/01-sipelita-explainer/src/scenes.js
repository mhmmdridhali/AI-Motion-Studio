// SI-PELITA: sparse protagonist stickman (Shots 1, 2, 4 only) + bespoke geometric shapes in warm paper & Kemenag Emerald.
let SCHED, CL, LOGO;
const EVT = [], CAMS = {}, DRAWS = {}, HUDS = {};
const SH = n => SCHED.shots[n - 1];
const clause = id => CL.find(c => c.id === id);
const cw = (id, i) => { const w = clause(id).words; return w[i < 0 ? w.length + i : i].t0; };
const ev = (t, type, o = {}) => EVT.push({ t, type, ...o });
const panOf = x => clamp((x - 540) / 540, -1, 1);

// ================= SHOT 1: 1 operator + sinking chat bubbles, drifting forms & question rings =================
function buildS1() {
  const s = SH(1), gy = 1170, wy = 1210, S = 305;
  const op = actor({ x: 250, y: gy, S, appear: .35, life: [-.5, s.end + .3] });
  const chatT = cw('01b', 0), formT = cw('01c', 0), askT = cw('01d', 0), scratchT = askT + 1.1;
  op.tg = T => {
    const p = idle(0, T);
    if (T >= chatT && T < askT) { p.head += .18 * ss(seg(T, chatT, chatT + .4)); p.lean += .05 * ss(seg(T, chatT, chatT + .4)); }
    if (T >= scratchT) { p.ra = 2.62; p.rb = .18; p.lean = -.03; p.head = .12; p.hy += .02; }
    return p;
  };
  ev(chatT, 'drop', { pan: .35 }); ev(formT, 'sigh', { pan: .4 }); ev(askT, 'pop', { pan: -.3 }); ev(scratchT, 'sigh', { pan: -.4 });

  const chats = [
    { x: 640, y0: 930, sink: 320, t: chatT - .3, w: 170, h: 66, side: -1 },
    { x: 760, y0: 840, sink: 350, t: chatT - .05, w: 185, h: 68, side: 1 },
    { x: 600, y0: 760, sink: 380, t: chatT + .25, w: 165, h: 62, side: -1 },
    { x: 745, y0: 690, sink: 400, t: chatT + .55, w: 175, h: 64, side: 1 }
  ];
  const forms = [
    { x0: 610, y0: 920, dx: 240, dy: -220, rot: .28, t: formT },
    { x0: 660, y0: 980, dx: 270, dy: 10, rot: -.24, t: formT + .25 },
    { x0: 590, y0: 1040, dx: 180, dy: 130, rot: .35, t: formT + .5 }
  ];
  const qs = [
    { x: 185, y: 745, r: 28, t: askT + .1 },
    { x: 325, y: 705, r: 34, t: askT + .45 },
    { x: 425, y: 805, r: 24, t: askT + .85 }
  ];
  const lw = { size: 78, w: 600, track: -1.5 };
  CAMS[1] = T => { const u = ss(seg(T, 0, s.end)); return { x: lerp(540, 485, u), y: lerp(960, 985, u), z: lerp(1, 1.12, u) }; };
  DRAWS[1] = T => {
    groundWire(40, 1040, wy, T, 0, .8);
    // buried envelope near bottom of chat stack
    const sinkEnv = eio(seg(T, chatT + .1, chatT + 2.4));
    envelope(690, lerp(1040, 1185, sinkEnv), 84, .18 * sinkEnv, sinkEnv > .45, eo(seg(T, .6, 1.0)) * (1 - seg(T, formT + 1.8, formT + 2.5)));
    // sinking chat bubbles
    chats.forEach(c => {
      const inc = eo(seg(T, c.t, c.t + .35)), sk = eio(seg(T, chatT + .2, chatT + 2.4));
      const y = c.y0 + c.sink * sk, al = inc * clamp(1 - (y - wy + 20) / 110);
      if (al > .02) chatBubble(c.x, y, c.w, c.h, c.side, sk > .35, al);
    });
    // drifting scattered forms with fading dashed links
    forms.forEach(f => {
      const a = eo(seg(T, f.t - .3, f.t)), sp = eio(seg(T, f.t, f.t + 1.4));
      const x = f.x0 + f.dx * sp, y = f.y0 + f.dy * sp;
      if (a > .02) {
        g.save(); g.globalAlpha = a * (1 - sp * .65); g.strokeStyle = C.wire; g.lineWidth = 4; g.setLineDash([4, 10]);
        g.beginPath(); g.moveTo(430, 1020); g.lineTo(x, y); g.stroke(); g.restore();
        formSheet(x, y, 74, 94, f.rot * sp, sp > .5, a);
      }
    });
    // floating question marks on status tanya ulang
    qs.forEach((q, k) => {
      const a = eo(seg(T, q.t, q.t + .35)), bob = Math.sin(T * 3 + k * 2) * 8;
      if (a > .02) questionRing(q.x, q.y + bob, q.r * lerp(.6, 1, a), a);
    });
    drawGroup([op], [], T);
  };
  HUDS[1] = T => {
    hud('Chat tenggelam.', 76, 300, lw, cw('01b', 0));
    hud('Form terpencar.', 76, 392, lw, cw('01c', 1));
    hud('Status ditanya ulang.', 76, 484, lw, cw('01d', 0));
  };
}

// ================= SHOT 2: 1 operator + rising Emerald SI-PELITA portal arch =================
function buildS2() {
  const s = SH(2), gy = 1170, wy = 1210, S = 305;
  const pT0 = cw('02a', 0) + .05, pT1 = pT0 + .85, tp = pT0 + .85 * 520 / 680;
  const sendT = cw('02b', 7) + .05, enterT = sendT + .95;
  const xO = T => 270 + 210 * eio(seg(T, cw('02b', 3), sendT - .1));
  const op = actor({ x: xO, y: gy, S, appear: s.start - 1.5, life: [s.start - 2.2, s.end + .3] });
  op.tg = T => {
    const p = idle(7, T), up = ss(seg(T, tp, tp + .45)), sl = 1 - up;
    p.lean += .2 * sl; p.head += .32 * sl; p.hy += .03 * sl + .03 * bell(T, tp - .25, tp - .02);
    if (T >= sendT && T < enterT + .25) { const ext = ss(seg(T, sendT, sendT + .3)) * (1 - ss(seg(T, enterT - .1, enterT + .25))); p.ra = lerp(p.ra, 1.45, ext); p.rb = lerp(p.rb, .15, ext); p.lean += .06 * ext; }
    const hop = Math.sin(Math.PI * seg(T, enterT + .1, enterT + .38)); p.lfy += .05 * hop; p.rfy += .05 * hop; p.hy -= .05 * hop;
    walkInto(p, xO, T, S, 1); return p;
  };
  ev(pT0 - .1, 'portal', { pan: .45 }); ev(pT0, 'ripple', { d: .85 }); ev(tp, 'stand', { pan: -.4 });
  ev(sendT, 'pulse', { d: .9 }); ev(enterT, 'handshake', { big: 1 });
  const nodes = [270, 410, 550];
  CAMS[2] = T => { const u = eio(seg(T, pT0, pT0 + 1.6)); return { x: lerp(340, 540, u), y: lerp(1000, 960, u), z: lerpZ(1.22, 1, u) }; };
  DRAWS[2] = T => {
    groundWire(40, 1040, wy, T, s.start - 1, s.start - .2);
    pulseOnWire(790, 110, wy, pT0, pT1, T);
    nodes.forEach(x => node(x, wy, ss(seg(T, pT0 + (790 - x) / 680 * .85, pT0 + (790 - x) / 680 * .85 + .1)), 10));
    const openU = popS(T - (pT0 - .1), 15, .52), pWave = T >= enterT ? (T - enterT) * 1.1 : 0;
    if (openU < .15) node(790, wy, ss(seg(T, pT0 - .1, pT0 + .05)), 14, bell(T, pT0 - .1, pT0 + .4));
    pulseOnWire(790, 60, wy, enterT, enterT + .65, T, 220); pulseOnWire(790, 1020, wy, enterT, enterT + .65, T, 220);
    // Emerald portal archway
    portalArch(790, wy, 196, 310, openU, pWave, eo(seg(T, pT0 - .1, pT0 + .2)));
    text('SI-PELITA', 790, wy + 62, { size: 30, w: 600, col: C.acc, align: 'center', a: eo(seg(T, cw('02b', 6), cw('02b', 6) + .35)) });
    const gr = drawGroup([op], [], T);
    // envelope rises from operator chest and glides cleanly into the portal archway
    const j = gr.Jm.get(op);
    if (j && T > pT0 + .4) {
      const ap = eo(seg(T, tp + .1, tp + .5)), f = eio(seg(T, sendT + .15, enterT));
      const A = [j.aR[1][0] + 10, j.aR[1][1] - 6], B = [790, wy - 140], Ctl = [(A[0] + B[0]) / 2, A[1] - 90];
      const pos = qpt(A, Ctl, B, f), sc = f > .85 ? lerp(1, .2, (f - .85) / .15) : 1;
      if (f < 1) envelope(pos[0], pos[1], 78 * sc, 0, false, ap * (f > .85 ? 1 - (f - .85) / .15 : 1));
    }
  };
  HUDS[2] = T => {
    const a = eo(seg(T, cw('02b', 0) - .3, cw('02b', 0) + .1));
    if (a > 0) {
      g.save(); g.globalAlpha = a; g.drawImage(LOGO, 76, 190, 76, 68); g.restore();
      text('Seksi Pendidikan Madrasah', 176, 222, { size: 28, w: 600, a });
      text('Kemenag Kabupaten Banjar', 176, 258, { size: 28, w: 500, col: C.mute, a });
    }
    hud('SI-PELITA', 76, 520, { size: 150, w: 700, col: C.acc, track: -3 }, cw('02b', 7) - .05, 20);
    hud('Layanan satu pintu', 76, 604, { size: 46, w: 500 }, sendT + .65);
  };
}

// ================= SHOT 3: 0 stickmen - 3 conduits -> sorting prism -> tickets + anti-duplikasi shield =================
function buildS3() {
  const s = SH(3), names = ['EMIS 4.0', 'VervalPD', 'Kolektif'], subs = ['Salah tingkat', 'NISN/NIK ganda', 'Banyak siswa'], kinds = ['emis', 'verval', 'kolektif'];
  const ys = [775, 1015, 1255], px = 640, py = 1015;
  const lp = [cw('03a', 1) - .25, cw('03a', 2) - .25, cw('03a', 5) - .25], tk = [0, .35, .7].map(d => cw('03b', 4) + d);
  const antiT = cw('03b', 7) - .05;
  lp.forEach((t, i) => { ev(t, 'pop', { pan: -.3 }); ev(tk[i] - .35, 'prism'); ev(tk[i], 'ticket', { pan: .35 }); });
  ev(antiT, 'shield', { pan: .55 });

  CAMS[3] = T => { const u = eio(seg(T, s.start, s.start + 1.6)); return { x: lerp(620, 540, u), y: lerp(1015, 975, u), z: lerpZ(1.65, 1, u) }; };
  DRAWS[3] = T => {
    const pApp = eo(seg(T, s.start + .2, s.start + .8));
    // 3 converging left curves & 3 clean horizontal right tracks
    ys.forEach((y, i) => {
      const a = eo(seg(T, lp[i], lp[i] + .35)), tr = eio(seg(T, lp[i] + .2, tk[i] - .15)), outTr = eio(seg(T, tk[i], tk[i] + .45));
      g.save(); g.lineCap = 'round';
      // base left conduit
      g.strokeStyle = C.wire; g.lineWidth = 7;
      g.beginPath(); g.moveTo(395, y); g.bezierCurveTo(510, y, 520, py, px, py); g.stroke();
      // live Emerald fill to prism
      if (tr > 0) {
        const pts = []; for (let k = 0; k <= 24; k++) { const u = k / 24, iu = 1 - u; pts.push([iu * iu * iu * 395 + 3 * iu * iu * u * 510 + 3 * iu * u * u * 520 + u * u * u * px, iu * iu * iu * y + 3 * iu * iu * u * y + 3 * iu * u * u * py + u * u * u * py]); }
        g.strokeStyle = C.acc; g.lineWidth = 7; strokePoly(pts, polyLen(pts) * tr);
      }
      // output line from prism to ticket node
      g.strokeStyle = C.wire; g.beginPath(); g.moveTo(px, py); g.bezierCurveTo(705, py, 710, y, 895, y); g.stroke();
      if (outTr > 0) {
        const opts = []; for (let k = 0; k <= 24; k++) { const u = k / 24, iu = 1 - u; opts.push([iu * iu * iu * px + 3 * iu * iu * u * 705 + 3 * iu * u * u * 710 + u * u * u * 895, iu * iu * iu * py + 3 * iu * iu * u * py + 3 * iu * u * u * y + u * u * u * y]); }
        g.strokeStyle = C.acc; strokePoly(opts, polyLen(opts) * outTr);
      }
      g.restore();

      text(names[i], 76, y - 8, { size: 44, w: 600, a });
      text(subs[i], 78, y + 26, { size: 22, w: 500, col: C.mute, a });
      // travelling glyph
      const gt = eio(seg(T, lp[i] + .2, tk[i] - .15)), gx = lerp(395, 585, gt), gy = lerp(y, py, gt * gt);
      if (a > .02 && gt < .98) channelGlyph(kinds[i], gx, gy, 44, mix(C.ink, C.acc, gt), a);
      // output ticket badge
      const tPop = popS(T - tk[i], 16, .5);
      if (tPop > .02) ticket(lerp(px + 50, 865, eo(seg(T, tk[i], tk[i] + .45))), lerp(py, y, eo(seg(T, tk[i], tk[i] + .45))), 74 * clamp(tPop, 0, 1.08), clamp(tPop));
    });

    // central sorting prism
    const prismBeat = Math.max(...tk.map(t => bell(T, t - .2, t + .25)));
    prismGate(px, py, 54, prismBeat, pApp);

    // Anti-duplikasi shield + bounced grey duplicate ticket on lane 0
    const shApp = eo(seg(T, antiT - .8, antiT - .4)), dupIn = eo(seg(T, antiT - 1.2, antiT)), bounce = seg(T, antiT, antiT + .85);
    if (shApp > .02) shieldPulse(768, ys[0], 30, bounce, shApp);
    if (dupIn > .02 && bounce < .98) {
      const dx = T < antiT ? lerp(1005, 818, dupIn) : 818 + 180 * eo(bounce), dy = T < antiT ? ys[0] : ys[0] - 135 * eo(bounce) + 75 * bounce * bounce;
      ticket(dx, dy, 66, dupIn * (1 - bounce * .85), true);
    }
    text('ANTI-DUPLIKASI', 825, 575, { size: 24, w: 600, col: C.acc, align: 'center', track: 3, a: eo(seg(T, antiT - .8, antiT - .35)) });
  };
  HUDS[3] = T => {
    hud('Tiga jalur,', 76, 290, { size: 84, w: 600, track: -1.5 }, cw('03a', 0));
    hud('satu pintu.', 76, 382, { size: 84, w: 600, col: C.acc, track: -1.5 }, cw('03a', 1));
  };
}

// ================= SHOT 4: 1 operator + phone + 4 geometric nodes & elastic return =================
function buildS4() {
  const s = SH(4), gy = 1150, wy = 1185, S = 265, xs = [445, 595, 745, 895], labs = ['Baru', 'Diterima', 'Diproses', 'Selesai'];
  const op = actor({ x: 165, y: gy, S, appear: s.start + .15, life: [s.start - .6, s.end + .3] });
  const tSend = s.start + 1.0, tR = cw('04b', 4) - .15, rel1 = cw('04b', 1) + .1, c1b = cw('04c', 2);
  const hopB = c1b + .55, hopC = hopB + .6, arrive = hopC + .55;
  op.tg = T => {
    const p = idle(50, T);
    p.hy += .03 * bell(T, tR + .5, tR + .85);
    const cheer = Math.sin(Math.PI * seg(T, arrive + .05, arrive + .35));
    if (cheer > 0) { p.lfy += .04 * cheer; p.rfy += .04 * cheer; p.hy -= .04 * cheer; }
    return p;
  };
  ev(tSend, 'pulse', { d: .8 }); ev(rel1, 'drop'); ev(tR, 'spring', { pan: -.35 }); ev(tR + .72, 'patch', { pan: -.3 });
  ev(c1b, 'pulse', { d: .9 }); ev(arrive, 'done', { pan: .55 });

  CAMS[4] = T => { const u = ss(seg(T, s.start, s.end)); return { x: lerp(470, 540, u), y: lerp(990, 960, u), z: lerp(1.12, 1, u) }; };
  DRAWS[4] = T => {
    const app = eo(seg(T, s.start + .3, s.start + .8));
    // Operator + phone tracker on left
    const phPulse = T < tR ? seg(T, tSend, rel1) : seg(T, c1b, arrive);
    if (app > .02) phoneTracker(295, gy - 75, 76, 134, phPulse, app);
    text('No. WA', 295, wy + 62, { size: 26, w: 600, col: C.mute, align: 'center', a: app });

    // 4-node geometric pipeline emerging cleanly from right edge of phone (x = 335)
    groundWire(335, 925, wy - 55, T, s.start, s.start + .75);
    const pulseW = T >= c1b ? seg(T, c1b, arrive) : seg(T, tSend, tSend + 1.1) * .52;
    if (pulseW > 0) pulseOnWire(335, 895, wy - 55, 0, 1, pulseW, 240);

    const onB = ss(seg(T, tSend + .45, tSend + .65)), onD = ss(seg(T, tSend + .9, tSend + 1.1)), onP = ss(seg(T, hopB, hopB + .35)), onS = ss(seg(T, arrive, arrive + .25));
    const ly = wy - 55;
    node(xs[0], ly, onB, 13);
    // Node 1 (Diterima): clean small diamond
    g.save(); g.translate(xs[1], ly); g.fillStyle = mix(C.paper, C.acc, onD); g.strokeStyle = mix(C.wire, C.acc, onD); g.lineWidth = 5;
    g.beginPath(); g.moveTo(0, -18); g.lineTo(18, 0); g.lineTo(0, 18); g.lineTo(-18, 0); g.closePath(); g.fill(); g.stroke(); g.restore();
    // Node 2 (Diproses): spinning orbital ring
    orbitalRing(xs[2], ly, 24, T * 3.8 * (onP > .1 ? 1 : .2), onP, app);
    // Node 3 (Selesai): check badge
    checkBadge(xs[3], ly, 26, ss(seg(T, arrive, arrive + .45)), onS, app);

    const ons = [onB, onD, onP, onS];
    xs.forEach((x, i) => text(labs[i], x, wy + 62, { size: 28, w: 600, col: mix(C.mute, C.acc, ons[i]), align: 'center', a: eo(seg(T, s.start + .35 + i * .12, s.start + .7 + i * .12)) }));
    drawGroup([op], [], T);

    // Document travels Phone -> Diterima -> springs back high in Emerald arc -> patched checkmark -> Selesai
    let pos = [295, gy - 90], patched = T >= tR + .72, sc = 1;
    if (T < tSend) pos = [295, gy - 90];
    else if (T < tSend + 1.0) pos = [lerp(295, xs[1], eio(seg(T, tSend, tSend + 1.0))), ly - 64];
    else if (T < tR) pos = [xs[1], ly - 64 + Math.sin((T - tSend) * 8) * 3];
    else if (T < tR + .72) {
      const A = [xs[1], ly - 64], B = [295, gy - 110], mid = [(A[0] + B[0]) / 2, 560], u = eio(seg(T, tR, tR + .72));
      pos = qpt(A, mid, B, u);
      const pts = quadPts(A, mid, B, 32); g.save(); g.strokeStyle = C.acc; g.lineWidth = 5; g.lineCap = 'round'; g.setLineDash([2, 16]); strokePoly(pts, polyLen(pts) * u); g.restore();
    } else if (T < c1b) pos = [295, gy - 110];
    else if (T < arrive) pos = [lerp(295, xs[3], eio(seg(T, c1b, arrive))), ly - 64];
    else { sc = 1 - eo(seg(T, arrive, arrive + .25)); pos = [xs[3], ly - 64]; }
    if (sc > .05) formSheet(pos[0], pos[1], 66 * sc, 82 * sc, 0, false, app * sc, patched);
  };
  HUDS[4] = T => {
    hud('Lacak lewat No. WA', 76, 290, { size: 64, w: 600, track: -1 }, s.start + .8);
    hud('Berkas kurang? Tenang.', 76, 366, { size: 40, w: 500, col: C.mute }, cw('04b', 0));
    hud('Perbaiki Data', 76, 500, { size: 96, w: 700, col: C.acc, track: -2 }, cw('04c', 2) - .1);
    hud('tanpa ketik ulang', 76, 572, { size: 40, w: 500 }, cw('04c', 2) + .4);
  };
}

// ================= SHOT 5: 0 stickmen - >95% radial ring + 24-hour clock halo + streaming beads =================
function buildS5() {
  const s = SH(5), p0 = cw('05b', 0), pEnd = cw('05b', 8) + .3;
  ev(p0, 'sweep', { d: 1.6 }); ev(cw('05b', 4), 'pop', { pan: 0 }); ev(pEnd - .2, 'done');
  CAMS[5] = T => { const u = eio(seg(T, s.start, s.start + 1.8)); return { x: 540, y: lerp(990, 960, u), z: lerpZ(1.4, 1, u) }; };
  DRAWS[5] = T => {
    const cx = 540, cy = 1020, r = 215, app = eo(seg(T, s.start + .15, s.start + .75));
    const frac = .96 * eio(seg(T, p0 - .2, pEnd));
    const ticksU = seg(T, cw('05b', 4) - .2, pEnd + .3);
    if (app > .02) radialProgress(cx, cy, r, frac, ticksU, app);
    // inbound report beads joining the ring
    for (let i = 0; i < 14; i++) {
      const bt = s.start + .45 + i * .22, f = seg(T, bt, bt + .75); if (f <= 0 || f >= 1) continue;
      const th = -2.6 + i * .38, rad = lerp(420, r, eio(f));
      g.save(); g.fillStyle = mix(C.mute, C.acc, eo(f)); g.globalAlpha = Math.sin(Math.PI * f);
      g.beginPath(); g.arc(cx + Math.cos(th) * rad, cy + Math.sin(th) * rad, 8, 0, Math.PI * 2); g.fill(); g.restore();
    }
    const ck = ss(seg(T, cw('05b', 6), cw('05b', 8) + .2));
    checkBadge(cx, cy, 56, ck, ck, app);
  };
  HUDS[5] = T => {
    hud('Ratusan laporan masuk', 76, 240, { size: 38, w: 500, col: C.mute }, cw('05b', 0));
    hud('> 95%', 76, 430, { size: 190, w: 700, col: C.acc, track: -5 }, cw('05b', 2), 24);
    hud('terselesaikan', 76, 505, { size: 48, w: 600 }, cw('05b', 3));
    hud('Akses 24 jam', 76, 565, { size: 36, w: 500, col: C.mute }, cw('05b', 4));
  };
}

// ================= SHOT 6: 0 stickmen - 3 organic quotes + connected harmonic wave & A/B/C badges =================
function buildS6() {
  const s = SH(6), xs = [260, 540, 820], wy = 1175, letters = ['A', 'B', 'C'], tq = [cw('06a', 0), cw('06a', 2), cw('06a', 5)];
  const Q = [
    { lab: 'OPERATOR MADRASAH A', l: ['\u201CSangat membantu ketika ada kendala', 'data di madrasah kami.\u201D'], y: 260 },
    { lab: 'OPERATOR MADRASAH B', l: ['\u201CTim langsung cepat menangani dan', 'berhasil mengatasinya.\u201D'], y: 470 },
    { lab: 'OPERATOR MADRASAH C', l: ['\u201CProsesnya cepat tanpa ribet,', 'tanpa menunggu lama.\u201D'], y: 680 }];
  tq.forEach((t, i) => ev(t, 'wave', { pan: panOf(xs[i]) }));
  CAMS[6] = T => { const u = ss(seg(T, s.start, s.end)); return { x: 540, y: lerp(985, 965, u), z: lerp(1, 1.05, u) }; };
  DRAWS[6] = T => {
    const app = eo(seg(T, s.start + .1, s.start + .6));
    g.save(); g.lineCap = 'round'; g.lineWidth = 7;
    const pts = []; for (let i = 0; i <= 48; i++) { const u = i / 48, x = lerp(110, 970, u), y = wy + Math.sin(u * Math.PI * 4 - T * 2.2) * 16; pts.push([x, y]); }
    g.globalAlpha = app; g.strokeStyle = C.wire; strokePoly(pts, polyLen(pts));
    const fillU = eio(seg(T, tq[0], tq[2] + .8));
    if (fillU > 0) { g.strokeStyle = C.acc; strokePoly(pts, polyLen(pts) * fillU); }
    g.restore();
    xs.forEach((x, i) => {
      const u = (x - 110) / 860, by = wy + Math.sin(u * Math.PI * 4 - T * 2.2) * 16;
      const on = ss(seg(T, tq[i], tq[i] + .25)), rp = seg(T, tq[i], tq[i] + .8);
      if (app > .02) monogramWaveBadge(x, by, letters[i], 46, on, rp, app);
    });
  };
  HUDS[6] = T => {
    Q.forEach((q, i) => {
      const a = eo(seg(T, tq[i], tq[i] + .4)), dy = 16 * (1 - eo(seg(T, tq[i], tq[i] + .45)));
      if (a <= 0) return;
      text(q.lab, 76, q.y + dy, { size: 24, w: 600, col: C.mute, track: 2.5, a });
      g.save(); g.font = '600 24px Jost'; g.letterSpacing = '2.5px'; const lw = g.measureText(q.lab).width; g.restore();
      g.save(); g.globalAlpha = a; for (let k = 0; k < 5; k++) star(76 + lw + 34 + k * 30, q.y - 8 + dy, 11, C.acc); g.restore();
      q.l.forEach((ln, k) => text(ln, 76, q.y + 58 + k * 50 + dy, { size: 40, w: 500, a, id: 'q' + i + '-' + k }));
    });
  };
}

// ================= SHOT 7: 0 stickmen - converging institutional ribbons + Official Kemenag Seal =================
function buildS7() {
  const s = SH(7), t7 = cw('07a', 0);
  ev(s.start + .4, 'pulse', { d: 1.0 }); ev(s.start + .5, 'seal');
  CAMS[7] = () => ({ x: 540, y: 960, z: 1 });
  DRAWS[7] = T => {
    const cx = 540, cy = 1190, drawU = eio(seg(T, s.start + .15, s.start + 1.4)), flU = eio(seg(T, t7 - .2, t7 + 1.2));
    const offsets = [-88, 0, 88];
    g.save(); g.lineCap = 'round'; g.lineWidth = 6.5;
    [-1, 1].forEach(side => offsets.forEach((oy, k) => {
      const x0 = side < 0 ? 76 : 1004, y0 = cy + oy, cp1x = side < 0 ? 270 : 810, cp2x = side < 0 ? 390 : 690;
      const pts = []; for (let i = 0; i <= 28; i++) { const u = i / 28, iu = 1 - u; pts.push([iu * iu * iu * x0 + 3 * iu * iu * u * cp1x + 3 * iu * u * u * cp2x + u * u * u * cx, iu * iu * iu * y0 + 3 * iu * iu * u * y0 + 3 * iu * u * u * cy + u * u * u * cy]); }
      const L = polyLen(pts);
      g.strokeStyle = C.wire; if (drawU > 0) strokePoly(pts, L * drawU);
      const fu = clamp(flU * 1.15 - k * .08); if (fu > 0) { g.strokeStyle = C.acc; strokePoly(pts, L * fu); }
    }));
    g.restore();
    // calm closing focal rings + solid Emerald portal keystone
    const kPop = popS(T - (s.start + .55), 14, .55), pulseR = fract(Math.max(0, T - t7) * .45);
    g.save(); g.strokeStyle = C.wire; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, 78, 0, Math.PI * 2); g.stroke();
    if (T > t7) { g.globalAlpha = (1 - pulseR) * .55; g.strokeStyle = C.acc; g.beginPath(); g.arc(cx, cy, 44 + 85 * eo(pulseR), 0, Math.PI * 2); g.stroke(); }
    g.globalAlpha = clamp(kPop); g.fillStyle = C.paper; g.strokeStyle = C.acc; g.lineWidth = 8; g.beginPath(); g.arc(cx, cy, 42 * clamp(kPop, 0, 1.08), 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = C.acc; g.beginPath(); g.arc(cx, cy, 16 * clamp(kPop, 0, 1.08), 0, Math.PI * 2); g.fill();
    g.restore();
  };
  HUDS[7] = T => {
    const a = eo(seg(T, s.start + .5, s.start + 1.0));
    if (a > 0) { g.save(); g.globalAlpha = a; g.drawImage(LOGO, 435, 330 + 14 * (1 - a), 210, 188); g.restore(); }
    hud('SI-PELITA', 540, 700, { size: 120, w: 700, col: C.acc, align: 'center', track: -2 }, t7 - .1, 20);
    hud('Seksi Pendidikan Madrasah', 540, 775, { size: 40, w: 600, align: 'center' }, t7 + .5);
    hud('Kantor Kementerian Agama Kabupaten Banjar', 540, 825, { size: 30, w: 500, col: C.mute, align: 'center' }, t7 + .9);
  };
}

// ================= model sheet (protagonist + relevant geometric shapes + subtitles) =================
function buildSheet() {
  DRAWS.sheet = () => {
    text('LEMBAR MODEL HIBRIDA', 76, 130, { size: 22, w: 600, col: C.mute, track: 4 });
    text('Figur hemat, bentuk relevan.', 76, 205, { size: 62, w: 600, track: -1.5 });
    figure({ x: 250, gy: 735, S: 420, lws: 1.0 }, idle(0, 0));
    const notes = [
      ['Protagonis Tunggal', 'hanya 3 kemunculan Operator (Shot 1, 2, 4)'],
      ['Kurva Kontinu', 'lengan, kaki & tulang belakang satu bezier mulus'],
      ['Satu Aksen Emerald', 'penanda aliran SI-PELITA, portal, shield & hasil']
    ];
    notes.forEach(([a, b], i) => {
      const y = 375 + i * 118; g.fillStyle = C.acc; g.beginPath(); g.arc(510, y - 8, 7, 0, Math.PI * 2); g.fill();
      text(a, 534, y, { size: 30, w: 600 }); text(b, 534, y + 36, { size: 22, w: 400, col: C.mute });
    });
    text('BENTUK GEOMETRIS RELEVAN', 76, 865, { size: 22, w: 600, col: C.mute, track: 3 });
    groundWire(60, 1020, 1270, 5, 0, 1);
    chatBubble(185, 1015, 136, 56, -1, false, 1); formSheet(185, 1135, 62, 78, .12, true, 1);
    text('Chat & Form', 185, 1320, { size: 24, w: 600, col: C.mute, align: 'center' });
    portalArch(435, 1270, 136, 220, 1, .35, 1);
    text('Portal Satu Pintu', 435, 1320, { size: 24, w: 600, col: C.acc, align: 'center' });
    prismGate(675, 1070, 44, .4, 1); shieldPulse(675, 1190, 26, .22, 1);
    text('Prism & Anti-Dup', 675, 1320, { size: 24, w: 600, col: C.mute, align: 'center' });
    radialProgress(900, 1130, 82, .96, 1, 1); checkBadge(900, 1130, 26, 1, 1, 1);
    text('Cincin > 95%', 900, 1320, { size: 24, w: 600, col: C.acc, align: 'center' });
    text('Subtitle kinetik: rel progres kiri, kata aktif terangkat, garis bawah tinta Emerald.', 76, 1465, { size: 23, w: 500, col: C.mute });
  };
}

// ================= controller =================
function buildAll(mode) {
  ACTORS.length = 0; EVT.length = 0;
  if (mode === 'sheet') buildSheet();
  else { buildS1(); buildS2(); buildS3(); buildS4(); buildS5(); buildS6(); buildS7(); }
  ACTORS.forEach(e => simulateActor(e));
  if (mode !== 'sheet') {
    ACTORS.forEach(e => { if (e.appear > 0) ev(e.appear, 'pop', { pan: panOf(typeof e.x === 'function' ? e.x(e.appear) : e.x), q: 1 }); });
    SCHED.shots.forEach(sh => ev(sh.start, 'thud'));
  }
}
function renderFrame(Tin) {
  T_NOW = Tin; paper();
  const sh = SCHED.shots.find(s => Tin >= s.start && Tin < s.end) || SCHED.shots[SCHED.shots.length - 1], n = sh.shot, cam = CAMS[n](Tin);
  g.setTransform(cam.z, 0, 0, cam.z, W / 2 - cam.x * cam.z, H / 2 - cam.y * cam.z);
  DRAWS[n](Tin); g.setTransform(1, 0, 0, 1, 0, 0); HUDS[n](Tin); drawSubs(Tin);
}
function renderSheet() {
  T_NOW = 5; paper(); g.setTransform(1, 0, 0, 1, 0, 0); DRAWS.sheet();
  const c = clause('04c'); drawSubs(c.words[3].t0 + .15);
}
