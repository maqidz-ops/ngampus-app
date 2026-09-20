# PDFKilat

Alat PDF gratis (funnel): **gabung**, **kompres**, **ubah file ke PDF**. Semua jalan di browser (`pdf-lib` + PDF.js). File tidak diunggah.

```bash
cd pdf-tools
npm install
npm run dev
```

Buka http://localhost:3000

| Halaman | Fungsi |
|---|---|
| `/tools/merge` | Gabung PDF (urutkan) |
| `/tools/compress` | Kompres: ringan (rewrite) / sedang-kuat (raster JPEG) |
| `/tools/convert` | Gambar, TXT/MD/HTML, DOCX, PDF → satu PDF |

Batas: 40 MB/file, 30 file. Excel/PPT belum (butuh LibreOffice/Stirling nanti).
