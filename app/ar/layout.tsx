import type { Metadata } from "next";
import { LANGUAGES } from "@/lib/language";
import { fontVariables } from "@/lib/fonts";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "OmniflowAI",
  description: "OmniflowAI — حلول مدعومة بالذكاء الاصطناعي.",
};

export default function ArabicRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={LANGUAGES.ar.htmlLang}
      dir={LANGUAGES.ar.dir}
      className={fontVariables}
      data-scroll-behavior="smooth"
    >
      <body className="font-sans">{children}</body>
    </html>
  );
}
