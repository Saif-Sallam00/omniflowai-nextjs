# Phase 0 Research: Admin Leads View (Phase 2, Slice 1)

**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Five research items were scoped by the operator for this slice. All five are resolved below with no operator confirmation required before `/speckit-tasks` — none surfaces a spec-wording-vs-tooling conflict of the kind slice 1B hit with its redirect status code.

---

## Research Item 1: Inline status-change mechanism

**Decision**: A plain, uncontrolled `<form action={...}>` per lead row — a `<select name="status">` (three options, `defaultValue` = the lead's current status) plus a small submit button — with no client component at all. The form's `action` is the Server Action bound to that row's lead id via `.bind(null, lead.id)` (Next's documented pattern for passing an argument to a Server Action alongside `FormData`, already precedented in this codebase's Server-Action work).

**Rationale**:
- FR-016/FR-018/FR-019 fix the *behavior* (a Server Action, independently auth-checked, whose result the list reflects without a manual reload) but not the mechanism. A native form submitted to a Server Action already satisfies all three with zero JavaScript: Next.js's form-action model performs the mutation and the ensuing `revalidatePath` server-side, then re-renders the Server Component tree — no full browser navigation, no client state to manage.
- A "small client-island" (`useTransition`/`useActionState` wrapping the same select) would add a `"use client"` boundary and local state for no behavioral gain here: there is no field-level validation UI, no pending-state styling beyond the browser's own default submit affordance, and no per-field error to surface (FR-020's "fail safely" is satisfied by the action itself, not by client-side feedback — see Data Access below). Reaching for a client island would be exactly the kind of unjustified complexity Scope Discipline and Simplicity First warn against for a control this small.
- The one place this slice *does* need a client component is the delete confirmation (Research Item 1 does not need it) — see the Delete section of data-model.md / contracts.

**Alternatives considered**:
| Option | Rejected because |
|---|---|
| Client island (`"use client"` + `useTransition`, calling the action programmatically on `<select onChange>`) | No behavioral requirement it satisfies that the plain form doesn't; adds a client bundle boundary and local state for a single `<select>` with no other interactivity. |
| Auto-submit on `onChange` via a tiny inline script (`form.requestSubmit()`) | Still requires a client component to attach the handler, for a marginal UX gain (skips one button click) not requested by any FR or AC. A visible "Update" button is simpler and makes the mutation an explicit, deliberate action — arguably better for a data-mutating control anyway. |

---

## Research Item 2: Message expand-in-place

**Decision**: Native `<details>`/`<summary>` — zero JavaScript, zero client component.

**Rationale**:
- FR-009 requires "collapsible and expandable in place, without a separate detail page or route." `<details>`/`<summary>` is exactly that, built into HTML, with no dependency and no hydration cost. The browser handles the open/closed state; nothing needs to be a Client Component for this.
- The spec's source document (`docs/leads-slice-spec.md`, FR-2.4) says "matching OLD behavior" for the expand mechanism but does not mandate a specific implementation, and OLD's own mechanism (React state in a client-rendered SPA) doesn't transfer as a requirement — only the observable behavior (collapsed by default, expandable in place) does, which `<details>` satisfies exactly.
- This directly answers the operator's stated preference ("prefer the no-JS-needed approach if it satisfies FR-009") — it does.

**Alternatives considered**:
| Option | Rejected because |
|---|---|
| Client island with `useState` toggling a truncated/full message | Strictly more code and one more client boundary for identical observable behavior; no requirement needs client state here. |

---

## Research Item 3: Revalidation mechanism

**Decision**: `revalidatePath("/admin/leads")`, called at the end of both Server Actions after a successful write — confirmed as the spec's own expected default (`docs/leads-slice-spec.md`, Notes for `/plan`).

**Rationale**:
- `revalidateTag` earns its cost when multiple, differently-shaped reads (e.g. a list view and a separate detail view, or several pages) need to be invalidated together by a shared tag. This slice has exactly one page consuming lead data (`/admin/leads` — no detail route exists or is planned, FR-Out) and exactly two mutations, both of which only need that one path fresh. Reaching for tag-based invalidation here would be an unrequested abstraction for a problem this slice doesn't have.
- `revalidatePath("/admin/leads")` invalidates the page regardless of which status filter (`?status=...`) was active when it was last rendered, so a status change made while filtered still updates the unfiltered view and every other filter's view correctly on next visit.

**Alternatives considered**:
| Option | Rejected because |
|---|---|
| `revalidateTag("leads")` (tagging the DAL read, tagging the mutations) | No second consumer of lead data exists yet to justify a shared tag; adds a naming/coordination surface (remembering to tag every future lead read) for zero present benefit. Revisit if/when a second lead-consuming route exists. |

---

## Research Item 4: Data-access module path

**Decision**: Extend the **existing** `lib/db/leads.ts` (already created in Phase 1 / slice 1D, currently exporting `Lead`, `createLead`, `createNewsletterLead` for the public contact form and newsletter signup) with three new exports — `listLeads`, `updateLeadStatus`, `deleteLead` — rather than creating a new `lib/db/queries/leads.ts`.

