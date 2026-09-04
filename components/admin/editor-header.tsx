import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { textMuted, textPrimary, hoverBg, textPrimaryHoverClass } from "./palette";

/**
 * Sticky header used by create/edit screens: back link, title, status,
 * "updated N ago" meta, and primary actions (Save/Preview/Publish). Stays
 * pinned so long forms (Projects especially) always keep Save reachable —
 * see AGENTS spec §11 "Sticky Action Bar".
 */
export function EditorHeader({
  back,
  title,
  status,
  meta,
  actions,
}: {
  back: { href: string; label: string };
  title: string;
  status?: React.ReactNode;
  meta?: string;
  actions: React.ReactNode;
}) {
  return (
    <div className="sticky -top-4 z-20 -mx-4 mb-6 border-b border-admin-border bg-admin-background/95 px-4 pb-3 pt-4 backdrop-blur sm:-top-6 sm:-mx-6 sm:px-6 sm:pt-6">
      <Link
        href={back.href}
        className={`mb-1 inline-flex items-center gap-1 rounded text-sm ${textMuted} ${hoverBg} ${textPrimaryHoverClass} -ml-1 px-1 py-0.5`}
      >
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
        {back.label}
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className={`truncate text-lg font-bold ${textPrimary}`}>{title}</h1>
          {status}
        </div>
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      </div>
      {meta && <p className={`mt-0.5 text-xs ${textMuted}`}>{meta}</p>}
    </div>
  );
}
