// Kinetic editorial subtitles, drawn on the paper (no box). Word timings come from edge-tts WordBoundary.
function drawSubs(T) {
  const c = CL.find(c => T >= c.t0 && T < c.t1); if (!c) return;
  const a = ss(seg(T, c.t0, c.t0 + .16)) * (1 - ss(seg(T, c.t1 - .1, c.t1)));
  const slide = 14 * (1 - eo(seg(T, c.t0, c.t0 + .2)));
  const keep = TXT; TXT = null;
  const X0 = 104, MAXW = 880, SIZE = 54, LH = 70, Y0 = 1636 + slide;
  g.save(); g.globalAlpha = a; g.textBaseline = 'alphabetic'; g.letterSpacing = '-0.5px';
  g.font = `600 ${SIZE}px Jost`; const sp = g.measureText(' ').width;
  const lines = []; let cur = [], cw = 0;
  for (const w of c.words) {
    g.font = `${w.kw ? 700 : 600} ${SIZE}px Jost`; const ww = g.measureText(w.w).width;
    if (cur.length && cw + sp + ww > MAXW) { lines.push(cur); cur = []; cw = 0; }
    cur.push({ w, ww, x: cur.length ? cw + sp : 0 }); cw = cur.length > 1 ? cw + sp + ww : ww;
  }
  lines.push(cur);
  if (lines.length > 1 && lines[lines.length - 1].length === 1) { const m = lines[lines.length - 2].pop(); lines[lines.length - 1].unshift(m); }
  lines.forEach(l => { let x = 0; l.forEach((o, i) => { o.x = x; x += o.ww + sp; }); });
  const top = Y0 - SIZE * .85, bot = Y0 + (lines.length - 1) * LH + 14;
  // progress rail
  g.fillStyle = C.wire; g.fillRect(76, top, 4, bot - top);
  g.fillStyle = C.acc; g.fillRect(76, top, 4, (bot - top) * seg(T, c.t0, c.t1 - .1));
  // chapter kicker
  g.font = '500 20px Jost'; g.letterSpacing = '2.5px'; g.fillStyle = C.mute; g.fillText(c.chapter, X0, top - 14 + slide * .3);
  g.letterSpacing = '-0.5px';
  lines.forEach((l, li) => l.forEach(o => {
    const w = o.w, y = Y0 + li * LH;
    const reached = T >= w.t0, act = ss(seg(T, w.t0, w.t0 + .08)) * (1 - ss(seg(T, w.t1, w.t1 + .2)));
    const lift = -5 * act, sc = 1 + .04 * act;
    let col = C.ghost; if (reached) col = w.kw ? C.acc : (act > .3 ? '#14161C' : C.ink);
    g.save(); g.translate(X0 + o.x, y + lift); g.scale(sc, sc);
    g.font = `${w.kw ? 700 : 600} ${SIZE}px Jost`; g.fillStyle = col; g.fillText(w.w, 0, 0);
    if (w.kw && reached) {
      const pr = eo(seg(T, w.t0, w.t0 + .24)); g.strokeStyle = C.acc; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath();
      g.moveTo(0, 12); g.quadraticCurveTo(o.ww * pr * .5, 18, o.ww * pr, 10); g.stroke();
    }
    g.restore();
  }));
  g.restore(); TXT = keep;
}
