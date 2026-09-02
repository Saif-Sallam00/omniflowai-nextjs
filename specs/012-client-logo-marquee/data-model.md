# Phase 1 Data Model: Client Logo Marquee — Real Assets

This slice introduces one in-code type and one static constant — no database entities, no schema, no migration (per FR-008 and constitution's Database section, which is not implicated by this change).

## Entity: `Client`

Represents a single company shown in the marquee, defined in `lib/clients.ts`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | `string` | Yes | Display name. Used verbatim as the `<img>`'s `alt` text (FR-004) — identical between EN and AR pages, no localization. |
| `file` | `string` | Yes | Logo filename only (e.g. `"petra.png"`), not a path. The consuming component prefixes `/clients/` to build the `src`. Extension is explicit per entry (23 `.png`, 3 `.jpg`) and MUST NOT be derived from `name` by any rule (FR-002, research.md D4). |

**Validation rules**:
- `CLIENTS` MUST contain exactly 26 entries, in the exact order given in spec FR-002.
- Every `file` value MUST correspond to an existing file under `public/clients/`.
- `plugin-talents.png` MUST NOT appear as any entry's `file` (FR-007).
- No two entries are required to have distinct `file` or `name` values by this data model (none currently coincide), but the 26 listed entries are each unique in practice.

**State/lifecycle**: None — `CLIENTS` is a static, module-level constant with no runtime mutation, no create/update/delete operations, and no user-facing editing surface in this slice (per FR-008).

**Relationships**: None — `Client` is a flat, standalone record type with no foreign keys or references to other entities in the system.

## Consumption contract (component prop shape)

`LogoMarquee`'s prop type changes from:

```text
{ clients: string[] }
```

to:

```text
{ clients: Client[] }
```

where `Client` is imported from `lib/clients.ts`. The component doubles the array (`[...clients, ...clients]`) for the seamless-loop marquee mechanism (retained verbatim) and renders one `<img>` per doubled entry, keyed by array index (not by `name`/`file`, since each client appears twice — research.md verified-state notes).
