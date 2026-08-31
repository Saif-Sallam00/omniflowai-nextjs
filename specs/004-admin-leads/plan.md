# Implementation Plan: Admin Leads View — Phase 2, Slice 1

**Branch**: `004-admin-leads` | **Date**: 2026-08-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-admin-leads/spec.md`, itself built directly from the pre-approved `docs/leads-slice-spec.md`.

## Summary

Deliver the first admin CRUD slice: a read-and-triage view at `/admin/leads` showing every lead captured by Phase 1's public contact form and newsletter signup, with a URL-driven status filter, an inline status-change control, and a confirmed delete — plus the admin navigation shell (Dashboard/Leads, current-section indication, reachable sign-out) that slices 2 and 3 (articles, projects) will extend. All five of the operator's research items resolve to the *simplest* mechanism that satisfies the spec's fixed behavior, with **zero new dependency**: a plain `<form action>` bound to a Server Action for status changes (no client component), native `<details>/<summary>` for message expand (no client component), `revalidatePath('/admin/leads')` after each mutation, the existing flat `lib/db/leads.ts` extended in place (not a new `lib/db/queries/` directory), and a small `"use client"` nav component reusing this codebase's already-shipped `usePathname()`-active-link pattern (`components/site-header.tsx`). The one Client Component this slice actually needs is the delete-confirmation form, because a native `<form>` has no built-in "are you sure" step (research.md).

## Technical Context

**Language/Version**: TypeScript (strict mode) on Next.js 16.3.1 App Router — unchanged from Phase 0/1/1D.

**Primary Dependencies**: none added. Uses only what Phase 0/1/1D already ship — `next` (Server Actions, `revalidatePath`, `usePathname`), `react` (`useFormStatus` for the delete button's pending state), `drizzle-orm` (the existing `leads` table/enums), `zod` (status validation) — no new package (research.md, Dependency check).

**Storage**: Neon Postgres via the existing pooled Drizzle connection (`lib/db/index.ts`, unchanged). Zero schema changes, zero migrations — `leads`, `lead_status_enum`, `lead_source_enum` already exist unchanged from Phase 0/1D (spec Assumptions; data-model.md).

**Testing**: No automated test framework introduced by this slice, consistent with prior slices' own deferral (1A/1B). FR-018/FR-022 (independent per-action auth re-checks) are exactly the kind of security-sensitive logic constitution P-22 calls out for automated coverage where practical — but this project has not yet adopted a test framework, and adding one solely for this slice would be a new dependency this slice's hard constraint explicitly forbids introducing silently. Verification for the auth-recheck paths instead follows the spec's own accepted method (AC-8: "verified by reasoning/inspection or a direct unauthenticated invocation attempt"), captured as manual steps in `quickstart.md`. Adopting a test framework project-wide remains an explicit operator decision, not one this plan makes unasked.

**Target Platform**: Replit Autoscale — unchanged.

**Project Type**: web-service — unchanged; same single Next.js App Router project.

**Performance Goals**: Not load-bearing for this slice. `FR-012` deliberately renders every matching row with no pagination — acceptable at the lead volumes a contact form realistically produces near-term (spec Out-of-scope, YAGNI), not a performance target to hit.

**Constraints**:
- **No new dependency** (operator hard constraint, restated from the spec's own scope discipline): confirmed satisfied — every mechanism in research.md's five decisions already exists in this codebase.
- **Server Actions only for mutations, no REST route** (FR-016/FR-021, constitution P-05) — no `/api/leads` is added.
- **Each mutation independently calls `requireAuth()`** (FR-018/FR-022, constitution: "Authorization is enforced inside Server Components, Server Actions, Route Handlers, and the DAL — never solely in `proxy.ts`") — neither Server Action relies on `(protected)/layout.tsx` having already gated the page.
- **Status validated against the DB enum via Zod before any write** (FR-017) — `z.enum(leadStatusEnum.enumValues)`, so the Zod schema can never drift from the actual `lead_status_enum` values (constitution P-08: "Zod validation at HTTP/action boundaries complements, not replaces, DB integrity" — the DB enum is the source of truth this schema is derived from, not a parallel hand-maintained list).
- **Filter is a URL search param, not client state** (FR-013/FR-014) — `/admin/leads` stays a Server Component even when filtered.
- **`revalidatePath('/admin/leads')` after each mutation** (FR-019/FR-023, research.md Decision 3).
- **Admin chrome MUST NOT import `SiteShell` or public marketing chrome** (FR-004) — the new admin nav lives inside `app/(en)/admin/(protected)/`, never in the shared top-level `components/` directory `SiteShell` occupies.
- **Admin's dynamic rendering MUST NOT bleed into public route groups** (FR-005) — structurally guaranteed: `(protected)` is nested under `app/(en)/admin/`, which no public route imports (verified in quickstart.md via the build's route table).
- **Leads are inbound-only** (FR-027) — no create/edit-content path is introduced; only `status` (via update) and row existence (via delete) can change.
- **Naming/style conventions carried forward** (spec Assumptions): kebab-case files, default-export page/layout modules, verb-first named exports, `type` aliases (not `interface`), `@/*` alias only, TypeScript strict — applied throughout Project Structure below.

**Scale/Scope**: One new route (`/admin/leads`), two new Server Actions, three new exports on an existing DAL module, one new nav component, one new small delete-confirmation Client Component, one modified layout, one lightly-modified dashboard page. No new top-level directory.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Constraint | Status | Notes |
|---|---|---|
| I. Diagnosis Before Solution | PASS | All five research decisions are grounded in either the spec's own explicit "left open for planning" wording (DAL path), direct inspection of the current repo state (existing `lib/db/leads.ts`, `components/site-header.tsx`'s `usePathname()` precedent, `(protected)/layout.tsx`'s current contents), or Next.js's own documented `.bind()` pattern already used in 1D (research.md) — nothing assumed or invented. |
| II. Locked Decisions Are Locked | PASS | No locked decision reopened. Phase 0's `requireAuth()`, `(protected)` layout, and the `leads` table/enums (1D) are reused entirely unchanged. |
| III. Verify Before Declaring Done | PASS (deferred to implementation) | `quickstart.md` maps 1:1 to every acceptance scenario and success criterion in spec.md, including the two action-level auth checks (AC-8) via the spec's own accepted "reasoning/inspection or direct invocation attempt" method. |
| IV. Scope Discipline | PASS | Zero new dependencies (Technical Context, research.md Dependency check). No pagination, search, detail route, bulk actions, CSV export, or new-lead notifications — all explicitly named as deferred in spec Assumptions, none introduced here. The one nav-shell change (moving sign-out into a shared component) is required by FR-001/FR-003, not adjacent cleanup. |
| V. URL Preservation as Default | N/A | This slice's one new route, `/admin/leads`, is a net-new authenticated admin URL with no public-facing equivalent — standing rule 002 governs the *public* route inventory (SEO/link-equity preservation), which this slice does not touch. No exception entry needed. |
| VI. Security Is Not Convenience | PASS | Both new Server Actions call `requireAuth()` as their first statement (FR-018/FR-022), independently of `(protected)/layout.tsx` — this slice is a direct, literal implementation of the constitution's own sentence: "Authorization is enforced inside Server Components, Server Actions, Route Handlers, and the DAL — never solely in `proxy.ts`." No new auth mechanism, no session/cookie handling touched. |
| VII. Bilingual By Architecture | N/A | Admin is English-only (spec Assumptions, unchanged from Phase 0 — no `/ar/admin/*` exists or is planned). This slice touches no public, bilingual route. |
| Runtime constraints (Next.js/Node/TS/ESLint) | PASS | No version changes. Strict TS and the existing ESLint config apply unchanged to all new/modified files. Two small `"use client"` components (`admin-nav.tsx`, the delete-confirmation form) — both `"Client Components by necessity"` (P-02): one needs `usePathname()`, the other needs a `confirm()`-gated `onSubmit`; neither is reachable as a plain Server Component. |
| Database constraints (P-08) | PASS | Zero schema change. The Zod status schema (`z.enum(leadStatusEnum.enumValues)`) is *derived from* the existing DB enum, not a hand-maintained parallel list — "Zod validation at the action boundary complements, not replaces, DB integrity" exactly as P-08 requires; the DB enum itself is the ultimate backstop against an out-of-range value ever being persisted. |
| One DB, direct access, no JSON API (P-05) | PASS | `/admin/leads` reads via a direct Drizzle call in a Server Component through `lib/db/leads.ts`; both mutations are Server Actions. No `/api/leads` route exists or is added. |
| Atomic mutations (P-15) | N/A | Neither `updateLeadStatus` nor `deleteLead` is a check-then-write across multiple statements — each is one `UPDATE ... RETURNING` or one `DELETE ... RETURNING`, atomic by virtue of being a single SQL statement. No transaction wrapper is needed or added. |
| Required secrets fail-fast (P-13) | N/A | No new environment variable is introduced by this slice. |
| Automated tests for security-sensitive logic (P-22) | Deferred, flagged (see Technical Context/Testing) | The two auth re-checks are exactly the kind of logic P-22 names, but this project has not adopted a test framework, and doing so here would itself be a new dependency the operator's hard constraint forbids introducing silently. Verified manually per spec AC-8's own accepted method instead (quickstart.md). |

**Result**: No violations. Complexity Tracking table below is not needed — every "N/A" row above is a principle that plainly does not apply to this slice's scope (no public URL, no bilingual surface, no multi-statement mutation, no new secret), not a gate this slice fails to clear.

**Post-design re-check**: `data-model.md` and `contracts/server-actions.md` introduce no entity, dependency, or route beyond what FR-001–FR-028 and the five research decisions already specify — they formalize the spec's own requirements plus the two exact function signatures (`updateLeadStatusAction`, `deleteLeadAction`) research.md's Decision 1 already determined were necessary, and the one nav component Decision 5 determined was necessary. Constitution Check result stands unchanged: PASS, no violations.

## Project Structure

### Documentation (this feature)

```text
specs/004-admin-leads/
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
app/(en)/admin/
├── auth/                              # UNCHANGED (Phase 0) — sign-in page, actions.ts, login-form.tsx
└── (protected)/
    ├── layout.tsx                     # MODIFIED — still calls requireAuth() first (unchanged); now
    │                                   # renders <AdminNav>{children}</AdminNav> instead of returning
    │                                   # {children} directly (FR-001–FR-004)
    ├── admin-nav.tsx                  # NEW — "use client". Dashboard/Leads links, usePathname()-based
    │                                   # active-section highlight (mirrors components/site-header.tsx's
    │                                   # existing pattern), renders the sign-out form (moved here from
    │                                   # page.tsx below). Named export, matching this repo's non-page
    │                                   # component convention (sign-out-button.tsx, login-form.tsx).
    ├── page.tsx                       # MODIFIED — dashboard content unchanged; its own inline
    │                                   # <form action={signOutAction}> is removed (now lives in
    │                                   # admin-nav.tsx, rendered by the layout on every admin page)
    ├── actions.ts                     # UNCHANGED — still only signOutAction
    ├── sign-out-button.tsx            # UNCHANGED — still imported by admin-nav.tsx now instead of page.tsx
    └── leads/
        ├── page.tsx                   # NEW — default export. Server Component. Reads searchParams,
        │                               # validates status, calls listLeads(status), renders count,
        │                               # filter links, empty states, and one row per lead (message via
        │                               # native <details>/<summary>, status via a plain bound-action
        │                               # <form>, delete via <DeleteLeadForm>)
        ├── actions.ts                 # NEW — "use server". updateLeadStatusAction, deleteLeadAction.
        │                               # Both call requireAuth() first, independent of the (protected)
        │                               # layout (FR-018/FR-022)
        └── delete-lead-form.tsx       # NEW — "use client". The one Client Component this route needs:
                                        # wraps a <form action={...}> with an onSubmit confirm() guard
                                        # (FR-021) and a useFormStatus-driven pending submit button.
                                        # Named export, verb-free component-name convention matching
                                        # sign-out-button.tsx/login-form.tsx.

lib/db/
├── leads.ts                           # MODIFIED (not replaced) — adds listLeads, updateLeadStatus,
│                                       # deleteLead alongside the existing Lead / createLead /
│                                       # createNewsletterLead (1D, unchanged, still used by the public
│                                       # contact form and newsletter Server Actions)
├── articles.ts / portfolio.ts         # UNCHANGED (1C)
└── schema.ts                          # UNCHANGED — leadStatusEnum, leadSourceEnum, leads table already
                                        # exist exactly as this slice needs (data-model.md)

lib/auth-server.ts                     # UNCHANGED — requireAuth() reused as-is by both new Server Actions

components/                             # UNCHANGED — site-shell.tsx, site-header.tsx, etc. (public-only,
                                        # 1B/1D) are not imported by anything in this slice (FR-004).
                                        # site-header.tsx's usePathname()-active-link pattern is reused
                                        # as a precedent, not imported, by the new admin-nav.tsx.

app/(en)/(public)/*, app/ar/**          # UNCHANGED — no public route group is touched by this slice.

next.config.ts / proxy.ts / drizzle.config.ts / package.json / tsconfig.json / eslint.config.mjs  # UNCHANGED
```

**Structure Decision**: No new top-level directory. The admin nav shell and the delete-confirmation form live inside the existing `app/(en)/admin/(protected)/` tree rather than the shared top-level `components/` directory, because — unlike the public `SiteShell` (shared across two language trees) — admin has exactly one tree and no sharing need; keeping admin chrome physically inside the admin route tree makes FR-004's "must not import public chrome" separation structural rather than just a matter of discipline (research.md, Decision 5). Lead-specific mutations get their own `leads/actions.ts`, co-located with `leads/page.tsx`, mirroring this repo's existing convention of co-locating a route's Server Actions with it (`admin/auth/actions.ts`, `admin/(protected)/actions.ts`). All new/modified `lib/db/leads.ts` exports are verb-first named exports returning `type`-aliased shapes, matching the file's own existing style from 1D.

## Complexity Tracking

*No entries — Constitution Check reported no violations requiring justification.*
