"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { slugifyForLanguage } from "@/lib/article-slug";
import { getLanguagePath } from "@/lib/language";
import {
  INITIAL_PROJECT_FORM_STATE,
  type ProjectFormState,
} from "./project-form-schema";
import { AdminImageField } from "@/components/admin/image-field";
import { CategorySelect } from "@/components/admin/category-select";
import { SystemCardsEditor, type SystemCardSlot } from "./system-cards-editor";
import { ResultsEditor, type ResultSlot } from "./results-editor";
import { ChipInput } from "./chip-input";
import { Card } from "@/components/admin/card";
import { Button } from "@/components/admin/button";
import { FormField } from "@/components/admin/form-field";
import { EditorHeader } from "@/components/admin/editor-header";
import { Tabs, type TabItem } from "@/components/admin/tabs";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  inputClass,
  textPrimary,
  textMuted,
  errorTextClass,
  checkboxClass,
} from "@/components/admin/palette";

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

type FieldErrors = ProjectFormState["fieldErrors"];

function fieldError(errors: FieldErrors, key: string): string | undefined {
  return errors[key]?.[0];
}

function hasPrefixError(errors: FieldErrors, prefixes: string[]): boolean {
  return Object.keys(errors).some((key) => prefixes.some((p) => key === p || key.startsWith(`${p}.`)));
}

// Every content field EXCEPT title/mediaCaption, which live on the Overview
// and Media tabs respectively — used so an error there doesn't also light up
// the Content tab's indicator.
function hasContentError(errors: FieldErrors, lang?: "en" | "ar"): boolean {
  return Object.keys(errors).some((key) => {
    const prefix = lang ? `${lang}.` : null;
    if (prefix ? !key.startsWith(prefix) : !key.startsWith("en.") && !key.startsWith("ar.")) return false;
    const field = key.split(".")[1];
    return field !== "title" && field !== "mediaCaption";
  });
}

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant="primary">
      {pending ? "Saving…" : mode === "create" ? "Create project" : "Save changes"}
    </Button>
  );
}

function FormSection({
  title,
  help,
  children,
}: {
  title: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-4">
      <div>
        <legend className={`text-sm font-semibold ${textPrimary}`}>{title}</legend>
        {help && <p className={`mt-0.5 text-xs ${textMuted}`}>{help}</p>}
      </div>
      {children}
    </fieldset>
  );
}

