# Phase 5 — Slice 5.6: Client Logo Marquee — Real Assets

**Status:** Draft (pending approval)
**Phase:** 5 (post-cutover cleanup)

## Overview

`components/logo-marquee.tsx` renders each client as a text lockup because no
logo image assets existed when it was built (stated in the component's own
header comment). The card container, sizing, and loop mechanism were built to
hold `<img>` from the start. The assets now exist. This slice swaps text for
images and de-duplicates the client list.

## Problem statement

1. The marquee renders client names as `<span>` text instead of logo images.
2. `CLIENT_LOGOS` is a `string[]` duplicated independently in
   `app/(en)/(public)/page.tsx` and `app/ar/(public)/page.tsx` — 26 entries in
   two places.
3. Filenames cannot be derived from names by rule: 23 assets are `.png`, three
   (`majarrah.jpg`, `pioneer.jpg`, `thaki.jpg`) are `.jpg`.

## Scope

### In scope
- Shared client list module replacing both duplicated arrays.
- `LogoMarquee` renders `<img>` instead of text.
- Prop type change from `string[]` to the shared structured type.

### Out of scope
- Any change to the card container, sizing, borders, shadows, spacing, fade
  gradients, or the `.animate-marquee` mechanism — all retained verbatim.
- Any restyling. Visual work belongs to Phase 6.
- `public/clients/plugin-talents.png` — present in the folder, deliberately NOT
  referenced. Do not add it.
- Making the list DB-driven. It stays a static constant.
- All other Phase 5 items.

## Assets

26 files already committed under `public/clients/`, all lowercase-hyphenated,
served at `/clients/<file>`.

## Functional requirements

### FR-1 — Shared client list
- FR-1.1: Create `lib/clients.ts` exporting a `Client` type
  (`{ name: string; file: string }`) and a `CLIENTS: Client[]` constant.
- FR-1.2: `file` holds the filename only (e.g. `"petra.png"`), not a path. The
  component prefixes the directory. Extensions are explicit per entry — the
  `.jpg`/`.png` split means filenames MUST NOT be derived from `name`.
- FR-1.3: The list contains exactly these 26 entries, in this order, preserving
  the existing on-page order:

  | name | file |
  |---|---|
  | Petra | petra.png |
  | Reliance Hub | reliance-hub.png |
  | Madrid | madrid.png |
  | Ipec | ipec.png |
  | Electromeca | electromeca.png |
  | N2oosh | n2oosh.png |
  | Dar El Maaly | dar-elmaaly.png |
  | El Khateer | elkhateer.png |
  | Beit El 3tara | beit-el3tara.png |
  | El Modhsh | elmodhsh.png |
  | Decork | decork.png |
  | Princess | princess.png |
  | Naas | naas.png |
  | Ta2deer | ta2deer.png |
  | Gzour | gzour.png |
  | Mashareeb | mashareeb.png |
  | Cutz | cutz.png |
  | Kayan | kayan.png |
  | Darat | darat.png |
  | Rafeek | rafeek.png |
  | Arcade | arcade.png |
  | Cleaning | cleaning.png |
  | Majarrah | majarrah.jpg |
  | OEM | oem.png |
  | Pioneer | pioneer.jpg |
  | Thaki | thaki.jpg |

- FR-1.4: Delete the `CLIENT_LOGOS` array from BOTH home page files. Both import
  `CLIENTS` from `lib/clients.ts` instead.

### FR-2 — Marquee renders images
- FR-2.1: `LogoMarquee`'s prop type changes from `{ clients: string[] }` to
  `{ clients: Client[] }`.
- FR-2.2: The `<span>` text lockup is replaced by an `<img>` with
  `src={`/clients/${file}`}` and `alt={name}` — the name verbatim, identical in
  both languages, no localized wrapper text.
- FR-2.3: The image MUST be constrained to fit inside the existing card without
  distorting aspect ratio or overflowing: constrain max height and width and
  preserve aspect ratio (`object-contain`). Source assets vary in intrinsic
  dimensions and aspect ratio.
- FR-2.4: Images MUST use `loading="lazy"` and carry explicit `width`/`height`
  attributes to avoid layout shift.
- FR-2.5: Use a plain `<img>`, not `next/image`. The doubled-array marquee
  renders every logo twice inside a `w-max` flex row; `next/image`'s layout
  behavior fights this container and adds no benefit for small static assets
  already in `public/`.
- FR-2.6: The doubled-array loop mechanism is retained exactly. The `key` MUST
  remain index-based, since each client appears twice.
- FR-2.7: The card `<div>` and its classes, the wrapper, and both fade-gradient
  overlays are retained verbatim. Only the inner `<span>` is replaced.
- FR-2.8: Update the component's header comment — it currently states no logo
  assets exist, which will be false.

## Acceptance criteria

1. **AC-1:** `lib/clients.ts` exists with exactly 26 entries matching FR-1.3.
2. **AC-2:** Neither home page file contains a `CLIENT_LOGOS` array; both import
   `CLIENTS`.
3. **AC-3:** EN home page renders 26 distinct logo images (52 DOM nodes with the
   doubling), no text lockups, no broken images.
4. **AC-4:** AR home page renders identically, with alt text matching EN.
5. **AC-5:** Every `/clients/*` request in the browser network tab returns 200.
   No 404s — this specifically catches filename/extension mismatches.
6. **AC-6:** Logos are visually contained within cards: none overflow, none are
   stretched, none are distorted.
7. **AC-7:** The marquee still animates and loops seamlessly in both languages.
8. **AC-8:** No visual change to card size, borders, shadows, spacing, or fade
   gradients versus the pre-change render.
9. **AC-9:** `plugin-talents.png` is not referenced anywhere in the codebase.
10. **AC-10:** Quality gate passes: `npm run check`, `npm run lint`,
    `npm run build` all exit zero.
11. **AC-11:** Zero drift — no files changed beyond `lib/clients.ts`,
    `components/logo-marquee.tsx`, and the two home page files.

## Verification

Operator verifies AC-1 through AC-11 locally before commit. AC-5 requires
checking the network tab, not just visual inspection — a missing logo can look
like an empty card rather than an obvious error.

## Note

Any logo that is white-on-transparent will be invisible on the white card
background. Report any such case rather than restyling the card — remediation is
a separate decision.
