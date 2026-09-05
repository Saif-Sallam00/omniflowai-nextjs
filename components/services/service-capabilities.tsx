import { ServiceChapterMarker } from "@/components/services/service-chapter-marker";
import type { ServiceCapability } from "@/lib/services/types";
import type { Language } from "@/lib/language";

// Desktop column count by capability count, English only — Arabic always
// caps at 2 (its copy runs longer), matching the approved hybrid's
// documented RTL adaptation. CSS grid rather than flex-wrap: exact 50%/33%
// flex-basis combined with a gap-px pushes each row's total width 1px over
// the container on every line, which browsers resolve by wrapping (flex's
// line-collection step ignores flex-shrink), collapsing every card to its
// own row — grid's track sizing doesn't have that failure mode.
const EN_DESKTOP_COLS: Record<number, string> = {
  4: "xl:grid-cols-2",
  5: "xl:grid-cols-3",
  6: "xl:grid-cols-3",
};

export function ServiceCapabilities({
  heading,
  sub,
  capabilities,
  language,
}: {
  heading: string;
  sub: string;
  capabilities: ServiceCapability[];
  language: Language;
}) {
  const desktopCols =
    language === "ar" ? "xl:grid-cols-2" : (EN_DESKTOP_COLS[capabilities.length] ?? "xl:grid-cols-2");
  // 5 items never divides evenly into 2 or 3 columns — instead of leaving the
  // last row's empty cell showing the seam background as a bare box, the
  // final card spans the remainder so the row stays fully filled. (4 and 6
  // divide evenly into every column count used here, so this only fires for
  // Marketing's 5 capabilities.)
  const lastSpansRemainder = capabilities.length === 5;

  return (
    <section className="bg-surface-warm py-16 text-slate-900 md:py-24">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <ServiceChapterMarker index="02" tone="light" />
        <div className="mb-10 max-w-[64ch] md:mb-14">
          <h2 className="font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
            {heading}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-700">{sub}</p>
        </div>

        <div
          className={`grid grid-cols-1 items-start gap-px overflow-hidden rounded-2xl border border-slate-900/10 bg-slate-900/10 md:grid-cols-2 ${desktopCols}`}
        >
          {capabilities.map((cap, i) => (
            <article
              key={cap.title}
              className={`flex h-full flex-col gap-3.5 bg-white p-6 transition-colors hover:bg-surface-warm/60 sm:p-7 ${
                lastSpansRemainder ? "md:last:col-span-2" : ""
              }`}
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xs font-semibold tracking-[0.1em] text-brand-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-base font-semibold leading-tight">{cap.title}</h3>
              </div>
              <div className="border-s-2 border-primary ps-3.5">
                <span className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-brand-600">
                  {cap.problemLabel}
                </span>
                <p className="text-sm leading-relaxed text-slate-600">{cap.problem}</p>
              </div>
              <p className="text-sm leading-relaxed text-slate-800">{cap.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
