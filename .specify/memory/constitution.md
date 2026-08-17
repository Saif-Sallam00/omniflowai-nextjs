# OmniflowAI Next.js Target — Project Constitution

**Version:** 1.0.0
**Ratified:** 2026-08-17
**Last Amended:** 2026-08-17

This constitution governs the OmniflowAI Next.js 16 rewrite. It is derived from locked architectural decisions 001–012 and their amendments, the standing rule 002 with its documented exceptions, and the project's operating principles. It supersedes any prior working principles from the current production application's repository or documentation.

---

## Core Principles

### I. Diagnosis Before Solution (NON-NEGOTIABLE)
Every architectural or implementation choice starts from verified evidence — the reverse-engineering artifacts, the locked decisions, or new investigation. Solutions are not adopted because they are conventional or popular. When evidence is missing, either investigate or explicitly mark the assumption. Fabricated metrics, invented capabilities, or unverified claims are never acceptable in code, content, or documentation.

### II. Locked Decisions Are Locked
Architectural decisions 001–012 and their amendments are the authoritative source for target architecture. They are reopened only when new evidence materially conflicts with a locked outcome, and reopening requires an explicit decision entry. Implementation batches never silently contradict a locked decision. If a proposed batch would violate a locked MUST from decision 004 (Architecture Principles), it is either rejected or the principle is formally reopened first.

### III. Verify Before Declaring Done
Every implementation batch passes the agreed quality gate before acceptance: TypeScript type check with zero errors, ESLint with zero errors, production build succeeds, relevant automated tests pass, and task-specific verification per the batch's spec succeeds. No batch is accepted solely because an implementation agent reports success. The operator verifies against the batch's acceptance criteria and either accepts, rejects, or requests correction.

### IV. Scope Discipline
Every batch has a defined scope. Out-of-scope issues discovered during implementation are reported, not silently fixed. New features, dependencies, or infrastructure are not introduced without explicit justification tied to a locked decision, a documented invariant, or a resolved product question. YAGNI and KISS apply as active discipline, not aspirations.

### V. URL Preservation as Default
Standing rule 002: every public URL in the reverse-engineering route inventory is a migration invariant by default. URLs change only when there is strong evidence and an explicit decision to change them. Documented exceptions to date: EX-01 (`/portfolio/6` retired at cutover as test data), EX-02 (`/articles/claude-business-operations-guide` retired at cutover as demo content). Any additional exception requires an explicit entry.

### VI. Security Is Not Convenience
Authentication and session management use mature, patched libraries (Better Auth 1.6.x stable per decision 008), not first-party reimplementations. Password hashes never cross the response boundary to the client. Session cookies are `httpOnly`, `secure` in production, and `sameSite`-protected. Required production secrets cause the process to refuse to start if missing (P-13); no silent security-sensitive defaults exist. Authorization is enforced inside Server Components, Server Actions, Route Handlers, and the DAL — never solely in `proxy.ts`.

### VII. Bilingual By Architecture
English is served at the root URL. Arabic is served under the `/ar/*` prefix. The URL is the sole source of truth for the language rendered on any given request; persisted language preferences never override the URL. Every public page in every language returns meaningful HTML with correct `lang`, `dir`, per-page metadata, canonical URL, and hreflang alternates in the initial HTTP response. Both languages receive first-class, symmetric architectural support.

---

## Technology & Architecture Constraints

### Runtime
- **Framework:** Next.js 16.x stable (per decision 007). Canary, beta, RC, and preview releases are prohibited. Exact patch pinned explicitly at implementation time.
- **Node.js:** Current supported LTS available on Replit. Node 24 preferred; Node 22 acceptable fallback. Node version pinned in `package.json` `engines` and in `.replit` `modules`.
- **Deployment:** Replit Autoscale (per decisions 005, 006). Standard `next build` / `next start`. No custom Node server.
- **TypeScript:** strict mode. No `any` where a real type applies.
- **Linting:** ESLint with `eslint-config-next/core-web-vitals` and Next.js TypeScript rules. Runs explicitly in the quality gate (Next.js 16 `next build` does not run lint automatically). Biome is not used.

