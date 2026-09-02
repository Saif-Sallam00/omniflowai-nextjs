"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "./actions";
import { SignOutButton } from "./sign-out-button";
import { border, surface, surfaceMuted, textMuted, textPrimary, accentSoftBg, accent } from "@/components/admin/palette";

type AdminNavLink = {
  path: string;
  label: string;
};

const ADMIN_NAV_LINKS: AdminNavLink[] = [
  { path: "/admin", label: "Dashboard" },
  { path: "/admin/leads", label: "Leads" },
  { path: "/admin/articles", label: "Articles" },
  { path: "/admin/projects", label: "Projects" },
];

function SidebarLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 p-4">
      {ADMIN_NAV_LINKS.map((link) => {
        const isActive = pathname === link.path;
        return (
          <Link
            key={link.path}
            href={link.path}
            onClick={onNavigate}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              isActive ? `${accentSoftBg} ${accent}` : `${textMuted} hover:bg-gray-50 hover:text-gray-900`
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen md:flex">
      {/* Mobile top bar */}
      <div className={`flex items-center justify-between border-b ${border} ${surface} p-4 md:hidden`}>
        <span className={`text-sm font-semibold ${textPrimary}`}>Admin</span>
        <button
          type="button"
          onClick={() => setIsMobileOpen((open) => !open)}
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileOpen}
          className={`rounded-md border ${border} px-3 py-1.5 text-sm`}
        >
          {isMobileOpen ? "Close" : "Menu"}
        </button>
      </div>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className={`border-b ${border} ${surface} md:hidden`}>
          <SidebarLinks pathname={pathname} onNavigate={() => setIsMobileOpen(false)} />
          <form action={signOutAction} className="border-t border-gray-200 p-4">
            <SignOutButton />
          </form>
        </div>
      )}

      {/* Persistent desktop sidebar */}
      <div className={`hidden md:flex md:w-64 md:shrink-0 md:flex-col md:border-r ${border} ${surface}`}>
        <div className={`border-b ${border} p-4`}>
          <span className={`text-sm font-semibold ${textPrimary}`}>Admin</span>
        </div>
        <SidebarLinks pathname={pathname} />
        <form action={signOutAction} className={`border-t ${border} p-4`}>
          <SignOutButton />
        </form>
      </div>

      <main className={`flex-1 ${surfaceMuted} p-4 sm:p-6`}>{children}</main>
    </div>
  );
}
