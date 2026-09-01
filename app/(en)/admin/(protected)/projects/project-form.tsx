"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { slugifyForLanguage } from "@/lib/article-slug";
import {
  INITIAL_PROJECT_FORM_STATE,
  type ProjectFormState,
} from "./project-form-schema";
import { CoverImageField } from "./cover-image-field";
import { LogoImageField } from "./logo-image-field";
import { MediaImageField } from "./media-image-field";
import { SystemCardsEditor, type SystemCardSlot } from "./system-cards-editor";
import { ResultsEditor, type ResultSlot } from "./results-editor";
import { ChipInput } from "./chip-input";

type ProjectFormAction = (
  prevState: ProjectFormState,
  formData: FormData,
) => Promise<ProjectFormState>;

const EN_CTA_DEFAULT = {
  headline: "Your reporting might be lying to you too.",
  subtext:
    "We diagnose before we build. Start with a Foundation diagnosis and see what your numbers are hiding.",
};
const AR_CTA_DEFAULT = {
  headline: "تقاريرك قد تكون تكذب عليك أيضاً.",
  subtext: "نُشخّص قبل أن نبني. ابدأ بتشخيص Foundation واكتشف ما تُخفيه أرقامك.",
};

export type ProjectTranslationInitialValues = {
  title: string;
  description: string;
  categoryLabel: string | null;
  clientName: string | null;
  clientSector: string | null;
  clientCountry: string | null;
  clientModel: string | null;
  problemHeadline: string | null;
  problemBody: string | null;
  diagnosisHeadline: string | null;
  diagnosisBody: string | null;
  systemHeadline: string | null;
  mediaCaption: string | null;
  ctaHeadline: string | null;
  ctaSubtext: string | null;
  tags: string[];
  technologies: string[];
};

export type ProjectFormInitialValues = {
  slug: string;
  category: string;
  isFeatured: boolean;
  isServiceShowcase: boolean;
  coverImage: string;
  logo: string | null;
  mediaImage: string | null;
  systemCards: SystemCardSlot[];
  results: ResultSlot[];
  en: ProjectTranslationInitialValues;
  ar: ProjectTranslationInitialValues;
};

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Saving…" : mode === "create" ? "Create project" : "Save changes"}
    </button>
  );
}

