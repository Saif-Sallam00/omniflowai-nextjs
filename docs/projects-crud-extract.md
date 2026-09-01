# Projects CRUD — Extraction (Phase 2, Slice 3 prep)

Read-only extraction. No app code written, no Spec Kit run, nothing committed. This grounds the spec for Slice 3 (Projects CRUD); it does not decide anything.

---

## 1. `projects` + `project_translations` schema as-built (source of truth)

### 1.1 `projects` table — `lib/db/schema.ts:21-39`, verbatim

```ts
export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    category: text("category").notNull(),
    isFeatured: boolean("is_featured").notNull().default(false),
    isServiceShowcase: boolean("is_service_showcase").notNull().default(false),
    coverImage: text("cover_image").notNull(),
    logo: text("logo"),
    mediaImage: text("media_image"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("projects_category_idx").on(table.category),
    index("projects_service_showcase_category_idx").on(table.isServiceShowcase, table.category),
  ],
);
```

| Column | Type / nullability | Origin |
|---|---|---|
| `id` | `serial pk` | Phase 0 FR-3.1 |
| `category` | `text not null` | Phase 0 FR-3.1 |
| `is_featured` | `boolean not null default false` | Phase 0 FR-3.1 |
| `is_service_showcase` | `boolean not null default false` | Phase 0 FR-3.1 |
| `cover_image` | `text not null` | Phase 0 FR-3.1 |
| `created_at` / `updated_at` | `timestamptz not null default now()` | Phase 0 FR-3.1 |
| `slug` | `text not null unique` | **Decision 013** (`docs/decision-013-case-study-schema.md:22`) |
| `logo` | `text`, nullable | **Decision 013** (`:23`) |
| `media_image` | `text`, nullable | **Decision 013** (`:24`) |

Cross-checked against Phase 0's FR-3.1 (`specs/001-foundation-slice/spec.md:70`: `id serial pk`, `category text not null`, `is_featured boolean not null default false`, `is_service_showcase boolean not null default false`, `cover_image text not null`, `created_at`, `updated_at`) — the six original columns are untouched; `slug`, `logo`, `media_image` are the only additions, exactly matching Decision 013's own diff. Confirmed against the actual applied migration, `drizzle/0001_case_study_schema.sql:15-17,21`: `ALTER TABLE "projects" ADD COLUMN "slug" text NOT NULL`, `ADD COLUMN "logo" text`, `ADD COLUMN "media_image" text`, `ADD CONSTRAINT "projects_slug_unique" UNIQUE("slug")` — zero drift between decision, migration, and `schema.ts`.

**Unique constraints**: `slug` (table-level `.unique()`, materialized as `projects_slug_unique`). No other unique constraint on this table.
**Indexes**: `(category)`; `(is_service_showcase, category)` — both pre-date Decision 013 (Phase 0), present for `is_featured`/`is_service_showcase`-driven queries that, per §2 below, no current Phase 1 code actually issues yet.
**Foreign keys**: none on `projects` itself (it is the referenced side of `articles.related_project_id` and `project_translations.project_id`).

### 1.2 `project_translations` table — `lib/db/schema.ts:93-130`, verbatim

```ts
export const projectTranslations = pgTable(
  "project_translations",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    language: languageEnum("language").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    categoryLabel: text("category_label"),
    clientName: text("client_name"),
    clientSector: text("client_sector"),
    clientCountry: text("client_country"),
    clientModel: text("client_model"),
    problemHeadline: text("problem_headline"),
    problemBody: text("problem_body"),
    diagnosisHeadline: text("diagnosis_headline"),
    diagnosisBody: text("diagnosis_body"),
    systemHeadline: text("system_headline"),
    systemCards: jsonb("system_cards").notNull().default([]),
    results: jsonb("results").notNull().default([]),
    mediaCaption: text("media_caption"),
    ctaHeadline: text("cta_headline"),
    ctaSubtext: text("cta_subtext"),
    tags: jsonb("tags").notNull().default([]),
    technologies: jsonb("technologies").notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("project_translations_project_id_language_unique").on(table.projectId, table.language),
    index("project_translations_project_id_idx").on(table.projectId),
  ],
);
```

| Column | Type / nullability | Origin |
|---|---|---|
| `id`, `project_id` (FK → `projects.id`, `on delete cascade`), `language` | not null | Phase 0 FR-3.1 |
| `title`, `description` | `text not null` | Phase 0 FR-3.1 (retained) |
| `results` | `jsonb not null default '[]'` | Phase 0 FR-3.1 column, **Decision 013 reshaped its element type** (see §1.3) |
| `tags`, `technologies` | `jsonb not null default '[]'` | Phase 0 FR-3.1 (retained, shape unchanged: `string[]`) |
| `category_label`, `client_name`, `client_sector`, `client_country`, `client_model`, `problem_headline`, `problem_body`, `diagnosis_headline`, `diagnosis_body`, `system_headline`, `system_cards`, `media_caption`, `cta_headline`, `cta_subtext` — all nullable `text` except `system_cards` (`jsonb not null default '[]'`) | **Decision 013 new** (`decision-013-case-study-schema.md:34-50`) |
| `client` (was `text not null`), `challenge` (`text not null`), `diagnosis` (`text`, nullable), `solution` (`text not null`) | **REMOVED by Decision 013** | Phase 0 FR-3.1 had these; Decision 013 (`:30,32`) explicitly replaces `client` with the four `client_*` fields and drops `challenge`/`diagnosis`/`solution` in favor of the headline+body pairs. |

