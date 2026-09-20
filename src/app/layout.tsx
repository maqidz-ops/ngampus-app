import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PDFKilat — Gabung, kompres, konversi PDF",
    template: "%s · PDFKilat",
  },
  description:
    "Alat PDF gratis di browser: gabung PDF, kompres PDF, dan ubah file ke PDF. File tidak pernah keluar dari perangkatmu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
