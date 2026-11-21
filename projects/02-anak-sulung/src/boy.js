// Detailed illustrated human little boy character (Anak Sulung)
// Risograph 3-plate palette: [Navy, Terracotta, Gold]
import { g, circle, ellipse, rect, rrect, poly, blob, line, curve, ring, layer, over, inkA } from './draw.js';
import { clamp, lerp, ss } from './lib.js';

export const BOY_PAL = {
  skin: [0, 0.28, 0.08],        // warm peachy skin
  skinSh: [0.12, 0.44, 0.25],    // shadow on neck/ears
  cheek: [0, 0.15, 0.75],       // rosy youthful blush
  hair: [0.95, 0.22, 0],        // dark textured hair
  eye: [0.98, 0.05, 0],         // pupil & lashes
  mouth: [0.85, 0.25, 0.3],     // lips
  shirtA: [0, 0.85, 0.2],       // terracotta base
  shirtB: [0, 0, 0],            // cream paper stripes (knockout)
  shorts: [0.85, 0.15, 0],      // navy shorts
  shoe: [0.95, 0.3, 0],         // sneakers
  sock: [0, 0.1, 0.8],          // gold/white socks
};
const P = BOY_PAL;

/**
 * Draws the head of the little boy
 * @param {number} x, y, s
 * @param {string} expr: 'thoughtful' | 'tired' | 'determined' | 'warm' | 'peace'
 * @param {number} lookX, lookY, tilt
 */
export function drawBoyHead(x, y, s, expr = 'thoughtful', opts = {}) {
  g.save();
  g.translate(x, y);
  g.scale(s, s);
  if (opts.tilt) g.rotate(opts.tilt);

  // 1. Ears
  ellipse(-28, 6, 6, 9, -0.1, P.skinSh);
  ellipse(28, 6, 6, 9, 0.1, P.skinSh);
  circle(-28, 6, 5, P.skin);
  circle(28, 6, 5, P.skin);

  // 2. Head & face shape (soft, boyish jaw)
  blob([
    [-26, -16], [-18, -32], [0, -38], [18, -32], [26, -16],
    [27, 4], [22, 22], [11, 32], [0, 35], [-11, 32], [-22, 22], [-27, 4]
  ], P.skin);

  // 3. Rosy cheeks (warm riso blush)
  circle(-15, 14, 7, P.cheek);
  circle(15, 14, 7, P.cheek);

  // 4. Hair (messy textured boyish cut with strands and cowlick)
  blob([
    [-30, 6], [-33, -14], [-24, -36], [-8, -44], [10, -44],
    [26, -38], [34, -22], [32, 2], [26, -14], [16, -16],
    [8, -12], [-2, -18], [-12, -15], [-20, -6], [-25, 8]
  ], P.hair);
  // Cowlick strand on top
  curve([[-4, -43], [-10, -56], [-2, -54]], 4, P.hair);
  curve([[6, -42], [14, -53], [18, -46]], 3.5, P.hair);

  // 5. Eyebrows
  const by = expr === 'tired' ? -13 : expr === 'determined' ? -15 : -14;
  if (expr === 'determined') {
    line([[-20, by + 2], [-7, by - 1]], 3.6, P.hair);
    line([[7, by - 1], [20, by + 2]], 3.6, P.hair);
  } else if (expr === 'tired') {
    line([[-20, by - 1], [-7, by + 2]], 3.2, P.hair);
    line([[7, by + 2], [20, by - 1]], 3.2, P.hair);
  } else {
    // gentle slight curve
    curve([[-20, by], [-13, by - 2], [-7, by]], 3.4, P.hair);
    curve([[7, by], [13, by - 2], [20, by]], 3.4, P.hair);
  }

  // 6. Eyes
  const ey = -2;
  const lx = opts.lookX || 0;
  const ly = opts.lookY || 0;
  if (expr === 'peace') {
    // Closed happy/peaceful curved eyelids
    curve([[-19, ey + 1], [-13, ey + 5], [-7, ey + 1]], 3.2, P.eye);
    curve([[7, ey + 1], [13, ey + 5], [19, ey + 1]], 3.2, P.eye);
  } else if (expr === 'tired') {
    // Heavy/sleepy lids
    line([[-19, ey], [-7, ey]], 3, P.eye);
    circle(-13 + lx, ey + 2 + ly, 2.8, P.eye);
    line([[7, ey], [19, ey]], 3, P.eye);
    circle(13 + lx, ey + 2 + ly, 2.8, P.eye);
  } else {
    // Open expressive eyes
    circle(-13 + lx, ey + ly, 3.4, P.eye);
    circle(13 + lx, ey + ly, 3.4, P.eye);
    // tiny reflection dot
    circle(-14 + lx, ey - 1 + ly, 1.2, [0, 0, 0]);
    circle(12 + lx, ey - 1 + ly, 1.2, [0, 0, 0]);
  }

  // 7. Small nose
  curve([[-1, 4], [-3, 11], [2, 12]], 2.8, P.skinSh);

  // 8. Mouth
  const my = 22;
  if (expr === 'peace' || expr === 'warm') {
    // Gentle warm smile
    curve([[-8, my - 1], [0, my + 4], [8, my - 1]], 3, P.mouth);
  } else if (expr === 'determined') {
    // Resolute straight line
    line([[-7, my], [7, my]], 3.2, P.mouth);
  } else {
    // Thoughtful small curve
    curve([[-6, my], [0, my + 1.5], [6, my]], 2.8, P.mouth);
  }

  g.restore();
}

