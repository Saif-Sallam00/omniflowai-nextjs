---

description: "Task list for Admin Articles CRUD (Phase 2, Slice 2b)"
---

# Tasks: Admin Articles CRUD (Phase 2, Slice 2b)

**Input**: Design documents from `/specs/006-admin-articles-crud/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/server-actions.md, quickstart.md

**Tests**: Not requested for this slice (per plan.md's Testing section — no automated test framework introduced, consistent with every prior slice). No test tasks are generated; each user-story phase ends with its own manual verification task mapped to quickstart.md and spec.md's acceptance scenarios.

**Organization**: Tasks are grouped by user story (spec.md P1–P8) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no unmet dependency)
- **[Story]**: Which user story this task belongs to (US1–US8)
- Exact file paths are included in every task description

## Path Conventions

Single Next.js App Router project at the repository root — `app/(en)/admin/(protected)/articles/`, `lib/db/`, `lib/`, per plan.md's Project Structure. **No schema change, no migration this slice** — `lib/db/schema.ts` and `drizzle/` are not touched by any task below.

---

## Phase 1: Setup

**Purpose**: The one piece of new, dependency-free logic every later task needs — language-aware slug handling — built and available before anything else references it.

- [X] T001 [P] Create `lib/article-slug.ts`: export `SLUG_PATTERN_EN` (`^[a-z0-9]+(?:-[a-z0-9]+)*$`), `SLUG_PATTERN_AR` (Arabic block `U+0600`–`U+06FF` plus ASCII digits `0-9`, single hyphens between words, no Arabic-Indic digits — research.md Item 1), and `slugifyForLanguage(title: string, language: Language): string` — for `en`, the old app's exact algorithm (lowercase, NFKD-normalize, strip diacritics, replace non-`[a-z0-9]` runs with a single hyphen, trim, slice to 80 chars); for `ar`, a parallel function that does **not** lowercase, strips Arabic diacritics (harakat: `U+0610`–`U+061A`, `U+064B`–`U+065F`, `U+0670`, `U+06D6`–`U+06ED`), replaces any run of characters outside `SLUG_PATTERN_AR`'s class with a single hyphen, trims, slices to 80 chars. No new dependency. **Verify**: a quick manual check (e.g. a throwaway `node -e` call importing the compiled function, or a temporary console.log in a page) confirms an English title produces the same slug as before and an Arabic title produces a non-empty, Arabic-script slug.

**Checkpoint**: Slug logic available — Foundational and every user story's form/validation work can begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The DAL reads and shared action-layer scaffolding that more than one user story depends on. No user-story implementation task should start before this phase is complete.

**⚠️ CRITICAL**: User Stories 1 and 3 both depend on every task in this phase.

- [X] T002 [P] Add `getArticleById(id: number): Promise<ArticleRow | null>` to `lib/db/articles.ts` — `SELECT * FROM articles WHERE id = ? LIMIT 1`, null-on-miss (leads-precedent). Add the `ArticleRow` type (`typeof articles.$inferSelect`) alongside it if not already added by a later task that needs it first. Needed by User Story 3 (edit pre-fill) and User Story 4 (delete's revalidation-path lookup).
- [X] T003 [P] Add `listProjectsForSelect(): Promise<ProjectOption[]>` to `lib/db/portfolio.ts` — joins `projects` to `project_translations` filtered `language = "en"` (admin is English-only), returns `{ id, title }[]` ordered by title, mirroring `getRelatedProjectCard`'s existing join pattern (data-model.md). Needed by User Story 1 and User Story 3's forms (the related-project dropdown).
- [X] T004 Create `app/(en)/admin/(protected)/articles/actions.ts` as a scaffold (`"use server"` file) containing: the `ArticleFieldName` union type, the `ArticleFormState` type (`{ status: "idle" | "success" | "error"; fieldErrors: Partial<Record<ArticleFieldName, string[]>>; formError: string | null }` — research.md Item 5, modeled on `lib/actions/leads.ts`'s `ContactActionState`), a Zod schema for the article form's fields (using `SLUG_PATTERN_EN`/`SLUG_PATTERN_AR` from T001 for language-aware slug validation, FR-2.2's required fields, FR-10's optional/nullable fields), and a `mapUniqueViolation(error: unknown, language: Language): Partial<ArticleFormState> | null` helper that inspects a caught Postgres error for code `23505` and branches on the violated constraint's name: `articles_language_slug_unique` → `{ fieldErrors: { slug: ["That slug is already in use"] } }`; `articles_translation_group_id_language_unique` → `{ formError: \`An ${language} version of this article already exists\` }`; any other error → `null` (re-throw). This is a correctness-critical helper (per the pinned correction: **do not** map every `23505` to the slug message) — build both branches now even though only User Story 5's counterpart path will ever exercise the second one. No action bodies yet (added in US1/US3/US4/US5). **Verify**: file compiles; the two branches are distinguishable by constraint name, not just "any 23505."

**Checkpoint**: Shared DAL reads and the action-layer scaffold (types, validation, error-mapping) are in place — User Story 1 and User Story 3 implementation can now begin.

---

## Phase 3: User Story 1 - Admin creates a new article (Priority: P1) 🎯 MVP

**Goal**: An admin can open a full-page create form, fill every field (including uploading a cover image), and save — producing a valid, database-backed article row.

**Independent Test**: Sign in as admin, open `/admin/articles/new`, fill in language, title, slug (confirm auto-generation and language-aware validation), excerpt, cover image (via upload), body, and publish state, save, and confirm — by inspecting the database directly — that a row was inserted with a freshly generated `translation_group_id`.

### Implementation for User Story 1

- [X] T005 [US1] Add to `lib/db/articles.ts`: `ArticleRow`, `CreateArticleInput`, `UpdateArticleInput` types (data-model.md's shapes — `UpdateArticleInput` is `Partial<Omit<CreateArticleInput, "translationGroupId">>`), the internal (unexported) `stampPublishedAt(update, current?)` helper (ported verbatim from the old app's `server/storage.ts:245-258` invariant — explicit `publishedAt` always wins; otherwise stamp `new Date()` only on the first transition to `published: true`; otherwise leave `publishedAt` as-is), and `createArticle(input: CreateArticleInput): Promise<ArticleRow>` — a single `INSERT ... RETURNING`, including `translationGroupId` in the insert values only when `input.translationGroupId` is set (otherwise omitting the column entirely so `gen_random_uuid()`'s column default applies), with `publishedAt: stampPublishedAt(input)`.
- [X] T006 [P] [US1] Create `app/(en)/admin/(protected)/articles/cover-image-field.tsx` — a Client Component: `<input type="file">` whose `onChange` immediately `POST`s the selected file as `multipart/form-data` to `/api/image` (same-origin `fetch`, admin session cookie sent automatically), shows a pending state while uploading, and on success renders a thumbnail `<img src={url}>` preview and writes the returned `url` into a `<input type="hidden" name="coverImage" value={url}>` inside the surrounding form. On upload failure, shows an inline message and leaves the hidden field empty (FR-8.1's required-field validation then catches it downstream — no separate error channel needed here).
- [X] T007 [P] [US1] Create `app/(en)/admin/(protected)/articles/body-editor.tsx` — a Client Component wrapping a plain `<textarea name="body">` (controlled value/onChange), no rich-text editing (FR-9.1). Do **not** add the "insert image" control yet — that is User Story 6's task (T030), which extends this same file.
- [X] T008 [US1] Create `app/(en)/admin/(protected)/articles/article-form.tsx` — a Client Component assembling: a `language` `<select>` (`en`/`ar`, enabled by default — locking it is User Story 5's concern, T027), `title` input wired to auto-populate `slug` via `slugifyForLanguage` (T001) while the slug field has not been manually touched (mirrors the old app's create-mode-only auto-generation, extraction §5), an editable `slug` input, `excerpt` textarea, `<CoverImageField>` (T006), `<BodyEditor>` (T007), a `published` checkbox, and `relatedProjectId`/`relatedSolution` `<select>` elements (options from a `projects: ProjectOption[]` prop, `relatedSolution` from the fixed 4-id list `foundation`/`growth-engine`/`scale-infrastructure`/`custom`). Uses `useActionState(action, initialState)` (React 19) to drive submission and render `fieldErrors`/`formError` from `ArticleFormState` (T004) inline next to each field. Accepts an `action` prop (the bound Server Action) and a `projects: ProjectOption[]` prop — no direct DAL/data-fetching inside this Client Component.
- [X] T009 [US1] Add `createArticleAction(prevState: ArticleFormState, formData: FormData): Promise<ArticleFormState>` to `app/(en)/admin/(protected)/articles/actions.ts`: `await requireAuth()` first; parse and validate `formData` with T004's Zod schema (on failure, return `{ status: "idle", fieldErrors: <zod .flatten().fieldErrors>, formError: null }`); pre-check for an existing `(language, slug)` row and, if found, return the slug `fieldErrors` message directly (FR-7.3) without calling the DAL; call `createArticle` (T005) inside a `try`, catching any thrown error with `mapUniqueViolation` (T004) as a backstop; on success, `revalidatePath("/admin/articles")` plus the created row's public list path (`/articles` or `/ar/articles`) and detail path (`/articles/{slug}` or `/ar/articles/{slug}`) per its language (FR-13.1), then `redirect("/admin/articles")`.
- [X] T010 [US1] Create `app/(en)/admin/(protected)/articles/new/page.tsx` — a Server Component: calls `listProjectsForSelect()` (T003), renders `<ArticleForm action={createArticleAction} projects={...} />` in create mode with no language lock and no `translationGroupId` default (fresh create only — reading `?group=&lang=` is User Story 5's task, T026).
- [X] T011 [US1] Manually verify User Story 1 end-to-end: sign in, open `/admin/articles/new`, fill every field including a cover-image upload, save; confirm redirect to `/admin/articles` and — by querying the `articles` table directly — a new row with a fresh `translation_group_id` and the chosen language (spec AC1). Confirm slug auto-generates from the title until manually edited, then stays freely editable (AC2). Confirm an EN slug with uppercase/spaces is rejected inline, not with a generic error (AC3). Confirm an AR-language slug using Arabic script is accepted (AC4).

**Checkpoint**: User Story 1 is fully functional and independently testable — an admin can create a valid article from nothing.

---

## Phase 4: User Story 2 - Admin lists all articles, grouped by translation concept (Priority: P2)

**Goal**: The admin can see every article — drafts included — in one list, grouped one row per `translation_group_id`, ordered by most-recently-updated concept first.

**Independent Test**: Seed a mix of English-only, Arabic-only, and fully-paired articles (via User Story 1, or direct DB rows), open the list, and confirm one row per concept with correct per-language state and ordering.

### Implementation for User Story 2

- [X] T012 [US2] Add to `lib/db/articles.ts`: `ArticleGroupRow`/`ArticleGroup` types and `listArticleGroups(): Promise<ArticleGroup[]>` (data-model.md) — a single flat `SELECT id, translationGroupId, language, slug, title, published, updatedAt FROM articles ORDER BY updated_at DESC` (research.md Item 2: no SQL-level grouping), grouped into a `Map<string, ArticleGroup>` in one pass, then the resulting array sorted by each group's own `updatedAt` (the max of its present rows' `updatedAt`) descending.
- [X] T013 [US2] Create `app/(en)/admin/(protected)/articles/page.tsx` — a Server Component: calls `listArticleGroups()` (T012) directly (no API layer, P-05), renders one row per group showing each present language's title and published/draft state; for a missing language, renders an "Add \<language\> version" link to `/admin/articles/new?group={translationGroupId}&lang={missingLanguage}` (FR-1.3 — the link's construction is this story's job; the `new` page actually *consuming* those params is User Story 5's task, T026). Include placeholder edit-link hrefs (`/admin/articles/{id}/edit`) and a placeholder delete-action slot (both wired up fully in User Story 3/4).
- [X] T014 [US2] Manually verify User Story 2: with a mix of published/draft, EN-only, AR-only, and paired articles, open `/admin/articles`; confirm every article appears (drafts included), grouped one row per concept (AC1); confirm an orphan row shows its "add missing language" action (AC2); confirm groups order by most-recently-updated first (AC3).

**Checkpoint**: User Stories 1 and 2 together give a fully usable create-and-browse loop.

---

## Phase 5: User Story 3 - Admin edits an existing article (Priority: P3)

**Goal**: An admin can open one existing article in a full-page edit form, change any field, and save — without touching its paired counterpart.

**Independent Test**: Create a paired EN/AR article (User Stories 1 and 5), edit only the EN row's title and body, save, and confirm the EN row reflects the change while the AR row is byte-for-byte unchanged.

### Implementation for User Story 3

- [X] T015 [US3] Add `updateArticle(id: number, input: UpdateArticleInput): Promise<ArticleRow | null>` to `lib/db/articles.ts` — reads the current row first (`getArticleById`, T002), then `UPDATE articles SET ...input, publishedAt: stampPublishedAt(input, current), updatedAt: sql\`now()\` WHERE id = ? RETURNING *` (research.md Item 4: explicit bump in the DAL, never a schema-level `.$onUpdate`), null-on-miss.
- [X] T016 [US3] Extend `app/(en)/admin/(protected)/articles/article-form.tsx` (T008) to support edit mode: an `initialValues`/`mode: "create" | "edit"` prop; when editing, the `language` `<select>` is disabled/fixed (a row's language never changes) and every other field is pre-filled from `initialValues`.
- [X] T017 [US3] Add `updateArticleAction(id: number, prevState: ArticleFormState, formData: FormData): Promise<ArticleFormState>` to `actions.ts` — same shape as `createArticleAction` (T009): `requireAuth()` first, validate, slug pre-check scoped to `(language, slug)` **excluding this row's own id** (FR-7.3), call `updateArticle` (T015) with `mapUniqueViolation` (T004) as the race backstop, `revalidatePath` for `/admin/articles` plus the row's public list/detail paths (FR-13.1), then `redirect("/admin/articles")`.
- [X] T018 [US3] Create `app/(en)/admin/(protected)/articles/[id]/edit/page.tsx` — a Server Component: parses `params.id` as an integer (`notFound()` if not numeric), calls `getArticleById(id)` (T002) (`notFound()` on `null`), calls `listProjectsForSelect()` (T003), renders `<ArticleForm mode="edit" initialValues={...} action={updateArticleAction.bind(null, id)} projects={...} />`.
- [X] T019 [US3] Wire the list page's edit links (`app/(en)/admin/(protected)/articles/page.tsx`, from T013) to `/admin/articles/{id}/edit`.
- [X] T020 [US3] Manually verify User Story 3: edit a paired article's EN row only — confirm the EN row's fields change and its `updated_at` advances, while the AR row (re-fetch or re-list) is completely unchanged (AC1); re-save a row without changing its own slug and confirm it succeeds (AC2); change a slug to one already used by another row in the same language and confirm a clear inline rejection (AC3).

**Checkpoint**: Create, list, and edit are all independently functional.

---

## Phase 6: User Story 4 - Admin deletes an article (Priority: P4)

**Goal**: An admin can delete a single language's article row, after confirming, without affecting its paired counterpart.

**Independent Test**: Create a paired article, delete only the EN row (confirming the prompt), and verify the EN row is gone while the AR row is untouched.

### Implementation for User Story 4

- [X] T021 [US4] Add `deleteArticle(id: number): Promise<ArticleRow | null>` to `lib/db/articles.ts` — single `DELETE ... RETURNING`, null-on-miss (identical shape to `lib/db/leads.ts`'s `deleteLead`).
- [X] T022 [US4] Add `deleteArticleAction(id: number): Promise<void>` to `actions.ts` — `requireAuth()` first; `getArticleById(id)` (T002) to capture the row's language/slug before deletion (needed for revalidation paths); if `null`, return (no-op, mirrors `deleteLeadAction`'s tolerance); otherwise `deleteArticle(id)` (T021), then `revalidatePath("/admin/articles")` plus the deleted row's own public list/detail paths (FR-13.1).
- [X] T023 [US4] Create `app/(en)/admin/(protected)/articles/delete-article-form.tsx` — a Client Component mirroring `leads/delete-lead-form.tsx` exactly: a `<form action={action}>` with a `window.confirm("Delete this article?")` guard in `onSubmit` and a `useFormStatus()`-driven pending/disabled submit button. Wire it into each row's per-language actions in `app/(en)/admin/(protected)/articles/page.tsx` (from T013), bound via `deleteArticleAction.bind(null, article.id)`.
- [X] T024 [US4] Manually verify User Story 4: attempt delete and confirm a confirmation step is required before anything is removed (AC1); confirm deleting one language's row removes only that row and leaves its paired counterpart fully intact (AC2).

**Checkpoint**: Full single-language CRUD (create, list, edit, delete) is complete and independently verified.

---

## Phase 7: User Story 5 - Admin adds the other-language version of an existing article (Priority: P5)

**Goal**: From an orphan list row, an admin can open a create form pre-linked to the same `translation_group_id` and the missing language, and save a properly paired counterpart.

**Independent Test**: Create an EN-only article (User Story 1), use the list's (User Story 2) "add missing version" link on it, fill in the Arabic form, save, and confirm the new row shares the original's `translation_group_id` and the list now shows one paired row.

### Implementation for User Story 5

- [X] T025 [US5] Extend `app/(en)/admin/(protected)/articles/new/page.tsx` (T010) to read `searchParams: Promise<{ group?: string; lang?: string }>`; validate `lang` against the `Language` enum and `group` against a syntactic UUID shape — if either is missing or invalid, fall back to a fresh, unlinked create (never an error page); when both are valid, pass `lockedLanguage={lang}` and `translationGroupId={group}` into `<ArticleForm>`.
- [X] T026 [US5] Extend `app/(en)/admin/(protected)/articles/article-form.tsx` (T008/T016) to accept a `lockedLanguage?: Language` and `translationGroupId?: string` prop: when `lockedLanguage` is set, the `language` `<select>` is disabled and forced to that value (pin: language is fixed on a counterpart create, not user-changeable — distinct from the edit-mode lock in T016, but the same disabled-select mechanism), and a `<input type="hidden" name="translationGroupId" value={translationGroupId}>` is rendered.
- [X] T027 [US5] Extend `createArticleAction` (T009, `actions.ts`): read `formData.get("translationGroupId")`. When present and non-empty: (a) **counterpart pre-check** — query for an existing row matching `(translationGroupId, language)`; if found, return `{ status: "idle", fieldErrors: {}, formError: `An ${language} version of this article already exists` }` immediately, without calling the DAL (FR-3.3, mirroring the slug pre-check's shape); (b) otherwise pass `translationGroupId` through to `createArticle` (T005) so it overrides the column default. The `mapUniqueViolation` helper (T004) already branches on `articles_translation_group_id_language_unique` — no further change needed there; this task only wires the counterpart-specific pre-check and the value pass-through.
- [X] T028 [US5] Manually verify User Story 5: from an orphan row's "add missing language" link (T013), confirm the create form opens with the language fixed and disabled to the missing language (AC1); complete and save it, confirm a second row is created sharing the original `translation_group_id`, and the list now shows one paired row (AC2); confirm the **specific error messages are distinguishable** — trigger a slug clash on an unrelated field and confirm it shows "That slug is already in use," then (via the pre-check, or by racing two saves if feasible) trigger a same-group/same-language conflict and confirm it shows "An \<language\> version of this article already exists" — **not** the slug message (AC3, pinned correction: 23505 constraint discrimination).

**Checkpoint**: Bilingual pairing is fully functional — the payoff of the `translation_group_id` model is now usable end-to-end.

---

## Phase 8: User Story 6 - Admin uploads a cover image and inline body images (Priority: P6)

**Goal**: Beyond the cover-image upload already required for any create (User Story 1), the admin can insert an image into the Markdown body at the cursor, uploaded the same way.

**Independent Test**: Open the create or edit form; select a cover image and confirm the upload-and-preview behavior (already built in User Story 1, re-verified here as its own acceptance scenario); place the cursor mid-body, use "insert image," and confirm a Markdown reference appears at that exact position and later renders in the published article.

### Implementation for User Story 6

- [X] T029 [US6] Extend `app/(en)/admin/(protected)/articles/body-editor.tsx` (T007): add an "Insert image" file input/button whose `onChange` uploads the selected file to `/api/image` (same direct-`fetch` pattern as `cover-image-field.tsx`, T006) and, on success, splices `\n\n![](${url})\n\n` into the textarea's current value at `textarea.selectionStart` (the exact old-app mechanism, `docs/articles-crud-extract.md` §5.2, ported with the new short-path `url` in place of the old data URI).
- [X] T030 [US6] Manually verify User Story 6: confirm selecting a cover image uploads immediately, shows a preview, and stores a short `/api/image/{id}` path (never a data URI) in the form (AC1); confirm placing the cursor mid-body and using "insert image" inserts the Markdown reference at that exact cursor position, using the same short-path form (AC2); save and publish the article, confirm both the cover image and the inline body image render correctly on the public page (AC3).

**Checkpoint**: Both image-upload mechanisms are independently verified, including the inline body-image capability that was not required for a bare-minimum create.

---

## Phase 9: User Story 7 - Admin controls publish state and first-publish date (Priority: P7)

**Goal**: Confirm the `published`/`published_at` semantics already built into `createArticle`/`updateArticle` (User Stories 1 and 3) behave exactly per the first-publish-only stamping rule, and give the admin a way to supply an explicit override.

**Independent Test**: Create a draft, publish it (confirm a publish date is stamped), edit and re-save it while still published (confirm the date doesn't move), and separately confirm an explicit admin-supplied date is honored as given.

### Implementation for User Story 7

- [X] T031 [US7] Extend `article-form.tsx` (T008) with an optional "Published at" date input (empty by default, only meaningful when `published` is checked) that maps to the `publishedAt` field already accepted by `CreateArticleInput`/`UpdateArticleInput` (T005/T015) — this task only adds the UI control and its `formData` read in `createArticleAction`/`updateArticleAction` (T009/T017); the stamping logic itself (`stampPublishedAt`) was already built in T005 and needs no change.
- [X] T032 [US7] Manually verify User Story 7 against the `stampPublishedAt` logic built in T005/T015: save a new article as a draft and confirm `published_at` is null (AC1); publish it and confirm `published_at` is stamped at that moment (AC2); edit and re-save it while still published and confirm `published_at` does **not** move (AC3, the specific "no re-bump on edit" behavior this correction pins); supply an explicit `published_at` value and confirm it is honored exactly, overriding automatic stamping (AC4); publish only one language of a paired article and confirm both publish states coexist with no error or forced correction (AC5).

**Checkpoint**: Publish-state correctness, including the first-publish-only invariant, is independently verified.

---

## Phase 10: User Story 8 - Admin previews a draft before publishing (Priority: P8)

**Goal**: An admin can open a draft's live public URL from the admin UI and see it render, relying on the existing (Phase 1) draft-visibility mechanism.

**Independent Test**: Create a draft, use its "preview" action, confirm it renders for the signed-in admin, then confirm the same URL 404s for a signed-out visitor with no leaked metadata.

### Implementation for User Story 8

- [X] T033 [US8] Add a "Preview" action/link to each article row in `app/(en)/admin/(protected)/articles/page.tsx` (T013) and to the edit page (`[id]/edit/page.tsx`, T018), opening the article's live public URL (`/articles/{slug}` for `en`, `/ar/articles/{slug}` for `ar`, via `getLanguagePath`) in a new tab (`target="_blank"`). No new preview renderer — this reuses the existing draft-visibility mechanism already present in `app/(en)/(public)/articles/[slug]/page.tsx`/`app/ar/(public)/articles/[slug]/page.tsx` (FR-12.1/FR-12.2), which this slice does not modify.
- [X] T034 [US8] Manually verify User Story 8: open a draft's preview as the signed-in admin and confirm it renders normally (AC1); request the same URL signed out (or in a private window) and confirm a not-found response with no leaked draft title in page metadata (AC2) — confirming this slice has not broken the existing Phase 1 behavior.

**Checkpoint**: All eight user stories are independently functional and verified.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Final whole-slice checks that span all eight user stories.

- [X] T035 [P] Add `{ path: "/admin/articles", label: "Articles" }` to `ADMIN_NAV_LINKS` in `app/(en)/admin/(protected)/admin-nav.tsx` — the only change to this file.
- [X] T036 Confirm **no schema change, no migration** (pinned correction, item 5): `git diff` (or `git status`) shows zero changes to `lib/db/schema.ts` and no new or modified files under `drizzle/` anywhere in this slice's implementation. If either shows a change, treat it as a defect to fix before proceeding, not an acceptable side effect.
- [X] T037 Run the project's quality gate from the repository root — `npm run check` (tsc --noEmit), `npm run lint`, `npm run build` — and confirm all three exit with zero errors (FR-15.1/SC-010).
- [X] T038 Run the full `quickstart.md` checklist top to bottom and confirm every row passes, including the cross-cutting rows (revalidation reflects changes on public pages without a manual rebuild, and every mutating action independently enforces `requireAuth()`).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 (T004's Zod schema uses T001's slug patterns) — BLOCKS User Stories 1 and 3.
- **User Story 1 (Phase 3)**: Depends on Phase 2 (T002 not required; T003, T004 required).
- **User Story 2 (Phase 4)**: Depends on Phase 1/2 only (reads `articles` directly) — not on User Story 1's action/form files, though it is far more useful to test once User Story 1 can populate rows.
- **User Story 3 (Phase 5)**: Depends on User Story 1 (extends `article-form.tsx` from T008, reuses `stampPublishedAt` from T005) and User Story 2 (T019 wires the list page's edit links, from T013).
- **User Story 4 (Phase 6)**: Depends on Phase 2 (T002) and User Story 2 (T023 wires delete UI into the list page, from T013).
- **User Story 5 (Phase 7)**: Depends on User Story 1 (extends T009's action and T010's page and T008's form) and User Story 2 (T013's "add missing language" link).
- **User Story 6 (Phase 8)**: Depends on User Story 1 (extends `body-editor.tsx` from T007).
- **User Story 7 (Phase 9)**: Depends on User Story 1 and User Story 3 (extends both actions' `formData` handling; the underlying DAL logic was already built in T005/T015).
- **User Story 8 (Phase 10)**: Depends on User Story 2 (T013) and User Story 3 (T018).
- **Polish (Phase 11)**: Depends on all eight user stories being complete.

### Important note on file-level parallelism

Unlike a feature where each user story owns disjoint files, this slice's stories **share** three files heavily: `lib/db/articles.ts` (every story after US1 adds a function to it), `article-form.tsx` (US1, US3, US5, US7 each extend it), and `articles/page.tsx` (US2 creates it; US3/US4/US8 each wire an action into it). This is expected for a single-entity CRUD slice — user stories here are independently *testable* (each has its own acceptance scenarios and can be demoed on its own once its dependencies are met), but they are not independently *parallelizable across developers* without real coordination on those three files. Treat the `[P]` markers below as accurate only for tasks in genuinely different files with no such overlap.

### Parallel Opportunities

- T001 (Setup) has no dependents that block it — start immediately.
- T002 and T003 (Foundational) touch different files (`lib/db/articles.ts` vs `lib/db/portfolio.ts`) and can run in parallel.
- T006 and T007 (User Story 1) touch different new files (`cover-image-field.tsx` vs `body-editor.tsx`) and can run in parallel, both before T008 assembles them.
- T035 (Polish nav-link) has no dependency on T036–T038 and can run any time after Setup.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (slug module).
2. Complete Phase 2: Foundational (shared DAL reads, action-layer scaffold) — CRITICAL, blocks User Stories 1 and 3.
3. Complete Phase 3: User Story 1 (create).
4. **STOP and VALIDATE**: Run T011's verification — an admin can create a fully valid article, including its required cover image, from nothing.
5. This is a usable MVP: articles can now be authored at all, even before there is a list UI to browse them (verifiable by direct DB inspection, per T011).

### Incremental Delivery

1. Setup + Foundational → shared logic ready.
2. Add User Story 1 → verify independently (T011) → creation works.
3. Add User Story 2 → verify independently (T014) → the admin can now see what exists.
4. Add User Story 3 → verify independently (T020) → articles can be corrected after the fact.
5. Add User Story 4 → verify independently (T024) → mistakes can be removed.
6. Add User Story 5 → verify independently (T028), including the pinned 23505-discrimination check → bilingual pairing is real.
7. Add User Story 6 → verify independently (T030) → inline body images work, not just the cover.
8. Add User Story 7 → verify independently (T032) → publish-date correctness is confirmed, including the no-re-bump invariant.
9. Add User Story 8 → verify independently (T034) → draft preview is confirmed not to have regressed.
10. Polish (Phase 11) → nav link, zero-schema-drift gate, quality gate, full quickstart pass.

### Solo Developer Strategy

Given how much this slice's stories share (`lib/db/articles.ts`, `article-form.tsx`, the list page), sequential execution in task order (T001→T038) is the natural path for one implementer — the "Parallel Opportunities" above matter mainly for the handful of genuinely disjoint files (T002/T003, T006/T007) if the work is ever split across two people.

---

## Notes

- [P] tasks touch different files with no unmet dependency — see the file-level-parallelism note above for why most of this slice's tasks are *not* marked [P] despite being organized by independent user story.
- [Story] labels map every user-story-phase task to its spec.md story for traceability.
- No task in this file was generated from a Test-First requirement — tests were not requested for this slice; verification is manual (a running dev session, direct DB inspection where noted) plus the standard quality gate, per plan.md.
- The 23505 constraint-discrimination fix (T004's `mapUniqueViolation` helper, exercised fully in T027/T028) is a correctness requirement, not an enhancement: without branching on the constraint name, a counterpart-creation race would incorrectly surface as "That slug is already in use" instead of "An \<language\> version of this article already exists" — a misleading message pointing the admin at the wrong field.
- The zero-schema-drift gate (T036) exists because this slice's entire value proposition depends on `articles` staying exactly as Phase 0 defined it (FR-14.3) — any drift here would be a silent, easy-to-miss violation of a settled, do-not-reopen decision.
