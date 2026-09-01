"use client";

import { useEffect } from "react";
import { useLanguageAlternate } from "@/lib/language-alternate-context";

export function ArticleLanguageAlternate({ href }: { href: string | null }) {
  const { setOverride } = useLanguageAlternate();

  useEffect(() => {
    setOverride(href);
    return () => setOverride(undefined);
  }, [href, setOverride]);

  return null;
}
