---
name: motion-studio-workflow
description: Orchestrator SOP untuk memulai dan memproduksi proyek video motion graphics, explainer, short film berbasis kode, atau web app demo di workspace AI Motion Studio (HyperFrames, Lemo-Opuscar, Video-Demo, Audio Suite, QA 60 FPS, dan dokumentasi Git). Gunakan setiap kali user memulai proyek video baru atau meminta alur produksi studio.
---

# AI Motion Studio — Workflow Produksi End-to-End

Skill ini adalah SOP orkestrasi utama untuk memproduksi video motion graphics di workspace **AI Motion Studio** dari wawancara konsep hingga render final dan dokumentasi Git yang rapi. Untuk panduan alur kerja dari sudut pandang user (*playbook*), lihat [USER_WORKFLOW.md](../../../USER_WORKFLOW.md).

---

## 1. Aturan Ketat, Guardrails & Batasan Teknis

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
5. **Kebijakan Aset & Fakta Belum Lengkap:**
   - Agent **dilarang keras** mengarang angka/klaim fakta atau menggambar logo resmi palsu secara diam-diam.
   - Jika fakta, angka final, atau aset resmi belum tersedia saat mulai dan user mengizinkan lanjut dulu, gunakan *labeled placeholder* / angka bertanda **`[ilustratif]`** yang **wajib dicatat di `SPEC.md` dan `REVIEW.md`**, lalu **dikonfirmasi ulang sebelum render final di Gate #3**.
6. **Ketergantungan Jaringan Audio & Kebersihan Git:**
   - `edge-tts` (`lemo-opuscar/.venv/Scripts/python.exe`) membutuhkan akses internet saat sintesis kalimat baru; hasil `.mp3`/`.wav` di-cache lokal agar render ulang bersifat offline/deterministik.
   - Output render (`*.mp4`, `*.webm`), audio hasil sintesis/mix (`*.wav`, `*.mp3`), `output/`, `.venv/`, dan `node_modules/` selalu masuk `.gitignore`. Bukti visual untuk dokumentasi GitHub berupa `preview/poster.png` + `preview/contact-sheet.png` ringan (`±300–600 KB`).

---

## 2. Tiga Mode Produksi (Saling Melengkapi)

Engine di workspace bekerja sebagai satu ekosistem terpadu, bukan jalur yang terpisah:

| Mode | Komposisi Engine | Kapan Dipilih |
| :--- | :--- | :--- |
| **Mode A — HyperFrames + Audio Suite Lemo-Opuscar** | Stage `HyperFrames` (`HTML/CSS + GSAP + Registry`) + dapur audio lokal Lemo-Opuscar (`tts_zh.py`, `sfx.py`, `sampler.py`, `pluck.py`, `srt.py`, `mux.sh`) | *Product launch*, *explainer* aplikasi/layanan, *kinetic typography*, infografis/data, UI motion. |
| **Mode B — Lemo-Opuscar Pure** | 1 dari 99 gaya di `lemo-opuscar/styles/<slug>/STYLE.md` + `core/render` & `core/audio` | Film pendek artistik penuh (*watercolor*, *risograph*, *blueprint*, *film noir*, *pixel RPG*, dll.). |
| **Mode C — Hybrid** | `HyperFrames` sebagai stage utama yang menyisipkan scene deterministik `Canvas 2D`/`Three.js`/`algorithmic-art` via event `hf-seek` dan/atau klip rekaman nyata `video-demo` (`<video>`), dipadukan Audio Suite `lemo-opuscar` | Demo web app nyata berbalut motion graphics editorial, visual 3D/shader kustom, atau intro/outro artistik. |

**Aturan Pemilihan Mode:** Pada akhir Tahap 0, agent menganalisis hasil wawancara brief lalu **otomatis merekomendasikan 1 mode paling tepat** (beserta pilihan gaya bila Mode B) untuk disetujui atau diganti oleh user sebelum masuk Tahap 1.

---

