"""Expressive multi-phrase Indonesian/multilingual VO synthesizer with WordBoundary timings.

Usage:
  lemo-opuscar/.venv/Scripts/python.exe .agents/skills/motion-studio-workflow/scripts/tts_expressive.py <project_dir> [--fps 60] [--voice id-ID-ArdiNeural] [--audition-voice id-ID-GadisNeural] [--audition-lines 6]

Supports `<project_dir>/voice/lines.json` either as:
  1) A plain list of line dicts: [{"id": "01a", "shot": 1, "voice": "...", "rate": "-3%", "pitch": "+2Hz", "text": "...", "say": "...", "keywords": [...], "pre": 0.65}, ...]
  2) A structured object: {"fps": 60, "lead": 0.35, "gap": 0.30, "default_tail": 0.9, "chapters": {"1": "..."}, "tails": {"1": 0.55}, "lines": [...]}

Outputs inside `<project_dir>/voice/`:
  wav/<id>.wav, dur.json, schedule.json, words.json, cues.json, audition.wav (+ audition-alt.wav if --audition-voice is set).
"""
import argparse
import asyncio
import hashlib
import io
import json
import os
import re
import subprocess
import sys
import numpy as np
import soundfile as sf

SR = 24000


async def synth(say: str, voice: str, rate: str, pitch: str, mp3: str, jsn: str) -> None:
    import edge_tts

    last_err = None
    for attempt in range(3):
        try:
            com = edge_tts.Communicate(say, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
            audio = bytearray()
            words = []
            async for ch in com.stream():
                if ch["type"] == "audio":
                    audio += ch["data"]
                elif ch["type"] == "WordBoundary":
                    words.append({
                        "w": ch["text"],
                        "t0": ch["offset"] / 1e7,
                        "t1": (ch["offset"] + ch["duration"]) / 1e7,
                    })
            if not audio:
                raise RuntimeError("empty audio returned from edge-tts")
            with open(mp3 + ".part", "wb") as f:
                f.write(audio)
            os.replace(mp3 + ".part", mp3)
            with open(jsn + ".part", "w", encoding="utf-8") as f:
                json.dump(words, f, ensure_ascii=False)
            os.replace(jsn + ".part", jsn)
            return
        except Exception as exc:
            last_err = exc
            if type(exc).__name__ == "NoAudioReceived":
                break
            await asyncio.sleep(1.5 * (attempt + 1))
    raise last_err


def decode_mp3(mp3: str) -> np.ndarray:
    res = subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", mp3, "-ar", str(SR), "-ac", "1", "-f", "wav", "-"],
        capture_output=True,
        check=True,
    )
    samples, _ = sf.read(io.BytesIO(res.stdout), dtype="float32")
    return samples


def get_clip(line: dict, cache_dir: str, default_voice: str, voice_override: str | None = None):
    voice = voice_override or line.get("voice") or default_voice
    rate = line.get("rate") or "+0%"
    pitch = line.get("pitch") or "+0Hz"
    say = line.get("say") or line["text"]
    key = hashlib.sha1(json.dumps([voice, rate, pitch, say], ensure_ascii=False).encode("utf-8")).hexdigest()[:16]
    mp3 = os.path.join(cache_dir, key + ".mp3")
    jsn = os.path.join(cache_dir, key + ".json")

    if not (os.path.exists(mp3) and os.path.exists(jsn)):
        asyncio.run(synth(say, voice, rate, pitch, mp3, jsn))

    y = decode_mp3(mp3)
    with open(jsn, encoding="utf-8") as f:
        bw = json.load(f)

    peak = float(np.abs(y).max()) if len(y) else 0.0
    nz = np.where(np.abs(y) > peak * 0.02)[0]
    if len(nz):
        s0 = max(0, int(nz[0]) - int(0.03 * SR))
        s1 = min(len(y), int(nz[-1]) + int(0.10 * SR))
        y = y[s0:s1]
    else:
        s0 = 0
        print(f"warning: line '{line['id']}' is nearly silent", file=sys.stderr)

    off = s0 / SR
    for w in bw:
        w["t0"] = max(0.0, w["t0"] - off)
        w["t1"] = max(w["t0"] + 0.04, w["t1"] - off)
    return y, bw


