# BRIEF: Belajar AI dari Nol — Tangga 02: AI Tools Mastery

Proyek: `projects/05-ai-tools-mastery/`
Sumber Fakta: [FACTS.md](FACTS.md) (menyambung langsung kontrak seri [Part 1](../04-bodoh-ke-mahir-ai/BRIEF.md))

---

## Checklist Kontrak Produksi (6 Slot Wajib)

- [x] **Konteks & Karakterisasi:**
  - **Tesis Utama (Seri Multi-Part — Tangga 02):** Menyambung langsung dari obrolan sebelumnya tanpa *breaking the fourth wall* (soal trik agar jawaban AI pas tanpa harus bergantung pada model termahal). Penonton awam sering mengira hasil AI yang ngawur berarti AI-nya bodoh, lalu lelah mengetik ulang prompt panjang dan repot *copy-paste* manual. **Tangga 02 (AI Tools Mastery)** mengenalkan singkat **3 AI utama** (*ChatGPT, Claude, Gemini*), lalu mengupas **4 pilar kerja efektif**: **Prompting & Context Management** (*Lengkap != Panjang*, dengan analogi minta musisi bikin lagu pop tapi tidak dibilang sehingga dikasih jazz), **Skills** (`/riset-konten`), **Projects** (folder memori terpisah `Proyek A` vs `Proyek B`), dan **MCP & Connectors** (jembatan dua arah terenkripsi ke `Kalender`, `Email`, `Catatan`), lalu ditutup *teaser* halus Tangga `03` (*AI Professional Builder*) dan `04` (*AI Agent Orchestrator*).
  - **Sudut Pandang (POV):** Perjalanan dari bingung kenapa AI sering salah paham dan kerja serba manual menuju alur kerja rapi layaknya punya asisten pribadi (mengikuti sudut pandang **Murid** yang kritis dan praktis).
  - **Audiens Target:** Penonton umum dan pemula pengguna AI sehari-hari yang ingin hasil AI jauh lebih akurat tanpa jargon teknis rumit.
  - **Karakterisasi & Figur:** Duet dua tokoh umum **Murid** (wanita penasaran, sering mengetik prompt singkat lalu heran hasilnya meleset) dan **Mentor** (pria santai, sabar, suka menggambar analogi sederhana di tablet dengan nada ramah, hangat, dan humor ringan).

- [x] **Track Otomatis & Gaya:**
  - **Track Otomatis:** `Track 1: Lemo-Opuscar` (Canvas 2D / WebGL Runner)
  - **Alasan Pemilihan Otomatis:** User memilih gaya terkurasi **Tablet Sketch Explainer** (`ipad-sketch`) yang memiliki kontrak desain dan *Native Moves* di `lemo-opuscar/styles/ipad-sketch/STYLE.md` + `DEMO.md`; optimal untuk dialog dua karakter, animasi sketsa pensil grafit di atas kanvas krem, serta pergerakan kamera dua jari menyusuri panah antar zona pada satu halaman kerja.
  - **Slug Gaya:** `ipad-sketch` (*Tablet Sketch Explainer*)
  - **Rasio & Resolusi:** Vertikal `9:16` (`1080 × 1920 px`, Reels / TikTok / YouTube Shorts)
  - **FPS Adaptif:** `30 FPS`
  - **Target Durasi:** `~75–85 detik` (10 shot padat dengan pembaruan visual setiap 1.5–2.2 detik, tanpa *dead-hold* > 2.2 detik).

- [x] **Gaya Subtitle:**
  - **Gaya:** `Short-Form Captions` (*Viral Captions*, teks tebal kontras dengan lencana pembicara `MURID` / `MENTOR`, potongan semantik 1–3 kata tersinkronisasi ke `voice/words.json` dengan sorotan kata kunci aktif, plus sidecar `.srt`).
  - **Aturan Zona Aman & Pemotongan:** Wajib berada di zona aman mutlak `y <= 1360 px` (pita subtitle `y: 1184–1290 px`, sedangkan ilustrasi kanvas `9:16` inti dijaga pada `y <= 1120 px`), dilarang memutus pasangan frasa `KEEP_PAIRS` (`AI Tools`, `Proyek A`, `Proyek B`, `/riset-konten`, `dua arah`, `tiga AI`, `empat jurus`, `tangga kedua`), dan bebas `data-layout-allow-safe-zone`.

- [x] **Mesin & Arahan VO:**
  - **Mesin:** `Gemini TTS utama + Edge fallback` (`tts_expressive.py --engine auto`, model `gemini-3.8-flash-tts`, cache klip per baris `--reuse-clips`).
  - **Format & Persona Suara:** **Duet 2 Suara AI Ekspresif (konsisten dengan Part 1)**:
    - **Murid (Wanita):** `Kore` (fallback `id-ID-GadisNeural`), nada penasaran alami, naik pada kalimat tanya, ringan saat tertawa.
    - **Mentor (Pria):** `Orus` (fallback `id-ID-ArdiNeural`), hangat, santai, artikulasi jernih seperti menjelaskan langsung di atas tablet sketsa.
  - **Arahan Jeda & Retorika:** Memanfaatkan `<short pause>`, `<breath>`, `<laugh>`, dan tanda tanya murni `?` untuk intonasi tanya retoris alami. Kunci prompt `style` setelah audisi disetujui.

- [x] **BGM & SFX:**
  - **Status:** `Aktif`
  - **Deskripsi Delivery:** Musik latar akustik petikan hangat (*pluck* + bas lembut + aksen mallet tipis di pergantian pilar), *vectorized auto-ducking* (`-8 dB` saat VO aktif), **alur 2-fase foley prosedural** (`events.json` nyata dari animasi kanvas: goresan pensil, sapuan blok warna *boustrophedon*, ketukan stylus, geseran kanvas dua jari, *pop* stempel, dan *shatter* kepingan dengan `-50%` *foley ducking* saat VO aktif), serta **Punchline Silence Dips** (`-18 dB`, `~0.45s`) tepat pada momen punchline. Target master `48 kHz` stereo, `-14 LUFS`, True Peak `<= -1.0 dBTP`.

- [x] **Output, Thumbnail, Watermark & Privasi:**
  - **Target File:** `Ukuran < 50 MB` (`libx264` TV-range `yuv420p` + AAC `48 kHz` stereo) + sidecar `.srt`.
  - **Thumbnail:** `Dedicated Cover + Strong First Frame` (`output/05-ai-tools-mastery-thumbnail.jpg` bersih via `?thumb=1` + frame pembuka kuat `t = 0.0s`).
  - **Watermark:** `Tanpa Watermark`.
  - **Privasi & Sensor:** Hanya tokoh umum **Murid** dan **Mentor**. Nol penyebutan kreator sumber, nama pribadi, sponsor perangkat keras, promosi komunitas, AI lokal/offline, maupun nama proyek nyata. Contoh UI/folder memakai label netral (`Proyek A`, `Proyek B`, `/riset-konten`, `Kalender`, `Email`, `Catatan`); *labeled placeholder* diizinkan khusus untuk diagram antarmuka.
