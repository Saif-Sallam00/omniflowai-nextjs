import Link from "next/link";
import { ServiceChapterMarker } from "@/components/services/service-chapter-marker";
import { getLanguagePath, type Language } from "@/lib/language";
import type { ServiceSolutionRelationship, SolutionRelationshipId } from "@/lib/services/types";

// Kept in Latin script even on the Arabic pages, by the same deliberate
// design already used for these three names elsewhere on the site (see
// lib/ltr-names.tsx) — they're product names, not translated terms.
const RELATIONSHIP_NAME: Record<SolutionRelationshipId, string> = {
  foundation: "Foundation",
  "growth-engine": "Growth Engine",
  "scale-infrastructure": "Scale Infrastructure",
};

const DESKTOP_COLS: Record<number, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
};

export function ServiceSolutionMatrix({
  heading,
  sub,
  relationships,
  language,
}: {
  heading: string;
  sub: string;
  relationships: ServiceSolutionRelationship[];
  language: Language;
}) {
  const total = relationships.length;

  return (
    <section className="bg-primary py-16 text-slate-950 md:py-24">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <ServiceChapterMarker index="03" tone="peak" />
        <div className="mb-10 max-w-[64ch] md:mb-14">
          <h2 className="font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
            {heading}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-950/75">{sub}</p>
        </div>

        <div className={`grid grid-cols-1 gap-4 ${DESKTOP_COLS[total] ?? "md:grid-cols-3"}`}>
          {relationships.map((rel, i) => (
            <Link
              key={rel.id}
              href={getLanguagePath(`/solutions#${rel.id}`, language)}
              className="group flex h-full flex-col gap-4 rounded-xl border border-slate-950/15 bg-slate-950/[0.06] p-6 transition-colors hover:bg-slate-950/[0.1]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-xs font-semibold tracking-[0.1em] text-slate-950/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="rounded-full bg-slate-950 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-white">
                  {rel.tag}
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold">
                <span dir="ltr">{RELATIONSHIP_NAME[rel.id]}</span>
              </h3>
              <p className="text-sm leading-relaxed text-slate-950/80">{rel.body}</p>
              <div aria-hidden="true" className="mt-auto flex gap-1.5 pt-2">
                {Array.from({ length: total }).map((_, dotIndex) => (
                  <span
                    key={dotIndex}
                    className={`h-1 w-6 rounded-full ${
                      dotIndex <= i ? "bg-slate-950" : "bg-slate-950/20"
                    }`}
                  />
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
