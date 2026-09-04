import "./admin-theme.css";

// Dark-only by design — no toggle, no light variant. See admin-theme.css and
// components/admin/palette.ts for the token system every admin screen (auth
// included) resolves its colors from.
export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="admin-root min-h-screen bg-admin-background text-admin-text-primary">{children}</div>;
}
