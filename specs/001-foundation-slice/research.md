# Research: Foundation Slice — Phase 0

**Date**: 2026-08-21
**Input**: 8 open items from `spec.md` § "Notes on things Spec Kit `/clarify` will likely ask"

Four of the eight items were resolved directly by operator decision (not researched): package-pinning approach, test-infrastructure scope, the `INDEXING_ENABLED` flag name, and the bootstrap-script mechanism. Those decisions are recorded here as given, not re-derived. The remaining four required web research (current package versions, current library API surface, current framework conventions) and are documented below with sources.

---

## 1. Exact Next.js 16.x patch to pin

**Decision**: `16.3.1`

**Rationale**: Operator directive: pin current stable at plan time, record the exact version, never canary/beta/RC. Checked npm registry `dist-tags.latest` for `next` on 2026-08-21: `16.3.1`, published 2026-08-13. Versions after it in the registry (`16.3.1-canary.12` … `.25`) are canary prereleases for the *next* unreleased version, not newer stable releases — `16.3.1` is confirmed as the latest 16.x stable.

**Alternatives considered**: N/A — operator directive fixes the approach; only the version lookup was open.

## 2. Exact Better Auth 1.6.x patch to pin

**Decision**: `1.6.30`

**Rationale**: `dist-tags.latest` on npm is `1.7.1`, but the constitution and spec lock Better Auth to the 1.6.x line (1.7 is RC/beta-adjacent and unvetted for this project). Filtering the registry's full version list to `1.6.*` non-prerelease tags gives `1.6.0` … `1.6.30`, with `1.6.30` the newest — published 2026-08-17, one day before `1.7.0` shipped (2026-08-18). This is the most current possible 1.6.x pin as of plan time.

**Alternatives considered**: N/A — same operator directive as above.

## 3. Exact Better Auth server API calls (username plugin)

**Decision**:
- **Bootstrap (admin creation)**: `auth.api.signUpEmail({ body: { email, name, username, displayUsername, password } })` called server-side from `scripts/bootstrap-admin.ts`. The `username` plugin extends the standard email/password signup body with `username` (required, unique) and `displayUsername` (optional). Populate placeholders per operator decision: `email = "${ADMIN_USERNAME}@omniflowai.local"`, `name = ADMIN_USERNAME`, `emailVerified: true` set on the created record to bypass any verification gate. No raw SQL — Better Auth's own scrypt hashing and normalization apply via this call.
- **Login (Server Action)**: client/server call equivalent to `signIn.username({ username, password })` — Better Auth's username plugin exposes a dedicated username sign-in path distinct from `signIn.email`.
- **Logout (Server Action)**: Better Auth's standard sign-out API (`auth.api.signOut({ headers })`), invalidating the session server-side before the action redirects to `/admin/auth`.
- **Session read (`requireAuth()`)**: `auth.api.getSession({ headers: await headers() })` from `next/headers`, called inside Server Components/layouts. Returns `null` when unauthenticated — `requireAuth()` redirects in that case.
- **Account/credential inspection (AC-6)**: Better Auth stores password credentials in the `auth_account` table (via the `account` `modelName` prefix) with `providerId = "credential"`. AC-6 verification queries `auth_account` for a row with `providerId = 'credential'` linked to the created `auth_user` row.

**Rationale**: Confirmed against Better Auth's current docs (`better-auth.com/docs/plugins/username`, `docs/basic-usage`, `docs/concepts/users-accounts`) and source (`packages/better-auth/src/api/routes/account.ts`). The username plugin layers on top of `signUp.email`/`signIn.email` rather than replacing them wholesale, which is why signup still uses the email-shaped call with `username` added, while sign-in switches to the dedicated `signIn.username` path (login identifier is username, not email, per FR-4.4).

**Alternatives considered**: A hypothetical `signUp.username`-only call was considered but doesn't exist in the 1.6.x API — signup is always through the email-shaped call with username layered in by the plugin; only sign-in gets a distinct `username` variant. Direct SQL insertion into `auth_user`/`auth_account` was rejected per explicit operator instruction (FR must go through Better Auth's own hashing).

## 4. Env var name for production-indexing toggle

**Decision**: `INDEXING_ENABLED` (operator decision, not researched). Server-side only (no `NEXT_PUBLIC_` prefix), since it governs response headers and `robots.txt` generation, both server-rendered. Undefined/absent = staging/non-production behavior (safe default). `INDEXING_ENABLED=true` required to opt into production behavior.

**Rationale**: Given directly by operator. Documented here for completeness since it resolves one of the spec's eight open items.

**Alternatives considered**: N/A (operator directive).

## 5. ESLint flat config file extension

**Decision**: `eslint.config.mjs`

