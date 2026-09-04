"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { inputClass, textDisabled } from "./palette";

/**
 * Debounced search box that drives the `q` query param via server-side
 * navigation (no client-side filtering state) — the list page itself stays
 * a server component reading `searchParams.q`.
 *
 * If a caller can clear/change this param from elsewhere (e.g. a "Clear
 * filters" link), pass `key={searchParams.toString()}` at the call site so
 * that external change remounts this input with a fresh initial value,
 * rather than syncing state from a prop inside an effect.
 */
export function SearchInput({ placeholder, paramName = "q" }: { placeholder: string; paramName?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(() => searchParams.get(paramName) ?? "");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(next: string) {
    setValue(next);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.trim()) params.set(paramName, next.trim());
      else params.delete(paramName);
      router.push(`${pathname}?${params.toString()}`);
    }, 300);
  }

  return (
    <div className="relative w-full max-w-xs">
      <Search className={`pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 ${textDisabled}`} aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`${inputClass} pl-8`}
      />
    </div>
  );
}
