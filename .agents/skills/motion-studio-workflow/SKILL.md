---
name: motion-studio-workflow
description: Use when starting or producing a code-based video project in AI Motion Studio (video explainer, animasi motion graphics, social reels, adaptasi artikel Medium/Substack, remake referensi video, atau demo web app) before writing scripts, scenes, or running renders.
---

# AI Motion Studio — SOP Produksi

SOP orkestrasi video motion graphics berbasis kode (**Unified Studio Pipeline**: `Lemo-Opuscar`, `DOM/GSAP Hybrid`, `HyperFrames Lean`). Untuk panduan sudut pandang user, lihat [USER_WORKFLOW.md](../../../USER_WORKFLOW.md).

**Violating the letter of the rules is violating the spirit of the rules.**

---

## 1. Aturan Emas & Kontrak Kerja

1. **Kanvas Bersih per Proyek (Zero Cross-Project Contamination):** Mulailah setiap proyek baru 100% dari nol berbekal `FACTS.md`, `BRIEF.md`, dan kontrak gaya aktif (`STYLE.md` / `SPEC.md`). Dilarang membaca, menyalin, atau mengadaptasi kode visual, karakter, rig, maupun naskah dari proyek sebelumnya (`projects/01-...`, `projects/02-...`, dst.). Koleksi font OFL studio bersama dapat disalin langsung dari folder root `assets/fonts/`.
2. **Workspace, Font/GSAP Lokal & Render Deterministik:** Simpan seluruh proyek (`projects/NN-slug/`) dan cache di dalam workspace. Wajib **bundel font lokal & GSAP lokal** (0 CDN eksternal pada hasil final). Render Windows memakai Chrome D3D11 GPU compositing (dilarang `--disable-gpu-vsync`), dan tulis animasi sebagai fungsi murni dari `t` (tanpa `Date.now()`, `Math.random()` tanpa seed, atau `requestAnimationFrame`).
3. **Empat Sesi Grill Me di Tahap 0 & Auto-Engine Routing:** Gunakan `ask_question` eksklusif pada 4 sesi Tahap 0 (`Konteks` → `Visual & Subtitle` → `Audio VO + BGM/SFX` → `Output, Thumbnail, Watermark & Privasi`). User cukup memilih **Gaya Visual**; agen otomatis memilih **Track 1 / 2 / 3** ke `BRIEF.md`. Default watermark adalah **`Tanpa Watermark`** *(kecuali user memilih End Card Only atau Halus Sepanjang Video)*. Setelah `BRIEF.md` terisi lengkap, kunci `ask_question` dan gunakan chat biasa + **Protokol Revisi 4 Langkah**.
4. **Audio Imersif (Word Budget, Audio Lock, Duet Multi-Suara, & Alur 2-Fase Foley):** Hitung *word budget* naskah VO di Tahap 1 sesuai rumus kalibrasi Gemini TTS Indonesia (`~2,00–2,15 kata/detik` + jeda, misalnya `135–160 kata` untuk target `75–85 detik`) agar durasi akhir sesuai `BRIEF.md`. Sintesis VO dengan `tts_expressive.py --engine auto` (**Gemini `gemini-3.8-flash-tts` + dukungan duet multi-voice `(voice, style)` per baris + cache `--reuse-clips` + `--tempo`**, fallback `edge-tts`). Dilarang mengubah `style` prompt secara diam-diam saat revisi. Bila `BGM/SFX: Aktif`, wajib bangun `mix.py` (*vectorized ducking* `< 2s` + `_PLUCK_CACHE` + *event-synced SFX* + *punchline dips*) → `out/mix.wav` (`-14 LUFS`); untuk gaya *procedural foley* (seperti `ipad-sketch`), pakai **alur 2-fase** (Tahap 2: VO + BGM bed saja; Tahap 4B: `events.json` nyata → `mix.py` final dengan **2-tier foley**: gesekan kontinu `low-pass <= 1.700 Hz` & ducking `-80%` saat VO, sedangkan foley aksen cerita `-45–50%` ducking). Bila `Nonaktif`, pakai VO bersih saja.
5. **Efisiensi Konteks, Disiplin Script, Daemon Lifecycle & `/compact`:** Tugaskan `research` dengan **`Model: "flash"`** → `FACTS.md` (`≤ 5 KB`). **Dilarang membaca ulang skrip studio (`tts_expressive.py`, `studio-audit.mjs`, `lemo-preview.mjs`) berkali-kali** dalam chat yang sama, dan gabungkan sub-langkah per tahap ke dalam 1 rencana (target `≤ 8–10` handoff rencana per proyek). Batasi pembacaan Vision aset mentah (`<= 3` gambar; gabung jadi 1 grid jika banyak) dan buka `boards/contact-sheet.jpg` dulu. **Wajib cantumkan pengingat `/compact` sebagai pesan mandiri** *(jangan digabung seperti `"Setuju, /compact"`)* tepat setelah Mini-Gate Audisi dan Gate #2A disetujui, serta rekomendasikan **`/compact` ke-3 sebelum Tahap 5/6** apabila revisi Gate #2B membuat konteks `> 160K` **dan wajib `/compact` mandiri dulu sebelum mengganti model**. Matikan semua daemon preview via `manage_task` sebelum Tahap 6.
6. **Output `< 50 MB`, Batas Skrip Global, Thumbnail, Privasi & Git:** **Dilarang mengedit skrip studio bersama (`.agents/skills/.../scripts/*`) di dalam chat/commit proyek** tanpa izin eksplisit terpisah dari user. Encode `.mp4` `< 50 MB` (`libx264` **TV-range `yuv420p` via `scale=in_range=full:out_range=tv,format=yuv420p`** — bukan `yuvj420p`, dilarang `-c:v copy` dari mezzanine) + AAC `48 kHz` stereo, siapkan `output/<slug>-thumbnail.jpg` bersih, jalankan **Privacy Audit & Regex Scan**, pakai `$env:USERPROFILE`, jaga `boards/` lokal saja (`.gitignore`) dan `preview/*.jpg` (`≤ 400 KB`), lalu **minta izin user** sebelum `git push`.

