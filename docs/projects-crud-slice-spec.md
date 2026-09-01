# Projects CRUD — Phase 2, Slice 3

**Status:** Draft (pending approval)
**Version:** 0.1
**Related decisions:** 001–012, **013 (defines this slice's schema)**, amendments 008.1/008.2/011.1
**Related exceptions:** EX-03 (slug-based portfolio URLs, one Latin slug per project, 301 from legacy id URLs)
**Related slices:** 001 (Foundation), Phase 1 (public portfolio read path), 004 (admin leads), 005 (image upload — consumed here ×3), 006 (articles CRUD — pattern source)
**Authoritative extraction:** `docs/projects-crud-extract.md`

## Overview

Add admin create / edit / delete for portfolio projects — the heaviest Phase 2 slice. Decision 013 rewrote `project_translations` into a full structured case-study field set (client identity, problem/diagnosis/system narrative, `system_cards`, reshaped `results`, CTA overrides) and added `slug`/`logo`/`media_image` to `projects`. This makes the projects editor a **net-new build**, not a port of the old monolingual project admin.

A project is one canonical `projects` row (language-independent: slug, category, flags, three images) plus **both** its `project_translations` rows (EN and AR). The editor is a single combined bilingual form; a project is created and edited as one transactional unit.

The `projects`/`project_translations` schema is frozen and matches Decision 013 verbatim (re-confirmed in the extraction against `schema.ts` and the applied migration `drizzle/0001_case_study_schema.sql`). This slice adds **no schema change** — it is DAL + Server Actions + admin UI only.

## Problem statement

Phase 1 renders projects from the DB but there is no way to author them. The two real production projects (IDs 7 & 8) are migrated at Phase 4 cutover; until then the table is seed-only. Before cutover the operator must be able to author bilingual case studies against the Decision 013 schema. Nothing in the old admin maps to the bilingual, structured, slugged model — the old app was monolingual, had no slug, and edited only arrays of plain strings.

## Decisions settled before this spec (from the extraction + operator sign-off — do not reopen)

- **Editor model:** one combined full-page form. Both EN and AR translations are **required**; a project cannot exist with zero or one translation (projects have no draft state and each language has its own public page — a project can't go live half-translated).
- **Create and edit are transactional** (one canonical row + two translation rows per write — P-15).
- **Delete = whole project**, relying on the existing `ON DELETE CASCADE` FK to remove both translations. No standalone per-translation delete.
- **`system_cards` and `results` are authored once with shared structure + per-language text** (see FR-7/FR-8) — this makes the language-neutral conventions structural, not operator-maintained.
- **`is_featured` / `is_service_showcase` are plain checkboxes with no exclusivity enforcement this slice.** The old `ensureUniqueShowcase` invariant is **deferred** to whenever the services-page hero consumer is built (no live consumer exists today).
- **Legacy id→slug redirects are out of scope** (Phase 4 cutover concern — see Out of Scope).
- **No schema change, no migration.**

## User stories

### US-1 — Admin lists all projects
As the admin, I see every project in a list — one row per project — showing its cover thumbnail, English title, category, and featured/showcase state, with edit / delete / preview actions, ordered by most recently updated.

### US-2 — Admin creates a project (both languages, one form)
As the admin, I open a full-page form, enter the canonical fields once (slug, category, flags, cover image, optional logo/media image) and the full EN and AR case-study content, and save — creating the canonical row and both translation rows together in one atomic action.

### US-3 — Admin edits a project
As the admin, I open an existing project in the same combined form, pre-filled with its canonical fields and both languages' content, change anything, and save — updating all three rows atomically.

### US-4 — Admin deletes a project
As the admin, I delete a project after an explicit confirmation; both its translations are removed automatically via the database cascade.

### US-5 — Admin authors structured case-study content
As the admin, I build the `system_cards` (icon + bilingual title/description, add/remove/reorder) and `results` (a shared value + bilingual label) as repeatable rows, and enter tags/technologies, without hand-writing JSON.

### US-6 — Admin uploads the three project images
As the admin, I upload a cover image (required) and optionally a logo and a media image, each via the Slice 2a endpoint, storing only the returned reference.

### US-7 — Admin previews a project
As the admin, I open a project's public pages (`/portfolio/{slug}` and `/ar/portfolio/{slug}`) from the admin UI to check both languages render.

## Functional requirements

### FR-1 — Admin list
- FR-1.1: A new route `app/(en)/admin/(protected)/projects/page.tsx` MUST exist, gated by the existing `(protected)` layout, reading directly via the DAL (P-05).
- FR-1.2: One row per project (canonical row), showing cover thumbnail, English `title` (from the EN translation), `category`, `is_featured`/`is_service_showcase` state, and edit/delete/preview actions.
- FR-1.3: Rows ordered by `projects.updated_at` descending.
- FR-1.4: Add a Projects entry to `ADMIN_NAV_LINKS`.

### FR-2 — Create (transactional, both languages)
- FR-2.1: A full-page create route (`app/(en)/admin/(protected)/projects/new/page.tsx`) MUST exist — one combined form, not a modal.
- FR-2.2: The form MUST collect the canonical fields once (FR-5) and the complete EN and AR translation content (FR-6/FR-7/FR-8/FR-9).
- FR-2.3: On submit, `createProjectAction` MUST validate, enforce slug rules (FR-10), and insert the canonical `projects` row plus **both** `project_translations` rows (EN and AR) **inside a single database transaction** (FR-13). Partial writes MUST NOT be possible.
- FR-2.4: Both translations are required — the action MUST reject a submission missing either language's required fields (FR-6.1).

### FR-3 — Edit (transactional)
- FR-3.1: A full-page edit route (`app/(en)/admin/(protected)/projects/[id]/edit/page.tsx`) MUST load the canonical row and both translations (`getProjectById`) and pre-fill the combined form.
- FR-3.2: On save, `updateProjectAction` MUST update the canonical row and both translation rows inside a single transaction (FR-13), and MUST bump `updated_at` on the canonical row (and on translation rows) explicitly (see FR-13.3).
- FR-3.3: `language` on a translation row is fixed (a project's two rows are always one EN and one AR); the form edits content, never a row's language.

### FR-4 — Delete
- FR-4.1: A delete action MUST require an explicit confirmation step (`window.confirm`, leads/articles precedent) and delete the `projects` row via `deleteProject`; the two translation rows are removed automatically by the existing `ON DELETE CASCADE` FK — the action MUST NOT attempt to delete translations itself.

### FR-5 — Canonical fields (`projects`, entered once)
- FR-5.1: `slug` — required, unique, EX-03 format (FR-10).
- FR-5.2: `category` — required. A free-text input backed by a datalist of already-used categories (a new `listProjectCategories()` DAL read), to nudge consistency without hardcoding a taxonomy.
- FR-5.3: `is_featured`, `is_service_showcase` — plain checkboxes, default false, **no exclusivity enforcement** (deferred).
- FR-5.4: `cover_image` — required (FR-11).
- FR-5.5: `logo`, `media_image` — optional (FR-11).

### FR-6 — Per-language translation fields (`project_translations`, for BOTH EN and AR)
- FR-6.1: `title` and `description` are `NOT NULL` — both are **required in both languages**. All other translation fields below are nullable/optional.
- FR-6.2: Optional text fields: `category_label`; the four client-identity fields (`client_name`, `client_sector`, `client_country`, `client_model`); `problem_headline`, `problem_body`; `diagnosis_headline`, `diagnosis_body`; `system_headline`; `media_caption`; `cta_headline`, `cta_subtext`.
- FR-6.3: All narrative fields render as plain paragraph text (no Markdown) — plain `<textarea>`/`<input>` controls, matching the public render.
- FR-6.4: CTA override fields MUST display the hardcoded bilingual default text (as placeholder or helper text) so the operator knows what leaving them blank produces.

### FR-7 — `system_cards` editor (shared structure, per-language text)
- FR-7.1: A repeatable-row builder: add / remove / reorder rows. Each row has an `icon` (a `<select>` constrained to the fixed 12-value `SYSTEM_CARD_ICONS` list) and a `title` + `description` **for each language**.
- FR-7.2: The `icon` and the row set/order are **shared across languages** (authored once). On save, each language's stored `system_cards` array is assembled as `{ icon: <shared>, title: <that language's>, description: <that language's> }[]`, in the shared order.
- FR-7.3: The editor MUST enforce a sane count: at least 1 and at most 6 rows (the public grid is designed for ~2–6).
- FR-7.4: Each row's `title`/`description` SHOULD be provided in both languages (an empty side renders a blank card on that language's page). Exact strictness (hard-require both, or warn) is a `/plan` detail; default to requiring both.

### FR-8 — `results` editor (shared value, per-language label)
- FR-8.1: A repeatable-row builder: add / remove / reorder rows. Each row has a `value` (shared across languages — one input) and a `label` **for each language**.
- FR-8.2: On save, each language's stored `results` array is assembled as `{ value: <shared>, label: <that language's> }[]`, in the shared order — guaranteeing `value` is identical across EN and AR (the Decision 013 convention, made structural).

### FR-9 — `tags` / `technologies`
- FR-9.1: `tags` and `technologies` are per-language `string[]`, edited via a simple chip/token input (add/remove) in each language's section. Stored as `string[]` jsonb.

### FR-10 — Slug handling (EX-03)
- FR-10.1: Slug format: lowercase Latin letters, digits, and single hyphens (`^[a-z0-9]+(?:-[a-z0-9]+)*$`) — one slug per project, shared across both languages (EX-03).
- FR-10.2: The form MAY offer a one-click "generate slug from the English title" helper; slug is otherwise manually entered and always editable (Decision 013 notes slug is manual).
- FR-10.3: `projects.slug` is globally UNIQUE. The action MUST pre-check for a clashing slug and, on clash, surface a friendly inline message; as a race backstop it MUST catch a `23505` unique-violation from `projects_slug_unique` and map it to the same friendly slug message (FR-12).
- FR-10.4: On edit, the slug uniqueness pre-check MUST exclude the project's own id.

### FR-11 — Images (three fields via Slice 2a)
- FR-11.1: Three independent upload controls — `cover_image` (required), `logo` (optional), `media_image` (optional) — each uploading on selection to `POST /api/image` and storing the returned `/api/image/{id}` path string; never a data URI, never the bare id.
- FR-11.2: The form MUST label the three controls clearly enough that the operator does not confuse the list-thumbnail cover with the hero logo/media images.

### FR-12 — Error surfacing
- FR-12.1: Create/update Server Actions surface validation and slug-clash errors via `useActionState` with the established `{ status, fieldErrors, formError }` shape (articles precedent). Actions MUST NOT silently no-op on invalid input.
- FR-12.2: A `mapUniqueViolation`-style helper MUST branch on the violated constraint name — `projects_slug_unique` → a slug `fieldError`; anything else → re-throw.
- FR-12.3: Every mutating Server Action MUST call `requireAuth()` as its own first line (independent of the layout gate).

### FR-13 — Atomicity (P-15)
- FR-13.1: `createProject` MUST insert the canonical row and both translation rows in a single transaction; a failure at any point MUST roll back the whole project (no orphan canonical row, no single-language project).
- FR-13.2: `updateProject` MUST update the canonical row and both translation rows in a single transaction.
- FR-13.3: Updates MUST bump `updated_at` explicitly in the DAL (canonical row at minimum; translation rows as appropriate) — the columns have `defaultNow()` for inserts only. Prefer an explicit set over a schema-level `.$onUpdate` to keep `schema.ts` at zero drift from the Decision 013 shape.

### FR-14 — Cache revalidation
- FR-14.1: After any create/update/delete, revalidate `/admin/projects` plus the affected public paths in both languages: the portfolio list (`/portfolio`, `/ar/portfolio`) and the project detail (`/portfolio/{slug}`, `/ar/portfolio/{slug}`).
- FR-14.2: On a slug change during edit, the OLD slug's detail paths MUST also be revalidated so the old URL does not serve stale ISR content.

### FR-15 — DAL and conventions
- FR-15.1: New/extended functions live in `lib/db/portfolio.ts`: `createProject`, `updateProject`, `deleteProject`, `getProjectById` (canonical + both translations), an admin list (`listProjectsForAdmin`), and `listProjectCategories()`. Verb-first named exports, `type` aliases, `.returning()`/null-on-miss conventions.
- FR-15.2: Existing exports (`getPublishedProjects`/portfolio reads, `getRelatedProjectCard`, `listProjectsForSelect`) MUST remain unchanged and unbroken — this slice must not regress the Phase 1 public portfolio render or the articles slice's related-project dropdown.
- FR-15.3: No existing table/column/enum/index/constraint is modified. No migration is generated.

### FR-16 — Preview
- FR-16.1: Each project row (and the edit page) MUST offer a preview affordance opening `/portfolio/{slug}` (EN) and `/ar/portfolio/{slug}` (AR) in a new tab, reusing the existing public render (projects have no draft state — they render live once created). No new preview renderer.

### FR-17 — Quality gate
- FR-17.1: `npm run check`, `npm run lint`, `npm run build` MUST all pass with zero errors before the slice is accepted.

## Out of scope

- **Legacy id→slug redirects** (`/portfolio/7`, `/portfolio/8` → their slugs). These are hardcoded TODO stubs in `next.config.ts`, disconnected from admin-editable slug data; wiring real 301s is a Phase 4 cutover step when projects 7 & 8 migrate. This slice does not touch `next.config.ts`. (EX-03's redirect obligation is tracked for Phase 4, not dropped.)
- **`is_service_showcase` exclusivity enforcement** (old `ensureUniqueShowcase`). Deferred to the future services-page-hero slice; the flag is a plain checkbox here.
- **Any homepage "Recent Work" or services-page hero consumer** of `is_featured`/`is_service_showcase` — those public consumers don't exist yet and are not built here.
- **A draft/publish concept for projects** — projects have none; they render live once created.
- **Projects data migration** (IDs 7 & 8) — Phase 4.
- **A fixed category taxonomy / pillar deep-links** — deliberately cut earlier; category stays free text.
- Any change to the frozen `projects`/`project_translations` schema.

## Assumptions (settled by the extraction — do not reopen)

- Schema matches Decision 013 verbatim; the four jsonb shapes are: `system_cards {icon,title,description}[]` (icon ∈ the fixed 12-value list, unknown → Compass at render), `results {value,label}[]` (`value` language-neutral by convention), `tags`/`technologies` `string[]` (per-language). None DB-enforced — shape-correctness is this slice's responsibility.
- Public read-path consumer contract (extraction §2): slug-based routing (`/portfolio/{slug}`, `/ar/portfolio/{slug}`); no draft/publish; `getRelatedProjectCard`/`listProjectsForSelect` are existing cross-slice consumers not to break.
- Slice 2a upload contract (extraction §4): store the `/api/image/{id}` path string; three fields, one required (`cover_image`), two optional (`logo`, `media_image`).
- FK cascade (extraction §1.2): `project_translations.project_id → projects.id ON DELETE CASCADE` is real and applied — deleting a project removes its translations at the DB level.
- Admin conventions to reuse (extraction §3): per-mutation `requireAuth()`, `{status, fieldErrors, formError}` `useActionState`, flat DAL, `revalidatePath` after writes, `window.confirm` delete, full-page routes.
- Admin is English-only.

## Acceptance criteria

1. **AC-1:** The admin Projects list shows one row per project (cover, EN title, category, featured/showcase state, actions), ordered by most recently updated.
2. **AC-2:** Creating a project with valid canonical fields and complete EN+AR content produces one `projects` row and exactly two `project_translations` rows (one EN, one AR); all three appear together or not at all (transactional).
3. **AC-3:** A create that fails partway (e.g. a forced DB error on the second translation insert) leaves NO rows behind — no orphan canonical row, no single-language project.
4. **AC-4:** A submission missing a required field (slug, category, cover image, or either language's title/description) is rejected inline, with no rows written.
5. **AC-5:** Editing a project updates the canonical row and both translations atomically; `updated_at` advances and the list re-orders.
6. **AC-6:** Deleting a project (after confirmation) removes the `projects` row and both translations (via cascade); the list no longer shows it.
7. **AC-7:** A duplicate slug is rejected with a friendly inline message (not a 500); on edit, re-saving a project without changing its slug does not false-trigger the clash. Slug format violations (uppercase, spaces, non-Latin) are rejected inline.
8. **AC-8:** `system_cards` authored in the editor store, for each language, `{icon,title,description}` with the SAME icon and row order across EN and AR and each language's own text; the editor enforces 1–6 rows and constrains `icon` to the 12-value list.
9. **AC-9:** `results` authored in the editor store, for each language, `{value,label}` with an IDENTICAL `value` across EN and AR and each language's own `label`.
10. **AC-10:** `tags`/`technologies` save as `string[]` per language.
11. **AC-11:** Cover image is required and uploads to `/api/image` storing a `/api/image/{id}` path; logo and media image are optional and behave the same when provided; all three render on the public pages.
12. **AC-12:** After a create/edit/delete, the affected EN and AR public portfolio list and detail pages reflect the change; a slug change revalidates the old detail path too.
13. **AC-13:** Every mutating Server Action independently enforces `requireAuth()`.
14. **AC-14:** The existing public portfolio render, `getRelatedProjectCard`, and the articles related-project dropdown (`listProjectsForSelect`) all still work unchanged.
15. **AC-15:** `npm run check`, `npm run lint`, `npm run build` all exit zero. No migration is produced; no existing schema object is modified (verified by a zero-diff check on `schema.ts` and `drizzle/`).

## Notes for `/plan` (mechanism details deliberately deferred)

- The exact transaction API shape (`db.transaction(async (tx) => …)`) for create/update, and how `updateProject` handles the translation rows (straight UPDATE of both, which always exist post-create, vs. a defensive upsert).
- The shared-structure ↔ per-language assembly for `system_cards`/`results` (client-side form state model → the two stored arrays), and the exact `/plan` strictness for FR-7.4 (require both languages' text per row, or warn).
- The combined form's client-side state architecture (a large form with canonical + two language sections + two repeatable-row builders + three upload controls + two chip inputs) and how it splits into Client Components.
- The EX-03 slug validation module (reusing the articles EN-slug pattern) and the "generate from English title" helper.
- The `mapUniqueViolation` return-shape (reused from articles, branching on `projects_slug_unique`).
- The `listProjectsForAdmin` and `listProjectCategories` query shapes.
- Whether `updated_at` is bumped on translation rows as well as the canonical row (FR-13.3), choosing the zero-`schema.ts`-drift option.
