"use client";

import { useState } from "react";
import { Button } from "@/components/admin/button";

export type ResultSlot = {
  value: string;
  labelEn: string;
  labelAr: string;
};

const EMPTY_SLOT: ResultSlot = { value: "", labelEn: "", labelAr: "" };

export function ResultsEditor({ initialValue }: { initialValue?: ResultSlot[] }) {
  const [slots, setSlots] = useState<ResultSlot[]>(initialValue ?? []);

  function update(index: number, patch: Partial<ResultSlot>) {
    setSlots((prev) => prev.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));
  }

  function addSlot() {
    setSlots((prev) => [...prev, { ...EMPTY_SLOT }]);
  }

  function removeSlot(index: number) {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  }

  function moveSlot(index: number, direction: -1 | 1) {
    setSlots((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  const inputClassName =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-gray-900">Results</h3>
      {slots.map((slot, index) => (
        <div key={index} className="space-y-3 rounded-md border border-gray-200 p-3">
          <div>
            <label htmlFor={`result-value-${index}`} className="text-sm font-medium text-gray-900">
              Value (shared, e.g. &quot;40%&quot;, &quot;3x&quot;)
            </label>
            <input
              id={`result-value-${index}`}
              type="text"
              value={slot.value}
              onChange={(e) => update(index, { value: e.target.value })}
              className={`mt-1 ${inputClassName}`}
            />
          </div>

          <div>
            <label htmlFor={`result-label-en-${index}`} className="text-sm font-medium text-gray-900">
              Label (English)
            </label>
            <input
              id={`result-label-en-${index}`}
              type="text"
              value={slot.labelEn}
              onChange={(e) => update(index, { labelEn: e.target.value })}
              className={`mt-1 ${inputClassName}`}
            />
          </div>

          <div>
            <label htmlFor={`result-label-ar-${index}`} className="text-sm font-medium text-gray-900">
              Label (Arabic)
            </label>
            <input
              id={`result-label-ar-${index}`}
              type="text"
              value={slot.labelAr}
              onChange={(e) => update(index, { labelAr: e.target.value })}
              className={`mt-1 ${inputClassName}`}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => moveSlot(index, -1)} disabled={index === 0}>
              Move up
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => moveSlot(index, 1)}
              disabled={index === slots.length - 1}
            >
              Move down
            </Button>
            <Button type="button" variant="destructive" onClick={() => removeSlot(index)}>
              Remove
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={addSlot}>
        Add result
      </Button>
      <input type="hidden" name="resultsJson" value={JSON.stringify(slots)} />
    </div>
  );
}
