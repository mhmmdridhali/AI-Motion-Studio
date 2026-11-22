"""Expressive multi-phrase Indonesian/multilingual VO synthesizer.

Primary engine: Gemini TTS (gemini-3.8-flash-tts) + per-shot audio lock (clips cache) + faster-whisper alignment.
Non-destructive --tempo scaling via FFmpeg atempo (preserves pitch & voice feels).
Automatic fallback: edge-tts (WordBoundary) when GEMINI_API_KEY is missing, quota-limited (429), or unreachable.

Usage:
  lemo-opuscar/.venv/Scripts/python.exe .agents/skills/motion-studio-workflow/scripts/tts_expressive.py <project_dir> [options]

Outputs inside `<project_dir>/voice/`:
  wav/<id>.wav, dur.json, schedule.json, words.json, cues.json, audition.wav (+ audition-alt.wav if --audition-voice is set).
"""
import argparse
import asyncio
import base64
from difflib import SequenceMatcher
import hashlib
import io
import json
import os
import re
import subprocess
import sys
import time
import numpy as np
import soundfile as sf

SR = 24000

KNOWN_GEMINI_VOICES = {
    "zephyr", "puck", "charon", "kore", "fenrir", "leda", "orus", "aoede",
    "callirrhoe", "autonoe", "enceladus", "iapetus", "umbriel", "algieba",
    "despina", "erinome", "algenib", "rasalgethi", "laomedeia", "achernar",
    "alnilam", "schedar", "gacrux", "pulcherrima", "achird", "zubenelgenubi",
    "vindemiatrix", "sadachbia", "sadaltager", "sulafat",
}

TAG_RE = re.compile(r"<[^>]+>")


def strip_tags(s: str) -> str:
    return re.sub(r"\s+", " ", TAG_RE.sub(" ", s)).strip()


def norm_word(w: str) -> str:
    return re.sub(r"[^\w%]", "", w.lower())


def load_gemini_api_key(proj_dir: str) -> str:
    candidates = [
        os.path.join(proj_dir, ".env"),
        os.path.join(os.path.abspath(os.path.join(proj_dir, "..", "..")), ".env"),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", ".env")),
        os.path.join(os.getcwd(), ".env"),
    ]
    for env_path in candidates:
        if os.path.isfile(env_path):
            try:
                with open(env_path, encoding="utf-8") as f:
                    for raw in f:
                        line = raw.strip()
                        if not line or line.startswith("#") or "=" not in line:
                            continue
                        k, v = line.split("=", 1)
                        if k.strip() == "GEMINI_API_KEY":
                            val = v.strip().strip('"').strip("'")
                            if val:
                                return val
            except OSError:
                pass
    return os.environ.get("GEMINI_API_KEY", "").strip()


def sanitize_secret(msg: str, secret: str) -> str:
    return msg.replace(secret, "[REDACTED]") if secret else msg


def resolve_gemini_voice(line_voice: str | None, default_voice: str, cli_gemini_voice: str) -> str:
    if cli_gemini_voice:
        return cli_gemini_voice
    cand = (line_voice or default_voice or "").strip()
    low = cand.lower()
    if low in KNOWN_GEMINI_VOICES:
        return cand.capitalize() if cand.islower() else cand
    if any(k in low for k in ("gadis", "female", "woman", "kore", "aoede", "leda")):
        return "Kore"
    return "Orus"


