import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

async function onePage(title) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([400, 300]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText(title, { x: 40, y: 150, size: 24, font, color: rgb(0, 0, 0) });
  return doc.save();
}

async function merge(buffers) {
  const out = await PDFDocument.create();
  for (const bytes of buffers) {
    const src = await PDFDocument.load(bytes);
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  return out.save({ useObjectStreams: true });
}

const dir = join(process.cwd(), ".tmp-verify");
mkdirSync(dir, { recursive: true });
const a = await onePage("Hello A");
const b = await onePage("Hello B");
const merged = await merge([a, b]);
const mergedDoc = await PDFDocument.load(merged);
if (mergedDoc.getPageCount() !== 2) {
  throw new Error(`expected 2 pages, got ${mergedDoc.getPageCount()}`);
}
writeFileSync(join(dir, "a.pdf"), a);
writeFileSync(join(dir, "b.pdf"), b);
writeFileSync(join(dir, "merged.pdf"), merged);
console.log("ok pages", mergedDoc.getPageCount(), "bytes", merged.length);
