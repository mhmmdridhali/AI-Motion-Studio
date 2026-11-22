"""Sound design & mastering for Project 04 (Tablet Sketch Explainer, 9:16).

Combines expressive duet VO (Murid + Mentor) with warm acoustic score (pluck.py),
event-synced tablet pencil/stylus/paper foley (>=3 events/shot), vectorized auto-ducking
(uniform_filter1d + lfilter), 3 punchline silence dips (-18 dB), and 2-pass FFmpeg
loudnorm mastering to out/mix.wav (-14 LUFS, 48 kHz stereo, TP <= -1.0 dBFS).
"""
import json
import os
import re
import subprocess
import sys
import time
import numpy as np
import soundfile as sf
from scipy.ndimage import uniform_filter1d
from scipy.signal import butter, lfilter, resample_poly, sosfilt

HERE = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
LEMO_ROOT = os.path.join(WORKSPACE_ROOT, "lemo-opuscar")
sys.path.insert(0, LEMO_ROOT)

from core.audio import pluck as P
from core.audio.sfx import SR, add, bp, click, hp, limit, lp, pop, whoosh

rng = np.random.default_rng(202611)


def fast_compress(x: np.ndarray, thr: float = 0.20, ratio: float = 3.0, tau_ms: float = 35.0) -> np.ndarray:
    """Vectorized soft RMS/peak compressor (zero per-sample Python loops)."""
    ax = np.abs(x).astype(np.float32)
    alpha = 1.0 - float(np.exp(-1.0 / ((tau_ms * 1e-3) * SR)))
    env = np.maximum(
        lfilter([alpha], [1.0, -(1.0 - alpha)], ax),
        lfilter([alpha], [1.0, -(1.0 - alpha)], ax[::-1])[::-1] * 0.7,
    )
    over = np.maximum(env, 1e-9)
    gain = np.where(env > thr, (thr + (env - thr) / ratio) / over, 1.0)
    return (x * gain).astype(np.float32)


def pan_stereo(mono: np.ndarray, pan: float) -> np.ndarray:
    th = (np.clip(pan, -1.0, 1.0) + 1.0) * np.pi / 4.0
    return np.stack([mono * np.cos(th), mono * np.sin(th)], axis=1).astype(np.float32)


