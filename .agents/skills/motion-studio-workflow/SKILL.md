---
name: motion-studio-workflow
description: Use when starting or producing a code-based video project in AI Motion Studio (video explainer, animasi motion graphics, social reels, adaptasi artikel Medium/Substack, remake referensi video, atau demo web app) before writing scripts, scenes, or running renders.
---

# AI Motion Studio — SOP Produksi

SOP orkestrasi video motion graphics berbasis kode (**Unified Studio Pipeline**: `Lemo-Opuscar`, `DOM/GSAP Hybrid`, `HyperFrames Lean`). Untuk panduan sudut pandang user, lihat [USER_WORKFLOW.md](../../../USER_WORKFLOW.md).

**Violating the letter of the rules is violating the spirit of the rules.**

---

## 1. Aturan Emas & Kontrak Kerja

1. **Kanvas Bersih per Proyek (Zero Cross-Project Contamination):** Mulailah setiap proyek baru 100% dari nol berbekal `FACTS.md`, `BRIEF.md`, dan kontrak gaya aktif (`STYLE.md` / `SPEC.md`). Dilarang membaca, menyalin, atau mengadaptasi kode visual, karakter, rig, maupun naskah dari proyek sebelumnya (`projects/01-...`, `projects/02-...`, dst.).
2. **Workspace, Font/GSAP Lokal & Render Deterministik:** Simpan seluruh proyek (`projects/NN-slug/`) dan cache di dalam workspace. Wajib **bundel font lokal & GSAP lokal** (0 CDN eksternal pada hasil final). Render Windows memakai Chrome D3D11 GPU compositing (dilarang `--disable-gpu-vsync`), dan tulis animasi sebagai fungsi murni dari `t` (tanpa `Date.now()`, `Math.random()` tanpa seed, atau `requestAnimationFrame`).
3. **Empat Sesi Grill Me di Tahap 0 & Auto-Engine Routing:** Gunakan `ask_question` eksklusif pada 4 sesi Tahap 0 (`Konteks` → `Visual & Subtitle` → `Audio VO + BGM/SFX` → `Output, Thumbnail & Privasi`). User cukup memilih **Gaya Visual**; agen otomatis memilih **Track 1 / 2 / 3** ke `BRIEF.md`. Setelah `BRIEF.md` terisi lengkap, kunci `ask_question` dan gunakan chat biasa + **Protokol Revisi 4 Langkah**.
4. **Audio Imersif (Audio Lock, Gemini TTS Utama + BGM/SFX):** Sintesis VO dengan `tts_expressive.py --engine auto` (**Gemini `gemini-3.8-flash-tts` + cache per-shot `--reuse-clips` + `--tempo` non-destruktif**, fallback `edge-tts`). Dilarang mengubah `style` prompt secara diam-diam saat revisi. Bila `BGM/SFX: Aktif`, wajib bangun `mix.py` (*vectorized ducking* `< 2s` + *event-synced SFX* + *punchline dips*) → `out/mix.wav` (`-14 LUFS`); bila `Nonaktif`, pakai VO bersih saja.
5. **Efisiensi Konteks, Subagent Flash, Vision Batching & `/compact`:** Tugaskan `research` dengan **`Model: "flash"`** → `FACTS.md` (`≤ 5 KB`). Batasi pembacaan Vision aset mentah (`<= 3` gambar; gabung jadi 1 grid jika banyak) dan buka `boards/contact-sheet.jpg` dulu. **Wajib cantumkan anjuran `/compact`** tepat setelah Mini-Gate Audisi Audio dan Gate #2A disetujui.
6. **Output `< 50 MB`, Thumbnail, Privasi & Git:** Encode `.mp4` `< 50 MB` (`libx264` `yuv420p` + AAC `48 kHz` stereo — dilarang `-c:v copy` dari mezzanine), siapkan cover bersih `output/<slug>-thumbnail.jpg`, jalankan **Privacy Audit & Regex Scan**, pakai `$env:USERPROFILE`, jaga `preview/*.jpg` (`≤ 400 KB`), dan **minta izin user** sebelum `git push`.

---

## 2. Tabel Anti-Rasionalisasi (Red Flags — STOP & Koreksi)

