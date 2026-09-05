import { ServiceChapterMarker } from "@/components/services/service-chapter-marker";
import type { ServiceFaqItem } from "@/lib/services/types";

// Always-open two-column Q/A rows — a deliberate departure from the
// accordion-style Disclosure used on /solutions: the approved hybrid design
// specifies this pattern explicitly, and the page is complete with no JS.
export function ServiceFaq({ heading, faq }: { heading: string; faq: ServiceFaqItem[] }) {
  return (
    <section className="bg-white py-16 text-slate-900 md:py-24">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <ServiceChapterMarker index="04" tone="light" />
        <h2 className="mb-10 font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl md:mb-14">
          {heading}
        </h2>

        <div className="border-t border-slate-900/10">
          {faq.map((item, i) => (
            <div
              key={item.q}
              className="grid grid-cols-1 gap-3 border-b border-slate-900/10 py-7 md:grid-cols-[0.85fr_1.35fr] md:gap-12"
            >
              <div className="flex items-baseline gap-3.5">
                <span className="font-mono text-xs font-semibold tracking-[0.1em] text-brand-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-lg font-medium leading-snug">{item.q}</h3>
              </div>
              <p className="max-w-[56ch] text-base leading-relaxed text-slate-600 md:ps-0">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
