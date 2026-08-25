# Quickstart: Static Public Pages — Slice 1B

Validation guide for confirming slice 1B is complete. Maps to `spec.md`'s User Story acceptance scenarios and Success Criteria SC-001–SC-006. See `data-model.md` for type shapes and `contracts/http-routes.md` for per-route behavior — not duplicated here.

## Prerequisites

- Slice 1A already merged and passing its own quickstart (bilingual routing, `lang`/`dir`, metadata helper, URL-pairing all working against placeholders).
- Local dev server running (`npm run dev`) or the target Replit deployment reachable.
- No new environment variables — this slice adds none.
- Real ported English and Arabic copy for home, about, and solutions available (content-authoring dependency noted in spec Assumptions) before body-content checks below can be verified against actual production wording, as opposed to structural presence.

## Setup

1. **Run the quality gate** (unchanged commands):
   ```
   npm run check   # tsc --noEmit
   npm run lint    # eslint-config-next/core-web-vitals
   npm run build   # next build
   ```
   All three MUST exit zero.

2. No migrations, no new secrets, no admin bootstrap step — this slice is static content and shared chrome only (spec Assumptions).

## Verification steps (map to User Stories & Success Criteria)

| Check | Command / Action | Expected |
|---|---|---|
| Real English home content (US1 AC1) | `curl -s http://localhost:3000/` | Contains real ported home page content — no trace of slice 1A's placeholder text |
| Real Arabic home content (US1 AC2) | `curl -s http://localhost:3000/ar` | Contains real ported Arabic home page content, structurally mirroring the English page |
| Home content present pre-hydration (US1 AC3) | View page source (not rendered DOM) for `/` and `/ar` | Full body content already present in the raw HTML — no loading state, no client-populated content |
| Chrome structural parity across languages (US2 AC1) | Inspect rendered header/nav/footer markup on `/` vs `/ar`, `/about` vs `/ar/about`, `/solutions` vs `/ar/solutions` | Identical DOM structure in all three pairs; only text content and `dir` differ |
| Switcher targets exact counterpart, not home (US2 AC2) | Load `/ar/about`, inspect the language switcher's `href` | `/about` — not `/` |
| Switcher targets exact counterpart, not home (US2 AC3) | Load `/solutions`, inspect the language switcher's `href` | `/ar/solutions` — not `/ar` |
| Nav language consistency (US2 AC4) | Inspect nav labels on any English page vs. any Arabic page | English page nav is entirely English; Arabic page nav is entirely Arabic — no mixed-language labels |
| Real English about content (US3 AC1a) | `curl -s http://localhost:3000/about` | Real ported about content |
| Real Arabic about content (US3 AC1b) | `curl -s http://localhost:3000/ar/about` | Real ported Arabic about content |
| Real English solutions content (US3 AC2a) | `curl -s http://localhost:3000/solutions` | Real content ported from current production's services page |
| Real Arabic solutions content (US3 AC2b) | `curl -s http://localhost:3000/ar/solutions` | Real ported Arabic solutions content |
| Legacy services URL redirects (US4 AC1) | `curl -s -o /dev/null -w '%{http_code} %{redirect_url}' http://localhost:3000/services` | `308` status, redirecting to `/solutions` (research.md, Decision 1 — operator-confirmed, spec.md amended accordingly) |
| Switcher works with JavaScript disabled (Edge Case) | Disable JS (or inspect raw SSR HTML directly) for `/`, `/about`, `/solutions` and their `/ar/*` counterparts | The switcher's `<a href>` is already the correct counterpart URL in the raw HTML — not empty, not a placeholder |
| Chrome renders statically, no per-request API (Edge Case / SC-006) | Inspect `components/site-shell.tsx`, `app/(en)/layout.tsx`, `app/ar/layout.tsx` | No `headers()`/`cookies()` calls anywhere in the chrome or layouts |
| All six pages remain static output (SC-006) | Inspect `next build`'s route table | `/`, `/ar`, `/about`, `/ar/about`, `/solutions`, `/ar/solutions` all marked static (○), none marked dynamic (λ) |
| Metadata complete for all six pages (SC-003) | `curl -s <url> \| grep -E 'title|description|canonical|og:|twitter:|hreflang'` for each of the six page URLs | Real title/description (no placeholder values), correct self-referencing canonical, Open Graph + Twitter tags, correct hreflang trio |
| Reusability — zero per-page reimplementation (unchanged from 1A) | Inspect `app/(en)/solutions/page.tsx` and `app/ar/solutions/page.tsx` | Each calls `buildPageMetadata` with only its own `path`/`title`/`description` — no inline canonical/OG/hreflang construction |
| Global noindex header still present (unchanged) | `curl -i http://localhost:3000/` and `.../ar` and `.../solutions` | `X-Robots-Tag: noindex, nofollow` still present; `redirects()` addition to `next.config.ts` did not disturb it |
| Existing Phase 0 / 1A behavior unaffected | Re-run 1A's quickstart admin login/logout and `/api/health` checks | Unchanged |

## Done when

All rows above pass, all four User Stories' acceptance scenarios and SC-001–SC-006 hold (spec.md), and 1A's own quickstart checks still pass unchanged. The `/services` redirect returns `308`, per the operator-confirmed resolution in research.md's Decision 1.
