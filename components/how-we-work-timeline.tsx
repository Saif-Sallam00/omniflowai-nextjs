"use client";

import { useInView } from "@/lib/hooks/use-in-view";

type TimelineStep = { step: string; title: string; desc: string };

/** 4-step scroll-activated timeline (Home §8). One IntersectionObserver gates
 * the whole grid; each card's border/accent-bar/step-number transitions share
 * the same `inView` boolean but stagger via `transitionDelay: index * 180ms`,
 * producing the sequential light-up purely from CSS. */
export function HowWeWorkTimeline({ items }: { items: TimelineStep[] }) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4"
    >
      {items.map((item, index) => {
        const delay = { transitionDelay: `${index * 180}ms` };
        return (
          <div
            key={index}
            style={delay}
            className={`relative overflow-hidden rounded-xl border bg-white p-4 shadow-card transition-colors duration-500 ease-standard md:p-6 ${
              inView ? "border-brand-500/30" : "border-slate-200"
            }`}
          >
            <span
              aria-hidden="true"
              style={delay}
              className={`absolute inset-x-0 top-0 h-1 bg-primary transition-opacity duration-500 ease-standard ${
                inView ? "opacity-100" : "opacity-0"
              }`}
            />
            <div
              style={delay}
              className={`mb-3 text-4xl font-bold transition-colors duration-500 ease-standard md:mb-4 md:text-6xl ${
                inView ? "text-brand-400" : "text-slate-200"
              }`}
            >
              {item.step}
            </div>
            <h3 className="mb-2 text-xl font-semibold text-slate-900 md:mb-3">
              {item.title}
            </h3>
            <p className="text-sm leading-relaxed text-slate-600 md:text-base">
              {item.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
}
