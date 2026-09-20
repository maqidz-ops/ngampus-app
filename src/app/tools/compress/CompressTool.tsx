"use client";

import { useState } from "react";
import { DropZone } from "@/components/DropZone";
import { downloadBytes, formatBytes, stampName } from "@/lib/bytes";
import { COMPRESS_PRESETS, compressPdf, type CompressLevel } from "@/lib/pdf/compress";

export function CompressTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [level, setLevel] = useState<CompressLevel>("medium");
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
      const bytes = await compressPdf(file, level, (done, total) => {
        setProgress(`Halaman ${done} / ${total}`);
      });
      const name = stampName(file.name, `kompres-${level}`);
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
        hint="Satu PDF. Mode sedang/kuat meraster halaman (teks jadi gambar)."
      />
      <fieldset className="mt-5">
        <legend className="text-sm font-medium">Tingkat kompresi</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(Object.keys(COMPRESS_PRESETS) as CompressLevel[]).map((key) => (
            <label
              key={key}
              className={`cursor-pointer rounded-xl border px-3 py-2 text-center text-sm ${
                level === key ? "border-foreground bg-white" : "border-line bg-white text-muted"
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                name="level"
                checked={level === key}
                onChange={() => setLevel(key)}
              />
              <span className="block font-medium text-foreground">
                {COMPRESS_PRESETS[key].label}
              </span>
              <span className="text-xs">
                {key === "light" ? "tanpa raster" : `JPEG ${Math.round(COMPRESS_PRESETS[key].quality * 100)}%`}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
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
          {saved !== null ? ` (${saved}% ${saved >= 0 ? "lebih kecil" : "lebih besar"})` : ""}.{" "}
          <button type="button" className="underline" onClick={() => downloadBytes(result.bytes, result.name)}>
            Unduh lagi
          </button>
        </p>
      )}
    </div>
  );
}