**Rationale**:
- The spec's own Assumptions section frames `lib/db/queries/leads.ts` as "a suggestion for the planning phase to confirm, not a hard requirement" (spec.md), deferring exactly this decision to `/plan` — this is not a spec amendment, it is the spec's own deferred decision being resolved as intended.
- The project's actual established convention, confirmed by reading the current repository state, is a **flat** `lib/db/<entity>.ts` module per entity — `lib/db/articles.ts`, `lib/db/portfolio.ts`, `lib/db/leads.ts` all sit directly under `lib/db/`, none nested under a `queries/` subdirectory. Introducing `lib/db/queries/leads.ts` alongside the flat `lib/db/leads.ts` would create two lead-data modules with an inconsistent nesting convention for no reason internal to this slice.
- `lib/db/leads.ts` already exists and already is "one dedicated data-access module" for the `leads` table (FR-006/FR-025's actual requirement) — it already holds the table's write path from 1D. Extending it with the read and the two new mutations keeps all `leads`-table access in the one place FR-025 requires, and keeps the convention slices 2–3 (articles, projects) will follow identical to what 1C already established for their own tables (`lib/db/articles.ts`, `lib/db/portfolio.ts`).

**Alternatives considered**:
| Option | Rejected because |
|---|---|
| New `lib/db/queries/leads.ts`, leaving 1D's `lib/db/leads.ts` as-is | Splits one table's data access across two files/conventions for no benefit; contradicts the flat convention 1C already established and this slice's own FR-025 ("one dedicated data-access module"). |
| New `lib/db/queries/` directory, and *move* 1D's existing functions into it (renaming the file) | Touches slice 1D's already-shipped, already-committed module and its two existing call sites (the contact-form and newsletter Server Actions) for a rename with no behavioral benefit — a scope pull-in this slice doesn't need and Scope Discipline doesn't justify. |

---

## Research Item 5: Admin navigation shell — location and mechanism

**Decision**: A new client component, `admin-nav.tsx`, co-located inside the existing `app/(en)/admin/(protected)/` directory (alongside its existing `actions.ts`, `sign-out-button.tsx`) — not in the top-level `components/` directory used by the *public* `SiteShell`. `(protected)/layout.tsx` renders it, wrapping `{children}`. It reads `usePathname()` to highlight the active section (Dashboard vs. Leads) and renders the existing `signOutAction` sign-out form, moved here from the dashboard page so it appears on every admin page, not only the dashboard.

**Rationale**:
- FR-004 requires admin chrome to be entirely separate from the public `SiteShell` (`components/site-shell.tsx`, slice 1B) — placing the admin nav in `app/(en)/admin/(protected)/` rather than the shared top-level `components/` directory makes that separation structural, not just a matter of which props get passed. `SiteShell` is shared *across the two public language trees*; the admin shell has no second tree to share with (the spec's own Assumptions confirm admin is English-only), so it has no reason to live in the cross-tree-shared location.
- `(protected)/layout.tsx` already calls `requireAuth()` (`headers()`), which already forces the entire admin subtree into per-request dynamic rendering — unlike slice 1B's public chrome, there is no static-rendering constraint to protect here (FR-005 only requires that *this* dynamism not bleed into *public* routes, which it structurally cannot: `(protected)` is a route group nested under `app/(en)/admin/`, never imported by any public route).
- A **Client Component reading `usePathname()`** to highlight the active nav link is not a new pattern for this codebase — `components/site-header.tsx` (slice 1B, public nav) already does exactly this for the same purpose. Reusing a proven, already-shipped pattern is simpler than inventing a server-side alternative (there is no built-in way for a layout to learn the active leaf segment without either a client hook or reading `headers()` itself, and the latter buys nothing here since the subtree is already dynamic).
- Moving the sign-out control from the dashboard page into the shared nav satisfies FR-003 ("remain reachable... as nav grows") literally: today it is reachable from the dashboard only; after this slice it is reachable from every admin page, including `/admin/leads`.

**Alternatives considered**:
| Option | Rejected because |
|---|---|
| Keep nav+sign-out logic duplicated per page (dashboard, leads) | Directly contradicts FR-001's own requirement that the nav be "structured so later slices add links without redesign" — duplicating it per page means every future admin page has to remember to re-add it. |
| Server-side active-section detection via a prop passed from each page down through the layout | Next.js layouts do not receive the active leaf route as a prop; the only built-in ways to learn it are `usePathname()` (client) or re-deriving it from `headers()` in the (already-dynamic) layout — the former is simpler and matches the codebase's existing precedent. |
| Put the admin nav in the shared top-level `components/` directory, next to `SiteShell` | Would suggest a cross-tree-sharing need that doesn't exist (admin is English-only, one tree) and blur FR-004's structural separation from public chrome. |

---

## Dependency check (hard constraint)

No new package is introduced by any of the five decisions above. Every mechanism used — native `<form action>` bound Server Actions, `<details>`/`<summary>`, `revalidatePath`, a `lib/db/*.ts` Drizzle module, and a `"use client"` component reading `usePathname()` — already exists in this codebase (`next`, `react`, `drizzle-orm`, `zod`) from Phase 0/1/1D. Nothing here requires flagging to the operator under the constitution's Scope Discipline principle.

## Sources

- Next.js Server Actions/forms guidance already consulted during slice 1D (`node_modules/next/dist/docs/01-app/02-guides/forms.md` — "Passing additional arguments" via `.bind()`; pinned Next.js `16.3.1`).
- Current repository state, read directly: `lib/db/leads.ts`, `lib/db/articles.ts`, `lib/db/portfolio.ts`, `lib/db/schema.ts` (`leadStatusEnum`, `leadSourceEnum`, `leads` table), `lib/auth-server.ts` (`requireAuth`), `app/(en)/admin/(protected)/layout.tsx`, `app/(en)/admin/(protected)/page.tsx`, `app/(en)/admin/(protected)/actions.ts`, `app/(en)/admin/(protected)/sign-out-button.tsx`, `app/(en)/admin/auth/*`, `components/site-header.tsx` (`usePathname()` precedent), `drizzle-orm` type declarations (`node_modules/drizzle-orm/pg-core/query-builders/{select,update,delete}.d.ts` — confirming `.where(SQL | undefined)` is a supported, typed no-op-when-absent filter).
