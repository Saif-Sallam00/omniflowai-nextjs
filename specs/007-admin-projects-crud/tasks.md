---

description: "Task list for Admin Projects CRUD (Phase 2, Slice 3)"
---

# Tasks: Admin Projects CRUD (Phase 2, Slice 3)

**Input**: Design documents from `/specs/007-admin-projects-crud/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/server-actions.md, quickstart.md

**Tests**: Not requested for this slice (per plan.md's Testing section — no automated test framework introduced, consistent with every prior slice). No test tasks are generated; each user-story phase ends with its own manual/DB-inspection verification task mapped to quickstart.md and spec.md's acceptance scenarios.

**Organization**: Tasks are grouped by user story (spec.md P1–P7) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no unmet dependency)
- **[Story]**: Which user story this task belongs to (US1–US7)
- Exact file paths are included in every task description

## Path Conventions

Single Next.js App Router project at the repository root — `app/(en)/admin/(protected)/projects/`, `lib/db/portfolio.ts`, per plan.md's Project Structure. **No schema change, no migration this slice** — `lib/db/schema.ts` and `drizzle/` are not touched by any task below.

---

## Phase 1: Setup

**Purpose**: The type-only additions every later task builds on, plus confirming this slice introduces nothing new to install or generate.

- [X] T001 [P] Add type definitions to `lib/db/portfolio.ts` (no runtime logic yet): `ProjectRow` (`typeof projects.$inferSelect`), `ProjectTranslationRow` (`typeof projectTranslations.$inferSelect`), `SystemCardSlotInput` (`{ icon, titleEn, descriptionEn, titleAr, descriptionAr }`), `ResultSlotInput` (`{ value, labelEn, labelAr }`), `ProjectTranslationContentInput` (every optional/required `project_translations` text field plus `tags`/`technologies: string[]`), `CreateProjectInput` (canonical fields + `systemCards: SystemCardSlotInput[]` + `results: ResultSlotInput[]` + `en`/`ar: ProjectTranslationContentInput`), `UpdateProjectInput` (`= CreateProjectInput` — edit always submits the complete shape, never a partial patch), `ProjectWithTranslations` (`ProjectRow & { en: ProjectTranslationRow; ar: ProjectTranslationRow }`) — exact shapes from data-model.md. **Verify**: no new dependency is introduced anywhere in this slice (confirm `package.json` is untouched); no new slug module is created (project slugs reuse `lib/article-slug.ts`'s existing `SLUG_PATTERN_EN`/`slugifyForLanguage` directly, per research.md Item 4 — do not create a `lib/project-slug.ts`).

**Checkpoint**: Shared types available — Foundational and every user story's DAL/form work can begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The DAL reads and shared action-layer scaffolding that more than one user story depends on. No user-story implementation task should start before this phase is complete.

**⚠️ CRITICAL**: User Stories 1 and 3 both depend on every task in this phase.

- [X] T002 [P] Add `getProjectById(id: number): Promise<ProjectWithTranslations | null>` to `lib/db/portfolio.ts` — loads the canonical `projects` row by id plus both its `project_translations` rows (`language = "en"` and `language = "ar"`), null-on-miss (leads/articles precedent). Needed by User Story 3 (edit pre-fill) and User Story 4 (delete's revalidation-path lookup).
- [X] T003 [P] Add `listProjectCategories(): Promise<string[]>` to `lib/db/portfolio.ts` — `SELECT DISTINCT category FROM projects ORDER BY category`, wrapped in React's `cache()`. Feeds the create/edit forms' category datalist (FR-5.2) — a suggestion list, never a restriction. Needed by User Story 1 and User Story 3's forms.
- [X] T004 Create `app/(en)/admin/(protected)/projects/project-form-schema.ts` as a non-`"use server"` module (mirrors `articles/article-form-schema.ts`'s split — a `"use server"` file may only export async functions) containing: the `ProjectFieldName` union type, the `ProjectFormState` type (`{ status: "idle" | "success" | "error"; fieldErrors: Partial<Record<ProjectFieldName, string[]>>; formError: string | null }`, `INITIAL_PROJECT_FORM_STATE`), a Zod schema validating: `slug` against `SLUG_PATTERN_EN` imported directly from `@/lib/article-slug` (no new slug module, research.md Item 4); `category`/`coverImage` non-empty strings; `logo`/`mediaImage` string-or-null; `isFeatured`/`isServiceShowcase` booleans; `systemCards` as an array of `{ icon: <one of SYSTEM_CARD_ICONS>, titleEn, descriptionEn, titleAr, descriptionAr }` with **length enforced between 1 and 6 inclusive** and **all four text fields required (non-empty) on every row** — reject a row with text in only one language (pinned correction #3); `results` as an array of `{ value, labelEn, labelAr }` with **no minimum or maximum length enforced** but **all three fields required (non-empty) on every row present** — `value` validated as a plain non-empty string (e.g. `"40%"`, `"3x"`), never parsed or coerced to a number (pinned correction #3); `en`/`ar` objects each requiring non-empty `title`/`description` with every other field optional/nullable; `en.tags`/`ar.tags`/`en.technologies`/`ar.technologies` as arrays of non-empty strings. Also add `parseProjectFormData(formData)` (reads scalar fields directly off `FormData`, `JSON.parse`s the `systemCardsJson`/`resultsJson`/four tag-and-technology JSON fields before validating, returns `{success, data}` or `{success: false, fieldErrors}` via `.safeParse(...).error.flatten().fieldErrors`), and `mapUniqueViolation(error: unknown): Pick<ProjectFormState, "fieldErrors" | "formError"> | null` — detects a Postgres `23505` (via `.code`/`.constraint`, the exact `isUniqueViolation` mechanism already proven in `articles/article-form-schema.ts`) and, **only** when `error.constraint === "projects_slug_unique"`, returns `{ fieldErrors: { slug: ["That slug is already in use"] }, formError: null }`; any other constraint or error returns `null` so the caller re-throws it (no other unique constraint exists on `projects` today, but an unrecognized one must never be silently mislabeled as a slug clash). **Verify**: file compiles; `systemCards` schema rejects 0 rows, rejects 7 rows, rejects a row with (for example) `titleAr` empty while `titleEn` is filled; `results` schema accepts 0 rows and accepts an arbitrarily large count.

**Checkpoint**: Shared DAL reads and the action-layer scaffold (types, validation, error-mapping) are in place — User Story 1 and User Story 3 implementation can now begin.

---

## Phase 3: User Story 1 - Admin creates a project, both languages at once (Priority: P1) 🎯 MVP

**Goal**: An admin can open a full-page combined form, fill in every shared field and both languages' complete case-study content, and save — creating the canonical project row and both its translation rows together, as one indivisible, all-or-nothing write.

**Independent Test**: Sign in as admin, open `/admin/projects/new`, fill in slug, category, a required cover image, at least one system-capability item, both languages' title/description, save, and confirm — by inspecting the database directly — that exactly one `projects` row and exactly two `project_translations` rows (`en`, `ar`) exist together.

### Implementation for User Story 1

- [X] T005 [US1] Add to `lib/db/portfolio.ts`: the internal (unexported) `fanOutSystemCards(slots: SystemCardSlotInput[]): { en: SystemCard[]; ar: SystemCard[] }` and `fanOutResults(slots: ResultSlotInput[]): { en: ResultMetric[]; ar: ResultMetric[] }` helpers (data-model.md's fan-out section — mapping the **same** slot array in the **same** order into each language's array, so icon/order and value are identical across `en`/`ar` by construction), and `createProject(input: CreateProjectInput): Promise<ProjectWithTranslations>` — **the correctness centerpiece of this slice**: wraps the entire write in `db.transaction(async (tx) => { ... })` (research.md Item 1), performing, all on `tx` (never the outer `db`): (1) `INSERT INTO projects` with the canonical fields, `RETURNING *`; (2) fan out `input.systemCards`/`input.results` via the two helpers above; (3) `INSERT INTO project_translations` for `language: "en"` with `input.en`'s fields plus the fanned-out `en` `systemCards`/`results`, `RETURNING *`; (4) the same for `language: "ar"`; (5) return `{ ...project, en, ar }`. Any thrown error inside the transaction callback must roll back every statement already executed in it — do not wrap individual statements in separate try/catch blocks that could partially succeed.
- [X] T006 [P] [US1] Create `app/(en)/admin/(protected)/projects/cover-image-field.tsx` — a Client Component: required upload-on-select control, directly mirroring `app/(en)/admin/(protected)/articles/cover-image-field.tsx` exactly (immediate `fetch("/api/image", { method: "POST", body: formData })` on file selection, hidden `<input type="hidden" name="coverImage">` carrying the returned `url`, thumbnail preview, inline error on upload failure).
- [X] T007 [P] [US1] Create `app/(en)/admin/(protected)/projects/logo-image-field.tsx` — same upload-on-select pattern as T006, but optional: the hidden input may be submitted empty, and the label/copy makes clear this is the client-identity logo, distinct from the cover thumbnail (FR-11.2).
- [X] T008 [P] [US1] Create `app/(en)/admin/(protected)/projects/media-image-field.tsx` — same upload-on-select pattern as T006, optional, labeled as the case-study media image (distinct from both cover and logo, FR-11.2).
- [X] T009 [P] [US1] Create `app/(en)/admin/(protected)/projects/system-cards-editor.tsx` — a Client Component holding **one** array of slot objects (`{ icon, titleEn, descriptionEn, titleAr, descriptionAr }[]`) in local state (research.md Item 3 — never two separate per-language arrays). Renders each slot as one row: an `icon` `<select>` populated from `SYSTEM_CARD_ICONS` (`lib/db/schema.ts`), an English title input, an English description textarea, an Arabic title input, an Arabic description textarea, and a remove-row button; an "Add system card" button appends a new empty slot; simple up/down (or drag-free reorder) controls change the array's order. Disable/hide the add button at 6 rows and the remove button at 1 row as a client-side UX nicety (the server-side 1–6 enforcement in T004 is authoritative regardless). On every change, serialize the current slot array to JSON into a single `<input type="hidden" name="systemCardsJson">`.
- [X] T010 [P] [US1] Create `app/(en)/admin/(protected)/projects/results-editor.tsx` — the same repeatable-row-builder shape as T009, for `{ value, labelEn, labelAr }[]` slots (one shared `value` input, one English label input, one Arabic label input, remove/add/reorder), serialized to a single `<input type="hidden" name="resultsJson">` on every change. No minimum/maximum row count is enforced here (unlike system cards).
- [X] T011 [P] [US1] Create `app/(en)/admin/(protected)/projects/chip-input.tsx` — one reusable Client Component: a controlled `value: string[]` + local draft-text state; Enter or comma commits the draft as a new chip (deduped), Backspace on an empty draft removes the last chip, each chip has its own remove button, blur commits any pending draft. Accepts a `name` prop and serializes its current array to a single hidden JSON input under that name. This one component is instantiated four times by T012 (EN tags, AR tags, EN technologies, AR technologies) — do not create four separate components (research.md Item 2).
- [X] T012 [US1] Create `app/(en)/admin/(protected)/projects/project-form.tsx` — a Client Component assembling: `slug` input (with a "Generate from English title" button calling `slugifyForLanguage(englishTitleValue, "en")` from `@/lib/article-slug`, per FR-10.2 — the slug field itself always stays freely editable), `category` input bound to a `<datalist>` populated from a `categories: string[]` prop, `isFeatured`/`isServiceShowcase` checkboxes, `<CoverImageField>` (T006), `<LogoImageField>` (T007), `<MediaImageField>` (T008), an English content section (title, description, and every optional case-study field from `ProjectTranslationContentInput`, plus a `<ChipInput name="enTags">` and `<ChipInput name="enTechnologies">`) and a mirrored Arabic content section, a single `<SystemCardsEditor>` (T009, rendered once, not per language) and a single `<ResultsEditor>` (T010, rendered once), and a submit button. Uses `useActionState(action, INITIAL_PROJECT_FORM_STATE)` and renders `fieldErrors`/`formError` inline next to each field. Accepts an `action` prop and a `categories: string[]` prop — no direct DAL/data-fetching inside this Client Component.
- [X] T013 [US1] Add `createProjectAction(prevState: ProjectFormState, formData: FormData): Promise<ProjectFormState>` to `app/(en)/admin/(protected)/projects/actions.ts` (new file): `await requireAuth()` first; parse and validate via `parseProjectFormData` (T004) (on failure, return the resulting `fieldErrors`); pre-check for an existing project with the same `slug` and, if found, return the slug `fieldErrors` message directly (FR-10.3) without calling the DAL; call `createProject` (T005) inside a `try`, mapping any thrown error via `mapUniqueViolation` (T004) as the race backstop (re-throwing anything `mapUniqueViolation` returns `null` for); on success, `revalidatePath("/admin/projects")` plus `/portfolio`, `/ar/portfolio`, `/portfolio/{slug}`, `/ar/portfolio/{slug}` (FR-14.1), then `redirect("/admin/projects")`.
- [X] T014 [US1] Create `app/(en)/admin/(protected)/projects/new/page.tsx` — a Server Component: calls `listProjectCategories()` (T003), renders `<ProjectForm action={createProjectAction} categories={...} />` in create mode (no pre-fill).
- [X] T015 [US1] Manually verify User Story 1 end-to-end: sign in, open `/admin/projects/new`, fill every shared field, upload a cover image, add at least one system-capability item, add at least one result, fill both languages' title/description, save; confirm redirect to `/admin/projects` and — by querying `projects`/`project_translations` directly — exactly one canonical row and exactly two translation rows exist (AC1); confirm leaving slug, category, cover image, or either language's title/description blank is rejected inline with nothing written (AC3).
- [X] T016 [US1] **Atomicity verification (pinned correction #1, the correctness centerpiece)**: force a failure partway through a create — e.g. submit a slug that already exists so the canonical `INSERT` itself fails inside the transaction, or (if feasible to simulate) inject a failure between the `en` and `ar` translation inserts — and confirm, by querying the database directly, that **zero** rows exist afterward: no orphan `projects` row, and no `project_translations` row for either language. Re-run with a clean, valid submission afterward and confirm a normal create still succeeds (AC2, spec Edge Cases).

**Checkpoint**: User Story 1 is fully functional and independently testable — an admin can create a fully bilingual project from nothing, and the all-or-nothing write guarantee is directly verified.

---

## Phase 4: User Story 2 - Admin lists all projects (Priority: P2)

**Goal**: The admin can see every project in one list, one row per project, ordered by most-recently-updated first.

**Independent Test**: Create a small number of projects (via User Story 1) and confirm the list shows one row per project with the correct thumbnail, title, category, and flag state, most-recently-updated first.

### Implementation for User Story 2

- [X] T017 [US2] Add `ProjectAdminListItem` type and `listProjectsForAdmin(): Promise<ProjectAdminListItem[]>` to `lib/db/portfolio.ts` — a single query joining `projects` to `project_translations` filtered `language = "en"` (mirroring `listProjectsForSelect`'s existing join pattern), selecting `id, slug, category, coverImage, isFeatured, isServiceShowcase, updatedAt` from `projects` and `title` from the `en` translation, ordered by `projects.updatedAt desc` (FR-1.3). No grouping/fan-out logic needed — one row per project already (research.md Item 6).
- [X] T018 [US2] Create `app/(en)/admin/(protected)/projects/page.tsx` — a Server Component: calls `listProjectsForAdmin()` (T017) directly (no API layer, P-05), renders one row per project showing cover thumbnail, English title, category, featured/showcase state, and placeholder edit/delete/preview action slots (wired fully in User Stories 3/4/7). Includes a "New project" link to `/admin/projects/new`.
- [X] T019 [US2] Manually verify User Story 2: with several existing projects, open `/admin/projects`; confirm every project appears, one row each, with the correct thumbnail/title/category/flag state (AC1); confirm the most-recently-updated project appears first (AC2).

**Checkpoint**: User Stories 1 and 2 together give a fully usable create-and-browse loop.

---

## Phase 5: User Story 3 - Admin edits an existing project (Priority: P3)

**Goal**: An admin can open an existing project in the same combined form, pre-filled with its shared details and both languages' content, change anything, and save — updating all three rows atomically.

**Independent Test**: Create a project (User Story 1), edit its English description and one shared field, save, and confirm the change is reflected while nothing else changed unexpectedly.

### Implementation for User Story 3

- [X] T020 [US3] Add `updateProject(id: number, input: UpdateProjectInput): Promise<ProjectWithTranslations | null>` to `lib/db/portfolio.ts` — wraps the update in `db.transaction(async (tx) => { ... })` exactly as `createProject` does (research.md Item 1): (1) `UPDATE projects SET ..., updatedAt: sql\`now()\` WHERE id = ? RETURNING *` (null-on-miss, returning `null` from the whole function if no row matched); (2) fan out `input.systemCards`/`input.results` via the same two helpers from T005; (3) `UPDATE project_translations SET ..., systemCards: <fanned>, results: <fanned>, updatedAt: sql\`now()\` WHERE projectId = id AND language = "en" RETURNING *`; (4) the same for `"ar"`; (5) return `{ ...project, en, ar }`. This is a **straight UPDATE of both translation rows** — they always exist post-create per the both-languages-required invariant, so no upsert logic is needed (research.md's resolved "Notes for /plan" question).
- [X] T021 [US3] Extend `app/(en)/admin/(protected)/projects/project-form.tsx` (T012) to support edit mode: an `initialValues`/`mode: "create" | "edit"` prop; when editing, every field (shared and both languages') is pre-filled from `initialValues`, including reconstructing the `SystemCardsEditor`/`ResultsEditor`'s slot arrays by zipping the `en`/`ar` stored arrays back into shared slots (matching index position — `slots[i] = { icon: en[i].icon, titleEn: en[i].title, descriptionEn: en[i].description, titleAr: ar[i].title, descriptionAr: ar[i].description }`).
- [X] T022 [US3] Add `updateProjectAction(id: number, prevState: ProjectFormState, formData: FormData): Promise<ProjectFormState>` to `actions.ts` (T013) — `requireAuth()` first; load the current project via `getProjectById(id)` (T002, needed both to know the old slug for revalidation and to compare against the submitted slug); validate via `parseProjectFormData`; **only run the slug-clash pre-check when the submitted slug differs from the current project's own slug** (skips the check entirely on an unchanged slug — avoids the false self-clash pinned correction #4); call `updateProject` (T020) with `mapUniqueViolation` (T004) as the race backstop; on success, `revalidatePath("/admin/projects")` plus the current slug's public list/detail paths in both languages, **and, if the slug changed, the OLD slug's detail paths too** (FR-14.2, so the previous URL doesn't keep serving stale ISR content), then `redirect("/admin/projects")`.
- [X] T023 [US3] Create `app/(en)/admin/(protected)/projects/[id]/edit/page.tsx` — a Server Component: parses `params.id` as an integer (`notFound()` if not numeric), calls `getProjectById(id)` (T002) (`notFound()` on `null`), calls `listProjectCategories()` (T003), renders `<ProjectForm mode="edit" initialValues={...} action={updateProjectAction.bind(null, id)} categories={...} />`.
- [X] T024 [US3] Wire the list page's edit links (`app/(en)/admin/(protected)/projects/page.tsx`, from T018) to `/admin/projects/{id}/edit`.
- [X] T025 [US3] Manually verify User Story 3: edit any field (shared or per-language) and confirm the change persists, `updated_at` advances, and the list re-orders (AC1); **re-save a project without changing its own slug and confirm it succeeds** (pinned correction #4's self-slug-no-false-clash check, AC2); change a slug to one already used by another project and confirm a clear inline rejection (AC3).

**Checkpoint**: Create, list, and edit are all independently functional.

---

## Phase 6: User Story 4 - Admin deletes a project (Priority: P4)

**Goal**: An admin can delete a project, after confirming, with both its language versions removed automatically as part of the same operation.

**Independent Test**: Create a project, delete it (confirming the prompt), and verify the project and both its language versions are gone.

### Implementation for User Story 4

- [X] T026 [US4] Add `deleteProject(id: number): Promise<ProjectRow | null>` to `lib/db/portfolio.ts` — a **single** `DELETE FROM projects WHERE id = ? RETURNING *`, null-on-miss. This function MUST NOT issue any statement against `project_translations` — the already-applied `ON DELETE CASCADE` foreign key (`project_translations.project_id → projects.id`) removes both translation rows automatically at the database level (pinned correction #6).
- [X] T027 [US4] Add `deleteProjectAction(id: number): Promise<void>` to `actions.ts` — `requireAuth()` first; `getProjectById(id)` (T002) to capture the slug/category before deletion (needed for revalidation paths); if `null`, return (no-op, mirrors `deleteArticleAction`'s tolerance); otherwise `deleteProject(id)` (T026), then `revalidatePath("/admin/projects")` plus the deleted project's own public list/detail paths in both languages (FR-14.1).
- [X] T028 [US4] Create `app/(en)/admin/(protected)/projects/delete-project-form.tsx` — a Client Component mirroring `articles/delete-article-form.tsx` exactly: a `<form action={action}>` with a `window.confirm("Delete this project?")` guard in `onSubmit` and a `useFormStatus()`-driven pending/disabled submit button. Wire it into each row's actions in `app/(en)/admin/(protected)/projects/page.tsx` (from T018), bound via `deleteProjectAction.bind(null, project.id)`.
- [X] T029 [US4] Manually verify User Story 4: attempt delete and confirm a confirmation step is required before anything is removed (AC1); confirm deleting a project removes the canonical row and, via cascade, both translation rows — query `project_translations` directly for the deleted project's old id and confirm zero rows remain — and the project no longer appears in the list (AC2).

**Checkpoint**: Full project CRUD (create, list, edit, delete) is complete and independently verified.

---

## Phase 7: User Story 5 - Admin authors structured case-study content (Priority: P5)

**Goal**: Confirm the shared-structure ↔ per-language fan-out built in User Story 1 (and reused in User Story 3's edit path) actually produces, for every saved project, identical icon/order across both languages' `system_cards` and an identical `value` across both languages' `results` — by construction, not by admin care.

**Independent Test**: Create (or edit) a project with several system-capability items and result items, each with distinct per-language text, and confirm — by inspecting the stored data directly — that both languages' arrays share the same icon/order (system cards) or the same value (results) while carrying their own text.

### Implementation for User Story 5

- [X] T030 [US5] **jsonb fan-out verification (pinned correction #2)**: create a project with at least two system-capability items (different icons, clearly distinct English and Arabic titles/descriptions per item) and at least two result items (distinct English and Arabic labels per item, a shared value like `"40%"`). Query `project_translations` directly for both the `en` and `ar` rows of this project and confirm: (a) `system_cards`' `icon` value and array order are byte-identical between the two rows, while `title`/`description` differ per row and match what was entered for that language; (b) `results`' `value` is byte-identical between the two rows, while `label` differs per row and matches what was entered for that language.
- [X] T031 [US5] Manually verify the count/text enforcement pinned in T004: attempt to save a project with zero system-capability items — rejected inline with a clear explanation of the 1–6 range; attempt to save with 7 — rejected the same way; attempt to save a system-capability item with text filled in only one language (e.g. English title/description present, Arabic left blank) — rejected inline (pinned correction #3, "both languages required per row"); confirm `results` has no such minimum — a project may be saved with zero result items (AC3).
- [X] T032 [US5] Manually verify tags/technologies save independently per language: enter different tag/technology values for English and Arabic on the same project, save, and confirm — by inspecting the stored data — that each language's `tags`/`technologies` array holds only what was entered for that language, with no cross-language leakage (AC4).

**Checkpoint**: The shared-structure authoring model's core correctness guarantee (identical shared parts, independent per-language text) is directly verified against real stored data, not just inferred from the code.

---

## Phase 8: User Story 6 - Admin uploads the three project images (Priority: P6)

**Goal**: Confirm the three independent image controls built in User Story 1 behave correctly together: cover required, logo and media optional, all three rendering correctly once saved.

**Independent Test**: Open the create or edit form and, for each of the three image fields, exercise its required/optional behavior and confirm the resulting public rendering.

### Implementation for User Story 6

- [X] T033 [US6] Manually verify User Story 6: attempt to save a project with no cover image selected — rejected, confirming the required control blocks the save (AC1); save a project with only the cover image set (logo and media image left empty) — succeeds, and confirm via direct DB inspection that `logo`/`media_image` are `null` (AC2); upload a logo and a media image on a project, save, and view its public detail pages in both languages — confirm the cover image (list-grid thumbnail context), logo (client-identity hero image), and media image (case-study media section) all render correctly and distinctly, matching `docs/projects-crud-extract.md` §2.2's confirmed render locations (AC3).

**Checkpoint**: All three image fields are independently verified, including the two-optional/one-required distinction.

---

## Phase 9: User Story 7 - Admin previews a project (Priority: P7)

**Goal**: An admin can open a project's live public pages, in both languages, directly from the admin UI.

**Independent Test**: Create a project, use its preview actions, and confirm each opens the correct live public page in the correct language.

### Implementation for User Story 7

- [X] T034 [US7] Add English and Arabic preview actions/links to each project row in `app/(en)/admin/(protected)/projects/page.tsx` (T018) and to the edit page (`[id]/edit/page.tsx`, T023), opening `/portfolio/{slug}` and `/ar/portfolio/{slug}` respectively in a new tab (`target="_blank"`). No new preview renderer — this reuses the existing public portfolio detail page unmodified (FR-16.1), since projects have no draft state.
- [X] T035 [US7] Manually verify User Story 7: use a project's English preview action and confirm the live English public page opens and renders correctly (AC1); use the same project's Arabic preview action and confirm the live Arabic public page opens and renders correctly (AC2).

**Checkpoint**: All seven user stories are independently functional and verified.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final whole-slice checks that span all seven user stories.

- [X] T036 [P] Add `{ path: "/admin/projects", label: "Projects" }` to `ADMIN_NAV_LINKS` in `app/(en)/admin/(protected)/admin-nav.tsx` — the only change to this file.
- [X] T037 **Zero-drift gate (pinned correction #8)**: run `git diff --stat -- lib/db/schema.ts drizzle/` (or `git status --short -- lib/db/schema.ts drizzle/`) and confirm the output is **empty** — no change to the schema definition and no new or modified migration file anywhere in this slice's implementation. If either shows a change, treat it as a defect to fix before proceeding, not an acceptable side effect.
- [X] T038 **Non-regression verification (pinned correction #8)**: confirm the three pre-existing consumers this slice must not break still work exactly as before — (a) load an existing public portfolio list and detail page (both languages) and confirm they render unchanged; (b) load an article that has a `relatedProjectId` set and confirm its "Related project" card (powered by `getRelatedProjectCard`) still renders correctly; (c) open the articles admin's create or edit form and confirm the related-project dropdown (powered by `listProjectsForSelect`) still lists projects correctly (FR-15.2/AC-14).
- [X] T039 Run the project's quality gate from the repository root — `npm run check` (tsc --noEmit), `npm run lint`, `npm run build` — and confirm all three exit with zero errors (FR-17.1/SC-011).
- [X] T040 Run the full `quickstart.md` checklist top to bottom and confirm every row passes, including the cross-cutting rows (revalidation reflects changes on public pages without a manual rebuild, including the old-slug case; every mutating action independently enforces `requireAuth()`).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 (T004's Zod schema imports `SLUG_PATTERN_EN` and references the T001 types) — BLOCKS User Stories 1 and 3.
- **User Story 1 (Phase 3)**: Depends on Phase 2 (T002 not required; T003, T004 required).
- **User Story 2 (Phase 4)**: Depends on Phase 1/2 only (reads `projects`/`project_translations` directly) — not on User Story 1's action/form files, though far more useful to test once User Story 1 can populate rows.
- **User Story 3 (Phase 5)**: Depends on User Story 1 (extends `project-form.tsx` from T012, reuses the fan-out helpers from T005, extends `actions.ts` from T013) and User Story 2 (T024 wires the list page's edit links, from T018).
- **User Story 4 (Phase 6)**: Depends on Phase 2 (T002) and User Story 2 (T028 wires delete UI into the list page, from T018).
- **User Story 5 (Phase 7)**: Purely verifies behavior already built in User Story 1 (T005, T009, T010) and exercised again in User Story 3 (T020) — no new implementation, only verification tasks.
- **User Story 6 (Phase 8)**: Purely verifies behavior already built in User Story 1 (T006, T007, T008) — no new implementation, only a verification task.
- **User Story 7 (Phase 9)**: Depends on User Story 2 (T018) and User Story 3 (T023).
- **Polish (Phase 10)**: Depends on all seven user stories being complete.

### Important note on file-level parallelism

As with the articles slice, this slice's stories share several files heavily: `lib/db/portfolio.ts` (every DAL-adding task after T001 extends it), `project-form.tsx` (US1 builds it, US3 extends it for edit mode), `actions.ts` (US1/US3/US4 each add an action to it), and `projects/page.tsx` (US2 creates it; US3/US4/US7 each wire an action or link into it). Treat the `[P]` markers below as accurate only for tasks in genuinely different files with no such overlap — most tasks in this slice are not marked `[P]` for exactly this reason, despite being organized by independently-testable user story.

### Parallel Opportunities

- T001 (Setup) has no dependents that block it — start immediately.
- T002 and T003 (Foundational) touch the same file (`lib/db/portfolio.ts`) as each other but add independent, non-overlapping functions — safe to implement in either order but not marked `[P]` relative to T001/T004 since T004 depends on T001.
- T006, T007, T008 (three image-field components), T009 (system-cards editor), T010 (results editor), and T011 (chip input) all touch different, brand-new files with no dependency on each other — all six can run in parallel before T012 assembles them.
- T036 (Polish nav-link) has no dependency on T037–T040 and can run any time after Setup.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (shared types).
2. Complete Phase 2: Foundational (shared DAL reads, action-layer scaffold) — CRITICAL, blocks User Stories 1 and 3.
3. Complete Phase 3: User Story 1 (create, transactional, both languages).
4. **STOP and VALIDATE**: Run T015's and T016's verification — an admin can create a fully bilingual project from nothing, and a forced mid-write failure is confirmed to leave zero rows behind.
5. This is a usable MVP: projects can now be authored at all, atomically and bilingually, even before there is a list UI to browse them (verifiable by direct DB inspection, per T015/T016).

### Incremental Delivery

1. Setup + Foundational → shared logic ready.
2. Add User Story 1 → verify independently (T015, T016) → creation works, and the all-or-nothing guarantee is proven, not assumed.
3. Add User Story 2 → verify independently (T019) → the admin can now see what exists.
4. Add User Story 3 → verify independently (T025), including the self-slug no-false-clash check → projects can be corrected after the fact.
5. Add User Story 4 → verify independently (T029) → mistakes can be removed, cleanly, with cascade confirmed.
6. Add User Story 5 → verify independently (T030–T032) → the shared-structure fan-out is directly proven correct against real stored data, not just inferred.
7. Add User Story 6 → verify independently (T033) → the three-image behavior (one required, two optional) is confirmed.
8. Add User Story 7 → verify independently (T035) → preview links are confirmed to open the correct live pages.
9. Polish (Phase 10) → nav link, zero-schema-drift gate, cross-slice non-regression check, quality gate, full quickstart pass.

### Solo Developer Strategy

Given how much this slice's stories share (`lib/db/portfolio.ts`, `project-form.tsx`, `actions.ts`, the list page) and how central the transactional write is to nearly everything else, sequential execution in task order (T001→T040) is the natural path for one implementer — the "Parallel Opportunities" above matter mainly for the six genuinely disjoint new component files (T006–T011) if the work is ever split across two people.

---

## Notes

- [P] tasks touch different files with no unmet dependency — see the file-level-parallelism note above for why most of this slice's tasks are *not* marked [P] despite being organized by independent user story.
- [Story] labels map every user-story-phase task to its spec.md story for traceability.
- No task in this file was generated from a Test-First requirement — tests were not requested for this slice; verification is manual (a running dev session, direct DB inspection where noted) plus the standard quality gate, per plan.md.
- The transactional-write task (T005, reused by T020) is this slice's correctness centerpiece — T016's atomicity verification exists specifically because a partial write here (an orphan canonical row, or a project with only one language) is the exact failure mode the whole slice exists to prevent, and it deserves direct proof, not just code review.
- The jsonb fan-out (also T005, reused by T020) is the second-highest-risk area (per the extraction's own risk assessment) — T030's verification checks real stored bytes, not just the code path, for exactly that reason.
- The zero-schema-drift gate (T037) exists because this slice's entire value proposition depends on `projects`/`project_translations` staying exactly as Decision 013 defined them (FR-15.3) — any drift here would be a silent, easy-to-miss violation of a settled, do-not-reopen decision.
