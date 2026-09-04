"use client";

import { useRef, useState } from "react";
import { Bold, Italic, Heading2, Heading3, Link2, ImageIcon } from "lucide-react";
import { ArticleMarkdown } from "@/components/article-markdown";
import { labelClass, helpTextClass, errorTextClass, border, textMuted, hoverBg } from "@/components/admin/palette";

type Mode = "write" | "preview";

const TOOLBAR_ITEMS: { icon: typeof Bold; label: string; wrap?: [string, string]; linePrefix?: string }[] = [
  { icon: Bold, label: "Bold", wrap: ["**", "**"] },
  { icon: Italic, label: "Italic", wrap: ["_", "_"] },
  { icon: Heading2, label: "Heading 2", linePrefix: "## " },
  { icon: Heading3, label: "Heading 3", linePrefix: "### " },
  { icon: Link2, label: "Link", wrap: ["[", "](https://)"] },
];

export function BodyEditor({ initialValue }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue ?? "");
  const [mode, setMode] = useState<Mode>("write");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function applyToolbarItem(item: (typeof TOOLBAR_ITEMS)[number]) {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const selected = value.slice(start, end);

    let next: string;
    let cursorAt: number;
    if (item.wrap) {
      const [before, after] = item.wrap;
      next = value.slice(0, start) + before + selected + after + value.slice(end);
      cursorAt = start + before.length + selected.length;
    } else if (item.linePrefix) {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      next = value.slice(0, lineStart) + item.linePrefix + value.slice(lineStart);
      cursorAt = start + item.linePrefix.length;
    } else {
      return;
    }
    setValue(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(cursorAt, cursorAt);
    });
  }

  async function handleInsertImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="body-textarea" className={labelClass}>
          Body (Markdown)
        </label>
        <div className={`inline-flex rounded-md border ${border} p-0.5 text-sm`}>
          <button
            type="button"
            onClick={() => setMode("write")}
            aria-pressed={mode === "write"}
            className={`rounded px-2.5 py-1 ${mode === "write" ? "bg-admin-accent-muted text-admin-accent-muted-text" : textMuted}`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            aria-pressed={mode === "preview"}
            className={`rounded px-2.5 py-1 ${mode === "preview" ? "bg-admin-accent-muted text-admin-accent-muted-text" : textMuted}`}
          >
            Preview
          </button>
        </div>
      </div>

      {mode === "write" && (
        <div className={`flex flex-wrap items-center gap-1 rounded-md border ${border} p-1`}>
          {TOOLBAR_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => applyToolbarItem(item)}
              aria-label={item.label}
              title={item.label}
              className={`inline-flex h-7 w-7 items-center justify-center rounded ${textMuted} ${hoverBg} hover:text-admin-text-primary`}
            >
              <item.icon className="h-3.5 w-3.5" aria-hidden />
            </button>
          ))}
          <span className={`mx-1 h-4 w-px ${border} border-l`} aria-hidden />
          <label
            htmlFor="body-insert-image-input"
            title="Insert image"
            className={`inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded ${textMuted} ${hoverBg} hover:text-admin-text-primary`}
          >
            <ImageIcon className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only">{uploading ? "Uploading…" : "Insert image"}</span>
          </label>
          <input
            id="body-insert-image-input"
            type="file"
            accept="image/*"
            onChange={handleInsertImage}
            disabled={uploading}
            className="sr-only"
          />
          {uploading && <span className={`text-xs ${textMuted}`}>Uploading…</span>}
        </div>
      )}

      {error && (
        <p role="alert" className={errorTextClass}>
          {error}
        </p>
      )}

      {mode === "write" ? (
        <textarea
          id="body-textarea"
          name="body"
          rows={18}
          ref={textareaRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className={`w-full rounded-md border ${border} bg-admin-input px-3 py-2 font-mono text-sm text-admin-text-primary focus:border-admin-accent focus:outline-none focus:ring-1 focus:ring-admin-focus-ring`}
        />
      ) : (
        <div className={`rounded-md border ${border} bg-admin-input px-4 py-3`}>
          {value.trim() ? (
            <ArticleMarkdown body={value} />
          ) : (
            <p className={helpTextClass}>Nothing to preview yet.</p>
          )}
          {/* Preview mode still needs to submit the body — the textarea above is unmounted, so mirror the value in a hidden field. */}
          <input type="hidden" name="body" value={value} />
        </div>
      )}
    </div>
  );
}
