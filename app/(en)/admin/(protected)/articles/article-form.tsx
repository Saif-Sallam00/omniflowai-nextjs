"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { slugifyForLanguage } from "@/lib/article-slug";
import { RELATED_SOLUTIONS } from "@/lib/article-solutions";
import { getLanguagePath } from "@/lib/language";
import type { ProjectOption } from "@/lib/db/portfolio";
import type { Language } from "@/lib/language";
import {
  INITIAL_ARTICLE_FORM_STATE,
  type ArticleFormState,
  type CounterpartInfo,
} from "./article-form-schema";
import { AdminImageField } from "@/components/admin/image-field";
import { BodyEditor } from "./body-editor";
import { Card } from "@/components/admin/card";
import { Button } from "@/components/admin/button";
import { FormField } from "@/components/admin/form-field";
import { EditorHeader } from "@/components/admin/editor-header";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  inputClass,
  labelClass,
  textPrimary,
  textMuted,
  accent,
} from "@/components/admin/palette";

type ArticleFormAction = (
  prevState: ArticleFormState,
  formData: FormData,
) => Promise<ArticleFormState>;

export type ArticleFormInitialValues = {
  language: Language;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  body: string;
  published: boolean;
  publishedAt: Date | null;
  relatedProjectId: number | null;
  relatedSolution: string | null;
};


function formatDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

