# BRIEF: Remake Video Explainer SI-PELITA (9:16 Low-Poly Isometric Island)

Dokumen ini mengunci hasil wawancara 4 sesi Grill Me pada Tahap 0 sebagai kontrak kerja tunggal untuk proyek `projects/06-sipelita-explainer-v2/`.

## 1. Konteks & Karakterisasi
- **Subjek & Pemilik Layanan:** **SI-PELITA** (Sistem Pelaporan Informasi & Data), inovasi pelayanan publik dari **Seksi Pendidikan Madrasah, Kantor Kementerian Agama Kabupaten Banjar**.
- **Tesis Utama:** Mengubah proses pelaporan kendala data madrasah yang dulunya tercecer di chat WhatsApp dan banyak link Google Form menjadi satu gerbang layanan terpadu yang transparan, anti-duplikasi, mudah direvisi tanpa ketik ulang, dan terbukti menuntaskan lebih dari 95% laporan.
- **Sudut Pandang (POV) & Nuansa Emosional:** **Empatik & Solutif (POV Rekan Operator)**. Membuka cerita dari keresahan nyata operator madrasah saat laporan tenggelam dan statusnya menggantung, lalu menghadirkan pulau layanan SI-PELITA sebagai solusi satu pintu yang melegakan, cepat, dan pasti.
- **Audiens Target:** Masyarakat umum dan khususnya **Operator Madrasah** di lingkungan Kemenag Kabupaten Banjar.
- **Karakterisasi Visual:** **Protagonis Operator Madrasah + Metafora Layanan Low-Poly Isometric**. Menampilkan figur karakter operator madrasah bergaya *flat-shaded low-poly* di meja kerjanya pada momen emosional kunci, dipadukan dengan kepulauan heksagonal 3D isometrik: pulau kecil yang terisolasi saat kendala lama, tiga dermaga/jembatan layanan satu pintu (EMIS 4.0, VervalPD, Kolektif), menara lacak status berlampu hangat (`Baru`, `Diterima`, `Diproses`, `Selesai`), serta monumen testimoni bintang lima.

## 2. Track Otomatis, Gaya Visual, Motion & Subtitle
- **Track Otomatis:** **Track 1: Lemo-Opuscar Canvas/WebGL**
- **Alasan Pemilihan Otomatis:** User memilih gaya kurasi **`lowpoly-island`** (*Low-poly Isometric Island*, Three.js WebGL dengan `THREE.OrthographicCamera`, geometri *flat-shaded* heksagonal, shader air berfaset, serta post-processing GTAO, sky/haze, tilt-shift, bloom, dan pastel grade). Track 1 mendukung penuh *Native Moves* prosedural dan sintesis musik berbasis event (`events.json`) dengan audit `studio-audit.mjs` dan render `video.mjs`.
- **Slug Gaya:** `lowpoly-island` (`lemo-opuscar/styles/lowpoly-island/STYLE.md`)
- **Rasio & Resolusi:** Vertikal **`9:16` (`1080x1920`)**
- **Frame Rate (FPS):** **`30 FPS` Adaptif** (selaras dengan estetika gerak `lowpoly-island` dan mempercepat render WebGL + GTAO 2x lipat).
- **Target Durasi & Word Budget:** **`65 s/d 75 detik`** (target *word budget* naskah bersih `125 s/d 140 kata` pada kecepatan alami Gemini TTS Indonesia `~2,00 s/d 2,15 kata/detik` ditambah jeda napas dan pendaratan ubin).
- **Koreografi Kamera & Tata Ruang:** Kamera ortografis isometrik mengalir antar-zona (*pure orthographic zoom*, *turntable azimuth sweep*, *lateral truck* menyusuri 3 dermaga layanan, *elevation change*, dan *time-lapse sun sweep*). Panggung utama 3D dirancang agar fokus objek penting berada di **`y <= 1120px`**, bebas dari kesan *slideware* dan bebas *dead-hold* (`> 2,2 detik`).
- **Gaya Subtitle:** **`Creative Stylized` (Editorial Integrated Subtitles)** di zona aman mutlak **`y: 1150px s/d 1310px` (`y <= 1360px`)**. Teks putih hangat dengan bayangan biru gelap lembut tanpa kotak kaku, disertai ikon ubin heksagonal kecil yang warnanya mengikuti waktu hari (*time-of-day*), pengangkatan kata aktif mengikuti timestamp `voice/words.json`, garis aksen kata kunci, progress rail halus, serta pengelompokan frasa semantik (`KEEP_PAIRS`). Plus ekspor file sidecar `.srt`.

