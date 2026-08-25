import { buildPageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return buildPageMetadata({
    path: "/solutions",
    language: "en",
    title: "Solutions — OmniflowAI",
    description:
      "Explore OmniflowAI's AI solutions: process automation, custom intelligent tooling, and data-driven decision support.",
  });
}

export default function SolutionsPage() {
  return (
    <main>
      <h1>Solutions</h1>
      <p>
        We build AI solutions that fit directly into how your business
        already runs — no disruptive overhauls, just practical systems that
        remove friction and free up your team.
      </p>
      <section>
        <h2>Process automation</h2>
        <p>
          Automate repetitive, manual workflows so your team can focus on
          higher-value work — from data entry and document handling to
          multi-step approval processes.
        </p>
      </section>
      <section>
        <h2>Custom intelligent tooling</h2>
        <p>
          Purpose-built AI tools designed around your specific operations,
          integrated with the systems you already use.
        </p>
      </section>
      <section>
        <h2>Data-driven decision support</h2>
        <p>
          Turn your existing data into clear, actionable insight — surfacing
          the signals that matter for the decisions your business makes
          every day.
        </p>
      </section>
    </main>
  );
}
