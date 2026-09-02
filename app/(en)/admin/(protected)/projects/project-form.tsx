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
import { Card } from "@/components/admin/card";
import { Button } from "@/components/admin/button";
import { FormField } from "@/components/admin/form-field";

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

const INPUT_CLASSNAME =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

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
    <Button type="submit" disabled={pending} variant="primary">
      {pending ? "Saving…" : mode === "create" ? "Create project" : "Save changes"}
    </Button>
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
    <fieldset className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
      <legend className="text-base font-semibold text-gray-900">{label}</legend>

      <FormField label="Title" htmlFor={`${prefix}-title`} error={titleError?.[0]}>
        <input
          id={`${prefix}-title`}
          name={field("title")}
          type="text"
          defaultValue={initialValues?.title}
          ref={titleInputRef}
          className={INPUT_CLASSNAME}
        />
      </FormField>

      <FormField label="Description" htmlFor={`${prefix}-description`} error={descriptionError?.[0]}>
        <textarea
          id={`${prefix}-description`}
          name={field("description")}
          rows={2}
          defaultValue={initialValues?.description}
          className={INPUT_CLASSNAME}
        />
      </FormField>

      <FormField label="Category label (optional)" htmlFor={`${prefix}-categoryLabel`}>
        <input
          id={`${prefix}-categoryLabel`}
          name={field("categoryLabel")}
          type="text"
          defaultValue={initialValues?.categoryLabel ?? ""}
          className={INPUT_CLASSNAME}
        />
      </FormField>

      <FormField label="Client name (optional)" htmlFor={`${prefix}-clientName`}>
        <input
          id={`${prefix}-clientName`}
          name={field("clientName")}
          type="text"
          defaultValue={initialValues?.clientName ?? ""}
          className={INPUT_CLASSNAME}
        />
      </FormField>

      <FormField label="Client sector (optional)" htmlFor={`${prefix}-clientSector`}>
        <input
          id={`${prefix}-clientSector`}
          name={field("clientSector")}
          type="text"
          defaultValue={initialValues?.clientSector ?? ""}
          className={INPUT_CLASSNAME}
        />
      </FormField>

      <FormField label="Client country (optional)" htmlFor={`${prefix}-clientCountry`}>
        <input
          id={`${prefix}-clientCountry`}
          name={field("clientCountry")}
          type="text"
          defaultValue={initialValues?.clientCountry ?? ""}
          className={INPUT_CLASSNAME}
        />
      </FormField>

      <FormField label="Client model (optional)" htmlFor={`${prefix}-clientModel`}>
        <input
          id={`${prefix}-clientModel`}
          name={field("clientModel")}
          type="text"
          defaultValue={initialValues?.clientModel ?? ""}
          className={INPUT_CLASSNAME}
        />
      </FormField>

      <FormField label="Problem headline (optional)" htmlFor={`${prefix}-problemHeadline`}>
        <input
          id={`${prefix}-problemHeadline`}
          name={field("problemHeadline")}
          type="text"
          defaultValue={initialValues?.problemHeadline ?? ""}
          className={INPUT_CLASSNAME}
        />
      </FormField>

      <FormField label="Problem body (optional)" htmlFor={`${prefix}-problemBody`}>
        <textarea
          id={`${prefix}-problemBody`}
          name={field("problemBody")}
          defaultValue={initialValues?.problemBody ?? ""}
          className={INPUT_CLASSNAME}
        />
      </FormField>

      <FormField label="Diagnosis headline (optional)" htmlFor={`${prefix}-diagnosisHeadline`}>
        <input
          id={`${prefix}-diagnosisHeadline`}
          name={field("diagnosisHeadline")}
          type="text"
          defaultValue={initialValues?.diagnosisHeadline ?? ""}
          className={INPUT_CLASSNAME}
        />
      </FormField>

      <FormField label="Diagnosis body (optional)" htmlFor={`${prefix}-diagnosisBody`}>
        <textarea
          id={`${prefix}-diagnosisBody`}
          name={field("diagnosisBody")}
          defaultValue={initialValues?.diagnosisBody ?? ""}
          className={INPUT_CLASSNAME}
        />
      </FormField>

      <FormField label="System headline (optional)" htmlFor={`${prefix}-systemHeadline`}>
        <input
          id={`${prefix}-systemHeadline`}
          name={field("systemHeadline")}
          type="text"
          defaultValue={initialValues?.systemHeadline ?? ""}
          className={INPUT_CLASSNAME}
        />
      </FormField>

      <FormField label="Media caption (optional)" htmlFor={`${prefix}-mediaCaption`}>
        <input
          id={`${prefix}-mediaCaption`}
          name={field("mediaCaption")}
          type="text"
          defaultValue={initialValues?.mediaCaption ?? ""}
          className={INPUT_CLASSNAME}
        />
      </FormField>

      <div>
        <label htmlFor={`${prefix}-ctaHeadline`} className="text-sm font-medium text-gray-900">
          CTA headline override{" "}
          <span className="font-normal text-gray-500">
            (optional — default: &quot;{ctaDefault.headline}&quot;)
          </span>
        </label>
        <input
          id={`${prefix}-ctaHeadline`}
          name={field("ctaHeadline")}
          type="text"
          defaultValue={initialValues?.ctaHeadline ?? ""}
          className={`mt-1 ${INPUT_CLASSNAME}`}
        />
      </div>

      <div>
        <label htmlFor={`${prefix}-ctaSubtext`} className="text-sm font-medium text-gray-900">
          CTA subtext override{" "}
          <span className="font-normal text-gray-500">
            (optional — default: &quot;{ctaDefault.subtext}&quot;)
          </span>
        </label>
        <textarea
          id={`${prefix}-ctaSubtext`}
          name={field("ctaSubtext")}
          defaultValue={initialValues?.ctaSubtext ?? ""}
          className={`mt-1 ${INPUT_CLASSNAME}`}
        />
      </div>

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
    <form action={formAction} className="space-y-6">
      {state.formError && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.formError}
        </p>
      )}

      {Object.keys(state.fieldErrors).length > 0 && (
        // Safety net: several fieldErrors keys (e.g. per-row errors inside
        // systemCards/results, like "systemCards.0.titleAr") have no
        // dedicated inline rendering slot below. Without this summary those
        // errors would be silently invisible even though the save was
        // rejected — every rejection must be visible to the admin (FR-12.1).
        <ul role="alert" className="space-y-1 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {Object.entries(state.fieldErrors).map(([field, messages]) =>
            (messages ?? []).map((message, i) => <li key={`${field}-${i}`}>{message}</li>),
          )}
        </ul>
      )}

      <fieldset className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <legend className="text-base font-semibold text-gray-900">Shared details</legend>

        <FormField label="Slug" htmlFor="slug-input" error={state.fieldErrors.slug?.[0]}>
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="slug-input"
              name="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={INPUT_CLASSNAME}
            />
            <Button type="button" variant="secondary" onClick={handleGenerateSlug}>
              Generate from English title
            </Button>
          </div>
        </FormField>

        <FormField label="Category" htmlFor="category-input" error={state.fieldErrors.category?.[0]}>
          <input
            id="category-input"
            name="category"
            type="text"
            list="category-options"
            defaultValue={initialValues?.category}
            className={INPUT_CLASSNAME}
          />
          <datalist id="category-options">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </FormField>

        <div className="space-y-2">
          <label htmlFor="is-featured-checkbox" className="flex items-center gap-2 text-sm font-medium text-gray-900">
            <input
              id="is-featured-checkbox"
              name="isFeatured"
              type="checkbox"
              defaultChecked={initialValues?.isFeatured ?? false}
              className="h-4 w-4 rounded border-gray-300"
            />
            Featured
          </label>

          <label
            htmlFor="is-service-showcase-checkbox"
            className="flex items-center gap-2 text-sm font-medium text-gray-900"
          >
            <input
              id="is-service-showcase-checkbox"
              name="isServiceShowcase"
              type="checkbox"
              defaultChecked={initialValues?.isServiceShowcase ?? false}
              className="h-4 w-4 rounded border-gray-300"
            />
            Service showcase
          </label>
        </div>

        <div>
          <CoverImageField initialValue={initialValues?.coverImage} />
          {state.fieldErrors.coverImage && (
            <p role="alert" className="mt-1 text-sm text-red-600">
              {state.fieldErrors.coverImage[0]}
            </p>
          )}
        </div>

        <LogoImageField initialValue={initialValues?.logo} />
        <MediaImageField initialValue={initialValues?.mediaImage} />
      </fieldset>

      <Card className="space-y-2">
        <SystemCardsEditor initialValue={initialValues?.systemCards} />
        {state.fieldErrors.systemCards && (
          <p role="alert" className="text-sm text-red-600">
            {state.fieldErrors.systemCards[0]}
          </p>
        )}
      </Card>

      <Card className="space-y-2">
        <ResultsEditor initialValue={initialValues?.results} />
        {state.fieldErrors.results && (
          <p role="alert" className="text-sm text-red-600">
            {state.fieldErrors.results[0]}
          </p>
        )}
      </Card>

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
