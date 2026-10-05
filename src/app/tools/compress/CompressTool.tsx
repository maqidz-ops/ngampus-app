"use client";

import { useState } from "react";
import { DropZone } from "@/components/DropZone";
import { downloadBytes, formatBytes, stampName } from "@/lib/bytes";
import { compressPdf } from "@/lib/pdf/compress";

export function CompressTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ bytes: Uint8Array; name: string; before: number } | null>(
    null
  );

  async function run() {
    const file = files[0];
    if (!file) return;
    setError(null);
    setResult(null);
    setBusy(true);
    setProgress("Memulai…");
    try {
      const bytes = await compressPdf(file, (done, total) => {
        setProgress(`Mengompres… ${Math.round((done / total) * 100)}%`);
      });
      const name = stampName(file.name, "kompres");
      setResult({ bytes, name, before: file.size });
      downloadBytes(bytes, name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal kompres PDF.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  const saved =
    result && result.before > 0
      ? Math.round((1 - result.bytes.byteLength / result.before) * 100)
      : null;

  return (
    <div>
      <DropZone
        accept="application/pdf,.pdf"
        multiple={false}
        files={files}
        onChange={setFiles}
        hint="Satu PDF. Kompres otomatis dengan target ukuran berkurang 35–50%. Hasil bergantung pada isi file; teks dapat menjadi gambar."
      />
      <button
        type="button"
        disabled={busy || files.length !== 1}
        onClick={run}
        className="mt-5 w-full rounded-xl bg-foreground py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? progress ?? "Mengompres…" : "Kompres PDF"}
      </button>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {result && (
        <p className="mt-3 text-sm text-accent">
          {formatBytes(result.before)} → {formatBytes(result.bytes.byteLength)}
          {saved === 0 ? " (ukuran sudah optimal)" : saved !== null ? ` (${saved}% lebih kecil)` : ""}.{" "}
          <button type="button" className="underline" onClick={() => downloadBytes(result.bytes, result.name)}>
            Unduh lagi
          </button>
        </p>
      )}
    </div>
  );
}
