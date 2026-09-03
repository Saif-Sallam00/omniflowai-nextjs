---

description: "Task list for Slice 5.7: Dedicated SITE_URL environment variable"
---

# Tasks: Dedicated `SITE_URL` Environment Variable

**Input**: Design documents from `/specs/014-site-url-env/` (plan.md, spec.md, research.md, data-model.md, quickstart.md)

**Prerequisites**: plan.md (approved), spec.md (approved)

**Tests**: No dedicated automated test suite is introduced — this feature is validated by the manual before/after byte-identical comparison and build-failure checks defined in `quickstart.md`, consistent with how the four existing `lib/env.ts` variables are already verified (no unit tests exist for that schema either). Every verification task below cites the spec.md identifier it satisfies.

**Organization**: Tasks are grouped by user story (US1 = P1, US2 = P2, US3 = P3, per spec.md). Every task runs against `npm run build && npm start` — never the dev server — because `lib/env.ts` only validates when `NODE_ENV === "production"`, which only `next build`/`next start` sets.

**Expected changed files**: `lib/env.ts`, `lib/site.ts`, `.env.example`. Any other file changing is scope drift and must be reported before commit (constitution IV — Scope Discipline).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1/US2/US3), or none for Setup/Foundational/Polish/Deployment phases

---

## Phase 1: Baseline Capture (BLOCKING — no citation, constitution-level gate)

**Purpose**: Capture the pre-change rendered output before any file is touched. A baseline captured after the change is worthless — this exact hazard was caught at Gate 4 of Slice 5.5 and is why this task is first and hard-blocking here.

**⚠️ CRITICAL**: T001 MUST complete before T002, T003, or T009 (every task that touches `lib/env.ts`, `lib/site.ts`, or `.env.example`) may begin. This is a constitution III (Verify Before Declaring Done) gate; spec.md's FR-008/SC-001 depend on this baseline existing, but the *act* of capturing it is a verification precondition, not itself a requirement spec.md states.

- [ ] T001 On the current, unmodified `master` tree, run `npm run build && npm start` and capture the exact rendered output of all 10 surfaces defined in `quickstart.md` Step 1 — EN/AR home, EN/AR about, one EN/AR article detail page, one EN/AR portfolio detail page, `/sitemap.xml` (full body), `/robots.txt` (full body) — saved to `before/...` files for later diffing. For each HTML surface, record `<link rel="canonical">`, both hreflang alternates, `og:url`, `og:image`, and the Organization JSON-LD `@id`/`url`. *(Supports SC-001/FR-008; no FR of its own — a verification precondition, per constitution III.)*

**Checkpoint**: Baseline captured. Code changes may now begin.

---

## Phase 2: Foundational (Blocking Prerequisites for US1 and US2)

**Purpose**: Add `SITE_URL` to the environment schema. Both US1 (site identity now reads it) and US2 (its validation behavior) depend on this existing first.

**⚠️ CRITICAL**: Depends on T001. Blocks T003 (US1) and T006–T008 (US2).

- [ ] T002 In `lib/env.ts`, add `SITE_URL` to `envSchema`: required (`min(1, "SITE_URL is required")`), URL-validated (`.url("SITE_URL must be a valid URL")`), and rejecting a trailing slash via a `.refine()` (or equivalent) with a message that explicitly names the trailing-slash rule (e.g. `"SITE_URL must not end with a trailing slash"`), distinct from the generic URL-format message. Do not require an `https` scheme. Leave the `BETTER_AUTH_URL` entry in the same schema completely unchanged. *(FR-001, FR-002, FR-003; FR-004 satisfied by leaving `BETTER_AUTH_URL` untouched.)*

**Checkpoint**: `SITE_URL` exists in the schema with full validation. US1 and US2 work can begin.

---

## Phase 3: User Story 1 - Decouple public site identity from the auth variable (Priority: P1) 🎯 MVP

**Goal**: `siteUrl` (and everything built from it) reads from `SITE_URL` instead of `BETTER_AUTH_URL`, with zero observable output change when `SITE_URL` holds the value `BETTER_AUTH_URL` currently does.

**Independent Test**: Set `SITE_URL=http://localhost:3000` (matching local `BETTER_AUTH_URL`), rebuild, and diff all 10 surfaces against the T001 baseline — zero diffs (except the documented `<lastmod>` caveat) confirms the story.

