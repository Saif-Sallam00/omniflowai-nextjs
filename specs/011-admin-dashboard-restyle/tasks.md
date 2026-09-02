---
description: "Task list for Admin Dashboard Restyle (Phase 4, pre-cutover)"
---

# Tasks: Admin Dashboard Restyle (Phase 4, pre-cutover)

**Input**: Design documents from `/specs/011-admin-dashboard-restyle/` (plan.md, research.md, data-model.md, contracts/admin-components.md, quickstart.md)

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/admin-components.md, quickstart.md — all present and approved.

**Tests**: No automated test suite exists for the admin UI (per plan.md's Technical Context) and none was requested. Verification is the manual deployed-URL quickstart walkthrough plus the automated `check`/`lint`/`build` gate — both appear below as explicit tasks.

**Organization**: Tasks are grouped by user story per spec.md (US1 = persistent shell, US2 = data tables, US3 = forms, US4 = "nothing breaks" — folded into each story's own verification task plus the final cross-cutting pass, since it is a regression gate rather than a separate implementation surface). Within that grouping, task order follows the mandatory sequencing from research.md §5 and the pinned non-negotiables: components first, then shell, then lists, then the article form as its own verified step, then the sign-in page, then the project form LAST as its own isolated, independently-verified step.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Every task includes the exact file path(s) it touches

## Non-negotiables pinned for every task below (do not reopen)

- Every edit is JSX-structure and Tailwind `className` only, plus new files strictly under `components/admin/`. No task may touch `lib/db/*`, `lib/auth-server.ts`, `lib/env.ts`, `lib/actions/*`, any Server Action body, `article-form-schema.ts`, `project-form-schema.ts`, `drizzle/`, or `lib/db/schema.ts`. If a task appears to require such a change, STOP and report it instead of making it.
- New `components/admin/*` files are pure presentational Server Components (no data fetch, no Server Action, no auth call, no DB import) — see `contracts/admin-components.md`'s compliance checklist for each one. Domain→tone mapping (`lead.status`, `published`, `featured` → badge tone) is written in the consuming page, never inside `StatusBadge` itself.
- Forms (`article-form.tsx`, `project-form.tsx`, and their sub-components) are restyled **in place**: every `useActionState`/`useFormStatus`/`useState` call, every prop, every action reference, every conditional branch, every `name`/`defaultValue`/`onChange`/`checked` attribute stays byte-for-byte identical. `FormField`/`Card`/`Button` wrap the existing elements as `children` — no new hook, no prop rename, no adapter layer, no shared `useAdminForm` refactor.
- The sidebar is built by editing `app/(en)/admin/(protected)/admin-nav.tsx` **in place** — no parallel sidebar component is created and no old component is orphaned. It stays `"use client"` (already is, for `usePathname`); a mobile-toggle `useState` may be added there; it must import no server-only module. `app/(en)/admin/(protected)/layout.tsx`'s `await requireAuth()` call is not touched. Sign-out keeps invoking the unchanged `signOutAction` — only its trigger's styling changes.
- No new npm dependency, no component library, no schema change, no migration, no public route/component/styling touched.

## Path Conventions

Single Next.js repository (App Router). Admin surfaces under `app/(en)/admin/**`; new shared presentational components under `components/admin/`. No `backend/`/`frontend/` split applies.

---

## Phase 1: Setup

**Purpose**: Confirm a clean, correct starting point before any edit.

- [X] T001 Confirm the working tree is on branch `011-admin-dashboard-restyle` with a clean `git status` and that `npm run check`, `npm run lint`, and `npm run build` all currently pass with zero errors (baseline gate, run from repo root) — this is the "before" state the diff-scope gate (T044) will be compared against.
- [X] T002 Confirm no admin file under `app/(en)/admin/**` or `components/` has uncommitted changes already pending, and note `package.json`/`package-lock.json`'s current dependency list as the "no new dependency" baseline for T044.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared presentational component set every user story consumes. Per `contracts/admin-components.md` and research.md §1–2, these are pure Server Components (no `"use client"`, no data/auth/DB access) plus a shared palette-token constants file.

**⚠️ CRITICAL**: No restyle task in Phase 3 onward may begin until this phase is complete.

- [X] T003 [P] Create `components/admin/palette.ts` — export named string constants mapping semantic roles (`surface`, `surfaceMuted`, `border`, `textPrimary`, `textMuted`, `accent`, and the four `StatusBadge` tone class sets) to literal Tailwind gray-scale + one accent utility-class strings, per research.md §2. No `tailwind.config.ts` change.
- [X] T004 [P] Create `components/admin/card.tsx` — exports `Card({ children, className? })`, a bordered/padded/rounded `<div>` using `palette.ts` tokens. No data/auth/DB import.
- [X] T005 [P] Create `components/admin/button.tsx` — exports `Button` as `React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "destructive" }`, spreading all native button props through unchanged (so `type`, `disabled`, `onClick` pass straight through) per `contracts/admin-components.md`.
- [X] T006 [P] Create `components/admin/form-field.tsx` — exports `FormField({ label, htmlFor, error?, children })`, rendering a styled `<label htmlFor>`, then `children` unmodified, then (if `error`) the existing error string in a styled `<p role="alert">`. Computes nothing about validation itself.
- [X] T007 [P] Create `components/admin/table.tsx` — exports `Table`, `TableHead`, `TableRow`, `TableCell` (with a `header?` boolean prop on `TableCell` to render `<th>` vs `<td>`) as thin styled wrappers per `contracts/admin-components.md`.
- [X] T008 [P] Create `components/admin/page-header.tsx` — exports `PageHeader({ title, description?, action? })` rendering a heading, optional description text, and an optional trailing action slot.
- [X] T009 [P] Create `components/admin/status-badge.tsx` — exports `StatusBadge({ tone, children })` rendering `children` inside a colored pill keyed off `tone` (`"neutral" | "success" | "warning" | "danger"`) using `palette.ts` tone classes. Contains no mapping from any domain value (`lead.status`, `published`, `featured`) — that mapping is the caller's responsibility.
- [X] T010 Run `npm run check`, `npm run lint`, `npm run build` after T003–T009 land — must all pass with zero errors before any consuming page is touched. (No behavior to verify yet; these components are not yet imported anywhere.)

**Checkpoint**: All seven `components/admin/*` files exist, compile clean, and are confirmed presentational-only per the compliance checklist in `contracts/admin-components.md`. User story work can now begin.

---

## Phase 3: User Story 1 - Operator works in a real dashboard, not raw HTML (Priority: P1) 🎯 MVP — Shell

**Goal**: The protected admin layout renders a persistent sidebar (Dashboard/Leads/Articles/Projects/Sign out) with active-item indication, around the unchanged `requireAuth()` call, plus a restyled dashboard landing page.

**Independent Test**: Load any admin page and confirm the persistent sidebar, active-item indication, and styled shell — independent of any list or form content (dashboard page can be nearly empty and still prove this story).

### Implementation for User Story 1 — Shell

- [X] T011 [US1] Restyle `app/(en)/admin/(protected)/admin-nav.tsx` **in place**: turn the existing horizontal `<nav>` into a persistent vertical sidebar using `components/admin/card.tsx` for the sidebar container, keeping the exact same `ADMIN_NAV_LINKS` constant, the exact same `pathname === link.path` active-check logic, the exact same `<form action={signOutAction}>` wrapping `<SignOutButton />`, and the exact same exported `AdminNav({ children })` signature (still wraps `children` as the content region — `layout.tsx` needs no import change). Add a local `useState` for a mobile-drawer toggle if implementing responsive collapse (research.md §3); confirm no new import beyond `react`, `next/link`, `next/navigation`, `./actions`, `./sign-out-button`, and the new `components/admin/*` files — explicitly no `lib/db`, `lib/env`, or `lib/auth-server` import.
- [X] T012 [US1] Restyle `app/(en)/admin/(protected)/sign-out-button.tsx`: keep the exact same `useFormStatus`/`pending` logic and `type="submit"`/`disabled={pending}` attributes, just render through `components/admin/button.tsx`'s `Button` (e.g. `<Button variant="secondary" type="submit" disabled={pending}>`) instead of a bare `<button>`.
- [X] T013 [US1] Restyle `app/(en)/admin/(protected)/page.tsx` (dashboard landing) using `components/admin/page-header.tsx` and `components/admin/card.tsx` for a clean landing layout. No data-fetching change (confirm current file's data needs, if any, are preserved unchanged).
- [X] T014 [US1] Quality gate + server-only guard re-verify for the shell: run `npm run check`, `npm run lint`, `npm run build` (must pass). Then temporarily add `import { db } from "@/lib/db";` (or similar) into `admin-nav.tsx`, confirm `npm run build` **fails** with an import-trace error naming `lib/env.ts` (proving the `server-only` guard still catches a client-boundary leak), then revert the temporary import and confirm `npm run build` passes again.
- [X] T015 [US1] Deploy to the Replit environment and spot-check the shell on the **deployed URL** with the browser console open: every admin page shows the persistent sidebar with all four destinations plus sign-out; the current page's nav item is visually active; sign-out still works and re-sign-in works; confirm zero console errors (per quickstart.md Step 4.1–4.3).

**Checkpoint**: The sidebar shell and dashboard are live and verified on the deployed URL. Every subsequent admin page automatically inherits this shell via `layout.tsx` → `AdminNav`, unchanged.

---

## Phase 4: User Story 2 - Consistent, legible data tables (Priority: P2)

**Goal**: The leads, articles, and projects lists render as styled tables/cards with legible rows, status badges, and clear row actions, with all underlying data, links, and Server Action wiring unchanged.

**Independent Test**: Open each of the three list pages and confirm styled table/card rendering, badges, and row actions — without opening any create/edit form.

### Implementation for User Story 2 — List pages

- [X] T016 [P] [US2] Restyle `app/(en)/admin/(protected)/leads/page.tsx`: replace the existing `<ul>`/`<li>` rows with `components/admin/table.tsx` parts (or `Card`-based rows, matching the chosen list pattern), render `lead.status` through `components/admin/status-badge.tsx` with the tone mapped in this page (e.g. `new`→`neutral`, `contacted`→`warning`, `won`→`success`, `lost`→`danger` — map to the project's actual `leadStatusEnum` values). Keep the exact same `updateLeadStatusAction.bind(null, lead.id)` form, the exact same `<select>`/`name="status"`/`defaultValue`, the exact same `DeleteLeadForm` usage, and the exact same status-filter `<Link>` query-param logic, byte-for-byte.
- [X] T017 [P] [US2] Restyle `app/(en)/admin/(protected)/leads/delete-lead-form.tsx`: className/`Button` (destructive variant) only, same action prop and submit logic.
- [X] T018 [P] [US2] Restyle `app/(en)/admin/(protected)/articles/page.tsx`: render the existing translation-group grouping as styled rows/cards via `components/admin/table.tsx` or `components/admin/card.tsx`, EN/AR per-language state as `StatusBadge` (tone mapped in this page from `published`, e.g. published→`success`, draft→`neutral`), keep the exact same grouping logic, the exact same "Add \<language\> version" link, and the exact same per-row edit/delete/preview links (preview link present only when published) unchanged.
- [X] T019 [P] [US2] Restyle `app/(en)/admin/(protected)/projects/page.tsx`: render as a styled table/cards with cover thumbnail, title, category, and `StatusBadge` for featured/showcase flags (tone mapped in this page), keeping all existing data and links unchanged.
- [X] T020 [US2] Run `npm run check`, `npm run lint`, `npm run build` after T016–T019 — must pass with zero errors.
- [X] T021 [US2] Deploy and spot-check all three lists on the **deployed URL** with console open: leads table renders with badges, change one lead's status via the restyled control and confirm it persists on reload, delete one throwaway/test lead if one exists (or confirm the delete control's wiring visually without deleting real data), confirm the articles and projects lists render grouped/styled with correct badges and working row-action links, confirm zero console errors (per quickstart.md Step 4.4–4.6).

**Checkpoint**: All three list surfaces are restyled and verified on the deployed URL. Combined with Phase 3, US-1 and US-2 are both independently functional.

---

## Phase 5: User Story 3 - Comfortable forms (Priority: P2) — Article form (own step)

**Goal**: The article create/edit form renders with styled fields, buttons, and section grouping — cover-image control, Markdown body editor with inline-image insert, related-project/related-solution selects, and inline error display — with every existing hook, prop, action, and attribute unchanged. Verified as its own, independent step per research.md §5, before the sign-in page and well before the higher-risk project form.

**Independent Test**: Open `/admin/articles/new` and an existing article's edit page, confirm all fields/sections/errors render styled, then run the full deployed create→publish→pair→delete lifecycle for this form alone.

### Implementation for User Story 3 — Article form

- [X] T022 [US3] Restyle `app/(en)/admin/(protected)/articles/article-form.tsx` **in place**: wrap each existing `<input>`/`<textarea>`/`<select>` (title, slug, excerpt, published checkbox, published-at date, related-project select, related-solution select) in `components/admin/form-field.tsx`, passing the existing `state.fieldErrors.X?.[0]` string as `error` unchanged; wrap section groups in `components/admin/card.tsx`; restyle `SubmitButton` to render through `components/admin/button.tsx`. Do not change `useActionState`, the `RELATED_SOLUTIONS` import from `@/lib/article-solutions`, any prop passed to `CoverImageField`/`BodyEditor`, `handleTitleChange`, `slugifyForLanguage` usage, or any `name`/`defaultValue`/`onChange`/`checked` attribute.
- [X] T023 [P] [US3] Restyle `app/(en)/admin/(protected)/articles/body-editor.tsx`: className only around the Markdown textarea and inline-image-insert control; all state/handlers unchanged.
- [X] T024 [P] [US3] Restyle `app/(en)/admin/(protected)/articles/cover-image-field.tsx`: className only around the file input/preview; upload logic unchanged.
- [X] T025 [P] [US3] Restyle `app/(en)/admin/(protected)/articles/delete-article-form.tsx`: className/`Button` (destructive variant) only, same action and submit logic.
- [X] T026 [US3] Confirm `app/(en)/admin/(protected)/articles/article-form-schema.ts` requires **no edit** (it contains only validation/type logic, no JSX) — leave untouched and record this in the diff-scope evidence for T044.
- [X] T027 [US3] Run `npm run check`, `npm run lint`, `npm run build` after T022–T025 — must pass with zero errors.
- [X] T028 [US3] Deploy and run the full **article-form deployed walkthrough** on the deployed URL with console open (per quickstart.md Steps 4.7–4.9): create a draft article `zz-restyle-test-en` with a cover image and one inline body image; confirm the restyled "cover image required" validation error displays correctly if attempted without one; add its Arabic counterpart `zz-restyle-test-ar` via "Add Arabic version"; mark the EN row published with a published-at date; confirm the published EN article renders on its public URL and the still-draft AR counterpart still 404s publicly; edit both rows to confirm round-trip; then delete both test rows via the restyled delete control. Confirm zero console errors throughout, and confirm no `zz-restyle-test-*` article rows remain afterward.

**Checkpoint**: The article form is fully restyled and independently verified end-to-end on the deployed URL, with the database left clean of its test data.

---

## Phase 6: User Story 1 (cont'd) - Sign-in page

**Goal**: The admin sign-in page (outside the `(protected)` group but still part of "every admin page" per US-1) is restyled, sequenced here per the mandated ordering (after the article form, before the project form).

**Independent Test**: Sign out, then load `/admin/auth` and confirm the styled sign-in form works.

### Implementation for User Story 1 — Sign-in page

- [X] T029 [P] [US1] Restyle `app/(en)/admin/auth/page.tsx`: use `components/admin/page-header.tsx`/`components/admin/card.tsx` around `<LoginForm />`, no logic change (this file has none beyond rendering `<LoginForm />`).
- [X] T030 [P] [US1] Restyle `app/(en)/admin/auth/login-form.tsx` **in place**: wrap the username/password fields in `components/admin/form-field.tsx` passing the existing `state.error` text unchanged where applicable, restyle `SubmitButton` through `components/admin/button.tsx`. Do not change `useActionState`, `signInAction`, or any `name`/`autoComplete`/`required` attribute.
- [X] T031 [US1] Run `npm run check`/`lint`/`build` (must pass), then deploy and confirm on the deployed URL with console open: the sign-in page renders styled, sign-in succeeds, sign-out (from Phase 3) still works, and re-sign-in succeeds — zero console errors.

**Checkpoint**: US-1 (shell + dashboard + sign-in) is now fully restyled and verified end-to-end.

---

## Phase 7: User Story 3 (cont'd) - Comfortable forms — PROJECT FORM (LAST, ISOLATED, highest-risk)

**Goal**: The project create/edit form — the heaviest, most stateful admin file (transactional save, fan-out assembly, two repeatable-row builders, a chip input, three image-upload fields, bilingual sections) — is restyled with the same byte-for-byte state/logic guarantee, sequenced strictly last and verified in complete isolation per research.md §5 and the pinned non-negotiables.

**Independent Test**: Open `/admin/projects/new`, confirm every field/section/builder renders styled, then run the full deployed create→verify→delete lifecycle for this form alone, independent of every other story's changes (which are already verified and stable by this point).

### Implementation for User Story 3 — Project form

- [X] T032 [US3] Restyle `app/(en)/admin/(protected)/projects/project-form.tsx` **in place**: wrap canonical fields in `components/admin/form-field.tsx`, group sections (canonical fields, EN content, AR content, image uploads, system cards, results) in `components/admin/card.tsx`, restyle all buttons (submit, add-row, remove-row) through `components/admin/button.tsx`. Do not change the transactional save call, the fan-out assembly, any `useActionState`/`useState`/`useRef` hook, any prop passed to `CoverImageField`/`LogoImageField`/`MediaImageField`/`SystemCardsEditor`/`ResultsEditor`/`ChipInput`, or any `name`/`defaultValue`/`onChange` attribute. This is the highest-risk file in the entire slice — re-read the full diff for this file before moving on and confirm every changed line is JSX nesting or `className` only.
- [X] T033 [P] [US3] Restyle `app/(en)/admin/(protected)/projects/chip-input.tsx`: className only, same add/remove-chip state and handlers.
- [X] T034 [P] [US3] Restyle `app/(en)/admin/(protected)/projects/cover-image-field.tsx`: className only, same upload logic.
- [X] T035 [P] [US3] Restyle `app/(en)/admin/(protected)/projects/logo-image-field.tsx`: className only, same upload logic.
- [X] T036 [P] [US3] Restyle `app/(en)/admin/(protected)/projects/media-image-field.tsx`: className only, same upload logic.
- [X] T037 [P] [US3] Restyle `app/(en)/admin/(protected)/projects/system-cards-editor.tsx`: className only, same repeatable-row add/remove/reorder state and handlers.
- [X] T038 [P] [US3] Restyle `app/(en)/admin/(protected)/projects/results-editor.tsx`: className only, same repeatable-row add/remove state and handlers.
- [X] T039 [P] [US3] Restyle `app/(en)/admin/(protected)/projects/delete-project-form.tsx`: className/`Button` (destructive variant) only, same action and submit logic.
- [X] T040 [US3] Confirm `app/(en)/admin/(protected)/projects/project-form-schema.ts` requires **no edit** (validation/type logic only, no JSX) — leave untouched and record this in the diff-scope evidence for T044.
- [X] T041 [US3] Run `npm run check`, `npm run lint`, `npm run build` after T032–T039 — must pass with zero errors. Additionally grep the diff for T032–T039 for any newly added import and confirm none references `lib/db`, `lib/env`, or `lib/auth-server` (this file tree is already `"use client"`, so the risk here is a stray server-only import, not a new client/server boundary).
- [X] T042 [US3] Deploy and run the full **project-form deployed walkthrough** on the deployed URL with console open, independent of every prior step (per quickstart.md Steps 4.10–4.11 and 4.14): create `zz-restyle-test-project` with all three images (cover, logo, media) populated, one system card added via the repeatable-row builder, one result added, and both EN/AR content sections filled; confirm the transactional create succeeds and the project appears correctly in the restyled list with correct badges; open its edit form and confirm every field round-trips; confirm the project's public URL renders correctly in both languages; then delete the test project via the restyled delete control and confirm it disappears from both the admin list and its public URL. Confirm zero console errors throughout, and confirm no `zz-restyle-test-project` residue remains afterward.

**Checkpoint**: The project form — the highest-risk file in this slice — is fully restyled and independently verified end-to-end on the deployed URL, with the database left clean. All four user stories (US1–US4) are now individually satisfied.

---

## Phase 8: Polish & Cross-Cutting Concerns (Final Gate)

**Purpose**: Prove the whole slice, taken together, still satisfies the non-negotiable boundary and every acceptance criterion (AC-1..AC-8) — this is where User Story 4 ("nothing breaks") is confirmed as a whole, not just per-step.

- [X] T043 Diff-scope GATE (proves FR-016/AC-5/AC-6/SC-004/SC-005): from repo root, run `git diff --stat -- lib/db/schema.ts drizzle/` (must be empty), `git diff --stat -- lib/db lib/auth-server.ts lib/env.ts lib/actions` (must show no logic changes — ideally empty), `git diff --stat -- app/\(en\)/admin/\(protected\)/articles/article-form-schema.ts app/\(en\)/admin/\(protected\)/projects/project-form-schema.ts` (must be empty), and `git diff --stat package.json package-lock.json` (must show no new dependency). Then review the complete `git diff` for the branch and confirm every remaining changed/added line is either a new file under `components/admin/` or a JSX/className edit inside an admin page or form component. Report and do not merge if any line fails this check.
- [X] T044 Confirm no public route or component changed (proves FR-013/AC-7): run `git diff --stat -- app/\(en\)/\(public\) app/ar components` and confirm every result is empty except files already accounted for under `components/admin/` in T003–T009 — no `SiteShell`, public page, or other public component appears.
- [X] T045 Run the final combined quality gate: `npm run check`, `npm run lint`, `npm run build` all exit zero (proves FR-018/AC-8).
- [ ] T046 Run the **final full deployed-URL pass** (quickstart.md Step 4, start to finish, in one sitting) with console open: sign in; walk dashboard, leads (status-change + delete), articles list, projects list; confirm the shell/sidebar/badges/tables all look correct together as a whole (not just per-step); confirm zero console errors across the entire pass; confirm the database contains no leftover `zz-restyle-test-*` records from any earlier phase (T028, T042). This is the AC-4 "every admin flow still works" confirmation taken as a whole, closing out User Story 4.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. BLOCKS every phase below — no page may import a `components/admin/*` file before T003–T010 are done.
- **Phase 3 (US1 — Shell)**: Depends on Foundational. No dependency on any other user-story phase.
- **Phase 4 (US2 — Lists)**: Depends on Foundational. Independent of Phase 3's content but conventionally follows it since every admin page (including the lists) is rendered inside the shell built in Phase 3 — do Phase 3 first so list pages can be visually spot-checked inside a finished shell.
- **Phase 5 (US3 — Article form)**: Depends on Foundational. Independent of Phases 3–4's specific content, but sequenced after them per research.md §5 (lower-risk surfaces first).
- **Phase 6 (US1 — Sign-in page)**: Depends on Foundational. Sequenced after the article form and before the project form per the mandated ordering — not because of a technical dependency, but to keep the highest-risk file (project form) strictly last.
- **Phase 7 (US3 — Project form)**: Depends on Foundational. Sequenced strictly LAST among all restyle work — do not begin until Phases 3–6 are complete and verified, per the non-negotiable isolation requirement for this file.
- **Phase 8 (Polish/Final Gate)**: Depends on all of Phases 3–7 being complete.

### Within Each Phase

- Components in Phase 2 are all `[P]` (different files, no cross-dependency) but all must land before Phase 3 begins.
- Within Phase 4, Phase 5's sub-component tasks, and Phase 7's sub-component tasks, `[P]`-marked tasks touch different files and can run in parallel; the "own step" quality-gate and deployed-walkthrough tasks in each phase must run after that phase's `[P]` tasks complete.
- T022 (article-form.tsx) and T032 (project-form.tsx) are each listed as non-`[P]` and first in their respective implementation block, since they are the highest-value files to review carefully in isolation before touching their smaller sub-components — though technically they touch different files than T023–T025/T033–T039 and could run in parallel if preferred.

### Parallel Opportunities

- All of Phase 2 (T003–T009) can run in parallel.
- Within Phase 4: T016–T019 can run in parallel (four different list pages).
- Within Phase 5: T023–T025 can run in parallel (after or alongside T022).
- Within Phase 6: T029–T030 can run in parallel.
- Within Phase 7: T033–T039 can run in parallel (after or alongside T032).
- Phases 3 and 4 touch entirely disjoint files and could, in principle, run in parallel after Phase 2 — but running Phase 3 first is recommended so Phase 4's deployed spot-check (T021) already has the finished shell to render inside.

---

## Parallel Example: Phase 2 (Foundational)

```bash
Task: "Create components/admin/palette.ts"
Task: "Create components/admin/card.tsx"
Task: "Create components/admin/button.tsx"
Task: "Create components/admin/form-field.tsx"
Task: "Create components/admin/table.tsx"
Task: "Create components/admin/page-header.tsx"
Task: "Create components/admin/status-badge.tsx"
```

## Parallel Example: Phase 7 (Project form sub-components)

```bash
Task: "Restyle app/(en)/admin/(protected)/projects/chip-input.tsx"
Task: "Restyle app/(en)/admin/(protected)/projects/cover-image-field.tsx"
Task: "Restyle app/(en)/admin/(protected)/projects/logo-image-field.tsx"
Task: "Restyle app/(en)/admin/(protected)/projects/media-image-field.tsx"
Task: "Restyle app/(en)/admin/(protected)/projects/system-cards-editor.tsx"
Task: "Restyle app/(en)/admin/(protected)/projects/results-editor.tsx"
Task: "Restyle app/(en)/admin/(protected)/projects/delete-project-form.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (blocks everything).
3. Complete Phase 3: User Story 1 — shell + dashboard.
4. **STOP and VALIDATE**: T015's deployed spot-check passes independently.
5. This alone is a demonstrable, deployable improvement (every admin page already inherits the shell via `layout.tsx`), even before lists or forms are touched.

### Incremental Delivery (matches the mandated sequencing exactly)

1. Setup + Foundational → shared components ready.
2. Phase 3 (US1 — shell) → verify on deploy → shell live everywhere.
3. Phase 4 (US2 — lists) → verify on deploy → lists restyled.
4. Phase 5 (US3 — article form, own step) → full independent deployed walkthrough → article form done and proven safe.
5. Phase 6 (US1 — sign-in page) → verify on deploy.
6. Phase 7 (US3 — project form, LAST and ISOLATED) → full independent deployed walkthrough → highest-risk file done and proven safe.
7. Phase 8 (final gate) → diff-scope proof + full combined deployed pass → feature complete.

### Suggested MVP Scope

User Story 1 (Phase 3 only, after Phase 1–2) is the smallest independently valuable and independently testable increment — every admin page immediately looks and navigates like a real dashboard, with zero risk to any form's logic since no form file is touched yet.

## Notes

- `[P]` tasks = different files, no dependencies among themselves.
- `[Story]` label maps each task to US1/US2/US3 for traceability; US4 ("nothing breaks") is satisfied by the per-phase deployed-walkthrough tasks (T015, T021, T028, T031, T042) plus the final cross-cutting pass (T046), rather than by its own separate implementation tasks — it is a verification story, not a build surface.
- Every task that touches a form or its sub-components restates the byte-for-byte constraint explicitly — this is intentional repetition, not boilerplate, given how easy it is to accidentally rename a prop or drop an attribute while restructuring JSX.
- Commit after each task or logical group (e.g. after all of Phase 2, after each list page in Phase 4, after each form file in Phases 5/7).
- Stop at any checkpoint to validate that story independently before proceeding — especially before starting Phase 7 (the project form).