function SubmitButton({ mode, published }: { mode: "create" | "edit"; published: boolean }) {
  const { pending } = useFormStatus();
  const label =
    mode === "edit" ? "Save changes" : published ? "Publish" : "Save draft";
  return (
    <Button type="submit" disabled={pending} variant="primary">
      {pending ? "Saving…" : label}
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

function SlugField({
  slug,
  onChange,
  error,
}: {
  slug: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const [editing, setEditing] = useState(false);

  if (editing || error) {
    return (
      <FormField label="URL slug" htmlFor="slug-input" error={error} help="Used in the public URL.">
        <input
          id="slug-input"
          name="slug"
          type="text"
          value={slug}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      </FormField>
    );
  }

  return (
    <div>
      <p className={labelClass}>URL</p>
      <div className="mt-1 flex items-center gap-2">
        <p className={`truncate text-sm ${textMuted}`}>/articles/{slug || "…"}</p>
        <button type="button" onClick={() => setEditing(true)} className={`shrink-0 text-xs ${accent} underline`}>
          Edit
        </button>
      </div>
      <input type="hidden" name="slug" value={slug} />
    </div>
  );
}

function CounterpartStatus({ counterpart }: { counterpart: CounterpartInfo }) {
  const label = counterpart.language === "en" ? "English" : "Arabic";
  if (counterpart.status === "missing") {
    return (
      <Link href={counterpart.href} className={`${accent} underline`}>
        + Add {label} version
      </Link>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      {label} version:
      <StatusBadge tone={counterpart.status === "published" ? "success" : "neutral"}>
        {counterpart.status === "published" ? "Published" : "Draft"}
      </StatusBadge>
      <Link href={counterpart.href} className={`${accent} underline`}>
        Edit
      </Link>
    </span>
  );
}

export function ArticleForm({
  mode,
  action,
  projects,
  initialValues,
  lockedLanguage,
  translationGroupId,
  counterpart,
}: {
  mode: "create" | "edit";
  action: ArticleFormAction;
  projects: ProjectOption[];
  initialValues?: ArticleFormInitialValues;
  lockedLanguage?: Language;
  translationGroupId?: string;
  counterpart?: CounterpartInfo;
}) {
  const [state, formAction] = useActionState(action, INITIAL_ARTICLE_FORM_STATE);

  const [language, setLanguage] = useState<Language>(
    initialValues?.language ?? lockedLanguage ?? "en",
  );
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [published, setPublished] = useState(initialValues?.published ?? false);

  const languageLocked = mode === "edit" || Boolean(lockedLanguage);

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (mode === "create" && !slugTouched) {
      setSlug(slugifyForLanguage(event.target.value, language));
    }
  }

  return (
    <form action={formAction} className="pb-16">
      <EditorHeader
        back={{ href: "/admin/articles", label: "Articles" }}
        title={mode === "create" ? "New article" : initialValues?.title || "Edit article"}
        status={<StatusBadge tone={published ? "success" : "neutral"}>{published ? "Published" : "Draft"}</StatusBadge>}
        actions={
          <>
            {mode === "edit" && initialValues?.published && (
              <a href={getLanguagePath(`/articles/${initialValues.slug}`, initialValues.language)} target="_blank" rel="noopener noreferrer">
                <Button type="button" variant="ghost">
                  Preview
                </Button>
              </a>
            )}
            <SubmitButton mode={mode} published={published} />
          </>
        }
      />

      <div className="mx-auto max-w-2xl space-y-6">
        {state.formError && (
          <p role="alert" className="rounded-md bg-admin-danger-bg px-3 py-2 text-sm text-admin-danger">
            {state.formError}
          </p>
        )}

        {translationGroupId && <input type="hidden" name="translationGroupId" value={translationGroupId} />}

        <Card className="space-y-4">
          <FormSection title="Content">
            <FormField label="Language" htmlFor="language-select" error={state.fieldErrors.language?.[0]}>
              <select
                id="language-select"
                name="language"
                value={language}
                disabled={languageLocked}
                onChange={(event) => setLanguage(event.target.value as Language)}
                className={inputClass}
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>
              {languageLocked && <input type="hidden" name="language" value={language} />}
            </FormField>

            {counterpart && <CounterpartStatus counterpart={counterpart} />}

            <FormField label="Title" htmlFor="title-input" error={state.fieldErrors.title?.[0]}>
              <input
                id="title-input"
                name="title"
                type="text"
                dir={language === "ar" ? "rtl" : "ltr"}
                defaultValue={initialValues?.title}
                onChange={handleTitleChange}
                className={inputClass}
              />
            </FormField>

            <FormField
              label="Excerpt"
              htmlFor="excerpt-textarea"
              error={state.fieldErrors.excerpt?.[0]}
              help="Shown on article cards and social previews."
            >
              <textarea
                id="excerpt-textarea"
                name="excerpt"
                rows={2}
                dir={language === "ar" ? "rtl" : "ltr"}
                defaultValue={initialValues?.excerpt}
                className={inputClass}
              />
            </FormField>

            <AdminImageField
              name="coverImage"
              label="Cover image"
              required
              initialValue={initialValues?.coverImage}
            />
            {state.fieldErrors.coverImage && (
              <p role="alert" className="text-sm text-admin-danger">
                {state.fieldErrors.coverImage[0]}
              </p>
            )}

            <SlugField slug={slug} onChange={(value) => { setSlugTouched(true); setSlug(value); }} error={state.fieldErrors.slug?.[0]} />
          </FormSection>
        </Card>

        <Card className="space-y-2">
          <BodyEditor initialValue={initialValues?.body} />
          {state.fieldErrors.body && (
            <p role="alert" className="text-sm text-admin-danger">
              {state.fieldErrors.body[0]}
            </p>
          )}
        </Card>

        <Card>
          <FormSection title="Associations" help="Optional related content — not part of publishing state.">
            <FormField label="Related project" htmlFor="related-project-select" error={state.fieldErrors.relatedProjectId?.[0]}>
              <select
                id="related-project-select"
                name="relatedProjectId"
                defaultValue={initialValues?.relatedProjectId?.toString() ?? ""}
                className={inputClass}
              >
                <option value="">None</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Related solution" htmlFor="related-solution-select" error={state.fieldErrors.relatedSolution?.[0]}>
              <select
                id="related-solution-select"
                name="relatedSolution"
                defaultValue={initialValues?.relatedSolution ?? ""}
                className={inputClass}
              >
                <option value="">None</option>
                {RELATED_SOLUTIONS.map((solution) => (
                  <option key={solution} value={solution}>
                    {solution}
                  </option>
                ))}
              </select>
            </FormField>
          </FormSection>
        </Card>

        <Card>
          <FormSection title="Publishing">
            <label className="flex items-center gap-3">
              <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
                <input
                  type="checkbox"
                  name="published"
                  checked={published}
                  onChange={(event) => setPublished(event.target.checked)}
                  className="peer sr-only"
                />
                <span className="absolute inset-0 rounded-full border border-admin-border-strong bg-admin-surface-elevated transition-colors peer-checked:border-admin-accent peer-checked:bg-admin-accent" />
                <span className="absolute left-0.5 h-5 w-5 rounded-full bg-admin-text-primary transition-transform peer-checked:translate-x-5" />
              </span>
              <span className={`text-sm font-medium ${textPrimary}`}>{published ? "Published" : "Draft"}</span>
            </label>

            <FormField
              label="Publish date override"
              htmlFor="published-at-input"
              help={
                initialValues?.publishedAt
                  ? `Currently ${formatDateInputValue(initialValues.publishedAt)} — leave blank to keep it unchanged.`
                  : "Leave blank to auto-stamp on first publish."
              }
            >
              <input id="published-at-input" name="publishedAt" type="date" defaultValue="" className={inputClass} />
            </FormField>
          </FormSection>
        </Card>
      </div>
    </form>
  );
}
