# Protokol Grill Me 4-Sesi, Intake Lanjutan & Revisi 4-Langkah

Dokumen ini mengatur alur wawancara **Tahap 0 (Pra-Produksi)**, kontrak kelengkapan `BRIEF.md`, penanganan bahan referensi, dan protokol iterasi revisi lewat chat biasa.

---

## 1. Aturan Kunci Widget `ask_question`

- **Gunakan widget `ask_question` (Grill Me Interaktif) HANYA pada Tahap 0** sampai `BRIEF.md` disetujui.
- **Setelah Tahap 0 selesai:** Kunci total `ask_question`. Seluruh proses mulai dari Gate #1, Mini-Gate Audisi Audio, Gate #2A/2B, Gate #3, hingga revisi berjalan lewat **chat biasa**.
- Ajukan 1–2 pertanyaan ringkas per sesi, dengan opsi `(Recommended)` di posisi pertama.

---

## 2. Empat Sesi Grill Me Terpisah (Tahap 0)

Apabila bahan mentah berupa kode sumber/repo/artikel panjang, tugaskan subagent **`research`** terlebih dahulu untuk menyaring **`FACTS.md` (`≤ 5 KB`)** sebelum memulai Sesi 1.

| Sesi | Fokus yang Wajib Dikunci | Target Bagian `BRIEF.md` |
| :--- | :--- | :--- |
| **Grill Me #1 — Konteks & Jiwa Konten** | Tesis inti yang wajib tersampaikan, sudut pandang narator (*POV*), **sosok/karakterisasi** (usia, peran, simbolik vs figur manusia), nuansa emosional (*tone*), dan audiens target. | `Konteks & Karakterisasi` |
| **Grill Me #2 — Visual & Motion** | Pilih **1 dari 3–4 gaya lintas-engine** (sertakan tautan video demo asli `https://lemomo-ai.github.io/lemo-opuscar/` + slug), gaya karakter, gerakan kamera/transisi, pantangan visual, dan **pilih 1 Gaya Subtitle** (*Short-Form / Viral Captions*, *Kinetic Typography*, *Creative / Stylized*, *Tracking / Integrated*, atau `.srt` sidecar saja). | `Gaya, Motion & Subtitle` |
| **Grill Me #3 — Audio, VO & Delivery BGM/SFX** | Mesin VO (**utama: Gemini TTS `gemini-3.8-flash-tts`** dengan fallback Edge TTS / atau rekaman suara sendiri / tanpa VO), persona & jeda/tanya retoris (`?`, `<short pause>`), dan **status & bentuk *delivery* BGM/SFX** (*Aktif + pilihan instrumen/foley/hening* — default — atau *Nonaktif* jika user eksplisit memilih VO murni). | `Audio, VO & Sound Design` |
| **Grill Me #4 — Output Akhir, Thumbnail & Mode** | Rasio (`9:16` / `16:9`) & target durasi *(tanyakan beserta rekomendasi kontekstual hanya jika belum disebut di pesan awal)*, FPS, target ukuran **`< 50 MB`**, **opsi Thumbnail** (*Dedicated Cover `output/<slug>-thumbnail.jpg` via `?thumb=1` + Strong First Frame `t=0.0s`*, atau *First Frame + Embedded Cover*), izin *labeled placeholder*, Gate #2, & konfirmasi **Mode A / B / C**. | `Output, Thumbnail & Mode` |

*(Apabila user menulis `"skip wawancara"`, lanjut ke Tahap 1 dan nyatakan seluruh nilai bawaan secara eksplisit di `BRIEF.md`).*

### Slot Wajib `BRIEF.md` (Checklist Struktural)
Pastikan `BRIEF.md` memuat setiap baris berikut sebelum melangkah ke Tahap 1:
- [ ] **Konteks & Karakterisasi:** tesis utama, POV, audiens, dan deskripsi figur/objek.
- [ ] **Mode & Gaya:** Mode (`A`/`B`/`C`), slug gaya, rasio, FPS, dan target durasi.
- [ ] **Gaya Subtitle:** `[Short-Form Captions | Kinetic Typography | Creative Stylized | Tracking Integrated | SRT Only]`.
- [ ] **Mesin & Arahan VO:** `[Gemini TTS utama + Edge fallback | Human VO | Tanpa VO]` + persona & tanda retorika.
- [ ] **BGM & SFX:** `Status: [Aktif | Nonaktif]` + deskripsi *delivery* (instrumen, foley, titik hening).
- [ ] **Target Output & Thumbnail:** `Ukuran < 50 MB` · `Thumbnail: [Dedicated Cover + Strong First Frame | First Frame Only]`.