### Implementation for User Story 1

- [ ] T003 [US1] In `lib/site.ts`, change `export const siteUrl = env.BETTER_AUTH_URL;` to `export const siteUrl = env.SITE_URL;`. Leave `DEFAULT_OG_IMAGE_PATH` and `LOGO_PATH` unchanged. Depends on: T001, T002. *(FR-005, FR-006.)*
- [ ] T004 [US1] Per `quickstart.md` Steps 2–3: set `SITE_URL=http://localhost:3000` in `.env.local` (the same value local `BETTER_AUTH_URL` already holds — using the production value here is a test-design error, not an alternative), run `npm run build && npm start`, capture the same 10 surfaces into `after/...`, and diff every pair against the T001 baseline. Apply the `<lastmod>` caveat to `/sitemap.xml` only (a `<lastmod>`-only diff is acceptable if a confirmed content edit occurred between captures; any other diff is a defect). Depends on: T001, T003. *(FR-008, SC-001.)*
- [ ] T005 [US1] With the T004 build still running, exercise a full login and logout cycle through Better Auth and confirm no behavioral change. Depends on: T003. *(SC-004, confirms FR-004's "no change to Better Auth" holds in practice.)*

**Checkpoint**: User Story 1 is independently functional and verified — public URLs are now sourced from `SITE_URL`, byte-identical to before, and auth is unaffected.

---

## Phase 4: User Story 2 - Fail fast on missing or malformed configuration (Priority: P2)

**Goal**: A production build refuses to run with a missing, empty, or trailing-slash `SITE_URL`, and accepts a non-`https` value.

**Independent Test**: Run three local production builds — unset, trailing-slash, and `http://localhost:3000` — and confirm the expected pass/fail outcome and error content for each.

### Implementation for User Story 2

- [ ] T006 [P] [US2] Per `quickstart.md` Step 4: unset `SITE_URL` and run `npm run build`. Confirm the build fails (non-zero exit) before producing output, with an error message naming `SITE_URL`, and that there is no fallback to `BETTER_AUTH_URL`'s value anywhere in the result. Depends on: T002. *(FR-001, FR-002, SC-002.)*
- [ ] T007 [P] [US2] Per `quickstart.md` Step 4: set `SITE_URL="https://omniflowai.net/"` (trailing slash) and run `npm run build`. Confirm the build fails with an error message stating the trailing-slash rule explicitly. Depends on: T002. *(FR-002, SC-003.)*
- [ ] T008 [P] [US2] Per `quickstart.md` Step 4: set `SITE_URL="http://localhost:3000"` and run `npm run build`. Confirm the build succeeds — an `https` scheme is not required. Restore this value afterward for T004/T005. Depends on: T002. *(FR-003.)*

**Checkpoint**: User Stories 1 AND 2 both verified independently — the split is both correct (US1) and safe against misconfiguration (US2).

---

## Phase 5: User Story 3 - Document the new variable for future setup (Priority: P3)

**Goal**: `.env.example` documents `SITE_URL` clearly enough that no one has to reverse-engineer the `SITE_URL`/`BETTER_AUTH_URL` split from code.

**Independent Test**: Read `.env.example` cold and correctly explain what `SITE_URL` is for and why it differs from `BETTER_AUTH_URL`.

### Implementation for User Story 3

- [ ] T009 [US3] In `.env.example`, add a `SITE_URL=` entry alongside the existing required variables, with a comment stating it must have no trailing slash and that it is the public site origin used for canonicals, hreflang, Open Graph, and JSON-LD — distinct from `BETTER_AUTH_URL`. Depends on: T001. *(FR-007.)*
- [ ] T010 [US3] Read the updated `.env.example` with no other context and confirm the `SITE_URL` comment alone correctly conveys its purpose and its distinction from `BETTER_AUTH_URL`. Depends on: T009. *(FR-007 acceptance scenario.)*

**Checkpoint**: All three user stories independently functional and verified.

---

## Phase 6: Polish & Quality Gate (no story label — constitution-level, no spec.md citation)

**Purpose**: The project-wide quality gate constitution III requires before any batch is accepted, plus the scope-discipline check constitution IV requires.

- [ ] T011 Run `npm run check`, `npm run lint`, and `npm run build`; confirm all three exit zero. Depends on: T003, T009. *(Constitution III — Verify Before Declaring Done. No spec.md FR/SC citation; this is the standing quality gate every batch passes.)*
- [ ] T012 Run `git diff --stat` and confirm only `lib/env.ts`, `lib/site.ts`, and `.env.example` appear. Report any other changed file before commit. Depends on: T003, T009. *(Constitution IV — Scope Discipline. No spec.md FR/SC citation.)*

**Checkpoint**: Ready for operator review and commit.

---

## Phase 7: Deployment Sequencing (no story label — runs only after operator approves the commit)

**Purpose**: `lib/env.ts` fails the production *build* (not just runtime) without `SITE_URL`, so the secret must exist before the code deploys. Per Gate 2's plan.md, the Replit Autoscale failed-build question is informational only and does not gate this phase.

**⚠️ Do not start this phase until the operator has reviewed and approved the commit from Phases 1–6.**

- [ ] T013 Set `SITE_URL=https://omniflowai.net` (the value derived at Gate 2 via PV-1) in Replit Secrets for the production deployment, and confirm it is visible to that deployment. Depends on: operator commit approval. *(FR-009.)*
- [ ] T014 Deploy the approved commit to production. Depends on: T013. *(FR-009.)*

---

## Phase 8: Post-Deploy Verification (SEPARATE — runs only after the operator approves the commit and T014 deploy completes; NOT part of the implementation run)

- [ ] T015 Re-fetch `https://omniflowai.net/`, `https://omniflowai.net/about`, `https://omniflowai.net/sitemap.xml`, and `https://omniflowai.net/robots.txt` and confirm every canonical/hreflang/og:url/og:image/JSON-LD `@id`/`url` field and the full sitemap/robots bodies match the **PV-2b** baseline recorded in `plan.md` exactly (not PV-2, which is stale and superseded). Apply the `<lastmod>` caveat from `quickstart.md` if `/sitemap.xml` differs only in that field with a confirmed content edit. Depends on: T014. *(FR-009, SC-005.)*

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Baseline Capture)**: No dependencies. HARD-BLOCKS Phase 2 and every code-touching task (T002, T003, T009).
- **Phase 2 (Foundational)**: Depends on Phase 1 (T001). Blocks Phase 3 (T003) and Phase 4 (T006–T008).
- **Phase 3 (US1)**: Depends on Phase 2 (T002) and Phase 1 (T001).
- **Phase 4 (US2)**: Depends on Phase 2 (T002). Independent of Phase 3.
- **Phase 5 (US3)**: Depends on Phase 1 (T001) only — independent of Phases 3 and 4 (`.env.example` doesn't interact with either).
- **Phase 6 (Polish)**: Depends on all code-touching tasks (T003, T009) being complete.
- **Phase 7 (Deployment)**: Depends on operator approval of the Phase 1–6 commit. Not started automatically.
- **Phase 8 (Post-Deploy Verification)**: Depends on Phase 7 (T014). Runs strictly after deploy, never as part of the local implementation/verification run.

### Parallel Opportunities

- T006, T007, T008 (US2) are marked [P] — each is an independent build run with a different `SITE_URL` value and can be executed in any order once T002 is done.
- Phase 3 (US1) and Phase 5 (US3) touch disjoint files (`lib/site.ts` vs `.env.example`) and can proceed in parallel once their respective dependencies clear.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (T001 — baseline, blocking).
2. Complete Phase 2 (T002 — schema).
3. Complete Phase 3 (T003–T005 — US1: the decouple itself, byte-identical proof, auth regression check).
4. **STOP and VALIDATE**: US1 alone already delivers the core safety property (FR-008) and is independently demonstrable.

### Incremental Delivery

1. Phase 1 → Phase 2 → Foundation ready.
2. Phase 3 (US1) → byte-identical refactor proven → this is the MVP.
3. Phase 4 (US2) → fail-fast behavior proven.
4. Phase 5 (US3) → documentation in place.
5. Phase 6 → quality gate + scope check → ready for operator review.
6. Phase 7 → Phase 8, only after explicit operator approval — never bundled into the implementation run.

---

## Task Citation Summary

Every task cites a spec.md FR/SC identifier except T001, T011, and T012, which are stated plainly above as constitution-level gates (III — Verify Before Declaring Done; and the baseline-capture precondition those same criteria depend on) with no direct spec.md requirement of their own.
