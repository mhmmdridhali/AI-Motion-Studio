"""Expressive Indonesian VO with exact word timings (edge-tts WordBoundary).
Run: lemo-opuscar/.venv/Scripts/python.exe projects/01-sipelita-explainer/scripts/tts_expressive.py
Writes voice/wav/<id>.wav, dur.json, schedule.json, words.json, cues.json, audition-gadis.wav
"""
import asyncio, hashlib, io, json, os, re, subprocess, sys
import numpy as np, soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.abspath(os.path.join(HERE, ".."))
VOICE = os.path.join(PROJ, "voice")
CACHE = os.path.join(VOICE, ".cache")
WAV = os.path.join(VOICE, "wav")
SR = 24000
FPS = 60
CHAPTERS = {1: "01 · KENDALA LAMA", 2: "02 · INOVASI LAYANAN", 3: "03 · SATU PINTU TERPADU",
            4: "04 · LACAK DAN PERBAIKI", 5: "05 · BUKTI NYATA", 6: "06 · SUARA OPERATOR", 7: "07 · SI-PELITA"}
# silence after each shot's last line before the shot ends (visual breathing)
TAIL = {1: 0.55, 2: 0.45, 3: 1.4, 4: 1.2, 5: 0.9, 6: 1.1, 7: 3.0}
LEAD = 0.35          # shot start -> first voice (shots without a pre-silence)
GAP = 0.30           # between clips inside a shot


async def synth(say, voice, rate, pitch, mp3, jsn):
    import edge_tts
    for attempt in range(3):
        try:
            com = edge_tts.Communicate(say, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
            audio = bytearray(); words = []
            async for ch in com.stream():
                if ch["type"] == "audio":
                    audio += ch["data"]
                elif ch["type"] == "WordBoundary":
                    words.append({"w": ch["text"], "t0": ch["offset"] / 1e7, "t1": (ch["offset"] + ch["duration"]) / 1e7})
            if not audio:
                raise RuntimeError("empty audio")
            open(mp3, "wb").write(audio)
            json.dump(words, open(jsn, "w", encoding="utf-8"), ensure_ascii=False)
            return
        except Exception as e:
            err = e
            await asyncio.sleep(1.5 * (attempt + 1))
    raise err


def decode(mp3):
    r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", mp3, "-ar", str(SR), "-ac", "1", "-f", "wav", "-"],
                       capture_output=True, check=True)
    a, sr = sf.read(io.BytesIO(r.stdout), dtype="float32")
    return a


def get_clip(L, voice=None):
    voice = voice or L["voice"]
    key = hashlib.sha1(json.dumps([voice, L["rate"], L["pitch"], L["say"]], ensure_ascii=False).encode()).hexdigest()[:16]
    mp3, jsn = os.path.join(CACHE, key + ".mp3"), os.path.join(CACHE, key + ".json")
    if not (os.path.exists(mp3) and os.path.exists(jsn)):
        asyncio.run(synth(L["say"], voice, L["rate"], L["pitch"], mp3, jsn))
    y = decode(mp3)
    bw = json.load(open(jsn, encoding="utf-8"))
    nz = np.where(np.abs(y) > np.abs(y).max() * 0.02)[0]
    s0 = max(0, nz[0] - int(0.03 * SR)); s1 = nz[-1] + int(0.10 * SR)
    y = y[s0:s1]
    off = s0 / SR
    for w in bw:
        w["t0"] = max(0.0, w["t0"] - off); w["t1"] = max(w["t0"] + 0.04, w["t1"] - off)
    return y, bw


def norm(w):
    return re.sub(r"[^\w%]", "", w.lower())