## 3. Kebijakan Aktivasi Skill (Wajib vs Kondisional)

- **Selalu Wajib (Core Skills):**
  - `humanizer` — wajib dipakai saat menyusun & memoles naskah VO serta seluruh teks *on-screen* di semua mode.
  - `frontend-design` — wajib dipakai pada Tahap 1 Mode A/C untuk arah desain visual dan `SPEC.md`.
  - `impeccable` — wajib dipakai pada Tahap 5 Visual QA Mode A/C **khusus mode playbook/referensi** (`reference/craft-floor.md`, `audit`, `polish`, `critique`). **DILARANG** menjalankan skrip launcher `scripts/impeccable` yang mengunduh biner eksternal ke luar workspace.
- **Kondisional (*On-Demand* sesuai kebutuhan proyek):**
  `hyperframes-registry`, 5 skill `gsap-*` (`gsap-core`, `gsap-timeline`, `gsap-plugins`, `gsap-utils`, `gsap-performance`), `algorithmic-art`, 6 skill `threejs-*` (`fundamentals`, `materials`, `lighting`, `animation`, `postprocessing`, `shaders`), `video-demo`, `figma`, `style-sampling`, `media-use`, `remotion-to-hyperframes`, `slideshow`, dan `brand-guidelines` *(hanya jika user secara eksplisit meminta estetika editorial bergaya Anthropic)*.

---

## 4. Pipeline Produksi 7 Tahap & 3 Approval Gates

> **ATURAN GATE:** Agent **DILARANG KERAS** melompati **Gate #1** atau **Gate #3** (serta **Gate #2** bila user memintanya di awal), kecuali user menulis perintah eksplisit seperti *"skip gate / langsung render"*.

### Tahap 0 — Wawancara Brief Singkat (`/grill-me`) & Pemilihan Mode
- **Tujuan:** Mematangkan konsep dan mengunci asumsi sebelum menulis dokumen/kode.
- **Cara Kerja:** Lakukan wawancara interaktif singkat **satu pertanyaan per giliran** menggunakan `ask_question` (opsi `(Recommended)` selalu di urutan pertama) untuk menggali:
  1. Tujuan, target audiens, serta fakta/angka/aset resmi yang sudah dimiliki user (dan izin memakai *labeled placeholder* jika ada aset yang belum siap).
  2. Rasio layar (`1920×1080` 16:9 atau `1080×1920` 9:16), target durasi, bahasa, dan preferensi audio/subtitle bila ingin berbeda dari default studio.
  3. Apakah user ingin meninjau **Gate #2 Storyboard Visual** sebelum animasi dikodekan.
  4. Konfirmasi rekomendasi **Mode (A / B / C)** dari agent (untuk Mode B dengan gaya bertanda `✦`, jalankan `core/image/gen_image.py --check` dan konfirmasi ketersediaan generator gambar).
- *(Pengecualian: jika user secara eksplisit meminta "skip wawancara", lewati langsung ke Tahap 1 dengan menyatakan semua asumsi secara terbuka).*
- **Keluaran:** Buat folder proyek `projects/NN-slug/`.

### Tahap 1 — Cerita, Draf Naskah VO & Art Direction (**GATE #1 — WAJIB**)
- **Skills aktif:** `hyperframes` (`references/story.md`, `references/spec.md`) atau `lemo-opuscar` (`AGENTS.md`, `DIRECTOR.md`), `frontend-design` (Mode A/C), `humanizer`.
- **Alur:**
  - **Mode A / C:** Tulis `STORYLINES.md` berisi **3 opsi storyline berbeda** (*world*, *device*, *form* yang kontras, rekomendasi utama di posisi pertama + alasan) beserta **draf naskah VO & teks layar** (`voice/lines.json`) yang sudah dipoles `humanizer` (teks layar ringkas dan tidak mengulang kalimat VO kata per kata).
  - **Mode B:** Tulis `TREATMENT.md` (3 kandidat struktur, logline, benchmark, *shot list*, *beat sheet*, *cue map*, tabel *sound design*) **sebelum** membuka `DEMO.md` atau kode demo gaya, beserta draf `voice/lines.json` (dipoles `humanizer`).
  - **STOP — GATE #1:** Sajikan 3 opsi cerita + draf naskah VO kepada user dan **tunggu keputusan user** (bisa memilih 1 opsi, menggabungkan, atau merevisi naskah).
  - **Pasca-persetujuan Gate #1:** Kunci spesifikasi teknis final ke `SPEC.md` (Mode A/C — seluruh kata sifat diubah ke angka eksak + daftar `BANNED` + daftar *labeled placeholder* bila ada) atau finalisasi `TREATMENT.md` (Mode B).

