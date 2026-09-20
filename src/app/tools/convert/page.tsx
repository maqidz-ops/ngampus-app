import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { ConvertTool } from "./ConvertTool";

export const metadata: Metadata = {
  title: "Ubah file ke PDF",
  description:
    "Konversi gambar, teks, HTML, dan DOCX ke PDF di browser. File tidak diunggah ke server.",
};

const faq = [
  {
    q: "Format apa yang didukung?",
    a: "PNG, JPG, WEBP, GIF, BMP, SVG, TXT, MD, CSV, JSON, HTML, DOCX, dan PDF (digabung ke hasil). Excel (.xlsx) dan PowerPoint belum — ekspor ke PDF dari Office dulu.",
  },
  {
    q: "DOCX mempertahankan layout Word?",
    a: "Tidak. DOCX diambil teksnya lalu disusun ulang ke halaman A4. Untuk layout persis, ekspor PDF dari Word/Google Docs.",
  },
  {
    q: "Beberapa file sekaligus?",
    a: "Ya. Setiap file menjadi halaman (atau rangkaian halaman) dalam satu PDF unduhan.",
  },
];

export default function ConvertPage() {
  return (
    <ToolShell
      kicker="Alat PDF"
      title="Ubah file ke PDF"
      description="Gambar, catatan teks, HTML, dan Word (.docx) jadi satu PDF. Semua di browser."
      faq={faq}
    >
      <ConvertTool />
    </ToolShell>
  );
}
