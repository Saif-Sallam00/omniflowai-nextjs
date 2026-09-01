"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { slugifyForLanguage } from "@/lib/article-slug";
import { RELATED_SOLUTIONS } from "@/lib/db/articles";
import type { ProjectOption } from "@/lib/db/portfolio";
import type { Language } from "@/lib/language";
import {
  INITIAL_ARTICLE_FORM_STATE,
  type ArticleFormState,
} from "./article-form-schema";
import { CoverImageField } from "./cover-image-field";
import { BodyEditor } from "./body-editor";

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

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Saving…" : mode === "create" ? "Create article" : "Save changes"}
    </button>
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
    <form action={formAction}>
      {state.formError && <p role="alert">{state.formError}</p>}

      {translationGroupId && (
        <input type="hidden" name="translationGroupId" value={translationGroupId} />
      )}

      <div>
        <label htmlFor="language-select">Language</label>
        <select
          id="language-select"
          name="language"
          value={language}
          disabled={languageLocked}
          onChange={(event) => setLanguage(event.target.value as Language)}
        >
          <option value="en">English</option>
          <option value="ar">Arabic</option>
        </select>
        {languageLocked && (
          // A disabled <select> does not submit its value — mirror it via a
          // hidden field so the locked language still reaches the action.
          <input type="hidden" name="language" value={language} />
        )}
        {state.fieldErrors.language && <p role="alert">{state.fieldErrors.language[0]}</p>}
      </div>

      <div>
        <label htmlFor="title-input">Title</label>
        <input
          id="title-input"
          name="title"
          type="text"
          defaultValue={initialValues?.title}
          onChange={handleTitleChange}
        />
        {state.fieldErrors.title && <p role="alert">{state.fieldErrors.title[0]}</p>}
      </div>

      <div>
        <label htmlFor="slug-input">Slug</label>
        <input
          id="slug-input"
          name="slug"
          type="text"
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
        />
        {state.fieldErrors.slug && <p role="alert">{state.fieldErrors.slug[0]}</p>}
      </div>

      <div>
        <label htmlFor="excerpt-textarea">Excerpt</label>
        <textarea id="excerpt-textarea" name="excerpt" rows={2} defaultValue={initialValues?.excerpt} />
        {state.fieldErrors.excerpt && <p role="alert">{state.fieldErrors.excerpt[0]}</p>}
      </div>

      <CoverImageField initialValue={initialValues?.coverImage} />
      {state.fieldErrors.coverImage && <p role="alert">{state.fieldErrors.coverImage[0]}</p>}

      <BodyEditor initialValue={initialValues?.body} />
      {state.fieldErrors.body && <p role="alert">{state.fieldErrors.body[0]}</p>}

      <div>
        <label htmlFor="published-checkbox">
          <input
            id="published-checkbox"
            name="published"
            type="checkbox"
            defaultChecked={initialValues?.published ?? false}
          />
          Published
        </label>
      </div>

      <div>
        <label htmlFor="published-at-input">
          Published at override{" "}
          {initialValues?.publishedAt
            ? `(currently ${formatDateInputValue(initialValues.publishedAt)} — leave blank to keep it unchanged)`
            : "(leave blank to auto-stamp on first publish)"}
        </label>
        <input id="published-at-input" name="publishedAt" type="date" defaultValue="" />
      </div>

      <div>
        <label htmlFor="related-project-select">Related project</label>
        <select
          id="related-project-select"
          name="relatedProjectId"
          defaultValue={initialValues?.relatedProjectId?.toString() ?? ""}
        >
          <option value="">None</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
        {state.fieldErrors.relatedProjectId && (
          <p role="alert">{state.fieldErrors.relatedProjectId[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="related-solution-select">Related solution</label>
        <select
          id="related-solution-select"
          name="relatedSolution"
          defaultValue={initialValues?.relatedSolution ?? ""}
        >
          <option value="">None</option>
          {RELATED_SOLUTIONS.map((solution) => (
            <option key={solution} value={solution}>
              {solution}
            </option>
          ))}
        </select>
        {state.fieldErrors.relatedSolution && (
          <p role="alert">{state.fieldErrors.relatedSolution[0]}</p>
        )}
      </div>

      <SubmitButton mode={mode} />
    </form>
  );
}
