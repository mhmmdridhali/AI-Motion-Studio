# TREATMENT: SI-PELITA — Kepulauan Layanan Satu Pintu (`lowpoly-island`, 9:16)

- **Proyek:** `projects/06-sipelita-explainer-v2`
- **Track & Gaya:** Track 1 (`Lemo-Opuscar` WebGL) · `lowpoly-island` (*Low-poly Isometric Island*)
- **Format:** `9:16` (`1080x1920 @ 30 FPS`) · Target Durasi `65 s/d 75 detik`
- **Word Budget Naskah:** `157 kata` bersih across 12 frasa kasual dengan ad-lib rekan operator (estimasi **`~73 s/d 76 detik`**)

---

## 1. Tiga Kandidat Struktur Cerita & Pilihan Sutradara

1. **Kandidat A — Kronologi Satu Tiket (Linear Case Study):** Mengikuti satu berkas siswa dari meja operator menuju server hingga selesai. *Kelemahan:* Kurang menonjolkan skala 3 kanal layanan (EMIS 4.0, VervalPD, Kolektif) dan dampak ratusan laporan di tingkat kabupaten.
2. **Kandidat B — Kepulauan Terpisah Menjadi Satu Semenanjung Terpadu (DIPILIH):** Membuka dari pulau-pulau heksagonal kecil yang terisolasi di tengah kabut senja (metafora chat WhatsApp tenggelam dan link Google Form yang terpecah). Saat SI-PELITA hadir, ubin-ubin heksagonal zamrud dan emas tumbuh dari permukaan air (*procedural growth*), menyatukan tiga dermaga layanan satu pintu (EMIS 4.0, VervalPD, Kolektif), menara lacak WhatsApp 4 tingkat (`Baru -> Diterima -> Diproses -> Selesai`), jembatan revisi `Perbaiki Data`, hingga mercusuar `Akses 24 jam` dan tiga monumen testimoni bintang 5 (`Operator Madrasah A/B/C`).
3. **Kandidat C — Tur Katalog Fitur (Feature Grid):** Memamerkan setiap fitur sebagai pulau terpisah tanpa busur perubahan waktu. *Kelemahan:* Terasa seperti *slideware* 3D dan kehilangan empati terhadap keresahan awal operator madrasah.

**Keputusan:** **Kandidat B** dipilih karena menyatukan POV rekan operator yang empatik dengan tata bahasa visual *Low-poly Isometric Island* (*Light, not texture, tells time* dan *Building is composing*).

---

## 2. Tabel Adaptasi Konteks Anti-Jipling (`lowpoly-island` -> SI-PELITA)

