# Workspace Context & Handover Guide — Motion Graphics & Video Studio

Dokumen ini menyimpan seluruh konteks, konfigurasi environment, aturan kerja, dan riwayat proyek dari workspace ini agar dapat dilanjutkan secara instan pada sesi chat baru setelah folder workspace di-rename atau dipindahkan.

---

## 1. Tujuan Workspace
Workspace ini dikhususkan sebagai **studio pembuatan video Motion Graphics, Product Explainer, Short Film berbasis kode, dan Web App Demo** (berjalan lokal di Windows menggunakan kode HTML/CSS/GSAP, Canvas 2D/WebGL, Playwright, dan FFmpeg).

---

## 2. Spesifikasi Perangkat & Aturan Eksekusi Penting

### Spesifikasi Hardware (Windows)
- **CPU:** `12th Gen Intel(R) Core(TM) i5-1235U` (10 Core / 12 Logical Processors)
- **RAM:** `24 GB` (`23.75 GB`)
- **GPU:** `Intel(R) Iris(R) Xe Graphics` (Integrated GPU — **tidak ada GPU NVIDIA / CUDA**)
- **Tools Global yang Tersedia:** Node.js `v24.13.0`, Git + Git Bash, FFmpeg `v9.0.2`, Python `3.13.14`
- **Browser Chromium Lokal:**
  `%USERPROFILE%\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe`
  > **Catatan Penting Windows:** Gunakan Chrome dengan akselerasi D3D11 GPU (`--enable-gpu --enable-gpu-rasterization --enable-zero-copy --ignore-gpu-blocklist`). **Jangan gunakan flag `--disable-gpu-vsync`** pada Chromium headless Windows karena menyebabkan `page.screenshot()` hang/timeout.

### Voice-Over TTS yang Sudah Siap Dipakai
- **Engine:** `edge-tts`, `kokoro-onnx`, `faster-whisper`, dan `av` terpusat 100% di dalam workspace pada:
  `<workspace>\lemo-opuscar\.venv\Scripts\python.exe` *(dipakai bersama oleh `lemo-opuscar` dan `video-demo`)*
- **Suara Bahasa Indonesia rekomendasi:** `id-ID-ArdiNeural` (Pria) / `id-ID-GadisNeural` (Wanita).
- *Catatan:* Untuk narasi Bahasa Indonesia agar terdengar natural, selalu trim silence awal/akhir per kalimat dengan `ffmpeg` lalu letakkan tiap segmen secara terpisah pada timeline dengan jeda napas `0.8–1.4 detik` supaya tidak saling menimpa (*override*).

### Aturan Ketat User (Wajib Dipatuhi di Setiap Sesi)
1. **100% Di Dalam Workspace:** Semua instalasi paket baru, dependensi proyek, folder `.venv/`, dan cache sementara (`.tmp-cache`, `--cache`, `--cache-dir`) wajib diarahkan ke dalam folder workspace ini.
2. **Jangan Mengotak-atik Luar Workspace:** Dilarang keras mengubah, menghapus, atau memodifikasi file/folder di luar folder workspace yang sedang aktif (termasuk `%LOCALAPPDATA%\ms-playwright` yang juga dipakai proyek lain di komputer ini).
3. **Preferensi Gaya Video:**
   - Lebih menyukai transisi antar-scene yang halus (`fade` / *transition curtain*), animasi `60 FPS` murni (`requestAnimationFrame` / GSAP / deterministik), tanpa outline animasi hijau yang meleset atau tumpang-tindih.
   - Komunikasi dalam **Bahasa Indonesia** yang ringkas dan jelas, lengkap dengan link `file:///...` yang bisa diklik untuk semua file referensi.

---

## 3. Stack & Engine yang Sudah Terpasang di Workspace

Semua jalur relatif berikut sudah disetel **portabel** sehingga tetap berfungsi walau folder induknya di-rename:

