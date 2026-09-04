import type { Metadata } from "next";
import { listProjectCategories } from "@/lib/db/portfolio";
import { createProjectAction } from "../actions";
import { ProjectForm } from "../project-form";

export const metadata: Metadata = {
  title: "Admin — New Project",
};

export default async function NewProjectPage() {
  const categories = await listProjectCategories();

  return (
    <main>
      <h1>New project</h1>
      <ProjectForm mode="create" action={createProjectAction} categories={categories} />
    </main>
  );
}
