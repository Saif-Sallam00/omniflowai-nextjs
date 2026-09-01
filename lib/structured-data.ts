import { buildAbsoluteUrl } from "@/lib/metadata";
import { getLanguagePath, type Language } from "@/lib/language";

const ORGANIZATION_REF = (language: Language) => ({
  "@type": "Organization",
  name: "OmniflowAI",
  url: buildAbsoluteUrl(getLanguagePath("/", language)),
});

export function buildArticleJsonLd(
  article: {
    title: string;
    excerpt: string;
    coverImage: string;
    publishedAt: Date | null;
    slug: string;
  },
  language: Language,
) {
  const url = buildAbsoluteUrl(getLanguagePath(`/articles/${article.slug}`, language));

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: buildAbsoluteUrl(article.coverImage),
    ...(article.publishedAt ? { datePublished: article.publishedAt.toISOString() } : {}),
    inLanguage: language,
    url,
    mainEntityOfPage: url,
    publisher: ORGANIZATION_REF(language),
  };
}

export function buildCaseStudyJsonLd(
  project: { title: string; description: string; coverImage: string },
  slug: string,
  language: Language,
) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    image: buildAbsoluteUrl(project.coverImage),
    inLanguage: language,
    url: buildAbsoluteUrl(getLanguagePath(`/portfolio/${slug}`, language)),
    publisher: ORGANIZATION_REF(language),
  };
}
