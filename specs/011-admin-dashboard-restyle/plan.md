# Implementation Plan: Admin Dashboard Restyle (Phase 4, pre-cutover)

**Branch**: `011-admin-dashboard-restyle` | **Date**: 2026-09-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-admin-dashboard-restyle/spec.md`, authoritative source `docs/admin-restyle-slice-spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Restyle every admin surface (dashboard, leads, articles list + form, projects list + form) from its currently plain, near-unstyled markup into a cohesive, professional operator dashboard: a persistent sidebar shell built once in `app/(en)/admin/(protected)/layout.tsx` around the unchanged `requireAuth()` call, plus a small set of new hand-rolled Tailwind presentational components under `components/admin/` (card/container, button variants, form-field wrapper, table parts, page header, status badge) that every admin page and the existing client-component forms consume. Zero behavior change: every Server Action, DAL call, `useActionState` wire-up, the transactional project save/fan-out, the repeatable-row builders, the chip input, the three image-upload controls, and the `RELATED_SOLUTIONS` client-safe import stay byte-for-byte. Only JSX structure and `className` strings change, plus new purely-presentational files are added. The already-`"use client"` `AdminNav` component (it already uses `usePathname` and invokes the existing `signOutAction`) is the natural, lowest-risk home for the sidebar and any mobile-toggle state — no new client/server boundary is crossed. The project form is restyled as its own, last, independently-verified step because it is the highest-risk file (transactional save + fan-out + three image fields + two repeatable-row builders + chip input, all in one 276-line client component). Final verification walks every admin flow on the deployed Replit URL with the browser console open, including a create→verify→delete seed-data lifecycle so the database is left clean.

## Technical Context

**Language/Version**: TypeScript (strict mode), Next.js 16.x stable, React 19.2.8

**Primary Dependencies**: Next.js App Router, Tailwind CSS (existing `tailwind.config.ts` / `app/globals.css` / PostCSS pipeline — no new dependency added), Drizzle ORM (unchanged, untouched by this feature), Better Auth (unchanged, untouched)

**Storage**: Neon Postgres via Drizzle — read-only usage in this feature (existing DAL functions are called exactly as before to render the same data; no new queries, no schema change)

