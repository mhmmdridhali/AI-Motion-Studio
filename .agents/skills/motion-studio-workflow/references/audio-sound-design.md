# Standar Audio, Gemini TTS (Utama), Fallback & Sound Design (Tahap 2)

Panduan ini mengatur produksi narasi ekspresif (*Voice-First*), antarmuka audisi browser, dan kewajiban desain suara (**VO + BGM + SFX**) sebelum kode animasi ditulis.

---

## 1. Status BGM + SFX Mengikuti Kontrak `BRIEF.md`

- **Kondisi Standar (`BGM/SFX: Aktif` — default di Grill Me #3):** Wajib membangun `mix.py` guna memadukan **VO + BGM + SFX/Foley** menjadi **`out/mix.wav`** sesuai *delivery* yang disepakati di `BRIEF.md`. **Dilarang** memux `voice/audition.wav` kering sebagai audio final.
- **Kondisi Tanpa Musik (`BGM/SFX: Nonaktif` — apabila dipilih eksplisit di Grill Me #3):** Gunakan trek VO bersih (`voice/audition.wav`) yang telah dinormalisasi **`-14 LUFS`** dan `48 kHz` stereo.

---

## 2. Mesin VO Baku: Gemini TTS (Utama) + Edge TTS (Fallback)

Jalankan generator studio dengan `BypassSandbox: true`:

```powershell
lemo-opuscar\.venv\Scripts\python.exe .agents\skills\motion-studio-workflow\scripts\tts_expressive.py projects\NN-slug --engine auto
```

- **Mode Utama (`gemini-3.8-flash-tts`):**
  - Membaca `GEMINI_API_KEY` secara diam-diam dari `.env` root workspace (dilindungi `.gitignore` — jangan pernah mencetak isi key).
  - Mengirim naskah dalam **1–2 request *batched*** (`≤ 250` kata per batch) agar hemat kuota Free Tier (`2–3 RPM`, `10–50 RPD`) dan menyimpannya ke cache `voice/.cache/` (run ulang = `0` request).
  - Menyelaraskan timestamp per kata secara lokal via **`faster-whisper`** menghasilkan `voice/wav/<id>.wav`, `dur.json`, `schedule.json`, `words.json`, `cues.json`, dan `voice/audition.wav`.
- **Fallback Otomatis (`edge-tts`):** Apabila `.env` kosong, kena limit `429 RESOURCE_EXHAUSTED`, atau jaringan bermasalah, skrip otomatis beralih ke `edge-tts` (`WordBoundary`) dan membersihkan inline tag `<...>` agar tidak terbaca sebagai kata.
- **Human Voiceover (Opsional):** Apabila user menyetor rekaman pribadi, transkrip memakai `faster-whisper` (`language="id"`) ke format jadwal JSON yang sama.

---

## 3. Penulisan Naskah Ekspresif (`voice/lines.json`)

| Aturan | Contoh Praktis | Alasan |
| :--- | :--- | :--- |
| **Pisahkan `text` vs `say`** | `"text": "Sudah sampai mana?"`<br>`"say": "Eh, jujur ya... <short pause> Sudah sampai mana?"` | `text` bersih untuk subtitle layar; `say` mendukung `<short pause>`, `<breath>`, `<sigh>`, `<laugh>` di Gemini TTS. |
| **Gunakan `style` terstruktur** | Root/per-line `"style": "warm reflective Indonesian narrator, gentle sigh on endings, rising tone on questions"` | Dikirim sebagai `annotations: [{"type": "speech_metadata"}]` agar arahan akting suara tidak ikut dibaca. |
| **Pilih Persona `gemini_voice`** | Pria hangat: `Orus` / `Charon` · Wanita hangat: `Kore` / `Aoede` · Dinamis: `Puck` | Menjaga konsistensi karakter suara sepanjang video. |
| **Siap-Fallback Pertanyaan Retoris** | Akhiri kalimat tanya dengan **`?` murni** (hindari pola `'...?' .`), pecah frasa pendek, serta variasikan `rate` dan `pitch` (`-4Hz`..`+4Hz`). | Jika fallback ke `edge-tts`, intonasi tanya & jeda tetap alami. |

---

## 4. Mini-Gate Audisi Audio (Hyperlink + Browser Player)

Tepat setelah `tts_expressive.py` selesai dan **sebelum menulis kode animasi**:

1. Nyalakan server audisi studio dengan `BypassSandbox: true`:
   ```powershell
   node .agents\skills\motion-studio-workflow\scripts\lemo-preview.mjs projects\NN-slug --port 3020
   ```
   *(Server berjalan walau `index.html` belum dibuat).*
2. Berikan **keduanya** di chat ke user:
   - Link browser interaktif: **`http://127.0.0.1:3020/audition`** *(user bisa klik tiap baris naskah untuk lompat dan memutar ulang di `0.75x/1x/1.25x` maupun berganti track).*
   - **Clickable hyperlink file lokal**: `[audition.wav](file:///.../projects/NN-slug/voice/audition.wav)`.
3. **STOP — Tunggu persetujuan user** (dan anjurkan mengetik `/compact` setelah suara disetujui).

---

## 5. Produksi BGM, SFX & Mastering (`mix.py` → `out/mix.wav`)

1. Apabila `BRIEF.md` mencatat `BGM/SFX: Aktif`, buat `projects/NN-slug/mix.py` membaca `voice/schedule.json` sebagai jangkar waktu cut, motif gerak, dan titik hening dramatis.
2. Gunakan perkakas lokal di `lemo-opuscar/core/audio/` (`sfx.py`, `sampler.py`, `pluck.py`, sintesis NumPy) dan/atau audio berlisensi.
3. Mix di **`48000 Hz` stereo** dengan **auto-ducking BGM ~ `-8 dB`** saat VO berbicara, lalu ekspor **`out/mix.wav`** memenuhi standar **`-14 LUFS` (±1.0 LU)** dan **True Peak `≤ -1.0 dBFS`**.
4. Ekspor subtitle `.srt` via `lemo-opuscar\core\render\srt.py` (atau `hyperframes beats` di Mode A/C).
