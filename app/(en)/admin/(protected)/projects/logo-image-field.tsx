"use client";

import { useState } from "react";

type UploadState = "idle" | "uploading" | "error";

export function LogoImageField({ initialValue }: { initialValue?: string | null }) {
  const [url, setUrl] = useState(initialValue ?? "");
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
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

  return (
    <div>
      <label htmlFor="logo-image-input">Client logo (optional — the hero identity card image)</label>
      <input
        id="logo-image-input"
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={state === "uploading"}
      />
      {state === "uploading" && <p>Uploading…</p>}
      {error && <p role="alert">{error}</p>}
      {url && <img src={url} alt="" style={{ maxWidth: 200 }} />}
      <input type="hidden" name="logo" value={url} />
    </div>
  );
}
