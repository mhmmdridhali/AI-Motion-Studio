# <Judul Proyek> (`NN-slug`)

> Ringkasan satu kalimat mengenai tujuan video dan audiens sasarannya.

![Poster Proyek](preview/poster.png)

## Informasi Produksi

| Atribut | Nilai |
| :--- | :--- |
| **Mode Engine** | `<Mode A: HyperFrames + Audio Suite / Mode B: Lemo-Opuscar (<slug>) / Mode C: Hybrid>` |
| **Format & FPS** | `<1920x1080 (16:9) / 1080x1920 (9:16)>` @ `<60 FPS / FPS STYLE.md>` |
| **Durasi Final** | `<XX.X detik>` |
| **Bahasa & Voice-Over** | `<Bahasa Indonesia (id-ID-ArdiNeural / id-ID-GadisNeural) / Rekaman Pribadi / Tanpa VO>` |
| **Subtitle** | `<voice/<slug>.srt (ekspor SRT) / Burn-in + SRT / Tidak ada>` |
| **Status** | `<Draft / Preview Approved / Rendered & Human QA Verified>` |

## Pratinjau Visual

![Contact Sheet](preview/contact-sheet.png)

## Dokumen Terkait

- [STORYLINES.md](STORYLINES.md) *(Mode A/C)* atau [TREATMENT.md](TREATMENT.md) *(Mode B)*
- [SPEC.md](SPEC.md) — Spesifikasi angka eksak visual, tipografi, shot list, dan daftar `BANNED`
- [STORYBOARD.md](STORYBOARD.md) *(bila dibuat)*
- [REVIEW.md](REVIEW.md) — Hasil QA visual pra-render dan catatan perbaikan

## Naskah, Subtitle & Aset

- **Naskah & Timing VO:** [voice/lines.json](voice/lines.json) · [voice/dur.json](voice/dur.json) · [voice/<slug>.srt](voice/<slug>.srt)
- **Aset Lokal:** daftar logo, font, gambar, dan musik di `assets/` *(cantumkan sumber/lisensi jika dari luar)*
- **Verifikasi Fakta & Placeholder:** `<Semua angka & logo terverifikasi resmi / Daftar placeholder yang tersisa: tidak ada>`

## Cara Render Ulang Secara Lokal

> Pastikan prasyarat di [WORKSPACE_CONTEXT.md](../../WORKSPACE_CONTEXT.md) dan root [README.md](../../README.md) sudah terpasang. File `.mp4` dan `.wav`/`.mp3` diabaikan oleh `.gitignore`.

### 1. Generate Voice-Over *(jika memakai TTS)*
```powershell
..\..\lemo-opuscar\.venv\Scripts\python.exe ..\..\lemo-opuscar\core\tts\tts_zh.py voice\lines.json voice\wav --voice id-ID-ArdiNeural
```

### 2. Preview & QA *(Mode A/C — HyperFrames)*
```powershell
node ..\..\.agents\skills\hyperframes\scripts\plugin-cli.mjs check --json
node ..\..\.agents\skills\hyperframes\scripts\plugin-cli.mjs preview
```

### 3. Render Final MP4
- **Mode A / C (HyperFrames):**
  ```powershell
  node ..\..\.agents\skills\hyperframes\scripts\plugin-cli.mjs render -o output\<slug>.mp4
  ```
- **Mode B (Lemo-Opuscar):**
  ```powershell
  node ..\..\lemo-opuscar\core\render\video.mjs . output\silent.mp4 --fps <fps>
  sh ..\..\lemo-opuscar\core\render\mux.sh output\silent.mp4 output\<slug>.mp4
  ```
