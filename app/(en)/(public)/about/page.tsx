import { buildPageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return buildPageMetadata({
    path: "/about",
    language: "en",
    title: "About — OmniflowAI",
    description: "Placeholder about page for Phase 1 slice 1A routing verification.",
  });
}

export default function AboutPage() {
  return (
    <main>
      <h1>About</h1>
      <p>
        This is a thin placeholder page. It exists to verify bilingual
        routing and metadata beyond the home page. Real content ships in a
        later slice.
      </p>
    </main>
  );
}
