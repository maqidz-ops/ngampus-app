import { readFileSync } from "node:fs";
import { createCanvas, DOMMatrix, ImageData, Path2D, type Canvas } from "@napi-rs/canvas";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { mergePdfs } from "../src/lib/pdf/merge";
import { convertToPdf } from "../src/lib/pdf/convert";
import { compressPdf, type CompressLevel } from "../src/lib/pdf/compress";

function installCanvas() {
  const promiseWithTry = Promise as unknown as {
    try?: (fn: (...args: unknown[]) => unknown, ...args: unknown[]) => Promise<unknown>;
  };
  if (typeof promiseWithTry.try !== "function") {
    promiseWithTry.try = (fn, ...args) =>
      new Promise((resolve, reject) => {
        try {
          resolve(fn(...args));
        } catch (error) {
          reject(error);
        }
      });
  }
  const bytes = Uint8Array.prototype as Uint8Array & { toHex?: () => string };
  if (typeof bytes.toHex !== "function") {
    bytes.toHex = function toHex(this: Uint8Array) {
      let hex = "";
      for (let i = 0; i < this.length; i++) hex += this[i].toString(16).padStart(2, "0");
      return hex;
    };
  }
  for (const ctor of [Map, WeakMap]) {
    const proto = ctor.prototype as Map<unknown, unknown> & {
      getOrInsert?: (key: unknown, value: unknown) => unknown;
      getOrInsertComputed?: (key: unknown, callback: (key: unknown) => unknown) => unknown;
    };
    if (typeof proto.getOrInsert !== "function") {
      proto.getOrInsert = function getOrInsert(this: Map<unknown, unknown>, key, value) {
        if (this.has(key as never)) return this.get(key as never);
        this.set(key as never, value as never);
        return value;
      };
    }
    if (typeof proto.getOrInsertComputed !== "function") {
      proto.getOrInsertComputed = function getOrInsertComputed(this: Map<unknown, unknown>, key, callback) {
        if (this.has(key as never)) return this.get(key as never);
        const value = callback(key);
        this.set(key as never, value as never);
        return value;
      };
    }
  }
  globalThis.DOMMatrix = DOMMatrix as unknown as typeof globalThis.DOMMatrix;
  globalThis.ImageData = ImageData as unknown as typeof globalThis.ImageData;
  globalThis.Path2D = Path2D as unknown as typeof globalThis.Path2D;
  const shim = {
    createElement(tag: string) {
      if (tag !== "canvas") throw new Error(`unsupported element ${tag}`);
      return createCanvas(1, 1);
    },
  };
  globalThis.document = shim as unknown as Document;
}

async function installPdfWorker() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "../node_modules/pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
  ).href;
}

function paintPhoto(canvas: Canvas, seed: number) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = "#f4efe6";
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 90; i++) {
    const x = ((i * 97 + seed * 13) % w);
    const y = ((i * 53 + seed * 29) % h);
    ctx.fillStyle = `hsl(${(i * 37 + seed) % 360} 65% ${35 + (i % 25)}%)`;
    ctx.beginPath();
    ctx.arc(x, y, 24 + (i % 80), 0, Math.PI * 2);
    ctx.fill();
  }
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 16) {
    d[i] = Math.min(255, d[i] + ((i + seed) % 31) - 15);
  }
  ctx.putImageData(img, 0, 0);
  ctx.fillStyle = "#1a1a1a";
  ctx.font = "bold 42px sans-serif";
  ctx.fillText(`PDFKilat halaman ${seed + 1}`, 48, 90);
}

function jpegBytes(width: number, height: number, seed: number, quality: number) {
  const canvas = createCanvas(width, height);
  paintPhoto(canvas, seed);
  return new Uint8Array(canvas.toBuffer("image/jpeg", quality));
}

async function makePhotoA4() {
  const doc = await PDFDocument.create();
  for (let i = 0; i < 4; i++) {
    const img = await doc.embedJpg(jpegBytes(2000, 2800, i, 85));
    const page = doc.addPage([595.28, 841.89]);
    page.drawImage(img, { x: 0, y: 0, width: 595.28, height: 841.89 });
  }
  return doc.save();
}

