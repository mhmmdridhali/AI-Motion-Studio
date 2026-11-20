# <Judul Proyek> (`NN-slug`)

> Ringkasan satu kalimat mengenai tujuan video dan audiens sasarannya.

![Poster Proyek](preview/poster.png)

## Informasi Produksi

| Atribut | Nilai |
| :--- | :--- |
| **Mode Engine** | `<Mode A: HyperFrames + Audio Suite / Mode B: Lemo-Opuscar (<slug>) / Mode C: Hybrid>` |
| **Format & FPS** | `<1920x1080 (16:9) / 1080x1920 (9:16)>` @ `<60 FPS / FPS STYLE.md>` |
| **Durasi Final** | `<XX.X detik>` |
| **Bahasa & Voice-Over** | `<Bahasa Indonesia Expressive VO (id-ID-ArdiNeural / id-ID-GadisNeural) / Rekaman Pribadi / Tanpa VO>` |
| **Audio & Mastering** | `<Instrumen BGM + Foley, -14.0 LUFS, Peak <= -1.0 dBFS>` |
| **Subtitle** | `<Burn-in Kinetik + voice/<slug>.srt / voice/<slug>.srt (ekspor SRT) / Tidak ada>` |
| **Status** | `<Draft / Preview Approved / Rendered & Human QA Verified>` |

## Pratinjau Visual

![Contact Sheet](preview/contact-sheet.png)

## Dokumen Terkait

- [FACTS.md](FACTS.md) — Ringkasan fakta terverifikasi dari riset bahan
- [BRIEF.md](BRIEF.md) — Kesepakatan gaya visual, Voice Direction, rasio, dan mode
- [STORYLINES.md](STORYLINES.md) *(Mode A/C)* atau [TREATMENT.md](TREATMENT.md) *(Mode B — termasuk Tabel Adaptasi Konteks)*
- [SPEC.md](SPEC.md) *(Mode A/C)* — Spesifikasi angka eksak visual, tipografi, shot list, dan daftar `BANNED`
- [STORYBOARD.md](STORYBOARD.md) *(bila dibuat)*
- [REVIEW.md](REVIEW.md) — Hasil QA visual/teknis pra-render dan konfirmasi Human QA

## Naskah, Subtitle & Aset

- **Naskah & Timing VO:** [voice/lines.json](voice/lines.json) · [voice/dur.json](voice/dur.json) · [voice/schedule.json](voice/schedule.json) · [voice/words.json](voice/words.json)
- **Aset Lokal:** daftar logo, font, gambar, dan musik di `assets/` *(cantumkan sumber/lisensi di `CREDITS`)*
- **Verifikasi Fakta & Placeholder:** `<Semua angka & logo terverifikasi resmi / Daftar placeholder yang tersisa: tidak ada>`

## Cara Render Ulang Secara Lokal (Windows)

> Pastikan prasyarat di [WORKSPACE_CONTEXT.md](../../WORKSPACE_CONTEXT.md) dan root [README.md](../../README.md) sudah terpasang. File `.mp4` dan `.wav`/`.mp3` diabaikan oleh `.gitignore`.

### 1. Sintesis Voice-Over Ekspresif + WordBoundary *(jika memakai TTS)*
```powershell
..\..\lemo-opuscar\.venv\Scripts\python.exe ..\..\.agents\skills\motion-studio-workflow\scripts\tts_expressive.py .
..\..\lemo-opuscar\.venv\Scripts\python.exe ..\..\lemo-opuscar\core\render\srt.py voice\cues.json output\<slug>.srt
```

### 2. Live Preview Interaktif *(Sebelum Render)*
- **Mode A / C (HyperFrames):**
  ```powershell
  node ..\..\.agents\skills\hyperframes\scripts\plugin-cli.mjs check --json
  node ..\..\.agents\skills\hyperframes\scripts\plugin-cli.mjs preview
  ```
- **Mode B (Lemo-Opuscar):**
  ```powershell
  node ..\..\.agents\skills\motion-studio-workflow\scripts\lemo-preview.mjs . --port 3020
  ```

### 3. Render Final MP4 (`-14 LUFS`)
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
