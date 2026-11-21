---
name: motion-studio-workflow
description: Use when starting or producing a code-based video project in AI Motion Studio (video explainer, animasi motion graphics, social reels, adaptasi artikel Medium/Substack, remake referensi video, atau demo web app) before writing scripts, scenes, or running renders.
---

# AI Motion Studio — SOP Produksi

SOP orkestrasi video motion graphics berbasis kode (`HyperFrames`, `Lemo-Opuscar`, `Video-Demo`). Untuk panduan sudut pandang user, lihat [USER_WORKFLOW.md](../../../USER_WORKFLOW.md).

**Violating the letter of the rules is violating the spirit of the rules.**

---

## 1. Aturan Emas & Kontrak Kerja

1. **Kanvas Bersih per Proyek (Zero Cross-Project Contamination):** Mulailah setiap proyek baru 100% dari nol berbekal `FACTS.md`, `BRIEF.md`, dan kontrak gaya aktif (`STYLE.md` / `hyperframes`). Dilarang membaca, menyalin, atau mengadaptasi kode visual, karakter, rig, maupun naskah dari proyek sebelumnya (`projects/01-...`, `projects/02-...`, dst.).
2. **Workspace Lokal & Render Deterministik:** Simpan seluruh proyek (`projects/NN-slug/`) dan cache sementara di dalam workspace. Render Windows wajib memakai Chrome D3D11 GPU compositing (dilarang flag `--disable-gpu-vsync`). Tulis setiap frame sebagai fungsi murni dari `t` (tanpa `Date.now()`, `Math.random()` tanpa seed, atau `requestAnimationFrame` sebagai jam). Aturan `hyperframes` / `STYLE.md` mengalahkan `gsap-*` atau panduan web umum.
3. **Empat Sesi Grill Me Hanya di Tahap 0:** Gunakan widget `ask_question` eksklusif pada 4 sesi Tahap 0 (`Konteks` → `Visual` → `Audio` → `Output`). Begitu `BRIEF.md` terisi lengkap, kunci `ask_question`; jalankan seluruh gate dan **Protokol Revisi 4 Langkah** lewat chat biasa.
4. **Audio Imersif (Gemini TTS Utama + BGM/SFX):** Sintesis VO dengan `tts_expressive.py --engine auto` (**Gemini `gemini-3.8-flash-tts` + `faster-whisper` utama**, fallback otomatis `edge-tts`). Apabila `BRIEF.md` mencatat `BGM/SFX: Aktif`, wajib bangun `mix.py` → `out/mix.wav` (`VO + BGM + SFX`, `-14 LUFS`); apabila `BRIEF.md` mencatat `BGM/SFX: Nonaktif`, gunakan trek VO bersih saja.
5. **Efisiensi Konteks & Vision:** Delegasikan pembacaan bahan/dokumen/artikel besar ke subagent `research` → **`FACTS.md` (`≤ 5 KB`)**. Saat QA gambar, baca **1 file `contact-sheet.jpg`** dulu. Anjurkan `/compact` setelah Audisi Audio atau Gate #2A disetujui.
6. **Output `< 50 MB`, Thumbnail & Kebersihan Git:** Encode `.mp4` distribusi `< 50 MB` (`libx264` `yuv420p` + AAC `48 kHz` stereo — dilarang `-c:v copy` dari `crf 14` mezzanine). Siapkan thumbnail bersih `output/<slug>-thumbnail.jpg` (sesuai opsi `BRIEF.md`), pakai `$env:USERPROFILE` di semua dokumen, jaga `preview/*.jpg` (`≤ 400 KB`), dan **minta izin user** sebelum `git push`.

---

## 2. Tabel Anti-Rasionalisasi (Red Flags — STOP & Koreksi)

| Bisikan / Alasan Jalan Pintas | Kenyataan Wajib SOP |
| :--- | :--- |
| *"Intip kode `scenes.js` proyek lama biar cepat."* | **Pelanggaran.** Kontaminasi proyek lama merusak orisinalitas gaya & karakter. Bangun dari nol. |
| *"Cukup baca `STYLE.md`, lewati `DEMO.md`."* | **Pelanggaran (Mode B).** Wajib baca `DEMO.md` tepat setelah `TREATMENT.md` untuk kuasai *pacing* & *Native Moves*. |
| *"Pakai stickman & subtitle 1 paragraf dulu di draf #1."* | **Pelanggaran.** Gunakan figur sesuai `BRIEF.md` dan pecah subtitle sejak draf #1 memakai `words.json` sesuai gaya terpilih. |
| *"Mux `voice/audition.wav` langsung meski `BGM/SFX: Aktif`."* | **Pelanggaran.** Wajib rakit `mix.py` → `out/mix.wav` (`VO + BGM + SFX`) sebelum Gate #3. |
| *"Panggil `ask_question` lagi saat revisi visual."* | **Pelanggaran.** `ask_question` terkunci setelah Tahap 0. Gunakan chat **Protokol Revisi 4 Langkah**. |
| *"Pakai `-c:v copy` dari `out/video.mp4` agar mux cepat."* | **Pelanggaran.** Meledakkan file (~400 MB) & audio 96 kHz mono. Wajib encode distribusi `< 50 MB` @ `48 kHz` stereo. |

---

## 3. Tiga Mode & Aktivasi Skill

- **Mode A — HyperFrames + Audio Suite:** Explainer/product/kinetic typography (`HTML/CSS + GSAP + Registry`, default `1080p/9:16 @ 60 FPS`).
- **Mode B — Lemo-Opuscar Pure:** 1 dari 99 gaya di `lemo-opuscar/styles/<slug>/STYLE.md` (ikuti FPS artistik `STYLE.md`).
- **Mode C — Hybrid:** Stage `HyperFrames` menyisipkan `Canvas 2D`/`Three.js`/`algorithmic-art` (`hf-seek`) dan/atau rekaman `video-demo` (`<video>`).

