# Slice 1D — Contact form + newsletter (write path + Resend)

**Working on:** master (solo-dev, commit-per-slice, review + quality gate before commit).
**Source of truth:** `docs/omniflow-extract-5.md` (contact form, newsletter, lead write, Resend). Design tokens/components already in the app from 1B; `leads` table already exists from Phase 0.
**Depends on:** 1B (design system, footer), 1C (DB read patterns established). Closes Phase 1's public read/write paths.

This is the first **write path** in the app: form → validate → insert lead → fire-and-forget email. Two entry points share it — the contact page and the footer newsletter.

---

## Core principle (from the old app, keep it)

**The lead write and the email are fully decoupled. The lead is saved to Postgres first; the email is fire-and-forget and must NEVER fail the request.** If Resend is unconfigured or throws, the lead is still saved and the user still sees success. This is the correct behavior — a customer inquiry is never lost because an email bounced. Port it exactly.

---

## Architecture (the one real porting decision)

The old app used react-query `useMutation` + toast + an Express `/api/*` endpoint. In Next, per the constitution (P-05, no JSON API for own frontend), this becomes a **Server Action**, not a route handler.

- Contact form: **client component** (needs field state, inline validation, pending state) calling a **Server Action** via `useActionState` (React 19), matching the exact pattern already used for the Phase-0 admin login form. Pending state from the action, not react-query.
- Newsletter: same — small client component in the footer calling a Server Action.
- **No `/api/contact` or `/api/subscribe` route handlers.** The write goes straight through a Server Action to Drizzle. (The old Express endpoints are not recreated.)
- Validation: the shared Zod schema runs **server-side in the Action** (authoritative). Client-side validation is a UX nicety on top, not the security boundary.

---

## In scope

### Contact page — `/contact` and `/ar/contact`
- Port the form layout (extract-5 §1) with real classNames + EN/AR copy.
- Fields: `name` (required, min 2), `email` (required), `phone` (optional), `company` (optional), `service` (required select, options from `CONTACT_SERVICES`: foundation / growth-engine / scale-infrastructure / custom / not-sure, defaulting to `not-sure`), `message` (required, min 10).
- **`?service=` deep-link:** if the URL has `?service=<valid ContactService>`, preselect that option in the dropdown (e.g. a "Get started with Foundation" link from the solutions page lands here with Foundation preselected). Read from `searchParams` server-side. Invalid/absent → default `not-sure`.
- **Validation:** the shared `contactFormSchema` (name min 2, email format, service enum, message min 10; phone/company optional). Runs in the Server Action. Client shows inline field errors via `useActionState`.
- **Submit:** Server Action → validate → `insert into leads` with `source: 'contact'`, empty optional fields stored as `null` (not empty string) → fire-and-forget notify → return success/error to the form.
- **Success/error UX:** the old app used a toast. **Decision needed (see below)** — inline banner vs toast.
- Pending state: disable submit, swap label to "Sending…" / "جارٍ الإرسال…".

### Newsletter (footer) — WIRE IT
- The old app had this **fully wired** (not markup-only) — writing a `source='newsletter'` lead + same notify email. So wiring it in Next is a **faithful port, not new scope.** This finally connects the footer signup that's been inert since 1B.
- Small client component in the footer's "Stay Connected" column → Server Action.
- Validation: `newsletterSchema` (email only) server-side. Client: native `type=email` + empty guard (matches old app — no heavy client validation here).
- Write: `insert into leads` with `email` + `source: 'newsletter'`, everything else `null`.
- Same fire-and-forget notify. Subject falls back to email when no name.
- Success/error: input clears on success; feedback per the UX decision below.
- Copy already extracted (extract-5 §4): `footer.newsletter.text/placeholder`, `footer.toast.subscribed/error`, both languages.

### Shared: lead write + Resend
- One `createLead` path for contact, one `createNewsletterLead` for newsletter (or one parameterized writer) — direct Drizzle insert into the existing `leads` table.
- `notifyNewLead(lead)` — fire-and-forget. Skipped silently (logged) if `RESEND_API_KEY` unset; the lead is saved regardless. Plain-text email, source-aware subject, `-` fallbacks for absent fields. Port the body format from extract-5 §3.
- Env: `RESEND_API_KEY` (optional — no key = email skipped, lead still saved), `NOTIFY_EMAIL` (optional — falls back to a contact constant). Document both in `.env.example`.

