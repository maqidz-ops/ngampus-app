import { readFileSync } from "node:fs";
import { PDFDocument } from "pdf-lib";
import { mergePdfs } from "../src/lib/pdf/merge.ts";
import { convertToPdf } from "../src/lib/pdf/convert.ts";
import { compressPdf } from "../src/lib/pdf/compress.ts";

async function main() {
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

  const light = await compressPdf(a, "light");
  const lightDoc = await PDFDocument.load(light);
  if (lightDoc.getPageCount() !== 1) throw new Error("compress pages");

  console.log(
    JSON.stringify(
      {
        mergePages: mergedDoc.getPageCount(),
        mergeBytes: merged.byteLength,
        convertPages: convDoc.getPageCount(),
        convertBytes: converted.byteLength,
        compressLightBytes: light.byteLength,
      },
      null,
      2
    )
  );
}

main();
