"use client";

import { useRef, useState } from "react";

export function BodyEditor({ initialValue }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  async function handleInsertImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setUploading(true);
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

      const el = textareaRef.current;
      const at = el?.selectionStart ?? value.length;
      const snippet = `\n\n![](${data.url})\n\n`;
      setValue(value.slice(0, at) + snippet + value.slice(at));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label htmlFor="body-textarea">Body (Markdown)</label>
      <div>
        <label htmlFor="body-insert-image-input">
          {uploading ? "Uploading…" : "Insert image"}
        </label>
        <input
          id="body-insert-image-input"
          type="file"
          accept="image/*"
          onChange={handleInsertImage}
          disabled={uploading}
        />
      </div>
      {error && <p role="alert">{error}</p>}
      <textarea
        id="body-textarea"
        name="body"
        rows={16}
        ref={textareaRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </div>
  );
}
