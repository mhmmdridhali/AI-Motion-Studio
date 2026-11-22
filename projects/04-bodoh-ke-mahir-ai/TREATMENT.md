# TREATMENT: Belajar AI dari Nol (Part 1: Fundamental AI)

Proyek: `projects/04-bodoh-ke-mahir-ai/`
Kontrak Gaya: `lemo-opuscar/styles/ipad-sketch/STYLE.md` (*Tablet Sketch Explainer*, Track 1 Lemo-Opuscar)
Format: `9:16` (`1080 x 1920 px`) · `30 FPS` · Target Durasi `~68-76 detik`

---

## 1. Premis & Pemilihan Struktur (3 Kandidat)

- **Premis Inti:** Banyak orang mengira AI cuma teman chat untuk tanya-tanya biasa atau alat generate gambar seru-seruan, lalu kecewa menganggap AI bodoh saat mencoba versi gratis untuk tugas berat. Lewat dialog santai dan hangat di atas satu lembar kanvas catatan tablet, **Mentor** meluruskan anggapan itu kepada **Murid** dengan mengenalkan **4 tangga dari nol sampai pro**, lalu memfokuskan Part 1 pada **Tangga 01 (Fundamental AI)**: Otak penebak kata (`LLM`), Badan dan alat (`Harness` -> `Agent`), serta analogi perpustakaan satu stadion vs seruangan untuk menjawab mitos versi gratis.
- **Kandidat Struktur:**
  1. **Struktur A (DIPILIH), "Dari Teman Chat & Gambar Lucu ke Fondasi Agent" (Part 1 Fokus Tangga 01):**
     Seluruh video mengalir di atas **satu halaman kertas krem tablet (`#F3EADB`)** dalam 10 shot dan 7 zona gambar. Dibuka dengan figur Murid memegang HP berisi balon chat dan stiker kucing lucu, berlanjut ke bagan **4 tangga dari nol sampai pro** (`01 Fundamental AI` disorot), lalu menyelami `LLM` ("Balonku ada... lima"), `LLM + Harness = Agent`, dan pelurusan mitos *Free Tier = AI Bodoh* (perpustakaan 1 stadion vs seruangan). Ditutup dengan *pinch-out* penuh `0°` yang menyalakan kotak `01` sambil menandai tangga `02` (*Tools Mastery*), `03` (*Builder*), dan `04` (*Orchestrator*) dengan garis putus-putus sebagai *teaser* episode depan.
  2. **Struktur B (Ditolak):** Menjelaskan 4 tangga sekaligus secara padat dalam 70 detik (membuat konsep dasar `LLM + Harness` tidak cukup punya napas).
  3. **Struktur C (Ditolak):** Membuka langsung dengan definisi kamus LLM tanpa menyentuh stereotip chat/gambar maupun pertanyaan polos Murid.

---

## 2. Tabel Adaptasi Konteks Anti-Jipling (`ipad-sketch`)

