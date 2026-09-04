"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@/components/admin/button";
import { EmptyState } from "@/components/admin/empty-state";
import { inputClass, labelClass, errorTextClass, textPrimary, border } from "@/components/admin/palette";

export type ResultSlot = {
  value: string;
  labelEn: string;
  labelAr: string;
};

const EMPTY_SLOT: ResultSlot = { value: "", labelEn: "", labelAr: "" };

function fieldError(errors: Partial<Record<string, string[]>>, key: string): string | undefined {
  return errors[key]?.[0];
}

export function ResultsEditor({
  initialValue,
  fieldErrors = {},
}: {
  initialValue?: ResultSlot[];
  fieldErrors?: Partial<Record<string, string[]>>;
}) {
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className={`text-base font-semibold ${textPrimary}`}>Results</h3>
        <Button type="button" variant="secondary" onClick={addSlot}>
          + Add result
        </Button>
      </div>

      {slots.length === 0 ? (
        <EmptyState title="No results added yet." action={<Button type="button" variant="secondary" onClick={addSlot}>+ Add result</Button>} />
      ) : (
        <div className="space-y-3">
          {slots.map((slot, index) => (
            <div key={index} className={`grid gap-3 rounded-md border ${border} p-3 sm:grid-cols-[100px_1fr_1fr_auto] sm:items-start`}>
              <div>
                <label htmlFor={`result-value-${index}`} className={labelClass}>
                  Value
                </label>
                <input
                  id={`result-value-${index}`}
                  type="text"
                  placeholder="40%"
                  value={slot.value}
                  onChange={(e) => update(index, { value: e.target.value })}
                  className={`mt-1 ${inputClass}`}
                />
                {fieldError(fieldErrors, `results.${index}.value`) && (
                  <p className={`mt-1 ${errorTextClass}`}>{fieldError(fieldErrors, `results.${index}.value`)}</p>
                )}
              </div>
              <div>
                <label htmlFor={`result-label-en-${index}`} className={labelClass}>
                  Label (English)
                </label>
                <input
                  id={`result-label-en-${index}`}
                  type="text"
                  value={slot.labelEn}
                  onChange={(e) => update(index, { labelEn: e.target.value })}
                  className={`mt-1 ${inputClass}`}
                />
                {fieldError(fieldErrors, `results.${index}.labelEn`) && (
                  <p className={`mt-1 ${errorTextClass}`}>{fieldError(fieldErrors, `results.${index}.labelEn`)}</p>
                )}
              </div>
              <div>
                <label htmlFor={`result-label-ar-${index}`} className={labelClass}>
                  Label (Arabic)
                </label>
                <input
                  id={`result-label-ar-${index}`}
                  type="text"
                  dir="rtl"
                  value={slot.labelAr}
                  onChange={(e) => update(index, { labelAr: e.target.value })}
                  className={`mt-1 ${inputClass}`}
                />
                {fieldError(fieldErrors, `results.${index}.labelAr`) && (
                  <p className={`mt-1 ${errorTextClass}`}>{fieldError(fieldErrors, `results.${index}.labelAr`)}</p>
                )}
              </div>
              <div className="flex gap-1 sm:mt-6">
                <Button type="button" variant="secondary" onClick={() => moveSlot(index, -1)} disabled={index === 0} aria-label="Move up">
                  <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => moveSlot(index, 1)}
                  disabled={index === slots.length - 1}
                  aria-label="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                </Button>
                <Button type="button" variant="destructive" onClick={() => removeSlot(index)} aria-label="Remove result">
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <input type="hidden" name="resultsJson" value={JSON.stringify(slots)} />
    </div>
  );
}