---

## 2. Tabel Anti-Rasionalisasi (Red Flags — STOP & Koreksi)

| Bisikan / Alasan Jalan Pintas | Kenyataan Wajib SOP |
| :--- | :--- |
| *"Intip kode proyek lama biar cepat."* | **Pelanggaran.** Kontaminasi proyek lama merusak orisinalitas gaya & karakter. Bangun dari nol. |
| *"Cukup baca `STYLE.md`, lewati `DEMO.md`."* | **Pelanggaran (Track 1).** Wajib baca `DEMO.md` tepat setelah Gate #1 untuk kuasai *pacing* & *Native Moves*. |
| *"Pasang `data-layout-allow-safe-zone` agar subtitle `y > 1360px` lolos."* | **Pelanggaran.** Zona aman `9:16` (`y <= 1360px`, ilustrasi kanvas `y <= 1120px`) & pemotongan semantik anti-pecah angka/satuan bersifat mutlak. |
| *"Re-generate ulang semua Gemini TTS & ganti `style` saat revisi tempo/1 shot."* | **Pelanggaran.** Gunakan cache `--reuse-clips` + `--tempo` (`atempo`) agar *pitch* & *feels* shot lama terkunci. |
| *"Gabungkan Gate #2A (Stills) dan Gate #2B (Live Preview) dalam 1 pesan biar cepat."* | **Pelanggaran.** Presentasikan **HANYA** `boards/contact-sheet.jpg` (+ `phone-360.jpg`) di Gate #2A; tahan tautan `http://127.0.0.1:3020/` sampai user menyetujui stills Gate #2A & menjalankan `/compact`. |
| *"Edit sekalian `tts_expressive.py` di tengah proyek & ikut commit bersama proyek."* | **Pelanggaran.** Dilarang menyentuh `.agents/skills/.../scripts/*` dalam proyek; laporkan bug dan pisahkan perbaikan perkakas di commit terpisah. |
| *"Biarkan daemon preview menyala di Tahap 6 / bikin foley palsu di Tahap 2 sebelum animasi ada."* | **Pelanggaran.** Matikan daemon preview lewat `manage_task` `kill` sebelum render; pakai alur 2-fase (`events.json` → `mix.py` di Tahap 4B) untuk foley prosedural. |
| *"Jalankan `hyperframes check` tiap selesai edit / biarkan dead-hold > 2 detik."* | **Pelanggaran.** Gunakan `studio-audit.mjs` (Track 1/2) atau `lint` 1s + maks 2× `check` (Track 3); beri gerak tiap 2–3s. |
| *"Tumpuk kartu UI dengan loop `compute_duck_envelope` 5 juta iterasi di `mix.py`."* | **Pelanggaran.** Bangun panggung motion penuh bebas *whitespace* berlebih; wajib *vectorized* `lfilter` di `mix.py`. |
| *"Panggil `ask_question` lagi saat revisi visual / lupa `/compact`."* | **Pelanggaran.** `ask_question` terkunci pasca Tahap 0; selalu ingatkan user mengirim **`/compact` mandiri** di Audisi Audio, Gate #2A, & sebelum pindah model. |
| *"Bikin bentuk kotak/lingkaran polos dulu buat Gate #2A, nanti baru bikin ilustrasi beneran."* | **Pelanggaran.** Untuk gaya ilustratif, wajib susun helper editorial `art.js` dengan figur/prop nyata & sketsa logo ikonik sejak *draft* pertama Gate #2A. |
| *"Tulis naskah 240 kata untuk target 75–85 detik lalu biarkan melar tanpa konfirmasi."* | **Pelanggaran.** Hitung jumlah kata di Tahap 1 sesuai rumus `~2,0–2,15 kata/detik`; pangkas atau konfirmasi revisi target durasi di Gate #1. |
| *"Langsung edit kode revisi besar di mode langsung/Argon, atau pakai daftar kata scan proyek lama."* | **Pelanggaran.** Protokol Revisi 4 Langkah wajib di **semua model**, dan Privacy Scan wajib mengekstrak daftar kata terlarang aktual dari `BRIEF.md` proyek aktif. |
| *"Mux `audition.wav` langsung atau `-c:v copy` dari `out/video.mp4`."* | **Pelanggaran.** Meledakkan file (~400 MB) & gagal audio. Wajib `mix.py` (`-14 LUFS`) & encode `< 50 MB` `yuv420p` TV-range `48 kHz` stereo. |