| Elemen Gaya (`STYLE.md`) | Aturan Kontrak Baku | Adaptasi Orisinal Proyek Ini (Bebas Jipling Demo) |
| :--- | :--- | :--- |
| **Opening & Ending** | Bukan pembukaan ekstrem satu garis atau akhir seragam demo; tentukan pembukaan dan penutup khas cerita. | **Opening:** Kanvas krem nyaris kosong; stylus menggambar Murid memegang HP berisi balon chat dan stiker kucing lucu. **Ending:** *Pinch-out* ke seluruh peta halaman `0°` memperlihatkan bagan **4 tangga dari nol sampai pro**: kotak `01 Fundamental AI` menyala tercentang, aura Murid di-*re-register* ke mustard cerah, dan kotak `02`, `03`, `04` tampil bergaris putus-putus (*still drawing*) bertanda *"Episode Depan"*. |
| **Kanvas & Lapisan** | Satu halaman utuh `#F3EADB`, tekstur kertas di ruang kanvas, garis grafit `#43362E` dulu baru blok warna *multiply* bergeser `5-12` unit, stylus terlihat tanpa tangan/bezel tablet. | Kanvas master resolusi buffer `>= 2x` (`4400 x 6400` unit) menampung 7 zona sketsa yang terhubung oleh garis konstruksi `#A8998A`, panah koral `#DC6A4C`, dan angka tangga berlingkar. |
| **Palet Warna Topik** | Kertas `#F3EADB`, grafit `#43362E`, konstruksi `#A8998A`, koral `#DC6A4C`, mustard `#F1C04F`, plus 4-8 warna subjek lembut berkapur + bayangan *multiply*. | **5 Warna Subjek Kapur:** Sage (`#8FB58D`: Tangga 01 aktif & jawaban tepat), Slate Blue (`#7CA0B8`: LLM / Perpustakaan Stadion), Terracotta (`#D88A6B`: Harness / Aksi nyata), Soft Lavender (`#A895BE`: Chat / Gambar seru-seruan & Ruang kecil), Warm Ochre (`#DDA952`: Agent utuh / Momen Aha!). |
| **Kamera Dua Jari** | Gerak pan, pinch, rotasi `1-4°` dengan momentum `0.7-0.9s`, *match cut*, tanpa *fade/wipe* antar area halaman yang sama. | 100% perpindahan antar adegan memakai geseran kanvas dua jari, *punch-in* (`0.15s`), dan 1 *match cut* kaca pembesar (Shot 3); nol *cross-fade* datar. |
| **Anti-Whitespace & Pacing** | Tidak menumpuk kartu UI; panggung penuh dengan gambar utama `>= 1/3` tinggi layar dan beat gerak baru tiap `<= 2.2s`. | Setiap shot `>= 4s` dipecah menjadi minimal 3 aksi bertahap (garis konstruksi, outline tokoh/diagram, sapuan blok warna, panah koral, atau geseran fokus kamera) sehingga nol *dead-hold*. |
| **Zona Aman `9:16`** | Pita aman bawah untuk subtitle agar bebas dari tombol UI Reels/Shorts (`y <= 1360px`). | Seluruh elemen sketsa utama dikomposisi pada area visual atas-tengah `y: 190px - 1090px` (screen-space) sehingga pita `y: 1120px - 1320px` bersih untuk *Short-Form Captions*. |

### Peta Tata Letak Satu Halaman Utuh (7 Zona di 1 Kanvas)

1. **Kiri Atas (Zona 1: Hook Stereotip):** Figur **Murid** santai menatap HP berisi gelembung chat ringan dan sketsa gambar kucing lucu bertopi.
2. **Tengah Atas (Zona 2: Peta 4 Tangga dari Nol Sampai Pro):** Empat kotak tangga berjenjang sesuai bagan referensi: `01 Fundamental AI` (blok mustard/sage aktif, *"di video ini"*), `02 AI Tools Mastery`, `03 AI Professional Builder`, dan `04 AI Agent Orchestrator` (garis putus-putus *"episode depan"*).
3. **Kanan Atas (Zona 3: Otak `LLM`):** Kaca pembesar menuju halaman kamus raksasa bertuliskan **"LLM = Otak"** lengkap dengan tebakan kalimat `"Balonku ada... [lima]"`.
4. **Tengah (Zona 4: `LLM + Harness = Agent`):** Persamaan visual Otak (`LLM`) ditambah tubuh berperlengkapan alat (`Harness`: ikon dokumen, surat, tombol aksi) menjadi figur **Agent** utuh dengan irisan lapisan dalam.
5. **Kiri Bawah (Zona 5: Mitos `FREE = BODOH?`):** Figur Murid cemberut menghadapi kotak hasil ngaco dengan tanda tanya besar di sebelah tulisan **"VERSI GRATIS = BODOH?"**.
6. **Kanan Bawah (Zona 6: Stadion vs Ruang Kecil):** Perbandingan visual gedung perpustakaan megah bertingkat **1 Stadion** (Model Pintar) di sisi kiri melawan ruang buku kecil **Seruangan** (Versi Gratis) yang kewalahan menampung tumpukan berkas berat.
7. **Bawah Tengah (Zona 7: Rumus Fondasi & Jalur Lanjut):** Tiga ikon kunci Tangga 01 (**Otak + Badan + Ukuran Perpustakaan**) yang mengarah naik kembali ke Peta 4 Tangga untuk *pinch-out* penutup.

---

## 3. Daftar 5 *Native Moves* `ipad-sketch` yang Diterapkan

