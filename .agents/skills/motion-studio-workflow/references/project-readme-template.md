# <Judul Proyek> (`NN-slug`)

> Ringkasan satu kalimat mengenai tujuan video dan audiens sasarannya.

![Poster Proyek](preview/poster.jpg)

## Informasi Produksi

| Atribut | Nilai |
| :--- | :--- |
| **Mode Engine** | `<Mode A: HyperFrames + Audio Suite / Mode B: Lemo-Opuscar (<slug>) / Mode C: Hybrid>` |
| **Format & FPS** | `<1920x1080 (16:9) / 1080x1920 (9:16)>` @ `<60 FPS / FPS STYLE.md>` |
| **Durasi & Ukuran** | `<XX.X detik · XX.X MB (< 50 MB)>` |
| **Bahasa & Voice-Over** | `<Bahasa Indonesia Expressive VO (Gemini gemini-3.8-flash-tts / fallback Edge TTS) / Rekaman Pribadi / Tanpa VO>` |
| **Audio & Mastering** | `<VO + BGM + SFX via out/mix.wav · -14.0 LUFS · Peak <= -1.0 dBFS · 48 kHz stereo>` |
| **Subtitle** | `<Short-Form Captions / Kinetic Typography / Creative Stylized / Tracking Integrated / SRT Only>` + `output/<slug>.srt` |
| **Thumbnail** | `<output/<slug>-thumbnail.jpg (Dedicated Clean Cover) + Strong First Frame / First Frame Only>` |
| **Status** | `<Draft / Preview Approved / Rendered & Human QA Verified>` |

## Pratinjau Visual

![Contact Sheet](preview/contact-sheet.jpg)

## Dokumen Terkait

- [FACTS.md](FACTS.md) — Ringkasan fakta terverifikasi dari riset bahan
- [BRIEF.md](BRIEF.md) — Kesepakatan Konteks, Gaya Visual, Audio/BGM, Subtitle, Thumbnail, & Mode
- [STORYLINES.md](STORYLINES.md) *(Mode A/C)* atau [TREATMENT.md](TREATMENT.md) *(Mode B — termasuk Tabel Adaptasi Konteks)*
- [SPEC.md](SPEC.md) *(Mode A/C)* — Spesifikasi angka eksak visual, tipografi, shot list, dan daftar `BANNED`
- [STORYBOARD.md](STORYBOARD.md) *(bila dibuat)*
- [REVIEW.md](REVIEW.md) — Hasil audit visual/teknis pra-render dan konfirmasi Human QA

## Naskah, Subtitle & Aset

- **Naskah & Timing VO:** [voice/lines.json](voice/lines.json) · [voice/dur.json](voice/dur.json) · [voice/schedule.json](voice/schedule.json) · [voice/words.json](voice/words.json)
- **Aset Lokal:** daftar logo, font, gambar, dan musik di `assets/` *(cantumkan sumber/lisensi di `CREDITS`)*
- **Verifikasi Fakta & Placeholder:** `<Semua angka & logo terverifikasi resmi / Daftar placeholder yang tersisa: tidak ada>`

## Cara Render Ulang Secara Lokal (Windows)

> Pastikan prasyarat di [WORKSPACE_CONTEXT.md](../../WORKSPACE_CONTEXT.md) dan root [README.md](../../README.md) sudah terpasang. File `.mp4`, `.wav`/`.mp3`, dan `.env` diabaikan oleh `.gitignore`.

### 1. Sintesis Voice-Over (Gemini TTS Utama / Edge Fallback) & Mix BGM+SFX
```powershell
..\..\lemo-opuscar\.venv\Scripts\python.exe ..\..\.agents\skills\motion-studio-workflow\scripts\tts_expressive.py . --engine auto
..\..\lemo-opuscar\.venv\Scripts\python.exe mix.py
..\..\lemo-opuscar\.venv\Scripts\python.exe ..\..\lemo-opuscar\core\render\srt.py voice\cues.json output\<slug>.srt
```

### 2. Audisi Audio & Live Preview Interaktif *(Sebelum Render)*
- **Mode B (Lemo-Opuscar) & Audio Audition Studio (Semua Mode):**
  ```powershell
  node ..\..\.agents\skills\motion-studio-workflow\scripts\lemo-preview.mjs . --port 3020
  ```
  - Audisi suara & lompat per kalimat: `http://127.0.0.1:3020/audition`
  - Live Preview animasi sinkron: `http://127.0.0.1:3020/`
- **Mode A / C (HyperFrames):**
  ```powershell
  node ..\..\.agents\skills\hyperframes\scripts\plugin-cli.mjs check --json
  node ..\..\.agents\skills\hyperframes\scripts\plugin-cli.mjs preview
  ```

### 3. Render Final MP4 (`-14 LUFS`, 48 kHz Stereo, `< 50 MB`) & Thumbnail
- **Mode A / C (HyperFrames):**
  ```powershell
  node ..\..\.agents\skills\hyperframes\scripts\plugin-cli.mjs render -o output\<slug>.mp4
  ```
- **Mode B (Lemo-Opuscar):**
  ```powershell
  $env:PLAYWRIGHT_CHROME = "$env:USERPROFILE\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe"
  Push-Location ..\..\lemo-opuscar
  node core/render/video.mjs ../projects/<NN-slug> --fps <fps> --workers 3 --size <WxH> --out ../projects/<NN-slug>/out/video.mp4
  & "C:\Program Files\Git\bin\sh.exe" core/render/mux.sh "../projects/<NN-slug>/out/video.mp4" "../projects/<NN-slug>/out/mix.wav" "../projects/<NN-slug>/output/<slug>.mp4" <fps> 0
  Pop-Location
  ```
  *(Pastikan hasil akhir `output/<slug>.mp4` berukuran `< 50 MB` dan audio ter-resample `48 kHz` stereo; render cover bersih tanpa subtitle ke `output/<slug>-thumbnail.jpg` serta salin versi ringan ke `preview/poster.jpg` `≤ 400 KB`).*
