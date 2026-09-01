---

description: "Task list for Sitemap + Production Robots (Phase 3, Slice 3b)"
---

# Tasks: Sitemap + Production Robots

**Input**: Design documents from `/specs/009-sitemap-robots/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/crawler-endpoints.md](./contracts/crawler-endpoints.md), [quickstart.md](./quickstart.md)

**Tests**: No automated test tasks — the spec's own quality gate (FR-6.1 / FR-019) is `npm run check` / `npm run lint` / `npm run build`, and correctness is proven via the local two-mode production-build verification in [quickstart.md](./quickstart.md), per research.md §5. No test framework changes are in scope for this slice.

**Organization**: Tasks are grouped by user story (US1–US5 from spec.md), in priority order (P1 stories first, then P2). Because this feature is 1 new file + 2 edited files, most tasks within a story touch the same file sequentially — `[P]` is used only where a task is truly independent of every other pending task.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Every task names its exact file path

## Non-negotiables (pinned from research.md / plan.md — do not reopen)

1. `app/sitemap.ts` reads `process.env.INDEXING_ENABLED` directly; returns `[]` when NOT `"true"`.
2. `app/robots.ts` production branch adds a `sitemap` reference and 11 named AI-crawler `Allow: /` rules; the existing generic `User-agent: *` rule and the staging branch are preserved unchanged.
3. `next.config.ts` production branch returns two path-scoped `X-Robots-Tag: noindex` rules (`/admin/:path*`, `/api/:path*`); the staging branch is preserved byte-for-byte.
4. No schema change, no migration, no logging code touched, `INDEXING_ENABLED` is never flipped anywhere persisted.

---

## Phase 1: Setup

**Purpose**: Confirm the local environment can run the two-mode production-build verification this feature depends on for every acceptance check. No new dependencies, no new project structure — nothing to scaffold.

- [x] T001 Confirm `.env.local` has a valid `DATABASE_URL` and every other var `lib/env.ts` requires, and that the database has at least one published article in each language and at least one project — needed so later verification steps in every user-story phase have real data to assert against. No file changes; this is a readiness check only.

**Checkpoint**: Local production builds (`INDEXING_ENABLED=true npm run build && npm run start`, and the same without the flag) are known to work against real data before any code is written.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the one shared entry point (`app/sitemap.ts`) that every sitemap-related user story (US1, US2, US5) builds on, with the staging gate in place from the start so the file is never in a state that could leak a populated sitemap.

**⚠️ CRITICAL**: T002 must be complete before any task in US1, US2, or US5.

- [x] T002 Create `app/sitemap.ts`: `import type { MetadataRoute } from "next"`, `import { siteUrl } from "@/lib/site"`, `import { getLanguagePath } from "@/lib/language"`. Default-export `function sitemap(): Promise<MetadataRoute.Sitemap>` (or sync, per the DAL calls used later) that, as its first statement, checks `if (process.env.INDEXING_ENABLED !== "true") return [];` (research.md §1 — this is what makes staging's empty sitemap self-enforcing, independent of any other file). Leave the rest of the function returning `[]` as a placeholder — US1 fills it in.

**Checkpoint**: `app/sitemap.ts` exists, compiles, and already satisfies US5's core invariant (empty in staging) even before population logic is added.

---

## Phase 3: User Story 1 - A crawler can discover every public URL (Priority: P1) 🎯 MVP

**Goal**: In production mode, `/sitemap.xml` lists every static public page, every published article, and every project — both languages, absolute URLs, `/services` and drafts/admin/api excluded.

**Independent Test**: Local production build with `INDEXING_ENABLED=true`, `curl http://localhost:3000/sitemap.xml`, and visually confirm every expected URL is present and nothing excluded appears.

### Implementation for User Story 1

