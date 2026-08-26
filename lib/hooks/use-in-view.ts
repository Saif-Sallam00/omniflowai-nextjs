"use client";

import { useEffect, useRef, useState } from "react";

type UseInViewOptions = {
  threshold?: number;
  rootMargin?: string;
};

/**
 * Single IntersectionObserver per instance, reveal-once (disconnects after the
 * first intersection). Fails open to `inView = true` immediately when
 * prefers-reduced-motion is set or IntersectionObserver is unavailable, so
 * reveal primitives render in their final state rather than staying hidden.
 */
export function useInView<T extends Element>(options: UseInViewOptions = {}) {
  const { threshold = 0.15, rootMargin = "0px 0px -12% 0px" } = options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || typeof IntersectionObserver === "undefined") {
      // Deferred a microtask so this isn't a synchronous setState-in-effect
      // (avoids a cascading extra render pass on mount).
      queueMicrotask(() => setInView(true));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, inView };
}
