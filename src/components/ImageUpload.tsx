"use client";

import { useRef, useState } from "react";
import { UploadIcon } from "./icons";

const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4 MB (laut Design-Vorgabe)
const MAX_DIMENSION = 1280; // längste Kante nach Verkleinerung
const JPEG_QUALITY = 0.78;

/**
 * Liest eine Bilddatei ein und verkleinert sie per Canvas auf max. 1280 px
 * (längste Kante), Ausgabe als JPEG-Data-URL. So bleibt ein 4-MB-Foto bei
 * ~150–400 KB und passt sicher ins localStorage (~5 MB Quota).
 */
async function fileToScaledDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas nicht verfügbar");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

export function ImageUpload({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setError("Nur PNG oder JPG erlaubt.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("Datei ist größer als 4 MB.");
      return;
    }

    setBusy(true);
    try {
      onChange(await fileToScaledDataUrl(file));
    } catch {
      setError("Bild konnte nicht gelesen werden.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {value ? (
        <div>
          <div className="relative w-full overflow-hidden rounded-[14px] border border-hairline">
            {/* Data-URL-Vorschau — next/image bringt hier keinen Vorteil */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Projektbild-Vorschau"
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-[10px] border-[1.5px] border-[#E2E2E2] bg-white px-[14px] py-[7.5px] text-[13px] font-medium text-ink transition-colors hover:bg-canvas active:bg-canvas"
            >
              Bild ändern
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded-[10px] border-[1.5px] border-[#E2E2E2] bg-white px-[14px] py-[7.5px] text-[13px] font-medium text-ink-muted transition-colors hover:bg-canvas active:bg-canvas"
            >
              Entfernen
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-[#C9C9C9] bg-[#FBFBFB] px-4 py-7 transition-colors hover:border-brand hover:bg-canvas disabled:opacity-60"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-tint">
            <UploadIcon />
          </span>
          <span className="text-[14px] font-medium">
            {busy ? "Wird verarbeitet …" : "Bild hochladen"}
          </span>
          <span className="text-[12px] text-ink-faint">
            PNG oder JPG · max. 4 MB · 16:9 empfohlen
          </span>
        </button>
      )}

      {error && <p className="mt-2 text-[12px] font-medium text-danger">{error}</p>}
    </div>
  );
}
