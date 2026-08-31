# Quickstart: Admin Leads View (Phase 2, Slice 1)

Validation guide for confirming this slice is complete. Maps to `spec.md`'s User Story acceptance scenarios and Success Criteria SC-001–SC-010. See `data-model.md` for type/function shapes and `contracts/server-actions.md` for per-action behavior — not duplicated here.

## Prerequisites

- Phase 0 (auth, `(protected)` layout) and Phase 1/1D (contact form + newsletter writing `leads` rows) already shipped and passing their own quickstarts.
- Local dev server running (`npm run dev`) or the target deployment reachable, with a valid admin session (sign in at `/admin/auth`).
- No new environment variables, no new dependency, no schema change or migration — this slice adds none.
- A known mix of lead rows to test against: at least one `new`, one `read`, and one `archived` lead, plus at least one lead with no `name` (to check the email fallback) and one with a long `message` (to check expand). If none exist, produce a couple via the live public `/contact` form and the footer newsletter signup (spec Assumptions), then manually vary their `status` for filter testing before this checklist is run end-to-end.

## Setup

1. **Run the quality gate** (unchanged commands):
   ```
   npm run check   # tsc --noEmit
   npm run lint    # eslint-config-next/core-web-vitals
   npm run build   # next build
   ```
   All three MUST exit zero (FR-028/SC-010).

2. No migrations, no new secrets, no admin bootstrap step.

## Verification steps (map to User Stories & Success Criteria)

| Check | Command / Action | Expected |
|---|---|---|
| All leads visible, newest-first (US1 AC1) | Sign in, open `/admin/leads` with no filter | Every known lead row renders, ordered newest capture time first |
| Required fields per row (US1 AC1) | Inspect one row of each source (`contact`, `newsletter`) | Display name (name, or email when name is null), source badge, status badge, service/phone/company/message shown only when present, email as a working `mailto:` link, human-readable timestamp |
| Name fallback to email (Edge Case) | Inspect a newsletter-sourced lead (name is `null` in the DB) | Display name shown is the lead's email, not blank and not "null" |
| Long message expands in place (US1 AC2 / SC-009) | Find a lead with a long message; click to expand, then collapse | Message starts collapsed; expands and re-collapses in the same row, no navigation, no full page reload |
| Total count shown, matches rows (US1 AC4) | Compare the shown count to the number of rendered rows with no filter active | Equal |
| Direct DB read, no internal fetch (US1 AC4) | Inspect `app/(en)/admin/(protected)/leads/page.tsx` and network requests while loading the page | No `fetch` to any internal `/api/*` route for lead data; the page is a Server Component calling `listLeads` directly |
| "No leads at all" empty state (US1 AC3 / SC-008) | Temporarily point at an empty `leads` table (or verify by inspection/reasoning if seeding an empty state isn't practical against real data) | Distinct "no leads" copy renders, not the "no match" copy |
| Filter narrows the list (US2 AC1) | Click the "New" filter | URL becomes `/admin/leads?status=new`; only `new`-status leads render; shown count matches; "New" is visibly indicated as active |
| No filter shows all (US2 AC2) | Visit `/admin/leads` directly (no query string) | All leads render regardless of status; "All" indicated as active |
| Invalid filter falls back to all (US2 AC3 / SC-002) | Visit `/admin/leads?status=bogus` | No error; behaves identically to no filter; "All" indicated as active, not "bogus" |
| "No leads match this filter" empty state (US2 AC4 / SC-008) | Filter to a status with zero current leads (while other-status leads exist) | Distinct "none match this filter" copy renders, not the "no leads at all" copy |
| Status change persists (US3 AC1 / SC-003) | On one lead, change status via its inline control, submit | Page reflects the new status without a manually-triggered full reload; re-visiting `/admin/leads` confirms the change persisted |
| Invalid status rejected (US3 AC2 / SC-003) | Attempt to invoke `updateLeadStatusAction` directly with a value outside `new`/`read`/`archived` (e.g. via a modified request, or by reasoning/inspection of the Zod guard in `leads/actions.ts`) | Rejected before any DB write; no row's status changes |
| Action-level auth: status change (US3 AC3 / SC-005) | Without a valid admin session (e.g. a fresh incognito context, or by inspecting/reasoning that `requireAuth()` runs first in `updateLeadStatusAction`), attempt to invoke the action | No data is mutated |
| Status change on missing id fails safely (US3 AC4) | Attempt a status change bound to a lead id that no longer exists (e.g. delete a lead in one tab, then submit a stale status form for it from another) | No crash; the view still renders normally afterward |
| Delete requires confirmation (US4 AC1/AC2) | Click delete on a known test lead; confirm | Lead is removed, count decreases; if the confirmation is instead cancelled, the lead remains |
| Action-level auth: delete (US4 AC3 / SC-005) | Same approach as the status-change auth check, applied to `deleteLeadAction` | No data is deleted without a valid session |
| Delete on missing id fails safely (US4 AC4) | Attempt to delete a lead id that no longer exists (e.g. double-submit, or delete twice in two tabs) | No crash; the view still renders normally afterward |
| Admin nav present, current section indicated (US5 AC1) | Visit `/admin` then `/admin/leads` | Same nav chrome on both; "Dashboard" indicated active on `/admin`, "Leads" indicated active on `/admin/leads` |
| Sign-out reachable from shell (US5 AC2) | From `/admin/leads`, locate and use sign-out | Session ends, redirected to `/admin/auth` — reachable without navigating back to the dashboard first |
| No public marketing chrome in admin (US5 AC3 / SC-006) | Inspect the rendered markup of `/admin` and `/admin/leads` | No public header, footer, or nav (`components/site-shell.tsx`) present anywhere |
| Public rendering unaffected (US5 AC4 / SC-007) | Inspect `next build`'s route table | Public routes (`/`, `/about`, `/solutions`, `/articles`, `/portfolio`, `/contact`, and their `/ar/*` counterparts) show unchanged static/ISR markers; `/admin` and `/admin/leads` are the only routes newly marked dynamic by this slice's own pages (the admin subtree was already dynamic from Phase 0) |
| No new dependency introduced (hard constraint) | `git diff package.json` (or inspect `package.json` before/after this slice) | No new entries — this slice uses only `next`, `react`, `drizzle-orm`, `zod`, already present |
| Existing Phase 0/1/1D behavior unaffected | Re-run the contact form and newsletter signup end-to-end (1D's own quickstart) | Both still write `leads` rows correctly; the new admin view shows them |

## Done when

All rows above pass, all five User Stories' acceptance scenarios and SC-001–SC-010 hold (spec.md), and Phase 0/1/1D's own quickstart checks still pass unchanged.
