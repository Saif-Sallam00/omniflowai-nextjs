import { ServiceChapterMarker } from "@/components/services/service-chapter-marker";

export function ServiceProblemList({
  heading,
  problems,
}: {
  heading: string;
  problems: string[];
}) {
  return (
    <section className="bg-surface py-16 text-slate-900 md:py-24">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <ServiceChapterMarker index="01" tone="light" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <h2 className="font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
            {heading}
          </h2>
          <div className="border-t border-slate-900/10">
            {problems.map((problem, i) => (
              <div
                key={problem}
                className="grid grid-cols-[auto_1fr] items-baseline gap-4 border-b border-slate-900/10 py-6 sm:gap-8"
              >
                <span className="pt-[0.15em] font-mono text-xs font-semibold tracking-[0.1em] text-brand-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="max-w-[46ch] text-lg leading-relaxed">{problem}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
