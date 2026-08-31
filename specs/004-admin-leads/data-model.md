# Data Model: Admin Leads View (Phase 2, Slice 1)

**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

This slice introduces **zero schema changes and zero migrations** — the `leads` table, `lead_status_enum`, and `lead_source_enum` already exist unchanged from Phase 0/1D (spec Assumptions). The shapes below extend the existing `lib/db/leads.ts` module (research.md, Decision 4) and describe the two new Server Actions' contracts. Named to mirror the spec's own Key Entities section.

## Lead (existing — `lib/db/schema.ts`, unchanged)

```ts
// unchanged, already shipped in 1D:
export const leadStatusEnum = pgEnum("lead_status_enum", ["new", "read", "archived"]);
export const leadSourceEnum = pgEnum("lead_source_enum", ["contact", "newsletter"]);

export const leads = pgTable("leads", {
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
});

// already exported from lib/db/leads.ts:
export type Lead = typeof leads.$inferSelect;
```

- Every field except `id`/`email`/`source`/`status`/`createdAt` is nullable — a newsletter lead genuinely has `name`/`phone`/`company`/`service`/`message` all `null` (1D). This slice's display logic (FR-008) treats each nullable field as "render if present, omit otherwise," and treats `name` specifically as "render `name`, falling back to `email`, never blank."
- This slice reads and mutates `status` only; it never writes `name`/`email`/`phone`/`company`/`service`/`message` (FR-027 — leads are inbound-only).

## Status Filter (new — request-scoped, not persisted)

```ts
// app/(en)/admin/(protected)/leads/page.tsx — parsed from searchParams, not a stored type
type StatusFilter = "new" | "read" | "archived" | undefined; // undefined = "all"
```

- Parsed via `leadStatusEnum.enumValues.includes(value) ? value : undefined` — an invalid or absent `?status=` collapses to `undefined` ("all"), satisfying FR-013/FR-015 without throwing.
- Passed straight to `listLeads(status)` below; never held in component state, never client-filtered (FR-014).

## Data-access module (extends `lib/db/leads.ts`)

```ts
// lib/db/leads.ts — ADDED, alongside the existing Lead / createLead / createNewsletterLead

export async function listLeads(status?: Lead["status"]): Promise<Lead[]> {
  return db
    .select()
    .from(leads)
    .where(status ? eq(leads.status, status) : undefined)
    .orderBy(desc(leads.createdAt));
}

export async function updateLeadStatus(id: number, status: Lead["status"]): Promise<Lead | null> {
  const [lead] = await db
    .update(leads)
    .set({ status })
    .where(eq(leads.id, id))
    .returning();
  return lead ?? null;
}

export async function deleteLead(id: number): Promise<Lead | null> {
  const [lead] = await db.delete(leads).where(eq(leads.id, id)).returning();
  return lead ?? null;
}
```

- `listLeads`: `.where(undefined)` is a supported, typed Drizzle no-op (research.md, Decision 4/sources) — "all" and "filtered" are the same query shape, not two code paths. Always orders newest-first (FR-007/FR-026), matching 1C's existing `getPublishedArticles`/`getPortfolioSlugs` ordering-in-the-DAL pattern.
- `updateLeadStatus` / `deleteLead`: both return `null` (not a thrown error) when `id` matches no row — this is what lets the calling Server Action "fail safely" (FR-020/FR-024) with a plain `if (!lead) { ...; return; }` rather than a try/catch around a thrown DB error.
- Verb-first named exports, `type` (not `interface`) throughout, matching committed conventions — identical style to the existing `createLead`/`createNewsletterLead` in the same file.

## Server Actions (new — `app/(en)/admin/(protected)/leads/actions.ts`)

