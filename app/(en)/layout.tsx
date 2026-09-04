import type { Metadata } from "next";
import { LANGUAGES } from "@/lib/language";
import { fontVariables } from "@/lib/fonts";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s — OmniflowAI",
    default: "OmniflowAI — Your Digital Partner — Egypt, Saudi Arabia, USA",
  },
  description: "OmniflowAI — AI-powered solutions.",
};

export default function EnglishRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={LANGUAGES.en.htmlLang}
      dir={LANGUAGES.en.dir}
      className={fontVariables}
      data-scroll-behavior="smooth"
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
