# BRIEF: Belajar AI dari Nol — Part 1: Fundamental AI

Proyek: `projects/04-bodoh-ke-mahir-ai/`
Sumber Fakta: [FACTS.md](FACTS.md) (diadaptasi dari seri materi *"Bodoh AI ke Mahir Dalam 30 Menit (Part 1)"* & bagan referensi 4 Tangga AI)

---

## Checklist Kontrak Produksi (6 Slot Wajib)

- [x] **Konteks & Karakterisasi:**
  - **Tesis Utama (Seri Multi-Part — Part 1):** Penonton awam sering mengira AI cuma **teman chat untuk tanya-tanya biasa** atau **sekadar generate gambar seru-seruan**. Padahal belajar AI punya **4 tangga dari nol sampai pro**: (`01`) *Fundamental AI*, (`02`) *AI Tools Mastery*, (`03`) *AI Professional Builder*, dan (`04`) *AI Agent Orchestrator*. **Part 1 ini berfokus penuh pada Tangga 01 (Fundamental AI)**: cara kerja `LLM` sebagai otak penebak kata, penggabungan `LLM + Harness = Agent`, serta pelurusan salah kaprah bahwa **versi gratis (free tier) = AI bodoh** lewat analogi perpustakaan satu stadion vs seruangan. Tangga `02` sampai `04` hanya muncul sebagai peta tangga awal dan *teaser* penutup untuk episode berikutnya.
  - **Sudut Pandang (POV):** Perjalanan dari **Paham Stereotip Awam ke Sadar Cara Kerjanya** (mengikuti kacamata Murid yang awalnya mengira AI cuma buat chat atau gambar lucu, lalu tercerahkan *step-by-step*).
  - **Audiens Target:** Penonton umum yang baru kenal AI dan ingin paham fondasinya tanpa istilah teknis berat.
  - **Karakterisasi & Figur:** Duet dua tokoh umum **Murid** (wanita awam, penuh stereotip polos dan pertanyaan kritis ringan) dan **Mentor** (pria santai, sabar, suka menggambar analogi sederhana di tablet: peta 4 tangga, otak+badan, dan perpustakaan stadion vs seruangan), disertai *tone* **ramah, hangat, dan humor ringan**.

- [x] **Track Otomatis & Gaya:**
  - **Track Otomatis:** `Track 1: Lemo-Opuscar` (Canvas 2D / WebGL Runner)
  - **Alasan Pemilihan Otomatis:** User memilih gaya terkurasi **Tablet Sketch Explainer** yang memiliki kontrak desain & *Native Moves* siap pakai di `lemo-opuscar/styles/ipad-sketch/STYLE.md` + `DEMO.md`; optimal untuk dialog dua karakter dan ilustrasi sketsa pena/highlighter langsung di layar catatan dengan efisiensi token maksimal.
  - **Slug Gaya:** `ipad-sketch` (*Tablet Sketch Explainer*)
  - **Rasio & Resolusi:** Vertikal `9:16` (`1080 × 1920 px`, format Reels / TikTok / YouTube Shorts)
  - **FPS Adaptif:** `30 FPS`
  - **Target Durasi:** `~65–80 detik` (padat, ritmis, mencakup alur lengkap Tangga 01 tanpa *dead-hold* > 2 detik).

- [x] **Gaya Subtitle:**
  - **Gaya:** `Short-Form Captions` (*Viral Captions*, teks tebal dinamis dengan sorotan kata aktif yang sinkron dengan `words.json` / `cues.json`).
  - **Aturan Zona Aman & Pemotongan:** Wajib berada di zona aman vertikal (`y <= 1360 px`) tanpa menabrak area tombol UI Reels/Shorts, serta pemotongan baris semantik (dilarang memutus frasa atau istilah kunci seperti `LLM + Harness`).

- [x] **Mesin & Arahan VO:**
  - **Mesin:** `Gemini TTS utama + Edge fallback` (`tts_expressive.py --engine auto`, model `gemini-3.8-flash-tts` + cache klip per-shot `--reuse-clips`).
  - **Format & Persona Suara:** **Duet 2 Suara AI Ekspresif**:
    - **Murid (Wanita):** Persona hangat, penasaran polos, artikulasi kasual ekspresif (`Kore` / `Aoede`, fallback `id-ID-GadisNeural`).
    - **Mentor (Pria):** Persona santai, sabar, ramah, nada membimbing penuh antusiasme (`Orus` / `Charon`, fallback `id-ID-ArdiNeural`).
  - **Arahan Jeda & Retorika:** Manfaatkan `<short pause>`, `<breath>`, tanda tanya murni `?` untuk intonasi tanya retoris, dan ritme tektokan alami antar mentor dan murid (kunci `style` prompt setelah audisi).

- [x] **BGM & SFX:**
  - **Status:** `Aktif`
  - **Deskripsi Delivery:** Musik latar ringan ceria-hangat (nuansa akustik / lo-fi ritmis yang ramah), *vectorized auto-ducking* (`-8 dB` saat VO aktif), foley sinkron aksi minimal 2–3 event bermakna per *shot* (goresan stylus/pena tablet, sapuan *highlighter*, *pop* diagram, tap ujung stylus, geseran halaman), serta **Punchline Silence Dips** (`-18 dB` selama `~0.45s`) tepat pada titik humor/punchline. Target mix `48 kHz` stereo, `-14 LUFS`, True Peak `<= -1.0 dBFS`.

- [x] **Output, Thumbnail & Privasi:**
  - **Target File:** `Ukuran < 50 MB` (`libx264` `yuv420p` + AAC `48 kHz` stereo) + sidecar `.srt`.
  - **Thumbnail:** `Dedicated Cover + Strong First Frame` (`output/04-bodoh-ke-mahir-ai-thumbnail.jpg` bersih via `?thumb=1` + frame pembuka kuat `t = 0.0s`).
  - **Privasi & Aturan Brand/Sponsor:** Fokus murni pada edukasi materi Fundamental AI dengan tokoh umum (**Murid** & **Mentor**). **Jangan menyebut nama tokoh pribadi (Raymond Chin / Verren), sponsor perangkat (`ASUS ProArt P14`, `RTX Spark`), atau promosi platform (`ailin.id` / Discord), dan jangan membahas AI lokal/offline di laptop.** Tanpa wajah asli, data pribadi, NIP, atau tautan sensitif; *labeled placeholder* diizinkan hanya bila berlabel jelas untuk keperluan diagram UI.