**Testing**: No automated test suite exists for the admin UI today (per constitution, automated tests are added where business-critical/security-sensitive — this feature is presentation-only, non-security-sensitive, and the constitution's existing testing section does not mandate new tests for a pure restyle). Verification is manual: `npm run check` / `npm run lint` / `npm run build` as the automated quality gate, plus a scripted manual walkthrough on the deployed Replit URL (see `quickstart.md`)

**Target Platform**: Server-rendered Next.js app deployed to Replit Autoscale, verified in a desktop browser (admin is English-only, internal-tool, light-mode-only per settled assumptions) with the sidebar responsive behavior confirmed at a narrow viewport width as well

**Project Type**: Web application (single Next.js repo, App Router) — admin surfaces only, under `app/(en)/admin/(protected)/**` and `app/(en)/admin/auth/**`; no separate frontend/backend split

**Performance Goals**: N/A — no performance requirement changes; presentational-only change must not introduce a new "use client" boundary that regresses any page from Server Component to unnecessary client-rendered

**Constraints**:
- No new npm dependency, no component library (constitution + source spec, non-negotiable).
- No schema change, no migration.
- New presentational components must be usable from Server Components without forcing them client (FR-003); a component may only be `"use client"` if it genuinely needs interactivity, and then must not import any server-only module (the existing `server-only` guard on `lib/env.ts` must keep passing).
- The `(protected)` layout's `requireAuth()` call and the sign-out Server Action's wiring must not change — only their surrounding markup and the sign-out trigger's styling.
- Article form and project form: only JSX/className around existing logic changes; all `useActionState` wiring, actions, the `RELATED_SOLUTIONS` import, the transactional save, the fan-out assembly, the repeatable-row builders (system cards, results), the chip input, and the image-upload controls remain byte-for-byte identical in behavior.
- No public route, component, or styling touched.

**Scale/Scope**: ~19 existing admin files touched for restyling (1 layout, 1 nav/shell component, 3 list pages, 2 forms plus their ~7 sub-components, 2 delete-confirmation forms, 1 sign-out button) plus an estimated 6-8 new presentational component files under `components/admin/`. No data-scale concerns — internal tool, low admin-user count.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Constraint | Check | Status |
|---|---|---|
| I. Diagnosis Before Solution | Plan is grounded in reading the actual current admin files (`layout.tsx`, `admin-nav.tsx`, `leads/page.tsx`, form files) rather than assumed structure | PASS |
| II. Locked Decisions Are Locked | "Plain Tailwind, no component library" decision is upheld, not reversed — hand-rolled components only, no shadcn/Radix, no new dependency | PASS |
| III. Verify Before Declaring Done | Quality gate (`check`/`lint`/`build`) plus deployed-URL manual walkthrough defined in `quickstart.md`; operator verifies acceptance criteria, not implementer self-report | PASS |
| IV. Scope Discipline | Feature is scoped to presentational admin restyle only; any discovered need to change Server Action/DAL/auth logic is explicitly out of scope and must be reported, not fixed inline | PASS |
| V. URL Preservation | No route paths change; only JSX/className inside existing pages | PASS (N/A — no URLs touched) |
| VI. Security Is Not Convenience | `requireAuth()` call, session handling, and the `server-only` guard on `lib/env.ts` are untouched; guard re-verified as part of the gate | PASS |
| VII. Bilingual By Architecture | Admin is explicitly English-only per settled assumption in the source spec; this feature does not touch public bilingual routes | PASS (N/A — admin-only, public bilingual routes untouched) |
| Rendering & Data: Server Components by default (P-02) | New presentational components must not force Server Component admin pages to become Client Components; only components needing real interactivity (sidebar mobile toggle) may be client, and must not import server-only modules | PASS — enforced as an explicit constraint, verified in research + quickstart |
| Change Discipline: no adjacent cleanup | No unrelated refactors; only the restyle scope. Any unrelated dead code or improvement opportunity noticed is reported, not fixed | PASS |

No violations requiring Complexity Tracking justification.

## Project Structure

### Documentation (this feature)

```text
specs/011-admin-dashboard-restyle/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command) — N/A content noted, no new entities
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command) — presentational component prop contracts
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
components/
└── admin/                          # NEW — presentational-only components, pure Tailwind
    ├── admin-shell.tsx             # Sidebar + content region wrapper (server-renderable container; may compose a client sidebar-nav)
    ├── admin-sidebar-nav.tsx       # "use client" ONLY IF a mobile toggle is added; wraps/replaces the nav portion of the current admin-nav.tsx pattern; imports no server-only module
    ├── page-header.tsx             # Title + optional action slot
    ├── card.tsx                    # Page/section container
    ├── button.tsx                  # primary / secondary / destructive variants; renders <button> or wraps an existing <button>/submit control's className
    ├── form-field.tsx              # label + input/textarea/select slot + error slot wrapper
    ├── table.tsx                   # Table / TableHead / TableRow / TableCell presentational parts
    └── status-badge.tsx            # Colored badge for lead status / published-draft / featured-showcase

app/(en)/admin/
├── (protected)/
│   ├── layout.tsx                  # EDIT — render new admin-shell/sidebar around unchanged requireAuth() call
│   ├── admin-nav.tsx               # EDIT (or superseded by components/admin/admin-sidebar-nav.tsx — decided in research.md) — same signOutAction wiring, restyled markup
│   ├── sign-out-button.tsx         # EDIT — className only, same useFormStatus logic
│   ├── page.tsx                    # EDIT — dashboard landing restyled with new shell components
│   ├── leads/page.tsx              # EDIT — table restyle using components/admin/table.tsx + status-badge.tsx; updateLeadStatusAction/deleteLeadAction wiring unchanged
│   ├── leads/delete-lead-form.tsx  # EDIT — className only
│   ├── articles/page.tsx           # EDIT — grouped list restyle; grouping logic/links unchanged
│   ├── articles/article-form.tsx   # EDIT (own step, verified independently before project form) — JSX/className only; useActionState, RELATED_SOLUTIONS import, all actions unchanged
│   ├── articles/article-form-schema.ts   # UNCHANGED (logic only, no presentational content)
│   ├── articles/body-editor.tsx    # EDIT — className only
│   ├── articles/cover-image-field.tsx    # EDIT — className only, upload logic unchanged
│   ├── articles/delete-article-form.tsx  # EDIT — className only
│   ├── projects/page.tsx           # EDIT — table/card restyle; data/links unchanged
│   ├── projects/project-form.tsx   # EDIT (LAST, independent step — highest-risk file) — JSX/className only; transactional save, fan-out, all form state unchanged
│   ├── projects/project-form-schema.ts   # UNCHANGED
│   ├── projects/chip-input.tsx     # EDIT — className only
│   ├── projects/cover-image-field.tsx    # EDIT — className only
│   ├── projects/logo-image-field.tsx     # EDIT — className only
│   ├── projects/media-image-field.tsx    # EDIT — className only
│   ├── projects/system-cards-editor.tsx  # EDIT — className only
│   ├── projects/results-editor.tsx       # EDIT — className only
│   └── projects/delete-project-form.tsx  # EDIT — className only
└── auth/
    ├── page.tsx                    # EDIT — sign-in page restyled (within admin visual scope; not "protected" but still admin, per US-1's "every admin page")
    └── login-form.tsx              # EDIT — className only, actions.ts (Server Action) unchanged
```

**Structure Decision**: Single Next.js repository, no new top-level directory. All new code lives under the existing `components/admin/` (new subdirectory, consistent with the existing flat `components/` convention already used for public-site presentational components like `card`-shaped items in that directory) and edits land inside the existing `app/(en)/admin/**` tree. No `frontend`/`backend` split applies — this is the existing single-project Next.js App Router structure.

## Complexity Tracking

*No Constitution Check violations — table not applicable.*
