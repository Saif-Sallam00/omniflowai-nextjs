import { buildPageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return buildPageMetadata({
    path: "/",
    language: "en",
    title: "OmniflowAI — Foundation",
    description: "Phase 0 foundation deployment.",
  });
}

export default function HomePage() {
  return (
    <main>
      <h1>OmniflowAI — Foundation</h1>
      <p>
        This is the Phase 0 foundation deployment. It exists to verify the
        target application&apos;s runtime, database, and authentication
        plumbing. It does not yet serve any real site content.
      </p>
    </main>
  );
}