/**
 * Top-down high-angle bird's-eye view of the little boy carrying heavy load
 */
export function drawBoyTopDown(x, y, s, opts = {}) {
  g.save();
  g.translate(x, y);
  g.scale(s, s);

  // 1. Small sneakers peeking out below hunched body
  rrect(-26, 32, 22, 34, 6, P.shoe);
  rrect(4, 32, 22, 34, 6, P.shoe);
  // Socks
  rect(-24, 22, 18, 12, P.sock);
  rect(6, 22, 18, 12, P.sock);

  // 2. Hunched shoulders & striped t-shirt (seen from above)
  ellipse(0, 10, 48, 28, 0, P.shirtA);
  // Stripes across back/shoulders
  for (let sy = -2; sy <= 22; sy += 8) {
    rect(-42, sy, 84, 3.5, P.shirtB);
  }

  // 3. Neck & small ears
  circle(-34, -14, 7, P.skin);
  circle(34, -14, 7, P.skin);

  // 4. Head seen from top/high-angle (hair crown & cowlick)
  circle(0, -14, 34, P.hair);
  // Messy hair strands radiating outward
  blob([
    [-32, -18], [-24, -38], [-4, -46], [12, -44],
    [32, -26], [36, -8], [28, 12], [8, 16],
    [-12, 16], [-28, 4]
  ], P.hair);
  // Hair whirl / cowlick
  curve([[-2, -22], [-8, -36], [-2, -32]], 3.5, [0.85, 0.1, 0]);
  curve([[4, -20], [12, -34], [8, -30]], 3, [0.85, 0.1, 0]);

  g.restore();
}
export function drawFullBoy(x, y, s, opts = {}) {
  const {
    pose = 'stand', // 'stand' | 'sit' | 'walk' | 'hold_roof' | 'peace'
    expr = 'thoughtful',
    lookX = 0, lookY = 0,
    headTilt = 0,
    breath = 0
  } = opts;

  g.save();
  g.translate(x, y);
  g.scale(s, s);

  const breathY = Math.sin(breath) * 3;

  if (pose === 'stand') {
    // 1. Legs & Shoes
    // Left leg
    rect(-18, -40, 14, 76, P.shorts);
    rect(-18, 36, 14, 18, P.sock);
    rrect(-24, 52, 24, 15, 5, P.shoe);
    // Right leg
    rect(4, -40, 14, 76, P.shorts);
    rect(4, 36, 14, 18, P.sock);
    rrect(4, 52, 24, 15, 5, P.shoe);

    // 2. Torso (Striped T-shirt)
    g.save();
    g.translate(0, -110 + breathY);
    // Shirt base
    rrect(-24, 0, 48, 72, 8, P.shirtA);
    // Stripes
    for (let sy = 12; sy < 66; sy += 16) {
      rect(-24, sy, 48, 6, P.shirtB);
    }
    // Shorts waistband
    rect(-25, 68, 50, 12, P.shorts);

    // Arms hanging naturally
    line([[-24, 10], [-28, 44], [-22, 68]], 11, P.shirtA);
    circle(-22, 73, 6, P.skin); // hand
    line([[24, 10], [28, 44], [22, 68]], 11, P.shirtA);
    circle(22, 73, 6, P.skin); // hand

    // Head
    drawBoyHead(0, -28, 1.0, expr, { tilt: headTilt, lookX, lookY });
    g.restore();

  } else if (pose === 'sit') {
    // Sitting at desk / chair
    // Legs bent
    rect(-24, -20, 48, 18, P.shorts); // lap
    rect(18, -4, 15, 62, P.shorts); // lower leg
    rect(18, 56, 15, 14, P.sock);
    rrect(16, 68, 26, 14, 5, P.shoe);

    g.save();
    g.translate(0, -96 + breathY);
    // Torso angled slightly forward
    g.rotate(-0.06);
    rrect(-22, 0, 44, 76, 8, P.shirtA);
    for (let sy = 12; sy < 66; sy += 16) rect(-22, sy, 44, 6, P.shirtB);

    // Left arm resting on desk
    line([[-20, 12], [-14, 42], [22, 45]], 10, P.shirtA);
    circle(24, 45, 6, P.skin);

    // Right arm supporting chin or pen
    line([[20, 12], [28, 32], [14, -6]], 10, P.shirtA);
    circle(14, -8, 6, P.skin);

    // Head tilted
    drawBoyHead(0, -28, 1.0, expr, { tilt: headTilt || 0.15, lookX, lookY });
    g.restore();

  } else if (pose === 'walk') {
    // Walking forward with weight
    const step = Math.sin(breath * 2);
    // Legs swinging
    line([[-10, -40], [-18 - step * 14, 10], [-24 - step * 16, 52]], 14, P.shorts);
    rrect(-28 - step * 16, 50, 24, 14, 4, P.shoe);

    line([[10, -40], [18 + step * 14, 10], [24 + step * 16, 52]], 14, P.shorts);
    rrect(20 + step * 16, 50, 24, 14, 4, P.shoe);

    g.save();
    g.translate(0, -110 + Math.abs(step) * 4);
    g.rotate(0.08); // leaning forward against load
    rrect(-24, 0, 48, 72, 8, P.shirtA);
    for (let sy = 12; sy < 66; sy += 16) rect(-24, sy, 48, 6, P.shirtB);

    // Arms grasping straps of load on back
    line([[-22, 12], [-32, 38], [-18, 52]], 11, P.shirtA);
    circle(-16, 52, 6, P.skin);
    line([[22, 12], [12, 36], [2, 48]], 11, P.shirtA);
    circle(2, 48, 6, P.skin);

    drawBoyHead(0, -28, 1.0, expr, { tilt: headTilt || -0.1, lookX, lookY });
    g.restore();

  } else if (pose === 'hold_roof') {
    // Standing as a solid pillar, both arms reaching up holding the beam
    // Feet planted wide and firmly
    rect(-28, -40, 16, 82, P.shorts);
    rrect(-34, 40, 26, 16, 5, P.shoe);
    rect(12, -40, 16, 82, P.shorts);
    rrect(12, 40, 26, 16, 5, P.shoe);

    g.save();
    g.translate(0, -112 + breathY * 0.5);
    rrect(-26, 0, 52, 74, 8, P.shirtA);
    for (let sy = 12; sy < 66; sy += 16) rect(-26, sy, 52, 6, P.shirtB);

    // Left arm reaching high up
    line([[-24, 14], [-52, -40], [-48, -120]], 13, P.shirtA);
    circle(-48, -125, 8, P.skin); // strong hand touching beam

    // Right arm reaching high up
    line([[24, 14], [52, -40], [48, -120]], 13, P.shirtA);
    circle(48, -125, 8, P.skin); // strong hand touching beam

    // Head looking slightly upward with calm determination
    drawBoyHead(0, -30, 1.05, 'determined', { tilt: 0, lookY: -3 });
    g.restore();

  } else if (pose === 'peace') {
    // Standing peacefully, smiling with eyes closed in comfort
    rect(-18, -40, 14, 76, P.shorts);
    rect(-18, 36, 14, 18, P.sock);
    rrect(-24, 52, 24, 15, 5, P.shoe);
    rect(4, -40, 14, 76, P.shorts);
    rect(4, 36, 14, 18, P.sock);
    rrect(4, 52, 24, 15, 5, P.shoe);

    g.save();
    g.translate(0, -108 + breathY);
    rrect(-24, 0, 48, 72, 8, P.shirtA);
    for (let sy = 12; sy < 66; sy += 16) rect(-24, sy, 48, 6, P.shirtB);

    // Relaxed arms at sides
    line([[-22, 12], [-26, 42], [-20, 64]], 10, P.shirtA);
    circle(-20, 68, 6, P.skin);
    line([[22, 12], [26, 42], [20, 64]], 10, P.shirtA);
    circle(20, 68, 6, P.skin);

    // Head resting comfortably with eyes closed in peace
    drawBoyHead(0, -28, 1.0, 'peace', { tilt: headTilt || 0.1 });
    g.restore();
  }

  g.restore();
}
