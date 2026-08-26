import type { SyntheticEvent } from "react";

export const IMAGE_FALLBACK =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='600'%20height='400'%3E%3Crect%20width='600'%20height='400'%20fill='%230f172a'/%3E%3Ctext%20x='50%25'%20y='50%25'%20fill='%23475569'%20font-family='sans-serif'%20font-size='22'%20text-anchor='middle'%20dominant-baseline='middle'%3ENo%20image%3C/text%3E%3C/svg%3E";

export function onImageError(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  img.onerror = null;
  img.src = IMAGE_FALLBACK;
}
