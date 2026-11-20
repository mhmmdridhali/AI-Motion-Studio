# REVIEW & QA MASTER VIDEO: SI-PELITA Explainer (9:16)

Dokumen ini mencatat hasil verifikasi teknis dan inspeksi visual akhir terhadap berkas video master `output/sipelita-explainer-9x16.mp4`.

## 1. Spesifikasi Berkas Master (`ffprobe`)

| Parameter | Nilai Terukur |
| :--- | :--- |
| **Video Master** | `output/sipelita-explainer-9x16.mp4` (`12.090.622` bytes / ~11,53 MB) |
| **Subtitle Sidecar** | `output/sipelita-explainer-9x16.srt` (`18` cue tersinkron) |
| **Resolusi & Rasio** | `1080x1920` (vertikal `9:16`) |
| **Frame Rate & Total Frame** | `60 FPS` (`60/1`), `3.845` frame (`h264`, `yuvj420p`) |
| **Durasi** | `64.083s` |
| **Audio Stream** | `AAC` stereo `48.000 Hz`, `2` kanal (`1.509 kbps` total bitrate) |

## 2. Pemeriksaan Loudness, Frame Kosong & Keterbacaan Teks

| Pemeriksaan | Hasil | Ambang / Keterangan |
| :--- | :--- | :--- |
| **Loudness Audio (`ebur128`)** | **`-14.0 LUFS`**, `LRA: 3.1 LU` | Target `-14.0 LUFS ± 1 LU` (Lulus tepat target) |
| **True Peak (`ebur128`)** | **`-2.0 dBFS`** | Target `<= -1.0 dBTP` (Aman dari clipping) |
| **Deteksi Frame Hitam (`blackdetect`)** | **`0` segmen** (`black_start/end` kosong) | 0 frame kosong di sepanjang 64,08 detik |
| **Uji Keterbacaan (`readcheck.mjs`)** | **Seluruh blok `OK` (exit code `0`)** | Semua label, angka, dan 3 kutipan tampil memadai |
| **Audit Kebersihan Naskah & Privasi** | **0 isu** | 0 em/en-dash, 0 watermark pihak ketiga, 0 nama madrasah, 0 kebocoran kredensial |

## 3. Inspeksi Visual (`preview/poster.png` & `preview/contact-sheet.png`)

- **Komposisi 24 Frame (`6x4` grid):** Seluruh transisi antar 7 shot berjalan bersih di atas kertas matte `#F4F1EA` dengan satu aksen Kemenag Emerald `#157A3D`, tanpa tumpang tindih antara judul kiri atas, bentuk geometris/protagonis, dan subtitle kinetik bawah.
- **Disiplin Gaya & Data:** Hanya 3 kemunculan stickman Operator (Shot 1, 2, 4); seluruh elemen alur data (*chat bubbles*, *portal arch*, prisma konvergensi, perisai *anti-duplikasi*, ponsel `No. WA`, cincin radial `> 95%` + 24 penanda jam, gelombang `A/B/C`, dan pita konvergensi segel Kemenag) terbaca tajam.

## 4. Human Audio/Video QA (Gate Akhir Selesai)

- [x] Putar penuh `output/sipelita-explainer-9x16.mp4` dari `00:00` hingga `01:04` dengan suara aktif.
- [x] Intonasi VO ekspresif, jeda hening sebelum Shot 2 & Shot 5, musik `108 BPM` + foley, dan subtitle kinetik terkonfirmasi sesuai oleh pengguna (`"Sudah sesuai"` pada 2026-11-20).
- [x] Siap didokumentasikan dan di-commit ke repositori lokal (Tahap 7).