### A. HyperFrames (`v0.9.70`) — Engine Utama Motion Graphics (HTML/CSS + GSAP)
- **Lokasi CLI Lokal:** `<workspace>/hyperframes/node_modules/hyperframes/bin/hyperframes.mjs`
- **Launcher Skill:**
  ```powershell
  node ".agents/skills/hyperframes/scripts/plugin-cli.mjs" <command>
  ```
  *(Sudah dimodifikasi agar langsung memanggil biner lokal di `<workspace>/hyperframes/` tanpa mengunduh ulang ke luar workspace via `npx` di `$HOME`.)*
- **Skill Orkestrasi Studio di `.agents/skills/`:**
  - `motion-studio-workflow` — SOP produksi end-to-end 7 tahap (Mode A/B/C, 3 Gate persetujuan, daftar skill per tahap, input wajib user, dan standar struktur `projects/NN-slug/`)
- **9 Skills Aktif di `.agents/skills/` (HyperFrames):**
  - `hyperframes` (baca `SKILL.md` ini terlebih dahulu sebelum membuat video HyperFrames)
  - `hyperframes-cli` (perintah `init`, `lint`, `check`, `snapshot`, `timeline`, `preview`, `render`)
  - `hyperframes-registry` (~450 blok/komponen siap pakai: transisi, overlay, judul, kinetic type, chart, map, 3D)
  - `media-use`, `style-sampling`, `reverse-any-video`, `figma`, `slideshow`, `remotion-to-hyperframes`
- **5 Skills Tambahan GSAP (`greensock/gsap-skills`) di `.agents/skills/`:**
  - `gsap-core`, `gsap-timeline`, `gsap-plugins`, `gsap-utils`, `gsap-performance` *(khusus teknik animasi GSAP lanjutan; untuk render video deterministik tetap ikuti aturan kontrak timeline di `hyperframes`)*
- **7 Skills Visual Generatif & 3D di `.agents/skills/`:**
  - `algorithmic-art` (`anthropics/skills`) — seni generatif *seeded randomness* / p5.js
  - `threejs-fundamentals`, `threejs-materials`, `threejs-lighting`, `threejs-animation`, `threejs-postprocessing`, `threejs-shaders` (`CloudAI-X/threejs-skills`) — modul 3D WebGL/WebGPU & shader
