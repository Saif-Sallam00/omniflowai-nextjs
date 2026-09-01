# Articles CRUD — Extraction (Phase 2, Slice 2b prep)

Read-only extraction. No app code written, no Spec Kit run, nothing committed. This grounds the spec for Slice 2b (Articles CRUD); it does not decide anything.

---

## 1. Articles schema as-built (source of truth)

`lib/db/schema.ts:56-91`, `articles` table, verbatim:

```ts
export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    translationGroupId: uuid("translation_group_id")
      .notNull()
      .default(sql`gen_random_uuid()`),
    language: languageEnum("language").notNull(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    body: text("body").notNull(),
    coverImage: text("cover_image").notNull(),
    published: boolean("published").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    relatedProjectId: integer("related_project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    relatedSolution: text("related_solution"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("articles_language_slug_unique").on(table.language, table.slug),
    unique("articles_translation_group_id_language_unique").on(
      table.translationGroupId,
      table.language,
    ),
    index("articles_language_published_published_at_idx").on(
      table.language,
      table.published,
      table.publishedAt.desc(),
    ),
    index("articles_translation_group_id_idx").on(table.translationGroupId),
  ],
);
```

**Columns** (13): `id serial pk` · `translation_group_id uuid not null default gen_random_uuid()` · `language language_enum not null` · `slug text not null` · `title text not null` · `excerpt text not null` · `body text not null` · `cover_image text not null` · `published boolean not null default false` · `published_at timestamptz` (nullable) · `related_project_id integer, references projects(id) on delete set null` (nullable) · `related_solution text` (nullable) · `created_at timestamptz not null default now()` · `updated_at timestamptz not null default now()`.

**Unique constraints** (2): `(language, slug)` — `articles_language_slug_unique` — and `(translation_group_id, language)` — `articles_translation_group_id_language_unique`.

**Indexes** (2): `(language, published, published_at desc)` and `(translation_group_id)`.

**Does it match Phase 0 FR-3.1 verbatim?** **Yes.** FR-3.1's `articles` spec (`specs/001-foundation-slice/spec.md:69`) lists the identical 13 columns, types, and nullability; FR-3.3 (`specs/001-foundation-slice/spec.md:78-79`) lists the identical two unique constraints; FR-3.4 (`specs/001-foundation-slice/spec.md:82-83`) lists the identical two indexes. No drift — this table has not been touched since Phase 0. (Contrast with `projects`/`project_translations`, which *have* drifted from FR-3.1 per `docs/decision-013-case-study-schema.md`; `articles` and `leads` are the two tables Decision 013 explicitly left alone.) This was already independently concluded in `docs/phase-2-admin-extract.md:221-225`; this pass confirms it by direct re-comparison of the two texts above.

This schema is the authority. Nothing below reopens it.

---

## 2. Existing articles DAL + read path

### 2.1 DAL — `lib/db/articles.ts` (73 lines, full file read)

Three exported functions, all read-only, all wrapped in React's `cache()`:

| Function | Signature | Columns selected | Filter |
|---|---|---|---|
| `getPublishedArticles` | `(language: Language) => Promise<ArticleListItem[]>` | `slug, title, excerpt, coverImage, publishedAt` | `language = ? AND published = true`, ordered `publishedAt desc` (`lib/db/articles.ts:27-41`) |
| `getPublishedArticleSlugs` | `(language: Language) => Promise<string[]>` | `slug` | `language = ? AND published = true` (`lib/db/articles.ts:43-51`) |
| `getArticleBySlug` | `(slug: string, language: Language) => Promise<Article \| null>` | `slug, title, excerpt, coverImage, body, published, publishedAt, relatedProjectId, relatedSolution` | `slug = ? AND language = ?` — **does not filter on `published`**; the caller decides what to do with a draft (`lib/db/articles.ts:53-73`) |

Two exported types, both narrower than the full row (no `id`, `translationGroupId`, `createdAt`, `updatedAt`):
- `ArticleListItem` (`lib/db/articles.ts:7-13`): `slug, title, excerpt, coverImage, publishedAt`.
- `Article` (`lib/db/articles.ts:15-25`): the above plus `body, published, relatedProjectId, relatedSolution`.

