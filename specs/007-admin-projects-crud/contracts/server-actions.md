# Server Action & Route Contracts: Admin Projects CRUD (Phase 2, Slice 3)

No new Route Handler is introduced by this slice (it consumes Slice 2a's existing `POST /api/image`, unchanged, three times). All new interfaces are Next.js pages (Server Components) and Server Actions, per spec FR-1–FR-17.

---

## Pages

### `GET /admin/projects` — `app/(en)/admin/(protected)/projects/page.tsx` (new)

**Auth**: inherited from the `(protected)` layout's `requireAuth()` — no additional check needed (this page performs no mutation).
**Data**: `listProjectsForAdmin()` (`lib/db/portfolio.ts`, data-model.md), a direct Drizzle read — no API layer (P-05).
**Renders**: one row per project — cover thumbnail, English title, category, featured/showcase state, edit/delete/preview actions — ordered by `updatedAt desc` (FR-1.3).

### `GET /admin/projects/new` — `app/(en)/admin/(protected)/projects/new/page.tsx` (new)

**Auth**: inherited from the layout.
**Data**: `listProjectCategories()` (`lib/db/portfolio.ts`) for the category datalist.
**Renders**: the combined create form (`ProjectForm`, shared with edit), all fields empty/default, both language sections present and required.

### `GET /admin/projects/[id]/edit` — `app/(en)/admin/(protected)/projects/[id]/edit/page.tsx` (new)

**Auth**: inherited from the layout.
**Params**: `params: Promise<{ id: string }>`, parsed as an integer (`projects.id` is `serial`, not `uuid`) — non-numeric or unknown id calls `notFound()`.
**Data**: `getProjectById(id)` (`lib/db/portfolio.ts`) — `null` → `notFound()`. `listProjectCategories()` for the datalist.
**Renders**: the same `ProjectForm`, pre-filled from the loaded project and both its translations, in edit mode.

---

## Server Actions — `app/(en)/admin/(protected)/projects/actions.ts` (new)

Both mutating actions independently call `requireAuth()` as their first line (FR-12.2), matching `articles/actions.ts`'s established precedent.

### `createProjectAction(prevState: ProjectFormState, formData: FormData): Promise<ProjectFormState>`

1. `await requireAuth()`.
2. Parse `formData` (including `JSON.parse`-ing `systemCardsJson`/`resultsJson`/the four tag/technology JSON fields) and validate with the Zod schema (data-model.md's Validation section). On failure → `{ status: "idle", fieldErrors: <zod .flatten().fieldErrors>, formError: null }`.
3. Slug-clash pre-check (data-model.md). On clash → `{ status: "idle", fieldErrors: { slug: [...] }, formError: null }`.
4. Call `createProject` (data-model.md) inside a `try`. On a thrown `23505`, map via `mapUniqueViolation` (research.md Item 5) as the race backstop; any other error re-throws.
5. On success: `revalidatePath("/admin/projects")`, plus the public list and detail paths for both languages (FR-14.1) — `/portfolio`, `/ar/portfolio`, `/portfolio/{slug}`, `/ar/portfolio/{slug}` — then `redirect("/admin/projects")`.

### `updateProjectAction(id: number, prevState: ProjectFormState, formData: FormData): Promise<ProjectFormState>`

Same validation/slug-clash shape as create, with the clash check skipped entirely when the submitted slug equals the project's current slug (data-model.md's pre-check section; avoids the "re-save without changing slug" false-positive). On success: `revalidatePath` for `/admin/projects` plus **both** the old and new slug's public list/detail paths when the slug changed (FR-14.2), or just the current paths when it didn't, then `redirect("/admin/projects")`.

### `deleteProjectAction(id: number): Promise<void>`

1. `await requireAuth()`.
2. Read the project first (needed to know which public paths to revalidate) via `getProjectById(id)`; if `null`, return (no-op, mirrors `deleteArticleAction`'s tolerance of an already-gone row).
3. `deleteProject(id)` — a single `DELETE` on `projects`; the `ON DELETE CASCADE` FK removes both translation rows at the database level (FR-4.1) — this action never issues a delete against `project_translations`.
4. `revalidatePath("/admin/projects")` plus the deleted project's own public list/detail paths in both languages (FR-14.1).

No `useActionState` involvement for delete (matches `deleteArticleAction`'s precedent) — invoked via `<form action={deleteProjectAction.bind(null, project.id)}>` with a `window.confirm()` guard client-side (FR-4.1).

---

## Shared form state type (research.md Item 5, mirroring articles)

```ts
export type ProjectFieldName =
  | "slug" | "category" | "coverImage" | "logo" | "mediaImage"
  | "isFeatured" | "isServiceShowcase"
  | "systemCards" | "results"
  | "en.title" | "en.description" | /* ...remaining en.* fields */
  | "ar.title" | "ar.description" | /* ...remaining ar.* fields */
  | "en.tags" | "ar.tags" | "en.technologies" | "ar.technologies";

export type ProjectFormState = {
  status: "idle" | "success" | "error";
  fieldErrors: Partial<Record<ProjectFieldName, string[]>>;
  formError: string | null;
};
```

Defined alongside a non-`"use server"` `project-form-schema.ts` (Zod schema, `parseProjectFormData`, `mapUniqueViolation`), exactly mirroring `articles/article-form-schema.ts`'s split (a `"use server"` file may only export async functions).

---

## Consumed, unmodified: `POST /api/image` (Slice 2a)

The cover, logo, and media-image controls each call this existing endpoint directly from the browser (research.md Item 2), same as Slice 2b's cover-image control. No contract change; see `specs/005-admin-image-upload/contracts/route-handlers.md`. This slice's only obligation is to store the returned `url` field verbatim in the corresponding field — never the `id` alone, never a data URI.

## Consumed, unmodified: existing `lib/db/portfolio.ts` exports

`getPortfolioListItems`, `getPortfolioSlugs`, `getRelatedProjectCard`, `getPortfolioDetailBySlug`, `listProjectsForSelect` — all remain exactly as they are today (FR-15.2/AC-14). None of this slice's new code changes their signatures, return shapes, or query logic.
