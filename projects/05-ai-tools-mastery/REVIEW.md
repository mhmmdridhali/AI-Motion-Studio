# REVIEW.md — Tangga 02: AI Tools Mastery (`05-ai-tools-mastery`)

Status QA: **PASS (`ok=true | errors=0 | warnings=0`)**

---

## 1. Slot Wajib `REVIEW.md` (Checklist Sebelum Render Penuh)

- [x] **`DEMO.md` + Min. 2 *Native Moves* *(Track 1)***
  - Gaya aktif: **Track 1 — `Lemo-Opuscar` Canvas 2D (`ipad-sketch`)** sesuai `STYLE.md` & `DEMO.md`.
  - Menerapkan **5 *Native Moves*** khas `ipad-sketch` di sepanjang 8 zona kertas:
    1. **Line then Colour (S02):** Sketsa ikon mirip logo resmi (`ChatGPT` simpul 6 pita heksagonal, `Claude` 12 pancaran sinar, `Gemini` kilau 4 sudut cekung) digambar kontur grafit terlebih dahulu baru disapu blok warna offset (`BLOB`).
    2. **Re-register a Block (S03 → S04):** Sorot panggung *Grand Jazz Piano* (`C.purple`) di-re-register (`replace: true`) menjadi kuning hangat (`C.mustard`) saat bertransformasi menjadi *Acoustic Pop Guitar*.
    3. **Shatter a Block (S05):** Meja laptop & prompt berulang retak dan pecah menjadi 86 serpihan kertas (`DYN` shards) yang menyatu menjadi stempel kayu `/riset-konten`.
    4. **Holes as Layers (S06):** Dua rumah studio mini beratap pelana (`PROYEK A` & `PROYEK B`) menggunakan `holes: [win1, win2]` untuk menyingkap jendela kertas berisi memori dan dokumen yang terisolasi.
    5. **Follow the Stylus & Still Drawing (S07–S08 & S10):** Kamera mengikuti ujung stylus saat menarik 3 kabel dua arah dari menara `AI HUB` ke Kalender, Catatan, dan Email; di S10 tangga langkah `03` dan `04` dibiarkan berupa sketsa garis putus-putus (*still drawing*) bersama formasi 3 robot `PASUKAN AGEN` dan judul yang ditulis paling akhir (`AI TOOLS MASTERY`).

- [x] **Font & GSAP Fisik Lokal Terverifikasi**
  - 4 font fisik lokal di `assets/fonts/` (`Caveat-Bold.ttf`, `Caveat-Medium.ttf`, `PlusJakartaSans-ExtraBold.ttf`, `PlusJakartaSans-SemiBold.ttf`) + lisensi OFL (`OFL-caveat.txt`, `OFL-pjs.txt`) dan kerangka vektor `glyphs.json` (101 glyph `CB` & 101 glyph `CM`).
  - `0` request ke CDN eksternal, `0` error `404` aset.

- [x] **Panggung Penuh, 0 *Dead-Hold > 2.2s*, Kanvas `y <= 1120px`, Watermark Sesuai `BRIEF.md` & Zona Aman `9:16` (`y <= 1360px`)**
  - Panggung disusun dalam 8 zona ilustrasi (4 baris × 2 kolom) pada zoom kamera seragam (`z = 1.47–1.58`), dengan optimasi penyalinan buffer khusus area *viewport* kamera sehingga bebas *frame drop* di seluruh 10 shot (`S01`–`S10`).
  - `0` temuan `dead_hold`, `0` temuan `first_frame_empty`.
  - Seluruh ilustrasi utama berada di `y <= 1120px` layar (di atas pita subtitle).
  - Watermark: **`Tanpa Watermark`** sesuai `BRIEF.md`.
  - Zona aman subtitle `9:16`: lencana pembicara (`y: 1184–1214px`) dan chip subtitle (`y: 1212–1286px`) terkunci ketat di **`y <= 1286px`** (`<= 1360px`) tanpa atribut bypass validator.