1. **Line, then colour (Shot 2, 4, 7):** Garis grafit **4 Tangga AI**, **Otak + Badan**, serta **Perpustakaan Stadion vs Seruangan** selesai digambar di kanvas putih dulu, baru diwarnai sapuan bolak-balik (*boustrophedon*) dengan posisi sedikit meleset (*off-register*).
2. **Match cut to magnified copy (Shot 3):** Kamera menukik tajam ke kotak kecil `01 Fundamental AI` di tangga pertama, lalu melakukan *match cut* pada sudut dan ukuran identik ke halaman kamus `LLM` raksasa di dalam lingkaran kaca pembesar koral.
3. **Holes as layers (Shot 5):** Irisan tubuh **Agent** memotong lubang putih pada blok warna Terracotta sehingga sketsa Otak (`LLM`) di dalam kepala tampak terhubung langsung ke panel alat **Harness** di bagian dada/tangan.
4. **Re-register a block (Shot 7 & Shot 10):** Di Shot 7, kartu abu-abu keruh pada versi gratis di-*re-register* menjadi blok warna Slate Blue vs Soft Lavender yang jelas skalanya. Di Shot 10, blok aura abu-abu di belakang Murid dihapus melebar lalu diwarnai ulang dengan mustard cerah.
5. **Shatter a block + Still drawing (Shot 8 & Shot 10):** Di Shot 8, label blok `"FREE = BODOH?"` pecah (*shatter*) menjadi tumpukan buku kecil yang meluncur masuk ke ruang perpustakaan sesuai kapasitasnya. Di Shot 10, kotak tangga `02`, `03`, dan `04` dibiarkan bergaris putus-putus dan setengah terwarnai (*still drawing*) untuk menegaskan episode berlanjut ke part berikutnya.

---

## 4. Rencana 10 Shot Detail (~68-75 Detik, 30 FPS)

| Shot | Waktu Est. | Bab / Konsep | Aksi Visual & Gerak Kamera (Beat Tiap <= 2s) | Dialog Utama (Murid & Mentor) |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `0.0-8.6s` | **Hook Stereotip** | Kanvas krem kosong; stylus menggambar Murid + HP dengan gelembung *"Hai, saran makan!"* dan gambar kucing bertopi, Mentor menyorot label *"Cuma Kulitnya"* dengan panah koral ke kanan. | **Murid:** "Bukannya AI cuma teman chat sama bikin gambar seru-seruan?"<br>**Mentor:** "Banyak yang ngira gitu, padahal baru kulitnya." |
| **2** | `8.6-16.8s` | **Peta 4 Tangga AI** | Pan kanan ke bagan **4 Tangga dari Nol Sampai Pro** (`01` sampai `04`), stylus menggambar kotak tangga berjenjang (*line, then colour*), lalu melingkari `01 Fundamental AI` dengan mustard. | **Murid:** "Emang AI bisa apa lagi?"<br>**Mentor:** "Banyak banget, sampai bisa kerja otomatis. Tapi kita mulai dari fondasinya dulu ya." |
| **3** | `16.8-29.5s` | **Otak `LLM`** | *Match cut* kaca pembesar masuk ke halaman kamus raksasa bertuliskan `LLM = Otak`; teks ketikan `"Balonku ada..."` muncul lalu Murid menyahut dan stylus melingkari kata **`Lima!`** berwarna Sage. | **Murid:** "Di dalam AI isinya apa sih?"<br>**Mentor:** "Otaknya LLM, kamus raksasa penebak kata. Coba ya, balonku ada..."<br>**Murid:** "Lima!"<br>**Mentor:** "Nah, persis kayak gitu cara kerjanya." |
| **4** | `29.5-37.5s` | **Butuh Badan `Harness`** | Geser turun-tengah: Otak `LLM` sendirian terlihat mengambang bingung di sebelah tumpukan tugas, lalu stylus menggambar kerangka badan dan perkakas berlabel **`Harness`** (*line, then colour*). | **Murid:** "Cuma nebak teks doang berarti?"<br>**Mentor:** "Kalau otak saja, iya. Makanya butuh Harness, yaitu badan dan alatnya." |
| **5** | `37.5-45.5s` | **`LLM + Harness = AI Agent`** | *Punch-in* ke persamaan `LLM + Harness = AI Agent` memakai *holes as layers*: irisan dada Agent menampakkan otak terhubung ke ikon aksi nyata dan balon tanya `"Kayak ChatGPT?"`. | **Mentor:** "Begitu LLM digabung Harness, jadilah AI Agent yang beneran bisa bertindak."<br>**Murid:** "Kayak ChatGPT berarti?" |
| **6** | `45.5-54.0s` | **Mitos Free Tier** | Geser kiri-bawah (`-2.5°`): Murid mengernyit melihat kertas hasil AI yang meleset di bawah tulisan **`VERSI GRATIS = BODOH?`**, disusul garis koreksi koral dari Mentor. | **Murid:** "Tapi aku coba versi gratis hasilnya ngaco. Berarti AI bodoh ya?"<br>**Mentor:** "Nah, itu salah kaprah paling sering tentang AI." |
| **7** | `54.0-62.0s` | **Stadion vs Seruangan** | Geser kanan-bawah: menggambar Perpustakaan Raksasa **`1 Stadion`** (Model Pintar, Slate Blue) berhadapan dengan bilik **`Seruangan`** (Versi Gratis, Soft Lavender) (*line, then colour* + *re-register*). | **Mentor:** "Model pintar itu perpustakaan satu stadion. Versi gratis cuma seruangan agar biayanya tetap murah." |
| **8** | `62.0-65.5s` | **Hasilnya Sering Halu** | Label `"FREE = BODOH?"` pecah (*shatter a block*) menjadi buku tugas berat; buku yang masuk ke bilik seruangan meluber dan mengeluarkan tanda seru *"HALU!"*. | **Murid:** "Pantesan, hasilnya sering halu." |
| **9** | `65.5-73.0s` | **Bukan Hanya Model Pintar** | Geser ke bilik kecil yang diterangi sorotan kunci bertanda tanya menuju kartu **`02 AI Tools Mastery`**, memancing rasa penasaran Murid. | **Mentor:** "Benar, tapi bukan berarti harus pakai model pintar supaya hasilnya sesuai keinginanmu."<br>**Murid:** "Lho, emang ada triknya biar hasilnya tetap pas?" |
| **10** | `73.0-79.5s` | **Obrolan Selanjutnya** | *Pinch-out* penuh ke seluruh lembar kanvas `0°`: aura Murid di-*re-register* ke mustard cerah, tangga `01 Fundamental AI` menyala penuh, sementara kotak `02 AI Tools Mastery`, `03 Builder`, dan `04 Orchestrator` dibiarkan *still drawing* bertanda *"Episode Depan"*. | **Mentor:** "Ada dong, rahasianya kita bahas di obrolan selanjutnya. Sampai jumpa lagi." |

