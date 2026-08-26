"use client";

import { useState, type ReactNode } from "react";

/** Hand-rolled expand/collapse — used by both the solution card "What's
 * included" sections and the FAQ. Plain useState, no Radix/shadcn Accordion. */
export function Disclosure({
  id,
  label,
  labelClassName = "",
  children,
}: {
  id: string;
  label: ReactNode;
  labelClassName?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-[2.75rem] w-full items-center justify-between gap-4 border-b border-slate-800/40 py-3.5 text-start text-sm text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className={labelClassName}>{label}</span>
        <span
          aria-hidden="true"
          className="flex-none text-lg leading-none text-primary"
        >
          {open ? "−" : "+"}
        </span>
      </button>
      <div id={`${id}-panel`} className={open ? "block" : "hidden"}>
        {children}
      </div>
    </div>
  );
}