Cross-checked against Phase 0 FR-3.1 (`specs/001-foundation-slice/spec.md:71`: `id`, `project_id`, `language`, `title`, `client`, `description`, `challenge`, `diagnosis`, `solution`, `results`, `tags`, `technologies`, `created_at`, `updated_at`) and against the applied migration `drizzle/0001_case_study_schema.sql:1-14,18-20` (14 `ADD COLUMN` statements matching the table above verbatim, then `DROP COLUMN "client"`, `"challenge"`, `"diagnosis"`, `"solution"`) — the migration, `schema.ts`, and Decision 013's own table are in perfect agreement. `results`/`tags`/`technologies` columns themselves are untouched by the migration (no `ALTER COLUMN`) — only `results`' *element shape* changed at the application-code level (Decision 013's documentation, not a DB-level type change, since `jsonb` has no internal schema).

**Unique constraint**: `(project_id, language)` — at most one `en` and one `ar` translation row per project. **Index**: `(project_id)`.
**Foreign key**: `project_id → projects.id ON DELETE CASCADE` — confirmed both in `schema.ts:99` and the original migration `drizzle/0000_initial.sql:126` (`ON DELETE cascade ON UPDATE no action`); Decision 013 did not touch this FK. **Implication for Slice 3** (flagged again in §7): deleting a `projects` row deletes both its translation rows automatically at the database level — no application code needs to (or should try to) delete translations before deleting the project.

### 1.3 jsonb field shapes — the highest-risk part of this schema

Confirmed by direct reading of `lib/db/portfolio.ts`'s TypeScript types and casts (the only place these payloads are read and shaped) and their exact rendering in `app/(en)/(public)/portfolio/[slug]/page.tsx`:

| Field | Column | Element/payload shape (confirmed) | Evidence |
|---|---|---|---|
| `systemCards` | `project_translations.system_cards` | `{ icon: string; title: string; description: string }[]` — `icon` MUST be one of the fixed `SYSTEM_CARD_ICONS` pick-list (`lib/db/schema.ts:41-54`: `target`, `search`, `flask-conical`, `messages-square`, `bar-chart-3`, `workflow`, `shield`, `zap`, `layers`, `users`, `compass`, `bot`); an unrecognized icon string does not error — it silently falls back to the `Compass` icon at render time (`components/system-card-icon.tsx:33-39`, `SYSTEM_CARD_ICON_MAP[icon] ?? Compass`). Rendered in a `repeat(auto-fit,minmax(180px,1fr))` grid, no min/max count enforced in code (design intent is 2–6 per Decision 013's own note, `:46`, but nothing rejects 0 or 20). | `lib/db/portfolio.ts:16,37,152`; `[slug]/page.tsx:153-165` |
| `results` | `project_translations.results` | `{ value: string; label: string }[]` — **both fields are plain strings**, `value` is stored identically on the `en` and `ar` rows of the same project (Decision 013's explicit note, `:47`: "value is language-neutral"; this is a data-entry convention, not a DB-enforced invariant — nothing prevents an admin from typing different `value` strings per language). Rendered as `metric.value` (large orange numeral) + `metric.label` (muted caption) per row. | `lib/db/portfolio.ts:17,38,153`; `[slug]/page.tsx:205-211` |
| `tags` | `project_translations.tags` | `string[]` — plain strings, rendered as small badges on the portfolio list card; **per-language** (each language's translation row has its own `tags` array; nothing ties an EN tag string to an AR tag string). Used only for list-page display — no filtering/search reads it. | `lib/db/portfolio.ts:13,54,67`; `components/portfolio-grid.tsx:109-120` |
| `technologies` | `project_translations.technologies` | `string[]` — plain strings, rendered as pill badges on the detail page's "Tech stack" section; per-language (same caveat as `tags`, though in practice technology names like "PostgreSQL" or "Next.js" would typically be identical across languages — nothing enforces this). | `lib/db/portfolio.ts:42,134,154`; `[slug]/page.tsx:219-237` |

No other `jsonb` columns exist on either table. All four are read via a bare `as T | null` TypeScript cast in `portfolio.ts` (Drizzle's `jsonb` column type is untyped at the schema level — `system_cards: jsonb("system_cards").notNull().default([])` carries no `.​$type<...>()` annotation, confirmed by re-reading `schema.ts:113-114,118-119` — the shape is enforced by TypeScript casts and application code alone, never by a DB-level JSON schema or CHECK constraint). This means: **nothing in the database itself prevents a malformed jsonb payload from being written** (e.g. a `results` array with a numeric `value`, or a `systemCards` entry missing `description`) — any write path this slice adds is the only place shape-correctness can be enforced, via Zod validation before insert/update. This is the single highest-risk area of this schema for a CRUD slice to get wrong.

---

## 2. Existing projects DAL + public read path (consumer contract)

### 2.1 DAL — `lib/db/portfolio.ts` (175 lines, full file read)

Five exported functions, all read-only, all wrapped in React's `cache()`:

| Function | Signature | Reads | Notes |
|---|---|---|---|
| `getPortfolioListItems` | `(language) => Promise<PortfolioListItem[]>` | `projects.slug/category/coverImage` + `projectTranslations.title/categoryLabel/tags` | `PortfolioListItem = { slug, category, coverImage, title, categoryLabel, tags: string[] }` (`:7-14`). Inner-joins on `(projectId, language)`. `tags` defaults `?? []` if the column is somehow `null`. |
| `getPortfolioSlugs` | `() => Promise<string[]>` | `projects.slug` only | No language filter — every project's slug regardless of language, used for `generateStaticParams` (both language trees enumerate the same slug list). |
| `getRelatedProjectCard` | `(projectId, language) => Promise<RelatedProjectCard \| null>` | `projects.slug/category` + `projectTranslations.title/categoryLabel` | Consumed by the **articles** detail page's "Related project" card (`app/(en)/(public)/articles/[slug]/page.tsx:70`, confirmed in the prior articles extraction) — this is a cross-slice consumer Slice 3 must not break. |
| `getPortfolioDetailBySlug` | `(slug, language) => Promise<PortfolioDetail \| null>` | Every field on both tables except `id`/`isFeatured`/`isServiceShowcase`/timestamps | The full case-study page's data source. `PortfolioDetail` (`:19-43`) is the complete public-facing shape — 21 fields. |
| `listProjectsForSelect` | `() => Promise<ProjectOption[]>` | `projects.id` + `projectTranslations.title` (hardcoded `language: "en"`) | **Not part of the original portfolio read path** — added by Slice 2b (`docs/articles-crud-extract.md` §6 Q8) to populate the articles admin's related-project dropdown. `ProjectOption = { id: number; title: string }` (`:163`). This is a cross-slice consumer in the *other* direction: Slice 3 must not remove or reshape this function, or the articles admin's dropdown breaks. |

**No write function exists** — `createProject`, `updateProject`, `deleteProject`, and any per-language translation-write function are entirely new for Slice 3, along with an admin equivalent of `getPortfolioDetailBySlug` that doesn't filter to a public shape (e.g. a `getProjectById`/`listProjectsAdmin` for edit-form pre-fill and an admin list).

### 2.2 Public read path — list and detail, EN and AR

**List** — `app/(en)/(public)/portfolio/page.tsx` / `app/ar/(public)/portfolio/page.tsx` render `<PortfolioGrid>` (`components/portfolio-grid.tsx`, 129 lines, full file read) fed by `getPortfolioListItems(language)`. Confirmed behavior:
- Category tabs are derived client-side from `items.map(i => i.category)`, deduped, in first-seen order (`:35-45`); a tab bar renders only if `categories.length > 1` (`:52`) — matches `docs/1c-spec.md:38`'s "render a tab only for categories that actually have ≥1 project... if only one category is present, suppress the tab bar."
- Card click target is `getLanguagePath(\`/portfolio/${item.slug}\`, language)` (`:80`) — **slug-based**, confirmed.
- `item.categoryLabel || formatCategoryLabel(item.category)` (`:105`) — the per-language `category_label` override wins when present; otherwise the raw `category` string has its hyphens replaced with spaces (`formatCategoryLabel`, `:18-20`) as a display fallback. This confirms `category` itself needs no admin-facing "label" field of its own — the fallback is purely cosmetic string transformation.
- `isFeatured`/`isServiceShowcase` are **not read anywhere in this component or page** — confirmed by `grep -rln "isFeatured|isServiceShowcase"` across `app/`, `lib/`, `components/` returning only `lib/db/schema.ts` itself. These two flags exist in the schema (with a dedicated index for the service-showcase+category combination) but **have no live public consumer in this codebase today**. Their intended purpose is documented only in the *old* app (§5.2 below: "Show on Home Page 'Recent Work'" for `isFeatured`, "the main hero project on Services page" for `isServiceShowcase`) — no NEW homepage or solutions-page code reads them yet.

**Detail** — `app/(en)/(public)/portfolio/[slug]/page.tsx` (258 lines, full file read) / `app/ar/(public)/portfolio/[slug]/page.tsx` (structurally identical, AR copy). Fed by `getPortfolioDetailBySlug(slug, language)`. Section-by-section field consumption, in render order:
1. Hero: `categoryLabel || category` (eyebrow), `title`, `description`, `logo` (client-identity card image, placeholder text "Client logo" when null), the four `client*` fields joined with `" · "` and rendered `dir="ltr"` when at least one is present (`:59-64,106-110`).
2. Problem: `problemHeadline`, `problemBody`.
3. Diagnosis: `diagnosisHeadline`, `diagnosisBody`.
4. System: `systemHeadline` + `systemCards` grid (section hidden if `systemCards.length === 0`, `:153`).
5. Case-study media: `mediaImage` (placeholder box with an icon + "Case study media will appear here once added" when null, `:183-189`) + optional `mediaCaption`.
6. Results: `results` grid, **entire section omitted** if `results.length === 0` (`:198`).
7. Tech stack: `technologies` pills, **entire section omitted** if `technologies.length === 0` (`:219`).
8. CTA: `ctaHeadline?.trim() || CTA_DEFAULT.headline`, `ctaSubtext?.trim() || CTA_DEFAULT.subtext` (`:66-67`) — the fallback is a hardcoded bilingual default baked into each language's page file (confirmed present in both EN and AR files independently — not a shared constant, so a future editor of the CTA default text must update both).

**No draft/publish concept for projects** — confirmed both by the absence of any `published`-like column in `projects`/`project_translations` (§1) and by `docs/1c-spec.md:18`'s explicit statement: "Projects have no draft flag in scope — all projects are public." Every row that exists is live immediately; there is no equivalent to articles' `published`/`published_at` for this slice to reproduce.

**generateStaticParams / ISR**: both list and detail pages are ISR (`revalidate = 3600`, confirmed at `[slug]/page.tsx:12`; `getPortfolioSlugs()` drives `generateStaticParams`, `:20-23`). Any Slice-3 write must `revalidatePath` the affected public list and detail paths (both languages) for the same reason Slice 2b's articles CRUD does — these are cached Server Components reading the same tables.

### 2.3 EX-03 slug routing and legacy redirects — confirmed, with a naming discrepancy flagged

Slug→project resolution happens **only** in `getPortfolioDetailBySlug`'s `where(eq(projects.slug, slug))` (`lib/db/portfolio.ts:144`) — a direct, single-table lookup on the unique `slug` column, no separate resolver/redirect layer in application code.

The legacy id-based→slug redirect is **not** dynamic or DB-driven. It is a hardcoded, two-entry static list in `next.config.ts:11-23`:
```ts
{ source: "/portfolio/7", destination: "/portfolio/TODO-slug-for-legacy-project-7", permanent: true },
{ source: "/portfolio/8", destination: "/portfolio/TODO-slug-for-legacy-project-8", permanent: true },
```
The destinations are still literal `TODO-slug-for-legacy-project-{7,8}` placeholders today — confirmed by direct read, not yet filled in with real slugs. `docs/1c-spec.md:17` confirms this is intentional: "fixed 2-entry map, not a DB lookup," to be completed "at Phase 4 migration" once the real projects (ids 7, 8) are re-entered and assigned real slugs. **Implication for Slice 3, flagged again in §8**: nothing in a Projects CRUD admin UI can update this file — `next.config.ts` is a build-time config, not admin-editable data. If an admin later changes a project's slug via the CRUD editor, these two hardcoded redirect entries (once filled in) would silently go stale with no code path to keep them in sync. This is a real, structural gap between "slug is admin-editable data" and "the legacy redirect target is a hardcoded build artifact."

**Naming discrepancy worth flagging explicitly, not resolving here**: the *portfolio* slug-URL change is labeled "EX-03" in three places — `docs/decision-013-case-study-schema.md:6` ("Related: ... EX-03 (slug URLs)"), `docs/1c-spec.md:4,17` ("EX-03 (slug URLs)" / "Portfolio URLs move to slug-based (EX-03)"). But the *constitution's own* exception log (`.specify/memory/constitution.md:26`) lists only **EX-01** (`/portfolio/6` retired) and **EX-02** (`/articles/claude-business-operations-guide` retired) — it does **not** list any EX-03 at all. Separately, `specs/003-static-pages/spec.md:100,132` uses the label **"EX-03"** for a *completely different* exception — the `/services` → `/solutions` URL rename. So there are two distinct, undocumented-in-the-constitution exceptions both informally called "EX-03" by different documents (the services rename in Slice 1B's spec, and the portfolio slug-routing change in Decision 013/1C). Neither has ever been logged into the constitution's own exception list per its own governance rule ("Any additional exception requires an explicit entry," `constitution.md:26`). This is a pre-existing documentation inconsistency, not something introduced by this extraction — flagged here because Slice 3's spec should not silently inherit an ambiguous exception label.

---

## 3. Admin patterns to reuse (from Slices 004 / 2b)

Slice 2b (Articles CRUD, just shipped) is the more directly applicable template — it is the first slice to build a full create/edit/list/delete admin surface with image upload, whereas Slice 004 (leads) only ever built status-update + delete on rows created elsewhere. Concrete file-by-file template Slice 3 copies:

| Precedent (2b) | Role | What Slice 3 copies |
|---|---|---|
| `app/(en)/admin/(protected)/articles/page.tsx` | Server Component list, direct DAL read, no API layer | Direct template for `.../projects/page.tsx` — a Server Component calling a new `listProjectsAdmin()`-equivalent directly. |
| `app/(en)/admin/(protected)/articles/actions.ts` | `createArticleAction`/`updateArticleAction`/`deleteArticleAction`, each independently calling `requireAuth()` first | Direct template for `createProjectAction`/`updateProjectAction`/`deleteProjectAction` — same per-mutation auth-check pattern, same `revalidatePath` obligations (admin list + affected public list/detail, both languages). |
| `app/(en)/admin/(protected)/articles/article-form-schema.ts` | Non-`"use server"` module holding the shared `ArticleFormState` type (`{ status, fieldErrors, formError }`), the Zod schema, and `parseArticleFormData`/`mapUniqueViolation` helpers — split out because a `"use server"` file may only export async functions | Direct template for a `project-form-schema.ts` — same reason for the split applies identically; Slice 3's Zod schema is larger (case-study fields + jsonb arrays) but the state-shape and error-surfacing convention carries over unchanged. |
| `app/(en)/admin/(protected)/articles/article-form.tsx` | Single Client Component shared by create and edit, `useActionState`-driven, per-field inline `fieldErrors` | Direct template — Slice 3's form is materially larger (three images, four client fields, two headline+body pairs, two dynamic jsonb-array builders, tags, technologies, two visibility toggles) but the mechanism (one shared form component, a `mode: "create" | "edit"` prop) is identical. |
| `app/(en)/admin/(protected)/articles/cover-image-field.tsx` | Client Component: upload-on-select directly to `/api/image` via `fetch`, hidden input carries the returned path, thumbnail preview | Direct template, needed **three times** for Slice 3 (`cover_image`, `logo`, `media_image`) — see §4. |
| `app/(en)/admin/(protected)/articles/delete-article-form.tsx` | `window.confirm()` + `useFormStatus()` pending-state delete button, mirrored from `leads/delete-lead-form.tsx` | Direct template for a `delete-project-form.tsx`. |
| `app/(en)/admin/(protected)/admin-nav.tsx` | Flat `ADMIN_NAV_LINKS` array | Add `{ path: "/admin/projects", label: "Projects" }`. |
| `lib/db/articles.ts` (extended in 2b), `lib/db/leads.ts` (004 original) | Flat `lib/db/<entity>.ts` DAL: verb-first named exports, `.returning()` + null-on-miss convention | Direct template for a new/extended `lib/db/portfolio.ts` admin-write layer (or a decision to keep write functions in `portfolio.ts` alongside the existing reads — an open question, §7). |

**Grouped-list precedent from 2b** (`listArticleGroups`: flat fetch ordered by `updated_at desc`, grouped in application code by `translation_group_id`, `docs/articles-crud-extract.md`'s analogue) is the closest existing precedent for "one admin list row representing a multi-language concept," but **does not transfer as-is** — see §7 for exactly why the canonical-row model changes the grouping mechanics (there is no need to *group* rows by a shared id in Slice 3, since `projects` already *is* the one canonical row; the translations are children of it, not siblings linked by a shared UUID).

**Where Slice 3 diverges from 2b, stated plainly**: 2b's data model is **row-pairing** — two independent `articles` rows (one `en`, one `ar`) linked only by a shared `translation_group_id` value, with no FK between them, no cascade, and no requirement that both ever exist. Slice 3's data model is **canonical-row + child translations** — one `projects` row is the entity; `project_translations` rows are dependent children with a real FK (`project_id → projects.id`, `ON DELETE CASCADE`) and a `(project_id, language)` uniqueness constraint, not a `(shared_id, language)` one. This is a structurally different relationship (parent/child vs. peer/peer), and every 2b mechanic that assumed row-pairing (independent delete, independent publish state, an "add missing language" flow that creates a whole new top-level row) needs to be re-derived for the canonical-row shape, not copied — enumerated as open questions in §7.

---

## 4. Image upload integration — three fields

Confirmed contract (from the prior Slice 2a extraction, re-verified against `app/api/image/route.ts` and `app/api/image/[id]/route.ts`, unchanged by Slice 2b or since): `POST /api/image`, `multipart/form-data`, one field `file`, admin-session-gated, returns `{ id: string, url: string }` where `url` is `"/api/image/{id}"` — a short path string, never a data URI, never the bare `id` alone. The receiving field must store `url` verbatim.

`projects` has **three** independent image columns, with different nullability (§1.1):

| Column | Nullable? | Public role | Upload control needed |
|---|---|---|---|
| `cover_image` | **NOT NULL** — required | List-grid thumbnail (`PortfolioListItem.coverImage`, `portfolio-grid.tsx:89-96`) | One upload-on-select control, required before save (mirrors articles' `coverImage` requiredness exactly — same `FR-8.1`-equivalent constraint). |
| `logo` | nullable | Client-identity card's dominant image on the case-study hero; a placeholder "Client logo" text renders when absent (`[slug]/page.tsx:94-104`) | One upload-on-select control, optional — the form must allow saving with no logo set (unlike cover image). |
| `media_image` | nullable | Case-study media section; a dashed placeholder box renders when absent (`[slug]/page.tsx:175-190`) | One upload-on-select control, optional, same pattern as `logo`. |

All three are on the **canonical `projects` row**, not per-language — a project has exactly one cover image, one logo, one media image shared by both its `en` and `ar` translations (confirmed: these three columns live on `projects`, not `project_translations`, per §1.1/§1.2). This means the editor's image controls are **not** duplicated per language the way title/description/etc. are — one upload per field, full stop, regardless of how many translation rows exist.

Mechanically, each of the three needs its own instance of the 2a-consuming Client Component pattern already proven in 2b's `cover-image-field.tsx` (§3): a file input, immediate `fetch("/api/image", { method: "POST", body: formData })` on selection, a hidden input carrying the returned `url`, and a thumbnail preview. Slice 3's form needs **three** such instances (`coverImage`, `logo`, `mediaImage`) rather than one — no new upload mechanism, just three copies of an already-proven control, with two of the three permitted to stay empty.

No inline body-image-insert control is needed for Slice 3 — unlike articles' Markdown `body` field, nothing in `project_translations` is Markdown prose that would need an inline-image-insert affordance (the closest fields, `problem_body`/`diagnosis_body`, are plain paragraphs rendered as-is, `{project.problemBody}`/`{project.diagnosisBody}` — confirmed no Markdown renderer wraps them anywhere in `[slug]/page.tsx`).

---

## 5. Old-admin project behavior (`docs/phase-2-admin-extract.md` §4 — primary source, supplemented directly from `/home/ss-dev/projects/omniflowai`, available locally)

`docs/phase-2-admin-extract.md` §4 (lines 458-517) is explicitly framed as **"UX REFERENCE ONLY"** since Decision 013 rewrote the schema it describes — and it is accurate as far as it goes, re-verified directly against the old source in this pass. What follows is what §4 already has, plus one materially important mechanism it does not mention at all.

### 5.1 Already in `docs/phase-2-admin-extract.md` (confirmed accurate, not reproduced in full)

- Location: `client/src/pages/admin/Dashboard.tsx`, one file holding both the grid and the dialog form (`:464-465`).
- Field-by-field form layout: visibility toggles (Featured/Showcase) → Title + Client Name → Category (`Select`, taxonomy-driven) + Image (`ObjectUploader`) → Short Description → Problem/Diagnosis/System textareas → Outcome + Technologies (newline-delimited textareas) → Tags (chip input) → Cancel/Save (`:467-478`, confirmed verbatim against `Dashboard.tsx:245-341` in this pass).
- Validation: `react-hook-form` + `zodResolver`, inline `FormMessage`, no required-field asterisks (`:479-481`).
- Two hand-rolled "list" patterns, **neither of which handles an array of objects**: newline-delimited textarea for `results`/`technologies` (both plain `string[]` in OLD), and a manual chip/tag component for `tags` (`:483-514`). The doc's own conclusion — Decision 013's `system_cards` and reshaped `results` (`{value,label}` objects) need genuinely new repeatable-object-row UI, since OLD's patterns only ever handled arrays of plain strings — is confirmed exactly right by direct inspection of OLD's schema (`shared/schema.ts:81-82`: `results: jsonb("results").$type<string[]>()`, `technologies: jsonb("technologies").$type<string[]>()` — both bare string arrays, not objects).

### 5.2 Supplemented directly from OLD source (not in `docs/phase-2-admin-extract.md`)

**A real, previously-uncaptured DAL invariant: `ensureUniqueShowcase`.** `server/storage.ts:66-77` (full function read):
```ts
private async ensureUniqueShowcase(category: string, excludeId?: number) {
  await db.update(projects)
    .set({ isServiceShowcase: false })
    .where(and(
      eq(projects.category, category as Category),
      eq(projects.isServiceShowcase, true),
      excludeId ? ne(projects.id, excludeId) : undefined
    ));
}
```
Called from both `createProject` (`:88-92`, unconditionally when `insertProject.isServiceShowcase` is true) and `updateProject` (`:98-108`, when the update sets `isServiceShowcase: true`, resolving the project's category from the update payload or, if absent, from the current row). **Effect**: setting a project's `isServiceShowcase` to `true` silently un-sets every *other* project in the same category that was previously the showcase — enforced in the DAL, not just suggested by UI copy. This directly explains the form's own helper text (`Dashboard.tsx:269`, confirmed): *"The main hero project on Services page (Max 1 per category)"* — that constraint was actually enforced server-side, not merely aspirational copy. **`isFeatured` has no equivalent invariant anywhere in OLD** — any number of projects may be featured simultaneously; only the showcase flag is category-exclusive. This is a real, precise old-app mechanism a Slice 3 spec must explicitly decide whether to carry forward (§8) — it is *not* mentioned in `docs/phase-2-admin-extract.md` §4 at all.

**Old app was entirely monolingual for projects — confirmed no `language` column ever existed.** `shared/schema.ts:70-94` (OLD `projects` table, full definition read): `id, title, client, category, description, challenge, diagnosis, solution, results, technologies, image, tags, isFeatured, isServiceShowcase` — **no `language` field anywhere**, and no `project_translations`-equivalent table exists in the old schema at all. Every project in OLD had exactly one language's worth of content, period (consistent with the prior articles extraction's finding that OLD's Arabic was pure client-side UI-string switching, never per-row DB content). **This means NEW's entire bilingual `project_translations` authoring concept — creating and maintaining two language rows per project — has zero UX precedent in OLD, exactly parallel to (but structurally distinct from) articles' `translation_group_id` gap already identified in Slice 2b's own extraction.** The old admin form's single-pass field layout (§5.1) can inform *which fields* to ask for and in *what grouping*, but not *how to present two languages of them*.

**No slug-uniqueness handling in OLD** — confirmed by reading the full old project route block (`server/routes.ts:189-248`): `POST`/`PATCH /api/projects` do a bare `insertProjectSchema.parse(req.body)` / `storage.updateProject(id, req.body)` with no pre-check of any kind (unlike articles' old admin, which had an explicit 409 slug-clash pre-check). This makes sense — OLD projects had no `slug` column at all (routes are id-keyed, `/api/projects/:id`), so there was nothing to check uniqueness against. **NEW's `projects.slug UNIQUE` constraint and any admin-side clash-prevention UX is entirely new work with no old-admin precedent to port**, unlike articles where the 409-slug-clash pattern (`docs/articles-crud-extract.md` §5.2) had a direct, reusable old-app precedent.

**Home-page/services-page intent behind the two flags, confirmed via code comments**: `shared/schema.ts:92-93` — `isFeatured` is commented `// Home Page`, `isServiceShowcase` is commented `// Services Page Hero`. Neither of these consumers (a homepage "Recent Work" section, a solutions/services-page hero) exists yet in the NEW codebase (§2.2 already confirmed zero live consumers of either flag) — these columns are provisioned for future public-page work this slice does not include, but the admin editor presumably still needs to expose them (they are already-existing, not-null schema columns with defaults, so *some* admin control over them is expected even before a public consumer exists).

### 5.3 Gaps

None remaining for projects specifically beyond what's already flagged as genuinely net-new in §6/§7 — between `docs/phase-2-admin-extract.md` §4 and the direct-source supplement above, OLD's project-admin behavior (form layout, validation feel, the two array-input UX patterns, the showcase-exclusivity invariant, and the complete absence of slug/bilingual/case-study concepts) is now fully covered with citations.

---

## 6. The net-new surface from Decision 013

Everything below has **no old-admin precedent whatsoever** (confirmed absent in §5) and must be designed from scratch. Enumerating what the admin editor must let the operator input, and what the spec must decide — **not deciding any of it here**:

1. **The four client-identity fields** (`client_name`, `client_sector`, `client_country`, `client_model`) — straightforward text inputs, replacing OLD's single `client` field. Open question: are all four optional (schema says yes — all nullable), and does the editor show all four even when some will stay blank, or progressively reveal them?
2. **Problem / Diagnosis / System headline+body pairs** (`problem_headline`+`problem_body`, `diagnosis_headline`+`diagnosis_body`, `system_headline` alone — there is no `system_body`, only the dynamic `system_cards` beneath it) — six plain-text fields (five nullable, since none of these columns is `NOT NULL` in `project_translations`), replacing OLD's three single-paragraph `challenge`/`diagnosis`/`solution` textareas. Open question: plain `<textarea>` (matching OLD's feel) or something richer, given the public rendering is plain paragraph text with no Markdown involved (§2.2 confirmed)?
3. **`system_cards` — the crux of this slice's jsonb-editing UX.** An admin must be able to add/remove/reorder an array of `{ icon, title, description }` objects, where `icon` is constrained to the 12-value fixed pick-list (§1.3). This is categorically different from anything OLD's admin ever built (OLD only ever edited arrays of plain strings, §5.1). Open questions: a `useFieldArray`-style repeatable-row builder (each row: an icon `<select>` from the 12 fixed values, a title input, a description textarea, a remove button, an add-row button)? Any enforced min/max count (design intent is 2–6 per Decision 013, but nothing in the schema enforces it — does the admin editor enforce it, or leave it to operator judgment)? What happens to an existing row's `icon` value if it doesn't match the fixed list (e.g., legacy data)?
4. **`results` — reshaped from OLD's plain string array to `{ value, label }` objects, with the added wrinkle that `value` is meant to be identical across the `en` and `ar` translation rows of the same project** (§1.3, Decision 013's own documented convention — not DB-enforced). Open questions: does the editor present `results` once (shared value+label pairs edited together, with `label` having an EN and an AR variant side by side) or twice (once per language form pass, risking the two `value` strings silently diverging since nothing prevents it)? This is the one field where the "one canonical thing, two language variants" model (§7) gets genuinely awkward, since one sub-field (`value`) is meant to be language-neutral while its sibling (`label`) is not.
5. **CTA overrides** (`cta_headline`, `cta_subtext`) — optional per-language text overrides of a hardcoded bilingual default (§2.2: the fallback strings are duplicated independently in the EN and AR page files, not a shared constant). Open question: does the editor show the operator what the *default* text is (so they know what "leave blank" produces), or just present two empty-by-default optional fields with no context?
6. **`slug`** (on `projects`, not `project_translations`) — one Latin slug shared across both languages, `UNIQUE`, manually assigned (Decision 013: "Manual," `:22`) with **no OLD precedent for auto-generation** (unlike articles' title→slug slugify helper, which had a direct OLD analogue). Open question: does Slice 3 build a slugify-from-title helper anyway (analogous to articles'), and if so, from *which* language's title (the canonical row has no title of its own — only its translations do)?
7. **`logo` / `media_image`** — covered mechanically in §4; the open question here is purely about the *editor's* framing (e.g., does the form label them clearly enough that an operator doesn't confuse "cover image" the list thumbnail with "logo" the hero-card image, given both are just generic image upload controls with no other schema distinction)?

---

## 7. The canonical-row + translation model (vs. 2b's row-pairing) — mechanics the spec must decide

Given one canonical `projects` row (holding `slug`, `category`, `is_featured`, `is_service_showcase`, `cover_image`, `logo`, `media_image` — all language-independent) plus up to two `project_translations` child rows (`en`/`ar`, holding everything else), resolved together by `slug` for public rendering (§2.1/§2.3):

1. **Creation order and shape**: does creating a project always create the canonical row **and** at least one translation row in a single admin action (e.g. "create in English," which inserts both `projects` and one `project_translations` row together), or can a canonical row exist with zero translations (a "shell" project, valid per the schema — nothing requires a translation to exist, unlike articles where a bare `translation_group_id` with zero rows is meaningless since the group *is* the rows)? If a canonical-row-only creation step exists as its own action distinct from "add a translation," what does an admin list show for a project with no translations at all (no `title` exists anywhere to display)?
2. **How the editor presents EN + AR content**: one form covering both languages at once (two side-by-side or tabbed sets of the translation fields, sharing the single canonical-row fields — image uploads, slug, category, flags — once), or two separate passes (create the canonical row + one language, then a second "add the other language" step, structurally echoing 2b's counterpart-creation flow but adapted to a parent/child rather than peer/peer relationship)? This is the single largest UX-shape decision this spec must make, and it has no OLD precedent to lean on (§5.2) and only a partially-transferable 2b precedent (§3) since the relationship type differs.
3. **How `(project_id, language)` uniqueness shapes this**: this constraint guarantees at most one `en` and one `ar` translation row per project — structurally identical in *effect* to articles' `(translation_group_id, language)` constraint, but the *reference* is a real foreign key to an already-existing parent row, not a bare shared UUID value with no parent. This means "add the missing language" for a project is unambiguously "insert a `project_translations` row with this existing `project_id`," never "decide whether to generate a new id or reuse one" (there is only ever one relevant `project_id` — the canonical row already exists before any translation can be added). Does the spec still need a race/pre-check pattern analogous to 2b's counterpart pre-check (§3), given the FK relationship makes the "target still doesn't have this language" check a simple existence query against a known, fixed `project_id`?
4. **Slug uniqueness validation**: `projects.slug UNIQUE` is a single global constraint (not per-language, since slug lives on the canonical row) — simpler than articles' per-language `(language, slug)` constraint in one sense (only one namespace to check), but the admin-side validation still needs a pre-check + friendly-error pattern (mirroring 2b's `mapUniqueViolation`-style constraint-name branching, §3) since nothing in OLD ever validated slug uniqueness at all (§5.2). Does the editor auto-generate a slug from a title (and if so, which language's title, given a canonical row's slug decision may need to happen *before* any translation exists — see open question 1) or require fully manual entry, per Decision 013's "Manual" note?
5. **Edit behavior across the canonical row + its translations**: editing canonical-row fields (`category`, the three images, `is_featured`, `is_service_showcase`, `slug`) is a single `UPDATE projects` — unambiguous, no cross-row concern. Editing translation content is scoped to one `project_translations` row (`project_id`, `language`) — does the edit UI let an admin change EN and AR translation content in the same save action (a combined form submit touching two rows) or does each language save independently (mirroring articles' "one language row at a time" model, FR-4.2 in 2b)? Given `results.value`'s language-neutral convention (§6.4), a combined-save UI would make it easier to keep that convention intact than two fully independent per-language saves would.
6. **Delete behavior — the FK cascade is real and already confirmed (§1.2): `ON DELETE CASCADE`.** Deleting a `projects` row deletes both its `project_translations` rows automatically, with no application code needed to orchestrate it — this is structurally simpler than articles' delete (where "leave the counterpart untouched" was itself a design decision to *enforce*, since nothing in the schema coupled the two rows). Open question: does Slice 3 ever need a "delete just one language's translation, keep the canonical row and the other language" action (leaving a project with only one translation, or zero) — distinct from "delete the whole project" (which cascades both languages away together, unconditionally, via the DB, not admin logic)? If both actions are needed, they are two different operations at two different grains (delete a `project_translations` row directly vs. delete the `projects` row and let cascade handle the rest) — not a single "delete" concept the way articles' delete was.
7. **`isServiceShowcase`'s cross-row exclusivity invariant (§5.2)**: does Slice 3 port OLD's `ensureUniqueShowcase` behavior (silently un-setting every other project in the same category when one is marked showcase), enforce it differently (e.g. reject the save with an error instead of silently unsetting others), or drop the constraint entirely and let multiple showcase projects coexist per category? This is a genuine old-admin invariant with real code behind it, not a speculative feature — the spec must explicitly decide whether to keep, change, or drop it, not silently lose it by omission.

---

## 8. What does not map cleanly + open questions

### 8.1 What does not map cleanly

- **The legacy id→slug redirect is a static build-time file, disconnected from any admin-editable data** (§2.3) — a Projects CRUD cannot make `/portfolio/7`/`/portfolio/8`'s redirect targets self-maintaining; changing a project's slug via the new admin UI has no code path back to `next.config.ts`. This is a structural gap, not a bug to silently fix inside this slice (editing `next.config.ts` at runtime is not possible; a dynamic redirect mechanism would be new, unrequested infrastructure).
- **OLD's showcase-exclusivity invariant (`ensureUniqueShowcase`) has no schema-level enforcement in NEW** — nothing in `lib/db/schema.ts` (no partial unique index, no trigger) currently prevents two projects in the same category from both being `is_service_showcase = true`. If Slice 3 wants to keep this invariant, it must be re-implemented at the application layer exactly as OLD did (DAL-level, not DB-level) — it will not come "for free" from the schema.
- **OLD's category taxonomy (`shared/taxonomy.ts`'s fixed `CATEGORIES`/`CATEGORY_LABELS`) does not exist anywhere in the NEW codebase** — confirmed by a repo-wide search returning zero matches for `CATEGORIES`/`CATEGORY_LABELS`/`taxonomy` outside the old app. NEW's `projects.category` is a plain, unconstrained `text` column today, and `docs/1c-spec.md:39` confirms the operator explicitly cut the old pillar/category-deep-link mapping ("`CUT the ?service= pillar deep-link entirely`"). Whether Slice 3 reintroduces a fixed category pick-list (closer to OLD's UX) or keeps `category` as free text in the admin editor (matching NEW's current unconstrained-schema reality) is unresolved — OLD's admin UX (a `<Select>` from a fixed taxonomy) cannot be assumed to carry over without first deciding this.
- **OLD's `image` field (singular) does not map 1:1 to NEW's three image fields** — the *mechanism* (upload-on-select via the same kind of endpoint) carries over per §4, but OLD's form UX literally only ever had one image control to design around; NEW's editor needs three, with two optional — a materially different form-layout problem than a straight port.
- **Slug auto-generation has no OLD precedent to port at all for projects** (unlike articles, where OLD's `slugify()` helper was a direct, reusable pattern) — any auto-slug behavior for projects is being designed from zero, not adapted from an existing mechanism.

### 8.2 Consolidated open questions for the spec

**Canonical-row + translation mechanics (§7, restated as questions):**
- Q1. Can a canonical `projects` row exist with zero, or only one, translation rows as a valid, displayable admin state — and what does the admin list show for a project missing a translation?
- Q2. Does project creation insert the canonical row and its first translation together in one action, or as two distinct steps?
- Q3. Does the editor present EN and AR translation content in one combined form, or as two separate per-language passes?
- Q4. Is a race/pre-check pattern needed for "add the missing language" given the parent row already exists (simpler than 2b's case), or is a plain existence check sufficient?
- Q5. Is the project slug auto-generated from a title (and if so, whose — which language, and what happens if that language's translation doesn't exist yet), or always manually entered?
- Q6. Can EN and AR translation content be edited and saved together in one action, or must each language save independently (2b's model)?
- Q7. Is there a standalone "delete just this translation, keep the project" action distinct from "delete the whole project" (which cascades both languages via the DB)?

**Net-new jsonb/content UX (§6, restated as questions):**
- Q8. What UI builds `system_cards` (add/remove/reorder rows, icon constrained to the fixed 12-value pick-list)? Is a 2–6 count enforced by the editor, or left to operator judgment?
- Q9. What UI builds `results`, given `value` is meant to stay identical across languages while `label` is not — edited once with per-language labels, or twice with a risk of `value` drift?
- Q10. Do `tags` and `technologies` get a proper chip/array-row UI (an upgrade from OLD's ad hoc patterns) or a direct port of OLD's newline-textarea / hand-built chip component?
- Q11. Does the CTA-override UI show the operator the hardcoded fallback text for context, or just present blank optional fields?
- Q12. Plain textareas or something richer for the six problem/diagnosis/system headline+body fields?

**Invariants and taxonomy (§5.2/§8.1, restated as questions):**
- Q13. Is OLD's `ensureUniqueShowcase` (max one showcase project per category, enforced by silently un-setting others) carried forward, changed to a rejected-save error, or dropped?
- Q14. Does `category` become a fixed pick-list again (reintroducing something like OLD's taxonomy) or stay free text?
- Q15. Does Slice 3 do anything about the stale/TODO legacy-redirect entries in `next.config.ts`, or explicitly leave that out of scope with a note for a future manual step?

**Settled, not open (do not reopen):**
- The `projects`/`project_translations` schema itself (§1) — matches Decision 013 verbatim, zero drift from the applied migration.
- The four jsonb payload shapes (§1.3) — `systemCards: {icon,title,description}[]` (icon from a fixed 12-value list, unknown falls back to a default icon at render time), `results: {value,label}[]` (`value` conventionally language-neutral, not DB-enforced), `tags: string[]`, `technologies: string[]` (both per-language).
- The public read-path consumer contract (§2) — every field's exact render location and fallback behavior; no draft/publish concept for projects at all; `getRelatedProjectCard` and `listProjectsForSelect` are existing cross-slice consumers this slice must not break.
- The image-upload integration contract (§4) — `POST /api/image` → store the returned `/api/image/{id}` path string; three independent fields, one required (`cover_image`) and two optional (`logo`, `media_image`).
- The admin conventions to reuse (§3) — per-mutation `requireAuth()`, the `{status, fieldErrors, formError}` `useActionState` shape, flat DAL modules, `revalidatePath` after writes, `window.confirm()` delete confirmation — all mechanism, fully transferable regardless of how §7's canonical-row questions resolve.
- The FK cascade (§1.2/§7.6) — `project_translations.project_id → projects.id ON DELETE CASCADE` is a real, already-applied constraint; deleting a project always deletes its translations at the DB level, with no admin-code orchestration required for that part.
