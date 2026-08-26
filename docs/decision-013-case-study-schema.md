# Decision 013 — Case-study portfolio schema revision

**Date:** [today]
**Status:** Locked
**Type:** Revision of a locked decision (amends Decision 010's `projects` / `project_translations` schema)
**Related:** EX-03 (slug URLs), supersedes the flat `challenge`/`diagnosis`/`solution` project-translation fields from Decision 010.

## Why this is a governed change, not a 1C detail

Decision 010 locked the `projects` / `project_translations` schema, and Phase 0 built it. The approved case-study page redesign (`case_study_page_redesign_final.md` + preview) requires fields that schema does not have, and restructures three of its existing text fields. Per the constitution (Locked Decisions Are Locked; a locked schema is reopened only via an explicit decision entry), this revision is logged here rather than absorbed silently into an implementation slice.

## What changes

The portfolio detail page is replaced by a bilingual case-study template: Hero + client-identity card → Problem → Diagnosis → System (dynamic cards) → Case-study media → Results (dynamic metrics) → Tech stack → CTA. The schema is revised to hold that content, per language, admin-editable.

Safe to do now: the target DB has **zero project rows** (Phase 0 left it empty; the two real projects are migrated in Phase 4). No data migration is required — columns are redefined before any row exists.

### `projects` (canonical, language-independent) — additions

| Column | Type | Notes |
|---|---|---|
| `slug` | `text NOT NULL UNIQUE` | Per EX-03. Shared Latin slug across both languages. Manual. |
| `logo` | `text` (data-URI) | Client logo, dominant element of the hero identity card. Distinct from `cover_image`. Nullable (placeholder if absent). |
| `media_image` | `text` (data-URI) | Case-study media (funnel diagram / dashboard / screenshot). Distinct from `cover_image`. Nullable. |

`cover_image` stays — it is the list-grid thumbnail. `category`, `is_featured`, `is_service_showcase`, timestamps unchanged.

### `project_translations` (per-language: one `en` row, one `ar` row) — revised

**Removed** (flat fields from Decision 010): `challenge`, `diagnosis`, `solution`. Replaced by the structured fields below.

**Retained:** `id`, `project_id` (FK, cascade), `language`, `title`, `description`, `results` (re-shaped, see below), `tags`, `technologies`, timestamps. `client` is replaced by the four client-identity fields.

| Column | Type | Notes |
|---|---|---|
| `category_label` | `text` | Hero eyebrow, e.g. "EDTECH · LEAD GENERATION" / Arabic equivalent. Free text, per language. |
| `client_name` | `text` | Identity caption field 1. |
| `client_sector` | `text` | Identity caption field 2. |
| `client_country` | `text` | Identity caption field 3. |
| `client_model` | `text` | Identity caption field 4. Dot separators between the four are auto-rendered, never stored. |
| `problem_headline` | `text` | Section 01 headline. |
| `problem_body` | `text` | Section 01 paragraph. |
| `diagnosis_headline` | `text` | Section 02 headline. |
| `diagnosis_body` | `text` | Section 02 paragraph. |
| `system_headline` | `text` | Section 03 headline. |
| `system_cards` | `jsonb NOT NULL default '[]'` | Dynamic array of `{ icon, title, description }`. `icon` ∈ fixed pick-list (see below). Count variable (design targets 2–6). |
| `results` | `jsonb NOT NULL default '[]'` | Dynamic array of `{ value, label }`. **`value` is language-neutral** (stored identically on both rows — "760+", "8.3", "20%"); `label` is per-language. |
| `media_caption` | `text` | Optional caption under the case-study media. |
| `cta_headline` | `text` | Optional. Falls back to the locked measurement-wedge default when blank. |
| `cta_subtext` | `text` | Optional. Same fallback behavior. |

Unique constraint `(project_id, language)` and index `(project_id)` unchanged.

### Fixed icon pick-list for `system_cards.icon`

A closed set of lucide icon names (free icon strings are rejected). Initial set (final list confirmed at implementation): `target`, `search`, `flask-conical`, `messages-square`, `bar-chart-3`, `workflow`, `shield`, `zap`, `layers`, `users`, `compass`, `bot`. Admin picks from this set; unknown values render a neutral default.

## Consequences

- **1C** implements this schema and the read-side case-study page against it.
- **Phase 2 admin** must expose every field above in the project editor: logo upload, media upload, the four client fields, headline+body pairs, the dynamic `system_cards` builder (with the icon pick-list), the dynamic `results` builder, optional CTA overrides. This is a larger project editor than Decision 010 implied — noted here so Phase 2 scope reflects it.
- **Phase 4 migration** re-enters the two real projects (IDs 7, 8) in this structure, assigns their slugs, and uploads logos/media. The old flat-field content does not map 1:1 — it is re-authored into the new shape.
- **Content Integrity Rule** (from the redesign spec) stands: no fabricated metrics/logos/results ship live. Sample content is layout-preview only.

## Constitution note (separate, PATCH-level)

The constitution's markdown wording ("Data URI images allowlisted") describes a rehype-sanitize allowlist that does not exist — the real mechanism is a custom `react-markdown` `urlTransform` passing `data:image/*` and deferring everything else to default sanitization. Functionally correct and safe; only the wording is imprecise. Fold a wording clarification into the constitution at next convenient PATCH bump. Not blocking.
