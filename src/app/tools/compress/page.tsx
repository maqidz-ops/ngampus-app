import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { CompressTool } from "./CompressTool";

export const metadata: Metadata = {
  title: "Kompres PDF",
  description: "Perkecil ukuran PDF di browser. Mode ringan menulis ulang file; sedang/kuat meraster halaman.",
};

const faq = [
  {
    q: "Kenapa mode sedang/kuat membuat teks tidak bisa diseleksi?",
    a: "Mode itu menggambar ulang setiap halaman sebagai JPEG supaya ukurannya turun. Mode ringan menjaga teks, tapi penghematannya kecil.",
  },
  {
    q: "Kenapa hasil kadang lebih besar?",
    a: "PDF yang sudah sangat terkompres atau berisi teks vektor murni bisa membesar setelah diraster. Coba mode ringan.",
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
      description="Perkecil ukuran PDF tanpa unggah. Pilih tingkat sesuai kebutuhan cetak atau kirim WA."
      faq={faq}
    >
      <CompressTool />
    </ToolShell>
  );
}