---

## 3. Tiga Track Otomatis (`Unified Studio Pipeline`) & Skill

- **Track 1 — `Lemo-Opuscar` Canvas/WebGL:** Storytelling artistik, esai, karakter, & 99 gaya terkurasi (`lemo-opuscar/styles/<slug>/STYLE.md`). Audit via `studio-audit.mjs`, preview via `lemo-preview.mjs`, render paralel via `video.mjs`.
- **Track 2 — `DOM/SVG/GSAP on Lemo Runner` (Integrasi Hybrid):** Motion graphics editorial, UI/produk, data, atau tipografi web **tanpa `<video>`/`video-demo`**. Bangun HTML/CSS/SVG/GSAP + komponen `hyperframes-registry` + font/GSAP lokal + 5-var bridge (`WIDTH`, `HEIGHT`, `DUR`, `render`, `READY`), lalu pakai runner cepat `studio-audit.mjs` (~12s), `lemo-preview.mjs`, & `video.mjs`.
- **Track 3 — `HyperFrames Lean`:** Khusus proyek yang menyematkan rekaman `video-demo` / `<video>`, memakai `slideshow`, atau meminta Visual Editor Studio. Terapkan struktur flat/modular (1 CSS + 1–2 JS), `hyperframes-registry`, `lint` saat iterasi, & maks 2× `check`.

