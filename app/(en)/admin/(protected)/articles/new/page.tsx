import { listProjectsForSelect } from "@/lib/db/portfolio";
import type { Language } from "@/lib/language";
import { createArticleAction } from "../actions";
import { ArticleForm } from "../article-form";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isLanguage(value: string | undefined): value is Language {
  return value === "en" || value === "ar";
}

export default async function NewArticlePage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; lang?: string }>;
}) {
  const { group, lang } = await searchParams;

  // A missing or invalid group/lang pair falls back to a fresh, unlinked
  // create rather than an error page.
  const valid = Boolean(group && UUID_PATTERN.test(group) && isLanguage(lang));
  const translationGroupId = valid ? group : undefined;
  const lockedLanguage = valid ? (lang as Language) : undefined;

  const projects = await listProjectsForSelect();

  return (
    <main>
      <h1>New article</h1>
      <ArticleForm
        mode="create"
        action={createArticleAction}
        projects={projects}
        lockedLanguage={lockedLanguage}
        translationGroupId={translationGroupId}
      />
    </main>
  );
}
