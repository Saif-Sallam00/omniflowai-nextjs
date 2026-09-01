# Server Action & Route Contracts: Admin Articles CRUD (Phase 2, Slice 2b)

No new Route Handler is introduced by this slice (it consumes Slice 2a's existing `POST /api/image`, unchanged). All new interfaces are Next.js pages (Server Components) and Server Actions, per spec FR-1–FR-15.

---

## Pages

### `GET /admin/articles` — `app/(en)/admin/(protected)/articles/page.tsx` (new)

**Auth**: inherited from the `(protected)` layout's `requireAuth()` (`app/(en)/admin/(protected)/layout.tsx:9`) — no additional check needed in the page itself (this page performs no mutation).
**Data**: `listArticleGroups()` (`lib/db/articles.ts`, data-model.md), a direct Drizzle read — no API layer (P-05).
**Renders**: one row per translation group, each present language's title/state/actions; an "Add \<language\>" action for the missing side of an orphan group (FR-1.3), linking to `/admin/articles/new?group={id}&lang={missing}`.

### `GET /admin/articles/new` — `app/(en)/admin/(protected)/articles/new/page.tsx` (new)

**Auth**: inherited from the layout.
**Params**: `searchParams: Promise<{ group?: string; lang?: string }>` (Next 16 convention, per `[slug]/page.tsx`/`leads/page.tsx` precedent). `lang` is validated against the `Language` enum; `group` against a UUID shape check; either failing validation is treated as absent (falls back to a fresh, unlinked create — never an error page).
**Data**: `listProjectsForSelect()` (`lib/db/portfolio.ts`) for the related-project dropdown.
**Renders**: the create form (`ArticleForm`, shared with edit — see Components below), with `translationGroupId`/`language` hidden-field defaults pre-populated from `group`/`lang` when present.

### `GET /admin/articles/[id]/edit` — `app/(en)/admin/(protected)/articles/[id]/edit/page.tsx` (new)

**Auth**: inherited from the layout.
**Params**: `params: Promise<{ id: string }>`. The `id` is parsed as an integer (the `articles.id` column is `serial`, not `uuid` — no UUID-shape guard needed here, unlike Slice 2a's `/api/image/[id]`); a non-numeric or unknown id calls `notFound()`.
**Data**: `getArticleById(id)` (`lib/db/articles.ts`) — `null` → `notFound()`. `listProjectsForSelect()` for the dropdown.
**Renders**: the same shared `ArticleForm`, pre-filled from the loaded row, in edit mode (language fixed/non-editable — FR-4.2).

---

## Server Actions — `app/(en)/admin/(protected)/articles/actions.ts` (new)

All three independently call `requireAuth()` as their first line (FR-11.2), regardless of the layout's own gate — matching `leads/actions.ts`'s existing precedent exactly.

### `createArticleAction(prevState: ArticleFormState, formData: FormData): Promise<ArticleFormState>`

1. `await requireAuth()`.
2. Parse `formData` into a candidate object; validate with a Zod schema encoding FR-7.1 (language-aware slug pattern, via `research.md`'s `slugifyForLanguage`/pattern pair), FR-2.2's required fields, and FR-10's optional-field nullability. On failure → `{ status: "idle", fieldErrors: <zod .flatten().fieldErrors>, formError: null }`.
3. Slug-clash pre-check (data-model.md) scoped to `(language, slug)`. On clash → `{ status: "idle", fieldErrors: { slug: ["That slug is already in use"] }, formError: null }`.
4. If `formData.get("translationGroupId")` is present (counterpart-create path, FR-3.1–FR-3.3): pass it through to `createArticle`. If the insert then fails with a Postgres unique-violation (`23505`) on `(translation_group_id, language)` — the FR-3.3 race — catch it and return `{ status: "idle", fieldErrors: {}, formError: "This translation group already has a <language> version." }`.
5. On success: `revalidatePath("/admin/articles")`, `revalidatePath(languagePath)` and `revalidatePath(detailPath)` for the created row's language (FR-13.1), then `redirect("/admin/articles")`.

### `updateArticleAction(id: number, prevState: ArticleFormState, formData: FormData): Promise<ArticleFormState>`

Same validation/slug-clash shape as create (step 2–3 above), with the clash check excluding `id` (FR-7.3). No `translationGroupId` handling (an edit never changes which group a row belongs to — out of scope, not exposed as a form field). On success: `revalidatePath` for `/admin/articles` plus the affected row's public list/detail paths (FR-13.1), then `redirect("/admin/articles")`.

### `deleteArticleAction(id: number): Promise<void>`

1. `await requireAuth()`.
2. Read the row first (needed to know which public paths to revalidate) via `getArticleById(id)`; if `null`, return (nothing to do — mirrors `deleteLeadAction`'s tolerance of a no-op on an already-gone row).
3. `deleteArticle(id)`.
4. `revalidatePath("/admin/articles")` plus the deleted row's own public list/detail paths (FR-13.1).

No `useActionState` involvement (matches `deleteLeadAction`'s precedent) — invoked via `<form action={deleteArticleAction.bind(null, article.id)}>` with a `window.confirm()` guard client-side (FR-4.4), identical in shape to `leads/delete-lead-form.tsx`.

---

## Shared form state type (research.md, Item 5)

```ts
export type ArticleFieldName =
  | "language" | "title" | "slug" | "excerpt" | "coverImage" | "body"
  | "published" | "relatedProjectId" | "relatedSolution";

export type ArticleFormState = {
  status: "idle" | "success" | "error";
  fieldErrors: Partial<Record<ArticleFieldName, string[]>>;
  formError: string | null;
};
```

Defined alongside the Server Actions in `actions.ts` (type-only export, matching `lib/actions/leads.ts`'s own comment about `"use server"` files only exporting async functions plus erased types).

---

## Consumed, unmodified: `POST /api/image` (Slice 2a)

Both the cover-image control and the body-image insert control call this existing endpoint directly from the browser (research.md, Item 6). No contract change; see `specs/005-admin-image-upload/contracts/route-handlers.md` for its full behavior. This slice's only obligation is to store the returned `url` field verbatim wherever a cover/inline image reference is needed — never the `id` alone, never a data URI.
