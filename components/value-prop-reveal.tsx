"use client";

import { useInView } from "@/lib/hooks/use-in-view";

/** Word-by-word scroll reveal on the highlighted clause (Home §3). One
 * IntersectionObserver gates the section; CSS transition-delay staggers the
 * highlight words and the body paragraph — not sequential state updates. */
export function ValuePropReveal({
  lead,
  highlight,
  body,
}: {
  lead: string;
  highlight: string;
  body: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const words = highlight.split(" ");

  return (
    <div ref={ref} className="max-w-4xl mx-auto px-6 md:px-8 text-center">
      <h2 className="mb-4 text-3xl font-bold leading-tight text-white md:text-5xl">
        <span
          className={`transition-opacity duration-700 ease-standard ${
            inView ? "opacity-100" : "opacity-0"
          }`}
        >
          {lead}{" "}
        </span>
        <span className="text-brand-400">
          {words.map((word, i) => (
            <span
              key={i}
              style={{ transitionDelay: `${i * 90}ms` }}
              className={`me-[0.25em] inline-block transition-all duration-500 ease-standard ${
                inView ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
            >
              {word}
            </span>
          ))}
        </span>
      </h2>
      <p
        style={{ transitionDelay: "450ms" }}
        className={`mt-8 text-lg leading-relaxed text-slate-400 transition-all duration-700 ease-standard ${
          inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        {body}
      </p>
    </div>
  );
}