- [x] T003 [US1] In `app/sitemap.ts`, inside the `INDEXING_ENABLED === "true"` branch, build the static-page entries: for each of `/`, `/about`, `/solutions`, `/contact`, `/articles`, `/portfolio` (NOT `/services` — it's a redirect, excluded per FR-002/FR-005) and for each language `"en"` and `"ar"`, push `{ url: \`${siteUrl}${getLanguagePath(path, lang)}\` }` into a local `entries` array.
- [x] T004 [US1] In `app/sitemap.ts`, add published-article entries: `import { getPublishedArticles } from "@/lib/db/articles"`; call `getPublishedArticles("en")` and `getPublishedArticles("ar")`; for each returned `ArticleListItem`, push `{ url: \`${siteUrl}${getLanguagePath(\`/articles/${item.slug}\`, lang)}\`, lastModified: item.publishedAt ?? undefined }` — using the item's own real per-language `slug` (never a same-slug guess across languages), satisfying US2's resolvability requirement by construction.
- [x] T005 [US1] In `app/sitemap.ts`, add project entries: `import { getPortfolioSlugs } from "@/lib/db/portfolio"`; call `getPortfolioSlugs()` once; for each returned slug and for each language `"en"`/`"ar"`, push `{ url: \`${siteUrl}${getLanguagePath(\`/portfolio/${slug}\`, lang)}\` }` — no `lastModified` field (research.md §2: omitted, no new DAL read added).
- [x] T006 [US1] In `app/sitemap.ts`, return the combined `entries` array (static + articles + projects) from the `INDEXING_ENABLED === "true"` branch, replacing the Phase 2 placeholder. Run `npm run check` to confirm the file type-checks against `MetadataRoute.Sitemap`.

**Checkpoint**: `app/sitemap.ts` is feature-complete for production mode. User Story 1 is independently testable via the Independent Test above.

---

## Phase 4: User Story 2 - The sitemap reflects real, resolvable URLs (Priority: P1)

**Goal**: Confirm every URL the sitemap lists actually resolves to a 200 — proving T004's use of each article's own real per-language slug (not a naive same-slug guess) actually works end-to-end, including for Arabic-script slugs.

**Independent Test**: Pull a sample of URLs directly from the `/sitemap.xml` output and request each one; every one returns 200.

### Verification for User Story 2

- [x] T007 [US2] Local verification (production mode): `INDEXING_ENABLED=true npm run build && INDEXING_ENABLED=true npm run start &`, then `curl -s http://localhost:3000/sitemap.xml` and extract 5–6 sample URLs: one EN article, one AR article (prefer one with an Arabic-script slug, per US2/AC-2), one project's EN URL, the same project's AR URL, and two static pages (one EN, one AR). For each, run `curl -so /dev/null -w "%{http_code}\n" "<url>"` and confirm `200` for all. Stop the server afterward.

**Checkpoint**: User Stories 1 and 2 together deliver a fully populated, fully resolvable sitemap in production mode.

---

## Phase 5: User Story 5 - Staging stays fully deindexed (Priority: P1)

**Goal**: Confirm the sitemap gate added in Phase 2 actually holds — a staging-mode build never publishes a populated sitemap — as the safety invariant underpinning every other story.

**Independent Test**: Local production build with `INDEXING_ENABLED` unset, `curl http://localhost:3000/sitemap.xml`, confirm it's an empty `<urlset>` with no `<url>` entries.

### Verification for User Story 5

- [x] T008 [US5] Local verification (staging mode): `npm run build && npm run start &` (no `INDEXING_ENABLED` set). Run `curl -s http://localhost:3000/sitemap.xml` and confirm the response is an empty `<urlset xmlns="..."></urlset>` — zero `<url>` elements. Also run `curl -s http://localhost:3000/robots.txt` (expect unchanged `User-agent: *` / `Disallow: /`) and `curl -sI http://localhost:3000/` (expect `X-Robots-Tag: noindex, nofollow`) as a baseline snapshot of current staging behavior, to compare against after US3/US4's edits in T011/T012. Stop the server afterward.

**Checkpoint**: All three P1 user stories (US1, US2, US5) are complete — the sitemap is correct, resolvable, and safe by default. This is a coherent, shippable increment on its own.

---

## Phase 6: User Story 3 - Production robots points to the sitemap and welcomes AI crawlers (Priority: P2)

**Goal**: In production mode, `/robots.txt` references `/sitemap.xml` and explicitly allows the 11 named AI crawlers, while the existing generic rule and the staging branch are untouched.

**Independent Test**: Local production build with `INDEXING_ENABLED=true`, `curl http://localhost:3000/robots.txt`, confirm the `Sitemap:` line, all 11 AI-crawler blocks, and the preserved generic block are present.

### Implementation for User Story 3

- [x] T009 [US3] Edit `app/robots.ts`'s `INDEXING_ENABLED === "true"` branch: change `rules` from a single object to an array. Keep the existing `{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] }` as the first element, unchanged. Append one rule object per AI-crawler token from research.md §3 — `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `anthropic-ai`, `Claude-User`, `CCBot`, `PerplexityBot`, `Perplexity-User`, `Google-Extended`, `Applebot-Extended` — each as `{ userAgent: "<token>", allow: "/", disallow: ["/admin/", "/api/"] }`. Add a top-level `sitemap: \`${siteUrl}/sitemap.xml\`` field (import `siteUrl` from `@/lib/site`). Leave the `INDEXING_ENABLED` unset/falsy branch (`{ rules: { userAgent: "*", disallow: "/" } }`) completely untouched.
- [x] T010 [US3] Review `git diff -- app/robots.ts` to confirm the staging (`else`) branch has zero changes — only the `INDEXING_ENABLED === "true"` branch was touched.
- [x] T011 [US3] Local verification (production mode): `INDEXING_ENABLED=true npm run build && INDEXING_ENABLED=true npm run start &`, `curl -s http://localhost:3000/robots.txt`, confirm: a `Sitemap:` line with the absolute `/sitemap.xml` URL; 11 separate `User-agent:` blocks (one per AI-crawler token) each with `Allow: /`, `Disallow: /admin/`, `Disallow: /api/`; and the original `User-agent: *` block still present with the same rules. Then re-run the staging-mode check from T008 (`npm run build && npm run start &` with `INDEXING_ENABLED` unset, `curl /robots.txt`) and confirm it still matches the T008 baseline exactly. Stop servers afterward.

**Checkpoint**: US1, US2, US3, US5 complete — crawlers can now discover the sitemap and AI crawlers are explicitly welcomed, with staging behavior verified unchanged.

---

## Phase 7: User Story 4 - Admin/API stay out of the index even in production (Priority: P2)

**Goal**: In production mode, every `/admin/*` and `/api/*` response carries `X-Robots-Tag: noindex`; public routes carry no such header; staging's blanket header rule is untouched.

**Independent Test**: Local production build with `INDEXING_ENABLED=true`, compare `X-Robots-Tag` headers on an admin path, an api path, and a public path.

### Implementation for User Story 4

- [x] T012 [US4] Edit `next.config.ts`'s `headers()` function: replace the `INDEXING_ENABLED === "true"` branch's `return [];` with:
  ```ts
  return [
    {
      source: "/admin/:path*",
      headers: [{ key: "X-Robots-Tag", value: "noindex" }],
    },
    {
      source: "/api/:path*",
      headers: [{ key: "X-Robots-Tag", value: "noindex" }],
    },
  ];
  ```
  Leave the `else` branch (`return [{ source: "/(.*)", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];`) byte-for-byte unchanged.
- [x] T013 [US4] Review `git diff -- next.config.ts` to confirm the staging (`else`) branch has zero changes — only the `if (INDEXING_ENABLED === "true")` branch's return value was touched.
- [x] T014 [US4] Local verification (production mode): `INDEXING_ENABLED=true npm run build && INDEXING_ENABLED=true npm run start &`. Run `curl -sI http://localhost:3000/admin | grep -i x-robots-tag` (expect `X-Robots-Tag: noindex`), `curl -sI http://localhost:3000/api/health | grep -i x-robots-tag` (expect `X-Robots-Tag: noindex`), `curl -sI http://localhost:3000/ | grep -i x-robots-tag` (expect no output — header absent), `curl -sI http://localhost:3000/about | grep -i x-robots-tag` (expect no output). Then re-run the staging-mode check (`npm run build && npm run start &` with `INDEXING_ENABLED` unset), `curl -sI http://localhost:3000/` and `curl -sI http://localhost:3000/admin`, confirm both still carry `X-Robots-Tag: noindex, nofollow` (the same blanket rule, matching the T008 baseline). Stop servers afterward.

**Checkpoint**: All five user stories (US1–US5) are complete and independently verified.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final non-negotiable gates from the plan — confirm the change stayed exactly as scoped, and run the full quality gate + end-to-end regression pass.

- [x] T015 [P] Zero-schema-drift gate: run `git diff --stat -- lib/db/schema.ts drizzle/` and confirm it produces no output (empty diff) — no schema change, no migration, per FR-018/AC-7.
- [x] T016 [P] Diff-scope gate: run `git diff --stat` (whole working tree) and confirm the changed files are exactly `app/sitemap.ts` (new), `app/robots.ts`, and `next.config.ts` — nothing else, including no changes to `.env.local`, Replit secrets/config, or any deployment configuration (confirms `INDEXING_ENABLED` was never flipped anywhere persisted).
- [x] T017 [P] No-logging-code-touched gate: run `git diff --stat -- lib/logger.ts app/api/health app/api/image` and confirm it produces no output (empty diff), per the settled out-of-scope constraint.
- [x] T018 Full quality gate: run `npm run check` (zero TypeScript errors), `npm run lint` (zero ESLint errors), and `npm run build` (succeeds) — FR-019/AC-7.
- [x] T019 Run the complete two-mode regression pass from [quickstart.md](./quickstart.md) Parts A, B, and C end-to-end as final signoff: production mode (AC-1 through AC-5), staging mode (AC-6), and the diff/quality checks (AC-7, overlapping with T015–T018) — confirms no existing public route's rendering, metadata, canonical, or hreflang output changed anywhere in the process.

**Checkpoint**: Feature complete, verified against every acceptance criterion (AC-1–AC-7) and every non-negotiable, ready for review.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. BLOCKS Phases 3, 4, 5 (all touch `app/sitemap.ts`, created in T002).
- **US1 (Phase 3)**: Depends on Foundational (T002). Independent of US3/US4.
- **US2 (Phase 4)**: Depends on US1 (needs a populated sitemap to spot-check).
- **US5 (Phase 5)**: Depends on Foundational (T002) for the gate; independent of US1/US2/US3/US4, but sequenced after them here since it also captures a staging baseline used by later verification tasks (T011, T014).
- **US3 (Phase 6)**: Depends on Foundational only, not on US1/US2/US5 — touches a different file (`app/robots.ts`). Could run in parallel with Phase 3–5 by a second developer; sequenced after here for a single-developer, priority-ordered flow.
- **US4 (Phase 7)**: Depends on Foundational only — touches a different file (`next.config.ts`). Independent of US1/US2/US3/US5; could run in parallel.
- **Polish (Phase 8)**: Depends on all five user stories being complete.

### Within Each User Story

- Phase 3 (US1): T003 → T004 → T005 → T006, strictly sequential — all edit the same file (`app/sitemap.ts`), each building on the previous section.
- Phase 6 (US3): T009 → T010 → T011, sequential — edit, then review the diff, then verify.
- Phase 7 (US4): T012 → T013 → T014, sequential — edit, then review the diff, then verify.

### Parallel Opportunities

- **T015, T016, T017** (Phase 8) are mutually independent `git diff --stat` checks against disjoint path sets — safe to run in parallel (marked `[P]`).
- **US3 (Phase 6, `app/robots.ts`)** and **US4 (Phase 7, `next.config.ts`)** touch different files from each other and from US1/US2/US5 (`app/sitemap.ts`) — a second developer could implement Phase 6 or 7 concurrently with Phase 3–5, provided both wait for T002 (Foundational) first.
- Within Phase 3, 6, and 7, tasks are same-file sequential chains — no `[P]` opportunities there by design (avoids merge conflicts within a single small file).

---

## Parallel Example: Cross-Story (multi-developer)

```bash
# After T002 (Foundational) is committed, these can run in parallel:
Task: "T003-T006 [US1] Populate app/sitemap.ts (static pages, articles, projects)"
Task: "T009-T011 [US3] Edit app/robots.ts (sitemap ref + AI-crawler rules)"
Task: "T012-T014 [US4] Edit next.config.ts (production noindex header rule)"

# T007 [US2] and T008 [US5] each depend on T003-T006 being complete first.
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 5 — all P1)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Complete Phase 3 (US1): sitemap is populated in production mode.
3. Complete Phase 4 (US2): verify every listed URL resolves.
4. Complete Phase 5 (US5): verify staging still gets an empty sitemap.
5. **STOP and VALIDATE**: at this point `/sitemap.xml` alone is a complete, shippable increment — crawlers can discover and resolve every public URL, and staging safety is proven, even before `robots.txt`/header changes land.

### Incremental Delivery

1. Setup + Foundational → sitemap gate exists.
2. US1 + US2 + US5 → sitemap fully populated, verified resolvable, verified staging-safe (MVP).
3. US3 → `robots.txt` references the sitemap and welcomes AI crawlers.
4. US4 → `/admin`/`/api` get the hardened header in production.
5. Polish → all non-negotiable gates (schema, diff-scope, logging, quality) confirmed, full regression pass run.

Each increment is independently valuable: a populated-but-unreferenced sitemap (after step 2) already helps any crawler that discovers `/sitemap.xml` directly; step 3 adds discoverability via `robots.txt`; step 4 adds defense-in-depth for admin/API.
