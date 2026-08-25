# Phase 0 State Report

Factual snapshot of the repository as committed (HEAD `4941d9f`, branch `master`). Reports what exists, not what should exist.

---

## 1. Repo tree

Every tracked file (`git ls-files`), excluding `node_modules/`, `.next/`, `.git/` (none of which are tracked).

```
.claude/skills/speckit-analyze/SKILL.md
.claude/skills/speckit-checklist/SKILL.md
.claude/skills/speckit-clarify/SKILL.md
.claude/skills/speckit-constitution/SKILL.md
.claude/skills/speckit-converge/SKILL.md
.claude/skills/speckit-implement/SKILL.md
.claude/skills/speckit-plan/SKILL.md
.claude/skills/speckit-specify/SKILL.md
.claude/skills/speckit-tasks/SKILL.md
.claude/skills/speckit-taskstoissues/SKILL.md
.env.example
.gitignore
.replit
.specify/.gitignore
.specify/init-options.json
.specify/integration.json
.specify/integrations/claude.manifest.json
.specify/integrations/speckit.manifest.json
.specify/memory/.constitution-template.json
.specify/memory/constitution.md
.specify/scripts/bash/check-prerequisites.sh
.specify/scripts/bash/common.sh
.specify/scripts/bash/create-new-feature.sh
.specify/scripts/bash/resolve-template.sh
.specify/scripts/bash/setup-plan.sh
.specify/scripts/bash/setup-tasks.sh
.specify/templates/checklist-template.md
.specify/templates/constitution-template.md
.specify/templates/plan-template.md
.specify/templates/spec-template.md
.specify/templates/tasks-template.md
.specify/workflows/speckit/workflow.yml
.specify/workflows/workflow-registry.json
README.md
app/
├── admin/
│   ├── auth/
│   │   ├── actions.ts
│   │   ├── login-form.tsx
│   │   └── page.tsx
│   └── (protected)/
│       ├── actions.ts
│       ├── layout.tsx
│       ├── page.tsx
│       └── sign-out-button.tsx
├── api/
│   ├── auth/[...auth]/route.ts
│   └── health/route.ts
├── layout.tsx
├── page.tsx
└── robots.ts
drizzle.config.ts
drizzle/
├── 0000_initial.sql
└── meta/
    ├── 0000_snapshot.json
    └── _journal.json
eslint.config.mjs
instrumentation.ts
lib/
├── auth-server.ts
├── auth.ts
├── db/
│   ├── index.ts
│   └── schema.ts
├── env.ts
├── error-handler.ts
└── logger.ts
next.config.ts
package-lock.json
package.json
proxy.ts
scripts/bootstrap-admin.ts
specs/001-foundation-slice/
├── checklists/requirements.md
├── contracts/http-routes.md
├── data-model.md
├── plan.md
├── quickstart.md
├── research.md
├── spec.md
└── tasks.md
tsconfig.json
```

