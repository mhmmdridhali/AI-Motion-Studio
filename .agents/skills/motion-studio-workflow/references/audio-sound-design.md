# Standar Audio, Audio Lock, Gemini TTS & Sound Design (Tahap 2)

Panduan ini mengatur produksi narasi ekspresif (*Voice-First*), penguncian performa suara (*Audio Lock*) saat revisi, antarmuka audisi browser, dan desain suara **VO + BGM + SFX** berbasis vektor cepat.

---

## 1. Status BGM + SFX Mengikuti Kontrak `BRIEF.md`

- **Kondisi Standar (`BGM/SFX: Aktif` — default di Grill Me #3):** Wajib membangun `mix.py` guna memadukan **VO + BGM + SFX/Foley** menjadi **`out/mix.wav`** sesuai *delivery* yang disepakati di `BRIEF.md`. **Dilarang** memux `voice/audition.wav` kering sebagai audio final.
- **Kondisi Tanpa Musik (`BGM/SFX: Nonaktif` — apabila dipilih eksplisit di Grill Me #3):** Gunakan trek VO bersih (`voice/audition.wav`) yang telah dinormalisasi **`-14 LUFS`** dan `48 kHz` stereo.

---

## 2. Mesin VO Baku: Gemini TTS (Utama) + Edge TTS (Fallback) + Audio Lock

Jalankan generator studio dengan `BypassSandbox: true`:

```powershell
lemo-opuscar\.venv\Scripts\python.exe .agents\skills\motion-studio-workflow\scripts\tts_expressive.py projects\NN-slug --engine auto
```

- **Mode Utama (`gemini-3.8-flash-tts`):**
  - Membaca `GEMINI_API_KEY` secara diam-diam dari `.env` root workspace (dilindungi `.gitignore` — jangan pernah mencetak isi key).
  - **Duet / Multi-Speaker & Pengelompokan `(voice, style)`:** Mendukung perbedaan `gemini_voice` maupun `style` per baris di `voice/lines.json`. Baris yang belum ter-cache otomatis dikelompokkan per `(voice, style)` dalam batch **≤ 250 kata** agar hemat kuota Free Tier (`2–3 RPM`, `10–50 RPD`) dengan timeout HTTP `60s` per request.
  - Menyelaraskan timestamp per kata secara lokal via **`faster-whisper`** menghasilkan `voice/wav/<id>.wav` (terpangkas aman untuk konsonan awal halus: `peak * 0.008`, `0.06s` pre-roll, `0.12s` post-roll, dan *de-click fade* `5ms`), `dur.json`, `schedule.json`, `words.json`, `cues.json`, dan `voice/audition.wav`.
- **Per-Shot Audio Lock (`--reuse-clips`) & Non-Destructive Tempo (`--tempo`):**
  - **Cache Per-Line (`voice/.cache/clips/`):** Secara bawaan (`--reuse-clips` aktif), setiap baris yang naskah (`say`), `voice`, dan `style`-nya tidak berubah langsung diambil dari cache klip lokal **`[gemini (cached-clip)]`** — 0 request Gemini, dan **pitch, intonasi, serta *feels* kalimat lain tetap 100% identik** saat Anda menghapus 1 scene atau mengedit 1 kalimat!
  - **Ubah Tempo Tanpa Merusak Suara (`--tempo`):** Bila user menyukai warna/intonasi audisi #1 tetapi ingin temponya lebih lambat atau cepat (mis. `0.90x`), jalankan ulang dengan **`--tempo 0.90`** (atau set `"tempo": 0.90` di `lines.json`). Skrip memproses *FFmpeg `atempo`* yang menjaga pitch & performa vokal asli **tanpa memanggil ulang Gemini TTS**.
  - **Gunakan `--fresh`** hanya bila user secara eksplisit meminta regenerasi performa suara baru dari nol.
- **Larangan Re-Sintesis Diam-Diam, Perubahan `style` & Batas Skrip Global:**
  - **Dilarang mengedit `tts_expressive.py` (atau skrip `.agents/skills/.../scripts/*` lainnya) secara diam-diam di dalam chat/commit proyek** tanpa izin terpisah dari user.
  - **Dilarang melakukan *re-plan* dan men-generate ulang VO sebelum user mendengar hasil sintesis #1 di Mini-Gate Audisi Audio.** Biarkan user menilai tempo/intonasi aslinya lebih dulu.
  - **Dilarang mengubah prompt `style` (`lines.json`) secara diam-diam** saat user hanya meminta penghapusan scene atau penyesuaian tempo/jeda. Apabila perbaikan naskah menuntut regenerasi Gemini pada baris tertentu, wajib beri tahu user terlebih dahulu di Langkah 2 Protokol Revisi bahwa baris teredit berpotensi sedikit berubah intonasinya.
- **Fallback Otomatis (`edge-tts`):** Apabila `.env` kosong, kena limit `429 RESOURCE_EXHAUSTED`, atau jaringan bermasalah, skrip otomatis beralih ke `edge-tts` (`WordBoundary`) dan membersihkan inline tag `<...>` agar tidak terbaca sebagai kata.

---

## 3. Penulisan Naskah Ekspresif (`voice/lines.json`)

| Aturan | Contoh Praktis | Alasan |
| :--- | :--- | :--- |
| **Pisahkan `text` vs `say`** | `"text": "Sudah sampai mana?"`<br>`"say": "Eh, jujur ya... <short pause> Sudah sampai mana?"` | `text` bersih untuk subtitle layar; `say` mendukung `<short pause>`, `<breath>`, `<sigh>`, `<laugh>` di Gemini TTS. |
| **Gunakan `style` terstruktur** | Root/per-line `"style": "warm reflective Indonesian narrator, gentle sigh on endings, rising tone on questions"` | Dikirim sebagai `annotations: [{"type": "speech_metadata"}]` agar arahan akting suara tidak ikut dibaca. Kunci teks `style` ini setelah disetujui. |
| **Pilih Persona `gemini_voice` (Solo / Duet)** | Pria hangat: `Orus` / `Charon` · Wanita hangat: `Kore` / `Aoede` · Dinamis: `Puck` | Untuk format dialog 2-suara (*Duet*), tulis `"gemini_voice"` & `"style"` berbeda di masing-masing baris `lines.json` (mis. Murid `Kore` vs Mentor `Orus`). |
| **Siap-Fallback Pertanyaan Retoris** | Akhiri kalimat tanya dengan **`?` murni** (hindari pola `'...?' .`), pecah frasa pendek, serta variasikan `rate` dan `pitch` (`-4Hz`..`+4Hz`). | Jika fallback ke `edge-tts`, intonasi tanya & jeda tetap alami. |

---

## 4. Mini-Gate Audisi Audio (Hyperlink + Browser Player + `/compact` Mandiri)

Tepat setelah `tts_expressive.py` selesai dan **sebelum menulis kode animasi**:

1. Nyalakan server audisi studio dengan `BypassSandbox: true`, `IsDaemon: true`, dan `toolSummary: "Run live preview & audition server (daemon)"` agar status background task jelas di UI:
   ```powershell
   node .agents\skills\motion-studio-workflow\scripts\lemo-preview.mjs projects\NN-slug --port 3020
   ```
   *(Server berjalan walau `index.html` belum dibuat).*
2. Berikan **keduanya** di chat ke user:
   - Link browser interaktif: **`http://127.0.0.1:3020/audition`** *(user bisa klik tiap baris naskah untuk lompat dan memutar ulang di `0.75x/1x/1.25x` maupun berganti track).*
   - **Clickable hyperlink file lokal**: `[audition.wav](file:///.../projects/NN-slug/voice/audition.wav)`.
3. **STOP — Tunggu persetujuan user**, dan **wajib cantumkan baris pengingat `/compact` mandiri ini di penutup pesan**:
   > *"Jika suara sudah disetujui, kirim **`/compact` saja sebagai pesan terpisah** (jangan digabung seperti `'Setuju, /compact'`). Proses `/compact` selesai dalam < 2 detik, lalu ketik **`Lanjut`** — ikon server preview yang masih berputar di daftar task adalah normal dan bukan tanda `/compact` macet."*

---

## 5. Produksi BGM, SFX & Mastering 2-Fase (`mix.py` → `out/mix.wav`)

1. Apabila `BRIEF.md` mencatat `BGM/SFX: Aktif`, buat `projects/NN-slug/mix.py` membaca `voice/schedule.json` & `voice/words.json`.
2. Gunakan perkakas lokal di `lemo-opuscar/core/audio/` (`sfx.py`, `sampler.py`, `pluck.py`, sintesis NumPy) dan/atau audio berlisensi.
3. **Alur Audio 2-Fase untuk Gaya *Procedural Foley* (mis. `ipad-sketch`, goresan pena, fisika partikel):**
   - **Tahap 2 (Sebelum kode animasi ada):** Rakit `mix.py` hanya dengan **VO + BGM bed** (*dilarang membuat loop foley palsu menebak timing gambar*).
   - **Tahap 4B (Sesudah animasi & `scenes.js` selesai):** Ekspor log event gerak nyata (`window.EV` → `events.json`), lalu perbarui/jalankan ulang `mix.py` membaca `events.json` dengan **`-50%` foley ducking saat VO berbicara** (`sfx_gain = 1.0 - 0.5 * env`) agar ketukan pena/pop tidak menutupi vokal narator sebelum membuka Live Preview Gate #2B/#3.
4. **Wajib Event-Synced SFX & Punchline Dips (Bukan Sekadar Transisi Generik):**
   - Pasang minimal **2–3 foley bermakna per shot** yang menempel tepat pada *micro-motion* visual (mis. klik tombol, ketikan keyboard, *gear spin*, coretan garis, pop kartu data, dering notifikasi), **bukan hanya mengulang `whoosh + click` di awal cut**.
   - Terapkan **Punchline Silence Dips (`-18 dB` selama `~0.45s`)** berjangkar timestamp `words.json` tepat pada kata punchline untuk efek komedik/dramatis.
5. **Wajib Vectorized Auto-Ducking (`< 2 detik`, DILARANG Loop Python Per-Sample):**
   Gunakan `scipy.signal.lfilter` / `uniform_filter1d` untuk menghitung envelope *ducking* `~ -8 dB` (dilarang menulis `for i in range(len(active)):` per 48.000 sampel/detik):
   ```python
   from scipy.ndimage import uniform_filter1d
   from scipy.signal import lfilter

   rms = uniform_filter1d(np.abs(vo_mono).astype(np.float32), size=int(0.03 * SR))
   active = (rms > 0.012).astype(np.float32)
   # Single-pole attack/release smoothing via vectorized IIR (jauh lebih cepat dari loop Python)
   alpha = 1.0 - float(np.exp(-1.0 / (0.14 * SR)))
   env = np.maximum(
       lfilter([alpha], [1.0, -(1.0 - alpha)], active),
       lfilter([alpha], [1.0, -(1.0 - alpha)], active[::-1])[::-1] * 0.75,
   ).clip(0.0, 1.0)
   gain_curve = 1.0 - env * (1.0 - 0.398)  # -8 dB pada BGM saat VO aktif
   sfx_gain = 1.0 - 0.5 * env              # -50% (-6 dB) pada foley prosedural saat VO aktif
   ```
6. Mix di **`48000 Hz` stereo** lalu ekspor **`out/mix.wav`** *(cukup 1 file `out/mix.wav`, tidak perlu diduplikasi ke `assets/mix.wav` pada Track 1/2)* memenuhi standar **`-14 LUFS` (±1.0 LU)** dan **True Peak `≤ -1.0 dBFS`**.
7. Ekspor subtitle `.srt` via `lemo-opuscar\core\render\srt.py` (atau `cues.json`).
