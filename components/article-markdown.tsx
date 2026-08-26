import type { ReactNode } from "react";
import Link from "next/link";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import { FallbackImage } from "@/components/fallback-image";

const YOUTUBE =
  /^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;

function urlTransform(url: string): string {
  if (/^data:image\//i.test(url)) {
    return url;
  }
  return defaultUrlTransform(url);
}

const LINK_CLASSNAME =
  "text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary";

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
              title="YouTube video"
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
};

export function ArticleMarkdown({ body }: { body: string }) {
  return (
    <div
      className="prose prose-invert max-w-none
        prose-headings:font-display prose-headings:tracking-tight prose-headings:text-white
        prose-p:leading-relaxed prose-p:text-slate-300
        prose-li:text-slate-300 prose-strong:text-white
        prose-blockquote:border-s-2 prose-blockquote:border-primary prose-blockquote:not-italic prose-blockquote:text-slate-300
        prose-hr:border-slate-800
        prose-code:text-brand-400 prose-code:before:content-none prose-code:after:content-none
        prose-pre:border prose-pre:border-slate-800 prose-pre:bg-slate-900/60"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} urlTransform={urlTransform}>
        {body}
      </ReactMarkdown>
    </div>
  );
}
