# Admin Dashboard Restyle — Phase 4 (pre-cutover)

**Status:** Draft (pending approval)
**Version:** 0.1
**Related decisions:** 001–013, constitution "plain-Tailwind admin, no component library" (upheld, NOT reversed), P-02 (Server Components by default), the auth-boundary rule (per-mutation `requireAuth()`)
**Related slices:** 004 (leads), 006 (articles CRUD), 007 (projects CRUD), and the admin shell established across them
**Nature:** Visual/presentational layer only. **Zero behavior change.**

## Overview

Restyle the entire admin area from its deliberately-plain, near-unstyled state into a comfortable, professional operator dashboard: a persistent sidebar layout, a small set of reusable hand-rolled Tailwind presentational components (card, button, form fields, table, page header, status badge), and every admin surface (dashboard, leads, articles list + form + editor, projects list + form) restyled to use them. Neutral/professional palette (grays + one accent), light mode only.

The admin was intentionally built plain during Phase 2 (structure over polish). Its structure is now settled and proven end-to-end; the operator has to work in it daily to run the site, so a usable dashboard is a real requirement. This slice delivers that **without changing any admin behavior** — no library is introduced (hand-rolled Tailwind keeps the locked "plain Tailwind, no component library" decision intact), no dependency is added, no schema/DAL/action/auth logic is touched.

## The non-negotiable boundary (read first)

**This slice changes presentational JSX and Tailwind `className` strings only. It must not change any behavior.** Specifically, it MUST NOT alter:
- Any Server Action (signature, body, `requireAuth()` call, validation, revalidation, redirect).
- Any DAL function (`lib/db/*`) or its call sites' arguments.
- Any auth logic (`requireAuth()`, `getSessionOrNull`, the `(protected)` gate).
- The env-leak fix (`lib/article-solutions.ts` / `server-only` guard) — no client component may newly import a server-only module.
- The draft/publish logic, `published_at` stamping, the grouped-article/counterpart model, the transactional project create/edit, the three-image upload flow, slug validation, `mapUniqueViolation`, or any other business rule.
- Any schema, migration, or public-site page.

If restyling a page appears to require changing what a Server Action or DAL call does, that is out of scope — stop and report it, do not "fix" it here.

## Decisions settled before this spec (do not reopen)

