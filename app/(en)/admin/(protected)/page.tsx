import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Briefcase, Inbox } from "lucide-react";
import { listArticleGroups } from "@/lib/db/articles";
import { listProjectsForAdmin } from "@/lib/db/portfolio";
import { listLeads } from "@/lib/db/leads";
import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/admin/card";
import { Button } from "@/components/admin/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { textPrimary, textMuted, textSecondary, border } from "@/components/admin/palette";

export const metadata: Metadata = {
  title: "Admin dashboard",
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" });

function timeAgo(date: Date): string {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return DATE_FORMAT.format(date);
}

function StatCard({
  icon: Icon,
  label,
  href,
  stats,
}: {
  icon: typeof FileText;
  label: string;
  href: string;
  stats: { value: number; label: string }[];
}) {
  return (
    <Link href={href}>
      <Card className="h-full space-y-3 transition-colors hover:border-admin-border-strong">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-admin-accent" aria-hidden />
          <span className={`text-sm font-semibold ${textPrimary}`}>{label}</span>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className={`text-2xl font-bold tabular-nums ${textPrimary}`}>{stat.value}</div>
              <div className={`text-xs ${textMuted}`}>{stat.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </Link>
  );
}

type RecentItem = { key: string; title: string; href: string; updatedAt: Date; kind: "Article" | "Project" };

export default async function AdminDashboard() {
  const [articleGroups, projects, newLeads] = await Promise.all([
    listArticleGroups(),
    listProjectsForAdmin(),
    listLeads("new"),
  ]);

  const articleRows = articleGroups.flatMap((g) => [g.en, g.ar].filter((r) => r !== null));
  const publishedArticles = articleRows.filter((r) => r.published).length;
  const draftArticles = articleRows.length - publishedArticles;
  const featuredProjects = projects.filter((p) => p.isFeatured).length;

  const recent: RecentItem[] = [
    ...articleGroups.map((g) => ({
      key: `article-${g.translationGroupId}`,
      title: g.en?.title ?? g.ar?.title ?? "Untitled",
      href: `/admin/articles/${(g.en ?? g.ar)!.id}/edit`,
      updatedAt: g.updatedAt,
      kind: "Article" as const,
    })),
    ...projects.map((p) => ({
      key: `project-${p.id}`,
      title: p.title,
      href: `/admin/projects/${p.id}/edit`,
      updatedAt: p.updatedAt,
      kind: "Project" as const,
    })),
  ]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Overview"
        action={
          <>
            <Link href="/admin/articles/new">
              <Button variant="secondary">+ New article</Button>
            </Link>
            <Link href="/admin/projects/new">
              <Button variant="primary">+ New project</Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={FileText}
          label="Articles"
          href="/admin/articles"
          stats={[
            { value: articleRows.length, label: "Total" },
            { value: publishedArticles, label: "Published" },
            { value: draftArticles, label: "Draft" },
          ]}
        />
        <StatCard
          icon={Briefcase}
          label="Projects"
          href="/admin/projects"
          stats={[
            { value: projects.length, label: "Total" },
            { value: featuredProjects, label: "Featured" },
          ]}
        />
        <StatCard
          icon={Inbox}
          label="Leads"
          href="/admin/leads"
          stats={[{ value: newLeads.length, label: "New" }]}
        />
      </div>

      <Card>
        <h2 className={`mb-3 text-sm font-semibold ${textPrimary}`}>Recently updated</h2>
        {recent.length === 0 ? (
          <p className={`text-sm ${textMuted}`}>Nothing yet — create your first article or project.</p>
        ) : (
          <ul className={`divide-y ${border}`}>
            {recent.map((item) => (
              <li key={item.key} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <Link href={item.href} className={`min-w-0 truncate text-sm font-medium ${textSecondary} hover:text-admin-text-primary`}>
                  {item.title}
                </Link>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge tone="neutral">{item.kind}</StatusBadge>
                  <span className={`text-xs ${textMuted}`}>{timeAgo(item.updatedAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
