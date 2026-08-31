# Server Action & Page Contracts: Admin Leads View (Phase 2, Slice 1)

Full-stack Next.js App Router feature, not an API-first service — there is no `/api/leads` and none is added (constitution P-05; spec FR-006/FR-016/FR-021). The "interface" this feature exposes is one Server Component page and two Server Actions, documented per spec FR-001–FR-028.

---

## `GET /admin/leads`

**Handler**: `app/(en)/admin/(protected)/leads/page.tsx` (new)
**Auth**: enforced by the existing `(protected)/layout.tsx` (`requireAuth()`, unchanged) — this page adds no auth logic of its own; only the two mutations below independently re-check (FR-018/FR-022).
**Input**: `searchParams: Promise<{ status?: string }>` (Next.js 16 async searchParams, same pattern as 1C's portfolio/article `[slug]` pages).
**Behavior**:
1. Reads `status` from `searchParams`.
2. Validates it against `leadStatusEnum.enumValues`; anything else (absent, empty, unrecognized) becomes `undefined` ("all") — FR-013/FR-015.
3. Calls `listLeads(status)` (data-model.md) — a direct Drizzle read, no internal fetch (FR-006).
4. Renders: total count (FR-010), the four filter links (All/New/Read/Archived, each a plain `<Link href="/admin/leads?status=...">`, the active one visually indicated — FR-013/FR-014), and one row per lead (FR-008) or one of the two empty states (FR-011).
**Rendering**: dynamic (inherits `(protected)/layout.tsx`'s existing `requireAuth()` dynamism) — this is expected and unchanged from Phase 0's admin area; it does not affect any public route's static rendering (FR-005, verified in quickstart.md).
**Response**: HTML only — no JSON contract, no route handler.

### Per-lead row (rendered by the page above, not a separate route)

Each row is server-rendered and contains:
- Display name (`lead.name ?? lead.email`), source badge, status badge, `service`/`phone`/`company`/`message` when non-null, `mailto:${lead.email}` link, a human-readable `createdAt` (FR-008).
- A `<details><summary>` wrapping `message` when present, collapsed by default (FR-009, research.md Decision 2) — no client component.
- A plain `<form action={updateLeadStatusAction.bind(null, lead.id)}>` containing a `<select name="status" defaultValue={lead.status}>` (three options) and a submit button (FR-016, research.md Decision 1) — no client component.
- A `<DeleteLeadForm action={deleteLeadAction.bind(null, lead.id)} />` — the one Client Component this slice adds for the leads view itself, wrapping a `<form>` whose `onSubmit` gates on `window.confirm(...)` before allowing the native submit to proceed (FR-021's explicit-confirmation requirement).

---

## Server Action: `updateLeadStatusAction`

**Location**: `app/(en)/admin/(protected)/leads/actions.ts`
**Signature**: `(id: number, formData: FormData) => Promise<void>` — `id` pre-bound via `.bind(null, lead.id)` at render time; `formData` supplies `status` from the row's own `<select>`.
**Auth**: calls `requireAuth()` as its first statement (FR-018) — independent of `(protected)/layout.tsx` already having gated the page that rendered the form.
**Validation**: `z.enum(leadStatusEnum.enumValues).safeParse(formData.get("status"))` (FR-017). On failure: returns immediately, no DB write, no revalidation.
**Effect on success**: `updateLeadStatus(id, status)` (data-model.md); if it returns `null` (no matching row — FR-020), the action still returns normally (no thrown error, no crash) without a further write; either way, `revalidatePath("/admin/leads")` runs (FR-019/FR-023 — harmless no-op revalidation when nothing changed).
**Unauthenticated call**: `requireAuth()` redirects to `/admin/auth` before any validation or write occurs — no data is mutated (spec AC-8, SC-005).

## Server Action: `deleteLeadAction`

**Location**: `app/(en)/admin/(protected)/leads/actions.ts`
**Signature**: `(id: number, _formData: FormData) => Promise<void>` — `id` pre-bound via `.bind(null, lead.id)`. The `FormData` parameter is unused (nothing to validate beyond the id itself, which is handled by "not found → no-op") but is required for the bound function's type to satisfy React's `<form action>` prop, which always supplies a `FormData` as the final call-time argument.
**Auth**: calls `requireAuth()` as its first statement (FR-022), on the same terms as `updateLeadStatusAction`.
**Effect on success**: `deleteLead(id)` (data-model.md); a `null` return (no matching row, FR-024) is not an error — the action still returns normally. `revalidatePath("/admin/leads")` runs either way.
**Confirmation**: enforced client-side by `DeleteLeadForm`'s `onSubmit` guard (`window.confirm`) before the form ever submits — the action itself has no "are you sure" step of its own; it trusts that a submission reaching it already passed confirmation (FR-021).
**Unauthenticated call**: identical to `updateLeadStatusAction` — `requireAuth()` blocks before any delete occurs.

---

## Cross-cutting: `app/(en)/admin/(protected)/layout.tsx`

**Modified** (not replaced) — still calls `requireAuth()` first, unchanged. Now additionally renders `<AdminNav>{children}</AdminNav>` instead of returning `children` directly (FR-001–FR-004).

## Cross-cutting: `app/(en)/admin/(protected)/admin-nav.tsx` (new)

`"use client"`. Renders the two nav links (Dashboard, Leads — FR-001), highlights the active one via `usePathname()` (FR-002, mirroring `components/site-header.tsx`'s existing precedent), and renders the existing sign-out form (moved here from the dashboard page — FR-003). Does not import or reference `components/site-shell.tsx` or anything from the public marketing chrome (FR-004).

## Cross-cutting: `app/(en)/admin/(protected)/page.tsx` (dashboard)

**Modified** — its own inline `<form action={signOutAction}><SignOutButton /></form>` is removed (moved into `admin-nav.tsx`, rendered by the layout instead); the page keeps its existing placeholder heading/copy, now reached through the shared nav rather than standing alone.

## Cross-cutting: `lib/db/leads.ts`

**Modified** (not replaced) — adds `listLeads`, `updateLeadStatus`, `deleteLead` alongside the existing `Lead`, `createLead`, `createNewsletterLead` (all unchanged, still used by the public contact form / newsletter Server Actions from 1D — data-model.md).

## Cross-cutting: public route groups (`app/(en)/(public)/*`, `app/ar/**`)

**UNCHANGED.** This slice touches nothing under `(public)/` on either language tree. The admin subtree's dynamic rendering is structurally incapable of affecting them — `(protected)` is nested under `app/(en)/admin/`, which no public route imports or extends (FR-005, spec AC-9/SC-007; verified in quickstart.md via the production build's route table).

---

## Error contract

No new error surface. `lib/error-handler.ts`'s `{ message }` JSON wrapper is specific to Route Handlers and is not touched or needed here — this slice adds no Route Handler. Both Server Actions handle their one failure mode ("no matching lead") by returning normally with a `null` DAL result rather than throwing (FR-020/FR-024); an unauthenticated call is handled by `requireAuth()`'s existing `redirect()` (which itself works by throwing `NEXT_REDIRECT` internally — unchanged Phase 0 behavior, not new to this slice).
