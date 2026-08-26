import { buildPageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return buildPageMetadata({
    path: "/",
    language: "en",
    title: "Most teams buy the tool first. We diagnose first.",
    description:
      "AI, marketing, software, automation — we only build what the diagnosis supports. We look before we touch, so what we build fits how your business actually runs.",
  });
}

export default function HomePage() {
  return (
    <main>
      <section>
        <h1>
          Most teams buy the tool first. <span>We diagnose first.</span>
        </h1>
        <p>
          AI, marketing, software, automation — we only build what the
          diagnosis supports. We look before we touch, so what we build fits
          how your business actually runs.
        </p>
        <p>
          <a href="/contact">Book a strategy call</a>
          <a href="/portfolio">See our work</a>
        </p>
      </section>

      <section>
        <p>Trusted partners</p>
        <h2>Trusted by brands across the US, the GCC &amp; Egypt</h2>
        <ul>
          <li>
            <strong>50+</strong> Projects delivered
          </li>
          <li>
            <strong>8</strong> Countries
          </li>
          <li>
            <strong>Full GCC coverage</strong> + US &amp; Egypt
          </li>
        </ul>
        <ul>
          <li>Egypt</li>
          <li>Saudi Arabia</li>
          <li>UAE</li>
          <li>Qatar</li>
          <li>Kuwait</li>
          <li>Bahrain</li>
          <li>Oman</li>
          <li>United States</li>
        </ul>
        <ul>
          <li>Petra</li>
          <li>Reliance Hub</li>
          <li>Madrid</li>
          <li>Ipec</li>
          <li>Electromeca</li>
          <li>N2oosh</li>
          <li>Dar El Maaly</li>
          <li>El Khateer</li>
          <li>Beit El 3tara</li>
          <li>El Modhsh</li>
          <li>Decork</li>
          <li>Princess</li>
          <li>Naas</li>
          <li>Ta2deer</li>
          <li>Gzour</li>
          <li>Mashareeb</li>
          <li>Cutz</li>
          <li>Kayan</li>
          <li>Darat</li>
          <li>Rafeek</li>
          <li>Arcade</li>
          <li>Cleaning</li>
          <li>Majarrah</li>
          <li>OEM</li>
          <li>Pioneer</li>
          <li>Thaki</li>
        </ul>
      </section>

      <section>
        <h2>
          Most companies don&apos;t have a marketing problem.{" "}
          <span>They have a systems problem.</span>
        </h2>
        <p>
          Disconnected tools, manual handoffs, and no clear line of sight
          from a lead to a closed deal. We connect the whole chain — how you
          acquire customers, how you convert them, and how you operate once
          they&apos;re in — so the parts work as one system you can actually
          measure.
        </p>
      </section>

      <section>
        <h2>Three capabilities. One transformation partner.</h2>
        <article>
          <h3>AI Enablement</h3>
          <p>
            We run structured AI adoption programs for teams and leadership
            — from executive strategy sessions to hands-on workflow
            integration. The goal isn&apos;t awareness, it&apos;s
            operational capability: your people using AI on real work, not
            watching a demo.
          </p>
        </article>
        <article>
          <h3>Marketing Systems</h3>
          <p>
            SEO, paid campaigns, and conversion strategy wired into one
            engine that targets qualified buyers — not vanity traffic. Every
            stage is tracked, so you know what a lead actually costs and
            where revenue comes from.
          </p>
        </article>
        <article>
          <h3>Business Technology</h3>
          <p>
            The systems your business runs on — ERP and CRM platforms,
            customer-facing web, mobile apps, and the automation that
            connects them. Built to own, integrate, and scale, not to rent.
          </p>
          <p>
            Business Systems (ERP/CRM) · Web Platforms · Mobile Apps ·
            Automation &amp; AI
          </p>
        </article>
      </section>

      <section>
        <h2>From scattered tools to one connected system</h2>
        <div>
          <h3>Before</h3>
          <ul>
            <li>Tools that don&apos;t talk to each other</li>
            <li>Marketing disconnected from operations</li>
            <li>Manual work slowing everything down</li>
            <li>No clear view of what&apos;s actually working</li>
          </ul>
        </div>
        <div>
          <h3>After</h3>
          <ul>
            <li>One integrated business system</li>
            <li>Acquisition, conversion, and operations connected</li>
            <li>Automated workflows across the business</li>
            <li>Real-time visibility into performance</li>
          </ul>
        </div>
      </section>

      <section>
        <h2>How we work</h2>
        <article>
          <p>01</p>
          <h3>Diagnose</h3>
          <p>
            We map your business model, systems, and the bottlenecks
            slowing growth.
          </p>
        </article>
        <article>
          <p>02</p>
          <h3>Design</h3>
          <p>
            We design the right mix of software, marketing, and automation
            for how you actually operate.
          </p>
        </article>
        <article>
          <p>03</p>
          <h3>Build</h3>
          <p>
            We develop and integrate the system, and hand you full
            ownership.
          </p>
        </article>
        <article>
          <p>04</p>
          <h3>Optimize</h3>
          <p>We keep improving it against real business data.</p>
        </article>
      </section>

      <section>
        <p>
          We don&apos;t hand over deliverables and walk away. We build
          systems that keep working after we&apos;re gone.
        </p>
        <p>
          <a href="/contact">Book a strategy call</a>
        </p>
      </section>

      <section>
        <h2>Ready to transform how your business runs?</h2>
        <p>
          Book a strategy call. We&apos;ll look at your current systems and
          show you exactly what&apos;s blocking growth — even if you
          don&apos;t work with us.
        </p>
        <p>
          <a href="/contact">Book your strategy call</a>
        </p>
        <p>No sales pitch. Just clarity.</p>
      </section>
    </main>
  );
}
