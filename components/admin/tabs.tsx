"use client";

export type TabItem = { id: string; label: string; hasError?: boolean };

/**
 * Controlled tab strip. Deliberately does NOT unmount inactive panels —
 * callers should render every panel always and toggle visibility with the
 * `hidden` attribute (see ProjectForm), so switching tabs never drops
 * uncommitted input inside an uncontrolled form.
 */
export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-admin-border">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative shrink-0 px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-admin-focus-ring ${
              isActive ? "text-admin-text-primary" : "text-admin-text-muted hover:text-admin-text-secondary"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              {tab.label}
              {tab.hasError && (
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-admin-danger"
                  aria-label="This section has errors"
                />
              )}
            </span>
            {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-admin-accent" />}
          </button>
        );
      })}
    </div>
  );
}