**No write function exists yet** — `createArticle`, `updateArticle`, `deleteArticle` are all net-new for 2b. There is also no `getArticleById`, no `listAllArticles` (admin, drafts included), and no function keyed by `translationGroupId` — all net-new.

### 2.2 Public read path — what the pages actually consume

Four page files, confirmed structurally identical EN/AR pairs (diffed; only copy/language differs, no logic differs):

- **List**: `app/(en)/(public)/articles/page.tsx` (84 lines) / `app/ar/(public)/articles/page.tsx` (82 lines). Calls `getPublishedArticles(LANGUAGE)` (line 23 in the EN file) and renders, per article: `coverImage` (into `<FallbackImage>`, `page.tsx:56-62`), `publishedAt` (formatted via `formatArticleDate`, `page.tsx:64-67`), `title` (`page.tsx:69-71`), `excerpt` (`page.tsx:72-74`), and links to `/articles/${slug}` (`page.tsx:53`). `body`, `relatedProjectId`, `relatedSolution`, `published` are **not** read on the list page.
- **Detail**: `app/(en)/(public)/articles/[slug]/page.tsx` (183 lines) / `app/ar/(public)/articles/[slug]/page.tsx` (182 lines). Calls `getArticleBySlug(slug, LANGUAGE)` (line 61). Uses every field of `Article`:
  - `slug` — implicit (route param), also used to build the "All articles" back-link and metadata path.
  - `title` — `<h1>` (line 92-94) and `generateMetadata`'s `title` (line 50).
  - `excerpt` — `generateMetadata`'s `description` (line 51). Not shown in the rendered body itself.
  - `coverImage` — `<FallbackImage>` (line 104-109).
  - `body` — passed to `<ArticleMarkdown body={article.body} />` (line 114) — rendered as GFM Markdown (`components/article-markdown.tsx`, full file read): supports links (internal `Link`, external `target=_blank`), images (`data:image/` URIs pass through `urlTransform` untouched — `article-markdown.tsx:8-13` — external images go through `defaultUrlTransform`), and turns a lone-line YouTube URL into an embedded iframe (`article-markdown.tsx:47-64`).
  - `published` — gates a "Draft" badge (line 86-90) and, critically, gates *visibility itself*: if `!article.published`, the detail page requires a live admin session (`auth.api.getSession`, line 64-67) or calls `notFound()` — an unpublished article is only visible to a signed-in admin previewing it, never to the public. `generateMetadata` separately falls back to generic title/description for an unpublished article (line 38-45) so a draft never leaks its real title into a `<meta>` tag / crawler.
  - `relatedProjectId` — if non-null, resolved via `getRelatedProjectCard(id, LANGUAGE)` from `lib/db/portfolio.ts` (line 69-71) and rendered as a "Related project" card linking to `/portfolio/{slug}` (line 126-140).
  - `relatedSolution` — rendered as a "Related solution" card linking to `/solutions#{slug}`, with a small hardcoded `SOLUTION_NAMES` display-name map (`[slug]/page.tsx:18-23`, values: `foundation`, `growth-engine`, `scale-infrastructure`, `custom` — the exact same four ids as the OLD `ARTICLE_SOLUTIONS` enum, confirmed in §5 below).
  - `generateStaticParams` calls `getPublishedArticleSlugs(LANGUAGE)` (line 26-28) — only published slugs are statically generated; an unpublished slug is served dynamically (falls through to the runtime `notFound()`/session check above).

**Consumer contract for any CRUD write**: a row must have a non-empty `title`, `excerpt` (feeds `<meta description>` directly, unsanitized length), `coverImage` (a URL a browser can put straight into `<img src>` — confirmed compatible with Slice 2a's `/api/image/{id}` shape, see §4), and `body` as valid Markdown (a lone YouTube link on its own line will auto-embed; images referenced by non-`data:` URL are passed through `defaultUrlTransform` unmodified). `relatedProjectId` must reference a real, existing `projects.id` or be `null` (FK is `on delete set null`, so an admin never needs to manually null this out when a project is deleted — Postgres does it). `relatedSolution` has no DB-level enum constraint (it's a bare `text` column) — the four-value list end-to-end is an application-level convention, not enforced by the schema.

---

## 3. Admin patterns to reuse (from Slice 1 — leads)

Concrete file-by-file template, from `app/(en)/admin/(protected)/**`:

