import Link from "next/link";
import { listArticleGroups, type ArticleGroupRow } from "@/lib/db/articles";
import { getLanguagePath } from "@/lib/language";
import { deleteArticleAction } from "./actions";
import { DeleteArticleForm } from "./delete-article-form";

function LanguageColumn({
  language,
  row,
  groupId,
}: {
  language: "en" | "ar";
  row: ArticleGroupRow | null;
  groupId: string;
}) {
  if (!row) {
    return (
      <div>
        <Link href={`/admin/articles/new?group=${groupId}&lang=${language}`}>
          Add {language === "en" ? "English" : "Arabic"} version
        </Link>
      </div>
    );
  }

  return (
    <div>
      <span>{row.title}</span>{" "}
      <span>{row.published ? "Published" : "Draft"}</span>{" "}
      <Link href={`/admin/articles/${row.id}/edit`}>Edit</Link>{" "}
      <a href={getLanguagePath(`/articles/${row.slug}`, language)} target="_blank" rel="noopener noreferrer">
        Preview
      </a>{" "}
      <DeleteArticleForm action={deleteArticleAction.bind(null, row.id)} />
    </div>
  );
}

export default async function AdminArticlesPage() {
  const groups = await listArticleGroups();

  return (
    <main>
      <h1>Articles</h1>
      <p>
        {groups.length} concept{groups.length === 1 ? "" : "s"}
      </p>
      <Link href="/admin/articles/new">New article</Link>

      {groups.length === 0 ? (
        <p>No articles yet.</p>
      ) : (
        <ul>
          {groups.map((group) => (
            <li key={group.translationGroupId}>
              <LanguageColumn language="en" row={group.en} groupId={group.translationGroupId} />
              <LanguageColumn language="ar" row={group.ar} groupId={group.translationGroupId} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
