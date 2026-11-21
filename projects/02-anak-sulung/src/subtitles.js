// Swiss Editorial Kinetic Typography (2-3 words per beat, IG story lyric style)
import { g, W, H, text, rect, over, ink } from './draw.js';
import { clamp, seg, eo } from './lib.js';

let CHUNKS = [];

export function setSubtitles(sched, wordsData = []) {
  CHUNKS = [];
  if (!wordsData || !wordsData.length) return;

  for (const line of wordsData) {
    const words = line.words || [];
    if (!words.length) continue;

    let cur = [];
    for (let i = 0; i < words.length; i++) {
      cur.push(words[i]);
      const isEndPunct = /[.,?!:;]$/.test(words[i].w);
      const isLongEnough = cur.length >= 3;
      const isLast = i === words.length - 1;

      // Split on punctuation, after 2-3 words, or at end
      if (isEndPunct || isLongEnough || isLast) {
        const chunkText = cur.map(w => w.w).join(' ');
        const t0 = cur[0].t0;
        const nextWord = words[i + 1];
        const t1 = nextWord ? nextWord.t0 : cur[cur.length - 1].t1 + 0.6;
        const hasKw = cur.some(w => w.kw);

        CHUNKS.push({
          shot: line.shot,
          text: chunkText,
          t0,
          t1,
          hasKw,
          leadWord: cur.find(w => w.kw)?.w || cur[cur.length - 1].w
        });
        cur = [];
      }
    }
  }
}

/**
 * Renders kinetic Swiss Editorial subtitle phrase on-screen
 * @param {number} t
 * @param {number} posY (default: 1720, or custom per scene)
 */
export function drawSubtitles(t, posY = 1720) {
  if (!CHUNKS.length) return;

  // Find active 2-3 word chunk
  const chunk = CHUNKS.find(c => t >= c.t0 - 0.05 && t < c.t1 + 0.35);
  if (!chunk) return;

  const duration = Math.max(0.25, chunk.t1 - chunk.t0);
  const enterProg = eo(seg(t, chunk.t0 - 0.04, chunk.t0 + 0.12));
  const exitProg = 1 - seg(t, chunk.t1 + 0.1, chunk.t1 + 0.35);
  const alpha = enterProg * exitProg;
  if (alpha <= 0.01) return;

  const pop = 0.94 + 0.06 * enterProg;

  g.save();
  g.translate(W / 2, posY);
  g.scale(pop, pop);

  // Swiss Editorial typography layout
  // 1. Subtle, ultra-clean paper-white knockout backer pill (no ugly heavy boxes)
  const isKw = chunk.hasKw;
  const fontSize = isKw ? 46 : 40;
  const fontSpec = isKw ? `800 ${fontSize}px Jost` : `600 ${fontSize}px Jost`;

  g.font = fontSpec;
  const tw = g.measureText(chunk.text).width;
  const pillW = tw + 56;
  const pillH = fontSize + 24;

  // Paper knockout backing
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = 'rgb(0,0,0)'; // paper-white knockout
  g.beginPath();
  g.roundRect(-pillW / 2, -pillH / 2, pillW, pillH, 8);
  g.fill();

  // Thin terracotta riso accent bar beneath
  rect(-pillW / 2, pillH / 2 - 3, pillW, 3, [0, 0.85, 0.2]);

  // 2. Riso Double-hit printed text (Navy Indigo + Terracotta offset shadow)
  over(() => {
    text(chunk.text, 2, 2, fontSpec, [0, 0.5, 0], 'center', 'middle');
  });
  text(chunk.text, 0, 0, fontSpec, [0.98, 0.1, 0], 'center', 'middle');

  g.restore();
}
