# <Judul Proyek> (`NN-slug`)

> Ringkasan satu kalimat mengenai tujuan video dan audiens sasarannya.

![Poster Proyek](preview/poster.jpg)

## Informasi Produksi

| Atribut | Nilai |
| :--- | :--- |
| **Track & Engine** | `<Track 1: Lemo-Opuscar (<slug>) / Track 2: DOM/SVG/GSAP Hybrid + Lemo Runner / Track 3: HyperFrames Lean>` |
| **Format & FPS** | `<1920x1080 (16:9) / 1080x1920 (9:16)>` @ `<24/30/60 FPS>` |
| **Durasi & Ukuran** | `<XX.X detik · XX.X MB (< 50 MB)>` |
| **Bahasa & Voice-Over** | `<Bahasa Indonesia Expressive VO (Gemini gemini-3.8-flash-tts / fallback Edge TTS) / Rekaman Pribadi / Tanpa VO>` |
| **Audio & Mastering** | `<VO + BGM + Event-Synced SFX via out/mix.wav · -14.0 LUFS · Peak <= -1.0 dBFS · 48 kHz stereo>` |
| **Subtitle** | `<Short-Form Captions / Kinetic Typography / Creative Stylized / Tracking Integrated / SRT Only>` + `output/<slug>.srt` |
| **Thumbnail** | `<output/<slug>-thumbnail.jpg (Dedicated Clean Cover) + Strong First Frame / First Frame Only>` |
| **Privasi & Sensor** | `<Ringkasan masker blur/anonimisasi sesuai BRIEF.md / Tidak ada data sensitif>` |
| **Status** | `<Draft / Preview Approved / Rendered & Human QA Verified>` |

## Pratinjau Visual

![Contact Sheet](preview/contact-sheet.jpg)

## Dokumen Terkait

- [FACTS.md](FACTS.md) — Ringkasan fakta terverifikasi dari riset bahan
- [BRIEF.md](BRIEF.md) — Kesepakatan Konteks, Gaya Visual, Track Otomatis, Audio/BGM, Subtitle, Thumbnail, & Privasi
- [TREATMENT.md](TREATMENT.md) *(Track 1 — termasuk Tabel Adaptasi Konteks)* atau [STORYLINES.md](STORYLINES.md) + [SPEC.md](SPEC.md) *(Track 2/3)*
- [STORYBOARD.md](STORYBOARD.md) *(bila dibuat)*
- [REVIEW.md](REVIEW.md) — Hasil audit otomatis (`studio-audit.mjs` / `hyperframes check`), pengecekan font lokal & zona aman `9:16`, serta Human QA

## Naskah, Subtitle & Aset

- **Naskah & Timing VO:** [voice/lines.json](voice/lines.json) · [voice/dur.json](voice/dur.json) · [voice/schedule.json](voice/schedule.json) · [voice/words.json](voice/words.json)
- **Aset & Font Lokal:** daftar logo, font `@font-face` (`assets/fonts/`), gambar/masking, GSAP lokal, dan musik *(cantumkan sumber/lisensi di `CREDITS`)*
- **Verifikasi Fakta & Placeholder:** `<Semua angka & aset terverifikasi resmi / Daftar placeholder tersisa: tidak ada>`

## Cara Render Ulang Secara Lokal (Windows)

> Pastikan prasyarat di [WORKSPACE_CONTEXT.md](../../WORKSPACE_CONTEXT.md) dan root [README.md](../../README.md) sudah terpasang. File `.mp4`, `.wav`/`.mp3`, dan `.env` diabaikan oleh `.gitignore`.

### 1. Sintesis Voice-Over (Gemini TTS Utama + Audio Lock / Edge Fallback) & Mix BGM+SFX
```powershell
..\..\lemo-opuscar\.venv\Scripts\python.exe ..\..\.agents\skills\motion-studio-workflow\scripts\tts_expressive.py . --engine auto
..\..\lemo-opuscar\.venv\Scripts\python.exe mix.py
..\..\lemo-opuscar\.venv\Scripts\python.exe ..\..\lemo-opuscar\core\render\srt.py voice\cues.json output\<slug>.srt
```
*(Gunakan `--tempo 0.90` pada `tts_expressive.py` bila ingin melambatkan/mempercepat tanpa mengubah pitch/performa vokal asli).*

### 2. Audisi Audio, Audit Cepat & Live Preview *(Sebelum Render)*
- **Track 1 & 2 (Audio Audition, Audit Stills/Safe-Zone/Contrast & Live Preview Terpadu):**
  ```powershell
  node ..\..\.agents\skills\motion-studio-workflow\scripts\studio-audit.mjs . --strict
  node ..\..\.agents\skills\motion-studio-workflow\scripts\lemo-preview.mjs . --port 3020
  ```
  - Audisi suara & lompat per kalimat: `http://127.0.0.1:3020/audition`
  - Live Preview animasi sinkron: `http://127.0.0.1:3020/`
- **Track 3 (HyperFrames Lean — Khusus `<video>` / `video-demo` / `slideshow`):**
  ```powershell
  node ..\..\.agents\skills\hyperframes\scripts\plugin-cli.mjs lint .
  node ..\..\.agents\skills\hyperframes\scripts\plugin-cli.mjs check --json .
  node ..\..\.agents\skills\hyperframes\scripts\plugin-cli.mjs play --port 3030 .
  ```

### 3. Render Final MP4 (`-14 LUFS`, 48 kHz Stereo, `< 50 MB`) & Thumbnail
- **Track 1 & 2 (Paralel Lemo Runner + FFmpeg `< 50 MB`):**
  ```powershell
  $env:PLAYWRIGHT_CHROME = "$env:USERPROFILE\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe"
  Push-Location ..\..\lemo-opuscar
  node core/render/video.mjs ../projects/<NN-slug> --fps <fps> --workers 3 --size <WxH> --out ../projects/<NN-slug>/out/video.mp4
  Pop-Location
  ffmpeg -y -i out\video.mp4 -i out\mix.wav -map 0:v:0 -map 1:a:0 -c:v libx264 -preset medium -crf 19 -maxrate 6000k -bufsize 12000k -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart output\<slug>.mp4
  Remove-Item -Force out\video.mp4
  ```
- **Track 3 (HyperFrames 1-Pass `< 50 MB`):**
  ```powershell
  node ..\..\.agents\skills\hyperframes\scripts\plugin-cli.mjs render --fps <fps> --quality looks --crf 19 --max-bitrate 6000k --buffer-size 12000k -o output\<slug>.mp4 .
  ```
*(Pastikan hasil akhir `output/<slug>.mp4` berukuran `< 50 MB` dan audio `48 kHz` stereo; ekspor cover bersih ke `output/<slug>-thumbnail.jpg` serta salin versi ringan ke `preview/poster.jpg` & `preview/contact-sheet.jpg` masing-masing `≤ 400 KB`).*