def norm_word(w: str) -> str:
    return re.sub(r"[^\w%]", "", w.lower())


def align_words(display: list[str], bw: list[dict], dur: float):
    if not display:
        return []
    if not bw:
        n = len(display)
        return [(dur * i / n, dur * (i + 1) / n) for i in range(n)]

    ch = [max(1, len(re.sub(r"\W", "", b["w"]))) for b in bw]
    tot = sum(ch)
    cum = np.concatenate([[0.0], np.cumsum(ch)]) / tot

    def map_frac(frac: float) -> float:
        frac = min(max(frac, 0.0), 1.0)
        idx = min(int(np.searchsorted(cum, frac, side="right")) - 1, len(bw) - 1)
        idx = max(0, idx)
        span = cum[idx + 1] - cum[idx] or 1.0
        u = (frac - cum[idx]) / span
        return bw[idx]["t0"] + u * (bw[idx]["t1"] - bw[idx]["t0"])

    dch = [max(1, len(re.sub(r"\W", "", d))) for d in display]
    dt = sum(dch)
    dcum = np.concatenate([[0.0], np.cumsum(dch)]) / dt
    return [(map_frac(float(dcum[i])), map_frac(float(dcum[i + 1]))) for i in range(len(display))]


def load_config(lines_path: str, cli_fps: int):
    with open(lines_path, encoding="utf-8") as f:
        raw = json.load(f)

    if isinstance(raw, list):
        return {
            "fps": cli_fps,
            "lead": 0.35,
            "gap": 0.30,
            "default_tail": 0.90,
            "chapters": {},
            "tails": {},
            "lines": raw,
        }
    if isinstance(raw, dict) and isinstance(raw.get("lines"), list):
        return {
            "fps": int(raw.get("fps", cli_fps)),
            "lead": float(raw.get("lead", 0.35)),
            "gap": float(raw.get("gap", 0.30)),
            "default_tail": float(raw.get("default_tail", 0.90)),
            "chapters": {str(k): v for k, v in (raw.get("chapters") or {}).items()},
            "tails": {str(k): float(v) for k, v in (raw.get("tails") or {}).items()},
            "lines": raw["lines"],
        }
    sys.exit(f"tts_expressive.py: invalid lines.json format in {lines_path}")


