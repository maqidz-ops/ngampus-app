"use client";

import { useState } from "react";
import { DropZone } from "@/components/DropZone";
import { downloadBytes, formatBytes, stampName } from "@/lib/bytes";
import { mergePdfs } from "@/lib/pdf/merge";

export function MergeTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ bytes: Uint8Array; name: string } | null>(null);

  async function run() {
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const bytes = await mergePdfs(files);
      const name = stampName(files[0]?.name ?? "gabungan", "merged");
      setResult({ bytes, name });
      downloadBytes(bytes, name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menggabungkan PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <DropZone
        accept="application/pdf,.pdf"
        files={files}
        onChange={setFiles}
        hint="PDF saja. Urutan list = urutan halaman. Maks 40 MB / file."
      />
      <button
        type="button"
        disabled={busy || files.length < 2}
        onClick={run}
        className="mt-5 w-full rounded-xl bg-foreground py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "Menggabungkan…" : "Gabung PDF"}
      </button>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {result && (
        <p className="mt-3 text-sm text-accent">
          Selesai · {formatBytes(result.bytes.byteLength)}. Kalau unduhan tidak muncul,{" "}
          <button
            type="button"
            className="underline"
            onClick={() => downloadBytes(result.bytes, result.name)}
          >
            unduh lagi
          </button>
          .
        </p>
      )}
    </div>
  );
}
