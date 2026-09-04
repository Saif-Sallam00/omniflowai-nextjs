import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  description: "OmniflowAI — AI-powered solutions.",
};

export default function EnglishPublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SiteShell language="en">{children}</SiteShell>;
}