- **Skills Lintas-Proyek Global (`%USERPROFILE%\.gemini\config\skills\`):**
  - `frontend-design`, `brand-guidelines` (`anthropics/skills`), `impeccable` (`pbakaus/impeccable`), dan `humanizer` (`blader/humanizer`) tersedia secara global di semua proyek.
- **Ukuran:** `~106 MiB` (sudah dirampingkan dari monorepo 1.55 GB).

### B. Lemo-Opuscar (`v2.0.0`) — Pustaka 100 Gaya Film Pendek Artistik (Canvas 2D / WebGL + Audio Mix `-14 LUFS`)
- **Lokasi Library (`$LIB`):** `<workspace>/lemo-opuscar/`
- **Skill:** `.agents/skills/lemo-opuscar/SKILL.md` (script `setup.sh` sudah memakai path relatif ke `<workspace>/lemo-opuscar`, bukan `$HOME/lemo-opuscar`).
- **Panduan Utama:**
  - `lemo-opuscar/AGENTS.md` (alur kerja & daftar 100 gaya di 15 kategori)
  - `lemo-opuscar/DIRECTOR.md` (penyutradaraan, cerita, ritme, kamera, audio)
  - `lemo-opuscar/TECHNIQUE.md` (rendering deterministik `render(t)`, voice, music sampler, `mux.sh` `-14 LUFS`)
  - `lemo-opuscar/styles/<slug>/STYLE.md` (100 folder style lengkap)
- **Dependensi Lokal Terpasang:**
  - Node: `lemo-opuscar/node_modules/` (`playwright-core`, `three`)
  - Python 3.13: `lemo-opuscar/.venv/` (Core: `numpy`, `scipy`, `soundfile`, `soxr`, `pillow`, `fonttools`; Voice & Music: `edge-tts`, `kokoro-onnx`, `faster-whisper`, `av`, `numba`; Media Acquisition: `yt-dlp`) + shim Git Bash `lemo-opuscar/.venv/bin/python`
  - *Catatan migrasi minor:* Jika `.venv` perlu dibuat ulang setelah folder di-rename karena path di `pyvenv.cfg` / shebang `pip.exe` mengarah ke path folder lama, cukup hapus `.venv` lalu jalankan `python -m venv lemo-opuscar/.venv` & `pip install -r lemo-opuscar/requirements.txt` di folder baru (sedangkan `.venv/Scripts/python.exe` sendiri umumnya tetap bisa jalan).

### C. Video-Demo (`nilbuild/video-demo`) — Perekam Layar Live Web App
- **Lokasi Engine:** `.agents/skills/video-demo/engine/`
- **Optimasi yang Sudah Diterapkan:**
  - Memakai `channel: 'chromium'` (D3D11 GPU compositing, native `1920x1080`, `FRAME_QUALITY = 68`) untuk mengejar 42–51+ FPS tangkapan asli di Windows.
  - Animasi kursor (`glide`), `zoom`, dan scroll tersinkron `requestAnimationFrame` 60Hz (`smootherstep`).
  - Outline hijau (`dc-ring`) sudah dihapus dan diganti transisi *dark-emerald curtain* 60Hz di awal/akhir scene serta antar-halaman.

### D. Repositori Git Monorepo (Opsi A)
- **Struktur:** Workspace diinisialisasi sebagai repo Git lokal (`branch: main`) yang mencatat `projects/`, `USER_WORKFLOW.md`, skill kustom di `.agents/skills/`, `README.md`, dan `WORKSPACE_CONTEXT.md`.
- **Pengecualian (`.gitignore`):** Mengabaikan `node_modules/`, `.venv/`, library hulu `lemo-opuscar/`, arsip proyek lokal `sipelita-demo/` & `archive/`, serta seluruh output render/audio (`*.mp4`, `*.wav`, `*.mp3`, `projects/**/output/`) agar repo publik tetap ringan, aman, dan berfokus pada kode serta dokumentasi.

---

## 4. Arsip Proyek Sebelumnya: SI-PELITA Madrasah (Kemenag Kab. Banjar)

Sebelumnya workspace ini telah menyelesaikan dua versi video demo untuk layanan **SI-PELITA** *(URL produksi disensor untuk repositori publik)*:
1. **Motion-Graphics Explainer (9 Scene, 1080p 60 FPS + VO Indonesia `id-ID-ArdiNeural` + SFX):**
   - File arsip lokal: `archive/sipelita-explainer-60fps.mp4` (`29.38 MiB`)
   - Mencakup: 4 masalah spesifik EMIS & Verval PD (*Siswa Salah Tingkat*, *Reaktivasi EMIS*, *NISN/NIK Ganda*, *Data Tidak Ditemukan*), konteks Google Form lama yang sulit dipantau, 3 jalur pelaporan, simulasi tiket uji **`TIK-20261005-5500`**, alur proses pasca-submit berjenjang (Sistem → Kabupaten → Kanwil → Koordinasi Kanwil & Pusat → Eksekusi Pusat → Selesai di SI-PELITA), lacak status, statistik, panduan, dan estimasi pengerjaan `2–3 hari kerja` (dapat lebih lama jika ada kendala).
2. **Live Web App Screencast Tour (9 Scene, 1080p 60 FPS, Tanpa VO/Subtitle):**
   - File arsip lokal: `archive/sipelita-web-tour-60fps.mp4` (`51.54 MiB`)
   - Skrip scene tersimpan lokal di `sipelita-demo/` (dikecualikan dari repo publik via `.gitignore`; mengecualikan Portal Admin dan tidak men-submit form ke server produksi).

- **Referensi Log Lokal:** `%USERPROFILE%\.gemini\antigravity\brain\<session-id>`
