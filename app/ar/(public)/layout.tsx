import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "OmniflowAI",
  description: "OmniflowAI — حلول مدعومة بالذكاء الاصطناعي.",
};

export default function ArabicPublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SiteShell language="ar">{children}</SiteShell>;
}
