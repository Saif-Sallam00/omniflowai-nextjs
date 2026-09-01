"use client";

import { useState } from "react";

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

  return (
    <div>
      <h3>Results</h3>
      {slots.map((slot, index) => (
        <div key={index}>
          <label htmlFor={`result-value-${index}`}>Value (shared, e.g. &quot;40%&quot;, &quot;3x&quot;)</label>
          <input
            id={`result-value-${index}`}
            type="text"
            value={slot.value}
            onChange={(e) => update(index, { value: e.target.value })}
          />

          <label htmlFor={`result-label-en-${index}`}>Label (English)</label>
          <input
            id={`result-label-en-${index}`}
            type="text"
            value={slot.labelEn}
            onChange={(e) => update(index, { labelEn: e.target.value })}
          />

          <label htmlFor={`result-label-ar-${index}`}>Label (Arabic)</label>
          <input
            id={`result-label-ar-${index}`}
            type="text"
            value={slot.labelAr}
            onChange={(e) => update(index, { labelAr: e.target.value })}
          />

          <button type="button" onClick={() => moveSlot(index, -1)} disabled={index === 0}>
            Move up
          </button>
          <button type="button" onClick={() => moveSlot(index, 1)} disabled={index === slots.length - 1}>
            Move down
          </button>
          <button type="button" onClick={() => removeSlot(index)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={addSlot}>
        Add result
      </button>
      <input type="hidden" name="resultsJson" value={JSON.stringify(slots)} />
    </div>
  );
}
