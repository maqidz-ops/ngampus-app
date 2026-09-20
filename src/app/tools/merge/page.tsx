import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { MergeTool } from "./MergeTool";

export const metadata: Metadata = {
  title: "Gabung PDF",
  description: "Gabungkan beberapa file PDF menjadi satu. Diproses di browser, file tidak diunggah.",
};

const faq = [
  {
    q: "Apakah file diunggah ke server?",
    a: "Tidak. Penggabungan memakai pdf-lib di browser. File tetap di perangkatmu.",
  },
  {
    q: "Berapa banyak PDF yang bisa digabung?",
    a: "Sampai 30 file, masing-masing maksimal 40 MB. Urutan di daftar adalah urutan halaman hasil.",
  },
  {
    q: "PDF terenkripsi?",
    a: "File berpassword yang masih bisa dibaca viewer biasanya tetap bisa digabung. Kalau gagal, buka dulu PDF-nya dan simpan ulang tanpa password.",
  },
];

export default function MergePage() {
  return (
    <ToolShell
      kicker="Alat PDF"
      title="Gabung PDF"
      description="Satukan beberapa PDF jadi satu berkas. Geser urutan dengan tombol panah."
      faq={faq}
    >
      <MergeTool />
    </ToolShell>
  );
}
