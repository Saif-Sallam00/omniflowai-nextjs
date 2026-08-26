import { cache } from "react";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, projectTranslations } from "@/lib/db/schema";
import type { Language } from "@/lib/language";

export type PortfolioListItem = {
  slug: string;
  category: string;
  coverImage: string;
  title: string;
  categoryLabel: string | null;
  tags: string[];
};

export type SystemCard = { icon: string; title: string; description: string };
export type ResultMetric = { value: string; label: string };

export type PortfolioDetail = {
  slug: string;
  category: string;
  coverImage: string;
  logo: string | null;
  mediaImage: string | null;
  title: string;
  description: string;
  categoryLabel: string | null;
  clientName: string | null;
  clientSector: string | null;
  clientCountry: string | null;
  clientModel: string | null;
  problemHeadline: string | null;
  problemBody: string | null;
  diagnosisHeadline: string | null;
  diagnosisBody: string | null;
  systemHeadline: string | null;
  systemCards: SystemCard[];
  results: ResultMetric[];
  mediaCaption: string | null;
  ctaHeadline: string | null;
  ctaSubtext: string | null;
  technologies: string[];
};

export const getPortfolioListItems = cache(
  async (language: Language): Promise<PortfolioListItem[]> => {
    const rows = await db
      .select({
        slug: projects.slug,
        category: projects.category,
        coverImage: projects.coverImage,
        title: projectTranslations.title,
        categoryLabel: projectTranslations.categoryLabel,
        tags: projectTranslations.tags,
      })
      .from(projects)
      .innerJoin(
        projectTranslations,
        and(
          eq(projectTranslations.projectId, projects.id),
          eq(projectTranslations.language, language),
        ),
      );

    return rows.map((row) => ({
      ...row,
      tags: (row.tags as string[] | null) ?? [],
    }));
  },
);

export const getPortfolioSlugs = cache(async (): Promise<string[]> => {
  const rows = await db.select({ slug: projects.slug }).from(projects);
  return rows.map((row) => row.slug);
});

export const getPortfolioDetailBySlug = cache(
  async (slug: string, language: Language): Promise<PortfolioDetail | null> => {
    const rows = await db
      .select({
        slug: projects.slug,
        category: projects.category,
        coverImage: projects.coverImage,
        logo: projects.logo,
        mediaImage: projects.mediaImage,
        title: projectTranslations.title,
        description: projectTranslations.description,
        categoryLabel: projectTranslations.categoryLabel,
        clientName: projectTranslations.clientName,
        clientSector: projectTranslations.clientSector,
        clientCountry: projectTranslations.clientCountry,
        clientModel: projectTranslations.clientModel,
        problemHeadline: projectTranslations.problemHeadline,
        problemBody: projectTranslations.problemBody,
        diagnosisHeadline: projectTranslations.diagnosisHeadline,
        diagnosisBody: projectTranslations.diagnosisBody,
        systemHeadline: projectTranslations.systemHeadline,
        systemCards: projectTranslations.systemCards,
        results: projectTranslations.results,
        mediaCaption: projectTranslations.mediaCaption,
        ctaHeadline: projectTranslations.ctaHeadline,
        ctaSubtext: projectTranslations.ctaSubtext,
        technologies: projectTranslations.technologies,
      })
      .from(projects)
      .innerJoin(
        projectTranslations,
        and(
          eq(projectTranslations.projectId, projects.id),
          eq(projectTranslations.language, language),
        ),
      )
      .where(eq(projects.slug, slug))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return {
      ...row,
      systemCards: (row.systemCards as SystemCard[] | null) ?? [],
      results: (row.results as ResultMetric[] | null) ?? [],
      technologies: (row.technologies as string[] | null) ?? [],
    };
  },
);
