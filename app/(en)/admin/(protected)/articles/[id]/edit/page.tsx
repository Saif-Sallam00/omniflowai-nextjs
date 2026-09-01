import { notFound } from "next/navigation";
import { getArticleById } from "@/lib/db/articles";
import { listProjectsForSelect } from "@/lib/db/portfolio";
import { getLanguagePath } from "@/lib/language";
import { updateArticleAction } from "../../actions";
import { ArticleForm } from "../../article-form";

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

  return (
    <main>
      <h1>Edit article</h1>
      {article.published && (
        <a
          href={getLanguagePath(`/articles/${article.slug}`, article.language)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Preview
        </a>
      )}
      <ArticleForm
        mode="edit"
        action={updateArticleAction.bind(null, id)}
        projects={projects}
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
    </main>
  );
}
