"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "./actions";
import { SignOutButton } from "./sign-out-button";

type AdminNavLink = {
  path: string;
  label: string;
};

const ADMIN_NAV_LINKS: AdminNavLink[] = [
  { path: "/admin", label: "Dashboard" },
  { path: "/admin/leads", label: "Leads" },
];

export function AdminNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <nav className="flex items-center gap-4 border-b border-gray-200 p-4">
        {ADMIN_NAV_LINKS.map((link) => (
          <Link
            key={link.path}
            href={link.path}
            className={pathname === link.path ? "font-bold" : "text-gray-600"}
          >
            {link.label}
          </Link>
        ))}
        <form action={signOutAction} className="ms-auto">
          <SignOutButton />
        </form>
      </nav>
      {children}
    </div>
  );
}
