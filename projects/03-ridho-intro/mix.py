"""Master audio mixer for 03-ridho-intro (VO + Lo-Fi Rhodes BGM + UI Foley -> -14 LUFS stereo 48 kHz)."""
import json
import os
import re
import shutil
import subprocess
import sys

import numpy as np
import soundfile as sf
from scipy.signal import butter, resample_poly, sosfilt

PROJ_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_ROOT = os.path.abspath(os.path.join(PROJ_DIR, "..", ".."))
LEMO_AUDIO = os.path.join(WORKSPACE_ROOT, "lemo-opuscar", "core", "audio")
sys.path.insert(0, LEMO_AUDIO)
import sfx  # noqa: E402

SR = 48000
RNG = np.random.default_rng(303)


def lp(x: np.ndarray, cutoff: float, order: int = 2) -> np.ndarray:
    return sosfilt(butter(order, min(cutoff, SR * 0.45), "low", fs=SR, output="sos"), x)


def hp(x: np.ndarray, cutoff: float, order: int = 2) -> np.ndarray:
    return sosfilt(butter(order, max(20.0, cutoff), "high", fs=SR, output="sos"), x)


def find_word_time(words_data: list[dict], line_id: str, needle: str) -> float | None:
    nl = needle.lower()
    for entry in words_data:
        if entry.get("id") != line_id:
            continue
        for w in entry.get("words", []):
            clean = re.sub(r"[^\w]", "", w.get("w", "").lower())
            if nl in clean:
                return float(w["t0"])
    return None


def synth_rhodes_note(freq: float, dur: float, vel: float = 1.0) -> np.ndarray:
    n = int(round(dur * SR))
    t = np.arange(n, dtype=np.float64) / SR
    # Warm electric piano: fundamental + subtle tine bell + warm overtone
    env_body = np.minimum(1.0, t / 0.008) * np.exp(-t / max(0.35, dur * 0.52))
    env_tine = np.minimum(1.0, t / 0.004) * np.exp(-t / 0.09)
    sig = (
        0.72 * np.sin(2 * np.pi * freq * t)
        + 0.22 * np.sin(2 * np.pi * 2.0 * freq * t) * np.exp(-t / 0.45)
        + 0.14 * np.sin(2 * np.pi * 4.0 * freq * t) * env_tine
    )
    fade_end = max(1, int(0.04 * SR))
    sig *= env_body * vel
    if len(sig) > fade_end:
        sig[-fade_end:] *= np.linspace(1.0, 0.0, fade_end)
    return lp(sig, 2400.0, order=2).astype(np.float32)


def synth_bass_note(freq: float, dur: float, vel: float = 1.0) -> np.ndarray:
    n = int(round(dur * SR))
    t = np.arange(n, dtype=np.float64) / SR
    env = np.minimum(1.0, t / 0.015) * np.exp(-t / max(0.3, dur * 0.65))
    sig = 0.85 * np.sin(2 * np.pi * freq * t) + 0.20 * np.sin(2 * np.pi * 2.0 * freq * t)
    fade_end = max(1, int(0.05 * SR))
    sig *= env * vel
    if len(sig) > fade_end:
        sig[-fade_end:] *= np.linspace(1.0, 0.0, fade_end)
    return lp(sig, 380.0, order=2).astype(np.float32)


def synth_lofi_kick() -> np.ndarray:
    d = 0.22
    t = np.arange(int(d * SR), dtype=np.float64) / SR
    f = 48.0 + 70.0 * np.exp(-t / 0.025)
    sig = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.065)
    return lp(sig, 220.0, 2).astype(np.float32) * 0.55


def synth_lofi_rim() -> np.ndarray:
    d = 0.08
    t = np.arange(int(d * SR), dtype=np.float64) / SR
    click = np.sin(2 * np.pi * 1150.0 * t) * np.exp(-t / 0.008) + np.sin(2 * np.pi * 420.0 * t) * np.exp(-t / 0.015)
    brush = lp(hp(RNG.standard_normal(len(t)), 1400.0), 4200.0) * np.exp(-t / 0.016) * 0.4
    return (click * 0.5 + brush).astype(np.float32) * 0.35