### Tahap 2 — Produksi Audio (*Voice-First*) & Subtitle Default
- **Tools aktif:** `lemo-opuscar/.venv/Scripts/python.exe`, `lemo-opuscar/core/tts/tts_zh.py`, `lemo-opuscar/core/audio/` (`sfx.py`, `sampler.py`, `pluck.py`), `yt-dlp`, `hyperframes beats`, `lemo-opuscar/core/render/srt.py`.
- **Standar Default Studio:**
  1. **Voice-First:** Generate audio VO Bahasa Indonesia per kalimat via `tts_zh.py` (`id-ID-ArdiNeural` Pria / `id-ID-GadisNeural` Wanita) → menghasilkan `WAV 24 kHz` auto-trim + `dur.json`. Atur penempatan tiap segmen dengan jeda napas **`0.8–1.4 detik`** agar tidak tumpang-tindih. *(Jika user menyetor rekaman suara sendiri, transkrip dengan `faster-whisper`; jika user memilih tanpa VO, lewati langkah TTS).*
  2. **Musik & SFX:** Rakit BGM + SFX prosedural (`sfx.py`, `sampler.py`, `pluck.py`, atau referensi audio berlisensi via `yt-dlp`) dan jalankan `hyperframes beats` untuk memperoleh *beat grid* guna sinkronisasi animasi.
  3. **Subtitle:** Secara default **ekspor file `.srt` saja** via `srt.py`. Subtitle di-*burn-in* permanen ke video hanya bila diminta eksplisit oleh user atau untuk video vertikal `9:16`.

