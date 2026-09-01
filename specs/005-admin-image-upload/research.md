# Phase 0 Research: Admin Image Upload (Phase 2, Slice 2a)

**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Three research items were scoped by the operator for this slice. All three are resolved below with no operator confirmation required before `/speckit-tasks` — each is grounded in either an already-shipped precedent in this exact codebase or a directly-verified fact about the pinned dependency versions.

---

## Research Item 1: Image id strategy (non-enumerable)

**Decision**: A Postgres-generated `uuid` primary key, via `uuid("id").primaryKey().default(sql\`gen_random_uuid()\`)` — the exact same pattern already used in this schema for `articles.translation_group_id` (`lib/db/schema.ts`). No application-code id generation, no new dependency.

**Rationale**:
- This is not a new pattern being introduced — it is already live, committed, and proven in this exact `schema.ts` file. Reusing it is the most consistent, lowest-risk choice, and requires zero new code beyond declaring the column.
- Postgres's `gen_random_uuid()` (built into modern Postgres via `pgcrypto`/core, already relied on by the existing `translation_group_id` column, confirmed working against this project's Neon database) produces a UUID v4 — 122 bits of randomness, not sequentially guessable, satisfying FR-012's non-enumerability requirement directly.
- Generating the id at the database layer (not in application code) means `createImage` in the DAL can simply `.returning()` the inserted row and read `id` off the result, exactly mirroring how `articles`'s `translationGroupId` is already produced and consumed elsewhere in this codebase — no new id-generation utility function needed anywhere.

**Alternatives considered**:
| Option | Rejected because |
|---|---|
| Application-generated random id (`crypto.randomUUID()`, a Node built-in, zero-dependency) | Works equally well cryptographically, but introduces a second id-generation mechanism alongside the DB-generated one already used for `translation_group_id`, for no benefit — the DB-generated approach is already proven in this schema and requires less application code. |
| Content-derived hash (e.g. SHA-256 of the final processed bytes) | Gives free deduplication (two uploads of the same image collapse to one row) and content-addressed immutability, but adds real complexity for this slice's actual scope: a hash-based primary key needs collision/race handling on concurrent uploads of the same image, and deduplication is not a requirement anywhere in the spec (FR-012 asks only for non-enumerability). Speculative complexity for a marketing site's low upload volume — YAGNI, matching the spec's own Assumptions note that this choice is "left open for the planning phase" precisely because it's an implementation detail, not a behavior requirement. |

---

## Research Item 2: Route Handler session-check primitive (401, not redirect)

**Decision**: A new, small helper in `lib/auth-server.ts` — `getSessionOrNull(request: Request)` — calling `auth.api.getSession({ headers: request.headers })` (the same underlying Better Auth call `requireAuth()` already uses) and returning `null` on no session, instead of redirecting. The upload Route Handler calls it directly and constructs its own `401` JSON response when it returns `null`.

**Rationale**:
- `requireAuth()` (`lib/auth-server.ts`, unchanged, Phase 0) already proves the exact underlying primitive works in this codebase: `await auth.api.getSession({ headers: await headers() })`. The only thing wrong for a Route Handler is what happens on a miss — `requireAuth()` calls `redirect("/admin/auth")`, which throws a `NEXT_REDIRECT` internal signal meant for a page render, not an API response. The fix is not a different session-reading mechanism, only a different *response* to the same lookup result.
- Inside a Route Handler, the incoming `Request` object's own `.headers` (a standard `Headers` instance) is used directly instead of `next/headers`'s `headers()` — `auth.api.getSession()` accepts any `Headers`-shaped value, and using the handler's own request object is the more direct, idiomatic source of the request's cookies in this context (no reliance on the internal async-context `headers()` accessor that pages use).
- This keeps the constitution's rule intact ("Authorization is enforced inside Server Components, Server Actions, Route Handlers, and the DAL — never solely in `proxy.ts`") using the same session-reading call already audited and working in this codebase, just paired with the response shape (`401` JSON) this specific context (an API endpoint, not a page) requires.

**Alternatives considered**:
| Option | Rejected because |
|---|---|
| Reuse `requireAuth()` directly in the Route Handler | It redirects (throws `NEXT_REDIRECT`) on a miss, which is the wrong behavior for an API endpoint per FR-003 — a `fetch()` caller would see a redirect response, not a clean `401` JSON body, and no page exists at `/admin/auth` to usefully redirect an API client to anyway. |
| A bespoke cookie-parsing/session-lookup implementation, bypassing Better Auth's own API | Reinvents session validation the constitution explicitly reserves for "mature, patched libraries" (Better Auth) — no reason to bypass `auth.api.getSession()`, which already does this correctly and is already proven in this codebase. |

---

## Research Item 3: Enforcing the 5 MB ceiling before full buffering

