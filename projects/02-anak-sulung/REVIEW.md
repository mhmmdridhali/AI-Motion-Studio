# REVIEW (Gate #3 Visual & Technical QA) — 02-anak-sulung

## 1. Identitas & Meta Proyek
- **Proyek:** `projects/02-anak-sulung`
- **Judul:** Perjalanan Anak Dalam Rumah (I) — Anak Sulung: Kuat Karena Harus
- **Penulis Naskah & Sumber:** Muhammad Ali Ridho (@mhmmdaliridh di Medium)
- **Engine & Gaya:** Mode B — `Lemo-Opuscar Pure` (Risograph Print WebGL2 Shader + Canvas 2D)
- **Format:** Vertikal `9:16` (`1080×1920`), `24 FPS`, Durasi: `59.385 detik` (1.425 frames)
- **Audio:** `voice/audition.wav` (`id-ID-ArdiNeural` dengan jeda emosional santun)

---

## 2. Audit Kepatuhan Kontrak & SOP (SOP v2)

| Poin Audit | Standar Evaluasi | Status | Catatan Verifikasi |
| :--- | :--- | :--- | :--- |
| **Karakter Manusia** | Karakter anak laki-laki berpakaian nyata & ekspresif | **PASS** | Kaos bergaris terracotta-krem, celana pendek navy, sneakers, rambut bertekstur riso, mata berkedip & rona pipi. |
| **Lingkungan & Layering** | Kedalaman multi-layer, tidak statis | **PASS** | Eksterior malam beratap kota, meja arsitek blueprint, jam dinding antik bird's-eye, ruang keluarga karpet & adik bermain, rumah badai genteng lempung, & closing card sunrise. |
| **Transisi Kamera** | Halus, dinamis, tanpa kesan slideware | **PASS** | Continuous zoom-in jendela, high-angle bird's eye view, horizontal tracking, & low-angle storm tilt. |
| **Subtitle Swiss Kinetic** | Tempo narasi mikro 2-3 kata per beat | **PASS** | Sinkron kata per kata (`words.json`) dengan pill knockout kertas riso tipis & double-hit typography. |
| **Scene 5 (Rumah Badai)** | Arsitektur rumah yang bertahan di badai | **PASS** | Rumah beratap genteng lempung dan pondasi batu kali kokoh tanpa halangan karakter atau ornamen lingkaran yang membingungkan. |
| **Scene 6 (Swiss Closing)** | Typographic quote card khas editorial | **PASS** | Tata letak simetris majalah sastra berfokus 100% pada kutipan inti tanpa subtitle/atribusi yang mengalihkan perhatian. |
| **Readcheck.mjs** | Keterbacaan teks on-screen (CPS + pad) | **PASS (9/9)** | Seluruh 9 teks judul lolos uji baca dengan margin waktu aman (`readcheck.mjs` exit 0). |
| **Fakta & Placeholder** | Larangan klaim palsu / logo buatan | **PASS** | 100% fakta orisinal dari esai Medium Mas Ali Ridho, tidak ada placeholder fiktif. |

---

## 3. Contact Sheet Still Frames
Semua 6 still frame terverifikasi melalui satu lembar `boards/contact-sheet.jpg`:
- **Shot 1 (t=4.0s):** Rumah malam hening, bulan berpendar, anak sulung menatap malam dari jendela meja belajar.
- **Shot 2 (t=15.0s):** Meja rancang bangun blueprint pengasuhan, penggaris & catatan sticky note kontras tinggi.
- **Shot 3 (t=22.0s):** High-angle bird's-eye view anak terbebani lingkaran batu ekspektasi di lantai dial jam.
- **Shot 4 (t=32.0s):** Ruang tengah keluarga hangat, dua adik kecil bermain riang, sulung berjaga di ambang pintu.
- **Shot 5 (t=42.0s):** Rumah kokoh beratap genteng lempung berdiri tegak di tengah badai hujan & petir.
- **Shot 6 (t=53.0s):** Kartu kutipan puitis Swiss Editorial berbalut sinar fajar keemasan.

---

## 4. Status Live Preview Player
- **Server:** `http://127.0.0.1:3020/` (berjalan via `lemo-preview.mjs` dengan audio sync, scrubber, & step +/-1 frame).

---

## 5. Laporan Teknis Tahap 6 (Mastering & Encoding)
- **Master Render Mezzanine (CRF 14):** `output/02-anak-sulung-master.mp4` (~415 MB, 57 Mbps) — arsip kualitas tertinggi.
- **Web Distribution Video (Medsos & Web Ready):** `output/02-anak-sulung.mp4` (**15.1 MB**, 2.1 Mbps) — teroptimasi untuk web portfolio, Instagram Reels, TikTok, dan YouTube Shorts.
- **Integrated Loudness:** `-14.2 LUFS` (Target: `-14.0 LUFS ± 1.0`)
- **True Peak:** `-1.4 dBFS` (Ceiling: $\le -1.0\text{ dBFS}$)
- **Black Frames:** `0` frame hitam (0.00s durasi gelap)
- **FastStart:** Ya (moov atom di awal file untuk *instant streaming*)
