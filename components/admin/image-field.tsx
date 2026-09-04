"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { textPrimary, textMuted, dangerText, border, borderStrong, hoverBg, errorTextClass } from "./palette";

type UploadState = "idle" | "uploading" | "error";

/**
 * Single reusable upload field for every admin image (article cover, project
 * cover/logo/media). Replaces four near-identical copies of the same
 * upload/preview/remove logic that only differed by label text and the
 * hidden input's `name`.
 */
export function AdminImageField({
  name,
  label,
  helperText,
  required,
  initialValue,
}: {
  name: string;
  label: string;
  helperText?: string;
  required?: boolean;
  initialValue?: string | null;
}) {
  const [url, setUrl] = useState(initialValue ?? "");
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const inputId = `image-field-${name}`;

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setState("uploading");
    setError(null);

    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/image", { method: "POST", body });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: "Upload failed" }));
        throw new Error(data.message || "Upload failed");
      }
      const data: { id: string; url: string } = await res.json();
      setUrl(data.url);
      setState("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setState("error");
    }
  }

  function handleRemove() {
    setUrl("");
    setError(null);
    setState("idle");
  }

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className={`text-sm font-medium ${textPrimary}`}>
        {label} {required ? <span className={dangerText}>*</span> : <span className={`font-normal ${textMuted}`}>(optional)</span>}
      </label>
      {helperText && <p className={`text-xs ${textMuted}`}>{helperText}</p>}

      <div className="flex items-center gap-3">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote, user-uploaded URLs; next/image would require configuring every upload host
          <img src={url} alt="" className={`h-20 w-20 rounded-md border ${border} object-cover`} />
        ) : (
          <div
            className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-dashed ${borderStrong} ${textMuted}`}
          >
            <ImageIcon className="h-6 w-6" aria-hidden />
          </div>
        )}
        <div className="flex flex-col items-start gap-1.5">
          <label
            htmlFor={inputId}
            className={`inline-flex w-fit cursor-pointer items-center rounded-md border ${border} px-3 py-1.5 text-sm font-medium ${textMuted} ${hoverBg}`}
          >
            {state === "uploading" ? "Uploading…" : url ? "Replace" : "Upload"}
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            onChange={handleChange}
            disabled={state === "uploading"}
            className="sr-only"
          />
          {url && (
            <button type="button" onClick={handleRemove} className={`w-fit text-xs ${textMuted} underline`}>
              Remove
            </button>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className={errorTextClass}>
          {error}
        </p>
      )}
      <input type="hidden" name={name} value={url} />
    </div>
  );
}