**Decision**: Two layers, in this order, inside the upload handler — no new dependency:
1. **Fast-path guard**: read `request.headers.get("content-length")` before touching the body at all. If present and it exceeds 5 MB, return `413` immediately — zero bytes of the body are ever read.
2. **Post-parse backstop**: after `await request.formData()` extracts the file, check the resulting `File`'s `.size` against the same 5 MB ceiling before handing its bytes to `sharp`. If it exceeds the ceiling, return `413`/`400` and discard the buffer without ever calling `sharp` or writing to the database.

**Rationale**:
- Next.js Route Handlers (unlike Server Actions) have no built-in body-size ceiling of their own to lean on — that config (`serverActions.bodySizeLimit`) is specific to the Server Action mechanism this slice deliberately avoids (FR-002), so the ceiling must be enforced by this slice's own code either way.
- `request.formData()` is the Fetch API's built-in multipart parser (used natively by the Next.js Route Handler runtime) and has no exposed streaming size-limit hook — there is no way to interrupt it mid-parse without either a manual byte-by-byte stream read (a nontrivial hand-rolled multipart parser) or a new streaming-multipart-parsing dependency, and this slice adds no dependency beyond the already-flagged `sharp` (constitution Scope Discipline). Given that, the `Content-Length` pre-check is the correct, dependency-free way to reject an oversized request *before* any buffering happens, and it covers the realistic case for this endpoint: a same-origin, admin-only upload form submitting a `<input type="file">`'s contents always produces an accurate `Content-Length` (browsers compute it from the actual file size before sending), so the fast-path guard catches every ordinary oversized upload with zero body bytes read.
- **Residual, explicitly acknowledged limitation**: a client that deliberately sends a false, understated `Content-Length` header while actually streaming more bytes than declared would not be caught by the fast-path guard, and `request.formData()` would fully buffer the (larger) body before the post-parse `file.size` check ever runs. Closing this completely would require a manual streaming multipart parser or a new dependency — out of proportion for this slice, and meaningfully mitigated by the fact the endpoint is already auth-gated (FR-003) before any of this runs: only an authenticated admin — not an anonymous attacker — could exploit this gap, which is a different, much smaller threat model than an unauthenticated resource-exhaustion vector. This tradeoff is recorded here rather than silently accepted.

**Alternatives considered**:
| Option | Rejected because |
|---|---|
| Rely on `file.size` alone (skip the `Content-Length` pre-check) | Still correct eventually, but always fully buffers the body via `request.formData()` before rejecting an oversized file — exactly the "before processing, not after buffering unbounded data" requirement (FR-004) this item exists to satisfy. The pre-check is what actually avoids the buffer in the ordinary case. |
| Hand-rolled streaming multipart parser reading `request.body` chunk-by-chunk with a hard byte cap | Would close the residual gap completely, but is substantial unrequested complexity (a full multipart/form-data boundary parser) for a low-traffic, already-authenticated admin endpoint — disproportionate given the threat model, and not requested by any FR. Revisit only if this endpoint's exposure changes (e.g., it becomes reachable without authentication). |

## Dependency check (constitution Scope Discipline)

`sharp` is the one new dependency this slice adds, exactly as the spec already requires as a settled, expected action (FR-018) — its addition still needs its own decision-log entry at implementation time, per that requirement; this research does not re-litigate whether to add it, only confirms (via direct inspection of `package.json`, `sharp` absent) that it is in fact currently absent. No other new dependency is introduced by any of the three decisions above — the uuid strategy uses a Postgres built-in already relied on elsewhere in this schema, the auth primitive reuses Better Auth's existing `auth.api.getSession()` call already proven in `lib/auth-server.ts`, and the size-ceiling enforcement uses only the Fetch API's native `Request`/`FormData` surface.

## Sources

- Current repository state, read directly: `lib/db/schema.ts` (`translationGroupId` uuid pattern), `lib/auth-server.ts` (`requireAuth()`, the proven `auth.api.getSession({ headers })` call), `lib/error-handler.ts` (`withErrorHandling`), `lib/logger.ts` (`withRequestLogging`), `app/api/health/route.ts`, `app/api/auth/[...auth]/route.ts`, `drizzle.config.ts`, `drizzle/0001_case_study_schema.sql`, `package.json` (confirming `sharp` absent, `better-auth` pinned at `1.6.30`, `drizzle-orm` at `0.45.2`).
- Next.js Route Handlers reference (`node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`, pinned `16.3.1`) — confirms Route Handlers use the plain Web `Request`/`Response` API with no built-in caching or body-size behavior for non-`GET` methods, consistent with this slice needing to enforce its own size ceiling.
- `npm view sharp version` (run directly against the npm registry) — confirms `sharp` is an actively published, current package (`0.35.4` at research time) available to add.