---

## 3. Jalur Input Lanjutan (Referensi Video & Artikel)

### A. Referensi Video (TikTok / IG / FB / YouTube)
- **Penerimaan Bahan:** Utamakan file lokal `projects/NN-slug/ref/ref.mp4` (bebas *login wall*/*bot-check*, otomatis di-ignore Git). Untuk URL publik, coba unduh via `lemo-opuscar\.venv\Scripts\python.exe -m yt_dlp` (`BypassSandbox: true`); apabila terhalang login atau CAPTCHA, berhenti mencoba akses otomatis dan minta user mengunduh manual ke `ref/ref.mp4`.
- **Tiga Jalur Lokal 100% Gratis:**
  1. **Style saja *(topik baru milik user)*:** Ikuti `From a reference` (`hyperframes/references/look.md`) — buat 1–2 contact sheet (`ffprobe` + `ffmpeg`), tulis *grammar* visual & ritme ke **`STYLE_REF.md`**, tetap susun Tabel Anti-Jipling.
  2. **Konten saja *(style studio baru)*:** Ekstrak audio (`ffmpeg`) → transkrip lokal via **`faster-whisper`** + baca 1 contact sheet bila ada teks layar → subagent `research` padatkan ke **`FACTS.md` (`≤ 5 KB`)** → lanjut 4 Sesi Grill Me.
  3. **Keduanya *(Adaptasi / Lokalisasi)*:** Gabungkan `STYLE_REF.md` + `FACTS.md`; ganti sudut pandang, brand, suara, dan aset menjadi karya orisinal.
- **Batasan Jujur:** Akurat untuk motion graphics, *kinetic typography*, 2D/vektor, UI demo, infografis, & 3D geometris (bukan *re-shoot live-action* manusia lokal; fitur HyperFrames Pro `reverse-any-video` & `style-sampling` tersedia jika user memintanya).

### B. Artikel / Tulisan Panjang (Medium / Substack / Blog)
- **Penerimaan Bahan:** Utamakan salinan lokal `projects/NN-slug/source/article.md` (atau `.txt` / *Save as PDF* ke `source/`) plus gambar grafik kunci. URL publik terbuka diproses lewat `research` / `search_web`; apabila terhalang *Member-Only paywall* atau CAPTCHA, minta user salin teks/PDF ke `source/`.
- **Distilasi Editorial:** Delegasikan pembacaan penuh ke subagent `research` → **`FACTS.md` (`≤ 5 KB`)**. Pada **Grill Me #4**, apabila format belum ditentukan user, tawarkan: *Single Short (`9:16`, 45–75 detik)*, *Mini-Series (2–3 episode)*, atau *Explainer Utuh (`16:9`, 90–150 detik)*.

---

## 4. Protokol Revisi 4 Langkah (Selama Produksi & Live Preview)

Saat user memberi masukan pada **Gate #1, Audisi Audio, Gate #2A/2B, atau Gate #3**, jalankan alur ini lewat **chat biasa** (tanpa `ask_question`):

1. **Langkah 1 — Masukan User:** User menjelaskan bagian yang perlu diubah dan hasil yang diharapkan.
2. **Langkah 2 — Konfirmasi & Opsi Solusi *(sebelum menyentuh kode)*:** Ringkas pemahaman Anda atas masukan user, simpulkan akar masalahnya, dan tawarkan **opsi perbaikan konkret**.
3. **Langkah 3 — Kesepakatan User:** User menyetujui opsi atau memberi tambahan hingga sepakat.
4. **Langkah 4 — Eksekusi & Refresh:** Baru terapkan revisi ke kode/audio/stills dan kabari user untuk me-**refresh Live Preview** (`http://127.0.0.1:3020/`).

*(Untuk perintah 100% eksplisit & tunggal tanpa ruang tafsir — seperti "hapus baris kredit di Scene 6" — eksekusi langsung pada Langkah 4 lalu minta user refresh).*