| File | Role | What 2b should copy |
|---|---|---|
| `app/(en)/admin/(protected)/layout.tsx` (11 lines) | Route-group layout. Calls `await requireAuth()` (line 9) before rendering *any* protected page, then wraps children in `<AdminNav>`. | Nothing new needed — `articles/` pages placed under this same `(protected)` group inherit this gate automatically. |
| `app/(en)/admin/(protected)/admin-nav.tsx` (40 lines) | Client component, hardcoded `ADMIN_NAV_LINKS` array (`admin-nav.tsx:13-16`, currently `Dashboard` + `Leads`). | Add an `{ path: "/admin/articles", label: "Articles" }` entry — the only nav change needed. |
| `lib/db/leads.ts` (51 lines) | Flat `lib/db/<entity>.ts` DAL: `createLead`, `createNewsletterLead`, `listLeads(status?)`, `updateLeadStatus(id, status)`, `deleteLead(id)`. All plain async functions over `db` (Drizzle), no classes, verb-first names, `type Lead = typeof leads.$inferSelect`. Mutations `.returning()` and return `T \| null` on a miss (`updateLeadStatus`/`deleteLead`, lines 44,49) rather than throwing. | Direct template for `lib/db/articles.ts`'s new write functions: `createArticle`, `updateArticle`, `deleteArticle`, plus new reads (`getArticleById`, `listAllArticles`). Same `.returning()` + `null`-on-miss convention. |
| `app/(en)/admin/(protected)/leads/actions.ts` (26 lines) | Server Actions (`"use server"`). **Every** exported action calls `await requireAuth()` as its own first line (line 12, line 22) — even though the parent layout already gates the route. Belt-and-suspenders, not redundant-by-accident: the constitution's "Authorization is enforced inside Server Components, Server Actions, Route Handlers, and the DAL — never solely in `proxy.ts`" (quoted in `plan.md` of Slice 2a) means each mutation boundary re-checks independently. Actions validate input with `zod` (`statusSchema`, line 9) before touching the DAL, and call `revalidatePath("/admin/leads")` after a write (lines 18, 25). | Direct template for `app/(en)/admin/(protected)/articles/actions.ts`: each of `createArticleAction`/`updateArticleAction`/`deleteArticleAction` must independently call `requireAuth()`, validate with `zod`, call the DAL, then `revalidatePath` (at minimum `/admin/articles`; likely also the public `/articles` and `/articles/[slug]` paths per language, since those are `revalidate = 3600`-cached Server Components reading the same table — not confirmed by this extraction, flagged as an open question in §6/§8). |
| `app/(en)/admin/(protected)/leads/page.tsx` (112 lines) | Server Component. Reads `searchParams` (a `Promise`, Next 16 convention — confirmed in `[slug]/page.tsx` too), calls the DAL directly (`listLeads(status)`, line 27) with **no intermediate API route** — direct-Drizzle-read-in-Server-Component, per constitution P-05. Renders a list with inline `<form action={...}>` mutations bound via `.bind(null, id)` (line 67, 84). | Direct template for `app/(en)/admin/(protected)/articles/page.tsx` — a Server Component that calls `listAllArticles()` directly, no fetch/API layer. |
| `app/(en)/admin/(protected)/leads/delete-lead-form.tsx` (31 lines) | Small client component wrapping a Server Action in a `<form>` with a `window.confirm()` guard (line 22-26) and a `useFormStatus()`-driven disabled/pending button label. | Reusable pattern (not the component itself) for a "Delete this article?" confirmation — mirrors OLD's own `AlertDialog` confirmation (§5) conceptually, just via `window.confirm()` instead of a modal component, consistent with this codebase's plainer admin UI (compare `leads/page.tsx`'s bare Tailwind vs. OLD's shadcn/Radix dialog system, which this codebase does not have installed). |
| `app/(en)/admin/(protected)/leads/page.tsx` status filter (`STATUS_FILTERS`, `parseStatusFilter`, lines 12-18) | Reads an enum's `.enumValues` directly off the Drizzle-exported `leadStatusEnum` for both the filter UI and validation. | If 2b wants a published/draft or language filter on the admin list, `languageEnum.enumValues` (`lib/db/schema.ts:17`) is the equivalent source for a language filter; `published` is a plain boolean, not an enum, so it would need its own small `?published=true/false/all` param, not reused from an enum. |

