"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR = "a[href], button:not([disabled])";

/**
 * Traps Tab/Shift+Tab within the ordered set [leadingRef, ...containerRef's
 * focusable descendants] and reports Escape via onEscape. leadingRef and
 * containerRef are typically DOM siblings (e.g. a toggle button and the panel
 * it opens) rather than nested, so the listener is attached to both directly
 * — a keydown on one never bubbles through the other's subtree.
 */
export function useFocusTrap<T extends HTMLElement, U extends HTMLElement>(
  leadingRef: RefObject<T | null>,
  containerRef: RefObject<U | null>,
  active: boolean,
  onEscape: () => void,
) {
  const onEscapeRef = useRef(onEscape);
  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!active) return;
    const leading = leadingRef.current;
    const container = containerRef.current;
    if (!leading || !container) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onEscapeRef.current();
        return;
      }
      if (e.key !== "Tab") return;

      const focusables: HTMLElement[] = [
        leading!,
        ...Array.from(container!.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)),
      ];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    }

    leading.addEventListener("keydown", handleKeyDown);
    container.addEventListener("keydown", handleKeyDown);
    return () => {
      leading.removeEventListener("keydown", handleKeyDown);
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [active, leadingRef, containerRef]);
}
