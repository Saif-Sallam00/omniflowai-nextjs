import { cache } from "react";
import { and, desc, eq, sql } from "drizzle-orm";
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

export type RelatedProjectCard = {
  slug: string;
  category: string;
  title: string;
  categoryLabel: string | null;
};

export const getRelatedProjectCard = cache(
  async (projectId: number, language: Language): Promise<RelatedProjectCard | null> => {
    const rows = await db
      .select({
        slug: projects.slug,
        category: projects.category,
        title: projectTranslations.title,
        categoryLabel: projectTranslations.categoryLabel,
      })
      .from(projects)
      .innerJoin(
        projectTranslations,
        and(
          eq(projectTranslations.projectId, projects.id),
          eq(projectTranslations.language, language),
        ),
      )
      .where(eq(projects.id, projectId))
      .limit(1);

    return rows[0] ?? null;
  },
);

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

// --- Consumed by the admin articles form's related-project dropdown
// (app/(en)/admin/(protected)/articles/**). Admin is English-only, so the
// title language is hardcoded rather than parameterized. ---

export type ProjectOption = { id: number; title: string };

export const listProjectsForSelect = cache(async (): Promise<ProjectOption[]> => {
  return db
    .select({ id: projects.id, title: projectTranslations.title })
    .from(projects)
    .innerJoin(
      projectTranslations,
      and(eq(projectTranslations.projectId, projects.id), eq(projectTranslations.language, "en")),
    )
    .orderBy(projectTranslations.title);
});

// --- Admin (write) side. Everything below is used only by the admin CRUD
// (app/(en)/admin/(protected)/projects/**), never by public rendering. ---

export type ProjectRow = typeof projects.$inferSelect;
export type ProjectTranslationRow = typeof projectTranslations.$inferSelect;

// One "slot" per system-capability item as authored — shared icon/order,
// per-language text. createProject/updateProject fan this into the two
// stored jsonb arrays (see fanOutSystemCards).
export type SystemCardSlotInput = {
  icon: string;
  titleEn: string;
  descriptionEn: string;
  titleAr: string;
  descriptionAr: string;
};

// One "slot" per result item — shared value, per-language label.
export type ResultSlotInput = {
  value: string; // a display string (e.g. "40%", "3x") — never a number
  labelEn: string;
  labelAr: string;
};

export type ProjectTranslationContentInput = {
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
  mediaCaption: string | null;
  ctaHeadline: string | null;
  ctaSubtext: string | null;
  tags: string[];
  technologies: string[];
};

export type CreateProjectInput = {
  slug: string;
  category: string;
  isFeatured: boolean;
  isServiceShowcase: boolean;
  coverImage: string;
  logo: string | null;
  mediaImage: string | null;
  systemCards: SystemCardSlotInput[];
  results: ResultSlotInput[];
  en: ProjectTranslationContentInput;
  ar: ProjectTranslationContentInput;
};

// Edit always submits the complete shape (both languages, full slot lists) —
// never a partial patch, since the combined form always submits everything.
export type UpdateProjectInput = CreateProjectInput;

export type ProjectWithTranslations = ProjectRow & {
  en: ProjectTranslationRow;
  ar: ProjectTranslationRow;
};

// Slug-clash pre-check (UX nicety — the DB's own `projects_slug_unique`
// constraint, via mapUniqueViolation, is the authoritative race backstop).
// `excludeId` lets an edit skip flagging a project against its own slug.
export async function projectExistsWithSlug(slug: string, excludeId?: number): Promise<boolean> {
  const rows = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, slug)).limit(1);
  const match = rows[0];
  if (!match) return false;
  return excludeId === undefined || match.id !== excludeId;
}

export async function getProjectById(id: number): Promise<ProjectWithTranslations | null> {
  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) return null;

  const translations = await db
    .select()
    .from(projectTranslations)
    .where(eq(projectTranslations.projectId, id));

  const en = translations.find((t) => t.language === "en");
  const ar = translations.find((t) => t.language === "ar");
  if (!en || !ar) return null;

  return { ...project, en, ar };
}

export const listProjectCategories = cache(async (): Promise<string[]> => {
  const rows = await db.selectDistinct({ category: projects.category }).from(projects).orderBy(projects.category);
  return rows.map((row) => row.category);
});