def synth_lofi_hat(accent: float = 1.0) -> np.ndarray:
    d = 0.06
    t = np.arange(int(d * SR), dtype=np.float64) / SR
    n = hp(RNG.standard_normal(len(t)), 5500.0)
    return lp(n * np.exp(-t / 0.014), 10500.0).astype(np.float32) * (0.14 * accent)


def midi_to_hz(m: int) -> float:
    return 440.0 * (2.0 ** ((m - 69) / 12.0))


def build_bgm(total: float, dark_start: float, dark_end: float, outro_start: float) -> np.ndarray:
    n_samples = int(round(total * SR))
    bgm = np.zeros((n_samples, 2), dtype=np.float32)

    bpm = 84.0
    beat = 60.0 / bpm
    bar = beat * 4.0

    # Editorial Lo-Fi progression: Cmaj9 -> Am9 -> Dm9 -> G13
    chords = [
        (48, [60, 64, 67, 71, 74]),  # Cmaj9
        (45, [57, 60, 64, 67, 71]),  # Am9
        (50, [62, 65, 69, 72, 76]),  # Dm9
        (43, [55, 59, 62, 65, 69]),  # G13
    ]

    kick = synth_lofi_kick()
    rim = synth_lofi_rim()
    hat_a = synth_lofi_hat(1.0)
    hat_b = synth_lofi_hat(0.55)

    n_bars = int(np.ceil(total / bar))
    for b in range(n_bars):
        t_bar = b * bar
        if t_bar >= total - 1.2:
            break
        in_dark = dark_start <= t_bar < dark_end
        in_outro = t_bar >= outro_start
        root_midi, notes = chords[b % len(chords)]

        # Resolve final bar softly on Cmaj9
        if in_outro and b == n_bars - 1:
            root_midi, notes = chords[0]

        chord_dur = min(bar * 1.05, total - t_bar)
        # Warm Rhodes pad chord with slight human strum offset (deterministic)
        for ni, m in enumerate(notes):
            t_note = t_bar + ni * 0.018
            if t_note >= total:
                break
            pan = -0.25 + (ni / max(1, len(notes) - 1)) * 0.5
            vel = 0.20 if in_dark else 0.24
            tone = synth_rhodes_note(midi_to_hz(m), chord_dur, vel=vel)
            if in_dark:
                tone = lp(tone, 1500.0, order=2).astype(np.float32)
            sfx.add(bgm, tone, t_note, gain=0.65, pan=pan)

        # Gentle mid-bar Rhodes grace note on beat 3.5 (except final outro resolve)
        if not in_outro and (t_bar + beat * 3.0) < total - 2.0:
            grace = synth_rhodes_note(midi_to_hz(notes[-1] + (0 if in_dark else 12)), beat * 1.1, vel=0.14)
            sfx.add(bgm, grace, t_bar + beat * 2.5, gain=0.45, pan=0.28)

        # Warm sub bass on beat 1 and beat 2.75
        bass1 = synth_bass_note(midi_to_hz(root_midi - 12), beat * 2.2, vel=0.38)
        sfx.add(bgm, bass1, t_bar, gain=0.55, pan=0.0)
        if not in_outro and (t_bar + beat * 2.75) < total - 1.5:
            bass2 = synth_bass_note(midi_to_hz(root_midi - 12), beat * 1.1, vel=0.28)
            sfx.add(bgm, bass2, t_bar + beat * 2.75, gain=0.48, pan=0.0)

        # Subtle brushed lo-fi drum groove (stops cleanly before outro final chord)
        if t_bar < outro_start + bar * 0.5:
            kick_beats = [0.0, 1.5, 2.5] if in_dark else [0.0, 2.5]
            for kb in kick_beats:
                tk = t_bar + kb * beat
                if tk < total - 1.5:
                    sfx.add(bgm, kick, tk, gain=0.55, pan=0.0)
            for rb in [1.0, 3.0]:
                tr = t_bar + rb * beat
                if tr < total - 1.5:
                    sfx.add(bgm, rim, tr, gain=0.42, pan=-0.12 if rb < 2 else 0.12)
            for step_i in range(8):
                th = t_bar + step_i * (beat * 0.5)
                if th < total - 1.5:
                    h = hat_a if step_i % 2 == 0 else hat_b
                    sfx.add(bgm, h, th, gain=0.35 if in_dark else 0.30, pan=0.18)

    # Gentle fade-in (0.3s) and smooth fade-out over last 2.2s
    fade_in_n = min(n_samples, int(0.3 * SR))
    fade_out_n = min(n_samples, int(2.2 * SR))
    bgm[:fade_in_n] *= np.linspace(0.0, 1.0, fade_in_n, dtype=np.float32)[:, None]
    bgm[-fade_out_n:] *= np.linspace(1.0, 0.0, fade_out_n, dtype=np.float32)[:, None]
    return bgm


