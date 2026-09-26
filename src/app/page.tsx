import Link from "next/link";
import { Footer, Header } from "@/components/Header";
import { UpsellBanner } from "@/components/UpsellBanner";

const tools = [
  {
    href: "/tools/merge",
    title: "Gabung PDF",
    body: "Satukan beberapa PDF jadi satu file, urutan bisa diatur.",
  },
  {
    href: "/tools/compress",
    title: "Kompres PDF",
    body: "Perkecil ukuran PDF di browser. Ringan, sedang (~50%), atau kuat (~75%).",
  },
  {
    href: "/tools/convert",
    title: "File ke PDF",
    body: "Gambar, teks, HTML, dan DOCX jadi PDF. Beberapa file jadi satu.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-16">
        <p className="text-xs font-medium uppercase tracking-wide text-accent">Gratis · tanpa akun</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Gabung, kompres, dan ubah file ke PDF.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          Diproses di browser. File tidak diunggah ke server — cocok untuk skripsi dan tugas.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-2xl border border-line bg-white p-5 shadow-[0_1px_5px_-4px_rgba(19,19,22,0.7),0_0_0_1px_rgba(34,42,53,0.08),0_4px_8px_rgba(34,42,53,0.05)] hover:border-neutral-300"
            >
              <h2 className="text-lg font-semibold tracking-tight">{tool.title}</h2>
              <p className="mt-2 text-sm text-muted">{tool.body}</p>
              <p className="mt-4 text-sm font-medium">Buka alat →</p>
            </Link>
          ))}
        </div>
        <div className="mx-auto mt-8 max-w-2xl">
          <UpsellBanner />
        </div>
      </main>
      <Footer />
    </div>
  );
}
