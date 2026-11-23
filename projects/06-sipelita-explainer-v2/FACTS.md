# FACTS: Sumber Data & Verifikasi Fakta Video SI-PELITA

Seluruh pernyataan pada video, subtitle, dan grafik diverifikasi melalui audit *read-only* terhadap kode sumber Google Apps Script resmi SI-PELITA serta tampilan publik beranda aplikasi (cuplikan data tercatat 2026-11-20). Kredensial privat, tautan deployment produksi, Spreadsheet ID, Drive Folder ID, dan nomor pribadi dikecualikan seluruhnya.

## 1. Identitas & Inovasi Layanan
- **Nama & Kepanjangan:** **SI-PELITA** (Sistem Pelaporan Informasi & Data)
- **Pengelola:** **Seksi Pendidikan Madrasah, Kantor Kementerian Agama Kabupaten Banjar**
- **Sumber Verifikasi:** Header aplikasi & kode sumber SI-PELITA (`index.html`, `Code.js`)
- **Kendala Lama yang Diselesaikan:**
  1. Chat WhatsApp pelaporan kerap tertumpuk dan tenggelam.
  2. Tautan Google Form terpisah-pisah untuk setiap jenis kendala data.
  3. Tidak ada fitur pelacakan mandiri sehingga operator harus berulang kali menanyakan kabar laporan.
  4. Apabila pengajuan ditolak karena berkas keliru, operator harus mengetik ulang formulir dari awal.

## 2. Kanal Layanan & Mekanisme Inovasi
- **Tiga Jalur dalam Satu Pintu:**
  1. **EMIS 4.0** (`emis.html`): perbaikan Siswa Salah Tingkat dan Re-Aktivasi Siswa, dilengkapi *auto-lookup* NSM otomatis.
  2. **VervalPD** (`verval.html`): penanganan NISN/NIK Ganda dan Data Tidak Ditemukan (Residu), dilengkapi *auto-lookup* NPSN otomatis.
  3. **Kolektif** (`kolektif.html`): pelaporan banyak siswa sekaligus melalui tabel layar atau unggah file `.xlsx` dengan nomor indeks tiket otomatis.
- **Anti-Duplikasi Otomatis:** Sistem menolak laporan ganda apabila NISN siswa masih terdaftar pada tiket yang berstatus aktif (*Baru*, *Diterima*, atau *Diproses*).
- **Pelacakan Mandiri & Revisi Instan:**
  - Operator dapat melacak progres laporan kapan saja memakai **Nomor WhatsApp pelapor** atau ID Tiket melalui tahapan status transparan: `Baru -> Diterima -> Diproses -> Selesai`.
  - Apabila tiket berstatus `Ditolak`, operator cukup menekan tombol **Perbaiki Data** pada tiket tersebut tanpa perlu mengisi ulang dari nol.

## 3. Data Statistik Publik (Evergreen)
- **Cuplikan Publik (2026-11-20):** Total `370` laporan masuk (`313` Selesai, `44` Ditolak, `10` Diterima, `3` Baru, `0` Diproses), setara `96%` laporan terselesaikan.
- **Redaksi Evergreen Wajib di Video:** Gunakan frasa **`Ratusan laporan masuk`**, **`> 95% terselesaikan`**, dan **`Akses 24 jam`** (merujuk pada ketersediaan formulir daring 24 jam di `panduan.html`). Jangan menampilkan angka mentah `370` atau `313` di layar agar video tetap relevan dalam jangka panjang.

## 4. Testimoni Organik Anonim (Bintang 5/5)
Ketiga kutipan diambil dari daftar testimoni publik berperingkat 5/5 di beranda SI-PELITA (2026-11-20), dirapikan ejaannya tanpa mengubah makna, dan wajib ditampilkan 100% anonim tanpa nama madrasah maupun nama pribadi:
1. **Operator Madrasah A (5/5):** *"Sangat membantu ketika ada kendala data di madrasah kami."*
2. **Operator Madrasah B (5/5):** *"Tim langsung cepat menangani dan berhasil mengatasinya."*
3. **Operator Madrasah C (5/5):** *"Prosesnya cepat tanpa ribet, tanpa menunggu lama."*
