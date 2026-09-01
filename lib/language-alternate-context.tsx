"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type LanguageAlternateOverride = string | null | undefined;

type LanguageAlternateContextValue = {
  override: LanguageAlternateOverride;
  setOverride: (value: LanguageAlternateOverride) => void;
};

const LanguageAlternateContext = createContext<LanguageAlternateContextValue | null>(null);

export function LanguageAlternateProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<LanguageAlternateOverride>(undefined);

  return (
    <LanguageAlternateContext.Provider value={{ override, setOverride }}>
      {children}
    </LanguageAlternateContext.Provider>
  );
}

export function useLanguageAlternate(): LanguageAlternateContextValue {
  const context = useContext(LanguageAlternateContext);
  if (!context) {
    throw new Error("useLanguageAlternate must be used within a LanguageAlternateProvider");
  }
  return context;
}
