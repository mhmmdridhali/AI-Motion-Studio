# Katalog Proyek (`projects/`)

Direktori ini menyimpan seluruh proyek video yang dibuat di **AI Motion Studio**.

## Konvensi Penamaan

Gunakan format berurutan `NN-slug` (contoh: `01-peluncuran-produk`, `02-explainer-layanan`).

## Struktur Standar Folder Proyek

```text
projects/NN-slug/
├── README.md          # Ringkasan proyek, mode engine, dan cara render ulang
├── STORYLINES.md      # 3 opsi storyline (Mode A/C)
├── TREATMENT.md       # Director treatment (Mode B)
├── SPEC.md            # Spesifikasi angka eksak visual & motion
├── STORYBOARD.md      # Opsional: daftar frame storyboard
├── REVIEW.md          # Catatan QA visual pra-render
├── boards/            # Opsional: storyboard.html & stills/
├── voice/             # lines.json & dur.json (.wav/.mp3 diabaikan Git)
├── assets/            # Aset lokal (SVG, font, gambar ringan)
├── compositions/      # Scene HTML/GSAP atau kode scene render(t)
├── index.html         # Komposisi utama
├── preview/           # Poster & contact sheet PNG ringan
└── output/            # File .mp4 final (lokal saja, masuk .gitignore)
```

Ikuti SOP lengkap di [.agents/skills/motion-studio-workflow/SKILL.md](../.agents/skills/motion-studio-workflow/SKILL.md) saat memulai proyek baru.