- **Hand-rolled Tailwind, NO component library** (no shadcn/Radix, no new dependency) — upholds the locked constitution decision.
- **Neutral/professional palette**: grays as the base, a single accent color, clean. Light mode ONLY (no dark mode, no toggle).
- **One slice, all admin pages** together.
- **Zero behavior change** (see boundary above).
- The heavy project form (Slice 7) is restyled but its logic/JSX-around-logic is treated with extra care and verified independently (it's the highest-risk file).

## User stories

### US-1 — Operator works in a real dashboard, not raw HTML
As the operator, the admin area has a persistent sidebar (Dashboard / Leads / Articles / Projects / Sign out), consistent page headers, and clean spacing/typography, so navigating and operating the site feels like a proper tool.

### US-2 — Consistent, legible data tables
As the operator, the leads list and the articles/projects lists render as proper styled tables/cards (aligned columns, readable rows, clear status badges, obvious row actions), so I can scan and act on content quickly.

### US-3 — Comfortable forms
As the operator, the article and project create/edit forms have styled inputs, labels, buttons, and clear section grouping — including the repeatable-row builders (system cards, results) and the image-upload controls — so filling them isn't a strain.

### US-4 — Nothing I already rely on breaks
As the operator, every admin action that worked before (create/edit/delete article incl. EN↔AR pairing and inline images, create/edit/delete project incl. all three image uploads and the case-study fields, lead status/delete, sign in/out, draft publish) works exactly as before after the restyle.

## Functional requirements

### FR-1 — Reusable presentational components (new, hand-rolled)
- FR-1.1: Add a small set of presentational components under `components/admin/` (naming at implementation time), pure Tailwind, no new dependency, e.g.: a page/card container, a button (primary/secondary/destructive variants), form-field wrappers (label + input/textarea/select + error slot), a table (header/row/cell), a page header (title + optional action), and a status badge.
- FR-1.2: These components are **presentational only** — they render markup and accept props/children; they contain no data fetching, no Server Actions, no auth, no DB access. A Server Component or the existing form logic passes content/handlers into them.
- FR-1.3: They MUST be usable from Server Components (the admin lists/pages) without forcing a page to become a Client Component. A component only carries `"use client"` if it genuinely needs interactivity (e.g. a mobile sidebar toggle) — and if so, it MUST NOT import any server-only module (env-leak guard).

### FR-2 — Sidebar layout
- FR-2.1: The `(protected)` admin layout MUST render a persistent sidebar (Dashboard, Leads, Articles, Projects, and Sign out) plus a content region, replacing the current top text-nav. Built once in the layout so every admin page inherits it.
- FR-2.2: The active nav item MUST be visually indicated. The existing `requireAuth()` call in the `(protected)` layout MUST remain exactly as-is — the sidebar is added around it, not in place of it.
- FR-2.3: Sign-out MUST continue to invoke the existing sign-out Server Action unchanged (only its trigger's styling changes).

### FR-3 — Restyle each admin surface (presentation only)
- FR-3.1: **Dashboard** (`/admin`) — a clean landing with the styled shell.
- FR-3.2: **Leads** (`/admin/leads`) — the list as a styled table; status control and delete as styled controls. The status-change and delete Server Actions and their wiring are unchanged.
- FR-3.3: **Articles list** (`/admin/articles`) — the grouped-by-`translation_group_id` list as styled rows/cards, EN/AR per-language state as badges, the "Add \<language\> version" affordance and per-row edit/delete/preview (preview only on published, per the prior fix) restyled. Grouping logic and all links unchanged.
- FR-3.4: **Article form** (`/admin/articles/new`, `/admin/articles/[id]/edit`) — styled fields, buttons, and section grouping; the cover-image control, the Markdown body editor + inline-image insert, the related-project/related-solution selects, and `useActionState` error display all restyled. All form state, actions, and the `RELATED_SOLUTIONS` client-safe import stay exactly as-is.
- FR-3.5: **Projects list** (`/admin/projects`) — styled table/cards with cover thumbnail, title, category, featured/showcase badges, and row actions. Unchanged data + links.
- FR-3.6: **Project form** (`/admin/projects/new`, `/admin/projects/[id]/edit`) — the heavy combined bilingual form restyled: canonical fields, the three image-upload controls, EN/AR content sections, the system-cards and results repeatable-row builders, and the chip inputs — all styled, with clear sectioning. **The transactional save, the fan-out assembly, the shared-structure builders, and all form state remain byte-for-byte unchanged** — only presentation changes.

### FR-4 — Public site untouched
- FR-4.1: No public route, `SiteShell`, public component, or public styling is changed by this slice. The admin restyle is scoped to admin surfaces only. (The public-site visual refresh is a separate, post-cutover effort.)

### FR-5 — No behavior / no new dependency / no schema change
- FR-5.1: No new npm dependency. No component library.
- FR-5.2: No schema change, no migration.
- FR-5.3: No Server Action, DAL function, auth call, or business rule changes — verified by diff review (the diff should be JSX/className/new-presentational-component files only; `lib/db/*`, `lib/auth*`, `lib/actions/*` logic, and the actions files' bodies unchanged except where a purely presentational element they render is restyled).
- FR-5.4: The `server-only` guard MUST still pass — no client component newly imports a server-only module. (If the build fails on this, it's a real leak to fix, not to suppress.)

### FR-6 — Quality gate + deployed verification
- FR-6.1: `npm run check`, `npm run lint`, `npm run build` MUST all pass with zero errors.
- FR-6.2: Because prior bugs only surfaced on the real deploy, this slice MUST be verified by walking every admin flow **on the deployed Replit URL** (not just locally) with the browser console open — see Acceptance Criteria.

## Out of scope

- **Public-site visual refresh** — separate, post-cutover (the `apple-design`-audit-informed effort).
- **Any component library** (shadcn/Radix) — explicitly not adopted; hand-rolled only.
- **Dark mode / theme toggle.**
- **Any admin behavior, feature, or field change** — no new admin capabilities, only restyling existing ones.
- **Schema/DAL/action/auth changes.**
- The cutover runbook items (redirects, migration, empirical checks, DNS, `INDEXING_ENABLED` flip) — this slice is a pre-cutover usability fix, not part of the cutover itself.

## Assumptions (settled — do not reopen)

- The admin is functional end-to-end today; only its appearance is plain. This slice does not fix bugs (none open in admin behavior after the env-leak + deploy fixes) — it restyles.
- Admin is English-only; light mode is acceptable for an internal tool.
- The existing admin file structure (pages under `app/(en)/admin/(protected)/**`, the shell, the form/action/DAL split) stays; only presentation is layered on.
- The deployed Replit build is now correct (deps installed, env-leak fixed) — this slice is verified against that working deploy.

## Acceptance criteria

1. **AC-1:** The admin area renders with a persistent sidebar (Dashboard/Leads/Articles/Projects/Sign out), styled page headers, and a professional neutral light-mode look on every admin page.
2. **AC-2:** Leads, articles (grouped), and projects lists render as clean styled tables/cards with legible rows, status badges, and clear row actions.
3. **AC-3:** The article and project forms render with styled fields/labels/buttons/sections, including the repeatable-row builders, chip inputs, image-upload controls, and inline error display.
4. **AC-4 (the critical one):** Every admin flow still works, verified on the deployed URL with console open: sign in/out; lead status-change + delete; article create (with cover + inline image upload), EN↔AR "add version", edit, publish, delete; project create (all three images, system cards, results, both languages), edit, delete; published article/project render correctly on the public site; a draft still 404s publicly; no console errors on any admin page (env-leak class).
5. **AC-5:** `git diff` shows presentational changes only — new `components/admin/*` files plus JSX/className edits in admin pages/components; NO change to `lib/db/*`, `lib/auth*`, `lib/env.ts`, the Server Actions' logic, schema, or `drizzle/`. Zero-diff on `schema.ts`/`drizzle/`.
6. **AC-6:** No new npm dependency (diff of `package.json` shows nothing added). The `server-only` build guard still passes.
7. **AC-7:** No public route or public component changed.
8. **AC-8:** `npm run check`, `npm run lint`, `npm run build` all exit zero.

## Notes for `/plan` (mechanism details deferred)

- The exact component set and their prop shapes; the palette tokens (gray scale + one accent) as Tailwind classes or a small shared constants file.
- The sidebar's responsive behavior (fixed sidebar on desktop; whether a mobile toggle is needed — if so, the toggle is the only likely `"use client"` addition and must not import server modules).
- How the restyle wraps existing client-component forms (`article-form.tsx`, `project-form.tsx`, the editors, chip inputs) without altering their state/logic — presentational components receive the existing inputs/handlers as children/props.
- Sequencing the work so the heavy project form is its own step with independent verification (highest-risk file).
- How AC-4's deployed-URL verification is performed (the same live-smoke-test flow already established), including the create→verify→delete seed-data lifecycle so the DB is left clean.
