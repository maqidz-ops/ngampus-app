import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { CompressTool } from "./CompressTool";

export const metadata: Metadata = {
  title: "Kompres PDF",
  description:
    "Perkecil ukuran PDF di browser. Ringan menulis ulang file; sedang mengecilkan sekitar 50%, kuat sekitar 75%.",
};

const faq = [
  {
    q: "Kenapa mode sedang/kuat membuat teks tidak bisa diseleksi?",
    a: "Kalau halaman diraster, isinya jadi gambar JPEG supaya ukuran turun. Mode ringan menjaga teks, tapi penghematannya kecil.",
  },
  {
    q: "Kenapa hasil kadang hampir sama dengan file asli?",
    a: "PDF yang sudah kecil atau berisi teks vektor bisa membesar kalau dijadikan gambar. Sedang dan kuat tidak mengembalikan file yang lebih besar dari aslinya.",
  },
  {
    q: "File keluar dari HP/laptop?",
    a: "Tidak. Worker PDF.js dan canvas jalan lokal di browser.",
  },
];

export default function CompressPage() {
  return (
    <ToolShell
      kicker="Alat PDF"
      title="Kompres PDF"
      description="Perkecil ukuran PDF tanpa unggah. Sedang sekitar setengah ukuran asli, kuat sekitar seperempat — untuk cetak atau kirim WA."
      faq={faq}
    >
      <CompressTool />
    </ToolShell>
  );
}