def align(display, bw, dur):
    """Map display words to times: char-weighted fraction through the piecewise timeline of spoken words."""
    if not bw:
        n = len(display); return [(dur * i / n, dur * (i + 1) / n) for i in range(n)]
    ch = [max(1, len(re.sub(r"\W", "", b["w"]))) for b in bw]
    tot = sum(ch); cum = np.concatenate([[0], np.cumsum(ch)]) / tot

    def F(frac):
        frac = min(max(frac, 0), 1)
        i = min(np.searchsorted(cum, frac, side="right") - 1, len(bw) - 1)
        span = cum[i + 1] - cum[i] or 1
        u = (frac - cum[i]) / span
        return bw[i]["t0"] + u * (bw[i]["t1"] - bw[i]["t0"])
    dch = [max(1, len(re.sub(r"\W", "", d))) for d in display]
    dt = sum(dch); c = np.concatenate([[0], np.cumsum(dch)]) / dt
    return [(F(c[i]), F(c[i + 1])) for i in range(len(display))]


def main():
    os.makedirs(CACHE, exist_ok=True); os.makedirs(WAV, exist_ok=True)
    lines = json.load(open(os.path.join(VOICE, "lines.json"), encoding="utf-8"))
    clips = {}
    for L in lines:
        y, bw = get_clip(L)
        sf.write(os.path.join(WAV, L["id"] + ".wav"), y, SR)
        clips[L["id"]] = (len(y) / SR, bw)
        print(L["id"], round(len(y) / SR, 2), L["text"])
    json.dump({k: round(v[0], 3) for k, v in clips.items()}, open(os.path.join(VOICE, "dur.json"), "w"), indent=1)

    shots = {}; cur = 0.0; placements = []; clauses = []
    for s in range(1, 8):
        ls = [L for L in lines if L["shot"] == s]
        start = cur
        t = start + (ls[0].get("pre", 0) + (0 if s == 1 else 0) if s > 1 else 0)
        t = start + ls[0].get("pre", 0) + (LEAD if "pre" not in ls[0] else 0.0)
        for k, L in enumerate(ls):
            if k > 0:
                t += GAP
            dur, bw = clips[L["id"]]
            placements.append({"id": L["id"], "shot": s, "start": round(t, 3), "dur": round(dur, 3), "end": round(t + dur, 3)})
            disp = L["text"].split()
            times = align(disp, bw, dur)
            kws = {norm(x) for x in L.get("keywords", [])}
            words = [{"w": d, "t0": round(t + a, 3), "t1": round(t + b, 3), "kw": norm(d) in kws} for d, (a, b) in zip(disp, times)]
            clauses.append({"id": L["id"], "shot": s, "chapter": CHAPTERS[s], "t0": round(t - 0.04, 3),
                            "t1": round(t + dur + 0.25, 3), "text": L["text"], "words": words})
            t += dur
        end = round(t + TAIL[s], 3)
        shots[s] = {"shot": s, "start": round(start, 3), "end": end, "dur": round(end - start, 3), "chapter": CHAPTERS[s]}
        cur = end
    # clauses never overlap
    for a, b in zip(clauses, clauses[1:]):
        a["t1"] = round(min(a["t1"], b["t0"] - 0.03), 3)
    total = round(cur, 2)
    sched = {"fps": FPS, "total": total, "shots": [shots[i] for i in range(1, 8)], "voice": placements}
    json.dump(sched, open(os.path.join(VOICE, "schedule.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    json.dump(clauses, open(os.path.join(VOICE, "words.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    json.dump([{"t0": c["t0"] + 0.04, "t1": c["t1"], "text": c["text"]} for c in clauses],
              open(os.path.join(VOICE, "cues.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    print("TOTAL", total, "shots", [(s["shot"], s["start"], s["end"]) for s in sched["shots"]])

    # female comparison sample (01a to 02c)
    parts = []
    for L in lines[:7]:
        y, _ = get_clip(L, "id-ID-GadisNeural")
        parts += [y, np.zeros(int(0.3 * SR), dtype="float32")]
        if L["id"] == "01d":
            parts.append(np.zeros(int(0.5 * SR), dtype="float32"))
    sf.write(os.path.join(VOICE, "audition-gadis.wav"), np.concatenate(parts), SR)


if __name__ == "__main__":
    main()
