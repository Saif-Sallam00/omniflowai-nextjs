# Phase 0 Research: Admin Articles CRUD (Phase 2, Slice 2b)

**Spec**: [spec.md](./spec.md) | **Authoritative mini-spec**: `docs/articles-crud-slice-spec.md` | **Extraction**: `docs/articles-crud-extract.md`

Six mechanism items were explicitly left open by the mini-spec for this planning phase (its own "Notes on things `/plan` will likely resolve" section). All six are resolved below, each grounded in either an already-shipped precedent in this exact codebase or a directly-justified new decision where no precedent exists.

---

## Research Item 1: AR slug character class + language-aware slugify

**Decision**: Two separate, explicit character classes and two separate slugify functions in a new `lib/article-slug.ts`:

- **EN**: unchanged from the old app — `^[a-z0-9]+(?:-[a-z0-9]+)*$` (lowercase Latin, digits, single hyphens between words).
- **AR**: `^[؀-ۿ0-9]+(?:-[؀-ۿ0-9]+)*$` — the core Arabic Unicode block (`U+0600`–`U+06FF`, covering standard Arabic letters and punctuation-adjacent marks) plus **ASCII digits only** (not Arabic-Indic `٠-٩`, `U+0660`–`U+0669`) and single hyphens between words. No spaces, no leading/trailing/doubled hyphens, matching the EN rule's shape.
- `slugifyForLanguage(title: string, language: Language): string`: for `en`, delegates to the existing algorithm verbatim (`toLowerCase()`, NFKD-normalize, strip diacritics, replace non-`[a-z0-9]` runs with a single hyphen, trim, slice to 80 chars). For `ar`, a parallel function that does **not** lowercase (Arabic has no case) and does **not** run Latin-oriented NFKD-stripping; instead it strips Arabic diacritics (harakat — the combining marks in `U+0610`–`U+061A`, `U+064B`–`U+065F`, `U+0670`, `U+06D6`–`U+06ED`) so that a title typed with or without diacritics produces the same slug, then replaces any run of characters outside the AR character class (spaces, punctuation) with a single hyphen, trims leading/trailing hyphens, and slices to 80 chars (same cap as EN, for consistency).

**Rationale**:
- ASCII-only digits (rejecting Arabic-Indic digits) avoids a second normalization step and keeps slug comparison/uniqueness checks byte-simple — a title containing "2026" produces the same digit characters regardless of language, so there is no reason to introduce Arabic-Indic digit support only to immediately need to decide whether `٢٠٢٦` and `2026` collide.
- Not lowercasing AR output is not a stylistic choice, it is correctness: Arabic has no case distinction, so applying `.toLowerCase()` is a no-op at best and would be misleading to leave in the code as if it mattered.
- Stripping harakat mirrors exactly what the EN path already does for Latin diacritics (NFKD + combining-mark strip) — the same underlying goal (a title that differs only in decoration produces the same slug) applied to the correct Unicode ranges for the language.
- Confirmed via direct inspection (`grep` across the repo, extraction §5) that the old app's `slugify()` (`client/src/pages/admin/Articles.tsx:55-64` in the old source) is Latin-only (`.replace(/[^a-z0-9]+/g, "-")` after lowercasing) and would silently strip 100% of an Arabic title's characters, producing an empty or near-empty slug — confirming the mini-spec's own warning that it "MUST NOT be reused verbatim for AR."
- Confirmed via direct inspection of `app/ar/(public)/articles/[slug]/page.tsx` and `app/ar/(public)/portfolio/[slug]/page.tsx` that this codebase's App Router dynamic segments already handle non-ASCII path segments transparently (Next.js/the browser handle percent-encoding of the URL automatically; `params.slug` is decoded back to the original Unicode string) — no additional URL-encoding work is needed to make an Arabic-script slug resolve correctly as a route param.

**Alternatives considered**:
| Option | Rejected because |
|---|---|
| Transliterate Arabic titles to Latin characters for the slug (e.g. `"مقالة"` → `"mqalt"`) | The mini-spec already settled "AR slugs may use Arabic script" as a deliberate, non-reopenable decision (spec Assumptions) — transliteration would silently contradict that. |
| Allow Arabic-Indic digits in AR slugs | Adds a second digit alphabet to reason about (uniqueness checks, sorting, display) for no benefit — Latin digits `0-9` display identically and unambiguously in both languages' URLs. |
| Reuse one shared slugify function with an `if (language === "ar")` branch inline | Two small, separately named, separately testable functions (`slugifyEn`/`slugifyAr`, both called via `slugifyForLanguage`) are clearer than one function with divergent Unicode-handling branches — this is a case where two similar-looking functions are more honest than one parameterized one, since the actual character-class logic genuinely differs (case-folding applies to one, not the other). |

