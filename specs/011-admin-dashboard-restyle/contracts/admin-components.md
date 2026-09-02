# Contracts: `components/admin/*` presentational component props

These are the internal UI contracts this feature introduces (there is no external API — this project serves its own frontend directly from Server Components per constitution P-05, and this feature adds no Route Handler). Each component is presentational-only per FR-002: no data fetching, no Server Action, no auth call, no DB access. Only `AdminSidebarNav` is a Client Component (it already is today, unchanged reason: `usePathname` + a possible mobile-toggle `useState`); every other component below MUST be usable directly from a Server Component without adding a `"use client"` directive to its caller.

## `AdminShell`
```ts
type AdminShellProps = {
  children: React.ReactNode;
};
```
Renders `<AdminSidebarNav />` plus a `<main>` region containing `children`. Used once, in `app/(en)/admin/(protected)/layout.tsx`, wrapping the existing `{children}` that currently follows the unchanged `await requireAuth()` call.

## `AdminSidebarNav`
```ts
// No props — nav links remain an internal constant, exactly as today's ADMIN_NAV_LINKS.
type AdminSidebarNavProps = Record<string, never>;
```
`"use client"`. Restyled version of today's `admin-nav.tsx` nav markup (the `<nav>` + `<Link>` list + the sign-out `<form action={signOutAction}>`), turned into a vertical sidebar with active-item styling via the same `pathname === link.path` check, plus (if implemented) local `isOpen` state for a mobile drawer toggle. MUST NOT import `lib/env`, `lib/db/*`, `lib/auth-server`, or any other server-only module — verified by the `server-only` build guard.

## `PageHeader`
```ts
type PageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};
```
Server Component. Renders a heading, optional description text, and an optional trailing action slot (e.g. an "Add \<language\> version" link, a "New article" button).

## `Card`
```ts
type CardProps = {
  children: React.ReactNode;
  className?: string;
};
```
Server Component. A bordered, padded, rounded container used for dashboard tiles, list-row cards, and form-section grouping.

## `Button`
```ts
type ButtonVariant = "primary" | "secondary" | "destructive";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};
```
Server Component (styling wrapper only — no interactivity of its own). Spreads all native `<button>` props (`type`, `disabled`, `onClick`, etc.) through unchanged, so existing pending-state buttons (`SubmitButton` using `useFormStatus`, `SignOutButton`) keep their own logic and simply render `<Button variant="..." disabled={pending} type="submit">...</Button>` instead of a bare `<button>`.

## `FormField`
```ts
type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
};
```
Server Component. Renders a `<label htmlFor>`, then `children` (the existing, unmodified `<input>`/`<textarea>`/`<select>` element with all its existing props), then, if `error` is provided, the existing error text (e.g. `state.fieldErrors.title?.[0]`) in a styled `<p role="alert">`. The caller passes the exact same error string it renders today — `FormField` does not compute or know about validation state.

## `Table` family
```ts
type TableProps = { children: React.ReactNode; className?: string };
type TableRowProps = { children: React.ReactNode; className?: string };
type TableCellProps = { children: React.ReactNode; className?: string; header?: boolean };
```
Server Components. Thin styled wrappers around `<table>`, `<tr>`, and `<td>`/`<th>` (via `header`). `TableHead` wraps `<thead>` and typically contains one `TableRow` of `TableCell header` cells.

## `StatusBadge`
```ts
type StatusBadgeTone = "neutral" | "success" | "warning" | "danger";

type StatusBadgeProps = {
  tone: StatusBadgeTone;
  children: React.ReactNode;
};
```
Server Component. Renders `children` (the status text, e.g. `lead.status`, `"Published"` / `"Draft"`, `"Featured"`) inside a colored pill. The domain-to-tone mapping (e.g. `status === "won" ? "success" : ...`) lives in the calling list page, not in this component, keeping `StatusBadge` free of any business rule per FR-002.

## Compliance checklist for every component above

- [ ] No import from `lib/db/*`, `lib/env`, `lib/auth-server`, or any Server Action module.
- [ ] No `"use server"` / no Server Action defined or called.
- [ ] No `fetch`/DB query.
- [ ] Usable from a Server Component (no forced `"use client"`) — except `AdminSidebarNav`, which already legitimately requires it and imports nothing server-only.
- [ ] Accepts existing markup/handlers via `children`/pass-through props rather than reimplementing them.
