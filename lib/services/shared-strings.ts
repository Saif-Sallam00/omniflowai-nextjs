import type { Language } from "@/lib/language";

// Copy shared verbatim across all three service-detail pages (services-audit.md
// Step 7's "shared strings" table), kept in one place instead of repeated
// three times in lib/services/content.ts.
export const SERVICE_SHARED_STRINGS: Record<
  Language,
  {
    primaryCta: string;
    secondaryCta: string;
    bookCallCta: string;
    proofHeading: string;
    proofCta: string;
  }
> = {
  en: {
    primaryCta: "See the solutions",
    secondaryCta: "See examples",
    bookCallCta: "Book a strategy call",
    proofHeading: "Proven Results",
    proofCta: "View Full Portfolio",
  },
  ar: {
    primaryCta: "استعرض الحلول",
    secondaryCta: "شاهد أمثلة",
    bookCallCta: "احجز مكالمة استراتيجية",
    proofHeading: "نتائج مثبتة",
    proofCta: "عرض كامل الأعمال",
  },
};