### Tahap 3 — Look Proof & Storyboard Visual *(Opsional — **GATE #2** bila diminta)*
- **Skills aktif:** `hyperframes` (`references/storyboard.md`, `references/storyboard-format.md`) atau `lemo-opuscar` (`DIRECTOR.md` §5), `frontend-design`, `impeccable`.
- **Alur (hanya berhenti jika user meminta Gate #2 di Tahap 0):**
  - **Mode A / C:** Pose setiap shot pada `index.html`, tangkap ke `boards/stills/`, tulis `STORYBOARD.md` + `boards/storyboard.html`, tampilkan di Preview Studio, lalu **STOP — GATE #2** menunggu persetujuan.
  - **Mode B:** Render 3 *style frames* (`still.mjs`) dan grid 6–9 shot (`sheet.py`) sesuai `STYLE.md`, lalu **STOP — GATE #2** menunggu persetujuan.

### Tahap 4 — Produksi & Coding Animasi (`60 FPS` / FPS `STYLE.md`)
- **Skills aktif (sesuai kebutuhan):** `hyperframes`, `hyperframes-cli`, `hyperframes-registry`, 5 skill `gsap-*`, `algorithmic-art`, 6 skill `threejs-*`, `video-demo` (bila menangkap rekaman web app live), `figma`, `style-sampling`.
- **Keluaran:**
  - **Mode A / C:** `index.html`, `compositions/*.html`, aset lokal di `assets/`, dan `<name>.motion.json` untuk asersi timeline.
  - **Mode B:** Kode scene `render(t)` deterministik di dalam `projects/NN-slug/` (dilarang mengedit langsung folder `lemo-opuscar/styles/` atau `lemo-opuscar/core/`).

### Tahap 5 — Visual QA, Audit & Preview (**GATE #3 — WAJIB**)
- **Skills & Tools aktif:** `hyperframes check`, `hyperframes snapshot --review`, `impeccable` (mode playbook/referensi), `lemo-opuscar/core/render/` (`still.mjs`, `sheet.py`, `readcheck.mjs`).
- **Alur:**
  - **Mode A / C:** Jalankan `node .agents/skills/hyperframes/scripts/plugin-cli.mjs check --json` → perbaiki error & timbang setiap warning → jalankan `snapshot --review` (3 lembar QA termasuk lebar HP `360 px`) → audit kontras, spasi, dan tipografi memakai playbook `impeccable` (`reference/craft-floor.md`) → tulis `REVIEW.md` → buka `hyperframes preview`.
  - **Mode B:** Render sample frames + contact sheet (`sheet.py`) + cek keterbacaan teks (`readcheck.mjs`) terhadap `STYLE.md` → tulis `REVIEW.md`.
- **STOP — GATE #3:** Laporkan ringkasan `REVIEW.md`, link Preview Studio, dan **konfirmasi ulang seluruh daftar *labeled placeholder* / angka `[ilustratif]` jika masih ada**. Tunggu lampu hijau user sebelum render penuh.

### Tahap 6 — Render Final, Mastering `-14 LUFS`, Bukti Visual & Human QA
- **Render Video & Audio:**
  - **Mode A / C:** Jalankan `node .agents/skills/hyperframes/scripts/plugin-cli.mjs render -o output/<slug>.mp4` (atau render per bab bila > 2–3 menit lalu gabungkan via FFmpeg), normalisasi/mix audio ke **`-14 LUFS`** (dengan *ducking* BGM saat VO bicara), dan periksa hasil via `ffprobe` + `hyperframes audio <video> --json`.
  - **Mode B:** Jalankan `core/render/video.mjs` (sesuai FPS `STYLE.md`), mux video + audio pada `-14 LUFS` dengan `core/render/mux.sh`, lalu cek dengan `ffprobe`.
- **Buat Bukti Visual Dokumentasi:** Hasilkan `preview/poster.png` (hero frame / frame 0) dan `preview/contact-sheet.png` (grid terkompresi `±300–600 KB`) dari hasil render final.
- **Wajib Human Audio/Video QA:** Beri tahu user lokasi file `.mp4` final dan minta user **menonton serta mendengarkannya secara langsung** (agent memverifikasi angka loudness & durasi secara teknis, tidak bisa menilai rasa intonasi pelafalan atau keseimbangan musik dengan telinga).

### Tahap 7 — Dokumentasi Proyek & Single Local Git Commit
> **Hanya dijalankan SETELAH user mengonfirmasi hasil `.mp4` final lulus Human QA.**
1. Tulis `projects/NN-slug/README.md` memakai templat [references/project-readme-template.md](references/project-readme-template.md) (lengkap dengan sematan `preview/poster.png` dan `preview/contact-sheet.png`).
2. Perbarui tabel **Katalog Portofolio Proyek** di `README.md` root.
3. Periksa `git status` untuk memastikan tidak ada `.mp4`, `.webm`, `.wav`, `.mp3`, `.venv`, atau `node_modules` yang ter-stage.
4. Lakukan **1x `git commit` lokal** yang rapi untuk proyek tersebut. **Selalu minta izin user sebelum `git push`** ke GitHub.

---

## 5. Matriks Tahap, Skill, Artefak & Peran User

| Tahap | Skill / Tool Utama | Artefak Resmi | Peran / Keputusan User |
| :--- | :--- | :--- | :--- |
| **0. Brief** | `motion-studio-workflow`, `ask_question` | `projects/NN-slug/` | Menjawab wawancara singkat, memberi fakta/aset, menyetujui Mode A/B/C |
| **1. Cerita & Spec** | `hyperframes` / `lemo-opuscar`, `frontend-design`, `humanizer` | `STORYLINES.md` / `TREATMENT.md`, `voice/lines.json`, `SPEC.md` | **GATE #1:** Memilih storyline & menyetujui draf naskah VO |
| **2. Audio-First** | `tts_zh.py`, `sfx.py`, `sampler.py`, `pluck.py`, `yt-dlp`, `beats`, `srt.py` | `voice/wav/*.wav` *(ignored)*, `dur.json`, `.srt` | Memberi rekaman suara pribadi atau musik khusus *(jika tidak pakai default)* |
| **3. Storyboard** *(Opsional)* | `hyperframes` (`storyboard.md`), `impeccable`, `sheet.py` | `STORYBOARD.md`, `boards/storyboard.html`, `boards/stills/` | **GATE #2:** Menyetujui *still frames* bila diminta di awal |
| **4. Produksi Kode** | `hyperframes-registry`, `gsap-*`, `algorithmic-art`, `threejs-*`, `video-demo` | `index.html`, `compositions/*.html`, `assets/`, `<name>.motion.json` | Memberi kredensial/login app bila merekam layar privat via `video-demo` |
| **5. QA & Preview** | `hyperframes check`, `snapshot --review`, `impeccable`, `readcheck.mjs` | `REVIEW.md`, Preview Studio | **GATE #3:** Review preview, verifikasi ulang placeholder, izin render final |
| **6. Render & Mix** | `hyperframes render`, `video.mjs`, `mux.sh`, `ffmpeg`, `ffprobe` | `output/<slug>.mp4` *(ignored)*, `preview/poster.png`, `contact-sheet.png` | **Human QA:** Menonton & mendengar langsung hasil `.mp4` final |
| **7. Docs & Git** | `git`, `project-readme-template.md` | `projects/NN-slug/README.md`, root `README.md`, 1x local commit | Mengonfirmasi lulus QA & memberi izin bila ingin `git push` |

---

## 6. Input Mandiri Wajib dari User (Tidak Bisa Digantikan Agent)

- **Fakta & klaim resmi:** nama produk/instansi, angka statistik asli, daftar fitur aktual, kutipan, atau URL resmi.
- **Aset identitas & hak cipta:** logo resmi resolusi tinggi, foto/video internal, font khusus berlisensi, atau rekaman suara pribadi.
- **Akses privat:** kredensial login web app untuk `video-demo` atau API key layanan eksternal.
- **Generator gambar eksternal:** wajib bila memilih 1 dari 3 gaya bertanda `✦` di `lemo-opuscar`.
- **Human Audio/Video QA:** evaluasi akhir intonasi pengucapan istilah, jeda bicara, dan kenyamanan audio pada `.mp4` final.
- **Remote GitHub & `git push`:** pembuatan repositori remote serta persetujuan eksplisit sebelum push.

---

## 7. Struktur Standar Proyek (`projects/NN-slug/`)

```text
projects/NN-slug/
├── README.md          # Dokumentasi final proyek & cara render ulang
├── STORYLINES.md      # Mode A/C: 3 kandidat storyline (Gate #1)
├── TREATMENT.md       # Mode B: director treatment, shot list, cue map
├── SPEC.md            # Mode A/C: spesifikasi angka eksak, BANNED & daftar placeholder
├── STORYBOARD.md      # Opsional (Gate #2): daftar shot & audio tiap frame
├── REVIEW.md          # Hasil audit visual QA pra-render (Gate #3)
├── boards/            # Opsional: storyboard.html & stills/*.png
├── voice/             # lines.json, dur.json, <slug>.srt (.wav/.mp3 di-ignore Git)
├── assets/            # Font lokal, logo SVG, gambar ringan, audio BGM/SFX lokal
├── compositions/      # Mode A/C: scene HTML per segmen (atau src/ untuk Mode B)
├── index.html         # Komposisi utama
├── preview/           # poster.png & contact-sheet.png ringan untuk README GitHub
└── output/            # File .mp4 final (lokal saja, diabaikan .gitignore)
```
