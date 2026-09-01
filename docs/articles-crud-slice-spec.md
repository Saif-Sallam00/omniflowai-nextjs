# Articles CRUD — Phase 2, Slice 2b

**Status:** Draft (pending approval)
**Version:** 0.1
**Related decisions:** 001–012, 013 (context only — articles untouched by it), amendments 008.1/008.2/011.1
**Related slices:** 001 (Foundation), Phase 1 (public read path), 004 (admin leads — pattern source), 005 (image upload — consumed here)
**Authoritative extraction:** `docs/articles-crud-extract.md`

## Overview

Add admin create / edit / delete for articles, with bilingual EN↔AR management via `translation_group_id`, cover-image and inline-body-image upload through the Slice 2a endpoint, Markdown body editing, draft/publish control, and draft preview. This is the first slice that writes to the `articles` table — Phase 1 built the public read path only; no admin write path exists yet.

The `articles` schema is frozen and matches Phase 0 FR-3.1 verbatim (zero drift, re-verified in the extraction). This slice adds **no schema change** — it is DAL + Server Actions + admin UI only.

## Problem statement

Phase 1 renders published articles from the DB but there is no way to create or manage them — the table is populated only by seed data. Before cutover the operator must be able to author real bilingual articles (the production articles start clean in the target per the migration constraints and are re-entered here). This slice delivers that authoring capability.

Two things make this more than a port of the old admin: (1) the old app had **no translation concept** — EN/AR pairing via `translation_group_id` is a ground-up build; (2) image upload now goes through Slice 2a's dedicated store (`/api/image/{id}` reference), not the old inline data-URI approach.

## User stories

### US-1 — Admin lists all articles, grouped by translation concept
As the admin, I see every article — drafts included — in a list **grouped by `translation_group_id`**, one line per conceptual article showing its EN and AR versions side by side (with per-language title, publish state, and actions), so I can see at a glance which concepts have both languages and which are missing one.

### US-2 — Admin creates a new article
As the admin, I open a full-page create form, choose the language, enter title / slug / excerpt / cover image / Markdown body / optional related project / optional related solution / publish state, and save — producing a valid article row that the public site can render.

### US-3 — Admin adds the other-language version of an existing article
As the admin, from a grouped list row that has only one language, I click "Add Arabic version" (or "Add English version") and get a create form pre-linked to the **same `translation_group_id`** and the missing language, so the two rows are paired without me managing ids by hand.

### US-4 — Admin edits an existing article
As the admin, I open an existing article (one language at a time) in a full-page edit form, change any field, and save — without affecting its paired counterpart.

### US-5 — Admin deletes an article
As the admin, I delete a single language's article row with a confirmation step; its paired counterpart (if any) is left untouched.

### US-6 — Admin uploads a cover image and inline body images
As the admin, when I choose a cover image it uploads immediately via the Slice 2a endpoint and the returned reference is stored in the form; and while editing the Markdown body I can insert an image at the cursor that uploads the same way.

### US-7 — Admin previews a draft before publishing
As the admin, I can open a draft's public page in a new tab and see it render (drafts are visible to a signed-in admin, hidden from the public), so I can check it before flipping it to published.

### US-8 — Admin controls publish state and first-publish date
As the admin, I can save an article as a draft or published; the first-publication date is stamped once and never re-bumped by later edits, so the public "latest articles" ordering stays correct.

## Functional requirements

### FR-1 — Admin list (grouped)
- FR-1.1: A new admin route `app/(en)/admin/(protected)/articles/page.tsx` MUST exist, gated by the existing `(protected)` layout (which already calls `requireAuth()`), and MUST read directly via the DAL (no intermediate API route, per P-05).
- FR-1.2: The list MUST be **grouped by `translation_group_id`** — one row per group, each row presenting the group's EN version and AR version. For each present language the row MUST show at least: title, published/draft state, and actions (edit, delete, open public page / preview).
- FR-1.3: When a group is missing a language (an "orphan"), that side of the row MUST show an **"Add \<missing language\> version"** action that leads to the US-3 create flow pre-linked to that group and language.
- FR-1.4: Groups MUST be ordered by the group's most-recently-updated article, descending (most recently edited concept first). Rationale: `published_at` is null for drafts and cannot order an all-articles view (extraction §7).
- FR-1.5: The Articles nav entry MUST be added to `ADMIN_NAV_LINKS` (`{ path: "/admin/articles", label: "Articles" }`).

