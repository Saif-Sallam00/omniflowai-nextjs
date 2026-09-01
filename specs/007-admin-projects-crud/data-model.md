# Data Model: Admin Projects CRUD (Phase 2, Slice 3)

**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)

This slice introduces **no schema change and no migration**. `projects`/`project_translations` (`lib/db/schema.ts:21-39,93-130`) are frozen and match Decision 013 verbatim (re-confirmed by `docs/projects-crud-extract.md` §1). Every shape below is built entirely on top of those existing tables.

## `projects` / `project_translations` tables (existing — unchanged)

See `docs/projects-crud-extract.md` §1 for the full verbatim schema. Summary of what this slice writes to:

- `projects`: `slug` (unique), `category`, `isFeatured`, `isServiceShowcase`, `coverImage` (required), `logo`/`mediaImage` (nullable), `updatedAt`.
- `project_translations`: exactly two rows per project (`language = "en"` and `language = "ar"`), each with `title`/`description` (required), the optional case-study text fields, `systemCards`/`results` (jsonb), `tags`/`technologies` (jsonb `string[]`), `updatedAt`.

## Data-access module — `lib/db/portfolio.ts` (extended, not replaced)

Existing exports (`PortfolioListItem`, `SystemCard`, `ResultMetric`, `PortfolioDetail`, `getPortfolioListItems`, `getPortfolioSlugs`, `RelatedProjectCard`, `getRelatedProjectCard`, `getPortfolioDetailBySlug`, `ProjectOption`, `listProjectsForSelect`) are **unchanged** (FR-15.2). New exports:

