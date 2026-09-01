import Link from "next/link";
import { listProjectsForAdmin } from "@/lib/db/portfolio";
import { getLanguagePath } from "@/lib/language";
import { deleteProjectAction } from "./actions";
import { DeleteProjectForm } from "./delete-project-form";

export default async function AdminProjectsPage() {
  const projects = await listProjectsForAdmin();

  return (
    <main>
      <h1>Projects</h1>
      <p>
        {projects.length} project{projects.length === 1 ? "" : "s"}
      </p>
      <Link href="/admin/projects/new">New project</Link>

      {projects.length === 0 ? (
        <p>No projects yet.</p>
      ) : (
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <img src={project.coverImage} alt="" style={{ maxWidth: 80 }} />
              <span>{project.title}</span> <span>{project.category}</span>{" "}
              {project.isFeatured && <span>Featured</span>}{" "}
              {project.isServiceShowcase && <span>Showcase</span>}{" "}
              <Link href={`/admin/projects/${project.id}/edit`}>Edit</Link>{" "}
              <a
                href={getLanguagePath(`/portfolio/${project.slug}`, "en")}
                target="_blank"
                rel="noopener noreferrer"
              >
                Preview (EN)
              </a>{" "}
              <a
                href={getLanguagePath(`/portfolio/${project.slug}`, "ar")}
                target="_blank"
                rel="noopener noreferrer"
              >
                Preview (AR)
              </a>{" "}
              <DeleteProjectForm action={deleteProjectAction.bind(null, project.id)} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