| Elemen Tata Bahasa `lowpoly-island` | Implementasi Orisinal SI-PELITA (Kemenag Kab. Banjar) |
| :--- | :--- |
| **Hexagonal Terrain Columns (`CylinderGeometry` 6 sisi + Top Cap)** | Kepulauan data madrasah: ubin batu keabu-abuan yang terpisah saat kendala lama, bertransformasi menjadi semenanjung heksagonal hijau zamrud Kemenag (`#1e7a5c`), krem hangat (`#f4e8c1`), dan aksen koral/emas (`#e8a838`) yang saling terhubung. |
| **Low-Poly Figurines & Props (Boxes, Prisms, Cones, Icosahedra)** | **Protagonis Operator Madrasah** (figur *flat-shaded* di meja kerja lengkap dengan laptop low-poly dan tumpukan blok berkas), **3 Gerbang Dermaga Layanan** (Paviliun EMIS 4.0 dengan antena NSM, Paviliun VervalPD dengan gerbang kembar NISN/NIK, Dermaga Kolektif dengan kargo kontainer `.xlsx`), serta **Menara Lacak 4 Lantai**. |
| **Time-of-Day Keyframes (Light as Clock)** | **Senja Redup Kebiruan** (`s01–s02`, keresahan chat tenggelam & form terpisah) -> **Fajar Emas Zamrud** (`s03`, kemunculan pulau induk SI-PELITA) -> **Siang Cerah Pastel** (`s04–s08`, 3 jalur layanan, lacak WA, & tombol `Perbaiki Data`) -> **Malam Berkilau Emas** (`s09–s10`, jendela emisif 24 jam, `> 95% terselesaikan`, & 3 monumen testimoni bintang 5) -> **Pagi Cerah Resolusi** (`s11–s12`, End Card resmi Kemenag Kab. Banjar). |
| **Water Shader & Shallow Foam Map** | Permukaan air berfaset yang memantulkan warna langit; ketika ubin layanan SI-PELITA terangkat dari bawah air, muncul cincin riak (*splash ring*) yang menghubungkan pulau operator ke pusat layanan Seksi Penmad. |
| **Light Beams (Camera-Facing Gaussian Ribbon)** | Sorot mercusuar vertikal hangat dari Menara SI-PELITA saat adegan malam `Akses 24 jam` serta pancaran cahaya emas pada tiga monumen bintang 5 (`Operator Madrasah A`, `Operator Madrasah B`, `Operator Madrasah C`). |
| **Event-Driven Pitched Percussion (`events.json`)** | Setiap ubin heksagonal yang muncul, lantai gedung yang mendarat, dan lencana status yang menyala membunyikan nada pentatonik marimba, kalimba, vibraphone, dan celesta beserta foley material (*bubble splash*, *wooden knock*, *ceramic clack*, *chime*). |

---

## 3. Lima *Native Moves* `lowpoly-island` yang Diterapkan

1. **Procedural Growth (Rise, Drop & Stack, Pop):** Ubin heksagonal naik dari bawah air dengan *cubic ease + damped-sine overshoot* dan cincin percikan; lantai gedung layanan bertumpuk dari atas dengan *squash-and-stretch*; pohon low-poly, tiang lampu, dan ikon bintang 5 muncul dengan *overshoot* 25%.
2. **Building is Composing:** Jadwal kemunculan objek disusun di atas grid ketukan musik sehingga setiap pendaratan ubin/gedung menghasilkan event di `window.EV` (`events.json`) yang disintesis menjadi melodi perkusi bernada dan foley material.
3. **Light as Clock (Time-of-Day Palette Interpolation):** Perubahan waktu dari senja redup -> fajar -> siang cerah -> malam berlampu emisif -> pagi cerah menjadi penggerak emosi cerita tanpa satu pun transisi *fade* membosankan.
4. **Scale by Pure Orthographic Zoom & Lateral Truck:** Kamera `THREE.OrthographicCamera` mengubah *frustum height* dari bidikan dekat meja operator (`frustum ~5.5`) ke *lateral truck* menyusuri 3 dermaga layanan, hingga *wide turntable* seluruh kepulauan SI-PELITA (`frustum ~14.5`).
5. **Emissive Blocks in the Dark:** Pada adegan malam (`s09–s10`), jendela-jendela madrasah dan menara lacak menyala kuning keemasan hangat disertai pita cahaya mercusuar (*Gaussian beam*) sebagai simbol layanan daring 24 jam dan ketuntasan `> 95%`.

---

## 4. Breakdown 12 Shot & Koreografi Visual-Audio (`9:16`, Fokus `y <= 1120px`)

> **Aturan Anti-Dead-Hold:** Setiap shot berdurasi `4,5 s/d 6,5 detik` memiliki minimal 2–3 *beat* visual (ubin naik, bangunan bertumpuk, atau pergeseran kamera ortografis setiap `1,5–2,2 detik`). Seluruh objek utama 3D dan kartu label diposisikan pada **`y: 180px s/d 1100px` (`y <= 1120px`)**, sedangkan pita subtitle kreatif berada di **`y: 1160px s/d 1310px` (`y <= 1360px`)**.