// Maps the SAME slot array, in the SAME order, into each language's stored
// array — icon/order (system cards) and value (results) are identical across
// en/ar by construction, never by admin discipline.
function fanOutSystemCards(slots: SystemCardSlotInput[]): { en: SystemCard[]; ar: SystemCard[] } {
  return {
    en: slots.map((s) => ({ icon: s.icon, title: s.titleEn, description: s.descriptionEn })),
    ar: slots.map((s) => ({ icon: s.icon, title: s.titleAr, description: s.descriptionAr })),
  };
}

function fanOutResults(slots: ResultSlotInput[]): { en: ResultMetric[]; ar: ResultMetric[] } {
  return {
    en: slots.map((s) => ({ value: s.value, label: s.labelEn })),
    ar: slots.map((s) => ({ value: s.value, label: s.labelAr })),
  };
}

export async function updateProject(
  id: number,
  input: UpdateProjectInput,
): Promise<ProjectWithTranslations | null> {
  return db.transaction(async (tx) => {
    const [project] = await tx
      .update(projects)
      .set({
        slug: input.slug,
        category: input.category,
        isFeatured: input.isFeatured,
        isServiceShowcase: input.isServiceShowcase,
        coverImage: input.coverImage,
        logo: input.logo,
        mediaImage: input.mediaImage,
        updatedAt: sql`now()`,
      })
      .where(eq(projects.id, id))
      .returning();

    if (!project) return null;

    const systemCards = fanOutSystemCards(input.systemCards);
    const results = fanOutResults(input.results);

    const [en] = await tx
      .update(projectTranslations)
      .set({ ...input.en, systemCards: systemCards.en, results: results.en, updatedAt: sql`now()` })
      .where(and(eq(projectTranslations.projectId, id), eq(projectTranslations.language, "en")))
      .returning();

    const [ar] = await tx
      .update(projectTranslations)
      .set({ ...input.ar, systemCards: systemCards.ar, results: results.ar, updatedAt: sql`now()` })
      .where(and(eq(projectTranslations.projectId, id), eq(projectTranslations.language, "ar")))
      .returning();

    return { ...project, en, ar };
  });
}

// A single DELETE on `projects` only — the already-applied ON DELETE CASCADE
// FK (project_translations.project_id -> projects.id) removes both
// translation rows automatically. This function MUST NOT issue any
// statement against project_translations.
export async function deleteProject(id: number): Promise<ProjectRow | null> {
  const [row] = await db.delete(projects).where(eq(projects.id, id)).returning();
  return row ?? null;
}

export type ProjectAdminListItem = {
  id: number;
  slug: string;
  title: string;
  category: string;
  coverImage: string;
  isFeatured: boolean;
  isServiceShowcase: boolean;
  updatedAt: Date;
};

export const listProjectsForAdmin = cache(async (): Promise<ProjectAdminListItem[]> => {
  return db
    .select({
      id: projects.id,
      slug: projects.slug,
      category: projects.category,
      coverImage: projects.coverImage,
      isFeatured: projects.isFeatured,
      isServiceShowcase: projects.isServiceShowcase,
      updatedAt: projects.updatedAt,
      title: projectTranslations.title,
    })
    .from(projects)
    .innerJoin(
      projectTranslations,
      and(eq(projectTranslations.projectId, projects.id), eq(projectTranslations.language, "en")),
    )
    .orderBy(desc(projects.updatedAt));
});

export async function createProject(input: CreateProjectInput): Promise<ProjectWithTranslations> {
  return db.transaction(async (tx) => {
    const [project] = await tx
      .insert(projects)
      .values({
        slug: input.slug,
        category: input.category,
        isFeatured: input.isFeatured,
        isServiceShowcase: input.isServiceShowcase,
        coverImage: input.coverImage,
        logo: input.logo,
        mediaImage: input.mediaImage,
      })
      .returning();

    const systemCards = fanOutSystemCards(input.systemCards);
    const results = fanOutResults(input.results);

    const [en] = await tx
      .insert(projectTranslations)
      .values({
        projectId: project.id,
        language: "en",
        ...input.en,
        systemCards: systemCards.en,
        results: results.en,
      })
      .returning();

    const [ar] = await tx
      .insert(projectTranslations)
      .values({
        projectId: project.id,
        language: "ar",
        ...input.ar,
        systemCards: systemCards.ar,
        results: results.ar,
      })
      .returning();

    return { ...project, en, ar };
  });
}
