# Quickstart: Validating the Admin Dashboard Restyle

This is a runnable validation guide, not an implementation guide. It proves the feature works end-to-end per the spec's acceptance criteria (AC-1..AC-8) and success criteria (SC-001..SC-007). Component prop details are in [contracts/admin-components.md](./contracts/admin-components.md); scope/requirements are in [spec.md](./spec.md).

## Prerequisites

- The restyle implementation is complete for the step being verified (article form OR project form OR the full slice — see `research.md` §5 for sequencing).
- Access to the deployed Replit URL for this project, with valid admin credentials.
- Local checkout with the feature branch (`011-admin-dashboard-restyle`) for running the automated quality gate before deploying.
- Browser DevTools console available and kept open for the entire deployed-URL walkthrough.

## Step 1 — Automated quality gate (local, before every deploy)

```bash
npm run check   # tsc --noEmit — must exit 0
npm run lint    # must exit 0
npm run build   # must succeed
```

Also confirm the `server-only` guard still catches a regression (repeat the existing project verification technique): temporarily reintroduce a server-only import into a restyled client component and confirm `npm run build` fails with an import-trace error; then confirm it builds cleanly again with the real, correct code. This proves FR-017 / SC-004's guard is still live, not accidentally weakened by the restyle.

## Step 2 — Diff review (proves FR-016 / AC-5 / SC-005)

```bash
git diff --stat -- lib/db/schema.ts drizzle/           # MUST be empty
git diff --stat -- lib/db lib/auth-server.ts lib/env.ts lib/actions   # MUST show no logic changes
git diff --stat package.json package-lock.json         # MUST show no new dependency
```

Review the full `git diff` for the branch and confirm every changed line is either: (a) a new file under `components/admin/`, or (b) a JSX structure / `className` change inside an existing admin page or form component. Any line that changes a Server Action body, a DAL call's arguments, a validation rule, or `requireAuth()` usage is a violation — stop and report it, per the non-negotiable boundary.

## Step 3 — Deploy to the Replit environment

Follow the project's existing deploy flow (local → GitHub → Replit auto-deploy from `main`/`master`, or the feature-branch preview mechanism already in use for this project). Wait for the deploy to be live before proceeding — local verification alone does not satisfy AC-4/FR-019.

## Step 4 — Deployed-URL walkthrough (proves AC-1..AC-4, SC-001..SC-003, SC-006)

Open the deployed admin URL. **Keep the browser console open for every step below.**

1. **Sign in.** Confirm the sign-in page renders styled and authentication succeeds.
2. **Shell (AC-1).** On every admin page visited below, confirm: a persistent sidebar shows Dashboard / Leads / Articles / Projects / Sign out; the current page's nav item is visually indicated as active; the page has a styled header; the overall look is neutral gray + one accent, light mode.
3. **Dashboard.** Open `/admin`. Confirm no console errors.
4. **Leads list (AC-2).** Open `/admin/leads`. Confirm the list renders as a styled table with legible rows and a status badge per lead. Change one lead's status via the restyled control and confirm it persists (reload and re-check). Confirm no console errors.
5. **Articles list (AC-2).** Open `/admin/articles`. Confirm grouped rows/cards with EN/AR badges, the "Add \<language\> version" affordance, and edit/delete/preview actions (preview visible only for published rows). Confirm no console errors.
6. **Projects list (AC-2).** Open `/admin/projects`. Confirm styled table/cards with cover thumbnail, title, category, and featured/showcase badges. Confirm no console errors.
7. **Article form — create (AC-3, AC-4).** Open `/admin/articles/new`. Confirm styled fields/labels/buttons/sections, including the cover-image control, the Markdown body editor with inline-image insert, and the related-project/related-solution selects. Create a test article titled `zz-restyle-test-en` with a cover image and one inline body image; leave it as a draft first, save, then edit it to add a published-at date and mark it published. Confirm inline validation errors (e.g. try submitting without a cover image first) render styled and correctly. Confirm no console errors throughout.
8. **EN↔AR pairing (AC-4).** From the test article, use the "Add Arabic version" affordance, fill the AR counterpart (`zz-restyle-test-ar`), and save.
9. **Public rendering (AC-4, SC-006).** Visit the published test article's public URL — confirm it renders correctly. Confirm the still-unpublished counterpart (if applicable) or a known draft still 404s on its public URL.
10. **Project form — create (AC-3, AC-4, highest-risk file — verify independently and thoroughly).** Open `/admin/projects/new`. Confirm styled canonical fields, all three image-upload controls, EN/AR content sections, the system-cards and results repeatable-row builders, and chip inputs. Create a test project `zz-restyle-test-project` with all three images populated, one system card added via the repeatable-row builder, one result added, and both EN/AR content sections filled. Save and confirm the transactional create succeeded (project appears in the list, both language variants present). Confirm no console errors.
11. **Project public rendering (SC-006).** Visit the test project's public URL — confirm it renders correctly.
12. **Edit flows.** Edit the test article and the test project through their restyled edit forms; confirm all fields round-trip correctly and saves succeed.
13. **Sign out / sign in again.** Confirm the restyled sign-out control still works and the session behavior is unchanged.
14. **Delete (cleanup — leaves the DB clean).** Delete the test article (all language rows) and the test project through the restyled delete controls. Confirm each disappears from its admin list and its public URL now returns not-found.
15. **Final console check (SC-003).** Confirm zero console errors were observed across the entire walkthrough, with particular attention to the prior env-leak error class ("Invalid environment configuration", "process.exit is not a function") — its absence proves FR-017 held on the deployed environment, not just locally.

## Step 5 — Report

Record: which steps passed, any deviation from expected behavior (treat any behavioral deviation, however small, as a blocking regression per the non-negotiable boundary — do not classify a behavior change as an acceptable side effect of restyling), and confirmation that the database contains no leftover `zz-restyle-test-*` records after Step 4.14.
