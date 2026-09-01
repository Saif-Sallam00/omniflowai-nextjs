# Quickstart: Admin Articles CRUD (Phase 2, Slice 2b)

Validation guide for confirming this slice is complete. Maps to `spec.md`'s User Story acceptance scenarios and Success Criteria SC-001–SC-010. See `data-model.md` for shapes and `contracts/server-actions.md` for per-action behavior — not duplicated here.

## Prerequisites

- Phase 0 (auth, DB), Slice 004 (admin session pattern), and Slice 005 (`/api/image`) already shipped and working.
- Local dev server running (`npm run dev`), signed in as admin at `/admin/auth`.
- Two small test images (any format `sharp` decodes) to exercise the cover-image and inline-body-image upload controls.

## Setup

No migration, no new dependency, no environment variable. Run the quality gate before manual verification:

```
npm run check   # tsc --noEmit
npm run lint    # eslint-config-next/core-web-vitals
npm run build   # next build
```

All three MUST exit zero (FR-15.1/SC-010).

## Verification steps (map to User Stories & Success Criteria)

| Check | Action | Expected |
|---|---|---|
| Create (US1 / SC-001) | Sign in, open `/admin/articles/new`, fill every field including an uploaded cover image, save | Redirects to `/admin/articles`; a new row exists with a fresh `translation_group_id`; once published, it renders on the matching `/articles` (or `/ar/articles`) list and its own detail page |
| Slug auto-generate + edit (US1 AC2) | On the create form, type a title without touching the slug field | Slug field populates automatically; typing into it afterward overrides freely |
| EN slug rejects invalid chars (US1 AC3) | Enter an EN slug with uppercase letters or spaces, save | Save rejected with an inline, specific message — not a generic error |
| AR slug accepts Arabic script (US1 AC4) | Choose Arabic language, enter a slug using Arabic characters, save | Accepted |
| Grouped list (US2 / SC-002, SC-003) | Create one EN-only, one AR-only, and one fully-paired article; open `/admin/articles` | One row per concept; the EN-only and AR-only rows each show an explicit "add missing language" action on their empty side |
| List ordering (US2 AC3) | Edit an older article | It moves to the top of the list |
| Edit isolation (US3 / SC-004) | Edit a paired article's EN row only | EN row's fields change; AR row (re-fetch or re-list) is byte-for-byte unchanged; `updated_at` on the EN row advances |
| Edit self-slug no false-clash (US3 AC2) | Re-save an article without changing its slug | Succeeds |
| Edit slug clash (US3 AC3) | Change one article's slug to another existing article's slug (same language) | Rejected with an inline, specific message |
| Delete isolation (US4 / SC-004) | Delete one language's row from a paired article (confirm the prompt) | That row is gone; counterpart remains; the delete requires an explicit confirmation step first |
| Add counterpart (US5 / AC-2 in the mini-spec) | From an orphan row's "add missing language" action, fill and save the pre-linked form | New row shares the original `translation_group_id`; list now shows one paired row |
| Counterpart race (US5 AC3) | (If feasible) trigger two concurrent counterpart-creates for the same group/language | Second save is rejected with a clear message, not a raw error or a duplicate row |
| Cover image upload (US6 AC1 / SC-006) | Select a cover image file in the create/edit form | Uploads immediately; a preview appears; the form's `coverImage` value is a short `/api/image/{id}` path, never a data URI |
| Inline body image (US6 AC2/AC3 / SC-006) | Place the cursor mid-body, use "insert image", select a file | A Markdown `![](...)` reference is inserted at the cursor using the same short path form; after saving and publishing, it renders in the article body |
| Publish stamping — draft (US7 AC1 / SC-007) | Save a new article as a draft | No publish date is set |
| Publish stamping — first publish (US7 AC2) | Publish that draft | A publish date is stamped at that moment |
| Publish stamping — no re-bump (US7 AC3) | Edit and re-save the now-published article (still published) | Publish date is unchanged |
| Publish stamping — explicit override (US7 AC4) | Supply an explicit back-dated publish value | That value is honored exactly |
| Asymmetric publish (US7 AC5) | Publish only one language of a paired article | No warning or forced correction; both states persist independently |
| Draft preview — admin (US8 AC1) | Open a draft's "preview" action | Renders normally in a new tab for the signed-in admin |
| Draft preview — public (US8 AC2 / SC-004 in spec 005's sense, here FR-12.1) | Fetch the same draft URL signed out (or in a private window) | Not-found; page metadata does not leak the draft's real title |
| Revalidation (SC-008) | Create/edit/delete an article, then load the affected public list/detail page | Reflects the change without a manual rebuild |
| Auth enforcement (SC-009) | Attempt to invoke a mutating action without a valid session (e.g. via direct inspection of the action requiring `requireAuth()`) | Rejected — every mutating action independently calls `requireAuth()` |
| Quality gate (SC-010) | `npm run check && npm run lint && npm run build` | All exit zero |

## Done when

All rows above pass, all eight User Stories' acceptance scenarios and SC-001–SC-010 hold (spec.md), and no migration or schema change exists in the diff.
