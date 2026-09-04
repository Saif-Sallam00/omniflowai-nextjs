import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectById, listProjectCategories, type SystemCard, type ResultMetric } from "@/lib/db/portfolio";
import { updateProjectAction } from "../../actions";
import { ProjectForm, type ProjectFormInitialValues } from "../../project-form";
import type { SystemCardSlot } from "../../system-cards-editor";
import type { ResultSlot } from "../../results-editor";

export const metadata: Metadata = {
  title: "Admin — Edit Project",
};

function zipSystemCards(en: SystemCard[], ar: SystemCard[]): SystemCardSlot[] {
  return en.map((enCard, i) => {
    const arCard = ar[i];
    return {
      icon: enCard.icon,
      titleEn: enCard.title,
      descriptionEn: enCard.description,
      titleAr: arCard?.title ?? "",
      descriptionAr: arCard?.description ?? "",
    };
  });
}

function zipResults(en: ResultMetric[], ar: ResultMetric[]): ResultSlot[] {
  return en.map((enResult, i) => ({
    value: enResult.value,
    labelEn: enResult.label,
    labelAr: ar[i]?.label ?? "",
  }));
}

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) notFound();

  const project = await getProjectById(id);
  if (!project) notFound();

  const categories = await listProjectCategories();

  const enSystemCards = (project.en.systemCards as SystemCard[] | null) ?? [];
  const arSystemCards = (project.ar.systemCards as SystemCard[] | null) ?? [];
  const enResults = (project.en.results as ResultMetric[] | null) ?? [];
  const arResults = (project.ar.results as ResultMetric[] | null) ?? [];

  const initialValues: ProjectFormInitialValues = {
    slug: project.slug,
    category: project.category,
    isFeatured: project.isFeatured,
    isServiceShowcase: project.isServiceShowcase,
    coverImage: project.coverImage,
    logo: project.logo,
    mediaImage: project.mediaImage,
    systemCards: zipSystemCards(enSystemCards, arSystemCards),
    results: zipResults(enResults, arResults),
    en: {
      title: project.en.title,
      description: project.en.description,
      categoryLabel: project.en.categoryLabel,
      clientName: project.en.clientName,
      clientSector: project.en.clientSector,
      clientCountry: project.en.clientCountry,
      clientModel: project.en.clientModel,
      problemHeadline: project.en.problemHeadline,
      problemBody: project.en.problemBody,
      diagnosisHeadline: project.en.diagnosisHeadline,
      diagnosisBody: project.en.diagnosisBody,
      systemHeadline: project.en.systemHeadline,
      mediaCaption: project.en.mediaCaption,
      ctaHeadline: project.en.ctaHeadline,
      ctaSubtext: project.en.ctaSubtext,
      tags: (project.en.tags as string[] | null) ?? [],
      technologies: (project.en.technologies as string[] | null) ?? [],
    },
    ar: {
      title: project.ar.title,
      description: project.ar.description,
      categoryLabel: project.ar.categoryLabel,
      clientName: project.ar.clientName,
      clientSector: project.ar.clientSector,
      clientCountry: project.ar.clientCountry,
      clientModel: project.ar.clientModel,
      problemHeadline: project.ar.problemHeadline,
      problemBody: project.ar.problemBody,
      diagnosisHeadline: project.ar.diagnosisHeadline,
      diagnosisBody: project.ar.diagnosisBody,
      systemHeadline: project.ar.systemHeadline,
      mediaCaption: project.ar.mediaCaption,
      ctaHeadline: project.ar.ctaHeadline,
      ctaSubtext: project.ar.ctaSubtext,
      tags: (project.ar.tags as string[] | null) ?? [],
      technologies: (project.ar.technologies as string[] | null) ?? [],
    },
  };

  return (
    <main>
      <h1>Edit project</h1>
      <ProjectForm
        mode="edit"
        action={updateProjectAction.bind(null, id)}
        categories={categories}
        initialValues={initialValues}
      />
    </main>
  );
}