**Rationale**: Next.js 16 removed `next lint`; `next build` no longer runs linting automatically (confirmed on `nextjs.org/docs/app/api-reference/config/eslint`), matching spec FR-12.2 exactly. `create-next-app --typescript` scaffolds `eslint.config.mjs` as the default flat-config file extension for TypeScript projects (with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript` both included) — `.ts` is possible but not the scaffold default, and `.mjs` avoids requiring a TS loader for the lint config itself.

**Alternatives considered**: `eslint.config.ts` — valid but non-default; adds a TS-loader dependency for no benefit in this project. `eslint.config.js` (CommonJS) — not what current `create-next-app` scaffolds; flat config is ESM-first.

## 6. `requireAuth()` server-side redirect pattern

**Decision**: `redirect()` from `next/navigation`, called inside `requireAuth()` (in `lib/auth-server.ts`) after `auth.api.getSession()` returns `null`. This remains the correct Next.js 16 pattern.

**Rationale**: Per current Next.js docs (`docs/app/api-reference/functions/redirect`, updated 2026-08-19 against Next.js 16.3.1), `redirect()` works in Server Components, Route Handlers, and Server Functions (Server Actions) and is the standard way to short-circuit rendering with a server-side redirect. Relevant caveat for this project: when `redirect()` is thrown from inside a Server Action (the login/logout paths, FR-7.2/FR-7.7), Next.js serves a 303 for progressive-enhancement form submissions and does a client-side push navigation when JS is available; when thrown from a Server Component/layout (the `requireAuth()` gate in FR-6.7/FR-6.2), it defaults to a 307/replace-type redirect. No special handling is needed beyond calling `redirect()` before any JSX is returned — both call sites in this spec (`(protected)/layout.tsx` and the login/logout Server Actions) fit this pattern natively.

**Alternatives considered**: Throwing a custom error caught by an error boundary — rejected, `redirect()` is the framework-native mechanism and is what FR-6.2/FR-6.7 already specify at the requirements level.

**Illustrative signature** (documentation only, not implementation):
```ts
// redirect() has a `never` return type and throws internally (NEXT_REDIRECT) —
// that's why requireAuth() can return Promise<Session> with no null/undefined variant.
export async function requireAuth(): Promise<Session> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/admin/auth")
  return session
}
```

## 7. Production-flag verification mechanism

**Decision**: Manual local verification — run a local production build (`npm run build && INDEXING_ENABLED=true npm run start`), then `curl -i` against `/`, `/admin/auth`, `/api/health`, and `/robots.txt` to confirm the `X-Robots-Tag` header is absent and `/robots.txt` serves production-appropriate content. Run again with `INDEXING_ENABLED` unset to confirm the header is present and `/robots.txt` disallows all crawlers. Neither run touches the reachable staging deployment.

**Rationale**: Consistent with the operator's decision to introduce no test framework in Phase 0 (item 2 below) — this is a manual operator verification step, not an automated test, and satisfies AC-16's requirement that "the production-indexing flag MUST NOT be toggled on the staging deployment" by keeping the check entirely local.

**Alternatives considered**: An automated route-handler unit test — would require introducing test infrastructure ahead of the operator's Phase 0 testing decision (item 2); deferred as unnecessary complexity for a single boolean-branch check that a two-command manual verification covers adequately.

## 8. Neon serverless driver + `ws` + `globalThis` singleton — still current for 2026?

**Decision**: Yes — `drizzle-orm/neon-serverless` (the WebSocket-based driver, a drop-in `pg`-compatible replacement supporting session/transaction semantics) with the `ws` package as `neonConfig.webSocketConstructor`, combined with a `globalThis`-cached pool instance, remains the correct combination for a long-lived Node process on Replit Autoscale (not edge/serverless functions, where `neon-http` would be preferred instead for single-shot HTTP queries).

**Rationale**: Per Drizzle's own docs (`orm.drizzle.team/docs/connect-neon`) and Neon's Drizzle guide (`neon.com/docs/guides/drizzle`), `neon-http` suits one-off/edge queries while `neon-serverless` (WebSocket) is for transaction/session support — this project needs transactions (constitution P-15: "multi-statement mutations are atomic") and runs as a persistent Node process, so `neon-serverless` is correct, not `neon-http`. Package versions current as of 2026-08-21: `@neondatabase/serverless@1.1.0`, `ws@8.21.3`, `drizzle-orm@0.45.2`, `drizzle-kit@0.31.10` (all latest stable per npm registry `dist-tags`, no `1.0`→pre-1.0 breaking-change concerns found since the project starts fresh on `1.1.0`, not migrating from a pinned `0.x`).

**Gotcha to flag for implementation**: the `globalThis` singleton pattern should guard against re-creating the pool on every HMR reload in dev only — production doesn't need the guard (no HMR) but including it unconditionally is harmless and is the standard idiom, so no special-casing is required.

**Alternatives considered**: `neon-http` — rejected, doesn't support transactions/session semantics needed by P-15. A raw `pg` `Pool` — rejected, Neon requires TLS-terminated WebSocket handling in serverless-adjacent Node runtimes that `@neondatabase/serverless` already handles; no reason to hand-roll it.

---

## Item 2 (referenced above): Testing scope — operator decision, not researched

**Decision**: No Vitest/Playwright or other test infrastructure introduced in Phase 0. Phase 0 has no business logic that warrants automated tests. Verification is: the quality gate (`tsc --noEmit`, ESLint, `next build`, all zero-error) plus manual verification of AC-1 through AC-17 by the operator against a running instance. Test infrastructure choice is deferred to Phase 1/2 when real business logic exists to test.

**Rationale**: Given directly by operator, consistent with constitution's "no blanket coverage goals" (P-22) and the spec's own FR-12 quality gate, which names `check`/`lint`/`build` but not a test runner for Phase 0.
