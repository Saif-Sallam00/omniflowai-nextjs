import { z } from "zod";
import { SYSTEM_CARD_ICONS } from "@/lib/db/schema";
import { SLUG_PATTERN_EN } from "@/lib/article-slug";

// Not a "use server" file — actions.ts (which is) may only export async
// functions, so every non-action helper the actions need lives here instead.

// The `(string & {})` branch keeps literal autocomplete for the common cases
// below while still accepting the dynamic dotted/indexed paths this form's
// errors actually use at runtime (e.g. "en.clientName", "systemCards.0.titleAr")
// — see fieldErrorsFromIssues, which groups by the full dotted path, not just
// these top-level names.
export type ProjectFieldName =
  | "slug"
  | "category"
  | "coverImage"
  | "logo"
  | "mediaImage"
  | "isFeatured"
  | "isServiceShowcase"
  | "systemCards"
  | "results"
  | "en.title"
  | "en.description"
  | "ar.title"
  | "ar.description"
  | "en.tags"
  | "ar.tags"
  | "en.technologies"
  | "ar.technologies"
  | (string & {});

export type ProjectFormState = {
  status: "idle" | "success" | "error";
  fieldErrors: Partial<Record<ProjectFieldName, string[]>>;
  formError: string | null;
};

export const INITIAL_PROJECT_FORM_STATE: ProjectFormState = {
  status: "idle",
  fieldErrors: {},
  formError: null,
};

const systemCardSlotSchema = z.object({
  icon: z.enum(SYSTEM_CARD_ICONS),
  titleEn: z.string().trim().min(1, "English title is required"),
  descriptionEn: z.string().trim().min(1, "English description is required"),
  titleAr: z.string().trim().min(1, "Arabic title is required"),
  descriptionAr: z.string().trim().min(1, "Arabic description is required"),
});

const resultSlotSchema = z.object({
  value: z.string().trim().min(1, "Value is required"),
  labelEn: z.string().trim().min(1, "English label is required"),
  labelAr: z.string().trim().min(1, "Arabic label is required"),
});

const translationContentSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  categoryLabel: z.string().trim().nullable(),
  clientName: z.string().trim().nullable(),
  clientSector: z.string().trim().nullable(),
  clientCountry: z.string().trim().nullable(),
  clientModel: z.string().trim().nullable(),
  problemHeadline: z.string().trim().nullable(),
  problemBody: z.string().trim().nullable(),
  diagnosisHeadline: z.string().trim().nullable(),
  diagnosisBody: z.string().trim().nullable(),
  systemHeadline: z.string().trim().nullable(),
  mediaCaption: z.string().trim().nullable(),
  ctaHeadline: z.string().trim().nullable(),
  ctaSubtext: z.string().trim().nullable(),
  tags: z.array(z.string().trim().min(1)),
  technologies: z.array(z.string().trim().min(1)),
});

const projectFormSchema = z.object({
  slug: z.string().trim().min(1, "Slug is required").regex(SLUG_PATTERN_EN, "Slug must be lowercase letters, digits, and hyphens only, with no spaces"),
  category: z.string().trim().min(1, "Category is required"),
  coverImage: z.string().trim().min(1, "A cover image is required"),
  logo: z.string().trim().nullable(),
  mediaImage: z.string().trim().nullable(),
  isFeatured: z.boolean(),
  isServiceShowcase: z.boolean(),
  systemCards: z
    .array(systemCardSlotSchema)
    .min(1, "At least 1 system card is required")
    .max(6, "At most 6 system cards are allowed"),
  results: z.array(resultSlotSchema),
  en: translationContentSchema,
  ar: translationContentSchema,
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

function readJsonArray(formData: FormData, field: string): unknown[] {
  const raw = formData.get(field);
  if (typeof raw !== "string" || raw === "") return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readTranslationContent(formData: FormData, prefix: "en" | "ar") {
  const optional = (field: string) => {
    const value = formData.get(`${prefix}.${field}`);
    return typeof value === "string" && value.trim() !== "" ? value : null;
  };

  return {
    title: formData.get(`${prefix}.title`),
    description: formData.get(`${prefix}.description`),
    categoryLabel: optional("categoryLabel"),
    clientName: optional("clientName"),
    clientSector: optional("clientSector"),
    clientCountry: optional("clientCountry"),
    clientModel: optional("clientModel"),
    problemHeadline: optional("problemHeadline"),
    problemBody: optional("problemBody"),
    diagnosisHeadline: optional("diagnosisHeadline"),
    diagnosisBody: optional("diagnosisBody"),
    systemHeadline: optional("systemHeadline"),
    mediaCaption: optional("mediaCaption"),
    ctaHeadline: optional("ctaHeadline"),
    ctaSubtext: optional("ctaSubtext"),
    tags: readJsonArray(formData, `${prefix}TagsJson`),
    technologies: readJsonArray(formData, `${prefix}TechnologiesJson`),
  };
}

function readProjectFormValues(formData: FormData): unknown {
  const logoRaw = formData.get("logo");
  const mediaImageRaw = formData.get("mediaImage");

  return {
    slug: formData.get("slug"),
    category: formData.get("category"),
    coverImage: formData.get("coverImage"),
    logo: typeof logoRaw === "string" && logoRaw !== "" ? logoRaw : null,
    mediaImage: typeof mediaImageRaw === "string" && mediaImageRaw !== "" ? mediaImageRaw : null,
    isFeatured: formData.get("isFeatured") === "on",
    isServiceShowcase: formData.get("isServiceShowcase") === "on",
    systemCards: readJsonArray(formData, "systemCardsJson"),
    results: readJsonArray(formData, "resultsJson"),
    en: readTranslationContent(formData, "en"),
    ar: readTranslationContent(formData, "ar"),
  };
}

// Zod's own .flatten() only groups issues by their TOP-level path segment —
// a nested issue at ["en", "title"] would collapse to fieldErrors.en, not
// fieldErrors["en.title"]. This form's errors need to reach nested fields
// (en.title, ar.description, ...), so issues are grouped by their full
// dotted path instead.
function fieldErrorsFromIssues(
  issues: z.ZodIssue[],
): Partial<Record<ProjectFieldName, string[]>> {
  const fieldErrors: Partial<Record<string, string[]>> = {};
  for (const issue of issues) {
    const key = issue.path.join(".");
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fieldErrors as Partial<Record<ProjectFieldName, string[]>>;
}

export function parseProjectFormData(
  formData: FormData,
):
  | { success: true; data: ProjectFormValues }
  | { success: false; fieldErrors: Partial<Record<ProjectFieldName, string[]>> } {
  const parsed = projectFormSchema.safeParse(readProjectFormValues(formData));
  if (!parsed.success) {
    return { success: false, fieldErrors: fieldErrorsFromIssues(parsed.error.issues) };
  }
  return { success: true, data: parsed.data };
}

type PgUniqueViolation = { code: string; constraint?: string };

function isUniqueViolation(error: unknown): error is PgUniqueViolation {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}

// projects has exactly one unique constraint today (projects_slug_unique) —
// still branch on the constraint name rather than assuming any 23505 means
// a slug clash, so an unrecognized future constraint re-throws instead of
// being silently mislabeled.
export function mapUniqueViolation(
  error: unknown,
): Pick<ProjectFormState, "fieldErrors" | "formError"> | null {
  if (!isUniqueViolation(error)) return null;

  if (error.constraint === "projects_slug_unique") {
    return { fieldErrors: { slug: ["That slug is already in use"] }, formError: null };
  }

  return null;
}