function TranslationSection({
  prefix,
  label,
  initialValues,
  fieldErrors,
  ctaDefault,
  titleInputRef,
}: {
  prefix: "en" | "ar";
  label: string;
  initialValues?: ProjectTranslationInitialValues;
  fieldErrors: ProjectFormState["fieldErrors"];
  ctaDefault: { headline: string; subtext: string };
  titleInputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const field = (name: string) => `${prefix}.${name}`;
  const titleError = fieldErrors[`${prefix}.title` as keyof typeof fieldErrors];
  const descriptionError = fieldErrors[`${prefix}.description` as keyof typeof fieldErrors];

  return (
    <fieldset>
      <legend>{label}</legend>

      <label htmlFor={`${prefix}-title`}>Title</label>
      <input
        id={`${prefix}-title`}
        name={field("title")}
        type="text"
        defaultValue={initialValues?.title}
        ref={titleInputRef}
      />
      {titleError && <p role="alert">{titleError[0]}</p>}

      <label htmlFor={`${prefix}-description`}>Description</label>
      <textarea id={`${prefix}-description`} name={field("description")} rows={2} defaultValue={initialValues?.description} />
      {descriptionError && <p role="alert">{descriptionError[0]}</p>}

      <label htmlFor={`${prefix}-categoryLabel`}>Category label (optional)</label>
      <input id={`${prefix}-categoryLabel`} name={field("categoryLabel")} type="text" defaultValue={initialValues?.categoryLabel ?? ""} />

      <label htmlFor={`${prefix}-clientName`}>Client name (optional)</label>
      <input id={`${prefix}-clientName`} name={field("clientName")} type="text" defaultValue={initialValues?.clientName ?? ""} />

      <label htmlFor={`${prefix}-clientSector`}>Client sector (optional)</label>
      <input id={`${prefix}-clientSector`} name={field("clientSector")} type="text" defaultValue={initialValues?.clientSector ?? ""} />

      <label htmlFor={`${prefix}-clientCountry`}>Client country (optional)</label>
      <input id={`${prefix}-clientCountry`} name={field("clientCountry")} type="text" defaultValue={initialValues?.clientCountry ?? ""} />

      <label htmlFor={`${prefix}-clientModel`}>Client model (optional)</label>
      <input id={`${prefix}-clientModel`} name={field("clientModel")} type="text" defaultValue={initialValues?.clientModel ?? ""} />

      <label htmlFor={`${prefix}-problemHeadline`}>Problem headline (optional)</label>
      <input id={`${prefix}-problemHeadline`} name={field("problemHeadline")} type="text" defaultValue={initialValues?.problemHeadline ?? ""} />

      <label htmlFor={`${prefix}-problemBody`}>Problem body (optional)</label>
      <textarea id={`${prefix}-problemBody`} name={field("problemBody")} defaultValue={initialValues?.problemBody ?? ""} />

      <label htmlFor={`${prefix}-diagnosisHeadline`}>Diagnosis headline (optional)</label>
      <input id={`${prefix}-diagnosisHeadline`} name={field("diagnosisHeadline")} type="text" defaultValue={initialValues?.diagnosisHeadline ?? ""} />

      <label htmlFor={`${prefix}-diagnosisBody`}>Diagnosis body (optional)</label>
      <textarea id={`${prefix}-diagnosisBody`} name={field("diagnosisBody")} defaultValue={initialValues?.diagnosisBody ?? ""} />

      <label htmlFor={`${prefix}-systemHeadline`}>System headline (optional)</label>
      <input id={`${prefix}-systemHeadline`} name={field("systemHeadline")} type="text" defaultValue={initialValues?.systemHeadline ?? ""} />

      <label htmlFor={`${prefix}-mediaCaption`}>Media caption (optional)</label>
      <input id={`${prefix}-mediaCaption`} name={field("mediaCaption")} type="text" defaultValue={initialValues?.mediaCaption ?? ""} />

      <label htmlFor={`${prefix}-ctaHeadline`}>
        CTA headline override (optional — default: &quot;{ctaDefault.headline}&quot;)
      </label>
      <input id={`${prefix}-ctaHeadline`} name={field("ctaHeadline")} type="text" defaultValue={initialValues?.ctaHeadline ?? ""} />

      <label htmlFor={`${prefix}-ctaSubtext`}>
        CTA subtext override (optional — default: &quot;{ctaDefault.subtext}&quot;)
      </label>
      <textarea id={`${prefix}-ctaSubtext`} name={field("ctaSubtext")} defaultValue={initialValues?.ctaSubtext ?? ""} />

      <ChipInput name={`${prefix}Tags`} label="Tags" initialValue={initialValues?.tags} />
      <ChipInput name={`${prefix}Technologies`} label="Technologies" initialValue={initialValues?.technologies} />
    </fieldset>
  );
}

export function ProjectForm({
  mode,
  action,
  categories,
  initialValues,
}: {
  mode: "create" | "edit";
  action: ProjectFormAction;
  categories: string[];
  initialValues?: ProjectFormInitialValues;
}) {
  const [state, formAction] = useActionState(action, INITIAL_PROJECT_FORM_STATE);
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const enTitleRef = useRef<HTMLInputElement>(null);

  function handleGenerateSlug() {
    const title = enTitleRef.current?.value ?? "";
    setSlug(slugifyForLanguage(title, "en"));
  }

  return (
    <form action={formAction}>
      {state.formError && <p role="alert">{state.formError}</p>}

      {Object.keys(state.fieldErrors).length > 0 && (
        // Safety net: several fieldErrors keys (e.g. per-row errors inside
        // systemCards/results, like "systemCards.0.titleAr") have no
        // dedicated inline rendering slot below. Without this summary those
        // errors would be silently invisible even though the save was
        // rejected — every rejection must be visible to the admin (FR-12.1).
        <ul role="alert">
          {Object.entries(state.fieldErrors).map(([field, messages]) =>
            (messages ?? []).map((message, i) => <li key={`${field}-${i}`}>{message}</li>),
          )}
        </ul>
      )}

      <fieldset>
        <legend>Shared details</legend>

        <label htmlFor="slug-input">Slug</label>
        <input
          id="slug-input"
          name="slug"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <button type="button" onClick={handleGenerateSlug}>
          Generate from English title
        </button>
        {state.fieldErrors.slug && <p role="alert">{state.fieldErrors.slug[0]}</p>}

        <label htmlFor="category-input">Category</label>
        <input id="category-input" name="category" type="text" list="category-options" defaultValue={initialValues?.category} />
        <datalist id="category-options">
          {categories.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
        {state.fieldErrors.category && <p role="alert">{state.fieldErrors.category[0]}</p>}

        <label htmlFor="is-featured-checkbox">
          <input
            id="is-featured-checkbox"
            name="isFeatured"
            type="checkbox"
            defaultChecked={initialValues?.isFeatured ?? false}
          />
          Featured
        </label>

        <label htmlFor="is-service-showcase-checkbox">
          <input
            id="is-service-showcase-checkbox"
            name="isServiceShowcase"
            type="checkbox"
            defaultChecked={initialValues?.isServiceShowcase ?? false}
          />
          Service showcase
        </label>

        <CoverImageField initialValue={initialValues?.coverImage} />
        {state.fieldErrors.coverImage && <p role="alert">{state.fieldErrors.coverImage[0]}</p>}

        <LogoImageField initialValue={initialValues?.logo} />
        <MediaImageField initialValue={initialValues?.mediaImage} />
      </fieldset>

      <SystemCardsEditor initialValue={initialValues?.systemCards} />
      {state.fieldErrors.systemCards && <p role="alert">{state.fieldErrors.systemCards[0]}</p>}

      <ResultsEditor initialValue={initialValues?.results} />
      {state.fieldErrors.results && <p role="alert">{state.fieldErrors.results[0]}</p>}

      <TranslationSection
        prefix="en"
        label="English content"
        initialValues={initialValues?.en}
        fieldErrors={state.fieldErrors}
        ctaDefault={EN_CTA_DEFAULT}
        titleInputRef={enTitleRef}
      />

      <TranslationSection
        prefix="ar"
        label="Arabic content"
        initialValues={initialValues?.ar}
        fieldErrors={state.fieldErrors}
        ctaDefault={AR_CTA_DEFAULT}
      />

      <SubmitButton mode={mode} />
    </form>
  );
}
