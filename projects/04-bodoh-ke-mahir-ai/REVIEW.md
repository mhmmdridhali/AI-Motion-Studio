# REVIEW: Belajar AI dari Nol — Part 1: Fundamental AI (`projects/04-bodoh-ke-mahir-ai`)

Status: **Rendered & Human QA Verified (Tahap 7 Selesai)**

---

## Ringkasan Audit Otomatis (`studio-audit.mjs --thumb --strict`)

- **Resolusi & Durasi:** `1080 × 1920 px` (`9:16`), `30 FPS`, durasi total **`80.01s`** (`voice/schedule.json`).
- **Hasil Audit Ketat (`boards/audit-report.json`):** `ok: true` | **`0 errors`** | **`0 warnings`** | waktu audit `23.8s`.
- **Keterbacaan (`readCheck`):** **`24` blok teks diaudit, `0` isu**.
- **Lembar Inspeksi Terverifikasi:**
  - `boards/contact-sheet.jpg` (`311.4 KB`, `1310 × 1809 px`)
  - `boards/phone-360.jpg` (`357.0 KB`, `738 × 4038 px`)
  - `boards/seams.jpg` (`349.3 KB`, `864 × 4776 px`)

---

## Checklist 7 Slot Wajib (`visual-immersion.md`)

- [x] **`DEMO.md` + Min. 2 *Native Moves* (`Track 1: Lemo-Opuscar` / `ipad-sketch`)**
  Mengacu pada kontrak gaya `lemo-opuscar/styles/ipad-sketch/STYLE.md` & `DEMO.md` serta menerapkan **5 *Native Moves*** pada 1 kanvas utuh `#F3EADB` (10 shot, 7 zona terhubung):
  1. **Line, then colour** *(Shot 2, Shot 4, Shot 7)*: Garis grafit selesai lebih dulu sebelum sapuan warna *boustrophedon* bergeser (*off-register*).
  2. **Continuous pan/zoom into magnified copy** *(Shot 2 → Shot 3)*: Kamera meluncur mulus mengikuti panah koral dari tangga `01 Fondasi AI` menuju lingkaran kaca pembesar `LLM = Otak` tanpa *cut* mendadak.
  3. **Holes as layers (`OCC`)** *(Shot 5)*: Irisan dada pada eksoskeleton *Harness* membuka panel sirkuit neural koral yang menyambung dari otak terpasang ke kartu tugas tercentang (`= AI AGENT`).
  4. **Re-register a block** *(Shot 10)*: Aura abu-abu/lavender di belakang Murid di-`replace` ke mustard cerah seiring momen `AHA!`.
  5. **Shatter a block + Still drawing** *(Shot 8 & Shot 2/10)*: Peti `Tugas Berat` memecah ruang mini `Seruangan` dengan 72 serpihan fisika (`DYN`) menuju label `HALU!`, sementara tangga `02`–`04` (`Tools`, `Builder`, `Agent`) dibiarkan bergaris putus-putus (*still drawing*).

- [x] **Font & Engine Deterministik Fisik Lokal Terverifikasi (`0` CDN Eksternal, `0` 404 Aset)**
  - Bundel lokal penuh di `assets/fonts/` (`Caveat-Bold.ttf`, `Caveat-Medium.ttf`, `PlusJakartaSans-ExtraBold.ttf`, `PlusJakartaSans-SemiBold.ttf`) dan `assets/glyphs.json`, dimuat lewat `@font-face` + `document.fonts.load(...)`.
  - Track 1 Canvas 2D pure function `window.render(t)` (deterministik tanpa `Math.random()` tanpa seed atau `requestAnimationFrame`).
  - Hasil pemeriksaan URL eksternal di `index.html` & `scenes.js`: **`0` CDN eksternal**, **`0` kesalahan HTTP/aset 404** pada `studio-audit.mjs --strict`.

- [x] **Panggung Penuh, `0` *Dead-Hold > 2.2s*, & Zona Aman `9:16` (`y <= 1360px` tanpa bypass)**
  - Setiap shot panjang memiliki *beat* visual baru tiap `<= 2.2 detik` (termasuk perbandingan skala ekstrem `290×175 px` `1 Stadion` vs `54×42 px` `Seruangan` di Shot 7 dan sekuens bertahap bebas drop FPS via `clusterBoxes` + `IMGS` cache cap di Shot 10).
  - Pita subtitle *chip* berada di **`y: 1196–1290 px`** (bayangan `1297 px`), jauh di bawah batas mutlak `y <= 1360 px`, dengan **`0` atribut bypass** (`data-layout-allow-safe-zone` / `data-layout-ignore` nihil).
  - Kontinuitas seam antar seluruh shot terverifikasi pada `boards/seams.jpg`.

