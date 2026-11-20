---
name: motion-studio-workflow
description: Orchestrator SOP v2 untuk memulai dan memproduksi proyek video motion graphics, explainer, short film berbasis kode, atau web app demo di workspace AI Motion Studio (HyperFrames, Lemo-Opuscar, Video-Demo, Expressive VO, Live Preview Player, QA 60 FPS, dan dokumentasi Git). Gunakan setiap kali user memulai proyek video baru atau meminta alur produksi studio.
---

# AI Motion Studio — Workflow Produksi End-to-End (SOP v2)

Skill ini adalah SOP orkestrasi utama untuk memproduksi video motion graphics di workspace **AI Motion Studio** dari wawancara konsep hingga render final dan dokumentasi Git yang rapi, **hemat token**, dan **anti-pivot**. Untuk panduan alur kerja dari sudut pandang user (*playbook*), lihat [USER_WORKFLOW.md](../../../USER_WORKFLOW.md).

---

## 1. Aturan Ketat, Guardrails & Disiplin Efisiensi

1. **100% Di Dalam Workspace:** Seluruh proyek (`projects/NN-slug/`), cache sementara (`.tmp-*`, `--cache-dir`), instalasi paket, dan skrip kerja wajib berada di dalam root workspace. Dilarang menulis atau mengubah berkas di luar workspace tanpa izin eksplisit user.
2. **Batasan Hardware Windows (Tanpa GPU NVIDIA/CUDA):**
   - CPU `12th Gen Intel i5-1235U`, RAM `24 GB`, iGPU `Intel Iris Xe Graphics`.
   - Visual 100% berbasis kode (`HTML/CSS/GSAP`, `Canvas 2D`, `Three.js/WebGL`). Dilarang menjalankan model generasi video/gambar AI lokal yang berat.
   - Browser render memakai Chrome D3D11 GPU compositing (`--enable-gpu --enable-gpu-rasterization --enable-zero-copy --ignore-gpu-blocklist`). **Dilarang keras memakai flag `--disable-gpu-vsync`** pada Chromium headless Windows karena menyebabkan `page.screenshot()` hang/timeout.
3. **Standar FPS, Resolusi & Batas Durasi:**
   - **Mode A & C:** Default **`1920×1080 @ 60 FPS`** (atau `1080×1920 @ 60 FPS` untuk format vertikal `9:16`).
   - **Mode B (`Lemo-Opuscar Pure`):** Ikuti *frame rate* artistik di `STYLE.md` (`24`/`30`/`60 FPS`), kecuali user meminta paksa `60 FPS`.
   - **Durasi praktis:** Ideal **30–90 detik**. Jika durasi melebihi **2–3 menit**, wajib beri peringatan dan pecah proyek menjadi beberapa bab/segmen komposisi terpisah lalu gabungkan hasil akhirnya dengan FFmpeg.
4. **Hierarki Kontrak Deterministik:**
   - Dilarang memakai `Date.now()`, `Math.random()` tanpa seed, fetch jaringan saat render, atau `requestAnimationFrame` sebagai jam timeline. Setiap frame wajib merupakan fungsi murni dari waktu `t`.
   - Saat memakai skill `gsap-*` atau `impeccable`, aturan kontrak **HyperFrames** (`window.__timelines["<id>"]`, paused timeline, tanpa `repeat: -1`, tanpa tween `display`/`visibility`/`autoAlpha` di elemen `.clip`) maupun aturan `STYLE.md` di Mode B **selalu menang**.
5. **Disiplin Efisiensi Token, Subagent & Vision (Anti-Quota Limit):**
   - **Isolasi Riset Bahan:** Jika user memberi kode sumber, Apps Script, repo, atau dokumen besar, **WAJIB** delegasikan pembacaan & ekstraksinya ke subagent `research` agar hanya ringkasan **`FACTS.md` (`≤ 3–5 KB`)** yang masuk ke percakapan utama. Dilarang membaca file kode/dokumen raksasa langsung di *main thread*.
   - **Disiplin Vision Token:** Saat inspeksi gambar, **WAJIB** membaca **1 grid `contact-sheet.jpg`** (atau `model-sheet.jpg`) lebih dulu. **Dilarang** membuka semua `shot-01..NN.jpg` satuan sekaligus — hanya buka 1–2 file `shot-XX.jpg` secara terpisah jika ada detail mikro yang perlu dizoom.
   - **Wajib Anjurkan `/compact`:** Setelah **Gate #1 + Audisi Audio** selesai atau setelah **Gate #2A (Stills)** disetujui (saat `FACTS.md`, `SPEC.md`/`TREATMENT.md` sudah tersimpan di disk), atau jika percakapan mendekati ~120–150 step, anjurkan user mengetik `/compact` agar panggilan LLM di tahap coding & QA tetap ringan. Jika suatu saat terjadi **pivot total engine**, mulai **chat baru** membawa `BRIEF.md` & `FACTS.md`.
