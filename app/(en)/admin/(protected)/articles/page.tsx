import type { Metadata } from "next";
import Link from "next/link";
import { listArticleGroups, type ArticleGroupRow } from "@/lib/db/articles";
import { getLanguagePath } from "@/lib/language";
import { deleteArticleAction } from "./actions";
import { DeleteArticleForm } from "./delete-article-form";
import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/admin/card";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/admin/button";

export const metadata: Metadata = {
  title: "Admin — Articles",
};

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
      <div className="rounded-md border border-dashed border-gray-300 p-3 text-sm">
        <Link href={`/admin/articles/new?group=${groupId}&lang=${language}`} className="text-indigo-600 underline">
          Add {language === "en" ? "English" : "Arabic"} version
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-200 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-gray-900">{row.title}</span>
        <StatusBadge tone={row.published ? "success" : "neutral"}>
          {row.published ? "Published" : "Draft"}
        </StatusBadge>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
        <Link href={`/admin/articles/${row.id}/edit`} className="text-indigo-600 underline">
          Edit
        </Link>
        {row.published && (
          <a
            href={getLanguagePath(`/articles/${row.slug}`, language)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 underline"
          >
            Preview
          </a>
        )}
        <DeleteArticleForm action={deleteArticleAction.bind(null, row.id)} />
      </div>
    </div>
  );
}

export default async function AdminArticlesPage() {
  const groups = await listArticleGroups();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Articles"
        description={`${groups.length} concept${groups.length === 1 ? "" : "s"}`}
        action={
          <Link href="/admin/articles/new">
            <Button variant="primary">New article</Button>
          </Link>
        }
      />

      {groups.length === 0 ? (
        <p className="text-sm text-gray-600">No articles yet.</p>
      ) : (
        <ul className="space-y-4">
          {groups.map((group) => (
            <li key={group.translationGroupId}>
              <Card>
                <div className="grid gap-3 sm:grid-cols-2">
                  <LanguageColumn language="en" row={group.en} groupId={group.translationGroupId} />
                  <LanguageColumn language="ar" row={group.ar} groupId={group.translationGroupId} />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
