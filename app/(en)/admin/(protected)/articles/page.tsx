import type { Metadata } from "next";
import Link from "next/link";
import { listArticleGroups, type ArticleGroup, type ArticleGroupRow } from "@/lib/db/articles";
import { getLanguagePath } from "@/lib/language";
import { deleteArticleAction } from "./actions";
import { DeleteArticleForm } from "./delete-article-form";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/admin/button";
import { EmptyState } from "@/components/admin/empty-state";
import { Table, TableHead, TableRow, TableCell } from "@/components/admin/table";
import { SearchInput } from "@/components/admin/search-input";
import { FilterSelect } from "@/components/admin/filter-select";
import { OverflowMenu, OverflowMenuLink } from "@/components/admin/overflow-menu";
import { accent, textMuted } from "@/components/admin/palette";

export const metadata: Metadata = {
  title: "Admin — Articles",
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" });

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "missing-ar", label: "Missing Arabic" },
  { value: "missing-en", label: "Missing English" },
];

function filterGroups(groups: ArticleGroup[], q: string, status: string): ArticleGroup[] {
  let result = groups;
  if (q.trim()) {
    const needle = q.trim().toLowerCase();
    result = result.filter(
      (group) => (group.en?.title ?? "").toLowerCase().includes(needle) || (group.ar?.title ?? "").toLowerCase().includes(needle),
    );
  }
  switch (status) {
    case "published":
      return result.filter((group) => group.en?.published || group.ar?.published);
    case "draft":
      return result.filter((group) => (group.en && !group.en.published) || (group.ar && !group.ar.published));
    case "missing-ar":
      return result.filter((group) => !group.ar);
    case "missing-en":
      return result.filter((group) => !group.en);
    default:
      return result;
  }
}

function LanguageCell({ language, row, groupId }: { language: "en" | "ar"; row: ArticleGroupRow | null; groupId: string }) {
  if (!row) {
    return (
      <Link href={`/admin/articles/new?group=${groupId}&lang=${language}`} className={`text-sm ${accent} underline`}>
        + Add {language === "en" ? "English" : "Arabic"}
      </Link>
    );
  }
  return (
    <Link href={`/admin/articles/${row.id}/edit`}>
      <StatusBadge tone={row.published ? "success" : "neutral"}>{row.published ? "Published" : "Draft"}</StatusBadge>
    </Link>
  );
}

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = "", status = "" } = await searchParams;
  const allGroups = await listArticleGroups();
  const groups = filterGroups(allGroups, q, status);
  const isFiltered = Boolean(q.trim() || status);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Articles"
        description={`${allGroups.length} concept${allGroups.length === 1 ? "" : "s"}`}
        action={
          <Link href="/admin/articles/new">
            <Button variant="primary">New article</Button>
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput placeholder="Search articles…" />
        <FilterSelect paramName="status" options={STATUS_OPTIONS} ariaLabel="Filter by status" />
      </div>

      {groups.length === 0 ? (
        <EmptyState
          title={isFiltered ? "No articles match these filters." : "No articles yet."}
          description={isFiltered ? "Try changing your search or filters." : "Create your first article to get started."}
          action={
            isFiltered ? (
              <Link href="/admin/articles">
                <Button variant="secondary">Clear filters</Button>
              </Link>
            ) : (
              <Link href="/admin/articles/new">
                <Button variant="primary">New article</Button>
              </Link>
            )
          }
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell header>Title</TableCell>
              <TableCell header>EN</TableCell>
              <TableCell header>AR</TableCell>
              <TableCell header>Updated</TableCell>
              <TableCell header>Actions</TableCell>
            </TableRow>
          </TableHead>
          <tbody className="divide-y divide-admin-border">
            {groups.map((group) => {
              const title = group.en?.title ?? group.ar?.title ?? "Untitled";
              return (
                <TableRow key={group.translationGroupId}>
                  <TableCell className="max-w-xs truncate font-medium">{title}</TableCell>
                  <TableCell>
                    <LanguageCell language="en" row={group.en} groupId={group.translationGroupId} />
                  </TableCell>
                  <TableCell>
                    <LanguageCell language="ar" row={group.ar} groupId={group.translationGroupId} />
                  </TableCell>
                  <TableCell className={textMuted}>{DATE_FORMAT.format(group.updatedAt)}</TableCell>
                  <TableCell>
                    <OverflowMenu label={`Actions for ${title}`}>
                      {group.en?.published && (
                        <OverflowMenuLink external href={getLanguagePath(`/articles/${group.en.slug}`, "en")}>
                          Preview English
                        </OverflowMenuLink>
                      )}
                      {group.ar?.published && (
                        <OverflowMenuLink external href={getLanguagePath(`/articles/${group.ar.slug}`, "ar")}>
                          Preview Arabic
                        </OverflowMenuLink>
                      )}
                      {group.en && (
                        <DeleteArticleForm
                          action={deleteArticleAction.bind(null, group.en.id)}
                          recordLabel={`${title} (English)`}
                          menuLabel="Delete English"
                        />
                      )}
                      {group.ar && (
                        <DeleteArticleForm
                          action={deleteArticleAction.bind(null, group.ar.id)}
                          recordLabel={`${title} (Arabic)`}
                          menuLabel="Delete Arabic"
                        />
                      )}
                    </OverflowMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}
