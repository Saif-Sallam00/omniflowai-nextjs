# Implementation Plan: Bilingual Routing Foundation — Slice 1A

**Branch**: `002-bilingual-routing` | **Date**: 2026-08-25 | **Spec**: [spec.md](./spec.md)

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Deliver the bilingual routing and shared page plumbing every Phase 1 public page will build on: English served unprefixed at root, Arabic under `/ar/*`, with the URL as the sole source of truth for rendered language (constitution Principle VII); correct `<html lang dir>` in the initial HTML response; one reusable per-page metadata helper (title, description, absolute canonical, Open Graph, Twitter, hreflang `en`/`ar`/`x-default`); a reusable URL-pairing function computing a route's counterpart in the other language; and 404s for unmatched routes in both trees — verified against two thin placeholder routes (home + one nested), with zero new content, zero visible UI controls, and zero database schema changes. Resolved via mirrored file-based route trees plus a small set of pure `lib/` helpers, with two independent root layouts (route groups) each hardcoding their own `lang`/`dir` — no i18n library, no new environment variable, and no Dynamic API needed anywhere to determine language (research.md).

## Technical Context

**Language/Version**: TypeScript (strict mode) on Next.js 16.3.1 App Router — unchanged from Phase 0, no version change.

**Primary Dependencies**: none added. Uses only what Phase 0 already ships (`next`, `react`) — no i18n library (research.md, Decision 1).

**Storage**: N/A — zero schema changes, zero migrations (spec Assumptions). The Phase 0 schema (`articles`, `project_translations`, etc.) already carries the per-language content model this slice's routing sits in front of; nothing here touches it.

**Testing**: No automated test framework introduced by this slice, consistent with Phase 0's own deferral ("test-framework choice deferred to Phase 1/2," per `specs/001-foundation-slice/plan.md`). Verification is the quality gate (`tsc --noEmit`, ESLint, `next build`, all zero-error) plus manual operator verification against `quickstart.md`'s table, which maps directly to spec.md's acceptance scenarios and success criteria. This slice's helper functions (`resolveLanguageFromPathname`, `getCounterpartPath`, `buildPageMetadata`) are pure and cheap to unit-test; if the operator wants automated coverage for them, that's a test-framework decision to make explicitly in a future batch, not one this plan makes unasked.

**Target Platform**: Replit Autoscale — unchanged from Phase 0.

**Project Type**: web-service — unchanged; same single Next.js App Router project, no new project boundary.

**Performance Goals**: Not applicable — no load-bearing public traffic exists yet (real content ships in slice 1B). Notably, this slice's chosen mechanism keeps every route (public and `/admin/*`) eligible for Next.js's normal default static rendering / ISR — `lang`/`dir` is hardcoded per root layout rather than resolved from a per-request Dynamic API, so bilingual routing itself adds no rendering-mode cost (research.md, Decision 1).

**Constraints**:
- URL is the sole source of truth for language (Principle VII) — no cookie, header, or stored preference may influence which language a given URL renders (FR-003, spec edge cases).
- No `/en` prefix is ever introduced (standing rule 002) — English stays at its existing unprefixed paths.
- `proxy.ts` is UNCHANGED from Phase 0 — this slice adds no responsibility to it. Its existing `/admin/*` auth-redirect behavior (matcher, `getSessionCookie` check, redirect to `/admin/auth`) is untouched because language resolution no longer runs through it at all (research.md, Decision 1).
- Canonical and hreflang URLs must be absolute (FR-006) — built from `BETTER_AUTH_URL`, reused rather than duplicated into a new env var (research.md, Decision 2).
- Global `noindex` protection (`next.config.ts`, Phase 0) is out of scope to modify — acceptance criteria verify metadata *correctness*, not indexability (spec hard constraint).