- [x] **Audio Mix & Event-Synced SFX (`out/mix.wav`)**
  - **VO Terkunci:** Duet `gemini-3.8-flash-tts` (`Kore` untuk Murid, `Orus` untuk Mentor) sesuai `voice/schedule.json` (`80.01s`).
  - **Skor Akustik & Ducking Vektor:** Gitar nilon + kontrabas pizzicato + kalimba (`pluck.py`) + shaker lembut, *auto-ducking* tervektorisasi (`uniform_filter1d` + `lfilter`, `-8 dB` + ukiran vokal `300–4000 Hz`).
  - **Foley Sinkron Gerak Nyata:** `312` event dari `events.json` (`pencil: 190`, `write: 36`, `color: 31`, `tap: 36`, `gesture: 9`, `pop: 5`, `light: 4`, `shatter: 1`) menggerakkan suara pena, arsiran warna, tap, geseran kamera, dan serpihan *shatter*.
  - **3 Punchline Silence Dips (`-18 dB`, `~0.45s`):** `s01_mentor:kulitnya@7.68s`, `s03_murid2:Lima@26.86s`, `s08_murid:halu@64.26s`.
  - **Master Verifikasi (`ffprobe` & `loudnorm`):** `out/mix.wav` (`15,361,998 bytes`, `pcm_s16le`, `48000 Hz` stereo, `80.01s`), terukur **`-14.00 LUFS`**, **`-1.29 dBTP`**, `LRA = 4.70` (aktif di Live Preview).

- [x] **Subtitle Sesuai Pilihan `BRIEF.md` (`Short-Form Captions` + Sidecar `.srt`)**
  - Menggunakan *Short-Form / Viral Captions* (lencana `MURID` / `MENTOR`, *chip* kertas krem berbayang blok, sorot kata aktif sinkron ke `voice/words.json`, potongan 1–3 kata dengan `KEEP_PAIRS` penjaga frasa kunci, nonaktif pada `1.05s` penutup akhir).
  - Tersedia sidecar `output/04-bodoh-ke-mahir-ai.srt` (`54` blok cue, `2.83 KB`).

- [x] **Uji Teknis & Privasi**
  - `studio-audit.mjs projects/04-bodoh-ke-mahir-ai --thumb --strict` lulus (`0 errors`, `0 warnings`, `findings: []`).
  - Inspeksi visual lolos pada `boards/contact-sheet.jpg`, `boards/phone-360.jpg` (keterbacaan aman di lebar `360 px`), dan `boards/seams.jpg`.
  - Pemindaian regex privasi pada seluruh kode adegan, naskah, SRT, dan treatment mengonfirmasi **`0` kemunculan** nama tokoh sumber asli, merek sponsor, istilah AI di luar lingkup materi, maupun path host pribadi.

- [x] **Thumbnail Bersih Siap & Rencana Encoding `< 50 MB` (`Tahap 6`)**
  - Komposisi sampul khusus `?thumb=1` (`buildThumbnailMarks`) sudah tervalidasi bersih di panel Cover/Thumbnail pada `boards/contact-sheet.jpg` (`BELAJAR AI DARI NOL — 4 TANGGA AI`, ilustrasi `LLM` + `Harness` + 4 tangga + banner `Otak + Badan + Ukuran Model`, tanpa overlay subtitle) dan siap dirender ke `output/04-bodoh-ke-mahir-ai-thumbnail.jpg`.
  - Rencana render Tahap 6: render frame `1080 × 1920`, `30 FPS` melalui `lemo-opuscar/core/render/video.mjs` (Chrome D3D11 GPU Windows) → muxing dengan `out/mix.wav` → encode `output/04-bodoh-ke-mahir-ai.mp4` memakai `libx264` (`yuv420p`) + AAC `48 kHz` stereo berukuran **`< 50 MB`**, verifikasi `ffprobe`/`blackdetect`/`loudnorm`, lalu tunggu **Human QA** sebelum Tahap 7 cleanup & commit git.

---

## Hasil Verifikasi Render Final (Tahap 6)

- **Video Final (`output/04-bodoh-ke-mahir-ai.mp4`):**
  - **Ukuran File:** `31,043,418` bytes (`29.60 MiB`, wajib `< 50 MB`)
  - **Video Stream (`ffprobe`):** `h264 (High)`, `1080 × 1920` (`9:16`), `30 fps` (`30/1`), `pix_fmt: yuvj420p` (4:2:0 hasil flag `-pix_fmt yuv420p` dari render MJPEG), durasi `80.00s` (`2400` frame), `movflags +faststart`
  - **Audio Stream (`ffprobe`):** `aac (LC)`, `48000 Hz`, `2 channels` (stereo), bitrate ~`196 kb/s`
  - **Deteksi Frame Hitam (`blackdetect`):** `0` kejadian *black frame* sepanjang `2400` frame (`80.00s`)
  - **Loudness Audio Final (`loudnorm`):** `input_i = -14.02 LUFS` · `input_tp = -1.10 dBTP` · `LRA = 4.70`
- **Thumbnail Bersih (`output/04-bodoh-ke-mahir-ai-thumbnail.jpg`):**
  - **Ukuran & Resolusi:** `231,547` bytes (`226.1 KiB`), `1080 × 1920` (`?thumb=1` via `still.mjs`), lolos inspeksi visual tanpa subtitle atau artefak.
- **Status:** **Lulus Human QA** — dilanjutkan ke Tahap 7 (cleanup mezzanine, preview assets, Privacy Scan, dokumentasi, dan local commit).
