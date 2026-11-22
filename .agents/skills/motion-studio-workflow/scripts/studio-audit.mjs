/**
 * Unified Playwright Studio Auditor & Sheet Generator (Track 1 Canvas/WebGL & Track 2 DOM/GSAP).
 *
 * Performs network/asset hygiene checks (404 fonts/images, external CDNs), Frame 0 non-empty check,
 * DOM vertical safe-zone (9:16 anti-bypass y<=1360px), overflow, WCAG contrast, Dead-Hold (>2.2s frozen),
 * inline reading-speed check (window.TEXTS), and exports compressed (<=400 KB) contact-sheet.jpg,
 * phone-360.jpg, seams.jpg, and audit-report.json in a single Chromium session (~10-15s).
 *
 * Usage:
 *   node .agents/skills/motion-studio-workflow/scripts/studio-audit.mjs <project_dir>
 *     [--size WxH] [--out dir] [--seams | --no-seams] [--phone | --no-phone] [--thumb] [--strict]
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = path.resolve(SCRIPT_DIR, '../../../..');
const LEMO_ROOT = path.join(WORKSPACE_ROOT, 'lemo-opuscar');
const LEMO_RENDER = path.join(LEMO_ROOT, 'core', 'render');

const { serve, pageURL } = await import(pathToFileURL(path.join(LEMO_RENDER, 'serve.mjs')).href);
const { EXE, ARGS, WATCH_GL_LOST, glLost } = await import(pathToFileURL(path.join(LEMO_RENDER, 'browser.mjs')).href);
const { chromium } = await import(
  pathToFileURL(path.join(LEMO_ROOT, 'node_modules', 'playwright-core', 'index.mjs')).href
);

function resolveBrowserExecutable() {
  if (EXE && fs.existsSync(EXE)) return EXE;
  try {
    const def = chromium.executablePath();
    if (def && fs.existsSync(def)) return def;
  } catch {}
  const cacheDirs = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'ms-playwright') : '',
    path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright'),
    path.join(os.homedir(), '.cache', 'ms-playwright'),
  ].filter(Boolean);
  for (const dir of cacheDirs) {
    if (!fs.existsSync(dir)) continue;
    const entries = fs.readdirSync(dir).sort().reverse();
    for (const name of entries) {
      const candidates = [
        path.join(dir, name, 'chrome-win64', 'chrome.exe'),
        path.join(dir, name, 'chrome-headless-shell-win64', 'chrome-headless-shell.exe'),
        path.join(dir, name, 'chrome-linux', 'chrome'),
      ];
      for (const c of candidates) {
        if (fs.existsSync(c)) return c;
      }
    }
  }
  return EXE;
}

function parseArgs(argv) {
  const opts = {
    projectDir: '',
    size: null,
    outDir: '',
    seams: true,
    phone: true,
    thumb: false,
    strict: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--size' && argv[i + 1]) {
      const m = /^(\d+)x(\d+)$/i.exec(argv[++i]);
      if (!m) throw new Error(`Invalid --size "${argv[i]}". Expected WxH (e.g. 1080x1920).`);
      opts.size = { w: parseInt(m[1], 10), h: parseInt(m[2], 10) };
    } else if (a === '--out' && argv[i + 1]) {
      opts.outDir = argv[++i];
    } else if (a === '--seams') {
      opts.seams = true;
    } else if (a === '--no-seams') {
      opts.seams = false;
    } else if (a === '--phone') {
      opts.phone = true;
    } else if (a === '--no-phone') {
      opts.phone = false;
    } else if (a === '--thumb') {
      opts.thumb = true;
    } else if (a === '--strict') {
      opts.strict = true;
    } else if (!a.startsWith('--') && !opts.projectDir) {
      opts.projectDir = a;
    }
  }
  return opts;
}

function inferSizeFromFiles(absProject) {
  const indexHtml = path.join(absProject, 'index.html');
  if (fs.existsSync(indexHtml)) {
    const html = fs.readFileSync(indexHtml, 'utf8');
    const dw = /data-width=["'](\d+)["']/.exec(html);
    const dh = /data-height=["'](\d+)["']/.exec(html);
    if (dw && dh) return { w: parseInt(dw[1], 10), h: parseInt(dh[1], 10) };
    const wMatch = /window\.WIDTH\s*=\s*(\d+)/.exec(html);
    const hMatch = /window\.HEIGHT\s*=\s*(\d+)/.exec(html);
    if (wMatch && hMatch) return { w: parseInt(wMatch[1], 10), h: parseInt(hMatch[1], 10) };
    if (/data-resolution=["']portrait["']/i.test(html) || /1080\s*[x×,]\s*1920/.test(html)) {
      return { w: 1080, h: 1920 };
    }
    if (/1920\s*[x×,]\s*1080/.test(html)) {
      return { w: 1920, h: 1080 };
    }
  }
  const briefPath = path.join(absProject, 'BRIEF.md');
  if (fs.existsSync(briefPath)) {
    const brief = fs.readFileSync(briefPath, 'utf8');
    if (/1080\s*[x×]\s*1920|9:16/i.test(brief)) return { w: 1080, h: 1920 };
  }
  return { w: 1920, h: 1080 };
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

async function stitchJpegSheet(composerPage, tiles, { cols, tileW, outPath, maxBytes = 400 * 1024 }) {
  if (!tiles.length) return null;
  const payload = tiles.map((t) => ({
    label: t.label,
    b64: 'data:image/jpeg;base64,' + t.buf.toString('base64'),
    srcW: t.w,
    srcH: t.h,
  }));

  const qualities = [0.88, 0.80, 0.72, 0.62, 0.52];
  let finalBuf = null;
  let finalSize = { w: 0, h: 0 };

  for (const q of qualities) {
    const res = await composerPage.evaluate(
      async ({ items, cols, tileW, q }) => {
        const imgs = await Promise.all(
          items.map(
            (it) =>
              new Promise((resolve, reject) => {
                const im = new Image();
                im.onload = () => resolve({ im, label: it.label });
                im.onerror = reject;
                im.src = it.b64;
              })
          )
        );
        const first = imgs[0].im;
        const tileH = Math.max(1, Math.round((tileW * first.height) / first.width));
        const headH = 26;
        const pad = 6;
        const rows = Math.ceil(imgs.length / cols);
        const canvas = document.createElement('canvas');
        canvas.width = cols * (tileW + pad) + pad;
        canvas.height = rows * (tileH + headH + pad) + pad;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#141418';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 13px system-ui, Segoe UI, sans-serif';
        ctx.textBaseline = 'middle';

        imgs.forEach(({ im, label }, idx) => {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          const x = pad + col * (tileW + pad);
          const y = pad + row * (tileH + headH + pad);
          ctx.fillStyle = '#1e2028';
          ctx.fillRect(x, y, tileW, headH);
          ctx.fillStyle = '#e8ecf4';
          ctx.fillText(label, x + 8, y + headH / 2, tileW - 16);
          ctx.drawImage(im, x, y + headH, tileW, tileH);
        });

        const dataUrl = canvas.toDataURL('image/jpeg', q);
        return { dataUrl, w: canvas.width, h: canvas.height };
      },
      { items: payload, cols, tileW, q }
    );
    const b64 = res.dataUrl.split(',')[1];
    finalBuf = Buffer.from(b64, 'base64');
    finalSize = { w: res.w, h: res.h };
    if (finalBuf.length <= maxBytes) break;
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, finalBuf);
  return { path: outPath, bytes: finalBuf.length, width: finalSize.w, height: finalSize.h };
}

async function analyzeFrameMetrics(composerPage, bufA, bufB = null) {
  return composerPage.evaluate(
    async ({ b64A, b64B }) => {
      const load = (src) =>
        new Promise((resolve, reject) => {
          const im = new Image();
          im.onload = () => resolve(im);
          im.onerror = reject;
          im.src = src;
        });
      const imA = await load(b64A);
      const sw = 160;
      const sh = Math.max(40, Math.round((sw * imA.height) / imA.width));
      const c = document.createElement('canvas');
      c.width = sw;
      c.height = sh;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(imA, 0, 0, sw, sh);
      const dA = ctx.getImageData(0, 0, sw, sh).data;
      const n = sw * sh;
      let sum = 0;
      let sumSq = 0;
      for (let i = 0; i < dA.length; i += 4) {
        const lum = 0.2126 * dA[i] + 0.7152 * dA[i + 1] + 0.0722 * dA[i + 2];
        sum += lum;
        sumSq += lum * lum;
      }
      const mean = sum / n;
      const stdDev = Math.sqrt(Math.max(0, sumSq / n - mean * mean));

      let meanAbsDiff = null;
      if (b64B) {
        const imB = await load(b64B);
        ctx.clearRect(0, 0, sw, sh);
        ctx.drawImage(imB, 0, 0, sw, sh);
        const dB = ctx.getImageData(0, 0, sw, sh).data;
        let diff = 0;
        for (let i = 0; i < dA.length; i += 4) {
          diff += (Math.abs(dA[i] - dB[i]) + Math.abs(dA[i + 1] - dB[i + 1]) + Math.abs(dA[i + 2] - dB[i + 2])) / 3;
        }
        meanAbsDiff = diff / n;
      }
      return { stdDev, meanAbsDiff };
    },
    {
      b64A: 'data:image/jpeg;base64,' + bufA.toString('base64'),
      b64B: bufB ? 'data:image/jpeg;base64,' + bufB.toString('base64') : null,
    }
  );
}

async function inspectDomAtTime(page, { W, H, tLabel }) {
  return page.evaluate(
    ({ W, H, tLabel }) => {
      const parseRgba = (str) => {
        const m = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)/i.exec(str || '');
        if (!m) return null;
        return {
          r: parseFloat(m[1]),
          g: parseFloat(m[2]),
          b: parseFloat(m[3]),
          a: m[4] !== undefined ? parseFloat(m[4]) : 1,
        };
      };
      const blendOver = (fg, bg) => {
        const a = fg.a + bg.a * (1 - fg.a);
        if (a <= 0) return { r: 255, g: 255, b: 255, a: 1 };
        return {
          r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
          g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
          b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
          a,
        };
      };
      const relLum = ({ r, g, b }) => {
        const lin = [r, g, b].map((c) => {
          const s = c / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
      };
      const contrastRatio = (c1, c2) => {
        const l1 = relLum(c1);
        const l2 = relLum(c2);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      };
      const isVisible = (el) => {
        let cur = el;
        let totalOpacity = 1;
        while (cur && cur.nodeType === 1) {
          const cs = getComputedStyle(cur);
          if (cs.display === 'none' || cs.visibility === 'hidden') return { ok: false, opacity: 0 };
          totalOpacity *= parseFloat(cs.opacity || '1');
          if (totalOpacity <= 0.05) return { ok: false, opacity: totalOpacity };
          cur = cur.parentElement;
        }
        return { ok: true, opacity: totalOpacity };
      };
      const resolveBg = (el) => {
        const chain = [];
        let cur = el;
        while (cur && cur.nodeType === 1) {
          const cs = getComputedStyle(cur);
          const col = parseRgba(cs.backgroundColor);
          if (col && col.a > 0) chain.push(col);
          cur = cur.parentElement;
        }
        let acc = { r: 255, g: 255, b: 255, a: 1 };
        for (let i = chain.length - 1; i >= 0; i--) {
          acc = blendOver(chain[i], acc);
        }
        return acc;
      };

      const issues = [];
      const fontFloor = Math.round(Math.min(W, H) * 0.024);
      const isVertical = H > W;
      const safeTopMax = H * 0.075;
      const safeBottomStart = H * 0.72;

      const all = document.querySelectorAll('body *');
      let textCount = 0;
      for (const el of all) {
        const tag = el.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'TEMPLATE') continue;
        if (el.closest('svg')) continue;
        const hasDirectText = Array.from(el.childNodes).some(
          (n) => n.nodeType === 3 && n.textContent.trim().length > 0
        );
        if (!hasDirectText) continue;
        const vis = isVisible(el);
        if (!vis.ok) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) continue;

        textCount++;
        const cs = getComputedStyle(el);
        const textSample = el.textContent.trim().replace(/\s+/g, ' ').slice(0, 60);
        const sel = (el.id ? '#' + el.id : el.tagName.toLowerCase()) + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');

        if (rect.left < -4 || rect.right > W + 4 || rect.top < -4 || rect.bottom > H + 4) {
          issues.push({
            severity: 'error',
            code: 'text_overflow',
            selector: sel,
            time: tLabel,
            message: `Text overflows canvas (${Math.round(rect.left)},${Math.round(rect.top)}..${Math.round(rect.right)},${Math.round(rect.bottom)} outside ${W}x${H}): "${textSample}"`,
          });
        }

        if (isVertical) {
          if (rect.top > safeBottomStart) {
            issues.push({
              severity: 'error',
              code: 'unsafe_bottom_zone',
              selector: sel,
              time: tLabel,
              message: `Vertical 9:16 safe-zone violation: text top=${Math.round(rect.top)}px > ${Math.round(safeBottomStart)}px (72% height Reels/TikTok UI bar): "${textSample}"`,
            });
          } else if (rect.top < safeTopMax) {
            issues.push({
              severity: 'error',
              code: 'unsafe_top_zone',
              selector: sel,
              time: tLabel,
              message: `Vertical 9:16 safe-zone violation: text top=${Math.round(rect.top)}px < ${Math.round(safeTopMax)}px (top status UI zone): "${textSample}"`,
            });
          }
        }

        const fSize = parseFloat(cs.fontSize || '0');
        if (fSize > 0 && fSize < fontFloor) {
          issues.push({
            severity: 'warning',
            code: 'text_below_floor',
            selector: sel,
            time: tLabel,
            message: `Font size ${fSize.toFixed(1)}px is below ${fontFloor}px floor: "${textSample}"`,
          });
        }

        const fgRaw = parseRgba(cs.color);
        if (fgRaw) {
          const bg = resolveBg(el);
          const fg = blendOver({ ...fgRaw, a: fgRaw.a * vis.opacity }, bg);
          const ratio = contrastRatio(fg, bg);
          const fWeight = parseInt(cs.fontWeight || '400', 10) || 400;
          const isLarge = fSize >= 32 || (fSize >= 24 && fWeight >= 700);
          const reqRatio = isLarge ? 3.0 : 4.5;
          if (ratio < reqRatio) {
            issues.push({
              severity: 'error',
              code: 'low_contrast',
              selector: sel,
              time: tLabel,
              message: `WCAG contrast ${ratio.toFixed(2)}:1 < ${reqRatio}:1 (font ${fSize.toFixed(0)}px): "${textSample}"`,
            });
          }
        }
      }
      return { textCount, issues };
    },
    { W, H, tLabel }
  );
}

async function runInlineReadCheck(page, dur) {
  const hasTexts = await page.evaluate(() => typeof window.TEXTS === 'function');
  if (!hasTexts) return { checked: false, issues: [] };
  const STEP = 0.1;
  const LATIN_CPS = 15;
  const CJK_CPS = 4.5;
  const PAD = 1.5;
  const MIN = 1.5;

  const res = await page.evaluate(
    ({ STEP, dur }) => {
      const W = innerWidth;
      const H = innerHeight;
      const seen = {};
      const partial = {};
      for (let t = 0; t <= dur + 1e-6; t += STEP) {
        window.render(Math.min(t, dur));
        const vis = new Set();
        for (const b of window.TEXTS(t) || []) {
          const id = String(b.id);
          const key = id + '\u0000' + b.text;
          if (b.pass) continue;
          if (!(b.x0 >= -1 && b.y0 >= -1 && b.x1 <= W + 1 && b.y1 <= H + 1)) {
            partial[key] ??= { id, text: b.text, t0: t };
            continue;
          }
          vis.add(key);
          const s = (seen[key] ??= { id, text: b.text, t0: t, run: 0, done: false });
          if (!s.done) s.run = Math.min(t + STEP, dur) - s.t0;
        }
        for (const k in seen) if (!vis.has(k)) seen[k].done = true;
      }
      for (const k in partial) if (seen[k]) delete partial[k];
      return { seen: Object.values(seen), partial: Object.values(partial) };
    },
    { STEP, dur }
  );

  const isCJK = (ch) => /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(ch);
  const needSec = (text) => {
    let cjk = 0;
    let other = 0;
    for (const ch of text) {
      if (/\s/.test(ch)) continue;
      if (isCJK(ch)) cjk++;
      else other++;
    }
    return Math.max(MIN, cjk / CJK_CPS + other / LATIN_CPS + PAD);
  };

  const issues = [];
  for (const s of res.seen) {
    const need = needSec(s.text);
    if (s.run < need - 1e-6) {
      issues.push({
        severity: 'warning',
        code: 'readcheck_too_fast',
        selector: `TEXTS#${s.id}`,
        time: `${s.t0.toFixed(2)}s`,
        message: `Text "${s.text.slice(0, 32)}" visible ${s.run.toFixed(2)}s < need ${need.toFixed(2)}s`,
      });
    }
  }
  for (const s of res.partial) {
    issues.push({
      severity: 'warning',
      code: 'readcheck_partial',
      selector: `TEXTS#${s.id}`,
      time: `${s.t0.toFixed(2)}s`,
      message: `Text "${s.text.slice(0, 32)}" never fully inside frame`,
    });
  }
  return { checked: true, blocks: res.seen.length, issues };
}

async function main() {
  const tStart = Date.now();
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.projectDir) {
    console.error(
      'Usage: node studio-audit.mjs <project_dir> [--size WxH] [--out dir] [--seams|--no-seams] [--phone|--no-phone] [--thumb] [--strict]'
    );
    process.exit(2);
  }
  const absProject = path.resolve(opts.projectDir);
  if (!fs.existsSync(path.join(absProject, 'index.html'))) {
    console.error(`studio-audit: missing index.html in ${absProject}`);
    process.exit(2);
  }

  let { w: W, h: H } = opts.size || inferSizeFromFiles(absProject);
  const outDir = opts.outDir ? path.resolve(opts.outDir) : path.join(absProject, 'boards');
  fs.mkdirSync(outDir, { recursive: true });

  const schedule = readJsonIfExists(path.join(absProject, 'voice', 'schedule.json'));
  const hasThumbFile = fs.existsSync(path.join(absProject, 'thumbnail.html'));

  const findings = [];
  const seenKeys = new Set();
  const addFinding = (severity, code, message, extra = {}) => {
    const k = `${severity}|${code}|${extra.selector || ''}|${message.slice(0, 80)}`;
    if (seenKeys.has(k)) return;
    seenKeys.add(k);
    findings.push({ severity, code, message, ...extra });
  };

  let srv = null;
  let browser = null;
  try {
    srv = await serve(LEMO_ROOT);
    const url = pageURL(LEMO_ROOT, srv.port, absProject);
    const chromeExe = resolveBrowserExecutable();
    browser = await chromium.launch({ executablePath: chromeExe, args: ARGS });
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    const composerPage = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
    await page.addInitScript(WATCH_GL_LOST);

    page.on('pageerror', (err) => addFinding('error', 'pageerror', err.message));
    page.on('console', (msg) => {
      const txt = msg.text();
      if (msg.type() === 'error' && !/^Failed to load resource/.test(txt)) {
        addFinding('error', 'console_error', txt.slice(0, 240));
      }
    });
    page.on('request', (req) => {
      const u = req.url();
      if (/^https?:\/\//i.test(u) && !/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?(\/|$)/i.test(u)) {
        addFinding('warning', 'external_cdn', `External network asset requested (bundle locally): ${u}`);
      }
    });
    page.on('response', (res) => {
      if (res.status() < 400) return;
      const u = res.url();
      let pathname = '';
      try {
        pathname = new URL(u).pathname;
      } catch {}
      if (pathname === '/favicon.ico') return;
      const rtype = res.request().resourceType();
      if (['script', 'font', 'image', 'stylesheet', 'document'].includes(rtype)) {
        addFinding('error', `http_${res.status()}_${rtype}`, `Failed to load ${rtype}: ${u}`);
      } else if (!/dur\.json/i.test(pathname)) {
        addFinding('warning', `http_${res.status()}_${rtype}`, `Missing optional ${rtype}: ${u}`);
      }
    });
    page.on('requestfailed', (req) => {
      const u = req.url();
      if (!/favicon\.ico/i.test(u) && req.failure()?.errorText !== 'net::ERR_ABORTED') {
        addFinding('error', 'request_failed', `Request failed (${req.failure()?.errorText}): ${u}`);
      }
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => window.READY === true, null, { timeout: 45000 });

    if (!opts.size) {
      const detected = await page.evaluate(() => {
        if (Number(window.WIDTH) > 0 && Number(window.HEIGHT) > 0) {
          return { w: Number(window.WIDTH), h: Number(window.HEIGHT) };
        }
        const r = document.querySelector('#root, [data-width][data-height]');
        if (r && Number(r.dataset.width) > 0 && Number(r.dataset.height) > 0) {
          return { w: Number(r.dataset.width), h: Number(r.dataset.height) };
        }
        const c = document.querySelector('canvas');
        if (c && c.width >= 320 && c.height >= 320) return { w: c.width, h: c.height };
        return null;
      });
      if (detected && (detected.w !== W || detected.h !== H)) {
        W = detected.w;
        H = detected.h;
        await page.setViewportSize({ width: W, height: H });
      }
    }

    const dur = await page.evaluate(() => Number(window.DUR) || 0);
    if (!(dur > 0)) {
      addFinding('error', 'invalid_dur', `window.DUR must be > 0 (got ${dur})`);
    }
    const safeDur = Math.max(0.5, dur);

    // Build keyframe sampling schedule
    const samples = [{ label: 'Frame 0 · t=0.00s', t: 0.0 }];
    if (schedule && Array.isArray(schedule.shots) && schedule.shots.length > 0) {
      for (const s of schedule.shots) {
        const mid = Math.min(safeDur - 0.05, Math.max(0.05, (Number(s.start) + Number(s.end)) * 0.5));
        samples.push({
          label: `Shot ${String(s.shot).padStart(2, '0')} · t=${mid.toFixed(2)}s`,
          t: mid,
          shot: s,
        });
      }
    } else {
      const count = 7;
      for (let i = 1; i <= count; i++) {
        const ts = Math.min(safeDur - 0.05, (safeDur * i) / (count + 1));
        samples.push({ label: `Sample ${i} · t=${ts.toFixed(2)}s`, t: ts });
      }
    }

    // 1. Capture stills + DOM layout/safe-zone/WCAG check + Frame 0 empty check
    const mainTiles = [];
    for (let idx = 0; idx < samples.length; idx++) {
      const sp = samples[idx];
      await page.evaluate((t) => window.render(t), sp.t);
      await page.waitForTimeout(16);
      const buf = await page.screenshot({ type: 'jpeg', quality: 90 });
      mainTiles.push({ label: sp.label, buf, w: W, h: H });

      if (idx === 0) {
        const fm = await analyzeFrameMetrics(composerPage, buf);
        if (fm.stdDev < 2.5) {
          addFinding('error', 'first_frame_empty', `Frame 0 at t=0.0s looks blank/flat (luminance stdDev=${fm.stdDev.toFixed(2)} < 2.5)`);
        }
      }

      const domAudit = await inspectDomAtTime(page, { W, H, tLabel: sp.label });
      for (const iss of domAudit.issues) {
        addFinding(iss.severity, iss.code, iss.message, { selector: iss.selector, time: iss.time });
      }

      const lost = await glLost(page);
      if (lost) {
        addFinding('error', 'webgl_context_lost', `WebGL context (${lost}) lost at t=${sp.t.toFixed(2)}s`);
        break;
      }
    }

    // Optional thumbnail cover tile
    if (opts.thumb || hasThumbFile) {
      const thumbUrl = hasThumbFile ? url.replace(/index\.html$/, 'thumbnail.html') : `${url}?thumb=1`;
      const thumbPage = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
      try {
        await thumbPage.goto(thumbUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await thumbPage.waitForTimeout(150);
        const tBuf = await thumbPage.screenshot({ type: 'jpeg', quality: 90 });
        mainTiles.push({ label: 'Cover / Thumbnail', buf: tBuf, w: W, h: H });
      } catch (e) {
        addFinding('warning', 'thumb_capture_failed', `Could not capture cover thumbnail: ${e.message}`);
      } finally {
        await thumbPage.close();
      }
    }

    // 2. Dead-Hold Check (> 2.2s frozen animation inside non-final shots >= 5s)
    if (schedule && Array.isArray(schedule.shots) && schedule.shots.length > 0) {
      const lastShotNum = schedule.shots[schedule.shots.length - 1].shot;
      for (const s of schedule.shots) {
        const sDur = Number(s.dur) || (Number(s.end) - Number(s.start));
        if (s.shot === lastShotNum || sDur < 5.0) continue;
        const tA = Number(s.start) + sDur * 0.45;
        const tB = Number(s.start) + sDur * 0.85;
        if (tB - tA < 2.2) continue;

        await page.evaluate((t) => window.render(t), tA);
        await page.waitForTimeout(12);
        const bA = await page.screenshot({ type: 'jpeg', quality: 80 });

        await page.evaluate((t) => window.render(t), tB);
        await page.waitForTimeout(12);
        const bB = await page.screenshot({ type: 'jpeg', quality: 80 });

        const metrics = await analyzeFrameMetrics(composerPage, bA, bB);
        if (metrics.meanAbsDiff !== null && metrics.meanAbsDiff < 1.0) {
          addFinding(
            'warning',
            'dead_hold',
            `Shot ${String(s.shot).padStart(2, '0')} (${sDur.toFixed(1)}s) is visually frozen for ${(tB - tA).toFixed(1)}s (${tA.toFixed(1)}s->${tB.toFixed(1)}s, diff=${metrics.meanAbsDiff.toFixed(2)})`
          );
        }
      }
    }

    // 3. Inline Reading-Speed Check (if window.TEXTS is exposed)
    const rc = await runInlineReadCheck(page, safeDur);
    for (const iss of rc.issues) {
      addFinding(iss.severity, iss.code, iss.message, { selector: iss.selector, time: iss.time });
    }

    // 4. Seam Strips at shot cuts
    const seamTiles = [];
    if (opts.seams && schedule && Array.isArray(schedule.shots) && schedule.shots.length >= 2) {
      const cuts = schedule.shots.slice(0, -1).slice(0, 10);
      for (let i = 0; i < cuts.length; i++) {
        const cutT = Number(cuts[i].end);
        const offsets = [
          { off: -0.15, tag: `${i + 1}: cut-0.15s` },
          { off: 0.0, tag: `${i + 1}: cut=${cutT.toFixed(2)}s` },
          { off: 0.15, tag: `${i + 1}: cut+0.15s` },
        ];
        for (const { off, tag } of offsets) {
          const ts = Math.max(0, Math.min(safeDur - 0.01, cutT + off));
          await page.evaluate((t) => window.render(t), ts);
          await page.waitForTimeout(10);
          const buf = await page.screenshot({ type: 'jpeg', quality: 86 });
          seamTiles.push({ label: tag, buf, w: W, h: H });
        }
      }
    }

    // Export sheets <= 400 KB
    const isPortrait = H > W;
    const contactInfo = await stitchJpegSheet(composerPage, mainTiles, {
      cols: 4,
      tileW: isPortrait ? 320 : 420,
      outPath: path.join(outDir, 'contact-sheet.jpg'),
    });

    let phoneInfo = null;
    if (opts.phone) {
      phoneInfo = await stitchJpegSheet(composerPage, mainTiles, {
        cols: 2,
        tileW: 360,
        outPath: path.join(outDir, 'phone-360.jpg'),
      });
    }

    let seamsInfo = null;
    if (seamTiles.length > 0) {
      seamsInfo = await stitchJpegSheet(composerPage, seamTiles, {
        cols: 3,
        tileW: isPortrait ? 280 : 380,
        outPath: path.join(outDir, 'seams.jpg'),
      });
    }

    const errors = findings.filter((f) => f.severity === 'error');
    const warnings = findings.filter((f) => f.severity === 'warning');
    const ok = errors.length === 0 && (!opts.strict || warnings.length === 0);
    const elapsedMs = Date.now() - tStart;

    const report = {
      ok,
      project: path.basename(absProject),
      dimensions: { width: W, height: H },
      duration: safeDur,
      elapsedMs,
      readCheck: rc.checked ? { blocks: rc.blocks, issues: rc.issues.length } : { checked: false },
      counts: { errors: errors.length, warnings: warnings.length },
      sheets: {
        contactSheet: contactInfo,
        phone360: phoneInfo,
        seams: seamsInfo,
      },
      findings,
    };

    const reportPath = path.join(outDir, 'audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(
      `studio-audit [${report.project}] ${W}x${H} (${safeDur.toFixed(2)}s) | ok=${ok} | errors=${errors.length} warnings=${warnings.length} | ${(elapsedMs / 1000).toFixed(1)}s`
    );
    for (const s of [contactInfo, phoneInfo, seamsInfo].filter(Boolean)) {
      console.log(`  sheet: ${s.path} (${(s.bytes / 1024).toFixed(1)} KB, ${s.width}x${s.height})`);
    }
    for (const f of findings) {
      console.log(`  [${f.severity.toUpperCase()}] ${f.code}: ${f.message}`);
    }

    process.exitCode = ok ? 0 : 1;
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (srv?.server) srv.server.close();
  }
}

main().catch((err) => {
  console.error(`studio-audit fatal: ${err.stack || err.message}`);
  process.exit(1);
});
