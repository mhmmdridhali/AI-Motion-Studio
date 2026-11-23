# Laporan Audit Visual & Audio Pra-Render (`06-sipelita-explainer-v2`)

Dokumen ini merangkum hasil pemeriksaan otomatis dan visual sebelum proses render video final `.mp4` (`30 FPS`, `< 50 MB`).

## 1. Hasil Audit Otomatis (`studio-audit.mjs --strict --thumb`)

- **Command:** `node .agents\skills\motion-studio-workflow\scripts\studio-audit.mjs projects\06-sipelita-explainer-v2 --strict --thumb`
- **Status:** `ok=true` | **`errors=0`** | **`warnings=0`** (waktu eksekusi `24.6s`)
- **Dimensi & Durasi:** `1080x1920` (`9:16` vertikal) · `81.85 detik` (`12 shot` + `Frame 0` + `Cover / Thumbnail`)
- **Lembar Audit Visual:**
  - `boards/contact-sheet.jpg` (`1310x2410`, `370.2 KB`, 14 panel termasuk `Cover / Thumbnail`)
  - `boards/phone-360.jpg` (`738x4710`, `352.2 KB`, simulasi keterbacaan layar ponsel `360px`)
  - `boards/seams.jpg` (`864x5306`, `390.7 KB`, pemeriksaan transisi antar-shot `cut-0.15s`, `cut`, `cut+0.15s`)
  - `boards/audit-report.json` (`errors: 0`, `warnings: 0`, `findings: []`)

## 2. Pemeriksaan Keterbacaan & Zona Aman `9:16` (`1080x1920`)

| Komponen Layar | Koordinat Vertikal (`y`) | Margin Horizontal (`x`) | Status Audit |
| :--- | :--- | :--- | :--- |
| **Header Badge & Title Card (`s01`..`s12`)** | `y: 112px .. 288px` | `x: 84px .. 996px` (`>= 80px`) | **LULUS** (bebas area notch/status bar atas) |
| **3D Low-Poly Island & In-World Pills** | `y: 340px .. 1042px` (`<= 1120px`) | Terpusat di frustum ortografis | **LULUS** (tidak pernah bertabrakan dengan subtitle) |
| **Creative Stylized Subtitles (`#sub-box`)** | `y: 1178px .. 1312px` (`<= 1360px`) | `max-width: 840px` (margin `>= 120px`) | **LULUS** (di atas batas aman UI Reels/TikTok/Shorts `y = 1360px`) |
| **Dedicated Cover Thumbnail (`?thumb=1`)** | `y: 118px .. 1325px` (`<= 1360px`) | `x: 84px .. 996px` | **LULUS** (100% bersih tanpa potongan subtitle menggantung) |
| **Strong First Frame (`t = 0.00s`)** | `entryA = 1.0`, kartu judul & karakter utuh | `x: 84px .. 996px` | **LULUS** (`first_frame_empty = 0`) |

## 3. Pemeriksaan Pacing, Kontinuitas 3D & Anti-Dead-Hold

- **Dead-Hold Frames (`> 2.2s` statis):** **`0` temuan**.
- **Gerak Kontinu Sepanjang `81.85s`:**
  - Permukaan laut low-poly (`sea.js`) bergerak kontinu melalui gelombang vertex non-indexed dan *shallow-water shoreline darkening* yang bereaksi langsung terhadap kemunculan tiap pulau heksagonal.
  - Kamera ortografis (`story.js`) melakukan *smooth ease-in-out tracking* dengan sedikit *ambient breathing drift* di setiap adegan.
  - Protagonis Operator Madrasah mengetik aktif di meja laptop dengan indikator layar berkedip halus, dikelilingi kubus pesan masuk (`s01`), tiga pulau formulir terpisah (`s02`), perahu layar yang melintas di perairan luar, serta burung camar low-poly yang terbang melingkar.
  - Transisi waktu malam (`s09`) memutar sorot lampu mercusuar (`lighthouse beam`) secara volumetrik di atas permukaan laut dengan bintang-bintang langit malam dan jendela hangat, lalu kembali terang secara mulus saat fajar (`s10`).

## 4. Pemeriksaan Audio 2-Fase, BGM Pitched Percussion & Material Foley

