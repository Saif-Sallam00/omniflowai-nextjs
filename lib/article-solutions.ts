// Fixed, known set of related-solution ids (application-level convention, no
// DB enum) — matches the ids already hardcoded in the public article detail
// pages' own SOLUTION_NAMES display map. Kept in a client-safe module (no
// lib/db import) since the article form imports it directly.
export const RELATED_SOLUTIONS = [
  "foundation",
  "growth-engine",
  "scale-infrastructure",
  "custom",
] as const;
export type RelatedSolution = (typeof RELATED_SOLUTIONS)[number];
