"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { slugifyForLanguage } from "@/lib/article-slug";
import { RELATED_SOLUTIONS } from "@/lib/article-solutions";
import type { ProjectOption } from "@/lib/db/portfolio";
import type { Language } from "@/lib/language";
import {
  INITIAL_ARTICLE_FORM_STATE,
  type ArticleFormState,
} from "./article-form-schema";
import { CoverImageField } from "./cover-image-field";
import { BodyEditor } from "./body-editor";
import { Card } from "@/components/admin/card";
import { Button } from "@/components/admin/button";
import { FormField } from "@/components/admin/form-field";

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

const INPUT_CLASSNAME =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

function formatDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant="primary">
      {pending ? "Saving…" : mode === "create" ? "Create article" : "Save changes"}
    </Button>
  );
}

export function ArticleForm({
  mode,
  action,
  projects,
  initialValues,
  lockedLanguage,
  translationGroupId,
}: {
  mode: "create" | "edit";
  action: ArticleFormAction;
  projects: ProjectOption[];
  initialValues?: ArticleFormInitialValues;
  lockedLanguage?: Language;
  translationGroupId?: string;
}) {
  const [state, formAction] = useActionState(action, INITIAL_ARTICLE_FORM_STATE);

  const [language, setLanguage] = useState<Language>(
    initialValues?.language ?? lockedLanguage ?? "en",
  );
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const languageLocked = mode === "edit" || Boolean(lockedLanguage);

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (mode === "create" && !slugTouched) {
      setSlug(slugifyForLanguage(event.target.value, language));
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.formError && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.formError}
        </p>
      )}

      {translationGroupId && (
        <input type="hidden" name="translationGroupId" value={translationGroupId} />
      )}

      <Card className="space-y-4">
        <FormField
          label="Language"
          htmlFor="language-select"
          error={state.fieldErrors.language?.[0]}
        >
          <select
            id="language-select"
            name="language"
            value={language}
            disabled={languageLocked}
            onChange={(event) => setLanguage(event.target.value as Language)}
            className={INPUT_CLASSNAME}
          >
            <option value="en">English</option>
            <option value="ar">Arabic</option>
          </select>
          {languageLocked && (
            // A disabled <select> does not submit its value — mirror it via a
            // hidden field so the locked language still reaches the action.
            <input type="hidden" name="language" value={language} />
          )}
        </FormField>

        <FormField label="Title" htmlFor="title-input" error={state.fieldErrors.title?.[0]}>
          <input
            id="title-input"
            name="title"
            type="text"
            defaultValue={initialValues?.title}
            onChange={handleTitleChange}
            className={INPUT_CLASSNAME}
          />
        </FormField>

        <FormField label="Slug" htmlFor="slug-input" error={state.fieldErrors.slug?.[0]}>
          <input
            id="slug-input"
            name="slug"
            type="text"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            className={INPUT_CLASSNAME}
          />
        </FormField>

        <FormField label="Excerpt" htmlFor="excerpt-textarea" error={state.fieldErrors.excerpt?.[0]}>
          <textarea
            id="excerpt-textarea"
            name="excerpt"
            rows={2}
            defaultValue={initialValues?.excerpt}
            className={INPUT_CLASSNAME}
          />
        </FormField>
      </Card>

      <Card className="space-y-2">
        <CoverImageField initialValue={initialValues?.coverImage} />
        {state.fieldErrors.coverImage && (
          <p role="alert" className="text-sm text-red-600">
            {state.fieldErrors.coverImage[0]}
          </p>
        )}
      </Card>

      <Card className="space-y-2">
        <BodyEditor initialValue={initialValues?.body} />
        {state.fieldErrors.body && (
          <p role="alert" className="text-sm text-red-600">
            {state.fieldErrors.body[0]}
          </p>
        )}
      </Card>

      <Card className="space-y-4">
        <div>
          <label htmlFor="published-checkbox" className="flex items-center gap-2 text-sm font-medium text-gray-900">
            <input
              id="published-checkbox"
              name="published"
              type="checkbox"
              defaultChecked={initialValues?.published ?? false}
              className="h-4 w-4 rounded border-gray-300"
            />
            Published
          </label>
        </div>

        <div>
          <label htmlFor="published-at-input" className="text-sm font-medium text-gray-900">
            Published at override{" "}
            <span className="font-normal text-gray-500">
              {initialValues?.publishedAt
                ? `(currently ${formatDateInputValue(initialValues.publishedAt)} — leave blank to keep it unchanged)`
                : "(leave blank to auto-stamp on first publish)"}
            </span>
          </label>
          <input
            id="published-at-input"
            name="publishedAt"
            type="date"
            defaultValue=""
            className={`mt-1 ${INPUT_CLASSNAME}`}
          />
        </div>

        <FormField
          label="Related project"
          htmlFor="related-project-select"
          error={state.fieldErrors.relatedProjectId?.[0]}
        >
          <select
            id="related-project-select"
            name="relatedProjectId"
            defaultValue={initialValues?.relatedProjectId?.toString() ?? ""}
            className={INPUT_CLASSNAME}
          >
            <option value="">None</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Related solution"
          htmlFor="related-solution-select"
          error={state.fieldErrors.relatedSolution?.[0]}
        >
          <select
            id="related-solution-select"
            name="relatedSolution"
            defaultValue={initialValues?.relatedSolution ?? ""}
            className={INPUT_CLASSNAME}
          >
            <option value="">None</option>
            {RELATED_SOLUTIONS.map((solution) => (
              <option key={solution} value={solution}>
                {solution}
              </option>
            ))}
          </select>
        </FormField>
      </Card>

      <SubmitButton mode={mode} />
    </form>
  );
}
