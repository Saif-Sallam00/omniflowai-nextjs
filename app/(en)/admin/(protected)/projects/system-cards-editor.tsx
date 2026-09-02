"use client";

import { useState } from "react";
import { SYSTEM_CARD_ICONS } from "@/lib/db/schema";
import { Button } from "@/components/admin/button";

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

export function SystemCardsEditor({ initialValue }: { initialValue?: SystemCardSlot[] }) {
  const [slots, setSlots] = useState<SystemCardSlot[]>(
    initialValue && initialValue.length > 0 ? initialValue : [{ ...EMPTY_SLOT }],
  );

  function update(index: number, patch: Partial<SystemCardSlot>) {
    setSlots((prev) => {
      const next = prev.map((slot, i) => (i === index ? { ...slot, ...patch } : slot));
      return next;
    });
  }

  function addSlot() {
    setSlots((prev) => (prev.length >= 6 ? prev : [...prev, { ...EMPTY_SLOT }]));
  }

  function removeSlot(index: number) {
    setSlots((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
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
      <h3 className="text-base font-semibold text-gray-900">System cards</h3>
      {slots.map((slot, index) => (
        <div key={index} className="space-y-3 rounded-md border border-gray-200 p-3">
          <div>
            <label htmlFor={`system-card-icon-${index}`} className="text-sm font-medium text-gray-900">
              Icon
            </label>
            <select
              id={`system-card-icon-${index}`}
              value={slot.icon}
              onChange={(e) => update(index, { icon: e.target.value })}
              className={`mt-1 ${inputClassName}`}
            >
              {SYSTEM_CARD_ICONS.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={`system-card-title-en-${index}`} className="text-sm font-medium text-gray-900">
              Title (English)
            </label>
            <input
              id={`system-card-title-en-${index}`}
              type="text"
              value={slot.titleEn}
              onChange={(e) => update(index, { titleEn: e.target.value })}
              className={`mt-1 ${inputClassName}`}
            />
          </div>

          <div>
            <label htmlFor={`system-card-description-en-${index}`} className="text-sm font-medium text-gray-900">
              Description (English)
            </label>
            <textarea
              id={`system-card-description-en-${index}`}
              value={slot.descriptionEn}
              onChange={(e) => update(index, { descriptionEn: e.target.value })}
              className={`mt-1 ${inputClassName}`}
            />
          </div>

          <div>
            <label htmlFor={`system-card-title-ar-${index}`} className="text-sm font-medium text-gray-900">
              Title (Arabic)
            </label>
            <input
              id={`system-card-title-ar-${index}`}
              type="text"
              value={slot.titleAr}
              onChange={(e) => update(index, { titleAr: e.target.value })}
              className={`mt-1 ${inputClassName}`}
            />
          </div>

          <div>
            <label htmlFor={`system-card-description-ar-${index}`} className="text-sm font-medium text-gray-900">
              Description (Arabic)
            </label>
            <textarea
              id={`system-card-description-ar-${index}`}
              value={slot.descriptionAr}
              onChange={(e) => update(index, { descriptionAr: e.target.value })}
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
            <Button
              type="button"
              variant="destructive"
              onClick={() => removeSlot(index)}
              disabled={slots.length <= 1}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={addSlot} disabled={slots.length >= 6}>
        Add system card
      </Button>
      <input type="hidden" name="systemCardsJson" value={JSON.stringify(slots)} />
    </div>
  );
}
