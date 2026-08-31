---

description: "Task list for Admin Leads View — Phase 2, Slice 1"
---

# Tasks: Admin Leads View — Phase 2, Slice 1

**Input**: Design documents from `/specs/004-admin-leads/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/server-actions.md, quickstart.md

**Tests**: Not requested for this slice (no test framework introduced, per plan.md's Technical Context — consistent with prior slices). Verification is the quality gate plus quickstart.md, referenced directly by task. The two auth-recheck requirements (FR-018/FR-022) are verified per spec AC-8's own accepted method — reasoning/inspection or a direct unauthenticated invocation attempt — not an automated test.

**Organization**: Tasks are grouped by user story (spec.md: US1 see-all P1, US2 filter P2, US3 status-change P3, US4 delete P4, US5 nav shell P5). The `lib/db/leads.ts` DAL extension is Foundational — US1, US3, and US4 each call into it. US5 (nav shell) has no dependency on the DAL and could ship independently of US1–US4; it is sequenced last here to match the spec's own priority order, per plan.md.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Which user story this task belongs to (US1–US5). Setup, Foundational, and Polish tasks carry no story label.

---

## Phase 1: Setup

**Purpose**: Confirm the starting state is clean before any change lands.

- [X] T001 Run the existing quality gate as a baseline (`npm run check`, `npm run lint`, `npm run build`) and confirm it exits zero with only the 6 pre-existing `<img>`-related ESLint warnings — establishes a clean starting point so any later failure is attributable to this slice's own changes, not pre-existing drift.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the existing lead data-access module with the read and two mutations every leads-specific story needs. `lib/db/leads.ts` already exists (Phase 1D) with `Lead`, `createLead`, `createNewsletterLead` — this phase adds to it, it does not create a new module or directory (research.md, Decision 4).

**⚠️ CRITICAL**: US1, US3, and US4 cannot begin until this phase is complete. US5 (nav shell) has no dependency on this phase and may be done at any point.

- [X] T002 In `lib/db/leads.ts`, add three exports alongside the existing `Lead`/`createLead`/`createNewsletterLead` (all unchanged): `listLeads(status?: Lead["status"]): Promise<Lead[]>` — `db.select().from(leads).where(status ? eq(leads.status, status) : undefined).orderBy(desc(leads.createdAt))`; `updateLeadStatus(id: number, status: Lead["status"]): Promise<Lead | null>` — `db.update(leads).set({ status }).where(eq(leads.id, id)).returning()`, returning `lead ?? null`; `deleteLead(id: number): Promise<Lead | null>` — `db.delete(leads).where(eq(leads.id, id)).returning()`, returning `lead ?? null`. Verb-first named exports, `type` aliases only, no new import beyond what `drizzle-orm` and this file's existing imports already provide (data-model.md). No new dependency.
- [X] T003 Foundational sanity check: run `npm run check` — zero errors with the three new DAL exports in place (nothing yet imports them). Confirms T002 is type-correct before any page/action code is built on top of it.

**Checkpoint**: `listLeads`, `updateLeadStatus`, `deleteLead` exist and type-check. US1, US3, and US4 can now proceed (independently of each other, since each calls a different one of these three functions).

---

## Phase 3: User Story 1 - Admin sees every captured lead (Priority: P1) 🎯 MVP

**Goal**: A server-rendered `/admin/leads` page listing every lead, newest-first, with all required fields, message expand, total count, and the "no leads at all" empty state. No filter UI, no status-change control, no delete control yet — those are later stories' additions to this same file.

**Independent Test**: Sign in, open `/admin/leads` with a known set of lead rows, confirm every row renders newest-first with its expected fields, independent of filtering, status-change, or delete behavior (spec.md, US1 Independent Test).

- [X] T004 [US1] Create `app/(en)/admin/(protected)/leads/page.tsx` — default export, `async function` Server Component, no props yet (searchParams handling is US2's addition). Calls `listLeads()` (no argument — every lead, US2 adds filtering later). Renders: a total count (`leads.length`); the "no leads at all" empty state when the array is empty; otherwise one row per lead showing — display name (`lead.name ?? lead.email`), a source badge (`contact`/`newsletter`), a status badge (`new`/`read`/`archived`, display-only for now), `service`/`phone`/`company` when non-null, `email` as `<a href={`mailto:${lead.email}`}>`, a human-readable `createdAt` (e.g. `new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(lead.createdAt)` — admin is English-only, spec Assumptions), and `message` when non-null wrapped in a native `<details><summary>Message</summary><p>...</p></details>` (FR-009, research.md Decision 2 — no client component). Reads `listLeads`/`Lead` from `@/lib/db/leads`. Depends on T002.
- [X] T005 [US1] Verify against spec User Story 1's acceptance scenarios (quickstart.md rows for US1): every lead renders newest-first with correct fields; a newsletter-sourced lead's display name falls back to its email; a long message starts collapsed and expands/re-collapses in place with no navigation; the shown count matches the rendered row count; the leads view has no `fetch` to an internal route (Server Component + direct Drizzle read only); with zero rows in the table, the "no leads at all" empty state renders. Depends on T004.

**Checkpoint**: `/admin/leads` is fully functional as a read-only view. This alone is a shippable, independently valuable increment (spec.md's own framing: "until captured leads are visible at all, there is nothing to filter, triage, or clean up").

---

## Phase 4: User Story 2 - Admin filters the list by status (Priority: P2)

**Goal**: `/admin/leads?status=new|read|archived` narrows the list; absent/invalid values show all; a second empty-state variant distinguishes "no leads match this filter" from US1's "no leads at all."

**Independent Test**: With a mix of statuses present, apply each filter value in turn (including an invalid one) via the URL, confirm only matching rows render each time, independent of status-change or delete behavior (spec.md, US2 Independent Test).

- [X] T006 [US2] Modify `app/(en)/admin/(protected)/leads/page.tsx`: add `searchParams: Promise<{ status?: string }>` as the page's prop, `await` it, and validate the value with `leadStatusEnum.enumValues.includes(value) ? value : undefined` (import `leadStatusEnum` from `@/lib/db/schema`) — an absent or unrecognized value becomes `undefined` ("all"), never an error (FR-013/FR-015). Pass the resolved value to `listLeads(status)` (T004's call site). Add four plain `<Link href="/admin/leads">`/`<Link href="/admin/leads?status=new">` etc. filter controls (All/New/Read/Archived), with the currently-active one visibly indicated by comparing to the resolved `status` (plain server-side conditional className — no client component, FR-014). Replace T004's single empty-state branch with two: when `leads.length === 0 && status === undefined`, show "no leads at all" (US1's state, unchanged); when `leads.length === 0 && status !== undefined`, show "no leads match this filter" (new, FR-011/AC-4). Depends on T004.
- [X] T007 [US2] Verify against spec User Story 2's acceptance scenarios (quickstart.md rows for US2): selecting "New" narrows the list, updates the count, and shows as active; no query string shows all leads with "All" active; `?status=bogus` behaves identically to no filter (falls back to "all," no error, "All" shown active — not "bogus"); filtering to a status with zero current leads (while others exist) shows the "no match" state, distinct from US1's "no leads at all" state. Depends on T006.

**Checkpoint**: Filtering fully works, both empty states are distinguishable, and the page remains a Server Component throughout (no client-side filtering introduced).

---

## Phase 5: User Story 3 - Admin changes a lead's status (Priority: P3)

**Goal**: An inline, per-row status control that persists a change through an independently-authenticated Server Action, validated against the DB enum.

**Independent Test**: Change one known lead's status from the leads view, confirm the new value persists and is reflected in the list, independent of the filter or delete stories (spec.md, US3 Independent Test).

- [X] T008 [US3] Create `app/(en)/admin/(protected)/leads/actions.ts` — `"use server"`. Export `async function updateLeadStatusAction(id: number, formData: FormData): Promise<void>`: call `await requireAuth()` (from `@/lib/auth-server`, unchanged) as the first statement — independent of `(protected)/layout.tsx` already gating the page (FR-018); validate `formData.get("status")` with `z.enum(leadStatusEnum.enumValues).safeParse(...)` (`leadStatusEnum` from `@/lib/db/schema`) and `return` immediately without writing if invalid (FR-017); otherwise call `await updateLeadStatus(id, parsed.data)` (from `@/lib/db/leads`, T002) — its `null`-on-no-match return needs no special handling, the action simply continues (FR-020); finally call `revalidatePath("/admin/leads")` (from `next/cache`) unconditionally (FR-019). No other export in this file yet (US4 adds a second). Depends on T002.
- [X] T009 [US3] Modify `app/(en)/admin/(protected)/leads/page.tsx`: for each lead row, replace the display-only status badge from T004 with a plain `<form action={updateLeadStatusAction.bind(null, lead.id)}>` (import `updateLeadStatusAction` from `./actions`) containing a `<select name="status" defaultValue={lead.status}>` with the three `leadStatusEnum.enumValues` options and a submit button — no client component (research.md, Decision 1). Depends on T008.
- [X] T010 [US3] Verify against spec User Story 3's acceptance scenarios (quickstart.md rows for US3): changing a lead's status via the control persists and is reflected in the list without a manually-triggered full reload; a value outside `new`/`read`/`archived` sent directly to `updateLeadStatusAction` is rejected with no DB write (verify by inspection of T008's Zod guard, or a direct invocation attempt per spec AC-8's accepted method); invoking `updateLeadStatusAction` without a valid admin session mutates nothing (verify by inspection that `requireAuth()` runs first and redirects, or a direct unauthenticated invocation attempt); a status change bound to a since-deleted lead id does not crash the view. Depends on T009.

**Checkpoint**: Status changes work end-to-end, independently re-authenticated, enum-validated, with no REST route involved.

---

## Phase 6: User Story 4 - Admin deletes a lead (Priority: P4)

**Goal**: A confirmed, independently-authenticated delete per row.

**Independent Test**: Delete one known lead through the confirmation step, confirm it disappears from the list, independent of the filter or status-change stories (spec.md, US4 Independent Test).

- [X] T011 [P] [US4] In the existing `app/(en)/admin/(protected)/leads/actions.ts` (T008), add a second export: `async function deleteLeadAction(id: number): Promise<void>` — **no `FormData` parameter** (verified directly against this project's Next 16.3.1/React 19.2.8 typings via a throwaway `tsc --noEmit` probe, not committed: `deleteLeadAction.bind(null, id)` produces `() => Promise<void>`, which satisfies React's `<form action>` prop type as-is — plan.md/data-model.md). Body: `await requireAuth()` first (FR-022, same terms as T008); `await deleteLead(id)` (from `@/lib/db/leads`, T002) — its `null`-on-no-match return needs no special handling (FR-024); `revalidatePath("/admin/leads")` unconditionally (FR-023). Depends on T008 (same file).
- [X] T012 [P] [US4] Create `app/(en)/admin/(protected)/leads/delete-lead-form.tsx` — `"use client"`. Named export `DeleteLeadForm`, prop `{ action: () => Promise<void> }`. Renders `<form action={action} onSubmit={(e) => { if (!window.confirm("Delete this lead?")) e.preventDefault(); }}>` wrapping a submit button; the button's pending/disabled state comes from a small nested `SubmitButton` component using `useFormStatus()` (mirroring this same directory's existing `sign-out-button.tsx` pattern) — this is the one Client Component the leads route needs, since a native `<form>` has no built-in confirmation step (FR-021, research.md). Depends on T002 (needs no new DAL, but is logically part of the delete flow — no file dependency, may be built in parallel with T011).
- [X] T013 [US4] Modify `app/(en)/admin/(protected)/leads/page.tsx`: for each lead row, render `<DeleteLeadForm action={deleteLeadAction.bind(null, lead.id)} />` (import `deleteLeadAction` from `./actions`, `DeleteLeadForm` from `./delete-lead-form`). Depends on T011, T012.
- [X] T014 [US4] Verify against spec User Story 4's acceptance scenarios (quickstart.md rows for US4): confirming delete removes the lead and decreases the count; cancelling the confirmation leaves the lead in place; invoking `deleteLeadAction` without a valid admin session deletes nothing (verify by inspection or a direct unauthenticated invocation attempt, per spec AC-8); deleting an already-removed lead id does not crash the view. Depends on T013.

**Checkpoint**: Delete works end-to-end, confirmed, independently re-authenticated. All four leads-specific user stories (US1–US4) are now complete.

---

## Phase 7: User Story 5 - Admin uses a consistent, extensible navigation shell (Priority: P5)

**Goal**: Navigation chrome across `/admin` and `/admin/leads` showing the active section, with sign-out reachable from anywhere in the admin area — structured for later slices to extend without redesign. No dependency on Phases 2–6; could have been done at any point.

**Independent Test**: Visit the Dashboard and Leads pages while signed in, confirm the same navigation chrome renders with the current section indicated and sign-out reachable; inspect that the nav is structured so a new link can be added without restructuring it (spec.md, US5 Independent Test).

- [X] T015 [US5] Create `app/(en)/admin/(protected)/admin-nav.tsx` — `"use client"`. Named export `AdminNav`, prop `{ children: React.ReactNode }`. Import `signOutAction` from `./actions` (the existing `"use server"` export, unchanged — do NOT redefine it in this file) and `SignOutButton` from `./sign-out-button` (existing, unchanged). Define a fixed `ADMIN_NAV_LINKS: { path: string; label: string }[]` array: `{ path: "/admin", label: "Dashboard" }`, `{ path: "/admin/leads", label: "Leads" }`. Use `usePathname()` (mirroring `components/site-header.tsx`'s existing active-link pattern, reused as precedent only — do not import from `components/`, FR-004) for exact-match active-link highlighting. Render the nav links, `{children}`, and `<form action={signOutAction}><SignOutButton /></form>` (moved from `page.tsx`, T017). Depends on nothing in Phase 2–6 (may run any time after Setup).
- [X] T016 [US5] Modify `app/(en)/admin/(protected)/layout.tsx`: keep the existing `await requireAuth();` call as the first statement, unchanged; change the return from `children` directly to `<AdminNav>{children}</AdminNav>` (import `AdminNav` from `./admin-nav`). Depends on T015.
- [X] T017 [US5] Modify `app/(en)/admin/(protected)/page.tsx` (dashboard): remove its own inline `<form action={signOutAction}><SignOutButton /></form>` and the now-unused `signOutAction`/`SignOutButton` imports — sign-out is now rendered by `AdminNav` on every admin page (T015/T016), not duplicated on the dashboard alone. Keep the existing placeholder heading/copy unchanged. Depends on T015.
- [X] T018 [US5] Verify against spec User Story 5's acceptance scenarios (quickstart.md rows for US5): `/admin` and `/admin/leads` both show the same nav chrome; "Dashboard" is indicated active on `/admin`, "Leads" on `/admin/leads`; sign-out is reachable from `/admin/leads` directly (not only from the dashboard); no public marketing chrome (`components/site-shell.tsx`) appears on either page. Depends on T016, T017.

**Checkpoint**: All five user stories complete and independently verified.

---

## Phase 8: Polish & Cross-Cutting Verification

**Purpose**: Whole-slice checks that span all five stories, plus the operator's explicit hard-constraint guardrails.

- [X] T019 [P] Guardrail audit: `git diff --stat` confirms no path under `app/(en)/(public)/` or `app/ar/` appears (hard constraint — nothing public touched); `git diff package.json` shows no new dependency (hard constraint — zero new packages); `grep -n '"use server"' app/(en)/admin/(protected)/admin-nav.tsx` returns nothing (confirms `signOutAction` is imported from `./actions`, not redefined, per the operator's explicit instruction); `grep -rn "requireAuth()" app/(en)/admin/(protected)/leads/actions.ts` shows it called in both `updateLeadStatusAction` and `deleteLeadAction`, each independently of the other (FR-018/FR-022). Depends on T013, T017.
- [X] T020 [P] Full `quickstart.md` walkthrough: work through every remaining row in its verification table not already covered by T005/T007/T010/T014/T018 — in particular the route-table check (public routes unaffected, `/admin` and `/admin/leads` are the only newly-dynamic pages from this slice) and a regression pass confirming the existing public contact form / newsletter signup (1D) still write `leads` rows correctly and are now visible in the new view. Confirms spec.md's Success Criteria SC-001–SC-009 all hold end-to-end. Depends on T018.
- [X] T021 Final quality gate: run `npm run check && npm run lint && npm run build` — all three MUST exit zero (FR-028/SC-010). Confirm ESLint reports no new warnings or errors beyond the 6 pre-existing `<img>`-related warnings already present in this repo (unrelated to this slice — no `<img>` tag is added by any task above). This is also the check that confirms T011's zero-argument `deleteLeadAction` signature (already verified once via a throwaway probe during planning) holds against the slice's actual, final code. Depends on T019, T020.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup. BLOCKS User Stories 1, 3, and 4 (each calls one of `listLeads`/`updateLeadStatus`/`deleteLead`). Does NOT block User Story 5 (nav shell — no DAL dependency).
- **User Story 1 (Phase 3)**: Depends on Foundational.
- **User Story 2 (Phase 4)**: Depends on User Story 1 (modifies the same `leads/page.tsx` file T004 creates).
- **User Story 3 (Phase 5)**: Depends on Foundational and on User Story 1 (modifies the same `leads/page.tsx` file; creates `leads/actions.ts`). Independent of User Story 2's filter logic — could be built before or in parallel with Phase 4 if working in the same file didn't create a merge conflict; sequenced after Phase 4 here to match spec priority order (P2 before P3).
- **User Story 4 (Phase 6)**: Depends on Foundational and on User Story 3 (adds a second export to the `leads/actions.ts` file Phase 5 creates, and a second control to the same page row).
- **User Story 5 (Phase 7)**: Depends only on Setup — no dependency on Phases 2–6. Could be done first, last, or in parallel with any of them; sequenced last here to match spec priority order (P5).
- **Polish (Phase 8)**: Depends on all five user stories being complete.

### Parallel Opportunities

- T012 (`delete-lead-form.tsx`) has no file overlap with T011 (`actions.ts`) — both depend only on Foundational/T008 respectively and can be built in parallel before T013 wires them together.
- User Story 5 (Phase 7, T015–T018) touches an entirely different set of files (`admin-nav.tsx`, `layout.tsx`, dashboard `page.tsx`) than User Stories 1–4 (`leads/page.tsx`, `leads/actions.ts`, `leads/delete-lead-form.tsx`) — it can be worked on at any time in parallel with Phases 2–6, by a different contributor if staffed, since neither set of files overlaps with the other.
- T019/T020 (guardrail audit and quickstart walkthrough) are independent checks and can run together once their prerequisites are met, before the single final T021 gate.

---

## Parallel Example: User Story 4

```bash
# Once Foundational (T002) and User Story 3 (T008-T010) are complete:
Task: "Add deleteLeadAction to app/(en)/admin/(protected)/leads/actions.ts"
Task: "Create app/(en)/admin/(protected)/leads/delete-lead-form.tsx"
# Both can proceed together — different files — before T013 wires them into page.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational — DAL extension, blocking).
2. Complete Phase 3 (User Story 1 — read-only leads list).
3. **STOP and VALIDATE**: `/admin/leads` shows every captured lead, newest-first, with all required fields — a real, shippable increment on its own (spec.md's own framing).

### Incremental Delivery

1. Setup + Foundational → DAL ready, nothing user-visible yet.
2. Add US1 → read-only leads list → validate independently (MVP).
3. Add US2 → status filter on the same page → validate.
4. Add US3 → inline status-change control → validate.
5. Add US4 → confirmed delete control → validate.
6. Add US5 → nav shell (independent, can slot in anywhere after Setup) → validate.
7. Phase 8 → whole-slice guardrail audit, quickstart walkthrough, and the single final quality-gate task.

Each increment adds value without breaking the previous one; nothing under `app/(en)/(public)/*` or `app/ar/**` is touched at any point, by construction (no task in this file names a path under either).

### Parallel Team Strategy

With multiple developers: one can own the DAL + leads page/actions thread (Phases 2–6, strictly sequential within itself since US2–US4 each build on the previous phase's file state) while a second owns User Story 5 (Phase 7) independently, since it touches a disjoint set of files. Both threads converge at Phase 8.