---

## Research Item 2: Grouped-list query shape

**Decision**: Fetch a flat, ungrouped list of all article rows (all columns needed for the list: `id, translationGroupId, language, title, slug, published, publishedAt, updatedAt`) ordered by `updatedAt desc`, then group by `translationGroupId` in application code (a single `Map<string, { en?: Row; ar?: Row }>` pass), and finally order the resulting groups by `Math.max(en?.updatedAt, ar?.updatedAt)` descending.

**Rationale**:
- This is a low-volume admin list (a marketing site's article count, expected to be dozens, not thousands) — a single flat `SELECT ... ORDER BY updated_at DESC` is already cheap, and grouping ≤~200 rows in JS is negligible cost. Per the constitution's YAGNI/KISS discipline (Scope Discipline), introducing a SQL-level `GROUP BY`/window-function/pivot query to save a JS `Map` pass over a small array is optimizing for a scale this slice does not have.
- A single flat query, already sorted `updated_at desc`, means the JS grouping pass can build each group's row in one linear scan without needing a second sort pass for row order within a fetch — only the final group-level ordering needs an explicit sort (by the max of up to two already-known timestamps).
- Avoids Drizzle relational-query complexity (self-referencing pivot on `translation_group_id` with a `language` discriminator) that would produce SQL no clearer or more efficient than the flat-fetch-and-group approach at this scale.

**Alternatives considered**:
| Option | Rejected because |
|---|---|
| A single SQL query using two `LEFT JOIN`s of `articles` to itself (one filtered `language = 'en'`, one filtered `language = 'ar'`, joined on `translation_group_id`) | Works, but is meaningfully more complex Drizzle/SQL to write and read correctly (self-joins with aliasing) for a table this small, with no measurable performance benefit over fetch-and-group at this scale — YAGNI. |
| Postgres `json_agg`/`array_agg` grouping by `translation_group_id` | Same complexity/benefit tradeoff as the self-join option, plus it returns a shape (an array of 0–2 rows per group) that still needs to be split into `en`/`ar` in application code anyway — no net simplification. |

---

## Research Item 3: Counterpart-create param contract + `translation_group_id` override

**Decision**: The "add missing version" action on the grouped list (FR-1.3) links to `/admin/articles/new?group={translationGroupId}&lang={missingLanguage}`. The create page (`app/(en)/admin/(protected)/articles/new/page.tsx`, a Server Component) reads `searchParams` (a `Promise<{ group?: string; lang?: string }>`, per this codebase's Next 16 convention already used by `[slug]/page.tsx` and `leads/page.tsx`), validates `lang` is a real `Language` enum value and `group` is a syntactically valid UUID (defensive — a malformed query param is simply ignored, falling back to "fresh create," rather than erroring the page), and renders the create form with two **hidden** form fields (`translationGroupId`, pre-populated `language`) alongside the normal visible fields. `createArticleAction` reads `formData.get("translationGroupId")`: if present and non-empty, it is passed through to `createArticle` as an explicit override; if absent, `createArticle` omits the column from its `.values(...)` call entirely so the schema's own `default(sql\`gen_random_uuid()\`)` (`lib/db/schema.ts:60-62`) generates a fresh one — no application-code UUID generation, no new dependency, consistent with how Slice 2a's own id strategy research already decided to lean on Postgres-generated UUIDs wherever possible.

**Rationale**:
- Query params (not a client-side-only prop or router state) are correct here because this is a full-page navigation (FR-2.1/mini-spec FR-2.1) — the create page is a fresh page load, not a client-side transition carrying in-memory state, so the linking mechanism must be visible in the URL.
- Passing the `translationGroupId` through the form (as a hidden field) rather than having the Server Action re-parse the page's original query string keeps the action's only input source `FormData`, consistent with every other Server Action in this codebase (`leads/actions.ts`, `lib/actions/leads.ts`) — the action does not need to know anything about how it was reached, only what was submitted.
- Letting the DAL layer decide whether to include `translationGroupId` in the insert (rather than always passing a value, generated client-side or action-side) means the "let Postgres generate a fresh one" and "use the supplied one" paths share the exact same `createArticle` code path and column default, with zero special-casing of UUID generation in application code — mirroring Slice 2a's own reasoning for using `gen_random_uuid()` (`specs/005-admin-image-upload/research.md`, Decision 1) rather than `crypto.randomUUID()` in app code.

**Alternatives considered**:
| Option | Rejected because |
|---|---|
| Generate the counterpart's `translation_group_id` value in the Server Action (e.g. read it, always pass it explicitly to `createArticle`) | Works identically in practice, but makes `createArticle` always require a `translationGroupId` argument, forcing every "fresh create" call site to first read the just-inserted-nowhere value or duplicate the "generate one" logic in the action layer instead of leaning on the column default that already exists for exactly this purpose. |
| Encode the group/lang linkage in the route path itself (e.g. `/admin/articles/new/[group]/[lang]`) instead of query params | A "fresh create with no group" then has no natural URL (an optional path segment pair is awkward in the App Router's file-based routing) — query params, which are naturally optional, fit the "sometimes linked, sometimes not" shape of this one route better. |

---

## Research Item 4: `updated_at` bump mechanism

**Decision**: An explicit `updatedAt: sql\`now()\`` in `updateArticle`'s `.set({...})` call — **not** a Drizzle `.$onUpdate()` callback added to the schema column definition.

**Rationale**:
- The mini-spec and this slice's own settled inputs are explicit: "keep `schema.ts` at zero drift from FR-3.1." FR-3.1 defines `updated_at` as `timestamptz not null default now()` — a plain default, with no update-trigger behavior specified. Adding `.$onUpdate(() => new Date())` to the column definition would change `schema.ts`'s `articles` table definition from what FR-3.1 locked, which is exactly the kind of schema drift this slice is required to avoid, even though `.$onUpdate()` doesn't touch the generated SQL migration (Drizzle's `.$onUpdate()` is purely a client-side ORM behavior, not a DB-level trigger) — the *column definition object* in `schema.ts` would still differ from FR-3.1's literal text, which is the actual thing "zero drift" is measured against here (Slice 2a's own extraction, §1, treats `schema.ts`'s table definitions as the direct one-to-one authority for FR-3.1 compliance).
- This is also the **exact mechanism the old app already used** for the same purpose (extraction §5.2): `server/storage.ts:232`, `.set({ ...articleUpdate, publishedAt: stampPublishedAt(...), updatedAt: sql\`now()\` })` — a proven, direct precedent for this exact "bump updated_at explicitly in the DAL's update function" pattern, just ported from Drizzle-on-old-schema to Drizzle-on-new-schema (both are Drizzle ORM already, so the syntax carries over unchanged).
- Keeping the bump as an explicit line in `updateArticle` also keeps it colocated with the other update-time-only invariant this slice adds (`published_at` first-publish stamping, Research Item 4 of the mini-spec / FR-5) — both are "things that happen on update, decided by the DAL function's own logic," read top-to-bottom in one function body, rather than splitting "some column behavior lives in schema.ts, some lives in the DAL."

**Alternatives considered**:
| Option | Rejected because |
|---|---|
| `updatedAt: timestamp(...).notNull().defaultNow().$onUpdate(() => new Date())` in `schema.ts` | Technically achieves the same runtime result, but changes the `articles` table's column definition away from FR-3.1's literal text — unacceptable given this slice's explicit "zero drift" requirement, even though the generated migration SQL would be unaffected (no migration is generated this slice at all, so this isn't even a migration-diff question — it's purely about `schema.ts`'s own text matching FR-3.1). |
| Rely on `sql\`now()\`` only implicitly via a database trigger | Introduces a new database object (a trigger function) for a single-column bump that a one-line DAL change already covers — disproportionate complexity, and a trigger is invisible to anyone reading `lib/db/articles.ts`, unlike an explicit `.set()` field. |

---

## Research Item 5: `useActionState` return-shape contract

**Decision**: Model the article form's state type directly on `lib/actions/leads.ts`'s `ContactActionState` shape (this codebase's own richer, already-proven multi-field precedent — not the simpler two-field `SignInState` from the admin login form), adapted for articles:

```ts
export type ArticleFormState = {
  status: "idle" | "success" | "error";
  fieldErrors: Partial<Record<ArticleFieldName, string[]>>;
  formError: string | null; // non-field-specific errors: slug clash, counterpart race, unexpected DB error
};
```

`createArticleAction`/`updateArticleAction` both have the signature `(prevState: ArticleFormState, formData: FormData) => Promise<ArticleFormState>` (the exact `useActionState` action shape already used by both `signInAction` and `submitContactAction`). On success, the action calls `redirect(...)` (to the articles list or the edit page) rather than returning a `"success"` state that the form has to react to — matching `signInAction`'s own pattern of `redirect("/admin")` after a successful sign-in, which sidesteps needing to reset a multi-field form's contents after success at all (a redirect away from the form makes "what does a cleared form look like" a non-question). `deleteArticleAction` does not need `useActionState` at all — like `deleteLeadAction` (`leads/actions.ts:21-26`), a delete either succeeds (revalidate and the row disappears from the list) or throws (caught by the framework's default error boundary), since there is no per-field input to report an error against.

**Rationale**:
- `ContactActionState`'s `fieldErrors: Partial<Record<Field, string[]>>` shape is a direct, already-working match for `zod`'s `.safeParse(...).error.flatten().fieldErrors` output (confirmed live in `lib/actions/leads.ts:59`, and confirmed this exact zod version, `4.4.3`, already exposes `.flatten()` since this file already compiles and ships) — reusing it means the article form's validation error rendering is not a new pattern, just a new field list.
- A create/update form is closer in shape to the contact form (many fields, each independently validatable, user input must survive a validation failure) than to the login form (two fields, one opaque "wrong credentials" message) — `submittedValues`-style echo-back is not needed here (`fieldErrors` covers per-field messages, and a Server Component reload after `redirect()` on success means there is no "clear the form" step to design around, only "the user is now looking at a different page").
- Adding `formError: string | null` (not present on `ContactActionState`) covers this form's two error cases that are not tied to a single input field: a slug clash's friendly message (FR-7.3) could arguably be a field error on `slug` instead — and in fact **is** modeled as a field error (`fieldErrors.slug`), since it is caused by one specific field's value — but a counterpart-creation race (FR-3.3, "the target group already has a row in this language by the time of save") and an unexpected DAL/DB failure are not caused by any single visible form field, so they need a form-level message slot the contact form's shape doesn't have.

**Alternatives considered**:
| Option | Rejected because |
|---|---|
| Copy `SignInState`'s `{ error: string | null }` shape verbatim | Cannot express *which* field failed for a form with 8+ independently-validatable fields — every error would read as a generic banner, a worse experience than the contact form (this codebase's own better precedent) already provides for a simpler form. |
| A fully success-state-aware shape (`status: "success"` rendering a confirmation message in place, no redirect) | Unnecessary: this codebase's own two existing `useActionState` forms both resolve success via `redirect()` (`signInAction`) or an ephemeral toast-equivalent the contact form's client wrapper handles separately from `useActionState` itself — no precedent here renders a lingering in-form "success" state that this feature would need to match. |

---

## Research Item 6: Client/server split for the cover-image and body-image upload controls

**Decision**: Both upload controls are plain Client Components that call `fetch("/api/image", { method: "POST", body: formData })` **directly from the browser** — not through a Server Action, and not through any new intermediate Route Handler. Slice 2a's `POST /api/image` (`app/api/image/route.ts`) already is the correct, complete contract for this: it reads the admin's session from the request's own cookies (same-origin `fetch` sends them automatically, no explicit auth wiring needed client-side), enforces the 5 MB ceiling and `sharp` pipeline, and returns `{ id, url }`.

- **Cover-image control** (a small Client Component, e.g. `cover-image-field.tsx`): an `<input type="file">` with an `onChange` handler that immediately `POST`s the selected file, shows a small pending/uploading state, and — on success — writes the returned `url` into a hidden `<input type="hidden" name="coverImage" value={url}>` that the surrounding `<form>` submits normally, plus renders a thumbnail `<img src={url}>` preview. On upload failure, it shows an inline message and leaves the hidden field empty (so the surrounding form's own `coverImage`-required validation, FR-8.1, catches it exactly like any other missing-field case — no separate error channel needed for this).
- **Body-image insert control** (part of the Markdown body editor, e.g. `body-editor.tsx`): a small "Insert image" button/file-input next to the `<textarea>`, whose `onChange` handler `POST`s the file the same way, then splices `\n\n![](${url})\n\n` into the textarea's current value at `textarea.selectionStart` (the exact old-app mechanism, extraction §5.2, `Articles.tsx:198-212`, ported verbatim except for the endpoint and the fact that `url` is now a short path instead of a data URI). The textarea itself remains a normal, name-bound form field (`<textarea name="body" ...>`) so the eventual Server Action still receives the body as ordinary `FormData` — the insert control only ever mutates the textarea's displayed/controlled value, it does not bypass the form submission path.

Neither control needs its own Server Action or Route Handler — they are consumers of the already-public (to any authenticated admin), already-complete `/api/image` contract from Slice 2a.

**Rationale**:
- This is the direct, minimal-change port of the old app's own proven pattern (`ObjectUploader.tsx`'s upload-on-select, `Articles.tsx`'s cursor-insert `insertImage`), differing only in what string gets stored (a short path vs. a full data URI, per Slice 2a) — extraction §4 already confirmed this substitution is a drop-in, since `articles.cover_image` is a plain `text` column with no format constraint and the existing render path (`FallbackImage`, `ArticleMarkdown`) binds `src` verbatim regardless of whether it's a data URI or a path.
- A same-origin browser `fetch` to a Route Handler is the standard, idiomatic way to consume a `multipart/form-data` endpoint from a Client Component in this framework — there is no reason to add a Server Action as a proxy in front of a Route Handler that already handles its own auth, validation, and response shape end-to-end; doing so would just re-implement multipart forwarding for no benefit (and Server Actions have their own smaller body-size ceiling, which is exactly why Slice 2a's upload endpoint was built as a Route Handler and not a Server Action in the first place — routing the same file through a Server Action here would reintroduce the same size problem one layer up).
- Keeping both fields' final values (`coverImage`, `body`) as ordinary named form inputs (hidden input / textarea) means `createArticleAction`/`updateArticleAction` need no special-casing for "was this value produced by an upload" — they read `formData.get("coverImage")` and `formData.get("body")` exactly like every other field.

**Alternatives considered**:
| Option | Rejected because |
|---|---|
| Route the upload through a Server Action that internally calls `fetch("/api/image", ...)` or duplicates the Slice 2a pipeline | Adds a pointless indirection layer (a Server Action wrapping a Route Handler that already does everything needed) and reintroduces the exact Server-Action body-size ceiling problem Slice 2a's FR-002 was written specifically to avoid for image uploads. |
| Defer the cover-image upload until the whole article form is submitted (upload the file itself as part of the create/update FormData, process it server-side inside the Server Action) | Contradicts FR-8.2's explicit "upload on selection, not deferred" requirement (mini-spec, carried into this slice's spec), and would require re-plumbing Slice 2a's entire `sharp` pipeline into the Server Action path instead of reusing its already-complete Route Handler. |

---

## Dependency check (constitution Scope Discipline)

No new dependency is introduced by this slice. `zod` (already used for `leadStatusSchema`/`contactFormSchema`), `useActionState`/`useFormStatus` (already used by the login and contact forms), and `sharp` (already added and logged in Slice 2a, `docs/decision-014-sharp-dependency.md`) are all already present and already proven for the exact shapes this slice needs. The only new module-level code is `lib/article-slug.ts` (language-aware slug validation/generation) and the DAL/action/page files listed in the Project Structure — no `package.json` change.

## Sources

- Current repository state, read directly: `lib/db/schema.ts` (`articles` table, `translationGroupId` uuid default), `lib/db/articles.ts` (existing read functions), `lib/db/portfolio.ts` (`getRelatedProjectCard`'s join pattern), `lib/auth-server.ts` (`requireAuth()`), `app/(en)/admin/auth/login-form.tsx` + `actions.ts` (`useActionState` two-field precedent), `lib/actions/leads.ts` (`useActionState` multi-field, `fieldErrors` precedent), `app/(en)/admin/(protected)/leads/*` (admin list/actions/DAL precedent), `app/api/image/route.ts` (Slice 2a upload contract).
- Old application source, read directly (available locally, `/home/ss-dev/projects/omniflowai`): `client/src/pages/admin/Articles.tsx` (`slugify()`, `insertImage`), `server/storage.ts` (`stampPublishedAt`, explicit `updatedAt: sql\`now()\`` on update), `server/routes.ts` (slug-clash 409 pattern).
- `docs/articles-crud-extract.md` (the grounding extraction this plan is built on) and `docs/articles-crud-slice-spec.md` (the approved mini-spec whose FR-1–FR-15 this plan implements).
