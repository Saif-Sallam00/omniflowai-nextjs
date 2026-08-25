# Phase 1 Planning Note — Slicing Decision

**Date:** 2026-08-25
**Status:** Locked (operator-approved)
**Scope:** Phase 1 (public read paths) structure only. Individual slice specs are written separately, each following the Phase 0 spec → plan → tasks pattern.

---

## Decision: Phase 1 is four slices, not one spec

Phase 1 is split into four independently-specced, independently-verifiable slices with a fixed dependency order. This was chosen over a single mega-spec (buries the dependency order, invites scope sprawl) and over a finer split (per-content-type slices add spec/plan/tasks overhead without added clarity).

### Slice 1A — Bilingual routing + shared page plumbing
The prerequisite everything else builds on.
- `/ar/*` routing; URL as sole source of truth for language (Principle VII); persisted preferences never override URL.
- `lang`/`dir` correctness per language.
- Per-page metadata / canonical / hreflang helper (P-03).
- `react-markdown` + `remark-gfm` pipeline (no `rehype-raw`; data-URI images allowlisted).
- Verified against thin placeholder pages, before real content exists.

### Slice 1B — Static pages (home, about, services)
- Low DB coupling; first real exercise of the 1A plumbing across real content.

### Slice 1C — Data-driven read paths (articles + portfolio, list + detail)
- Articles and portfolio kept together: they share one read pattern (canonical + translations, slug/id routing, `translation_group_id` resolution, bilingual read queries). Build the read layer once.

### Slice 1D — Contact form + Resend
- Only external-dependency slice. Least coupled; goes last. Depends on R-08 (see below).

---

## Dependency order

```
1A  (routing + plumbing)  ──►  1B  (static pages)
                          ──►  1C  (articles + portfolio)
                          ──►  1D  (contact form + Resend)
```

1A blocks all others. 1B / 1C / 1D have no hard dependency on each other and can be sequenced by preference once 1A is locked.

---

## Rationale (brief)

- **1A first, isolated:** getting i18n routing wrong is expensive to retrofit across every page; Principle VII makes it pervasive and non-negotiable, so it earns its own locked acceptance boundary.
- **Articles + portfolio merged (1C):** avoids per-slice ceremony while keeping the slice independently verifiable, because both are the same canonical+translation read pattern.
- **Four, not finer:** matches constitution batch discipline (III scope, IV verify) while keeping each slice reviewable.
- **Only defensible alternative merge** (considered, rejected): 1A+1B into one "routing + static pages" slice. Rejected to keep routing infrastructure locked before pages pile onto it.

---

## Related: R-08 (Resend sender domain)

- Proceeding in parallel this week via Cloudflare DNS. Off Claude Code's critical path (DNS records, not code).
- **Caveat (must not get wrong):** the SPF record MUST be **merged** with any existing `omniflowai.net` SPF, not replaced. A replaced SPF breaks current production email delivery. DKIM/DMARC/sending records are additive and safe.
- Feeds slice 1D. Not a blocker for building 1D (Resend test sender works in dev); de-risks deliverability before cutover.

---

## Next action

Write the **slice 1A spec** next session.