### Database
- **Postgres:** Neon serverless via WebSocket driver (per decision 2D). Two connection strings: pooled (`DATABASE_URL`) for application runtime, unpooled (`DATABASE_URL_UNPOOLED`) for migrations. Single Neon pool instance via `globalThis` singleton.
- **ORM:** Drizzle. Migration files are committed to git under `drizzle/`. Never `drizzle-kit push` in production workflow; always `generate` and apply committed migrations manually per decision 2M.
- **Schema:** single `public` schema. Application tables and Better Auth tables coexist. Better Auth tables are prefixed `auth_` via `modelName` per decision 010.
- **Integrity:** database-native constraints (CHECK, UNIQUE, foreign keys, enums) where they materially protect invariants (P-08). Zod validation at HTTP/action boundaries complements, not replaces, DB integrity.
- **Multi-statement mutations are atomic** (P-15). Transactions wrap any check-then-write pattern.

### Authentication
- **Better Auth 1.6.x stable** (per decision 008 and amendments 008.1, 008.2). Not 1.7 RC/beta. Exact patch pinned at implementation time.
- **Username-based login** via the `username` plugin. No OAuth, no organizations, no MFA, no magic links, no passkeys unless a future product requirement justifies them.
- **Default Better Auth scrypt** password hashing. No custom `hash`/`verify` functions.
- **Session TTL:** 24 hours (INV-17). No rolling extension.
- **Admin bootstrap:** explicit one-time script using Better Auth's supported server API. Not seeded on application startup. `ADMIN_PASSWORD` is bootstrap-only, not a runtime secret.
- **Rate limiting:** database-backed via Better Auth's `auth_rate_limit` table. Schema created in Phase 0; production enforcement enabled only after Replit trusted-client-IP source is verified.

### Rendering & Data
- **Server Components by default; Client Components by necessity** (P-02). Public pages return meaningful HTML in the initial HTTP response.
- **One database, direct access from Server Components** (P-05). No JSON API layer for the application's own frontend consumption. API routes exist only for external consumers, webhooks, image serving, or third-party integrations.
- **Every public page ships per-page metadata** (P-03): title, description, canonical, OG, Twitter — never the site-wide generic.
- **HTTP responses correctly signal indexability** (P-04). Unknown routes return 404, not 200. Draft/private content returns 404 or `noindex`. Sitemap and robots.txt exist and are correct.

### Content
- **Articles:** per-row per-language with mandatory `translation_group_id` (per decision 010). Slug uniqueness per language. Publish state per row.
- **Projects:** canonical `projects` table plus `project_translations` for language-specific fields. Same numeric project ID resolves both language URLs.
- **Images:** base64 data URIs stored in Postgres `text` columns (per decision 010). Crawler-fetchable via dedicated Route Handler (INV-06). Reconsidered when measured pressure signals warrant.
- **Markdown:** `react-markdown` with `remark-gfm`. No `rehype-raw`. Data URI images allowlisted; other URL schemes fall through to default sanitization.

### Deployment & Ops
- **Environment configuration:** Replit Secrets in production, `.env.local` in development. Boot-time Zod validation. No silent security-sensitive defaults.
- **Health endpoint:** `/api/health` is a dedicated lightweight liveness endpoint. Independent of external services. Not gated by auth.
- **Logging:** structured JSON to stdout for `/api/*` requests. No response bodies logged. Error responses return `{ message }` in JSON; no stack traces in production.
- **Graceful shutdown:** standard `next start` SIGTERM/SIGINT handling. No custom server for this purpose.
- **Migrations:** committed migration files, manual application via `DATABASE_URL_UNPOOLED`, backward-compatibility rule (every migration either forward-compatible with previous code or accompanied by documented cutover window).

---

## Development Workflow