function TranslationContent({
  prefix,
  initialValues,
  fieldErrors,
  ctaDefault,
}: {
  prefix: "en" | "ar";
  initialValues?: ProjectTranslationInitialValues;
  fieldErrors: FieldErrors;
  ctaDefault: { headline: string; subtext: string };
}) {
  const field = (name: string) => `${prefix}.${name}`;
  const err = (name: string) => fieldError(fieldErrors, field(name));
  const dir = prefix === "ar" ? "rtl" : "ltr";

  return (
    <div className="space-y-6" dir={dir}>
      <FormSection title="Summary">
        <FormField label="Description" htmlFor={`${prefix}-description`} error={err("description")}>
          <textarea
            id={`${prefix}-description`}
            name={field("description")}
            rows={3}
            defaultValue={initialValues?.description}
            className={inputClass}
          />
        </FormField>
        <FormField
          label="Category label"
          htmlFor={`${prefix}-categoryLabel`}
          help="Optional — shown instead of the raw category on the public page."
        >
          <input
            id={`${prefix}-categoryLabel`}
            name={field("categoryLabel")}
            type="text"
            defaultValue={initialValues?.categoryLabel ?? ""}
            className={inputClass}
          />
        </FormField>
      </FormSection>

      <FormSection title="Client context">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Client name" htmlFor={`${prefix}-clientName`}>
            <input id={`${prefix}-clientName`} name={field("clientName")} type="text" defaultValue={initialValues?.clientName ?? ""} className={inputClass} />
          </FormField>
          <FormField label="Sector" htmlFor={`${prefix}-clientSector`}>
            <input id={`${prefix}-clientSector`} name={field("clientSector")} type="text" defaultValue={initialValues?.clientSector ?? ""} className={inputClass} />
          </FormField>
          <FormField label="Country" htmlFor={`${prefix}-clientCountry`}>
            <input id={`${prefix}-clientCountry`} name={field("clientCountry")} type="text" defaultValue={initialValues?.clientCountry ?? ""} className={inputClass} />
          </FormField>
          <FormField label="Business model" htmlFor={`${prefix}-clientModel`} help="Example: B2B, B2C, Marketplace.">
            <input id={`${prefix}-clientModel`} name={field("clientModel")} type="text" defaultValue={initialValues?.clientModel ?? ""} className={inputClass} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Problem">
        <FormField label="Problem headline" htmlFor={`${prefix}-problemHeadline`}>
          <input id={`${prefix}-problemHeadline`} name={field("problemHeadline")} type="text" defaultValue={initialValues?.problemHeadline ?? ""} className={inputClass} />
        </FormField>
        <FormField label="Problem body" htmlFor={`${prefix}-problemBody`}>
          <textarea id={`${prefix}-problemBody`} name={field("problemBody")} rows={3} defaultValue={initialValues?.problemBody ?? ""} className={inputClass} />
        </FormField>
      </FormSection>

      <FormSection title="Diagnosis">
        <FormField label="Diagnosis headline" htmlFor={`${prefix}-diagnosisHeadline`}>
          <input id={`${prefix}-diagnosisHeadline`} name={field("diagnosisHeadline")} type="text" defaultValue={initialValues?.diagnosisHeadline ?? ""} className={inputClass} />
        </FormField>
        <FormField label="Diagnosis body" htmlFor={`${prefix}-diagnosisBody`}>
          <textarea id={`${prefix}-diagnosisBody`} name={field("diagnosisBody")} rows={3} defaultValue={initialValues?.diagnosisBody ?? ""} className={inputClass} />
        </FormField>
      </FormSection>

      <FormSection title="System introduction">
        <FormField label="System headline" htmlFor={`${prefix}-systemHeadline`}>
          <input id={`${prefix}-systemHeadline`} name={field("systemHeadline")} type="text" defaultValue={initialValues?.systemHeadline ?? ""} className={inputClass} />
        </FormField>
      </FormSection>

      <FormSection title="Call to action">
        <FormField label="CTA headline" htmlFor={`${prefix}-ctaHeadline`} help={`Optional — default: "${ctaDefault.headline}"`}>
          <input id={`${prefix}-ctaHeadline`} name={field("ctaHeadline")} type="text" defaultValue={initialValues?.ctaHeadline ?? ""} className={inputClass} />
        </FormField>
        <FormField label="CTA subtext" htmlFor={`${prefix}-ctaSubtext`} help={`Optional — default: "${ctaDefault.subtext}"`}>
          <textarea id={`${prefix}-ctaSubtext`} name={field("ctaSubtext")} rows={2} defaultValue={initialValues?.ctaSubtext ?? ""} className={inputClass} />
        </FormField>
      </FormSection>

      <FormSection title="Metadata">
        <ChipInput name={`${prefix}Tags`} label="Tags" initialValue={initialValues?.tags} />
        <ChipInput name={`${prefix}Technologies`} label="Technologies" initialValue={initialValues?.technologies} />
      </FormSection>
    </div>
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
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const enTitleRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeLanguage, setActiveLanguage] = useState<"en" | "ar">("en");

  const err = (name: string) => fieldError(state.fieldErrors, name);

  function handleGenerateSlug() {
    const title = enTitleRef.current?.value ?? "";
    setSlug(slugifyForLanguage(title, "en"));
  }

  function handleEnTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (mode === "create" && !slugTouched) {
      setSlug(slugifyForLanguage(event.target.value, "en"));
    }
  }

  const tabs: TabItem[] = [
    {
      id: "overview",
      label: "Overview",
      hasError: hasPrefixError(state.fieldErrors, [
        "slug",
        "category",
        "isFeatured",
        "isServiceShowcase",
        "en.title",
        "ar.title",
      ]),
    },
    {
      id: "media",
      label: "Media",
      hasError: hasPrefixError(state.fieldErrors, [
        "coverImage",
        "logo",
        "mediaImage",
        "en.mediaCaption",
        "ar.mediaCaption",
      ]),
    },
    { id: "content", label: "Content", hasError: hasContentError(state.fieldErrors) },
    { id: "system", label: "System", hasError: hasPrefixError(state.fieldErrors, ["systemCards"]) },
    { id: "results", label: "Results", hasError: hasPrefixError(state.fieldErrors, ["results"]) },
  ];

  return (
    <form action={formAction} className="pb-16">
      <EditorHeader
        back={{ href: "/admin/projects", label: "Projects" }}
        title={mode === "create" ? "New project" : initialValues?.en.title || "Edit project"}
        status={
          initialValues && (initialValues.isFeatured || initialValues.isServiceShowcase) ? (
            <div className="flex gap-1">
              {initialValues.isFeatured && <StatusBadge tone="success">Featured</StatusBadge>}
              {initialValues.isServiceShowcase && <StatusBadge tone="neutral">Showcase</StatusBadge>}
            </div>
          ) : undefined
        }
        actions={
          <>
            {mode === "edit" && initialValues && (
              <>
                <a
                  href={getLanguagePath(`/portfolio/${initialValues.slug}`, "en")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button type="button" variant="ghost">
                    Preview EN
                  </Button>
                </a>
                <a
                  href={getLanguagePath(`/portfolio/${initialValues.slug}`, "ar")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button type="button" variant="ghost">
                    Preview AR
                  </Button>
                </a>
              </>
            )}
            <SubmitButton mode={mode} />
          </>
        }
      />

      <div className="mx-auto max-w-4xl">
      {state.formError && (
        <p role="alert" className="mb-4 rounded-md bg-admin-danger-bg px-3 py-2 text-sm text-admin-danger">
          {state.formError}
        </p>
      )}

      {Object.keys(state.fieldErrors).length > 0 && (
        // Safety net: several fieldErrors keys (e.g. per-row errors inside
        // systemCards/results, like "systemCards.0.titleAr") have no
        // dedicated inline rendering slot below. Without this summary those
        // errors would be silently invisible even though the save was
        // rejected — every rejection must be visible to the admin (FR-12.1).
        <ul role="alert" className="mb-4 space-y-1 rounded-md bg-admin-danger-bg px-3 py-2 text-sm text-admin-danger">
          {Object.entries(state.fieldErrors).map(([field, messages]) =>
            (messages ?? []).map((message, i) => <li key={`${field}-${i}`}>{message}</li>),
          )}
        </ul>
      )}

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        <div hidden={activeTab !== "overview"}>
          <Card className="space-y-6">
            <FormSection title="Project details">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="English title" htmlFor="en-title" error={err("en.title")}>
                  <input
                    id="en-title"
                    name="en.title"
                    type="text"
                    ref={enTitleRef}
                    defaultValue={initialValues?.en.title}
                    onChange={handleEnTitleChange}
                    className={inputClass}
                  />
                </FormField>
                <FormField label="Arabic title" htmlFor="ar-title" error={err("ar.title")}>
                  <input
                    id="ar-title"
                    name="ar.title"
                    type="text"
                    dir="rtl"
                    defaultValue={initialValues?.ar.title}
                    className={inputClass}
                  />
                </FormField>
              </div>

              <FormField label="Slug" htmlFor="slug-input" error={err("slug")} help="Used in the public URL.">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    id="slug-input"
                    name="slug"
                    type="text"
                    value={slug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      setSlug(event.target.value);
                    }}
                    className={inputClass}
                  />
                  <Button type="button" variant="secondary" onClick={handleGenerateSlug}>
                    Generate from English title
                  </Button>
                </div>
              </FormField>

              <FormField label="Category" htmlFor="category-select-category" error={err("category")}>
                <CategorySelect name="category" categories={categories} initialValue={initialValues?.category} />
              </FormField>
            </FormSection>

            <FormSection title="Visibility">
              <div className="space-y-2">
                <label className={`flex items-center gap-2 text-sm font-medium ${textPrimary}`}>
                  <input type="checkbox" name="isFeatured" defaultChecked={initialValues?.isFeatured ?? false} className={checkboxClass} />
                  Featured
                </label>
                <label className={`flex items-center gap-2 text-sm font-medium ${textPrimary}`}>
                  <input
                    type="checkbox"
                    name="isServiceShowcase"
                    defaultChecked={initialValues?.isServiceShowcase ?? false}
                    className={checkboxClass}
                  />
                  Service showcase
                </label>
              </div>
            </FormSection>
          </Card>
        </div>

        <div hidden={activeTab !== "media"}>
          <Card className="space-y-6">
            <FormSection title="Media">
              <AdminImageField
                name="coverImage"
                label="Cover image"
                required
                helperText="The list-grid thumbnail."
                initialValue={initialValues?.coverImage}
              />
              {err("coverImage") && <p className={errorTextClass}>{err("coverImage")}</p>}
              <AdminImageField
                name="logo"
                label="Client logo"
                helperText="The hero identity card image."
                initialValue={initialValues?.logo}
              />
              <AdminImageField
                name="mediaImage"
                label="Case-study media"
                helperText="The media section image."
                initialValue={initialValues?.mediaImage}
              />
            </FormSection>

            <FormSection title="Media caption">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Caption (English)" htmlFor="en-mediaCaption">
                  <input
                    id="en-mediaCaption"
                    name="en.mediaCaption"
                    type="text"
                    defaultValue={initialValues?.en.mediaCaption ?? ""}
                    className={inputClass}
                  />
                </FormField>
                <FormField label="Caption (Arabic)" htmlFor="ar-mediaCaption">
                  <input
                    id="ar-mediaCaption"
                    name="ar.mediaCaption"
                    type="text"
                    dir="rtl"
                    defaultValue={initialValues?.ar.mediaCaption ?? ""}
                    className={inputClass}
                  />
                </FormField>
              </div>
            </FormSection>
          </Card>
        </div>

        <div hidden={activeTab !== "content"}>
          <Card className="space-y-4">
            <Tabs
              tabs={[
                { id: "en", label: "English", hasError: hasContentError(state.fieldErrors, "en") },
                { id: "ar", label: "العربية", hasError: hasContentError(state.fieldErrors, "ar") },
              ]}
              active={activeLanguage}
              onChange={(id) => setActiveLanguage(id as "en" | "ar")}
            />
            <div hidden={activeLanguage !== "en"}>
              <TranslationContent prefix="en" initialValues={initialValues?.en} fieldErrors={state.fieldErrors} ctaDefault={EN_CTA_DEFAULT} />
            </div>
            <div hidden={activeLanguage !== "ar"}>
              <TranslationContent prefix="ar" initialValues={initialValues?.ar} fieldErrors={state.fieldErrors} ctaDefault={AR_CTA_DEFAULT} />
            </div>
          </Card>
        </div>

        <div hidden={activeTab !== "system"}>
          <Card>
            <SystemCardsEditor initialValue={initialValues?.systemCards} fieldErrors={state.fieldErrors} />
          </Card>
        </div>

        <div hidden={activeTab !== "results"}>
          <Card>
            <ResultsEditor initialValue={initialValues?.results} fieldErrors={state.fieldErrors} />
          </Card>
        </div>
      </div>
      </div>
    </form>
  );
}
