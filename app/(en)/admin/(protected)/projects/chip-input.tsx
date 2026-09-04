"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { labelClass, helpTextClass, inputClass, accentSoftBg, accentSoftText } from "@/components/admin/palette";

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
  const inputId = `chip-input-${name}`;

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
    <div className="space-y-1">
      <label htmlFor={inputId} className={labelClass}>
        {label}
      </label>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 rounded-full ${accentSoftBg} ${accentSoftText} px-2 py-0.5 text-xs`}
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${tag}`}
                className="rounded-full hover:opacity-75"
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        id={inputId}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(draft)}
        className={inputClass}
      />
      <p className={helpTextClass}>Press Enter or comma to add.</p>
      <input type="hidden" name={`${name}Json`} value={JSON.stringify(value)} />
    </div>
  );
}