async function makeScanPoints() {
  const doc = await PDFDocument.create();
  for (let i = 0; i < 3; i++) {
    const bytes = jpegBytes(2200, 3000, i + 10, 80);
    const img = await doc.embedJpg(bytes);
    const page = doc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  return doc.save();
}

async function makeTextPdf() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const line =
    "Bab ini membahas metode penelitian, populasi, sampel, dan teknik analisis data skripsi. ";
  for (let p = 0; p < 12; p++) {
    const page = doc.addPage([595.28, 841.89]);
    let y = 800;
    for (let n = 0; n < 40; n++) {
      page.drawText(`${line}Halaman ${p + 1} baris ${n + 1}.`.slice(0, 95), {
        x: 48,
        y,
        size: 11,
        font,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= 18;
    }
  }
  return doc.save();
}

async function makeRotatedPdf() {
  const doc = await PDFDocument.create();
  const img = await doc.embedJpg(jpegBytes(1600, 900, 3, 80));
  const page = doc.addPage([595.28, 841.89]);
  page.setRotation(degrees(90));
  page.drawImage(img, { x: 40, y: 40, width: 500, height: 280 });
  return doc.save();
}

function asFile(bytes: Uint8Array, name: string) {
  const copy = Uint8Array.from(bytes);
  return new File([copy], name, { type: "application/pdf" });
}

async function visualBoxes(bytes: Uint8Array) {
  const doc = await PDFDocument.load(bytes);
  const boxes = [];
  for (let i = 0; i < doc.getPageCount(); i++) {
    const page = doc.getPage(i);
    const size = page.getSize();
    const angle = ((page.getRotation().angle % 360) + 360) % 360;
    const swapped = angle === 90 || angle === 270;
    boxes.push({
      width: swapped ? size.height : size.width,
      height: swapped ? size.width : size.height,
    });
  }
  return boxes;
}

function close(a: number, b: number) {
  return Math.abs(a - b) < 1.5;
}

async function runLevel(bytes: Uint8Array, name: string, level: CompressLevel) {
  const out = await compressPdf(asFile(bytes, name), level);
  const src = await visualBoxes(bytes);
  const dst = await visualBoxes(out);
  if (dst.length !== src.length) {
    throw new Error(`${name} ${level} page count ${dst.length} != ${src.length}`);
  }
  for (let i = 0; i < src.length; i++) {
    if (!close(src[i].width, dst[i].width) || !close(src[i].height, dst[i].height)) {
      throw new Error(
        `${name} ${level} page ${i + 1} size ${dst[i].width}x${dst[i].height} != ${src[i].width}x${src[i].height}`
      );
    }
  }
  if (out.byteLength > bytes.byteLength) {
    throw new Error(`${name} ${level} grew ${bytes.byteLength} -> ${out.byteLength}`);
  }
  const doc = await PDFDocument.load(out);
  if (doc.getPageCount() !== src.length) throw new Error(`${name} ${level} unreadable`);
  return out.byteLength;
}

async function main() {
  installCanvas();
  await installPdfWorker();

  const a = new File([readFileSync("public/fixtures/a.pdf")], "a.pdf", {
    type: "application/pdf",
  });
  const b = new File([readFileSync("public/fixtures/b.pdf")], "b.pdf", {
    type: "application/pdf",
  });
  const merged = await mergePdfs([a, b]);
  const mergedDoc = await PDFDocument.load(merged);
  if (mergedDoc.getPageCount() !== 2) throw new Error("merge page count");

  const txt = new File(["Judul skripsi\nBab 1 pendahuluan."], "notes.txt", {
    type: "text/plain",
  });
  const converted = await convertToPdf([txt, a]);
  const convDoc = await PDFDocument.load(converted);
  if (convDoc.getPageCount() < 2) throw new Error("convert pages " + convDoc.getPageCount());

  const photo = await makePhotoA4();
  const scan = await makeScanPoints();
  const text = await makeTextPdf();
  const rotated = await makeRotatedPdf();
  const fixture = new Uint8Array(readFileSync("public/fixtures/a.pdf"));

  const cases = [
    { name: "photo-a4", bytes: photo, mediumMax: 0.55, strongMax: 0.32 },
    { name: "scan-points", bytes: scan, mediumMax: 0.55, strongMax: 0.32 },
    { name: "text", bytes: text, mediumMax: 1, strongMax: 1 },
    { name: "rotated", bytes: rotated, mediumMax: 0.6, strongMax: 0.4 },
    { name: "fixture-a", bytes: fixture, mediumMax: 1, strongMax: 1 },
  ];

  const report: Record<string, unknown> = {
    mergePages: mergedDoc.getPageCount(),
    mergeBytes: merged.byteLength,
    convertPages: convDoc.getPageCount(),
  };

  for (const item of cases) {
    const light = await runLevel(item.bytes, item.name, "light");
    const medium = await runLevel(item.bytes, item.name, "medium");
    const strong = await runLevel(item.bytes, item.name, "strong");
    const mediumRatio = medium / item.bytes.byteLength;
    const strongRatio = strong / item.bytes.byteLength;
    if (mediumRatio > item.mediumMax) {
      throw new Error(`${item.name} medium ratio ${mediumRatio.toFixed(3)} > ${item.mediumMax}`);
    }
    if (strongRatio > item.strongMax) {
      throw new Error(`${item.name} strong ratio ${strongRatio.toFixed(3)} > ${item.strongMax}`);
    }
    if (item.mediumMax < 1 && strong > medium) {
      throw new Error(`${item.name} strong ${strong} is not smaller than medium ${medium}`);
    }
    report[item.name] = {
      original: item.bytes.byteLength,
      light,
      medium,
      strong,
      mediumRatio: Number(mediumRatio.toFixed(3)),
      strongRatio: Number(strongRatio.toFixed(3)),
      pages: (await PDFDocument.load(item.bytes)).getPageCount(),
    };
  }

  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
