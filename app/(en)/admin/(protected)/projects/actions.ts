"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-server";
import { getLanguagePath } from "@/lib/language";
import {
  createProject,
  updateProject,
  deleteProject,
  getProjectById,
  projectExistsWithSlug,
} from "@/lib/db/portfolio";
import {
  parseProjectFormData,
  mapUniqueViolation,
  type ProjectFormState,
} from "./project-form-schema";

function revalidateProjectPaths(slug: string): void {
  revalidatePath(getLanguagePath("/portfolio", "en"));
  revalidatePath(getLanguagePath("/portfolio", "ar"));
  revalidatePath(getLanguagePath(`/portfolio/${slug}`, "en"));
  revalidatePath(getLanguagePath(`/portfolio/${slug}`, "ar"));
}

export async function createProjectAction(
  prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAuth();

  const parsed = parseProjectFormData(formData);
  if (!parsed.success) {
    return { status: "idle", fieldErrors: parsed.fieldErrors, formError: null };
  }
  const data = parsed.data;

  if (await projectExistsWithSlug(data.slug)) {
    return {
      status: "idle",
      fieldErrors: { slug: ["That slug is already in use"] },
      formError: null,
    };
  }

  try {
    await createProject(data);
  } catch (error) {
    const mapped = mapUniqueViolation(error);
    if (!mapped) throw error;
    return { status: "idle", ...mapped };
  }

  revalidatePath("/admin/projects");
  revalidateProjectPaths(data.slug);
  redirect("/admin/projects");
}

export async function updateProjectAction(
  id: number,
  prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAuth();

  const current = await getProjectById(id);
  if (!current) {
    return { status: "error", fieldErrors: {}, formError: "Project not found" };
  }

  const parsed = parseProjectFormData(formData);
  if (!parsed.success) {
    return { status: "idle", fieldErrors: parsed.fieldErrors, formError: null };
  }
  const data = parsed.data;

  // Only run the slug-clash pre-check when the slug is actually changing —
  // an unchanged slug can never clash against the project's own current row.
  if (data.slug !== current.slug && (await projectExistsWithSlug(data.slug, id))) {
    return {
      status: "idle",
      fieldErrors: { slug: ["That slug is already in use"] },
      formError: null,
    };
  }

  let updated;
  try {
    updated = await updateProject(id, data);
  } catch (error) {
    const mapped = mapUniqueViolation(error);
    if (!mapped) throw error;
    return { status: "idle", ...mapped };
  }

  if (!updated) {
    return { status: "error", fieldErrors: {}, formError: "Project not found" };
  }

  revalidatePath("/admin/projects");
  revalidateProjectPaths(current.slug);
  if (updated.slug !== current.slug) {
    revalidateProjectPaths(updated.slug);
  }
  redirect("/admin/projects");
}

export async function deleteProjectAction(id: number): Promise<void> {
  await requireAuth();

  const current = await getProjectById(id);
  if (!current) return;

  await deleteProject(id);

  revalidatePath("/admin/projects");
  revalidateProjectPaths(current.slug);
}
