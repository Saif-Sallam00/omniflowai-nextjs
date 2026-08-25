import type { Metadata } from "next";
import { LANGUAGES } from "@/lib/language";

export const metadata: Metadata = {
  title: "OmniflowAI — Foundation",
  description: "Phase 0 foundation deployment.",
};

export default function ArabicRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={LANGUAGES.ar.htmlLang} dir={LANGUAGES.ar.dir}>
      <body>{children}</body>
    </html>
  );
}
