import type { Metadata } from "next";
import { LANGUAGES, getLanguagePath, type Language } from "@/lib/language";
import { siteUrl, DEFAULT_OG_IMAGE_PATH } from "@/lib/site";

// Matches the root layouts' `title.template` ("%s — OmniflowAI"), applied
// manually here because Next's title template only affects the <title> tag,
// not openGraph.title / twitter.title.
const TITLE_SUFFIX = " — OmniflowAI";

// Falls back for a page that has no title of its own (the homepage). Mirrors
// each root layout's `title.default`.
export const SITE_DEFAULT_TITLE: Record<Language, string> = {
  en: "OmniflowAI — AI-Powered Solutions",
  ar: "OmniflowAI — حلول مدعومة بالذكاء الاصطناعي",
};

export type PageMetadataInput = {
  path: string;
  language: Language;
  /** Short page label, e.g. "About". Omit for the site-wide default (home). */
  title?: string;
  description: string;
  languageAlternates?: { en: string | null; ar: string | null };
  imageUrl?: string;
  ogType?: "website" | "article";
};

export function buildAbsoluteUrl(path: string): string {
  return `${siteUrl.replace(/\/$/, "")}${path}`;
}

export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const { path, language, title, description, languageAlternates, imageUrl, ogType } = input;
  const canonicalUrl = buildAbsoluteUrl(getLanguagePath(path, language));
  const otherLanguage: Language = language === "en" ? "ar" : "en";

  let languages: Record<string, string>;
  if (languageAlternates) {
    const enUrl =
      languageAlternates.en !== null
        ? buildAbsoluteUrl(getLanguagePath(languageAlternates.en, "en"))
        : null;
    const arUrl =
      languageAlternates.ar !== null
        ? buildAbsoluteUrl(getLanguagePath(languageAlternates.ar, "ar"))
        : null;
    languages = {
      ...(enUrl !== null ? { en: enUrl } : {}),
      ...(arUrl !== null ? { ar: arUrl } : {}),
      "x-default": enUrl ?? (arUrl as string),
    };
  } else {
    const enUrl = buildAbsoluteUrl(getLanguagePath(path, "en"));
    const arUrl = buildAbsoluteUrl(getLanguagePath(path, "ar"));
    languages = {
      en: enUrl,
      ar: arUrl,
      "x-default": enUrl,
    };
  }

  const ogImages = imageUrl
    ? [{ url: buildAbsoluteUrl(imageUrl) }]
    : [{ url: buildAbsoluteUrl(DEFAULT_OG_IMAGE_PATH), width: 1200, height: 630 }];
  const twitterImages = imageUrl
    ? [buildAbsoluteUrl(imageUrl)]
    : [buildAbsoluteUrl(DEFAULT_OG_IMAGE_PATH)];

  // The <title> tag gets its " — OmniflowAI" suffix from the root layout's
  // title.template, so `title` is passed through as the short label. OG/Twitter
  // titles aren't templated by Next, so they're built out manually here.
  const socialTitle = title ? `${title}${TITLE_SUFFIX}` : SITE_DEFAULT_TITLE[language];

  return {
    ...(title ? { title } : {}),
    description,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title: socialTitle,
      description,
      url: canonicalUrl,
      images: ogImages,
      siteName: "OmniflowAI",
      type: ogType ?? "website",
      locale: LANGUAGES[language].ogLocale,
      alternateLocale: LANGUAGES[otherLanguage].ogLocale,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: twitterImages,
    },
  };
}
