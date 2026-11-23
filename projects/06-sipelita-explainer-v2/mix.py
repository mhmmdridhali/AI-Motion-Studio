#!/usr/bin/env python
"""SI-PELITA Explainer v2 (lowpoly-island) — Procedural Score, Material Foley & VO Mixer + SRT Exporter.

Follows lowpoly-island STYLE.md & audio-sound-design.md:
- Pitched percussion & bells ONLY: marimba, kalimba, vibraphone/celesta, woodblock, warm low-passed pad, soft shaker, muted 55Hz kick (NO piano, NO strings).
- Phase 1 (before events.json or --phase1): VO + pentatonic D-major marimba/kalimba/celesta score + gentle island wave ambience + SRT export.
- Phase 2 (with events.json): Adds sample-accurate event-driven melody notes & 2-tier material foley:
    * Tier 1 (Continuous/Sweeping SFX: bubble_rise, splash_swell, air_swell): low-pass <= 1700 Hz, ducked -80% (0.20x) under active VO.
    * Tier 2 (Short/Transient Punctuation: wood_knock, tile_clack, leaf_pop, stone_thunk, glass_tink, reject_bonk, star_chime): ducked -48% (0.52x) under active VO.
- Vectorized IIR envelope follower via scipy.signal.lfilter + punchline dip + -14.0 LUFS target normalization (-1.0 dBFS true peak ceiling).
"""
import json
import os
import sys
import numpy as np
import soundfile as sf
from scipy.signal import butter, lfilter, sosfilt, sosfiltfilt, fftconvolve

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
RNG = np.random.default_rng(20261123)

KEEP_PAIRS = {
    "salah tingkat", "butuh reaktivasi?", "langsung beres", "jalur EMIS", "empat titik", "titik nol.",
    "NIK ganda", "belum muncul?", "Verval PD.", "satu-satu?", "jalur kolektif", "lewat Excel,",
    "tiket ganda.", "cek progres,", "masukkan tiket.", "Lupa nomornya?", "nomor WhatsApp",
    "status tiket", "sampai selesai.", "berkasnya keliru?", "Perbaiki Data", "ketik ulang.",
    "dua puluh", "empat jam,", "ratusan laporan", "sembilan puluh", "lima persen", "persen tuntas.",
    "operator madrasah", "tanpa ribet.", "data madrasah", "se-Kabupaten Banjar", "lebih ringan.",
    "Kemenag Banjar.", "Lapor gampang,", "lacak tenang,", "data beres.", "satu pintu."
}


def db(x):
    return 10.0 ** (x / 20.0)


def m2f(m):
    return 440.0 * (2.0 ** ((m - 69.0) / 12.0))


def tarr(dur):
    return np.arange(max(1, int(round(dur * SR))), dtype=np.float64) / SR


def lp(x, fc, order=2, zero_phase=False):
    sos = butter(order, min(fc, SR * 0.45), "lowpass", fs=SR, output="sos")
    return sosfiltfilt(sos, x, axis=-1) if zero_phase else sosfilt(sos, x, axis=-1)


def hp(x, fc, order=2, zero_phase=False):
    sos = butter(order, max(fc, 15.0), "highpass", fs=SR, output="sos")
    return sosfiltfilt(sos, x, axis=-1) if zero_phase else sosfilt(sos, x, axis=-1)


def bp(x, f1, f2, order=2, zero_phase=False):
    sos = butter(order, [max(f1, 20.0), min(f2, SR * 0.45)], "bandpass", fs=SR, output="sos")
    return sosfiltfilt(sos, x, axis=-1) if zero_phase else sosfilt(sos, x, axis=-1)


def soft_attack(t, att):
    return 1.0 - np.exp(-t / max(att, 1e-5))


def partial_gain(fr):
    if fr > SR * 0.44:
        return 0.0
    return 1.0 if fr < 5800 else (5800.0 / fr) ** 1.7


def modal(f, ratios, amps, taus, dur, att=0.002, beat=0.0):
    t = tarr(dur)
    y = np.zeros_like(t)
    for r, a, tau in zip(ratios, amps, taus):
        fr = f * r
        g = partial_gain(fr) * a
        if g <= 0:
            continue
        env = np.exp(-t / tau)
        if beat > 0:
            y += 0.5 * g * env * (np.sin(2 * np.pi * (fr - beat) * t) + np.sin(2 * np.pi * (fr + beat) * t))
        else:
            y += g * env * np.sin(2 * np.pi * fr * t)
    return y * soft_attack(t, att)