---

## 5. Kontrak Audio, Sound Design & Subtitle

- **Voice-Over Duet (`voice/lines.json`):**
  - **Murid (Wanita):** `gemini_voice: "Kore"` (fallback `id-ID-GadisNeural`) dengan gaya kasual penasaran dan intonasi naik pada kalimat tanya.
  - **Mentor (Pria):** `gemini_voice: "Orus"` (fallback `id-ID-ArdiNeural`) dengan gaya santai, ramah, dan tegas saat memberi analogi.
- **BGM & Event-Synced Foley (`mix.py`, `-14 LUFS`, `48 kHz` stereo):**
  - **Musik Latar:** Ansambel akustik ringan hangat (petikan gitar nilon, kontrabas lembut, kalimba, dan *shaker* halus) dengan *vectorized auto-ducking* `-8 dB` saat karakter berbicara.
  - **Foley Kanvas Tablet:** Goresan pensil grafit dinamis (`0.7-4.2 kHz`) saat garis muncul, bunyi sapuan lebar (`0.3-2.6 kHz`) saat blok warna diarsir bolak-balik, tap ujung stylus saat menandai poin, dan geseran jari di kaca saat kamera berpindah zona.
  - **Punchline Silence Dips (`-18 dB` selama `~0.45s`):** Ditempatkan tepat pada momen punchline: `"kulitnya."` (Shot 1), `"Lima!"` (Shot 3), dan `"halu."` (Shot 8).
- **Subtitle (`Short-Form Captions`):**
  - Menggunakan *chip* kertas krem hangat dengan bayangan blok bergeser kanan-bawah yang menampung 1-3 kata per grup dari `words.json`, ditempatkan pada zona aman mutlak **`y: 1150px - 1310px`** (`< 1360px`), sorotan kata kunci berwarna koral/mustard, dan pemotongan semantik anti-pecah frasa. Subtitle dimatikan pada detik akhir kartu penutup saat *pinch-out* penuh 4 tangga selesai.