| Bisikan / Alasan Jalan Pintas | Kenyataan Wajib SOP |
| :--- | :--- |
| *"Intip kode proyek lama biar cepat."* | **Pelanggaran.** Kontaminasi proyek lama merusak orisinalitas gaya & karakter. Bangun dari nol. |
| *"Cukup baca `STYLE.md`, lewati `DEMO.md`."* | **Pelanggaran (Track 1).** Wajib baca `DEMO.md` tepat setelah Gate #1 untuk kuasai *pacing* & *Native Moves*. |
| *"Pasang `data-layout-allow-safe-zone` agar subtitle `y > 1360px` lolos."* | **Pelanggaran.** Zona aman `9:16` (`y <= 1360px`) & pemotongan semantik anti-pecah angka/satuan bersifat mutlak. |
| *"Re-generate ulang semua Gemini TTS & ganti `style` saat revisi tempo/1 shot."* | **Pelanggaran.** Gunakan cache `--reuse-clips` + `--tempo` (`atempo`) agar *pitch* & *feels* shot lama terkunci. |
| *"Jalankan `hyperframes check` tiap selesai edit / biarkan dead-hold > 2 detik."* | **Pelanggaran.** Gunakan `studio-audit.mjs` (Track 1/2) atau `lint` 1s + maks 2× `check` (Track 3); beri gerak tiap 2–3s. |
| *"Tumpuk kartu UI dengan loop `compute_duck_envelope` 5 juta iterasi di `mix.py`."* | **Pelanggaran.** Bangun panggung motion penuh bebas *whitespace* berlebih; wajib *vectorized* `lfilter` di `mix.py`. |
| *"Panggil `ask_question` lagi saat revisi visual / lupa `/compact`."* | **Pelanggaran.** `ask_question` terkunci pasca Tahap 0; selalu anjurkan `/compact` di Audisi Audio & Gate #2A. |
| *"Mux `audition.wav` langsung atau `-c:v copy` dari `out/video.mp4`."* | **Pelanggaran.** Meledakkan file (~400 MB) & gagal audio. Wajib `mix.py` (`-14 LUFS`) & encode `< 50 MB` `48 kHz` stereo. |

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
| **0. Riset & 4-Sesi Grill Me** | [references/grill-me-protocol.md](references/grill-me-protocol.md) | Saring bahan besar via `research` (`Model: "flash"`) → `FACTS.md` (`≤ 5 KB`). Jalankan **4 Sesi Grill Me** (`Konteks` → `Visual & Subtitle` → `Audio VO + BGM/SFX` → `Output, Thumbnail & Privasi`). Agen auto-pilih Track 1/2/3, isi **Slot Wajib `BRIEF.md`**, lalu **kunci `ask_question`**. |
| **1. Cerita & Kontrak Visual** | [references/visual-immersion.md](references/visual-immersion.md) | Track 1: `TREATMENT.md` (**Tabel Anti-Jipling** & min. 2 *Native Moves*), lalu baca `DEMO.md`. Track 2/3: `STORYLINES.md` + `SPEC.md`. Tulis `voice/lines.json` (`text` bersih vs `say` ber-tag, poles `humanizer`). **STOP — GATE #1** via chat. |
| **2. Audio-First (`VO + BGM + SFX`)** | [references/audio-sound-design.md](references/audio-sound-design.md) | Jalankan `tts_expressive.py projects\NN-slug --engine auto` (`BypassSandbox: true`). Nyalakan `lemo-preview.mjs` (`/audition`) + sertakan **hyperlink `file:///` ke `voice/audition.wav`**. **STOP — Mini-Gate Audisi** *(wajib anjurkan `/compact`)*. Revisi tempo/sebagian shot wajib jaga *Audio Lock*. Rakit `mix.py` (*vectorized*, event SFX) → `out/mix.wav` (`-14 LUFS`) & `.srt`. |
| **3. Gate #2 Stills → Live Preview** | [references/visual-immersion.md](references/visual-immersion.md) | **Gate #2A:** Track 1/2 jalankan `studio-audit.mjs` (~12s); Track 3 jalankan `check --snapshots --no-contrast`. Baca **1 grid `boards/contact-sheet.jpg`**, cek `phone-360.jpg` & `seams.jpg`. Revisi pakai **Protokol 4 Langkah**, lalu **anjurkan `/compact`**. **Gate #2B:** Jalankan `lemo-preview.mjs` (Track 1/2) atau `hyperframes play`/`preview --background` (Track 3). |
| **4. Coding Animasi** | [references/visual-immersion.md](references/visual-immersion.md) | Bangun adegan deterministik 2.5–6 detik/shot (atau *beat shift* tiap 2–3s agar **0 *dead-hold > 2s***), bundel font & GSAP lokal, terapkan **Privacy Masking**, & subtitle semantik `words.json` di zona aman `y <= 1360px` sejak draf #1. |
| **5. Visual QA & Gate #3** | [references/visual-immersion.md](references/visual-immersion.md) | Track 1/2: `studio-audit.mjs --strict` (0 errors, font/asset lokal, safe-zone, contrast, `readcheck`). Track 3: maks 2× `check --json` + `snapshot --review`. Isi semua **Slot Wajib `REVIEW.md`**. **STOP — GATE #3** via chat. |
| **6 & 7. Render `< 50 MB`, Thumbnail & Git** | [references/encoding-delivery.md](references/encoding-delivery.md) & [references/project-readme-template.md](references/project-readme-template.md) | Render & encode `< 50 MB` (`48 kHz` stereo, `-14 LUFS`, 0 *black frames*) + render `output/<slug>-thumbnail.jpg` bersih. **Tunggu Human QA user**. Lalu hapus mezzanine, **Privacy Scan**, buat `preview/*.jpg` (`≤ 400 KB`), tulis `README.md` (`$env:USERPROFILE`), **1x local commit** *(minta izin sebelum `git push`)*. |

---

## 5. Struktur Standar Proyek (`projects/NN-slug/`)

```text
projects/NN-slug/
├── README.md · FACTS.md · BRIEF.md · REVIEW.md
├── TREATMENT.md / STORYLINES.md + SPEC.md · STYLE_REF.md (opsional)
├── ref/ · source/                        # Lokal saja (diabaikan .gitignore)
├── boards/contact-sheet.jpg · phone-360.jpg · seams.jpg · audit-report.json
├── voice/                                # lines.json, schedule.json, words.json, audition.wav (.wav ignored)
├── mix.py · out/mix.wav                  # Vectorized BGM + SFX (.wav ignored)
├── index.html · assets/fonts/            # Kode animasi + font/GSAP lokal
├── preview/poster.jpg · contact-sheet.jpg  # Dokumentasi GitHub (<= 400 KB/file)
└── output/<slug>.mp4 · <slug>.srt · <slug>-thumbnail.jpg  # .mp4 ignored
```
