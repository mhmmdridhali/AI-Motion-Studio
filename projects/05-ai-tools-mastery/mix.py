"""Audio synthesis & mastering for Part 2 (Tangga 02: AI Tools Mastery).

Supports 2-phase workflow:
  - Phase 1 (before events.json exists): Voice + G-major 100 BPM acoustic pluck BGM +
    vectorized -8 dB ducking + -18 dB punchline silence dips -> out/mix.wav (-14 LUFS).
  - Phase 2 (after events.json is exported from window.EV): Adds event-synced procedural
    pencil/brush/shatter/pop/lock/gesture foley with -50% foley ducking under VO.
"""
import json
import os
import sys
import numpy as np
import soundfile as sf
from scipy.signal import butter, lfilter, resample_poly, sosfilt

LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'lemo-opuscar'))
sys.path.insert(0, LIB)
from core.audio import pluck as P
from core.audio.sfx import SR, bp, lp, hp, add, compress, limit, click, whoosh, thump, pop, ding

HERE = os.path.dirname(os.path.abspath(__file__))
SCH = json.load(open(os.path.join(HERE, 'voice', 'schedule.json'), encoding='utf-8'))
WORDS = json.load(open(os.path.join(HERE, 'voice', 'words.json'), encoding='utf-8'))
FULL = float(SCH['shots'][-1]['end'])
FROM = float(sys.argv[1]) if len(sys.argv) > 1 else 0.0
TO = float(sys.argv[2]) if len(sys.argv) > 2 else FULL
DUR = TO - FROM
N = int(round(DUR * SR))
tt = np.arange(N) / SR
rng = np.random.default_rng(202602)

# Cache synthesized plucks for fast iteration while retaining full waveguide quality
_PLUCK_CACHE = {}


def cached_pluck(preset, pitch, dur=None, vel=0.8, **kw):
    key = (
        preset,
        str(pitch),
        None if dur is None else round(float(dur), 2),
        round(float(vel), 2),
        tuple(sorted((k, round(float(v), 2) if isinstance(v, float) else v) for k, v in kw.items())),
    )
    if key not in _PLUCK_CACHE:
        _PLUCK_CACHE[key] = P.pluck(preset, pitch, dur=dur, vel=vel, **kw)
    return _PLUCK_CACHE[key]


