"use client";

import { useState } from "react";
import { SYSTEM_CARD_ICONS } from "@/lib/db/schema";

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

  return (
    <div>
      <h3>System cards</h3>
      {slots.map((slot, index) => (
        <div key={index}>
          <label htmlFor={`system-card-icon-${index}`}>Icon</label>
          <select
            id={`system-card-icon-${index}`}
            value={slot.icon}
            onChange={(e) => update(index, { icon: e.target.value })}
          >
            {SYSTEM_CARD_ICONS.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </select>

          <label htmlFor={`system-card-title-en-${index}`}>Title (English)</label>
          <input
            id={`system-card-title-en-${index}`}
            type="text"
            value={slot.titleEn}
            onChange={(e) => update(index, { titleEn: e.target.value })}
          />

          <label htmlFor={`system-card-description-en-${index}`}>Description (English)</label>
          <textarea
            id={`system-card-description-en-${index}`}
            value={slot.descriptionEn}
            onChange={(e) => update(index, { descriptionEn: e.target.value })}
          />

          <label htmlFor={`system-card-title-ar-${index}`}>Title (Arabic)</label>
          <input
            id={`system-card-title-ar-${index}`}
            type="text"
            value={slot.titleAr}
            onChange={(e) => update(index, { titleAr: e.target.value })}
          />

          <label htmlFor={`system-card-description-ar-${index}`}>Description (Arabic)</label>
          <textarea
            id={`system-card-description-ar-${index}`}
            value={slot.descriptionAr}
            onChange={(e) => update(index, { descriptionAr: e.target.value })}
          />

          <button type="button" onClick={() => moveSlot(index, -1)} disabled={index === 0}>
            Move up
          </button>
          <button type="button" onClick={() => moveSlot(index, 1)} disabled={index === slots.length - 1}>
            Move down
          </button>
          <button type="button" onClick={() => removeSlot(index)} disabled={slots.length <= 1}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={addSlot} disabled={slots.length >= 6}>
        Add system card
      </button>
      <input type="hidden" name="systemCardsJson" value={JSON.stringify(slots)} />
    </div>
  );
}
