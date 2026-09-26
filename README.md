# PDFKilat

Alat PDF gratis untuk tugas dan skripsi: **gabung**, **kompres**, dan **ubah file ke PDF**. Semuanya diproses di browser. File tidak pernah diunggah ke server.

Yang sudah tayang: https://ngampus-app.vercel.app

## Menjalankan di komputer

Kode ada di akar repo ini.

```bash
git clone https://github.com/maqidz-ops/ngampus-app.git
cd ngampus-app
npm install
npm run dev
```

Buka http://localhost:3000

| Perintah | Untuk apa |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi |
| `npm run start` | Jalankan hasil build |
| `npm run lint` | Cek ESLint |
| `npx tsx scripts/verify-tools.ts` | Cek gabung, konversi, dan kompres di Node |
| `node scripts/verify-merge.mjs` | Cek gabung sederhana; hasilnya di `.tmp-verify/` |

`verify-tools.ts` memakai canvas lewat `@napi-rs/canvas` (ikut terpasang bersama `pdfjs-dist`). Kalau paket itu tidak ada, skrip kompres sedang/kuat tidak bisa jalan.

## Halaman

| Halaman | Isi |
|---|---|
| `/` | Beranda: tiga alat PDF, plus ajakan cek plagiasi |
| `/tools/merge` | Gabung beberapa PDF jadi satu. Urutan di daftar = urutan halaman; geser dengan tombol panah |
| `/tools/compress` | Perkecil satu PDF. Tingkatnya dijelaskan di bawah |
| `/tools/convert` | Gambar, teks, HTML, dan DOCX dijadikan satu PDF |
| `/services/plagiarism` | Info layanan cek plagiasi (Rp 5.000). Pemesanan, pembayaran, dan laporan lewat WhatsApp belum hidup di build ini |

## Kompres PDF

Satu file. Ada tiga tingkat:

- **Ringan** — menulis ulang PDF, nyaris tanpa menurunkan kualitas. Teks tetap bisa diseleksi. Ukurannya biasanya hanya turun sedikit.
- **Sedang** — target sekitar **50% lebih kecil** (hasil kira-kira setengah file asli). Halaman digambar ulang menjadi JPEG.
- **Kuat** — target sekitar **75% lebih kecil** (hasil kira-kira seperempat file asli). Lebih ringan; teks jadi gambar, jadi tidak bisa diseleksi.

Kalau menggambar ulang halaman malah membuat file lebih besar, hasil itu dibuang. PDFKilat tidak mengembalikan file yang lebih besar dari aslinya: yang dipakai adalah hasil ringan, atau file asli kalau itu yang lebih kecil. PDF yang isinya teks saja sering hampir tidak menyusut.

## Batas

Maksimal **40 MB per file** dan **30 file** sekaligus.

Excel (`.xls`, `.xlsx`), PowerPoint (`.ppt`, `.pptx`), dan Word lama (`.doc`) belum bisa diproses di browser. Ekspor dulu ke PDF, atau simpan sebagai gambar/DOCX. DOCX yang didukung diambil teksnya, lalu disusun ulang ke halaman A4 — bukan layout Word yang persis.

Yang bisa dikonversi sekarang: PNG, JPG, WEBP, GIF, BMP, SVG, TXT, MD, CSV, JSON, HTML, LOG, DOCX, dan PDF.

## Teknologi

- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS v4
- `pdf-lib` dan `pdfjs-dist` (worker lokal di `public/pdf.worker.min.mjs`)
- `mammoth` untuk membaca DOCX

Deploy di Vercel: https://ngampus-app.vercel.app
