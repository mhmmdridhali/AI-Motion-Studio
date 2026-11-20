"""Mix expressive Indonesian VO, 108 BPM stick-explainer score (with real silences), and event-driven foley.
Outputs:
  - projects/01-sipelita-explainer/out/mix.wav (full 48 kHz stereo mix)
  - projects/01-sipelita-explainer/boards/motion-proof-audio.wav (Shot 1 + Silence #1 + Shot 2 proof slice)
  - projects/01-sipelita-explainer/voice/preview-audio-mix.mp3 (-14 LUFS loudnorm preview)
"""
import json
import math
import os
import subprocess
import sys
import numpy as np
import soundfile as sf
from scipy.ndimage import uniform_filter1d
from scipy.signal import resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
LEMO = os.path.join(ROOT, "lemo-opuscar")
sys.path.insert(0, LEMO)

from core.audio import pluck as P
from core.audio import sfx as X

SR = X.SR  # 48000 Hz
BPM = 108
BEAT = 60.0 / BPM


def rms(x):
    return float(np.sqrt(np.mean(x ** 2) + 1e-12))


def polish_voice_clip(y24):
    """Resample 24->48 kHz and apply clean broadcast presence without harshness."""
    y = resample_poly(y24.astype(np.float32), 2, 1)
    y = X.hp(y, 85, o=2)
    warm = X.bp(y, 140, 260, o=1)
    pres = X.bp(y, 2400, 4200, o=1)
    y = y + 0.14 * warm + 0.20 * pres
    y = X.compress(y, thr=0.18, ratio=3.2, att=0.004, rel=0.075)
    # 8 ms de-click edges
    ed = min(len(y) // 4, int(0.008 * SR))
    if ed > 1:
        y[:ed] *= np.linspace(0, 1, ed, dtype=np.float32)
        y[-ed:] *= np.linspace(1, 0, ed, dtype=np.float32)
    target_rms = 0.18
    r = rms(y)
    if r > 1e-5:
        y *= target_rms / r
    y = X.limit(y, ceil=0.88)
    return y.astype(np.float32)


def build_voice_bus(sched, n_samples):
    """Place all 18 polished VO clips on their exact schedule timestamps and build ducking mask."""
    vo = np.zeros(n_samples, dtype=np.float32)
    duck = np.zeros(n_samples, dtype=np.float32)
    wav_dir = os.path.join(HERE, "voice", "wav")
    for item in sched["voice"]:
        p = os.path.join(wav_dir, f"{item['id']}.wav")
        y24, _ = sf.read(p, dtype="float32")
        clip = polish_voice_clip(y24)
        s0 = int(round(item["start"] * SR))
        s1 = min(n_samples, s0 + len(clip))
        if s1 > s0:
            vo[s0:s1] += clip[: s1 - s0]
            # Smooth ducking window extending 90ms before and 140ms after phrase
            d0 = max(0, s0 - int(0.09 * SR))
            d1 = min(n_samples, s1 + int(0.14 * SR))
            duck[d0:d1] = 1.0
    duck = uniform_filter1d(duck, size=int(0.12 * SR))
    return np.stack([vo, vo], axis=1), duck


def in_silence(t, windows):
    return any(a <= t <= b for a, b in windows)


def build_music_bus(sched, n_samples):
    """Build 108 BPM D-Major kalimba + nylon_guitar + harp + upright_bass_pizz score with real silences."""
    total = sched["total"]
    shots = {s["shot"]: s for s in sched["shots"]}
    voices = {v["id"]: v for v in sched["voice"]}

    # Silence #1: before Shot 2 voice '02a' (~10.05 -> 10.70)
    sil1 = (shots[1]["end"] - 0.08, voices["02a"]["start"] - 0.05)
    # Silence #2: before Shot 5 voice '05a' (~40.00 -> 40.72)
    sil2 = (shots[4]["end"] - 0.08, voices["05a"]["start"] - 0.06)
    silences = [sil1, sil2]

    buf = np.zeros((n_samples + 2 * SR, 2), dtype=np.float32)
    bar = 4 * BEAT
    n_bars = int(math.ceil(total / bar)) + 1

    chords = [
        {"bass": "D3", "pad": ["D4", "F#4", "A4", "C#5"], "arp": ["D5", "F#5", "A5", "D6", "A5", "F#5"]},
        {"bass": "A2", "pad": ["E4", "A4", "B4", "C#5"], "arp": ["E5", "A5", "B5", "C#6", "B5", "A5"]},
        {"bass": "B2", "pad": ["F#4", "A4", "D5", "E5"], "arp": ["F#5", "A5", "B5", "D6", "B5", "A5"]},
        {"bass": "G2", "pad": ["G4", "B4", "D5", "F#5"], "arp": ["G5", "B5", "D6", "F#5", "D5", "B4"]},
    ]
    k_pat = [0.0, 0.75, 1.5, 2.0, 2.75, 3.5]

    for b in range(n_bars):
        t0 = b * bar
        if t0 >= total - 1.2:
            break
        ch = chords[b % len(chords)]

        # Bass & sparse guitar in Act 1 (< Shot 2)
        if t0 < sil1[0]:
            if not in_silence(t0, silences):
                X.add(buf, P.pluck("upright_bass_pizz", ch["bass"], dur=0.55, vel=0.52), t0, gain=0.45, pan=-0.05)
            t2 = t0 + 2 * BEAT
            if t2 < sil1[0] - 0.15:
                X.add(buf, P.pluck("upright_bass_pizz", ch["bass"], dur=0.42, vel=0.40), t2, gain=0.36, pan=-0.05)
                X.add(buf, P.pluck("nylon_guitar", ch["pad"][0], dur=0.75, vel=0.36, damp=0.65), t0 + BEAT, gain=0.30, pan=-0.22)
                X.add(buf, P.pluck("nylon_guitar", ch["pad"][1], dur=0.65, vel=0.32, damp=0.65), t0 + 3 * BEAT, gain=0.26, pan=0.22)
            continue

        # Closing bars (Shot 7 resolve)
        if t0 >= shots[7]["start"]:
            if not in_silence(t0, silences) and t0 < total - 2.4:
                X.add(buf, P.strum("nylon_guitar", ch["pad"], dur=2.2, vel=0.50, spread=0.04), t0, gain=0.36, pan=-0.12)
                X.add(buf, P.strum("harp", ch["arp"][:4], dur=2.6, vel=0.48, spread=0.055), t0 + 0.06, gain=0.34, pan=0.14)
                X.add(buf, P.pluck("upright_bass_pizz", "D3", dur=1.8, vel=0.50), t0, gain=0.42, pan=0.0)
            continue

        # Act 2 & Act 3 groove
        for b_off, v_b in [(0.0, 0.58), (1.5 * BEAT, 0.45), (2.5 * BEAT, 0.52)]:
            tb = t0 + b_off
            if not in_silence(tb, silences) and tb < total - 1.5:
                X.add(buf, P.pluck("upright_bass_pizz", ch["bass"], dur=0.55, vel=v_b), tb, gain=0.44, pan=-0.04)

        if not in_silence(t0, silences):
            X.add(buf, P.strum("nylon_guitar", ch["pad"][:3], dur=1.2, vel=0.44, spread=0.024), t0, gain=0.30, pan=-0.22)
        if not in_silence(t0 + 2 * BEAT, silences):
            X.add(buf, P.strum("nylon_guitar", ch["pad"][1:], dur=0.85, vel=0.38, spread=0.020), t0 + 2 * BEAT, gain=0.26, pan=0.22)

        for ik, bo in enumerate(k_pat):
            tk = t0 + bo * BEAT
            if in_silence(tk, silences) or tk >= shots[7]["start"] + 0.8:
                continue
            note = ch["arp"][(ik + (b % 2)) % len(ch["arp"])]
            vel_k = 0.52 if ik in (0, 3) else 0.40
            pan_k = -0.22 if ik % 2 == 0 else 0.24
            X.add(buf, P.pluck("kalimba", note, dur=0.36, vel=vel_k), tk, gain=0.32, pan=pan_k)

        # Gentle shaker + muted tap on groove bars
        for sb in (0.5, 1.5, 2.5, 3.5):
            ts = t0 + sb * BEAT
            if not in_silence(ts, silences) and ts < shots[6]["end"]:
                sh = X.bp(X.noise(0.045), 4800, 9800, o=2) * np.sin(np.pi * X.t_(0.045) / 0.045) ** 1.5
                X.add(buf, X.norm(sh), ts, gain=0.055, pan=0.18 if sb in (0.5, 2.5) else -0.18)

    # Pickup into Silence #2 end & L-cut resolve into Shot 6
    X.add(buf, P.pluck("kalimba", "A5", dur=0.4, vel=0.45), sil2[1] - 0.14, gain=0.34, pan=0.12)
    X.add(buf, P.strum("harp", ["D5", "F#5", "A5", "D6"], dur=2.2, vel=0.52, spread=0.05), shots[6]["start"] - 0.35, gain=0.36, pan=-0.1)

    buf = buf[:n_samples].copy()

    # True silence drop envelopes around Silence #1 and #2 (only soft paper room tone remains)
    gate = np.ones(n_samples, dtype=np.float32)
    for a, b in silences:
        i0 = max(0, int((a + 0.04) * SR))
        i1 = min(n_samples, int((b - 0.04) * SR))
        if i1 > i0:
            gate[i0:i1] = 0.0
    gate = uniform_filter1d(gate, size=int(0.06 * SR))
    buf *= gate[:, None]

    # Mid-range vocal pocket attenuation (~300 Hz - 4 kHz) so voice sits effortlessly above music
    for c in (0, 1):
        mids = X.bp(buf[:, c], 320, 3800, o=2)
        buf[:, c] -= 0.36 * mids

    # Fade in & final outro tail
    fi = int(0.05 * SR)
    fo = int(1.4 * SR)
    buf[:fi] *= np.linspace(0, 1, fi, dtype=np.float32)[:, None]
    buf[-fo:] *= np.linspace(1, 0, fo, dtype=np.float32)[:, None]
    return buf


def build_foley_bus(events, sched, n_samples):
    """Trigger tactile foley synced to window.EV."""
    buf = np.zeros((n_samples + 2 * SR, 2), dtype=np.float32)
    scale = ["D5", "E5", "F#5", "A5", "B5", "D6"]
    silences = [(sched["shots"][0]["end"] - 0.04, sched["voice"][4]["start"] - 0.05),
                (sched["shots"][3]["end"] - 0.04, sched["voice"][12]["start"] - 0.05)]
    clasp_idx = 0

    for ev in events:
        t = float(ev["t"])
        if t < 0 or t >= sched["total"] - 0.15 or in_silence(t, silences):
            continue
        pan = float(ev.get("pan", 0.0))
        tp = ev["type"]

        if tp == "pop":
            s = X.bp(X.pop(v=0.4), 600, 3200, o=2)
            X.add(buf, s, t, gain=0.055 if ev.get("q") else 0.10, pan=pan)
        elif tp in ("clasp", "handshake"):
            palm = X.lp(X.thump(v=0.45, f=165), 950)
            note = scale[clasp_idx % len(scale)]
            clasp_idx += 1
            X.add(buf, palm, t, gain=0.14 if ev.get("big") else 0.08, pan=pan)
            X.add(buf, P.pluck("kalimba", note, dur=0.28, vel=0.50 if ev.get("big") else 0.36), t, gain=0.22 if ev.get("big") else 0.14, pan=pan)
        elif tp in ("ripple", "pulse", "sweep"):
            d = max(0.22, min(0.85, float(ev.get("d", 0.45))))
            sw = X.bp(X.whoosh(d=d, v=0.65), 750, 3800, o=2)
            X.add(buf, sw, t, gain=0.14, pan=pan)
            X.add(buf, P.pluck("music_box", "A5", dur=0.35, vel=0.38), t + d * 0.4, gain=0.14, pan=pan)
        elif tp == "drop":
            th = X.lp(X.thump(v=0.55, f=95), 420)
            drop_note = P.pluck("nylon_guitar", "F#3", dur=0.35, vel=0.45, bend=[(0.0, 0), (0.22, -3)])
            X.add(buf, th, t, gain=0.18, pan=pan)
            X.add(buf, drop_note, t, gain=0.16, pan=pan)
        elif tp == "sigh":
            sw = X.lp(X.whoosh(d=0.32, v=0.45), 1400)
            X.add(buf, sw, t, gain=0.11, pan=-0.25)
        elif tp == "stand":
            X.add(buf, P.pluck("kalimba", "D5", dur=0.4, vel=0.52), t, gain=0.22, pan=pan)
        elif tp == "ticket":
            X.add(buf, P.pluck("music_box", "D6", dur=0.45, vel=0.45), t, gain=0.20, pan=pan)
        elif tp == "portal":
            X.add(buf, P.strum("harp", ["D4", "A4", "D5"], dur=0.85, vel=0.52, spread=0.04), t, gain=0.26, pan=pan)
        elif tp == "prism":
            X.add(buf, P.pluck("kalimba", "A5", dur=0.32, vel=0.42), t, gain=0.18, pan=pan)
        elif tp in ("bounce", "shield"):
            X.add(buf, P.pluck("kalimba", "G4", dur=0.18, vel=0.58), t, gain=0.28, pan=pan)
            X.add(buf, P.pluck("kalimba", "D4", dur=0.20, vel=0.42), t + 0.14, gain=0.20, pan=pan)
        elif tp == "spring":
            X.add(buf, P.strum("harp", ["A4", "D5", "F#5", "A5"], dur=0.55, vel=0.52, spread=0.04), t, gain=0.26, pan=pan)
        elif tp == "patch":
            X.add(buf, P.pluck("music_box", "F#5", dur=0.32, vel=0.46), t, gain=0.20, pan=pan)
        elif tp == "wave":
            X.add(buf, P.pluck("kalimba", "F#5", dur=0.45, vel=0.42), t, gain=0.18, pan=pan)
        elif tp == "lift":
            X.add(buf, P.strum("harp", ["D5", "A5"], dur=0.65, vel=0.48, spread=0.05), t, gain=0.20, pan=0.0)
        elif tp == "done":
            X.add(buf, P.strum("harp", ["D5", "F#5", "A5", "D6"], dur=0.95, vel=0.56, spread=0.045), t, gain=0.30, pan=0.25)
        elif tp == "seal":
            X.add(buf, P.strum("nylon_guitar", ["D3", "A3", "D4", "F#4", "A4"], dur=2.6, vel=0.58, spread=0.05), t, gain=0.34, pan=0.0)
        elif tp == "thud" and t > 0.2:
            X.add(buf, X.lp(X.thump(v=0.38, f=72), 200), t, gain=0.12, pan=0.0)

    return buf[:n_samples].copy()


def main():
    sched = json.load(open(os.path.join(HERE, "voice", "schedule.json"), encoding="utf-8"))
    ev_path = os.path.join(HERE, "out", "events.json")
    events = json.load(open(ev_path, encoding="utf-8"))["ev"] if os.path.exists(ev_path) else []

    n_samples = int(round(sched["total"] * SR))
    vo_bus, duck = build_voice_bus(sched, n_samples)
    music_bus = build_music_bus(sched, n_samples)
    foley_bus = build_foley_bus(events, sched, n_samples)

    # Calibrate music bed ~10 dB RMS below active voice
    active = duck > 0.5
    vo_rms = rms(vo_bus[active, 0]) if np.any(active) else 0.14
    bed = music_bus + 0.65 * foley_bus
    bed_rms = rms(bed)
    if bed_rms > 1e-6:
        # Unducked bed around -10 dB of voice; ducked down smoothly during VO
        bed *= (vo_rms * 0.32) / bed_rms
    bed *= (1.0 - 0.42 * duck)[:, None]

    # Gentle warm paper room tone (subtle -55 dB floor across silences)
    room = X.lp(X.brown(sched["total"]), 320)[:n_samples] * 0.0012
    mix = vo_bus + bed + np.stack([room, room], axis=1)

    for c in (0, 1):
        mix[:, c] = X.limit(mix[:, c], ceil=0.90)

    os.makedirs(os.path.join(HERE, "out"), exist_ok=True)
    os.makedirs(os.path.join(HERE, "boards"), exist_ok=True)

    full_wav = os.path.join(HERE, "out", "mix.wav")
    sf.write(full_wav, mix, SR, subtype="PCM_16")

    # Proof slice: 0 .. Shot 3 end (Shots 1-3: 1 stickman problem, 1 stickman + portal, 0 stickmen 3-channel prism + shield)
    proof_end = sched["shots"][2]["end"]
    np_samples = min(n_samples, int(round(proof_end * SR)))
    proof = mix[:np_samples].copy()
    fo = min(np_samples, int(0.14 * SR))
    proof[-fo:] *= np.linspace(1, 0, fo, dtype=np.float32)[:, None]
    proof_wav = os.path.join(HERE, "boards", "motion-proof-audio.wav")
    sf.write(proof_wav, proof, SR, subtype="PCM_16")

    # -14 LUFS full audio preview mp3 for user review
    prev_mp3 = os.path.join(HERE, "voice", "preview-audio-mix.mp3")
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", full_wav,
         "-af", "loudnorm=I=-14:TP=-1.2:LRA=11", "-c:a", "libmp3lame", "-b:a", "192k", prev_mp3],
        check=True
    )
    print(f"Audio mix built: full={full_wav} ({sched['total']}s), proof={proof_wav} ({proof_end}s), preview={prev_mp3}")


if __name__ == "__main__":
    main()