**Skill Wajib:** `humanizer` *(VO & teks layar)* · `frontend-design` *(Track 2/3)* · `impeccable` *(hanya `reference/craft-floor.md` — dilarang unduh biner)*.
**Skill Kondisional:** `research` *(`Model: "flash"` untuk bahan besar)*, `hyperframes-registry` *(wajib cek di Track 2/3)*, 5 `gsap-*`, `algorithmic-art`, 6 `threejs-*`, `video-demo`, `figma`, `media-use`, `style-sampling`, `remotion-to-hyperframes`, `slideshow`.

---

## 4. Pipeline 7 Tahap & Referensi Wajib Baca

> **Progressive Disclosure:** Baca referensi terkait **tepat sebelum** memulai tahapnya. Hanya lewati gate persetujuan bila user menulis `"skip gate"`.

| Tahap | Referensi Wajib Baca | Eksekusi Inti & Gate |
| :--- | :--- | :--- |
| **0. Riset & 4-Sesi Grill Me** | [references/grill-me-protocol.md](references/grill-me-protocol.md) | Saring bahan besar via `research` (`Model: "flash"`) → `FACTS.md` (`≤ 5 KB`). Jalankan **4 Sesi Grill Me** (`Konteks` → `Visual & Subtitle` → `Audio VO + BGM/SFX` → `Output, Thumbnail, Watermark & Privasi`). Agen auto-pilih Track 1/2/3, isi **Slot Wajib `BRIEF.md`**, lalu **kunci `ask_question`**. |
| **1. Cerita & Kontrak Visual** | [references/visual-immersion.md](references/visual-immersion.md) & [references/audio-sound-design.md](references/audio-sound-design.md) | Track 1: `TREATMENT.md` (**Tabel Anti-Jipling** & min. 2 *Native Moves*), lalu baca `DEMO.md`. Track 2/3: `STORYLINES.md` + `SPEC.md`. Tulis `voice/lines.json` (`text` bersih vs `say` ber-tag, poles `humanizer`, **patuhi *word budget* sesuai target durasi `BRIEF.md`**). **STOP — GATE #1** via chat. |
| **2. Audio-First (`VO + BGM + SFX`)** | [references/audio-sound-design.md](references/audio-sound-design.md) | Jalankan `tts_expressive.py projects\NN-slug --engine auto` (`BypassSandbox: true`). Nyalakan `lemo-preview.mjs` (`IsDaemon: true`, `toolSummary`: *"Run live preview & audition server (daemon)"*) + **hyperlink `file:///` ke `voice/audition.wav`**. **STOP — Mini-Gate Audisi** *(wajib ingatkan user kirim **`/compact` sebagai pesan mandiri** lalu `"Lanjut"`)*. Revisi pakai *Audio Lock*. Rakit `mix.py` (*vectorized* + `_PLUCK_CACHE`; untuk gaya *procedural foley*, cukup VO + BGM bed dulu di tahap ini) → `out/mix.wav` (`-14 LUFS`) & `.srt`. |
| **3. Gate #2 Stills → Live Preview** | [references/visual-immersion.md](references/visual-immersion.md) | **Pemisahan Ketat (*Editorial Illustration First*):** Untuk gaya ilustratif, susun helper **`art.js`** *(bukan kotak/lingkaran polos)* sejak *draft* awal. **Gate #2A (STOP — Stills Saja):** Track 1/2 `studio-audit.mjs` (~12–24s); Track 3 `check --snapshots --no-contrast`. Presentasikan **HANYA** `boards/contact-sheet.jpg` (+ `phone-360.jpg` / `seams.jpg`), **dilarang memberi link Live Preview dulu**. Pakai `still.mjs` (`< 1s`) untuk *spot check* revisi lokal sebelum audit penuh. Setelah Gate #2A disetujui + **`/compact` mandiri**, baru buka **Gate #2B** (`lemo-preview.mjs` / `hyperframes play`). |
| **4. Coding Animasi & Sinkron SFX** | [references/visual-immersion.md](references/visual-immersion.md) | Bangun adegan deterministik 2.5–6s/shot (*beat shift* tiap 2–3s agar **0 *dead-hold > 2s***), salin font OFL dari root `assets/fonts/` & GSAP lokal, **jaga ilustrasi Canvas `9:16` di `y <= 1120px`**, pakai **Viewport-Clipped Buffer Copy + zona penutup terpisah** *(hindari mega zoom-out `z < 0.8` penyebab frame drop)*, `fontTools` *cmap filter* untuk `glyphs.json`, Watermark sesuai `BRIEF.md`, Privacy Masking, & subtitle `words.json` (`y <= 1360px`). **Tahap 4B (*procedural foley*):** ekspor `window.EV` → `events.json` lalu finalisasi `mix.py` (**2-tier foley**: `<= 1.700 Hz` / `-80%` gesekan & `-45–50%` aksen) sebelum Gate #2B/#3. |
| **5. Visual QA & Gate #3** | [references/visual-immersion.md](references/visual-immersion.md) | *(Opsional: bila revisi Gate #2B panjang `ctx > 160K`, ingatkan `/compact` mandiri ke-3 sebelum lanjut).* Track 1/2: `studio-audit.mjs --strict` (0 errors, font/asset lokal, safe-zone, contrast, `readcheck`). Track 3: maks 2× `check --json` + `snapshot --review`. Isi semua **Slot Wajib `REVIEW.md`**. **STOP — GATE #3** via chat. |
| **6 & 7. Render `< 50 MB`, Thumbnail & Git** | [references/encoding-delivery.md](references/encoding-delivery.md) & [references/project-readme-template.md](references/project-readme-template.md) | **Awali Tahap 6 dengan `manage_task` `kill` seluruh daemon preview.** Render & encode `< 50 MB` (`libx264` TV-range `yuv420p` + `48 kHz` stereo + `-14 LUFS` + 0 *black frames*) & `output/<slug>-thumbnail.jpg` bersih. **Tunggu Human QA user**. Lalu hapus mezzanine, **Privacy Scan dinamis berbasis `BRIEF.md` proyek aktif**, sinkronkan `TREATMENT.md`/`SPEC.md` bila struktur zona berubah, buat `preview/*.jpg` (`≤ 400 KB`), tulis `README.md` (`$env:USERPROFILE`), **cek `git status --short` bebas `boards/` & skrip global**, **1x local commit** *(minta izin sebelum `git push`)*. |

---

## 5. Struktur Standar Proyek (`projects/NN-slug/`)

```text
projects/NN-slug/
├── README.md · FACTS.md · BRIEF.md · REVIEW.md
├── TREATMENT.md / STORYLINES.md + SPEC.md · STYLE_REF.md (opsional)
├── ref/ · source/                        # Lokal saja (diabaikan .gitignore)
├── boards/                               # QA inspection lokal saja (diabaikan .gitignore; GitHub cukup preview/)
├── voice/                                # lines.json, schedule.json, words.json, audition.wav (.wav ignored)
├── mix.py · out/mix.wav                  # Vectorized BGM + SFX (.wav ignored)
├── index.html · assets/fonts/            # Kode animasi + font/GSAP lokal
├── preview/poster.jpg · contact-sheet.jpg  # Dokumentasi GitHub (<= 400 KB/file)
└── output/<slug>.mp4 · <slug>.srt · <slug>-thumbnail.jpg  # .mp4 ignored
```
