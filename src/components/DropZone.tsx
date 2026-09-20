"use client";

import { useCallback, useRef, useState } from "react";
import { MAX_FILE_BYTES, MAX_FILES, formatBytes } from "@/lib/bytes";

type Props = {
  accept: string;
  multiple?: boolean;
  files: File[];
  onChange: (files: File[]) => void;
  hint?: string;
};

function sameFile(a: File, b: File) {
  return a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
}

export function DropZone({ accept, multiple = true, files, onChange, hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const next = multiple ? [...files] : [];
      const problems: string[] = [];
      for (const file of Array.from(incoming)) {
        if (file.size > MAX_FILE_BYTES) {
          problems.push(`${file.name} lebih dari 40 MB.`);
          continue;
        }
        if (next.some((f) => sameFile(f, file))) continue;
        if (next.length >= MAX_FILES) {
          problems.push(`Maksimal ${MAX_FILES} file.`);
          break;
        }
        next.push(file);
      }
      setError(problems[0] ?? null);
      onChange(multiple ? next : next.slice(-1));
    },
    [files, multiple, onChange]
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        }}
        className={`w-full rounded-2xl border border-dashed px-6 py-12 text-center transition ${
          drag
            ? "border-accent bg-accent-soft"
            : "border-neutral-300 bg-white hover:border-neutral-400"
        }`}
      >
        <p className="text-base font-medium">Tarik file ke sini, atau klik untuk pilih</p>
        <p className="mt-1 text-sm text-muted">{hint ?? "Maks 40 MB per file. Diproses di perangkatmu."}</p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${file.lastModified}-${i}`}
              className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-neutral-100 text-[10px] font-semibold uppercase text-muted">
                {file.name.split(".").pop()?.slice(0, 4)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted">{formatBytes(file.size)}</p>
              </div>
              {multiple && files.length > 1 && (
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="rounded-md px-2 py-1 text-xs text-muted hover:bg-neutral-100"
                    onClick={() => {
                      if (i === 0) return;
                      const next = [...files];
                      [next[i - 1], next[i]] = [next[i], next[i - 1]];
                      onChange(next);
                    }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="rounded-md px-2 py-1 text-xs text-muted hover:bg-neutral-100"
                    onClick={() => {
                      if (i === files.length - 1) return;
                      const next = [...files];
                      [next[i + 1], next[i]] = [next[i], next[i + 1]];
                      onChange(next);
                    }}
                  >
                    ↓
                  </button>
                </div>
              )}
              <button
                type="button"
                className="rounded-md px-2 py-1 text-xs text-muted hover:bg-red-50 hover:text-red-600"
                onClick={() => onChange(files.filter((_, idx) => idx !== i))}
              >
                Hapus
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
