"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-server";
import { getLanguagePath, type Language } from "@/lib/language";
import {
  createArticle,
  updateArticle,
  deleteArticle,
  getArticleById,
  getArticleBySlug,
  getArticleByTranslationGroupAndLanguage,
} from "@/lib/db/articles";
import {
  parseArticleFormData,
  mapUniqueViolation,
  type ArticleFormState,
} from "./article-form-schema";

function revalidateArticlePaths(language: Language, slug: string): void {
  revalidatePath(getLanguagePath("/articles", language));
  revalidatePath(getLanguagePath(`/articles/${slug}`, language));
}

export async function createArticleAction(
  prevState: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  await requireAuth();

  const parsed = parseArticleFormData(formData);
  if (!parsed.success) {
    return { status: "idle", fieldErrors: parsed.fieldErrors, formError: null };
  }
  const data = parsed.data;

  const existingSlug = await getArticleBySlug(data.slug, data.language);
  if (existingSlug) {
    return {
      status: "idle",
      fieldErrors: { slug: ["That slug is already in use"] },
      formError: null,
    };
  }

  const translationGroupIdRaw = formData.get("translationGroupId");
  const translationGroupId =
    typeof translationGroupIdRaw === "string" && translationGroupIdRaw !== ""
      ? translationGroupIdRaw
      : undefined;

  // Counterpart pre-check (FR-3.3): before inserting a counterpart, reject
  // immediately if the target group already has a row in this language — the
  // DB's own unique constraint remains the authoritative race backstop below.
  if (translationGroupId) {
    const clash = await getArticleByTranslationGroupAndLanguage(
      translationGroupId,
      data.language,
    );
    if (clash) {
      return {
        status: "idle",
        fieldErrors: {},
        formError: `An ${data.language} version of this article already exists`,
      };
    }
  }

  let created;
  try {
    created = await createArticle({
      translationGroupId,
      language: data.language,
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      body: data.body,
      coverImage: data.coverImage,
      published: data.published,
      publishedAt: data.publishedAt,
      relatedProjectId: data.relatedProjectId,
      relatedSolution: data.relatedSolution,
    });
  } catch (error) {
    const mapped = mapUniqueViolation(error, data.language);
    if (!mapped) throw error;
    return { status: "idle", ...mapped };
  }

  revalidatePath("/admin/articles");
  revalidateArticlePaths(created.language, created.slug);
  redirect("/admin/articles");
}

export async function updateArticleAction(
  id: number,
  prevState: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  await requireAuth();

  const current = await getArticleById(id);
  if (!current) {
    return { status: "error", fieldErrors: {}, formError: "Article not found" };
  }

  const parsed = parseArticleFormData(formData);
  if (!parsed.success) {
    return { status: "idle", fieldErrors: parsed.fieldErrors, formError: null };
  }
  const data = parsed.data;

  // Trap #1: getArticleBySlug returns no id to exclude the current row, so
  // only run the pre-check when the slug is actually changing — when it is
  // changing, any match found is necessarily a different row (this row's
  // slug, by definition, is no longer that value). Skipping the check for an
  // unchanged slug avoids a false self-clash on an ordinary re-save.
  if (data.slug !== current.slug) {
    const existingSlug = await getArticleBySlug(data.slug, data.language);
    if (existingSlug) {
      return {
        status: "idle",
        fieldErrors: { slug: ["That slug is already in use"] },
        formError: null,
      };
    }
  }

  let updated;
  try {
    updated = await updateArticle(id, {
      language: data.language,
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      body: data.body,
      coverImage: data.coverImage,
      published: data.published,
      publishedAt: data.publishedAt,
      relatedProjectId: data.relatedProjectId,
      relatedSolution: data.relatedSolution,
    });
  } catch (error) {
    const mapped = mapUniqueViolation(error, data.language);
    if (!mapped) throw error;
    return { status: "idle", ...mapped };
  }

  if (!updated) {
    return { status: "error", fieldErrors: {}, formError: "Article not found" };
  }

  revalidatePath("/admin/articles");
  // Revalidate the old detail path (the slug may have changed) as well as
  // the current one, so a renamed slug's old URL doesn't serve stale ISR
  // content forever.
  revalidateArticlePaths(current.language, current.slug);
  if (updated.slug !== current.slug) {
    revalidateArticlePaths(updated.language, updated.slug);
  }
  redirect("/admin/articles");
}

export async function deleteArticleAction(id: number): Promise<void> {
  await requireAuth();

  const current = await getArticleById(id);
  if (!current) return;

  await deleteArticle(id);

  revalidatePath("/admin/articles");
  revalidateArticlePaths(current.language, current.slug);
}