```ts
// --- Admin (write) side. Everything below is used only by the admin CRUD
// (app/(en)/admin/(protected)/projects/**), never by public rendering. ---

export type ProjectRow = typeof projects.$inferSelect;
export type ProjectTranslationRow = typeof projectTranslations.$inferSelect;

// One "slot" per system-capability item as authored — shared icon/order,
// per-language text. This is the shape the editor works with; createProject/
// updateProject fan it into the two stored jsonb arrays (research.md Item 3).
export type SystemCardSlotInput = {
  icon: string; // validated against SYSTEM_CARD_ICONS before this type is trusted
  titleEn: string;
  descriptionEn: string;
  titleAr: string;
  descriptionAr: string;
};

export type ResultSlotInput = {
  value: string; // a display string, e.g. "40%", "3x" — never coerced to a number
  labelEn: string;
  labelAr: string;
};

export type ProjectTranslationContentInput = {
  title: string;
  description: string;
  categoryLabel: string | null;
  clientName: string | null;
  clientSector: string | null;
  clientCountry: string | null;
  clientModel: string | null;
  problemHeadline: string | null;
  problemBody: string | null;
  diagnosisHeadline: string | null;
  diagnosisBody: string | null;
  systemHeadline: string | null;
  mediaCaption: string | null;
  ctaHeadline: string | null;
  ctaSubtext: string | null;
  tags: string[];
  technologies: string[];
};

export type CreateProjectInput = {
  slug: string;
  category: string;
  isFeatured: boolean;
  isServiceShowcase: boolean;
  coverImage: string;
  logo: string | null;
  mediaImage: string | null;
  systemCards: SystemCardSlotInput[]; // 1–6, validated before reaching the DAL
  results: ResultSlotInput[];
  en: ProjectTranslationContentInput;
  ar: ProjectTranslationContentInput;
};

export type UpdateProjectInput = CreateProjectInput; // edit always supplies the complete shape (both languages, full slot lists) — never a partial patch, since the combined form always submits everything

export type ProjectWithTranslations = ProjectRow & {
  en: ProjectTranslationRow;
  ar: ProjectTranslationRow;
};

export async function createProject(input: CreateProjectInput): Promise<ProjectWithTranslations> {
  // db.transaction(async (tx) => {
  //   1. INSERT INTO projects (slug, category, isFeatured, isServiceShowcase,
  //      coverImage, logo, mediaImage) RETURNING * → project
  //   2. Assemble systemCardsEn/systemCardsAr and resultsEn/resultsAr from
  //      input.systemCards/input.results (research.md Item 3's fan-out).
  //   3. INSERT INTO project_translations (projectId: project.id, language: "en",
  //      ...input.en, systemCards: systemCardsEn, results: resultsEn) RETURNING * → en
  //   4. INSERT INTO project_translations (projectId: project.id, language: "ar",
  //      ...input.ar, systemCards: systemCardsAr, results: resultsAr) RETURNING * → ar
  //   5. return { ...project, en, ar }
  // }) — any thrown error rolls back all of the above (research.md Item 1).
}

export async function updateProject(
  id: number,
  input: UpdateProjectInput,
): Promise<ProjectWithTranslations | null> {
  // db.transaction(async (tx) => {
  //   1. UPDATE projects SET slug, category, isFeatured, isServiceShowcase,
  //      coverImage, logo, mediaImage, updatedAt: sql`now()`
  //      WHERE id = ? RETURNING * → project (null if no row matched → return null)
  //   2. Assemble systemCardsEn/Ar, resultsEn/Ar as in createProject.
  //   3. UPDATE project_translations SET ...input.en, systemCards: systemCardsEn,
  //      results: resultsEn, updatedAt: sql`now()`
  //      WHERE projectId = id AND language = "en" RETURNING * → en
  //   4. Same for "ar" → ar
  //   5. return { ...project, en, ar }
  // }) — straight UPDATE of both translation rows (they always exist post-create,
  // per the both-languages-required invariant — research.md's "Notes for /plan"
  // question about upsert-vs-UPDATE resolved: no upsert needed).
}

export async function deleteProject(id: number): Promise<ProjectRow | null> {
  // Single DELETE ... RETURNING on `projects` only — the ON DELETE CASCADE FK
  // (project_translations.project_id → projects.id) removes both translation
  // rows automatically; this function never touches project_translations.
}

export async function getProjectById(id: number): Promise<ProjectWithTranslations | null> {
  // Canonical row + both translation rows, by id. null-on-miss (leads/articles
  // precedent). Feeds the edit page's pre-fill.
}

export type ProjectAdminListItem = {
  id: number;
  slug: string;
  title: string; // English translation's title only (admin is English-only)
  category: string;
  coverImage: string;
  isFeatured: boolean;
  isServiceShowcase: boolean;
  updatedAt: Date;
};

export const listProjectsForAdmin = cache(async (): Promise<ProjectAdminListItem[]> => {
  // SELECT projects.{id,slug,category,coverImage,isFeatured,isServiceShowcase,updatedAt},
  // projectTranslations.title
  // FROM projects INNER JOIN project_translations
  //   ON project_translations.projectId = projects.id AND project_translations.language = "en"
  // ORDER BY projects.updatedAt DESC
  // (research.md Item 6 — no grouping needed, one row per project already)
});

export const listProjectCategories = cache(async (): Promise<string[]> => {
  // SELECT DISTINCT category FROM projects ORDER BY category
});
```

### `system_cards` / `results` fan-out (inside `createProject`/`updateProject`, not a separate exported function)

```ts
function fanOutSystemCards(slots: SystemCardSlotInput[]): { en: SystemCard[]; ar: SystemCard[] } {
  return {
    en: slots.map((s) => ({ icon: s.icon, title: s.titleEn, description: s.descriptionEn })),
    ar: slots.map((s) => ({ icon: s.icon, title: s.titleAr, description: s.descriptionAr })),
  };
}

function fanOutResults(slots: ResultSlotInput[]): { en: ResultMetric[]; ar: ResultMetric[] } {
  return {
    en: slots.map((s) => ({ value: s.value, label: s.labelEn })),
    ar: slots.map((s) => ({ value: s.value, label: s.labelAr })),
  };
}
```

Because both fan-outs map over the **same** `slots` array in the **same** order for both languages, `icon`/order (system cards) and `value` (results) are structurally identical across `en`/`ar` — not something the caller can get wrong (FR-7.2/FR-8.2, AC-8/AC-9).

### Validation (in the Server Action layer, not the DAL — mirrors Slice 2b)

