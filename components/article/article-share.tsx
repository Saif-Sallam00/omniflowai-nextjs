"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import type { Language } from "@/lib/language";

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

const LABELS: Record<
  Language,
  { linkedin: string; copy: string; copied: string }
> = {
  en: { linkedin: "Share on LinkedIn", copy: "Copy link", copied: "Link copied" },
  ar: { linkedin: "مشاركة على لينكدإن", copy: "نسخ الرابط", copied: "تم نسخ الرابط" },
};

export function ArticleShare({ url, language }: { url: string; language: Language }) {
  const [copied, setCopied] = useState(false);
  const labels = LABELS[language];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable/denied — fail silently, no destructive fallback needed.
    }
  }

  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <div className="flex items-center gap-2">
      <a
        href={linkedinHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={labels.linkedin}
        title={labels.linkedin}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 text-slate-400 transition-colors hover:border-slate-700 hover:text-white"
      >
        <LinkedinIcon />
      </a>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? labels.copied : labels.copy}
        title={copied ? labels.copied : labels.copy}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 text-slate-400 transition-colors hover:border-slate-700 hover:text-white"
      >
        {copied ? <Check className="h-4 w-4" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />}
      </button>
      {copied && (
        <span role="status" className="text-xs text-slate-400">
          {labels.copied}
        </span>
      )}
    </div>
  );
}
