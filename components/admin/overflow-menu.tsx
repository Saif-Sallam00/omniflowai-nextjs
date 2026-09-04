"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";

// Portals the open menu to <body> and positions it from the trigger's own
// bounding rect. Table action cells sit inside the Table component's
// `overflow-x-auto` wrapper — an absolutely-positioned menu anchored inside
// that wrapper gets clipped by it (setting overflow-x forces overflow-y to
// compute to "auto" too, per the CSS overflow spec), so a plain
// `absolute`-inside-`relative` dropdown would be cut off there.
export function OverflowMenu({ children, label = "More actions" }: { children: React.ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 208; // w-52
    setPosition({
      top: rect.bottom + window.scrollY + 4,
      left: Math.min(rect.right, window.innerWidth - 8) + window.scrollX - menuWidth,
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onScrollOrResize() {
      setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-admin-text-muted hover:bg-admin-hover hover:text-admin-text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-admin-focus-ring"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden />
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            onClick={() => setOpen(false)}
            style={{ position: "absolute", top: position.top, left: position.left, width: 208 }}
            className="z-50 overflow-hidden rounded-md border border-admin-border bg-admin-surface-elevated py-1 shadow-admin-md"
          >
            {children}
          </div>,
          document.body,
        )}
    </>
  );
}

const ITEM_CLASSNAME =
  "block w-full px-3 py-1.5 text-left text-sm text-admin-text-secondary hover:bg-admin-hover hover:text-admin-text-primary";

export function OverflowMenuLink({ href, external, children }: { href: string; external?: boolean; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      role="menuitem"
      className={ITEM_CLASSNAME}
    >
      {children}
    </a>
  );
}
