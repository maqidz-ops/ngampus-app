import {
  PDFDocument,
  StandardFonts,
  rgb,
  PageSizes,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";

const IMAGE_EXT = new Set([
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "bmp",
  "svg",
]);
const TEXT_EXT = new Set(["txt", "md", "csv", "json", "html", "htm", "log"]);
const DOCX_EXT = new Set(["docx"]);
const PDF_EXT = new Set(["pdf"]);

export function extOf(name: string) {
  return (name.split(".").pop() || "").toLowerCase();
}

export function canConvert(file: File) {
  const ext = extOf(file.name);
  const mime = file.type.toLowerCase();
  if (PDF_EXT.has(ext) || mime === "application/pdf") return true;
  if (IMAGE_EXT.has(ext) || mime.startsWith("image/")) return true;
  if (TEXT_EXT.has(ext) || mime.startsWith("text/")) return true;
  if (DOCX_EXT.has(ext) || mime.includes("wordprocessingml")) return true;
  return false;
}

export function convertHint(file: File) {
  const ext = extOf(file.name);
  if (["xlsx", "xls", "pptx", "ppt", "doc"].includes(ext)) {
    return `${file.name}: format Office lama/spreadsheet belum diproses di browser. Ekspor ke PDF atau simpan sebagai gambar/DOCX.`;
  }
  if (!canConvert(file)) {
    return `${file.name}: tipe file belum didukung.`;
  }
  return null;
}

function winAnsi(input: string) {
  return input.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, (ch) => {
    const map: Record<string, string> = {
      "—": "-",
      "–": "-",
      "“": '"',
      "”": '"',
      "‘": "'",
      "’": "'",
      "…": "...",
      "•": "*",
      é: "e",
      É: "E",
      "à": "a",
      "á": "a",
      "í": "i",
      "ó": "o",
      "ú": "u",
      "ñ": "n",
      "ü": "u",
    };
    return map[ch] ?? "?";
  });
}

function wrapLines(text: string, font: PDFFont, size: number, maxWidth: number) {
  const lines: string[] = [];
  for (const raw of winAnsi(text).split(/\r?\n/)) {
    if (!raw) {
      lines.push("");
      continue;
    }
    const words = raw.split(/\s+/);
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) <= maxWidth) {
        line = test;
        continue;
      }
      if (line) lines.push(line);
      if (font.widthOfTextAtSize(word, size) <= maxWidth) {
        line = word;
      } else {
        let chunk = "";
        for (const ch of word) {
          const next = chunk + ch;
          if (font.widthOfTextAtSize(next, size) > maxWidth) {
            if (chunk) lines.push(chunk);
            chunk = ch;
          } else {
            chunk = next;
          }
        }
        line = chunk;
      }
    }
    lines.push(line);
  }
  return lines;
}

function drawTextPages(doc: PDFDocument, page: PDFPage, font: PDFFont, lines: string[]) {
  const margin = 50;
  const size = 11;
  const leading = 16;
  let y = page.getHeight() - margin;
  const maxWidth = page.getWidth() - margin * 2;
  let current = page;

  for (const line of lines) {
    if (y < margin + leading) {
      current = doc.addPage(PageSizes.A4);
      y = current.getHeight() - margin;
    }
    current.drawText(line, {
      x: margin,
      y,
      size,
      font,
      color: rgb(0.09, 0.09, 0.09),
      maxWidth,
    });
    y -= leading;
  }
}

async function fileToImageBytes(file: File): Promise<{ kind: "jpg" | "png"; bytes: Uint8Array }> {
  const ext = extOf(file.name);
  const mime = file.type.toLowerCase();
  if (ext === "jpg" || ext === "jpeg" || mime === "image/jpeg") {
    return { kind: "jpg", bytes: new Uint8Array(await file.arrayBuffer()) };
  }
  if (ext === "png" || mime === "image/png") {
    return { kind: "png", bytes: new Uint8Array(await file.arrayBuffer()) };
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error(`Gagal membaca gambar ${file.name}`));
      el.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, img.naturalWidth || img.width);
    canvas.height = Math.max(1, img.naturalHeight || img.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas tidak tersedia.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Gagal encode gambar."))),
        "image/jpeg",
        0.92
      );
    });
    return { kind: "jpg", bytes: new Uint8Array(await blob.arrayBuffer()) };
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function embedImageOnNewPage(doc: PDFDocument, file: File) {
  const { kind, bytes } = await fileToImageBytes(file);
  const img = kind === "jpg" ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
  const [maxW, maxH] = PageSizes.A4;
  const landscape = img.width > img.height;
  const pageW = landscape ? maxH : maxW;
  const pageH = landscape ? maxW : maxH;
  const page = doc.addPage([pageW, pageH]);
  const pad = 24;
  const scale = Math.min((pageW - pad * 2) / img.width, (pageH - pad * 2) / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  page.drawImage(img, {
    x: (pageW - w) / 2,
    y: (pageH - h) / 2,
    width: w,
    height: h,
  });
}

async function addTextFile(doc: PDFDocument, file: File, font: PDFFont) {
  const raw = await file.text();
  const header = `${file.name}`;
  const page = doc.addPage(PageSizes.A4);
  const lines = wrapLines(`${header}\n\n${raw}`, font, 11, page.getWidth() - 100);
  drawTextPages(doc, page, font, lines);
}

async function addDocx(doc: PDFDocument, file: File, font: PDFFont) {
  const mammoth = await import("mammoth/mammoth.browser");
  const { value } = await mammoth.extractRawText({
    arrayBuffer: await file.arrayBuffer(),
  });
  const page = doc.addPage(PageSizes.A4);
  const lines = wrapLines(`${file.name}\n\n${value || "(dokumen kosong)"}`, font, 11, page.getWidth() - 100);
  drawTextPages(doc, page, font, lines);
}

async function addPdf(doc: PDFDocument, file: File) {
  const src = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()), {
    ignoreEncryption: true,
  });
  const copied = await doc.copyPages(src, src.getPageIndices());
  copied.forEach((p) => doc.addPage(p));
}

export async function convertToPdf(
  files: File[],
  onProgress?: (done: number, total: number) => void
): Promise<Uint8Array> {
  if (!files.length) throw new Error("Tidak ada file untuk dikonversi.");

  const blocked = files.map(convertHint).filter(Boolean);
  if (blocked.length) {
    throw new Error(blocked.join(" "));
  }

  const out = await PDFDocument.create();
  out.setTitle("Konversi PDF");
  out.setProducer("PDFKilat");
  const font = await out.embedFont(StandardFonts.Helvetica);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = extOf(file.name);
    const mime = file.type.toLowerCase();
    if (PDF_EXT.has(ext) || mime === "application/pdf") {
      await addPdf(out, file);
    } else if (DOCX_EXT.has(ext) || mime.includes("wordprocessingml")) {
      await addDocx(out, file, font);
    } else if (TEXT_EXT.has(ext) || mime.startsWith("text/")) {
      await addTextFile(out, file, font);
    } else {
      await embedImageOnNewPage(out, file);
    }
    onProgress?.(i + 1, files.length);
  }

  if (out.getPageCount() === 0) {
    throw new Error("Tidak ada halaman yang berhasil dibuat.");
  }

  return out.save({ useObjectStreams: true });
}
