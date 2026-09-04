import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleById, getArticleByTranslationGroupAndLanguage } from "@/lib/db/articles";
import { listProjectsForSelect } from "@/lib/db/portfolio";
import { updateArticleAction } from "../../actions";
import { ArticleForm } from "../../article-form";
import { buildCounterpartInfo } from "../../article-form-schema";

export const metadata: Metadata = {
  title: "Admin — Edit Article",
};

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) notFound();

  const article = await getArticleById(id);
  if (!article) notFound();

  const projects = await listProjectsForSelect();
  const counterpartLanguage = article.language === "en" ? "ar" : "en";
  const counterpart = buildCounterpartInfo(
    article.translationGroupId,
    counterpartLanguage,
    await getArticleByTranslationGroupAndLanguage(article.translationGroupId, counterpartLanguage),
  );

  return (
    <ArticleForm
      mode="edit"
      action={updateArticleAction.bind(null, id)}
      projects={projects}
      counterpart={counterpart}
      initialValues={{
        language: article.language,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        coverImage: article.coverImage,
        body: article.body,
        published: article.published,
        publishedAt: article.publishedAt,
        relatedProjectId: article.relatedProjectId,
        relatedSolution: article.relatedSolution,
      }}
    />
  );
}