def trim_silence(y: np.ndarray, bw: list[dict], sr: int = SR):
    peak = float(np.abs(y).max()) if len(y) else 0.0
    nz = np.where(np.abs(y) > peak * 0.008)[0]
    if len(nz):
        s0 = max(0, int(nz[0]) - int(0.06 * sr))
        s1 = min(len(y), int(nz[-1]) + int(0.12 * sr))
        y = y[s0:s1]
    else:
        s0 = 0
    ramp = min(int(0.005 * sr), len(y) // 4)
    if ramp > 1:
        y = y.copy()
        y[:ramp] *= np.linspace(0.0, 1.0, ramp, dtype=np.float32)
        y[-ramp:] *= np.linspace(1.0, 0.0, ramp, dtype=np.float32)
    off = s0 / sr
    dur_trim = len(y) / sr
    adj = [
        {
            "w": b["w"],
            "t0": min(dur_trim, max(0.0, b["t0"] - off)),
            "t1": min(dur_trim, max(0.04, b["t1"] - off)),
        }
        for b in bw
    ]
    if len(adj) == 1 and (adj[0]["t1"] - adj[0]["t0"]) < 0.04 and dur_trim > 0.05:
        adj[0]["t0"] = 0.0
        adj[0]["t1"] = dur_trim
    return y, adj


def apply_tempo(y: np.ndarray, bw: list[dict], tempo: float, sr: int = SR):
    """Adjust speaking tempo cleanly with FFmpeg atempo without changing pitch or vocal acting."""
    if abs(tempo - 1.0) < 1e-3 or len(y) == 0:
        return y, bw
    factors = []
    rem = float(tempo)
    while rem < 0.5:
        factors.append(0.5)
        rem /= 0.5
    while rem > 2.0:
        factors.append(2.0)
        rem /= 2.0
    factors.append(rem)
    flt = ",".join(f"atempo={f:.6f}" for f in factors)

    buf = io.BytesIO()
    sf.write(buf, y, sr, format="WAV")
    res = subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", "pipe:0", "-filter:a", flt, "-ar", str(sr), "-ac", "1", "-f", "wav", "-"],
        input=buf.getvalue(),
        capture_output=True,
        check=True,
    )
    y2, _ = sf.read(io.BytesIO(res.stdout), dtype="float32")
    old_dur = len(y) / sr
    new_dur = len(y2) / sr
    ratio = new_dur / max(1e-6, old_dur)
    adj = []
    for b in bw:
        t0 = min(new_dur, max(0.0, b["t0"] * ratio))
        t1 = min(new_dur, max(t0 + 0.02, b["t1"] * ratio))
        adj.append({"w": b["w"], "t0": t0, "t1": t1})
    return y2, adj


def decode_audio_bytes(data: bytes, target_sr: int = SR) -> np.ndarray:
    res = subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", "pipe:0", "-ar", str(target_sr), "-ac", "1", "-f", "wav", "-"],
        input=data,
        capture_output=True,
        check=True,
    )
    samples, _ = sf.read(io.BytesIO(res.stdout), dtype="float32")
    return samples


def decode_mp3(mp3: str) -> np.ndarray:
    res = subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", mp3, "-ar", str(SR), "-ac", "1", "-f", "wav", "-"],
        capture_output=True,
        check=True,
    )
    samples, _ = sf.read(io.BytesIO(res.stdout), dtype="float32")
    return samples


# --- Edge TTS Fallback Path ---

