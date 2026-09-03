import { buildAbsoluteUrl } from "@/lib/metadata";
import { getLanguagePath, type Language } from "@/lib/language";
import { siteUrl, LOGO_PATH } from "@/lib/site";

const ORGANIZATION_ID = `${siteUrl}/#organization`;

const ORGANIZATION_DESCRIPTION: Record<Language, string> = {
  en: "OmniflowAI — AI-powered solutions.",
  ar: "OmniflowAI — حلول مدعومة بالذكاء الاصطناعي.",
};

const ORGANIZATION_REF = (language: Language) => ({
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: "OmniflowAI",
  url: buildAbsoluteUrl(getLanguagePath("/", language)),
});

export function buildOrganizationJsonLd(language: Language) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: "OmniflowAI",
    url: buildAbsoluteUrl(getLanguagePath("/", language)),
    description: ORGANIZATION_DESCRIPTION[language],
    inLanguage: language,
    logo: {
      "@type": "ImageObject",
      url: buildAbsoluteUrl(LOGO_PATH),
      width: 512,
      height: 512,
    },
  };
}

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
