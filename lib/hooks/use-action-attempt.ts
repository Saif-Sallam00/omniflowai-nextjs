"use client";

import { useEffect, useRef, useState } from "react";

/**
 * React resets a <form action={...}>'s uncontrolled fields whenever the
 * action settles, on every outcome — not only success. Returns a counter
 * that changes once per completed submission (not on the initial mount), so
 * callers can key their inputs to it and force a remount with a fresh
 * `defaultValue` that overrides that automatic reset.
 */
export function useActionAttempt<T>(state: T): number {
  const isFirstRender = useRef(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setAttempt((n) => n + 1);
  }, [state]);

  return attempt;
}
