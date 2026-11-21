/**
 * Reusable Interactive Live Preview Player for Mode B (Lemo-Opuscar) films.
 *
 * Drives a deterministic `window.render(t)` page inside a scaled preview frame,
 * synchronized with `out/mix.wav` or `voice/audition.wav`, shot jump markers from
 * `voice/schedule.json`, play/pause, scrubber, +/-1 frame step, speed & reload.
 *
 * Usage:
 *   node .agents/skills/motion-studio-workflow/scripts/lemo-preview.mjs <project_dir> [--port 3020] [--audio out/mix.wav]
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = path.resolve(SCRIPT_DIR, '../../../..');
const LEMO_ROOT = path.join(WORKSPACE_ROOT, 'lemo-opuscar');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.cjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.hdr': 'application/octet-stream',
  '.bin': 'application/octet-stream',
  '.gltf': 'model/gltf+json',
  '.glb': 'model/gltf-binary',
  '.wasm': 'application/wasm',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8',
};

function resolveSafe(baseDir, relUrlPath) {
  let clean;
  try {
    clean = decodeURIComponent(relUrlPath.split('?')[0].split('#')[0]);
  } catch {
    return { status: 400 };
  }
  if (clean.includes('\0')) return { status: 400 };
  const target = path.resolve(baseDir, '.' + path.sep + clean.replace(/^\/+/, ''));
  if (target !== baseDir && !target.startsWith(baseDir + path.sep)) {
    return { status: 403 };
  }
  return { path: target };
}

function serveFile(req, res, filePath) {
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';
    const range = req.headers.range;

    if (range) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!m) {
        res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` });
        res.end();
        return;
      }
      const start = m[1] ? parseInt(m[1], 10) : 0;
      const end = m[2] ? Math.min(parseInt(m[2], 10), stat.size - 1) : stat.size - 1;
      if (start > end || start >= stat.size) {
        res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` });
        res.end();
        return;
      }
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Content-Type': contentType,
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
      return;
    }

    res.writeHead(200, {
      'Accept-Ranges': 'bytes',
      'Content-Length': stat.size,
      'Content-Type': contentType,
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

function playerHtml(meta) {
  const safeMeta = JSON.stringify(meta);
  const audioLabel = meta.audioLabel || '';
  let audioBadgeClass = 'badge-err';
  let audioBadgeText = '&#9888; Audio: none';
  if (audioLabel.includes('mix')) {
    audioBadgeClass = 'badge-ok';
    audioBadgeText = `Audio: ${audioLabel} (VO+BGM+SFX)`;
  } else if (audioLabel) {
    audioBadgeClass = 'badge-warn';
    audioBadgeText = `&#9888; Audio: ${audioLabel} (VO ONLY — belum ada BGM/SFX)`;
  }
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Live Preview — ${meta.projectName}</title>
<style>
  :root {
    --bg: #0f1115;
    --panel: #171a21;
    --border: #262b36;
    --text: #e8ecf4;
    --muted: #939bb0;
    --accent: #10b981;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    height: 100vh;
    display: grid;
    grid-template-rows: auto 1fr auto;
    background: var(--bg);
    color: var(--text);
    font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    overflow: hidden;
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 16px;
    background: var(--panel);
    border-bottom: 1px solid var(--border);
    font-size: 13px;
  }
  header .title { font-weight: 600; display: flex; align-items: center; gap: 10px; }
  header .badge, header .badge-ok, header .badge-warn, header .badge-err {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 999px;
  }
  header .badge, header .badge-ok {
    background: rgba(16,185,129,0.14);
    color: #6ee7b7;
    border: 1px solid rgba(16,185,129,0.35);
  }
  header .badge-warn {
    background: rgba(245,158,11,0.16);
    color: #fcd34d;
    border: 1px solid rgba(245,158,11,0.45);
  }
  header .badge-err {
    background: rgba(239,68,68,0.16);
    color: #fca5a5;
    border: 1px solid rgba(239,68,68,0.45);
  }
  a.nav-pill {
    font-size: 11px;
    padding: 3px 9px;
    border-radius: 6px;
    background: #222733;
    color: var(--text);
    border: 1px solid var(--border);
    text-decoration: none;
  }
  a.nav-pill:hover { border-color: var(--accent); }
  header .shots { display: flex; gap: 6px; flex-wrap: wrap; }
  header .shots button {
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 6px;
    background: #202531;
    color: var(--muted);
    border: 1px solid var(--border);
    cursor: pointer;
  }
  header .shots button.active {
    color: #fff;
    border-color: var(--accent);
    background: rgba(16,185,129,0.2);
  }
  main {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    overflow: hidden;
  }
  #stageWrap {
    position: relative;
    box-shadow: 0 20px 60px rgba(0,0,0,0.55);
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
    background: #000;
  }
  #filmFrame {
    position: absolute;
    top: 0;
    left: 0;
    border: 0;
    transform-origin: top left;
    pointer-events: none;
  }
  #statusBanner {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(15,17,21,0.85);
    font-size: 14px;
    color: var(--muted);
  }
  footer {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px 16px 12px;
    background: var(--panel);
    border-top: 1px solid var(--border);
  }
  .scrubber-row { display: flex; align-items: center; gap: 12px; }
  input[type="range"] { flex: 1; accent-color: var(--accent); cursor: pointer; }
  .timecode { font-variant-numeric: tabular-nums; font-size: 12px; color: var(--muted); min-width: 190px; text-align: right; }
  .controls-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
  .btn-group { display: flex; align-items: center; gap: 6px; }
  button.ctrl {
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: #222733;
    color: var(--text);
    font-size: 12px;
    cursor: pointer;
  }
  button.ctrl.primary { background: var(--accent); border-color: var(--accent); color: #062118; font-weight: 600; }
  select.ctrl {
    padding: 5px 8px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: #222733;
    color: var(--text);
    font-size: 12px;
  }
  .hint { font-size: 11px; color: var(--muted); }
</style>
</head>
<body>
<header>
  <div class="title">
    <span>Lemo-Opuscar Live Preview</span>
    <span class="badge">${meta.projectName}</span>
    <span class="${audioBadgeClass}">${audioBadgeText}</span>
    <a class="nav-pill" href="/audition">Audio Audition</a>
    <span id="dimLabel" class="hint">Loading...</span>
  </div>
  <div id="shotButtons" class="shots"></div>
</header>
<main id="viewport">
  <div id="stageWrap">
    <iframe id="filmFrame" src="/@film/index.html"></iframe>
    <div id="statusBanner">Menunggu window.READY dari film...</div>
  </div>
</main>
<footer>
  <div class="scrubber-row">
    <input id="scrubber" type="range" min="0" max="1" step="0.001" value="0" />
    <div id="timecode" class="timecode">00:00.00 / 00:00.00 · f 0</div>
  </div>
  <div class="controls-row">
    <div class="btn-group">
      <button id="playBtn" class="ctrl primary">Play (Space)</button>
      <button id="prevFrameBtn" class="ctrl">-1f (←)</button>
      <button id="nextFrameBtn" class="ctrl">+1f (→)</button>
      <select id="speedSel" class="ctrl">
        <option value="0.5">0.5x</option>
        <option value="1" selected>1.0x</option>
        <option value="1.5">1.5x</option>
      </select>
      <button id="muteBtn" class="ctrl">Audio: ${meta.audioUrl ? 'ON' : 'None'}</button>
      <button id="reloadBtn" class="ctrl">Reload (R)</button>
    </div>
    <div class="hint">${meta.audioUrl ? 'Audio: ' + meta.audioLabel : 'Tanpa audio (render audition.wav / mix.wav untuk sinkronisasi suara)'}</div>
  </div>
</footer>
<audio id="audioEl" preload="auto"></audio>
<script>
const META = ${safeMeta};
const frame = document.getElementById('filmFrame');
const stageWrap = document.getElementById('stageWrap');
const viewport = document.getElementById('viewport');
const statusBanner = document.getElementById('statusBanner');
const scrubber = document.getElementById('scrubber');
const timecode = document.getElementById('timecode');
const playBtn = document.getElementById('playBtn');
const prevFrameBtn = document.getElementById('prevFrameBtn');
const nextFrameBtn = document.getElementById('nextFrameBtn');
const speedSel = document.getElementById('speedSel');
const muteBtn = document.getElementById('muteBtn');
const reloadBtn = document.getElementById('reloadBtn');
const dimLabel = document.getElementById('dimLabel');
const shotButtons = document.getElementById('shotButtons');
const audioEl = document.getElementById('audioEl');

let fw = 1920, fh = 1080, fps = 60, dur = 1;
let curT = 0, playing = false, rafId = 0, lastTs = 0, speed = 1;
let hasAudio = Boolean(META.audioUrl), muted = false;
let schedule = null;

if (hasAudio) {
  audioEl.src = META.audioUrl;
}

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = (sec % 60).toFixed(2).padStart(5, '0');
  return String(m).padStart(2, '0') + ':' + s;
}

function layoutStage() {
  const pad = 32;
  const availW = Math.max(100, viewport.clientWidth - pad);
  const availH = Math.max(100, viewport.clientHeight - pad);
  const scale = Math.min(availW / fw, availH / fh);
  stageWrap.style.width = Math.round(fw * scale) + 'px';
  stageWrap.style.height = Math.round(fh * scale) + 'px';
  frame.style.width = fw + 'px';
  frame.style.height = fh + 'px';
  frame.style.transform = 'scale(' + scale + ')';
}

function drawAt(t) {
  curT = Math.max(0, Math.min(dur, t));
  const win = frame.contentWindow;
  if (win && win.READY && typeof win.render === 'function') {
    win.render(curT);
  }
  scrubber.value = String(curT);
  const fIdx = Math.round(curT * fps);
  timecode.textContent = fmt(curT) + ' / ' + fmt(dur) + ' · f ' + fIdx;
  if (schedule && Array.isArray(schedule.shots)) {
    const btns = shotButtons.querySelectorAll('button');
    schedule.shots.forEach((s, idx) => {
      const on = curT >= s.start && curT < s.end;
      if (btns[idx]) btns[idx].classList.toggle('active', on);
    });
  }
}

function stopPlayback() {
  playing = false;
  cancelAnimationFrame(rafId);
  if (hasAudio && !audioEl.paused) audioEl.pause();
  playBtn.textContent = 'Play (Space)';
}

function startPlayback() {
  if (curT >= dur - 0.01) curT = 0;
  playing = true;
  playBtn.textContent = 'Pause (Space)';
  lastTs = performance.now();
  if (hasAudio && !muted) {
    audioEl.playbackRate = speed;
    audioEl.currentTime = curT;
    audioEl.play().catch(() => {});
  }
  const tick = (now) => {
    if (!playing) return;
    let nextT;
    if (hasAudio && !muted && !audioEl.paused && !audioEl.ended) {
      nextT = audioEl.currentTime;
    } else {
      const dt = (now - lastTs) / 1000;
      nextT = curT + dt * speed;
    }
    lastTs = now;
    if (nextT >= dur) {
      drawAt(dur);
      stopPlayback();
      return;
    }
    drawAt(nextT);
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
}

function initFilm() {
  const win = frame.contentWindow;
  const doc = frame.contentDocument;
  if (!win || !win.READY || typeof win.render !== 'function') {
    setTimeout(initFilm, 80);
    return;
  }
  const canvas = doc ? doc.querySelector('canvas') : null;
  if (canvas && canvas.width && canvas.height) {
    fw = canvas.width;
    fh = canvas.height;
  }
  dur = Number(win.DUR) > 0 ? Number(win.DUR) : 1;
  scrubber.max = String(dur);
  scrubber.step = String((1 / fps).toFixed(4));
  dimLabel.textContent = fw + '×' + fh + ' · ' + fps + ' fps · ' + dur.toFixed(2) + 's';
  statusBanner.style.display = 'none';
  layoutStage();
  drawAt(curT);
}

async function loadSchedule() {
  if (!META.scheduleUrl) return;
  try {
    const r = await fetch(META.scheduleUrl);
    if (!r.ok) return;
    schedule = await r.json();
    if (schedule.fps) fps = Number(schedule.fps) || 60;
    shotButtons.innerHTML = '';
    (schedule.shots || []).forEach((s) => {
      const b = document.createElement('button');
      b.textContent = 'S' + s.shot + ' (' + s.start.toFixed(1) + 's)';
      b.title = s.chapter || ('Shot ' + s.shot);
      b.onclick = () => {
        const wasPlaying = playing;
        stopPlayback();
        drawAt(s.start);
        if (wasPlaying) startPlayback();
      };
      shotButtons.appendChild(b);
    });
  } catch {}
}

playBtn.onclick = () => (playing ? stopPlayback() : startPlayback());
prevFrameBtn.onclick = () => { stopPlayback(); drawAt(curT - 1 / fps); };
nextFrameBtn.onclick = () => { stopPlayback(); drawAt(curT + 1 / fps); };
speedSel.onchange = () => {
  speed = Number(speedSel.value) || 1;
  if (hasAudio) audioEl.playbackRate = speed;
};
muteBtn.onclick = () => {
  if (!hasAudio) return;
  muted = !muted;
  audioEl.muted = muted;
  muteBtn.textContent = muted ? 'Audio: MUTED' : 'Audio: ON';
};
reloadBtn.onclick = () => {
  stopPlayback();
  statusBanner.style.display = 'flex';
  frame.src = '/@film/index.html?v=' + Date.now();
};
scrubber.oninput = () => {
  stopPlayback();
  const t = Number(scrubber.value);
  if (hasAudio) audioEl.currentTime = t;
  drawAt(t);
};

window.addEventListener('resize', layoutStage);
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') { e.preventDefault(); playBtn.click(); }
  else if (e.code === 'ArrowLeft') { e.preventDefault(); prevFrameBtn.click(); }
  else if (e.code === 'ArrowRight') { e.preventDefault(); nextFrameBtn.click(); }
  else if (e.key === 'r' || e.key === 'R') { reloadBtn.click(); }
  else if ((e.key === 'm' || e.key === 'M') && hasAudio) { muteBtn.click(); }
});

frame.addEventListener('load', () => setTimeout(initFilm, 30));
loadSchedule();
layoutStage();
</script>
</body>
</html>`;
}

function auditionHtml(meta) {
  const safeMeta = JSON.stringify(meta);
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Audio Audition — ${meta.projectName}</title>
<style>
  :root {
    --bg: #0f1115;
    --panel: #171a21;
    --card: #1d222c;
    --border: #262b36;
    --text: #e8ecf4;
    --muted: #939bb0;
    --accent: #10b981;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    height: 100vh;
    display: grid;
    grid-template-rows: auto 1fr auto;
    background: var(--bg);
    color: var(--text);
    font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 18px;
    background: var(--panel);
    border-bottom: 1px solid var(--border);
    flex-wrap: wrap;
  }
  .title { font-weight: 600; display: flex; align-items: center; gap: 10px; font-size: 14px; }
  .badge {
    font-size: 11px; padding: 2px 8px; border-radius: 999px;
    background: rgba(16,185,129,0.14); color: #6ee7b7; border: 1px solid rgba(16,185,129,0.35);
  }
  .tracks { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
  button.ctrl, a.nav-pill {
    padding: 6px 11px; border-radius: 6px; border: 1px solid var(--border);
    background: #222733; color: var(--text); font-size: 12px; cursor: pointer; text-decoration: none;
  }
  button.ctrl.primary, button.ctrl.active {
    background: var(--accent); border-color: var(--accent); color: #062118; font-weight: 600;
  }
  select.ctrl {
    padding: 5px 8px; border-radius: 6px; border: 1px solid var(--border);
    background: #222733; color: var(--text); font-size: 12px;
  }
  main { overflow-y: auto; padding: 18px; max-width: 860px; width: 100%; margin: 0 auto; }
  .line-card {
    display: grid; grid-template-columns: 110px 1fr; gap: 12px;
    padding: 12px 14px; margin-bottom: 8px; border-radius: 8px;
    background: var(--card); border: 1px solid var(--border);
    cursor: pointer; transition: border-color 0.12s, background 0.12s;
  }
  .line-card:hover { border-color: #3f485b; }
  .line-card.active {
    border-color: var(--accent);
    background: rgba(16,185,129,0.12);
  }
  .meta-col { font-size: 11px; color: var(--muted); font-variant-numeric: tabular-nums; line-height: 1.5; }
  .meta-col strong { color: var(--text); display: block; font-size: 12px; }
  .text-col { font-size: 14px; line-height: 1.5; }
  .say-note { font-size: 12px; color: #93c5fd; margin-top: 4px; font-family: ui-monospace, monospace; }
  footer {
    padding: 12px 18px; background: var(--panel); border-top: 1px solid var(--border);
    display: flex; flex-direction: column; gap: 8px;
  }
  .scrubber-row { display: flex; align-items: center; gap: 12px; }
  input[type="range"] { flex: 1; accent-color: var(--accent); cursor: pointer; }
  .timecode { font-variant-numeric: tabular-nums; font-size: 12px; color: var(--muted); min-width: 140px; text-align: right; }
  .controls-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
  .hint { font-size: 11px; color: var(--muted); }
</style>
</head>
<body>
<header>
  <div class="title">
    <span>Audio Audition Studio</span>
    <span class="badge">${meta.projectName}</span>
    ${meta.hasIndex ? '<a class="nav-pill" href="/">Live Preview</a>' : ''}
  </div>
  <div id="trackButtons" class="tracks"></div>
</header>
<main id="transcriptList">
  <div class="hint">Memuat jadwal naskah & audio...</div>
</main>
<footer>
  <div class="scrubber-row">
    <input id="scrubber" type="range" min="0" max="1" step="0.01" value="0" />
    <div id="timecode" class="timecode">00:00.00 / 00:00.00</div>
  </div>
  <div class="controls-row">
    <div style="display:flex;gap:6px;align-items:center;">
      <button id="playBtn" class="ctrl primary">Play (Space)</button>
      <select id="speedSel" class="ctrl">
        <option value="0.75">0.75x</option>
        <option value="1" selected>1.0x</option>
        <option value="1.25">1.25x</option>
      </select>
      <button id="reloadBtn" class="ctrl">Reload (R)</button>
    </div>
    <div id="trackInfo" class="hint">Klik baris mana saja untuk lompat & putar ulang kalimat tersebut</div>
  </div>
</footer>
<audio id="audioEl" preload="auto"></audio>
<script>
const META = ${safeMeta};
const audioEl = document.getElementById('audioEl');
const trackButtons = document.getElementById('trackButtons');
const transcriptList = document.getElementById('transcriptList');
const scrubber = document.getElementById('scrubber');
const timecode = document.getElementById('timecode');
const playBtn = document.getElementById('playBtn');
const speedSel = document.getElementById('speedSel');
const reloadBtn = document.getElementById('reloadBtn');
const trackInfo = document.getElementById('trackInfo');

let items = [];
let dur = 1;
let rafId = 0;

function fmt(sec) {
  const s = Math.max(0, Number(sec) || 0);
  const m = Math.floor(s / 60);
  return String(m).padStart(2, '0') + ':' + (s % 60).toFixed(2).padStart(5, '0');
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

function updateUi() {
  const cur = audioEl.currentTime || 0;
  scrubber.value = String(cur);
  timecode.textContent = fmt(cur) + ' / ' + fmt(dur);
  const cards = transcriptList.querySelectorAll('.line-card');
  items.forEach((it, idx) => {
    const active = cur >= it.start && cur < it.end + 0.05;
    if (cards[idx]) cards[idx].classList.toggle('active', active);
  });
}

function tick() {
  updateUi();
  if (!audioEl.paused && !audioEl.ended) {
    rafId = requestAnimationFrame(tick);
  }
}

function selectTrack(track, btn) {
  const wasPlaying = !audioEl.paused;
  const keepT = audioEl.currentTime || 0;
  for (const b of trackButtons.querySelectorAll('button')) b.classList.remove('active');
  if (btn) btn.classList.add('active');
  audioEl.src = track.url + '?v=' + Date.now();
  trackInfo.textContent = 'Track aktif: ' + track.rel + ' — klik baris untuk lompat & putar';
  audioEl.addEventListener('loadedmetadata', () => {
    dur = audioEl.duration || dur;
    scrubber.max = String(dur);
    audioEl.currentTime = Math.min(keepT, dur);
    audioEl.playbackRate = parseFloat(speedSel.value) || 1;
    updateUi();
    if (wasPlaying) audioEl.play().catch(() => {});
  }, { once: true });
}

if (META.tracks && META.tracks.length) {
  META.tracks.forEach((tr, i) => {
    const btn = document.createElement('button');
    btn.className = 'ctrl';
    btn.textContent = tr.label;
    btn.onclick = () => selectTrack(tr, btn);
    trackButtons.appendChild(btn);
    if (i === 0) selectTrack(tr, btn);
  });
} else {
  trackButtons.innerHTML = '<span class="hint">Belum ada file audio</span>';
}

async function loadData() {
  try {
    const [sched, rawLines] = await Promise.all([
      META.scheduleUrl ? fetch(META.scheduleUrl + '?v=' + Date.now()).then(r => r.json()) : Promise.resolve(null),
      META.linesUrl ? fetch(META.linesUrl + '?v=' + Date.now()).then(r => r.json()) : Promise.resolve(null),
    ]);
    const lineList = Array.isArray(rawLines) ? rawLines : (rawLines && rawLines.lines ? rawLines.lines : []);
    const lineMap = new Map(lineList.map(l => [l.id, l]));
    const placements = (sched && sched.voice) || [];
    if (sched && sched.total) {
      dur = sched.total;
      scrubber.max = String(dur);
    }
    if (!placements.length && !lineList.length) {
      transcriptList.innerHTML = '<div class="hint">voice/schedule.json tidak ditemukan.</div>';
      return;
    }
    items = placements.length
      ? placements.map(p => {
          const l = lineMap.get(p.id) || {};
          return { id: p.id, shot: p.shot, start: p.start, end: p.end, text: l.text || '', say: l.say || '' };
        })
      : lineList.map((l, idx) => ({ id: l.id || String(idx+1), shot: l.shot || 1, start: 0, end: 0, text: l.text || '', say: l.say || '' }));

    transcriptList.innerHTML = items.map((it, idx) => {
      const showSay = it.say && it.say !== it.text;
      return '<div class="line-card" data-idx="' + idx + '">' +
        '<div class="meta-col"><strong>' + escapeHtml(it.id) + ' · Shot ' + escapeHtml(it.shot) + '</strong>' +
        fmt(it.start) + ' – ' + fmt(it.end) + '</div>' +
        '<div class="text-col"><div>' + escapeHtml(it.text) + '</div>' +
        (showSay ? '<div class="say-note">' + escapeHtml(it.say) + '</div>' : '') +
        '</div></div>';
    }).join('');

    transcriptList.querySelectorAll('.line-card').forEach(el => {
      el.addEventListener('click', () => {
        const it = items[Number(el.dataset.idx)];
        if (!it || !audioEl.src) return;
        audioEl.currentTime = Math.max(0, it.start - 0.05);
        audioEl.playbackRate = parseFloat(speedSel.value) || 1;
        audioEl.play().catch(() => {});
      });
    });
    updateUi();
  } catch (e) {
    transcriptList.innerHTML = '<div class="hint">Gagal memuat naskah: ' + escapeHtml(e.message) + '</div>';
  }
}

playBtn.onclick = () => {
  if (!audioEl.src) return;
  if (audioEl.paused) audioEl.play().catch(() => {});
  else audioEl.pause();
};
audioEl.addEventListener('play', () => {
  playBtn.textContent = 'Pause (Space)';
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(tick);
});
audioEl.addEventListener('pause', () => { playBtn.textContent = 'Play (Space)'; updateUi(); });
audioEl.addEventListener('ended', () => { playBtn.textContent = 'Play (Space)'; updateUi(); });
scrubber.addEventListener('input', () => { audioEl.currentTime = parseFloat(scrubber.value) || 0; updateUi(); });
speedSel.addEventListener('change', () => { audioEl.playbackRate = parseFloat(speedSel.value) || 1; });
reloadBtn.addEventListener('click', () => location.reload());
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') { e.preventDefault(); playBtn.click(); }
  else if (e.key === 'r' || e.key === 'R') { reloadBtn.click(); }
});

loadData();
</script>
</body>
</html>`;
}

export function startPreviewServer(projectDir, { port = 3020, audioRel = '' } = {}) {
  const absProject = path.resolve(projectDir);
  if (!fs.existsSync(LEMO_ROOT)) {
    throw new Error(`lemo-opuscar library not found at ${LEMO_ROOT}`);
  }

  const buildMeta = () => {
    const hasIndex = fs.existsSync(path.join(absProject, 'index.html'));
    const trackDefs = [
      ['out/mix.wav', 'Full Mix (VO+BGM+SFX)'],
      ['voice/audition.wav', 'VO Utama (audition.wav)'],
      ['voice/audition-alt.wav', 'VO Alternatif (audition-alt.wav)'],
    ];
    if (audioRel && !trackDefs.some(([r]) => r === audioRel)) {
      trackDefs.unshift([audioRel, audioRel]);
    }
    const tracks = [];
    for (const [rel, label] of trackDefs) {
      const full = path.resolve(absProject, rel);
      if (fs.existsSync(full) && fs.statSync(full).isFile()) {
        tracks.push({ rel: rel.replace(/\\/g, '/'), url: '/@film/' + rel.replace(/\\/g, '/'), label });
      }
    }
    const detectedAudio = tracks[0] ? tracks[0].rel : null;
    const hasSchedule = fs.existsSync(path.join(absProject, 'voice', 'schedule.json'));
    const hasLines = fs.existsSync(path.join(absProject, 'voice', 'lines.json'));
    return {
      projectName: path.basename(absProject),
      hasIndex,
      audioUrl: detectedAudio ? '/@film/' + detectedAudio : null,
      audioLabel: detectedAudio || '',
      tracks,
      scheduleUrl: hasSchedule ? '/@film/voice/schedule.json' : null,
      linesUrl: hasLines ? '/@film/voice/lines.json' : null,
    };
  };

  const meta = buildMeta();
  if (!meta.hasIndex && meta.tracks.length === 0) {
    throw new Error(`Neither index.html nor audio files found in ${absProject}`);
  }

  const server = http.createServer((req, res) => {
    const host = req.headers.host || '';
    if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('bad host');
      return;
    }

    const reqPath = (req.url || '/').split('?')[0];
    if (reqPath === '/audition') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(auditionHtml(buildMeta()));
      return;
    }
    if (reqPath === '/' || reqPath === '/__player') {
      const curMeta = buildMeta();
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(curMeta.hasIndex ? playerHtml(curMeta) : auditionHtml(curMeta));
      return;
    }

    let resolved;
    if (reqPath.startsWith('/@film/')) {
      resolved = resolveSafe(absProject, reqPath.slice('/@film/'.length));
    } else {
      resolved = resolveSafe(LEMO_ROOT, reqPath);
    }

    if (resolved.status) {
      res.writeHead(resolved.status, { 'Content-Type': 'text/plain' });
      res.end(resolved.status === 403 ? 'forbidden' : 'bad request');
      return;
    }
    serveFile(req, res, resolved.path);
  });

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => {
      resolve({ server, port: server.address().port, meta });
    });
  });
}

// Run CLI only when executed directly
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  let projectDir = '';
  let port = 3020;
  let audioRel = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port' && args[i + 1]) {
      port = parseInt(args[++i], 10);
    } else if (args[i] === '--audio' && args[i + 1]) {
      audioRel = args[++i];
    } else if (!args[i].startsWith('--') && !projectDir) {
      projectDir = args[i];
    }
  }

  if (!projectDir) {
    console.error('Usage: node lemo-preview.mjs <project_dir> [--port 3020] [--audio out/mix.wav]');
    process.exit(2);
  }

  const { port: boundPort, meta } = await startPreviewServer(projectDir, { port, audioRel });
  if (meta.hasIndex) {
    console.log(`Lemo-Opuscar Live Preview: http://127.0.0.1:${boundPort}/`);
  }
  console.log(`Audio Audition: http://127.0.0.1:${boundPort}/audition`);
  console.log(`Project: ${meta.projectName} | Audio: ${meta.audioLabel || 'none'}`);
}