**Skill Wajib:** `humanizer` *(seluruh VO & teks layar)* · `frontend-design` *(Mode A/C)* · `impeccable` *(khusus playbook `reference/craft-floor.md` — dilarang unduh biner)*.
**Skill Kondisional:** `research` *(wajib untuk bahan besar)*, `hyperframes-registry`, 5 `gsap-*`, `algorithmic-art`, 6 `threejs-*`, `video-demo`, `figma`, `media-use`, `style-sampling`, `remotion-to-hyperframes`, `slideshow`.

---

## 4. Pipeline 7 Tahap & Referensi Wajib Baca

> **Progressive Disclosure:** Baca referensi terkait **tepat sebelum** memulai tahapnya. Hanya lewati gate persetujuan apabila user menulis perintah eksplisit `"skip gate"`.

| Tahap | Referensi Wajib Baca | Eksekusi Inti & Gate |
| :--- | :--- | :--- |
| **0. Riset & 4-Sesi Grill Me** | [references/grill-me-protocol.md](references/grill-me-protocol.md) | Saring bahan besar via `research` → `FACTS.md` (`≤ 5 KB`). Jalankan **4 Sesi Grill Me terpisah** (`1. Konteks` → `2. Visual & 4 Gaya Subtitle` → `3. Audio VO + BGM/SFX` → `4. Output < 50 MB, Thumbnail & Mode`). Kunci seluruh **Slot Wajib `BRIEF.md`**, lalu **kunci `ask_question`**. |
| **1. Cerita & Kontrak Visual** | [references/visual-immersion.md](references/visual-immersion.md) | Mode A/C: `STORYLINES.md` + `SPEC.md`. Mode B: `TREATMENT.md` (termasuk **Tabel Anti-Jipling** & **min. 2 Native Moves**), lalu baca `DEMO.md`. Tulis `voice/lines.json` (`text` bersih vs `say` ber-tag, poles `humanizer`). **STOP — GATE #1** via chat. |
| **2. Audio-First (`VO + BGM + SFX`)** | [references/audio-sound-design.md](references/audio-sound-design.md) | Jalankan `tts_expressive.py projects\NN-slug --engine auto` (`BypassSandbox: true`). Nyalakan `lemo-preview.mjs` (`http://127.0.0.1:3020/audition`) + sertakan **hyperlink `file:///` ke `voice/audition.wav`** di chat. **STOP — Mini-Gate Audisi** *(anjurkan `/compact` setelah beres)*. Lalu bangun `mix.py` → **`out/mix.wav` (`-14 LUFS`)** & ekspor `.srt`. |
| **3. Gate #2 Stills → Live Preview** | [references/visual-immersion.md](references/visual-immersion.md) | **Gate #2A:** Render stills → baca **1 grid `boards/contact-sheet.jpg`**. Revisi pakai **Protokol 4 Langkah**. **Gate #2B:** Jalankan `hyperframes preview` atau `lemo-preview.mjs` *(cek badge audio hijau `out/mix.wav`)*. |
| **4. Coding Animasi** | [references/visual-immersion.md](references/visual-immersion.md) | Bangun scene deterministik ber-pacing 2–6 detik/shot, tanpa *text-stacking*, dan implementasikan gaya subtitle pilihan `BRIEF.md` berbasis `words.json` sejak draf #1. |
| **5. Visual QA & Gate #3** | [references/visual-immersion.md](references/visual-immersion.md) | Mode A/C: `check --json`, `snapshot --review` (cek `360px`), playbook `impeccable`. Mode B: `readcheck.mjs` + cek `STYLE.md`. Isi semua **Slot Wajib `REVIEW.md`**. **STOP — GATE #3** via chat. |
| **6 & 7. Render `< 50 MB`, Thumbnail & Git** | [references/encoding-delivery.md](references/encoding-delivery.md) & [references/project-readme-template.md](references/project-readme-template.md) | Encode distribusi **`< 50 MB`** (`48 kHz` stereo, `-14 LUFS`, 0 *black frames*) + render `output/<slug>-thumbnail.jpg` bersih. **Tunggu Human QA user**. Lalu hapus mezzanine, buat `preview/*.jpg` (`≤ 400 KB`), tulis `README.md` (`$env:USERPROFILE`), **1x local commit** *(minta izin sebelum `git push`)*. |

*(Durasi ideal `30–90 detik`; untuk durasi `> 2–3 menit`, pecah per bab lalu gabung FFmpeg. Catat aset/angka belum siap sebagai labeled placeholder dan konfirmasi ulang di Gate #3).*

---

## 5. Struktur Standar Proyek (`projects/NN-slug/`)

```text
projects/NN-slug/
├── README.md · FACTS.md · BRIEF.md · REVIEW.md
├── TREATMENT.md / STORYLINES.md + SPEC.md · STYLE_REF.md (opsional)
├── ref/ · source/ · boards/stills/       # Lokal saja (diabaikan .gitignore)
├── boards/contact-sheet.jpg              # Ringan untuk arsip Gate #2A
├── voice/                                # lines.json, schedule.json, words.json, audition.wav (.wav ignored)
├── mix.py · out/mix.wav                  # Dapur musik + SFX (.wav ignored)
├── index.html · src/ / compositions/     # Kode animasi deterministik
├── preview/poster.jpg · contact-sheet.jpg  # Dokumentasi GitHub (<= 400 KB/file)
└── output/<slug>.mp4 · <slug>.srt · <slug>-thumbnail.jpg  # .mp4 ignored
```