- **Voice-Over:** Gemini TTS (`gemini-3.8-flash-tts`, karakter suara `Orus`), 12 segmen (`voice/wav/s01.wav` s.d. `s12.wav`) dengan gaya bahasa sesama operator madrasah yang santai, komedi ringan, dan ad-lib natural (`Hmm...`, `Nah...`, `Tenang...`, `Lupa nomornya?`, `Eh...`).
- **Sinkronisasi Foley 1:1 (`events.json`):** `112` event animasi 3D terekspor otomatis dari timeline `world.js` (`hex_pop`, `splash`, `error_buzz`, `bridge_clack`, `dock_emerge`, `doc_slide`, `step_chime`, `turntable_spin`, `lighthouse_hum`, `star_chime`, `resolve_chord`) dan dipetakan tepat ke sampel milidetik pada `mix.py`.
- **Palet Instrumen (`lowpoly-island`):** Marimba kayu hangat, kalimba, celesta, woodblock klik mekanis, *warm low-passed pad*, shaker lembut, dan *muted kick* `54 Hz` (tanpa piano, tanpa gesek/strings).
- **2-Tier Ducking & Mastering (`out/mix.wav`):**
  - BGM di-duck `-11 dB` dan Material Foley di-duck `-4.5 dB` saat vokal berbicara.
  - Durasi total: `81.85 detik` (`48.000 Hz`, Stereo).
  - Loudness terukur: **`-14.0 LUFS`** (`RMS -14.77 dBFS`) · True Peak: **`-1.98 dBFS`** (`<= -1.0 dBFS`).
- **Sidecar Subtitle:** `output/06-sipelita-explainer-v2.srt` (`28` blok kalimat semantik yang selaras dengan `voice/words.json`).

## 5. Pemeriksaan Privasi, Aset Lokal & Kemandirian Offline

- **100% Offline & Self-Contained:** Seluruh font (`Jost`, `Plus Jakarta Sans`, `Source Serif 4` di `fonts/`), logo resmi (`assets/logo-kemenag.png`), dan pustaka Three.js dimuat secara lokal (`0` request jaringan eksternal, `0` error konsol browser).
- **Privasi & Keamanan Data:**
  - Testimoni `s10` 100% anonim (`Operator Madrasah A`, `Operator Madrasah B`, `Operator Madrasah C`).
  - Klaim metrik `s09` menggunakan angka *evergreen* (`Akses 24 Jam`, `Ratusan Laporan Masuk`, `> 95% Laporan Tuntas`).
  - `0` URL produksi internal, `0` nomor tiket asli, `0` NISN/NIK siswa asli, dan `0` nomor WhatsApp pribadi.

---

## 6. Hasil Verifikasi Render Final (Tahap 6)

- **File Output Utama:**
  - Video MP4: `output/06-sipelita-explainer-v2.mp4` (`40.17 MB` / `42.123.901 byte`, `< 50 MB`)
  - Cover Thumbnail: `output/06-sipelita-explainer-v2-thumbnail.jpg` (`1080x1920`, `?thumb=1`)
  - Sidecar Subtitle: `output/06-sipelita-explainer-v2.srt` (`28` blok semantik)
- **Pemeriksaan `ffprobe`:**
  - Video Stream: `h264 (High)` · `pix_fmt=yuv420p` · `color_range=tv` · `color_space=bt709` · `1080x1920` (`9:16`) · `30 fps` (`2.456 frame`, `81.87 detik`) · `3.911 kbps`
  - Audio Stream: `aac (LC)` · `48.000 Hz` · `stereo` · `192 kbps` (`81.85 detik`)
  - Container: `mov,mp4` dengan `-movflags +faststart`
- **Pemeriksaan `blackdetect` (`d=0.1:pix_th=0.10`):**
  - **`0` frame hitam** yang tidak disengaja di sepanjang `81.85 detik`.
- **Pemeriksaan Loudness EBU R128 (`ffmpeg -af ebur128=peak=true`):**
  - Integrated Loudness (`I`): **`-13.6 LUFS`** (target `-13.0` s.d. `-15.0 LUFS`)
  - Loudness Range (`LRA`): **`2.9 LU`**
  - True Peak (`TP`): **`-3.0 dBFS`** (target `<= -1.0 dBFS`)
