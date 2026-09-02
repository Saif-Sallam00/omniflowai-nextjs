# Phase 1 Data Model: Admin Dashboard Restyle

## No new or changed data entities

This feature is presentational only. It introduces no new database table, column, enum, or migration, and changes no existing one. It reads and displays the following existing entities exactly as already modeled, via the existing, unchanged DAL functions:

- **Lead** (`lib/db/leads.ts`, `lib/db/schema.ts`) — read via `listLeads()`; mutated via the existing, unchanged `updateLeadStatusAction` / `deleteLeadAction` Server Actions. No field added, removed, or renamed. `status` values are mapped, at the page level only (not inside the new `StatusBadge` component), to a presentational `tone`.
- **Article** (`lib/db/articles.ts`, `lib/db/schema.ts`), including the `translation_group_id` grouping and `RELATED_SOLUTIONS` client-safe constant (`lib/article-solutions.ts`) — read and mutated via the existing, unchanged article DAL functions and Server Actions. `published` is mapped, at the page level, to a presentational `tone`.
- **Project** (`lib/db/portfolio.ts` / project schema, plus `project_translations`) — read and mutated via the existing, unchanged project DAL functions and the existing transactional create/edit Server Action. `featured`/`showcase` flags are mapped, at the page level, to presentational `tone`s.

## New presentational-only "entities" (component prop shapes, not data)

These are UI component contracts, not persisted data — documented fully in `contracts/admin-components.md`. Listed here only to note they carry no domain fields of their own beyond what a caller passes as `children`/generic props (`title`, `label`, `variant`, `tone`, `error`, etc.), and none of them read from or write to the database, call a Server Action, or call `requireAuth()`.
