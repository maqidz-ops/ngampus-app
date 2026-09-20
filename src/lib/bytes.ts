export const MAX_FILE_BYTES = 40 * 1024 * 1024;
export const MAX_FILES = 30;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function downloadBytes(bytes: Uint8Array, filename: string) {
  const copy = Uint8Array.from(bytes);
  const blob = new Blob([copy], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function stampName(base: string, suffix: string) {
  const clean = base.replace(/\.pdf$/i, "").replace(/[^\w.-]+/g, "_");
  return `${clean || "berkas"}_${suffix}.pdf`;
}