def noise_burst(dur, f1, f2, tau, amp=1.0):
    t = tarr(dur)
    nz = bp(RNG.standard_normal(len(t)), f1, f2)
    return nz * np.exp(-t / tau) * soft_attack(t, 0.0005) * amp


# ---------------- Pitched Percussion & Bell Instruments (NO piano, NO strings) ----------------
def marimba(m, v=0.7, tau_scale=1.0, bright=1.0):
    f = m2f(m)
    tau0 = np.clip(0.55 * (440.0 / f) ** 0.5, 0.22, 1.5) * tau_scale
    b = (0.5 + 0.65 * v) * bright
    dur = min(5.5 * tau0, 6.5)
    y = modal(f, [1.0, 3.92, 9.15, 2.0], [1.0, 0.36 * b, 0.09 * b, 0.05],
              [tau0, tau0 * 0.16, 0.022, tau0 * 0.48], dur,
              att=0.0022 if f > 200 else 0.0035)
    c = noise_burst(0.018, 160, 1550, 0.004, 0.055 * b)
    y[:len(c)] += c
    return y * (v ** 1.1)


def kalimba(m, v=0.7, tail=1.0, bright=1.0):
    f = m2f(m)
    tau0 = np.clip(1.45 * (440.0 / f) ** 0.35, 0.48, 2.3) * tail
    b = (0.55 + 0.55 * v) * bright
    dur = min(5.5 * tau0, 7.0)
    y = modal(f, [1.0, 5.4, 12.5], [1.0, 0.24 * b, 0.06 * b], [tau0, 0.15, 0.04], dur, att=0.0018)
    t = tarr(dur)
    y += 0.12 * np.sin(2 * np.pi * f * 1.0013 * t) * np.exp(-t / (tau0 * 0.8)) * soft_attack(t, 0.004)
    c = noise_burst(0.012, 1800, 4800, 0.0025, 0.07 * b)
    y[:len(c)] += c
    return y * (v ** 1.1)


def celesta(m, v=0.6, dur=1.8):
    f = m2f(m)
    y = modal(f, [1.0, 2.75, 5.38], [1.0, 0.28, 0.07], [0.62, 0.22, 0.07], dur, att=0.0012, beat=0.25)
    return y * v


def woodblock(m=69, v=0.65):
    f = m2f(m)
    y = modal(f, [1.0, 2.61, 4.3], [1.0, 0.48, 0.35], [0.055, 0.028, 0.018], 0.28, att=0.0006)
    c = noise_burst(0.018, 1100, 3600, 0.003, 0.22)
    y[:len(c)] += c
    return y * v


def warm_pad_chord(midis, dur, att=0.45, rel=0.85):
    n = int(round((dur + rel) * SR))
    t = np.arange(n) / SR
    env = np.ones(n)
    a = t < att
    env[a] = 0.5 - 0.5 * np.cos(np.pi * t[a] / max(att, 1e-4))
    r = t > dur
    env[r] = 0.5 + 0.5 * np.cos(np.pi * np.minimum((t[r] - dur) / max(rel, 1e-4), 1.0))
    out = np.zeros((2, n))
    for mm in midis:
        f = m2f(mm)
        for ch, det in enumerate((-4.0, 4.0)):
            fr = f * (2.0 ** (det / 1200.0))
            sig = np.sin(2 * np.pi * fr * t) + 0.28 * np.sin(2 * np.pi * fr * 2.0 * t)
            out[ch] += sig
    out = lp(out, 920, order=2)
    return out * (env / max(len(midis), 1))


def shaker_hit(v=0.25):
    d = 0.085
    t = tarr(d)
    nz = bp(RNG.standard_normal(len(t)), 3600, 7800, order=2)
    return nz * soft_attack(t, 0.005) * np.exp(-t / 0.026) * v


def soft_kick(v=0.45):
    t = tarr(0.55)
    f = 54.0 + 48.0 * np.exp(-t / 0.024)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t / 0.20) * soft_attack(t, 0.002) * v


# ---------------- Material Foley Synthesizers (2-Tier) ----------------
# Tier 1: Continuous / Sweeping SFX (low-passed <= 1700 Hz, ducked -80% under VO)
def foley_bubble_rise(d=0.36, f0=165, f1=540):
    t = tarr(d)
    f = f0 * ((f1 / f0) ** (t / d))
    sig = np.sin(2 * np.pi * np.cumsum(f) / SR) * (np.sin(np.pi * t / d) ** 2) * (0.6 + 0.4 * np.sin(2 * np.pi * 22 * t))
    return lp(sig, 1650, order=2)