def compute_duck_envelope(vo_mono: np.ndarray, punchline_times: list[float]) -> np.ndarray:
    # Voice activity envelope (~ -8 dB ducking during speech)
    win = int(0.03 * SR)
    abs_v = np.abs(vo_mono).astype(np.float32)
    kernel = np.ones(win, dtype=np.float32) / win
    rms = np.convolve(abs_v, kernel, mode="same")

    active = (rms > 0.012).astype(np.float32)
    env = np.zeros_like(active)
    att = float(np.exp(-1.0 / (0.06 * SR)))
    rel = float(np.exp(-1.0 / (0.26 * SR)))
    cur = 0.0
    for i in range(len(active)):
        target = active[i]
        coeff = att if target > cur else rel
        cur = coeff * cur + (1.0 - coeff) * target
        env[i] = cur

    # Duck from 1.0 (0 dB) down to ~0.398 (-8 dB)
    gain_curve = 1.0 - env * (1.0 - 0.398)

    # Dramatic punchline dip (-18 dB = ~0.125) for 0.45s on deadpan moments
    t_arr = np.arange(len(vo_mono), dtype=np.float32) / SR
    for tp in punchline_times:
        if tp is None:
            continue
        t0 = max(0.0, tp - 0.05)
        t1 = tp + 0.45
        mask = (t_arr >= t0) & (t_arr <= t1)
        if np.any(mask):
            local = np.clip((t_arr[mask] - t0) / (t1 - t0), 0.0, 1.0)
            dip = np.maximum(0.0, np.sin(np.pi * local)) ** 0.7
            gain_curve[mask] *= 1.0 - dip * (1.0 - 0.125)

    return gain_curve[:, None].astype(np.float32)


def run_loudnorm(raw_wav: str, out_wav: str) -> dict:
    cmd1 = [
        "ffmpeg", "-y", "-hide_banner", "-i", raw_wav,
        "-af", "loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json",
        "-f", "null", "NUL" if os.name == "nt" else "/dev/null",
    ]
    res1 = subprocess.run(cmd1, capture_output=True, text=True, check=True)
    m = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", res1.stderr, re.S)
    if not m:
        raise RuntimeError(f"Failed to parse loudnorm pass 1 stats:\n{res1.stderr}")
    stats = json.loads(m.group(0))

    filt = (
        f"loudnorm=I=-14:TP=-1.5:LRA=9:measured_I={stats['input_i']}:"
        f"measured_TP={stats['input_tp']}:measured_LRA={stats['input_lra']}:"
        f"measured_thresh={stats['input_thresh']}:offset={stats['target_offset']}:"
        f"linear=true:print_format=json"
    )
    cmd2 = [
        "ffmpeg", "-y", "-hide_banner", "-i", raw_wav,
        "-af", filt, "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", out_wav,
    ]
    res2 = subprocess.run(cmd2, capture_output=True, text=True, check=True)
    m2 = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", res2.stderr, re.S)
    return json.loads(m2.group(0)) if m2 else stats