### FR-2 — Create
- FR-2.1: A full-page create route (e.g. `app/(en)/admin/(protected)/articles/new/page.tsx`) MUST exist — **not** a modal (this codebase has no dialog component system; full-page matches the existing plain-Tailwind admin).
- FR-2.2: The create form MUST collect: `language` (EN/AR), `title`, `slug`, `excerpt`, `coverImage` (via upload, FR-8), `body` (Markdown, FR-9), `published` (boolean), optional `relatedProjectId`, optional `relatedSolution`.
- FR-2.3: On submit, a `createArticleAction` Server Action MUST validate input (Zod), enforce slug rules (FR-7), insert via a new `createArticle` DAL function, apply `published_at` stamping (FR-5), and surface any error to the form (FR-11).
- FR-2.4: A fresh create (no group context) MUST let the DB column default assign a new `translation_group_id` (no UI for this).

### FR-3 — Add counterpart (pairing)
- FR-3.1: The create flow MUST accept an optional inbound `translation_group_id` + target `language` (e.g. via query params on `/admin/articles/new`) so US-3 can pre-link a new row to an existing group.
- FR-3.2: When creating a counterpart, `createArticle` MUST insert the row with the supplied `translation_group_id` (overriding the column default) and the supplied language.
- FR-3.3: If the target group already has a row in the requested language (the `(translation_group_id, language)` unique constraint would reject it), the action MUST surface a friendly error rather than a raw DB failure.
- FR-3.4: EN and AR rows of a group are otherwise **independent** — there is no requirement that both languages exist, and no cross-language cascade (see FR-4/FR-5).

