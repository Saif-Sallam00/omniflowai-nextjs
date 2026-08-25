import type { Metadata } from "next";
import { getLanguagePath, type Language } from "@/lib/language";
import { siteUrl } from "@/lib/site";

export type PageMetadataInput = {
  path: string;
  language: Language;
  title: string;
  description: string;
};

function buildAbsoluteUrl(path: string): string {
  return `${siteUrl.replace(/\/$/, "")}${path}`;
}

export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const { path, language, title, description } = input;
  const canonicalUrl = buildAbsoluteUrl(getLanguagePath(path, language));
  const enUrl = buildAbsoluteUrl(getLanguagePath(path, "en"));
  const arUrl = buildAbsoluteUrl(getLanguagePath(path, "ar"));

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: enUrl,
        ar: arUrl,
        "x-default": enUrl,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