def main() -> None:
    ap = argparse.ArgumentParser(description="Expressive Indonesian/multilingual VO synthesizer with WordBoundary timings.")
    ap.add_argument("project_dir", help="Path to project directory containing voice/lines.json")
    ap.add_argument("--fps", type=int, default=60, help="Target FPS if not set in lines.json (default: 60)")
    ap.add_argument("--voice", default="id-ID-ArdiNeural", help="Default voice if omitted on a line")
    ap.add_argument("--audition-voice", default="", help="Optional second voice to synthesize audition-alt.wav")
    ap.add_argument("--audition-lines", type=int, default=6, help="Number of leading lines for audition-alt.wav")
    args = ap.parse_args()

    proj = os.path.abspath(args.project_dir)
    voice_dir = os.path.join(proj, "voice")
    lines_path = os.path.join(voice_dir, "lines.json")
    if not os.path.isfile(lines_path):
        sys.exit(f"tts_expressive.py: missing {lines_path}")

    cache_dir = os.path.join(voice_dir, ".cache")
    wav_dir = os.path.join(voice_dir, "wav")
    os.makedirs(cache_dir, exist_ok=True)
    os.makedirs(wav_dir, exist_ok=True)

    cfg = load_config(lines_path, args.fps)
    lines = cfg["lines"]
    if not lines:
        sys.exit("tts_expressive.py: lines.json has no entries")

    clips = {}
    for line in lines:
        y, bw = get_clip(line, cache_dir, args.voice)
        sf.write(os.path.join(wav_dir, f"{line['id']}.wav"), y, SR)
        clips[line["id"]] = (y, len(y) / SR, bw)
        print(f"{line['id']} {len(y) / SR:.2f}s  {line['text']}")

    with open(os.path.join(voice_dir, "dur.json"), "w", encoding="utf-8") as f:
        json.dump({k: round(v[1], 3) for k, v in clips.items()}, f, indent=1, ensure_ascii=False)

    shot_ids = sorted({int(line.get("shot", 1)) for line in lines})
    shots = {}
    placements = []
    clauses = []
    cur = 0.0

    for sid in shot_ids:
        ls = [line for line in lines if int(line.get("shot", 1)) == sid]
        start = cur
        first_pre = float(ls[0].get("pre", 0.0))
        lead = cfg["lead"] if "pre" not in ls[0] else 0.0
        t = start + first_pre + lead
        chapter = ls[0].get("chapter") or cfg["chapters"].get(str(sid)) or f"SHOT {sid:02d}"

        for k, line in enumerate(ls):
            if k > 0:
                t += float(line.get("gap", cfg["gap"]))
            _, dur, bw = clips[line["id"]]
            placements.append({
                "id": line["id"],
                "shot": sid,
                "start": round(t, 3),
                "dur": round(dur, 3),
                "end": round(t + dur, 3),
            })
            disp = line["text"].split()
            times = align_words(disp, bw, dur)
            kws = {norm_word(x) for x in line.get("keywords", [])}
            words = [
                {"w": d, "t0": round(t + a, 3), "t1": round(t + b, 3), "kw": norm_word(d) in kws}
                for d, (a, b) in zip(disp, times)
            ]
            clauses.append({
                "id": line["id"],
                "shot": sid,
                "chapter": chapter,
                "t0": round(t - 0.04, 3),
                "t1": round(t + dur + 0.25, 3),
                "text": line["text"],
                "words": words,
            })
            t += dur

        tail = cfg["tails"].get(str(sid), cfg["default_tail"])
        if "tail" in ls[-1]:
            tail = float(ls[-1]["tail"])
        end = round(t + tail, 3)
        shots[sid] = {"shot": sid, "start": round(start, 3), "end": end, "dur": round(end - start, 3), "chapter": chapter}
        cur = end

    for a, b in zip(clauses, clauses[1:]):
        a["t1"] = round(min(a["t1"], b["t0"] - 0.03), 3)

    total = round(cur, 2)
    sched = {"fps": cfg["fps"], "total": total, "shots": [shots[i] for i in shot_ids], "voice": placements}

    with open(os.path.join(voice_dir, "schedule.json"), "w", encoding="utf-8") as f:
        json.dump(sched, f, indent=1, ensure_ascii=False)
    with open(os.path.join(voice_dir, "words.json"), "w", encoding="utf-8") as f:
        json.dump(clauses, f, indent=1, ensure_ascii=False)
    with open(os.path.join(voice_dir, "cues.json"), "w", encoding="utf-8") as f:
        json.dump([{"t0": max(0.0, c["t0"] + 0.04), "t1": c["t1"], "text": c["text"]} for c in clauses], f, indent=1, ensure_ascii=False)

    # Render complete scheduled audition.wav for immediate Human Audio QA before animation coding
    audition_buf = np.zeros(max(1, int(round(total * SR))), dtype="float32")
    for p in placements:
        y = clips[p["id"]][0]
        i0 = int(round(p["start"] * SR))
        i1 = min(len(audition_buf), i0 + len(y))
        if i1 > i0:
            audition_buf[i0:i1] += y[: i1 - i0]
    peak = float(np.abs(audition_buf).max()) if len(audition_buf) else 0.0
    if peak > 0.95:
        audition_buf = audition_buf * (0.90 / peak)
    sf.write(os.path.join(voice_dir, "audition.wav"), audition_buf, SR)

    if args.audition_voice:
        parts = []
        for line in lines[: max(1, args.audition_lines)]:
            y, _ = get_clip(line, cache_dir, args.voice, voice_override=args.audition_voice)
            parts.extend([y, np.zeros(int(0.35 * SR), dtype="float32")])
        sf.write(os.path.join(voice_dir, "audition-alt.wav"), np.concatenate(parts), SR)

    print(f"TOTAL {total}s ({len(shot_ids)} shots) -> voice/audition.wav ready")


if __name__ == "__main__":
    main()
