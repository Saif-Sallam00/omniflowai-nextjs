# Admin Leads View — Phase 2, Slice 1

**Status:** Draft (pending operator approval)
**Version:** 0.1
**Related decisions:** 001–013, amendments 008.1/008.2/011.1
**Depends on:** Phase 0 (auth, `(protected)` layout, `leads` schema), Phase 1 (contact form + newsletter producing lead rows)
**Extraction source:** `docs/phase-2-admin-extract.md` §1

## Overview

The first admin CRUD slice: a read-and-triage view of leads inside the authenticated admin area. It renders every lead captured by Phase 1's contact form and newsletter signup, lets the admin change a lead's status and delete a lead, and filter the list by status. It establishes the admin shell (navigation chrome under the `(protected)` group) that the articles and projects slices will reuse.

Leads are inbound-only. There is no create or edit-content path — the public forms are the only writers of new rows. This slice adds status mutation and deletion, nothing more.

## Problem statement

Phase 1 writes leads to the database but there is no way to see them. The admin currently has only the Phase 0 placeholder dashboard. This slice makes captured leads visible and triageable, and in doing so stands up the reusable admin navigation and the read/mutation patterns (direct Drizzle reads in Server Components, Server-Action mutations with auth re-checks and path revalidation) that slices 2 and 3 depend on.

## Architectural divergences from OLD (intentional)

The OLD admin (`docs/phase-2-admin-extract.md` §1) is the UX reference, but three mechanisms change to match this project's locked architecture:

- **Reads:** OLD fetched `/api/leads` via React Query. NEW reads Drizzle directly in a Server Component — no JSON API layer for the app's own frontend (constitution P-05).
- **Mutations:** OLD used `PATCH`/`DELETE` REST routes. NEW uses Server Actions for status change and delete — no REST endpoints for first-party admin mutations.
- **Filtering:** OLD had none. NEW filters by a URL search param so the list stays a Server Component and the filtered view is linkable.

## User stories

### US-1 — Admin can see all leads
As the admin, I can open the leads view and see every captured lead, newest first, so I can review inbound interest.

### US-2 — Admin can filter by status
As the admin, I can filter the list to `new`, `read`, or `archived` (or view all), so I can focus on untriaged leads.

### US-3 — Admin can change a lead's status
As the admin, I can move a lead between `new`/`read`/`archived` inline, so I can track which leads I've handled.

### US-4 — Admin can delete a lead
As the admin, I can delete a lead behind a confirmation step, so I can remove spam or test rows.

### US-5 — Downstream slices inherit the admin shell
As the developer of slices 2 and 3, I inherit a working admin navigation and the read/mutation patterns, so I don't re-solve admin-shell problems per slice.

## Functional requirements

### FR-1 — Admin shell
- FR-1.1: The `(protected)` layout MUST render admin navigation chrome linking the admin sections. In this slice: Dashboard (`/admin`) and Leads (`/admin/leads`). The nav MUST be structured so later slices add links without redesign.
- FR-1.2: The nav MUST indicate the current section.
- FR-1.3: A sign-out control MUST remain reachable from within the shell (Phase 0 already provides the sign-out Server Action; this slice ensures it stays accessible as nav grows).
- FR-1.4: The admin shell MUST NOT import or render `SiteShell` or any public marketing chrome (nav/footer). Admin chrome is separate. (Memory/standing rule: SiteShell is scoped to public route groups only.)
- FR-1.5: Admin pages are auth-gated and dynamically rendered. This MUST NOT affect the static rendering of any public route group.

### FR-2 — Leads list (read)
- FR-2.1: `/admin/leads` (`app/admin/(protected)/leads/page.tsx`) MUST be a Server Component that reads leads directly via Drizzle through a DAL query function (see FR-6), never via an HTTP fetch to an internal route.
- FR-2.2: Leads MUST be ordered newest-first (`created_at DESC`).
- FR-2.3: Each lead MUST render: display name (name, falling back to email), source badge (`contact`/`newsletter`), status badge (`new`/`read`/`archived`), service (if present), email as a `mailto:` link, phone (if present), company (if present), message (if present), and a localized created-at timestamp.
- FR-2.4: A long message MUST be collapsible/expandable in place (no separate detail route), matching OLD behavior.
- FR-2.5: The view MUST show a total count reflecting the current filter.
- FR-2.6: The view MUST render an empty state distinguishing "no leads at all" from "no leads match this filter."
- FR-2.7: No pagination in this slice (deferred, FR-Out). All matching rows render.

