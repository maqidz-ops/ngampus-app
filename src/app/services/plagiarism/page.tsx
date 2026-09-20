import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Cek plagiasi",
  description: "Layanan cek plagiasi skripsi. Segera hadir.",
};

export default function PlagiarismPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-16">
        <p className="text-xs font-medium uppercase tracking-wide text-accent">Layanan berbayar</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Cek plagiasi Rp 5.000</h1>
        <p className="mt-3 text-muted">
          Pipeline order (upload → QRIS → laporan PDF via WhatsApp) belum live di build ini. Alat
          PDF di atas sudah bisa dipakai sekarang.
        </p>
        <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-muted">
          <li>Target mahasiswa: laporan similaritas, tanpa janji repository palsu.</li>
          <li>Provider legal (DrillBit / detektor AI), bukan akun Turnitin bersama.</li>
          <li>Harga dihitung di server, bukan di JavaScript klien.</li>
        </ul>
        <Link href="/" className="mt-8 inline-flex rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-white">
          Kembali ke alat PDF
        </Link>
      </main>
      <Footer />
    </div>
  );
}
