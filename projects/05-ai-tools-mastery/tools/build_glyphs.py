"""Generate stroke-by-stroke glyph skeletons for Caveat Bold (CB) & Medium (CM).
Reads local TTFs from assets/fonts/ and writes glyphs.json in project root.
"""
import json
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage
from fontTools.ttLib import TTFont

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = 220
CANDIDATES = ''.join(chr(c) for c in range(33, 127)) + '·°–—×≠→✓★…'
FONTS = {
    'CB': 'assets/fonts/Caveat-Bold.ttf',
    'CM': 'assets/fonts/Caveat-Medium.ttf',
}


def thin(img):
    I = np.pad(img.astype(np.uint8), 1)
    while True:
        changed = False
        for step in (0, 1):
            P2 = I[:-2, 1:-1]; P3 = I[:-2, 2:]; P4 = I[1:-1, 2:]; P5 = I[2:, 2:]
            P6 = I[2:, 1:-1]; P7 = I[2:, :-2]; P8 = I[1:-1, :-2]; P9 = I[:-2, :-2]
            nb = [P2, P3, P4, P5, P6, P7, P8, P9]
            B = sum(n.astype(int) for n in nb)
            seq = nb + [P2]
            A = sum(((seq[i] == 0) & (seq[i + 1] == 1)).astype(int) for i in range(8))
            c = ((P2 * P4 * P6 == 0) & (P4 * P6 * P8 == 0)) if step == 0 else ((P2 * P4 * P8 == 0) & (P2 * P6 * P8 == 0))
            m = (I[1:-1, 1:-1] == 1) & (B >= 2) & (B <= 6) & (A == 1) & c
            if m.any():
                I[1:-1, 1:-1][m] = 0
                changed = True
        if not changed:
            break
    return I[1:-1, 1:-1].astype(bool)


NB = [(-1, -1), (0, -1), (1, -1), (-1, 0), (1, 0), (-1, 1), (0, 1), (1, 1)]


def trace(sk):
    left = set(zip(*np.nonzero(sk.T)))
    def nbrs(p, pool):
        return [(p[0] + dx, p[1] + dy) for dx, dy in NB if (p[0] + dx, p[1] + dy) in pool]
    strokes = []
    cur = None
    while left:
        ends = [p for p in left if len(nbrs(p, left)) <= 1]
        cand = ends if ends else list(left)
        start = (
            min(cand, key=lambda p: p[0] + p[1] * 0.6)
            if cur is None
            else min(cand, key=lambda p: (p[0] - cur[0]) ** 2 + (p[1] - cur[1]) ** 2)
        )
        path = [start]
        left.discard(start)
        d = None
        while True:
            nx = nbrs(path[-1], left)
            if not nx:
                break
            if d is None:
                q = min(nx, key=lambda p: abs(p[0] - path[-1][0]) + abs(p[1] - path[-1][1]))
            else:
                q = max(
                    nx,
                    key=lambda p: ((p[0] - path[-1][0]) * d[0] + (p[1] - path[-1][1]) * d[1])
                    / max(1e-6, np.hypot(p[0] - path[-1][0], p[1] - path[-1][1])),
                )
            for r in nbrs(path[-1], left):
                if r != q and abs(r[0] - q[0]) <= 1 and abs(r[1] - q[1]) <= 1:
                    left.discard(r)
            path.append(q)
            left.discard(q)
            k = min(len(path) - 1, 4)
            d = (path[-1][0] - path[-1 - k][0], path[-1][1] - path[-1 - k][1])
        cur = path[-1]
        if len(path) >= 3 or not strokes:
            strokes.append(path)
        else:
            strokes[-1].extend(path)
    return strokes


def rdp(P, eps):
    if len(P) < 3:
        return P
    a, b = np.array(P[0], float), np.array(P[-1], float)
    ab = b - a
    L = np.hypot(*ab)
    d = [
        abs(ab[0] * (p[1] - a[1]) - ab[1] * (p[0] - a[0])) / L
        if L
        else np.hypot(*(np.array(p, float) - a))
        for p in P
    ]
    i = int(np.argmax(d))
    if d[i] > eps:
        return rdp(P[: i + 1], eps)[:-1] + rdp(P[i:], eps)
    return [P[0], P[-1]]


def main():
    out = {}
    for key, rel_path in FONTS.items():
        fp = os.path.join(PROJ, rel_path)
        cmap = TTFont(fp).getBestCmap() or {}
        font = ImageFont.truetype(fp, S)
        g = {}
        hws = []
        skipped = []
        for ch in CANDIDATES:
            if ord(ch) not in cmap:
                skipped.append(ch)
                continue
            pad = S
            img = Image.new('L', (S * 3, S * 3), 0)
            ImageDraw.Draw(img).text((pad, pad * 2), ch, font=font, fill=255, anchor='ls')
            a = np.array(img) > 110
            if not a.any():
                continue
            dt = ndimage.distance_transform_edt(a)
            sk = thin(a)
            hws.append(np.percentile(dt[sk], 90))
            g[ch] = [
                [round(v, 4) for p in rdp(st, 0.9) for v in ((p[0] - pad) / S, (p[1] - pad * 2) / S)]
                for st in trace(sk)
            ]
        out[key] = {'hw': round(float(np.median(hws)) / S, 4), 'g': g}
        print(f'{key}: {len(g)} glyphs, hw={out[key]["hw"]}, skipped={"".join(skipped)}')
    out_path = os.path.join(PROJ, 'glyphs.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(out, f, separators=(',', ':'), ensure_ascii=False)
    print(f'wrote {out_path} ({os.path.getsize(out_path)} bytes)')


if __name__ == '__main__':
    main()
