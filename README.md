# AI Motion Studio

Studio produksi **Motion Graphics, Product Explainer, Short Film berbasis kode, dan Web App Demo** yang berjalan deterministik pada `60 FPS` menggunakan kode (`HTML/CSS/GSAP`, `Canvas 2D`, `Three.js/WebGL`, `Playwright`, dan `FFmpeg`).

> Repositori ini berfungsi sebagai **monorepo dokumentasi & kode sumber proyek** (Opsi A). File video hasil render (`*.mp4`, `*.webm`), audio mentah (`*.wav`, `*.mp3`), dependensi (`node_modules/`, `.venv/`), library hulu `lemo-opuscar/`, serta arsip proyek lokal (`archive/`, `sipelita-demo/`) dikecualikan melalui [.gitignore](.gitignore) agar repositori GitHub tetap ringan, bersih, dan aman.

- **Panduan Alur Kerja User (POV Pemilik Proyek):** [USER_WORKFLOW.md](USER_WORKFLOW.md)
- **SOP Orkestrasi Agent (7 Tahap & 3 Gate):** [.agents/skills/motion-studio-workflow/SKILL.md](.agents/skills/motion-studio-workflow/SKILL.md)
- **Konteks Teknis & Spesifikasi Workspace:** [WORKSPACE_CONTEXT.md](WORKSPACE_CONTEXT.md)

---

## Arsitektur & Engine

| Komponen | Peran | Lokasi Lokal |
| :--- | :--- | :--- |
| **HyperFrames (`v0.9.70`)** | Engine komposisi video HTML/CSS + GSAP deterministik & Preview Studio | `hyperframes/` · `.agents/skills/hyperframes/` |
| **Lemo-Opuscar (`v2.0.0`)** | Pustaka 99 gaya film artistik (Canvas 2D/WebGL), Audio Suite (`sfx.py`, `sampler.py`, `pluck.py`), `edge-tts`, & muxer `-14 LUFS` | `lemo-opuscar/` *(lokal, di-ignore Git)* · `.agents/skills/lemo-opuscar/` |
| **Video-Demo (60 FPS Tuned)** | Perekam live web app dengan kursor 60Hz, smooth zoom, dan transisi curtain | `.agents/skills/video-demo/` |
| **Kumpulan Skill Pendukung** | 5 modul `gsap-*`, `algorithmic-art`, 6 modul `threejs-*`, `hyperframes-registry`, `media-use`, `style-sampling`, `figma`, `slideshow` | `.agents/skills/` |
| **SOP Orkestrasi Studio** | Alur produksi 7 tahap dari brief hingga render & dokumentasi | [.agents/skills/motion-studio-workflow/SKILL.md](.agents/skills/motion-studio-workflow/SKILL.md) |

Informasi spesifikasi perangkat, aturan kerja workspace, dan konfigurasi lokal lengkap tersimpan di [WORKSPACE_CONTEXT.md](WORKSPACE_CONTEXT.md).

---

## Katalog Portofolio Proyek

| No | Proyek | Mode / Engine | Durasi & Format | Status | Folder / Referensi |
| :---: | :--- | :--- | :--- | :--- | :--- |
| `00` | **SI-PELITA Kemenag Kab. Banjar** *(Arsip Awal)* | Video-Demo + HyperFrames Explainer | 1080p @ 60 FPS | Selesai | *(Arsip lokal - dikecualikan dari repo publik)* |
| `01` | **SI-PELITA Mobile Explainer** *(Inovasi Kemenag Kab. Banjar)* | Mode B: Lemo-Opuscar (`stick-explainer` + Geometric Shapes) | `1080x1920 (9:16) @ 60 FPS` · `64.1s` | Selesai | [projects/01-sipelita-explainer/](projects/01-sipelita-explainer/README.md) |
| `02` | **Anak Sulung: Kuat Karena Harus** *(Koleksi Esai Medium)* | Mode B: Lemo-Opuscar Pure (`risograph` — Canvas 2D + WebGL2) | `1080x1920 (9:16) @ 24 FPS` · `59.4s` | Selesai (Rendered) | [projects/02-anak-sulung/](projects/02-anak-sulung/README.md) |
| `03` | **Muhammad Ali Ridho: Math Brain, Lazy Automator** *(Video Perkenalan Portofolio)* | Mode A: HyperFrames (`v0.9.70` + GSAP 3.15 + Canvas 2D Verlet Lanyard) | `1080x1920 (9:16) @ 60 FPS` · `104.8s` | Selesai (Rendered) | [projects/03-ridho-intro/](projects/03-ridho-intro/README.md) |
| `04` | **Belajar AI dari Nol — Part 1: Fundamental AI** *(Duet Explainer 4 Tangga AI)* | Track 1: Lemo-Opuscar (`ipad-sketch` — Canvas 2D) | `1080x1920 (9:16) @ 30 FPS` · `80.0s` | Selesai (Rendered) | [projects/04-bodoh-ke-mahir-ai/](projects/04-bodoh-ke-mahir-ai/README.md) |
| `05` | **Belajar AI dari Nol — Part 2: AI Tools Mastery** *(Duet Explainer Context, Skills, Projects & MCP)* | Track 1: Lemo-Opuscar (`ipad-sketch` — Canvas 2D) | `1080x1920 (9:16) @ 30 FPS` · `133.1s` | Selesai (Rendered) | [projects/05-ai-tools-mastery/](projects/05-ai-tools-mastery/README.md) |
| `06` | **SI-PELITA Kemenag Kab. Banjar v2** *(3D Low-Poly Isometric Island Explainer)* | Track 1: Lemo-Opuscar (`lowpoly-island` — Three.js WebGL) | `1080x1920 (9:16) @ 30 FPS` · `81.85s` | Selesai (Rendered) | [projects/06-sipelita-explainer-v2/](projects/06-sipelita-explainer-v2/README.md) |
| `07` | *Proyek Berikutnya* | - | - | Siap dimulai | [projects/](projects/README.md) |

---

## Pemulihan Environment Lokal (Clone Baru)

Jika repositori ini di-clone ke komputer lain, jalankan seluruh instalasi **di dalam folder root workspace**:

1. **HyperFrames CLI:**
   ```powershell
   cd hyperframes
   npm install
   ```
2. **Lemo-Opuscar & Python Studio (`edge-tts`, `kokoro-onnx`, `faster-whisper`, `numba`, `yt-dlp`):**
   ```powershell
   git clone --depth 1 --filter=blob:none --sparse https://github.com/lemomo-ai/lemo-opuscar.git lemo-opuscar
   cd lemo-opuscar
   npm install
   python -m venv .venv
   .\.venv\Scripts\python.exe -m pip install --cache-dir ..\.tmp-cache -r requirements.txt -r requirements-voice.txt -r requirements-music.txt yt-dlp
   ```
3. **Prasyarat Sistem:** Node.js `20+`, Python `3.11–3.13`, FFmpeg `7+` (diuji pada `v9.0.2`), dan Google Chrome / Chromium.
