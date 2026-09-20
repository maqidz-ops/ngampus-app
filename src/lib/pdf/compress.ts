import { PDFDocument } from "pdf-lib";

export type CompressLevel = "light" | "medium" | "strong";

const PRESETS: Record<
  CompressLevel,
  { scale: number; quality: number; label: string }
> = {
  light: { scale: 1.6, quality: 0.82, label: "Ringan" },
  medium: { scale: 1.25, quality: 0.62, label: "Sedang" },
  strong: { scale: 1.0, quality: 0.42, label: "Kuat" },
};

export const COMPRESS_PRESETS = PRESETS;

async function canvasToJpeg(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Uint8Array> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Gagal encode JPEG."))),
      "image/jpeg",
      quality
    );
  });
  return new Uint8Array(await blob.arrayBuffer());
}

export async function compressPdf(
  file: File,
  level: CompressLevel,
  onProgress?: (done: number, total: number) => void
): Promise<Uint8Array> {
  const preset = PRESETS[level];
  const data = new Uint8Array(await file.arrayBuffer());

  if (level === "light") {
    const src = await PDFDocument.load(data, { ignoreEncryption: true });
    const out = await PDFDocument.create();
    out.setTitle(file.name.replace(/\.pdf$/i, "") + " (kompres)");
    out.setProducer("PDFKilat");
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
    onProgress?.(1, 1);
    return out.save({ useObjectStreams: true });
  }

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const loading = pdfjs.getDocument({ data });
  const pdf = await loading.promise;
  const out = await PDFDocument.create();
  out.setTitle(file.name.replace(/\.pdf$/i, "") + " (kompres)");
  out.setProducer("PDFKilat");

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: preset.scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas tidak tersedia di browser ini.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport, canvas: null }).promise;
    const jpeg = await canvasToJpeg(canvas, preset.quality);
    const img = await out.embedJpg(jpeg);
    const p = out.addPage([img.width, img.height]);
    p.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    canvas.width = 0;
    canvas.height = 0;
    onProgress?.(i, pdf.numPages);
  }

  return out.save({ useObjectStreams: true });
}
