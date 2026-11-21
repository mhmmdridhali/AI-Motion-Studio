# SPEC.md: Spesifikasi Produksi (03-ridho-intro, Opsi 1)

```text
GOAL:    Penonton langsung mengenal karakter Muhammad Ali Ridho ("Math Brain, Lazy Automator" bergaya deadpan ISTJ-A) dan karya nyatanya tanpa membocorkan nama instansi spesifik sehingga terdorong mengunjungi muhammadaliridho.my.id.
OUTPUT:  HyperFrames, 1080 x 1920 (9:16), 60 fps, target < 50 MB (libx264 yuv420p, AAC 48 kHz stereo).
TIME:    ~70-80 s (~4200-4800 frames, dikunci ulang persis mengikuti voice/schedule.json setelah Audisi Audio), jeda napas antar-shot ~0.80s (lead 0.25s + tail 0.55s); musik 84 BPM (~43 frames/beat).
LOOK:    Ground utama #f8fafc dengan dot-grid 32px opacity 0.06 dan aerosol dots seeded; kartu #ffffff border 1px #e5e5e5 shadow (0, 20px, 50px, rgba(10,10,10,0.08)); dunia gelap #0a0a0a / #171717 khusus Shot 07-08; ink utama #0a0a0a, sekunder #525252, muted #737373; aksen tunggal #10b981 khusus indikator status aktif dan sorotan angka dampak.
         Privasi Visual: Lanyard asn-card-front.webp dan asn-card-back.webp wajib memakai blur masking rapi pada area identitas instansi dan NIP; dilarang menampilkan teks nama instansi spesifik di layar maupun subtitle.
         Tipografi Inter (@font-face lokal di assets/fonts/): Display 800 80-104px tracking -0.03em leading 1.04; Anchor Title 700 44-56px; Body/UI 500 30-34px; Short-Form Captions 800 52px.
         Zona aman vertikal 9:16: pita y 0-168px kosong dari teks/hero; area hero dan teks berada pada pita y 168-1330px (sisi kanan x > 940px pada y > 900px bebas teks); pita subtitle berada di y 1120-1310px.
OBJECTS: Aset portofolio lokal (disalin ke assets/ saat Tahap 3/4): asn-card-front.webp, asn-card-back.webp, profile.webp, mbti_character.webp, logo-mar.webp, siprima-thumb.webp, sipelita-thumb.webp, penmadbanjar-thumb.webp, hermes-agent-thumb.webp, python-automation-thumb.webp, serta 4 doodle SVG (Minerva bird, Ridho kid, Phantom ghost, Kuro cat) + wordmark RIDHO.
MOTION:  enter: power3.out (22-28f); move: power2.inOut (24-36f); exit: power3.in (16-20f); flip: power2.inOut (32f); lanyardSwing: pendulum sine deterministik teredam f(t); transisi antar-shot memakai editorial curtain wipe dan object match-move.
SHOTS:   10 shot solid (jeda antar-shot ~0.80s), maksimal 1 hero move per shot, maksimal 1 anchor title (1-5 kata).
BANNED:  Dark void penuh dengan partikel glow/neon/lens flare; gradient ungu/biru/mesh; template cream serif AI dengan label monospace atau angka 01/02 dekoratif; semua elemen fade-slide-up seragam; text-stacking (header + poin + diagram + subtitle dalam 1 frame); logo menempel di sudut sepanjang video; subtitle satu paragraf utuh; outline hijau meleset; identitas instansi/NIP terbuka tanpa blur; teks/objek penting di atas y=168px atau di bawah y=1330px.
QA:      Frame 0 (hook Lanyard blur-masked + wajah), flip 3D ISTJ-A (Shot 02), rasio timer Seharian vs 5 Menit + "Investasi jangka panjang, bro." (Shot 03), skala 234 Madrasah / 31.000+ Siswa / ~3.000 Guru & Tendik (Shot 04), 16 Sistem Google Workspace Gratis (Shot 05), kartu flagship + Website Pemerintahan (Shot 06), dunia gelap Bot Python & Minerva Hermes Agent (Shot 07-08), transisi curtain terang langsung ke Medium Puluhan Artikel WNI (Shot 09), closing RIDHO. + 4 doodle bebas subtitle (Shot 10), serta Dedicated Cover (?thumb=1).
```

## Rincian 10 Shot & Rantai Objek

