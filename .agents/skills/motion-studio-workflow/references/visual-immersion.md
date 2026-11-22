# Standar Visual, Unified Pipeline, Subtitle & Audit Cepat (Tahap 1, 3, 4, 5)

Panduan ini menjaga setiap proyek punya arahan seni orisinal bebas kontaminasi, panggung hidup tanpa *dead-hold* maupun *card-stack* kaku, subtitle di zona aman mutlak, serta proses audit secepat mungkin.

---

## 1. Zero Cross-Project Contamination (Kanvas Bersih)

- **Sumber Kebenaran Visual Proyek Baru:** Hanya `FACTS.md`, `BRIEF.md` (hasil Grill Me #1–#4), kontrak `STYLE.md` / `SPEC.md`, dan `STYLE_REF.md` (jika ada referensi video).
- **Larangan Kontaminasi:** Dilarang membuka, menyalin, atau mengadaptasi `scenes.js`, HTML komposisi, rig karakter, palet, atau `lines.json` dari proyek sebelumnya (`projects/01-...`, `projects/02-...`, dst.). Skrip bersama hanya boleh diambil dari `.agents/skills/motion-studio-workflow/scripts/`.

---

## 2. Tiga Track Otomatis (`Unified Studio Pipeline`)

Pemilihan track ditentukan otomatis pada `BRIEF.md` sesuai karakteristik proyek:

- **Track 1 — `Lemo-Opuscar` Canvas/WebGL (Artistik & Storytelling):**
  1. Baca `STYLE.md` gaya terpilih di Tahap 0/1.
  2. Tulis `TREATMENT.md` (termasuk **Tabel Adaptasi Konteks Anti-Jipling**) **sebelum** membuka demo.
  3. **Wajib baca `lemo-opuscar/styles/<slug>/DEMO.md`** segera setelah Gate #1 disetujui dan sebelum menulis baris pertama kode scene.
  4. Wajib terapkan **minimal 2 *Native Moves*** khas gaya tersebut (mis. untuk `risograph`: *plate arrival sweep*, *overprint transition*, *registration kick/drift*).
  5. Audit via `studio-audit.mjs` (~12s), preview via `lemo-preview.mjs` (<1s), render paralel via `video.mjs`.
- **Track 2 — `DOM/SVG/GSAP on Lemo Runner` (Integrasi Hybrid untuk UI, Editorial Web, Data):**
  1. Terapkan `frontend-design` + komponen **`hyperframes-registry`** + font & GSAP **fisik lokal (`assets/fonts/`, `assets/vendor/`)**.
  2. Susun kode secara **ringkas (1 `index.html` + 1 `styles.css` + 1–2 file `.js` adegan)** dan pasang 5-baris jembatan Lemo di `index.html`:
     ```js
     window.WIDTH = 1080; window.HEIGHT = 1920; // atau 1920 x 1080
     window.DUR = scheduleTotal;
     window.render = (t) => { masterTl.seek(t); /* update hook canvas/verlet di t */ };
     window.READY = true;
     ```
  3. Jalankan audit (~12s) dengan `studio-audit.mjs`, Live Preview instan dengan `lemo-preview.mjs`, dan render paralel dengan `video.mjs` — **0 overhead CLI HyperFrames**.
- **Track 3 — `HyperFrames Lean` (Khusus `<video>` / `video-demo` / `slideshow` / Studio Visual Editor):**
  1. Gunakan struktur **flat/modular ringkas** (1 CSS bersama + 1–2 skrip komposisi; **dilarang memecah ke 10+ file HTML boilerplate**).
  2. Wajib cek **`hyperframes-registry`** sebelum membangun komponen dari nol.
  3. Saat iterasi coding, gunakan **`hyperframes lint`** (~1 detik tanpa Chrome). Batasi **`hyperframes check` maksimal 2×** per proyek:
     - **Run #1 (Gate #2A):** `hyperframes check --snapshots --no-contrast` *(audit awal + contact sheet sekaligus)*.
     - **Run #2 (Gate #3):** `hyperframes check --json` + `hyperframes snapshot --review`.

---

## 3. Kerajinan Visual, Anti-Whitespace & Pacing Anti-Dead-Hold

- **Anti-Card-Stack & Pemanfaatan Kanvas Penuh:** Hindari menumpuk 3–4 kotak kartu statis (`border-radius`) di separuh atas lalu menyisakan 35% ruang kosong di bawah. Bangun panggung motion skala besar (ilustrasi SVG aktif, simulasi fisika, kamera zoom/pan editorial, tirai pembelah ruang).
- **Pacing Dinamis (`2.5–6 detik/shot`) & Aturan *No Dead Hold > 2 Detik*:**
  - Pecah video 60–90 detik menjadi **10–14 shot pendek** (*wide → close → top-down → match-move / curtain cut*).
  - Apabila satu shot berdurasi `≥ 5 detik`, **wajib memiliki *beat* visual baru / perubahan kamera / aksi sekunder setiap 2–3 detik** sehingga gambar **tidak pernah membeku diam > 2.2 detik** menunggu VO selesai *(diaudit otomatis oleh `dead_hold` di `studio-audit.mjs`)*.
- **Match-Move Nyata (Bukan Janji Kertas):** Bila `SPEC.md`/`STORYLINES.md` menjanjikan transisi *object match-move* atau *curtain wipe*, wujudkan secara harfiah di timeline (jangan jatuh ke 80% *fade-out/in* seragam).
- **Wajib Verifikasi Fisik Font Lokal & GSAP Lokal (`0` CDN Eksternal):** Taruh font (mis. `Inter`, `JetBrains Mono`) di `assets/fonts/` dengan `@font-face` nyata serta bundel `gsap.min.js` secara lokal. `studio-audit.mjs` mencatat `error` bila font `404` dan `warning` bila ada request ke CDN luar.
- **Porting Aset Web Asli & Privasi Sensor:** Ketika mengadaptasi web/portofolio brand, porting komponen autentiknya (mis. *Verlet rope physics*, doodle SVG asli) dan blur-mask wajah, NIP, kode QR, serta teks instansi sensitif sesuai `BRIEF.md` dengan rapi tanpa memotong nama pemilik/label utama.
- **Karakter & Kepadatan Teks:** Gunakan figur manusia sesuai `BRIEF.md` (pakai *stickman* hanya untuk gaya `stick-explainer`). Maksimal **1 frasa judul jangkar (1–5 kata)** per shot kunci.

---

## 4. Aturan Mutlak Zona Aman Subtitle & Pemotongan Semantik

1. **Zona Aman `9:16` Mutlak (`y <= 1360px` / `<= 72%` tinggi frame):**
   - Seluruh subtitle *burn-in* wajib berada pada pita aman **`y: 1120px–1310px`** (dan `< 1360px` untuk baris terbawahnya, serta `>= 144px` dari tepi atas) agar bebas dari UI deskripsi/komentar Instagram Reels, TikTok, dan YouTube Shorts.
   - **Larangan Mutlak Bypass Validator:** Dilarang memasang `data-layout-allow-safe-zone` atau `data-layout-ignore` pada subtitle maupun kartu teks untuk mengakali batas `y > 1360px`.
2. **Pemotongan Frasa Semantik (Berbasis `voice/words.json`):**
   - Susun pengelompokan 1–3 kata dengan **kesadaran sintaksis & angka**: **dilarang memecah angka dari satuannya** (salah: `"dan hampir 3"` → `"ribu data"`; benar: `"dan hampir"` → `"3 ribu data"`).
   - **Dilarang** menampilkan 1 paragraf/kalimat utuh sekaligus di satu shot. Matikan subtitle pada kartu penutup (*end card*).
3. **Pilihan 4 Gaya Subtitle *Burn-In* (Sesuai `BRIEF.md`):**
   - **Short-Form / Viral Captions:** 1–3 kata per grup, kontras tinggi, sorot kata kunci (`kw`).
   - **Kinetic Typography:** Gerak ritmis per kata/ketukan beat musik (*pop-up*, *slide*, hentakan mekanik).
   - **Creative / Stylized:** Desain huruf/outline/stamp/double-hit menyatu penuh dengan estetika film.
   - **Tracking / Integrated:** Teks mengikuti koordinat gerak objek atau karakter di adegan.
   *(Pilih `SRT Only` bila user menonaktifkan burn-in).*

---

## 5. Disiplin Vision, Audit Cepat & Slot Wajib `REVIEW.md`

1. **Vision Batching (`<= 3` Gambar Aset Mentah):** Dilarang membaca 10+ gambar aset mentah satu per satu dengan `read_file`. Apabila ada banyak aset/masking untuk diperiksa, satukan menjadi **1 grid sheet** terlebih dahulu sebelum memanggil `read_file`.
2. **Gate #2A (Stills + Audit Cepat — `0` Render Video):**
   - **Track 1 & 2:** Jalankan auditor terpadu (1× Chrome, ~12 detik):
     ```powershell
     node .agents\skills\motion-studio-workflow\scripts\studio-audit.mjs projects\NN-slug
     ```
     Menghasilkan `boards/contact-sheet.jpg`, `boards/phone-360.jpg` (`360px`), `boards/seams.jpg`, dan `boards/audit-report.json`.
   - **Track 3:** Jalankan `check --snapshots --no-contrast` (Run #1).
   - Baca **1 grid `boards/contact-sheet.jpg`** dulu (+ `phone-360.jpg`/`seams.jpg` bila perlu). Revisi memakai **Protokol Revisi 4 Langkah**.
   - **Wajib cantumkan pengingat `/compact`** begitu user menyetujui Gate #2A sebelum lanjut ke polish/QA final.
3. **Gate #2B (Live Preview Interaktif):**
   - **Track 1 & 2:** `node .agents\skills\motion-studio-workflow\scripts\lemo-preview.mjs projects\NN-slug --port 3020` (`BypassSandbox: true`). Cek badge header hijau **`out/mix.wav (VO+BGM+SFX)`** bila BGM/SFX aktif.
   - **Track 3:** `hyperframes play` (cepat) atau `hyperframes preview --foreground --port 3030` dengan `IsDaemon: true` agar server persisten tidak mati sendiri.
4. **Gate #3 (QA Akhir):**
   - **Track 1 & 2:** Jalankan `studio-audit.mjs projects\NN-slug --strict` (`0 errors`, `0 warnings`, 0 CDN luar, 0 404 font, 0 *dead-hold*, 0 pelanggaran zona aman `y > 1360px`).
   - **Track 3:** Jalankan Run #2 `hyperframes check --json` + `snapshot --review` + cek playbook `impeccable` (`reference/craft-floor.md`).

### Slot Wajib `REVIEW.md` (Checklist Sebelum Render Penuh)
Pastikan `REVIEW.md` mengisi status aktual seluruh item ini sebelum meminta izin render `.mp4`:
- [ ] **`DEMO.md` + Min. 2 *Native Moves* *(Track 1)* / `hyperframes-registry` + Struktur Flat *(Track 2/3)***
- [ ] **Font & GSAP Fisik Lokal Terverifikasi:** `@font-face` lokal aktif (`0` CDN eksternal, `0` 404 aset)
- [ ] **Panggung Penuh, 0 *Dead-Hold > 2.2s*, & Zona Aman `9:16` (`y <= 1360px` tanpa bypass)**
- [ ] **Audio Mix & Event-Synced SFX:** `out/mix.wav` aktif di Live Preview (`-14 LUFS`, 2–3 foley/shot, *punchline dips*)
- [ ] **Subtitle Sesuai Pilihan `BRIEF.md`:** basis `words.json`, pemotongan semantik anti-pecah angka/satuan
- [ ] **Uji Teknis & Privasi:** `studio-audit.mjs --strict` / `hyperframes check --json` `PASS` · Phone `360px` · Seams · Masking Privasi
- [ ] **Thumbnail Bersih Siap & Rencana Encoding `< 50 MB` (`libx264 yuv420p`, `48 kHz` stereo, FPS adaptif)**
