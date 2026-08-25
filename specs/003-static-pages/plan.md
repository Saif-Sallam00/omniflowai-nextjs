# Implementation Plan: Static Public Pages — Slice 1B

**Branch**: `003-static-pages` | **Date**: 2026-08-26 | **Spec**: [spec.md](./spec.md)

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Deliver the real static public pages that sit on top of slice 1A's bilingual routing foundation: home, about, and the renamed solutions page (formerly "services"), each in English and Arabic, replacing 1A's thin placeholders — plus the shared `SiteShell` (header, primary nav, footer) and the visible language-switcher control 1A deferred. `SiteShell` is imported by a new nested `(public)` route group per language tree (`app/(en)/(public)/layout.tsx`, `app/ar/(public)/layout.tsx`), not by `app/(en)/layout.tsx`/`app/ar/layout.tsx` directly — a correction from the original design, confirmed with the operator, needed because those two files are also `/admin/*`'s root layout and `/admin/*` has no chrome of its own to shield it from inheriting the public nav/footer/switcher. Resolved via: the legacy `/services` → `/solutions` redirect lives in `next.config.ts`'s `redirects()`, not `proxy.ts`, as a 308 permanent redirect — the operator confirmed 308 over a literal 301 (research.md, Decision 1; spec.md amended to match); the shared chrome and both layout levels stay plain static Server Components, with the switcher isolated as a small `"use client"` island reading `usePathname()` — a hook, not a Dynamic API, that resolves during prerendering for these static routes (research.md, Decision 2, explicitly avoiding 1A's Decision-1 trap in new clothing); and the real English/Arabic page copy is inline JSX per page, matching 1A's existing pattern, with no new content module or dependency (research.md, Decision 3). One new pure helper (`getAgnosticPath`) is added to 1A's existing `lib/language.ts`; no other slice-1A helper is modified.

## Technical Context

**Language/Version**: TypeScript (strict mode) on Next.js 16.3.1 App Router — unchanged from Phase 0 / slice 1A.

**Primary Dependencies**: none added. Uses only what 1A already ships (`next`, `react`) plus the App Router's built-in `usePathname()` hook and `next.config.ts`'s built-in `redirects()` — no new package (research.md, Decisions 1–3).

**Storage**: N/A — zero schema changes, zero migrations, zero database access (spec hard constraint). All six pages and the shared chrome are static content.

**Testing**: No automated test framework introduced by this slice, consistent with 1A's own deferral. Verification is the quality gate (`tsc --noEmit`, ESLint, `next build`, all zero-error) plus manual operator verification against `quickstart.md`, mapped 1:1 to spec.md's acceptance scenarios and success criteria. The one new pure helper (`getAgnosticPath`) is cheap to unit-test like 1A's other helpers; that remains a test-framework decision the operator makes explicitly, not one this plan makes unasked.

**Target Platform**: Replit Autoscale — unchanged.

**Project Type**: web-service — unchanged; same single Next.js App Router project.

**Performance Goals**: Not applicable in the load-bearing sense — but static-rendering eligibility for all six pages is itself a hard constraint (SC-006), not a performance nice-to-have: the chrome and layouts introduce zero Dynamic API calls, and the language switcher's `usePathname()` resolves during prerendering rather than opting any route into per-request dynamic SSR (research.md, Decision 2).

**Constraints**:
- URL preservation (standing rule 002): home = `/`, about = `/about` unchanged from 1A; `/solutions` is new (spec Clarifications, confirmed against the route inventory).
- Exception EX-03: `/services` → `/solutions` is a deliberate, documented URL change, mitigated by a mandatory permanent redirect (spec Assumptions). English-only — production has no pre-existing Arabic services URL, so there is no Arabic-side redirect to add (spec Clarifications).
- Static rendering MUST be preserved for all six pages (SC-006) — `SiteShell`, both `(public)` layouts, and all page files call zero Dynamic APIs; only the language-switcher island uses a client-side hook, which does not force dynamic rendering for these static routes (research.md, Decision 2).
- `SiteShell` MUST NOT leak into `/admin/*` — it is imported by a new nested `(public)` route group's layout, not by `app/(en)/layout.tsx`/`app/ar/layout.tsx` directly, since those remain `/admin/*`'s root layout too and `/admin/*` has no chrome of its own to shield it (Project Structure, corrected design).
- `proxy.ts` gains no new responsibility — the `/services` redirect lives in `next.config.ts` (research.md, Decision 1).
- Reuse 1A's `buildPageMetadata`, `getCounterpartPath`, `getLanguagePath`, `resolveLanguageFromPathname`, `LANGUAGES` unchanged; the only addition to `lib/language.ts` is one new pure helper, `getAgnosticPath`, needed to feed `getCounterpartPath` the input shape it already expects (data-model.md).
- No new runtime dependency (constitution Scope Discipline) — confirmed not needed for any of the three research items.
- **Resolved**: `next.config.ts` `redirects()` can only produce 308 for a permanent redirect, never a literal 301. The operator confirmed accepting 308 (research.md, Decision 1) — functionally and observably identical to 301 for a GET-only page — and spec FR-005, User Story 4's acceptance scenario, and SC-004 are amended to say "308 (permanent)" rather than "301." No downstream artifact asserts a literal 301 anymore.

**Scale/Scope**: Three page types × two languages = six page routes (two, `/` and `/about` and their `/ar/*` counterparts, already exist from 1A with placeholder content to replace; four are new: `/solutions`, `/ar/solutions`, plus `/about`/`/` content updates — see Project Structure). One new redirect rule. Two new shared UI components (`SiteShell`, `LanguageSwitcher`). One new pure helper function.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Constraint | Status | Notes |
|---|---|---|
| I. Diagnosis Before Solution | PASS | Both research decisions with real tooling consequences (redirect status code, `usePathname` static-safety) are grounded in Next.js's own docs fetched directly against the pinned `16.3.1`/`16.3.3` (research.md), not assumed — the 301-vs-308 gap was surfaced explicitly rather than silently resolved, and the operator's resulting decision (308, spec amended) is now reflected consistently across spec.md, plan.md, data-model.md, and contracts/http-routes.md. |
| II. Locked Decisions Are Locked | PASS | No locked decision reopened. 1A's `/ar/*` scheme, `proxy.ts`'s `/admin/*` job, and the metadata/URL-pairing helpers are reused unchanged. The Arabic-URL-scheme question raised during `/speckit-clarify` was resolved as *not* a reopening — production has no pre-existing Arabic URLs, so `/ar/*` is purely additive (spec Clarifications). |
| III. Verify Before Declaring Done | PASS (deferred to implementation) | `quickstart.md` maps 1:1 to every acceptance scenario and success criterion, including an explicit gate on confirming the redirect's actual status code before that row is marked done. |
| IV. Scope Discipline | PASS | Zero new runtime dependencies. The only additions beyond real page content are two small UI components directly required by FR-006/FR-008, one small pure helper required to bridge existing 1A functions (research.md, Decision 2), and one new nested route group per language tree required to scope those components away from `/admin/*` (Project Structure, corrected design) — no content module, no i18n library, no speculative abstraction for six fixed pages (research.md, Decision 3). |
| V. URL Preservation as Default | PASS with documented exception EX-03 | English `/` and `/about` preserved unchanged; `/services` → `/solutions` is the one deliberate change, mitigated by a mandatory 308 permanent redirect (resolved status-code decision above). Arabic side fully satisfies standing rule 002 without needing an exception — no pre-existing Arabic URL is changed or dropped, because none existed (spec Clarifications). |
| VI. Security Is Not Convenience | PASS | `proxy.ts` untouched — no new responsibility, same `/admin/:path*` matcher and cookie check. No auth surface touched by this slice. The `(public)` route-group correction additionally ensures `/admin/*` does not inherit the public chrome (including a language switcher pointing at public marketing URLs) — an unintended UX/scope leak the original design would have introduced, caught before task generation. |
| VII. Bilingual By Architecture | PASS by construction | Extends 1A's already-implemented mechanism to real content; URL remains the sole source of truth — the language switcher is a link the visitor must click, never an automatic redirect based on a stored preference. |
| Runtime constraints (Next.js/Node/TS/ESLint) | PASS | No version changes; strict TS and the existing ESLint config apply unchanged to all new/modified files; `"use client"` is scoped to exactly one small component (`LanguageSwitcher`). |
| Database constraints | N/A (this slice) | Zero schema changes — no database access at all, per spec hard constraint. |

**Result**: No violations. Complexity Tracking table below is not needed. The one open item (redirect status code) is a spec-wording-vs-tooling accuracy question flagged for operator confirmation, not a constitution gate failure.

**Post-design re-check**: `data-model.md` and `contracts/http-routes.md` introduce no entity, dependency, or route beyond what FR-001–FR-014 and the three research decisions already specify — they formalize the spec's own requirements plus the one new pure helper research.md's Decision 2 identified as necessary and the one new nested route group per language tree needed to keep `SiteShell` out of `/admin/*`. That route-group correction adds no URL and no new top-level directory beyond `components/` — it is a pure structural scoping fix, not a new capability. Constitution Check result stands unchanged: PASS, no violations.

## Project Structure

### Documentation (this feature)

```text
specs/003-static-pages/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── http-routes.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/
├── (en)/
│   ├── layout.tsx                    # UNCHANGED — still just <html lang="en" dir="ltr">, 1A's
│   │                                  # own stale metadata fallback (harmless either way; left
│   │                                  # alone per Surgical Changes — not a file this slice needs
│   │                                  # to touch once SiteShell moves to the nested group below).
│   │                                  # Still the root layout for BOTH (public)/* and admin/* —
│   │                                  # deliberately NOT importing SiteShell (see below)
│   ├── (public)/                     # NEW route group — URL-transparent, adds no segment.
│   │   │                              # Scopes SiteShell to public pages only, so app/(en)/admin/*
│   │   │                              # (which has no chrome of its own — admin/(protected)/layout.tsx
│   │   │                              # just calls requireAuth() and returns children) does NOT
│   │   │                              # inherit the public nav/footer/language-switcher.
│   │   ├── layout.tsx                # NEW — imports SiteShell, wraps {children} in
│   │   │                              # <SiteShell language="en">. Only layout that imports it
│   │   │                              # on the English side.
│   │   ├── page.tsx                  # MOVED from app/(en)/page.tsx + MODIFIED — real English
│   │   │                              # home content replaces 1A placeholder. URL unchanged (/)
│   │   │                              # since (public), like (en), is a route group.
│   │   ├── about/
│   │   │   └── page.tsx              # MOVED from app/(en)/about/page.tsx + MODIFIED — real
│   │   │                              # English about content. URL unchanged (/about).
│   │   └── solutions/
│   │       └── page.tsx              # NEW — real English solutions content (ported "services" copy)
│   └── admin/                        # UNCHANGED (1A/Phase 0) — still a sibling of (public) under
│                                      # app/(en)/, still inherits only the bare app/(en)/layout.tsx
├── ar/
│   ├── layout.tsx                    # UNCHANGED — still just <html lang="ar" dir="rtl">, no
│   │                                  # admin equivalent on this tree, but kept symmetric with
│   │                                  # the English side for the same reason (SiteShell scoped
│   │                                  # to (public) only, not the tree's own root layout)
│   └── (public)/                     # NEW route group, mirroring app/(en)/(public)/
│       ├── layout.tsx                # NEW — imports SiteShell, wraps {children} in
│       │                              # <SiteShell language="ar">
│       ├── page.tsx                  # MOVED from app/ar/page.tsx + MODIFIED — real Arabic home
│       ├── about/
│       │   └── page.tsx              # MOVED from app/ar/about/page.tsx + MODIFIED — real Arabic about
│       └── solutions/
│           └── page.tsx              # NEW — real Arabic solutions content
└── api/, robots.ts                   # UNCHANGED (1A/Phase 0)

components/                            # NEW top-level directory — shared across both language trees,
│                                       # cannot live inside app/(en)/ or app/ar/ alone (data-model.md)
├── site-shell.tsx                    # NEW — SiteShell (Server Component): header, nav (3 fixed
│                                      # links via getLanguagePath), footer, renders LanguageSwitcher.
│                                      # Named export, matching this repo's existing non-page-component
│                                      # convention (e.g. login-form.tsx, sign-out-button.tsx)
└── language-switcher.tsx             # NEW — "use client". Reads usePathname(), resolves language
                                       # and counterpart via lib/language.ts. Named export.

lib/
├── language.ts                       # MODIFIED — adds getAgnosticPath(pathname) alongside 1A's
│                                      # existing Language, LANGUAGES, resolveLanguageFromPathname,
│                                      # getLanguagePath, getCounterpartPath (all unchanged)
├── metadata.ts / site.ts / auth*.ts / env.ts / db/*   # UNCHANGED (1A/Phase 0)

next.config.ts                        # MODIFIED — adds redirects() ("/services" → "/solutions",
                                       # permanent: true → 308; research.md Decision 1). Existing
                                       # headers() (global noindex) untouched, independent config field.

proxy.ts                              # UNCHANGED — still only "/admin/:path*" auth-redirect check;
                                       # gains no responsibility for the /services redirect.

drizzle.config.ts / package.json / tsconfig.json / eslint.config.mjs / .replit  # UNCHANGED
```

**Structure Decision**: No new top-level directory except `components/` — needed because `SiteShell` and `LanguageSwitcher` must be importable identically from both language trees' public pages, and neither tree is the "owner" of shared chrome (FR-006 requires both trees import the *same* component so they cannot drift). Non-page components there use named exports, matching this repo's existing convention for non-page/layout components (`login-form.tsx`, `sign-out-button.tsx`) rather than the default-export convention reserved for pages and layouts.

**Correction from the original design (flagged and confirmed with the operator before task generation)**: the original plan had `SiteShell` imported directly by `app/(en)/layout.tsx` and `app/ar/layout.tsx`, matching the feature description's literal wording. That would have leaked the public header/nav/footer/language-switcher into `/admin/*` too, because `app/(en)/layout.tsx` is *also* the root layout for `app/(en)/admin/**`, and `app/(en)/admin/(protected)/layout.tsx` has no chrome of its own (it only calls `requireAuth()` and returns `children`). The corrected design adds one new nested, URL-transparent route group per language tree — `app/(en)/(public)/` and `app/ar/(public)/` — whose own `layout.tsx` is the one that imports `SiteShell`; `app/(en)/layout.tsx` and `app/ar/layout.tsx` themselves are now **unchanged**, not modified. This is the same route-group technique 1A already used to scope `/admin/*` into `app/(en)/admin/*` without changing its URL — route groups add no URL segment, so `/`, `/about`, and `/solutions` are unaffected, and `/admin/*` no longer risks inheriting public chrome. Home and about move from `app/(en)/page.tsx`/`app/(en)/about/page.tsx` into `app/(en)/(public)/page.tsx`/`app/(en)/(public)/about/page.tsx` (pure moves, URLs unchanged) — same on the Arabic side.

The one new pure helper is added to 1A's existing `lib/language.ts` rather than a new file, since it is a small companion to functions already there, not an independent concern (research.md, Decision 2). Content stays inline per page file, matching 1A's existing pattern exactly — no content module, no new dependency (research.md, Decision 3). The legacy redirect is a one-line `next.config.ts` addition, not a new route file (research.md, Decision 1).

## Complexity Tracking

*No violations — Constitution Check above is a clean PASS. Table intentionally omitted per template instruction ("Fill ONLY if Constitution Check has violations that must be justified").*
