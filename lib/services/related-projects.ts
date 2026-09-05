import { cache } from "react";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, projectTranslations } from "@/lib/db/schema";
import type { Language } from "@/lib/language";
import type { ServiceSlug } from "@/lib/services/types";

export type ServiceRelatedProject = {
  slug: string;
  title: string;
  categoryLabel: string | null;
  coverImage: string;
};

// No category → pillar taxonomy exists anywhere in this repo (`category` is
// free text — see lib/db/portfolio.ts). The convention adopted here, for the
// three service-detail pages only, is that a project counts as proof for a
// pillar when its category equals the pillar's route slug (case-insensitive)
// AND it has been explicitly marked `isServiceShowcase`. Until projects are
// tagged this way in the admin, this correctly returns nothing — no proof is
// fabricated to fill the section.
// The Proof section is an enhancement, not a hard dependency of the page —
// a transient DB/network failure here should hide the section, not crash
// the whole service-detail route. See ServiceProof: an empty array already
// renders nothing.
export const getServiceRelatedProjects = cache(
  async (slug: ServiceSlug, language: Language, limit = 3): Promise<ServiceRelatedProject[]> => {
    try {
      return await db
        .select({
          slug: projects.slug,
          title: projectTranslations.title,
          categoryLabel: projectTranslations.categoryLabel,
          coverImage: projects.coverImage,
        })
        .from(projects)
        .innerJoin(
          projectTranslations,
          and(
            eq(projectTranslations.projectId, projects.id),
            eq(projectTranslations.language, language),
          ),
        )
        .where(
          and(
            eq(projects.isServiceShowcase, true),
            sql`lower(${projects.category}) = ${slug}`,
          ),
        )
        .limit(limit);
    } catch (error) {
      console.error(`getServiceRelatedProjects(${slug}, ${language}) failed`, error);
      return [];
    }
  },
);