async def synth_edge(say: str, voice: str, rate: str, pitch: str, mp3: str, jsn: str) -> None:
    import edge_tts

    clean_say = strip_tags(say)
    last_err = None
    for attempt in range(3):
        try:
            com = edge_tts.Communicate(clean_say, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
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


def get_edge_clip(line: dict, cache_dir: str, default_voice: str, voice_override: str | None = None):
    voice = voice_override or line.get("voice") or default_voice
    if voice.lower() in KNOWN_GEMINI_VOICES:
        voice = default_voice
    rate = line.get("rate") or "+0%"
    pitch = line.get("pitch") or "+0Hz"
    say = strip_tags(line.get("say") or line["text"])
    key = hashlib.sha1(json.dumps(["edge", voice, rate, pitch, say], ensure_ascii=False).encode("utf-8")).hexdigest()[:16]
    mp3 = os.path.join(cache_dir, key + ".mp3")
    jsn = os.path.join(cache_dir, key + ".json")

    if not (os.path.exists(mp3) and os.path.exists(jsn)):
        asyncio.run(synth_edge(say, voice, rate, pitch, mp3, jsn))

    y = decode_mp3(mp3)
    with open(jsn, encoding="utf-8") as f:
        bw = json.load(f)
    return trim_silence(y, bw)


# --- Gemini TTS Primary Path + faster-whisper Alignment ---

_WHISPER_MODEL = None


def get_whisper_model():
    global _WHISPER_MODEL
    if _WHISPER_MODEL is None:
        from faster_whisper import WhisperModel

        try:
            _WHISPER_MODEL = WhisperModel("tiny", device="cpu", compute_type="int8", local_files_only=True)
        except Exception:
            _WHISPER_MODEL = WhisperModel("tiny", device="cpu", compute_type="int8")
    return _WHISPER_MODEL


def extract_whisper_words(wav_path: str, lang: str) -> list[dict]:
    model = get_whisper_model()
    segments, _ = model.transcribe(wav_path, language=lang or "id", word_timestamps=True)
    words = []
    for seg in segments:
        for w in (seg.words or []):
            txt = w.word.strip()
            if txt:
                words.append({"w": txt, "t0": float(w.start), "t1": float(w.end)})
    return words


def synth_gemini_batch(api_key: str, model: str, voice: str, style: str, transcript: str, wav_path: str) -> np.ndarray:
    from google import genai

    print(f"[gemini] requesting voice={voice} ({len(strip_tags(transcript).split())} words)...", flush=True)
    client = genai.Client(api_key=api_key, http_options={"api_version": "v1beta", "timeout": 60000})
    resp = client.interactions.create(
        model=model,
        input=[
            {
                "type": "user_input",
                "content": [
                    {
                        "type": "text",
                        "text": transcript,
                        "annotations": [
                            {
                                "type": "speech_metadata",
                                "style": style,
                            }
                        ],
                    }
                ],
            }
        ],
        response_format={"type": "audio"},
        generation_config={"speech_config": [{"voice": voice}]},
    )
    audio_obj = getattr(resp, "output_audio", None)
    if not audio_obj or not getattr(audio_obj, "data", None):
        raise RuntimeError("Gemini TTS response missing output_audio")
    raw = audio_obj.data
    audio_bytes = base64.b64decode(raw) if isinstance(raw, str) else bytes(raw)
    y = decode_audio_bytes(audio_bytes, target_sr=SR)
    sf.write(wav_path + ".part", y, SR, format="WAV")
    os.replace(wav_path + ".part", wav_path)
    return y


def quietest_cut_time(y: np.ndarray, t_a: float, t_b: float, sr: int = SR) -> float:
    if t_b <= t_a + 0.04:
        return 0.5 * (t_a + t_b)
    i0 = max(0, int((t_a + 0.02) * sr))
    i1 = min(len(y), int((t_b - 0.02) * sr))
    if i1 <= i0 + 480:
        return 0.5 * (t_a + t_b)
    win = max(240, int(0.02 * sr))
    step = max(120, win // 2)
    if t_b - t_a > 0.65:
        e0 = max(i0, int((t_a + 0.03) * sr))
        e1 = min(i1, int(min(t_b - 0.03, t_a + 0.60) * sr))
        if e1 > e0 + win:
            early_seg = y[e0:e1]
            early_best_pos = e0 + (e1 - e0) // 2
            early_best_rms = float("inf")
            for pos in range(0, max(1, len(early_seg) - win), step):
                rms = float(np.sqrt(np.mean(early_seg[pos : pos + win] ** 2)))
                if rms < early_best_rms:
                    early_best_rms = rms
                    early_best_pos = e0 + pos + win // 2
            if early_best_rms < 0.005:
                return early_best_pos / sr
    seg = y[i0:i1]
    best_pos = (i0 + i1) // 2
    best_rms = float("inf")
    for pos in range(0, max(1, len(seg) - win), step):
        rms = float(np.sqrt(np.mean(seg[pos : pos + win] ** 2)))
        if rms < best_rms:
            best_rms = rms
            best_pos = i0 + pos + win // 2
    return best_pos / sr


def split_batch_clips(y: np.ndarray, batch_lines: list[dict], whisper_words: list[dict]) -> list[tuple[np.ndarray, list[dict]]]:
    n_lines = len(batch_lines)
    if n_lines == 1:
        y_trim, bw_trim = trim_silence(y, whisper_words)
        return [(y_trim, bw_trim)]

    expected_chars = [max(1, len(re.sub(r"\W", "", strip_tags(l.get("say") or l["text"])))) for l in batch_lines]
    tot_exp = sum(expected_chars)

    if len(whisper_words) < n_lines:
        dur = len(y) / SR
        cum = 0
        cuts = [0.0]
        for k in range(n_lines - 1):
            cum += expected_chars[k]
            cuts.append(dur * (cum / tot_exp))
        cuts.append(dur)
        out = []
        for k in range(n_lines):
            s0, s1 = int(cuts[k] * SR), int(cuts[k + 1] * SR)
            out.append(trim_silence(y[s0:s1], []))
        return out

    w_chars = [max(1, len(re.sub(r"\W", "", w["w"]))) for w in whisper_words]
    tot_w = sum(w_chars)
    w_cum = np.cumsum(w_chars) / max(1, tot_w)

    prev_idx = 0
    split_word_idxs = [0]
    exp_acc = 0
    for k in range(n_lines - 1):
        exp_acc += expected_chars[k]
        target_frac = exp_acc / tot_exp
        rem_lines = n_lines - 1 - k
        lo = prev_idx + 1
        hi = len(whisper_words) - rem_lines
        if lo >= hi:
            split_word_idxs.append(lo)
            prev_idx = lo
            continue
        approx = int(np.searchsorted(w_cum[lo : hi + 1], target_frac)) + lo
        w_lo = max(lo, approx - 6)
        w_hi = min(hi, approx + 6)
        prev_tokens = [
            norm_word(w)
            for w in strip_tags(batch_lines[k].get("say") or batch_lines[k]["text"]).split()
            if norm_word(w)
        ]
        next_tokens = [
            norm_word(w)
            for w in strip_tags(batch_lines[k + 1].get("say") or batch_lines[k + 1]["text"]).split()
            if norm_word(w)
        ]
        best_j = approx
        best_score = -1e9
        for j in range(w_lo, w_hi + 1):
            w_prev = norm_word(whisper_words[j - 1]["w"])
            w_next = norm_word(whisper_words[j]["w"])
            sim_prev_single = SequenceMatcher(None, w_prev, prev_tokens[-1]).ratio() if prev_tokens else 0.0
            sim_prev_join = (
                SequenceMatcher(None, norm_word(whisper_words[j - 2]["w"] + whisper_words[j - 1]["w"]), prev_tokens[-1]).ratio()
                if (prev_tokens and j >= 2)
                else 0.0
            )
            sim_prev = max(sim_prev_single, sim_prev_join)
            sim_next_single = SequenceMatcher(None, w_next, next_tokens[0]).ratio() if next_tokens else 0.0
            sim_next_join = (
                SequenceMatcher(None, norm_word(whisper_words[j]["w"] + whisper_words[j + 1]["w"]), next_tokens[0]).ratio()
                if (next_tokens and j + 1 < len(whisper_words))
                else 0.0
            )
            sim_next = max(sim_next_single, sim_next_join)
            if next_tokens and len(next_tokens) > 1:
                n2_idx = (j + 2) if (sim_next_join > sim_next_single and j + 2 < len(whisper_words)) else (j + 1)
                sim_next2 = (
                    SequenceMatcher(None, norm_word(whisper_words[n2_idx]["w"]), next_tokens[1]).ratio()
                    if n2_idx < len(whisper_words)
                    else 0.0
                )
            else:
                sim_next2 = 0.0
            gap = min(1.2, max(0.0, whisper_words[j]["t0"] - whisper_words[j - 1]["t1"]))
            dist_pen = abs(float(w_cum[j - 1]) - target_frac)
            score = 2.2 * sim_next + 1.6 * sim_prev + 0.8 * sim_next2 + 2.2 * gap - 1.5 * dist_pen
            if score > best_score:
                best_score = score
                best_j = j
        split_word_idxs.append(best_j)
        prev_idx = best_j
    split_word_idxs.append(len(whisper_words))

    dur_total = len(y) / SR
    t_bounds = [0.0]
    for j in split_word_idxs[1:-1]:
        t_cut = quietest_cut_time(y, whisper_words[j - 1]["t1"], whisper_words[j]["t0"])
        t_bounds.append(t_cut)
    t_bounds.append(dur_total)

    out = []
    for k in range(n_lines):
        t0, t1 = t_bounds[k], t_bounds[k + 1]
        s0 = max(0, int(round(t0 * SR)))
        s1 = min(len(y), int(round(t1 * SR)))
        chunk_bw = [
            {"w": w["w"], "t0": max(0.0, w["t0"] - t0), "t1": max(0.04, w["t1"] - t0)}
            for w in whisper_words[split_word_idxs[k] : split_word_idxs[k + 1]]
        ]
        out.append(trim_silence(y[s0:s1], chunk_bw))
    return out


def synthesize_with_gemini(lines: list[dict], cfg: dict, args, api_key: str, cache_dir: str) -> tuple[dict, dict]:
    lang = args.lang or cfg.get("lang") or "id"
    default_style = cfg.get("style") or (
        "warm natural conversational narrator, expressive intonation, clear rising inflection on questions, gentle breathing pauses"
    )
    default_gemini_voice = resolve_gemini_voice(
        cfg.get("gemini_voice") or lines[0].get("gemini_voice") or lines[0].get("voice"),
        args.voice,
        args.gemini_voice,
    )
    model = args.gemini_model

    clips_cache_dir = os.path.join(cache_dir, "clips")
    os.makedirs(clips_cache_dir, exist_ok=True)

    clips = {}
    sources = {}
    line_keys = {}
    line_voices = {}
    line_styles = {}
    missing_lines = []

    for line in lines:
        say = (line.get("say") or line["text"]).strip()
        eff_voice = resolve_gemini_voice(
            line.get("gemini_voice") or line.get("voice"),
            default_gemini_voice,
            args.gemini_voice,
        )
        eff_style = (line.get("style") or default_style).strip()
        line_voices[line["id"]] = eff_voice
        line_styles[line["id"]] = eff_style
        line_key = hashlib.sha1(
            json.dumps(["gemini_clip", model, eff_voice, eff_style, lang, say], ensure_ascii=False).encode("utf-8")
        ).hexdigest()[:16]
        line_keys[line["id"]] = line_key
        clip_wav = os.path.join(clips_cache_dir, f"{line_key}.wav")
        clip_jsn = os.path.join(clips_cache_dir, f"{line_key}_words.json")
        if (not args.fresh) and os.path.isfile(clip_wav) and os.path.isfile(clip_jsn):
            ly, _ = sf.read(clip_wav, dtype="float32")
            with open(clip_jsn, encoding="utf-8") as f:
                lbw = json.load(f)
            clips[line["id"]] = (ly, len(ly) / SR, lbw)
            sources[line["id"]] = "cached-clip"
        else:
            missing_lines.append(line)

    if not missing_lines:
        return clips, sources

    # Group uncached/edited lines by (voice, style) and batch <= 250 words per request
    grouped = {}
    for line in missing_lines:
        gk = (line_voices[line["id"]], line_styles[line["id"]])
        grouped.setdefault(gk, []).append(line)

    batches = []
    for (batch_voice, batch_style), group_lines in grouped.items():
        cur_batch = []
        cur_words = 0
        for line in group_lines:
            say = line.get("say") or line["text"]
            wc = len(strip_tags(say).split())
            if cur_batch and (cur_words + wc > 250):
                batches.append((batch_voice, batch_style, cur_batch))
                cur_batch = [line]
                cur_words = wc
            else:
                cur_batch.append(line)
                cur_words += wc
        if cur_batch:
            batches.append((batch_voice, batch_style, cur_batch))

    for bi, (batch_voice, batch_style, batch) in enumerate(batches):
        says = [(l.get("say") or l["text"]).strip() for l in batch]
        transcript = "\n\n<short pause> <short pause>\n\n".join(says)

        key = hashlib.sha1(
            json.dumps(["gemini", model, batch_voice, batch_style, lang, transcript], ensure_ascii=False).encode("utf-8")
        ).hexdigest()[:16]
        wav_path = os.path.join(cache_dir, key + ".wav")
        jsn_path = os.path.join(cache_dir, key + "_whisper.json")

        if (not args.fresh) and os.path.isfile(wav_path) and os.path.isfile(jsn_path):
            y, _ = sf.read(wav_path, dtype="float32")
            with open(jsn_path, encoding="utf-8") as f:
                bw = json.load(f)
            batch_src = "cached-batch"
        else:
            if bi > 0:
                time.sleep(1.5)
            y = synth_gemini_batch(api_key, model, batch_voice, batch_style, transcript, wav_path)
            bw = extract_whisper_words(wav_path, lang)
            with open(jsn_path + ".part", "w", encoding="utf-8") as f:
                json.dump(bw, f, ensure_ascii=False)
            os.replace(jsn_path + ".part", jsn_path)
            batch_src = "new-synth"

        sliced = split_batch_clips(y, batch, bw)
        for line, (ly, lbw) in zip(batch, sliced):
            lk = line_keys[line["id"]]
            clip_wav = os.path.join(clips_cache_dir, f"{lk}.wav")
            clip_jsn = os.path.join(clips_cache_dir, f"{lk}_words.json")
            sf.write(clip_wav + ".part", ly, SR, format="WAV")
            os.replace(clip_wav + ".part", clip_wav)
            with open(clip_jsn + ".part", "w", encoding="utf-8") as f:
                json.dump(lbw, f, ensure_ascii=False)
            os.replace(clip_jsn + ".part", clip_jsn)
            clips[line["id"]] = (ly, len(ly) / SR, lbw)
            sources[line["id"]] = batch_src
    return clips, sources


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
            "engine": "",
            "gemini_voice": "",
            "style": "",
            "lang": "id",
            "tempo": 1.0,
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
            "engine": raw.get("engine", ""),
            "gemini_voice": raw.get("gemini_voice", ""),
            "style": raw.get("style", ""),
            "lang": raw.get("lang", "id"),
            "tempo": float(raw.get("tempo", 1.0)),
            "lines": raw["lines"],
        }
    sys.exit(f"tts_expressive.py: invalid lines.json format in {lines_path}")


def main() -> None:
    ap = argparse.ArgumentParser(description="Expressive VO synthesizer (Gemini TTS primary + Edge TTS fallback).")
    ap.add_argument("project_dir", help="Path to project directory containing voice/lines.json")
    ap.add_argument("--fps", type=int, default=60, help="Target FPS if not set in lines.json (default: 60)")
    ap.add_argument("--voice", default="id-ID-ArdiNeural", help="Default Edge voice or persona hint")
    ap.add_argument("--audition-voice", default="", help="Optional second Edge voice to synthesize audition-alt.wav")
    ap.add_argument("--audition-lines", type=int, default=6, help="Number of leading lines for audition-alt.wav")
    ap.add_argument("--engine", choices=["auto", "gemini", "edge"], default="auto", help="TTS engine (default: auto = Gemini primary, Edge fallback)")
    ap.add_argument("--gemini-model", default="gemini-3.8-flash-tts", help="Gemini TTS model ID")
    ap.add_argument("--gemini-voice", default="", help="Override Gemini voice (e.g. Orus, Kore, Charon, Puck)")
    ap.add_argument("--lang", default="", help="Language code for faster-whisper alignment (default: id)")
    ap.add_argument("--tempo", type=float, default=0.0, help="Non-destructive FFmpeg atempo factor (e.g. 0.90), overrides lines.json tempo")
    ap.add_argument("--reuse-clips", action="store_true", default=True, help="Reuse cached per-line Gemini clips when text/style unchanged (default: on)")
    ap.add_argument("--fresh", action="store_true", help="Ignore clip and batch caches and re-synthesize everything fresh")
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

    engine = args.engine if args.engine != "auto" else (cfg.get("engine") or "auto")
    eff_tempo = float(args.tempo) if args.tempo > 0 else float(cfg.get("tempo", 1.0))
    if eff_tempo <= 0:
        eff_tempo = 1.0

    api_key = load_gemini_api_key(proj)
    clips = None
    sources = {}
    used_engine = "edge"

    if engine in ("auto", "gemini"):
        if not api_key:
            msg = "missing GEMINI_API_KEY in environment or .env"
            if engine == "gemini":
                sys.exit(f"tts_expressive.py: {msg}")
            print(f"tts_expressive.py: {msg}; falling back to edge-tts", file=sys.stderr)
        else:
            try:
                clips, sources = synthesize_with_gemini(lines, cfg, args, api_key, cache_dir)
                used_engine = f"gemini ({args.gemini_model})"
            except Exception as exc:
                safe_err = sanitize_secret(f"{type(exc).__name__}: {exc}", api_key)
                if engine == "gemini":
                    sys.exit(f"tts_expressive.py: Gemini TTS failed ({safe_err})")
                print(f"tts_expressive.py: Gemini TTS unavailable ({safe_err}); falling back to edge-tts", file=sys.stderr)

    if clips is None:
        clips = {}
        for line in lines:
            y, bw = get_edge_clip(line, cache_dir, args.voice)
            clips[line["id"]] = (y, len(y) / SR, bw)
            sources[line["id"]] = "edge"
        used_engine = "edge-tts (fallback)" if engine == "auto" else "edge-tts"

    # Apply non-destructive tempo consistently right before export & alignment
    if abs(eff_tempo - 1.0) >= 1e-3:
        for line in lines:
            y, _, bw = clips[line["id"]]
            y2, bw2 = apply_tempo(y, bw, eff_tempo, SR)
            clips[line["id"]] = (y2, len(y2) / SR, bw2)

    for line in lines:
        y, dur, _ = clips[line["id"]]
        sf.write(os.path.join(wav_dir, f"{line['id']}.wav"), y, SR)
        clean_txt = strip_tags(line["text"])
        tag = f"gemini ({sources.get(line['id'], 'synth')})" if used_engine.startswith("gemini") else used_engine
        print(f"[{tag}] {line['id']} {dur:.2f}s  {clean_txt}")

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
                prev_pause = ls[k - 1].get("pause_after")
                t += float(line["gap"]) if "gap" in line else float(prev_pause if prev_pause is not None else cfg["gap"])
            _, dur, bw = clips[line["id"]]
            placements.append({
                "id": line["id"],
                "shot": sid,
                "start": round(t, 3),
                "dur": round(dur, 3),
                "end": round(t + dur, 3),
            })
            clean_txt = strip_tags(line["text"])
            disp = clean_txt.split()
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
                "text": clean_txt,
                "words": words,
            })
            t += dur

        tail = cfg["tails"].get(str(sid), cfg["default_tail"])
        if "tail" in ls[-1]:
            tail = float(ls[-1]["tail"])
        elif str(sid) not in cfg["tails"] and "pause_after" in ls[-1]:
            tail = float(ls[-1]["pause_after"])
        end = round(t + tail, 3)
        shots[sid] = {"shot": sid, "start": round(start, 3), "end": end, "dur": round(end - start, 3), "chapter": chapter}
        cur = end

    for a, b in zip(clauses, clauses[1:]):
        a["t1"] = round(min(a["t1"], b["t0"] - 0.03), 3)

    total = round(cur, 2)
    sched = {"fps": cfg["fps"], "engine": used_engine, "total": total}
    if abs(eff_tempo - 1.0) >= 1e-3:
        sched["tempo"] = round(eff_tempo, 3)
    sched["shots"] = [shots[i] for i in shot_ids]
    sched["voice"] = placements

    with open(os.path.join(voice_dir, "schedule.json"), "w", encoding="utf-8") as f:
        json.dump(sched, f, indent=1, ensure_ascii=False)
    with open(os.path.join(voice_dir, "words.json"), "w", encoding="utf-8") as f:
        json.dump(clauses, f, indent=1, ensure_ascii=False)
    with open(os.path.join(voice_dir, "cues.json"), "w", encoding="utf-8") as f:
        json.dump([{"t0": max(0.0, c["t0"] + 0.04), "t1": c["t1"], "text": c["text"]} for c in clauses], f, indent=1, ensure_ascii=False)

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
            y, bw_alt = get_edge_clip(line, cache_dir, args.voice, voice_override=args.audition_voice)
            if abs(eff_tempo - 1.0) >= 1e-3:
                y, _ = apply_tempo(y, bw_alt, eff_tempo, SR)
            parts.extend([y, np.zeros(int(0.35 * SR), dtype="float32")])
        sf.write(os.path.join(voice_dir, "audition-alt.wav"), np.concatenate(parts), SR)

    tempo_note = f", tempo={eff_tempo:.2f}x" if abs(eff_tempo - 1.0) >= 1e-3 else ""
    print(f"TOTAL {total}s ({len(shot_ids)} shots, engine={used_engine}{tempo_note}) -> voice/audition.wav ready")


if __name__ == "__main__":
    main()