---

## Decisions to confirm (I have recommendations)

1. **Success/error UX — inline banner or toast?** The old app used a toast (needs a toast provider). The Phase-0 login form used **inline `useActionState` messages** (no toast infra). **My rec: inline messages**, consistent with the login form you already have, and no new toast dependency. The newsletter can show a small inline "Thanks — you're subscribed." line under the input. If you'd rather have toasts (nicer for the footer), say so — it adds a toast provider.

2. **The Resend `from` address.** The old app hardcodes `onboarding@resend.dev` (Resend's sandbox sender — works with no domain verification, but poor deliverability/branding). You have R-08 (Resend sender-domain verification) in flight on Cloudflare. **My rec: make `from` an env var** (`RESEND_FROM`), defaulting to the sandbox sender, so that when your domain verifies you flip an env var instead of editing code. Small, future-proofs the cutover. Alternative: keep hardcoded (matches old app exactly, but you'll edit code later).

3. **Spam protection — add a honeypot?** The old app has none (no captcha, no rate-limit, no honeypot). A public form with no protection will get bot spam into your `leads` table. **My rec: add a honeypot field** (invisible input; if filled, silently drop) — it's ~10 lines, no dependency, no UX cost, and stops the dumb bots. Full rate-limiting/captcha stays out of scope (Phase 3+ if needed). This is a small, justified *addition* beyond a pure port — flagging it explicitly per scope discipline. If you want a pure port with nothing added, say so and I cut it.

---

## Out of scope
- Rate limiting / captcha (beyond the optional honeypot) — later phase if spam warrants.
- HTML email template — plain text, as the old app.
- Per-service email routing — all leads to one address.
- Admin leads view — Phase 2.
- Actual Resend domain verification (R-08) — proceeds in parallel on Cloudflare; 1D just makes `from` configurable so the flip is easy.

---

## Acceptance criteria
1. `/contact` + `/ar/contact` render the form bilingually, RTL-correct, with all fields + service dropdown; `?service=foundation` preselects Foundation.
2. Server-side Zod validation rejects invalid input (name <2, bad email, message <10) with inline field errors; valid input succeeds.
3. Valid submit writes a `leads` row, `source='contact'`, optional empties as `null`, `status='new'`.
4. Newsletter signup writes a `leads` row, `source='newsletter'`, other fields `null`.
5. With `RESEND_API_KEY` unset: both still save the lead and return success; email skipped + logged (no error to user).
6. With `RESEND_API_KEY` set: notification email sends (verify once against a real/test key); a forced Resend failure does NOT fail the request and the lead is still saved.
7. Honeypot (if kept): a filled honeypot silently drops without writing a lead.
8. Pending state disables submit + shows the sending label; success clears the form/input.
9. Both routes static/appropriate (the pages are static shells; the Action is the dynamic part — confirm no unintended full-route dynamic rendering).
10. Quality gate green (`check`/`lint`/`build` zero).

## Verification
- Quality gate mandatory.
- Operator runtime check: submit contact (valid + invalid) both languages, submit newsletter, confirm rows land in `leads` with correct `source`/nulls (query the DB), confirm `?service=` preselect, confirm the fire-and-forget behavior (unset key = still saved). Then clear any test rows so `leads` returns to its prior state.
- Report: build route table, quality-gate results, confirmation of the decoupled lead-write-vs-email behavior, and that no non-1D section changed.
- **Do not commit** — operator reviews, then commits on master (`1D: contact form + newsletter, Server Actions, Resend fire-and-forget`).

## Parked items to fold in here (small, from earlier)
- **Footer column headings** (`footer.services`/`footer.company` values) — still absent; grab from the live site and add while you're in the footer for the newsletter wiring.
- Static image assets — only if any are needed for the contact page (unlikely); otherwise still parked.

## Phase 1 close
1D is the last public slice. When it's in, Phase 1 (public read + write paths) is complete: bilingual routing, all public pages, portfolio + articles (DB-driven, ISR), and the contact/newsletter write path. Next is Phase 2 (admin CRUD) — which is where the larger-than-expected project editor from Decision 013 comes due.
