import type { ReactNode } from "react";
import Link from "next/link";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import { FallbackImage } from "@/components/fallback-image";
import { extractArticleHeadings } from "@/lib/article-headings";
import type { Language } from "@/lib/language";

const YOUTUBE =
  /^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;

const YOUTUBE_TITLE: Record<Language, string> = {
  en: "YouTube video",
  ar: "فيديو يوتيوب",
};

function urlTransform(url: string): string {
  if (/^data:image\//i.test(url)) {
    return url;
  }
  return defaultUrlTransform(url);
}

const LINK_CLASSNAME =
  "text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary";

type MarkdownNode = { position?: { start?: { line?: number } } };

export function ArticleMarkdown({ body, language }: { body: string; language: Language }) {
  const headingByLine = new Map(
    extractArticleHeadings(body).map((heading) => [heading.line, heading]),
  );
  function headingIdForNode(node?: MarkdownNode): string | undefined {
    const line = node?.position?.start?.line;
    return line !== undefined ? headingByLine.get(line)?.id : undefined;
  }

  const components = {
    a: ({ href, children }: { href?: string; children?: ReactNode }) => {
      const url = href || "";
      if (url.startsWith("/")) {
        return (
          <Link href={url}>
            <span className={`cursor-pointer ${LINK_CLASSNAME}`}>{children}</span>
          </Link>
        );
      }
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className={LINK_CLASSNAME}>
          {children}
        </a>
      );
    },
    img: ({ src, alt }: { src?: string | Blob; alt?: string }) => (
      <FallbackImage
        src={typeof src === "string" ? src : ""}
        alt={alt || ""}
        loading="lazy"
        decoding="async"
        className="w-full rounded-xl border border-slate-800"
      />
    ),
    p: ({ children }: { children?: ReactNode }) => {
      const only = Array.isArray(children) ? children.filter((c) => c !== "\n") : [children];
      if (only.length === 1) {
        const node = only[0] as { props?: { href?: string } };
        const href = node?.props?.href;
        const id = typeof href === "string" ? YOUTUBE.exec(href)?.[1] : undefined;
        if (id) {
          return (
            <span className="not-prose my-6 block aspect-video w-full overflow-hidden rounded-xl border border-slate-800">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${id}`}
                title={YOUTUBE_TITLE[language]}
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </span>
          );
        }
      }
      return <p>{children}</p>;
    },
    h2: ({ children, node }: { children?: ReactNode; node?: MarkdownNode }) => (
      <h2
        id={headingIdForNode(node)}
        className="mb-4 mt-12 scroll-mt-28 font-display text-[26px] font-bold leading-tight tracking-tight text-white first:mt-0 sm:text-[30px] rtl:tracking-normal rtl:leading-snug"
      >
        {children}
      </h2>
    ),
    h3: ({ children, node }: { children?: ReactNode; node?: MarkdownNode }) => (
      <h3
        id={headingIdForNode(node)}
        className="mb-3 mt-9 scroll-mt-28 font-display text-xl font-bold text-white sm:text-2xl rtl:tracking-normal"
      >
        {children}
      </h3>
    ),
    h4: ({ children }: { children?: ReactNode }) => (
      <h4 className="mb-2 mt-7 font-display text-lg font-semibold text-white">{children}</h4>
    ),
    blockquote: ({ children }: { children?: ReactNode }) => (
      <blockquote className="not-prose not-italic my-8 rounded-lg border-s-2 border-primary bg-slate-900/50 px-5 py-4 leading-relaxed text-slate-200">
        {children}
      </blockquote>
    ),
    table: ({ children }: { children?: ReactNode }) => (
      <div className="not-prose my-6 overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full min-w-[480px] border-collapse text-[14px] leading-normal">
          {children}
        </table>
      </div>
    ),
    th: ({ children }: { children?: ReactNode }) => (
      <th className="border-b border-slate-800 bg-slate-900/60 px-4 py-2.5 text-start font-display font-semibold text-white">
        {children}
      </th>
    ),
    td: ({ children }: { children?: ReactNode }) => (
      <td className="border-b border-slate-800/60 px-4 py-2.5 text-slate-300">{children}</td>
    ),
    ul: ({ children }: { children?: ReactNode }) => (
      <ul className="not-prose my-5 list-disc space-y-2 ps-6 text-slate-300 marker:text-slate-600">
        {children}
      </ul>
    ),
    ol: ({ children }: { children?: ReactNode }) => (
      <ol className="not-prose my-5 list-decimal space-y-2 ps-6 text-slate-300 marker:text-slate-600">
        {children}
      </ol>
    ),
    li: ({ children }: { children?: ReactNode }) => <li className="leading-relaxed">{children}</li>,
  };

  return (
    <div
      className="prose prose-invert max-w-none
        prose-p:text-[17px] prose-p:leading-[1.75] prose-p:text-slate-300
        prose-strong:text-white
        prose-hr:border-slate-800
        prose-code:text-brand-400 prose-code:before:content-none prose-code:after:content-none
        prose-pre:border prose-pre:border-slate-800 prose-pre:bg-slate-900/60
        rtl:prose-p:text-[18px] rtl:prose-p:leading-[1.9]"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} urlTransform={urlTransform}>
        {body}
      </ReactMarkdown>
    </div>
  );
}
