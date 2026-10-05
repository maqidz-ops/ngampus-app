import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { CompressTool } from "./CompressTool";

export const metadata: Metadata = {
  title: "Kompres PDF",
  description: "Kompres PDF otomatis di browser dengan target pengurangan ukuran 35–50%, tanpa unggah.",
};

const faq = [
  {
    q: "Apakah teks hasil kompres tetap bisa diseleksi?",
    a: "Kompres otomatis menggambar ulang halaman sebagai gambar. Teks pada hasil kompres tidak bisa diseleksi.",
  },
  {
    q: "Apakah ukuran selalu berkurang 35–50%?",
    a: "Itu adalah target, bukan jaminan. Hasil bergantung pada isi PDF dan bisa di luar rentang tersebut. Jika kompres tidak menghasilkan file lebih kecil, file asli digunakan.",
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
      description="Perkecil ukuran PDF secara otomatis tanpa unggah, dengan target pengurangan 35–50%."
      faq={faq}
    >
      <CompressTool />
    </ToolShell>
  );
}
