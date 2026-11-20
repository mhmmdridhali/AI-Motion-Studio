# BRIEF PROYEK: 01 - SI-PELITA Mobile Explainer (9:16)

Dokumen ini mencatat seluruh kesepakatan **Tahap 0 (Wawancara Brief & Pemilihan Mode)** serta fakta resmi hasil audit *read-only* terhadap kode sumber Google Apps Script **SI-PELITA**.

---

## 1. Keputusan Tahap 0 (Terkunci & Diperbarui pada Pivot Mode B)

| Parameter | Keputusan Terkunci |
| :--- | :--- |
| **Slug Proyek** | `projects/01-sipelita-explainer/` |
| **Tujuan** | Video motion graphics explainer yang menyoroti **inovasi pelayanan publik** dari **Seksi Pendidikan Madrasah, Kantor Kementerian Agama Kabupaten Banjar** melalui **SI-PELITA** dalam penanganan laporan permasalahan data siswa (bukan sekadar panduan/tutorial klik aplikasi), lengkap dengan bukti statistik publik dan testimoni organik Operator Madrasah |
| **Target Audiens** | Masyarakat umum, khususnya **Operator Madrasah** |
| **Format & Rasio** | **Vertikal `9:16`** (`1080x1920 @ 60 FPS`) khusus pengguna mobile (Reels / TikTok / WhatsApp) |
| **Target Durasi** | **~60 detik** (padat & *punchy*: masalah utama, 3 jalur lapor, lacak tiket via No. WA & fitur *Perbaiki Data*, manfaat) |
| **Mode Produksi** | **Mode B: Lemo-Opuscar Pure (`stick-explainer`, `1080x1920 @ 60 FPS`)** |
| **Voice-Over (VO)** | **Bahasa Indonesia ekspresif** (`id-ID-ArdiNeural` micro-phrase prosody + `WordBoundary` sync; opsional pembanding `id-ID-GadisNeural` / rekaman manusia) |
| **Musik & SFX** | Skor kalimba/pluck prosedural (`pluck.py`, `sfx.py`) dengan jeda hening nyata, mastering **`-14 LUFS`** + *ducking* saat VO berbicara |
| **Subtitle** | **Burn-in Kinetic Editorial Subtitles** langsung di atas kertas hangat (Emerald progress rail + *word-by-word spring lift* + garis bawah kata kunci berlekuk tinta) + ekspor berkas `subtitles_id.srt` |
| **Approval Gates** | **Gate #2** (Storyboard Visual `stick-explainer` + Model Sheet + Motion Proof 60 FPS + Audio Preview) -> **Gate #3** (Visual QA & Review Akhir) -> **Human Audio/Video QA** |

---

## 2. Status Aset Resmi

