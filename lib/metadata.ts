import type { Metadata } from "next";
import { getLanguagePath, type Language } from "@/lib/language";
import { siteUrl } from "@/lib/site";

export type PageMetadataInput = {
  path: string;
  language: Language;
  title: string;
  description: string;
  languageAlternates?: { en: string | null; ar: string | null };
  imageUrl?: string;
};

export function buildAbsoluteUrl(path: string): string {
  return `${siteUrl.replace(/\/$/, "")}${path}`;
}

export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const { path, language, title, description, languageAlternates, imageUrl } = input;
  const canonicalUrl = buildAbsoluteUrl(getLanguagePath(path, language));

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
      ...(imageUrl ? { images: [{ url: buildAbsoluteUrl(imageUrl) }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(imageUrl ? { images: [buildAbsoluteUrl(imageUrl)] } : {}),
    },
  };
}
