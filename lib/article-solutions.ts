import type { Language } from "@/lib/language";

// Fixed, known set of related-solution ids (application-level convention, no
// DB enum) — matches the ids used on the public Solutions page
// (app/(en)/(public)/solutions/page.tsx and app/ar/(public)/solutions/page.tsx).
export const RELATED_SOLUTIONS = [
  "foundation",
  "growth-engine",
  "scale-infrastructure",
  "custom",
] as const;
export type RelatedSolution = (typeof RELATED_SOLUTIONS)[number];

type SolutionCopy = { name: string; tagline: string };

// Names and taglines below are copied verbatim from the live Solutions page
// content (both languages). The Solutions page itself keeps these names as
// English brand terms even on the Arabic route (see its own `solutionNames`
// map) — there is no separate Arabic name to translate to, so the same
// convention is followed here instead of inventing one.
const SOLUTION_COPY: Record<RelatedSolution, Record<Language, SolutionCopy>> = {
  foundation: {
    en: { name: "Foundation", tagline: "Discover what's blocking your next stage of growth." },
    ar: { name: "Foundation", tagline: "اكتشف ما الذي يعيق مرحلتك التالية من النمو." },
  },
  "growth-engine": {
    en: { name: "Growth Engine", tagline: "Turn growth into a system you can measure." },
    ar: { name: "Growth Engine", tagline: "حوّل النمو إلى نظام يمكن قياسه." },
  },
  "scale-infrastructure": {
    en: {
      name: "Scale Infrastructure",
      tagline: "Build the systems required for operational scale.",
    },
    ar: { name: "Scale Infrastructure", tagline: "ابنِ الأنظمة اللازمة للتوسّع التشغيلي." },
  },
  custom: {
    en: { name: "Custom Transformation", tagline: "Not every business fits a pattern." },
    ar: { name: "Custom Transformation", tagline: "ليست كل الأعمال تناسبها الأنماط الجاهزة." },
  },
};

function isRelatedSolution(id: string): id is RelatedSolution {
  return (RELATED_SOLUTIONS as readonly string[]).includes(id);
}

export function getSolutionCopy(id: string, language: Language): SolutionCopy | null {
  return isRelatedSolution(id) ? SOLUTION_COPY[id][language] : null;
}