**Scale/Scope**: Two languages, minimum four pages total (home + one nested route, each in English and Arabic) to satisfy FR-009's "beyond the trivial single-segment case" requirement. Two independent root layouts (route groups), each a small, static, hardcoded shell. `app/admin/*` moves under one of them as a pure directory move. Two new small `lib/` modules (`language.ts`, `metadata.ts`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Constraint | Status | Notes |
|---|---|---|
| I. Diagnosis Before Solution | PASS | Both research decisions (i18n mechanism, absolute-URL base) are grounded in Phase 0's actual committed state (`docs/phase-0-state-report.md`) and Next.js 16 App Router's real constraints (multiple-root-layout rules, Dynamic API rendering-mode consequences, verified directly against Next.js's own docs for the pinned 16.3.1) — not assumed. Decision 1's `<html lang dir>` mechanism was itself reopened and reversed after the rendering-mode cost of the original approach was made explicit, rather than left on an incomplete evaluation. |
| II. Locked Decisions Are Locked | PASS | No locked decision reopened. Standing rule 002 (URL preservation, no `/en` prefix) and decision 010's per-language content model are upheld exactly, not renegotiated. |
| III. Verify Before Declaring Done | PASS (deferred to implementation) | `quickstart.md` defines verification mapped 1:1 to every acceptance scenario and success criterion in spec.md; the Phase 0 quickstart's own checks are re-run to confirm no regression to `/admin/*` or `/api/health`. |
| IV. Scope Discipline | PASS | Zero new runtime dependencies, zero new environment variables — both explicitly researched and flagged rather than silently decided (research.md). Adopting `cacheComponents`/PPR to patch the original approach was explicitly considered and rejected as an unjustified, unrelated architectural expansion (research.md, Decision 1). `/admin/*` moves to `app/(en)/admin/*` as a pure directory move with zero content edits (every admin file already uses the `@/*` absolute alias) — smaller and more precisely scoped than the rendering-mode cost the original approach carried. No adjacent cleanup bundled in. |
| V. URL Preservation as Default | PASS | No existing Phase 0 URL changes. `/` keeps resolving (its placeholder content is updated in place, not moved); `/admin/*` URLs are unchanged by the route-group move (route groups add no URL segment); `/api/*` untouched. All URLs this slice adds (`/ar`, `/about`, `/ar/about`) are new, not preserved-vs-changed cases. |
| VI. Security Is Not Convenience | PASS | Authentication untouched. `proxy.ts` is not modified at all by this slice — its existing cookie-presence auth-redirect logic and `requireAuth()` server-side enforcement are unaffected because language resolution no longer runs through `proxy.ts` in any form. |
| VII. Bilingual By Architecture | PASS by construction | This slice exists to implement this principle: URL as sole source of truth, symmetric `en`/`ar` support, correct `lang`/`dir`/metadata/canonical/hreflang in the initial HTTP response — all directly specified in FR-001–FR-009. |
| Runtime constraints (Next.js/Node/TS/ESLint) | PASS | No version changes; strict TS and existing ESLint config apply unchanged to all new files. |
| Database constraints | N/A (this slice) | Zero schema changes, per spec Assumptions — the constraint doesn't apply because nothing here touches the database. |

**Result**: No violations. Complexity Tracking table below is not needed (left empty per template instruction).

**Post-design re-check**: `data-model.md` and `contracts/http-routes.md` introduce no entity, dependency, or route beyond what FR-001–FR-009 and the two research decisions already specify — they formalize the spec's own requirements. Constitution Check result stands unchanged: PASS, no violations.

## Project Structure

### Documentation (this feature)

```text
specs/002-bilingual-routing/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── http-routes.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/
├── (en)/                             # NEW — URL-transparent route group; its layout.tsx is an
│   │                                  # independent root layout for everything nested inside it
│   ├── layout.tsx                    # NEW — root layout, hardcoded <html lang="en" dir="ltr">
│   ├── page.tsx                      # MOVED from app/page.tsx — English home placeholder, now
│   │                                  # calls the shared metadata helper
│   ├── about/
│   │   └── page.tsx                  # NEW — English nested placeholder (FR-009's second route)
│   └── admin/                        # MOVED from app/admin/* — pure directory move, zero content
│       └── ...                       # edits (every file already uses @/* imports); URLs unchanged
│                                      # since (en) adds no URL segment
├── ar/                                # literal path segment (NOT a route group) — produces the
│   ├── layout.tsx                    # NEW — root layout, hardcoded <html lang="ar" dir="rtl">
│   ├── page.tsx                      # NEW — Arabic home placeholder, counterpart of (en)/page.tsx
│   └── about/
│       └── page.tsx                  # NEW — Arabic nested placeholder, counterpart of (en)/about/page.tsx
├── robots.ts                         # UNCHANGED (Phase 0) — top-level file convention, no root
│                                      # layout dependency, unaffected by the split above
└── api/                              # UNCHANGED (Phase 0)

lib/
├── language.ts                       # NEW — Language type, LANGUAGES config, resolveLanguageFromPathname(),
│                                      # getCounterpartPath() (data-model.md)
├── metadata.ts                       # NEW — buildPageMetadata() reusable per-page metadata helper
├── site.ts                           # NEW — thin accessor re-exporting env.BETTER_AUTH_URL as the
│                                      # absolute-URL base (research.md, Decision 2) — not a new secret
├── auth.ts / auth-server.ts / env.ts / db/*   # UNCHANGED (Phase 0)

proxy.ts                              # UNCHANGED (Phase 0) — no new responsibility; still only the
                                       # existing "/admin/:path*" auth-redirect check

next.config.ts / drizzle.config.ts / package.json / tsconfig.json / eslint.config.mjs / .replit  # UNCHANGED
```

**Structure Decision**: No new top-level directory outside `app/`, and no library or framework change to the existing single Next.js App Router project. Public bilingual routes are added as mirrored, literal file trees (English under the URL-transparent `app/(en)/` route group, Arabic under the literal `app/ar/` segment) rather than a dynamic `[lang]` segment — this keeps 404 handling automatic (no unmatched path has a `page.tsx`) and keeps language resolution entirely static: each tree's root layout hardcodes its own `lang`/`dir`, so no route anywhere needs a per-request Dynamic API to determine it (research.md, Decision 1 — reopened and reversed from an earlier single-root-layout approach once its full rendering-mode cost was evaluated). `app/admin/*` moves under `app/(en)/` as a pure directory move — route groups add no URL segment, so `/admin/*` URLs and behavior are unchanged, and the move requires zero content edits since every admin file already uses the `@/*` absolute alias. `proxy.ts` is left completely unmodified.

## Complexity Tracking

*No violations — Constitution Check above is a clean PASS. Table intentionally omitted per template instruction ("Fill ONLY if Constitution Check has violations that must be justified").*
