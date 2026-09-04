import type { Metadata } from "next";
import Link from "next/link";
import { listProjectsForAdmin, listProjectCategories, type ProjectAdminListItem } from "@/lib/db/portfolio";
import { getLanguagePath } from "@/lib/language";
import { deleteProjectAction } from "./actions";
import { DeleteProjectForm } from "./delete-project-form";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/admin/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { EmptyState } from "@/components/admin/empty-state";
import { Table, TableHead, TableRow, TableCell } from "@/components/admin/table";
import { SearchInput } from "@/components/admin/search-input";
import { FilterSelect } from "@/components/admin/filter-select";
import { OverflowMenu, OverflowMenuLink } from "@/components/admin/overflow-menu";
import { textMuted, textPrimary } from "@/components/admin/palette";

export const metadata: Metadata = {
  title: "Admin — Projects",
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" });

function filterProjects(
  projects: ProjectAdminListItem[],
  q: string,
  category: string,
  featured: string,
  showcase: string,
): ProjectAdminListItem[] {
  let result = projects;
  if (q.trim()) {
    const needle = q.trim().toLowerCase();
    result = result.filter((p) => p.title.toLowerCase().includes(needle) || p.slug.toLowerCase().includes(needle));
  }
  if (category) result = result.filter((p) => p.category === category);
  if (featured === "yes") result = result.filter((p) => p.isFeatured);
  if (showcase === "yes") result = result.filter((p) => p.isServiceShowcase);
  return result;
}

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; featured?: string; showcase?: string }>;
}) {
  const { q = "", category = "", featured = "", showcase = "" } = await searchParams;
  const [allProjects, categories] = await Promise.all([listProjectsForAdmin(), listProjectCategories()]);
  const projects = filterProjects(allProjects, q, category, featured, showcase);
  const isFiltered = Boolean(q.trim() || category || featured || showcase);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Projects"
        description={`${allProjects.length} project${allProjects.length === 1 ? "" : "s"}`}
        action={
          <Link href="/admin/projects/new">
            <Button variant="primary">New project</Button>
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput placeholder="Search projects…" />
        <FilterSelect
          paramName="category"
          ariaLabel="Filter by category"
          options={[{ value: "", label: "All categories" }, ...categories.map((c) => ({ value: c, label: c }))]}
        />
        <FilterSelect
          paramName="featured"
          ariaLabel="Filter by featured"
          options={[
            { value: "", label: "Featured: any" },
            { value: "yes", label: "Featured only" },
          ]}
        />
        <FilterSelect
          paramName="showcase"
          ariaLabel="Filter by showcase"
          options={[
            { value: "", label: "Showcase: any" },
            { value: "yes", label: "Showcase only" },
          ]}
        />
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title={isFiltered ? "No projects match these filters." : "No projects yet."}
          description={isFiltered ? "Try changing your search or filters." : "Create your first project to get started."}
          action={
            isFiltered ? (
              <Link href="/admin/projects">
                <Button variant="secondary">Clear filters</Button>
              </Link>
            ) : (
              <Link href="/admin/projects/new">
                <Button variant="primary">New project</Button>
              </Link>
            )
          }
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell header>Project</TableCell>
              <TableCell header>Category</TableCell>
              <TableCell header>Flags</TableCell>
              <TableCell header>Updated</TableCell>
              <TableCell header>Actions</TableCell>
            </TableRow>
          </TableHead>
          <tbody className="divide-y divide-admin-border">
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <Link href={`/admin/projects/${project.id}/edit`} className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- remote, user-uploaded thumbnail */}
                    <img src={project.coverImage} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover" />
                    <span className="min-w-0">
                      <span className={`block truncate font-medium ${textPrimary}`}>{project.title}</span>
                      <span className={`block truncate text-xs ${textMuted}`}>/{project.slug}</span>
                    </span>
                  </Link>
                </TableCell>
                <TableCell>{project.category}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {project.isFeatured && <StatusBadge tone="success">Featured</StatusBadge>}
                    {project.isServiceShowcase && <StatusBadge tone="neutral">Showcase</StatusBadge>}
                  </div>
                </TableCell>
                <TableCell className={textMuted}>{DATE_FORMAT.format(project.updatedAt)}</TableCell>
                <TableCell>
                  <OverflowMenu label={`Actions for ${project.title}`}>
                    <OverflowMenuLink external href={getLanguagePath(`/portfolio/${project.slug}`, "en")}>
                      Preview English
                    </OverflowMenuLink>
                    <OverflowMenuLink external href={getLanguagePath(`/portfolio/${project.slug}`, "ar")}>
                      Preview Arabic
                    </OverflowMenuLink>
                    <DeleteProjectForm action={deleteProjectAction.bind(null, project.id)} recordLabel={project.title} />
                  </OverflowMenu>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
