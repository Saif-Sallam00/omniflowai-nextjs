import { buildPageMetadata } from "@/lib/metadata";
import type { Language } from "@/lib/language";
import { getServiceContent } from "@/lib/services/content";
import type { ServiceSlug } from "@/lib/services/types";

export function buildServiceMetadata(slug: ServiceSlug, language: Language) {
  const content = getServiceContent(slug, language);
  return buildPageMetadata({
    path: `/services/${slug}`,
    language,
    title: content.seoTitle,
    description: content.metaDescription,
  });
}