**What Slice 1 does *not* have a precedent for**: leads has no create/edit *form* (leads are only ever created by the public contact form, `lib/contact.ts`/`components/contact-form.tsx`, and only ever mutated via a `<select>` + delete in the admin). There is **no existing admin pattern in this codebase for a multi-field create/edit form with file upload and Markdown body** — 2b's create/edit UI is new admin-UX territory, not a copy of an existing NEW-app pattern. The nearest available precedent for that specific shape is OLD's own article form (§5), not anything in this codebase today. Flagged again in §7.

---

## 4. Image upload integration point (from Slice 2a)

`app/api/image/route.ts` (49 lines, full file read), confirmed contract:

- `POST /api/image`, `multipart/form-data`, one field `file`.
- Requires a valid admin session (`getSessionOrNull`, line 10-13) — `401 { message }` on a miss, before any body is read.
- Enforces a 5 MB ceiling, both via a `Content-Length` fast-path (line 15-18) and a post-parse `.size` backstop (line 26-28) — `413 { message }` either way.
- Runs the buffer through `sharp(buffer).rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer()` (line 34-38) — `400 { message }` if `sharp` throws (undecodable/corrupt input).
- Stores the result as `data:image/webp;base64,...` via `createImage(dataUri)` (`lib/db/images.ts`, line 43-44).
- **Success response, line 46**: `Response.json({ id: image.id, url: \`/api/image/${image.id}\` }, { status: 200 })` — a short path string, **never** the data URI itself.

`app/api/image/[id]/route.ts` (33 lines, full file read) serves it back: `GET /api/image/{id}` is public (no auth), validates `id` is UUID-shaped before querying (line 12-15, a required correctness fix — a malformed id 404s instead of crashing the DB driver), returns raw bytes with `Content-Type: image/webp` and `Cache-Control: public, max-age=31536000, immutable` (line 25-30), `404 { message }` on any miss (malformed or genuinely unknown id, both identical).

**Confirmed, no ambiguity**: a consumer (2b's article form) must call `POST /api/image` and store the returned `url` field (`"/api/image/{id}"`, a ~47-character path string, confirmed by direct measurement during Slice 2a's own verification) directly into `articles.cover_image` — **not** the `id` alone, and **not** any data URI. `articles.coverImage` is a plain `text` column with no format constraint, so this is a drop-in fit: the existing public read path (§2.2) already renders `coverImage` via `<img src={article.coverImage}>`-style consumption (`components/fallback-image.tsx`), which works identically whether the string is a data URI (OLD behavior, still what `projects` tables currently hold) or a path like `/api/image/{id}` (NEW behavior) — confirmed because `FallbackImage` and `ArticleMarkdown`'s image renderer (§2.2) both just bind `src` verbatim with no format-specific logic.