- **Logo Kementerian Agama RI (Resmi):**
  - Ditemukan langsung pada header seluruh halaman aplikasi SI-PELITA (`index.html`, `emis.html`, `verval.html`, `kolektif.html`, `panduan.html`, `saran.html`):
    `https://cms2023.kemenag.go.id/storage/files/shares/Logo/Kementerian_Agama_new_logo%20(2).png`
  - **Rencana Penanganan:** Disetujui user untuk diunduh dan disimpan lokal ke `projects/01-sipelita-explainer/assets/` agar proses render HyperFrames 100% offline dan deterministik. *(Apabila URL sumber tidak dapat diunduh saat tahap produksi aset, akan menggunakan labeled placeholder resmi hingga dikonfirmasi ulang pada Gate #3).*
- **Aset Visual Aplikasi:** 100% direkonstruksi ulang berbasis kode (`HTML/CSS/GSAP` + SVG terukur) mengikuti palet dan bahasa desain asli SI-PELITA tanpa meniru logo palsu.

---

## 3. Fakta Resmi Aplikasi SI-PELITA (Terverifikasi dari Kode Apps Script)

*(Catatan keamanan: URL deployment produksi, Spreadsheet ID, Google Drive Folder ID, kredensial admin, dan kontak pribadi sengaja dikecualikan dari repositori publik).*

### A. Identitas & Cakupan Layanan
- **Nama & Kepanjangan:** **SI-PELITA** — *Sistem Pelaporan Informasi & Data*
- **Pengelola Resmi:** **Seksi Pendidikan Madrasah, Kantor Kementerian Agama Kabupaten Banjar** (`Madrasah Kab. Banjar`)
- **Fungsi Utama:** Portal satu pintu pengajuan dan pelacakan perbaikan data siswa pada **EMIS 4.0** dan **VervalPD** untuk Operator Madrasah.

### B. Masalah Lama vs Solusi SI-PELITA (Kontras Sebelum & Sesudah)
- **Sebelum (Japri WA & Google Form Terpisah):**
  1. Pesan laporan sering tenggelam tertumpuk chat, sementara tautan Google Form terpisah-pisah per jenis masalah.
  2. Setelah mengirim form, operator tidak tahu progres pemeriksaan berkas tanpa bertanya ulang ke admin.
  3. Jika lampiran kurang jelas atau salah berkas, operator harus mengetik ulang seluruh data siswa di form baru.
  4. Rekapitulasi dan pemilahan antrean EMIS maupun VervalPD masih dilakukan manual.
- **Sesudah (Portal SI-PELITA):**
  1. Semua pengajuan (EMIS, VervalPD, Kolektif) terkumpul rapi satu pintu dengan syarat dokumen yang jelas.
  2. Cek status cukup menggunakan **ID Tiket** atau **Nomor WhatsApp pelapor** (`08...`).
  3. Jika laporan berstatus **Ditolak**, cukup klik tombol **Perbaiki Data** pada tiket tersebut — data lama terisi kembali secara otomatis tanpa mengetik ulang dari nol.
  4. Berkas tersimpan rapi per tiket siswa dan statistik penyelesaian terbuka untuk publik.

### C. Tiga Jalur Pelaporan & Fitur Teknis Utama
1. **Lapor Masalah EMIS** (`emis.html`):
   - **Salah Tingkat:** Siswa berada di tingkat kelas yang tidak sesuai di EMIS 4.0 (wajib scan Raport Terakhir / Ijazah Jenjang Sebelumnya, maks. 5 MB).
   - **Re-Aktivasi Siswa:** Mengaktifkan kembali siswa yang terhapus/keluar (wajib scan Raport/Ijazah + Surat Keterangan Aktif, ditambah Surat Mutasi bila lembaga tujuan berbeda).
   - Dilengkapi *auto-lookup* nama madrasah dari **NSM (12 digit)**.
2. **Lapor Masalah VervalPD** (`verval.html`):
   - **NISN/NIK Ganda:** Terdeteksi ganda atau terpakai siswa lain (wajib scan KK Asli & Akta Kelahiran + Screenshot VervalPD Tercatat Ganda).
   - **Data Tidak Ada (Residu):** Siswa sudah aktif di EMIS tetapi belum muncul di VervalPD (wajib scan KK atau Akta Kelahiran).
   - Dilengkapi *auto-lookup* nama sekolah/madrasah dari **NPSN (8 digit)**.
3. **Laporan Kolektif Terstruktur** (`kolektif.html`):
   - Input banyak siswa sekaligus dalam satu kategori (EMIS Salah Tingkat, EMIS Re-Aktivasi, VervalPD NISN/NIK Ganda, VervalPD Data Tidak Ada, atau Lainnya).
   - Mendukung **input langsung di layar** (`+ Tambah Aduan Siswa`) maupun **unduh template & impor otomatis Excel (`.xlsx`)**.
   - Menghasilkan **1 ID Induk batch** dengan nomor tiket individual berindeks (`TIK-yyyyMMdd-XXXX-01`, `-02`, dst.) — dapat dilacak sekaligus lewat ID Induk atau No. WA.
   - Bukti dukung *hybrid*: upload 1 berkas gabungan PDF/ZIP/RAR (maks. 10 MB) **atau** tempel tautan Google Drive (akses publik).
   - Sesi operator & NSM/NPSN tersimpan otomatis untuk mempercepat laporan kategori berikutnya (*"Lapor Kategori Lain"*).

### D. Pelacakan, Alur Berjenjang, Jam Layanan & Transparansi
- **Anti-Duplikasi Otomatis:** Sistem menolak pengajuan ganda jika NISN siswa yang sama masih memiliki tiket aktif (*Baru / Diterima / Diproses*).
- **Format Nomor Tiket:** `TIK-yyyyMMdd-XXXX` (individu) dan `TIK-yyyyMMdd-XXXX-01` (kolektif berindeks).
- **Alur Status Berjenjang:**
  1. **Baru:** Tercatat otomatis di database sistem SI-PELITA.
  2. **Diterima:** Diverifikasi kelengkapan dan keabsahan dokumen oleh Operator Seksi Penmad Kemenag Kab. Banjar.
  3. **Diproses:** Dieskalasi ke tingkat **Kanwil Kemenag Provinsi** hingga **Admin Pusat Kemenag RI / Pusdatin** untuk eksekusi perbaikan server pusat.
  4. **Selesai:** Perbaikan tuntas dan langsung terlihat pada hasil lacak tiket operator *(sinkronisasi antarserver Pusdatin–EMIS umumnya memerlukan minimal `1×24 jam` setelah status Selesai)*.
  5. **Ditolak *(bila berkas kurang/keliru)*:** Disertai **Catatan Admin** dan tombol **Perbaiki Data** untuk revisi instan.
- **Jam Layanan & Estimasi:** Formulir dapat diisi **24 jam** penuh; pemeriksaan tingkat Kabupaten dilakukan pada hari & jam kerja (**Senin–Jumat, 08.00–16.00 WITA**) dengan estimasi awal **`1×24 jam`**, sedangkan eskalasi Kanwil/Pusat mengikuti antrean Admin Pusat.
- **Fitur Transparansi & Umpan Balik:** Halaman beranda memuat **Statistik Pelaporan** (Bento Grid status + grafik tren harian & sebaran kategori bulanan) serta **Kotak Saran & Testimoni** (bintang `1–5` setelah tiket *Selesai* + dinding testimoni publik).

### E. Bahasa Desain Aplikasi (Referensi Visual Mode A)
- **Palet Warna:**
  - Hijau Utama Kemenag: `#1B5E20` (`--primary-green`), Hijau Gelap `#0d3810`, Hijau Aksen `#4CAF50`
  - Latar Terang Bersih: `#f8f9fa` / `#f4f7f6` dengan permukaan kartu `#ffffff` dan border halus `#eef2f6` / `#e2e8f0`
  - Aksen Semantik Kategori & Status: Biru EMIS (`#2563eb` / `#3b82f6`), Hijau VervalPD & Selesai (`#22c55e` / `#15803d`), Amber/Kuning Kolektif & Baru (`#f59e0b`), Merah Ditolak & NIK Ganda (`#ef4444` / `#dc2626`)
- **Tipografi & Gaya:** Font `Inter` modern dengan `tabular-nums` untuk statistik/kode tiket, kartu membulat (*rounded cards* `16–24px`), *pill badges* status, serta kontras jelas antara *card* masalah lama dan solusi SI-PELITA.

---

## 4. Data Publik & Testimoni Organik (Diambil dari Homepage Publik, `2026-11-20`)

*(Diambil langsung dari antarmuka publik tanpa kredensial privat; tanpa menyertakan URL deployment, ID Spreadsheet, atau nomor pribadi).*

### A. Statistik Transparansi Publik Live (`2026-11-20`)
- **Total Laporan Masuk:** `370` laporan (`96% Terselesaikan`)
- **Selesai:** `313`
- **Ditolak (untuk revisi/tidak valid):** `44`
- **Diterima:** `10`
- **Baru Masuk:** `3`
- **Diproses:** `0`

### B. 7 Testimoni Organik Operator Madrasah (Dianonimkan, Bintang 5/5)
1. **Operator Madrasah 1** - `5/5`:
   > "Alhamdulillah, berkat SIPELITA masalah yang dihadapi operator bisa terbantu dan terselesaikan dengan baik. Sukses selalu"
2. **Operator Madrasah 2** - `5/5`:
   > "SIPELITA sangat membantu dalam memberikan kemudahan dan kecepatan pelayanan. Prosesnya praktis, mudah diakses, dan tidak memerlukan waktu lama. Saya merasa puas dengan layanan yang diberikan dan berharap SIPELITA terus dipertahankan serta ditingkatkan kualitasnya."
3. **Operator Madrasah 3** *(dipakai sebagai `Operator Madrasah B` pada video)* - `5/5`:
   > "Alhamdulillah setelah melaporkan kendala di aplikasi, tim langsung cepat menangani dan berhasil mengatasinya dengan cepat.. semoga jdi amal kebaikan untuk semua tim yang telah membantu.."
4. **Operator Madrasah 4** *(dipakai sebagai `Operator Madrasah C` pada video)* - `5/5`:
   > "sangat bagus dan membantu dalam permasalahan data, bahkan prosesnya cepat tampa rebet, bahkan tampa menunggu lama."
5. **Operator Madrasah 5** - `5/5`:
   > "Saya sangat mengapresiasi dengan adanya SI PELITA karena memudahkan operator sekolah dalam menyelesaikan permasalahan dalam waktu yang sangat singkat. Terus kembangkan dan pertahankan"
6. **Operator Madrasah 6** - `5/5`:
   > "Bagus Terus Dikembangkan, Respons Cepat dalam Menyelesaikan Masalah"
7. **Operator Madrasah 7** *(dipakai sebagai `Operator Madrasah A` pada video)* - `5/5`:
   > "Alhamdulillah .. aplikasi si-pelita sangat membantu ketika ada kendala data di madrsah kami.. alhamdulillah Kemenag Banjar mempunyai aplikasi si-pelita yang sangat membantu madrasah yang ada di Kabupaten Banjar ketika ada masalah mengenai data siswa dan lain-lain. TERIMA KASIH UNTUK ADMIN SI-PELITA KEMENAG BANJAR."
