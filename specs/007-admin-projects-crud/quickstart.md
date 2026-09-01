# Quickstart: Admin Projects CRUD (Phase 2, Slice 3)

Validation guide for confirming this slice is complete. Maps to `spec.md`'s User Story acceptance scenarios and Success Criteria SC-001–SC-011. See `data-model.md` for shapes and `contracts/server-actions.md` for per-action behavior — not duplicated here.

## Prerequisites

- Phase 0 (auth, DB), Slice 004 (admin session pattern), Slice 005 (`/api/image`), and Slice 2b (articles CRUD, the pattern source for this slice's actions/form/error-surfacing conventions) already shipped and working.
- Local dev server running (`npm run dev`), signed in as admin at `/admin/auth`.
- Three small test images (any format `sharp` decodes) to exercise the cover/logo/media-image upload controls.

## Setup

No migration, no new dependency, no environment variable. Run the quality gate before manual verification:

```
npm run check   # tsc --noEmit
npm run lint    # eslint-config-next/core-web-vitals
npm run build   # next build
```

All three MUST exit zero (FR-17.1/SC-011).

## Verification steps (map to User Stories & Success Criteria)

| Check | Action | Expected |
|---|---|---|
| Create, both languages atomically (US1 / SC-001, SC-002) | Sign in, open `/admin/projects/new`, fill every shared field, both languages' title/description, at least one system-capability item, upload a cover image, save | Redirects to `/admin/projects`; exactly one `projects` row and exactly two `project_translations` rows (`en`, `ar`) exist; the project renders on both `/portfolio/{slug}` and `/ar/portfolio/{slug}` |
| Atomicity on failure (US1 AC2 / SC-003) | (If feasible) force a failure partway through a create (e.g. a slug that races another save) | No rows exist afterward — no orphan canonical row, no single-language project |
| Required-field rejection (US1 AC3) | Attempt to save with slug, category, cover image, or either language's title/description left blank | Rejected inline with a specific message; nothing written |
| Admin list (US2 / SC-... list correctness) | Create a few projects, open `/admin/projects` | One row per project: cover thumbnail, English title, category, featured/showcase state, edit/delete/preview actions |
| List ordering (US2 AC2) | Edit an older project | It moves to the top of the list |
| Edit persists + reorders (US3 AC1 / SC-002) | Edit any field (shared or per-language) and save | Change persists; `updated_at` advances; list re-orders |
| Edit self-slug no false-clash (US3 AC2) | Re-save a project without changing its slug | Succeeds |
| Edit slug clash (US3 AC3 / SC-004) | Change one project's slug to another existing project's slug | Rejected inline with a specific message, not a raw error |
| Delete confirmation + cascade (US4 / SC-009) | Delete a project (confirm the prompt) | Confirmation required first; afterward the project and both its translations are gone; list no longer shows it |
| system_cards shared icon/order (US5 AC1 / SC-005) | Add 2–3 system-capability items with different icons and both languages' text, save | Both languages' stored `system_cards` show the identical icon and order per item, with each language's own text |
| system_cards count enforcement (US5 AC3) | Attempt to save with 0 or more than 6 system-capability items | Rejected inline with a clear explanation of the allowed range |
| results shared value (US5 AC2 / SC-005) | Add a result item with a value and both languages' captions, save | Both languages' stored `results` show the identical value with each language's own caption |
| tags/technologies per-language (US5 AC4) | Add different tags/technologies for EN and AR, save | Each language's list is stored independently |
| Cover image required, uploads correctly (US6 AC1 / SC-006) | Select a cover image | Uploads immediately, preview appears, form will not save without one |
| Logo/media optional (US6 AC2) | Leave logo and media image empty, save | Succeeds; those fields remain unset |
| All three images render (US6 AC3 / SC-006) | Upload logo and media image, save, view the public detail page | Cover, logo, and media image all render correctly |
| Preview — English (US7 AC1) | Use a project's English preview action | Live English public page opens and renders correctly |
| Preview — Arabic (US7 AC2) | Use the same project's Arabic preview action | Live Arabic public page opens and renders correctly |
| Revalidation, incl. slug change (SC-007) | Create/edit/delete a project, then change a slug on an existing project | Affected public list/detail pages (both languages) reflect the change without a manual rebuild; the OLD slug's detail path no longer serves the project after a slug change |
| Auth enforcement (SC-008) | Confirm each mutating action's code independently calls `requireAuth()` | Present in `createProjectAction`, `updateProjectAction`, `deleteProjectAction` |
| Existing consumers unbroken (SC-010) | Load an existing public portfolio page; load an article's "related project" card; open the articles admin's related-project dropdown | All render/behave exactly as before this slice |
| Quality gate (SC-011) | `npm run check && npm run lint && npm run build` | All exit zero |
| Zero schema drift (AC-15) | `git diff --stat -- lib/db/schema.ts drizzle/` | Empty — no schema or migration change |

## Done when

All rows above pass, all seven User Stories' acceptance scenarios and SC-001–SC-011 hold (spec.md), and no migration or schema change exists in the diff.