**Deviations from plan.md's intended layout** (`specs/001-foundation-slice/plan.md`, "Project Structure" section):
- Plan specified `drizzle/0001_initial.sql`; actual file is `drizzle/0000_initial.sql` (drizzle-kit's own 0-indexed migration numbering — the first generated migration is `0000`, not `0001`).
- Plan's tree omitted `lib/error-handler.ts` and `lib/logger.ts` — both exist and are wired into `app/api/auth/[...auth]/route.ts`.
- Plan's tree also omitted `package-lock.json`, `README.md`, `.claude/`, `.specify/`, `specs/` — all tooling/spec scaffolding, present as expected.
- Everything else (route layout, `lib/` layout, `scripts/`, root config files) matches the plan exactly.

---

## 2. package.json

**Scripts block (verbatim):**
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start -p ${PORT:-3000}",
  "check": "tsc --noEmit",
  "lint": "eslint ."
}
```

**Exact installed (resolved) versions**, from `package-lock.json` (`packages[""].dependencies` / `.devDependencies`, cross-checked against each package's own lockfile entry):

| Package | Resolved version |
|---|---|
| next | 16.3.1 |
| react | 19.2.8 |
| react-dom | 19.2.8 |
| better-auth | 1.6.30 |
| drizzle-orm | 0.45.2 |
| @neondatabase/serverless | 1.1.0 |
| ws | 8.21.3 |
| zod | 4.4.3 |
| typescript (dev) | 5.9.3 |
| drizzle-kit (dev) | 0.31.10 |
| eslint (dev) | 9.39.5 |
| eslint-config-next (dev) | 16.3.1 |
| @types/node (dev) | 26.2.0 |
| @types/react (dev) | 19.2.18 |
| @types/react-dom (dev) | 19.2.4 |
| @types/ws (dev) | 8.18.1 |
| tsx (dev) | 4.23.12 |
| auth (dev) | 1.6.30 |

All resolved versions equal their declared versions in `package.json` — no `^`/`~` ranges are used anywhere in `package.json`; every dependency is pinned to an exact version.

**Node version:**
- `package.json` → `"engines": { "node": ">=22.0.0" }`
- `.replit` → `modules = ["nodejs-22"]` (Node 22, not the Node 24 the plan lists as "preferred" — see §8)

---

## 3. Naming conventions actually used

**File and directory naming:**
- Multi-word filenames use kebab-case: `login-form.tsx`, `sign-out-button.tsx`, `auth-server.ts`, `error-handler.ts`, `bootstrap-admin.ts`.
- Single-word filenames are plain lowercase: `auth.ts`, `env.ts`, `logger.ts`, `schema.ts`, `index.ts`, `proxy.ts`.
- Directory segments are plain lowercase (`app`, `admin`, `auth`, `api`, `health`, `lib`, `db`, `scripts`).

**Route and route-group naming:**
- `(protected)` is a Next.js route group — no URL segment — wrapping the admin dashboard; its `layout.tsx` calls `requireAuth()` before rendering children.
- `app/admin/auth/` is a sibling of `(protected)`, deliberately *outside* the group, since the login page must be reachable pre-authentication.
- `[...auth]` is a catch-all dynamic segment used once, to mount the entire Better Auth handler at `/api/auth/*`.

**DB naming:**
- Table names: snake_case. Hand-authored app tables are plural nouns (`projects`, `articles`, `leads`, `project_translations`); Better Auth-generated tables are singular, `auth_`-prefixed (`auth_user`, `auth_session`, `auth_account`, `auth_verification`, `auth_rate_limit`).
- Column names: snake_case (`is_featured`, `cover_image`, `created_at`, `related_project_id`).
- Enum names: `{name}_enum` (`language_enum`, `lead_status_enum`, `lead_source_enum`); enum values are lowercase strings (`"en"`, `"ar"`, `"new"`, `"read"`, `"archived"`, `"contact"`, `"newsletter"`).
- Index naming: `{table}_{column(s)}_idx`, e.g. `projects_category_idx`, `articles_language_published_published_at_idx`. **Exception:** the two Better Auth-generated indexes are `auth_account_userId_idx` and `auth_session_userId_idx` — camelCase `userId` embedded in an otherwise snake_case naming scheme (see §8).
- Unique constraint naming: `{table}_{column(s)}_unique`, e.g. `articles_language_slug_unique`.
- FK constraint naming: drizzle-kit's auto-generated `{table}_{column}_{refTable}_{refColumn}_fk`, e.g. `articles_related_project_id_projects_id_fk`.

**Drizzle `schema.ts` naming:**
- Hand-authored app tables: camelCase JS export name mapped explicitly to a snake_case SQL table-name string, e.g. `export const projectTranslations = pgTable("project_translations", ...)`.
- Better Auth-generated tables: snake_case JS export name identical to the SQL table name, e.g. `export const auth_user = pgTable("auth_user", ...)` — this differs from the app-table pattern above (see §8).
- Every column: camelCase JS key mapped to an explicit snake_case SQL column-name string, e.g. `isFeatured: boolean("is_featured")`, `translationGroupId: uuid("translation_group_id")`.
- Relations: exported as `{tableJsName}Relations`, e.g. `auth_userRelations`, `auth_sessionRelations`, `auth_accountRelations` — only defined for the Better Auth tables; no `relations()` exist yet for the four app tables.

**TS naming:**
- Named exports throughout for utilities/helpers/actions (no default-exported utility). `export default function X()` is used only for Next.js pages/layouts, per Next.js's own convention (`AdminAuthPage`, `AdminDashboard`, `ProtectedLayout`, `RootLayout`, `HomePage`).
- Server Actions and helpers: verb-first naming — `signInAction`, `signOutAction`, `requireAuth`, `withErrorHandling`, `withRequestLogging`, `parseEnv`.
- Types: PascalCase (`SignInState`, `Session`). Only `type` aliases are used anywhere in the codebase — no `interface` declarations exist.
- React components: PascalCase (`LoginForm`, `SignOutButton`).

**Env var naming:** SCREAMING_SNAKE_CASE — `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `INDEXING_ENABLED`.

---

## 4. lib/db/schema.ts (full contents)

```ts
import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  serial,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  bigint,
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core";

export const languageEnum = pgEnum("language_enum", ["en", "ar"]);
export const leadStatusEnum = pgEnum("lead_status_enum", ["new", "read", "archived"]);
export const leadSourceEnum = pgEnum("lead_source_enum", ["contact", "newsletter"]);

export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    category: text("category").notNull(),
    isFeatured: boolean("is_featured").notNull().default(false),
    isServiceShowcase: boolean("is_service_showcase").notNull().default(false),
    coverImage: text("cover_image").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("projects_category_idx").on(table.category),
    index("projects_service_showcase_category_idx").on(table.isServiceShowcase, table.category),
  ],
);

export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    translationGroupId: uuid("translation_group_id")
      .notNull()
      .default(sql`gen_random_uuid()`),
    language: languageEnum("language").notNull(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    body: text("body").notNull(),
    coverImage: text("cover_image").notNull(),
    published: boolean("published").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    relatedProjectId: integer("related_project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    relatedSolution: text("related_solution"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("articles_language_slug_unique").on(table.language, table.slug),
    unique("articles_translation_group_id_language_unique").on(
      table.translationGroupId,
      table.language,
    ),
    index("articles_language_published_published_at_idx").on(
      table.language,
      table.published,
      table.publishedAt.desc(),
    ),
    index("articles_translation_group_id_idx").on(table.translationGroupId),
  ],
);

export const projectTranslations = pgTable(
  "project_translations",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    language: languageEnum("language").notNull(),
    title: text("title").notNull(),
    client: text("client").notNull(),
    description: text("description").notNull(),
    challenge: text("challenge").notNull(),
    diagnosis: text("diagnosis"),
    solution: text("solution").notNull(),
    results: jsonb("results").notNull().default([]),
    tags: jsonb("tags").notNull().default([]),
    technologies: jsonb("technologies").notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("project_translations_project_id_language_unique").on(
      table.projectId,
      table.language,
    ),
    index("project_translations_project_id_idx").on(table.projectId),
  ],
);

export const leads = pgTable(
  "leads",
  {
    id: serial("id").primaryKey(),
    name: text("name"),
    email: text("email").notNull(),
    phone: text("phone"),
    company: text("company"),
    service: text("service"),
    message: text("message"),
    source: leadSourceEnum("source").notNull().default("contact"),
    status: leadStatusEnum("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("leads_created_at_idx").on(table.createdAt.desc())],
);

// --- Below this line: generated verbatim by `npx auth generate` (Better Auth
// 1.6.30 CLI) against lib/auth.ts's config. Do not hand-edit — regenerate
// instead if the auth config changes. Only the import statement above was
// consolidated with the application tables' imports; no generated column,
// table, or relation definition was altered. ---

export const auth_user = pgTable("auth_user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  username: text("username").unique(),
  displayUsername: text("display_username"),
});

export const auth_session = pgTable(
  "auth_session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => auth_user.id, { onDelete: "cascade" }),
  },
  (table) => [index("auth_session_userId_idx").on(table.userId)],
);

export const auth_account = pgTable(
  "auth_account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => auth_user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("auth_account_userId_idx").on(table.userId)],
);

export const auth_verification = pgTable(
  "auth_verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("auth_verification_identifier_idx").on(table.identifier)],
);

export const auth_rate_limit = pgTable("auth_rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

export const auth_userRelations = relations(auth_user, ({ many }) => ({
  auth_sessions: many(auth_session),
  auth_accounts: many(auth_account),
}));

export const auth_sessionRelations = relations(auth_session, ({ one }) => ({
  auth_user: one(auth_user, {
    fields: [auth_session.userId],
    references: [auth_user.id],
  }),
}));

export const auth_accountRelations = relations(auth_account, ({ one }) => ({
  auth_user: one(auth_user, {
    fields: [auth_account.userId],
    references: [auth_user.id],
  }),
}));
```

---

## 5. Key module exports

### lib/db/index.ts
- `export const db` — Drizzle ORM instance (`drizzle(pool, { schema })`) bound to a Neon serverless `Pool`. Pool is created once (`max: 10`, `idleTimeoutMillis: 30_000`, `connectionTimeoutMillis: 10_000`) and cached on `globalThis` outside production, to survive dev-mode HMR without opening new pools per reload. `neonConfig.webSocketConstructor = ws` is set at module load for the `drizzle-orm/neon-serverless` driver.

### lib/auth.ts
- `export const auth` — the configured `betterAuth()` instance. Drizzle adapter (`provider: "pg"`) over `lib/db`'s `db` + full schema. `emailAndPassword` enabled; plugins `[username(), nextCookies()]` (order load-bearing — comment notes `nextCookies()` must stay last so it can read `Set-Cookie` headers left by earlier plugins). Model names remapped to the `auth_`-prefixed tables (`auth_user`, `auth_session`, `auth_account`, `auth_verification`). Session: 24h TTL (`expiresIn: 60*60*24`), `updateAge` also 24h (no rolling extension), `cookieCache.enabled: false`. Rate limiting explicitly `enabled: false` (schema/storage wired to `auth_rate_limit` but not enforced — comment cites unverified Replit trusted-client-IP source as the reason, Phase 3 prerequisite). Cookies: `httpOnly: true`, `secure` in production only, `sameSite: "lax"`.

### lib/auth-server.ts
- `export async function requireAuth(): Promise<Session>` — `Session` is `NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>`. Calls `auth.api.getSession({ headers: await headers() })`; if no session, calls `redirect("/admin/auth")` (throws `NEXT_REDIRECT` internally, hence the non-nullable return type); otherwise returns the session.

### lib/env.ts
- `export const env: z.infer<typeof envSchema>` — validated subset of `process.env`: `DATABASE_URL` (required, URL), `DATABASE_URL_UNPOOLED` (required, URL), `BETTER_AUTH_SECRET` (required, min 32 chars), `BETTER_AUTH_URL` (required, URL). In production, computed via an internal `parseEnv()` that calls `envSchema.parse(process.env)`, logs formatted issue messages and calls `process.exit(1)` on failure. Outside production, `process.env` is cast directly to the schema type without validation (fast dev iteration; boot-time enforcement is production-only, triggered via `instrumentation.ts`).

### proxy.ts
- `export const proxy: NextProxy` — optimistic, cookie-presence-only check. Passes through `/admin/auth` unconditionally; for any other `/admin/*` path, calls `getSessionCookie(request)` (from `better-auth/cookies`) and redirects to `/admin/auth` if absent, otherwise passes through. Does not validate the session — `requireAuth()` is the actual boundary.
- `export const config: ProxyConfig` — `{ matcher: ["/admin/:path*"] }`.

---

## 6. Established patterns (verbatim from Phase 0)

**Server Action — login** (`app/admin/auth/actions.ts`):
```ts
"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth";
import { auth } from "@/lib/auth";

export type SignInState = { error: string | null };

export async function signInAction(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const username = formData.get("username");
  const password = formData.get("password");

  if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
    return { error: "Username and password are required" };
  }

  try {
    await auth.api.signInUsername({
      body: { username, password },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      return { error: "Invalid username or password" };
    }
    throw error;
  }

  redirect("/admin");
}
```

**Server Action — logout** (`app/admin/(protected)/actions.ts`):
```ts
"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/admin/auth");
}
```

**`requireAuth()` in the `(protected)` layout** (`app/admin/(protected)/layout.tsx`):
```ts
import { requireAuth } from "@/lib/auth-server";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAuth();
  return children;
}
```

**Login page — `useActionState` + inline-error shape** (`app/admin/auth/login-form.tsx`):
```tsx
"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signInAction, type SignInState } from "./actions";

const initialState: SignInState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(signInAction, initialState);
  return (
    <form action={formAction}>
      {/* ...username/password inputs... */}
      {state.error ? <p role="alert">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
```
The `pending` state is read via a separate child (`SubmitButton`) using `useFormStatus()`, not lifted into `LoginForm` itself.

**Structured-logging call shape** (`lib/logger.ts`, `withRequestLogging`):
```ts
console.log(
  JSON.stringify({
    timestamp: new Date().toISOString(),
    method: request.method,
    path: new URL(request.url).pathname,
    status: response.status,
    duration,
  }),
);
```
Applied by wrapping a Route Handler export, e.g. (`app/api/auth/[...auth]/route.ts`):
```ts
export const GET = withRequestLogging(withErrorHandling(handlers.GET));
```
Only method/path/status/duration are logged — the wrapper has no access to response bodies.

**Top-level error-handler response shape** (`lib/error-handler.ts`, `withErrorHandling`):
```ts
return Response.json(
  {
    message,
    ...(isProduction ? {} : { stack: error instanceof Error ? error.stack : undefined }),
  },
  { status: 500 },
);
```
`console.error(error)` always runs server-side first; `message` falls back to `"Internal server error"` for non-`Error` throws; `stack` is included in the body only outside production.

---

## 7. Config files

- **next.config.ts** — one custom setting: `headers()` conditionally attaches `X-Robots-Tag: noindex, nofollow` to every route (`source: "/(.*)"`) unless `process.env.INDEXING_ENABLED === "true"`. No images/redirects/rewrites/experimental config. *Constrains Phase 1:* any new route inherits this header unless `INDEXING_ENABLED=true` is set.
- **tsconfig.json** — `"strict": true` confirmed. `target: ES2017`, `moduleResolution: "bundler"`, `jsx: "react-jsx"`, `allowJs: false`, path alias `"@/*": ["./*"]`, Next.js TS plugin included, `incremental: true`. *Constrains Phase 1:* `@/*` is the only import alias configured; strict mode applies to all new code.
- **eslint.config.mjs** — flat config; spreads only `eslint-config-next`'s `core-web-vitals` and `typescript` rule sets (`...coreWebVitals, ...nextTypescript`). No custom rules, overrides, or ignores.
- **drizzle.config.ts** — `dialect: "postgresql"`, `schema: "./lib/db/schema.ts"`, `out: "./drizzle"`, `dbCredentials.url` from `DATABASE_URL_UNPOOLED` (throws at config-load time if unset). *Constrains Phase 1:* migrations must go through `drizzle-kit generate` against the unpooled URL and be committed — `drizzle-kit push` is not configured or referenced anywhere.
- **.replit** — `modules = ["nodejs-22"]`; `run = "npm run dev"`; one port mapping (`localPort 3000` → `externalPort 80`); `[deployment] deploymentTarget = "autoscale"`, `build = ["npm", "run", "build"]`, `run = ["npm", "run", "start"]`.

---

## 8. Deviations / unfinished

- **No TODO/FIXME/XXX comments anywhere** — `grep -rn "TODO\|FIXME\|XXX"` across all `.ts`/`.tsx` files returned nothing.
- **Migration file numbering** differs from plan.md: plan specified `drizzle/0001_initial.sql`; the actual, and only, migration is `drizzle/0000_initial.sql` (drizzle-kit's own 0-indexed default numbering for the first generated migration).
- **Node version target not met as "preferred"**: plan.md's Technical Context states Node 24 (Replit `nodejs-24`) is preferred with Node 22 as fallback "if unavailable at implementation time." The committed `.replit` pins `modules = ["nodejs-22"]` — the fallback, not the preferred version, is what's actually configured.
- **Index-naming inconsistency**: `auth_account_userId_idx` and `auth_session_userId_idx` (both Better Auth CLI-generated) embed the camelCase JS field name `userId` directly into the index name, breaking the otherwise fully snake_case index-naming convention used by every hand-authored index (e.g. `projects_category_idx`, `articles_translation_group_id_idx`). This is a direct byproduct of `npx auth generate` and is covered by schema.ts's own do-not-hand-edit comment (lines 121–125) — not treated as a bug to fix in Phase 0.
- **JS export naming split in schema.ts**: hand-authored app tables use a camelCase JS export name distinct from the snake_case SQL table string (`projectTranslations` → `"project_translations"`); Better Auth-generated tables use a snake_case JS export name identical to the SQL name (`auth_user` → `"auth_user"`). Both patterns coexist in the same file by design (generated code left untouched).
- **Rate limiting**: `auth_rate_limit` table and Better Auth `rateLimit` config (schema/storage) exist, but `rateLimit.enabled` is explicitly `false` in `lib/auth.ts` — deferred per plan.md/constitution pending verification of Replit's trusted-client-IP source, not an oversight.
- **No tests directory or test framework** anywhere in the repo — matches plan.md's explicit Phase 0 Testing decision ("None introduced... by operator decision"), not a gap.
- **No `interface` declarations** anywhere in the TS codebase — only `type` aliases are used so far (`SignInState`, `Session`).
- **No `relations()` exports for the four hand-authored app tables** (`projects`, `articles`, `projectTranslations`, `leads`) — only the Better Auth-generated tables have `relations()` defined.
- **Only one substantive inline comment block exists in the codebase**: the generated-code marker in `lib/db/schema.ts` (lines 121–125). All other files are comment-free or carry at most a single one-line rationale comment (`lib/auth.ts` plugin-order note and rate-limit note; `lib/auth-server.ts` return-type note; `next.config.ts`/`app/robots.ts` have none).