A Zod schema (in a new, non-`"use server"` `project-form-schema.ts`, per Slice 2b's established split — a `"use server"` file may only export async functions) validates, before any DAL call:
- `slug`: matches `SLUG_PATTERN_EN` (reused from `lib/article-slug.ts`, research.md Item 4), non-empty.
- `category`: non-empty string.
- `coverImage`: non-empty string (required); `logo`/`mediaImage`: string or null (optional).
- `systemCards`: array, length 1–6 (FR-7.3); each slot's `icon` ∈ `SYSTEM_CARD_ICONS`; each slot's `titleEn`/`descriptionEn`/`titleAr`/`descriptionAr` non-empty (FR-7.4's "default to requiring both languages," per the mini-spec's own stated default).
- `results`: array (no fixed min/max — the schema itself has no lower bound beyond what the form UI encourages); each slot's `value`/`labelEn`/`labelAr` non-empty.
- `en`/`ar`: each an object with `title`/`description` non-empty (FR-6.1); every other field optional/nullable.
- `tags`/`technologies` (per language): array of non-empty strings.

### Slug-clash pre-check + race backstop (in the Server Action, mirrors Slice 2b's articles pattern exactly)

1. **Create**: query for an existing project with the same `slug`; if found, return `{ fieldErrors: { slug: ["That slug is already in use"] } }` immediately, no DAL call.
2. **Edit**: only re-check if the submitted slug differs from the project's current slug (trap avoided: an unchanged slug is never checked against itself — same reasoning as Slice 2b's articles edit action).
3. Both paths additionally catch a thrown `23505` from `createProject`/`updateProject` and map it via `mapUniqueViolation` (research.md Item 5) as the authoritative race backstop — the pre-check is a UX nicety, the DB constraint is the real correctness boundary (same P-15/P-08 reasoning Slice 2b's own Constitution Check documented).

## Project form field ↔ storage mapping

| Form field | Type | Required | Storage |
|---|---|---|---|
| `slug` | string, `SLUG_PATTERN_EN` | Yes | `projects.slug` |
| `category` | string (datalist-suggested) | Yes | `projects.category` |
| `isFeatured`, `isServiceShowcase` | boolean | No (default false) | `projects.isFeatured`/`isServiceShowcase` |
| `coverImage` | string, `/api/image/{id}` | Yes | `projects.coverImage` |
| `logo`, `mediaImage` | string or empty, `/api/image/{id}` | No | `projects.logo`/`mediaImage` |
| `systemCardsJson` | JSON-encoded `SystemCardSlotInput[]` | Yes (≥1 row) | fanned into `project_translations.system_cards` (both rows) |
| `resultsJson` | JSON-encoded `ResultSlotInput[]` | No | fanned into `project_translations.results` (both rows) |
| `en.title`, `en.description`, `ar.title`, `ar.description` | string | Yes (both languages) | `project_translations.title`/`description` |
| `en.*`, `ar.*` (remaining optional text fields) | string or empty | No | corresponding `project_translations` columns |
| `en.tags`, `ar.tags`, `en.technologies`, `ar.technologies` | JSON-encoded `string[]` | No | `project_translations.tags`/`technologies` |

## Relationships

```
Project (projects table, existing, unchanged)
   ├─ has exactly two → Project Translation (project_translations, FK project_id → projects.id
   │  ON DELETE CASCADE — deleting a project deletes both translations at the DB level)
   ├─ system_cards / results → assembled from one shared slot list, fanned into each
   │  translation's own jsonb array in identical order (system_cards) / with an
   │  identical value (results)
   └─ cover_image / logo / media_image → "/api/image/{id}" references (Slice 2a's
      images table — read-only from this slice's perspective)

Admin Projects List (new, this slice)
   └─ reads → listProjectsForAdmin() — one row per project, no grouping needed

Create / Edit forms (new, this slice)
   ├─ create → createProjectAction → createProject() → transactional INSERT ×3
   ├─ edit   → updateProjectAction → updateProject() → transactional UPDATE ×3
   └─ delete → deleteProjectAction → deleteProject() → single DELETE (cascade handles the rest)
```

No entity in this slice has an update path outside the DAL functions above; no new table is introduced.
