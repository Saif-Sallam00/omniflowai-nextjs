import { buildPageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return buildPageMetadata({
    path: "/about",
    language: "en",
    title: "Engineers who understand business.",
    description:
      "OmniflowAI is a digital transformation partner built around one belief: most companies don't need more tools — they need the right systems, built well and connected properly.",
  });
}

export default function AboutPage() {
  return (
    <main>
      <section>
        <p>Who we are</p>
        <h1>
          Engineers who understand <span>business.</span>
        </h1>
        <p>
          OmniflowAI is a digital transformation partner built around one
          belief: most companies don&apos;t need more tools — they need the
          right systems, built well and connected properly.
        </p>
      </section>

      <section>
        <h2>We started OmniflowAI to close a gap.</h2>
        <p>
          Too many businesses are sold disconnected pieces — a website
          here, an ad campaign there, a tool nobody integrates — and left to
          stitch them together themselves. The result is expensive
          fragmentation: software that doesn&apos;t talk, marketing that
          doesn&apos;t convert, and no clear view of what&apos;s working.
        </p>
        <p>
          We do the opposite. We start from how your business actually
          operates, then design and build the systems that fit it —
          software, marketing, and automation that work as one. You own
          everything we build. No lock-in, no dependency, no black boxes.
        </p>
        <p>
          We work like engineers, not order-takers: we care about outcomes
          you can measure, systems that outlast the engagement, and giving
          you the keys at the end.
        </p>
      </section>

      <section>
        <article>
          <h3>Systems over services</h3>
          <p>
            We don&apos;t sell isolated deliverables. Everything we build is
            designed to connect and compound.
          </p>
        </article>
        <article>
          <h3>You own it</h3>
          <p>
            Full source code and IP transfer on every build. What you pay
            for is yours.
          </p>
        </article>
        <article>
          <h3>Engineering-led</h3>
          <p>
            You work directly with the people building your systems, not an
            account manager relaying messages.
          </p>
        </article>
        <article>
          <h3>Measured by outcomes</h3>
          <p>
            We tie our work to business results — revenue, efficiency,
            acquisition — not hours logged or assets shipped.
          </p>
        </article>
      </section>

      <section>
        <h2>Let&apos;s map your systems</h2>
        <p>
          We don&apos;t hand over deliverables and walk away. We build
          systems that keep working after we&apos;re gone.
        </p>
        <p>
          <a href="/contact">Book a strategy call</a>
        </p>
      </section>
    </main>
  );
}
