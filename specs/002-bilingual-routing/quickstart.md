# Quickstart: Bilingual Routing Foundation — Slice 1A

Validation guide for confirming slice 1A is complete. Maps to `spec.md`'s User Story acceptance scenarios and Success Criteria SC-001–SC-005. See `data-model.md` for the type shapes involved and `contracts/http-routes.md` for per-route behavior — not duplicated here.

## Prerequisites

- Phase 0 foundation already deployed and passing its own quickstart (health endpoint reachable, DB migrated, admin bootstrapped) — this slice adds no new infrastructure dependency.
- Local dev server running (`npm run dev`) or the target Replit deployment reachable.
- No new environment variables to configure — `BETTER_AUTH_URL` (already set per Phase 0) is reused as the absolute-URL base (research.md, Decision 2).

## Setup

1. **Run the quality gate** (unchanged commands from Phase 0):
   ```
   npm run check   # tsc --noEmit
   npm run lint    # eslint-config-next/core-web-vitals
   npm run build   # next build
   ```
   All three MUST exit zero.

2. No migrations, no new secrets, no admin bootstrap step — this slice is routing/plumbing only (spec Assumptions).

## Verification steps (map to User Stories & Success Criteria)

| Check | Command / Action | Expected |
|---|---|---|
| English home renders at root (US1 AC1) | `curl -s http://localhost:3000/ \| grep -o '<html[^>]*>'` | `<html lang="en" dir="ltr">` |
| Arabic home renders under `/ar` (US1 AC2) | `curl -s http://localhost:3000/ar \| grep -o '<html[^>]*>'` | `<html lang="ar" dir="rtl">` |
| Stored preference never overrides URL — Arabic cookie on English URL (US1 AC3) | `curl -s -H "Cookie: <any language-preference cookie set to ar>" http://localhost:3000/ \| grep -o '<html[^>]*>'` | Still `<html lang="en" dir="ltr">` |
| Stored preference never overrides URL — English cookie on Arabic URL (US1 AC4) | `curl -s -H "Cookie: <any language-preference cookie set to en>" http://localhost:3000/ar \| grep -o '<html[^>]*>'` | Still `<html lang="ar" dir="rtl">` |
| English home metadata complete (US2 AC1) | `curl -s http://localhost:3000/ \| grep -E 'title|description|canonical|og:|twitter:|hreflang'` | Title, description, `canonical` → absolute `/`, Open Graph + Twitter tags present, hreflang `en`→`/`, `ar`→`/ar`, `x-default`→`/` — all absolute URLs (FR-006) |
| Arabic home metadata complete and cross-referenced (US2 AC2) | `curl -s http://localhost:3000/ar \| grep -E 'title|description|canonical|og:|twitter:|hreflang'` | Same set, `canonical` → absolute `/ar`, hreflang alternates identical to the English page's (both point at the same pair) |
| Nested route pairing is route-specific, not home-page-copied (US2 AC3) | `curl -s http://localhost:3000/about \| grep -E 'canonical|hreflang'` and the same for `http://localhost:3000/ar/about` | `canonical`/hreflang reference `/about` ↔ `/ar/about` — not `/` ↔ `/ar` |
| Unknown English-tree route 404s (US3 AC1) | `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/this-does-not-exist` | `404` |
| Unknown Arabic-tree route 404s (US3 AC2) | `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ar/this-does-not-exist` | `404` |
| Reusability — zero per-page reimplementation (SC-004) | Inspect `app/about/page.tsx` and `app/ar/about/page.tsx` | Each calls the shared metadata helper (`lib/metadata.ts`) and language config (`lib/language.ts`) with only its own `path`/`title`/`description` — no inline canonical/OG/hreflang construction, no inline `lang`/`dir` logic |
| Existing Phase 0 behavior unaffected | Re-run the Phase 0 quickstart's admin login/logout and `/api/health` checks | Unchanged — proxy.ts's broadened matcher must not alter `/admin/*` auth-redirect behavior or `/api/health`'s no-DB-call liveness contract |
| Global noindex header still present (unchanged, not re-verified in depth — Phase 0 already covers it) | `curl -i http://localhost:3000/` and `http://localhost:3000/ar` | `X-Robots-Tag: noindex, nofollow` still present on both (this slice adds correct metadata *underneath* that header, per spec's hard constraint — it does not touch `next.config.ts`) |

## Done when

All rows above pass, both User Story 1–3 acceptance scenarios (spec.md) and Success Criteria SC-001–SC-005 hold, and the Phase 0 quickstart's own checks still pass unchanged (confirming this slice didn't regress `/admin/*` or `/api/health`). See `spec.md` for the authoritative acceptance scenarios and success criteria.