### FR-4 — Edit / Delete
- FR-4.1: A full-page edit route (e.g. `.../articles/[id]/edit/page.tsx`) MUST load a single article row by id (new `getArticleById` DAL function) and pre-fill the form.
- FR-4.2: Editing MUST operate on **one language row at a time**; saving an EN row MUST NOT modify its AR counterpart, and vice versa.
- FR-4.3: `updateArticleAction` MUST validate, enforce slug rules (FR-7, excluding the row's own id from the uniqueness clash check), apply `published_at` stamping (FR-5), and **explicitly set `updated_at = now()`** on every update (the column has `defaultNow()` for inserts only; the grouped list ordering in FR-1.4 depends on updates bumping `updated_at`).
- FR-4.4: A delete action MUST require an explicit confirmation step (mirroring the leads `window.confirm()` precedent) and delete only the targeted language's row via a new `deleteArticle` DAL function; the paired counterpart MUST be left untouched.

### FR-5 — Publish state and `published_at` stamping
- FR-5.1: `published` is a per-row boolean; the EN and AR rows of a group MAY be in different publish states (one live, one draft) with no enforcement — the schema permits this and the UI MUST NOT prevent it. The grouped list (FR-1.2) MUST show each language's state independently.
- FR-5.2: `published_at` MUST follow first-publish-only stamping (ported from the old app, extraction §5): an explicit `published_at` supplied by the admin always wins (legitimate back-dating); otherwise, if the row is (or is becoming) published and has no prior `published_at`, stamp `now()`; if not published, leave `published_at` as it is (null or existing). Re-saving an already-published article MUST NOT re-bump `published_at`.
- FR-5.3: This stamping logic MUST live in the DAL layer (`createArticle`/`updateArticle`), not in the form or action, so it is a single enforced invariant.

### FR-6 — (reserved — pairing behavior folded into FR-1/FR-3/FR-4/FR-5)

### FR-7 — Slug handling
- FR-7.1: Slug validation MUST be **language-aware**:
  - EN slugs MUST match the old app's rule: `^[a-z0-9]+(?:-[a-z0-9]+)*$` (lowercase Latin, digits, hyphens; no leading/trailing/double hyphens).
  - AR slugs MUST permit Arabic-script characters, digits, and hyphens (Arabic-script slugs are explicitly allowed per operator decision; the exact character class — Arabic Unicode range, whether Arabic-Indic digits are allowed — is pinned during `/plan`). No spaces.
- FR-7.2: On create, the slug MUST be auto-generated from the title via a **language-aware** slugify (the old Latin-only slugify would strip Arabic entirely and MUST NOT be reused verbatim for AR). Auto-generation applies on create only; the slug stays editable and is never locked.
- FR-7.3: Slug uniqueness is per `(language, slug)` (DB-enforced). Before insert/update the action MUST pre-check for a clashing slug in the same language and, on clash, surface a friendly "That slug is already in use" message (old app's 409 pattern, extraction §5) — rather than letting the unique constraint throw a raw 500. On update the clash check MUST exclude the row's own id.
- FR-7.4: EN and AR slugs within a group MAY differ freely; there is no requirement that they match.

### FR-8 — Cover image
- FR-8.1: `cover_image` is `NOT NULL`; a create MUST require a cover image.
- FR-8.2: The cover-image control MUST upload on selection (not deferred to article submit) to `POST /api/image` (multipart, the admin's existing session), and store the returned `url` string (`/api/image/{id}`) in the form's `coverImage` field — **never** a data URI, **never** the bare id (extraction §4).
- FR-8.3: The control SHOULD show a thumbnail preview of the selected/stored image (it can render `/api/image/{id}` directly).

### FR-9 — Markdown body + inline images
- FR-9.1: `body` MUST be edited as raw Markdown in a plain textarea (no WYSIWYG), consistent with the old app and the existing `ArticleMarkdown` renderer (GFM, link/image handling, lone-line YouTube auto-embed).
- FR-9.2: The body editor MUST provide an **"insert image"** action that uploads a chosen file via `POST /api/image` and inserts a Markdown image referencing the returned `/api/image/{id}` at the cursor position. The existing renderer already passes non-`data:` image URLs through unmodified, so no renderer change is needed.

### FR-10 — Related project / related solution
- FR-10.1: `relatedProjectId` MUST be an optional dropdown populated by a **new** DAL function (e.g. `listProjectsForSelect()` returning `{ id, title }[]`; no such flat list exists in `lib/db/portfolio.ts` today). Titles shown in the admin's language (English-only admin per Assumptions). The value MUST reference a real `projects.id` or be null.
- FR-10.2: `relatedSolution` MUST be an optional dropdown of the four known ids (`foundation`, `growth-engine`, `scale-infrastructure`, `custom`) — an application-level convention, not a DB enum. Null is allowed.

### FR-11 — Error surfacing
- FR-11.1: Create/update Server Actions MUST surface validation and slug-clash errors back to the form using `useActionState` (React 19) — the same mechanism the Phase 0 admin login form already uses. Actions MUST NOT silently no-op on invalid input (the leads actions' silent-return pattern is insufficient for a multi-field authoring form).
- FR-11.2: Every mutating Server Action (`createArticleAction`, `updateArticleAction`, `deleteArticleAction`) MUST call `requireAuth()` as its own first line, independent of the layout gate (constitution auth-boundary rule; leads precedent).

### FR-12 — Draft preview
- FR-12.1: Draft visibility already works in the public read path (the article detail page renders a draft only to a signed-in admin and `notFound()`s the public; `generateMetadata` falls back to generic values for a draft). This slice MUST NOT break that behavior.
- FR-12.2: "Preview" MUST reuse that mechanism: an "Open preview" affordance that opens the article's public URL (`/articles/{slug}` for EN, `/ar/articles/{slug}` for AR) in a new tab. No separate in-editor preview renderer is required.

### FR-13 — Cache revalidation
- FR-13.1: After any create/update/delete, the action MUST `revalidatePath("/admin/articles")` and revalidate the affected public paths for the relevant language: the list (`/articles` or `/ar/articles`) and the detail (`/articles/{slug}` or `/ar/articles/{slug}`). Public list/detail are ISR-cached Server Components reading the same table.

### FR-14 — DAL and conventions
- FR-14.1: All new article persistence MUST live in `lib/db/articles.ts`, extending the existing read-only module with write/admin functions: `createArticle`, `updateArticle`, `deleteArticle`, `getArticleById`, and a grouped admin list (e.g. `listArticleGroups`) returning EN/AR per `translation_group_id`. Verb-first named exports, `type` aliases, `.returning()` + null-on-miss convention (leads precedent).
- FR-14.2: `listProjectsForSelect()` (FR-10.1) MUST live in `lib/db/portfolio.ts`.
- FR-14.3: No existing table/column/enum/index is modified. No migration is generated by this slice.

### FR-15 — Quality gate
- FR-15.1: `npm run check`, `npm run lint`, `npm run build` MUST all pass with zero errors before the slice is accepted.

## Out of scope

- Projects CRUD (Slice 3) — separate, heavier slice (Decision 013 schema).
- Any change to the frozen `articles` schema, or to `projects`/`project_translations`.
- Reintroducing the old app's per-article `/api/articles/:slug/cover` route — Slice 2a's generic `/api/image/{id}` supersedes it.
- A dialog/modal component system (shadcn/Radix) — full-page routes instead.
- Coupled cross-language actions (bundled "delete both languages", forced symmetric publish) — pairing stays independent per row.
- Article migration from production — production articles are re-entered by the operator; no migration script here.
- OG/social metadata wiring for cover images beyond what the public detail page already does.

## Assumptions (settled by the extraction — do not reopen)

- `articles` schema matches FR-3.1 verbatim; it is the authority (`lib/db/schema.ts`, extraction §1).
- Public read-path consumer contract (extraction §2): `coverImage` bound verbatim as an `<img src>`; `body` as GFM Markdown; `relatedSolution` one of four known string ids with no DB enum; draft detail visible only to signed-in admin.
- Slice 2a upload contract (extraction §4): `POST /api/image` → store the returned `/api/image/{id}` path string in `cover_image`; never a data URI, never the bare id.
- Admin conventions to reuse (extraction §3): `(protected)` layout gate, per-mutation `requireAuth()`, flat `lib/db/<entity>.ts` DAL, direct-Drizzle-read Server Components, `revalidatePath` after writes, `window.confirm()` delete confirmation, plain-Tailwind admin UI.
- Admin is English-only.

## Acceptance criteria

1. **AC-1:** The admin Articles list renders all articles grouped by `translation_group_id`, one row per concept showing EN and AR versions with per-language title/state/actions, ordered by most-recently-updated group first; drafts appear.
2. **AC-2:** From an orphan row, "Add \<missing language\> version" opens a create form that, on save, produces a second row sharing the original `translation_group_id` in the missing language.
3. **AC-3:** Creating a fresh article (no group context) produces a row with a new `translation_group_id` and the chosen language; it renders on the correct public list/detail once published.
4. **AC-4:** Editing one language's row saves its changes and leaves the paired counterpart unchanged; `updated_at` moves to now and the list re-orders accordingly.
5. **AC-5:** Deleting one language's row (after confirmation) removes only that row; the counterpart remains.
6. **AC-6:** Choosing a cover image uploads it immediately via `/api/image` and stores `/api/image/{id}` (not a data URI) in `cover_image`; the saved article's cover renders on the public page.
7. **AC-7:** Inserting an image in the body uploads via `/api/image` and places a Markdown image referencing `/api/image/{id}` at the cursor; it renders in the published article body.
8. **AC-8:** A duplicate slug in the same language is rejected with a friendly inline message (not a 500, not a silent no-op); on edit, re-saving a row without changing its slug does not false-trigger the clash.
9. **AC-9:** An EN slug with invalid characters is rejected; an AR slug using Arabic script is accepted; slug auto-generates from the title on create for both languages and stays editable.
10. **AC-10:** Saving as draft leaves `published_at` null; first publish stamps it once; a later edit of the published article does not re-bump `published_at`; an explicit admin-supplied `published_at` is honored.
11. **AC-11:** A draft's public URL renders for a signed-in admin (preview) and `notFound()`s an unauthenticated visitor; its metadata does not leak the draft title.
12. **AC-12:** After a create/edit/delete, the relevant public list and detail pages reflect the change (revalidation) without a manual rebuild.
13. **AC-13:** Every mutating Server Action independently enforces `requireAuth()`.
14. **AC-14:** `npm run check`, `npm run lint`, `npm run build` all exit zero. No migration is produced; no existing schema object is modified.

## Notes on things Spec Kit `/clarify` / `/plan` will likely resolve

- Exact AR slug character class (Arabic Unicode range; Arabic-Indic vs ASCII digits) and the language-aware slugify implementation.
- The grouped-list DAL query shape (`{ translationGroupId, en, ar }`, ordered by group max `updated_at`) — one query vs. fetch-and-group in code.
- The precise query-param contract for the "add counterpart" create flow (`?group=&lang=`).
- Whether `updated_at` is bumped via an explicit set in `updateArticle` or a Drizzle `.$onUpdate` (preferring the option that keeps `schema.ts` at zero drift from FR-3.1).
- The `useActionState` return-shape contract for surfacing form/field errors (reusing the login form's pattern).
- Client vs. server responsibility split for the cover-image and body-image upload controls (both hit `/api/image`).
