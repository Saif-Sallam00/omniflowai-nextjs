"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from "lucide-react";
import { SYSTEM_CARD_ICONS } from "@/lib/db/schema";
import { Button } from "@/components/admin/button";
import {
  inputClass,
  labelClass,
  errorTextClass,
  textPrimary,
  textMuted,
  border,
  hoverBg,
} from "@/components/admin/palette";

export type SystemCardSlot = {
  icon: string;
  titleEn: string;
  descriptionEn: string;
  titleAr: string;
  descriptionAr: string;
};

const EMPTY_SLOT: SystemCardSlot = {
  icon: SYSTEM_CARD_ICONS[0],
  titleEn: "",
  descriptionEn: "",
  titleAr: "",
  descriptionAr: "",
};

const MAX_CARDS = 6;

function fieldError(errors: Partial<Record<string, string[]>>, key: string): string | undefined {
  return errors[key]?.[0];
}

export function SystemCardsEditor({
  initialValue,
  fieldErrors = {},
}: {
  initialValue?: SystemCardSlot[];
  fieldErrors?: Partial<Record<string, string[]>>;
}) {
  const [slots, setSlots] = useState<SystemCardSlot[]>(
    initialValue && initialValue.length > 0 ? initialValue : [{ ...EMPTY_SLOT }],
  );
  const [expanded, setExpanded] = useState<number | null>(0);

  function update(index: number, patch: Partial<SystemCardSlot>) {
    setSlots((prev) => prev.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));
  }

  function addSlot() {
    setSlots((prev) => (prev.length >= MAX_CARDS ? prev : [...prev, { ...EMPTY_SLOT }]));
    setExpanded(slots.length >= MAX_CARDS ? expanded : slots.length);
  }

  function removeSlot(index: number) {
    setSlots((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
    setExpanded(null);
  }

  function moveSlot(index: number, direction: -1 | 1) {
    setSlots((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setExpanded(index + direction);
  }

  const hasRowError = (index: number) =>
    ["icon", "titleEn", "descriptionEn", "titleAr", "descriptionAr"].some((f) =>
      Boolean(fieldError(fieldErrors, `systemCards.${index}.${f}`)),
    );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-base font-semibold ${textPrimary}`}>System cards</h3>
          <p className={`text-xs ${textMuted}`}>
            {slots.length} of {MAX_CARDS} cards
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={addSlot} disabled={slots.length >= MAX_CARDS}>
          + Add card
        </Button>
      </div>

      {fieldError(fieldErrors, "systemCards") && <p className={errorTextClass}>{fieldError(fieldErrors, "systemCards")}</p>}

      <div className={`divide-y ${border} rounded-lg border ${border}`}>
        {slots.map((slot, index) => {
          const isOpen = expanded === index;
          const rowHasError = hasRowError(index);
          return (
            <div key={index}>
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : index)}
                aria-expanded={isOpen}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm ${hoverBg}`}
              >
                <GripVertical className={`h-4 w-4 shrink-0 ${textMuted}`} aria-hidden />
                <span className={textMuted}>{slot.icon}</span>
                <span className={`min-w-0 flex-1 truncate font-medium ${textPrimary}`}>
                  {slot.titleEn || `Card ${index + 1}`}
                </span>
                {rowHasError && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-admin-danger" aria-label="Has errors" />}
                {isOpen ? (
                  <ChevronUp className={`h-4 w-4 shrink-0 ${textMuted}`} aria-hidden />
                ) : (
                  <ChevronDown className={`h-4 w-4 shrink-0 ${textMuted}`} aria-hidden />
                )}
              </button>

              {isOpen && (
                <div className={`space-y-3 border-t ${border} p-3 sm:p-4`}>
                  <div>
                    <label htmlFor={`system-card-icon-${index}`} className={labelClass}>
                      Icon
                    </label>
                    <select
                      id={`system-card-icon-${index}`}
                      value={slot.icon}
                      onChange={(e) => update(index, { icon: e.target.value })}
                      className={`mt-1 ${inputClass}`}
                    >
                      {SYSTEM_CARD_ICONS.map((icon) => (
                        <option key={icon} value={icon}>
                          {icon}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor={`system-card-title-en-${index}`} className={labelClass}>
                        Title (English)
                      </label>
                      <input
                        id={`system-card-title-en-${index}`}
                        type="text"
                        value={slot.titleEn}
                        onChange={(e) => update(index, { titleEn: e.target.value })}
                        className={`mt-1 ${inputClass}`}
                      />
                      {fieldError(fieldErrors, `systemCards.${index}.titleEn`) && (
                        <p className={`mt-1 ${errorTextClass}`}>{fieldError(fieldErrors, `systemCards.${index}.titleEn`)}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor={`system-card-title-ar-${index}`} className={labelClass}>
                        Title (Arabic)
                      </label>
                      <input
                        id={`system-card-title-ar-${index}`}
                        type="text"
                        dir="rtl"
                        value={slot.titleAr}
                        onChange={(e) => update(index, { titleAr: e.target.value })}
                        className={`mt-1 ${inputClass}`}
                      />
                      {fieldError(fieldErrors, `systemCards.${index}.titleAr`) && (
                        <p className={`mt-1 ${errorTextClass}`}>{fieldError(fieldErrors, `systemCards.${index}.titleAr`)}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor={`system-card-description-en-${index}`} className={labelClass}>
                        Description (English)
                      </label>
                      <textarea
                        id={`system-card-description-en-${index}`}
                        value={slot.descriptionEn}
                        onChange={(e) => update(index, { descriptionEn: e.target.value })}
                        rows={2}
                        className={`mt-1 ${inputClass}`}
                      />
                      {fieldError(fieldErrors, `systemCards.${index}.descriptionEn`) && (
                        <p className={`mt-1 ${errorTextClass}`}>
                          {fieldError(fieldErrors, `systemCards.${index}.descriptionEn`)}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor={`system-card-description-ar-${index}`} className={labelClass}>
                        Description (Arabic)
                      </label>
                      <textarea
                        id={`system-card-description-ar-${index}`}
                        dir="rtl"
                        value={slot.descriptionAr}
                        onChange={(e) => update(index, { descriptionAr: e.target.value })}
                        rows={2}
                        className={`mt-1 ${inputClass}`}
                      />
                      {fieldError(fieldErrors, `systemCards.${index}.descriptionAr`) && (
                        <p className={`mt-1 ${errorTextClass}`}>
                          {fieldError(fieldErrors, `systemCards.${index}.descriptionAr`)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className={`flex flex-wrap gap-2 border-t ${border} pt-3`}>
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
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeSlot(index)}
                      disabled={slots.length <= 1}
                      className="ml-auto"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      Delete card
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <input type="hidden" name="systemCardsJson" value={JSON.stringify(slots)} />
    </div>
  );
}
