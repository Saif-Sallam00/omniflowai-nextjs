import { z } from "zod";
import { languageEnum } from "@/lib/db/schema";
import { slugPatternForLanguage } from "@/lib/article-slug";
import { RELATED_SOLUTIONS } from "@/lib/article-solutions";
import type { Language } from "@/lib/language";

// Not a "use server" file — actions.ts (which is) may only export async
// functions, so every non-action helper the actions need lives here instead.
// Also (deliberately) not a "use client" file — article-form.tsx is, and a
// Server Component (the edit/new pages) cannot call a function exported from
// a "use client" module, only render its components.

export type CounterpartInfo = {
  language: Language;
  status: "published" | "draft" | "missing";
  href: string;
};

export function buildCounterpartInfo(
  translationGroupId: string,
  counterpartLanguage: Language,
  counterpartArticle: { id: number; published: boolean } | null,
): CounterpartInfo {
  if (!counterpartArticle) {
    return {
      language: counterpartLanguage,
      status: "missing",
      href: `/admin/articles/new?group=${translationGroupId}&lang=${counterpartLanguage}`,
    };
  }
  return {
    language: counterpartLanguage,
    status: counterpartArticle.published ? "published" : "draft",
    href: `/admin/articles/${counterpartArticle.id}/edit`,
  };
}

export type ArticleFieldName =
  | "language"
  | "title"
  | "slug"
  | "excerpt"
  | "coverImage"
  | "body"
  | "published"
  | "relatedProjectId"
  | "relatedSolution";

export type ArticleFormState = {
  status: "idle" | "success" | "error";
  fieldErrors: Partial<Record<ArticleFieldName, string[]>>;
  formError: string | null;
};

export const INITIAL_ARTICLE_FORM_STATE: ArticleFormState = {
  status: "idle",
  fieldErrors: {},
  formError: null,
};

const articleFormSchema = z
  .object({
    language: z.enum(languageEnum.enumValues),
    title: z.string().trim().min(1, "Title is required"),
    slug: z.string().trim().min(1, "Slug is required"),
    excerpt: z.string().trim().min(1, "Excerpt is required"),
    coverImage: z.string().trim().min(1, "A cover image is required"),
    body: z.string().trim().min(1, "Body is required"),
    published: z.boolean(),
    relatedProjectId: z.number().int().positive().nullable(),
    relatedSolution: z.enum(RELATED_SOLUTIONS).nullable(),
    // Trap #2: `undefined` (not supplied) lets stampPublishedAt auto-stamp on
    // first publish; only a real admin-supplied date becomes a Date here.
    // Never `null` — that would read as "explicitly clear," suppressing the
    // first-publish stamp.
    publishedAt: z.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (!slugPatternForLanguage(data.language).test(data.slug)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["slug"],
        message:
          data.language === "ar"
            ? "Slug must use Arabic letters, digits, and hyphens only, with no spaces"
            : "Slug must be lowercase letters, digits, and hyphens only, with no spaces",
      });
    }
  });

export type ArticleFormValues = z.infer<typeof articleFormSchema>;

function readArticleFormValues(formData: FormData): unknown {
  const relatedProjectIdRaw = formData.get("relatedProjectId");
  const relatedSolutionRaw = formData.get("relatedSolution");
  const publishedAtRaw = formData.get("publishedAt");

  return {
    language: formData.get("language"),
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    coverImage: formData.get("coverImage"),
    body: formData.get("body"),
    published: formData.get("published") === "on",
    relatedProjectId:
      typeof relatedProjectIdRaw === "string" && relatedProjectIdRaw !== ""
        ? Number(relatedProjectIdRaw)
        : null,
    relatedSolution:
      typeof relatedSolutionRaw === "string" && relatedSolutionRaw !== ""
        ? relatedSolutionRaw
        : null,
    publishedAt:
      typeof publishedAtRaw === "string" && publishedAtRaw !== ""
        ? new Date(publishedAtRaw)
        : undefined,
  };
}

export function parseArticleFormData(
  formData: FormData,
):
  | { success: true; data: ArticleFormValues }
  | { success: false; fieldErrors: Partial<Record<ArticleFieldName, string[]>> } {
  const parsed = articleFormSchema.safeParse(readArticleFormValues(formData));
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
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

// Correctness fix: `articles` has TWO unique constraints and both surface as
// Postgres 23505 — branching on the constraint NAME is required. Mapping
// every 23505 to the slug message would misattribute a counterpart-race
// failure to the wrong field.
export function mapUniqueViolation(
  error: unknown,
  language: Language,
): Pick<ArticleFormState, "fieldErrors" | "formError"> | null {
  if (!isUniqueViolation(error)) return null;

  if (error.constraint === "articles_language_slug_unique") {
    return { fieldErrors: { slug: ["That slug is already in use"] }, formError: null };
  }

  if (error.constraint === "articles_translation_group_id_language_unique") {
    return { fieldErrors: {}, formError: `An ${language} version of this article already exists` };
  }

  return null;
}