**What the article form must do**: on cover-image selection, `POST` the file to `/api/image` (admin session required — the same session already guarding the rest of the admin area) as soon as the file is chosen (not deferred to article-form submit, mirroring OLD's `ObjectUploader` upload-on-select pattern, §5), store the returned `url` string in the form's `coverImage` field, and submit that string as part of the article create/update payload. No inline body-image-upload helper exists yet in NEW (OLD's `insertImage` cursor-insert helper, §5, has no NEW equivalent built — whether 2b builds one is an open question, §6/§8).

No consumer code referencing `/api/image` exists anywhere yet (confirmed via `grep -rn "api/image" app lib`, zero matches outside `app/api/image/` itself) — 2b will be the first real consumer.

---

## 5. Old-admin article behavior (`docs/phase-2-admin-extract.md`, primary source — supplemented directly from `/home/ss-dev/projects/omniflowai`, available locally)

`docs/phase-2-admin-extract.md` §2 (lines 166-324) is **not thin** — it already covers the form schema, every field, slug handling, and the translation conclusion in solid depth, all independently re-verified against the OLD source in this pass (`/home/ss-dev/projects/omniflowai/client/src/pages/admin/Articles.tsx`, `shared/schema.ts` — both available locally, quotes confirmed byte-for-byte at the cited line numbers). What follows is what §2 already has, plus direct-source supplements for what it does not cover (the list view, the server-side route/validation layer, and `publishedAt` stamping logic — none of which `docs/phase-2-admin-extract.md` §2 addresses, since it focuses on the form dialog only).

### 5.1 Already in `docs/phase-2-admin-extract.md` (cited, not reproduced in full here)

- Form schema (`Articles.tsx:37-50` per the extract, confirmed) — `title`, `slug` (regex `^[a-z0-9]+(?:-[a-z0-9]+)*$`), `excerpt` (min 20), `coverImage`, `body`, `language`, `published`, `relatedProjectId`, `relatedSolution`. Table at `phase-2-admin-extract.md:249-259`.
- Slug auto-generation from title, create-mode-only, via a local `slugify()` (`phase-2-admin-extract.md:263-274`); slug remains editable at all times, not locked.
- Body is Markdown, plain `<Textarea>`, no WYSIWYG (`phase-2-admin-extract.md:278`).
- Translation conclusion (`phase-2-admin-extract.md:282-320`): OLD has **no** translation-group concept — `language` is a plain column, `slug` is globally unique (not per-language), and an EN/AR "pair" is two fully independent, unlinked rows. This is explicitly called out in the doc's own Gaps section (`phase-2-admin-extract.md:524`) as a genuine absence in OLD, not a research gap.

### 5.2 Supplemented directly from OLD source (not in `phase-2-admin-extract.md`)

**List view** (`client/src/pages/admin/Articles.tsx:216-298`): a flat card list (not a table), one `<Card>` per article showing `coverImage` thumbnail, `title`, a Published/Draft `<Badge>`, a `language` `<Badge>`, the `/articles/{slug}` path, and three icon buttons — open the live public page in a new tab, edit (opens the same dialog pre-filled), delete (opens a confirmation `<AlertDialog>`). "New article" button opens the same dialog empty (line 233-235).

**Data fetching split** (`Articles.tsx:87-90, 165-189`): the list query (`GET /api/articles/all`) deliberately excludes `body` (`server/storage.ts:172-198`, a dedicated `cardColumns` projection reused for both the public list and the admin list) — opening the edit dialog issues a **second** fetch, `GET /api/articles/:slug`, to get the full row including `body` before populating the form (`Articles.tsx:172-175`). This is a real UX/perf pattern: list view is cheap, edit view pays for the full row only when needed.

**Server-side routes** (`server/routes.ts:251-330`, full block read):
- `GET /api/articles` — public, published-only (`storage.listPublishedArticles()`).
- `GET /api/articles/all` — admin-only (`isAuthenticated`), all rows including drafts, ordered by `updatedAt desc` (not `publishedAt` — most-recently-edited first, `server/storage.ts:192-198`).
- `GET /api/articles/:slug` — public, but a draft 404s unless `req.isAuthenticated()` (`routes.ts:265-267`) — the **exact same draft-preview-for-admins mechanic** already present in NEW's public detail page (§2.2, `[slug]/page.tsx:64-67`). This confirms the NEW behavior is a deliberate carry-forward, not a new invention.
- `GET /api/articles/:slug/cover` (`routes.ts:274-284`) — **not previously captured in `phase-2-admin-extract.md`**: a dedicated route that decodes `coverImage`'s base64 data URI and serves it as a real image response with `Cache-Control: public, max-age=3600`, specifically because "a social crawler cannot use [a data URI] as an `og:image` — it needs a URL. This is that URL" (comment, `routes.ts:271-273`). This is the direct conceptual ancestor of Slice 2a's generic `/api/image/{id}` endpoint — OLD solved this problem once, per-article, with a narrower 1-hour cache; NEW solves it once, generically, for any image, with a permanent cache.
- `POST /api/articles` (`routes.ts:286-297`) — validates with `insertArticleSchema.parse`, checks for an existing row with the same slug first and returns `409 { message: "That slug is already in use" }` if found (line 289-291) — a deliberate pre-check to produce a friendly error instead of letting the DB's unique constraint throw a raw 500.
- `PATCH /api/articles/:id` (`routes.ts:299-321`) — same slug-clash pre-check pattern, but excludes the article's own id from the clash check (`clash.id !== id`, line 309) so re-saving a row without changing its slug doesn't false-positive.
- `DELETE /api/articles/:id` (`routes.ts:323-329`) — `404` if nothing was deleted, else `204`.

**`publishedAt` stamping logic** (`server/storage.ts:245-258`, full helper read) — **not previously captured in `phase-2-admin-extract.md`**: `publishedAt` is the *first*-publication date, stamped once and then left alone on subsequent edits, so re-saving an already-published article never bumps it back to the top of a `publishedAt`-ordered index. Exact rule: an explicit `publishedAt` value from the admin always wins (back-dating is legitimate); otherwise, if the article is (or is becoming) published and had no prior `publishedAt`, stamp `new Date()`; if it's not published, `publishedAt` stays `null` (or whatever it already was). This logic lives in `storage.createArticle`/`updateArticle` (`storage.ts:210-237`), not in the form or the route — it's a DAL-layer invariant.

**`relatedSolution` value set** (`shared/schema.ts:152-157`): `ARTICLE_SOLUTIONS = ["foundation", "growth-engine", "scale-infrastructure", "custom"]` — confirmed to be the **exact same four ids** NEW's public detail page already hardcodes in its own `SOLUTION_NAMES` display map (`app/(en)/(public)/articles/[slug]/page.tsx:18-23`), meaning this convention has already silently carried forward into NEW's rendering code even though no admin write path exists yet to populate it validly.

**Duplicate-slug UX on the client** (`Articles.tsx:109-125`): the client deliberately uses a plain `fetch` instead of this OLD app's shared `apiRequest` helper for article writes specifically so a `409` reads as "That slug is already in use" in a toast, rather than a raw `"409: {...}"` string — an explicit, commented design choice (`Articles.tsx:109-112`) worth carrying forward as intent (a duplicate slug should read as an ordinary, explainable mistake) even though the concrete mechanism (fetch + toast) doesn't map onto Server Actions the same way (§7).

### 5.3 Gaps

None remaining for articles specifically — between `docs/phase-2-admin-extract.md` §2 and the direct-source supplement above, the OLD admin's article behavior (form, validation, list, routes, publish-date semantics) is now fully covered with citations. The only genuine absence (not a research gap) is the translation-pairing mechanism, already correctly identified as a ground-up build in both the extract doc and here.

---

## 6. The net-new problem: `translation_group_id` EN↔AR pairing

OLD had no concept of this at all (§5); it must be designed from scratch. Enumerating the mechanics the spec must decide — **not deciding any of them here**:

1. **Creating a new EN article (no existing counterpart)**: does the admin explicitly choose "start a new translation group" (implicit — every new article gets a fresh `gen_random_uuid()` by the column default, `lib/db/schema.ts:60-62`, so this may need no UI at all), or is there ever a case where an admin creates an AR-first article with no EN counterpart? The schema does not require an EN row to exist before an AR row can use a given `translation_group_id` — nothing enforces "every group has exactly one EN and one AR row," only that a group can have *at most one* row per language (the `(translation_group_id, language)` unique constraint, `schema.ts:80-83`, permits a group of size 0, 1, or 2 — never more than 1 per language, but never requires 2).
2. **Creating the AR counterpart of an existing EN article (or vice versa)**: what admin UX creates the second row of a pair? Options include (a) an explicit "Translate to AR" action on an existing EN article that pre-fills a new form with the same `translation_group_id` and an empty `language: "ar"`, or (b) a fully manual flow where the admin picks an existing `translation_group_id` from a dropdown when creating any article. Neither exists in this codebase; both are legitimate designs.
3. **How `(translation_group_id, language)` and `(language, slug)` interact**: these are independent unique constraints on the same table. A given `translation_group_id` can have at most one `en` row and at most one `ar` row (first constraint); within a language, `slug` must be unique (second constraint) — but the EN and AR rows of the *same* translation group are free to have completely different slugs (e.g. `/articles/our-approach` vs `/articles/نهجنا-في-العمل` or a transliterated equivalent), or could even coincidentally share the same slug string (permitted, since the uniqueness is scoped per-language). The spec must decide whether the admin UI *requires* matching slugs across a pair, allows them to differ freely, or has no opinion at all (defers to the admin's judgment, matching OLD's approach where slugs were fully independent anyway).
4. **Admin UI for a pair vs. a single-language article**: does the admin list (§3, "admin list" pattern from leads) group EN/AR rows visually by `translation_group_id` (e.g. showing "our-approach (EN, AR)" as one line with two badges), or does it list all rows flat, one per language, the same as OLD's flat per-row list (§5.2)? If grouped, what does an "orphan" (a translation group with only one language populated) look like in that list — a placeholder "no AR version" slot, or simply absent?
5. **Edit behavior across a pair**: are the EN and AR rows of a group edited via two entirely independent form instances (open one, edit its own fields, save; the other is a separate row you open separately) — the simplest option, and consistent with OLD's per-row edit model — or does editing one show/link to its counterpart in the same view (e.g. a tabbed EN/AR editor)? Nothing in this codebase's Slice 1 precedent (§3) addresses editing two linked rows in one UI; this is genuinely new interaction design.
6. **Delete behavior across a pair**: does deleting one language's row leave its counterpart untouched (independent, matching the FK-less, decoupled nature of the two unique constraints — nothing in the schema cascades a delete across languages within a group), or does the admin UI ask "delete the AR version too?" as a bundled action? The schema itself imposes no coupling — `translation_group_id` is not a foreign key to anything, just a value shared by convention — so "coupled delete" would be a UI-level decision layered on top of independent underlying rows, not a DB-level cascade.
7. **Publish behavior across a pair**: can the EN row be published while its AR counterpart is still a draft (and vice versa) — the schema permits this freely, since `published` is a per-row boolean with no cross-row check — or should the admin UI warn/prevent an asymmetric publish state? Nothing enforces "both languages publish together" today.
8. **Existing-project dropdown source for `relatedProjectId`**: OLD's form populated this from a `useQuery<Project[]>({ queryKey: ["/api/projects"] })` (`Articles.tsx:90`) fetching *all* projects via a public API route. NEW has no equivalent admin-facing "list all projects for a dropdown" DAL function yet (`lib/db/portfolio.ts` only exposes `getPortfolioListItems`, `getPortfolioSlugs`, `getRelatedProjectCard`, `getPortfolioDetailBySlug` — none return a flat `{id, title}[]` shape for a form dropdown). This is a small but real new DAL function 2b will need, independent of the translation-pairing question above but worth deciding alongside it.

---

## 7. What does not map cleanly

- **Cover-image storage shape**: OLD's `ObjectUploader` stored the upload response's `url` field directly into `coverImage` — but in OLD, that `url` *was itself* the full `data:image/webp;base64,...` string (§5.2 already noted this pattern originally in `docs/phase-2-admin-extract.md:370`; confirmed again here at `ObjectUploader.tsx`'s call site). In NEW, `POST /api/image`'s `url` field is a short path reference (`/api/image/{id}`), never the data itself (§4). The *mechanism* (upload-on-select, store the returned `url` string) carries over; the *content* of what gets stored does not — a straight copy-paste of OLD's upload-handling code would incorrectly try to store a multi-megabyte data URI where NEW expects a ~47-character path, and would in fact still technically work (the column is just `text`) but would defeat the entire point of Slice 2a's dedicated image store.
- **Inline body-image upload** (OLD's `insertImage`, `Articles.tsx:196-212`, cursor-insert Markdown helper hitting `/api/objects/upload`): no NEW equivalent exists. If 2b wants this feature, it would call `/api/image` instead, but this is a distinct, separable feature from the cover-image field and is not automatically implied by porting the rest of the form.
- **Cover-image-as-social-preview route** (OLD's `GET /api/articles/:slug/cover`, §5.2): NEW does not need an article-specific version of this — Slice 2a's generic `/api/image/{id}` already serves any stored image publicly, permanently cached, which supersedes the narrower per-article route. Nothing in 2b needs to reintroduce OLD's `:slug/cover` route.
- **Duplicate-slug 409-via-fetch-with-friendly-toast** (§5.2): OLD's specific mechanism (bypass a shared `apiRequest` helper so a 409 doesn't render as a raw `"409: {...}"` string) is a client-fetch/REST-API pattern. NEW's admin mutations are Server Actions (§3), which don't have an HTTP status code to catch client-side in the same way — a Server Action either returns a value/throws, and this codebase's existing Server Actions (`leads/actions.ts`) don't currently surface field-level or form-level error messages back to the client UI at all (they silently `return` on invalid input, `leads/actions.ts:15`). Reproducing OLD's "duplicate slug reads as a friendly, explainable error" *intent* will require a new error-surfacing mechanism for Server Actions that has no existing precedent in this codebase to copy.
- **shadcn/Radix dialog-based editor UI** (OLD's `<Dialog>`/`<AlertDialog>` modal form, `Articles.tsx:300-486`): this codebase has no shadcn/Radix component library installed; NEW's existing admin UI (`leads/page.tsx`) is plain Tailwind with native HTML elements (`<select>`, `window.confirm()`, no modal system). A literal port of OLD's modal-based create/edit UX is not a drop-in — 2b's UI will need to either introduce a modal pattern from scratch or (more consistent with NEW's existing admin aesthetic) use a full-page create/edit route instead of a dialog, which is a real UX decision, not just a styling one.
- **List ordering** (OLD's admin list: `updatedAt desc`, i.e. most-recently-edited first, `storage.ts:192-198`) vs. **NEW's only existing published-articles ordering** (`publishedAt desc`, `lib/db/articles.ts:39`): an admin list showing *all* articles (drafts included) cannot use `publishedAt` as its sort key for drafts (which have `publishedAt = null`) — OLD's choice of `updatedAt desc` for the admin-all view is the correct precedent to carry forward for a `listAllArticles`-equivalent, not `getPublishedArticles`'s existing `publishedAt` ordering.

---

## 8. Open questions for the spec

Everything below is unresolved and must be decided by the spec — none of it is answered by this extraction.

**Translation pairing (all of §6, restated as questions):**
- Q1. How is a `translation_group_id` assigned when creating a brand-new article with no counterpart yet?
- Q2. What admin action/flow creates the second language's row for an existing group?
- Q3. Must EN/AR slugs within a pair match, be independent, or is there no rule at all?
- Q4. Does the admin list group rows by `translation_group_id` (paired display) or list every row flat, independent of language pairing?
- Q5. Are the two rows of a pair edited via fully independent forms, or a linked/tabbed UI?
- Q6. Is delete independent per row, or does the UI offer/require a bundled cross-language delete?
- Q7. Can a pair exist in an asymmetric publish state (one live, one draft) with no warning, or should the UI flag/prevent this?

**Other net-new decisions:**
- Q8. What DAL function (and shape) exposes "all projects, for a dropdown" to populate `relatedProjectId`'s options — new code, not present in `lib/db/portfolio.ts` today?
- Q9. Does 2b reproduce OLD's inline body-image-upload helper (Markdown cursor-insert via `/api/image`), or is cover-image the only image field this slice handles?
- Q10. What replaces OLD's dialog/modal editor UX, given this codebase has no shadcn/Radix dialog system — a full-page create/edit route, or a new modal pattern introduced for this slice?
- Q11. How should a Server-Action-based create/update surface a duplicate-slug (or any other) validation error back to the form, given `leads/actions.ts`'s existing pattern silently no-ops on invalid input with no user-facing message?
- Q12. Should article-list Server Actions call `revalidatePath` on the public `/articles` and `/articles/[slug]` routes (both EN and AR) in addition to `/admin/articles`, given those public pages are `revalidate = 3600`-cached Server Components reading the same table? (OLD used client-side React Query cache invalidation, `queryClient.invalidateQueries`, which has no direct Server-Actions-era equivalent already established in this codebase.)
- Q13. Should the admin list's ordering for "all articles including drafts" use `updatedAt desc` (OLD's precedent, §7) since `publishedAt` is null for drafts?

**Settled, not open (do not reopen):**
- The `articles` table schema itself (§1) — matches FR-3.1 verbatim, zero drift.
- The read-path consumer contract (§2) — `coverImage` as a plain string `src`, `body` as GFM Markdown, `relatedSolution` as one of four known string ids with no DB-level enum.
- The image-upload integration contract (§4) — `POST /api/image` → store the returned `/api/image/{id}` path string in `coverImage`, never a data URI, never the bare `id`.
- The admin-shell/auth/DAL conventions to reuse (§3) — `requireAuth()` per-mutation, flat DAL module, direct-Drizzle-read Server Components, `revalidatePath` after writes (scope of *which* paths is Q12, but the mechanism itself is settled).