6. **Kebijakan Aset, Fakta & Kebersihan Repo Publik:**
   - Agent **dilarang keras** mengarang angka/klaim fakta atau menggambar logo resmi palsu secara diam-diam. Jika aset/angka resmi belum tersedia dan user mengizinkan lanjut dulu, gunakan *labeled placeholder* / angka `[ilustratif]` yang dicatat di `SPEC.md`/`BRIEF.md` dan `REVIEW.md`, lalu **konfirmasi ulang sebelum render final (Gate #3)**.
   - Output render (`*.mp4`, `*.webm`), audio mentah (`*.wav`, `*.mp3`), `output/`, `.venv/`, dan `node_modules/` selalu masuk `.gitignore`.
   - Seluruh `README.md` proyek atau dokumen yang akan di-commit wajib memakai variabel lingkungan portabel **`%USERPROFILE%`** / **`$env:USERPROFILE`** (bukan path username Windows lokal mentah).
   - Bukti visual untuk dokumentasi GitHub berupa `preview/poster.png` + `preview/contact-sheet.png` ringan (`±300–600 KB`).

---

## 2. Tiga Mode Produksi (Saling Melengkapi)

Engine di workspace bekerja sebagai satu ekosistem terpadu, bukan jalur yang terpisah:

| Mode | Komposisi Engine | Kapan Dipilih |
| :--- | :--- | :--- |
| **Mode A — HyperFrames + Audio Suite Lemo-Opuscar** | Stage `HyperFrames` (`HTML/CSS + GSAP + Registry`) + dapur audio lokal (`tts_expressive.py`, `sfx.py`, `sampler.py`, `pluck.py`, `srt.py`, `mux.sh`) | *Product launch*, *explainer* antarmuka/layanan modern, *kinetic typography*, data/chart. |
| **Mode B — Lemo-Opuscar Pure** | 1 dari 99 gaya di `lemo-opuscar/styles/<slug>/STYLE.md` + `core/render` & `core/audio` + Live Preview `scripts/lemo-preview.mjs` | Film pendek artistik penuh (*stick-explainer*, *watercolor*, *risograph*, *blueprint*, *film noir*, *pixel RPG*, dll.). |
| **Mode C — Hybrid** | `HyperFrames` sebagai stage utama yang menyisipkan scene deterministik `Canvas 2D`/`Three.js`/`algorithmic-art` via event `hf-seek` dan/atau klip rekaman nyata `video-demo` (`<video>`), dipadukan Audio Suite lokal | Demo web app nyata berbalut motion graphics editorial, visual 3D/shader kustom, atau intro/outro artistik. |

**Aturan Pemilihan Mode:** Pada Tahap 0, **gali Gaya Visual & Bahasa Gerak dulu** bersama tautan video referensinya, baru **otomatis rekomendasikan 1 mode paling tepat** untuk disetujui user sebelum masuk Tahap 1.

---

## 3. Kebijakan Aktivasi Skill (Wajib vs Kondisional)

- **Selalu Wajib (Core Skills):**
  - `humanizer` — wajib dipakai saat menyusun & memoles naskah VO serta seluruh teks *on-screen* di semua mode.
  - `frontend-design` — wajib dipakai pada Tahap 1 Mode A/C untuk arah desain visual dan `SPEC.md`.
  - `impeccable` — wajib dipakai pada Tahap 5 Visual QA Mode A/C **khusus mode playbook/referensi** (`reference/craft-floor.md`, `audit`, `polish`, `critique`). **DILARANG** menjalankan skrip launcher `scripts/impeccable` yang mengunduh biner eksternal ke luar workspace.
- **Kondisional (*On-Demand* sesuai kebutuhan proyek):**
  `research` *(wajib saat membedah dokumen/kode besar)*, `hyperframes-registry`, 5 skill `gsap-*` (`gsap-core`, `gsap-timeline`, `gsap-plugins`, `gsap-utils`, `gsap-performance`), `algorithmic-art`, 6 skill `threejs-*` (`fundamentals`, `materials`, `lighting`, `animation`, `postprocessing`, `shaders`), `video-demo`, `figma`, `style-sampling`, `media-use`, `remotion-to-hyperframes`, `slideshow`, dan `brand-guidelines` *(hanya jika user secara eksplisit meminta estetika editorial bergaya Anthropic)*.

---

## 4. Pipeline Produksi 7 Tahap & Approval Gates

> **ATURAN GATE:** Agent **DILARANG KERAS** melompati **Gate #1**, **Mini-Gate Audisi Audio**, **Gate #2A/2B** (jika diminta/diaktifkan), atau **Gate #3**, kecuali user menulis perintah eksplisit seperti *"skip gate / langsung render"*.

### Tahap 0 — Riset Bahan Terisolasi & Wawancara Gaya + Voice Direction (`/grill-me`)
1. **Isolasi Riset Bahan (jika ada kode/dokumen/URL besar):**
   - Jalankan subagent `research` untuk mengaudit sumber dan menghasilkan **`projects/NN-slug/FACTS.md`** (`≤ 3–5 KB` berisi identitas, alur resmi, angka terverifikasi, aset).
2. **Wawancara Interaktif Singkat (`ask_question`, 1 pertanyaan per giliran, opsi `(Recommended)` di posisi 1):**
   - **Gaya Visual & Bahasa Gerak DULU (Sebelum Pilih Mode):** Sajikan **3–4 kandidat gaya lintas-ekosistem** (minimal **2 gaya konkret dari 99 gaya `lemo-opuscar`** lengkap dengan **tautan galeri video demo asli `https://lemomo-ai.github.io/lemo-opuscar/`** + nama Inggris/slug-nya, dan **1 opsi `HyperFrames`/`Hybrid`**). Tanyakan pula pantangan visual user (mis. *"jangan terasa seperti slide presentasi"*).
   - **Voice Direction Lengkap:** Tanyakan **(a) Jenis suara** (`id-ID-ArdiNeural` / `id-ID-GadisNeural` / rekaman sendiri / tanpa VO), **(b) Nuansa & energi** (*conversational* hangat / antusias Reels / dokumenter berwibawa / formal), **(c) Dinamika tempo & jeda dramatis**, dan **(d) Gaya subtitle** (kinetik editorial *burn-in* vs `.srt` saja; *burn-in* direkomendasikan untuk `9:16`).
   - **Format, Durasi, Aset & Gate #2:** Rasio (`16:9` / `9:16`), target durasi, izin *labeled placeholder* bila aset belum lengkap, dan apakah mengaktifkan **Gate #2 (Stills → Live Preview)**.
   - **Konfirmasi Rekomendasi Mode (A / B / C):** Berikan 1 rekomendasi final berdasarkan gaya yang sudah dipilih user. (Untuk Mode B gaya bertanda `✦`, jalankan `core/image/gen_image.py --check` dan konfirmasi generator gambar).
3. **Keluaran:** `projects/NN-slug/BRIEF.md` + `FACTS.md`. *(Jika user secara eksplisit meminta "skip wawancara", lewati langsung ke Tahap 1 dengan menyatakan asumsi secara terbuka).*

### Tahap 1 — Cerita, Kontrak Anti-Slideware/Anti-Jipling & Draf Naskah (**GATE #1 — WAJIB**)
- **Skills aktif:** `hyperframes` (`references/story.md`, `references/spec.md`) atau `lemo-opuscar` (`AGENTS.md`, `DIRECTOR.md`), `frontend-design` (Mode A/C), `humanizer`.
- **Aturan Kualitas Cerita & Visual:**
  - **Aturan Anti-Slideware:** Jika sebuah shot masih terbaca wajar sebagai slide PowerPoint statis (judul atas + kotak poin di tengah), desain shot itu **gagal** dan wajib diganti metafora gerak fisik.
  - **Tabel Adaptasi Konteks (*Anti-Jipling*) di `TREATMENT.md` / `SPEC.md`:** Wajib menuliskan *(1) apa yang dipertahankan dari style referensi* (palet, tekstur, fisika gerak, tipografi) vs *(2) apa yang dimodifikasi 100% mengikuti konteks proyek* (batas jumlah pengulangan motif figur asli & daftar bentuk vektor relevan topik).
- **Alur:**
  - **Mode A / C:** Tulis `STORYLINES.md` (3 opsi berbeda *world/device/form*) + draf naskah VO frasa mikro (`voice/lines.json`) dipoles `humanizer`.
  - **Mode B:** Tulis `TREATMENT.md` (3 kandidat struktur, logline, benchmark, *shot list*, *beat sheet*, *cue map*, *sound design*, + **Tabel Adaptasi Konteks**) **sebelum** membuka `DEMO.md` atau kode demo gaya, beserta draf `voice/lines.json` (frasa mikro dengan variasi `rate`/`pitch` & `keywords`).
  - **STOP — GATE #1:** Tunggu user memilih 1 storyline/struktur (atau campurannya) dan menyetujui draf naskah VO sebelum TTS dibuat.
  - **Pasca-Gate #1:** Kunci `SPEC.md` (Mode A/C) atau finalisasi `TREATMENT.md` (Mode B).

### Tahap 2 — Produksi Audio (*Voice-First* Ekspresif) & **Mini-Gate Audisi Audio**
- **Engine VO Baku:** Gunakan **`.agents/skills/motion-studio-workflow/scripts/tts_expressive.py`**:
  ```powershell
  lemo-opuscar\.venv\Scripts\python.exe .agents\skills\motion-studio-workflow\scripts\tts_expressive.py projects\NN-slug [--audition-voice id-ID-GadisNeural]
  ```
  Skrip ini memecah narasi menjadi frasa lisan ekspresif dengan `WordBoundary` per kata, membuat `voice/wav/<id>.wav`, `dur.json`, `schedule.json`, `words.json`, `cues.json`, dan merakit **`voice/audition.wav`** utuh sesuai jadwal jeda napas/hening. *(Jika user menyetor rekaman pribadi, transkrip dengan `faster-whisper`; jika tanpa VO, lewati langkah TTS).*
- **BGM, SFX & Subtitle:** Rakit BGM + SFX prosedural (`sfx.py`, `sampler.py`, `pluck.py`, atau audio berlisensi via `yt-dlp`), jalankan `hyperframes beats` untuk *beat grid* (Mode A/C), dan ekspor `.srt` via `srt.py` (default `.srt` saja; *burn-in* hanya jika diminta atau `9:16` vertikal).
- **STOP — MINI-GATE AUDISI AUDIO:** Sebelum menulis 1 baris kode animasi, serahkan **`voice/audition.wav`** (dan `audition-alt.wav` bila ada) ke user untuk dicek pelafalan, intonasi, tempo, dan jedanya. *(Revisi suara di titik ini biayanya nyaris nol!).*
- **Penghematan Konteks:** Setelah Gate #1 & Audisi Audio disetujui, rekomendasikan `/compact` bila percakapan sudah mulai panjang.

### Tahap 3 — Gate #2 Bertahap (`2A` Stills Only → `2B` Live Preview) *(Opsional bila diminta di Tahap 0)*
- **Gate #2A — Stills Only (0 Render Video):**
  - **Mode A / C:** Pose setiap shot pada `index.html`, tangkap ke `boards/stills/`, buat `STORYBOARD.md` + `boards/storyboard.html` / contact sheet.
  - **Mode B:** Render *model sheet* & seluruh *shot stills* (`still.mjs`) lalu gabungkan ke **`boards/contact-sheet.jpg`** (`sheet.py`).
  - **Disiplin Vision:** Agent **hanya membuka 1 file `boards/contact-sheet.jpg`** (plus `model-sheet.jpg` bila ada) untuk mengaudit semua frame sekaligus; **jangan** membuka seluruh `shot-01..NN.jpg` satuan.
  - **STOP — GATE #2A:** Serahkan `contact-sheet.jpg` / `storyboard.html` ke user. **Lakukan semua revisi bentuk, komposisi, jumlah elemen, dan keterbacaan teks di tahap gambar diam ini sampai user puas** — *dilarang keras merender video sebelum Gate #2A beres*.
- **Gate #2B — Live Preview Interaktif (Bukan Render Video Berulang):**
  - Jalankan Live Preview agar user mengecek gerak, transisi, dan sinkronisasi audio secara instan:
    - **Mode A / C:** `node .agents/skills/hyperframes/scripts/plugin-cli.mjs preview projects/NN-slug`
    - **Mode B:** `node .agents/skills/motion-studio-workflow/scripts/lemo-preview.mjs projects/NN-slug --port 3020` *(jalankan dengan `BypassSandbox: true` bila user akan membukanya langsung dari browser Windows)*
  - Render `motion-proof.mp4` pendek (10–15 detik) **hanya opsional 1x** apabila Live Preview browser mengalami *frame drop/stutter* berat pada kanvas/shader kompleks.

### Tahap 4 — Produksi & Coding Animasi (`60 FPS` / FPS `STYLE.md`)
- **Skills aktif (sesuai kebutuhan):** `hyperframes`, `hyperframes-cli`, `hyperframes-registry`, 5 skill `gsap-*`, `algorithmic-art`, 6 skill `threejs-*`, `video-demo`, `figma`, `style-sampling`.
- **Keluaran:**
  - **Mode A / C:** `index.html`, `compositions/*.html`, `assets/`, dan `<name>.motion.json`.
  - **Mode B:** Kode scene `render(t)` deterministik di dalam `projects/NN-slug/` (dilarang mengedit folder `lemo-opuscar/styles/` atau `lemo-opuscar/core/`).

### Tahap 5 — Visual QA, Audit & Preview Akhir (**GATE #3 — WAJIB**)
- **Mode A / C:** `check --json` → perbaiki error & timbang warning → `snapshot --review` (cek 3 lembar QA termasuk lebar HP `360 px`) → audit & polish memakai playbook `impeccable` (`reference/craft-floor.md`) → tulis `REVIEW.md` → buka `hyperframes preview`.
- **Mode B:** `still.mjs`, `sheet.py` (cek 1 grid saja!), `readcheck.mjs`, audit terhadap `STYLE.md` & **Tabel Adaptasi Konteks**, tulis `REVIEW.md`, dan buka `lemo-preview.mjs`.
- **STOP — GATE #3:** Laporkan ringkasan `REVIEW.md`, tautan Live Preview, dan **konfirmasi ulang seluruh daftar *labeled placeholder* / angka `[ilustratif]` bila masih ada**. Tunggu izin user sebelum render penuh.

### Tahap 6 — Render Final, Mastering `-14 LUFS`, Bukti Visual & Human QA
- **Render Video & Audio:**
  - **Mode A / C:** `hyperframes render -o output/<slug>.mp4` (atau per bab bila > 2–3 menit lalu gabung FFmpeg), mastering **`-14 LUFS`** (*ducking* BGM saat VO bicara), verifikasi `ffprobe`, `blackdetect`, `ebur128`, & `hyperframes audio --json`.
  - **Mode B:** `core/render/video.mjs` (`--fps` sesuai `STYLE.md`) + `core/render/mux.sh` (`-14 LUFS`) + verifikasi `ffprobe`, `blackdetect`, `ebur128`.
- **Buat Bukti Visual Dokumentasi:** Hasilkan `preview/poster.png` (hero frame) dan `preview/contact-sheet.png` (grid terkompresi `±300–600 KB`) dari hasil render final.
- **Wajib Human Audio/Video QA:** Beri tahu lokasi file `.mp4` final dan minta user **menonton serta mendengarkannya secara langsung**.

### Tahap 7 — Dokumentasi Proyek & Single Local Git Commit
> **Hanya dijalankan SETELAH user mengonfirmasi `.mp4` final lulus Human QA.**
1. Tulis `projects/NN-slug/README.md` mengikuti [references/project-readme-template.md](references/project-readme-template.md) (memakai `$env:USERPROFILE`, bukan username Windows lokal, dan menyematkan `preview/poster.png` + `preview/contact-sheet.png`).
2. Perbarui tabel **Katalog Portofolio Proyek** di `README.md` root.
3. Jalankan scan kebersihan (`git status --short` + pastikan tidak ada `.mp4`, `.wav`, `.mp3`, `.venv`, `node_modules`, atau path username lokal).
4. Lakukan **1x `git commit` lokal**. **Selalu minta izin user sebelum `git push`** ke GitHub.

---

## 5. Matriks Tahap, Skill, Artefak & Peran User

| Tahap | Skill / Tool Utama | Artefak Resmi | Peran / Keputusan User |
| :--- | :--- | :--- | :--- |
| **0. Riset & Brief** | `research` (subagent), `ask_question`, Galeri Lemo-Opuscar | `FACTS.md` (`≤ 5 KB`), `BRIEF.md` | Jawab `/grill-me` (Gaya via video demo, Voice Direction, Mode A/B/C) |
| **1. Cerita & Spec** | `hyperframes` / `lemo-opuscar`, `frontend-design`, `humanizer` | `STORYLINES.md` / `TREATMENT.md`, `SPEC.md`, `voice/lines.json` | **GATE #1:** Pilih cerita, cek Tabel Anti-Jipling, setujui naskah VO |
| **2. Audio-First** | `tts_expressive.py`, `sfx.py`, `sampler.py`, `pluck.py`, `yt-dlp`, `srt.py` | `voice/audition.wav`, `dur.json`, `schedule.json`, `words.json`, `.srt` | **Mini-Gate Audisi:** Dengarkan `audition.wav` & koreksi pelafalan/intonasi |
| **3A. Stills (Opsional)** | `snapshot`, `still.mjs`, `sheet.py` *(1 grid Vision)* | `boards/contact-sheet.jpg` / `storyboard.html` | **GATE #2A:** Revisi bentuk, tata letak & teks di still frames |
| **3B/4. Coding & Preview** | `lemo-preview.mjs`, `hyperframes preview`, `registry`, `gsap-*`, `threejs-*`, `video-demo` | `index.html`, `src/` / `compositions/`, `<name>.motion.json` | **GATE #2B:** Cek gerak & sinkronisasi audio di Live Preview browser |
| **5. QA Akhir** | `check`, `snapshot --review`, `impeccable` (playbook), `readcheck.mjs` | `REVIEW.md`, Live Preview | **GATE #3:** Review akhir, konfirmasi placeholder, beri izin render final |
| **6. Render & Mix** | `render`, `video.mjs`, `mux.sh`, `ffmpeg`, `ffprobe` | `output/<slug>.mp4` *(ignored)*, `preview/poster.png`, `contact-sheet.png` | **Human QA:** Tonton & dengarkan langsung `.mp4` final |
| **7. Docs & Git** | `git`, `project-readme-template.md` | `projects/NN-slug/README.md`, root `README.md`, 1x local commit | Konfirmasi lulus QA & beri izin bila ingin `git push` |

---

## 6. Input Mandiri Wajib dari User (Tidak Bisa Digantikan Agent)

- **Fakta & klaim resmi:** nama produk/instansi, angka statistik asli, daftar fitur aktual, kutipan, atau URL resmi.
- **Aset identitas & hak cipta:** logo resmi resolusi tinggi, foto/video internal, font khusus berlisensi, atau rekaman suara pribadi.
- **Akses privat:** kredensial login web app untuk `video-demo` atau API key layanan eksternal.
- **Generator gambar eksternal:** wajib bila memilih 1 dari 3 gaya bertanda `✦` di `lemo-opuscar`.
- **Audisi Audio & Human QA:** mendengarkan `voice/audition.wav` di Tahap 2 serta menonton/mendengar `.mp4` final di Tahap 6.
- **Remote GitHub & `git push`:** pembuatan repositori remote serta persetujuan eksplisit sebelum push.

---

## 7. Struktur Standar Proyek (`projects/NN-slug/`)

```text
projects/NN-slug/
├── README.md          # Dokumentasi final proyek & cara render ulang ($env:USERPROFILE)
├── FACTS.md           # Ringkasan fakta terverifikasi dari riset terisolasi (≤ 5 KB)
├── BRIEF.md           # Kesepakatan Tahap 0 (Gaya, Voice Direction, Mode, Gate)
├── STORYLINES.md      # Mode A/C: 3 kandidat storyline (Gate #1)
├── TREATMENT.md       # Mode B: treatment, Tabel Anti-Jipling, shot list, cue map
├── SPEC.md            # Mode A/C: spesifikasi angka eksak, BANNED & daftar placeholder
├── STORYBOARD.md      # Opsional (Gate #2A): daftar shot & audio tiap frame
├── REVIEW.md          # Hasil audit visual & teknis pra-render (Gate #3)
├── boards/            # Opsional: contact-sheet.jpg, model-sheet.jpg, storyboard.html, stills/
├── voice/             # lines.json, dur.json, schedule.json, words.json, cues.json, audition.wav (.wav/.mp3 di-ignore)
├── assets/            # Font lokal, logo SVG/PNG resmi, audio BGM/SFX lokal
├── compositions/      # Mode A/C: scene HTML per segmen (atau src/ untuk Mode B)
├── scripts/           # Skrip kustom proyek (jika ada di luar skrip studio bersama)
├── index.html         # Komposisi utama
├── preview/           # poster.png & contact-sheet.png ringan untuk README GitHub
└── output/            # File .mp4 final & .srt (mp4 lokal saja, diabaikan .gitignore)
```
