import Link from "next/link";

export function UpsellBanner() {
  return (
    <aside className="mt-10 rounded-2xl border border-line bg-white p-5 shadow-[0_1px_5px_-4px_rgba(19,19,22,0.7),0_0_0_1px_rgba(34,42,53,0.08),0_4px_8px_rgba(34,42,53,0.05)]">
      <p className="text-xs font-medium uppercase tracking-wide text-accent">Layanan skripsi</p>
      <h2 className="mt-1 text-lg font-semibold tracking-tight">Cek plagiasi Rp 5.000</h2>
      <p className="mt-1 text-sm text-muted">
        Setelah merapikan PDF, cek similaritas skripsi tanpa repository. Laporan PDF, kirim via WhatsApp.
      </p>
      <Link
        href="/services/plagiarism"
        className="mt-4 inline-flex rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Lihat cara kerja
      </Link>
    </aside>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <section className="mt-12">
      <h2 className="text-lg font-semibold tracking-tight">Pertanyaan umum</h2>
      <dl className="mt-4 space-y-4">
        {items.map((item) => (
          <div key={item.q} className="rounded-xl border border-line bg-white p-4">
            <dt className="text-sm font-medium">{item.q}</dt>
            <dd className="mt-1 text-sm text-muted">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
