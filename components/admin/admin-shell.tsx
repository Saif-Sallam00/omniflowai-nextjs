"use client";

import { useState, type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Briefcase, Inbox, ExternalLink, Menu, X } from "lucide-react";
import {
  sidebarBg,
  surfaceMuted,
  border,
  textMuted,
  textPrimary,
  textSecondary,
  accentSoftBg,
  accentSoftText,
  hoverBg,
} from "./palette";

type IconType = ComponentType<{ className?: string }>;
type NavLink = { path: string; label: string; icon: IconType };
type NavGroup = { heading?: string; links: NavLink[] };

const NAV_GROUPS: NavGroup[] = [
  { links: [{ path: "/admin", label: "Overview", icon: LayoutDashboard }] },
  {
    heading: "Content",
    links: [
      { path: "/admin/articles", label: "Articles", icon: FileText },
      { path: "/admin/projects", label: "Projects", icon: Briefcase },
    ],
  },
  { heading: "CRM", links: [{ path: "/admin/leads", label: "Leads", icon: Inbox }] },
];

function isActive(pathname: string, path: string): boolean {
  if (path === "/admin") return pathname === "/admin";
  return pathname === path || pathname.startsWith(`${path}/`);
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
      {NAV_GROUPS.map((group, i) => (
        <div key={group.heading ?? i} className="flex flex-col gap-0.5">
          {group.heading && (
            <p className={`px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider ${textMuted}`}>
              {group.heading}
            </p>
          )}
          {group.links.map((link) => {
            const active = isActive(pathname, link.path);
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active ? `${accentSoftBg} ${accentSoftText}` : `${textSecondary} ${hoverBg} hover:text-admin-text-primary`
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "" : textMuted}`} />
                {link.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function AdminShell({
  children,
  signOutSlot,
}: {
  children: React.ReactNode;
  signOutSlot: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const footer = (
    <div className={`flex flex-col gap-1 border-t ${border} p-3`}>
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium ${textSecondary} ${hoverBg} hover:text-admin-text-primary`}
      >
        <ExternalLink className={`h-4 w-4 shrink-0 ${textMuted}`} />
        View website
      </a>
      {signOutSlot}
    </div>
  );

  return (
    <div className="min-h-screen md:flex">
      {/* Mobile top bar */}
      <div className={`flex items-center justify-between border-b ${border} ${sidebarBg} px-4 py-3 md:hidden`}>
        <span className={`text-sm font-semibold tracking-tight ${textPrimary}`}>OmniflowAI Admin</span>
        <button
          type="button"
          onClick={() => setIsMobileOpen((open) => !open)}
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileOpen}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-md border ${border} ${textSecondary}`}
        >
          {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className={`flex flex-col border-b ${border} ${sidebarBg} md:hidden`}>
          <NavLinks pathname={pathname} onNavigate={() => setIsMobileOpen(false)} />
          {footer}
        </div>
      )}

      {/* Persistent desktop sidebar */}
      <div className={`hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-r ${border} ${sidebarBg}`}>
        <div className={`border-b ${border} px-4 py-4`}>
          <span className={`text-sm font-semibold tracking-tight ${textPrimary}`}>OmniflowAI Admin</span>
        </div>
        <NavLinks pathname={pathname} />
        {footer}
      </div>

      <main className={`min-w-0 flex-1 ${surfaceMuted} p-4 sm:p-6 md:h-screen md:overflow-y-auto`}>{children}</main>
    </div>
  );
}
