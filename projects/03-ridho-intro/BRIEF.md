# BRIEF.md: Video Perkenalan Diri Muhammad Ali Ridho

Proyek: `03-ridho-intro`
Referensi: `https://muhammadaliridho.my.id/` (sumber lokal: `D:\Antigravity-Project\Web-Portofolio\web-portofolio\`)

## Checklist Slot Wajib

- [x] **Konteks & Karakterisasi:**
  - **Tesis Utama:** Sisi personal dan deadpan ISTJ-A dalam perjalanan lulusan Pendidikan Matematika menjadi Statistisi di salah satu instansi pemerintahan yang hobi mengotomatisasi kerja manual ("Math Brain, Lazy Automator": 16 sistem berbasis Google Workspace gratis tanpa sewa server untuk mengelola 234 madrasah, 31.000+ siswa, dan hampir 3.000 guru & tendik; bot Python untuk tugas repetitif; asisten AI "Minerva" berbasis Hermes Agent dengan berbagai profil personalisasi; serta puluhan artikel di Medium berisi keluh kesah sebagai WNI).
  - **POV & Tone:** Orang pertama ("Aku/Saya"), santai, witty, dan deadpan khas ISTJ-A.
  - **Audiens Target:** Media sosial (Instagram Reels, TikTok, YouTube Shorts), komunitas teknologi, dan personal branding.
  - **Representasi Sosok & Elemen Visual:** Elemen ikonik asli dari web portofolio, yakni Lanyard (`asn-card-front.webp` / `asn-card-back.webp` dengan **blur masking privasi** pada bagian identitas instansi/NIP sensitif), foto profil (`profile.webp`), karakter MBTI (`mbti_character.webp`), 4 doodle footer `RIDHO.` (Minerva/bird, Ridho/kid, Phantom/ghost, Kuro/cat), logo `logo-mar.webp`, serta thumbnail proyek asli dari `D:\Antigravity-Project\Web-Portofolio\web-portofolio\public\`.

- [x] **Mode & Gaya:**
  - **Mode:** Mode A (`HyperFrames + GSAP` deterministik, 100% di dalam workspace).
  - **Slug Gaya:** `monochrome-editorial-motion` (mewarisi DNA `DESIGN.md` portofolio: kanvas `#f8fafc`, kartu `#ffffff`, permukaan gelap `#0a0a0a`/`#171717`, teks `#0a0a0a`/`#525252`/`#737373`, border `#e5e5e5`, tipografi `Inter`, sudut besar `2rem` sampai `3rem` dan bentuk pill, transisi editorial slide/curtain/flip 60 FPS).
  - **Rasio, FPS, Target Durasi:** Vertikal `9:16` (`1080x1920`), `60 FPS`, struktur 10 shot dengan target durasi `~70-80 detik`.

- [x] **Gaya Subtitle:**
  - **Pilihan:** `Short-Form / Viral Captions`
  - **Spesifikasi:** Potongan 2-3 kata per tampil berbasis timestamp `voice/words.json`, ditempatkan di pita aman bawah-tengah (`y: 1120-1300px`), dengan sorotan kata aktif (`kw`) berkontras tinggi; dimatikan di shot closing typographic card agar tidak bertumpuk dengan footer `RIDHO.`.

- [x] **Mesin & Arahan VO:**
  - **Mesin:** `Gemini TTS utama (gemini-3.8-flash-tts) + Edge TTS fallback (id-ID-ArdiNeural)`.
  - **Persona & Arahan:** Suara pria santai, deadpan-witty khas ISTJ-A (`gemini_voice: "Orus"`), tempo nyaman `~0.90x` tidak terburu-buru, jeda antar-shot `~0.80s`, penekanan ringan pada punchline deadpan, jeda retoris `<short pause>`, serta pertanyaan retoris berakhir `?` murni.

- [x] **BGM & SFX:**
  - **Status:** `Aktif`
  - **Delivery:** Minimalist lo-fi beat dan Rhodes santai dengan subtle bass (auto-ducking sekitar `-8 dB` saat VO bicara) + foley UI tajam (ketikan keyboard, ayunan lanyard, klik/flip kartu, pop notifikasi Telegram/sistem) + titik hening singkat saat punchline deadpan. Mastering via `mix.py` ke `out/mix.wav` (`-14 LUFS`, True Peak `<= -1.0 dBFS`, `48 kHz` stereo).

- [x] **Target Output & Thumbnail:**
  - **Distribusi:** `.mp4` ukuran `< 50 MB`, video H.264 (`libx264`, `yuv420p`, `1080x1920`, `60 FPS`), audio AAC `48 kHz` stereo.
  - **Thumbnail:** `Dedicated Cover (output/ridho-intro-thumbnail.jpg via ?thumb=1) + Strong First Frame (t=0.0s)` bebas potongan subtitle.
  - **Gate Produksi:** Jalankan seluruh Gate persetujuan penuh (Gate #1, Audisi Audio, Gate #2A/2B, Gate #3).
