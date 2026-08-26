# Slice 1C — Portfolio & Article read paths (DB-driven)

**Working on:** master (solo-dev, commit-per-slice, review + quality gate before commit).
**Source of truth:** `docs/omniflow-extract-4.md` (portfolio/article layouts, markdown pipeline, data shapes), `case_study_page_redesign_final.md` + preview (the NEW portfolio detail design), Decision 013 (schema), EX-03 (slug URLs). Design tokens/components already in the app from 1B.
**Depends on:** 1B complete (design system, shared layout, fonts, bands).
**Splits into two sub-slices:** 1C-portfolio and 1C-articles. Ship and review separately; both close 1C.

This is the first slice that reads from Postgres. Everything before rendered DB sections as empty. The rendering path changes from "static, DB untouched" to Server Component → Drizzle → ISR.

---

## Cross-cutting decisions (apply to both sub-slices)

- **Rendering: ISR (static + on-demand revalidation).** Portfolio and article pages render statically and revalidate when content changes (publish/edit from the future admin triggers `revalidatePath`/`revalidateTag`). Not per-request dynamic. Satisfies constitution P-02 (meaningful HTML in initial response) and P-04 (correct indexability). `generateStaticParams` enumerates known slugs at build; new/edited content regenerates on demand. Phase 2's publish flow will call the revalidation hooks — 1C just sets the pages up as ISR-capable and uses a sane `revalidate` fallback.
- **Data path: Server Component → Drizzle direct** (constitution P-05, one DB, no JSON API for own frontend). No `useQuery`, no `/api/*` fetch for these pages. The old react-query calls become direct `storage`-layer DB reads in the Server Component. The old Express endpoints are not recreated.
- **Bilingual by architecture:** EN at root, AR under `/ar/*`. Portfolio/article content resolves from the per-language row (`project_translations` / the article's own `language` row) by the URL's language. URL is the sole source of truth.
- **URL preservation + EX-03:** article URLs stay slug-based per language (unchanged). Portfolio URLs move to slug-based (EX-03); `projects.slug` is the lookup key. Legacy `/portfolio/7` and `/portfolio/8` 301-redirect to their slugs (fixed 2-entry map, not a DB lookup).
- **404 / draft handling:** unknown slug → Next `notFound()`. A draft (article `published = false`) is a 404 to unauthenticated requests, deliberately indistinguishable from a nonexistent slug (matches the old `WHERE slug = $1 AND (published = true OR <authed>)` behavior). Projects have no draft flag in scope — all projects are public.
- **No new dependencies** except `react-markdown` + `remark-gfm` (already mandated by the constitution for articles). Flag anything else before adding.

---

# Sub-slice 1C-portfolio

## Prerequisite: schema revision (Decision 013)

First deliverable, before any page code:

1. Revise `lib/db/schema.ts` per Decision 013 — `projects` gains `slug`/`logo`/`media_image`; `project_translations` drops `challenge`/`diagnosis`/`solution` and gains the case-study fields (`category_label`, four client fields, problem/diagnosis/system headlines+bodies, `system_cards` jsonb, re-shaped `results` jsonb, `media_caption`, `cta_*`). Define the `system_cards.icon` pick-list as a shared const.
2. `npx drizzle-kit generate --name case_study_schema` → committed migration. Apply to the target DB (zero rows, so no data concern).
3. **AC:** the migration applies clean; `SELECT` on both tables shows the new columns; old flat fields are gone; all four application tables still hold zero rows (portfolio content is entered later — Phase 4 for real data; sample content is preview-only per the Content Integrity Rule and must not be seeded into the live DB).

## Portfolio list page — `/portfolio`, `/ar/portfolio`

Port the old list *layout* (extract-4 §1) — grid, cards — but with these changes:

- **Bilingual:** read projects + their current-language translation; render `title`, `category_label`, thumbnail (`cover_image`) from the per-language row.
- **Category tabs:** render a tab only for categories that actually have ≥1 project (the old `presentCategories` behavior). If only one category is present, suppress the tab bar. Category filter is client state (tabs), no URL write.
- **CUT the `?service=` pillar deep-link entirely** (per operator decision). Remove the pillar-compose logic, the `CATEGORY_TO_PILLAR` read, the `window.location.search` mount read. Category tabs only.
- **Card links use the slug** (`/portfolio/{slug}`, `/ar/portfolio/{slug}`), not id.
- **Empty state:** the single "no projects in this category" copy (extract-4 §1), both languages.
- No featured/showcase special-casing on this page (old app didn't either).

## Portfolio detail page — `/portfolio/[slug]`, `/ar/portfolio/[slug]` — NEW DESIGN

**Do NOT port the old detail layout.** Build the case-study template from `case_study_page_redesign_final.md` and the preview HTML. Sections in order: Back-link → Hero (two-column: left = category label + title + description; right = client-identity card, logo-dominant, four-field dot-separated caption) → 01 Problem (headline+body) → 02 Diagnosis (headline+body) → 03 System (headline + dynamic `system_cards` grid, `repeat(auto-fit,minmax(...))`, 2–6 cards) → Case-study media (bordered container, `media_image` + optional caption; dashed placeholder when absent) → Results (dynamic metric cards, number-first, orange value, muted label) → Tech stack (pills from `technologies`) → CTA (headline+subtext, defaulting to the locked measurement-wedge copy when the per-project override is blank) → footer.

Build details:
- **Data:** one Server Component read joining `projects` + `project_translations` for the URL language, by `slug`. `notFound()` if no project with that slug.
- **Bilingual + RTL:** all text from the current-language translation; layout mirrors correctly RTL. Results `value` is language-neutral (same string both languages); `label` per language. Client-identity caption keeps LTR-anchoring where the design shows it (e.g. Latin sector/country names), same pattern 1B used for solution names.
- **Section rhythm:** alternate `bg` between the two dark shades per the redesign spec (base `#0F1729` / darker `#0B1220`) — map these to the existing band tokens from 1B rather than hardcoding hex; use the design's alternation order.
- **Mobile:** hero two columns stack, identity card **below** the title block (title/description read first).
- **Icons:** `system_cards.icon` resolved through the fixed pick-list → lucide component (same id→icon internal-resolution pattern 1B-interactive used to avoid passing component refs across the server/client boundary).
- **CTA default:** the measurement-wedge copy is the fallback string (bilingual) baked in; per-project `cta_headline`/`cta_subtext` override when present.
- **Legacy redirects:** `/portfolio/7` → `/portfolio/{slug7}`, `/portfolio/8` → `/portfolio/{slug8}`, 301. Two-entry map (config or `redirects()` in `next.config.ts`).

## 1C-portfolio acceptance criteria

1. Schema revision migration applies clean; new columns present; old flat fields gone; tables still zero-row.
2. `/portfolio` + `/ar/portfolio` render the grid bilingually; tabs show only present categories; sparse content doesn't look broken; no `?service=` behavior remains.
3. Card links resolve to `/portfolio/{slug}` (and `/ar/...`); clicking reaches the right case study.
4. Detail page renders all case-study sections in order, bilingually, RTL-correct, from real DB fields — with a seeded **preview-only** sample project used for verification, then removed (not shipped).
5. Dynamic sections handle variable counts (2–6 system cards, N metrics) without layout break; absent media shows placeholder, not a hole.
6. CTA falls back to the default copy when override blank; uses override when set.
7. Legacy `/portfolio/7` and `/portfolio/8` 301-redirect to slugs.
8. `notFound()` on unknown slug (not an uncaught error).
9. Pages are ISR (static shell, `generateStaticParams` for known slugs, revalidation hooks in place).
10. Quality gate green; build route table shows portfolio routes as static/ISR (● or ○ w/ revalidate), not pure dynamic (ƒ) unless justified.

---

# Sub-slice 1C-articles

Faithful port of the old article pages (extract-4 §3, §4) — **no redesign**, unlike portfolio.

## Article list — `/articles`, `/ar/articles`

- Port layout (extract-4 §3): card grid, cover image, excerpt, published date, tags.
- **Published-only:** list shows `published = true` rows for the current language.
- **Date formatting:** port `formatArticleDate` verbatim — EN `en-GB`, AR `ar-EG-u-nu-latn` (Western numerals both languages, per the existing spec rule). NaN-guard returns empty string.
- Card links `/articles/{slug}` (already slug-based; unchanged).
- Empty state copy, both languages (extract-4 §3).

## Article detail — `/articles/[slug]`, `/ar/articles/[slug]`

- Port layout (extract-4 §4): hero (title, cover, published date), body, NEXT STEP section.
- **The markdown pipeline — port verbatim (extract-4 §4), this is the load-bearing part:**
  - `react-markdown` + `[remarkGfm]` only. No rehype plugins (no `rehype-raw`).
  - Custom `urlTransform`: `data:image/*` passes through unmodified; everything else → `defaultUrlTransform` (default sanitization). This exact function — no rehype-sanitize schema, no MIME whitelist beyond the regex.
  - `components` override map: `a` (internal `/`-links → **`next/link`** wrapping a styled span, external → real `<a target=_blank rel=noopener noreferrer>` — swap wouter `Link` → `next/link`, keep the `startsWith('/')` branch); `img` (forced lazy/async + shared error fallback + fixed classes); `p` (YouTube-alone-in-paragraph → `youtube-nocookie` iframe embed, else normal `<p>`). No other element overrides — `prose-*` Tailwind classes on the wrapper carry the rest.
- **NEXT STEP** cross-link: related project card links to the project's **slug** (`/portfolio/{slug}`, per EX-03 — NOT the old `/portfolio/{id}`); related solution card links to `/solutions#{relatedSolution}`. Both optional; section absent when neither set. Resolve the related project by slug/id from the DB directly (Server Component), not a client `/api/projects` fetch.
- **Draft = 404** to unauthenticated: `notFound()` when the article is unpublished and the request isn't authed. Same message for nonexistent and draft (no slug-existence leak).

## 1C-articles acceptance criteria

1. `/articles` + `/ar/articles` list published articles for the language; dates format per-locale with Western numerals; empty state correct.
2. Article detail renders bilingually; markdown pipeline produces correct output — internal links are `next/link` (no full reload), external links open safely, `data:image/*` renders, `data:text/html` is sanitized away, YouTube-alone paragraphs embed.
3. NEXT STEP related-project link uses the slug (EX-03), not id.
4. Unknown slug and unpublished-draft-while-unauthed both `notFound()`.
5. ISR: static shell + `generateStaticParams` for published slugs + revalidation hooks.
6. Quality gate green; article routes static/ISR.

---

## Verification & handoff (both sub-slices)

- Quality gate mandatory (`check`/`lint`/`build` zero).
- Operator runtime check: both languages, RTL, the case-study page with a **preview-only** sample project (then removed), the markdown pipeline with a test article containing an internal link, external link, a `data:image/*`, a `data:text/html` attempt, and a YouTube link.
- Report: build route table (confirm portfolio/article routes are static/ISR, not unexpectedly dynamic), quality-gate results, and confirmation no non-1C section changed.
- **Do not commit** — operator reviews each sub-slice, then commits on master (`1C-portfolio: ...`, `1C-articles: ...`).

## Parked items to fold in here

- **Footer column headings** (`footer.services`/`footer.company` values) — still absent from all extractions. Grab from the live site and add during 1C.
- **Static image assets** (client logos, story image) — migrate from the old repo into `/public` as needed. The case-study logo/media are per-project data-URIs (admin-entered), but any shared marketing images still need migrating.

## Sequencing note

Recommend **1C-portfolio first** (it carries the schema revision that Phase 2 admin and Phase 4 migration both depend on — proving it early de-risks the most), then **1C-articles** (self-contained faithful port). Each needs its own extraction-backed structure — portfolio detail from the redesign docs, everything else from extract-4.
