# Standar Encoding `< 50 MB`, Thumbnail Publikasi & Git Delivery (Tahap 6–7)

Panduan ini menjamin hasil akhir `.mp4` berkapasitas di bawah **50 MB** dengan kejernihan gambar dan audio standar siaran, memiliki thumbnail publikasi bersih, dan tersimpan rapi di Git.

---

## 1. Standar Kualitas Video & Audio (< 50 MB)

- **Target Ukuran:** `projects/NN-slug/output/<slug>.mp4` **wajib < 50 MB** (`< 52.428.800` byte). Rentang optimal untuk 45–90 detik adalah **12–35 MB** agar ringan diunggah dan tetap tajam pada layar HD/Full HD.
- **Larangan Mutlak `-c:v copy` dari Mezzanine:** `lemo-opuscar/core/render/video.mjs` menghasilkan `-crf 14` (file *mezzanine* ratusan MB). **Dilarang** menyalin stream video (`-c:v copy`) langsung ke `output/<slug>.mp4`.

### Resep Encoding Baku (`libx264` + AAC `48 kHz` Stereo)
- **Audio Universal:** AAC **Stereo (`-ac 2`)**, **`48000 Hz`** (`aresample=48000`), bitrate `192k`, normalisasi dua-tahap **`-14 LUFS`** (`TP ≤ -1.0 dBFS`, `LRA ≤ 11`).
- **Container:** `.mp4`, pixel format **`yuv420p`**, dan **`-movflags +faststart`**.
- **Video Codec:**
  - **Mode A/C & Mode B Flat/Vektor:** `-c:v libx264 -preset medium -crf 19 -maxrate 6000k -bufsize 12000k`
  - **Mode B Bertekstur/Grain/Halftone (`risograph`, `watercolor`, `ink-wash`, `oil`):** `-c:v libx264 -preset slow -crf 20 -maxrate 4500k -bufsize 9000k` *(bila video panjang mendekati 48 MB, naikkan ke `-crf 22 -maxrate 3500k -bufsize 7000k` tanpa menghilangkan ketajaman garis)*.
- **Untuk `mux.sh` (Mode B):** Cek ukuran hasil `mux.sh`; jika masih `≥ 50 MB`, re-encode satu kali memakai profil `-crf 20..22 -maxrate 4500k -bufsize 9000k -c:a copy`.

---

## 2. Standar Thumbnail Publikasi & Frame Pertama

1. **Strong First Frame (`t = 0.00s`):** Frame pembuka video wajib langsung menampilkan visual/judul yang kuat (hindari layar kosong gelap atau fade-in lama) sehingga thumbnail otomatis bawaan media sosial tetap menarik.
2. **Dedicated Thumbnail (`output/<slug>-thumbnail.jpg` — bila dipilih di `BRIEF.md`):**
   - Render cover khusus yang **100% bersih tanpa potongan subtitle menggantung** (berisi visual hero + judul *hook* singkat + zona aman crop IG/TikTok/YouTube) melalui parameter `?thumb=1` (atau `thumbnail.html` terpisah).
   - Gunakan juga file thumbnail bersih ini sebagai basis **`preview/poster.jpg`** (`≤ 400 KB`) untuk dokumentasi GitHub.
   - *(Opsional jika diminta di `BRIEF.md`: tanamkan thumbnail ke stream metadata `.mp4` memakai `-disposition:v:1 attached_pic` pada `ffmpeg`)*.

---

## 3. Verifikasi Teknis Wajib & Human QA

Sebelum menyerahkan hasil ke user, jalankan dan catat di `REVIEW.md`:
1. **`ffprobe`:** Konfirmasi `h264 (High)`, `yuv420p`, dimensi/FPS sesuai `BRIEF.md`, audio `aac 48000 Hz stereo`, dan ukuran `< 50 MB`.
2. **`blackdetect`:** `ffmpeg -i output/<slug>.mp4 -vf "blackdetect=d=0.1:pix_th=0.10" -f null -` → **0 frame hitam** tak disengaja.
3. **`ebur128`:** `I` antara `-13.0` s/d `-15.0 LUFS`, True Peak `≤ -1.0 dBFS`.
4. **Serahkan ke User dengan Hyperlink:** Cantumkan link `file:///` ke `output/<slug>.mp4` dan `output/<slug>-thumbnail.jpg`, lalu **tunggu konfirmasi lulus Human Audio/Video QA**.

---

## 4. Pembersihan & Dokumentasi Git (Tahap 7)

Hanya jalankan setelah user mengonfirmasi `.mp4` final lulus Human QA:

1. Hapus file mezzanine berat (`out/video.mp4`, `output/*-master.mp4`) agar hemat ruang disk.
2. Ekspor **`preview/poster.jpg`** *(dari `output/<slug>-thumbnail.jpg` atau hero frame bersih)* dan **`preview/contact-sheet.jpg`**, masing-masing terkompresi **`≤ 400 KB`**.
3. Pastikan `boards/stills/`, `output/`, `ref/`, `source/`, dan `.env` tidak muncul di `git status --short`.
4. Scan seluruh berkas proyek: wajib `$env:USERPROFILE` / `%USERPROFILE%`, **0 path username lokal**, dan **0 API key**.
5. Tulis `projects/NN-slug/README.md` mengikuti [project-readme-template.md](project-readme-template.md), perbarui tabel portofolio di root `README.md`, buat **1x `git commit` lokal**, lalu **minta izin user** sebelum `git push`.