def measure_wav(wav_path: str) -> dict:
    cmd = [
        "ffmpeg", "-hide_banner", "-i", wav_path,
        "-af", "loudnorm=I=-14:TP=-1.0:LRA=9:print_format=json",
        "-f", "null", "NUL" if os.name == "nt" else "/dev/null",
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    m = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", res.stderr, re.S)
    return json.loads(m.group(0)) if m else {}


def main() -> None:
    sched_path = os.path.join(PROJ_DIR, "voice", "schedule.json")
    words_path = os.path.join(PROJ_DIR, "voice", "words.json")
    with open(sched_path, encoding="utf-8") as f:
        sched = json.load(f)
    with open(words_path, encoding="utf-8") as f:
        words_data = json.load(f)

    total = float(sched["total"])
    shots = sched["shots"]
    placements = sched["voice"]
    n_samples = int(round(total * SR))

    # 1. Place VO clips (24 kHz -> 48 kHz)
    vo_mono = np.zeros(n_samples, dtype=np.float32)
    for p in placements:
        wav_p = os.path.join(PROJ_DIR, "voice", "wav", f"{p['id']}.wav")
        y24, sr_in = sf.read(wav_p, dtype="float32")
        if y24.ndim > 1:
            y24 = y24.mean(axis=1)
        y48 = resample_poly(y24, 2, 1).astype(np.float32) if sr_in == 24000 else y24
        y48 = sfx.compress(y48, thr=0.22, ratio=3.0)
        y48 = sfx.limit(y48, ceil=0.92)
        s0 = int(round(float(p["start"]) * SR))
        s1 = min(n_samples, s0 + len(y48))
        if s1 > s0:
            vo_mono[s0:s1] += y48[: s1 - s0]

    vo_buf = np.zeros((n_samples, 2), dtype=np.float32)
    sfx.add(vo_buf, vo_mono, 0.0, gain=0.95, pan=0.0)

    # 2. Synthesize BGM & apply auto-ducking + punchline dips
    dark_start = float(shots[6]["start"])  # Shot 07
    dark_end = float(shots[7]["end"])      # Shot 08 end
    outro_start = float(shots[9]["start"]) # Shot 10
    bgm_buf = build_bgm(total, dark_start, dark_end, outro_start)

    punchlines = [
        find_word_time(words_data, "s01", "debugging"),
        find_word_time(words_data, "s03", "investasi"),
        find_word_time(words_data, "s05", "jebol"),
        find_word_time(words_data, "s09", "wni"),
    ]
    duck = compute_duck_envelope(vo_mono, punchlines)
    bgm_buf *= duck

    # 3. Place UI Foley & SFX anchored to schedule.json
    sfx_buf = np.zeros((n_samples, 2), dtype=np.float32)
    sfx.add(sfx_buf, sfx.whoosh(0.28, 0.25), 0.06, gain=0.35, pan=-0.1)

    for sh in shots[1:]:
        ts = float(sh["start"])
        sfx.add(sfx_buf, sfx.whoosh(0.22, 0.20), ts, gain=0.30, pan=0.0)
        sfx.add(sfx_buf, sfx.click(1.05, 0.22), ts + 0.04, gain=0.25, pan=0.08)

    # s02 3D flip
    t2 = float(shots[1]["start"])
    sfx.add(sfx_buf, sfx.whoosh(0.18, 0.22), t2 + 0.55, gain=0.32, pan=0.1)
    sfx.add(sfx_buf, sfx.clack(1.1, 0.25), t2 + 0.72, gain=0.28, pan=0.0)

    # s03 timer & stamp
    t3 = float(shots[2]["start"])
    sfx.add(sfx_buf, sfx.click(1.2, 0.22), t3 + 0.50, gain=0.28, pan=-0.1)
    sfx.add(sfx_buf, sfx.thump(0.28, 85), t3 + 5.80, gain=0.40, pan=0.0)

    # s04 tumpukan berkas
    t4 = float(shots[3]["start"])
    for off in (0.4, 0.9, 1.4, 1.9):
        sfx.add(sfx_buf, sfx.step(0.20), t4 + off, gain=0.30, pan=-0.12 if off < 1.2 else 0.12)
    sfx.add(sfx_buf, sfx.click(0.95, 0.18), t4 + 2.4, gain=0.24, pan=0.0)

    # s05 Google Workspace
    t5 = float(shots[4]["start"])
    sfx.add(sfx_buf, sfx.pop(0.25), t5 + 1.0, gain=0.32, pan=0.0)
    sfx.add(sfx_buf, sfx.click(1.15, 0.20), t5 + 4.8, gain=0.28, pan=0.1)

    # s06 3 kartu flagship
    t6 = float(shots[5]["start"])
    for off in (0.5, 2.3, 4.1):
        sfx.add(sfx_buf, sfx.click(1.0, 0.20), t6 + off, gain=0.28, pan=0.0)
    sfx.add(sfx_buf, sfx.pop(0.26), t6 + 6.2, gain=0.35, pan=0.0)

    # s07 Bot Python mechanical typing
    t7 = float(shots[6]["start"])
    for off in (0.5, 0.85, 1.2, 1.55, 1.9):
        sfx.add(sfx_buf, sfx.step(0.22), t7 + off, gain=0.28, pan=-0.08 + 0.04 * (off % 2))

    # s08 Minerva Telegram
    t8 = float(shots[7]["start"])
    sfx.add(sfx_buf, sfx.pop(0.24), t8 + 0.7, gain=0.32, pan=0.0)
    sfx.add(sfx_buf, sfx.ding(0.16), t8 + 9.8, gain=0.22, pan=0.12)

    # s09 Medium
    t9 = float(shots[8]["start"])
    sfx.add(sfx_buf, sfx.whoosh(0.20, 0.18), t9 + 0.35, gain=0.26, pan=0.0)
    sfx.add(sfx_buf, sfx.click(0.9, 0.18), t9 + 0.55, gain=0.24, pan=0.0)

    # s10 Closing RIDHO.
    t10 = float(shots[9]["start"])
    sfx.add(sfx_buf, sfx.ding(0.18), t10 + 6.2, gain=0.24, pan=0.0)

    # Combine buses and master to -14 LUFS stereo 48 kHz
    mix_raw = vo_buf * 1.0 + bgm_buf * 0.28 + sfx_buf * 0.65
    peak = float(np.abs(mix_raw).max())
    if peak > 0.94:
        mix_raw = mix_raw * (0.90 / peak)

    out_dir = os.path.join(PROJ_DIR, "out")
    assets_dir = os.path.join(PROJ_DIR, "assets")
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(assets_dir, exist_ok=True)

    raw_wav = os.path.join(out_dir, "mix_raw.wav")
    final_wav = os.path.join(out_dir, "mix.wav")
    assets_wav = os.path.join(assets_dir, "mix.wav")

    sf.write(raw_wav, mix_raw, SR, subtype="PCM_24")
    run_loudnorm(raw_wav, final_wav)
    if os.path.isfile(raw_wav):
        os.remove(raw_wav)
    shutil.copy2(final_wav, assets_wav)

    final_stats = measure_wav(final_wav)
    print(json.dumps({
        "out_wav": final_wav,
        "assets_wav": assets_wav,
        "duration_s": round(total, 3),
        "punchline_times": punchlines,
        "loudness_lufs": final_stats.get("input_i"),
        "true_peak_dbfs": final_stats.get("input_tp"),
        "lra": final_stats.get("input_lra"),
    }, indent=2))


if __name__ == "__main__":
    main()
