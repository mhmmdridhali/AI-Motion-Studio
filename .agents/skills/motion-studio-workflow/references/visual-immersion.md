# Standar Visual, Subtitle & Imersi Gerak (Tahap 1, 3, 4, 5)

Panduan ini menjaga setiap proyek punya arahan seni orisinal, gerak sinematik yang hidup, dan pilihan gaya subtitle yang tepat tanpa mencontek proyek sebelumnya.

---

## 1. Zero Cross-Project Contamination (Kanvas Bersih)

- **Sumber Kebenaran Visual Proyek Baru:** Hanya `FACTS.md`, `BRIEF.md` (hasil Grill Me #1–#2), kontrak `hyperframes` / `STYLE.md` gaya aktif, dan `STYLE_REF.md` (jika ada referensi video).
- **Larangan Kontaminasi:** Dilarang membuka, menyalin, atau mengadaptasi `scenes.js`, rig karakter, palet, atau `lines.json` dari proyek sebelumnya (`projects/01-...`, `projects/02-...`, dst.). Skrip bersama hanya boleh diambil dari `.agents/skills/motion-studio-workflow/scripts/`.

---

## 2. Kontrak Gaya & Pacing (Mode A/C & Mode B)

- **Mode B (`Lemo-Opuscar Pure`):**
  1. Baca `STYLE.md` gaya terpilih di Tahap 0/1.
  2. Tulis `TREATMENT.md` (termasuk **Tabel Adaptasi Konteks Anti-Jipling**) **sebelum** membuka demo.
  3. **Wajib baca `lemo-opuscar/styles/<slug>/DEMO.md`** segera setelah Gate #1 disetujui dan sebelum menulis baris pertama kode scene.
  4. Wajib terapkan **minimal 2 *Native Moves*** khas gaya tersebut (mis. untuk `risograph`: *plate arrival sweep*, *overprint transition*, *registration kick/drift*; lihat bagian *Native moves* di `STYLE.md`).
- **Mode A / C (`HyperFrames`):** Terapkan `frontend-design` + kontrak `hyperframes` (`story.md`, `spec.md`, `motion.md`) serta variabel root `--color-ground`, `--color-ink`, `--color-accent`, `--font-display`.
- **Pacing Dinamis:** Pecah video 60–90 detik menjadi **10–14 shot pendek (2.5–6 detik/shot)** dengan variasi skala & sudut kamera (*wide → close → top-down → low-angle → match/overprint cut*).

---

## 3. Recipe Anti-Slideware & Pilihan 4 Gaya Subtitle

Bangun frame lewat aksi visual fisik, bukan slide infografis atau kotak poin PowerPoint:

- **Karakter & Adegan:** Gambar figur manusia sesuai karakterisasi `BRIEF.md` dengan gestur ekspresif. Gunakan gaya *stickman* hanya apabila `BRIEF.md` memakai gaya `stick-explainer` atau user memilihnya di Grill Me #2.
- **Kepadatan Teks Layar:** Maksimal **1 frasa judul jangkar singkat (1–5 kata)** pada shot pembuka/kunci (atau 0 judul pada shot naratif murni). Hindari menumpuk *header bar* + kotak catatan + diagram pil + subtitle dalam 1 frame.

### Menu 4 Gaya Subtitle *Burn-In* (Pilih di Grill Me #2, Basis `voice/words.json`)

Semua gaya di bawah menggunakan timestamp per kata dari `voice/words.json` dan **dilarang** menampilkan 1 paragraf/kalimat utuh sekaligus di satu shot:

| Gaya Subtitle | Karakteristik Visual & Gerak | Paling Cocok Untuk |
| :--- | :--- | :--- |
| **1. Short-Form / Viral Captions** | Potongan 1–3 kata di tengah/zona aman layar, berganti cepat, kata kunci (*`kw`*) disorot warna kontras atau skala lebih besar. | Reels/TikTok/Shorts berenergi tinggi & *hook* tajam. |
| **2. Kinetic Typography** | Teks bergerak ritmis mengikuti ketukan suara/beat musik — muncul per kata, *pop-up*, *slide*, *zoom*, atau hentakan mekanik. | Explainer dinamis, *product launch*, & musik/beat-driven. |
| **3. Creative / Stylized Subtitle** | Tipografi, *outline*, gradien, glow, atau tekstur (mis. *riso double-hit*, *stamp*, *halftone knockout strip*) dirancang menyatu penuh dengan estetika film. | Esai artistik, film pendek puitis, & gaya *Lemo-Opuscar*. |
| **4. Tracking / Integrated Subtitle** | Teks menempel langsung pada koordinat gerak objek atau karakter di adegan (*motion tracking*) sehingga terasa menyatu di dalam ruang cerita. | Storytelling kamera aktif, *camera pan*, & adegan berbasis prop/karakter. |

*(Apabila `BRIEF.md` memilih `SRT Only`, matikan subtitle burn-in di kanvas dan ekspor sidecar `.srt` saja. Matikan subtitle pada shot closing typographic card agar tidak bertabrakan).*

---

## 4. Disiplin Vision, Live Preview & Slot Wajib `REVIEW.md`

1. **Gate #2A (Stills Only, 0 Render Video):** Render `boards/contact-sheet.jpg` (`still.mjs` + `sheet.py` / `hyperframes snapshot`). Buka **1 file grid** terlebih dahulu; revisi komposisi memakai **Protokol Revisi 4 Langkah**.
2. **Gate #2B (Live Preview Interaktif):** Nyalakan `hyperframes preview` (Mode A/C) atau `node .agents/skills/motion-studio-workflow/scripts/lemo-preview.mjs projects/NN-slug --port 3020` (`BypassSandbox: true`, Mode B). Pastikan badge audio bar atas sudah berwarna hijau **`out/mix.wav (VO+BGM+SFX)`** bila `BGM/SFX: Aktif`.
3. **Gate #3 (QA Akhir):** Jalankan `readcheck.mjs` (Mode B) atau `hyperframes check --json` + `snapshot --review` (`360px` & desktop) + playbook `impeccable` (`reference/craft-floor.md`) untuk Mode A/C.

### Slot Wajib `REVIEW.md` (Checklist Sebelum Render Penuh)
Pastikan `REVIEW.md` mengisi status aktual seluruh item ini sebelum meminta izin render `.mp4`:
- [ ] **`DEMO.md` Dibaca & Min. 2 *Native Moves* Diterapkan** *(Mode B)*
- [ ] **Audio Mix Sesuai `BRIEF.md`:** `out/mix.wav` terverifikasi aktif di Live Preview *(jika `BGM/SFX: Aktif`)*
- [ ] **Subtitle Sesuai Pilihan `BRIEF.md`:** berbasis `words.json` (bukan 1 paragraf/scene)
- [ ] **Uji Teknis & Baca:** `readcheck.mjs` / `hyperframes check --json` `PASS` + konfirmasi placeholder *(jika ada)*
- [ ] **Thumbnail Bersih Siap:** mode `?thumb=1` / `thumbnail.html` terverifikasi bebas potongan subtitle
- [ ] **Rencana Encoding Distribusi:** target `< 50 MB`, H.264 `yuv420p`, audio `48 kHz` stereo
