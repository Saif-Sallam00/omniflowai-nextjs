import type { Metadata } from "next";
import { LANGUAGES, getLanguagePath, type Language } from "@/lib/language";
import { siteUrl, DEFAULT_OG_IMAGE_PATH } from "@/lib/site";

export type PageMetadataInput = {
  path: string;
  language: Language;
  title: string;
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

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title,
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
      title,
      description,
      images: twitterImages,
    },
  };
}
