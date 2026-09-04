# Article Detail Page — Forensic Audit (Current State)

Audit only. No files modified, no dependencies installed, no schema changes. Read-only inspection of the current `/articles/[slug]` and `/ar/articles/[slug]` implementation, plus a direct read-only query against the live database, for use in a later redesign.

**Stack:** Next.js 16.3.1 (App Router) · Drizzle ORM · Neon serverless Postgres
**Revalidation:** `revalidate = 3600` (ISR) on both the EN and AR detail routes
**Sample data:** `translation_group_id 17550cb7-cd40-404d-9e6e-7c3c8b540a62` — article id 33 (en) ↔ id 34 (ar). This is the **only** translation-paired article group currently in the database, so it's used throughout as the EN/AR reference pair (full content in [§10](#10-real-data-sample)).
**Environment note:** `next.config.ts`'s `headers()` sends a blanket `X-Robots-Tag: noindex, nofollow` on every route unless `INDEXING_ENABLED=true` — that var is unset in this workspace's `.env.local`. May be a deliberate non-production safeguard; noted only because it affects what you'll observe checking live SEO behavior here.

---

## Contents

00. [Scope](#00-scope)
01. [File map](#01-file-map)
02. [Page structure, top to bottom](#02-page-structure-top-to-bottom)
03. [Hero / header audit](#03-hero--header-audit)
04. [Typography — English vs Arabic](#04-typography--english-vs-arabic)
05. [Content renderer behavior](#05-content-renderer-behavior)
06. [Metadata & structured data](#06-metadata--structured-data)
07. [Images & cover handling](#07-images--cover-handling)
08. [Related content logic](#08-related-content-logic)
09. [Responsive behavior](#09-responsive-behavior)
10. [Real data sample](#10-real-data-sample)
11. [Current limitations & notable behaviors](#11-current-limitations--notable-behaviors)

---

## 00. Scope

This audit inspects the live route components, their imports, the Drizzle schema, and two real published rows pulled directly from the connected database (read-only `SELECT`s, no writes). Nothing below is inferred — every claim traces to a specific file/line or a query result.

---

## 01. File map

### Routes

| File | Role |
|---|---|
| `app/(en)/(public)/articles/[slug]/page.tsx` | EN article detail route. Data fetch, `generateStaticParams`, `generateMetadata`, full JSX tree. |
| `app/ar/(public)/articles/[slug]/page.tsx` | AR article detail route. Line-for-line the same component structure and logic as the EN file, with Arabic strings hardcoded inline and `LANGUAGE = "ar"`. |
| `app/(en)/(public)/articles/page.tsx` / `app/ar/(public)/articles/page.tsx` | Article listing pages (context only — the "All articles" back-link on the detail page returns here). |

### Shared rendering

| File | Role |
|---|---|
| `components/article-markdown.tsx` | The one Markdown renderer used by both languages: `react-markdown` + `remark-gfm`, custom `a`/`img`/`p` renderers, YouTube auto-embed, Tailwind Typography (`prose`) wrapper. |
| `components/fallback-image.tsx` | Plain `<img>` wrapper; swaps to an inline SVG placeholder `onError`. |
| `lib/image-fallback.ts` | The fallback data-URI SVG ("No image" on slate) and the error handler. |
| `components/article-language-alternate.tsx` | Client component; pushes the real translation counterpart's URL into context so the navbar's language switcher points at the actual sibling article, not a guessed path. |
| `lib/language-alternate-context.tsx` | The React context `ArticleLanguageAlternate` writes into and `LanguageSwitcher` reads from. |

### Layout & shell

| File | Role |
|---|---|
| `app/(en)/layout.tsx` / `app/ar/layout.tsx` | Root `<html lang dir>` per language, loads `fontVariables` (all three font families, both languages), sets the sitewide `<title>` template. |
| `app/(en)/(public)/layout.tsx` / `app/ar/(public)/layout.tsx` | Thin wrappers that hand `language` to `SiteShell`. |
| `components/site-shell.tsx` | Navbar + footer + Organization JSON-LD, wraps every public page including the article detail page. |
| `components/site-header.tsx` | Sticky nav, logo, desktop/mobile nav links, language switcher slot, "Book a strategy call" CTA. |
| `components/language-switcher.tsx` | EN⇄AR toggle. Resolves the counterpart path, or falls back to `/articles` if a page (like this one) declares an override of `null`. |
| `app/globals.css` | Tailwind entry, CSS custom properties (color tokens), the `[dir="rtl"]` font-swap rules, keyframes, `.card-lift`. |
| `tailwind.config.ts` | `fontFamily.sans/display/mono` tokens, color tokens. **No custom `typography` theme block** — `prose` uses the Tailwind Typography plugin's stock defaults. |

### Data & domain logic

| File | Role |
|---|---|
| `lib/db/schema.ts` | Drizzle schema — the `articles` table, `language_enum`, unique/index constraints. |
| `lib/db/articles.ts` | `getArticleBySlug`, `getPublishedArticleSlugs`, `getPublishedCounterpartSlug` (public reads) + full admin CRUD. |
| `lib/db/portfolio.ts` | `getRelatedProjectCard` — joins `projects` + `project_translations` for the "Related project" card. |
| `lib/db/images.ts` + `app/api/image/[id]/route.ts` | Cover images and inline body images are base64 blobs in an `images` table, streamed back as `image/webp` by UUID. |
| `lib/db/index.ts` | Neon serverless Postgres pool + Drizzle instance. |
| `lib/article-date.ts` | `formatArticleDate` — `Intl.DateTimeFormat`, locale `en-GB` (EN) vs `ar-EG-u-nu-latn` (AR). |
| `lib/article-solutions.ts` | `RELATED_SOLUTIONS` — the 4 fixed solution ids, no DB enum. |
| `lib/category-label.ts` | `formatCategoryLabel` — replaces hyphens with spaces, nothing else (no capitalization, no i18n). |
| `lib/language.ts` | `Language` type, path-prefixing helpers, per-language `dir`/`htmlLang`/`ogLocale` table. |
| `lib/slug-param.ts` | `normalizeSlugParam` — works around a documented Next 16/Turbopack bug where an Arabic slug arrives percent-encoded in the page component but decoded in `generateMetadata` for the same request. |

### Metadata, SEO, fonts

| File | Role |
|---|---|
| `lib/metadata.ts` | `buildPageMetadata` — canonical URL, hreflang alternates, OpenGraph, Twitter card. |
| `lib/structured-data.ts` | `buildArticleJsonLd`, `buildOrganizationJsonLd` — schema.org. |
| `lib/site.ts` | `siteUrl`, default OG image path, logo path. |
| `lib/fonts.ts` | Self-hosted `next/font` definitions: Inter, Space Grotesk, Cairo. |
| `next.config.ts` | Legacy redirects; the environment-gated `X-Robots-Tag` header logic noted above. |

### Admin authoring (produces the content this page renders)

| File | Role |
|---|---|
| `app/(en)/admin/(protected)/articles/body-editor.tsx` | The only authoring surface for `article.body` — a plain `<textarea>` with a 5-button Markdown toolbar (bold, italic, H2, H3, link) and an image-upload button that inserts `![](/api/image/<uuid>)` at the cursor. English-only UI, used for both EN and AR bodies. |
| `app/(en)/admin/(protected)/articles/article-form-schema.ts` | Zod validation — title/slug/excerpt/body/coverImage required; slug pattern differs for EN (`[a-z0-9-]`) vs AR (Arabic block + digits + hyphen). |

---

## 02. Page structure, top to bottom

Actual rendered order, including the layout chrome that wraps the page. Conditional blocks are marked; nothing here is inferred.

### English — `/articles/[slug]`

```
SiteHeader (fixed nav)                                  [layout]
<script> Article JSON-LD                                [invisible]
ArticleLanguageAlternate                                [invisible, sets context]
  "All articles" link
  "Draft" pill                                           [dead code — see §11]
  H1 — article.title
  Date line                                              [if publishedAt]
Cover image (16:9)
Article body — ArticleMarkdown
"Next step" section                                      [if relatedProject or relatedSolution]
  Related project card                                   [if relatedProjectId]
  Related solution card                                  [if relatedSolution]
CTA — "Want to talk about this?"
WhatsappCta (floating)                                   [layout]
Footer                                                    [layout]
```

### Arabic — `/ar/articles/[slug]`

```
SiteHeader (fixed nav)                                  [layout]
<script> Article JSON-LD                                [invisible]
ArticleLanguageAlternate                                [invisible, sets context]
  "كل المقالات" link
  "مسودة" pill                                            [dead code — see §11]
  H1 — article.title
  Date line                                              [if publishedAt]
Cover image (16:9)
Article body — ArticleMarkdown
"الخطوة التالية" section                                  [if relatedProject or relatedSolution]
  مشروع ذو صلة card                                       [if relatedProjectId]
  حل ذو صلة card                                          [if relatedSolution]
CTA — "تريد الحديث عن هذا؟"
WhatsappCta (floating)                                   [layout]
Footer                                                    [layout]
```

Structurally identical component trees. Every difference between the two languages is a string swap or a CSS logical-property flip — there is no branch in either file that adds or removes a section based on language.

---

## 03. Hero / header audit

What the brief calls the "hero" is a plain `<header>` — no image bleed, no card, just a decorative blurred circle behind the copy.

| Element | EN | AR | Source |
|---|---|---|---|
| Eyebrow / category | Not present on the detail page (only the listing page has an eyebrow) | Not present | — |
| Breadcrumb | Not a breadcrumb trail — a single "All articles" text link, no `nav`/`aria-label`, no BreadcrumbList schema | Same pattern | `page.tsx:108-112` |
| Title (H1) | text-3xl→4xl, `font-display font-bold leading-[1.15] tracking-tight text-white` | Same classes, RTL-mirrored via `dir="rtl"` on `<html>` | `page.tsx:120-122` |
| Excerpt / deck | Never rendered in the body — `article.excerpt` only feeds `<meta description>`, OG/Twitter, and the listing-page card | Same | `lib/db/articles.ts` |
| Publish date | `font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400`, e.g. "2 September 2026" | Same classes; Arabic month name + **Latin digits** (locale forces `-u-nu-latn`) | `page.tsx:123-127`, `lib/article-date.ts` |
| Updated date | Not displayed anywhere publicly — `updatedAt` exists only in the schema/admin table | Same | `lib/db/schema.ts:76` |
| Author / byline | No author field in the schema, form, or page — none anywhere in the article system | Same | — |
| Reading time | Not computed or displayed; no word-count logic exists in the codebase | Same | — |
| Language indicator | Implicit only, via the navbar's Globe icon; no "EN"/"AR" badge on the article itself | Same | `components/language-switcher.tsx` |
| Social / share controls | None — no share buttons, no copy-link, no Twitter/LinkedIn intents | Same | — |
| Cover image | `aspect-[16/9] w-full rounded-xl border border-slate-800 object-cover`, `alt=""` always empty | Same | `page.tsx:132-137` |
| Decorative background | One 420×420px radial blur, `bg-primary/[0.10] blur-3xl`, positioned `-top-40 end-[-120px]` (logical `end` correctly flips per direction) | Same | `page.tsx:106` |

---

## 04. Typography — English vs Arabic

Both root layouts load all three font variables (Inter, Space Grotesk, Cairo) **regardless of language** — the split happens purely in CSS, via two rules in `app/globals.css`:

```css
[dir="rtl"] body {
  font-family: var(--font-cairo), var(--font-inter), sans-serif;
}
[dir="rtl"] .font-display {
  font-family: var(--font-cairo), var(--font-space-grotesk), sans-serif;
}
```

Everything below follows from those two rules plus the fact that **Tailwind Typography's `prose` plugin is used with zero custom theme config** — no `font-family` override anywhere in `.prose`, so body copy inherits from `<body>`.

### English (dir="ltr")

- **H1 / H2 / H3** — Space Grotesk → Inter → sans-serif, via `.font-display` and `.prose-headings:font-display`
- **Paragraph** — Inter (inherited from `body.font-sans`)
- **Metadata** (eyebrows, date, back-link) — `.font-mono` → system mono stack (SF Mono/Menlo/Consolas), not a webfont
- **Blockquote** — Inter; `prose-blockquote:not-italic` cancels the plugin's default italic
- **List** — Inter (unchanged by Typography plugin)
- **Captions** — none exist; images have no visible caption element
- **Code** — Tailwind Typography's own baked-in mono stack (ui-monospace/SFMono/Menlo/Consolas) — a second, independently-defined mono stack, incidentally near-identical to the site's `--font-mono` token

### Arabic (dir="rtl")

- **H1 / H2 / H3** — Cairo → Space Grotesk → sans-serif
- **Paragraph** — Cairo (via the `[dir="rtl"] body` rule)
- **Metadata** — still the Latin system-mono stack — `.font-mono` is a class selector applied directly to the element, which wins over the inherited body rule. See finding below.
- **Blockquote** — Cairo, same italic cancellation
- **List** — Cairo
- **Captions** — none exist
- **Code** — same Tailwind Typography mono stack — no Arabic glyph coverage

> **Finding — the Arabic date line likely isn't rendering in the "mono" typeface at all.** The publish date on the AR page is Arabic month names in Latin digits (e.g. forced to "2" by `ar-EG-u-nu-latn`), styled with `font-mono`. None of that stack's fonts (`ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas`) ship Arabic glyphs, so the Arabic month name in that line silently falls through to the browser's generic fallback — breaking the mono-eyebrow aesthetic that's consistent everywhere else on the page. This is invisible in code review; it only shows up when the AR page is actually rendered.

---

## 05. Content renderer behavior

`components/article-markdown.tsx` is the single source of Markdown behavior for both languages (and for the admin's live preview). It wraps `react-markdown` with `remark-gfm` and three custom element renderers:

| Markdown element | Rendered as | Notes |
|---|---|---|
| `a` | Internal (`/…`) → `next/link`, styled span. External → `<a target="_blank" rel="noopener noreferrer">` | Both get identical underline styling: `text-primary underline decoration-primary/40` |
| `img` | `FallbackImage`, always `loading="lazy"`, `rounded-xl border border-slate-800` | Alt text passed through as-is; nothing renders a caption even when authors write one |
| A paragraph whose only child is a bare YouTube link | 16:9 `<iframe>` to `youtube-nocookie.com`, replacing the link entirely | `title="YouTube video"` is hardcoded English — never localized even on AR pages |
| Everything else (h1–h6, blockquote, lists, code, tables, hr, strong/em) | Default `react-markdown` elements, styled only via the `prose-*` modifier classes listed in §04 | No custom renderer overrides these — GFM tables/strikethrough would render with zero site-specific styling beyond Typography defaults |

> **Both real published articles are almost entirely plain paragraphs.** See §10 for exact counts — between them, the two live articles contain zero headings, zero bold text, zero blockquotes, zero fenced code blocks, and exactly one real embed (an image) plus one auto-embedded video, both in the Arabic article only. The prose styling for H2–H4, lists, blockquotes and code exists and works, but nothing in production currently exercises it.

---

## 06. Metadata & structured data

| Field | Source | Notes |
|---|---|---|
| `<title>` | `article.title` | Suffixed "— OmniflowAI" by the root layout's `title.template` |
| `<meta description>`, OG/Twitter description | `article.excerpt` | The only place this field is ever shown — never in the visible page body (see §03) |
| Canonical | `buildAbsoluteUrl(getLanguagePath("/articles/"+slug, language))` | Absolute URL, language-prefixed |
| `hreflang` alternates | `getPublishedCounterpartSlug` | Only emits the other language's URL if that counterpart is **published** — a draft counterpart is treated as if it doesn't exist |
| OG image | `article.coverImage` | Falls back to `/og-default.png` only if empty — unreachable for articles, since `coverImage` is a required, non-null field end to end |
| OG type | `"article"` | Passed explicitly from the page (default is `"website"`) |
| JSON-LD | `buildArticleJsonLd` | `headline, description, image, datePublished, inLanguage, url, mainEntityOfPage, publisher` — **no `author` and no `dateModified`** property at all |

Every article page carries **two** `<script type="application/ld+json">` tags: an `Organization` schema injected by `SiteShell` on every public page, plus the page's own `Article` schema.

---

## 07. Images & cover handling

- Cover images and any inline body images are **not files** — they're base64-encoded blobs in a Postgres `images` table (`lib/db/schema.ts:149-155`), referenced by `/api/image/<uuid>`.
- `app/api/image/[id]/route.ts` validates the id against a UUID regex, decodes the stored `data:image/webp;base64,…` string, and streams it back as `image/webp` with a one-year immutable cache header.
- Rendering goes through a plain `<img>` (`components/fallback-image.tsx`) — **not** `next/image`. No responsive `srcset`, no automatic sizing/format negotiation beyond whatever was uploaded as WebP.
- On load failure, `onImageError` swaps `src` to a hand-built inline SVG (dark slate rectangle, "No image" label) — same fallback for cover and inline body images, in both languages.
- Cover image `alt` is hardcoded to `""` on the detail page itself (decorative in markup terms) — no accessible name is ever supplied for the cover image, even when a more descriptive one would be available.

---

## 08. Related content logic

- **Related project** — `article.relatedProjectId` is a single nullable FK to `projects` (`ON DELETE SET NULL`). `getRelatedProjectCard` joins `projects` + `project_translations` for the current language and returns one card: title, category, slug → links to `/portfolio/[slug]`.
- **Related solution** — a free-text column matched against a hardcoded 4-item map (`SOLUTION_NAMES`) duplicated verbatim in both page files: `foundation, growth-engine, scale-infrastructure, custom`. Links to `/solutions#<id>` (an anchor, not a dedicated page).
- **Related article** — there is no "related articles" feature at all. The only cross-linking on the detail page is the single project/solution pair above, plus the translation counterpart surfaced through the language switcher.
- The "Next step" section renders only if at least one of the two exists; with neither, the page goes straight from the article body to the closing CTA.
- **The related-solution name is never translated on the Arabic page** — `SOLUTION_NAMES` is the same English-keyed object in both files, and the AR page wraps the output in `dir="ltr" … rtl:text-end` rather than substituting Arabic labels. A reader on the Arabic article sees "Foundation" or "Growth Engine" in Latin script, right-aligned, inside an otherwise fully Arabic card.

---

## 09. Responsive behavior

Tailwind's default breakpoints are used unmodified (`sm` 640px, `md` 768px, `lg` 1024px). The article page itself only reacts at `sm` and `md` — `lg` is never referenced anywhere in either page file.

- Reading column is `mx-auto max-w-3xl` (768px) at every width from `md` up — it does not widen further on large desktop viewports.
- Side gutters: `px-6` (24px) below 768px, `md:px-8` (32px) from 768px up.
- H1: `text-3xl` (30px) → `sm:text-4xl` (36px) at 640px, and stays there — no further scale-up at `md`/`lg` (the listing page's H1, by contrast, keeps scaling to `text-5xl` at `md`).
- "Next step" cards: `grid-cols-1` → `sm:grid-cols-2` at 640px.
- Section vertical padding steps up once, at `md`: header/body/next-step `py-12 → md:py-16`; CTA `py-16 → md:py-20`.
- Cover image keeps a fixed `aspect-[16/9]` at every width; the decorative header blur stays a fixed 420×420px regardless of viewport.
- Navbar collapses to a hamburger + full-height overlay menu below `md` (768px) — this is layout-level, not specific to the article page.
- No container queries anywhere; no dedicated print stylesheet.

---

## 10. Real data sample

The only translation-paired article group in the database, queried directly (read-only) for this audit.

### EN · id 33 · `from-inbox-to-insight-how-we-integrated-claude-into-our-daily-business-operation`

- **Title:** From Inbox to Insight: How We Integrated Claude into Our Daily Business Operations
- **Excerpt:** "What we see slowing growth in medium-sized companies, and the systems that remove it. Written for the people who have to decide."
- **publishedAt:** 2026-09-02T02:23:55Z · **relatedSolution:** foundation · **relatedProjectId:** null
- **Body stats:** 4,296 chars · 680 words · 0 images · 0 video embeds · 0 headings · 0 bold · 0 blockquotes · 0 fenced code blocks

### AR · id 34 · `من-البريد-الإلكتروني-إلى-الرؤية-الثاقبة-كيف-دمجنا-كلود-في-عملياتنا-اليومية-في-مص`

- **Title:** من البريد الإلكتروني إلى الرؤية الثاقبة: كيف دمجنا "كلود" في عملياتنا اليومية في مصر
- **Excerpt:** قصة نجاح شركة مصرية في توظيف الذكاء الاصطناعي لتحسين الإنتاجية وتوفير الوقت، من إعداد التقارير إلى خدمة العملاء، مع أمثلة واقعية من السوق المصري.
- **publishedAt:** 2026-09-02T02:27:42Z · **relatedSolution:** growth-engine · **relatedProjectId:** null
- **Body stats:** 5,325 chars · 823 words · 1 image (`![](/api/image/9167238d-0494-499c-afea-6d26e50ed53c)`) · 1 video embed (bare YouTube URL, auto-embedded) · 0 headings · 0 bold · 0 blockquotes · 0 fenced code blocks

> **These are not equivalent translations in structure.** The EN version mentions "Watch our CTO walk through the first 30 seconds…" with no link — nothing embeds. The AR version has the same sentence *and* an actual YouTube URL on its own line (auto-embeds via the renderer's paragraph check) *and* an inline image that EN has no equivalent of, plus extra localized market context (Egypt-specific stats, named local companies) not present in the EN body at all. A redesign that assumes "the AR page is the EN page translated" should verify that assumption per-article — this pair shows it doesn't hold.

### Arabic body — opening excerpt (as authored)

> المشكلة: الكفاءة مقابل الروتين
>
> كل شركة في مصر تواجه نفس الاختناق مع التوسع: الروتين الإداري. في شركتنا الناشئة، كنا نقضي وقتًا أطول في تلخيص الاجتماعات، وصياغة رسائل المتابعة، وتنسيق التقارير، أكثر مما نقضيه في البيع والإبداع. احتجنا حلًا لا يقتصر على أتمتة المهام، بل يفهم السياق أيضًا.
>
> وفقًا لتقرير مايكروسوفت، تحتل مصر المركز الخامس بين الدول الأفريقية الأكثر استخدامًا للذكاء الاصطناعي التوليدي، حيث يستخدم 14.8% من السكان أدوات مثل "كلاود" و"تشات جي بي تي" و"جيميناي".

(Rendered live in Cairo at 400 weight, RTL — not a system-font approximation, per the `[dir="rtl"] body` rule in §04.)

---

## 11. Current limitations & notable behaviors

Observed directly in the code paths above — grouped by what a redesign will actually need to account for.

### Dead / unreachable code in the page components

- **The "Draft" pill can never render.** Both `page.tsx` files call `notFound()` whenever `!article.published`, before the JSX that checks `!article.published` again to show a "Draft"/"مسودة" badge. By the time that JSX runs, `published` is always `true` — the badge is unreachable in production.
- **Two more ternaries guard on an already-guaranteed condition.** `article.published ? await getPublishedCounterpartSlug(...) : null` and the identical pattern for `articleJsonLd` both branch on `article.published`, which is always `true` at that point in the function for the same reason as above. Harmless today, but worth knowing before anyone "fixes" the visible symptom (no Draft badge ever showing) by editing the wrong line.

### Content gaps a UX reviewer should expect

- **No author, no reading time, no updated-date, no share controls, no breadcrumb, no on-page excerpt.** All confirmed absent by direct inspection (schema, form, and page JSX) — not "not yet found," genuinely not implemented anywhere in the system.
- **Related-solution names are English-only, even on the Arabic page.** See §08.
- **The two real articles barely touch the Markdown feature set the renderer supports.** Zero headings, bold, blockquotes, or fenced code across both live bodies (§05/§10). A redesign investing heavily in rich prose styling (pull quotes, code blocks, callouts) should confirm with content authors whether that content will ever actually appear, or design instead for the plain-paragraph-plus-occasional-image reality that exists today.
- **EN/AR "translation pairs" are not guaranteed to be structurally equivalent.** The one real pair in the database differs in embedded media, added local context, and length (§10). Treat each language's article as its own document, not a mirrored translation, when designing layout that depends on content shape (e.g., pull quotes, sidebars keyed to word count).

### Accessibility & i18n edge cases

- **Cover image `alt` is always empty.** Both languages, always `alt=""` — treated as purely decorative regardless of content.
- **The YouTube embed's `iframe title` is hardcoded English** ("YouTube video") on both the EN and AR page — never localized.
- **Arabic metadata text likely loses its monospace styling.** See the finding in §04 — the date line's font-family wins by class specificity over the RTL body override, but the mono stack it resolves to has no Arabic glyphs.
- **Footer copy has an open TODO for Arabic.** `components/site-shell.tsx:84-88` — the AR "Services"/"Company" footer column headings are left `null` (rendering nothing) with a code comment: no reachable live Arabic site existed to confirm the correct copy against. This affects every public page the footer appears on, article pages included.

### Infrastructure notes worth carrying into a redesign

- **Images are DB blobs, not files or a CDN.** No `next/image` optimization, no responsive `srcset` — a redesign that wants art-directed or multi-size cover images will need new infrastructure, not just new markup.
- **ISR revalidation is 3600s on both the detail and listing routes.** A published edit can take up to an hour to appear publicly; relevant if a redesign adds anything time-sensitive (e.g., a "just published" indicator).
