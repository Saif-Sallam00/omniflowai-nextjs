# Implementation Plan: Admin Projects CRUD — Phase 2, Slice 3

**Branch**: `007-admin-projects-crud` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-admin-projects-crud/spec.md`, built directly from the pre-approved `docs/projects-crud-slice-spec.md`, grounded in `docs/projects-crud-extract.md`.

## Summary

Add admin create/edit/delete for portfolio projects — the heaviest Phase 2 admin slice, and the first in this codebase to require a real database transaction. A project is one canonical `projects` row (slug, category, two visibility flags, three image references) plus exactly two `project_translations` child rows (English and Arabic), authored together through a single combined full-page form (`/admin/projects/new`, `/admin/projects/[id]/edit`) and a grouped list (`/admin/projects`, one row per project, ordered by most-recently-updated). Create and edit each write the canonical row and both translation rows inside one `db.transaction(...)` call — a failure at any point rolls back everything, so a project can never exist half-written or half-translated. `system_cards` and `results` are authored once, as a single shared list per project (icon+order shared for system cards, value shared for results), and fanned out into each language's own stored array by the DAL — never by the admin's manual discipline. Three independent image uploads (cover required, logo and media optional) reuse Slice 2a's `POST /api/image` exactly as Slice 2b's cover-image control already does, three times over. Delete is a single `DELETE` on `projects`; the already-applied `ON DELETE CASCADE` foreign key removes both translation rows without any application code needing to touch `project_translations` directly. **No schema change, no migration** — the tables are frozen and already match Decision 013 verbatim. All seven mechanism items the approved mini-spec deliberately left open (transaction API usage, the editor's Client Component split, the shared-structure↔per-language jsonb assembly, slug validation/generation reuse, the unique-violation mapping shape, the admin-list/category-suggestion query shapes, and the translation-row `updated_at` bump) are resolved in `research.md`, each grounded in either an already-shipped precedent in this exact codebase (Slice 2b's articles CRUD, almost entirely) or a directly-verified fact about the pinned Drizzle/Postgres driver.

## Technical Context

**Language/Version**: TypeScript (strict mode) on Next.js 16.3.1 App Router — unchanged from every prior slice.

**Primary Dependencies**: No new dependency. Reused as-is: `drizzle-orm` (extending `lib/db/portfolio.ts`, and — for the first time in this codebase — using its native `.transaction()` API, confirmed available on the `neon-serverless` `Pool`-backed `db` instance), `better-auth` (`requireAuth()`), `zod` (the article form's validation pattern, reused for a project form schema), React 19's `useActionState`/`useFormStatus`, and Slice 2a's `POST /api/image` Route Handler (consumed three times, directly from three Client Components).

**Storage**: Neon Postgres via the existing pooled Drizzle connection (`lib/db/index.ts`, unchanged). **Zero schema change** — `projects`/`project_translations` (`lib/db/schema.ts:21-39,93-130`) are used exactly as Decision 013 defined them; no migration is generated.

**Testing**: No automated test framework introduced, consistent with every prior slice. Verification is the quality gate (`tsc --noEmit`, ESLint, `next build`, all zero-error) plus a manual walkthrough of `quickstart.md`, mapped 1:1 to spec.md's seven user stories and eleven success criteria.

**Target Platform**: Replit Autoscale — unchanged.

**Project Type**: web-service — unchanged; same single Next.js App Router project.

**Performance Goals**: Not independently load-bearing. `listProjectsForAdmin` is a single flat join, no fan-out/grouping needed (unlike Slice 2b's grouped article list) since `projects` already is the one-row-per-project canonical entity.

**Constraints**:
- **No schema change, no migration** (FR-15.3) — every new capability is DAL + Server Actions + admin UI on top of the existing, frozen tables.
- **Create and edit are transactional, all-or-nothing** (FR-13, research.md Item 1) — this is the correctness centerpiece of the slice: `db.transaction(async (tx) => ...)` wraps the canonical-row write and both translation-row writes; a thrown error at any point rolls back everything, guaranteeing a project is never observably half-written (no orphan canonical row, no single-language project).
- **Delete never touches `project_translations` directly** (FR-4.1) — a single `DELETE` on `projects`; the already-applied `ON DELETE CASCADE` FK does the rest at the database level.
- **`system_cards`/`results` are authored once, fanned out by the DAL** (FR-7/FR-8, research.md Item 3) — the editor's client state holds one shared list (icon/order or value, shared) with per-language text; `createProject`/`updateProject` are what actually produce the two separate stored arrays, in identical order/with identical shared values, by construction rather than by admin care.
- **`results.value` is a display string, never coerced to a number** (spec FR-8, pinned) — e.g. `"40%"`, `"3x"` — stored and validated as a plain non-empty string.
- **Per-row bilingual strictness defaults to requiring both languages** (FR-7.4) — a system-capability item missing either language's title/description is rejected, matching this codebase's established both-languages-required principle (Slice 2b's spec Assumptions).
- **`system_cards` count enforced 1–6; `icon` constrained to `SYSTEM_CARD_ICONS`** (FR-7.3, `lib/db/schema.ts:41-54`) — validated in the Zod schema before any DAL call.
- **Three independent image fields, one required** (FR-11) — `cover_image` required, `logo`/`media_image` optional; all three store `/api/image/{id}` path strings via the same upload-on-select pattern Slice 2b's `cover-image-field.tsx` already proved, instantiated three times.
- **Slug is EX-03's single Latin slug, reusing Slice 2b's existing EN slug module** (FR-10, research.md Item 4) — `lib/article-slug.ts`'s `SLUG_PATTERN_EN`/`slugifyForLanguage(title, "en")` are imported directly, not duplicated; uniqueness is global (`projects.slug`, not per-language), pre-checked in the action with a `mapUniqueViolation` backstop on `projects_slug_unique` (research.md Item 5) that excludes the project's own id on edit.
- **`category` stays free text with a suggestion list, not a fixed taxonomy** (FR-5.2) — `listProjectCategories()` is a plain `SELECT DISTINCT`, feeding an HTML datalist that suggests without restricting.
- **`is_featured`/`is_service_showcase` are plain, unconstrained checkboxes this slice** (FR-5.3) — the old app's `ensureUniqueShowcase` cross-project exclusivity invariant is explicitly deferred (no live public consumer of either flag exists yet), not silently dropped forever.
- **`useActionState` error surfacing, `{ status, fieldErrors, formError }`, reused verbatim from Slice 2b** (FR-12.1) — actions never silently no-op on invalid input.
- **Every mutating Server Action calls `requireAuth()` itself** (FR-12.2) — independent of the `(protected)` layout's own gate.
- **Revalidation spans admin and public surfaces in both languages, including the OLD slug on a rename** (FR-14) — `/admin/projects` plus `/portfolio`, `/ar/portfolio`, `/portfolio/{slug}`, `/ar/portfolio/{slug}` (and the previous slug's detail paths too, on a slug change).
- **`updated_at` bumped explicitly in the DAL on the canonical row and both translation rows** (FR-13.3, research.md Item 7) — never a schema-level `.$onUpdate`, keeping `schema.ts` at zero drift.
- **Existing `lib/db/portfolio.ts` reads (`getPortfolioListItems`, `getPortfolioSlugs`, `getRelatedProjectCard`, `getPortfolioDetailBySlug`, `listProjectsForSelect`) MUST remain unchanged and unbroken** (FR-15.2) — this slice only adds exports, never modifies an existing one's signature or query.
- **No preview renderer is built** (FR-16) — preview actions simply link to the already-live public pages, since projects have no draft state.
- **Naming/style conventions carried forward**: kebab-case files, default-export page/layout modules, verb-first named exports, `type` aliases (not `interface`), the project's internal path alias only, TypeScript strict throughout.

**Scale/Scope**: One extended DAL module (`lib/db/portfolio.ts`, 6 new functions: `createProject`, `updateProject`, `deleteProject`, `getProjectById`, `listProjectsForAdmin`, `listProjectCategories`, plus internal fan-out helpers), three new pages (`/admin/projects`, `/admin/projects/new`, `/admin/projects/[id]/edit`), one shared `ProjectForm` component plus six small Client Components (three image-upload fields, a system-cards editor, a results editor, a reusable chip input), two Server Actions plus a delete action, one non-`"use server"` form-schema module, one nav-link addition. No new dependency, no new table, no new Route Handler. This is the first slice to use Drizzle's `.transaction()` API.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Constraint | Status | Notes |
|---|---|---|
| I. Diagnosis Before Solution | PASS | All seven research decisions are grounded in already-shipped, directly-inspected precedent in this exact repo (Slice 2b's complete articles CRUD — its action shape, form-schema split, `mapUniqueViolation` pattern, upload-field component — re-read in full for this plan) or in a directly-verified fact about the pinned driver (`drizzle-orm/neon-serverless`'s `.transaction()` availability, confirmed by reading its own type declarations). |
| II. Locked Decisions Are Locked | PASS | No locked decision reopened. `projects`/`project_translations` (Decision 010, revised by Decision 013) are used exactly as built — re-confirmed zero-drift from the applied migration in the grounding extraction and again here. |
| III. Verify Before Declaring Done | PASS (deferred to implementation) | `quickstart.md` maps 1:1 to every acceptance scenario across all seven user stories and to SC-001–SC-011, including the atomicity-on-failure and cross-slice non-regression checks. |
| IV. Scope Discipline | PASS | Zero new dependencies (confirmed in research.md's Dependency Check). No fixed category taxonomy reintroduced, no showcase-exclusivity enforcement, no legacy-redirect wiring, no homepage/services-page consumer of the visibility flags — all explicitly out of scope per the mini-spec and carried into spec.md's Assumptions unchanged. |
| V. URL Preservation as Default | N/A for the new admin routes; PASS for the public slug format | The three new admin routes are net-new admin surface with no legacy equivalent. The public-facing `projects.slug` format this slice enforces (`^[a-z0-9]+(?:-[a-z0-9]+)*$`) is EX-03's already-settled shape, not a new URL decision this slice is making — and the legacy id→slug redirect this exception also calls for is explicitly out of scope here (a Phase 4 cutover concern, per the mini-spec and spec.md's Assumptions), not silently dropped. |
| VI. Security Is Not Convenience | PASS | Every mutating Server Action independently calls `requireAuth()` as its first line (FR-12.2), on top of the `(protected)` layout's own gate — the same belt-and-suspenders pattern Slice 2b already established. The three upload controls rely on Slice 2a's own already-audited session check inside `POST /api/image`; no new auth surface. |
| VII. Bilingual By Architecture | N/A (admin is English-only) | The admin UI itself remains English-only per spec Assumptions. The project *content* being authored is bilingual by the schema's own design (Decision 010/013), not a new architectural concern this slice introduces — and this slice's entire correctness centerpiece (the transaction) exists specifically to make that bilingual content trustworthy (never half-written). |
| Runtime constraints (Next.js/Node/TS/ESLint) | PASS | No version changes. Strict TS and the existing ESLint config apply unchanged. |
| Database constraints (P-08, migrations) | PASS | **No migration this slice.** `projects_slug_unique` (already in place) is the DB-native invariant the slug-clash pre-check and `mapUniqueViolation` backstop defer to as the authoritative enforcement (P-08), exactly mirroring Slice 2b's own already-accepted reasoning for the analogous articles-slug case. |
| Atomic mutations (P-15) | **PASS — this is the slice where P-15's transaction clause is actually exercised for the first time.** | Unlike every prior slice (each of whose DAL writes was a single, inherently-atomic statement), `createProject`/`updateProject` are genuinely multi-statement mutations (one canonical-row write plus two translation-row writes) — exactly the case P-15's "transactions wrap any check-then-write pattern" / multi-statement-atomicity clause anticipates. Both are wrapped in `db.transaction(async (tx) => ...)` (research.md Item 1), with every statement inside using `tx`. The slug-clash *pre-check* (a read before the write) remains unwrapped/advisory, same reasoning as Slice 2b: the DB's own unique constraint is the real correctness boundary for that specific concern, not the pre-check's read — but the *canonical-row + translation-rows* write itself is the actual multi-statement mutation P-15 governs, and it is correctly wrapped. |
| One DB, direct access, no JSON API for own frontend (P-05) | PASS by construction | The new admin list and edit pages read via `lib/db/portfolio.ts` directly from their Server Components — no intermediate API route. The three upload controls call Slice 2a's `POST /api/image`, already covered by P-05's explicit "image serving" carve-out. |
| Required secrets fail-fast (P-13) | N/A | No new environment variable is introduced by this slice. |

**Result**: No violations requiring the Complexity Tracking table. The one item given a deliberately detailed note above (P-15/the transaction) is this slice's central correctness mechanism, not a gap — called out explicitly because it is the first time this exact constitutional clause has a real multi-statement mutation to apply to.

**Post-design re-check**: `data-model.md` and `contracts/server-actions.md` introduce no entity, dependency, or route beyond what FR-1–FR-17 and the seven research decisions already specify — they formalize the mini-spec's own requirements plus the exact DAL function signatures (including the transaction boundaries), the shared form-state type, and the two Server Actions' behavior. Constitution Check result stands unchanged: PASS.

## Project Structure

### Documentation (this feature)

```text
specs/007-admin-projects-crud/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── contracts/            # Phase 1 output (/speckit-plan command)
│   └── server-actions.md
├── checklists/
│   └── requirements.md
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/(en)/admin/(protected)/
├── admin-nav.tsx                       # MODIFIED — adds { path: "/admin/projects", label: "Projects" }
│                                        # to ADMIN_NAV_LINKS. No other change.
├── layout.tsx / leads/**, articles/**  # UNCHANGED
└── projects/
    ├── page.tsx                        # NEW — admin list. Server Component, reads
    │                                   # listProjectsForAdmin() directly (no API layer).
    ├── actions.ts                      # NEW — createProjectAction, updateProjectAction,
    │                                   # deleteProjectAction. Each mutation calls
    │                                   # requireAuth() itself.
    ├── project-form-schema.ts          # NEW — non-"use server": ProjectFormState type,
    │                                   # Zod schema, parseProjectFormData,
    │                                   # mapUniqueViolation (branches on
    │                                   # projects_slug_unique).
    ├── project-form.tsx                # NEW — shared Client Component form (create + edit),
    │                                   # useActionState-driven, assembles canonical fields
    │                                   # inline + delegates to the components below.
    ├── cover-image-field.tsx           # NEW — Client Component: required upload-on-select,
    │                                   # same pattern as articles' cover-image-field.tsx.
    ├── logo-image-field.tsx            # NEW — Client Component: optional upload-on-select.
    ├── media-image-field.tsx           # NEW — Client Component: optional upload-on-select.
    ├── system-cards-editor.tsx         # NEW — Client Component: repeatable-row builder,
    │                                   # shared icon/order + per-language title/description,
    │                                   # 1–6 rows, icon <select> from SYSTEM_CARD_ICONS.
    ├── results-editor.tsx              # NEW — Client Component: repeatable-row builder,
    │                                   # shared value + per-language label.
    ├── chip-input.tsx                  # NEW — Client Component: reusable add/remove token
    │                                   # list, instantiated 4× (EN/AR tags, EN/AR technologies).
    ├── delete-project-form.tsx         # NEW — Client Component: window.confirm() + pending
    │                                   # state, mirrors delete-article-form.tsx.
    ├── new/
    │   └── page.tsx                    # NEW — create route. listProjectCategories(),
    │                                   # renders <ProjectForm> in create mode.
    └── [id]/
        └── edit/
            └── page.tsx                # NEW — edit route. getProjectById(id) → notFound()
                                         # on miss; listProjectCategories(); renders
                                         # <ProjectForm> pre-filled, in edit mode.

lib/
├── db/
│   ├── schema.ts                       # UNCHANGED — no schema change this slice.
│   ├── portfolio.ts                    # MODIFIED — adds ProjectRow, ProjectTranslationRow,
│   │                                   # SystemCardSlotInput, ResultSlotInput,
│   │                                   # ProjectTranslationContentInput, CreateProjectInput,
│   │                                   # UpdateProjectInput, ProjectWithTranslations,
│   │                                   # createProject, updateProject (both transactional),
│   │                                   # deleteProject, getProjectById, ProjectAdminListItem,
│   │                                   # listProjectsForAdmin, listProjectCategories,
│   │                                   # fanOutSystemCards/fanOutResults (internal).
│   │                                   # Existing exports (getPortfolioListItems,
│   │                                   # getPortfolioSlugs, getRelatedProjectCard,
│   │                                   # getPortfolioDetailBySlug, listProjectsForSelect)
│   │                                   # UNCHANGED.
│   ├── articles.ts / leads.ts / index.ts  # UNCHANGED
├── article-slug.ts                     # UNCHANGED — SLUG_PATTERN_EN/slugifyForLanguage
│                                       # reused directly by projects, not modified.
└── auth-server.ts                      # UNCHANGED — requireAuth() reused as-is.

app/(en)/(public)/portfolio/**, app/ar/(public)/portfolio/**   # UNCHANGED — this slice
                                        # writes to the same tables these already read
                                        # from; no rendering-path code is modified.

drizzle/                                # UNCHANGED — no migration this slice.
package.json                            # UNCHANGED — no new dependency this slice.
```

**Structure Decision**: Everything new slots into `app/(en)/admin/(protected)/projects/` (mirroring `articles/`'s established shape: a `page.tsx` list, an `actions.ts`, a non-`"use server"` form-schema module, small Client Components alongside) plus two nested routes (`new/`, `[id]/edit/`) for the full-page create/edit forms — no modal, per FR-2.1/FR-3.1. `project-form.tsx` is shared between create and edit exactly as `article-form.tsx` is, differing only in whether the canonical/translation fields are pre-filled. The six small Client Components (three image fields, two repeatable-row editors, one chip input) are split out because each manages genuinely self-contained state that no sibling field needs — `chip-input.tsx` is deliberately one parameterized component reused four times (EN/AR tags, EN/AR technologies) rather than four near-duplicate files, since their behavior is identical and only their bound array/field name differs (research.md Item 2). `lib/article-slug.ts` is imported by the projects slug logic directly, not copied or wrapped in a new `lib/project-slug.ts` — the character-class rule is byte-for-byte identical to articles' EN slug rule, so a second module would be pure duplication (research.md Item 4).

## Complexity Tracking

*No entries — Constitution Check reported no violations requiring justification. The one item given an extended note above (this slice's first real use of `db.transaction()`) is the deliberate, correct application of an already-existing constitutional requirement (P-15) to the first mutation in this codebase that actually needs it — not a complexity violation to justify away.*