def build_activity_envelope(events: list[dict], n_samples: int) -> tuple[np.ndarray, np.ndarray]:
    act = np.zeros(n_samples, dtype=np.float32)
    pan_w = np.zeros(n_samples, dtype=np.float32)
    for ev in events:
        i0 = max(0, int(round(ev["t"] * SR)))
        i1 = min(n_samples, int(round((ev["t"] + max(ev["d"], 0.04)) * SR)))
        if i1 <= i0:
            continue
        length = i1 - i0
        env = np.ones(length, dtype=np.float32)
        ramp = min(length // 3, int(0.012 * SR))
        if ramp > 0:
            env[:ramp] = np.linspace(0.0, 1.0, ramp, dtype=np.float32)
            env[-ramp:] = np.linspace(1.0, 0.0, ramp, dtype=np.float32)
        act[i0:i1] += env * float(ev.get("w", 1.0))
        pan_w[i0:i1] += env * float(ev.get("pan", 0.0)) * float(ev.get("w", 1.0))
    pan = np.where(act > 1e-6, pan_w / np.maximum(act, 1e-6), 0.0)
    level = 1.0 - np.exp(-act * 1.15)
    k = max(1, int(0.015 * SR))
    return uniform_filter1d(level, size=k), uniform_filter1d(pan, size=k)


def tooth_texture(n_samples: int, lo: float, hi: float, grain_hz: float, depth: float, seed: int) -> np.ndarray:
    r = np.random.default_rng(seed)
    x = bp(r.standard_normal(n_samples), lo, hi, 2)
    g = lp(np.abs(r.standard_normal(n_samples)), grain_hz, 1)
    g = g / (np.percentile(g, 95) + 1e-9)
    return (x * ((1.0 - depth) + depth * np.clip(g, 0.0, 2.4))).astype(np.float32)


def hand_stroke_mod(n_samples: int, rate_hz: float, seed: int, sharp: float = 1.0) -> np.ndarray:
    r = np.random.default_rng(seed)
    phase = np.cumsum(rate_hz * (1.0 + 2.2 * lp(r.standard_normal(n_samples), 3.0, 1)) / SR) * 2.0 * np.pi
    return ((0.5 + 0.5 * np.abs(np.sin(phase))) ** sharp).astype(np.float32)


def find_word_window(words_data: list[dict], line_id: str, needle: str) -> tuple[float, float] | None:
    clean_needle = re.sub(r"[^\w]", "", needle.lower())
    for entry in words_data:
        if entry.get("id") != line_id:
            continue
        for w in entry.get("words", []):
            if re.sub(r"[^\w]", "", w["w"].lower()) == clean_needle:
                return float(w["t0"]), float(w["t1"])
    return None


def main() -> None:
    t_wall0 = time.perf_counter()
    sched = json.load(open(os.path.join(HERE, "voice", "schedule.json"), encoding="utf-8"))
    words_data = json.load(open(os.path.join(HERE, "voice", "words.json"), encoding="utf-8"))

    dur = float(sched["total"])
    n_samples = int(round(dur * SR))
    shots = sched["shots"]
    placements = sched["voice"]

    # ---------------- 1. Duet Voice-Over Track ----------------
    voice_mono = np.zeros(n_samples, dtype=np.float32)
    for p in placements:
        wav_path = os.path.join(HERE, "voice", "wav", f"{p['id']}.wav")
        x, sr_in = sf.read(wav_path, dtype="float32")
        if x.ndim > 1:
            x = x.mean(axis=1)
        if sr_in != SR:
            x = resample_poly(x, SR, sr_in).astype(np.float32)
        x = hp(x, 80).astype(np.float32)
        pk = float(np.abs(x).max())
        if pk > 1e-6:
            x = x * (0.65 / pk)
        x = fast_compress(x, thr=0.18, ratio=2.8)
        s0 = int(round(float(p["start"]) * SR))
        s1 = min(n_samples, s0 + len(x))
        if s1 > s0:
            voice_mono[s0:s1] += x[: s1 - s0]

    voice_st = np.stack([voice_mono, voice_mono], axis=1)

    # ---------------- 2. Warm Acoustic Score (pluck.py + soft shaker) ----------------
    music = np.zeros((n_samples, 2), dtype=np.float32)
    beat = 60.0 / 94.0
    bar = 4.0 * beat

    # Gentle warm progression in G major: Gmaj7 -> Em7 -> Cmaj7 -> D7sus
    chords = {
        "Gmaj7": (["G3", "B3", "D4", "F#4"], "G2", "D3"),
        "Em7": (["E3", "B3", "D4", "G4"], "E2", "B2"),
        "Cmaj7": (["C3", "G3", "B3", "E4"], "C2", "G2"),
        "D7sus": (["D3", "G3", "C4", "A4"], "D2", "A2"),
        "Bm7": (["B2", "F#3", "A3", "D4"], "B1", "F#2"),
        "Am7": (["A2", "E3", "G3", "C4"], "A1", "E2"),
        "Gmaj9": (["G3", "B3", "D4", "A4"], "G2", "D3"),
    }
    chart = [
        "Gmaj7", "Em7", "Cmaj7", "D7sus",
        "Gmaj7", "Bm7", "Am7", "D7sus",
        "Cmaj7", "D7sus", "Bm7", "Em7",
        "Am7", "D7sus", "Gmaj7", "Em7",
        "Cmaj7", "D7sus", "Gmaj7", "Bm7",
        "Am7", "D7sus", "Cmaj7", "D7sus",
        "Gmaj7", "Em7", "Cmaj7", "D7sus",
        "Gmaj9", "Gmaj9", "Gmaj9",
    ]

    landing_t = float(shots[-1]["start"]) + 1.15
    shaker_sos = butter(2, [3400, 8800], "band", fs=SR, output="sos")

    for b_idx, cname in enumerate(chart):
        t_bar = b_idx * bar
        if t_bar >= landing_t - 0.1:
            break
        vo, bass1, bass2 = chords[cname]
        sparse = b_idx < 2  # intimate intro on first 2 bars

        # Upright bass pizz on beats 1 and 3
        if not sparse:
            for b_off, pitch, vel in ((0.0, bass1, 0.56), (2.0, bass2, 0.46)):
                tb = t_bar + b_off * beat
                if tb >= landing_t - 0.15:
                    continue
                yb = P.pluck("upright_bass_pizz", pitch, dur=beat * 1.4, vel=vel)
                add(music, yb * 0.65, tb, 1.0, -0.05)

        # Warm nylon guitar fingerpicked arpeggios + light comping
        steps = [0.0, 1.5, 2.5, 3.5] if (b_idx % 2 == 0) else [0.0, 1.0, 2.5, 3.0]
        for s_idx, b_off in enumerate(steps):
            tg = t_bar + b_off * beat
            if tg < 0.25 or tg >= landing_t - 0.15:
                continue
            if sparse and s_idx in (1, 3):
                continue
            if s_idx == 0:
                yg = P.strum("nylon_guitar", vo[:3], dur=beat * 1.2, vel=0.34, spread=0.022)
                add(music, yg * 0.48, tg, 1.0, -0.18)
            else:
                note = vo[(s_idx + b_idx) % len(vo)]
                yg = P.pluck("nylon_guitar", note, dur=beat * 0.85, vel=0.30)
                add(music, yg * 0.42, tg, 1.0, 0.15 if s_idx % 2 else -0.12)

        # Soft eighth-note egg shaker after intro
        if not sparse:
            for k in range(8):
                ts = t_bar + k * (beat * 0.5)
                if ts >= landing_t - 0.2:
                    break
                sn = int(0.055 * SR)
                sh = sosfilt(shaker_sos, rng.standard_normal(sn)) * np.exp(-np.arange(sn) / (0.011 * SR))
                sh_gain = 0.018 if (k % 2 == 0) else 0.011
                add(music, sh.astype(np.float32) * sh_gain, ts, 1.0, 0.26)

    # Warm final landing chord (Gmaj9) on Shot 10 resolution
    y_fin_g = P.strum("nylon_guitar", ["G3", "B3", "D4", "F#4", "A4"], dur=3.2, vel=0.44, spread=0.035)
    y_fin_b = P.pluck("upright_bass_pizz", "G2", dur=2.6, vel=0.62)
    add(music, y_fin_g * 0.62, landing_t, 1.0, -0.10)
    add(music, y_fin_b * 0.72, landing_t, 1.0, 0.0)

    # Gentle kalimba accent at each new shot idea + sparkle after "Lima!"
    kalimba_notes = ["D5", "E5", "G5", "F#5", "A5", "D5", "B5", "G5", "A5", "D6"]
    for idx, sh in enumerate(shots):
        tk = float(sh["start"]) + (0.35 if idx == 0 else 0.18)
        yk = P.pluck("kalimba", kalimba_notes[idx % len(kalimba_notes)], dur=0.9, vel=0.45)
        add(music, yk * 0.36, tk, 1.0, 0.22 if idx % 2 == 0 else -0.22)

    lima_win = find_word_window(words_data, "s03_murid2", "Lima")
    if lima_win:
        yk_lima = P.pluck("kalimba", "B5", dur=1.0, vel=0.55)
        add(music, yk_lima * 0.48, lima_win[1] + 0.03, 1.0, 0.25)

    # Gentle fade-out on final 1.4s
    fade_n = int(1.4 * SR)
    if fade_n < n_samples:
        music[-fade_n:] *= np.linspace(1.0, 0.0, fade_n, dtype=np.float32)[:, None] ** 1.4

    # ---------------- 3. Real-Motion Synced Tablet Foley from events.json ----------------
    events_path = os.path.join(HERE, "events.json")
    raw_events = json.load(open(events_path, encoding="utf-8"))

    foley = np.zeros((n_samples, 2), dtype=np.float32)
    pencil_evs = []
    write_evs = []
    color_evs = []
    counts = {"pencil": 0, "write": 0, "color": 0, "tap": 0, "gesture": 0, "pop": 0, "shatter": 0}
    last_tap_t = -10.0

    for ev in raw_events:
        etype = ev.get("type")
        et = float(ev.get("t", 0.0))
        ed = float(ev.get("d", 0.0))
        epan = float(ev.get("pan", 0.0))
        if et < 0.0 or et >= dur:
            continue

        if etype in ("pencil", "light"):
            if ed >= 0.04:
                w = 0.55 if etype == "light" else 1.0
                pencil_evs.append({"t": et, "d": ed, "pan": epan, "w": w})
                counts["pencil"] += 1
        elif etype == "write":
            if ed >= 0.04:
                write_evs.append({"t": et, "d": ed, "pan": epan, "w": 1.0})
                counts["write"] += 1
        elif etype == "color":
            if ed >= 0.04:
                color_evs.append({"t": et, "d": ed, "pan": epan, "w": 1.0})
                counts["color"] += 1
        elif etype == "tap":
            if et - last_tap_t >= 0.28:
                pitch = 0.80 + 0.06 * (counts["tap"] % 5)
                add(foley, hp(click(pitch=pitch, v=1.0), 1900) * 0.020, et, 1.0, epan * 0.6)
                last_tap_t = et
                counts["tap"] += 1
        elif etype in ("gesture", "punch"):
            gd = float(np.clip(ed, 0.20, 0.75))
            gn = int(gd * SR)
            u = np.linspace(0.0, 1.0, gn, dtype=np.float32)
            slide = lp(hp(rng.standard_normal(gn), 180), 1250, 2) * (np.maximum(0.0, np.sin(np.pi * u)) ** 1.7)
            g_gain = 0.038 if etype == "gesture" else 0.030
            add(foley, slide.astype(np.float32) * g_gain, et, 1.0, epan * 0.55)
            counts["gesture"] += 1
        elif etype == "pop":
            p_pitch = 0.68 + 0.08 * (counts["pop"] % 3)
            add(foley, lp(pop(p_pitch), 2400) * 0.048, et, 1.0, epan * 0.6)
            counts["pop"] += 1
        elif etype == "shatter":
            for k in range(7):
                add(
                    foley,
                    hp(click(pitch=1.1 + 0.1 * (k % 3), v=1.0), 1500) * (0.040 * (0.85 ** k)),
                    et + k * 0.065,
                    1.0,
                    float(np.clip(epan - 0.30 + k * 0.12, -0.7, 0.7)),
                )
            counts["shatter"] += 1

    lv_pen, pn_pen = build_activity_envelope(pencil_evs, n_samples)
    lv_wr, pn_wr = build_activity_envelope(write_evs, n_samples)
    lv_col, pn_col = build_activity_envelope(color_evs, n_samples)

    foley += pan_stereo(tooth_texture(n_samples, 600, 3000, 340, 0.85, 11) * hand_stroke_mod(n_samples, 5.2, 12) * lv_pen, pn_pen * 0.55) * 0.13
    foley += pan_stereo(tooth_texture(n_samples, 900, 3400, 420, 0.88, 15) * hand_stroke_mod(n_samples, 8.5, 16) * lv_wr, pn_wr * 0.55) * 0.095
    foley += pan_stereo(tooth_texture(n_samples, 280, 2100, 200, 0.72, 13) * hand_stroke_mod(n_samples, 11.5, 14, 1.7) * lv_col, pn_col * 0.55) * 0.11

    room_bed = lp(rng.standard_normal(n_samples), 380, 2) * 0.0018
    foley += np.stack([room_bed, np.roll(room_bed, 997)], axis=1).astype(np.float32)
    print(f"[foley] synced from events.json: {counts}")

    # ---------------- 4. Vectorized Auto-Ducking (< 2s) + 3 Punchline Dips ----------------
    rms_vo = uniform_filter1d(np.abs(voice_mono).astype(np.float32), size=int(0.03 * SR))
    active = (rms_vo > 0.012).astype(np.float32)
    alpha = 1.0 - float(np.exp(-1.0 / (0.14 * SR)))
    env = np.maximum(
        lfilter([alpha], [1.0, -(1.0 - alpha)], active),
        lfilter([alpha], [1.0, -(1.0 - alpha)], active[::-1])[::-1] * 0.75,
    ).clip(0.0, 1.0)

    # -8 dB overall ducking + 300-4000 Hz vocal pocket carve on music
    gain_curve = (1.0 - env * (1.0 - 0.398)).astype(np.float32)
    music_mid = np.stack([bp(music[:, c], 300, 4000, 2) for c in (0, 1)], axis=1)
    music = music - music_mid * (0.42 * env)[:, None]
    music *= gain_curve[:, None]

    # 3 Punchline Silence Dips (-18 dB for ~0.45s) anchored to words.json
    dip_targets = [
        ("s01_mentor", "kulitnya"),
        ("s03_murid2", "Lima"),
        ("s08_murid", "halu"),
    ]
    dip_curve = np.ones(n_samples, dtype=np.float32)
    dip_hits = []
    for lid, word_q in dip_targets:
        win = find_word_window(words_data, lid, word_q)
        if not win:
            continue
        t_center = 0.5 * (win[0] + win[1])
        half_w = 0.225  # total ~0.45s dip
        i0 = max(0, int((t_center - half_w) * SR))
        i1 = min(n_samples, int((t_center + half_w) * SR))
        if i1 > i0 + 8:
            u = np.linspace(-1.0, 1.0, i1 - i0, dtype=np.float32)
            # Smooth raised-cosine dip down to 0.125 (-18 dB)
            notch = 1.0 - 0.875 * (0.5 * (1.0 + np.cos(np.pi * u)))
            dip_curve[i0:i1] = np.minimum(dip_curve[i0:i1], notch)
            dip_hits.append(f"{lid}:{word_q}@{t_center:.2f}s")

    music *= dip_curve[:, None]
    foley_duck = (1.0 - 0.30 * env)[:, None].astype(np.float32)

    # Set balanced pre-master mix
    premix = voice_st * 1.05 + music * 0.72 + foley * foley_duck * 0.85
    if np.isnan(premix).any():
        raise RuntimeError("NaN detected in premix buffer")
    premix = np.stack([limit(premix[:, 0], ceil=0.92), limit(premix[:, 1], ceil=0.92)], axis=1)

    out_dir = os.path.join(HERE, "out")
    os.makedirs(out_dir, exist_ok=True)
    tmp_wav = os.path.join(out_dir, "_premix.wav")
    final_wav = os.path.join(out_dir, "mix.wav")
    sf.write(tmp_wav, premix.astype(np.float32), SR, subtype="PCM_16")

    # ---------------- 5. Two-Pass FFmpeg EBU R128 Mastering (-14 LUFS) ----------------
    p1 = subprocess.run(
        [
            "ffmpeg", "-y", "-hide_banner", "-i", tmp_wav,
            "-af", "loudnorm=I=-14:TP=-1.2:LRA=9:print_format=json",
            "-f", "null", "-",
        ],
        capture_output=True, text=True, check=True,
    )
    m = re.search(r"\{[\s\S]*?\}", p1.stderr)
    if not m:
        raise RuntimeError(f"loudnorm pass 1 missing JSON stats:\n{p1.stderr}")
    stats = json.loads(m.group(0))

    flt2 = (
        f"loudnorm=I=-14:TP=-1.2:LRA=9:linear=true:"
        f"measured_I={stats['input_i']}:measured_TP={stats['input_tp']}:"
        f"measured_LRA={stats['input_lra']}:measured_thresh={stats['input_thresh']}:"
        f"offset={stats['target_offset']}:print_format=json"
    )
    p2 = subprocess.run(
        [
            "ffmpeg", "-y", "-hide_banner", "-i", tmp_wav,
            "-af", flt2, "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s16le", final_wav,
        ],
        capture_output=True, text=True, check=True,
    )
    os.remove(tmp_wav)

    m2 = re.search(r"\{[\s\S]*?\}", p2.stderr)
    out_stats = json.loads(m2.group(0)) if m2 else {}
    elapsed = time.perf_counter() - t_wall0
    print(f"mix.py done in {elapsed:.2f}s | dur={dur:.2f}s | sr={SR}Hz stereo | dips={dip_hits}")
    if out_stats:
        print(f"Loudness: out_I={out_stats.get('output_i')} LUFS | out_TP={out_stats.get('output_tp')} dBTP | LRA={out_stats.get('output_lra')}")


if __name__ == "__main__":
    main()
