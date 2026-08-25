import { buildPageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return buildPageMetadata({
    path: "/",
    language: "en",
    title: "OmniflowAI — AI-Powered Business Solutions",
    description:
      "OmniflowAI helps businesses automate operations and unlock growth with practical, tailored AI solutions.",
  });
}

export default function HomePage() {
  return (
    <main>
      <h1>AI-Powered Solutions for Modern Business</h1>
      <p>
        OmniflowAI helps organizations automate operations, streamline
        workflows, and make better decisions with practical, tailored AI
        solutions — built around your business, not a one-size-fits-all
        product.
      </p>
      <section>
        <h2>What we do</h2>
        <p>
          We design and implement AI-driven systems that remove repetitive
          work, surface insights from your data, and scale with your team —
          from process automation to custom intelligent tooling.
        </p>
      </section>
      <section>
        <h2>Why OmniflowAI</h2>
        <p>
          We partner closely with every client to understand their real
          operational challenges, then deliver solutions that fit the way
          their business actually works.
        </p>
      </section>
    </main>
  );
}
