import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OmniflowAI — Foundation",
  description: "Phase 0 foundation deployment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
