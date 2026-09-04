import type { Metadata } from "next";
import { LANGUAGES } from "@/lib/language";
import { fontVariables } from "@/lib/fonts";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s — OmniflowAI",
    default: "OmniflowAI — حلول مدعومة بالذكاء الاصطناعي",
  },
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
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
