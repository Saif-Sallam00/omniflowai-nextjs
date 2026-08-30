# Feature Specification: Admin Leads View (Phase 2, Slice 1)

**Feature Branch**: `004-admin-leads`

**Created**: 2026-08-30

**Status**: Draft

**Input**: User description: "Phase 2, Slice 1 — Admin Leads View: read-and-triage admin view for leads captured by the contact form and newsletter, with status filter, status change, and delete via Server Actions. Authoritative source: docs/leads-slice-spec.md (approved)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin sees every captured lead (Priority: P1)

As the admin, I open the leads view and see every lead captured by the public contact form and newsletter signup, newest first, so I can review inbound interest.

**Why this priority**: This is the foundational value of the slice — until captured leads are visible at all, there is nothing to filter, triage, or clean up. Every other story in this slice depends on the list existing.

**Independent Test**: Can be fully tested by signing in as admin, opening the leads view with a known set of lead rows in the database, and confirming every row renders newest-first with its expected fields — independent of filtering, status-change, or delete behavior.

**Acceptance Scenarios**:

1. **Given** one or more leads exist, **When** the admin opens the leads view, **Then** every lead renders ordered newest-first by capture time, each showing: a display name (the lead's name, falling back to its email when no name was captured), a source indicator (contact or newsletter), a status indicator (new, read, or archived), the requested service when present, the email as a clickable `mailto:` link, the phone when present, the company when present, the message when present, and a human-readable capture timestamp.
2. **Given** a lead has a long message, **When** the admin views the list, **Then** the message renders collapsed by default and can be expanded and re-collapsed in place, without navigating to a separate page.
3. **Given** no leads exist anywhere in the system, **When** the admin opens the leads view, **Then** a "no leads at all" empty state renders.
4. **Given** the leads view is rendered, **When** its data source is inspected, **Then** the leads were read directly from the database (no fetch to an internal HTTP endpoint), and the total count shown matches the number of rows rendered.

---

### User Story 2 - Admin filters the list by status (Priority: P2)

As the admin, I filter the list to `new`, `read`, or `archived` (or view all), so I can focus on untriaged leads without scrolling past everything.

**Why this priority**: Filtering is the first refinement on top of the base list from User Story 1 — valuable once leads accumulate, but meaningless without the list existing first.

**Independent Test**: Can be fully tested by loading the leads view with a mix of statuses present, applying each filter value in turn (including an invalid one) via the URL, and confirming only the matching rows render each time — independent of status-change or delete behavior.

**Acceptance Scenarios**:

1. **Given** leads with a mix of statuses exist, **When** the admin selects the "new" filter, **Then** only leads with status `new` render, the shown total count reflects only those rows, and the active filter is visibly indicated.
2. **Given** the leads view URL carries no status parameter, **When** the page loads, **Then** all leads render regardless of status, and "all" is indicated as the active view.
3. **Given** the leads view URL carries a status value outside `new`/`read`/`archived`, **When** the page loads, **Then** the view falls back to showing all leads rather than producing an error, and the active-filter indicator shows "all."
4. **Given** a filter is applied that matches zero leads (while other leads exist), **When** the page renders, **Then** a "no leads match this filter" empty state renders — distinct from the "no leads at all" state from User Story 1.

---

### User Story 3 - Admin changes a lead's status (Priority: P3)

As the admin, I move a lead between `new`, `read`, and `archived`, so I can track which leads I've handled.

**Why this priority**: Status change is the primary triage action and the main reason this slice exists beyond simple visibility, but it depends on the list (User Story 1) already being viewable.

**Independent Test**: Can be fully tested by changing one known lead's status from the leads view and confirming the new value persists and is reflected in the list — independent of the filter or delete stories.

**Acceptance Scenarios**:

1. **Given** a lead currently has status `new`, **When** the admin changes it to `read`, **Then** the change is saved and the leads view reflects the updated status.
2. **Given** an attempt to set a lead's status to a value outside `new`/`read`/`archived`, **When** that change is attempted, **Then** it is rejected and no write occurs.
3. **Given** no valid admin session exists, **When** a status-change is attempted directly (bypassing the rendered page), **Then** no data is mutated.
4. **Given** a status change targets a lead id that no longer exists, **When** the change is attempted, **Then** it fails safely without crashing the view.

---

### User Story 4 - Admin deletes a lead (Priority: P4)

As the admin, I delete a lead behind a confirmation step, so I can remove spam or test rows.

**Why this priority**: Deletion is a cleanup action, useful once the list and triage flow are in place, and lower-frequency than viewing or status changes.

**Independent Test**: Can be fully tested by deleting one known lead through the confirmation step and confirming it disappears from the list — independent of the filter or status-change stories.

**Acceptance Scenarios**:

1. **Given** a lead exists, **When** the admin initiates delete and confirms, **Then** the lead is removed and no longer appears in the list, and the total count decreases accordingly.
2. **Given** the admin initiates delete but does not confirm, **When** they back out of the confirmation step, **Then** the lead is not removed.
3. **Given** no valid admin session exists, **When** a delete is attempted directly (bypassing the rendered page), **Then** no data is deleted.
4. **Given** a delete targets a lead id that no longer exists, **When** the delete is attempted, **Then** it fails safely without crashing the view.

---

### User Story 5 - Admin uses a consistent, extensible navigation shell (Priority: P5)

As the admin, I see a consistent navigation area across the authenticated admin section — today linking to Dashboard and Leads — with the current section indicated and sign-out always reachable, so that admin sections added later fit into the same navigation without it being redesigned.

**Why this priority**: This is supporting scaffolding rather than a leads-specific capability. It matters for this slice's own usability, but its full payoff (later admin sections reusing it) is only provable once those future sections exist — so it is ranked below the leads-specific stories.

**Independent Test**: Can be fully tested today by visiting the Dashboard and Leads pages while signed in and confirming the same navigation chrome renders with the current section indicated and sign-out reachable, and by inspecting that the navigation structure and the leads data-access module are organized so a new section/query can be added without restructuring either.

**Acceptance Scenarios**:

1. **Given** the admin is signed in, **When** they view any page in the authenticated admin section, **Then** they see navigation linking to Dashboard and Leads, with the current section visually indicated.
2. **Given** the admin is viewing the navigation shell, **When** they look for a way to sign out, **Then** a sign-out control is reachable from within it.
3. **Given** the admin is viewing any admin page, **When** the rendered chrome is inspected, **Then** no public marketing header, footer, or navigation from the rest of the site appears anywhere in the admin section.
4. **Given** the admin section renders dynamically per request (because it is auth-gated), **When** the rest of the site's public pages are checked, **Then** their ability to render as static output is unaffected.

---

### Edge Cases

- A lead with no name shows its email as the display name instead (never a blank name).
- A lead with no service, phone, company, or message simply omits that field rather than showing an empty placeholder.
- A status-filter value in the URL that isn't `new`, `read`, or `archived` falls back to showing all leads rather than erroring.
- A status-change or delete invoked without a valid admin session mutates nothing, regardless of whether the surrounding page happens to be reachable.
- A status-change or delete targeting a lead id that was already removed (or never existed) fails safely — no crash, no partial write.
- Introducing the auth-gated, per-request-dynamic admin section does not change whether any public page elsewhere in the site continues to render as static output.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The authenticated admin section MUST render navigation chrome linking its sections — in this slice, Dashboard and Leads — structured so later slices can add sections without redesigning it.
- **FR-002**: The navigation MUST visually indicate which section is currently active.
- **FR-003**: A sign-out control MUST remain reachable from within the admin navigation as it grows.
- **FR-004**: The admin navigation and surrounding chrome MUST NOT import or render the public site's shared marketing chrome (header/nav/footer) — admin chrome is entirely separate from public chrome.
- **FR-005**: The admin section is auth-gated and renders dynamically per request; this MUST NOT change the static rendering of any public (non-admin) route.
- **FR-006**: The leads view MUST be a server-rendered page that reads lead data directly from the database through a dedicated data-access module — never through a fetch to an internal HTTP endpoint. (The specific module path is a planning-time decision; see Assumptions.)
- **FR-007**: Leads MUST render ordered newest-first by capture time.
- **FR-008**: Each rendered lead MUST include: a display name (name, falling back to email when absent), a source indicator (contact or newsletter), a status indicator (new/read/archived), the requested service when present, the email as a `mailto:` link, the phone when present, the company when present, the message when present, and a human-readable capture timestamp.
- **FR-009**: A long message MUST be collapsible and expandable in place, without a separate detail page or route.
- **FR-010**: The view MUST show a total count reflecting the currently active filter.
- **FR-011**: The view MUST distinguish two empty states: no leads exist at all, versus no leads match the active filter.
- **FR-012**: This slice introduces no pagination — every matching row renders (deferred to a future slice if lead volume ever justifies it).
- **FR-013**: The list MUST support filtering by status via a URL parameter (e.g. `?status=new`); an absent or invalid value MUST show all leads.
- **FR-014**: Filter controls MUST reflect the currently active filter and MUST be implemented as plain, server-rendered navigation (links), not client-side-only filtering — the leads page remains a server-rendered page even when filtered.
- **FR-015**: An invalid status value in the URL MUST fall back to showing all leads rather than producing an error.
- **FR-016**: Changing a lead's status MUST be performed through a server-side mutation operation invoked directly from the page (a Server Action) — not through a REST-style API route.
- **FR-017**: Before any status write, the incoming value MUST be validated against the allowed status set (`new`/`read`/`archived`); an out-of-set value MUST be rejected with no database write.
- **FR-018**: The status-change operation MUST independently verify the caller has a valid admin session at the moment it runs — it MUST NOT rely solely on the surrounding page already being behind authentication.
- **FR-019**: On a successful status change, the leads view MUST reflect the new value without requiring a manual, full page reload initiated by the admin.
- **FR-020**: A status change targeting a nonexistent lead id MUST fail safely (no crash; a handled, surfaced error).
- **FR-021**: Deleting a lead MUST be performed through a server-side mutation operation invoked directly from the page (a Server Action) — not through a REST-style API route — and MUST require an explicit confirmation step before it executes.
- **FR-022**: The delete operation MUST independently verify the caller has a valid admin session at the moment it runs, on the same terms as FR-018.
- **FR-023**: On a successful delete, the leads view MUST reflect the removal without requiring a manual, full page reload initiated by the admin.
- **FR-024**: Deleting a nonexistent lead id MUST fail safely (no crash; a handled, surfaced error).
- **FR-025**: Lead reads and lead mutations (status change, delete) MUST live in one dedicated data-access module, not written inline inside the page or its components, so later admin sections can follow the same pattern.
- **FR-026**: The read function in that data-access module MUST accept an optional status filter and MUST always return rows newest-first.
- **FR-027**: This slice MUST NOT introduce any path to create a new lead or edit a lead's captured content (name, email, phone, company, service, message) — leads are inbound-only; only status and existence (via delete) may change.
- **FR-028**: The project's standard quality gate (type check, lint, production build) MUST pass with zero errors before this slice is considered complete.

### Key Entities

- **Lead**: An inbound record already captured by the Phase 1 contact form or newsletter signup — a display name (name, falling back to email), source (contact/newsletter), status (new/read/archived), and optional service, phone, company, and message, plus a capture timestamp. This slice only changes a lead's status or removes it; it never creates or edits captured content.
- **Status Filter**: A URL-carried view state (`?status=new|read|archived`, or absent/invalid meaning "all") that narrows which leads render, without introducing a separate route or client-only filtering.
- **Admin Navigation Shell**: The chrome for the authenticated admin section — showing the active section and a reachable sign-out — structured to accept additional section links from future admin slices without redesign.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of leads captured by the existing contact form and newsletter signup are visible in the admin leads view, newest-first, with none requiring a separate page to read their full content.
- **SC-002**: The admin can narrow the view to any single status via a shareable URL and see exactly the matching leads every time, with an invalid or missing filter value never producing an error.
- **SC-003**: A status change made by the admin is reflected in the view with no manual full-page reload needed, and zero out-of-enum status values are ever persisted.
- **SC-004**: A confirmed delete removes the lead from the view with no manual full-page reload needed, and zero deletions occur without the confirmation step being completed.
- **SC-005**: Zero status-change or delete attempts made without a valid admin session succeed in mutating data.
- **SC-006**: 100% of pages in the admin section show none of the public site's marketing header, footer, or navigation.
- **SC-007**: Introducing this slice produces zero change in which public (non-admin) pages render as static output.
- **SC-008**: The two empty states (no leads at all vs. no leads matching the active filter) are always distinguishable to the admin — never rendered identically or omitted.
- **SC-009**: A lead with a long message can be read in full, in place, in a single interaction (expand), with no navigation away from the list.
- **SC-010**: The project's quality gate (type check, lint, production build) exits with zero errors.

## Assumptions

- The authenticated admin area and its sign-in enforcement (from Phase 0) already exist and correctly gate the admin section; this slice extends that area's navigation rather than building auth from scratch.
- The lead data captured by Phase 1 (contact form, newsletter signup) already matches the fields listed under **Lead** above; no schema change is introduced by this slice.
- The admin section is English-only; this slice does not add a bilingual admin experience (the bilingual architecture governs public pages only).
- Real lead rows from Phase 1 are available to verify against; if none exist at verification time, a couple can be produced through the live public contact form.
- **Divergences from the prior (reference) admin implementation, intentional for this rewrite**: the reference version fetched leads through an internal HTTP endpoint — this slice reads the database directly from the server-rendered page instead. The reference version used REST-style update/delete endpoints — this slice uses direct server-side mutation operations (Server Actions) instead. The reference version had no status filter at all — this slice adds one, carried entirely in the URL so the page stays server-rendered and the filtered view stays linkable.
- **Deferred, explicitly out of scope for this slice**: pagination/infinite scroll (until lead volume justifies it), search, a separate lead-detail route (in-place expand suffices), bulk actions, CSV export, notifications on new-lead arrival, and anything belonging to the articles/projects admin slices (including image upload).
- **Carried-forward project conventions** (apply to how this slice is implemented, not to its user-facing behavior): kebab-case file names, default-export page/layout modules, verb-first named exports for helper functions, `type` aliases rather than `interface` declarations, the `@/*` path alias exclusively for internal imports, and TypeScript strict mode throughout.
- **Left open for the planning phase**: the exact mechanism for the inline status control invoking its Server Action (a small client-side island vs. a form that auto-submits) — the behavior in FR-016/FR-018/FR-019 is fixed, the mechanism is a planning-time choice; likewise, using `revalidatePath` on `/admin/leads` after each mutation is the expected default, and the data-access module path (`lib/db/queries/leads.ts`) is a suggestion for the planning phase to confirm, not a hard requirement of this spec.