| Shot | Waktu Est. | Waktu Hari & Kamera Ortho | Aksi Panggung 3D (`y <= 1120px`) & Teks Jangkar | Narasi VO (`text` bersih) | Foley & Musik Event |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **s01** | `0.0–5.8s` | **Senja Redup** · Close-up (`frustum 6.2`) di pulau kecil terisolasi | Figur low-poly **Operator Madrasah** di meja kerja; tiga blok pesan chat koral jatuh ke air dan tenggelam perlahan dengan cincin riak. Label jangkar: **`CHAT TENGGELAM?`** | *"Hmm, pernah lapor kendala data madrasah lewat chat, eh malah tenggelam?"* | *Water swell*, 3x *bubble sink*, nada kalimba minor turun |
| **s02** | `5.8–13.8s` | **Senja Redup** · Pull-back (`frustum 8.5`) & pan ke 3 batu karang terpisah | Tiga ubin batu terpisah tanpa jembatan (simbol link form tercecer); blok formulir merah memantul mundur tanda harus ketik ulang. Label: **`FORM TERPISAH & KETIK ULANG`** | *"Mana link formulirnya pisah-pisah, susah dipantau, salah dikit ketik ulang lagi."* | *Stone thunk*, *wood knock* patah, *punchline silence dip* di akhir kalimat |
| **s03** | `13.8–22.2s` | **Fajar Emas Zamrud** · Elevation tilt + Turntable sweep (`frustum 10.5`) | Dari tengah perairan, ubin heksagonal besar **SI-PELITA** berwarna zamrud-emas naik megah dengan kubah paviliun Seksi Penmad & lencana resmi **Kemenag RI**. Label: **`SI-PELITA · SATU PINTU`** | *"Nah, Seksi Penmad Kemenag Kabupaten Banjar punya SI-PELITA, Sistem Pelaporan Informasi dan Data satu pintu."* | *Big bubble rise + splash*, kord marimba & vibraphone fajar, *ceramic clack* kubah |
| **s04** | `22.2–28.7s` | **Siang Cerah** · Lateral truck ke Dermaga Barat (`frustum 7.2`) | Jembatan heksagonal pertama tersambung; **Paviliun EMIS 4.0** tumbuh bertingkat dengan menara *auto-lookup* NSM hijau zamrud. Label: **`JALUR EMIS 4.0`** | *"Siswa salah tingkat atau butuh reaktivasi? Langsung beres lewat jalur EMIS empat titik nol."* | 4x *tile rise* marimba naik, *wooden knock* lantai, *glass tink* NSM |
| **s05** | `28.7–34.1s` | **Siang Cerah** · Lateral truck ke Dermaga Tengah (`frustum 7.2`) | Jembatan kedua tersambung; **Paviliun VervalPD** dengan dua pilar kembar yang menyatu rapi (resolusi NISN/NIK ganda & data belum muncul) + antena NPSN. Label: **`JALUR VERVAL PD`** | *"Pusing soal NISN atau NIK ganda dan data belum muncul? Tinggal pakai jalur Verval PD."* | *Tile splash*, 2x *ceramic clack* pilar menyatu, nada vibraphone harmonis |
| **s06** | `34.1–41.6s` | **Siang Cerah** · Lateral truck ke Dermaga Timur (`frustum 7.5`) | **Dermaga Kolektif** tumbuh bersama deretan blok matriks `.xlsx` hijau yang mendarat rapi, sementara perisai emas memantulkan blok tiket duplikat. Label: **`KOLEKTIF & ANTI-DUPLIKASI`** | *"Capek lapor satu-satu? Tenang, ada jalur kolektif lewat Excel, plus otomatis nolak tiket ganda."* | Deretan cepat *woodblock notes* (eighths), *shield chime* tolak duplikat |
| **s07** | `41.6–48.9s` | **Siang Hangat** · Tilt-up mengikuti Menara Lacak (`frustum 7.8`) | **Menara Lacak Status 4 Tingkat** menjulang di pusat pulau; 4 cincin lentera menyala berurutan dari bawah ke atas (`Baru -> Diterima -> Diproses -> Selesai`) dengan kode tiket simulasi `TIK-XXXX`. Label: **`LACAK TIKET & WHATSAPP`** | *"Kalau mau cek progres, tinggal masukkan tiket. Lupa nomornya? Pakai nomor WhatsApp aja, status tiket terlihat sampai selesai."* | 4x nada celesta menanjak (`C5-D5-E5-G5`) + *wooden stack knock* |
| **s08** | `48.9–55.4s` | **Sore Keemasan** · Tight close-up di Jembatan Revisi (`frustum 6.5`) | Satu blok tiket oranye (`Ditolak`) berputar di atas meja putar low-poly, disambut ubin tombol **`PERBAIKI DATA`** yang langsung menyambungkannya kembali ke jalur hijau tanpa runtuh. Label: **`PERBAIKI DATA · TANPA KETIK ULANG`** | *"Eh, berkasnya keliru? Klik aja Perbaiki Data di tiket itu, bebas drama ketik ulang."* | *Hollow plank knock*, *spring pop*, *chime* hijau menyala |
| **s09** | `55.4–62.4s` | **Malam Berkilau Emas** · Wide isometric reveal (`frustum 12.5`) | Langit berubah biru-lembayung malam; puluhan jendela madrasah menyala kuning hangat satu per satu, mercusuar pusat memancarkan pita cahaya vertikal. Tiga monumen angka tumbuh: **`AKSES 24 JAM`**, **`RATUSAN LAPORAN`**, **`> 95% TUNTAS`**. | *"Buka dua puluh empat jam, ratusan laporan masuk dan lebih dari sembilan puluh lima persen tuntas."* | *Low whump + warm hum*, rangkaian *celesta & vibraphone chimes* bintang malam |
| **s10** | `62.4–68.4s` | **Malam ke Fajar** · Arc sweep mengelilingi 3 Monumen Testimoni (`frustum 8.2`) | Tiga paviliun lentera bintang 5 (`★ 5/5`) menyala bergantian beserta kartu kutipan organik anonim: **`Operator Madrasah A`** (*"Sangat membantu ketika ada kendala data..."*), **`Operator Madrasah B`** (*"Tim langsung cepat menangani..."*), **`Operator Madrasah C`** (*"Prosesnya cepat tanpa ribet..."*). | *"Beberapa operator madrasah merasakan sendiri layanan yang cepat, sigap, dan tanpa ribet."* | 3x *bell chime* pentatonik hangat, *kalimba arpeggio* |
| **s11** | `68.4–73.3s` | **Pagi Cerah** · Turntable penuh seluruh Kepulauan Banjar (`frustum 14.0`) | Matahari pagi menyinari seluruh semenanjung SI-PELITA yang kini terhubung utuh dengan pulau-pulau madrasah; perahu-perahu kecil low-poly bergerak harmonis di jalur air. Label: **`LAYANAN PUBLIK TERPADU`** | *"Sekarang, urusan data madrasah se-Kabupaten Banjar jadi jauh lebih ringan."* | Melodi puncak marimba + vibraphone + *gentle water & bird chirp* |
| **s12** | `73.3–80.6s` | **Pagi Cerah** · Settled Hero Frame (`frustum 11.5`) untuk End Card | Di atas lanskap kepulauan yang hidup, tampil kartu institusional bersih dengan **Logo Resmi Kemenag RI**, judul **`SI-PELITA`**, subjudul **`Seksi Pendidikan Madrasah · Kemenag Kab. Banjar`**, dan tiga pilar ringkas (`EMIS 4.0 · VervalPD · Kolektif`). *(Subtitle dimatikan di End Card sesuai aturan).* | *"SI-PELITA Kemenag Banjar. Lapor gampang, lacak tenang, data beres."* | Resolusi akor mayor marimba & celesta yang hangat dan menenangkan |
