import { buildPageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return buildPageMetadata({
    path: "/solutions",
    language: "en",
    title: "Build the systems behind your next stage of growth.",
    description:
      "Your business already works. What it needs now is the infrastructure to scale. We find what's blocking growth, then build the marketing, technology, and AI systems that remove it.",
  });
}

export default function SolutionsPage() {
  return (
    <main>
      <section>
        <p>Solutions</p>
        <h1>
          Build the systems behind <span>your next stage of growth.</span>
        </h1>
        <p>
          Your business already works. What it needs now is the
          infrastructure to scale. We find what&apos;s blocking growth,
          then build the marketing, technology, and AI systems that remove
          it.
        </p>
        <p>
          <a href="/contact">Book a strategy call</a>
          <a href="#diagnostic">Find your constraint</a>
        </p>

        <div>
          <p>Business diagnosis</p>
          <h2>Growth operating system</h2>
          <p>7 signals · 3 root constraints</p>
          <p>
            Select any signal to reveal what it&apos;s really connected to.
          </p>
          <p>Strategy</p>
          <p>
            The business diagnosis decides which of the three you need, and
            in what order.
          </p>
          <p>Most growth problems are symptoms of one missing system.</p>

          <ul>
            <li>
              <strong>Inconsistent growth</strong> — Growth is inconsistent,
              not compounding.
            </li>
            <li>
              <strong>Untraceable spend</strong> — Spend can&apos;t be
              traced to revenue.
            </li>
            <li>
              <strong>Handoff delays</strong> — Work stalls at every
              handoff.
            </li>
            <li>
              <strong>Manual reporting</strong> — Every report is rebuilt
              by hand.
            </li>
            <li>
              <strong>Founder-dependent decisions</strong> — Decisions
              route through a few people.
            </li>
            <li>
              <strong>Headcount-bound capacity</strong> — More volume still
              means more headcount.
            </li>
            <li>
              <strong>Stalled AI adoption</strong> — AI is discussed, never
              operational.
            </li>
          </ul>

          <ul>
            <li>
              <p>Root constraint</p>
              <p>
                <strong>Demand isn&apos;t a system.</strong> Revenue
                depends on effort, so it can&apos;t be forecast or
                compounded.
              </p>
            </li>
            <li>
              <p>Root constraint</p>
              <p>
                <strong>The business runs on people, not systems.</strong>{" "}
                Every process needs a person inside it, so complexity grows
                faster than output.
              </p>
            </li>
            <li>
              <p>Root constraint</p>
              <p>
                <strong>Capacity only scales by hiring.</strong> Output is
                capped by headcount — the slowest and most expensive way to
                grow.
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section id="diagnostic">
        <p>Business diagnostic</p>
        <h2>Find your growth constraint.</h2>
        <p>
          Pick what sounds closest to your business. We&apos;ll point you
          to the right starting point.
        </p>
        <ul>
          <li>
            <p>We have customers, but growth is inconsistent.</p>
            <p>
              Recommended starting point: Your acquisition needs to become
              a system before more technology gets built on top of it.
            </p>
          </li>
          <li>
            <p>
              Our growth depends on adding more people instead of better
              systems.
            </p>
            <p>
              Recommended starting point: Headcount-driven growth is an
              infrastructure limit. The systems have to carry that load
              instead.
            </p>
          </li>
          <li>
            <p>We have tools, but nothing is connected.</p>
            <p>
              Recommended starting point: Disconnected tools is an
              infrastructure problem, not a marketing one.
            </p>
          </li>
          <li>
            <p>
              We know AI matters but don&apos;t know where to start.
            </p>
            <p>
              Recommended starting point: Start by finding where AI
              actually pays off inside your workflows.
            </p>
          </li>
          <li>
            <p>We&apos;re not sure what&apos;s actually broken.</p>
            <p>
              Recommended starting point: That&apos;s exactly what the
              diagnosis is for. Nobody should build before that answer
              exists.
            </p>
          </li>
          <li>
            <p>
              We have a unique challenge that needs a tailored approach.
            </p>
            <p>
              Recommended starting point: Then the answer is a system
              designed around your constraints, not a predefined scope.
            </p>
          </li>
        </ul>
        <p>
          Rather just talk it through?{" "}
          <a href="/contact">Book a strategy call.</a>
        </p>
      </section>

      <section>
        <h2>Three ways in. One business diagnosis behind all of them.</h2>
        <p>
          These aren&apos;t tiers. They&apos;re different starting points
          for different constraints. The business diagnosis decides which
          one fits.
        </p>
        <p>
          Marked against the growth constraint selected above. Change the
          constraint and the recommendation changes with it.
        </p>

        <article>
          <h3>Foundation</h3>
          <p>You know growth is stuck. You don&apos;t yet know why.</p>
          <p>Find the constraint before spending on solutions.</p>
          <p>Discover what&apos;s blocking your next stage of growth.</p>
          <p>Best for</p>
          <p>
            Companies that know something is limiting growth but
            can&apos;t name it — and don&apos;t want to commit to a build
            before they can.
          </p>
          <p>The problem</p>
          <p>
            Your business is growing, but the reason it&apos;s slowing
            isn&apos;t obvious from the inside. Every proposal you receive
            assumes an answer nobody has actually verified.
          </p>
          <p>What&apos;s included</p>
          <article>
            <h4>Business Diagnosis</h4>
            <p>
              How the company runs today — where work moves, where it
              stops, and why.
            </p>
            <ul>
              <li>Processes, workflows and operational structure</li>
              <li>Marketing performance and the customer acquisition journey</li>
              <li>The current technology stack and its limits</li>
              <li>Data visibility and reporting gaps</li>
            </ul>
          </article>
          <article>
            <h4>Growth and bottleneck assessment</h4>
            <p>
              The specific points where growth is being capped, and what
              each one is costing.
            </p>
            <ul>
              <li>Where opportunities are being lost</li>
              <li>Which processes are slowing growth</li>
              <li>Which manual work is capping scale</li>
              <li>The highest-impact areas to address first</li>
            </ul>
          </article>
          <article>
            <h4>Marketing and technology opportunity map</h4>
            <p>
              Where each capability would pay off in this business — and
              in what order.
            </p>
            <ul>
              <li>SEO and organic growth</li>
              <li>Paid acquisition and media buying</li>
              <li>Funnel and conversion</li>
              <li>CRM and customer management</li>
              <li>Business automation</li>
              <li>Custom software and platforms</li>
            </ul>
          </article>
          <article>
            <h4>AI opportunity identification</h4>
            <p>
              Which workflows are genuinely worth applying AI to, and
              which aren&apos;t.
            </p>
            <ul>
              <li>Which departments benefit first</li>
              <li>Which workflows should be automated</li>
              <li>Where AI creates measurable impact</li>
            </ul>
          </article>
          <p>Outcome</p>
          <p>
            A clear roadmap showing where technology, AI, and systems
            create measurable business impact.
          </p>
          <p>
            Foundation produces a decision, not a deliverable. If you
            build with us afterwards, the work carries forward.
          </p>
          <p>
            Move forward with implementation within 90 days and your
            Foundation fee is credited toward the project.
          </p>
          <p>Starting from $1,000</p>
          <p>Final scope is determined after the business diagnosis.</p>
          <p>
            <a href="/contact?service=foundation">Book a strategy call</a>
          </p>
        </article>

        <article>
          <p>Recommended</p>
          <h3>Growth Engine</h3>
          <p>You have demand. Growth is unpredictable.</p>
          <p>
            Build a measurable acquisition system your team runs with AI.
          </p>
          <p>Turn growth into a system you can measure.</p>
          <p>Best for</p>
          <p>
            Companies with real demand, held back by inconsistent
            acquisition, scattered marketing, and manual follow-through.
          </p>
          <p>The problem</p>
          <p>
            Revenue is growing, but growth depends on disconnected
            campaigns, manual processes, and people pushing everything
            forward.
          </p>
          <p>What&apos;s included</p>
          <article>
            <h4>Marketing Systems</h4>
            <p>
              The acquisition engine — planned, built and measured as one
              system rather than separate campaigns.
            </p>
            <ul>
              <li>Marketing strategy and plan</li>
              <li>SEO and organic growth</li>
              <li>Media buying and paid campaigns</li>
              <li>Funnel strategy and conversion optimization</li>
              <li>Performance tracking and attribution</li>
            </ul>
          </article>
          <article>
            <h4>Conversion assets</h4>
            <p>
              What the funnel points at — the pages the acquisition system
              needs in order to convert.
            </p>
            <ul>
              <li>CMS website</li>
              <li>Landing pages</li>
              <li>Campaign pages</li>
            </ul>
          </article>
          <article>
            <h4>Revenue operations</h4>
            <p>
              CRM set up for lead management across the commercial team,
              with the follow-through automated.
            </p>
            <ul>
              <li>CRM for lead capture and pipeline</li>
              <li>Lead routing and follow-up automation</li>
              <li>The handoff from marketing to sales</li>
              <li>Data connected across the tools already in use</li>
            </ul>
          </article>
          <article>
            <h4>AI Enablement</h4>
            <p>
              AI inside the daily work of the commercial teams — not a
              training deck.
            </p>
            <ul>
              <li>Department-specific use cases</li>
              <li>Employee AI training</li>
              <li>AI-assisted workflows inside existing processes</li>
            </ul>
          </article>
          <p>Outcome</p>
          <p>
            More qualified opportunities, clearer visibility, and a team
            operating with AI inside real workflows.
          </p>
          <p>Starting from $7,000</p>
          <p>Not a monthly retainer. A system your business owns.</p>
          <p>
            <a href="/contact?service=growth-engine">Book a strategy call</a>
          </p>
        </article>

        <article>
          <h3>Scale Infrastructure</h3>
          <p>Your business has outgrown the systems running it.</p>
          <p>Build the operating infrastructure for scale.</p>
          <p>Build the systems required for operational scale.</p>
          <p>Best for</p>
          <p>
            Companies where growth has outgrown the operation — complexity
            is rising and the current systems can&apos;t carry it.
          </p>
          <p>The problem</p>
          <p>
            Growth creates complexity. Disconnected tools, manual
            operations, and limited visibility start slowing the business
            down — and adding people stops helping.
          </p>
          <p>Always included</p>
          <p>
            The visibility layer: measurement, reporting, and business
            data connection — so the decisions after the build are made on
            evidence, not instinct.
          </p>
          <p>What&apos;s included</p>
          <p>Then expands, based on the business diagnosis, into:</p>
          <article>
            <h4>Core business systems</h4>
            <p>
              The systems of record the business runs on, integrated
              rather than stacked side by side.
            </p>
            <ul>
              <li>CRM as the system of record across departments</li>
              <li>ERP platforms</li>
              <li>Business development performance management</li>
              <li>Integration between the core systems</li>
            </ul>
          </article>
          <article>
            <h4>Custom applications</h4>
            <p>
              Software built for how this business works, where nothing
              off the shelf fits.
            </p>
            <ul>
              <li>Internal business applications</li>
              <li>Custom software solutions</li>
              <li>B2B mobile applications</li>
              <li>Customer portals and internal tools</li>
            </ul>
          </article>
          <article>
            <h4>Advanced automation and AI</h4>
            <p>
              Automation across departments, and AI embedded in the
              systems rather than bolted beside them.
            </p>
            <ul>
              <li>Cross-department workflow automation</li>
              <li>AI embedded in the business systems</li>
              <li>Intelligent reporting and decision support</li>
              <li>Org-wide AI adoption and employee training</li>
            </ul>
          </article>
          <article>
            <h4>Operational enablement</h4>
            <p>The change work that makes new systems stick after handover.</p>
            <ul>
              <li>Process redesign</li>
              <li>Adoption support</li>
              <li>Continuous optimization after handover</li>
            </ul>
          </article>
          <p>Outcome</p>
          <p>
            A scalable business infrastructure built around how your
            company actually operates.
          </p>
          <p>Starting from $30,000</p>
          <p>Not a monthly retainer. A system your business owns.</p>
          <p>
            <a href="/contact?service=scale-infrastructure">
              Book a strategy call
            </a>
          </p>
        </article>
      </section>

      <section>
        <p>The escape hatch</p>
        <h2>Not every business fits a pattern.</h2>
        <p>
          Strong sales with broken operations. AI adoption across every
          department at once. A combination no standard scope covers. When
          the business diagnosis points somewhere none of the three fit,
          the answer isn&apos;t a package — it&apos;s a system designed
          around your reality.
        </p>
        <h3>Custom Transformation</h3>
        <p>Priced after the business diagnosis.</p>
        <p>
          <a href="/contact?service=custom">Book a strategy call</a>
        </p>
      </section>

      <section>
        <h2>How we work</h2>
        <p>Strategy</p>
        <p>
          We diagnose the business, identify the constraints, and define
          the roadmap. Strategy isn&apos;t something we sell — it&apos;s
          how everything else gets decided.
        </p>
        <p>Three capabilities deliver the transformation</p>
        <article>
          <h3>Marketing Systems</h3>
          <p>
            Build measurable acquisition systems — search, paid,
            conversion, and tracking wired together instead of run
            separately.
          </p>
        </article>
        <article>
          <h3>Business Technology</h3>
          <p>
            Build and connect the systems the business runs on — ERP,
            CRM, web and mobile platforms, and the automation between
            them.
          </p>
        </article>
        <article>
          <h3>AI Enablement</h3>
          <p>
            Embed AI into real workflows so teams actually use it, inside
            the work they already do.
          </p>
        </article>
      </section>

      <section>
        <h2>Common questions</h2>
        <article>
          <h3>How do we know which solution we need?</h3>
          <p>
            Most companies don&apos;t, and that&apos;s fine. The business
            diagnosis exists to answer that question before anyone commits
            to a build.
          </p>
        </article>
        <article>
          <h3>Do we have to start with Foundation?</h3>
          <p>
            No. Foundation is for companies that can&apos;t yet name the
            constraint. If it&apos;s already clear, we start where the
            problem is. Every solution includes a business diagnosis phase
            either way.
          </p>
        </article>
        <article>
          <h3>Why is pricing &quot;starting from&quot;?</h3>
          <p>
            Because scope depends on what the business diagnosis finds.
            The figure shown is the floor. The final number comes with the
            proposal.
          </p>
        </article>
        <article>
          <h3>Is this a monthly retainer?</h3>
          <p>
            No. These are systems you own — source code, platforms, and
            data. Ongoing support is a separate agreement if you want one.
          </p>
        </article>
        <article>
          <h3>Do we own what you build?</h3>
          <p>
            Yes. Full source code and IP transfer on completion. No
            lock-in, no fee to access your own system.
          </p>
        </article>
        <article>
          <h3>What happens to the Foundation fee if we implement?</h3>
          <p>
            It&apos;s credited toward the project, provided implementation
            starts within 90 days and is based on that diagnosis. It
            isn&apos;t a refund — you bought a roadmap, and you keep it
            whether you build with us or not.
          </p>
        </article>
        <article>
          <h3>Is AI training sold separately?</h3>
          <p>
            No. AI enablement is built into every solution, because
            training that isn&apos;t attached to a real workflow
            doesn&apos;t survive the month after it ends.
          </p>
        </article>
      </section>

      <section>
        <h2>Not sure what&apos;s blocking you?</h2>
        <p>
          Book a strategy call. We&apos;ll tell you honestly where the
          constraint is — and if we&apos;re not the right partner,
          we&apos;ll say that too.
        </p>
        <p>
          <a href="/contact">Book a strategy call</a>
        </p>
      </section>
    </main>
  );
}
