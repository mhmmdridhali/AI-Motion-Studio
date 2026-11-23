// Timeline, 12 Shot definitions, Sky colour keyframes, and Semantic KEEP_PAIRS for SI-PELITA Explainer v2
export const DUR = 81.85;
export const BEAT = 0.625;
export const BAR = 2.5;

export const SHOTS = [
  { id: 's01', t0: 0.00,  t1: 6.10,  name: 's01_chat_sink',    badge: 'KENDALA OPERATOR',     title: 'Chat Lapor Tenggelam?',       sub: 'Tertimbun pesan grup & sulit dilacak' },
  { id: 's02', t0: 6.10,  t1: 14.15, name: 's02_split_forms',  badge: 'FORMULIR TERPISAH',    title: 'Link Pisah & Ketik Ulang',    sub: 'Salah sedikit, harus isi formulir dari awal' },
  { id: 's03', t0: 14.15, t1: 22.40, name: 's03_hub_rise',     badge: 'SOLUSI SATU PINTU',    title: 'SI-PELITA Kemenag Banjar',    sub: 'Sistem Pelaporan Informasi dan Data' },
  { id: 's04', t0: 22.40, t1: 28.95, name: 's04_dock_emis',    badge: 'JALUR LAYANAN · EMIS', title: 'Dermaga EMIS 4.0',            sub: 'Perbaikan salah tingkat & reaktivasi siswa' },
  { id: 's05', t0: 28.95, t1: 34.45, name: 's05_dock_verval',  badge: 'JALUR LAYANAN · DATA', title: 'Dermaga Verval PD',           sub: 'Solusi NISN / NIK ganda & sinkronisasi data' },
  { id: 's06', t0: 34.45, t1: 41.85, name: 's06_dock_kolektif',badge: 'JALUR KOLEKTIF',       title: 'Unggah Excel & Anti-Ganda',   sub: 'Lapor banyak sekaligus, otomatis tolak duplikat' },
  { id: 's07', t0: 41.85, t1: 50.40, name: 's07_tower_track',  badge: 'LACAK TRANSPARAN',     title: 'Cek Tiket atau Nomor WA',     sub: 'Baru -> Diterima -> Diproses -> Selesai' },
  { id: 's08', t0: 50.40, t1: 56.85, name: 's08_turntable_fix',badge: 'REVISI PRAKTIS',       title: 'Klik Perbaiki Data',          sub: 'Revisi berkas di tiket yang sama tanpa ketik ulang' },
  { id: 's09', t0: 56.85, t1: 63.85, name: 's09_night_beacon', badge: 'KINERJA LAYANAN',      title: 'Akses 24 Jam · >95% Tuntas',  sub: 'Ratusan laporan madrasah terselesaikan tepat waktu' },
  { id: 's10', t0: 63.85, t1: 69.85, name: 's10_testimonials', badge: 'SUARA OPERATOR',       title: 'Cepat, Sigap, Tanpa Ribet',   sub: 'Testimoni Operator Madrasah A · B · C (★★★★★)' },
  { id: 's11', t0: 69.85, t1: 74.70, name: 's11_archipelago',  badge: 'SE-KABUPATEN BANJAR',  title: 'Data Madrasah Lebih Ringan',  sub: 'MI · MTs · MA terhubung ke Seksi Penmad' },
  { id: 's12', t0: 74.70, t1: 81.85, name: 's12_endcard',      badge: 'KEMENAG KAB. BANJAR',  title: 'SI-PELITA Kemenag Banjar',    sub: 'Lapor Gampang · Lacak Tenang · Data Beres' },
];

export function shotAt(t) {
  for (let i = SHOTS.length - 1; i >= 0; i--) {
    if (t >= SHOTS[i].t0) return SHOTS[i];
  }
  return SHOTS[0];
}

// Sky keyframes: [t, zenith, horizon, seaDeep, seaShallow, sunColor, sunInt, hemiSky, hemiGround, hemiInt, sunEl, sunAz, nightAmt]
export const SKY = [
  // s01-s02: overcast morning teal-slate (problem hook)
  [0.0,   '#6fa6c4', '#cfe2ec', '#2b7892', '#68c2bc', '#fff1dc', 2.1, '#d8ebf5', '#b8ab96', 1.0,  28,  36, 0.08],
  [13.8,  '#75b0cf', '#d6e9f2', '#2d829e', '#72ccc4', '#fff3df', 2.2, '#e0f0f8', '#bfb29c', 1.02, 30,  42, 0.05],
  // s03-s06: bright sunny tropical pastel daylight (island hub & 3 service docks)
  [15.2,  '#6ec2ec', '#e5f5fb', '#2e98b4', '#86e4d4', '#fff7e8', 2.65, '#eef8fd', '#cbbca0', 1.15, 36,  55, 0.0],
  [41.5,  '#6bc0ea', '#e4f4fa', '#2e98b4', '#86e4d4', '#fff6e6', 2.6,  '#edf7fc', '#cbbca0', 1.14, 34,  78, 0.0],
  // s07-s08: warm golden afternoon (tracking tower & revision turntable)
  [43.0,  '#69b3e0', '#f4eadc', '#2c8ca8', '#7ed8ca', '#ffecd0', 2.5,  '#f2f0e8', '#c8b294', 1.08, 27, 105, 0.06],
  [55.8,  '#5e8ec2', '#f5cba8', '#277292', '#6bc0b8', '#ffd29e', 2.1,  '#ebd8c8', '#b59a82', 0.96, 19, 130, 0.25],
  // s09: 24-hour starry night + glowing lighthouse beacon
  [58.0,  '#141e3c', '#2d4570', '#133a56', '#2e7c86', '#9bb8ff', 0.75, '#3b5284', '#26304a', 0.58, 22, 155, 0.96],
  [63.2,  '#172344', '#354f7c', '#153f5e', '#32848e', '#a8c2ff', 0.85, '#425b8e', '#2c3652', 0.62, 22, 165, 0.92],
  // s10-s12: warm golden sunrise -> radiant morning panorama
  [65.0,  '#569cd4', '#f7dec4', '#2886a2', '#7ad8c8', '#ffe4be', 2.35, '#f0e8dc', '#c4ae92', 1.05, 26, 185, 0.15],
  [70.2,  '#6ac0ec', '#e6f5fb', '#2e98b4', '#86e4d4', '#fff6e6', 2.65, '#eef8fd', '#cbbca0', 1.15, 35, 205, 0.0],
  [81.85, '#6ac0ec', '#e6f5fb', '#2e98b4', '#86e4d4', '#fff6e6', 2.65, '#eef8fd', '#cbbca0', 1.15, 36, 215, 0.0],
];

export const KEEP_PAIRS = new Set([
  'salah tingkat', 'butuh reaktivasi?', 'langsung beres', 'jalur EMIS', 'empat titik', 'titik nol.',
  'NIK ganda', 'belum muncul?', 'Verval PD.', 'satu-satu?', 'jalur kolektif', 'lewat Excel,',
  'tiket ganda.', 'cek progres,', 'masukkan tiket.', 'Lupa nomornya?', 'nomor WhatsApp',
  'status tiket', 'sampai selesai.', 'berkasnya keliru?', 'Perbaiki Data', 'ketik ulang.',
  'dua puluh', 'empat jam,', 'ratusan laporan', 'sembilan puluh', 'lima persen', 'persen tuntas.',
  'operator madrasah', 'tanpa ribet.', 'data madrasah', 'se-Kabupaten Banjar', 'lebih ringan.',
  'Kemenag Banjar.', 'Lapor gampang,', 'lacak tenang,', 'data beres.', 'satu pintu.'
]);