### FR-3 — Status filter
- FR-3.1: The list MUST support filtering by status via a URL search param (e.g. `?status=new`). Absent/invalid param = show all.
- FR-3.2: Filter controls MUST reflect the active filter and MUST be plain links/navigation (server-rendered), keeping the page a Server Component.
- FR-3.3: An invalid status value in the URL MUST fall back to "all," not error.

### FR-4 — Status mutation
- FR-4.1: Changing a lead's status MUST go through a Server Action, not a REST route.
- FR-4.2: The action MUST validate the incoming status against `lead_status_enum` via Zod (`new`/`read`/`archived`) before writing. Invalid input MUST be rejected without a DB write.
- FR-4.3: The action MUST call `requireAuth()` itself — it MUST NOT rely on the `(protected)` layout as its only guard (constitution: auth enforced inside the Server Action, FR-6.8 Phase 0).
- FR-4.4: On success the action MUST revalidate `/admin/leads` so the list reflects the change.
- FR-4.5: A status change on a nonexistent lead id MUST fail safely (no crash; surfaced as a handled error).

### FR-5 — Delete mutation
- FR-5.1: Deleting a lead MUST go through a Server Action behind an explicit confirmation step (a client confirmation island invoking the action).
- FR-5.2: The action MUST call `requireAuth()` itself (same rule as FR-4.3).
- FR-5.3: On success the action MUST revalidate `/admin/leads`.
- FR-5.4: Deleting a nonexistent id MUST fail safely.

### FR-6 — Data access layer
- FR-6.1: Lead reads and mutations MUST live in a DAL module (e.g. `lib/db/queries/leads.ts`), not inline in the page/component. This establishes the query-module pattern slices 2 and 3 reuse.
- FR-6.2: The read function MUST accept an optional status filter and return rows newest-first.

### FR-7 — Quality gate
- FR-7.1: `npm run check`, `npm run lint`, `npm run build` MUST all exit zero before the slice is accepted.

## Out of scope (deferred)

- **Pagination / infinite scroll** — deferred until lead volume justifies it (YAGNI). OLD has none; a contact form won't produce paginate-worthy volume near-term.
- **Search** — deferred.
- **Lead detail route** — inline expand suffices (matches OLD).
- **Create/edit lead content** — leads are inbound-only.
- **Bulk actions, CSV export** — future, if requested.
- **Notifications on new lead** — out of scope.
- **Articles/projects CRUD, image upload** — later slices.

## Assumptions

- The `(protected)` layout and `requireAuth()` from Phase 0 work and gate `/admin/*` correctly.
- The `leads` table matches `data-model.md` / FR-3.1 (confirmed unchanged in extraction §1.5).
- Admin is English-only; no `/ar` admin routes (bilingual architecture governs public pages only).
- Real lead rows exist from Phase 1 to verify against; if none, a couple can be produced via the live contact form during verification.

## Acceptance criteria

1. **AC-1: Shell + nav.** The `(protected)` area shows admin navigation with Dashboard and Leads links, current-section indication, and a reachable sign-out. No public marketing chrome (SiteShell) appears in admin.
2. **AC-2: List renders.** `/admin/leads` lists all leads newest-first, each showing the fields in FR-2.3, read via direct Drizzle (no internal HTTP fetch). Total count shown.
3. **AC-3: Message expand.** A long message collapses and expands in place.
4. **AC-4: Empty states.** With zero leads, the "no leads" state shows; with a filter matching nothing, the "none match" state shows.
5. **AC-5: Filter.** `?status=new|read|archived` narrows the list and updates the count; no/invalid param shows all; the active filter is indicated.
6. **AC-6: Status change.** Changing a lead's status persists, the list reflects it after revalidation, and the value is enum-validated (an out-of-enum value is rejected with no write).
7. **AC-7: Delete.** Deleting a lead requires confirmation, removes the row, and the list reflects it after revalidation.
8. **AC-8: Action-level auth.** The status and delete Server Actions independently enforce auth — invoking either without a valid session does not mutate data (verified by reasoning/inspection or a direct unauthenticated invocation attempt).
9. **AC-9: Public rendering intact.** Public route groups remain statically rendered; the admin subtree's dynamic rendering has not bled into them.
10. **AC-10: Quality gate.** `check`, `lint`, `build` all exit zero.

## Notes for `/plan`

- Confirm the idiomatic App Router mechanism for the inline status control invoking a Server Action (small client island vs. form auto-submit) — behavior is specified; mechanism is a plan choice.
- Confirm `revalidatePath` vs `revalidateTag` for the list refresh; `revalidatePath('/admin/leads')` is the expected default.
- Decide the DAL module path (`lib/db/queries/leads.ts` suggested) so slices 2–3 follow the same convention.