- [x] **Audio Mix & Event-Synced SFX**
  - `out/mix.wav` (`48 kHz` stereo, `133.094s`) aktif di Live Preview dengan badge hijau **`Audio: out/mix.wav (VO+BGM+SFX)`**.
  - Disintesis melalui alur 2-fase dari **579 event** nyata (`events.json`: `pencil`, `color`, `write`, `light`, `tap`, `pop`, `gesture`, `punch`, `shatter`, `lock`, `chime`).
  - Gesekan pensil/tulisan telah diperhalus (`low-pass <= 1.700 Hz`, `-20 dB`, dan `-80%` *speech ducking* saat VO aktif) sehingga hangat dan tidak pernah mengganggu dialog.
  - BGM akustik G-major (`100 BPM`) dengan `-8 dB` *vectorized ducking* saat VO + 4 *punchline silence dips* (`-18 dB`).
  - Hasil ukur `ffmpeg ebur128`:
    - **Integrated Loudness (`I`):** `-14.0 LUFS` (`LRA: 3.2 LU`)
    - **True Peak:** `-1.6 dBFS` (`<= -1.0 dBTP`)
    - **VO-vs-BGM SNR:** `+9.7 dB`

- [x] **Subtitle Sesuai Pilihan `BRIEF.md`**
  - Gaya: **Short-Form / Viral Captions** *burn-in* di Canvas + file sidecar `output/05-ai-tools-mastery.srt` (19 cue).
  - Pengelompokan 1–3 kata dari `voice/words.json` dengan penjaga frasa `KEEP_PAIRS` (`"ai trinity"`, `"kali lipat"`, `"dua arah"`, `"baca pikiran"`, `"proyek a"`, `"proyek b"`, `"asisten pribadi"`, `"100 kali"`, `"200 kali"`, `"2.000 kali"`, dll.).
  - Lencana pembicara **Duet** (`MURID` koral / `MENTOR` teal) aktif dan otomatis disembunyikan pada *final title hold* (`t >= 131.92s`).

- [x] **Uji Teknis & Privasi**
  - `studio-audit.mjs projects\05-ai-tools-mastery --strict --thumb`: **`ok=true | errors=0 | warnings=0`** (`elapsed: 66.7s`).
  - `readCheck`: **52 blok teks kanvas, 0 isu** (0 tumpang-tindih, 0 kontras rendah, 0 terpotong tepi).
  - `boards/contact-sheet.jpg` (`285.5 KB`), `boards/phone-360.jpg` (`327.2 KB`), dan `boards/seams.jpg` (`353.0 KB`) lolos inspeksi visual.
  - **Privasi:** Hanya menggunakan karakter generik `Murid` dan `Mentor` serta contoh tugas umum (`/riset-konten`, `Proyek A`, `Proyek B`, `Kalender`, `Catatan`, `Email`); `0` nama kreator, sponsor, komunitas, atau proyek pribadi.

- [x] **Thumbnail Bersih Siap & Rencana Encoding `< 50 MB` (`libx264` TV-range `yuv420p`, `48 kHz` stereo, FPS adaptif)**
  - Mode `?thumb=1` (**Dedicated Cover Frame**) siap dirender ke `output/05-ai-tools-mastery-thumbnail.jpg` (`1080×1920`, bebas UI/subtitle/stylus).
  - Rencana & Hasil Encoding Tahap 6:
    - Daemon preview (`task-51`) dimatikan via `manage_task` `kill` sebelum render.
    - Frame deterministik `1080×1920 @ 30fps` dirender via `lemo-opuscar/core/render/video.mjs` (`3.993` frame, `181s`).
    - Mux & encode final ke `output/05-ai-tools-mastery.mp4` selesai dan terverifikasi:
      - **`ffprobe`:** `h264 (High)`, `pix_fmt=yuv420p`, `color_range=tv`, `color_space=bt709`, `1080x1920`, `30 fps`, `aac (LC) 48000 Hz stereo 198 kbps`, durasi `133.094s`, ukuran **`43.406.407 byte` (`41,40 MB < 50 MB`)**.
      - **`blackdetect` (`d=0.1:pix_th=0.10`):** **`0` frame hitam**.
      - **`ebur128` (MP4 Final):** Integrated Loudness **`-14.0 LUFS`** (`LRA: 3.2 LU`), True Peak **`-1.6 dBFS`** (`<= -1.0 dBTP`).
      - **Thumbnail Publikasi:** `output/05-ai-tools-mastery-thumbnail.jpg` (`1080×1920`, mode `?thumb=1` bersih).
