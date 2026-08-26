import type { ReactNode } from "react";

// Wraps product names in dir="ltr" spans everywhere they appear inside a
// (possibly Arabic) sentence, longest-match-first, so they never get
// bidi-reordered. Applied unconditionally, same as production. Plain
// server-safe utility (no "use client") so both server page components and
// the client solutions-interactive island can call it.
const PRODUCT_NAMES = [
  "Custom Transformation",
  "Scale Infrastructure",
  "Growth Engine",
  "Foundation",
];
const PRODUCT_NAME_PATTERN = new RegExp(`(${PRODUCT_NAMES.join("|")})`, "g");

export function ltrNames(text: string): ReactNode {
  return text.split(PRODUCT_NAME_PATTERN).map((part, i) =>
    PRODUCT_NAMES.includes(part) ? (
      <span key={i} dir="ltr">
        {part}
      </span>
    ) : (
      part
    ),
  );
}