### Change Discipline
- **Every implementation batch starts from a Spec Kit spec** (`specs/<slice>/spec.md`) approved by the operator before `/plan` runs.
- **Every batch has explicit acceptance criteria.** "Done" means acceptance criteria verified, not implementer-declared.
- **No adjacent cleanup within a batch** unless the cleanup is explicitly in the batch's scope. Findings outside scope are reported and, if warranted, become their own batch.
- **Every batch passes the quality gate** before merge to `main`: type check, lint, production build, relevant tests, batch-specific verification.

### Branch & Merge
- Feature branches per batch (`slice/<name>` or similar).
- Squash-merge or fast-forward at operator's discretion; merge commits acceptable when history clarity matters.
- No force-push to `master`/`main`.
- Local → GitHub → Replit deploy flow. Replit pulls only from `master`/`main`; feature branches are not deployed.

### Testing
- **Automated tests for business-critical behavior, security-sensitive logic, and migration invariants** where practical (P-22). No blanket coverage goals.
- Test infrastructure: chosen at implementation time from a small set (Vitest recommended for its Next.js compatibility and speed; Playwright for end-to-end when warranted).
- Every test that ships must actually pass in the quality gate. Skipped tests require a documented reason.

### Verification Before Merge
- TypeScript type check: zero errors.
- ESLint: zero errors.
- `next build`: succeeds.
- Relevant tests: pass.
- Batch-specific verification: operator confirms acceptance criteria met against a running instance.

### Documentation
- Constitution is authoritative for principles and constraints. Updated only via explicit amendment.
- Locked decisions live in the decision log (mirrored from the planning conversation into repo docs).
- Standing rule 002 exceptions are documented in the exception log.
- Individual spec files under `specs/<slice>/` document each batch.
- Do not update the constitution to reflect batch-level details; batches document themselves.

---

## Migration Constraints

The target application is built as a fresh Replit deployment coexisting with the current production application (per decision 012). The current production application remains untouched throughout Phases 0–3. Cutover is big-bang at a chosen window. Only `projects` production data is migrated (two rows: IDs 7 and 8; ID 6 is retired per EX-01). Articles, leads, and legacy sessions start clean in the target. Admin identity is bootstrapped fresh in the target via the bootstrap script; the current admin credential is not carried over.

The current production repository remains the source of truth and rollback reference for the currently deployed application until cutover completes and stability is confirmed.

---

## Governance

### Constitution Supremacy
This constitution supersedes any prior working principles, including CLAUDE.md files or documented conventions in the current production repository. When a locked architectural decision and a general principle conflict, the specific decision governs — but the conflict itself is a signal to reopen either.

### Amendment Procedure
- Amendments to core principles or technology constraints require explicit operator decision, documented as a new entry in the decision log.
- Amendments increment the semantic version: patch for clarifications, minor for added principles or non-breaking constraint additions, major for removed or backward-incompatible principles.
- Amendment log at the top of the file (Ratified / Last Amended dates).
- The constitution is not modified as a side effect of implementation batches.

### Decision Reopening
- Locked decisions 001–012 and amendments are reopened only when new evidence materially conflicts with a locked outcome.
- Reopening produces a new decision entry with explicit reasoning. The old decision remains in the log as historical record.
- Investigation-mode discipline applies: reopen with evidence, not with preference.

### Quality Gate Non-Negotiability
The quality gate defined in Development Workflow above is not skipped for time pressure. A batch that fails the quality gate is either fixed until it passes or explicitly rejected. "It works locally" is not verification.

### Semantic Versioning Policy
- **MAJOR:** removed principle, backward-incompatible governance change, or reversal of a locked decision that ripples into constitution text.
- **MINOR:** added principle, new constraint that batches must respect going forward, or new governance procedure.
- **PATCH:** clarification, typo, wording correction, non-behavioral edit.

---

**Version 1.0.0 — Initial ratification.** Sourced from locked architectural decisions 001–012, amendments 008.1, 008.2, 011.1, standing rule 002 with exceptions EX-01, EX-02, and the operator's project operating instructions.