import { buildPageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return buildPageMetadata({
    path: "/about",
    language: "en",
    title: "About — OmniflowAI",
    description:
      "Learn about OmniflowAI's mission to make practical AI accessible to every business.",
  });
}

export default function AboutPage() {
  return (
    <main>
      <h1>About OmniflowAI</h1>
      <p>
        OmniflowAI was founded on a simple idea: AI should solve real
        business problems, not add complexity. We work with organizations of
        every size to build automation and intelligent tooling that fits
        naturally into how they already operate.
      </p>
      <section>
        <h2>Our approach</h2>
        <p>
          Every engagement starts with understanding the actual workflow, not
          a generic template. We design solutions around the business, then
          implement, integrate, and support them for the long run.
        </p>
      </section>
      <section>
        <h2>Our team</h2>
        <p>
          Our team brings together engineering and business experience to
          deliver AI systems that are reliable, maintainable, and genuinely
          useful — not proofs of concept that never make it to production.
        </p>
      </section>
    </main>
  );
}
