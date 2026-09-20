import type { ReactNode } from "react";
import { Footer, Header } from "@/components/Header";
import { Faq, UpsellBanner } from "@/components/UpsellBanner";

export function ToolShell({
  kicker,
  title,
  description,
  children,
  faq,
}: {
  kicker: string;
  title: string;
  description: string;
  children: ReactNode;
  faq: { q: string; a: string }[];
}) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-xs font-medium uppercase tracking-wide text-accent">{kicker}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-muted">{description}</p>
        <div className="mt-8">{children}</div>
        <UpsellBanner />
        <Faq items={faq} />
      </main>
      <Footer />
    </div>
  );
}
