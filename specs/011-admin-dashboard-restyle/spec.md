# Feature Specification: Admin Dashboard Restyle (Phase 4, pre-cutover)

**Feature Branch**: `[011-admin-dashboard-restyle]`

**Created**: 2026-09-02

**Status**: Draft

**Input**: User description: "Admin Dashboard Restyle (Phase 4, pre-cutover), built directly from the approved, committed `docs/admin-restyle-slice-spec.md` — a visual/presentational-only restyle of the entire admin area (persistent sidebar, hand-rolled Tailwind presentational components, neutral light-mode palette) with zero behavior change to any Server Action, DAL function, auth logic, or business rule."

**Authoritative source**: `docs/admin-restyle-slice-spec.md` (approved, committed). This specification is derived directly from that document's user stories, functional requirements (FR-1..FR-6), out-of-scope list, settled decisions/assumptions, and acceptance criteria (AC-1..AC-8). Nothing in that source document's "Decisions settled before this spec," "Assumptions," or "The non-negotiable boundary" sections is reopened, widened, or reinterpreted here.

## The non-negotiable boundary (read first)

This slice changes presentational JSX and Tailwind `className` strings only, and adds new presentational components. It must not change any behavior. It MUST NOT alter:
- Any Server Action (signature, body, `requireAuth()` call, validation, revalidation, redirect).
- Any DAL function (`lib/db/*`) or its call sites' arguments.
- Any auth logic (`requireAuth()`, `getSessionOrNull`, the `(protected)` gate).
- The env-leak fix (`lib/article-solutions.ts` / `server-only` guard) — no client component may newly import a server-only module.
- The draft/publish logic, `published_at` stamping, the grouped-article/counterpart model, the transactional project create/edit, the three-image upload flow, slug validation, `mapUniqueViolation`, or any other business rule.
- Any schema, migration, or public-site page/component/styling.

If restyling a page appears to require changing what a Server Action or DAL call does, that is out of scope for this feature — it must be reported, not silently "fixed."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Operator works in a real dashboard, not raw HTML (Priority: P1)

As the operator, the admin area has a persistent sidebar (Dashboard / Leads / Articles / Projects / Sign out), consistent page headers, and clean spacing/typography, so navigating and operating the site feels like a proper tool instead of unstyled markup.

**Why this priority**: The sidebar and shell are the foundation every other admin page inherits from. Without it, the other restyle work has no consistent frame to sit in.

**Independent Test**: Can be fully tested by loading any admin page and confirming a persistent sidebar with all four nav destinations plus sign-out is present, the current page is visually indicated as active, and the page renders with a professional neutral light-mode look — independent of any specific list or form content.

**Acceptance Scenarios**:

1. **Given** an authenticated operator on any admin page, **When** the page loads, **Then** a persistent sidebar shows Dashboard, Leads, Articles, Projects, and Sign out, and a consistent page header/content region is visible.
2. **Given** the operator is on a specific admin section (e.g. Leads), **When** the sidebar renders, **Then** the corresponding nav item is visually indicated as active.
3. **Given** the operator clicks Sign out, **When** the action completes, **Then** the existing sign-out behavior occurs unchanged (only the trigger's appearance differs).

---

### User Story 2 - Consistent, legible data tables (Priority: P2)

As the operator, the leads list and the articles/projects lists render as proper styled tables/cards (aligned columns, readable rows, clear status badges, obvious row actions), so scanning and acting on content is quick.

**Why this priority**: Once the shell exists, the list views are what the operator looks at most day-to-day; legibility here directly affects daily operating speed.

**Independent Test**: Can be fully tested by opening the leads list, the articles list, and the projects list and confirming each renders as a styled table/card layout with legible rows, visible status badges, and clearly actionable row controls — without needing to open any form.

**Acceptance Scenarios**:

1. **Given** the leads list has existing leads, **When** the operator opens `/admin/leads`, **Then** it renders as a styled table with a legible status control and delete action per row, with the underlying status-change and delete behavior unchanged.
2. **Given** articles grouped by translation group exist, **When** the operator opens `/admin/articles`, **Then** each group renders as styled rows/cards with EN/AR per-language state shown as badges, an "Add \<language\> version" affordance, and per-row edit/delete/preview actions (preview only for published articles), with grouping logic and links unchanged.
3. **Given** projects exist, **When** the operator opens `/admin/projects`, **Then** the list renders as a styled table/cards showing a cover thumbnail, title, category, and featured/showcase badges, with unchanged data and links.

---

### User Story 3 - Comfortable forms (Priority: P2)

As the operator, the article and project create/edit forms have styled inputs, labels, buttons, and clear section grouping — including the repeatable-row builders (system cards, results) and the image-upload controls — so filling them isn't a strain.

**Why this priority**: Forms are used less frequently than the lists but are where the operator spends the most continuous time per session; poor legibility here is high-friction but not blocking day-to-day scanning.

**Independent Test**: Can be fully tested by opening the article create/edit forms and the project create/edit forms and confirming all fields, buttons, section groupings, repeatable-row builders, chip inputs, and image-upload controls render with clear styling and inline error display — without submitting any data.

**Acceptance Scenarios**:

1. **Given** the operator opens the article form (create or edit), **When** the page renders, **Then** all fields (including cover-image control, Markdown body editor with inline-image insert, related-project/related-solution selects) appear styled with clear section grouping, and `useActionState` error display renders inline and styled.
2. **Given** the operator opens the project form (create or edit), **When** the page renders, **Then** canonical fields, the three image-upload controls, EN/AR content sections, the system-cards and results repeatable-row builders, and the chip inputs all appear styled with clear sectioning.
3. **Given** a form submission produces a validation error, **When** the error is returned, **Then** it displays inline in styled form, using the exact same underlying form state and error data as before.

---

### User Story 4 - Nothing the operator already relies on breaks (Priority: P1)

As the operator, every admin action that worked before the restyle (create/edit/delete article incl. EN↔AR pairing and inline images, create/edit/delete project incl. all three image uploads and case-study fields, lead status-change/delete, sign in/out, draft publish) works exactly as before after the restyle.

**Why this priority**: This is the non-negotiable regression guard for the entire slice — visual changes are worthless, and actively harmful, if any underlying behavior breaks. It gates release of every other story in this feature.

**Independent Test**: Can be fully tested, independent of visual review, by walking the full set of admin flows end-to-end on the deployed environment with the browser console open and confirming each flow completes with the same outcome as before the restyle, with no console errors.

**Acceptance Scenarios**:

1. **Given** the restyled admin is deployed, **When** the operator signs in and out, **Then** authentication behaves exactly as before.
2. **Given** the restyled leads list, **When** the operator changes a lead's status or deletes a lead, **Then** the change persists exactly as before.
3. **Given** the restyled article form, **When** the operator creates an article with a cover image and an inline body image, adds an EN↔AR counterpart version, edits it, publishes it, and deletes it, **Then** every step behaves exactly as before, the published article renders correctly on the public site, and a draft still returns 404 on its public URL.
4. **Given** the restyled project form, **When** the operator creates a project with all three images, system cards, results, and both EN/AR language content, edits it, and deletes it, **Then** every step behaves exactly as before and the published project renders correctly on the public site.
5. **Given** any admin page is open, **When** the browser console is inspected, **Then** no errors appear (in particular, no recurrence of the env-leak class of error).

---

### Edge Cases

- What happens when the sidebar is viewed on a narrow/mobile-width screen? The sidebar must remain usable (collapsed, toggled, or otherwise responsively adapted) without breaking navigation or hiding the sign-out control.
- What happens when a list is empty (no leads, no articles, no projects)? The styled table/card view must still render a legible, non-broken empty state rather than a malformed table.
- What happens when a form's `useActionState` returns a field-level validation error after restyling? The error must still be visibly associated with its field, exactly as it was pre-restyle, just styled.
- What happens when an operator navigates directly to an edit URL for an article/project that doesn't exist? Existing not-found/error handling for that route is unchanged and must still render sensibly within the new shell.
- What happens if a presentational component is used on a page that has no interactive/client needs? It must not force that page to become a Client Component (per FR-1.3).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a small set of new, reusable, presentational-only components (e.g. a page/card container, a button with primary/secondary/destructive variants, form-field wrappers combining label + input/textarea/select + error slot, a table with header/row/cell parts, a page header with title and optional action, and a status badge), built with hand-rolled Tailwind only, introducing no new npm dependency and no component library.
- **FR-002**: These presentational components MUST contain no data fetching, no Server Actions, no auth logic, and no direct database access — they only render markup from props/children supplied by the page or existing form logic.
- **FR-003**: These presentational components MUST be usable from Server Components without forcing a page to become a Client Component. A component may only carry a client-interactivity directive if it genuinely needs interactivity (e.g. a mobile sidebar toggle), and in that case it MUST NOT import any server-only module.
- **FR-004**: The protected admin layout MUST render a persistent sidebar (Dashboard, Leads, Articles, Projects, Sign out) plus a content region, replacing the current top text-nav, built once in the layout so every admin page inherits it.
- **FR-005**: The sidebar MUST visually indicate the currently active nav item, and the existing authentication check in the protected admin layout MUST remain exactly as-is — the sidebar is added around it, not in place of it.
- **FR-006**: Sign-out MUST continue to invoke the existing sign-out behavior unchanged — only the styling of its trigger changes.
- **FR-007**: The admin dashboard landing page MUST render within the new styled shell.
- **FR-008**: The leads list MUST render as a styled table with styled status-change and delete controls per row, with the underlying status-change and delete behavior unchanged.
- **FR-009**: The articles list MUST render its existing translation-group-based grouping as styled rows/cards, with EN/AR per-language state shown as badges, the "Add \<language\> version" affordance, and per-row edit/delete/preview actions (preview shown only for published articles) restyled — grouping logic and all links unchanged.
- **FR-010**: The article create/edit form MUST render with styled fields, buttons, and section grouping, covering the cover-image control, the Markdown body editor with inline-image insert, the related-project/related-solution selects, and inline error display — with all existing form state, actions, and the client-safe related-solutions import remaining exactly as-is.
- **FR-011**: The projects list MUST render as a styled table/cards showing a cover thumbnail, title, category, and featured/showcase badges, with row actions restyled and underlying data and links unchanged.
- **FR-012**: The project create/edit form MUST render fully restyled — canonical fields, the three image-upload controls, EN/AR content sections, the system-cards and results repeatable-row builders, and the chip inputs — with the transactional save, the fan-out assembly, the shared-structure builders, and all form state remaining byte-for-byte unchanged; only presentation changes.
- **FR-013**: No public route, shared public shell component, other public component, or public styling MUST be changed by this feature. The restyle is scoped to admin surfaces only.
- **FR-014**: This feature MUST NOT introduce any new npm dependency or component library.
- **FR-015**: This feature MUST NOT require any schema change or database migration.
- **FR-016**: This feature MUST NOT change any Server Action, DAL function, auth call, or business rule — verifiable by review showing the changed files are limited to JSX/`className` edits and new presentational component files, with no logic changes to `lib/db/*`, `lib/auth*`, `lib/actions/*`, or any Server Action body.
- **FR-017**: The existing server-only import guard MUST continue to pass after this feature is implemented — no client component may newly import a server-only module. If it fails, that is a real regression to fix, not to bypass.
- **FR-018**: `npm run check`, `npm run lint`, and `npm run build` MUST all complete with zero errors after this feature is implemented.
- **FR-019**: This feature MUST be verified, prior to being considered complete, by exercising every admin flow (sign in/out; lead status-change and delete; article create/edit/publish/delete including EN↔AR pairing and image uploads; project create/edit/delete including all three images, system cards, results, and both languages) on the deployed environment with the browser console open, confirming no console errors and no behavior change — not solely via a local build.

### Key Entities

*(No new or changed data entities. This feature is presentational only; it reads and displays the existing Lead, Article, and Project data exactly as already modeled — no attributes, relationships, or persistence are introduced or altered.)*

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every admin page (dashboard, leads, articles list/form, projects list/form) displays a persistent sidebar with all four navigation destinations plus sign-out, and a professional neutral light-mode appearance, on 100% of admin pages.
- **SC-002**: 100% of previously-working admin operations (sign in/out; lead status-change and delete; article create/edit/publish/delete with EN↔AR pairing and image uploads; project create/edit/delete with all three images, system cards, results, and both languages) complete successfully after the restyle, verified on the deployed environment.
- **SC-003**: Zero browser console errors occur on any admin page after the restyle, verified on the deployed environment with the console open throughout every flow.
- **SC-004**: Zero new runtime dependencies are introduced (dependency manifest shows no additions).
- **SC-005**: 100% of code changes for this feature are presentational (new presentational component files plus JSX/`className` edits) — no changes to data-access, action, auth, or schema logic, confirmed by review of the complete change set.
- **SC-006**: A published article and a published project, created or edited through the restyled admin, continue to render correctly on the public site, and a draft article's public URL continues to return not-found — with zero change to any public-facing route, component, or styling.
- **SC-007**: `npm run check`, `npm run lint`, and `npm run build` each exit with zero errors after the restyle is complete.

## Assumptions

- The admin area is functional end-to-end today; only its appearance is plain. This feature does not fix behavioral bugs — none are open in admin behavior after the prior env-leak and deploy fixes — it restyles existing, working functionality.
- The admin is English-only and used internally; light mode only is acceptable, and no dark mode or theme toggle is required.
- The existing admin file structure (pages under the protected admin route group, the existing shell, and the form/action/data-access split) remains as-is; only the presentation layer is added on top.
- The deployed environment used for verification is already in a correct, working state (dependencies installed, prior env-leak fixed), so this feature's verification is a comparison against that known-good baseline, not a fresh bring-up.
- Out of scope for this feature (deferred to separate, later efforts): the public-site visual refresh, any component library adoption, dark mode/theming, any new admin capability or field, and the cutover runbook (redirects, migration, DNS, indexing flip).