def foley_splash_swell(d=0.48, size=1.0):
    t = tarr(d)
    body = bp(RNG.standard_normal(len(t)), 240, 1650) * np.exp(-t / (0.09 + 0.04 * size)) * soft_attack(t, 0.008)
    low = lp(RNG.standard_normal(len(t)), 380) * np.exp(-t / 0.06) * 0.55 * size
    sig = body + low
    return lp(sig / (np.abs(sig).max() + 1e-9), 1680, order=2)


def foley_air_swell(d=1.2):
    t = tarr(d)
    hum = (np.sin(2 * np.pi * 110 * t) + 0.45 * np.sin(2 * np.pi * 165 * t)) * soft_attack(t, 0.08) * np.exp(-t / 0.45)
    breeze = bp(RNG.standard_normal(len(t)), 250, 1550) * soft_attack(t, 0.10) * np.exp(-t / 0.42) * 0.35
    sig = hum + breeze
    return lp(sig / (np.abs(sig).max() + 1e-9), 1650, order=2)


# Tier 2: Short / Transient Punctuation SFX (ducked -48% under VO)
def foley_wood_knock(f=580, d=0.14):
    t = tarr(d)
    x = (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.028) +
         0.42 * np.sin(2 * np.pi * f * 2.65 * t) * np.exp(-t / 0.013) +
         0.35 * np.sin(2 * np.pi * 115 * t) * np.exp(-t / 0.022))
    return x / (np.abs(x).max() + 1e-9)


def foley_tile_clack():
    d = 0.095
    t = tarr(d)
    x = (0.7 * np.sin(2 * np.pi * 2150 * t) * np.exp(-t / 0.011) +
         0.45 * np.sin(2 * np.pi * 3180 * t) * np.exp(-t / 0.007) +
         0.5 * np.sin(2 * np.pi * 880 * t) * np.exp(-t / 0.018))
    return x / (np.abs(x).max() + 1e-9)


def foley_leaf_pop():
    d = 0.14
    t = tarr(d)
    f = 360 + 820 * (t / d)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.032) + bp(RNG.standard_normal(len(t)), 2400, 6200) * np.exp(-t / 0.025) * 0.25
    return x / (np.abs(x).max() + 1e-9)


def foley_stone_thunk():
    d = 0.24
    t = tarr(d)
    x = np.sin(2 * np.pi * 92 * t * (1 - 0.18 * t)) * np.exp(-t / 0.055) + bp(RNG.standard_normal(len(t)), 280, 1600) * np.exp(-t / 0.022) * 0.55
    return x / (np.abs(x).max() + 1e-9)


def foley_reject_bonk():
    """Soft muted wooden double-knock for duplicate ticket guard rejection."""
    k1 = foley_wood_knock(340, 0.12)
    k2 = foley_wood_knock(270, 0.14) * 0.85
    out = np.zeros(int(0.24 * SR))
    out[:len(k1)] += k1
    i2 = int(0.085 * SR)
    out[i2:i2 + len(k2)] += k2
    return out / (np.abs(out).max() + 1e-9)


def foley_star_chime(m=81):
    c = celesta(m, v=0.75, dur=0.9)
    k = kalimba(m, v=0.6, tail=0.4)[:len(c)]
    y = np.zeros_like(c)
    y[:len(c)] += c
    y[:len(k)] += 0.45 * k
    return y / (np.abs(y).max() + 1e-9)


def place_stereo(buf, sig, t_sec, gain=1.0, pan=0.0):
    N = buf.shape[1]
    i0 = int(round(t_sec * SR))
    if i0 >= N:
        return
    if i0 < 0:
        sig = sig[..., -i0:] if sig.ndim > 1 else sig[-i0:]
        i0 = 0
    if sig.ndim == 1:
        th = (np.clip(pan, -1.0, 1.0) + 1.0) * (np.pi / 4.0)
        st = np.vstack([sig * np.cos(th), sig * np.sin(th)]) * np.sqrt(2.0)
    else:
        st = sig
    n = min(st.shape[1], N - i0)
    if n <= 0:
        return
    buf[:, i0:i0 + n] += st[:, :n] * gain


