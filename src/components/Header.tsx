import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-[11px] font-bold text-white">
            PDF
          </span>
          Kilat
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link className="rounded-md px-3 py-1.5 text-muted hover:bg-neutral-100 hover:text-foreground" href="/tools/merge">
            Gabung
          </Link>
          <Link className="rounded-md px-3 py-1.5 text-muted hover:bg-neutral-100 hover:text-foreground" href="/tools/compress">
            Kompres
          </Link>
          <Link className="rounded-md px-3 py-1.5 text-muted hover:bg-neutral-100 hover:text-foreground" href="/tools/convert">
            Konversi
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line py-8 text-center text-xs text-muted">
      <p>File diproses di browser. Tidak diunggah ke server.</p>
      <p className="mt-1">PDFKilat · alat PDF gratis untuk mahasiswa</p>
    </footer>
  );
}
