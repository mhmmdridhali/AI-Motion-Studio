# Standar Encoding `< 50 MB`, Thumbnail, Privasi Scan & Git Delivery (Tahap 6–7)

Panduan ini menjamin hasil akhir `.mp4` berkapasitas di bawah **50 MB** dengan kejernihan gambar dan audio standar siaran, memiliki thumbnail publikasi bersih, lolos audit privasi, dan tersimpan rapi di Git.

---

## 1. Standar Kualitas Video & Audio (< 50 MB)

- **Target Ukuran:** `projects/NN-slug/output/<slug>.mp4` **wajib < 50 MB** (`< 52.428.800` byte). Rentang optimal untuk 45–90 detik adalah **10–35 MB**.
- **FPS Adaptif Efisien:** Gunakan `24/30 FPS` sebagai default untuk gaya artistik (`Track 1`) & presentasi editorial tenang agar waktu render 2× lebih cepat; gunakan `60 FPS` hanya untuk motion UI/scroll cepat (`Track 2/3`) saat dibutuhkan.
- **Larangan Mutlak `-c:v copy` dari Mezzanine:** `lemo-opuscar/core/render/video.mjs` menghasilkan `-crf 14` (ratusan MB). **Dilarang** menyalin stream video (`-c:v copy`) langsung ke `output/<slug>.mp4`.

### Resep Encoding Baku (`libx264` + AAC `48 kHz` Stereo)
- **Audio Universal:** AAC **Stereo (`-ac 2`)**, **`48000 Hz`** (`aresample=48000`), bitrate `192k`, normalisasi dua-tahap **`-14 LUFS`** (`TP ≤ -1.0 dBFS`, `LRA ≤ 11`).
- **Container:** `.mp4`, pixel format **`yuv420p`**, dan **`-movflags +faststart`**.
- **Track 1 & 2 (Dari `video.mjs` + `out/mix.wav`):**
  - *Flat / Vektor / UI (`Track 2`):* `-c:v libx264 -preset medium -crf 19 -maxrate 6000k -bufsize 12000k`
  - *Bertekstur / Grain / Halftone (`risograph`, `watercolor`, `ink-wash`, `oil`):* `-c:v libx264 -preset slow -crf 20 -maxrate 4500k -bufsize 9000k` *(naikkan ke `-crf 22 -maxrate 3500k` bila mendekati 48 MB)*.
- **Track 3 (Render 1-Pass `HyperFrames` Langsung `< 50 MB`):**
  - Lewati file mezzanine `raw-render.mp4` bila audio sudah tertanam di HTML: render **1-pass langsung** ke distribusi dengan:
    ```powershell
    node .agents\skills\hyperframes\scripts\plugin-cli.mjs render --fps <fps> --quality looks --crf 19 --max-bitrate 6000k --buffer-size 12000k -o projects\NN-slug\output\<slug>.mp4 projects\NN-slug
    ```
  - *(Jika hasil > 48 MB atau perlu re-mux audio eksternal `out/mix.wav`, encode 1× dengan profil `-crf 19..21 -ar 48000 -ac 2 -movflags +faststart`)*.

---

## 2. Standar Thumbnail Publikasi & Frame Pertama

1. **Strong First Frame (`t = 0.00s`):** Frame pembuka video wajib langsung menampilkan visual/judul yang kuat (lolos `first_frame_empty` check) sehingga thumbnail bawaan media sosial tetap menarik.
2. **Dedicated Thumbnail (`output/<slug>-thumbnail.jpg` — bila dipilih di `BRIEF.md`):**
   - Render cover khusus yang **100% bersih tanpa potongan subtitle menggantung** melalui `?thumb=1` atau `thumbnail.html`, beresolusi penuh dan zona aman rapi.
   - Gunakan file thumbnail bersih ini juga sebagai basis **`preview/poster.jpg`** (`≤ 400 KB`) untuk dokumentasi GitHub.

---

## 3. Verifikasi Teknis Wajib & Human QA

Sebelum menyerahkan hasil ke user, jalankan dan catat di `REVIEW.md`:
1. **`ffprobe`:** Konfirmasi `h264 (High)`, `yuv420p`, dimensi/FPS sesuai `BRIEF.md`, audio `aac 48000 Hz stereo`, dan ukuran `< 50 MB`.
2. **`blackdetect`:** `ffmpeg -i output/<slug>.mp4 -vf "blackdetect=d=0.1:pix_th=0.10" -f null -` → **0 frame hitam** tak disengaja.
3. **`ebur128`:** `I` antara `-13.0` s/d `-15.0 LUFS`, True Peak `≤ -1.0 dBFS`.
4. **Serahkan ke User dengan Hyperlink:** Cantumkan link `file:///` ke `output/<slug>.mp4` dan `output/<slug>-thumbnail.jpg`, lalu **tunggu konfirmasi lulus Human Audio/Video QA**.

---

## 4. Pembersihan, Privacy Scan & Dokumentasi Git (Tahap 7)

Hanya jalankan setelah user mengonfirmasi `.mp4` final lulus Human QA:

1. Hapus file mezzanine berat (`out/video.mp4`, `out/raw-render.mp4`, serta duplikat `assets/mix.wav` jika ada agar tidak memakan disk) — pertahankan `boards/contact-sheet.jpg` (`≤ 400 KB`) sebagai arsip ringan.
2. Ekspor **`preview/poster.jpg`** *(dari `output/<slug>-thumbnail.jpg` atau hero frame bersih)* dan **`preview/contact-sheet.jpg`**, masing-masing terkompresi **`≤ 400 KB`**.
3. Pastikan `output/`, `ref/`, `source/`, `.cache/`, dan `.env` tidak muncul di `git status --short` (jaga total file Git proyek tetap ramping `< 2–5 MB`).
4. **Wajib Audit Privasi & Keamanan Regex Scan** pada seluruh file proyek yang akan di-commit:
   - Scan nama user Windows aktif (`$env:USERNAME` / `C:\Users\<user>`), pola `GEMINI_API_KEY` / token rahasia, serta **daftar kata sensitif/instansi/daerah** yang dikunci pada bagian `Privasi & Sensor` di `BRIEF.md` → hasil wajib **0 temuan**.
   - Pakai selalu `$env:USERPROFILE` / `%USERPROFILE%` di semua dokumen contoh perintah.
5. Tulis `projects/NN-slug/README.md` mengikuti [project-readme-template.md](project-readme-template.md), perbarui tabel portofolio di root `README.md`, buat **1x `git commit` lokal**, lalu **minta izin user** sebelum `git push`.
