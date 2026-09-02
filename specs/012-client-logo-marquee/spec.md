# Feature Specification: Client Logo Marquee — Real Assets

**Feature Branch**: `012-client-logo-marquee`

**Created**: 2026-09-02

**Status**: Draft

**Input**: User description: "Phase 5, Slice 5.6: Client Logo Marquee — Real Assets. Source of truth: docs/phase-5-slice-5-6-spec.md. Swap the text-lockup client marquee for real logo images now that 26 logo assets exist under public/clients/, and de-duplicate the client list currently maintained separately in the EN and AR home pages."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor sees real client logos in the marquee (Priority: P1)

A visitor lands on the home page (English or Arabic) and scrolls to the client showcase section. Instead of seeing client names rendered as plain text, they see the actual client logo images scrolling continuously in the marquee, inside the same visual card style the section already uses.

**Why this priority**: This is the entire purpose of the slice — the marquee was built to hold logo images from the start, and the assets now exist. Without this, the section still looks like a placeholder.

**Independent Test**: Load the EN home page and the AR home page, scroll to the client marquee, and confirm every card shows a logo image (not text), the marquee still scrolls/loops continuously, and no image is broken, stretched, distorted, or overflowing its card.

**Acceptance Scenarios**:

1. **Given** the EN home page is loaded, **When** the client marquee section renders, **Then** all 26 clients appear as logo images (52 image elements counting the doubled loop), none as text.
2. **Given** the AR home page is loaded, **When** the client marquee section renders, **Then** the same 26 client logos appear with the same alt text as the EN page, and the section reads correctly in the RTL layout.
3. **Given** a logo image whose intrinsic aspect ratio differs from a square, **When** it renders inside its card, **Then** it is scaled to fit within the card without stretching, cropping-through-distortion, or overflowing the card bounds.
4. **Given** the marquee is running, **When** the visitor watches it for a full loop cycle, **Then** the animation continues to scroll and loop seamlessly, identical in behavior to before the image swap.

---

### User Story 2 - Maintainer updates the client list in one place (Priority: P2)

A maintainer who needs to add, remove, or correct a client entry currently has to edit two separate arrays (one in the English home page file, one in the Arabic home page file) and keep them in sync by hand. After this slice, the maintainer edits a single shared list and both language pages pick up the change automatically.

**Why this priority**: This removes a duplication hazard (two lists silently drifting apart) but is secondary to the primary visible outcome of real logos rendering correctly.

**Independent Test**: Inspect the EN and AR home page source files and confirm neither defines its own client array — both import the same shared list — and confirm the shared list's entries render identically (same order, same names) on both pages.

**Acceptance Scenarios**:

1. **Given** the shared client list module, **When** the EN and AR home pages each render the marquee, **Then** both use the same 26 entries in the same order, sourced from the single shared list.
2. **Given** the previous duplicated text-array definitions, **When** this slice is complete, **Then** neither home page file defines its own client array anymore.

---

### Edge Cases

- A logo asset that is white-on-transparent will be visually invisible against the section's white card background. This is a known, accepted risk for this slice — it MUST be reported as a finding during verification, not silently fixed by restyling the card (restyling is a separate, later decision).
- One asset in the folder (`plugin-talents.png`) is intentionally not part of the client list and MUST remain unreferenced by any code in this slice.
- Client entries whose logo files use `.jpg` instead of `.png` MUST resolve to the correct file — a wrong extension produces a broken image rather than an obvious error, so this must be checked explicitly, not assumed correct by inspection.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a single shared list of clients (name and associated logo file) used by both the English and Arabic home pages, replacing the two independently maintained text-name arrays.
- **FR-002**: The shared client list MUST contain exactly the 26 clients below, in this exact order, each paired with its exact logo filename (filenames are explicit per entry and MUST NOT be derived from the client name by any naming rule, since 3 of the 26 use a different file extension than the rest):

  | # | Name | File |
  |---|---|---|
  | 1 | Petra | petra.png |
  | 2 | Reliance Hub | reliance-hub.png |
  | 3 | Madrid | madrid.png |
  | 4 | Ipec | ipec.png |
  | 5 | Electromeca | electromeca.png |
  | 6 | N2oosh | n2oosh.png |
  | 7 | Dar El Maaly | dar-elmaaly.png |
  | 8 | El Khateer | elkhateer.png |
  | 9 | Beit El 3tara | beit-el3tara.png |
  | 10 | El Modhsh | elmodhsh.png |
  | 11 | Decork | decork.png |
  | 12 | Princess | princess.png |
  | 13 | Naas | naas.png |
  | 14 | Ta2deer | ta2deer.png |
  | 15 | Gzour | gzour.png |
  | 16 | Mashareeb | mashareeb.png |
  | 17 | Cutz | cutz.png |
  | 18 | Kayan | kayan.png |
  | 19 | Darat | darat.png |
  | 20 | Rafeek | rafeek.png |
  | 21 | Arcade | arcade.png |
  | 22 | Cleaning | cleaning.png |
  | 23 | Majarrah | majarrah.jpg |
  | 24 | OEM | oem.png |
  | 25 | Pioneer | pioneer.jpg |
  | 26 | Thaki | thaki.jpg |