```ts
"use server";

const statusSchema = z.enum(leadStatusEnum.enumValues); // ["new", "read", "archived"]

export async function updateLeadStatusAction(id: number, formData: FormData): Promise<void> {
  await requireAuth();                              // FR-018 — independent of the (protected) layout
  const parsed = statusSchema.safeParse(formData.get("status"));
  if (!parsed.success) return;                       // FR-017 — invalid value, no write
  await updateLeadStatus(id, parsed.data);            // FR-020 — no row matched → no-op, no throw
  revalidatePath("/admin/leads");                     // FR-019
}

export async function deleteLeadAction(id: number): Promise<void> {
  await requireAuth();                              // FR-022 — independent of the (protected) layout
  await deleteLead(id);                               // FR-024 — no row matched → no-op, no throw
  revalidatePath("/admin/leads");                     // FR-023
}
// Verified directly (throwaway tsc probe, removed after use): `deleteLeadAction.bind(null, id)`
// produces `() => Promise<void>`, which DOES satisfy React's `<form action>` prop type against
// this project's exact Next 16.3.1 / React 19.2.8 typings — no unused FormData parameter needed.
```

- Both actions call `requireAuth()` as their first statement — the same function the `(protected)` layout already calls, imported from `lib/auth-server.ts` unchanged. `requireAuth()` redirects to `/admin/auth` when no session exists (existing behavior, unchanged); it never returns without a valid session, so nothing below it in either action runs unauthenticated (FR-018/FR-022, spec AC-8/SC-005).
- `id` is bound into each action via `.bind(null, lead.id)` at render time (Next's documented pattern for extra Server Action arguments — research.md, Decision 1) — it is never a hidden form field, so it cannot be tampered with via DevTools without also needing a valid session to matter (the action re-validates nothing about `id` itself, since any `id` — valid or not — is safe to pass into `updateLeadStatus`/`deleteLead`, which handle "not found" by returning `null`).
- Neither action returns a value the calling `<form>` inspects — there is no `useActionState` here (Research Item 1: no client-rendered error/pending UI is specified beyond "fail safely," which the DAL's `null`-on-miss return already satisfies without needing to surface anything to the admin).

## Admin Navigation Shell (new — `app/(en)/admin/(protected)/admin-nav.tsx`)

```ts
// "use client" — mirrors components/site-header.tsx's existing usePathname() pattern
type AdminNavLink = {
  path: string;    // "/admin" | "/admin/leads"
  label: string;   // "Dashboard" | "Leads"
};

const ADMIN_NAV_LINKS: AdminNavLink[] = [
  { path: "/admin", label: "Dashboard" },
  { path: "/admin/leads", label: "Leads" },
];
```

- A fixed, two-entry array today (FR-001) — later slices (articles, projects) add entries here, not a redesign (US-5).
- Active-link detection: `usePathname() === link.path` (exact match; `/admin` and `/admin/leads` never nest under each other, so no prefix-matching ambiguity exists yet — future slices with their own nested routes will need to revisit this if that changes, noted here rather than pre-solved for a case that doesn't exist yet).
- Also renders the existing `signOutAction` (from `(protected)/actions.ts`, unchanged) in a `<form action={signOutAction}><SignOutButton /></form>`, exactly as the dashboard page renders it today — moved here so it is present on every admin page (FR-003), not duplicated per page.

## Relationships

```
Lead (existing table, 1D)
   └─ read by → listLeads(status?) ──newest-first──> Leads View (this slice)
   └─ mutated by → updateLeadStatusAction(id, formData) ──requireAuth + Zod──> updateLeadStatus(id, status) ──> revalidatePath("/admin/leads")
   └─ mutated by → deleteLeadAction(id) ──requireAuth──> deleteLead(id) ──> revalidatePath("/admin/leads")

Status Filter (?status=, request-scoped)
   └─ parsed by → Leads View's page component ──feeds──> listLeads(status?)

Admin Navigation Shell
   └─ rendered by → app/(en)/admin/(protected)/layout.tsx, wrapping every page under (protected) (Dashboard, Leads, and future sections)
```

No entity here gains a create path in this slice (FR-027) — the only lifecycle events a `Lead` can undergo through this UI are a status transition (`new`/`read`/`archived`, in any direction) or deletion; creation remains exclusively the public contact form and newsletter signup (1D, unchanged).
