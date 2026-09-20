"use client";

import { useState } from "react";
import { DropZone } from "@/components/DropZone";
import { downloadBytes, formatBytes, stampName } from "@/lib/bytes";
import { convertHint, convertToPdf } from "@/lib/pdf/convert";

export function ConvertTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ bytes: Uint8Array; name: string } | null>(null);

  async function run() {
    setError(null);
    setResult(null);
    const blocked = files.map(convertHint).filter(Boolean);
    if (blocked.length) {
      setError(blocked.join(" "));
      return;
    }
    setBusy(true);
    setProgress("Memulai…");
    try {
      const bytes = await convertToPdf(files, (done, total) => {
        setProgress(`File ${done} / ${total}`);
      });
      const name = stampName(files[0]?.name ?? "konversi", "pdf");
      setResult({ bytes, name });
      downloadBytes(bytes, name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal konversi ke PDF.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  return (
    <div>
      <DropZone
        accept="image/*,.png,.jpg,.jpeg,.webp,.gif,.bmp,.svg,.txt,.md,.csv,.json,.html,.htm,.docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        files={files}
        onChange={setFiles}
        hint="Gambar, TXT/MD/CSV/JSON/HTML, DOCX, atau PDF. Excel/PPT belum."
      />
      <button
        type="button"
        disabled={busy || files.length < 1}
        onClick={run}
        className="mt-5 w-full rounded-xl bg-foreground py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? progress ?? "Mengonversi…" : "Ubah ke PDF"}
      </button>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {result && (
        <p className="mt-3 text-sm text-accent">
          Selesai · {formatBytes(result.bytes.byteLength)}.{" "}
          <button type="button" className="underline" onClick={() => downloadBytes(result.bytes, result.name)}>
            Unduh lagi
          </button>
        </p>
      )}
    </div>
  );
}
