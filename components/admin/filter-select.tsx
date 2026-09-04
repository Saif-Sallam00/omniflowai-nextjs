"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { inputClass } from "./palette";

export type FilterOption = { value: string; label: string };

/**
 * A <select> that drives one query param via server-side navigation, e.g.
 * `?status=published`. Selecting the empty option clears the param.
 */
export function FilterSelect({
  paramName,
  options,
  ariaLabel,
}: {
  paramName: string;
  options: FilterOption[];
  ariaLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get(paramName) ?? "";

  function handleChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set(paramName, next);
    else params.delete(paramName);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={value}
      onChange={(event) => handleChange(event.target.value)}
      aria-label={ariaLabel}
      className={`${inputClass} w-auto`}
    >
      {options.map((option) => (
        <option key={option.value || "all"} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
