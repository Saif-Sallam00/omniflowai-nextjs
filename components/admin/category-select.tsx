"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { inputClass, textMuted } from "./palette";

/**
 * A controlled category combobox: pick from existing categories, or type a
 * new one and explicitly confirm "Create" — replacing free text + <datalist>,
 * which let a stray keystroke silently mint a near-duplicate category
 * ("SaaS" vs "Saas") with no confirmation. The DB still stores category as
 * plain text (no enum) — this only changes how the admin picks a value.
 */
export function CategorySelect({
  name,
  categories,
  initialValue,
}: {
  name: string;
  categories: string[];
  initialValue?: string;
}) {
  const [text, setText] = useState(initialValue ?? "");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputId = `category-select-${name}`;
  const listboxId = `${inputId}-listbox`;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const filtered = useMemo(() => {
    const q = text.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((category) => category.toLowerCase().includes(q));
  }, [text, categories]);

  const exactMatch = categories.some((category) => category.toLowerCase() === text.trim().toLowerCase());

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type="text"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          autoComplete="off"
          className={`${inputClass} pr-8`}
        />
        <ChevronDown
          className={`pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 ${textMuted}`}
          aria-hidden
        />
      </div>
      {open && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-admin-border bg-admin-surface-elevated py-1 shadow-admin-md"
        >
          {filtered.map((category) => (
            <button
              key={category}
              type="button"
              role="option"
              aria-selected={category === text}
              onClick={() => {
                setText(category);
                setOpen(false);
              }}
              className="block w-full px-3 py-1.5 text-left text-sm text-admin-text-secondary hover:bg-admin-hover hover:text-admin-text-primary"
            >
              {category}
            </button>
          ))}
          {filtered.length === 0 && <p className="px-3 py-2 text-sm text-admin-text-muted">No matching categories.</p>}
          {text.trim() !== "" && !exactMatch && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-1.5 border-t border-admin-border px-3 py-1.5 text-left text-sm text-admin-accent hover:bg-admin-hover"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Create &ldquo;{text.trim()}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
