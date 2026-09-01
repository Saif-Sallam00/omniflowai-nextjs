"use client";

import { useState, type KeyboardEvent } from "react";

export function ChipInput({
  name,
  label,
  initialValue,
}: {
  name: string;
  label: string;
  initialValue?: string[];
}) {
  const [value, setValue] = useState<string[]>(initialValue ?? []);
  const [draft, setDraft] = useState("");

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag) return;
    setValue((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
    setDraft("");
  }

  function removeTag(tag: string) {
    setValue((prev) => prev.filter((t) => t !== tag));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div>
      <label htmlFor={`chip-input-${name}`}>{label}</label>
      <div>
        {value.map((tag) => (
          <span key={tag}>
            {tag}
            <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        id={`chip-input-${name}`}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(draft)}
      />
      <input type="hidden" name={`${name}Json`} value={JSON.stringify(value)} />
    </div>
  );
}
