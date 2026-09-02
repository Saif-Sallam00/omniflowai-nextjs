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
    <div className="space-y-2">
      <label htmlFor="logo-image-input" className="text-sm font-medium text-gray-900">
        Client logo (optional — the hero identity card image)
      </label>
      <input
        id="logo-image-input"
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={state === "uploading"}
        className="block text-sm text-gray-700"
      />
      {state === "uploading" && <p className="text-sm text-gray-500">Uploading…</p>}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {url && <img src={url} alt="" style={{ maxWidth: 200 }} className="rounded-md border border-gray-200" />}
      <input type="hidden" name="logo" value={url} />
    </div>
  );
}
