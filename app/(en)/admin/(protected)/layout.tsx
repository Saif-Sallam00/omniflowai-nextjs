import { requireAuth } from "@/lib/auth-server";
import { AdminNav } from "./admin-nav";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAuth();
  return <AdminNav>{children}</AdminNav>;
}
