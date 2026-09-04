import type { Metadata } from "next";
import Link from "next/link";
import { listProjectsForAdmin } from "@/lib/db/portfolio";
import { getLanguagePath } from "@/lib/language";
import { deleteProjectAction } from "./actions";
import { DeleteProjectForm } from "./delete-project-form";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/admin/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { Table, TableHead, TableRow, TableCell } from "@/components/admin/table";

export const metadata: Metadata = {
  title: "Admin — Projects",
};

export default async function AdminProjectsPage() {
  const projects = await listProjectsForAdmin();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Projects"
        description={`${projects.length} project${projects.length === 1 ? "" : "s"}`}
        action={
          <Link href="/admin/projects/new">
            <Button variant="primary">New project</Button>
          </Link>
        }
      />

      {projects.length === 0 ? (
        <p className="text-sm text-gray-600">No projects yet.</p>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell header>Cover</TableCell>
              <TableCell header>Title</TableCell>
              <TableCell header>Category</TableCell>
              <TableCell header>Flags</TableCell>
              <TableCell header>Actions</TableCell>
            </TableRow>
          </TableHead>
          <tbody className="divide-y divide-gray-200">
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <img src={project.coverImage} alt="" style={{ maxWidth: 80 }} className="rounded-md" />
                </TableCell>
                <TableCell>{project.title}</TableCell>
                <TableCell>{project.category}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {project.isFeatured && <StatusBadge tone="success">Featured</StatusBadge>}
                    {project.isServiceShowcase && <StatusBadge tone="neutral">Showcase</StatusBadge>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <Link href={`/admin/projects/${project.id}/edit`} className="text-indigo-600 underline">
                      Edit
                    </Link>
                    <a
                      href={getLanguagePath(`/portfolio/${project.slug}`, "en")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 underline"
                    >
                      Preview (EN)
                    </a>
                    <a
                      href={getLanguagePath(`/portfolio/${project.slug}`, "ar")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 underline"
                    >
                      Preview (AR)
                    </a>
                    <DeleteProjectForm action={deleteProjectAction.bind(null, project.id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