| Shot | Dunia / Latar | Hero Visual & Aset | Rantai Masuk -> Keluar | Anchor Title (Maks 5 Kata) |
| :--- | :--- | :--- | :--- | :--- |
| **01** | Terang `#f8fafc` | Lanyard `asn-card-front.webp` (blur masking privasi) berayun + avatar `profile.webp` di tengah atas | Frame 0 langsung aktif -> kamera zoom masuk ke kartu lanyard | `Bukan marah. Lagi debugging.` |
| **02** | Terang `#f8fafc` | Kartu flip 3D (`asn-card-back.webp` blur-masked -> `mbti_character.webp`) + pill `ISTJ-A` + `Pendidikan Matematika` -> `Statistisi Pemerintahan` | Lanyard terlepas dan berputar 180 derajat menjadi kartu MBTI | `Matematika ke Statistisi` |
| **03** | Terang `#f8fafc` | Kontras dua blok tipografi & timer deterministik: `Seharian Ngoding` berhadapan dengan `5 Menit Manual`, ditutup stempel `"Investasi jangka panjang, bro."` | Kartu ISTJ-A bergeser ke kiri menjadi pilar perbandingan waktu | `Investasi Jangka Panjang, Bro` |
| **04** | Terang `#f8fafc` | Tumpukan lembar rekap manual di bawah 3 blok skala data: `234 Madrasah`, `31.000+ Siswa`, `~3.000 Guru & Tendik` | Blok `5 Menit Manual` mengganda menjadi tumpukan berkas | `234 Madrasah. 31rb+ Siswa.` |
| **05** | Terang `#f8fafc` | Grid Google Workspace bertransformasi menjadi kartu aplikasi bersih -> angka besar `16 Sistem`, `15 Sendirian`, badge `Google Workspace Gratis · Tanpa Sewa Server` | Antarmuka aplikasi menyapu tumpukan berkas keluar layar | `16 Sistem. Tanpa Sewa Server.` |
| **06** | Terang `#f8fafc` | Tampilan bertahap 3 kartu proyek asli (`siprima-thumb.webp`, `sipelita-thumb.webp`, `penmadbanjar-thumb.webp` berlabel `"Website Pemerintahan"`) -> status `"Bebas Rekap Manual"` | Grid Workspace mengembang menjadi jendela kartu proyek | `Bebas Rekap Manual` |
| **07** | Gelap `#0a0a0a` | Transisi curtain gelap ke terminal bersih + `python-automation-thumb.webp` (si Python klik tugas repetitif otomatis, angka terverifikasi) | Kartu terakhir memicu tirai gelap naik membuka terminal | `Kerjaan Repetitif -> Si Python` |
| **08** | Gelap `#171717` | Core `Hermes Agent` terhubung ke avatar `Minerva` dan ragam kartu profil personalisasi (Coder, DocuHelper, Researcher, Writer, Finance, Health) + `9+ Cron/Hari` -> Telegram (`hermes-agent-thumb.webp`) | Cursor terminal berpindah menjadi node pusat Hermes Agent | `Minerva · Hermes Agent` |
| **09** | Terang `#f8fafc` | Transisi curtain terang langsung dari Dark World ke tumpukan kartu artikel editorial monokrom `@mhmmdaliridh` berlabel `"Puluhan Artikel di Medium"` + topik `"Keluh Kesah WNI"` | Tirai terang membuka kartu artikel Medium | `Puluhan Artikel di Medium` |
| **10** | Terang `#f8fafc` | 3 baris prinsip hidup (`Lebih sedikit kerja manual`, `Bebas biaya server`, `Alat yang beneran dipakai orang`), lalu wordmark raksasa `RIDHO.` dengan 4 doodle SVG (Minerva, Ridho, Phantom, Kuro) + pill `muhammadaliridho.my.id` & `logo-mar.webp` (hold >= 2.0s, **subtitle dimatikan**) | Kartu artikel menutup menjadi garis hitam penanda akhir `RIDHO.` | `Less manual. Zero server bills.` |

## Aturan Subtitle (`Short-Form / Viral Captions`)
- Dibangun dari timestamp `voice/words.json`, maksimal 2-3 kata tampil per grup.
- Posisi tetap di pita aman `y: 1120px..1300px` dengan lebar maksimal `760px` terpusat.
- Kata ber-flag `"kw": true` mendapat skala `1.08x` dan pill kontras (latar `#0a0a0a` teks `#ffffff` pada shot terang; latar `#ffffff` teks `#0a0a0a` pada shot gelap).
- Dinonaktifkan total pada Shot 10 saat closing card `RIDHO.` tampil agar komposisi footer bersih.

## Spesifikasi Dedicated Thumbnail (`?thumb=1`)
- Parameter `?thumb=1` merender komposisi cover khusus `1080x1920` bebas subtitle burn-in:
  - Latar `#f8fafc` + dot-grid halus, Lanyard (dengan blur masking privasi) + `profile.webp` ukuran besar di tengah-atas, badge `ISTJ-A` + `16 Sistem · Google Workspace`, dan judul cover 4 kata `"Math Brain, Lazy Automator"`.
