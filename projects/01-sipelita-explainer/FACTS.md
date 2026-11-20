# FACTS: Sumber Data & Verifikasi Fakta Video SI-PELITA

Seluruh pernyataan pada video, subtitle, dan grafik telah diverifikasi melalui audit *read-only* terhadap kode sumber Google Apps Script resmi SI-PELITA serta tampilan publik beranda aplikasi pada 2026-11-20. Kredensial privat, tautan deployment produksi, Spreadsheet ID, Drive Folder ID, dan nomor pribadi dikecualikan secara sengaja.

## 1. Identitas & Inovasi Layanan
- **Nama & Kepanjangan:** **SI-PELITA** (Sistem Pelaporan Informasi & Data)
- **Pengelola:** **Seksi Pendidikan Madrasah, Kantor Kementerian Agama Kabupaten Banjar**
- **Sumber:** File HTML header & script aplikasi SI-PELITA (`.tmp-sipelita-gas/index.html`, `Code.js`)
- **Kendala yang Diselesaikan:** Chat WhatsApp pelaporan kerap tenggelam, tautan Google Form terpisah per jenis kendala, tidak ada pelacakan mandiri sehingga status harus ditanya ulang, serta kewajiban mengetik ulang saat berkas keliru.

## 2. Kanal Layanan & Mekanisme Inovasi
- **Tiga Jalur Satu Pintu:**
  1. **EMIS 4.0** (`emis.html`): perbaikan Salah Tingkat dan Re-Aktivasi Siswa dengan *auto-lookup* NSM.
  2. **VervalPD** (`verval.html`): penyelesaian NISN/NIK Ganda dan Data Tidak Ada (Residu) dengan *auto-lookup* NPSN.
  3. **Kolektif** (`kolektif.html`): pengajuan banyak siswa sekaligus via input layar atau impor `.xlsx` dengan sistem indeks tiket otomatis.
- **Anti-Duplikasi Otomatis:** Sistem menolak pengajuan ganda apabila NISN siswa masih memiliki tiket berstatus aktif (*Baru*, *Diterima*, atau *Diproses*).
- **Pelacakan & Revisi Instan:** Status tiket dapat dilacak kapan saja menggunakan **Nomor WhatsApp pelapor** atau ID Tiket melalui alur berjenjang (`Baru -> Diterima -> Diproses -> Selesai`). Untuk tiket berstatus `Ditolak`, operator cukup menekan tombol **Perbaiki Data** di tiket yang sama tanpa mengetik ulang dari nol.

## 3. Data Statistik Publik (*Evergreen*)
- **Cuplikan Publik Tercatat (2026-11-20):** Total `370` laporan masuk (`313` Selesai, `44` Ditolak, `10` Diterima, `3` Baru, `0` Diproses) atau setara `96%` tingkat penyelesaian.
- **Redaksi Evergreen di Video:** *"Ratusan laporan masuk"*, **`> 95% terselesaikan`**, dan **`Akses 24 jam`** *(merujuk pada ketersediaan formulir daring 24 jam sesuai `panduan.html`)*.

## 4. Testimoni Organik Anonim
Ketiga kutipan berasal dari dinding testimoni publik bintang 5/5 di beranda SI-PELITA (`2026-11-20`), dirapikan salah ketik minor tanpa mengubah makna, dan disajikan anonim tanpa menyebut asal madrasah sesuai instruksi pemilik layanan:
1. **Operator Madrasah A (5/5):** *"Sangat membantu ketika ada kendala data di madrasah kami."* *(disarikan dari pembuka kutipan asli operator berperingkat 5/5)*
2. **Operator Madrasah B (5/5):** *"Tim langsung cepat menangani dan berhasil mengatasinya."* *(dari kutipan operator berperingkat 5/5)*
3. **Operator Madrasah C (5/5):** *"Prosesnya cepat tanpa ribet, tanpa menunggu lama."* *(disarikan dari kutipan operator berperingkat 5/5, ejaan baku `tampa rebet` -> `tanpa ribet`)*
