# Standar Visual, Unified Pipeline, Subtitle & Audit Cepat (Tahap 1, 3, 4, 5)

Panduan ini menjaga setiap proyek punya arahan seni orisinal bebas kontaminasi, panggung hidup tanpa *dead-hold* maupun *card-stack* kaku, subtitle di zona aman mutlak, serta proses audit secepat mungkin.

---

## 1. Zero Cross-Project Contamination (Kanvas Bersih)

- **Sumber Kebenaran Visual Proyek Baru:** Hanya `FACTS.md`, `BRIEF.md` (hasil Grill Me #1–#4), kontrak `STYLE.md` / `SPEC.md`, dan `STYLE_REF.md` (jika ada referensi video).
- **Larangan Kontaminasi:** Dilarang membuka, menyalin, atau mengadaptasi `scenes.js`, HTML komposisi, rig karakter, palet, atau `lines.json` dari proyek sebelumnya (`projects/01-...`, `projects/02-...`, dst.). Skrip bersama diambil dari `.agents/skills/motion-studio-workflow/scripts/`, dan **font OFL standar disalin dari folder studio bersama `assets/fonts/`** di root workspace *(jangan mengambil dari folder proyek lama)*.

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
- **Batas Aman Ilustrasi Canvas `9:16` (`y <= 1120px`) & Watermark:** Pada adegan Canvas `9:16`, jaga sketsa/diagram inti berada pada **`y <= 1120px`** agar pita subtitle *chip* (`y: 1184–1290px`) tidak pernah menimpa gambar. Terapkan **Watermark** persis sesuai `BRIEF.md` (`Tanpa Watermark` default; `End Card Only` pada kartu akhir; atau watermark halus `opacity 18–25%` di sudut atas aman `y >= 144px` sepanjang video).
- **Karakter & Kepadatan Teks:** Gunakan figur manusia sesuai `BRIEF.md` (pakai *stickman* hanya untuk gaya `stick-explainer`). Maksimal **1 frasa judul jangkar (1–5 kata)** per shot kunci.
- **Standar "Editorial Illustration First" & Modular `art.js`:** Untuk gaya ilustratif (`ipad-sketch`, `sketchnote`, `stick-explainer`, `collage`, `paper-cut`, dll.), **dilarang** menampilkan *placeholder* bentuk geometris polos (kotak/lingkaran kosong) pada *draft* pertama Gate #2A. Pisahkan helper ilustrasi konkret sejak awal ke **`art.js`** *(figur manusia/karakter ekspresif, prop nyata untuk analogi seperti gitar/piano/meja/rumah, dan sketsa bentuk khas yang menyerupai logo resmi bila menyebut produk/tools populer)*.
- **Anti Frame-Drop Canvas (`Viewport-Clipped Buffer Copy` & Zona Penutup Terpisah):** Hindari *mega zoom-out* (`z < 0.8`) ke seluruh kanvas padat pada adegan rekap/penutup yang memicu *frame drop* di Live Preview dan mengecilkan teks di `360px` — gunakan **zona penutup terpisah pada zoom seragam (`z ≈ 1.45–1.55`)**. Pada engine buffer `CACHE → WORK`, salin hanya irisan *viewport* kamera (`WORK.L[n].subarray(s0, s1).set(CACHE.L[n].subarray(s0, s1))` + `WORK.fx.drawImage(..., vx0, vy0, vw, vh)`) agar audit & render `2,5–3×` lebih cepat.
- **Filter `cmap` `fontTools` untuk `glyphs.json`:** Saat membangun `glyphs.json` di `ipad-sketch`, periksa `cmap` font terlebih dahulu agar karakter yang tidak tersedia (mis. `→✓★`) dilewati bersih tanpa kotak rusak `.notdef` dan digambar dengan vektor `PEN`.

---

## 4. Aturan Mutlak Zona Aman Subtitle & Pemotongan Semantik

1. **Zona Aman `9:16` Mutlak (`y <= 1360px` / `<= 72%` tinggi frame):**
   - Seluruh subtitle *burn-in* wajib berada pada pita aman **`y: 1120px–1310px`** (dan `< 1360px` untuk baris terbawahnya, serta `>= 144px` dari tepi atas) agar bebas dari UI deskripsi/komentar Instagram Reels, TikTok, dan YouTube Shorts.
   - **Larangan Mutlak Bypass Validator:** Dilarang memasang `data-layout-allow-safe-zone` atau `data-layout-ignore` pada subtitle maupun kartu teks untuk mengakali batas `y > 1360px`.
2. **Pemotongan Frasa Semantik (`KEEP_PAIRS`) & Lencana Pembicara (`Speaker Badge`):**
   - Susun pengelompokan 1–3 kata dari `voice/words.json` dengan daftar penjaga pasangan frasa **`KEEP_PAIRS`** *(mis. `"1 stadion"`, `"3 ribu"`, `"AI Agent"`, `"dari nol"`)* agar **dilarang memecah angka dari satuannya maupun memotong frasa istilah**.
   - Untuk format **Duet / Multi-Speaker**, tampilkan opsional **Speaker Badge** ringkas (`MURID` / `MENTOR`) tepat di atas pita subtitle sesuai gaya visualnya.
   - **Dilarang** menampilkan 1 paragraf/kalimat utuh sekaligus di satu shot. Matikan subtitle pada kartu penutup (*end card*).
3. **Pilihan 4 Gaya Subtitle *Burn-In* (Sesuai `BRIEF.md`):**
   - **Short-Form / Viral Captions:** 1–3 kata per grup, kontras tinggi, sorot kata kunci (`kw`).
   - **Kinetic Typography:** Gerak ritmis per kata/ketukan beat musik (*pop-up*, *slide*, hentakan mekanik).
   - **Creative / Stylized:** Desain huruf/outline/stamp/double-hit menyatu penuh dengan estetika film.
   - **Tracking / Integrated:** Teks mengikuti koordinat gerak objek atau karakter di adegan.
   *(Pilih `SRT Only` bila user menonaktifkan burn-in).*

---

## 5. Disiplin Konteks, Vision, Pemisahan Gate #2A → #2B & Slot Wajib `REVIEW.md`

1. **Disiplin Konteks & Handoff:** **Jangan membaca ulang skrip studio bersama (`tts_expressive.py`, `studio-audit.mjs`, `lemo-preview.mjs`) berkali-kali** dalam percakapan yang sama. Gabungkan sub-langkah yang menyatu menjadi 1 rencana per tahap *(target `≤ 8–10` handoff rencana per proyek)*.
2. **Vision Batching (`<= 3` Gambar Aset Mentah):** Dilarang membaca 10+ gambar aset mentah satu per satu dengan `read_file`. Apabila ada banyak aset/masking untuk diperiksa, satukan menjadi **1 grid sheet** terlebih dahulu sebelum memanggil `read_file`.
3. **Gate #2A (WAJIB STOP — Stills Saja, TANPA Link Live Preview):**
   - **Track 1 & 2:** Jalankan auditor terpadu (1× Chrome, ~12–24 detik):
     ```powershell
     node .agents\skills\motion-studio-workflow\scripts\studio-audit.mjs projects\NN-slug
     ```
     Menghasilkan `boards/contact-sheet.jpg`, `boards/phone-360.jpg` (`360px`), `boards/seams.jpg`, dan `boards/audit-report.json`.
   - **Track 3:** Jalankan `check --snapshots --no-contrast` (Run #1).
   - **Aturan Pemisahan Ketat Gate #2A vs #2B:** Buka `boards/contact-sheet.jpg` (+ `phone-360.jpg`/`seams.jpg` bila perlu), lalu sajikan **HANYA hasil Stills & Contact Sheet** di chat. **DILARANG menggabungkan Gate #2A dan Gate #2B atau mengirim tautan `http://127.0.0.1:3020/` pada tahap ini.** Revisi memakai **Protokol Revisi 4 Langkah** *(manfaatkan **Targeted Spot Check `still.mjs <proj> <t> --out <proj>/boards --size <WxH>`** `< 1s` untuk mengecek perubahan 1 frame lokal sebelum mengulang `studio-audit.mjs` penuh)*. Setelah user menyetujui Gate #2A, ingatkan user untuk mengirim **`/compact` saja secara mandiri** lalu mengetik `"Lanjut"`.
4. **Tahap 4B (*Procedural Foley* Sync) → Gate #2B (Live Preview Interaktif):**
   - Bila proyek memakai foley berbasis gerak prosedural, pastikan `events.json` (`window.EV`) diekspor dan `mix.py` final sudah dijalankan sebelum membuka Gate #2B.
   - **Track 1 & 2:** `node .agents\skills\motion-studio-workflow\scripts\lemo-preview.mjs projects\NN-slug --port 3020` (`BypassSandbox: true`, `IsDaemon: true`, `toolSummary: "Run live preview & audition server (daemon)"`). Cek badge header hijau **`out/mix.wav (VO+BGM+SFX)`** bila BGM/SFX aktif.
   - **Track 3:** `hyperframes play` (cepat) atau `hyperframes preview --foreground --port 3030` dengan `IsDaemon: true` agar server persisten tidak mati sendiri.
   - **Titik `/compact` #3 Opsional & Aturan Ganti Model:** Apabila sesi revisi Gate #2B berlangsung panjang (`ctx > 160K`), rekomendasikan user mengirim **`/compact` mandiri** sebelum masuk Tahap 5/6; apabila user berencana mengganti model di tengah proyek, minta user menjalankan `/compact` mandiri **tepat sebelumnya** agar *prompt cache* tidak terbuang sia-sia.
5. **Gate #3 (QA Akhir):**
   - **Track 1 & 2:** Jalankan `studio-audit.mjs projects\NN-slug --strict` (`--thumb` bila cover terpisah aktif: `0 errors`, `0 warnings`, 0 CDN luar, 0 404 font, 0 *dead-hold*, 0 pelanggaran zona aman `y > 1360px`).
   - **Track 3:** Jalankan Run #2 `hyperframes check --json` + `snapshot --review` + cek playbook `impeccable` (`reference/craft-floor.md`).

### Slot Wajib `REVIEW.md` (Checklist Sebelum Render Penuh)
Pastikan `REVIEW.md` mengisi status aktual seluruh item ini sebelum meminta izin render `.mp4`:
- [ ] **`DEMO.md` + Min. 2 *Native Moves* *(Track 1)* / `hyperframes-registry` + Struktur Flat *(Track 2/3)***
- [ ] **Font & GSAP Fisik Lokal Terverifikasi:** `@font-face` lokal aktif (`0` CDN eksternal, `0` 404 aset)
- [ ] **Panggung Penuh, 0 *Dead-Hold > 2.2s*, Kanvas `y <= 1120px`, Watermark Sesuai `BRIEF.md` & Zona Aman `9:16` (`y <= 1360px`)**
- [ ] **Audio Mix & Event-Synced SFX:** `out/mix.wav` aktif di Live Preview (`-14 LUFS`, `events.json` / 2–3 foley per shot, **2-tier foley**: gesekan `<= 1.700 Hz` + `-80%` ducking & aksen cerita `-45–50%` ducking, *punchline dips*)
- [ ] **Subtitle Sesuai Pilihan `BRIEF.md`:** basis `words.json`, `KEEP_PAIRS` anti-pecah angka/istilah, *Speaker Badge* bila Duet
- [ ] **Uji Teknis & Privasi:** `studio-audit.mjs --strict` / `hyperframes check --json` `PASS` · Phone `360px` · Seams · Masking Privasi
- [ ] **Thumbnail Bersih Siap & Rencana Encoding `< 50 MB` (`libx264` TV-range `yuv420p`, `48 kHz` stereo, FPS adaptif)**