def fast_ma(x, win_sec):
    """Vectorized causal-centered moving average via scipy.signal.lfilter."""
    k = max(1, int(round(win_sec * SR)))
    b = np.ones(k, dtype=np.float64) / k
    y = lfilter(b, [1.0], np.concatenate([x, np.zeros(k // 2)]))
    return np.clip(y[k // 2 : k // 2 + len(x)], 0.0, 1.0)


def measure_lufs(audio):
    """Approximate ITU-R BS.1770-4 integrated LUFS for stereo 48 kHz audio."""
    # Stage 1 pre-filter (high shelf +4dB above 1.5kHz) & Stage 2 RLB high-pass (~38Hz)
    sos1 = butter(2, 1681.0, 'high', fs=SR, output='sos')
    sos2 = butter(2, 38.0, 'high', fs=SR, output='sos')
    ch_pow = []
    for c in range(audio.shape[1]):
        x = audio[:, c].astype(np.float64)
        hp_x = sosfilt(sos2, x)
        hs_x = hp_x + 0.58 * sosfilt(sos1, hp_x)  # +3.97 dB high-shelf approximation
        ch_pow.append(hs_x ** 2)
    z_sum = ch_pow[0] + ch_pow[1]
    blk = int(0.4 * SR)
    step = int(0.1 * SR)
    powers = []
    for i in range(0, max(1, len(z_sum) - blk + 1), step):
        powers.append(float(np.mean(z_sum[i : i + blk])))
    p_arr = np.array(powers)
    p_abs = p_arr[p_arr > 10 ** ((-70.0 + 0.691) / 10.0)]
    if len(p_abs) == 0:
        return -70.0
    l_abs = -0.691 + 10.0 * np.log10(np.mean(p_abs))
    rel_thr = 10 ** ((l_abs - 10.0 + 0.691) / 10.0)
    p_rel = p_abs[p_abs > rel_thr]
    if len(p_rel) == 0:
        return float(l_abs)
    return float(-0.691 + 10.0 * np.log10(np.mean(p_rel)))


# ---------------- 1. Extract word anchors for punchline dips ----------------
def find_word_window(line_id, target_substr, pre=0.14, post=0.55):
    for entry in WORDS:
        if entry['id'] != line_id:
            continue
        for w in entry['words']:
            if target_substr.lower() in w['w'].lower():
                return (max(0.0, w['t0'] - pre), min(FULL, w['t1'] + post))
    return None


PUNCHLINE_DIPS = [
    find_word_window('s02_1', 'trinity', 0.12, 0.55) or (21.55, 22.85),
    find_word_window('s03_1', 'jazz', 0.12, 0.52) or (33.80, 34.85),
    find_word_window('s09_1', '100', 0.15, 0.65) or (112.10, 113.15),
    find_word_window('s10_2', 'ratus', 0.15, 0.62) or (121.35, 122.45),
]


def in_dip(t):
    return any(a <= t <= b for a, b in PUNCHLINE_DIPS)


# ---------------- 2. Warm Upbeat Acoustic Pluck BGM (G major, 100 BPM) ----------------
BEAT = 60.0 / 100.0  # 0.60 s
BAR = 4 * BEAT       # 2.40 s

CHORDS = {
    'Gmaj7':  (['G3', 'B3', 'D4', 'F#4'], 'G2', 'D2'),
    'Em7':    (['E3', 'G3', 'B3', 'D4'],  'E2', 'B1'),
    'Cmaj7':  (['C3', 'G3', 'B3', 'E4'],  'C2', 'G2'),
    'D7sus':  (['D3', 'G3', 'A3', 'C4'],  'D2', 'A2'),
    'Bm7':    (['B2', 'F#3', 'A3', 'D4'], 'B1', 'F#2'),
    'Am7':    (['A2', 'E3', 'G3', 'C4'],  'A1', 'E2'),
    'Gmaj9':  (['G3', 'A3', 'B3', 'F#4'], 'G2', 'D2'),
}

PROGRESSION = (
    ['Gmaj7', 'Em7', 'Cmaj7', 'D7sus'] * 6
    + ['Bm7', 'Em7', 'Am7', 'D7sus'] * 4
    + ['Gmaj7', 'Em7', 'Cmaj7', 'D7sus'] * 3
    + ['Bm7', 'Em7', 'Am7', 'D7sus', 'Gmaj9', 'Gmaj9']
)

music = np.zeros((N, 2), dtype=np.float64)
shaker_grid = np.zeros(N, dtype=np.float64)

n_bars = int(np.ceil(FULL / BAR)) + 1
for b in range(n_bars):
    t0 = b * BAR
    if t0 >= FULL - 1.4:
        break
    cname = PROGRESSION[b % len(PROGRESSION)]
    vo, root, fifth = CHORDS[cname]
    hook_only = b < 2  # Bars 0-1 (0..4.8s): light nylon guitar only

    # Upright bass pizzicato on beats 1 and 3 (enters after hook at 4.8s)
    if not hook_only and t0 < 131.4:
        for beat_off, pitch, vel in [(0.0, root, 0.72), (2.0 * BEAT, fifth, 0.62)]:
            t_note = t0 + beat_off - FROM
            if 0.0 <= t_note < DUR - 1.2 and not in_dip(t_note + FROM):
                y = cached_pluck('upright_bass_pizz', pitch, dur=BEAT * 1.65, vel=vel)
                add(music, y, t_note, gain=0.42, pan=-0.04)

    # Syncopated fingerstyle nylon guitar comping
    sub_beats = [0.0, 1.5, 2.5] if hook_only else [0.0, 1.0, 1.5, 2.5, 3.0, 3.5]
    for sb in sub_beats:
        t_g = t0 + sb * BEAT - FROM
        if t_g < 0.0 or t_g >= DUR - 1.2 or in_dip(t_g + FROM):
            continue
        if sb == 0.0:
            for j, note in enumerate(vo):
                y = cached_pluck('nylon_guitar', note, dur=0.55, vel=0.52)
                add(music, y, t_g + j * 0.015, gain=0.22, pan=-0.16 + j * 0.10)
        elif sb in (1.5, 3.5):
            for j, note in enumerate(vo[1:]):
                y = cached_pluck('nylon_guitar', note, dur=0.32, vel=0.44)
                add(music, y, t_g + j * 0.010, gain=0.18, pan=-0.08 + j * 0.11)
        else:
            note = vo[int(sb * 2) % len(vo)]
            y = cached_pluck('nylon_guitar', note, dur=0.38, vel=0.40)
            add(music, y, t_g, gain=0.17, pan=0.14 if sb < 2 else -0.14)

    # Soft egg shaker on eighth notes after bar 1
    if not hook_only and t0 < 130.8:
        for e_idx in range(8):
            t_sh = t0 + e_idx * (BEAT / 2.0) - FROM
            if 0.0 <= t_sh < DUR - 1.5 and not in_dip(t_sh + FROM):
                s_idx = int(round(t_sh * SR))
                sh_len = int(0.035 * SR)
                if s_idx + sh_len < N:
                    env_s = np.exp(-np.arange(sh_len) / (0.008 * SR))
                    accent = 1.0 if e_idx % 2 == 0 else 0.55
                    shaker_grid[s_idx : s_idx + sh_len] += rng.standard_normal(sh_len) * env_s * accent * 0.045

if np.any(shaker_grid):
    sh_hp = hp(shaker_grid, 4800)
    add(music, sh_hp, 0.0, gain=0.45, pan=0.22)

# Kalimba melodic accents & landing chords at key structural turning points
KALIMBA_HITS = [
    (6.24, ['D5', 'G5'], 0.58),          # S1 mentor turn
    (12.26, ['B4', 'D5', 'G5'], 0.62),   # S2 3 AI tools
    (22.15, ['D5', 'F#5', 'A5'], 0.72),  # S2 AI Trinity chord
    (28.90, ['E5', 'G5'], 0.55),         # S3 music analogy
    (39.84, ['G4', 'B4', 'D5'], 0.65),   # S4 context re-register
    (60.55, ['C5', 'E5', 'G5'], 0.70),   # S5 Skills stamp
    (71.50, ['B4', 'D5', 'F#5'], 0.64),  # S6 Projects wall
    (86.40, ['E5', 'G5', 'B5'], 0.68),   # S7 MCP Hub
    (100.20, ['D5', 'G5', 'B5'], 0.72),  # S8 Asisten pribadi!
    (104.28, ['G4', 'D5', 'G5'], 0.68),  # S9 Recap
    (112.58, ['B4', 'D5', 'F#5', 'A5'], 0.78),  # S9 100x
    (122.40, ['C5', 'E5', 'G5'], 0.70),  # S10 200x->2000x
    (129.60, ['G4', 'B4', 'D5', 'A5'], 0.75),   # S10 Title arrival
]
for t_hit, notes, vel in KALIMBA_HITS:
    if not (FROM <= t_hit < TO - 0.3):
        continue
    for j, pitch in enumerate(notes):
        y = cached_pluck('kalimba', pitch, dur=1.25, vel=vel * (1.0 - 0.06 * j))
        add(music, y, t_hit - FROM + j * 0.032, gain=0.22, pan=0.18 - j * 0.12)

# Warm final landing chord at 131.35s leaving clean ring to end
t_fin = 131.35 - FROM
if 0.0 <= t_fin < DUR - 0.2:
    for j, note in enumerate(['G2', 'D3', 'G3', 'A3', 'B3', 'F#4']):
        y = cached_pluck('nylon_guitar', note, dur=1.7, vel=0.66)
        add(music, y, t_fin + j * 0.035, gain=0.26, pan=-0.20 + j * 0.08)

# Fade out tail smoothly over final 1.6s
fade_env = np.clip((FULL - (tt + FROM)) / 1.6, 0.0, 1.0) ** 1.35
music *= fade_env[:, None]

# Subtle studio room warmth on music bed
room_dly = int(0.023 * SR)
music_room = np.vstack([np.zeros((room_dly, 2)), music[:-room_dly]])
music = music * 0.90 + lp(music_room, 3200, 1) * 0.12

# ---------------- 3. Voice Narration Track ----------------
voice = np.zeros((N, 2), dtype=np.float64)
speak_raw = np.zeros(N, dtype=np.float64)

loaded_vo = 0
for item in SCH['voice']:
    vid = item['id']
    st = float(item['start'])
    cand_paths = [os.path.join(HERE, 'voice', 'wav', f'{vid}.wav'), os.path.join(HERE, 'voice', f'{vid}.wav')]
    wav_path = next((p for p in cand_paths if os.path.exists(p)), None)
    if not wav_path:
        raise FileNotFoundError(f'Missing voice clip for {vid}: tried {cand_paths}')
    loaded_vo += 1
    x, sr_in = sf.read(wav_path)
    if x.ndim > 1:
        x = x.mean(axis=1)
    if sr_in != SR:
        x = resample_poly(x, SR, sr_in)
    x = hp(x, 80)
    peak = float(np.abs(x).max()) + 1e-9
    x = compress(x / peak * 0.62, thr=0.18, ratio=2.8, att=0.004, rel=0.085)
    # Soft 5ms head/tail micro-fade
    mf = min(len(x) // 4, int(0.005 * SR))
    if mf > 0:
        x[:mf] *= np.linspace(0, 1, mf)
        x[-mf:] *= np.linspace(1, 0, mf)
    s0 = int(round((st - FROM) * SR))
    if s0 >= N or s0 + len(x) <= 0:
        continue
    a, b = max(0, s0), min(N, s0 + len(x))
    voice[a:b] += np.stack([x[a - s0 : b - s0]] * 2, axis=1)
    sp0 = max(0, s0 - int(0.14 * SR))
    sp1 = min(N, s0 + len(x) + int(0.22 * SR))
    speak_raw[sp0:sp1] = 1.0

# Vectorized lfilter smoothing for speech envelope & punchline dips
speak_env = fast_ma(speak_raw, 0.12)

dip_raw = np.ones(N, dtype=np.float64)
for d0, d1 in PUNCHLINE_DIPS:
    i0 = max(0, int(round((d0 - FROM) * SR)))
    i1 = min(N, int(round((d1 - FROM) * SR)))
    if i1 > i0:
        dip_raw[i0:i1] = 0.125  # -18 dB punchline silence dip
dip_env = fast_ma(dip_raw, 0.06)

# Carve 300 Hz - 4 kHz BGM pocket while speaking & apply -8 dB ducking (0.398x) + -18 dB dips
mid_bgm = np.stack([bp(music[:, c], 300, 4000, 2) for c in (0, 1)], axis=1)
music_ducked = music - mid_bgm * (0.48 * speak_env)[:, None]
music_ducked *= (1.0 - 0.602 * speak_env)[:, None] * dip_env[:, None]

# Balance VO at ~+10 dB RMS above ducked BGM while speaking
rms = lambda arr, mask: float(np.sqrt(np.mean(arr[mask] ** 2) + 1e-12))
on_mask = speak_env > 0.5
v_mono = voice.mean(axis=1)
m_mono = music_ducked.mean(axis=1)
if np.any(on_mask) and np.any(v_mono != 0):
    target_ratio = 10 ** (10.0 / 20.0)
    cur_m = rms(m_mono, on_mask)
    cur_v = rms(v_mono, np.abs(v_mono) > 1e-5)
    vg = target_ratio * cur_m / max(cur_v, 1e-6)
    voice *= vg

# ---------------- 4. Phase-2 Procedural Foley (if events.json present) ----------------
fol = np.zeros((N, 2), dtype=np.float64)
ev_path = os.path.join(HERE, 'events.json')
has_events = os.path.exists(ev_path)

if has_events:
    EV = json.load(open(ev_path, encoding='utf-8')).get('ev', [])

    def activity(kinds):
        a = np.zeros(N, dtype=np.float64)
        pw = np.zeros(N, dtype=np.float64)
        for e in EV:
            if e.get('type') not in kinds:
                continue
            i0 = int(round((e['t'] - FROM) * SR))
            i1 = min(N, int(round((e['t'] - FROM + max(e.get('d', 0.04), 0.035)) * SR)))
            if i1 <= max(0, i0):
                continue
            s0 = max(0, i0)
            n = i1 - s0
            env = np.ones(n, dtype=np.float64)
            r = min(n // 3, int(0.01 * SR))
            if r > 0:
                env[:r] = np.linspace(0, 1, r)
                env[-r:] = np.linspace(1, 0, r)
            a[s0:i1] += env
            pw[s0:i1] += env * e.get('pan', 0.0)
        pan = np.where(a > 1e-6, pw / np.maximum(a, 1e-6), 0.0)
        level = 1.0 - np.exp(-a * 1.1)
        return fast_ma(level, 0.015), fast_ma(pan, 0.015)

    def tooth_noise(lo, hi, grain_hz, depth, seed):
        r = np.random.default_rng(seed)
        x = bp(r.standard_normal(N), lo, hi, 2)
        g = lp(np.abs(r.standard_normal(N)), grain_hz, 1)
        g = g / (np.percentile(g, 95) + 1e-9)
        return x * ((1.0 - depth) + depth * np.clip(g, 0.0, 1.5))

    def hand(rate, seed, sharp=1.0):
        r = np.random.default_rng(seed)
        ph = np.cumsum(rate * (1.0 + 2.5 * lp(r.standard_normal(N), 3, 1)) / SR) * 2.0 * np.pi
        return (0.5 + 0.5 * np.abs(np.sin(ph))) ** sharp

    def pan_st(x, pan):
        th = (pan + 1.0) * np.pi / 4.0
        return np.stack([x * np.cos(th), x * np.sin(th)], axis=1)

    draw_fol = np.zeros((N, 2), dtype=np.float64)
    lv, pn = activity(['pencil'])
    draw_fol += pan_st(tooth_noise(340, 1550, 190, 0.48, 11) * hand(5.2, 12) * lv, pn * 0.4) * 0.022
    lv, pn = activity(['light'])
    draw_fol += pan_st(tooth_noise(400, 1650, 210, 0.45, 13) * hand(6.5, 14) * lv, pn * 0.4) * 0.010
    lv, pn = activity(['write'])
    draw_fol += pan_st(tooth_noise(360, 1600, 200, 0.50, 15) * hand(8.5, 16, 1.3) * lv, pn * 0.4) * 0.018
    lv, pn = activity(['color'])
    draw_fol += pan_st(tooth_noise(240, 1200, 150, 0.45, 17) * hand(10.5, 18, 1.5) * lv, pn * 0.4) * 0.018

    for e in EV:
        t_ev = e['t'] - FROM
        if not (0.0 <= t_ev < DUR):
            continue
        d_ev = max(0.05, float(e.get('d', 0.15)))
        p_ev = float(e.get('pan', 0.0))
        tp_ev = e.get('type', '')
        if tp_ev == 'tap':
            add(draw_fol, lp(hp(click(pitch=0.62 + rng.random() * 0.18, v=0.7), 450), 1700) * 0.005, t_ev, 1.0, p_ev * 0.35)
        elif tp_ev in ('gesture', 'punch'):
            ns = min(N, int(d_ev * SR))
            x = lp(hp(rng.standard_normal(ns), 150), 1400, 2)
            u = np.linspace(0, 1, ns)
            env_g = np.sin(np.pi * u) ** 1.5
            g_st = np.stack([x * env_g, np.roll(x, 193) * env_g], axis=1) * (0.045 if tp_ev == 'gesture' else 0.075)
            i0 = int(t_ev * SR)
            i1 = min(N, i0 + ns)
            if i1 > i0:
                fol[i0:i1] += g_st[: i1 - i0]
        elif tp_ev == 'shatter':
            # Cracking line + scatter of small cardstock chips
            add(fol, thump(0.7, 82) * 0.14, t_ev, 1.0, p_ev)
            for k in range(18):
                tk = t_ev + 0.04 + (k / 18.0) ** 1.15 * min(1.2, d_ev)
                add(fol, hp(click(pitch=1.1 + rng.random() * 0.7, v=0.9), 1100) * 0.045, tk, 1.0, np.clip(p_ev + rng.uniform(-0.35, 0.35), -1, 1))
        elif tp_ev == 'pop':
            add(fol, pop(0.7) * 0.09, t_ev, 1.0, p_ev * 0.6)
        elif tp_ev == 'lock':
            add(fol, hp(click(pitch=1.25, v=1.0), 1400) * 0.06, t_ev, 1.0, p_ev * 0.5)
            add(fol, hp(click(pitch=1.65, v=0.8), 1800) * 0.05, t_ev + 0.07, 1.0, p_ev * 0.5)
        elif tp_ev == 'chime':
            add(fol, ding(0.55) * 0.06, t_ev, 1.0, p_ev * 0.4)
        elif tp_ev == 'cut':
            add(fol, lp(whoosh(0.20, 0.8), 3600) * 0.06, max(0.0, t_ev - 0.10), 1.0, p_ev)

    # Warm low-pass on drawing friction + -80% ducking during speech; discrete story SFX ducked -45%
    draw_fol = np.stack([lp(draw_fol[:, 0], 1700, 2), lp(draw_fol[:, 1], 1700, 2)], axis=1)
    draw_fol *= (1.0 - 0.80 * speak_env)[:, None]
    fol *= (1.0 - 0.45 * speak_env)[:, None]
    fol += draw_fol

# ---------------- 5. Mix, Mastering (-14 LUFS, <= -1.0 dBTP) ----------------
raw_mix = voice + music_ducked + (fol * 0.85 if has_events else 0.0)
raw_mix = np.stack(
    [compress(raw_mix[:, 0], thr=0.38, ratio=2.0), compress(raw_mix[:, 1], thr=0.38, ratio=2.0)],
    axis=1,
)

# Normalize toward -14.0 LUFS (ffmpeg EBU R128 calibrated) & limit sample peak to keep True Peak <= -1.0 dBTP
for _ in range(3):
    cur_lufs = measure_lufs(raw_mix)
    gain_lin = 10 ** ((-14.3 - cur_lufs) / 20.0)
    raw_mix *= gain_lin
    raw_mix = np.stack([limit(raw_mix[:, 0], ceil=0.77), limit(raw_mix[:, 1], ceil=0.77)], axis=1)

# Gentle end-tail fade
end_fade = np.clip((DUR - tt) / 0.15, 0.0, 1.0)
raw_mix *= end_fade[:, None]

os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
out_wav = os.path.join(HERE, 'out', 'mix.wav')
sf.write(out_wav, raw_mix.astype(np.float32), SR)

final_lufs = measure_lufs(raw_mix)
final_pk_db = 20.0 * np.log10(max(float(np.abs(raw_mix).max()), 1e-9))
db_rms = lambda arr, m: 20.0 * np.log10(rms(arr, m))
snr_db = db_rms(voice.mean(1), on_mask) - db_rms(music_ducked.mean(1), on_mask) if np.any(on_mask) else 0.0
mode = 'Phase-2 (VO+BGM+SFX)' if has_events else 'Phase-1 (VO+BGM)'
print(
    f'[{mode}] wrote {out_wav} | dur={DUR:.2f}s | estLUFS={final_lufs:.2f} | '
    f'peak={final_pk_db:.2f}dBFS | VO-vs-BGM={snr_db:.1f}dB'
)