## 3. Audio, VO & Sound Design (BGM/SFX)
- **Mesin & Persona VO:** **`Gemini TTS utama (gemini-3.8-flash-tts) + Edge TTS fallback (id-ID-ArdiNeural)`**.
  - Suara utama: Persona rekan operator pria yang hangat, akrab, dan ekspresif (`gemini_voice: "Orus"`).
  - Teknik penulisan: Memisahkan `"text"` (teks layar bersih) dan `"say"` (dengan tag `<short pause>`, `<breath>`, `<sigh>`, kalimat tanya retoris berakhiran `?` murni) serta mengunci *Audio Lock* (`--reuse-clips`).
- **Status BGM & SFX:** **`Status: Aktif`** (Alur 2-Fase sesuai standar `lowpoly-island`).
  - **Instrumen Musik (*Event-Driven Pitched Percussion*):** Marimba, kalimba, vibraphone, celesta, dan woodblock pentatonik dengan pad lembut di bawahnya (**tanpa piano dan tanpa strings** sesuai kontrak `lowpoly-island`). Setiap ubin heksagonal atau bangunan yang mendarat memicu nada harmonis.
  - **Foley Material & Aksen Cerita (2-Tier Foley):**
    - *Tier 1 (Ambient & Gesekan/Riak Halus, low-pass `<= 1.700 Hz`, ducking `-80%` saat VO):* Desir air low-poly (*brown-noise water swell*), riak gelembung ubin naik (*bubble sweep*).
    - *Tier 2 (Aksen Pendaratan & Cerita, ducking `-45% s/d -50%` saat VO):* Ketukan balok kayu (*wooden knock*) saat lantai/gedung bertumpuk, kilau atap keramik (*ceramic clack*), denting *chime* saat lampu jendela menyala dan status tiket `Selesai`, serta *punchline silence dip* (`-18 dB` selama `~0,45s`) tepat pada momen transisi solusi.
  - **Target Mastering:** `48000 Hz` stereo, **`-14 LUFS` (±1,0 LU)**, True Peak `<= -1,0 dBFS` di `out/mix.wav`.

## 4. Output, Thumbnail, Watermark & Privasi
- **Ukuran & Format Output:** `output/06-sipelita-explainer-v2.mp4` (`< 50 MB`, `libx264` TV-range `yuv420p` via `scale=in_range=full:out_range=tv,format=yuv420p`, AAC `48 kHz` stereo) + `output/06-sipelita-explainer-v2.srt`.
- **Strategi Thumbnail:** **`Dedicated Cover + Strong First Frame`**.
  - File cover mandiri: `output/06-sipelita-explainer-v2-thumbnail.jpg` (dirender via mode `?thumb=1` dengan komposisi pulau isometrik SI-PELITA, lencana Kemenag RI, dan tipografi judul kontras tinggi bebas tumpukan subtitle).
  - *Strong First Frame (`t=0.0s`):* Frame pertama video langsung menampilkan lanskap pulau isometrik dan identitas awal yang kuat (0 *black frame*).
- **Watermark & Logo Resmi:** **`Tanpa Watermark`** pihak ketiga maupun watermark LemoLab. **Logo Resmi Kementerian Agama RI** (`assets/logo-kemenag.png`, disalin dari aset terverifikasi lokal) ditampilkan secara elegan pada kartu pembuka/penutup institusional.
- **Privasi & Sensor Ketat:**
  - Testimoni organik bintang 5 wajib **100% anonim**: hanya gunakan label **`Operator Madrasah A`**, **`Operator Madrasah B`**, dan **`Operator Madrasah C`**. Dilarang mencantumkan nama madrasah (seperti MIN/MTs/MA tertentu) atau nama pribadi di layar, subtitle, maupun dokumen terlacak.
  - Statistik wajib menggunakan bentuk **evergreen**: **`Ratusan laporan masuk`**, **`> 95% terselesaikan`**, dan **`Akses 24 jam`** (dilarang menulis angka mentah `370` atau `313` di layar).
  - Dilarang menampilkan URL deployment `script.google.com`, Spreadsheet ID, Drive Folder ID, API key, atau nomor telepon/WhatsApp asli (gunakan format simulasi aman seperti `0812-XXXX-XXXX` atau kode tiket simulasi `TIK-XXXX` bila menampilkan ilustrasi lacak).