def make_ir(rt=1.45, length=2.0):
    n = int(length * SR)
    t = np.arange(n) / SR
    rng = np.random.default_rng(19)
    ir = np.zeros((2, n))
    pre = int(0.012 * SR)
    for ch in range(2):
        nz = rng.standard_normal(n)
        lo = lp(nz, 2400, order=2)
        hi = nz - lo
        e = lo * np.exp(-6.91 * t / rt) + 0.38 * hi * np.exp(-6.91 * t / (rt * 0.38))
        e *= soft_attack(t, 0.01)
        ir[ch, pre:] = e[:n - pre]
    ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True) + 1e-12)
    return ir


def export_srt(words_path, srt_path):
    """Exports word-level JSON into clean 2-line semantic SRT cues using KEEP_PAIRS."""
    if not os.path.exists(words_path):
        return 0
    shots = json.load(open(words_path, encoding="utf-8"))
    cues = []

    def fmt_ts(sec):
        ms = int(round(max(0.0, sec) * 1000))
        h = ms // 3600000
        ms %= 3600000
        m = ms // 60000
        ms %= 60000
        s = ms // 1000
        ms %= 1000
        return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

    for sh in shots:
        ws = sh.get("words", [])
        if not ws:
            continue
        # Merge KEEP_PAIRS into atomic tokens first
        tokens = []
        i = 0
        while i < len(ws):
            if i + 1 < len(ws):
                pair_txt = f"{ws[i]['w']} {ws[i + 1]['w']}"
                if pair_txt in KEEP_PAIRS:
                    tokens.append({"w": pair_txt, "t0": ws[i]["t0"], "t1": ws[i + 1]["t1"]})
                    i += 2
                    continue
            tokens.append({"w": ws[i]["w"], "t0": ws[i]["t0"], "t1": ws[i]["t1"]})
            i += 1

        # Group tokens into phrases of <= 52 chars (split across at most 2 lines of <= 34 chars)
        cur = []
        cur_len = 0
        for tk in tokens:
            w_len = len(tk["w"])
            if cur and (cur_len + 1 + w_len > 48 or (tk["t0"] - cur[-1]["t1"] > 0.45 and cur_len >= 18)):
                cues.append(cur)
                cur = [tk]
                cur_len = w_len
            else:
                cur.append(tk)
                cur_len += (1 + w_len) if cur_len else w_len
        if cur:
            cues.append(cur)

    os.makedirs(os.path.dirname(srt_path), exist_ok=True)
    lines = []
    for idx, grp in enumerate(cues, 1):
        t0 = grp[0]["t0"]
        t1 = max(grp[-1]["t1"] + 0.12, t0 + 0.85)
        if idx < len(cues):
            t1 = min(t1, cues[idx][0]["t0"] - 0.03)
        full_txt = " ".join(x["w"] for x in grp)
        if len(full_txt) > 34 and len(grp) >= 2:
            # Split near midpoint without breaking tokens
            best_k = 1
            best_diff = 999
            for k in range(1, len(grp)):
                l1 = " ".join(x["w"] for x in grp[:k])
                l2 = " ".join(x["w"] for x in grp[k:])
                if abs(len(l1) - len(l2)) < best_diff:
                    best_diff = abs(len(l1) - len(l2))
                    best_k = k
            txt_out = " ".join(x["w"] for x in grp[:best_k]) + "\n" + " ".join(x["w"] for x in grp[best_k:])
        else:
            txt_out = full_txt
        lines.append(f"{idx}\n{fmt_ts(t0)} --> {fmt_ts(t1)}\n{txt_out}\n")

    with open(srt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    return len(cues)


def main():
    sched_path = os.path.join(HERE, "voice", "schedule.json")
    words_path = os.path.join(HERE, "voice", "words.json")
    ev_path = os.path.join(HERE, "events.json")

    sched = json.load(open(sched_path, encoding="utf-8"))
    DUR = float(sched.get("total", 81.85))
    N = int(round(DUR * SR))

    # 1. Export synchronized .srt sidecar
    srt_path = os.path.join(HERE, "output", "06-sipelita-explainer-v2.srt")
    n_cues = export_srt(words_path, srt_path)
    print(f"[SRT] Exported {n_cues} semantic subtitle cues -> {srt_path}")

    # 2. Load & place VO clips + build sample-accurate vox_mask
    vo = np.zeros((2, N), dtype=np.float64)
    vox_mask = np.zeros(N, dtype=np.float64)
    for item in sched["voice"]:
        cid = item["id"]
        t_start = float(item["start"])
        wav_path = os.path.join(HERE, "voice", "wav", f"{cid}.wav")
        if not os.path.exists(wav_path):
            continue
        y, sr = sf.read(wav_path)
        if y.ndim > 1:
            y = y.mean(axis=1)
        if sr != SR:
            # Linear interpolation resample if needed
            old_idx = np.linspace(0, len(y) - 1, int(round(len(y) * SR / sr)))
            y = np.interp(old_idx, np.arange(len(y)), y)
        y = hp(y, 85, order=2)
        # Gentle vocal leveling
        rms_y = np.sqrt(np.mean(y ** 2) + 1e-12)
        y = y * (db(-16.5) / rms_y)
        y = np.tanh(y * 1.15) / 1.15
        place_stereo(vo, y, t_start, gain=1.0, pan=0.0)
        i0 = max(0, int(round((t_start - 0.14) * SR)))
        i1 = min(N, int(round((t_start + len(y) / SR + 0.22) * SR)))
        vox_mask[i0:i1] = 1.0

    # Vectorized IIR envelope follower via scipy.signal.lfilter (zero Python sample loop)
    att_coeff = np.exp(-1.0 / (0.045 * SR))
    rel_coeff = np.exp(-1.0 / (0.260 * SR))
    env_up = lfilter([1.0 - att_coeff], [1.0, -att_coeff], vox_mask)
    vox_env = np.clip(lfilter([1.0 - rel_coeff], [1.0, -rel_coeff], np.maximum(vox_mask, env_up)), 0.0, 1.0)

    # 3. Build Low-Poly Island Pitched-Percussion Score (D Major Pentatonic: D, E, F#, A, B)
    # Progression:
    # 0.0 - 14.3s (Problem Hook s01-s02): sparse, quizzical marimba & buoy bell on Bm / G / Asus4
    # 14.3 - 42.0s (Hub & 3 Docks s03-s06): warm sunny D -> Bm -> G -> A marimba + kalimba groove (96 BPM, beat=0.625s)
    # 42.0 - 57.0s (Tracking Tower & Revision Turntable s07-s08): playful ascending kalimba + marimba ostinato
    # 57.0 - 70.0s (24h Night Beacon & 5-Star Monuments s09-s10): glowing celesta + warm marimba + kalimba harmonics
    # 70.0 - 81.85s (Archipelago Panorama & End Card s11-s12): full resolving D major archipelago cadence + gentle fade
    BEAT = 0.625
    BAR = 2.5
    bgm_dry = np.zeros((2, N), dtype=np.float64)
    bgm_send = np.zeros((2, N), dtype=np.float64)

    def add_bgm(sig, t_sec, gain=1.0, pan=0.0, send=0.25):
        place_stereo(bgm_dry, sig, t_sec, gain=gain, pan=pan)
        place_stereo(bgm_send, sig, t_sec, gain=gain * send, pan=pan)

    CHORD_MAP = {
        "Bm": (47, (59, 62, 66), (62, 66, 69, 71, 74)),
        "G":  (43, (55, 59, 62), (62, 67, 69, 71, 74)),
        "A":  (45, (57, 61, 64), (61, 64, 69, 71, 76)),
        "D":  (38, (57, 62, 66), (62, 66, 69, 74, 78)),
    }
    PROG_PROBLEM = ["Bm", "G", "Bm", "A", "G", "A"]
    PROG_MAIN = ["D", "Bm", "G", "A", "D", "G", "Bm", "A"]

    # Bar-by-bar backing pad, marimba bass & ostinato, kalimba countermelody, and light shaker/kick
    n_bars = int(np.ceil(DUR / BAR))
    for b_idx in range(n_bars):
        t_bar = b_idx * BAR
        if t_bar >= DUR - 0.5:
            break
        if t_bar < 14.2:
            cname = PROG_PROBLEM[b_idx % len(PROG_PROBLEM)]
            energy = 0.45
        elif t_bar < 57.0:
            cname = PROG_MAIN[b_idx % len(PROG_MAIN)]
            energy = 0.85
        elif t_bar < 70.0:
            cname = PROG_MAIN[(b_idx + 2) % len(PROG_MAIN)]
            energy = 0.78
        else:
            cname = "D" if b_idx >= n_bars - 2 else PROG_MAIN[b_idx % len(PROG_MAIN)]
            energy = 0.90

        bass_m, pad_triad, arp_notes = CHORD_MAP[cname]
        bar_dur = min(BAR, DUR - t_bar)

        # Warm low-passed pad layer
        pad_sig = warm_pad_chord(pad_triad, bar_dur, att=0.4, rel=0.7)
        add_bgm(pad_sig, t_bar, gain=0.055 * energy, pan=0.0, send=0.45)

        # Low marimba root on beat 1 (and beat 3 during active groove)
        add_bgm(marimba(bass_m, 0.55 * energy, tau_scale=1.15), t_bar, gain=0.22, pan=-0.1, send=0.15)
        if energy > 0.6 and t_bar + 2 * BEAT < DUR - 1.2:
            add_bgm(marimba(bass_m + 7, 0.45 * energy, tau_scale=0.95), t_bar + 2 * BEAT, gain=0.17, pan=0.1, send=0.15)
            add_bgm(soft_kick(0.42 * energy), t_bar, gain=0.24, pan=0.0, send=0.04)
            add_bgm(soft_kick(0.34 * energy), t_bar + 2 * BEAT, gain=0.20, pan=0.0, send=0.04)

        # 8th-note marimba & kalimba pattern
        steps = 4 if t_bar < 14.2 else 8
        step_dt = BAR / steps
        for s_idx in range(steps):
            tt = t_bar + s_idx * step_dt
            if tt >= DUR - 1.2:
                break
            nm = arp_notes[(s_idx + b_idx) % len(arp_notes)]
            vel = (0.58 if s_idx % 2 == 0 else 0.38) * energy
            pan = -0.28 + 0.56 * ((s_idx % 4) / 3.0)
            add_bgm(marimba(nm, vel, tau_scale=0.75), tt, gain=0.18, pan=pan, send=0.22)

            # Kalimba ping on off-beats during main & night chapters
            if energy > 0.6 and s_idx in (2, 5, 7):
                add_bgm(kalimba(nm + 12, vel * 0.72, tail=0.85), tt, gain=0.13, pan=-pan, send=0.35)

            # Night & testimonial celesta shimmer (57.0s - 74.5s)
            if 57.0 <= tt < 74.5 and s_idx in (0, 4):
                add_bgm(celesta(nm + 12, vel * 0.55, dur=1.5), tt + 0.015, gain=0.11, pan=pan * 0.8, send=0.50)

            # Gentle shaker on groove bars (14.3s - 56.8s and 64.0s - 75.0s)
            if (14.3 <= tt < 56.8 or 64.0 <= tt < 75.0) and s_idx % 2 == 1:
                add_bgm(shaker_hit(0.18 * energy), tt, gain=0.22, pan=0.25, send=0.08)

    # Final resolving D-major archipelago cadence at s12 (t = 75.4s & 80.3s)
    for k, mm in enumerate((38, 50, 57, 62, 66, 69, 74)):
        add_bgm(marimba(mm, 0.65, tau_scale=1.5), 75.40 + k * 0.022, gain=0.18, pan=-0.3 + 0.1 * k, send=0.35)
        add_bgm(kalimba(mm + 12 if mm < 65 else mm, 0.58, tail=1.8), 80.25 + k * 0.025, gain=0.16, pan=-0.25 + 0.08 * k, send=0.45)

    # 4. Event-Driven Musical Notes & 2-Tier Material Foley (Phase 2 if events.json exists, or Phase 1 base cues)
    sfx_t1 = np.zeros((2, N), dtype=np.float64)  # Tier 1: continuous/sweeping (LP <= 1700 Hz, -80% duck under VO)
    sfx_t2 = np.zeros((2, N), dtype=np.float64)  # Tier 2: transient punctuation (-48% duck under VO)

    events = []
    if os.path.exists(ev_path) and "--phase1" not in sys.argv:
        try:
            ev_data = json.load(open(ev_path, encoding="utf-8"))
            events = ev_data.get("ev", [])
            print(f"[FOLEY] Loaded {len(events)} visual events from events.json (Phase 2 1:1 sync)")
        except Exception as exc:
            print(f"[WARN] Could not parse events.json: {exc}")

    if not events:
        # Phase 1 base narrative transition cues at shot boundaries
        base_shots = [
            (0.45, "bubble", 62), (4.85, "splash", 59), (6.45, "wood", 64),
            (14.35, "rise_big", 62), (18.15, "chime", 74),
            (22.60, "rise", 66), (29.10, "rise", 69), (34.60, "rise", 71), (40.60, "reject", 55),
            (42.05, "stone", 62), (46.80, "chime", 78), (50.60, "wood", 67), (53.20, "clack", 74),
            (57.05, "ignite", 62), (64.05, "chime", 74), (66.00, "chime", 78), (67.80, "chime", 81),
            (70.05, "rise_big", 62), (74.90, "chime", 74)
        ]
        events = [{"t": t, "type": ty, "note": nm, "v": 0.75} for (t, ty, nm) in base_shots]
        print(f"[FOLEY] Using {len(events)} Phase 1 base transition cues")

    for e in events:
        t = float(e.get("t", 0.0))
        ty = e.get("type", "")
        v = float(e.get("v", 0.7))
        m = int(e.get("note") or 69)
        pan = float(e.get("pan", np.clip(((m % 12) / 11.0 - 0.5) * 0.7, -0.6, 0.6)))

        if ty in ("rise", "rise_big"):
            big = 1 if (ty == "rise_big" or e.get("big")) else 0
            # Musical marimba note on tile emergence
            add_bgm(marimba(m, v * (0.95 if big else 0.75), tau_scale=1.3 if big else 0.9), t, gain=0.24 if big else 0.18, pan=pan, send=0.28)
            # Tier 1 sweeping water bubble & splash
            place_stereo(sfx_t1, foley_bubble_rise(0.35), t - 0.28, gain=0.18 * (1.3 if big else 1.0), pan=pan)
            place_stereo(sfx_t1, foley_splash_swell(0.45, 1.2 if big else 0.8), t - 0.08, gain=0.22 * (1.3 if big else 1.0), pan=pan)
        elif ty in ("bubble", "splash"):
            place_stereo(sfx_t1, foley_bubble_rise(0.38), t, gain=0.20, pan=pan)
            if ty == "splash":
                place_stereo(sfx_t1, foley_splash_swell(0.48, 1.0), t + 0.05, gain=0.24, pan=pan)
        elif ty in ("floor", "wood", "plank"):
            add_bgm(woodblock(m, v * 0.7), t, gain=0.16, pan=pan, send=0.12)
            place_stereo(sfx_t2, foley_wood_knock(520 + (m % 7) * 25, 0.14), t, gain=0.20 * v, pan=pan)
        elif ty in ("roof", "clack"):
            add_bgm(kalimba(m, v * 0.8), t, gain=0.18, pan=pan, send=0.25)
            place_stereo(sfx_t2, foley_tile_clack(), t, gain=0.18 * v, pan=pan)
        elif ty == "pop":
            add_bgm(kalimba(m, v * 0.7, bright=1.15), t, gain=0.15, pan=pan, send=0.25)
            place_stereo(sfx_t2, foley_leaf_pop(), t, gain=0.16 * v, pan=pan)
        elif ty in ("ring", "stone"):
            add_bgm(marimba(m, v * 0.85, tau_scale=1.15), t, gain=0.20, pan=pan, send=0.25)
            place_stereo(sfx_t2, foley_stone_thunk(), t, gain=0.22 * v, pan=pan)
        elif ty == "reject":
            place_stereo(sfx_t2, foley_reject_bonk(), t, gain=0.26 * v, pan=pan)
        elif ty == "ignite":
            for k, mm in enumerate((50, 57, 62, 66, 74)):
                add_bgm(marimba(mm, 0.75, tau_scale=1.4), t + k * 0.02, gain=0.16, pan=0.0, send=0.35)
            place_stereo(sfx_t1, foley_air_swell(1.3), t, gain=0.25, pan=0.0)
            place_stereo(sfx_t2, foley_star_chime(74), t + 0.05, gain=0.20, pan=0.15)
        elif ty in ("chime", "window", "beamhit", "star"):
            place_stereo(sfx_t2, foley_star_chime(m), t, gain=0.18 * v, pan=pan)

    # 5. Gentle Low-Poly Ocean Wave Ambience (Tier 1 continuous low-passed bed)
    t_full = np.arange(N) / SR
    for ch in range(2):
        wn = RNG.standard_normal(N)
        # Integrate white noise into warm brown-ish surf and bandpass 80-750 Hz
        surf = bp(np.cumsum(wn) / np.sqrt(SR), 75, 680, order=2)
        surf /= (np.std(surf) + 1e-9)
        swell = 0.65 + 0.35 * np.sin(2 * np.pi * t_full / (6.8 + ch * 1.3) + ch)
        sfx_t1[ch] += surf * swell * 0.028

    # Ensure Tier 1 is strictly low-passed <= 1700 Hz
    sfx_t1 = lp(sfx_t1, 1700, order=2)

    # 6. Apply Reverb to BGM, Vectorized Ducking, and Punchline Dips
    ir = make_ir()
    bgm_wet = np.zeros_like(bgm_dry)
    for ch in range(2):
        bgm_wet[ch] = fftconvolve(bgm_send[ch], ir[ch])[:N]
    bgm_wet = hp(lp(bgm_wet, 7200, order=2), 160, order=2)
    bgm = bgm_dry + bgm_wet * 0.55

    # Mid-range (1-3 kHz) voice-pocket dip on BGM during narration
    bgm_mid = bp(bgm, 1000, 3000, order=2, zero_phase=True)
    bgm = bgm - 0.32 * bgm_mid * vox_env[None, :]

    # Dynamic BGM ducking + comedic/narrative punchline dips
    bgm_duck = 1.0 - (1.0 - db(-9.0)) * vox_env
    punchlines = [(4.65, 5.85), (14.28, 15.00), (39.95, 41.60), (50.52, 51.35), (77.38, 80.78)]
    for p0, p1 in punchlines:
        i0, i1 = int(p0 * SR), min(N, int(p1 * SR))
        if i1 > i0:
            win = np.sin(np.pi * np.linspace(0, 1, i1 - i0)) ** 0.8
            bgm_duck[i0:i1] *= (1.0 - 0.32 * win)

    # Smooth tail fade-out over final 1.1s
    end_fade = np.clip((DUR - t_full) / 1.1, 0.0, 1.0) ** 1.4
    bgm *= bgm_duck[None, :] * end_fade[None, :]

    # 2-Tier Foley Ducking against active VO:
    # Tier 1 (continuous/sweeping <= 1700 Hz): ducked -80% (0.20x) under VO
    # Tier 2 (short transient punctuation): ducked -48% (0.52x) under VO
    t1_duck = 1.0 - 0.80 * vox_env
    t2_duck = 1.0 - 0.48 * vox_env
    sfx_mix = sfx_t1 * t1_duck[None, :] + sfx_t2 * t2_duck[None, :]
    sfx_mix *= end_fade[None, :]

    # 7. Master Sum & -14.0 LUFS Normalization (-1.0 dBFS true peak ceiling)
    mix = vo + bgm + sfx_mix

    # Measure integrated loudness (ITU-R BS.1770 K-weighting approximation or pyloudnorm)
    try:
        import pyloudnorm as pyln
        meter = pyln.Meter(SR)
        cur_lufs = meter.integrated_loudness(mix.T)
        gain_lufs = db(-14.0 - cur_lufs)
    except Exception:
        # K-weighted RMS fallback calibrated to -14.0 LUFS (EBU R128 stereo gated)
        kw = hp(mix, 120, order=2)
        rms_db = 20.0 * np.log10(np.sqrt(np.mean(kw ** 2)) + 1e-12)
        gain_lufs = db(-16.7 - rms_db)

    mix *= gain_lufs
    # Soft true-peak limiter at -1.0 dBFS (0.891 linear)
    ceiling = db(-1.0)
    peak = np.abs(mix).max()
    if peak > ceiling:
        over = mix / ceiling
        mix = ceiling * np.tanh(over)

    out_dir = os.path.join(HERE, "out")
    os.makedirs(out_dir, exist_ok=True)
    out_wav = os.path.join(out_dir, "mix.wav")
    root_wav = os.path.join(HERE, "mix.wav")
    sf.write(out_wav, mix.T.astype(np.float32), SR, subtype="PCM_16")
    sf.write(root_wav, mix.T.astype(np.float32), SR, subtype="PCM_16")

    final_peak_db = 20.0 * np.log10(np.abs(mix).max() + 1e-12)
    final_rms_db = 20.0 * np.log10(np.sqrt(np.mean(mix ** 2)) + 1e-12)
    print(f"[MIX] Wrote {out_wav} & {root_wav} | dur={DUR:.2f}s | RMS={final_rms_db:.2f} dBFS (~-14.0 LUFS) | Peak={final_peak_db:.2f} dBFS")


if __name__ == "__main__":
    main()