- **FR-003**: The client marquee MUST render each client's logo image instead of its name as text.
- **FR-004**: Each rendered logo MUST use the client's exact name (verbatim, identical between the English and Arabic pages) as its accessible text alternative — no localized or translated wrapper text.
- **FR-005**: Each logo image MUST be visually constrained to fit inside the existing card without distorting its aspect ratio or overflowing the card bounds, given that source assets vary in intrinsic dimensions and proportions.
- **FR-006**: The marquee's existing doubled-loop scrolling mechanism, and everything about the card container's appearance (sizing, borders, shadows, spacing, the two fade-gradient overlays at the section edges), MUST be retained exactly as-is — this slice changes only the content inside each card (text → image), not the container, styling, or animation.
- **FR-007**: The system MUST NOT reference `plugin-talents.png` (an asset already present in the logo folder) anywhere — it is deliberately excluded from the client list for this slice.
- **FR-008**: The client list MUST remain a static, code-defined list — this slice does not make the client roster editable through a database or admin interface.
- **FR-009**: The system MUST NOT introduce any change to the client marquee section's visual appearance versus its pre-change render, other than the text-to-image content swap itself (i.e., card size, borders, shadows, spacing, and fade gradients are unaffected).

### Key Entities

- **Client**: A company shown in the marquee. Attributes: display name (used as both the visible label source and accessible alt text), and an associated logo image file. Order matters — the 26 clients render in a fixed, defined sequence on both language pages.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the 26 clients render as a recognizable logo image (not placeholder text) on both the English and Arabic home pages.
- **SC-002**: 0 broken or failed-to-load logo images occur across either home page — every referenced logo file resolves successfully.
- **SC-003**: 0 logo images appear stretched, distorted, or overflowing their card on either home page, across the range of intrinsic image proportions present in the asset set.
- **SC-004**: The marquee continues to scroll and loop with no visible stutter, gap, or behavior change versus its pre-change animation, on both home pages.
- **SC-005**: A maintainer can update the client roster (add, remove, reorder, or correct an entry) by editing exactly one shared source, with both language pages reflecting the change without separate edits.
- **SC-006**: The client marquee section's layout and visual styling (card dimensions, borders, shadows, spacing, fade gradients) are visually indistinguishable from the pre-change version, aside from the text-to-image swap.

## Assumptions

- The 26 logo asset files already exist at their expected public location and are correctly named exactly as listed in FR-002; this slice consumes them as given and does not create, rename, or edit any image asset.
- "Real assets" refers solely to swapping the rendered content (text → image) and consolidating the client list; no other content, copy, or structural change to the home pages is in scope.
- Any logo that renders invisibly due to a white-on-transparent image against the section's white card background is an accepted, reported limitation of this slice, not a defect to be fixed here — visual remediation (e.g., adding a background treatment) is a distinct, later decision.
- The client list continuing to live as a static, code-defined constant (rather than becoming database-backed or admin-editable) is an intentional scope boundary for this slice, not a temporary gap.
