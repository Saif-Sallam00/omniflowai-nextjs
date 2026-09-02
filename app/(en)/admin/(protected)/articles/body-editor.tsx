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
    <div className="space-y-2">
      <label htmlFor="body-textarea" className="text-sm font-medium text-gray-900">
        Body (Markdown)
      </label>
      <div className="flex items-center gap-2">
        <label
          htmlFor="body-insert-image-input"
          className="cursor-pointer rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {uploading ? "Uploading…" : "Insert image"}
        </label>
        <input
          id="body-insert-image-input"
          type="file"
          accept="image/*"
          onChange={handleInsertImage}
          disabled={uploading}
          className="sr-only"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <textarea
        id="body-textarea"
        name="body"
        rows={16}
        ref={textareaRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </div>
  );
}
