import type { MetadataRoute } from "next";
import { getPublishedArticles } from "@/lib/db/articles";
import { getPortfolioSlugs } from "@/lib/db/portfolio";
import { getLanguagePath } from "@/lib/language";
import { siteUrl } from "@/lib/site";

const STATIC_PAGES = ["/", "/about", "/solutions", "/contact", "/articles", "/portfolio"] as const;
const LANGUAGES = ["en", "ar"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (process.env.INDEXING_ENABLED !== "true") return [];

  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PAGES) {
    for (const language of LANGUAGES) {
      entries.push({ url: `${siteUrl}${getLanguagePath(path, language)}` });
    }
  }

  for (const language of LANGUAGES) {
    const articles = await getPublishedArticles(language);
    for (const article of articles) {
      entries.push({
        url: `${siteUrl}${getLanguagePath(`/articles/${article.slug}`, language)}`,
        lastModified: article.publishedAt ?? undefined,
      });
    }
  }

  const projectSlugs = await getPortfolioSlugs();
  for (const slug of projectSlugs) {
    for (const language of LANGUAGES) {
      entries.push({ url: `${siteUrl}${getLanguagePath(`/portfolio/${slug}`, language)}` });
    }
  }

  return entries;
}
