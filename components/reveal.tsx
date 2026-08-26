"use client";

import type { ReactNode } from "react";
import { useInView } from "@/lib/hooks/use-in-view";

/** Subtle scroll-in reveal (fade + small rise). Reduced-motion / no-IO renders
 * in final state immediately (useInView fails open to inView=true). */
export function Reveal({
  children,
  className = "",
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
      className={`transition-all duration-700 ease-standard ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
    >
      {children}
    </div>
  );
}
