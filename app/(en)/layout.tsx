import type { Metadata } from "next";
import { LANGUAGES } from "@/lib/language";
import { fontVariables } from "@/lib/fonts";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "OmniflowAI — Foundation",
  description: "Phase 0 foundation deployment.",
};

export default function EnglishRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={LANGUAGES.en.htmlLang} dir={LANGUAGES.en.dir} className={fontVariables}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
