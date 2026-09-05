import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, projectTranslations, SYSTEM_CARD_ICONS } from "@/lib/db/schema";
import { SERVICE_SLUGS } from "@/lib/services/types";

const CONTENT_PACK_PATH = path.join(process.cwd(), "docs/import/portfolio-content-pack.json");

type SystemCard = { icon: string; title: string; description: string };
type ResultMetric = { value: string | null; label: string };

type TranslationContent = {
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
  tags: string[];
  technologies: string[];
};

type ContentPackEntry = {
  sourceIndex: number;
  project: {
    slug: string;
    category: string;
    isFeatured: boolean;
    isServiceShowcase: boolean;
    coverImage: string;
    logo: string | null;
    mediaImage: string | null;
  };
  translations: {
    en: TranslationContent;
    ar: TranslationContent;
  };
};

type ValidationError = { field: string; message: string };

const SYSTEM_CARD_ICON_SET = new Set<string>(SYSTEM_CARD_ICONS);
const SERVICE_SLUG_SET = new Set<string>(SERVICE_SLUGS);

function validateTranslation(lang: "en" | "ar", t: TranslationContent | undefined): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `translations.${lang}`;

  if (!t) {
    errors.push({ field: prefix, message: "translation is missing" });
    return errors;
  }
  if (typeof t.title !== "string" || t.title.trim() === "") {
    errors.push({ field: `${prefix}.title`, message: "title must be a non-empty string (NOT NULL column)" });
  }
  if (typeof t.description !== "string" || t.description.trim() === "") {
    errors.push({ field: `${prefix}.description`, message: "description must be a non-empty string (NOT NULL column)" });
  }
  if (!Array.isArray(t.systemCards)) {
    errors.push({ field: `${prefix}.systemCards`, message: "systemCards must be an array (NOT NULL column)" });
  } else {
    t.systemCards.forEach((card, i) => {
      if (!SYSTEM_CARD_ICON_SET.has(card.icon)) {
        errors.push({
          field: `${prefix}.systemCards[${i}].icon`,
          message: `icon "${card.icon}" is not one of SYSTEM_CARD_ICONS`,
        });
      }
    });
  }
  if (!Array.isArray(t.results)) {
    errors.push({ field: `${prefix}.results`, message: "results must be an array (NOT NULL column)" });
  }
  if (!Array.isArray(t.tags)) {
    errors.push({ field: `${prefix}.tags`, message: "tags must be an array (NOT NULL column)" });
  }
  if (!Array.isArray(t.technologies)) {
    errors.push({ field: `${prefix}.technologies`, message: "technologies must be an array (NOT NULL column)" });
  }

  return errors;
}

function validateEntry(entry: ContentPackEntry): ValidationError[] {
  const errors: ValidationError[] = [];
  const p = entry.project;

  if (typeof p.slug !== "string" || p.slug.trim() === "") {
    errors.push({ field: "project.slug", message: "slug must be a non-empty string (NOT NULL column)" });
  }
  if (!SERVICE_SLUG_SET.has(p.category)) {
    errors.push({
      field: "project.category",
      message: `category "${p.category}" is not one of SERVICE_SLUGS (${SERVICE_SLUGS.join(", ")})`,
    });
  }
  if (typeof p.coverImage !== "string" || p.coverImage.trim() === "") {
    errors.push({ field: "project.coverImage", message: "coverImage must be a non-empty string (NOT NULL column)" });
  }
  if (typeof p.isFeatured !== "boolean") {
    errors.push({ field: "project.isFeatured", message: "isFeatured must be a boolean (NOT NULL column)" });
  }
  if (typeof p.isServiceShowcase !== "boolean") {
    errors.push({ field: "project.isServiceShowcase", message: "isServiceShowcase must be a boolean (NOT NULL column)" });
  }

  errors.push(...validateTranslation("en", entry.translations?.en));
  errors.push(...validateTranslation("ar", entry.translations?.ar));

  return errors;
}

async function slugExists(slug: string): Promise<boolean> {
  const rows = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, slug)).limit(1);
  return rows.length > 0;
}

async function insertProject(entry: ContentPackEntry): Promise<void> {
  const p = entry.project;

  await db.transaction(async (tx) => {
    const [project] = await tx
      .insert(projects)
      .values({
        slug: p.slug,
        category: p.category,
        isFeatured: p.isFeatured,
        isServiceShowcase: p.isServiceShowcase,
        coverImage: p.coverImage,
        logo: p.logo,
        mediaImage: p.mediaImage,
      })
      .returning();

    for (const lang of ["en", "ar"] as const) {
      const t = entry.translations[lang];
      await tx.insert(projectTranslations).values({
        projectId: project.id,
        language: lang,
        title: t.title,
        description: t.description,
        categoryLabel: t.categoryLabel,
        clientName: t.clientName,
        clientSector: t.clientSector,
        clientCountry: t.clientCountry,
        clientModel: t.clientModel,
        problemHeadline: t.problemHeadline,
        problemBody: t.problemBody,
        diagnosisHeadline: t.diagnosisHeadline,
        diagnosisBody: t.diagnosisBody,
        systemHeadline: t.systemHeadline,
        systemCards: t.systemCards,
        results: t.results,
        mediaCaption: t.mediaCaption,
        ctaHeadline: t.ctaHeadline,
        ctaSubtext: t.ctaSubtext,
        tags: t.tags,
        technologies: t.technologies,
      });
    }
  });
}

async function main() {
  const args = process.argv.slice(2);
  const commit = args.includes("--commit");
  const dryRun = !commit;

  if (dryRun) {
    console.log("Running in DRY RUN mode — no writes will be performed. Pass --commit to write.\n");
  } else {
    console.log("Running in COMMIT mode — matching rows will be written.\n");
  }

  if (!fs.existsSync(CONTENT_PACK_PATH)) {
    console.error(`Content pack not found at ${CONTENT_PACK_PATH}`);
    process.exit(1);
  }

  const entries: ContentPackEntry[] = JSON.parse(fs.readFileSync(CONTENT_PACK_PATH, "utf-8"));

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const entry of entries) {
    const slug = entry.project?.slug ?? `<missing slug, sourceIndex ${entry.sourceIndex}>`;

    const exists = await slugExists(slug);
    if (exists) {
      console.log(`skipped (exists): ${slug}`);
      skipped++;
      continue;
    }

    const errors = validateEntry(entry);
    if (errors.length > 0) {
      console.error(`failed (validation): ${slug}`);
      for (const err of errors) {
        console.error(`  - ${err.field}: ${err.message}`);
      }
      failed++;
      continue;
    }

    if (dryRun) {
      console.log(`[dry-run] would insert: ${slug}`);
      inserted++;
      continue;
    }

    try {
      await insertProject(entry);
      console.log(`inserted: ${slug}`);
      inserted++;
    } catch (error) {
      // A unique-violation here means another process inserted this slug
      // between our pre-check and this transaction — treat it as an
      // idempotent skip rather than a failure.
      const isUniqueViolation =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: unknown }).code === "23505";

      if (isUniqueViolation) {
        console.log(`skipped (exists): ${slug}`);
        skipped++;
      } else {
        console.error(`failed (insert): ${slug} — ${error instanceof Error ? error.message : String(error)}`);
        failed++;
      }
    }
  }

  console.log(
    `\nSummary: ${inserted} ${dryRun ? "would be inserted" : "inserted"}, ${skipped} skipped, ${failed} failed${
      dryRun ? " (dry run — no writes performed)" : ""
    }`,
  );

  process.exit(failed > 0 ? 1 : 0);
}

main();
