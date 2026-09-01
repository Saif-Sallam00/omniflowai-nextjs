# Phase 0 Research: Admin Projects CRUD (Phase 2, Slice 3)

**Spec**: [spec.md](./spec.md) | **Authoritative mini-spec**: `docs/projects-crud-slice-spec.md` | **Extraction**: `docs/projects-crud-extract.md`

Seven mechanism items were explicitly left open by the mini-spec for this planning phase (its own "Notes for `/plan`" section). All seven are resolved below, each grounded in an already-shipped precedent in this exact codebase (Slice 2b's articles CRUD, primarily) or a directly-verified fact about the pinned driver/ORM versions.

---

## Research Item 1: Transaction API usage for create/update

**Decision**: `db.transaction(async (tx) => { ... })`, using Drizzle's native transaction support on the `neon-serverless` driver. Confirmed available: `node_modules/drizzle-orm/neon-serverless/session.d.ts:52,56` declares `transaction<T>(transaction: (tx: NeonTransaction<...>) => Promise<T>, config?: PgTransactionConfig): Promise<T>` directly on the session type `lib/db/index.ts`'s `db` is built from (`drizzle(pool, { schema })` over a `Pool` from `@neondatabase/serverless`, `lib/db/index.ts:1-2,13-19,26`). Both `createProject` and `updateProject` wrap their multi-statement writes in exactly this call; every statement inside uses `tx` (never the outer `db`), so a thrown error at any point rolls back everything already written in that call.

**Rationale**:
- This is the first slice in this codebase to actually need a transaction — confirmed by `grep -rn "\.transaction(" lib/ app/` returning zero prior uses — but the capability has been available and untouched since Phase 0 (the `neon-serverless` `Pool`-based driver, unlike the HTTP-based `neon()` tagged-template client used for one-off scripts, fully supports real Postgres transactions over its WebSocket connection).
- This is exactly the correctness centerpiece the mini-spec calls out (FR-13, AC-2/AC-3): a project's canonical row and both translation rows must appear together or not at all. A transaction is the direct, native mechanism for that — no application-level "insert then manually delete on failure" compensation logic is needed or appropriate once a real transaction is available.
- Matches the constitution's own P-15 ("Multi-statement mutations are atomic... Transactions wrap any check-then-write pattern") — this slice is the first place in the codebase where P-15's transaction clause actually has a multi-statement mutation to apply to (prior slices' DAL writes were all single-`INSERT`/`UPDATE`/`DELETE` statements, inherently atomic on their own, as Slice 2b's own Constitution Check noted).

**Alternatives considered**:
| Option | Rejected because |
|---|---|
| Insert the canonical row, then each translation row, with manual `try/catch` cleanup (delete the canonical row if a translation insert fails) | Reinvents what a database transaction already does correctly and atomically, with a real risk of the cleanup step itself failing (leaving an orphan row, the exact failure mode this mechanism exists to prevent) — a real transaction has no such gap. |
| A single `INSERT ... RETURNING` per table with no explicit transaction, relying on "it usually works" | Does not satisfy FR-13.1/AC-3's explicit requirement that a mid-write failure leave zero rows behind — without a transaction, a failure after the canonical insert but before both translation inserts complete leaves exactly the orphan/partial state this slice must prevent. |

---

## Research Item 2: Editor's client-side state model and Client Component split

**Decision**: One top-level Client Component, `project-form.tsx` (directly analogous to Slice 2b's `article-form.tsx`), holding the combined form's `useActionState` wiring and the canonical fields (slug, category, flags) inline, and delegating four self-contained sub-components:
- `cover-image-field.tsx`, `logo-image-field.tsx`, `media-image-field.tsx` — three instances of the exact upload-on-select pattern Slice 2b already built (`app/(en)/admin/(protected)/articles/cover-image-field.tsx`), one per image field, differing only in field name and requiredness messaging.
- `system-cards-editor.tsx` — the repeatable-row builder for FR-7 (icon + per-language title/description, add/remove/reorder, 1–6 rows).
- `results-editor.tsx` — the repeatable-row builder for FR-8 (shared value + per-language label, add/remove/reorder).
- `chip-input.tsx` — one small, reusable add/remove token-list control (FR-9), instantiated four times (EN tags, AR tags, EN technologies, AR technologies) rather than building tags/technologies-specific components.

Each of `system-cards-editor.tsx`/`results-editor.tsx`/`chip-input.tsx` manages its own array in local component state and, on every change, serializes its current value into a single hidden `<input type="hidden">` (JSON-encoded) inside the surrounding `<form>` — see Research Item 3 for why JSON-in-a-hidden-field is the chosen submission mechanism.

**Rationale**:
- Mirrors Slice 2b's already-proven split exactly (one shared form component + small single-purpose field components), which the constitution's own "carried-forward conventions" language and this codebase's established pattern both favor over one monolithic form component.
- Splitting `system-cards-editor.tsx`/`results-editor.tsx` out (rather than inlining their row-array logic into `project-form.tsx`) keeps `project-form.tsx` from becoming an unreadable single file — each has genuinely self-contained state (its own array, its own add/remove/reorder handlers) that no sibling field needs to know about.
- A single reusable `chip-input.tsx` (rather than four near-duplicate components) is justified because all four token-list fields (EN tags, AR tags, EN/AR technologies) have identical behavior (add on Enter/comma, remove via a chip's own button) and differ only in which array they're bound to and their hidden-field name — this is a case where one parameterized component is more honest than four copies, unlike the deliberate EN/AR slug-function split in `lib/article-slug.ts` (research.md Item 1 of Slice 2b) where the underlying character-class logic genuinely differed.

**Alternatives considered**:
| Option | Rejected because |
|---|---|
| One single large Client Component with all state inline | Would work, but makes the already-large combined form (canonical fields + two full language sections + two repeatable-row builders + three uploads + four chip inputs) unreviewable as one file — no single piece of this form is trivial enough to justify skipping the split Slice 2b already established as this codebase's norm. |
| A bespoke component per chip field (`tags-input-en.tsx`, `tags-input-ar.tsx`, etc.) | Four files with identical logic differing only in props — a worse outcome than one parameterized component for no benefit. |

---

## Research Item 3: Shared-structure ↔ per-language assembly (form state → two stored arrays)

**Decision**: `system-cards-editor.tsx` and `results-editor.tsx` each hold **one** array of "slot" objects in client state — e.g. `{ icon: string; titleEn: string; descriptionEn: string; titleAr: string; descriptionAr: string }[]` for system cards, `{ value: string; labelEn: string; labelAr: string }[]` for results — never two separate per-language arrays that could drift out of sync with each other's ordering. On every change, the component serializes this single array of slots to JSON and writes it into one hidden input (`systemCardsJson`, `resultsJson`). The Server Action (not the client) is what fans a slot array out into the two stored `jsonb` arrays: for each slot, it emits `{ icon: slot.icon, title: slot.titleEn, description: slot.descriptionEn }` into the `en` translation's `system_cards` and `{ icon: slot.icon, title: slot.titleAr, description: slot.descriptionAr }` into the `ar` translation's, in the same slot order for both — guaranteeing (by construction, not by admin discipline) that icon and order are identical across languages, satisfying FR-7.2/AC-8. `results` follows the identical shape: one `{ value, labelEn, labelAr }[]` array fanned into `{ value, label: labelEn }[]` / `{ value, label: labelAr }[]`.

**Rationale**:
- Holding one combined array (not two parallel per-language arrays) is what makes "the same icon/order across languages" a structural guarantee rather than something the admin could accidentally break by, say, reordering only the English list — there is only one order to reorder, ever.
- JSON-in-a-hidden-field (rather than inventing an indexed/bracket-notation flat-field convention, e.g. `systemCards[0][icon]`, `systemCards[0][titleEn]`, ...) avoids a hand-rolled `FormData`-to-nested-array parser for no benefit — `JSON.stringify`/`JSON.parse` plus a Zod array schema on the server side is simpler, less error-prone, and needs no new dependency. This is a natural extension of this codebase's existing convention of reading structured values out of individual named `FormData` fields (Slice 2b's `formData.get("translationGroupId")`, etc.) — here there's just one field per repeatable-array instead of one field per scalar.
- Assembling the two stored arrays in the Server Action (not the Client Component) keeps the "this must produce byte-identical icon/order/value across languages" invariant enforced in one place, server-side, the same way Slice 2b keeps `stampPublishedAt` and the unique-violation mapping DAL/action-side rather than trusting client code to get it right.

**Alternatives considered**:
| Option | Rejected because |
|---|---|
| Two independent per-language arrays in client state (`systemCardsEn[]`, `systemCardsAr[]`), reconciled by index at submit time | Makes "keep icon/order in sync" the admin's/the code's ongoing responsibility across every add/remove/reorder interaction on either language's list, instead of an structural impossibility-to-violate — exactly the failure mode FR-7.2/FR-8.2 exist to rule out. |
| An indexed flat-field `FormData` convention instead of JSON-in-a-hidden-field | Requires a hand-rolled parser to reconstruct array-of-objects from `formData.getAll(...)`-style flat keys, for a shape (array of objects, some fields shared/some per-language) that doesn't map cleanly onto flat indexed fields anyway — more code, more edge cases, no new capability. |

---

## Research Item 4: Slug validation module + generate-from-title helper

**Decision**: Reuse `lib/article-slug.ts`'s existing `SLUG_PATTERN_EN` and `slugifyForLanguage(title, "en")` directly — no new slug module. A project's slug is EX-03's single Latin slug (`^[a-z0-9]+(?:-[a-z0-9]+)*$`, `docs/projects-crud-slice-spec.md:104`), identical in character class and shape to articles' *English*-language slug rule (Slice 2b's `SLUG_PATTERN_EN`, `lib/article-slug.ts:4`) — there is no Arabic-slug variant to build for projects at all, since Decision 013 assigns exactly one slug per project regardless of language. The "generate from English title" helper (FR-10.2) calls `slugifyForLanguage(englishTitle, "en")` exactly as Slice 2b's create form already does for its own EN slug field.

**Rationale**:
- The two slug rules are byte-for-byte identical (same regex, same lowercase-Latin-plus-hyphens shape) — introducing a second, differently-named module (`lib/project-slug.ts`) that duplicates `SLUG_PATTERN_EN`/`slugifyEn`'s logic verbatim would be pure duplication for zero behavioral difference. Reuse is the direct, minimal-change option, consistent with the constitution's Scope Discipline (no new code where existing code already does the job).
- Slug uniqueness itself is `projects.slug` global (not per-language, unlike articles' `(language, slug)`), but that difference lives entirely in the *uniqueness check* (Research Item 5), not in the *character-class validation* — the two concerns are already separate in Slice 2b's own design (`slugPatternForLanguage` vs. the DAL-level clash pre-check), so reusing the pattern/slugify half while writing a project-specific uniqueness check is a clean split, not a partial reuse that leaves things inconsistent.

**Alternatives considered**:
| Option | Rejected because |
|---|---|
| A new `lib/project-slug.ts` re-exporting or copy-pasting `SLUG_PATTERN_EN`/`slugifyEn` under project-specific names | Adds a file with no new logic — the exact rule already lives in `lib/article-slug.ts` and is already exported; importing it directly is strictly simpler. |

---

## Research Item 5: `mapUniqueViolation` return-shape for projects

**Decision**: A project-scoped analogue of Slice 2b's `mapUniqueViolation` (`app/(en)/admin/(protected)/articles/article-form-schema.ts:120-135`), but simpler — `projects` has exactly **one** unique constraint (`projects_slug_unique`) to branch on, unlike `articles`' two:

```ts
export function mapUniqueViolation(
  error: unknown,
): Pick<ProjectFormState, "fieldErrors" | "formError"> | null {
  if (!isUniqueViolation(error)) return null;
  if (error.constraint === "projects_slug_unique") {
    return { fieldErrors: { slug: ["That slug is already in use"] }, formError: null };
  }
  return null; // re-thrown by the caller — an unrecognized 23505 is a real bug to surface, not swallow
}
```
No `language` parameter is needed (unlike articles' version, which used it to build a per-language message) — a project has one slug, one message, full stop.

**Rationale**:
- Directly mirrors the proven shape and the exact same `isUniqueViolation`/`error.code === "23505"`/`error.constraint` detection mechanism Slice 2b already validated end-to-end (including live-tested against this project's actual Postgres driver, `@neondatabase/serverless`'s `NeonDbError`, which exposes `.code`/`.constraint` — confirmed in Slice 2b's own implementation).
- Still branches on the constraint *name* rather than assuming "any 23505 means the slug clashed" — even though there's only one unique constraint on `projects` today, an unrecognized constraint name (e.g. from a future schema change this slice doesn't anticipate) re-throws rather than silently mislabeling the error, preserving the same correctness discipline Slice 2b's version established for exactly this reason.

**Alternatives considered**:
| Option | Rejected because |
|---|---|
| Skip the constraint-name check entirely and assume any `23505` on a project write means the slug clashed | Works today (only one constraint exists) but silently breaks the "re-throw unrecognized errors" safety net Slice 2b deliberately built in — cheap to keep, no reason to drop it just because there's currently only one branch. |

---

## Research Item 6: `listProjectsForAdmin` / `listProjectCategories` query shapes

**Decision**:
- `listProjectsForAdmin(): Promise<ProjectAdminListItem[]>` — a single query joining `projects` to `project_translations` filtered `language = "en"` (the admin list only ever needs the English title per FR-1.2 — admin is English-only, mirroring `listProjectsForSelect`'s existing precedent, `lib/db/portfolio.ts:165-174`), selecting `id, slug, coverImage, isFeatured, isServiceShowcase, updatedAt` from `projects` and `title` from the joined `en` translation, ordered by `projects.updatedAt desc` (FR-1.3). No grouping/fan-out logic needed (unlike Slice 2b's `listArticleGroups`) — there is exactly one row per project already, since `projects` *is* the canonical entity, not a peer row needing to be grouped with another.
- `listProjectCategories(): Promise<string[]>` — `SELECT DISTINCT category FROM projects ORDER BY category`, feeding the datalist suggestion list (FR-5.2). A plain distinct-values query, no join needed.

**Rationale**:
- `listProjectsForAdmin`'s inner-join-on-`en`-only shape directly mirrors `listProjectsForSelect`'s already-proven pattern (same join condition, same "admin is English-only" justification) — no new query technique introduced.
- No grouping step is needed here, in contrast to Slice 2b's `listArticleGroups` (which had to reconstruct "one row per concept" from two independent peer rows sharing a UUID) — `projects` already *is* one row per project by construction (the canonical-row model, not the row-pairing model), so an admin list is a single flat, already-grouped query.
- `listProjectCategories` as a bare `SELECT DISTINCT` is the simplest possible implementation of "suggest previously-used values without restricting to them" (FR-5.2) — no new table, no cached/materialized list, just a live read of what's actually in use right now.

**Alternatives considered**:
| Option | Rejected because |
|---|---|
| Reuse `getPortfolioListItems` (the existing public read) for the admin list, filtering client-side | That function is scoped to a single language's *public* rendering shape (no `id`, no `isFeatured`/`isServiceShowcase`, no `updatedAt` — confirmed by its type, `lib/db/portfolio.ts:7-14`) — it is missing exactly the fields the admin list needs (FR-1.2) and reusing it would require either widening its public-facing return type (risking FR-15.2's "don't break existing consumers" requirement) or fetching twice. A dedicated admin query is cleaner and lower-risk. |

---

## Research Item 7: `updated_at` bump on translation rows

**Decision**: Bump `updatedAt` explicitly (via `sql\`now()\``, the exact mechanism Slice 2b's `updateArticle` already established, `app/(en)/admin/(protected)/articles/... lib/db/articles.ts`'s `updateArticle`) on **all three rows** touched by an update — the canonical `projects` row and **both** `project_translations` rows — inside the same transaction (Research Item 1).

**Rationale**:
- The admin list's ordering (FR-1.3) only ever reads `projects.updated_at`, so bumping the canonical row's timestamp is the only one with an observable *behavioral* effect in this slice — but leaving the two translation rows' `updated_at` stale after their content actually changed would be a silent inconsistency (a raw DB inspection, or a future feature reading translation-level timestamps, would see a translation row whose content just changed but whose `updated_at` claims otherwise). Since the write is already inside one transaction touching all three rows, adding `updatedAt: sql\`now()\`` to each `UPDATE` statement is a one-line addition per statement, not a new mechanism.
- Keeps `schema.ts` at zero drift from Decision 013 either way (this is a DAL-level `.set()` value, never a schema-level `.$onUpdate()`), matching the mini-spec's own explicit preference (FR-13.3) and Slice 2b's Research Item 4 precedent for the identical question asked about `articles.updated_at`.

**Alternatives considered**:
| Option | Rejected because |
|---|---|
| Bump only the canonical row's `updated_at`, leave translation rows' timestamps untouched on an edit | Cheaper by two assignments, but leaves translation rows' own audit timestamps meaningless (they would only ever reflect creation time, never any subsequent edit) — a low-cost correctness gap with no offsetting benefit, given the write is already transactional and touching all three rows regardless. |

---

## Dependency check (constitution Scope Discipline)

No new dependency is introduced by this slice. `zod` (already used for the articles form schema), `useActionState`/`useFormStatus` (already proven three times over — login form, contact form, articles form), Drizzle's native `.transaction()` (already part of the pinned `drizzle-orm`/`@neondatabase/serverless` versions, simply not yet exercised by any prior slice), and Slice 2a's `POST /api/image` (consumed a fourth time, three times within this one slice) are all already present. The only new application code is the DAL additions, the Server Actions, the admin UI components, and reuse of `lib/article-slug.ts` — no `package.json` change.

## Sources

- Current repository state, read directly: `lib/db/schema.ts` (`projects`/`project_translations`/`SYSTEM_CARD_ICONS`), `lib/db/portfolio.ts` (existing read functions, `listProjectsForSelect`'s join pattern), `lib/db/index.ts` (the `neon-serverless` `Pool`-backed `db` instance transactions run against), `node_modules/drizzle-orm/neon-serverless/session.d.ts` (confirming `.transaction()` availability), `app/(en)/admin/(protected)/articles/*` (Slice 2b's complete form/action/schema/upload-field precedent, re-read in full for this plan), `lib/article-slug.ts` (the reused EN slug pattern/slugify function).
- `docs/projects-crud-extract.md` (the grounding extraction this plan is built on) and `docs/projects-crud-slice-spec.md` (the approved mini-spec whose FR-1–FR-17 this plan implements).
